
import os

logic_path = r'c:\Users\VIETBACH\Desktop\VIETBAC V5.13\pm_logic.js'
extracted_path = r'c:\Users\VIETBACH\Desktop\VIETBAC V5.13\pm_logic_extracted.js'

with open(logic_path, 'r', encoding='utf-8') as f:
    logic_content = f.read()

with open(extracted_path, 'r', encoding='utf-8') as f:
    extracted_content = f.read()

# Replace the closing of IIFE with the extracted content + closing
# Look for the last })();
if '})();' in logic_content:
    parts = logic_content.rsplit('})();', 1)
    new_content = parts[0] + '\n\n    // --- EXTRACTED FROM APP.JS ---\n' + extracted_content + '\n\n})();'
    
    with open(logic_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Merge successful!")
else:
    print("Error: })(); not found in pm_logic.js")
