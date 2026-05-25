import os

files = [
    r'c:\Users\nadia\IdeeaTa.ai\app\api\edit\route.ts',
    r'c:\Users\nadia\IdeeaTa.ai\app\api\generate\route.ts'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('"gemini-3.1-flash-lite"', '"gemini-2.5-flash"')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Replaced model to gemini-2.5-flash")
