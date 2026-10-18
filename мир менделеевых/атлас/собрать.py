"""Refresh the buildless atlas from the canonical archive. Run from any directory."""
from pathlib import Path
import json, shutil
site=Path(__file__).resolve().parent
archive=site.parent
dist=site/'dist'
(dist/'media').mkdir(parents=True,exist_ok=True)
data=json.loads((archive/'каталог.json').read_text(encoding='utf-8'))
(dist/'data.js').write_text('window.WORLD = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
for m in data['media']:
    src=archive/m['path']
    shutil.copy2(src,dist/'media'/src.name)
shutil.copy2(archive/'медиа/карты/2026-10-17-карта.png',dist/'media/2026-10-17-карта.png')
shutil.copy2(archive/'игры/2026-10-18-экспедиция-на-кот.md',dist/'game.md')
print(f'Atlas refreshed: {len(data["objects"])} objects, {len(data["media"])} photos, {len(data["gaps"])} ideas')
