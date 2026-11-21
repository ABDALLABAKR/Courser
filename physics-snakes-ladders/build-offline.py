"""Build physics-championship.html: the whole game in ONE file that works offline.

Run from this folder:  python3 build-offline.py
It inlines css/style.css, js/questions.js and js/game.js into index.html.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))


def read(rel):
    with open(os.path.join(HERE, rel), encoding='utf-8') as f:
        return f.read()


html = read('index.html')
css = read('css/style.css')
scripts = {rel: read(rel) for rel in ('js/questions.js', 'js/game.js')}

for rel, js in scripts.items():
    if re.search(r'</script', js, re.I):
        raise SystemExit(f'{rel} contains "</script" and cannot be inlined safely')

html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
for rel, js in scripts.items():
    tag = f'<script src="{rel}"></script>'
    if tag not in html:
        raise SystemExit(f'could not find {tag} in index.html')
    html = html.replace(tag, '<script>\n' + js + '\n</script>')

assert 'href="css/' not in html and 'src="js/' not in html
out = os.path.join(HERE, 'physics-championship.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)
print(f'wrote {out} ({len(html) // 1024} KB)')
