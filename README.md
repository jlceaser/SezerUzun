# Ceaser's World

Sezer Uzun'un kişisel sitesi. Bağımlılık yok, derleme adımı yok. Statik HTML,
CSS ve tek bir vanilla JS dosyası.

**Canlı:** https://jlceaser.github.io/SezerUzun/

## Yapı

```
index.html              tek sayfa; tüm bölümler burada
assets/
  css/site.css          tokenler, modüler tip ölçeği, ortak bileşenler
  css/oyunlar.css       Oyunlar: CEDRA kapakları, gün batımı duotone
  css/dil.css           Dil: İngilizce → Türkçe hizalama sahnesi
  css/yigin.css         Yığın: tuş takımı
  js/site.js            atalet kaydırma, imleç, menü, manifesto, sayaçlar, harita
  js/oyunlar.js         dokunmatikte kartı yerinde açar
  js/dil.js             hizalama şeritleri, döngü, vurgulama
  js/yigin.js           tuş basma, okuma satırı, otomatik demo
  img/
    hero-sunset.jpg     hero fotoğrafı (palet buradan örneklendi)
    og-cover.jpg        paylaşım kartı
    favicon.svg
    work/*.webp         CEDRA oyun kapakları
    logo-*.{png,webp}   sistemler listesindeki marka işaretleri
    cert/*.webp         sertifika görselleri (satır üstüne gelince açılır)
tools/
  probe.py              Playwright ile görsel + konsol denetimi
  build-artifact.py     Claude artifact için gövde parçası üretir
```

## Yerelde çalıştırma

`file://` üzerinden de açılır, ama gerçek yollar için sunucu tercih edin:

```bash
python -m http.server 8899
# http://127.0.0.1:8899/
```

## Denetim

```bash
python tools/probe.py
```

Konsol hatalarını, yatay taşmayı ve kritik bileşenlerin render'ını kontrol eder;
`a-*.png` ekran görüntülerini bırakır (bunlar sürüm kontrolüne girmez).

## Notlar

- Tek koyu tema. Gece/gündüz anahtarı bilinçli olarak yok — site fotoğrafın
  kendi dünyasına bağlı.
- Tipografi tek taban/tek orandan türeyen modüler bir ölçek; serbest
  `font-size` kullanılmaz, yalnızca `--t0` … `--t7` belirteçleri.
- Atalet kaydırma yalnızca masaüstü + ince işaretleyicide açılır ve bir
  gözcüyle korunur; dokunmatik cihazlar tarayıcının kendi kaydırmasını kullanır.
- Marka adları `lang="en"` taşır, yoksa Türkçe büyük harf kuralı `GITHUB`'ı
  `GİTHUB` yapar.

## Lisans

AGPL-3.0 + Commons Clause.
