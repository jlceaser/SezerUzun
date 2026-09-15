"""Claude artifact icin gövde parçası üretir.

Artifact yayınlayıcısı sayfayı kendi <!doctype>/<head>/<body> iskeletine
sarar, bu yüzden tam belge gönderilemez. Bu betik index.html'in gövdesini
alır, <title> ve font bağlantılarını başa taşır ve dist/artifact.html'e
yazar. Varlıklar ayrı dosya olarak yayınlanır, kopyalanmaz.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
doc = (ROOT / "index.html").read_text(encoding="utf-8")

body = doc[doc.index("<body>") + len("<body>"):doc.rindex("</body>")].strip()

title = re.search(r"<title>.*?</title>", doc, re.S).group(0)
fonts = re.findall(r'<link rel="(?:preconnect|stylesheet)" href="https://fonts\.[^"]+"[^>]*>', doc)
css = '<link rel="stylesheet" href="assets/css/site.css">'

out = ROOT / "dist"
out.mkdir(exist_ok=True)
(out / "artifact.html").write_text(
    "\n".join([title, *fonts, css, "", body]) + "\n", encoding="utf-8")

print("dist/artifact.html", round((out / "artifact.html").stat().st_size / 1024, 1), "KB")
print("yayinlarken assets/ altindaki dosyalari `files` ile birlikte gonderin.")
