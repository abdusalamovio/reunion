// Определения типов Construct для скриптов проекта. НЕ УДАЛЯТЬ.
//
// Construct эти определения не генерирует — проект открывали в редакторе, и
// ни этой папки, ни tsconfig.json после этого не появилось. В свежем клоне без
// них не запускались скрипты, поэтому оба файла версионируются: проект должен
// работать сразу после скачивания.
//
// Здесь описано только то, что реально используется в scripts/основной.ts, и
// описано упрощённо. Это не замена официальным типам: настоящие строже и
// знают про конкретные объекты проекта.
//
// Если Construct когда-нибудь напишет свои определения рядом и редактор начнёт
// ругаться на «Duplicate identifier» — убирать надо тот файл, который Construct
// создал сам, а этот оставить, пока не станет ясно, что клон работает без него.

declare function runOnStartup(
	callback: (runtime: IRuntime) => void | Promise<void>): void;

interface IBehaviorInstance { }

interface IPlatformBehaviorInstance extends IBehaviorInstance
{
	simulateControl(control: "left" | "right" | "jump"): void;
	setVector(vectorX: number, vectorY: number): void;
	getVector(): [number, number];
	vectorX: number;
	vectorY: number;
	readonly speed: number;
	readonly isOnFloor: boolean;
	readonly isJumping: boolean;
	readonly isFalling: boolean;
	isEnabled: boolean;
	isIgnoringInput: boolean;
	isDefaultControls: boolean;
	maxSpeed: number;
	jumpStrength: number;
	gravity: number;
}

interface ISolidBehaviorInstance extends IBehaviorInstance
{
	isEnabled: boolean;
}

interface IInstance
{
	readonly uid: number;
	readonly instVars: Record<string, any>;
	readonly behaviors: Record<string, any>;
	destroy(): void;
}

interface IWorldInstance extends IInstance
{
	x: number;
	y: number;
	width: number;
	height: number;
	angle: number;
	angleDegrees: number;
	opacity: number;
	isVisible: boolean;
	isCollisionEnabled: boolean;
	setPosition(x: number, y: number): void;
	setSize(width: number, height: number): void;
	getSize(): [number, number];
	testOverlap(other: IWorldInstance): boolean;
	testOverlapSolid(): IWorldInstance | null;
}

interface ISpriteInstance extends IWorldInstance
{
	animationFrame: number;
	readonly animationName: string;
	setAnimation(name: string, from?: "beginning" | "current-frame"): void;
}

interface ITextInstance extends IWorldInstance
{
	text: string;
	sizePt: number;
	isBold: boolean;
	isItalic: boolean;
}

interface IObjectType<T = IInstance>
{
	readonly name: string;
	getFirstInstance(): T | null;
	getAllInstances(): T[];
	instances(): Generator<T>;
	createInstance(layerNameOrIndex: string | number, x: number, y: number): T;
}

interface ILayer
{
	readonly name: string;
	readonly index: number;
	isVisible: boolean;
	backgroundColor: [number, number, number];
}

interface ILayout
{
	readonly name: string;
	readonly index: number;
	width: number;
	height: number;
	scrollX: number;
	scrollY: number;
	scrollTo(x: number, y: number): void;
	getScrollPosition(): [number, number];
	getLayer(nameOrIndex: string | number): ILayer | null;
}

interface ICollisionEngine
{
	testOverlap(a: IWorldInstance, b: IWorldInstance): boolean;
	testOverlapAny(instance: IWorldInstance,
		others: Iterable<IWorldInstance>): IWorldInstance | null;
	testOverlapSolid(instance: IWorldInstance): IWorldInstance | null;
}

interface IRuntime
{
	readonly dt: number;
	readonly gameTime: number;
	readonly layout: ILayout;
	readonly collisions: ICollisionEngine;
	readonly objects: IProjectObjects;
	readonly globalVars: Record<string, any>;
	readonly viewportWidth: number;
	readonly viewportHeight: number;
	getViewportSize(): [number, number];
	getLayout(nameOrIndex: string | number): ILayout;
	goToLayout(nameOrIndex: string | number): void;
	addEventListener(name: string, callback: (e?: any) => void): void;
	removeEventListener(name: string, callback: (e?: any) => void): void;
}

// Construct типизирует runtime.objects по каждому объекту проекта. Если
// добавите новый тип объекта — допишите его и сюда, иначе обращение к нему
// будет ошибкой.
interface IProjectObjects
{
	readonly Olly: IObjectType<InstanceType.Olly>;
	readonly Enemy: IObjectType<InstanceType.Enemy>;
	readonly Wrench: IObjectType<InstanceType.Wrench>;
	readonly Ground: IObjectType<InstanceType.Ground>;
	readonly BgFar: IObjectType<InstanceType.BgFar>;
	readonly BgNear: IObjectType<InstanceType.BgNear>;
	readonly Fog: IObjectType<InstanceType.Fog>;
	readonly Bolt: IObjectType<InstanceType.Bolt>;
	readonly Bracket: IObjectType<InstanceType.Bracket>;
	readonly HudPlate: IObjectType<InstanceType.HudPlate>;
	readonly HUD: IObjectType<InstanceType.HUD>;
}

// Construct объявляет пространство имён с типом на каждый объект проекта.
declare namespace InstanceType
{
	type Olly = ISpriteInstance & {
		behaviors: { Platform: IPlatformBehaviorInstance };
	};

	type Enemy = ISpriteInstance & {
		instVars: { health: number; patrolRange: number };
	};

	type Wrench = ISpriteInstance;
	type Ground = ISpriteInstance & { behaviors: { Solid: ISolidBehaviorInstance } };
	type BgFar = ISpriteInstance;
	type BgNear = ISpriteInstance;
	type Fog = ISpriteInstance;
	type Bolt = ISpriteInstance;
	type Bracket = ISpriteInstance;
	type HudPlate = ISpriteInstance;
	type HUD = ITextInstance;
}
