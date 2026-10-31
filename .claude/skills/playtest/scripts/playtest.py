#!/usr/bin/env python3
"""Статический прогон уровня: проходим ли он вообще.

Запустить игру здесь нельзя, но геометрию можно посчитать. Скрипт строит список
площадок, моделирует прыжок Олли по баллистике и обходом в ширину выясняет,
докуда игрок способен добраться от точки старта.

    python3 .claude/skills/playtest/scripts/playtest.py

Находит: недостижимые площадки, недостижимых жуков (уровень нельзя пройти),
жуков, патруль которых уводит их с опоры, слишком тесные зазоры под декором.

Код возврата 1, если уровень непроходим.
"""

from __future__ import annotations

import json
import math
import sys

LAYOUT = "layouts/Макет 1.json"
SCRIPT = "scripts/основной.ts"

# Горизонтальный запас: игрок редко прыгает идеально, поэтому требуем, чтобы
# прыжок перекрывал разрыв с запасом, а не впритык.
SAFETY = 0.85


def read_number(source: str, name: str, default: float) -> float:
    """Достаёт константу из основного скрипта, чтобы не дублировать числа."""
    for line in source.splitlines():
        if line.strip().startswith(f"const {name}"):
            return float(line.split("=")[1].split(";")[0].strip())
    return default


def platform_params(layout: dict) -> tuple[float, float, float]:
    """Прыжок и скорость Олли берём из свойств экземпляра в макете."""
    for layer in layout["layers"]:
        for inst in layer["instances"]:
            if inst["type"] != "Olly":
                continue
            props = inst["behaviors"]["Platform"]["properties"]
            return (props["jump-strength"], props["gravity"], props["max-speed"])
    raise SystemExit("На макете нет Олли")


def surfaces(layout: dict) -> list[tuple[float, float, float]]:
    """Верхние грани видимых Ground как отрезки (x0, x1, y)."""
    out = []
    for layer in layout["layers"]:
        for inst in layer["instances"]:
            if inst["type"] != "Ground":
                continue
            if not inst["properties"].get("initially-visible", True):
                continue  # невидимые боковые стены — не площадки
            w = inst["world"]
            x = w["x"] - w["originX"] * w["width"]
            y = w["y"] - w["originY"] * w["height"]
            out.append((x, x + w["width"], y))
    return out


def jump_reach(dh: float, jump: float, gravity: float, speed: float) -> float:
    """Горизонтальная дальность прыжка при подъёме на dh пикселей.

    dh > 0 — цель выше старта. Отрицательное — падение вниз, оно дальше.
    """
    disc = jump * jump - 2 * gravity * dh
    if disc < 0:
        return -1.0  # не допрыгнуть по высоте
    t = (jump + math.sqrt(disc)) / gravity
    return speed * t


def gap(a: tuple[float, float, float], b: tuple[float, float, float]) -> float:
    """Горизонтальный разрыв между отрезками, 0 если перекрываются."""
    if a[1] < b[0]:
        return b[0] - a[1]
    if b[1] < a[0]:
        return a[0] - b[1]
    return 0.0


def main() -> int:
    layout = json.load(open(LAYOUT, encoding="utf-8"))
    source = open(SCRIPT, encoding="utf-8").read()

    jump, gravity, speed = platform_params(layout)
    height = jump * jump / (2 * gravity)
    spawn_x = read_number(source, "OLLY_SPAWN_X", 140)
    spawn_y = read_number(source, "OLLY_SPAWN_Y", 880)

    print(f"Прыжок Олли: {height:.0f} px в высоту при скорости {speed:.0f} px/с")

    surf = surfaces(layout)
    if not surf:
        print("Площадок не найдено")
        return 1

    start = min(
        (s for s in surf if s[0] <= spawn_x <= s[1]),
        key=lambda s: abs(s[2] - spawn_y), default=None)
    if start is None:
        print(f"ОШИБКА: под точкой старта ({spawn_x}, {spawn_y}) нет опоры")
        return 1

    # Обход в ширину по достижимым площадкам.
    reached = {surf.index(start)}
    frontier = [surf.index(start)]

    while frontier:
        i = frontier.pop()
        for j, target in enumerate(surf):
            if j in reached:
                continue
            dh = surf[i][2] - target[2]
            reach = jump_reach(dh, jump, gravity, speed) * SAFETY
            if reach >= 0 and gap(surf[i], target) <= reach:
                reached.add(j)
                frontier.append(j)

    problems = 0

    for j, s in enumerate(surf):
        if j not in reached:
            print(f"  недостижима площадка x {s[0]:.0f}..{s[1]:.0f}, y {s[2]:.0f}")
            problems += 1

    # Жуки: стоит ли каждый на достижимой опоре и не уходит ли с неё.
    enemies = [i for layer in layout["layers"] for i in layer["instances"]
               if i["type"] == "Enemy"]

    for enemy in enemies:
        w = enemy["world"]
        reach = enemy.get("instanceVariables", {}).get("patrolRange", 0)
        left, right = w["x"] - reach, w["x"] + reach

        under = [j for j, s in enumerate(surf)
                 if s[0] <= w["x"] <= s[1] and abs(s[2] - w["y"]) < 2]

        if not under:
            print(f"  жук uid {enemy['uid']} не стоит ни на одной площадке")
            problems += 1
            continue

        if under[0] not in reached:
            print(f"  ЖУК uid {enemy['uid']} НЕДОСТИЖИМ — уровень не пройти")
            problems += 1

        s = surf[under[0]]
        if left < s[0] or right > s[1]:
            print(f"  жук uid {enemy['uid']} патрулирует за край опоры "
                  f"(x {left:.0f}..{right:.0f}, опора {s[0]:.0f}..{s[1]:.0f})")
            problems += 1

    print(f"\nплощадок {len(surf)}, достижимо {len(reached)}; "
          f"жуков {len(enemies)}")

    if problems:
        print(f"найдено проблем: {problems}")
        return 1

    print("уровень проходим")
    return 0


if __name__ == "__main__":
    sys.exit(main())
