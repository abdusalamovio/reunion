#!/usr/bin/env python3
"""Проверка целостности проекта Construct 3.

Запускать из корня проекта после любой правки JSON:

    python3 .claude/skills/project-audit/scripts/audit.py

Код возврата 0 — всё сошлось, 1 — есть ошибки. Предупреждения код не меняют.
"""

from __future__ import annotations

import glob
import json
import os
import struct
import sys

ERRORS: list[str] = []
WARNINGS: list[str] = []

# Лимиты бесплатной редакции Construct 3.
FREE_MAX_LAYERS = 2
FREE_MAX_EVENTS = 50
FREE_MAX_EFFECTS = 2
FREE_MAX_SCRIPT_LINES = 500


def fail(msg: str) -> None:
    ERRORS.append(msg)


def warn(msg: str) -> None:
    WARNINGS.append(msg)


def load(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def png_size(path: str) -> tuple[int, int]:
    with open(path, "rb") as f:
        data = f.read(26)
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path}: не PNG")
    width, height = struct.unpack(">II", data[16:24])
    return width, height


def count_code_lines(path: str) -> int:
    """Строки кода без комментариев и пустых.

    Лимит бесплатной редакции считается по JavaScript, а комментарии при
    компиляции TypeScript вырезаются, поэтому считать сырые строки — ложная
    тревога. Блочные комментарии учитываются грубо, этого достаточно.
    """
    count = 0
    in_block = False

    for raw in open(path, encoding="utf-8"):
        line = raw.strip()

        if in_block:
            if "*/" in line:
                in_block = False
            continue

        if not line or line.startswith("//"):
            continue

        if line.startswith("/*"):
            if "*/" not in line:
                in_block = True
            continue

        count += 1

    return count


def instance_box(inst: dict) -> tuple[float, float, float, float]:
    w = inst["world"]
    x = w["x"] - w["originX"] * w["width"]
    y = w["y"] - w["originY"] * w["height"]
    return x, y, x + w["width"], y + w["height"]


def main() -> int:
    if not os.path.exists("project.c3proj"):
        print("Запускать из корня проекта Construct", file=sys.stderr)
        return 1

    # --- 1. Все JSON читаются -------------------------------------------------
    paths = (["project.c3proj"]
             + glob.glob("objectTypes/*.json")
             + glob.glob("layouts/*.json"))
    paths = [p for p in paths if not p.endswith(".uistate.json")]

    for path in paths:
        try:
            load(path)
        except Exception as exc:
            fail(f"{path}: не разбирается — {exc}")

    if ERRORS:
        return report()

    project = load("project.c3proj")

    # --- 2. Типы объектов: индекс == файлы == поле name ------------------------
    declared = list(project["objectTypes"]["items"])
    files: dict[str, dict] = {}

    for path in glob.glob("objectTypes/*.json"):
        obj = load(path)
        stem = os.path.splitext(os.path.basename(path))[0]
        if obj["name"] != stem:
            fail(f"{path}: поле name «{obj['name']}» не совпадает с именем файла")
        files[obj["name"]] = obj

    for name in declared:
        if name not in files:
            fail(f"project.c3proj объявляет «{name}», но objectTypes/{name}.json нет")

    for name in files:
        if name not in declared:
            fail(f"objectTypes/{name}.json есть, но в project.c3proj не объявлен")

    if len(declared) != len(set(declared)):
        fail("project.c3proj: в objectTypes.items есть повторы")

    # --- 3. Картинки кадров ---------------------------------------------------
    expected_images: set[str] = set()

    for name, obj in files.items():
        if obj.get("plugin-id") == "Text":
            continue

        animations = obj.get("animations", {}).get("items", [])
        if not animations:
            warn(f"{name}: нет анимаций")
            continue

        for anim in animations:
            anim_name = anim["name"].lower()
            for index, frame in enumerate(anim["frames"]):
                img = f"images/{name.lower()}-{anim_name}-{index:03d}.png"
                expected_images.add(img)

                if not os.path.exists(img):
                    fail(f"{name}: нет картинки {img}")
                    continue

                try:
                    width, height = png_size(img)
                except Exception as exc:
                    fail(f"{img}: {exc}")
                    continue

                if (width, height) != (frame["width"], frame["height"]):
                    fail(f"{img}: файл {width}x{height}, "
                         f"а кадр объявлен {frame['width']}x{frame['height']}")

    for img in glob.glob("images/*.png"):
        if img not in expected_images:
            warn(f"{img}: на него не ссылается ни один кадр, "
                 f"Construct удалит файл при сохранении")

    # --- 4. Поведения объявлены в usedAddons ----------------------------------
    addon_ids = {a["id"] for a in project.get("usedAddons", [])}

    for name, obj in files.items():
        plugin = obj.get("plugin-id")
        if plugin and plugin not in addon_ids:
            fail(f"{name}: плагин «{plugin}» не объявлен в usedAddons")
        for behavior in obj.get("behaviorTypes", []):
            if behavior["behaviorId"] not in addon_ids:
                fail(f"{name}: поведение «{behavior['behaviorId']}» "
                     f"не объявлено в usedAddons")

    # --- 5. Макеты ------------------------------------------------------------
    for path in glob.glob("layouts/*.json"):
        if path.endswith(".uistate.json"):
            continue
        check_layout(path, load(path), declared, files)

    # --- 6. Лимиты бесплатной редакции ----------------------------------------
    events = len(project.get("eventSheets", {}).get("items", []))
    if events:
        warn(f"листов событий: {events}. Проект рассчитан на логику в TypeScript; "
             f"лимит бесплатной редакции — {FREE_MAX_EVENTS} событий")

    for path in glob.glob("scripts/*.ts"):
        code = count_code_lines(path)
        if code > FREE_MAX_SCRIPT_LINES:
            warn(f"{path}: {code} строк кода, лимит бесплатной редакции "
                 f"~{FREE_MAX_SCRIPT_LINES}")

    return report()


