// Константы

// Слой по имени, а не по индексу: индексы сдвигаются при добавлении слоёв.
const GAME_LAYER = "Игра";

// Ввод

const KEY_LEFT = "KeyA";
const KEY_RIGHT = "KeyD";
const KEY_JUMP = "Space";
const MOUSE_LEFT_BUTTON = 0;

// Камера

const CAMERA_SMOOTHING = 7;
const CAMERA_LOOK_AHEAD = 0.22;
const CAMERA_HEIGHT_BIAS = 0.12;
const CAMERA_ZOOM = 2;


// Олли

// Кадры крупнее хитбокса, поэтому размер Олли берём отсюда, а не из olly.width/height.
const OLLY_HITBOX_WIDTH = 18;
const OLLY_HITBOX_HEIGHT = 30;

const JUMP_TAKEOFF_SPEED = -330;
const JUMP_RISE_SPEED = -150;
const JUMP_FALL_SPEED = 120;
const ANIM_MOVE_THRESHOLD = 12;
const ATTACK_ANIMATION_TIME = 6 / 16;
const HURT_ANIMATION_TIME = 6 / 12;
const PICKUP_ANIMATION_TIME = 6 / 10;

// Удар ключом

const SWING_COOLDOWN = 0.38;
const SWING_WINDUP = 0.14;
const SWING_DURATION = 0.12;
// Зона удара относительно ступней Олли: вперёд, назад, вверх, вниз. Накрывает
// весь рост — раньше она была полоской на уровне груди и низких мышей и
// гусениц задевала краем в 3 px. Wrench — невидимая зона: один прозрачный
// кадр, рамка столкновений — весь кадр, размер задаёт setSize.
const SWING_FRONT = 30;
const SWING_BACK = 4;
const SWING_TOP = 34;
const SWING_BOTTOM = 2;
const SWING_KNOCKBACK = 8;

// Враги

type EnemyInstance = InstanceType.Mouse | InstanceType.Bird | InstanceType.Caterpillar;

interface EnemyKind
{
	readonly speed: number;
	readonly dashSpeed: number;
	readonly sightX: number;
	readonly sightY: number;
	readonly attackRange: number;
	readonly attackTime: number;
	readonly hitTime: number;
	readonly hurtTime: number;
	readonly explodeTime: number;
	readonly flying: boolean;
}

const MOUSE: EnemyKind = {
	speed: 35, dashSpeed: 95, sightX: 110, sightY: 26, attackRange: 21,
	attackTime: 4 / 14, hitTime: 2 / 14, hurtTime: 4 / 12, explodeTime: 6 / 12,
	flying: false,
};

const BIRD: EnemyKind = {
	speed: 30, dashSpeed: 85, sightX: 120, sightY: 90, attackRange: 21,
	attackTime: 8 / 14, hitTime: 4 / 14, hurtTime: 4 / 12, explodeTime: 7 / 12,
	flying: true,
};

const CATERPILLAR: EnemyKind = {
	speed: 14, dashSpeed: 55, sightX: 70, sightY: 22, attackRange: 22,
	attackTime: 9 / 14, hitTime: 6 / 14, hurtTime: 5 / 12, explodeTime: 8 / 12,
	flying: false,
};

const ENEMY_ATTACK_COOLDOWN = 0.9;
const ENEMY_STOP_SHORT = 2;    // в погоне встаёт на attackRange − это, тела не касаются
const ENEMY_ATTACK_REACH = 8;
const ENEMY_BODY_HEIGHT = 18;

const BIRD_BOB = 3;
const BIRD_BOB_SPEED = 3;
const BIRD_CLIMB_SPEED = 40;
const BIRD_DIVE_HEIGHT = 6;
const BIRD_LEASH = 60;

// Детали

const PART_DROP_FRAMES = 16;
const PART_REST_FRAME = 16;
const PART_GLEAM_FRAME = 17;
const PART_DROP_FPS = 14;
const PART_PICKUP_FRAME = 11;
const PART_GLEAM_PERIOD = 1.8;
const PART_GLEAM_TIME = 0.15;
const PART_WIDTH = 18.65;
const PART_HEIGHT = 18.46;

// Столкновение с врагом

const CONTACT_COOLDOWN = 0.7;
const CONTACT_PUSH_X = 120;
const CONTACT_PUSH_Y = -170;
const ATTACK_PUSH_X = 170;
const ATTACK_PUSH_Y = -210;

// Босс: заводной медведь

const BOSS_WAKE_FRAMES = [0.16, 0.16, 0.16, 0.4];
const BOSS_WINDUP_FRAMES = [0.1, 0.1, 0.12, 0.18];
const BOSS_CLAW_FRAMES = [0.16, 0.12, 0.1, 0.16, 0.16, 0.24];
const BOSS_THROW_FRAMES = [0.14, 0.12, 0.12, 0.12, 0.12, 0.16, 0.3];
const BOSS_LAND_FRAMES = [0.12, 0.2, 0.3];
const BOSS_HURT_FRAMES = [0.12, 0.2];
const BOSS_DIE_FRAMES = [0.2, 0.2, 0.2, 0.24];
const BOSS_IDLE_FPS = 6;

const BOSS_WAKE_DISTANCE = 110;
// Медведь ходит по опоре, на которой стоит на макете (сцена, полка, пол), но
// не дальше BOSS_ROAM от места старта. Границы считаются на старте уровня —
// босса можно перетаскивать в редакторе куда угодно. BOSS_SNAP — насколько
// ноги могут быть ниже верха опоры (неточно поставили мышкой).
const BOSS_ROAM = 110;
const BOSS_SNAP = 8;
const BOSS_REST = 1.0;
const BOSS_REST_ENRAGED = 0.55;
const BOSS_CLAW_RANGE = 60;
const BOSS_LUNGE_SPEED = 150;
const BOSS_CLAW_REACH = 28;
const BOSS_CLAW_WIDTH = 34;
const BOSS_CLAW_HEIGHT = 36;
const BOSS_CROUCH = 0.25;
const BOSS_JUMP_SPEED = 380;
const BOSS_GRAVITY = 1000;
const BOSS_SHOCK_RADIUS = 75;
const BOSS_PUSH_X = 170;
const BOSS_PUSH_Y = -230;
const BOSS_HIT_OPACITY = 0.55;
const BOSS_FADE_BACK = 1.6;

