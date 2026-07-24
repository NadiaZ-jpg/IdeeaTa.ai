import requests
import time
import subprocess
import re
import json
from datetime import datetime
from notifier import send_telegram_alert, wait_for_user_reply
from ai_analyzer import analyze_error_with_ai

DOMAINS_TO_MONITOR = [
    "https://ideeata.ai"
]

CHECK_INTERVAL = 60

WHITELIST_COMMANDS = [
    "systemctl restart nginx",
    "systemctl restart mysql",
    "service nginx restart"
]

def save_status_to_file(url, status, last_check, alerts=[]):
    try:
        data = {
            "domains": [
                {"url": url, "status": status, "last_check": last_check}
            ],
            "alerts": alerts
        }
        with open("status.json", "w") as f:
            json.dump(data, f)
    except Exception as e:
        print(f"Eroare scriere status.json: {e}")

def execute_command(cmd, cwd=None):
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=30)
        output = result.stdout.strip()
        err = result.stderr.strip()

        if result.returncode == 0:
            return f"✅ Succes!\nOutput:\n{output}" if output else "✅ Succes! (Fără output text)"
        else:
            return f"❌ Eroare (Cod {result.returncode}).\nEroare:\n{err}\nOutput:\n{output}"
    except Exception as e:
        return f"❌ Eroare critică sistem: {e}"

def start_agentic_loop(url, error_context):
    """
    Bucla Agentică: AI-ul gândește, execută, citește rezultatul, și se corectează până e gata.
    """
    conversation_history = None
    loop_count = 0
    max_loops = 5

    send_telegram_alert(f"🔄 **START BUCLĂ AGENTICĂ** pentru {url}\nMotiv: {error_context}")

    while loop_count < max_loops:
        loop_count += 1

        if conversation_history is None:
            ai_advice, conversation_history = analyze_error_with_ai(url, "OFFLINE/ERROR", error_context)
        else:
            ai_advice, conversation_history = analyze_error_with_ai(url, "", "", conversation_history)

        send_telegram_alert(f"🧠 [Gândire Pasul {loop_count}]\n{ai_advice}")

        if "STATUS: REZOLVAT" in ai_advice.upper():
            send_telegram_alert("✅ AI-ul a raportat că problema este complet rezolvată! Bucla Agentică se închide.")
            return

        match = re.search(r'COMMAND:\s*(.*?)(?:\s*\(din folderul:\s*(.*?)\))?$', ai_advice, re.MULTILINE | re.IGNORECASE)

        if not match:
            send_telegram_alert("⚠️ AI-ul nu a propus o comandă nouă, iar problema nu e rezolvată. Opresc bucla.")
            return

        command = match.group(1).strip()
        cwd = match.group(2).strip() if match.group(2) else None

        if command in WHITELIST_COMMANDS:
            send_telegram_alert(f"🟢 Comandă din Lista Albă. O execut automat:\n`{command}`")
            approved = True
        else:
            send_telegram_alert(f"⚠️ Comandă ÎN AFARA listei! Execut?\n`{command}`\n(Răspunde DA sau NU)")
            approved = wait_for_user_reply(timeout_seconds=300)

        if approved:
            result = execute_command(command, cwd)
            send_telegram_alert(f"📊 Rezultat execuție:\n{result}")

            conversation_history.append({
                "role": "user",
                "content": f"Am executat comanda ta. Acesta este rezultatul text primit de la serverul Linux:\n{result}\nAnalizează acest rezultat. Ce facem mai departe?"
            })
        else:
            send_telegram_alert("🚫 Comanda respinsă. Opresc Bucla Agentică.")
            return

    send_telegram_alert("🛑 Bucla Agentică a atins limita maximă (5 pași). Mă opresc aici.")

def check_website(url):
    now_str = datetime.now().strftime('%H:%M:%S')
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print(f"[{now_str}] ✅ {url} ONLINE.")
            save_status_to_file(url, "ONLINE", f"Acum 1 min (la {now_str})", alerts=[])
        else:
            print(f"[{now_str}] Eroare {response.status_code}")
            alert = {"time": now_str, "url": url, "error": f"Cod Status HTTP: {response.status_code}", "ai_advice": "Verificați logurile de Nginx."}
            save_status_to_file(url, "ERROR", f"Eroare la {now_str}", alerts=[alert])
            start_agentic_loop(url, f"Cod Status HTTP: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"[{now_str}] CRITIC offline")
        alert = {"time": now_str, "url": url, "error": "OFFLINE / TIMEOUT", "ai_advice": "Reporniți serviciul sau verificați conexiunea."}
        save_status_to_file(url, "OFFLINE", f"Căzut la {now_str}", alerts=[alert])
        start_agentic_loop(url, f"Eroare de conexiune: {e}")

def start_monitoring():
    print(f"🚀 AI Watchdog a pornit cu BUCLĂ AGENTICĂ.")
    for url in DOMAINS_TO_MONITOR:
        save_status_to_file(url, "STARTING", "Se inițializează...", alerts=[])
    while True:
        for url in DOMAINS_TO_MONITOR:
            check_website(url)
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    start_monitoring()
