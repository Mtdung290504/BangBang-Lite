import { DefineSkill } from '../entity/skill/manifest.types';
import { energyDamageReduction } from '../../builder/templates/combat/reduction-policies';

type FalconEffects =
	| 'hit-count'
	| 'enhance-pierce'
	| 'enhanced-normal-attack'
	| 'normal-damage'
	| 'wait-recharge'
	| 'listen-energy-empty';

export const FalconManifest: DefineSkill<FalconEffects> = {
	manifest: {
		passives: [
			{
				type: 'normal',
				cooldown: Infinity,
				description: 'Khi hết năng lượng, tự hồi lại sau 1s',
				actions: {
					action: '@create-entity',
					from: 'self-pos',
					strategy: { type: 'targeting', method: 'self' },
					movement: { 'move-type': 'tracking' },
					collider: { shape: { type: 'circle', size: { radius: 10 } } },
					impact: {
						actions: {
							'self-action': [
								{ action: '@apply:effect', effect: 'listen-energy-empty' },
								{ action: '@apply:effect', effect: 'enhanced-normal-attack' },
							],
						},
					},
				},
			},
		],

		'normal-attack': {
			type: 'normal',
			'resource-consumption': { energy: '20u' },
			actions: {
				action: '@create-entity',
				from: 'self-pos',
				'limit-range': (ctx) => ctx.self['fire-range'],
				'flying-object-props': {},
				visual: { sprite: { key: 'normal-attack' } },
				movement: { 'move-type': 'straight', speed: { value: '100%', of: 'flight-speed' } },
				collider: { shape: { type: 'rectangle', size: { width: 100, height: 35 } } },
				impact: {
					actions: {
						'target-effect': { action: '@apply:effect', effect: 'normal-damage' },
						'self-action': { action: '@apply:effect', effect: 'hit-count' },
					},
				},
			},
		},
		s1: { type: 'normal', actions: [] },
		s2: { type: 'normal', actions: [] },
		ultimate: { type: 'normal', actions: [] },
	},

	effects: {
		'hit-count': {
			unremovable: true,
			duration: 4,
			description: 'Đánh thường trúng địch 4 lần trong thời gian ngắn để cường hóa xuyên giáp',
			impacts: [
				{ visual: { sprite: { key: 'hit-count:1' } } },
				{ visual: { sprite: { key: 'hit-count:2' } } },
				{ visual: { sprite: { key: 'hit-count:3' } } },
				{
					visual: { sprite: { key: 'hit-count:4' } },
					'on-start': { action: '@apply:clean-effect', filter: 'id:hit-count' },
					'on-end': [{ action: '@apply:effect', effect: 'enhance-pierce' }],
				},
			],
		},
		'enhance-pierce': {
			unremovable: true,
			duration: 4,
			description: 'Cường hóa xuyên giáp',
			impacts: {
				visual: { sprite: { key: 'enhance-pierce' } },
				'modify-stats': [{ attribute: 'penetration-percent', value: '200u' }],
				'modify-states': [{ type: 'immune', filter: 'id:hit-count' }],
			},
		},
		'enhanced-normal-attack': {
			description: 'Tăng 50% tốc công và tốc độ đạn bay',
			unremovable: true,
			duration: Infinity,
			impacts: {
				'modify-stats': [
					{ attribute: 'fire-rate', value: '50%' },
					{ attribute: 'flight-speed', value: '50%' },
				],
			},
		},
		'normal-damage': {
			description: 'Gây sát thương năng lượng lên mục tiêu',
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.self['attack-power'],
					reductions: energyDamageReduction,
				},
			},
		},
		'wait-recharge': {
			unremovable: true,
			duration: 1,
			impacts: { 'on-end': { action: '@apply:modifier', attribute: 'current-energy-point', value: '100%' } },
		},
		'listen-energy-empty': {
			unremovable: true,
			impacts: {
				'on-event': { 'on-energy-empty': { action: '@apply:effect', effect: 'wait-recharge' } },
			},
		},
	},
};
