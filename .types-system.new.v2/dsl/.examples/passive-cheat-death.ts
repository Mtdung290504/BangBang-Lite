import type { DefineSkill } from '../entity/skill/manifest.types';

type CheatDeathEffects = 'cheat-death-listen' | 'cheat-death-invincible';

export const CheatDeathManifest: DefineSkill<CheatDeathEffects> = {
	effects: {
		'cheat-death-listen': {
			unremovable: true,
			impacts: {
				'on-event': {
					'on-destroyed': [
						{
							action: '@apply:modify-countdown',
							slot: ['s1', 's2'],
							value: '-100%',
						},
						{
							action: '@apply:effect',
							effect: 'cheat-death-invincible',
						},
					],
				},
			},
		},
		'cheat-death-invincible': {
			duration: 1.5,
			impacts: {
				states: { type: 'invincible' },
			},
		},
	},
	manifest: {
		passives: [
			{
				cooldown: 30,
				actions: {
					action: '@create-entity',
					from: 'self-pos',
					movement: { 'move-type': 'straight', speed: { value: 0 } },
					collider: { shape: { type: 'circle', size: { radius: 1 } } },
					impact: {
						actions: {
							'affected-faction': ['self'],
							'self-action': { action: '@apply:effect', effect: 'cheat-death-listen' },
						},
					},
				},
			},
		],
		'normal-attack': { type: 'normal', actions: [] },
		s1: { type: 'normal', actions: [] },
		s2: { type: 'normal', actions: [] },
		ultimate: { type: 'normal', actions: [] },
	},
};