def check_layout(path: str, layout: dict, declared: list[str],
                 files: dict[str, dict]) -> None:
    layers = layout["layers"]

    if len(layers) > FREE_MAX_LAYERS:
        fail(f"{path}: слоёв {len(layers)}, лимит бесплатной редакции "
             f"— {FREE_MAX_LAYERS}")

    effects = len(layout.get("effectTypes", []))
    effects += sum(len(l.get("effectTypes", [])) for l in layers)
    if effects > FREE_MAX_EFFECTS:
        fail(f"{path}: эффектов {effects}, лимит — {FREE_MAX_EFFECTS}")

    instances = [i for l in layers for i in l["instances"]]

    uids = [i["uid"] for i in instances]
    sids = [i["sid"] for i in instances]
    for label, values in (("uid", uids), ("sid", sids)):
        duplicates = {v for v in values if values.count(v) > 1}
        if duplicates:
            fail(f"{path}: повторяющиеся {label}: {sorted(duplicates)}")

    for inst in instances:
        if inst["type"] not in declared:
            fail(f"{path}: экземпляр типа «{inst['type']}», "
                 f"которого нет в project.c3proj")

    check_enemy_corridors(path, instances)


def check_enemy_corridors(path: str, instances: list[dict]) -> None:
    """Жук не должен проходить сквозь декор — это видно игроку."""
    enemies = [i for i in instances if i["type"] == "Enemy"]
    decor = [i for i in instances if i["type"] in ("Bolt", "Bracket")]

    for enemy in enemies:
        world = enemy["world"]
        reach = enemy.get("instanceVariables", {}).get("patrolRange", 0)
        x0 = world["x"] - reach - world["width"] / 2
        x1 = world["x"] + reach + world["width"] / 2
        y0 = world["y"] - world["height"]
        y1 = world["y"]

        for item in decor:
            dx0, dy0, dx1, dy1 = instance_box(item)
            if x0 < dx1 and dx0 < x1 and y0 < dy1 and dy0 < y1:
                fail(f"{path}: жук uid {enemy['uid']} проходит сквозь "
                     f"{item['type']} uid {item['uid']}")


def report() -> int:
    for msg in WARNINGS:
        print(f"  предупреждение: {msg}")
    for msg in ERRORS:
        print(f"  ОШИБКА: {msg}")

    if ERRORS:
        print(f"\nпровалено: {len(ERRORS)} ошибок, {len(WARNINGS)} предупреждений")
        return 1

    print(f"\nвсё сошлось ({len(WARNINGS)} предупреждений)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
