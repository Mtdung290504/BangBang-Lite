import { DefineSkill } from '../entity/skill/manifest.types';

type StarEffects = 'star-inc-fire-rate' | 'star-dec-mov-spd';

export const StarManifest: DefineSkill<StarEffects> = {
	effects: {
		'star-inc-fire-rate': {
			name: 'star-inc-fire-rate',
			duration: 2,
			description: 'Tăng tốc độ 5%, tốc công 10% trong 2s, tối đa cộng dồn 4 tầng',
			visual: { sprite: { key: 'star-inc-fire-rate-icon' } },
			impacts: [1, 2, 3, 4].map((stack) => ({
				'modify-stats': {
					attribute: 'fire-rate',
					value: `${10 * stack}%`,
				},
			})),
		},
		'star-dec-mov-spd': {
			name: 'star-dec-mov-spd',
			duration: 2,
			description: 'Giảm tốc 10% và chịu ST đốt, tối đa cộng dồn 4 tầng',
			visual: { sprite: { key: 'star-dec-mov-spd-icon' } },
			impacts: [1, 2, 3, 4].map((stack) => ({
				visual: { sprite: { key: `star-burn-effect-${stack}` } },
				'modify-stats': {
					attribute: 'movement-speed',
					value: `${-15 * stack}%`,
				},
				'on-interval': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: `${-20 * stack}%`,
				},
			})),
		},
	},
	manifest: {
		'normal-attack': {
			type: 'normal',
			actions: {
				action: '@create-entity',
				from: 'self-pos',
				'flying-object-props': {},
				movement: { 'move-type': 'straight', speed: { value: '150%' } },
				collider: {
					shape: { type: 'rectangle', size: { width: 35, height: 15 } },
				},
				impact: {
					actions: [
						// Đánh trúng đích gây ST, cộng dồn tăng tốc độ, tốc công
						{
							'self-action': { action: '@apply:effect', effect: 'star-inc-fire-rate' },
							'target-effect': {
								action: '@apply:modifier',
								attribute: 'current-HP',
								value: (ctx) => -ctx.self['attack-power'] * 0.8,
							},
						},
						// Trúng tank địch gây hiệu ứng thiêu đốt và làm chậm
						{
							'affected-faction': ['enemy'],
							'target-effect': { action: '@apply:effect', effect: 'star-dec-mov-spd' },
						},
					],
				},
			},
		},
		s1: { type: 'normal', actions: [] },
		s2: { type: 'normal', actions: [] },
		ultimate: { type: 'normal', actions: [] },
	},
};
