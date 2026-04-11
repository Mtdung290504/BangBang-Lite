import { DefineSkill } from '../entity/skill/manifest.types';

type EChopEffects = 'e-chop-buff';

export const EChopManifest: DefineSkill<EChopEffects> = {
	effects: {
		'e-chop-buff': {
			visual: { sprite: { key: 'e-chop-buff' } },
			description: 'Hồi 201% x Tấn Công HP và tăng tốc 50% trong 2s',
			duration: 2,
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => ctx.self['attack-power'] * 2.01,
				},
				'modify-stats': { attribute: 'movement-speed', value: '50%' },
				visual: { sprite: { key: 'e-chop-effect' } },
			},
		},
	},
	manifest: {
		'normal-attack': {
			type: 'normal',
			actions: {
				action: '@create-entity',
				strategy: { type: 'targeting', method: 'active-lock' },
				from: 'target-pos',
				movement: { 'move-type': 'straight', speed: { value: 0 } },
				collider: { shape: { type: 'circle', size: { radius: 1 } } },
				impact: {
					actions: {
						'affected-faction': ['ally', 'self'],
						'target-effect': { action: '@apply:effect', effect: 'e-chop-buff' },
					},
				},
			},
		},
		s1: { type: 'normal', actions: [] },
		s2: { type: 'normal', actions: [] },
		ultimate: { type: 'normal', actions: [] },
	},
};
