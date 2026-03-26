import { CreateImpactor, CreateTargetedImpactor } from '../entity/skill/actions/create-attack.type-entities';
import { DefineSkill } from '../entity/skill/manifest.types';

type MyEffects = 'buff-speed' | 'heal-self' | 'damage-enemy' | 'wait-phase';

const skill_1: CreateImpactor<MyEffects> = {
	action: '@create-entity',
	'limit-range': '100%',
	movement: { 'move-type': 'straight', speed: { value: '17.5u' } },
	from: 'self-pos',

	collider: {
		shape: { type: 'circle', size: { radius: 20 } },
		'pierce-targets': ['architecture', 'self', 'ally'],
	},

	visual: { sprite: { key: 'normal-attack' } },

	impact: {
		actions: [
			{
				'affected-faction': ['ally', 'self'],
				'target-effect': [{ action: '@apply:effect', effect: 'buff-speed' }],
			},
			{
				'self-action': [{ action: '@apply:effect', effect: 'heal-self' }],
				'target-effect': [{ action: '@apply:effect', effect: 'damage-enemy' }],
			},
		],
	},
};

const skill_2: CreateTargetedImpactor<MyEffects> = {
	action: '@create-entity',
	strategy: { type: 'targeting' },
	from: 'mouse-pos',
	movement: { 'move-type': 'straight', speed: { value: '100%' } },
	impact: {
		actions: [
			{
				'self-action': [{ action: '@do-act:change-phase', method: 'to-phase:3' }],
				'target-effect': [{ action: '@apply:effect', effect: 'damage-enemy' }],
			},
		],
	},
	collider: { shape: { type: 'circle', size: { radius: 100 } } },
};

export const MySkillManifest: DefineSkill<MyEffects> = {
	effects: {
		'buff-speed': {
			duration: 2,
			impacts: { 'modify-stats': { attribute: 'movement-speed', value: '50%' } },
		},
		'heal-self': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => ctx.self['attack-power'] * 1.5,
				},
			},
		},
		'damage-enemy': {
			impacts: {
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
					},
				],
			},
		},
		'wait-phase': {
			duration: 2,
			impacts: {
				'modify-states': { type: 'silent', slot: 'all' },
			},
		},
	},
	manifest: {
		'normal-attack': {
			type: 'normal',
			actions: skill_1,
		},
		s1: {
			type: 'normal',
			actions: skill_2,
		},
		s2: {
			type: 'normal',
			actions: skill_1,
		},
		ultimate: {
			type: 'normal',
			actions: skill_2,
		},
	},
};