// Кубики

const CUBE_SPEED = 95;
const CUBE_TURN_RATE = 2.2;
const CUBE_LIFETIME = 4;
const CUBE_FADE = 0.5;
const CUBE_SPAWN_X = 20;
const CUBE_SPAWN_Y = 30;

// Шар из медведя

const CORE_HOVER = 14;
const CORE_BOB = 2;
const CORE_BOB_SPEED = 3;

// Пружины

const SPRING_LAUNCH = 575;
const SPRING_TOLERANCE = 3;

// Точка возрождения: там, где Олли стоит на макете при старте уровня.

const FALL_MARGIN = 80;

// Уровни по порядку: у каждого свой макет, переход — у правого края. Имена —
// как у макетов. Пока собрана только детская: мастерские и двор ждут
// дизайна. Новые макеты дописывай сюда (и в LEVELS в
// .claude/design/build_locations.py).
const LEVELS: ReadonlyArray<string> = [
	"Детская 1", "Детская 2", "Детская 3",
];

// Выход в следующий уровень — стимпанк-портал в конце макета: Олли входит в
// арку, и загружается следующий. Пока на уровне жив босс, портал заперт и
// полупрозрачен. Нет портала — выход у правого края, как раньше.
const EXIT_MARGIN = 14;   // стена — сразу за краем: полхитбокса Олли 9 + запас
const PORTAL_LOCKED_OPACITY = 0.35;
const PORTAL_INNER = 0.3; // проём арки — доля ширины портала от центра в каждую сторону

// Состояние

let runtime!: IRuntime;

let olly!: InstanceType.Olly;

const heldKeys = new Set<string>();

let facing: 1 | -1 = 1;

let swing: InstanceType.Wrench | null = null;
let swingCooldownLeft = 0;
let swingLifeLeft = 0;
let swingWindupLeft = 0;

interface OneShot
{
	readonly name: string;
	timeLeft: number;
	restart: boolean;
}

let oneShot: OneShot | null = null;
const swingHitUids = new Set<number>();

let contactCooldownLeft = 0;

type EnemyMode = "patrol" | "dash" | "attack" | "hurt" | "dying";

interface EnemyState
{
	readonly instance: EnemyInstance;
	readonly kind: EnemyKind;
	readonly startX: number;
	readonly startY: number;
	mode: EnemyMode;
	direction: 1 | -1;
	timeLeft: number;
	cooldownLeft: number;
	hitDone: boolean;
	readonly bobShift: number;
}

const enemyStates = new Map<number, EnemyState>();

interface PartState
{
	age: number;
	readonly gleamShift: number;
}

const partStates = new Map<number, PartState>();

type BossPhase = "sleep" | "wake" | "rest" | "windup" | "claw" | "leap" | "throw"
	| "hurt" | "dead";

type BossAttack = "claw" | "leap" | "throw";

let boss: InstanceType.Boss | null = null;
let bossPhase: BossPhase = "sleep";
let bossTime = 0;
let bossFacing: 1 | -1 = -1;
let bossFloorY = 0;
let bossArenaLeft = 0;
let bossArenaRight = 0;
let bossNextAttack: BossAttack = "leap";
let bossRangedToggle = false;
let bossVX = 0;
let bossVY = 0;
let bossAirborne = false;
let bossStruck = false;
let bossMaxHealth = 1;

interface CubeState
{
	vx: number;
	vy: number;
	life: number;
}

const cubeStates = new Map<number, CubeState>();

let core: InstanceType.Core | null = null;
let coreBaseY = 0;

// Уровень и арена
let spawnX = 0;
let spawnY = 0;
let leavingLevel = false;
let portal: InstanceType.Portal | null = null;     // goToLayout вызван, новый макет ещё не начался

// Запуск

// Точка входа Construct: ждём, пока загрузится макет.
runOnStartup(async (rt: IRuntime) =>
{
	rt.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(rt));
});

// Подписывается на ввод и кадр (один раз на всю игру) и запускает первый уровень.
function OnBeforeProjectStart(rt: IRuntime): void
{
	runtime = rt;

	StartLevel();
	// Каждый следующий макет-уровень начинается заново: свой Олли, враги, арена.
	runtime.addEventListener("beforeanylayoutstart", () => StartLevel());

	runtime.addEventListener("keydown", (e: KeyboardEvent) => heldKeys.add(e.code));
	runtime.addEventListener("keyup", (e: KeyboardEvent) => heldKeys.delete(e.code));
	runtime.addEventListener("mousedown", (e: MouseEvent) => OnMouseDown(e));

	// Без фокуса keyup не придёт, и клавиша залипнет.
	runtime.addEventListener("suspend", () => heldKeys.clear());

	runtime.addEventListener("tick", () => Tick());
}

