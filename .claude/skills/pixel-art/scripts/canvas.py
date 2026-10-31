#!/usr/bin/env python3
"""Рисование спрайтов без внешних зависимостей.

PIL в окружении нет и ставить его не надо: PNG пишется и читается здесь, на
zlib из стандартной библиотеки. Используется для всей графики проекта.

    import sys; sys.path.insert(0, ".claude/skills/pixel-art/scripts")
    from canvas import Canvas, PALETTE

    c = Canvas(44, 60)
    c.ellipse(22, 22, 12, 11, PALETTE["brass"], PALETTE["outline"])
    c.save("images/olly-default-000.png")
"""

from __future__ import annotations

import math
import struct
import zlib

RGBA = tuple[int, int, int, int]

# Палитра проекта. Холодный индустриальный фон, тёплая латунь как единственный
# акцент. Менять здесь, а не по месту: иначе кадры разойдутся по тону.
PALETTE: dict[str, RGBA] = {
    "outline":    (14, 15, 20, 255),
    "iron_dark":  (26, 28, 36, 255),
    "iron":       (40, 43, 54, 255),
    "iron_mid":   (58, 62, 78, 255),
    "iron_high":  (88, 95, 114, 255),
    "edge_light": (134, 145, 170, 255),
    "brass_dark": (104, 74, 40, 255),
    "brass_shade":(138, 100, 52, 255),
    "brass":      (189, 145, 80, 255),
    "brass_high": (226, 188, 122, 255),
    "amber":      (240, 182, 86, 255),
    "amber_high": (255, 220, 150, 255),
    "copper":     (154, 92, 54, 255),
    "copper_high":(196, 126, 76, 255),
    "steel":      (168, 166, 150, 255),
    "steel_high": (214, 212, 196, 255),
    "steel_shade":(104, 102, 92, 255),
    "eye":        (44, 32, 28, 255),
    "glint":      (242, 236, 220, 255),
}


class Canvas:
    """Пиксельный холст RGBA. Рисование идёт от дальнего к ближнему."""

    def __init__(self, width: int, height: int) -> None:
        self.width = width
        self.height = height
        self.px: list[list[RGBA]] = [[(0, 0, 0, 0)] * width for _ in range(height)]

    def put(self, x: float, y: float, color: RGBA) -> None:
        x, y = int(x), int(y)
        if not (0 <= x < self.width and 0 <= y < self.height):
            return

        under = self.px[y][x]
        if color[3] == 255 or under[3] == 0:
            self.px[y][x] = color
            return

        a = color[3] / 255.0
        self.px[y][x] = tuple(
            int(color[i] * a + under[i] * (1 - a)) for i in range(3)
        ) + (max(under[3], color[3]),)

    def rect(self, x0: float, y0: float, x1: float, y1: float,
             color: RGBA, outline: RGBA | None = None) -> None:
        x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                edge = outline and (x in (x0, x1) or y in (y0, y1))
                self.put(x, y, outline if edge else color)

    def ellipse(self, cx: float, cy: float, rx: float, ry: float,
                color: RGBA, outline: RGBA | None = None) -> None:
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                if d <= 1.0:
                    self.put(x, y, color)
                elif outline and d <= 1.0 + 2.2 / max(rx, ry):
                    self.put(x, y, outline)

    def ring(self, cx: float, cy: float, outer: float, inner: float,
             color: RGBA) -> None:
        for y in range(int(cy - outer) - 1, int(cy + outer) + 2):
            for x in range(int(cx - outer) - 1, int(cx + outer) + 2):
                if inner <= math.hypot(x - cx, y - cy) <= outer:
                    self.put(x, y, color)

    def thick_line(self, x0: float, y0: float, x1: float, y1: float,
                   thickness: float, color: RGBA) -> None:
        steps = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
        for i in range(steps + 1):
            t = i / steps
            self.ellipse(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t,
                         thickness / 2, thickness / 2, color)

    def fill(self, color: RGBA) -> None:
        self.px = [[color] * self.width for _ in range(self.height)]

    def flipped_x(self) -> "Canvas":
        """Зеркало по горизонтали — для кадра «смотрит влево»."""
        out = Canvas(self.width, self.height)
        out.px = [row[::-1] for row in self.px]
        return out

    def save(self, path: str) -> None:
        write_png(path, self.width, self.height, self.px)
        print(f"{path} {self.width}x{self.height}")


def write_png(path: str, width: int, height: int,
              rows: list[list[RGBA]]) -> None:
    raw = b"".join(b"\x00" + b"".join(bytes(p) for p in row) for row in rows)

    def chunk(tag: bytes, data: bytes) -> bytes:
        body = tag + data
        return (struct.pack(">I", len(data)) + body
                + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF))

    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n"
                + chunk(b"IHDR", header)
                + chunk(b"IDAT", zlib.compress(raw, 9))
                + chunk(b"IEND", b""))


def read_png(path: str) -> tuple[int, int, list[list[RGBA]]]:
    """Читает только то, что пишет write_png: 8 бит, RGBA, без интерлейса."""
    data = open(path, "rb").read()
    offset, width, height, idat = 8, 0, 0, b""

    while offset < len(data):
        length = struct.unpack(">I", data[offset:offset + 4])[0]
        tag = data[offset + 4:offset + 8]
        body = data[offset + 8:offset + 8 + length]
        if tag == b"IHDR":
            width, height = struct.unpack(">II", body[:8])
        elif tag == b"IDAT":
            idat += body
        offset += 12 + length

    raw = zlib.decompress(idat)
    stride = width * 4
    prev = bytearray(stride)
    rows: list[list[RGBA]] = []
    pos = 0

    for _ in range(height):
        filt = raw[pos]
        line = bytearray(raw[pos + 1:pos + 1 + stride])
        pos += 1 + stride

        for i in range(stride):
            a = line[i - 4] if i >= 4 else 0
            b = prev[i]
            c = prev[i - 4] if i >= 4 else 0
            if filt == 1:
                line[i] = (line[i] + a) & 255
            elif filt == 2:
                line[i] = (line[i] + b) & 255
            elif filt == 3:
                line[i] = (line[i] + (a + b) // 2) & 255
            elif filt == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pred) & 255

        prev = line
        rows.append([tuple(line[x * 4:x * 4 + 4]) for x in range(width)])

    return width, height, rows


def zoom(src: str, dst: str, factor: int) -> None:
    """Увеличивает спрайт с шахматкой вместо прозрачности — чтобы рассмотреть.

    Класть результат в scratchpad, не в репозиторий.
    """
    width, height, px = read_png(src)
    checker = ((70, 70, 76, 255), (96, 96, 104, 255))
    out: list[list[RGBA]] = []

    for y in range(height * factor):
        row: list[RGBA] = []
        for x in range(width * factor):
            c = px[y // factor][x // factor]
            if c[3] < 255:
                bg = checker[((x // 8) + (y // 8)) % 2]
                a = c[3] / 255
                c = tuple(int(c[i] * a + bg[i] * (1 - a)) for i in range(3)) + (255,)
            row.append(c)
        out.append(row)

    write_png(dst, width * factor, height * factor, out)
    print(f"{dst} {width * factor}x{height * factor}")
