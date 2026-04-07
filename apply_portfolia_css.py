import re

filename = 'css/templatemo-first-portfolio-style.css'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Variables CSS
content = re.sub(r'--primary-color:\s*#[a-fA-F0-9]+;', '--primary-color:                #FF8C42;', content)
content = re.sub(r'--secondary-color:\s*#[a-fA-F0-9]+;', '--secondary-color:              #7C3AED;', content)
content = re.sub(r'--body-font-family:\s*[^;]+;', "--body-font-family:             'Inter', sans-serif;", content)

# 2. Font sizing and tracking
content = re.sub(r'letter-spacing:\s*-3px;', 'letter-spacing: -1px;', content)
content = re.sub(r'letter-spacing:\s*-1px;', 'letter-spacing: -0.025em; /* tracking-tight */', content)

# 3. Border radius
content = re.sub(r'--border-radius-large:\s*[^;]+;', '--border-radius-large:          16px;', content)
content = re.sub(r'--border-radius-medium:\s*[^;]+;', '--border-radius-medium:         12px;', content)
content = re.sub(r'--border-radius-small:\s*[^;]+;', '--border-radius-small:          8px;', content)

# 4. Transitions
content = re.sub(r'transition:\s*all\s*0\.3s;', 'transition: all 0.2s ease-in-out;', content)

# 5. Fix card hover effect
content = re.sub(r'\.tl-card:hover\s*{[^}]+}', 
                 '.tl-card:hover {\n  transform: scale(1.02);\n  box-shadow: 0 1rem 3rem rgba(0,0,0,.1);\n}', 
                 content)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(content)
print("CSS Variables and rules updated.")
