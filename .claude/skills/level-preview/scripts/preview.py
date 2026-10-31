#!/usr/bin/env python3
"""Сборка кадра игры из настоящего макета и настоящих спрайтов.

Запустить игру здесь нельзя, но посмотреть, как уровень выглядит, можно:
скрипт читает layouts/Макет 1.json и images/*.png и собирает кадр 854x480 —
ровно тот, что увидит игрок.

    python3 .claude/skills/level-preview/scripts/preview.py <папка-вывода>
    python3 .claude/skills/level-preview/scripts/preview.py <папка> --x 1250
    python3 .claude/skills/level-preview/scripts/preview.py <папка> --whole

Выводить только в scratchpad сессии, не в репозиторий.

Чего скрипт не делает: не рисует текст, поэтому слой «Интерфейс» пропускается —
о содержимом HUD суди по коду, а не по картинке.
"""

from __future__ import annotations

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__),
                                "..", "..", "pixel-art", "scripts"))
from canvas import read_png, write_png  # noqa: E402

LAYOUT = "layouts/Макет 1.json"
VIEWPORT = (854, 480)
UI_LAYER = "Интерфейс"

# Должно совпадать с константами в scripts/основной.ts.
PARALLAX = {"BgFar": 0.25, "BgNear": 0.5}
CAMERA_HEIGHT_BIAS = 0.12


def clamp(value: float, low: float, high: float) -> float:
    return min(max(value, low), high)


def camera_at(layout: dict, x: float, y: float) -> tuple[float, float]:
    """Та же формула, что GetCameraTarget в основном скрипте."""
    vw, vh = VIEWPORT
    return (clamp(x, vw / 2, layout["width"] - vw / 2),
            clamp(y - vh * CAMERA_HEIGHT_BIAS, vh / 2, layout["height"] - vh / 2))


def render(layout: dict, images: dict, scroll: tuple[float, float],
           size: tuple[int, int], scale: float, out: str) -> None:
    width, height = int(size[0] * scale), int(size[1] * scale)
    background = layout["layers"][0]["backgroundColor"]
    base = tuple(int(v * 255) for v in background[:3]) + (255,)
    buf = [[base] * width for _ in range(height)]

    left = scroll[0] - size[0] / 2
    top = scroll[1] - size[1] / 2

    for layer in layout["layers"]:
        if layer["name"] == UI_LAYER:
            continue

        for inst in layer["instances"]:
            draw(buf, width, height, images, inst, left, top, scroll, scale)

    write_png(out, width, height, buf)
    print(f"{out} {width}x{height}")


def draw(buf, width, height, images, inst, left, top, scroll, scale) -> None:
    name = inst["type"].lower()
    if name not in images:
        return

    world = inst["world"]
    w, h = world["width"], world["height"]
    x = world["x"] - world["originX"] * w
    y = world["y"] - world["originY"] * h

    # Параллакс в игре считается скриптом, повторяем его здесь.
    factor = PARALLAX.get(inst["type"])
    if factor is not None:
        x += scroll[0] * (1 - factor)
        y += scroll[1] * (1 - factor)

    color = world.get("color", [1, 1, 1, 1])
    alpha = color[3] if len(color) > 3 else 1.0

    src_w, src_h, src = images[name]

    for dy in range(int(h * scale) + 1):
        for dx in range(int(w * scale) + 1):
            lx, ly = x + dx / scale, y + dy / scale
            sx = int((lx - x) / w * src_w)
            sy = int((ly - y) / h * src_h)
            if not (0 <= sx < src_w and 0 <= sy < src_h):
                continue

            c = src[sy][sx]
            if c[3] == 0:
                continue

            px, py = int((lx - left) * scale), int((ly - top) * scale)
            if not (0 <= px < width and 0 <= py < height):
                continue

            a = c[3] / 255.0 * alpha
            under = buf[py][px]
            buf[py][px] = tuple(
                int(c[i] * a + under[i] * (1 - a)) for i in range(3)) + (255,)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("outdir", help="куда класть кадры (scratchpad)")
    parser.add_argument("--x", type=float, default=None,
                        help="на какой точке уровня центрировать камеру")
    parser.add_argument("--whole", action="store_true",
                        help="весь уровень целиком в половинном масштабе")
    args = parser.parse_args()

    if not os.path.exists(LAYOUT):
        print("Запускать из корня проекта", file=sys.stderr)
        return 1

    layout = json.load(open(LAYOUT, encoding="utf-8"))
    images = {}
    for path in os.listdir("images"):
        if path.endswith("-000.png"):
            name = path[:-len("-default-000.png")]
            images[name] = read_png(os.path.join("images", path))

    os.makedirs(args.outdir, exist_ok=True)

    if args.whole:
        render(layout, images,
               (layout["width"] / 2, layout["height"] / 2),
               (layout["width"], layout["height"]), 0.5,
               os.path.join(args.outdir, "level-whole.png"))
        return 0

    instances = [i for l in layout["layers"] for i in l["instances"]]
    olly = next((i for i in instances if i["type"] == "Olly"), None)
    default_y = olly["world"]["y"] if olly else layout["height"]
    spots = ([args.x] if args.x is not None
             else [olly["world"]["x"] if olly else 0])

    for n, x in enumerate(spots):
        render(layout, images, camera_at(layout, x, default_y),
               VIEWPORT, 1.0,
               os.path.join(args.outdir, f"frame-{n}.png"))

    return 0


if __name__ == "__main__":
    sys.exit(main())