// Находит Олли, врагов, босса и ворота арены на текущем макете и сбрасывает
// всё, что осталось от прошлого уровня. Вызывается на старте каждого макета.
function StartLevel(): void
{
	olly = RequireFirstInstance(runtime.objects.Olly, "Olly");
	spawnX = olly.x;
	spawnY = olly.y;

	enemyStates.clear();
	partStates.clear();
	cubeStates.clear();
	swingHitUids.clear();
	swing = null;
	swingCooldownLeft = swingLifeLeft = swingWindupLeft = 0;
	oneShot = null;
	contactCooldownLeft = 0;
	facing = 1;

	boss = null;
	bossPhase = "sleep";
	bossTime = 0;
	bossFacing = -1;
	bossNextAttack = "leap";
	bossRangedToggle = false;
	bossVX = bossVY = 0;
	bossAirborne = false;
	bossStruck = false;
	core = null;

	leavingLevel = false;
	portal = runtime.objects.Portal.getFirstInstance();

	CollectEnemyStates();
	CollectBoss();

	runtime.layout.scale = CAMERA_ZOOM;
	SnapCameraToOlly();
}

// Первый экземпляр типа; если его нет на макете — ошибка.
function RequireFirstInstance<T extends IWorldInstance>(
	objectType: IObjectType<T>, name: string): T
{
	const instance = objectType.getFirstInstance();

	if (!instance)
		throw new Error(`На макете нет экземпляра «${name}»`);

	return instance;
}

// Запоминает медведя, его пол и полное здоровье.
function CollectBoss(): void
{
	boss = runtime.objects.Boss.getFirstInstance();

	if (!boss)
		return;

	// Опора под ногами: на неё ставим и по ней водим.
	const support = SupportBelow(boss.x, boss.y - BOSS_SNAP);
	bossFloorY = support ? support.y : boss.y;
	boss.y = bossFloorY;

	const half = boss.width / 2;
	const left = support ? support.x + half : -Infinity;
	const right = support ? support.x + support.width - half : Infinity;
	bossArenaLeft = Math.max(left, boss.x - BOSS_ROAM);
	bossArenaRight = Math.min(right, boss.x + BOSS_ROAM);

	if (bossArenaLeft > bossArenaRight)
		bossArenaLeft = bossArenaRight = boss.x;

	bossMaxHealth = boss.instVars.health;
	SetBossFrame("Idle", 0);
}

// Заводит состояние на каждую мышь, птицу и гусеницу с макета.
function CollectEnemyStates(): void
{
	const kinds: ReadonlyArray<[IObjectType<EnemyInstance>, EnemyKind]> = [
		[runtime.objects.Mouse, MOUSE],
		[runtime.objects.Bird, BIRD],
		[runtime.objects.Caterpillar, CATERPILLAR],
	];

	for (const [objectType, kind] of kinds)
		for (const instance of objectType.instances())
			enemyStates.set(instance.uid, {
				instance, kind,
				startX: instance.x, startY: instance.y,
				mode: "patrol", direction: -1,
				timeLeft: 0, cooldownLeft: 0, hitDone: false,
				bobShift: Math.random() * Math.PI * 2,
			});
}

// Кадр

// Каждый кадр: Олли, враги, босс, детали, анимация, камера — в этом порядке.
function Tick(): void
{
	if (leavingLevel)
		return;

	const dt = runtime.dt;

	UpdateMovement();
	UpdateSprings();
	UpdateFacing();
	UpdateSwing(dt);
	UpdateEnemies(dt);
	UpdateBoss(dt);
	UpdateCubes(dt);
	UpdateContactDamage(dt);
	UpdateParts(dt);
	UpdateCore();
	UpdateAnimation(dt);
	CheckFellOutOfLevel();
	UpdateCamera();
	CheckLevelExit();
}

// Движение Олли

// Передаёт зажатые A/D/пробел в поведение Platform.
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

// Запоминает, куда смотрит Олли, по направлению бега.
function UpdateFacing(): void
{
	const vectorX = olly.behaviors.Platform.vectorX;

	if (vectorX > 1)
		facing = 1;
	else if (vectorX < -1)
		facing = -1;
}

// Пружины

// Олли стоит на пружине — подбрасывает его вверх.
function UpdateSprings(): void
{
	const platform = olly.behaviors.Platform;

	if (!platform.isOnFloor)
		return;

	const ollyHalfWidth = OLLY_HITBOX_WIDTH / 2;

	for (const spring of runtime.objects.Spring.instances())
	{
		const top = spring.y - spring.height;
		const onTop = Math.abs(olly.y - top) <= SPRING_TOLERANCE;
		const above = Math.abs(olly.x - spring.x) < spring.width / 2 + ollyHalfWidth;

		if (onTop && above)
		{
			platform.setVector(platform.vectorX, -SPRING_LAUNCH);
			return;
		}
	}
}

// Удар ключом

// ЛКМ — удар ключом.
function OnMouseDown(e: MouseEvent): void
{
	if (e.button === MOUSE_LEFT_BUTTON)
		TrySwing();
}

// Начинает удар, если прошла пауза: анимация сразу, попадание позже.
function TrySwing(): void
{
	if (swingCooldownLeft > 0)
		return;

	swingCooldownLeft = SWING_COOLDOWN;
	swingWindupLeft = SWING_WINDUP;
	PlayOneShot("Attack1", ATTACK_ANIMATION_TIME);
}

// Создаёт невидимую зону попадания ключа.
function SpawnSwing(): void
{
	swingLifeLeft = SWING_DURATION;
	swingHitUids.clear();

	swing = runtime.objects.Wrench.createInstance(GAME_LAYER, olly.x, olly.y);
	swing.setSize(SWING_FRONT + SWING_BACK, SWING_TOP + SWING_BOTTOM);

	swing.isVisible = false;
	AimSwing();
}

// Держит зону удара перед Олли.
function AimSwing(): void
{
	if (!swing)
		return;

	swing.x = olly.x + facing * (SWING_FRONT - SWING_BACK) / 2;
	swing.y = olly.y - (SWING_TOP - SWING_BOTTOM) / 2;
}

