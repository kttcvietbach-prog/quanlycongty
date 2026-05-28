import sys
import json
import logging

# Disable logging to keep stdout clean for JSON
logging.basicConfig(level=logging.ERROR)

try:
    from underthesea import word_tokenize, ner
except ImportError:
    # Fallback if library not ready
    def word_tokenize(text): return text.split()
    def ner(text): return []

def process_text(text):
    try:
        # Word Segmentation
        tokens = word_tokenize(text)
        
        # Named Entity Recognition
        entities = ner(text)
        
        return {
            "success": True,
            "tokens": tokens,
            "entities": [{"text": e[0], "label": e[1]} for e in entities],
            "segmented": " ".join(tokens).replace(" ", "_") # Standard NLP format
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Force UTF-8 for Windows console
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        result = process_text(input_text)
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(json.dumps({"success": False, "error": "No input text provided"}))
