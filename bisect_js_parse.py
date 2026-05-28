from pathlib import Path
from subprocess import run, PIPE
text = Path('pm_modals.js').read_text(encoding='utf-8').splitlines()
lo, hi = 1, len(text)
first_error = None
while lo < hi:
    mid = (lo + hi) // 2
    Path('pm_modals_prefix.js').write_text('\n'.join(text[:mid]), encoding='utf-8')
    result = run('node --check pm_modals_prefix.js', shell=True, cwd='.', stdout=PIPE, stderr=PIPE, text=True)
    if result.returncode == 0:
        lo = mid + 1
    else:
        first_error = result.stderr.strip()
        hi = mid
print('first failing line', lo)
print('stderr:', first_error)
