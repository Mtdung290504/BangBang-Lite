import type { SkillManifest } from '../entity/skill/.type-entities.ts';
import { SkillEntry } from '../entity/skill/active.type-entities';

const normalAttack: SkillEntry = {
	type: 'normal',
	'resource-consumption': { energy: '20u' },
	actions: {
		action: '@create-entity',
		'limit-range': '528u',
		'flying-object-props': {},
		visual: { sprite: { key: 'normal-attack' } },
		movement: { 'move-type': 'straight', speed: { value: '100%', of: 'flight-speed' } },
		collider: { shape: { type: 'rectangle', size: { width: 100, height: 35 } } },
		impact: {
			actions: {
				'target-effect': {
					action: '@apply:effect',
					manifest: {
						impacts: {
							'on-start': {
								action: '@apply:modifier',
								attribute: 'current-HP',
								value: (ctx) => -ctx.self['attack-power'] * 1.5,
								reductions: [(value, ctx) => value - ctx.target['physical-armor']],
							},
						},
					},
				},
			},
		},
	},
};

export default {
	'normal-attack': normalAttack,
	s1: normalAttack,
	s2: normalAttack,
	ultimate: normalAttack,
} satisfies SkillManifest;
