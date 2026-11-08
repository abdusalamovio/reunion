const C3 = self.C3;
self.C3_GetObjectRefTable = function () {
	return [
		C3.Plugins.Sprite,
		C3.Behaviors.Platform,
		C3.Behaviors.solid,
		C3.Behaviors.jumpthru
	];
};
self.C3_JsPropNameTable = [
	{Platform: 0},
	{Olly: 0},
	{Solid: 0},
	{Ground: 0},
	{Wrench: 0},
	{JumpThru: 0},
	{Shelf: 0},
	{Spring: 0},
	{Part: 0},
	{health: 0},
	{arenaLeft: 0},
	{arenaRight: 0},
	{Boss: 0},
	{Cube: 0},
	{Core: 0},
	{patrolRange: 0},
	{Mouse: 0},
	{Bird: 0},
	{Caterpillar: 0},
	{Deco: 0}
];

self.InstanceType = {
	Olly: class extends self.ISpriteInstance {},
	Ground: class extends self.ISpriteInstance {},
	Wrench: class extends self.ISpriteInstance {},
	Shelf: class extends self.ISpriteInstance {},
	Spring: class extends self.ISpriteInstance {},
	Part: class extends self.ISpriteInstance {},
	Boss: class extends self.ISpriteInstance {},
	Cube: class extends self.ISpriteInstance {},
	Core: class extends self.ISpriteInstance {},
	Mouse: class extends self.ISpriteInstance {},
	Bird: class extends self.ISpriteInstance {},
	Caterpillar: class extends self.ISpriteInstance {},
	Deco: class extends self.ISpriteInstance {}
}