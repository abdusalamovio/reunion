const C3 = self.C3;
self.C3_GetObjectRefTable = function () {
	return [
		C3.Plugins.Sprite,
		C3.Behaviors.Platform,
		C3.Behaviors.solid,
		C3.Plugins.Text
	];
};
self.C3_JsPropNameTable = [
	{Platform: 0},
	{Olly: 0},
	{Solid: 0},
	{Ground: 0},
	{health: 0},
	{patrolRange: 0},
	{Enemy: 0},
	{Wrench: 0},
	{HUD: 0},
	{BgFar: 0},
	{BgNear: 0},
	{Fog: 0},
	{Bolt: 0},
	{Bracket: 0},
	{HudPlate: 0}
];

self.InstanceType = {
	Olly: class extends self.ISpriteInstance {},
	Ground: class extends self.ISpriteInstance {},
	Enemy: class extends self.ISpriteInstance {},
	Wrench: class extends self.ISpriteInstance {},
	HUD: class extends self.ITextInstance {},
	BgFar: class extends self.ISpriteInstance {},
	BgNear: class extends self.ISpriteInstance {},
	Fog: class extends self.ISpriteInstance {},
	Bolt: class extends self.ISpriteInstance {},
	Bracket: class extends self.ISpriteInstance {},
	HudPlate: class extends self.ISpriteInstance {}
}