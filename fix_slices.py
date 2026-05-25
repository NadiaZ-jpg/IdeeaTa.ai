import sys

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('.slice(0, 4)', '.slice(0, 8)')

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced all slices")
