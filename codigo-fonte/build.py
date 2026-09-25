import base64, io
from PIL import Image
def b64(path, mime):
    return f"data:{mime};base64," + base64.b64encode(open(path,'rb').read()).decode()
# favicon: quadrado azul-maré com monograma claro
mono = Image.open('assets/mono-light.png').convert('RGBA')
fav = Image.new('RGBA',(96,96),(18,41,74,255))
m = mono.resize((60, round(60*mono.height/mono.width)), Image.LANCZOS)
fav.alpha_composite(m,((96-m.width)//2,(96-m.height)//2))
buf = io.BytesIO(); fav.save(buf,'PNG',optimize=True)
favicon = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

html = open('template.html',encoding='utf-8').read()
js = open('app.js',encoding='utf-8').read()
html = html.replace('__MONO_DARK__', b64('assets/mono-dark.webp','image/webp'))
html = html.replace('__LOGO_LIGHT__', b64('assets/logo-full-light.webp','image/webp'))
html = html.replace('__FAVICON__', favicon)
html = html.replace('/*__APP_JS__*/', js)
import os
os.makedirs('/mnt/user-data/outputs', exist_ok=True)
open('/mnt/user-data/outputs/index.html','w',encoding='utf-8').write(html)
print(len(html)//1024, 'KB')
