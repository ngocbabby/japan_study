"""Produce eight gothic casefile paintings and a sharper full-jacket preview.
All source artwork was originally generated for Japan Study and is stored in the repository.
Deterministic, offline and safe to re-run. No text from story chapters is baked into art.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import math
import random

ROOT = Path("books/n2/vocab")
OUT = ROOT
C = Image.open(ROOT / "zero-cover-cinematic-hq.webp").convert("RGB")
R = Image.open(ROOT / "zero-courthouse-rain.webp").convert("RGB")
J = Image.open(ROOT / "zero-courtroom-interior.webp").convert("RGB")
W, H = 1200, 350
ROMAN = ("I", "II", "III", "IV", "V", "VI", "VII", "VIII")
SOURCE = (R, J, R, R, J, J, R, J)
COLORS = ((93,27,52),(45,31,67),(73,24,56),(38,28,65),
          (94,24,43),(41,43,67),(109,28,46),(129,74,49))
try:
    FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 18)
except OSError:
    FONT = ImageFont.load_default()

def cover_crop(bounds, size):
    return ImageEnhance.Sharpness(C.crop(bounds).resize(size, Image.Resampling.LANCZOS)).enhance(1.45)

def feather_paste(dst, src, xy, fade=34):
    mask = Image.new("L", src.size, 255)
    pix = mask.load()
    w, h = src.size
    for j in range(h):
        for i in range(w):
            pix[i, j] = max(0, min(255, round(
                255 * min(1, i/fade, (w-1-i)/fade, j/fade, (h-1-j)/fade)
            )))
    dst.paste(src, xy, mask)

for num in range(8):
    rng = random.Random(800 + num)
    base = SOURCE[num].resize((W, H), Image.Resampling.LANCZOS)
    base = ImageEnhance.Color(base).enhance(1.13 if num in (0,4,7) else .85)
    base = ImageEnhance.Contrast(base).enhance(1.11)
    canvas = Image.blend(base, Image.new("RGB",(W,H), COLORS[num]), .17)
    cw, ch = C.size
    if num in (2, 5, 7):
        # The heroine, as painted in the original illustrated book jacket.
        feather_paste(canvas, cover_crop((int(.17*cw),int(.19*ch),int(.83*cw),int(.81*ch)), (340,376)), (735,-11),58)
    if num in (3, 6):
        feather_paste(canvas, cover_crop((int(.44*cw),int(.04*ch),int(.98*cw),int(.40*ch)), (330,320)), (787,9),55)
    if num in (1,4):
        feather_paste(canvas, cover_crop((0,int(.045*ch),int(.45*cw),int(.59*ch)), (243,366)), (905,-12),42)
    d = ImageDraw.Draw(canvas, "RGBA")
    for x in range(W):
        alpha = min(230, int(160*(1-x/W)**2.2)+int(45*(x/W)**4))
        d.line((x,0,x,H), fill=(7,8,18,alpha))
    # Hides baked-in labels in the reference mockup; real chapter titles are HTML.
    for x in range(550):
        alpha = 244 if x<290 else int(244*max(0,1-(x-290)/260)**1.7)
        d.line((x,0,x,H),fill=(12,9,24,alpha))
    gold=(239,196,133,220)
    for inset in (7,13):
        d.rounded_rectangle((inset,inset,W-inset-1,H-inset-1),radius=7,
                            outline=gold if inset==7 else (220,162,107,105),
                            width=2 if inset==7 else 1)
    d.arc((45,-105,625,480),205,329,fill=(255,222,163,90),width=2)
    d.arc((530,-250,1265,540),60,163,fill=(255,218,150,95),width=2)
    for x,y in ((27,28),(W-27,28),(27,H-28),(W-27,H-28)):
        d.line((x-11,y,x+11,y),fill=gold,width=3)
        d.line((x,y-11,x,y+11),fill=gold,width=3)
    for k in range(3):
        yy=rng.randint(245,345)
        pts=[(x, yy-15*math.sin(x/150+num*.61+k*1.4))
             for x in range(-30,W+40,15)]
        d.line(pts,fill=(180,40,70,72 if k else 135),width=2 if k else 3)
    d.ellipse((1090,247,1174,331),fill=(71,21,42,222),outline=gold,width=3)
    d.ellipse((1098,255,1166,323),outline=(255,217,151,155),width=1)
    bbox=d.textbbox((0,0),ROMAN[num],font=FONT)
    d.text((1132-(bbox[2]-bbox[0])/2,283),ROMAN[num],
           font=FONT,fill=(255,228,180,250))
    for _ in range(22):
        x=rng.randrange(36,1170);y=rng.randrange(29,320)
        d.ellipse((x,y,x+2,y+2),fill=(255,210,154,rng.randrange(45,130)))
    canvas=canvas.filter(ImageFilter.UnsharpMask(radius=1.3,percent=110,threshold=3))
    canvas.save(OUT / f"zero-gallery-{num+1}.webp",
                "WEBP",quality=83,method=6)

# Better high-DPI jacket for the shelf, while keeping original artist composition.
cover=C.resize((540,864), Image.Resampling.LANCZOS)
cover=ImageEnhance.Contrast(cover).enhance(1.06)
cover=cover.filter(ImageFilter.UnsharpMask(radius=1.4,percent=140,threshold=2))
cover.save(OUT / "zero-cover-crisp.webp","WEBP",quality=88,method=6)
print("Generated eight original-art collages and the high-DPI book cover")
