import { CreateTargetedImpactor } from '../entity/skill/actions/create-attack.type-entities';

// Ví dụ về khai báo skill đơn action, không cần bỏ trong mảng
export default {
	action: '@create-entity',
	strategy: { type: 'targeting', method: 'active-lock' },
	from: 'target-pos',
	impact: {
		actions: {
			'affected-faction': ['ally', 'self'],
			'target-effect': {
				action: '@apply:effect',
				manifest: {
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
		},
	},
} satisfies CreateTargetedImpactor;