// Ведёт удар: замах, зона попадания, её исчезновение.
function UpdateSwing(dt: number): void
{
	if (swingCooldownLeft > 0)
		swingCooldownLeft -= dt;

	if (swingWindupLeft > 0)
	{
		swingWindupLeft -= dt;

		if (swingWindupLeft <= 0)
			SpawnSwing();
	}

	const current = swing;

	if (!current)
		return;

	AimSwing();
	DamageEnemiesInSwing();
	DamageBossInSwing();

	swingLifeLeft -= dt;

	if (swingLifeLeft <= 0)
	{
		current.destroy();
		swing = null;
	}
}

// Бьёт врагов в зоне удара — каждого не больше раза за замах.
function DamageEnemiesInSwing(): void
{
	if (!swing)
		return;

	for (const state of enemyStates.values())
	{
		const enemy = state.instance;

		if (state.mode === "dying" || swingHitUids.has(enemy.uid) || !swing.testOverlap(enemy))
			continue;

		swingHitUids.add(enemy.uid);
		enemy.instVars.health -= 1;

		if (enemy.instVars.health > 0)
			HurtEnemy(state);
		else
			KillEnemy(state);
	}
}

// Враг получил ключом, но жив: отлетает и на миг замирает.
function HurtEnemy(state: EnemyState): void
{
	const [left, right] = EnemyBounds(state);
	const enemy = state.instance;

	enemy.x = Clamp(enemy.x + facing * SWING_KNOCKBACK, left, right);

	state.mode = "hurt";
	state.timeLeft = state.kind.hurtTime;
	state.direction = facing > 0 ? -1 : 1;
	SetEnemyAnimation(state, "beginning");
}

// Враг разбит: взрыв и выпавшая деталь.
function KillEnemy(state: EnemyState): void
{
	const enemy = state.instance;

	state.mode = "dying";
	state.timeLeft = state.kind.explodeTime;
	enemy.isCollisionEnabled = false;
	enemy.setAnimation("Explode", "beginning");

	DropPart(enemy.x, state.kind.flying ? FloorBelow(enemy.x, enemy.y) : enemy.y);
}

// Детали

// Создаёт гайку или болт на полу.
function DropPart(x: number, y: number): void
{
	const part = runtime.objects.Part.createInstance(GAME_LAYER, x, y);
	part.setSize(PART_WIDTH, PART_HEIGHT);
	part.setAnimation(Math.random() < 0.5 ? "Nut" : "Bolt");
	part.animationFrame = 0;

	part.moveAdjacentToInstance(olly, false);

	partStates.set(part.uid, { age: 0, gleamShift: Math.random() * PART_GLEAM_PERIOD });
}

// Анимация подбора — только если Олли стоит.
function PlayPickup(): void
{
	const platform = olly.behaviors.Platform;

	if (platform.isOnFloor && Math.abs(platform.vectorX) <= ANIM_MOVE_THRESHOLD)
		PlayOneShot("Pickup", PICKUP_ANIMATION_TIME);
}

// Анимирует падение и блеск деталей, Олли подбирает их касанием.
function UpdateParts(dt: number): void
{
	for (const part of runtime.objects.Part.getAllInstances())
	{
		const state = partStates.get(part.uid);

		if (!state)
			continue;

		state.age += dt;

		const dropFrame = Math.floor(state.age * PART_DROP_FPS);
		let frame = dropFrame;

		if (dropFrame >= PART_DROP_FRAMES)
		{
			const phase = (state.age + state.gleamShift) % PART_GLEAM_PERIOD;
			frame = phase < PART_GLEAM_TIME ? PART_GLEAM_FRAME : PART_REST_FRAME;
		}

		if (part.animationFrame !== frame)
			part.animationFrame = frame;

		if (dropFrame >= PART_PICKUP_FRAME && part.testOverlap(olly))
		{
			partStates.delete(part.uid);
			part.destroy();
			PlayPickup();
		}
	}
}

// Враги

// У каждого врага режим: patrol → dash (погоня) → attack, после ключа — hurt,
// при гибели — dying (взрыв).

// Ведёт каждого врага по его режиму и удаляет взорвавшихся.
function UpdateEnemies(dt: number): void
{
	for (const state of enemyStates.values())
	{
		state.cooldownLeft = Math.max(0, state.cooldownLeft - dt);

		switch (state.mode)
		{
			case "patrol":
				PatrolEnemy(state, dt);
				break;

			case "dash":
				DashEnemy(state, dt);
				break;

			case "attack":
				AttackWithEnemy(state, dt);
				break;

			case "hurt":
				state.timeLeft -= dt;
				if (state.timeLeft <= 0)
					state.mode = "dash";
				break;

			case "dying":
				state.timeLeft -= dt;
				if (state.timeLeft <= 0)
				{
					enemyStates.delete(state.instance.uid);
					state.instance.destroy();
				}
				continue;
		}

		SetEnemyAnimation(state, "current-frame");
	}
}

// Ходит туда-сюда у стартовой точки, птица покачивается; заметил Олли — в погоню.
function PatrolEnemy(state: EnemyState, dt: number): void
{
	const enemy = state.instance;
	const range = enemy.instVars.patrolRange;

	enemy.x += state.direction * state.kind.speed * dt;

	const offset = enemy.x - state.startX;

	if (offset > range)
		state.direction = -1;
	else if (offset < -range)
		state.direction = 1;

	if (state.kind.flying)
	{
		const bob = Math.sin(runtime.gameTime * BIRD_BOB_SPEED + state.bobShift) * BIRD_BOB;
		FlyEnemyToward(state, state.startY + bob, BIRD_CLIMB_SPEED, dt);
	}

	if (SeesOlly(state))
		state.mode = "dash";
}

