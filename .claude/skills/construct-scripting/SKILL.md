---
name: construct-scripting
description: API скриптинга Construct 3 — runtime, экземпляры, поведение Platform, коллизии, камера, события ввода, и почему редактор показывает ошибки типов. Нужен при правке scripts/основной.ts.
---

# Скриптинг Construct 3

Сверено с официальным мануалом релиза 506.3 — ровно той версии, которой сохранён
проект. Сайт construct.net из этого окружения недоступен; зеркало исходников
мануала лежит в репозитории `XHXIAIEIN/Construct3-Manual` на GitHub.

## Ошибки типов в редакторе — ожидаемы

`Cannot find name 'IRuntime'`, `Cannot find name 'IWorldInstance'`,
`'InstanceType' only refers to a type, but is being used as a namespace` —
это отсутствующая папка `ts-defs`, её генерирует Construct при открытии
проекта. Проверено компилятором: настоящих ошибок в коде нет.

Перед тем как «чинить типы», прогони проверку и убедись, что все ошибки из
этого списка:

```bash
cd <scratchpad> && npm i typescript@5 \
  && ./node_modules/.bin/tsc --noEmit --skipLibCheck --target es2020 \
     --module esnext --moduleResolution bundler \
     "<путь>/scripts/основной.ts"
```

Заглушку в `ts-defs/` класть не стоит: Construct пишет туда свои файлы, и
совпадение имён даст дубли объявлений — станет хуже, чем было.

## Точка входа

```ts
runOnStartup(async (rt: IRuntime) => {
    rt.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(rt));
});
```

К моменту `beforeprojectstart` экземпляры макета созданы и доступны. Раньше —
нет.

## Что есть в runtime

`dt`, `layout`, `collisions`, `objects`, `getViewportSize()`,
`addEventListener`, `goToLayout`, `globalVars`, `storage`.

События: `tick`, `keydown`, `keyup`, `mousedown`, `mouseup`, `pointerdown`,
`suspend`, `resume`, `beforeprojectstart`, `beforelayoutstart`.

**Плагины Keyboard и Mouse не нужны** для `keydown` / `mousedown` — это события
уровня рантайма.

## Экземпляры

```ts
runtime.objects.Enemy.getFirstInstance()   // T | null
runtime.objects.Enemy.getAllInstances()    // T[] — снимок
runtime.objects.Enemy.instances()          // генератор
runtime.objects.Wrench.createInstance(layerNameOrIndex, x, y)
```

**Удаляешь экземпляры внутри цикла — бери `getAllInstances()`,** а не
генератор.

**Создавай по имени слоя**, не по индексу: индексы сдвигаются.

У `IWorldInstance`: `x`, `y`, `width`, `height`, `angleDegrees`, `opacity`,
`isVisible`, `setSize()`, `testOverlap(other)`, `testOverlapSolid()`,
`destroy()`, `uid`, `instVars`, `behaviors`. У Sprite добавляется
`animationFrame`, `setAnimation()`. У Text — `text`.

Зеркалирования у Sprite **нет**: ни `isMirrored`, ни документированной
отрицательной ширины. Для разворота влево делай второй кадр.

## Поведение Platform

```ts
const platform = olly.behaviors.Platform;
platform.simulateControl("left" | "right" | "jump");
platform.setVector(vx, vy);
platform.vectorX; platform.isOnFloor; platform.isEnabled;
platform.isIgnoringInput; platform.isDefaultControls;
```

`simulateControl` надо звать **каждый кадр**, пока клавиша зажата — это
равносильно удержанию настоящей клавиши. Повторного прыжка в воздухе не будет,
поведение само следит за состоянием управления.

Чтобы отобрать управление, но сохранить гравитацию, — `isIgnoringInput = true`.
`isEnabled = false` отключит и падение, объект зависнет в воздухе.

Высота прыжка считается как `jumpStrength² / (2 × gravity)`. У Олли
820² / (2 × 2000) ≈ 168 px — по этому числу проверяется достижимость площадок.

## Коллизии и камера

```ts
runtime.collisions.testOverlapAny(inst, iterable)   // IWorldInstance | null
runtime.layout.scrollTo(x, y);
runtime.layout.scrollX; runtime.layout.width;
```

Сглаживание камеры делай кадронезависимым:
`t = 1 - Math.exp(-SMOOTHING * runtime.dt)`.

## Порядок внутри кадра

Он уже выстроен в `Tick` и прокомментирован там. Важны два правила: удар
считается до движения жуков (иначе попадание расходится с тем, что видел
игрок), параллакс — после камеры (иначе фон отстаёт на кадр).
