import type { OrientationMethod, SkillComponent, VarReference } from '../skill-manifest.d.ts';

interface CreateProjectileAction {
	name: '@create:projectile';
	'init-value': {
		'orientation-method': Exclude<OrientationMethod, 'mouse-coordinates'>;
		'flight-range': number | 'inherit' | VarReference;
		'flight-speed': number | 'inherit' | VarReference;
	};
	components: SkillComponent[];
}

export type CreateActions = CreateProjectileAction;
