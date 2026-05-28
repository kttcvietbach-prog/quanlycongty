
import os

path = r'c:\Users\VIETBACH\Desktop\VIETBAC V5.13\app.js'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Lines are 1-indexed in the prompt view, so line 23213 is index 23212
# We want to remove from 23213 to 37645 (inclusive)
# indices: 23212 to 37644
start_idx = 23212
end_idx = 37644

# Keep lines before and after
new_lines = lines[:start_idx] + lines[end_idx+1:]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Removed {end_idx - start_idx + 1} lines from app.js")
