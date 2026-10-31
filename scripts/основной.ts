// Reunion — логика первого уровня. Играем за Олли: ходьба на A/D, прыжок на
// пробел, удар ключом на ЛКМ. Цель — разбить всех механических жуков.
//
// Геометрия, фон и стартовые значения переменных лежат в макете; здесь только
// логика. Листов событий в проекте нет. Подробности об устройстве проекта и
// об ограничениях бесплатной редакции Construct — в CLAUDE.md.

// =============================================================================
//  Константы
// =============================================================================

/** Слой со сценой. Адресуем по имени, а не по индексу: порядок слоёв меняется. */
const GAME_LAYER = "Игра";

// --- Ввод --------------------------------------------------------------------

// Храним e.code — это физическая клавиша, поэтому раскладка роли не играет.
const KEY_LEFT = "KeyA";
const KEY_RIGHT = "KeyD";
const KEY_JUMP = "Space";
const MOUSE_LEFT_BUTTON = 0;

// --- Камера ------------------------------------------------------------------

/** Скорость догоняния: больше — жёстче камера. */
const CAMERA_SMOOTHING = 7;
/** Доля скорости бега, на которую камера смотрит вперёд. */
const CAMERA_LOOK_AHEAD = 0.22;
/** Насколько камера поднята над Олли, в долях высоты окна. */
const CAMERA_HEIGHT_BIAS = 0.12;

// --- Удар ключом -------------------------------------------------------------

/** Пауза между ударами, с. */
const SWING_COOLDOWN = 0.38;
/** Сколько живёт дуга замаха, с. */
const SWING_DURATION = 0.12;
/** Вынос дуги вперёд от центра Олли, px. */
const SWING_REACH = 22;
/** Кадр нарисован крупнее ради деталей губок — экземпляр ужимаем. */
const SWING_SIZE = 50;
/** На сколько отлетает жук от попадания, px. */
const SWING_KNOCKBACK = 16;

// --- Жуки --------------------------------------------------------------------

/** Скорость патруля, px/с. */
const ENEMY_SPEED = 46;
/** Прозрачность жука сразу после попадания — обратная связь, что попал. */
const ENEMY_HIT_OPACITY = 0.6;
/** Скорость возврата к нормальному виду, долей непрозрачности в секунду. */
const ENEMY_FADE_BACK = 1.6;

// --- Столкновение с жуком ----------------------------------------------------

const CONTACT_COOLDOWN = 0.7;
const CONTACT_PUSH_X = 240;
const CONTACT_PUSH_Y = -340;

// --- Точка возрождения -------------------------------------------------------

// По бокам макета стоят невидимые стены с поведением Solid, так что уйти за
// карту нельзя. Страховка ниже — на случай, если в полу появится дыра.
const OLLY_SPAWN_X = 140;
const OLLY_SPAWN_Y = 880;
/** Насколько ниже макета нужно оказаться, чтобы сработал возврат, px. */
const FALL_MARGIN = 160;

// --- Параллакс ---------------------------------------------------------------

// Чем меньше множитель, тем дальше план и тем медленнее он едет за камерой.
const PARALLAX_FAR = 0.25;
const PARALLAX_NEAR = 0.5;

// =============================================================================
//  Состояние
// =============================================================================

/** Сохраняем при старте, чтобы не таскать runtime параметром по всем функциям. */
let runtime!: IRuntime;

let olly!: InstanceType.Olly;
let hud!: InstanceType.HUD;

/** Клавиши, зажатые прямо сейчас. */
const heldKeys = new Set<string>();

/** Куда смотрит Олли: 1 — вправо, -1 — влево. */
let facing: 1 | -1 = 1;

/** Текущая дуга удара, либо null, если удара сейчас нет. */
let swing: InstanceType.Wrench | null = null;
/** Сколько секунд осталось до следующего разрешённого удара. */
let swingCooldownLeft = 0;
/** Сколько секунд осталось жить текущей дуге. */
let swingLifeLeft = 0;
/** uid жуков, уже получивших урон от текущего замаха. */
const swingHitUids = new Set<number>();

let partsCollected = 0;
let contactCooldownLeft = 0;

