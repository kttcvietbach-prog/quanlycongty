from pathlib import Path
text = Path('pm_modals.js').read_text(encoding='utf-8')
stack = []
state = 'code'
escape = False
tpl_expr_depth = 0
str_delim = None
i = 0
while i < len(text):
    ch = text[i]
    i += 1
    idx = i
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
        elif ch == '$' and i < len(text) and text[i] == '{':
            stack.append(('${', idx))
            tpl_expr_depth += 1
            i += 1
            continue
        continue
    if state == 'comment_line':
        if ch == '\n':
            state = 'code'
        continue
    if state == 'comment_block':
        if ch == '*' and i < len(text) and text[i] == '/':
            i += 1
            state = 'code'
        continue
    if ch == '/' and i < len(text):
        nxt = text[i]
        if nxt == '/':
            state = 'comment_line'
            i += 1
            continue
        if nxt == '*':
            state = 'comment_block'
            i += 1
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
        stack.append((ch, idx))
        continue
    if ch in ')]}':
        if not stack:
            print('unmatched close', ch, idx)
            break
        open_ch, open_idx = stack.pop()
        if open_ch == '${':
            if ch == '}':
                tpl_expr_depth -= 1
                continue
            print('mismatch', open_ch, 'with', ch, idx)
            break
        if (open_ch, ch) not in [('(', ')'), ('[', ']'), ('{', '}')]:
            print('mismatch', open_ch, 'with', ch, idx)
            break
else:
    if stack:
        print('unmatched open', stack[-1][0], stack[-1][1])
    else:
        print('balanced')
