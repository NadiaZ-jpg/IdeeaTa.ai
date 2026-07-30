import re

files = [
    r"d:\APLICATII\IdeeaTa-latest_17072026\IdeeaTa-latest\components\DemoDesktop.tsx",
    r"d:\APLICATII\IdeeaTa-latest_17072026\IdeeaTa-latest\components\StudioDesktop.tsx"
]

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replacing tab labels array in Desktop files
    # { id: 0, label: '?? Preview cu tabs' },
    content = content.replace("label: '?? Preview cu tabs'", "label: `?? ${ui.previewTabs}`")
    content = content.replace("label: '?? Grafice animate'", "label: `?? ${ui.animatedCharts}`")
    content = content.replace("label: '??? Typing live'", "label: `??? ${ui.typingLive}`")
    content = content.replace("label: '? Inainte & Dupa'", "label: `? ${ui.beforeAfter}`")
    
    # Replacing the titles
    content = content.replace("Cum arata un plan generat?", "{ui.howItLooks}")
    content = re.sub(r"Cum arata un plan generat\?", "{ui.howItLooks}", content)
    
    content = content.replace(">Perspectiva<", ">{ui.perspective}<")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
print("Updated Desktop files")