// Бежит к Олли; подбежал — атакует, потерял из виду — патруль.
function DashEnemy(state: EnemyState, dt: number): void
{
	const enemy = state.instance;
	const kind = state.kind;

	if (!SeesOlly(state))
	{
		state.mode = "patrol";
		return;
	}

	const dx = olly.x - enemy.x;
	state.direction = dx >= 0 ? 1 : -1;

	if (kind.flying)
		FlyEnemyToward(state, olly.y - BIRD_DIVE_HEIGHT, kind.dashSpeed, dt);

	const closeEnough = Math.abs(dx) <= kind.attackRange;
	const level = !kind.flying || Math.abs(olly.y - BIRD_DIVE_HEIGHT - enemy.y) < ENEMY_BODY_HEIGHT / 2;

	if (closeEnough && level && state.cooldownLeft <= 0)
	{
		StartEnemyAttack(state);
		return;
	}

	const [left, right] = EnemyBounds(state);
	// Останавливается на расстоянии удара, не влезая в Олли: раньше подбегал
	// вплотную, и касание ранило раньше, чем начиналась атака.
	const step = Math.min(kind.dashSpeed * dt, Math.max(0, Math.abs(dx) - (kind.attackRange - ENEMY_STOP_SHORT)));
	enemy.x = Clamp(enemy.x + state.direction * step, left, right);
}

// Начинает атаку в сторону Олли.
function StartEnemyAttack(state: EnemyState): void
{
	state.mode = "attack";
	state.timeLeft = state.kind.attackTime;
	state.hitDone = false;
	state.direction = olly.x >= state.instance.x ? 1 : -1;
	SetEnemyAnimation(state, "beginning");
}

// Наносит удар в нужный момент анимации, если Олли ещё рядом.
function AttackWithEnemy(state: EnemyState, dt: number): void
{
	const enemy = state.instance;
	const kind = state.kind;

	state.timeLeft -= dt;

	if (!state.hitDone && kind.attackTime - state.timeLeft >= kind.hitTime)
	{
		state.hitDone = true;

		const dx = olly.x - enemy.x;
		const dy = olly.y - enemy.y;
		const inFront = dx * state.direction >= -OLLY_HITBOX_WIDTH / 2;
		const inReach = Math.abs(dx) <= kind.attackRange + ENEMY_ATTACK_REACH;
		const sameLevel = dy > -ENEMY_BODY_HEIGHT && dy < OLLY_HITBOX_HEIGHT;

		if (inFront && inReach && sameLevel)
			HurtOlly(enemy.x, ATTACK_PUSH_X, ATTACK_PUSH_Y);
	}

	if (state.timeLeft <= 0)
	{
		state.cooldownLeft = ENEMY_ATTACK_COOLDOWN;
		state.mode = "dash";
	}
}

// Видит ли враг Олли: по расстоянию и в пределах своего участка.
function SeesOlly(state: EnemyState): boolean
{
	const enemy = state.instance;
	const kind = state.kind;
	const dx = olly.x - enemy.x;
	const dy = olly.y - enemy.y;

	if (Math.abs(dx) > kind.sightX)
		return false;

	const [left, right] = EnemyBounds(state);

	if (olly.x < left - kind.attackRange || olly.x > right + kind.attackRange)
		return false;

	if (kind.flying)
		return dy > -kind.sightY / 3 && dy < kind.sightY;

	return Math.abs(dy) < kind.sightY;
}

// Границы участка врага по X; птице добавлен поводок.
function EnemyBounds(state: EnemyState): [number, number]
{
	const reach = state.instance.instVars.patrolRange + (state.kind.flying ? BIRD_LEASH : 0);
	return [state.startX - reach, state.startX + reach];
}

// Сдвигает птицу по вертикали к нужной высоте.
function FlyEnemyToward(state: EnemyState, targetY: number, speed: number, dt: number): void
{
	const enemy = state.instance;
	const step = speed * dt;
	enemy.y += Clamp(targetY - enemy.y, -step, step);
}

// Ставит анимацию по режиму и направлению врага.
function SetEnemyAnimation(state: EnemyState, from: "beginning" | "current-frame"): void
{
	const action = state.mode === "patrol" ? "Run"
		: state.mode === "dash" ? "Dash"
		: state.mode === "attack" ? "Attack"
		: "Hurt";
	const name = action + (state.direction > 0 ? "R" : "L");
	const enemy = state.instance;

	if (from === "beginning")
		enemy.setAnimation(name, "beginning");
	else if (enemy.animationName !== name)
	{
		const sameAction = enemy.animationName.slice(0, -1) === action;
		enemy.setAnimation(name, sameAction ? "current-frame" : "beginning");
	}
}

// Верх ближайшей опоры под точкой.
function FloorBelow(x: number, y: number): number
{
	const support = SupportBelow(x, y);
	return support ? support.y : runtime.layout.height;
}

// Ближайшая опора (Ground или Shelf) под точкой: её верх не выше y.
function SupportBelow(x: number, y: number): IWorldInstance | null
{
	const supports: ReadonlyArray<IObjectType<IWorldInstance>> =
		[runtime.objects.Ground, runtime.objects.Shelf];
	let best: IWorldInstance | null = null;

	// У Ground и Shelf точка привязки — левый верхний угол.
	for (const objectType of supports)
		for (const support of objectType.instances())
			if (x >= support.x && x <= support.x + support.width && support.y >= y
				&& (!best || support.y < best.y))
				best = support;

	return best;
}

// Касание врага ранит Олли.
function UpdateContactDamage(dt: number): void
{
	if (contactCooldownLeft > 0)
	{
		contactCooldownLeft -= dt;
		return;
	}

	for (const state of enemyStates.values())
	{
		if (state.mode !== "dying" && state.instance.testOverlap(olly))
		{
			HurtOlly(state.instance.x);
			return;
		}
	}
}

