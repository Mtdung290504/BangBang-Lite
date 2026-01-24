import { CreateNonContextImpactor } from './entity/skill/actions/create-attack.type-entities';

// Example
const skill_1: CreateNonContextImpactor = {
	action: '@create-entity',
	targeting: { require: 'direction' },

	// Tầm, hướng bay, xuất phát từ đâu
	'limit-range': '100%',
	movement: { 'move-type': 'straight', speed: 17.5 },
	from: 'self-pos',

	collider: {
		shape: { type: 'circle', size: { radius: 20 } },
		pierce: ['architecture', 'self', 'ally'],
	},

	visual: { sprite: { key: 'normal-attack' } },

	impact: {
		// interval: 0.5,
		actions: [
			{
				// Trúng đồng minh/bản thân giúp tăng 50% tốc chạy trong 2s
				'affected-faction': ['ally', 'self'],
				'target-effect': [
					{
						action: '@apply-effect:modify-stat',
						'value-from': { attribute: 'movement-speed', value: '50%' },
						duration: 2,
					},
				],
			},
			{
				// Trúng mục tiêu không phải phe mình thì không cần khai báo 'affected-faction'
				'self-action': [
					{
						// Bản thân hồi HP
						action: '@apply-effect:recover-hp',
						'value-from': { attribute: 'attack-power', value: '150%', of: 'self' },
					},
				],
				'target-effect': [
					{
						// Gây 150% tấn công
						action: '@apply-effect:dealt-damage',
						'value-from': { attribute: 'attack-power', value: '175%', of: 'self' },
						'is-main-damage': true,
					},
					{
						// Kèm ST thực = 5% HP đã mất của mục tiêu
						action: '@apply-effect:dealt-damage',
						'value-from': { attribute: 'lost-HP', of: 'target', value: '5%' },
						'damage-type': 'true',
						'text-delta-angle': 1,
					},
				],
			},
		],
		visual: { sprite: { key: 'normal-attack-impact' } },
	},
};
