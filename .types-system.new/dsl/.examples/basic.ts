import { CreateImpactor, CreateTargetedImpactor } from '../entity/skill/actions/create-attack.type-entities';

const skill_1: CreateImpactor = {
	action: '@create-entity',
	// Có thể trống
	// strategy: { type: 'direction', 'delta-angle': 0 },

	// Tầm, hướng bay, xuất phát từ đâu
	'limit-range': '100%',
	movement: { 'move-type': 'straight', speed: { value: '17.5u' } },
	from: 'self-pos',

	collider: {
		shape: { type: 'circle', size: { radius: 20 } },
		'pierce-targets': ['architecture', 'self', 'ally'],
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
						action: '@apply:effect',
						manifest: {
							duration: 2,
							impacts: [
								{
									'modify-stats': [{ attribute: 'movement-speed', value: '50%' }],
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
						manifest: {
							impacts: [
								{
									'on-start': [
										{
											action: '@apply:modifier',
											attribute: 'current-HP',
											value: (ctx) => ctx.self['attack-power'] * 1.5,
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
						manifest: {
							impacts: [
								{
									'on-start': [
										{
											action: '@apply:modifier',
											attribute: 'current-HP',
											value: (ctx) => -ctx.self['attack-power'] * 1.75,
										},
										{
											action: '@apply:modifier',
											attribute: 'current-HP',
											value: (ctx) => -ctx.target['lost-HP'] * 0.05,
											// true damage — không có reductions
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

const skill_2: CreateTargetedImpactor = {
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
						manifest: {
							impacts: [
								{
									'on-start': [
										{
											action: '@apply:modifier',
											attribute: 'current-HP',
											value: (ctx) => -ctx.self['attack-power'] * 1.5,
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
