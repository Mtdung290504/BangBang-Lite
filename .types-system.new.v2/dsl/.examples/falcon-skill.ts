import { DefineSkill } from '../entity/skill/manifest.types';

type FalconEffects = 'normal-damage' | 'wait-recharge' | 'listen-energy-empty';

export const FalconManifest: DefineSkill<FalconEffects> = {
	effects: {
		'normal-damage': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.self['attack-power'] * 1.5,
					reductions: [(value, ctx) => value - ctx.target['physical-armor']],
				},
			},
		},
		'wait-recharge': {
			unremovable: true,
			impacts: { 'on-end': { action: '@apply:modifier', attribute: 'current-energy-point', value: '100%' } },
		},
		'listen-energy-empty': {
			unremovable: true,
			impacts: {
				'on-event': {
					'on-energy-empty': { action: '@apply:effect', effect: 'wait-recharge' },
				},
			},
		},
	},
	manifest: {
		passives: [
			{
				cooldown: Infinity,
				actions: {
					action: '@create-entity',
					from: 'self-pos',
					collider: { shape: { type: 'circle', size: { radius: 10 } } },
					impact: {
						actions: {
							'self-action': { action: '@apply:effect', effect: 'listen-energy-empty' },
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
				'limit-range': '528u',
				'flying-object-props': {},
				visual: { sprite: { key: 'normal-attack' } },
				movement: { 'move-type': 'straight', speed: { value: '100%', of: 'flight-speed' } },
				collider: { shape: { type: 'rectangle', size: { width: 100, height: 35 } } },
				impact: {
					actions: {
						'target-effect': { action: '@apply:effect', effect: 'normal-damage' },
					},
				},
			},
		},
		s1: { type: 'normal', actions: [] },
		s2: { type: 'normal', actions: [] },
		ultimate: { type: 'normal', actions: [] },
	},
};
