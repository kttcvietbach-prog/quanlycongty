import re
import os

file_path = r'c:\Users\PC\Desktop\VIETBAC V5.19\pm_modals.js'

if os.path.exists(file_path):
    print("Reading pm_modals.js...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Replacing tempContractFiles with window.tempContractFiles...")
    # First replace the declaration so it doesn't cause syntax issues or confusion
    content = content.replace('let tempContractFiles = [];', '// Using window.tempContractFiles as global state')
    
    # Replace all other occurrences
    updated_content = re.sub(r'(?<!window\.)tempContractFiles', 'window.tempContractFiles', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("pm_modals.js successfully updated and synchronized!")
else:
    print("Error: pm_modals.js not found at path.")