/**
 * Жуки обходятся без поведений: патруль считаем сами, поэтому стартовую точку
 * и направление держим рядом — по uid экземпляра.
 */
interface EnemyState
{
	readonly startX: number;
	direction: number;
}

const enemyStates = new Map<number, EnemyState>();

/** Элемент заднего плана, который едет за камерой медленнее сцены. */
interface ParallaxItem
{
	readonly instance: IWorldInstance;
	readonly baseX: number;
	readonly baseY: number;
	readonly factor: number;
}

const parallaxItems: ParallaxItem[] = [];

/** Последняя отрисованная строка HUD — чтобы не трогать текст каждый кадр. */
let lastHudText = "";

// =============================================================================
//  Запуск
// =============================================================================

runOnStartup(async (rt: IRuntime) =>
{
	rt.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(rt));
});

function OnBeforeProjectStart(rt: IRuntime): void
{
	runtime = rt;

	olly = RequireFirstInstance(runtime.objects.Olly, "Olly");
	hud = RequireFirstInstance(runtime.objects.HUD, "HUD");

	CollectParallaxItems();
	CollectEnemyStates();

	SnapCameraToOlly();

	runtime.addEventListener("keydown", (e: KeyboardEvent) => heldKeys.add(e.code));
	runtime.addEventListener("keyup", (e: KeyboardEvent) => heldKeys.delete(e.code));
	runtime.addEventListener("mousedown", (e: MouseEvent) => OnMouseDown(e));

	// Если окно потеряет фокус, keyup не придёт и клавиша «залипнет» зажатой.
	runtime.addEventListener("suspend", () => heldKeys.clear());

	runtime.addEventListener("tick", () => Tick());
}

/** Экземпляр обязан быть на макете: без него уровень не имеет смысла. */
function RequireFirstInstance<T extends IWorldInstance>(
	objectType: IObjectType<T>, name: string): T
{
	const instance = objectType.getFirstInstance();

	if (!instance)
		throw new Error(`На макете нет экземпляра «${name}»`);

	return instance;
}

function CollectParallaxItems(): void
{
	const planes: ReadonlyArray<[IObjectType<IWorldInstance>, number]> = [
		[runtime.objects.BgFar, PARALLAX_FAR],
		[runtime.objects.BgNear, PARALLAX_NEAR],
	];

	for (const [objectType, factor] of planes)
		for (const instance of objectType.instances())
			parallaxItems.push({ instance, baseX: instance.x, baseY: instance.y, factor });
}

function CollectEnemyStates(): void
{
	for (const enemy of runtime.objects.Enemy.instances())
		enemyStates.set(enemy.uid, { startX: enemy.x, direction: 1 });
}

// =============================================================================
//  Кадр
// =============================================================================

// Порядок важен в двух местах: удар считается до движения жуков, чтобы
// попадание определялось по той же позиции, что видел игрок; параллакс — после
// камеры, чтобы брать уже новую прокрутку и не отставать на кадр.
function Tick(): void
{
	const dt = runtime.dt;

	UpdateMovement();
	UpdateFacing();
	UpdateSwing(dt);
	UpdateEnemies(dt);
	UpdateContactDamage(dt);
	CheckFellOutOfLevel();
	UpdateCamera();
	UpdateParallax();
	UpdateHud();
}

// =============================================================================
//  Движение Олли
// =============================================================================

/**
 * Встроенное управление поведения Platform выключено в свойствах экземпляра —
 * оно жёстко привязано к стрелкам. Поэтому ввод подаём сами.
 *
 * simulateControl нужно звать каждый кадр, пока клавиша зажата: это равносильно
 * удержанию настоящей клавиши. Повторного прыжка в воздухе не будет — поведение
 * само следит за тем, что управление прыжком уже нажато.
 */
function UpdateMovement(): void
{
	const platform = olly.behaviors.Platform;

	if (heldKeys.has(KEY_LEFT))
		platform.simulateControl("left");

	if (heldKeys.has(KEY_RIGHT))
		platform.simulateControl("right");

	if (heldKeys.has(KEY_JUMP))
		platform.simulateControl("jump");
}

