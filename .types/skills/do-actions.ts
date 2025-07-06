import type { EffectReference, SkillComponent, VarReference } from '../skill-manifest.js';

interface DashAction {
	name: '@do-action:dash';
	components: SkillComponent[];
	'on-hit'?: {
		enemies?: {
			'apply-on-enemies': (EffectReference | VarReference)[];
			'apply-on-self': (EffectReference | VarReference)[];
		};
		allies?: {
			'apply-on-allies': (EffectReference | VarReference)[];
			'apply-on-self': (EffectReference | VarReference)[];
		};
	};
}

export type DoActions = DashAction;
