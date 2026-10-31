---
name: construct-project-format
description: Формат файлов проекта Construct 3 — структура objectTypes, экземпляров в макете, слоёв, usedAddons, имена картинок и идентификаторы поведений. Нужен при любой правке project.c3proj, objectTypes/*.json или layouts/*.json вручную.
---

# Формат проекта Construct 3

Всё ниже сверено с настоящими проектами Construct (релиз 44902–50603) и
официальным мануалом релиза 506.3. Это не догадки — но и не официальная
спецификация: Scirra её не публикует. При сомнении ищи живой проект на GitHub
по строке `editorNewInstanceIsReplica` и смотри, как сделано там.

## Правило первое: правь скриптом, не текстом

Отступы — табы, имена файлов и объектов — кириллица, структура глубокая.
Текстовая замена уже ломала макет.

```python
import json
p = "layouts/Макет 1.json"
L = json.load(open(p, encoding="utf-8"))
# ... правки ...
open(p, "w", encoding="utf-8").write(
    json.dumps(L, ensure_ascii=False, indent="\t") + "\n")
```

## Тип объекта — Sprite

```json
{
  "name": "Enemy",
  "plugin-id": "Sprite",
  "sid": 410882317450061,
  "isGlobal": false,
  "editorNewInstanceIsReplica": true,
  "instanceVariables": [
    { "name": "health", "type": "number", "desc": "", "show": true, "sid": 1 }
  ],
  "behaviorTypes": [
    { "behaviorId": "solid", "name": "Solid", "sid": 2 }
  ],
  "effectTypes": [],
  "animations": { "items": [ {
      "frames": [ {
          "width": 40, "height": 36,
          "originX": 0.5, "originY": 1,
          "originalSource": "", "exportFormat": "lossless",
          "exportQuality": 0.8, "fileType": "image/png",
          "imageSpriteId": 4108827,
          "collisionPoly": { "points": [0.1, 0, 0.9, 0, 0.9, 1, 0.1, 1] },
          "useCollisionPoly": true, "duration": 1, "tag": ""
      } ],
      "sid": 3, "name": "Default", "isLooping": false, "isPingPong": false,
      "repeatCount": 1, "repeatTo": 0, "speed": 0
  } ], "subfolders": [] }
}
```

- `originX/Y` — доли, не пиксели. `0.5, 1` = низ по центру, удобно для стоящих
  на земле.
- `collisionPoly.points` — пары долей кадра, по часовой.
- `speed: 0` — кадры не проигрываются сами. Нужно, если кадры используются как
  состояния (например, зеркальный кадр для взгляда влево).
- `imageSpriteId` — произвольное уникальное число.

Тип Text проще: только `name`, `plugin-id: "Text"`, `sid`, `isGlobal`,
`instanceVariables`, `behaviorTypes`, `effectTypes`. Ни картинок, ни анимаций.

## Имена картинок

```
images/<имя_объекта>-<имя_анимации>-<NNN>.png
```

Всё в нижнем регистре, номер кадра с ведущими нулями до трёх знаков.
`Enemy` + анимация `Default` + кадр 0 → `images/enemy-default-000.png`.
Имена папок анимаций в имя файла не входят.

**Папкой `images` управляют типы объектов.** PNG, на который не ссылается ни
один кадр, Construct удалит при сохранении. Нужно сохранить картинку, но убрать
объект с уровня — удаляй экземпляр из макета, а тип оставляй.

## Экземпляр в макете

```json
{
  "type": "Enemy",
  "properties": { "initially-visible": true, "initial-animation": "Default",
                  "initial-frame": 0, "enable-collisions": true,
                  "live-preview": false },
  "uid": 10, "sid": 410882317451010, "tags": "",
  "instanceVariables": { "health": 2, "patrolRange": 90 },
  "behaviors": { "Solid": { "properties": { "enabled": true,
                 "use-instance-tags": false, "tags": "" } } },
  "showing": true, "locked": false,
  "world": { "x": 760, "y": 880, "width": 40, "height": 36,
             "originX": 0.5, "originY": 1,
             "color": [1, 1, 1, 1], "z": 0, "angle": 0 }
}
```

- `world.color` — тон RGBA, четвёртый компонент работает как непрозрачность.
- `world.z`, не `zElevation` — последнее встречается в старых релизах.
- `properties` зависят от плагина. У Text свой набор: `text`, `enable-bbcode`,
  `font`, `size`, `line-height`, `bold`, `italic`, `color`,
  `horizontal-alignment`, `vertical-alignment`, `wrapping`, `text-direction`,
  `icon-set`, `initially-visible`, `origin`, `read-aloud`.
- `instanceVariables` здесь — объект имя→значение, а в типе объекта это массив
  описаний. Не перепутай.

## Поведения: идентификаторы

Регистр значимый и непоследовательный. Проверенные:

| Поведение | `behaviorId` |
|---|---|
| Platform | `Platform` |
| Solid | `solid` |
| Scroll To | `scrollto` |
| Jump-thru | `jumpthru` |
| Sine | `Sin` |
| 8 Direction | `EightDir` |
| Line of sight | `LOS` |
| Timer, Tween, MoveTo | `Timer`, `Tween`, `MoveTo` |

Свойства Platform у экземпляра: `max-speed`, `acceleration`, `deceleration`,
`jump-strength`, `gravity`, `max-fall-speed`, `double-jump`, `jump-sustain`,
`default-controls`, `enabled`.

## usedAddons

Каждый использованный плагин и поведение обязан быть здесь, иначе проект может
не открыться.

```json
{ "type": "behavior", "id": "Platform", "name": "Platform",
  "author": "Scirra", "bundled": false }
```

`type` — `plugin`, `behavior` или `effect`.

## Слой макета

Поля: `name`, `overriden`, `subLayers`, `instances`, `sid`, `effectTypes`,
`isInitiallyVisible`, `isInitiallyInteractive`, `isHTMLElementsLayer`, `color`,
`backgroundColor`, `isTransparent`, `sampling`, `parallaxX`, `parallaxY`,
`scaleRate`, `forceOwnTexture`, `renderingMode`, `drawOrder`, `useRenderCells`,
`blendMode`, `zElevation`, `global`.

Порядок массива `layers` — снизу вверх. Порядок `instances` внутри слоя — тоже
порядок отрисовки.

Для 2D-платформера `renderingMode: "2d"`. Корень макета при этом может
оставаться `"projection": "perspective"` — на 2D-слои это не влияет.

**Адресуй слой по имени, а не по индексу.** Индексы сдвигаются при добавлении
слоёв, и `createInstance(0, …)` тихо начнёт создавать объекты на фоне.

## Файлы .uistate.json

Состояние редактора. На игру не влияют, в `.gitignore`, трогать не надо.
