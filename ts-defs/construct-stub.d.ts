// Упрощённые типы Construct — только то, что использует scripts/main.ts.
// Нужны лишь для проверки типов, на запуск игры не влияют. Полные определения
// создаёт сам Construct: «Скрипты» → TypeScript ► Set up TypeScript.

declare function runOnStartup(
	callback: (runtime: IRuntime) => void | Promise<void>): void;

interface IPlatformBehaviorInstance
{
	simulateControl(control: "left" | "right" | "jump"): void;
	setVector(vectorX: number, vectorY: number): void;
	vectorX: number;
	vectorY: number;
	gravity: number;
	readonly isOnFloor: boolean;
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
	opacity: number;
	isVisible: boolean;
	isCollisionEnabled: boolean;
	setSize(width: number, height: number): void;
	testOverlap(other: IWorldInstance): boolean;
	moveAdjacentToInstance(other: IWorldInstance, isAfter: boolean): void;
}

interface ISpriteInstance extends IWorldInstance
{
	animationFrame: number;
	readonly animationName: string;
	setAnimation(name: string, from?: "beginning" | "current-frame"): void;
}

interface IObjectType<T = IInstance>
{
	getFirstInstance(): T | null;
	getAllInstances(): T[];
	instances(): Generator<T>;
	createInstance(layerNameOrIndex: string | number, x: number, y: number): T;
}

interface ILayout
{
	readonly name: string;
	width: number;
	height: number;
	scrollX: number;
	scrollY: number;
	scale: number;
	scrollTo(x: number, y: number): void;
}

interface ICollisionEngine
{
	testOverlapAny(instance: IWorldInstance,
		others: Iterable<IWorldInstance>): IWorldInstance | null;
}

interface IRuntime
{
	readonly dt: number;
	readonly gameTime: number;
	readonly layout: ILayout;
	readonly collisions: ICollisionEngine;
	readonly objects: IProjectObjects;
	getViewportSize(): [number, number];
	goToLayout(layoutNameOrIndex: string | number): void;
	addEventListener(name: string, callback: (e?: any) => void): void;
}

// Новый тип объекта в проекте — допишите его сюда и в InstanceType.
interface IProjectObjects
{
	readonly Olly: IObjectType<InstanceType.Olly>;
	readonly Mouse: IObjectType<InstanceType.Mouse>;
	readonly Bird: IObjectType<InstanceType.Bird>;
	readonly Caterpillar: IObjectType<InstanceType.Caterpillar>;
	readonly Wrench: IObjectType<InstanceType.Wrench>;
	readonly Part: IObjectType<InstanceType.Part>;
	readonly Boss: IObjectType<InstanceType.Boss>;
	readonly Cube: IObjectType<InstanceType.Cube>;
	readonly Core: IObjectType<InstanceType.Core>;
	readonly Deco: IObjectType<InstanceType.Deco>;
	readonly Ground: IObjectType<InstanceType.Ground>;
	readonly Wall: IObjectType<InstanceType.Wall>;
	readonly Portal: IObjectType<InstanceType.Portal>;
	readonly Shelf: IObjectType<InstanceType.Shelf>;
	readonly Spring: IObjectType<InstanceType.Spring>;
	readonly NurseryPlatformM: IObjectType<InstanceType.NurseryPlatformM>;
	readonly NurseryPlatformS: IObjectType<InstanceType.NurseryPlatformS>;
	readonly NurseryPlatformL: IObjectType<InstanceType.NurseryPlatformL>;
	readonly NurseryFloor: IObjectType<InstanceType.NurseryFloor>;
	readonly NurseryPedestal: IObjectType<InstanceType.NurseryPedestal>;
	readonly NurseryColumn: IObjectType<InstanceType.NurseryColumn>;
	readonly NurseryBackdrop3: IObjectType<InstanceType.NurseryBackdrop3>;
	readonly NurseryBackdrop2: IObjectType<InstanceType.NurseryBackdrop2>;
	readonly NurseryBackdrop1: IObjectType<InstanceType.NurseryBackdrop1>;
	readonly WorkshopBackdrop1: IObjectType<InstanceType.WorkshopBackdrop1>;
	readonly WorkshopFloor: IObjectType<InstanceType.WorkshopFloor>;
	readonly Ladder: IObjectType<InstanceType.Ladder>;
	readonly WorkshopPlatformM: IObjectType<InstanceType.WorkshopPlatformM>;
	readonly WorkshopPlatformL: IObjectType<InstanceType.WorkshopPlatformL>;
	readonly WorkshopPlatformGear: IObjectType<InstanceType.WorkshopPlatformGear>;
	readonly WorkshopPlatformS: IObjectType<InstanceType.WorkshopPlatformS>;
	readonly WorkshopPedestal: IObjectType<InstanceType.WorkshopPedestal>;
	readonly WorkshopBracket: IObjectType<InstanceType.WorkshopBracket>;
	readonly WorkshopColumn: IObjectType<InstanceType.WorkshopColumn>;
	readonly WorkshopBackdrop2: IObjectType<InstanceType.WorkshopBackdrop2>;
	readonly WorkshopBackdrop3: IObjectType<InstanceType.WorkshopBackdrop3>;
}

declare namespace InstanceType
{
	type Olly = ISpriteInstance & {
		behaviors: { Platform: IPlatformBehaviorInstance };
	};

	type Mouse = ISpriteInstance & {
		instVars: { health: number; patrolRange: number };
	};
	type Bird = Mouse;
	type Caterpillar = Mouse;

	type Boss = ISpriteInstance & {
		instVars: { health: number };
	};

	type Wrench = ISpriteInstance;
	type Part = ISpriteInstance;
	type Cube = ISpriteInstance;
	type Core = ISpriteInstance;
	type Deco = ISpriteInstance;
	type Ground = ISpriteInstance;
	type Wall = ISpriteInstance;
	type Portal = ISpriteInstance;
	type Shelf = ISpriteInstance;
	type Spring = ISpriteInstance;
	type NurseryPlatformM = ISpriteInstance;
	type NurseryPlatformS = ISpriteInstance;
	type NurseryPlatformL = ISpriteInstance;
	type NurseryFloor = ISpriteInstance;
	type NurseryPedestal = ISpriteInstance;
	type NurseryColumn = ISpriteInstance;
	type NurseryBackdrop3 = ISpriteInstance;
	type NurseryBackdrop2 = ISpriteInstance;
	type NurseryBackdrop1 = ISpriteInstance;
	type WorkshopBackdrop1 = ISpriteInstance;
	type WorkshopFloor = ISpriteInstance;
	type Ladder = ISpriteInstance;
	type WorkshopPlatformM = ISpriteInstance;
	type WorkshopPlatformL = ISpriteInstance;
	type WorkshopPlatformGear = ISpriteInstance;
	type WorkshopPlatformS = ISpriteInstance;
	type WorkshopPedestal = ISpriteInstance;
	type WorkshopBracket = ISpriteInstance;
	type WorkshopColumn = ISpriteInstance;
	type WorkshopBackdrop2 = ISpriteInstance;
	type WorkshopBackdrop3 = ISpriteInstance;
}