// Урон Олли от любого источника: отброс, анимация, короткая неуязвимость.
function HurtOlly(fromX: number, pushX = CONTACT_PUSH_X, pushY = CONTACT_PUSH_Y): void
{
	if (contactCooldownLeft > 0)
		return;

	contactCooldownLeft = CONTACT_COOLDOWN;

	const away = Math.sign(olly.x - fromX) || 1;
	olly.behaviors.Platform.setVector(away * pushX, pushY);
	PlayOneShot("Hurt", HURT_ANIMATION_TIME);
}

// Босс: заводной медведь

// Спит, пока Олли не подойдёт. Потом по кругу: отдых → замах → атака.
// Олли рядом — когти, иначе по очереди прыжок с волной и бросок кубиков.

// Ведёт медведя по фазам, держит в арене, ранит Олли касанием.
function UpdateBoss(dt: number): void
{
	if (!boss)
		return;

	bossTime += dt;

	if (boss.opacity < 1)
		boss.opacity = Math.min(1, boss.opacity + dt * BOSS_FADE_BACK);

	switch (bossPhase)
	{
		case "sleep": UpdateBossSleep(); break;
		case "wake": UpdateBossTimed("Windup", BOSS_WAKE_FRAMES, "rest"); break;
		case "rest": UpdateBossRest(); break;
		case "windup": UpdateBossTimed("Windup", BOSS_WINDUP_FRAMES, bossNextAttack); break;
		case "claw": UpdateBossClaw(dt); break;
		case "leap": UpdateBossLeap(dt); break;
		case "throw": UpdateBossThrow(); break;
		case "hurt": UpdateBossTimed("Hurt", BOSS_HURT_FRAMES, "rest"); break;
		case "dead": UpdateBossDead(); break;
	}

	boss.x = Clamp(boss.x, bossArenaLeft, bossArenaRight);

	// Тело ранит только в атаке: на отдыхе и замахе к медведю можно подойти
	// и бить. Раньше касание отбрасывало Олли всегда, а ключ доставал лишь из
	// полоски в 14 px между «далеко» и «коснулся».
	if (bossPhase === "claw" || bossPhase === "leap")
		UpdateBossContact();
}

// Переключает фазу медведя и сбрасывает её таймер.
function SetBossPhase(phase: BossPhase): void
{
	bossPhase = phase;
	bossTime = 0;
	bossStruck = false;
}

// Ставит анимацию и кадр медведя с учётом взгляда.
function SetBossFrame(name: string, frame: number): void
{
	if (!boss)
		return;

	const animation = bossFacing > 0 ? name : name + "L";

	if (boss.animationName !== animation)
		boss.setAnimation(animation, "beginning");

	if (boss.animationFrame !== frame)
		boss.animationFrame = frame;
}

// Номер кадра по времени фазы; -1 — фаза кончилась.
function FrameAt(durations: readonly number[], time: number): number
{
	let end = 0;

	for (let i = 0; i < durations.length; i++)
	{
		end += durations[i];

		if (time < end)
			return i;
	}

	return -1;
}

// Проигрывает кадры фазы и переходит к следующей.
function UpdateBossTimed(name: string, durations: readonly number[], next: BossPhase): void
{
	const frame = FrameAt(durations, bossTime);

	if (frame < 0)
	{
		SetBossPhase(next);
		return;
	}

	SetBossFrame(name, frame);
}

// Поворачивает медведя к Олли.
function FaceOlly(): void
{
	if (boss)
		bossFacing = olly.x >= boss.x ? 1 : -1;
}

// Здоровья меньше половины — медведь злее.
function IsBossEnraged(): boolean
{
	return boss !== null && boss.instVars.health * 2 <= bossMaxHealth;
}

// Спит, пока Олли не подойдёт к арене.
function UpdateBossSleep(): void
{
	if (!boss)
		return;

	SetBossFrame("Idle", Math.floor(bossTime * BOSS_IDLE_FPS) % 6);

	if (olly.x > bossArenaLeft - BOSS_WAKE_DISTANCE && olly.x < bossArenaRight + BOSS_WAKE_DISTANCE)
	{
		FaceOlly();
		SetBossPhase("wake");
	}
}

// Отдыхает лицом к Олли и выбирает следующую атаку.
function UpdateBossRest(): void
{
	if (!boss)
		return;

	FaceOlly();
	SetBossFrame("Idle", Math.floor(bossTime * BOSS_IDLE_FPS) % 6);

	if (bossTime < (IsBossEnraged() ? BOSS_REST_ENRAGED : BOSS_REST))
		return;

	if (Math.abs(olly.x - boss.x) < BOSS_CLAW_RANGE)
		bossNextAttack = "claw";
	else
	{
		bossRangedToggle = !bossRangedToggle;
		bossNextAttack = bossRangedToggle ? "leap" : "throw";
	}

	SetBossPhase("windup");
}

// Удар когтями: выпад и зона урона перед лапами.
function UpdateBossClaw(dt: number): void
{
	if (!boss)
		return;

	const frame = FrameAt(BOSS_CLAW_FRAMES, bossTime);

	if (frame < 0)
	{
		SetBossPhase("rest");
		return;
	}

	SetBossFrame("Attack1", frame);

	if (frame >= 1 && frame <= 3)
		boss.x += bossFacing * BOSS_LUNGE_SPEED * dt;

	if (frame >= 3 && frame <= 4 && !bossStruck)
	{
		const cx = boss.x + bossFacing * BOSS_CLAW_REACH;
		const top = boss.y - BOSS_CLAW_HEIGHT;

		if (OllyInBox(cx - BOSS_CLAW_WIDTH / 2, top, cx + BOSS_CLAW_WIDTH / 2, boss.y))
		{
			bossStruck = true;
			HurtOlly(boss.x, BOSS_PUSH_X, BOSS_PUSH_Y);
		}
	}
}

