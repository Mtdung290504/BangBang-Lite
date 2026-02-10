type DefaultNormalAttackSprite = 'normal-attack';
type DefaultPhysicNormalAttackHitSprite = 'physic-hit';
type DefaultEnergyNormalAttackHitSprite = 'energy-hit';

export type SpriteKey =
	| DefaultNormalAttackSprite
	| DefaultPhysicNormalAttackHitSprite
	| DefaultEnergyNormalAttackHitSprite
	| (string & {});
