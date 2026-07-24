from flask import Flask, render_template
import json
import os

app = Flask(__name__)

def load_real_status():
    default_data = {
        "domains": [{"url": "https://ideeata.ai", "status": "UNKNOWN", "last_check": "Așteptare watchdog..."}],
        "alerts": []
    }
    if os.path.exists("status.json"):
        try:
            with open("status.json", "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Eroare citire status.json: {e}")
    return default_data

@app.route('/')
def index():
    status_data = load_real_status()
    return render_template('index.html', domains=status_data["domains"], alerts=status_data["alerts"])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