// Прыжок к Олли: присед, полёт, приземление с ударной волной.
function UpdateBossLeap(dt: number): void
{
	if (!boss)
		return;

	if (!bossAirborne && !bossStruck)
	{
		SetBossFrame("Attack2", 0);

		if (bossTime < BOSS_CROUCH)
			return;

		const target = Clamp(olly.x, bossArenaLeft, bossArenaRight);
		const airTime = 2 * BOSS_JUMP_SPEED / BOSS_GRAVITY;
		bossVX = (target - boss.x) / airTime;
		bossVY = -BOSS_JUMP_SPEED;
		bossAirborne = true;
		bossFacing = bossVX >= 0 ? 1 : -1;
	}

	if (bossAirborne)
	{
		bossVY += BOSS_GRAVITY * dt;
		boss.x += bossVX * dt;
		boss.y += bossVY * dt;
		SetBossFrame("Attack2", bossVY < 0 ? 1 : 2);

		if (boss.y < bossFloorY)
			return;

		boss.y = bossFloorY;
		bossAirborne = false;
		bossVX = 0;
		bossStruck = true;
		bossTime = 0;

		const platform = olly.behaviors.Platform;

		if (platform.isOnFloor && Math.abs(olly.y - bossFloorY) < 4
			&& Math.abs(olly.x - boss.x) < BOSS_SHOCK_RADIUS)
			HurtOlly(boss.x, BOSS_PUSH_X, BOSS_PUSH_Y);
	}

	const frame = FrameAt(BOSS_LAND_FRAMES, bossTime);

	if (frame < 0)
	{
		SetBossPhase("rest");
		return;
	}

	SetBossFrame("Attack2", 3 + frame);
}

// Бросок кубиков, в ярости — двух.
function UpdateBossThrow(): void
{
	if (!boss)
		return;

	const frame = FrameAt(BOSS_THROW_FRAMES, bossTime);

	if (frame < 0)
	{
		SetBossPhase("rest");
		return;
	}

	SetBossFrame("Attack3", frame);

	if (frame === 5 && !bossStruck)
	{
		bossStruck = true;
		ThrowCube(-0.9);

		if (IsBossEnraged())
			ThrowCube(-0.35);
	}
}

// Создаёт самонаводящийся кубик.
function ThrowCube(lift: number): void
{
	if (!boss)
		return;

	const cube = runtime.objects.Cube.createInstance(
		GAME_LAYER,
		boss.x + bossFacing * CUBE_SPAWN_X,
		boss.y - CUBE_SPAWN_Y
	);

	const angle = bossFacing > 0 ? lift : Math.PI - lift;
	cubeStates.set(cube.uid, {
		vx: Math.cos(angle) * CUBE_SPEED,
		vy: Math.sin(angle) * CUBE_SPEED,
		life: CUBE_LIFETIME,
	});
}

// Анимация гибели, затем выпадает шар.
function UpdateBossDead(): void
{
	if (!boss)
		return;

	const frame = FrameAt(BOSS_DIE_FRAMES, bossTime);
	SetBossFrame("Die", frame < 0 ? BOSS_DIE_FRAMES.length : frame);

	if (frame < 0 && !bossStruck)
	{
		bossStruck = true;
		DropCore();
	}
}

// Создаёт шар над полом на месте медведя.
function DropCore(): void
{
	if (!boss)
		return;

	coreBaseY = bossFloorY - CORE_HOVER;
	core = runtime.objects.Core.createInstance(GAME_LAYER, boss.x - bossFacing * 10, coreBaseY);
}

// Ключ попал по медведю: минус здоровье и вспышка; во время отдыха — анимация урона.
function DamageBossInSwing(): void
{
	if (!boss || !swing || bossPhase === "sleep" || bossPhase === "dead")
		return;

	if (swingHitUids.has(boss.uid) || !swing.testOverlap(boss))
		return;

	swingHitUids.add(boss.uid);
	boss.instVars.health -= 1;
	boss.opacity = BOSS_HIT_OPACITY;

	if (boss.instVars.health <= 0)
	{
		KillBoss();
		return;
	}

	if (bossPhase === "rest")
		SetBossPhase("hurt");
}

// Медведь побеждён: ставим на пол, убираем кубики.
function KillBoss(): void
{
	if (!boss)
		return;

	boss.opacity = 1;
	boss.y = bossFloorY;
	bossAirborne = false;
	bossVX = bossVY = 0;
	SetBossPhase("dead");

	for (const cube of runtime.objects.Cube.getAllInstances())
		cube.destroy();

	cubeStates.clear();
}

// Касание медведя ранит Олли.
function UpdateBossContact(): void
{
	if (boss && boss.testOverlap(olly))
		HurtOlly(boss.x, BOSS_PUSH_X, BOSS_PUSH_Y);
}

// Задевает ли хитбокс Олли прямоугольник.
function OllyInBox(left: number, top: number, right: number, bottom: number): boolean
{
	const half = OLLY_HITBOX_WIDTH / 2;

	return olly.x + half > left && olly.x - half < right
		&& olly.y > top && olly.y - OLLY_HITBOX_HEIGHT < bottom;
}

