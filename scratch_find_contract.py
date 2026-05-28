import os
import glob
import re
import json

def find_contract_in_leveldb():
    paths = [
        os.path.expandvars(r'%LocalAppData%\Google\Chrome\User Data\Default\Local Storage\leveldb\*'),
        os.path.expandvars(r'%LocalAppData%\Microsoft\Edge\User Data\Default\Local Storage\leveldb\*'),
        os.path.expandvars(r'%AppData%\Google\Chrome\User Data\Default\Local Storage\leveldb\*'),
        os.path.expandvars(r'%AppData%\Microsoft\Edge\User Data\Default\Local Storage\leveldb\*'),
        # Try specific user paths if applicable
        os.path.expandvars(r'C:\Users\PC\AppData\Local\Google\Chrome\User Data\Default\Local Storage\leveldb\*'),
        os.path.expandvars(r'C:\Users\PC\AppData\Local\Microsoft\Edge\User Data\Default\Local Storage\leveldb\*'),
    ]
    
    queries = [b'8647702', b'764/2025', b'H\xc4\x90-HS-8647702', b'764/2025/H\xc4\x90KT-SXD']
    found = False
    
    print("Searching LevelDB for contract...")
    for path_pattern in paths:
        files = glob.glob(path_pattern)
        if not files:
            continue
        for fpath in files:
            if os.path.isdir(fpath) or not fpath.endswith(('.log', '.ldb')):
                continue
            try:
                with open(fpath, 'rb') as f:
                    content = f.read()
                    for query in queries:
                        if query in content:
                            print(f"\nMatch found in file: {fpath} for query: {query}")
                            idx = content.find(query)
                            start = max(0, idx - 1000)
                            end = min(len(content), idx + 2000)
                            snippet = content[start:end]
                            
                            # Try to extract JSON strings
                            # We can search for JSON-like substrings around the match
                            text_snippet = snippet.decode('utf-8', errors='replace')
                            print("Surrounding Text:")
                            print(text_snippet[:1500])
                            
                            # Let's search for JSON bracket patterns
                            matches = re.findall(r'\{[^{}]*8647702[^{}]*\}', text_snippet)
                            for m in matches:
                                print("Extracted JSON Substring:")
                                print(m)
                            found = True
                            break
            except Exception as e:
                pass
                
    if not found:
        print("No contract details found in Local Storage LevelDB files.")

if __name__ == '__main__':
    find_contract_in_leveldb()
