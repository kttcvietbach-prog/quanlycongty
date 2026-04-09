import sys
import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace \${ with ${ safely.
new_content = content.replace('\${', '${')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done string replacement")
