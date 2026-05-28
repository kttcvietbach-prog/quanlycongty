from pathlib import Path
text = Path('pm_modals.js').read_text(encoding='utf-8')
line = 1
state = 'code'
escape = False
str_delim = None
stack = []
for i, ch in enumerate(text):
    if ch == '\n':
        line += 1
    if state == 'str':
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == str_delim:
            state = 'code'
        continue
    if state == 'template':
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == '`':
            state = 'code'
        elif ch == '$' and i+1 < len(text) and text[i+1] == '{':
            stack.append(('${', line, i+1))
            i += 1
        continue
    if state == 'comment_line':
        if ch == '\n':
            state = 'code'
        continue
    if state == 'comment_block':
        if ch == '*' and i+1 < len(text) and text[i+1] == '/':
            state = 'code'
            i += 1
        continue
    if ch == '/' and i+1 < len(text):
        nxt = text[i+1]
        if nxt == '/':
            state = 'comment_line'
            continue
        if nxt == '*':
            state = 'comment_block'
            continue
    if ch in "'\"":
        state = 'str'
        str_delim = ch
        escape = False
        continue
    if ch == '`':
        state = 'template'
        escape = False
        continue
    if ch in '([{':
        stack.append((ch, line, i+1))
    elif ch in ')]}':
        if not stack:
            print('unmatched closing', ch, 'at line', line)
            break
        open_ch, open_line, open_idx = stack.pop()
        if open_ch == '${':
            if ch != '}':
                print('mismatch', open_ch, 'with', ch, 'at line', line)
                break
            continue
        if (open_ch, ch) not in [('(', ')'), ('[', ']'), ('{', '}')]:
            print('mismatch', open_ch, 'with', ch, 'at line', line)
            break
else:
    if stack:
        print('unmatched opening', stack[-1][0], 'opened at line', stack[-1][1])
    else:
        print('balanced')