/**
 * Поведение Platform не хранит, куда смотрит персонаж. Запоминаем последнее
 * заметное направление бега; порог в 1 px/с отсекает дрожание около нуля.
 */
function UpdateFacing(): void
{
	const vectorX = olly.behaviors.Platform.vectorX;

	if (vectorX > 1)
		facing = 1;
	else if (vectorX < -1)
		facing = -1;
}

// =============================================================================
//  Удар ключом
// =============================================================================

function OnMouseDown(e: MouseEvent): void
{
	// Удар по нажатию, а не по удержанию: зажатая кнопка не должна превращаться
	// в непрерывную молотилку.
	if (e.button === MOUSE_LEFT_BUTTON)
		TrySwing();
}

function TrySwing(): void
{
	if (swingCooldownLeft > 0)
		return;

	swingCooldownLeft = SWING_COOLDOWN;
	swingLifeLeft = SWING_DURATION;
	swingHitUids.clear();

	swing = runtime.objects.Wrench.createInstance(
		GAME_LAYER,
		olly.x + facing * SWING_REACH,
		olly.y - olly.height / 2
	);
	swing.setSize(SWING_SIZE, SWING_SIZE);
	AimSwing();
}

/** Дуга висит на Олли, а не остаётся в точке создания. */
function AimSwing(): void
{
	if (!swing)
		return;

	swing.x = olly.x + facing * SWING_REACH;
	swing.y = olly.y - olly.height / 2;

	// Поворот на 180° отразил бы ключ и по вертикали — головка оказалась бы
	// внизу. Поэтому для взгляда влево берём отдельный зеркальный кадр.
	swing.animationFrame = facing > 0 ? 0 : 1;
}

function UpdateSwing(dt: number): void
{
	if (swingCooldownLeft > 0)
		swingCooldownLeft -= dt;

	// Берём в локальную переменную: между проверкой и destroy вызываются
	// функции, и компилятор справедливо не верит, что swing остался живым.
	const current = swing;

	if (!current)
		return;

	AimSwing();
	DamageEnemiesInSwing();

	swingLifeLeft -= dt;

	if (swingLifeLeft <= 0)
	{
		current.destroy();
		swing = null;
	}
}

/**
 * Урон считаем каждый кадр, пока дуга жива, иначе жук, вошедший в неё с
 * опозданием, не получил бы ничего. Но каждому жуку — не больше раза за замах,
 * иначе один удар снимал бы всё здоровье.
 */
function DamageEnemiesInSwing(): void
{
	if (!swing)
		return;

	// Снимок массивом, а не генератор: внутри цикла экземпляры удаляются.
	for (const enemy of runtime.objects.Enemy.getAllInstances())
	{
		if (swingHitUids.has(enemy.uid) || !swing.testOverlap(enemy))
			continue;

		swingHitUids.add(enemy.uid);
		enemy.instVars.health -= 1;
		enemy.x += facing * SWING_KNOCKBACK;

		if (enemy.instVars.health > 0)
		{
			enemy.opacity = ENEMY_HIT_OPACITY;
			continue;
		}

		// По концепту с врагов падают детали для улучшений Олли. Пока это просто
		// счётчик — предметы-подборы можно надстроить сверху.
		partsCollected += 1;
		enemyStates.delete(enemy.uid);
		enemy.destroy();
	}
}

// =============================================================================
//  Жуки
// =============================================================================

/** Ходят вокруг стартовой точки в пределах patrolRange, заданного в макете. */
function UpdateEnemies(dt: number): void
{
	for (const enemy of runtime.objects.Enemy.instances())
	{
		const state = enemyStates.get(enemy.uid);

		if (!state)
			continue;

		enemy.x += state.direction * ENEMY_SPEED * dt;

		const offset = enemy.x - state.startX;
		const range = enemy.instVars.patrolRange;

		if (Math.abs(offset) > range)
		{
			// Ставим ровно на край, иначе за кадр можно уехать за него и начать
			// дрожать на развороте.
			enemy.x = state.startX + Math.sign(offset) * range;
			state.direction *= -1;
		}

		if (enemy.opacity < 1)
			enemy.opacity = Math.min(1, enemy.opacity + dt * ENEMY_FADE_BACK);
	}
}

