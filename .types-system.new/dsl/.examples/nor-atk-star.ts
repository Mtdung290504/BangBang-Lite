import { CreateImpactor } from '../entity/skill/actions/create-attack.type-entities';

export default {
	action: '@create-entity',
	'flying-object-props': {},

	// Đã mặc định, không cần khai báo thêm
	// visual: { sprite: { key: 'normal-attack' } },
	// strategy: { type: 'direction', 'delta-angle': 0 },
	// from: 'self-pos',
	// 'limit-range': '100%',
	// movement: { 'move-type': 'straight', speed: { value: '150%', of: 'flight-speed' } },
	movement: { 'move-type': 'straight', speed: { value: '150%' } },
	collider: {
		shape: { type: 'rectangle', size: { width: 35, height: 15 } },
	},
	impact: {
		visual: { sprite: { key: 'physic-hit' }, duration: 'sprite-end' },
		actions: [
			// Đánh trúng đích gây ST, cộng dồn tăng tốc độ, tốc công
			{
				'self-action': {
					action: '@apply:effect',
					manifest: {
						name: 'star-inc-fire-rate',
						duration: 2,
						description: 'Tăng tốc độ 5%, tốc công 10% trong 2s, tối đa cộng dồn 4 tầng',
						visual: { sprite: { key: 'star-inc-fire-rate-icon' } },
						impacts: [1, 2, 3, 4].map((stack) => ({
							'modify-stats': {
								'value-from': { attribute: 'fire-rate', of: 'self', value: `${10 * stack}%` },
							},
						})),
					},
				},

				'target-effect': {
					action: '@apply:effect',
					manifest: {
						description: 'Gây 80% x tấn công ST',
						impacts: {
							'on-start': {
								action: '@apply:dealt-damage',
								'value-from': { attribute: 'attack-power', value: '80%' },
							},
						},
					},
				},
			},

			// Trúng tank địch gây hiệu ứng thiêu đốt và làm chậm
			{
				'affected-faction': ['enemy'],
				'target-effect': {
					action: '@apply:effect',
					manifest: {
						name: 'star-dec-mov-spd',
						duration: 2,
						description: 'Giảm tốc 10% và chịu ST đốt, tối đa cộng dồn 4 tầng',
						visual: { sprite: { key: 'star-dec-mov-spd-icon' } },
						impacts: [1, 2, 3, 4].map((stack) => ({
							visual: { sprite: { key: `star-burn-effect-${stack}` } },
							'modify-stats': {
								'value-from': {
									attribute: 'movement-speed',
									of: 'self',
									value: `${-15 * stack}%`,
								},
							},
							'on-interval': {
								action: '@apply:dealt-damage',
								'value-from': {
									attribute: 'attack-power',
									of: 'self',
									value: `${20 * stack}%`,
								},
								'not-main-damage': true,
								'text-delta-angle': 1,
							},
						})),
					},
				},
			},
		],
	},
} satisfies CreateImpactor;
