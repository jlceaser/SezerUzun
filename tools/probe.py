from playwright.sync_api import sync_playwright
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
url = (ROOT / "index.html").as_uri()
errs = []

# Under inertia scroll the content lives in a fixed wrapper, so scrollIntoView
# cannot reach it. The wrapper's Y is the SECOND value in translate3d(...).
SCROLL_TO = """(sel) => {
  const el = document.querySelector(sel);
  const sc = document.getElementById('scroller');
  const parts = sc && sc.style.transform ? sc.style.transform.split(',') : null;
  const cur = (parts && parts.length > 1) ? -parseFloat(parts[1]) : window.scrollY;
  window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + cur - 160));
}"""


def scroll_to(pg, sel):
    pg.evaluate(SCROLL_TO, sel)
    pg.wait_for_timeout(1800)


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900}, color_scheme="dark")
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto(url)
    pg.wait_for_timeout(1200)

    print("kurulum:", pg.evaluate("""() => ({
      smooth: document.documentElement.classList.contains('smooth'),
      scrollbar: window.innerWidth - document.documentElement.clientWidth,
      izgaraDugmesi: !!document.getElementById('sq'),
      izgaraKatmani: !!document.getElementById('glines'),
      logolar: document.querySelectorAll('.wk-logo').length,
      yuvarlak: document.querySelectorAll('.wk-logo.round').length
    })"""))

    pg.wait_for_timeout(2400)
    pg.screenshot(path=str(ROOT / "a-hero.png"))

    scroll_to(pg, ".wk-t")
    pg.screenshot(path=str(ROOT / "a-works.png"))

    box = pg.evaluate("""() => { const r = document.querySelector('.wk-t').getBoundingClientRect();
        return {x: r.x + r.width / 2, y: r.y + r.height / 2, ok: r.top > 0 && r.top < 900}; }""")
    print("ilk is satiri gorunuyor:", box["ok"])
    pg.mouse.move(box["x"], box["y"])
    pg.wait_for_timeout(140)
    mid = pg.inner_text(".wk-t")
    pg.wait_for_timeout(1500)
    print("scramble :", repr(mid), "->", repr(pg.inner_text(".wk-t")))
    print("onizleme :", pg.evaluate("getComputedStyle(document.querySelector('.prev i')).opacity"))
    pg.screenshot(path=str(ROOT / "a-hover.png"))
    pg.close()

    pg = b.new_page(viewport={"width": 390, "height": 844}, color_scheme="dark", device_scale_factor=2)
    pg.on("pageerror", lambda e: errs.append("mobil: " + str(e)))
    pg.goto(url)
    pg.wait_for_timeout(3000)
    pg.evaluate(SCROLL_TO, ".wk-t")
    pg.wait_for_timeout(1500)
    pg.screenshot(path=str(ROOT / "a-mob.png"))
    pg.close()
    b.close()

print("HATALAR:", errs if errs else "yok")