/** Касание жука отбрасывает Олли. Пауза нужна, чтобы не толкало каждый кадр. */
function UpdateContactDamage(dt: number): void
{
	if (contactCooldownLeft > 0)
	{
		contactCooldownLeft -= dt;
		return;
	}

	const enemy = runtime.collisions.testOverlapAny(olly, runtime.objects.Enemy.instances());

	if (!enemy)
		return;

	contactCooldownLeft = CONTACT_COOLDOWN;

	// Если центры совпали, Math.sign вернёт 0 — тогда толкаем вправо.
	const away = Math.sign(olly.x - enemy.x) || 1;
	olly.behaviors.Platform.setVector(away * CONTACT_PUSH_X, CONTACT_PUSH_Y);
}

// =============================================================================
//  Камера и параллакс
// =============================================================================

function UpdateCamera(): void
{
	const [targetX, targetY] = GetCameraTarget();
	const layout = runtime.layout;

	// Экспоненциальное сглаживание: результат не зависит от частоты кадров.
	const t = 1 - Math.exp(-CAMERA_SMOOTHING * runtime.dt);

	layout.scrollTo(
		layout.scrollX + (targetX - layout.scrollX) * t,
		layout.scrollY + (targetY - layout.scrollY) * t
	);
}

function SnapCameraToOlly(): void
{
	const [x, y] = GetCameraTarget();
	runtime.layout.scrollTo(x, y);
}

/**
 * Куда камера хочет смотреть: Олли, смещённый вперёд по бегу и немного вверх,
 * с ограничением по границам макета.
 */
function GetCameraTarget(): [number, number]
{
	const layout = runtime.layout;
	const [viewportWidth, viewportHeight] = runtime.getViewportSize();

	const halfWidth = viewportWidth / 2;
	const halfHeight = viewportHeight / 2;

	const x = olly.x + olly.behaviors.Platform.vectorX * CAMERA_LOOK_AHEAD;
	const y = olly.y - viewportHeight * CAMERA_HEIGHT_BIAS;

	return [
		Clamp(x, halfWidth, layout.width - halfWidth),
		Clamp(y, halfHeight, layout.height - halfHeight),
	];
}

/**
 * Эмуляция параллакса на одном слое. Экземпляр фона сдвигается вслед за
 * камерой на долю её смещения: на экране он уезжает медленнее сцены. При
 * factor = 1 получилась бы обычная скорость, при 0 — приклеенный к экрану фон.
 */
function UpdateParallax(): void
{
	const { scrollX, scrollY } = runtime.layout;

	for (const item of parallaxItems)
	{
		item.instance.x = item.baseX + scrollX * (1 - item.factor);
		item.instance.y = item.baseY + scrollY * (1 - item.factor);
	}
}

/** Провалился ниже макета — возвращаем на старт, иначе падение бесконечное. */
function CheckFellOutOfLevel(): void
{
	if (olly.y < runtime.layout.height + FALL_MARGIN)
		return;

	olly.x = OLLY_SPAWN_X;
	olly.y = OLLY_SPAWN_Y;
	olly.behaviors.Platform.setVector(0, 0);

	SnapCameraToOlly();
}

// =============================================================================
//  Интерфейс
// =============================================================================

/** Одна строка: сколько жуков осталось и сколько деталей собрано. */
function UpdateHud(): void
{
	const enemiesLeft = runtime.objects.Enemy.getAllInstances().length;

	const status = enemiesLeft > 0
		? `Жуки [color=#F3CC7A]${enemiesLeft}[/color]`
		: "[color=#F3CC7A]Зачищено[/color]";

	const text = `${status}   [color=#4A515F]|[/color]   `
		+ `Детали [color=#F3CC7A]${partsCollected}[/color]`;

	// Текст меняется редко, а присваивание заставляет объект перерисоваться.
	if (text === lastHudText)
		return;

	lastHudText = text;
	hud.text = text;
}

// =============================================================================
//  Утилиты
// =============================================================================

function Clamp(value: number, min: number, max: number): number
{
	return Math.min(Math.max(value, min), max);
}
