import { CreateContextImpactor, CreateNonContextImpactor } from '../entity/skill/actions/create-attack.type-entities';

const skill_1: CreateNonContextImpactor = {
	action: '@create-entity',
	// Có thể trống
	// strategy: { type: 'direction', 'delta-angle': 0 },

	// Tầm, hướng bay, xuất phát từ đâu
	'limit-range': '100%',
	movement: { 'move-type': 'straight', speed: { value: '17.5u' } },
	from: 'self-pos',

	collider: {
		shape: { type: 'circle', size: { radius: 20 } },
		pierce: ['architecture', 'self', 'ally'],
	},

	visual: { sprite: { key: 'normal-attack' } },

	impact: {
		// interval: 0.5,
		visual: { sprite: { key: 'normal-attack-impact' } },
		actions: [
			{
				// Trúng đồng minh/bản thân giúp tăng 50% tốc chạy trong 2s
				'affected-faction': ['ally', 'self'],
				'target-effect': [
					{
						action: '@apply:effect',
						'effect-manifest': {
							duration: 2,
							impacts: [
								{
									'modify-stats': [{ 'value-from': { attribute: 'movement-speed', value: '50%' } }],
								},
							],
						},
					},
				],
			},
			{
				// Trúng mục tiêu không phải phe mình thì không cần khai báo 'affected-faction'
				'self-action': [
					{
						// Bản thân hồi HP
						action: '@apply:effect',
						'effect-manifest': {
							impacts: [
								{
									'on-start': [
										{
											action: '@apply:recover-hp',
											'value-from': { attribute: 'attack-power', value: '150%', of: 'self' },
										},
									],
								},
							],
						},
					},
				],
				'target-effect': [
					{
						action: '@apply:effect',
						'effect-manifest': {
							impacts: [
								{
									'on-start': [
										{
											action: '@apply:dealt-damage',
											'value-from': { attribute: 'attack-power', value: '175%', of: 'self' },
											'not-main-damage': true,
										},
										{
											action: '@apply:dealt-damage',
											'value-from': { attribute: 'lost-HP', of: 'target', value: '5%' },
											'damage-type': 'true',
											'text-delta-angle': 1,
										},
									],
								},
							],
						},
					},
				],
			},
		],
	},
};

const skill_2: CreateContextImpactor = {
	action: '@create-entity',

	strategy: { type: 'targeting' },
	// strategy: { type: 'targeting', method: 'weakest' },

	from: 'mouse-pos',
	movement: { 'move-type': 'straight', speed: { value: '100%' } },
	impact: {
		actions: [
			{
				'self-action': [{ action: '@do-act:change-phase', method: 'to-phase:3' }],
				'target-effect': [
					{
						action: '@apply:effect',
						'effect-manifest': {
							impacts: [
								{
									'on-start': [
										{
											action: '@apply:dealt-damage',
											'value-from': { attribute: 'attack-power', of: 'self', value: '150%' },
										},
									],
								},
							],
						},
					},
				],
			},
		],
	},
	collider: { shape: { type: 'circle', size: { radius: 100 } } },
};
