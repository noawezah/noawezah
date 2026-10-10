from pathlib import Path
import urllib.request
import re

root = Path(__file__).resolve().parents[1]
fonts = [('Anton', 'anton'), ('Space+Grotesk:wght@400;500', 'space-grotesk'), ('Space+Mono', 'space-mono')]
for family, filename in fonts:
    request = urllib.request.Request('https://fonts.googleapis.com/css2?family=' + family + '&display=swap', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'})
    css = urllib.request.urlopen(request).read().decode()
    blocks = re.findall(r'/\* latin \*/\s*(@font-face\s*\{[^}]+\})', css)
    if not blocks:
        blocks = re.findall(r'@font-face\s*\{[^}]+\}', css)
    url = re.search(r'url\(([^)]+)\)', blocks[-1]).group(1)
    target = root / 'public' / 'fonts' / (filename + '.woff2')
    target.write_bytes(urllib.request.urlopen(url).read())
    print(filename, target.stat().st_size)
    licence = urllib.request.urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/' + filename.replace('-', '') + '/OFL.txt').read()
    (root / 'public' / 'fonts' / (filename + '-OFL.txt')).write_bytes(licence)

request = urllib.request.Request('https://urbanist2.vercel.app/')
response = urllib.request.urlopen(request)
print('Urbanist frame headers:', response.headers.get('X-Frame-Options', 'none'), response.headers.get('Content-Security-Policy', 'none'))
