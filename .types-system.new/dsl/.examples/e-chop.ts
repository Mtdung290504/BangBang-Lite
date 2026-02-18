import { CreateContextImpactor } from '../entity/skill/actions/create-attack.type-entities';

export const def: CreateContextImpactor = {
	action: '@create-entity',
	strategy: {
		type: 'targeting',
		method: 'active-lock',
	},
	from: 'target-pos',
	impact: {
		actions: [
			{
				'affected-faction': ['ally', 'self'],
				'target-effect': [
					{
						action: '@apply:effect',
						'effect-manifest': {
							visual: { sprite: { key: 'e-chop-buff' } },
							description: 'Hồi 201% x Tấn Công HP và tăng tốc 50% trong 2s',
							duration: 2,
							impacts: [
								{
									'on-start': [
										{
											action: '@apply:recover-hp',
											'value-from': { attribute: 'attack-power', of: 'self', value: '201%' },
										},
									],
									'modify-stats': [{ 'value-from': { attribute: 'movement-speed', value: '50%' } }],
									visual: { sprite: { key: 'e-chop-effect' }, duration: 'sprite-end' },
								},
							],
						},
					},
				],
			},
		],
	},
};