// Кубики летят к Олли и пропадают от ключа, Олли, пола или времени.
function UpdateCubes(dt: number): void
{
	for (const cube of runtime.objects.Cube.getAllInstances())
	{
		const state = cubeStates.get(cube.uid);

		if (!state)
			continue;

		const want = Math.atan2(olly.y - OLLY_HITBOX_HEIGHT / 2 - cube.y, olly.x - cube.x);
		const have = Math.atan2(state.vy, state.vx);
		let turn = want - have;
		turn = Math.atan2(Math.sin(turn), Math.cos(turn));
		const step = Clamp(turn, -CUBE_TURN_RATE * dt, CUBE_TURN_RATE * dt);
		state.vx = Math.cos(have + step) * CUBE_SPEED;
		state.vy = Math.sin(have + step) * CUBE_SPEED;

		cube.x += state.vx * dt;
		cube.y += state.vy * dt;
		state.life -= dt;
		cube.opacity = Clamp(state.life / CUBE_FADE, 0, 1);

		let gone = state.life <= 0;

		if (!gone && swing && swing.testOverlap(cube))
			gone = true;
		else if (!gone && cube.testOverlap(olly))
		{
			HurtOlly(cube.x);
			gone = true;
		}
		else if (!gone && runtime.collisions.testOverlapAny(cube, runtime.objects.Ground.instances()))
			gone = true;

		if (gone)
		{
			cubeStates.delete(cube.uid);
			cube.destroy();
		}
	}
}

// Шар покачивается, Олли подбирает его касанием.
function UpdateCore(): void
{
	const current = core;

	if (!current)
		return;

	current.y = coreBaseY + Math.sin(runtime.gameTime * CORE_BOB_SPEED) * CORE_BOB;

	if (!current.testOverlap(olly))
		return;

	current.destroy();
	core = null;
	PlayPickup();
}

// Анимация Олли

// Запускает разовую анимацию Олли: удар, урон, подбор.
function PlayOneShot(name: string, duration: number): void
{
	oneShot = { name, timeLeft: duration, restart: true };
}

// Выбирает анимацию Олли: разовая, прыжок, бег или стойка.
function UpdateAnimation(dt: number): void
{
	const platform = olly.behaviors.Platform;
	let name: string;
	let frame = -1;

	if (oneShot && !oneShot.restart)
	{
		oneShot.timeLeft -= dt;

		if (oneShot.timeLeft <= 0)
			oneShot = null;
	}

	if (oneShot)
		name = oneShot.name;
	else if (!platform.isOnFloor)
	{
		name = "Jump";
		frame = JumpFrame(platform.vectorY);
	}
	else if (Math.abs(platform.vectorX) > ANIM_MOVE_THRESHOLD)
		name = "Run";
	else
		name = "Idle";

	const animation = facing > 0 ? name : name + "L";
	const restart = oneShot !== null && oneShot.restart;

	if (oneShot)
		oneShot.restart = false;

	if (restart)
		olly.setAnimation(animation, "beginning");
	else if (olly.animationName !== animation)
	{
		const sameAction = olly.animationName.replace(/L$/, "") === name;
		olly.setAnimation(animation, sameAction ? "current-frame" : "beginning");
	}

	if (frame >= 0)
		olly.animationFrame = frame;
}

// Кадр прыжка по вертикальной скорости.
function JumpFrame(vectorY: number): number
{
	if (vectorY < JUMP_TAKEOFF_SPEED)
		return 1;

	if (vectorY < JUMP_RISE_SPEED)
		return 2;

	if (vectorY < JUMP_FALL_SPEED)
		return 3;

	return 4;
}

// Камера

// Плавно ведёт камеру за Олли.
function UpdateCamera(): void
{
	const [targetX, targetY] = GetCameraTarget();
	const layout = runtime.layout;

	const t = 1 - Math.exp(-CAMERA_SMOOTHING * runtime.dt);

	layout.scrollTo(
		layout.scrollX + (targetX - layout.scrollX) * t,
		layout.scrollY + (targetY - layout.scrollY) * t
	);
}

// Мгновенно ставит камеру на Олли.
function SnapCameraToOlly(): void
{
	const [x, y] = GetCameraTarget();
	runtime.layout.scrollTo(x, y);
}

// Куда смотреть камере: Олли чуть впереди и выше, в пределах макета.
function GetCameraTarget(): [number, number]
{
	const layout = runtime.layout;
	const [viewportWidth, viewportHeight] = runtime.getViewportSize();

	const visibleWidth = viewportWidth / layout.scale;
	const visibleHeight = viewportHeight / layout.scale;
	const halfWidth = visibleWidth / 2;
	const halfHeight = visibleHeight / 2;

	const x = olly.x + olly.behaviors.Platform.vectorX * CAMERA_LOOK_AHEAD;
	const y = olly.y - visibleHeight * CAMERA_HEIGHT_BIAS;
	return [
		Clamp(x, halfWidth, layout.width - halfWidth),
		Clamp(y, halfHeight, layout.height - halfHeight),
	];
}

// Упал ниже карты — возвращаем на старт.
function CheckFellOutOfLevel(): void
{
	if (olly.y < runtime.layout.height + FALL_MARGIN)
		return;

	olly.x = spawnX;
	olly.y = spawnY;
	olly.behaviors.Platform.setVector(0, 0);

	SnapCameraToOlly();
}

// Олли вошёл в портал (или, если портала нет, дошёл до правого края) —
// следующий уровень. Если на уровне есть босс — только когда он побеждён.
function CheckLevelExit(): void
{
	const open = !boss || bossPhase === "dead";

	if (portal)
		portal.opacity = open ? 1 : PORTAL_LOCKED_OPACITY;

	if (!open)
		return;

	if (portal)
	{
		const half = portal.width * PORTAL_INNER;

		if (!OllyInBox(portal.x - half, portal.y - portal.height, portal.x + half, portal.y))
			return;
	}
	else if (olly.x < runtime.layout.width - EXIT_MARGIN)
		return;

	const next = LEVELS.indexOf(runtime.layout.name) + 1;

	if (next <= 0 || next >= LEVELS.length)
		return;

	leavingLevel = true;
	runtime.goToLayout(LEVELS[next]);
}

// Утилиты

// Ограничивает число отрезком.
function Clamp(value: number, min: number, max: number): number
{
	return Math.min(Math.max(value, min), max);
}
