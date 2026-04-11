import { DefineSkill } from '../entity/skill/manifest.types';
import { energyDamageReduction } from '../../builder/templates/combat/reduction-policies';

export const MagnetoManifest: DefineSkill = {
	manifest: {
		// NỘI TẠI: Hit dealt → tăng 50% tốc chạy 2s
		'innate-skill-speed': {
			triggers: ['on-ready'],
			cooldown: Infinity,
			actions: { action: '@apply:effect', effect: 'm-listen-hit' },
		},

		// S1 CD 6s: Area mouse pos, 2 lần hit (0.75s delay)
		// Dùng 1 effect stack: stack 1 = hit 1 (123% NL), stack 2 = hit 2 (175% NL + 10% max HP bonus chuẩn)
		s1: {
			visual: { sprite: { key: 's1' } },
			triggers: ['on-key:s1'],
			cooldown: 6,
			actions: [
				{
					action: '@create-entity',
					from: 'mouse-pos',
					collider: {
						shape: { type: 'circle', size: { radius: 200 } },
						'impact-capacity': Infinity,
					},
					impact: {
						manifest: {
							'target-effect': {
								action: '@apply:effect',
								effect: ['m-s1-h1', 'm-s1-combo'],
							},
						},
					},
				},
				{
					action: '@create-entity',
					from: 'mouse-pos',
					collider: {
						'warm-up': 0.75,
						shape: { type: 'circle', size: { radius: 200 } },
						'impact-capacity': Infinity,
					},
					impact: {
						manifest: {
							'target-effect': {
								action: '@apply:effect',
								effect: ['m-s1-h2', 'm-s1-combo'],
							},
						},
					},
				},
			],
		},

		// S2 CD 8s: Area warm-up 0.75s → hất tung 1.5s → ring impactor khi rớt (201% + choáng)
		s2: {
			visual: { sprite: { key: 's2' } },
			triggers: ['on-key:s2'],
			cooldown: 8,
			actions: {
				action: '@create-entity',
				from: 'mouse-pos',
				collider: {
					shape: { type: 'circle', size: { radius: 170 } },
					'impact-capacity': Infinity,
					'warm-up': 0.75,
				},
				impact: {
					manifest: {
						'target-effect': {
							action: '@apply:effect',
							effect: 'm-s2-levitate',
						},
					},
				},
			},
		},

		// S3 CD 25s: Vùng toàn map 35% NL mỗi 0.75s / 6s + aura r=360 random 1 địch 175% NL mỗi tick
		s3: {
			visual: { sprite: { key: 's3' } },
			triggers: ['on-key:ultimate'],
			cooldown: 25,
			actions: [
				{
					action: '@create-entity',
					from: 'caster-pos',
					duration: 6,
					collider: {
						shape: { type: 'circle', size: { radius: 10000 } },
						'impact-capacity': Infinity,
					},
					impact: {
						interval: 0.75,
						manifest: {
							'target-effect': {
								action: '@apply:effect',
								effect: 'm-s3-dot',
							},
						},
					},
				},
				// Aura r=360: mỗi tick tạo sub-impactor targeting random 1 địch trong range
				{
					action: '@create-entity',
					from: 'caster-pos',
					duration: 6,
					collider: {
						shape: { type: 'circle', size: { radius: 360 } },
						'impact-capacity': Infinity,
					},
					impact: {
						interval: 0.75,
						manifest: {
							'affected-faction': ['self'],
							actions: {
								action: '@create-entity',
								from: 'caster-pos',
								strategy: { type: 'targeting', method: 'random' },
								'limit-range': () => 360,
								movement: { 'move-type': 'straight', speed: () => Infinity },
								collider: { shape: { type: 'circle', size: { radius: 1 } } },
								impact: {
									manifest: {
										'target-effect': {
											action: '@apply:effect',
											effect: 'm-s3-random-hit',
										},
									},
								},
							},
						},
					},
				},
			],
		},
	},

	effects: {
		// Innate
		'm-listen-hit': {
			unremovable: true,
			impacts: {
				'on-event': {
					'on-hit-dealt-damage': {
						action: '@apply:effect',
						effect: 'm-speed-buff',
					},
				},
			},
		},
		'm-speed-buff': {
			duration: 2,
			impacts: {
				'modify-stats': {
					attribute: 'movement-speed',
					value: (ctx) => ctx.caster['movement-speed'] * 0.5,
				},
			},
		},

		// S1: 1 effect, 2 stack
		// Stack 1 (hit đầu): 123% NL
		// Stack 2 (hit 2): 175% NL + 10% max HP chuẩn (bonus vì đã có stack 1 → đã trúng lần đầu)
		'm-s1-h1': {
			impacts: {
				// Stack 1 — hit đầu
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 1.23,
					reductions: energyDamageReduction,
				},
			},
		},
		'm-s1-h2': {
			impacts: {
				// Stack 2 — hit thứ 2, tức là đã trúng cả 2 lần → gây full combo
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 1.75,
					reductions: energyDamageReduction,
				},
			},
		},
		'm-s1-combo': {
			duration: 1,
			impacts: [
				// Trúng 1 lần, không có gì
				{},
				// Stack 2 — hit thứ 2, tức là đã trúng cả 2 lần → gây full combo
				{
					'on-start': {
						// Bonus 10% max HP chuẩn (true damage)
						action: '@apply:modifier',
						attribute: 'current-HP',
						value: (ctx) => -ctx.target['limit-HP'] * 0.1,
					},
				},
			],
		},

		// S2
		'm-s2-levitate': {
			duration: 1.5,
			description: 'Đang bị hất tung — miễn choáng khi rớt',
			impacts: {
				'modify-states': [
					{ type: 'root' },
					{ type: 'throw-up' },
					{ type: 'silent', slot: 'all' },
					{ type: 'immune', filter: 'id:m-s2-land-stun' },
				],
				'on-end': {
					action: '@create-entity',
					from: 'parent-pos',
					collider: {
						shape: { type: 'circle', size: { radius: 80 } },
						'impact-capacity': Infinity,
					},
					impact: {
						manifest: [
							{ 'target-effect': { action: '@apply:effect', effect: 'm-s2-land-damage' } },
							{ 'target-effect': { action: '@apply:effect', effect: 'm-s2-land-stun' } },
						],
					},
				},
			},
		},
		'm-s2-land-damage': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 2.01,
					reductions: energyDamageReduction,
				},
			},
		},
		'm-s2-land-stun': {
			duration: 1.5,
			impacts: {
				'modify-states': [{ type: 'root' }, { type: 'silent', slot: 'all' }],
			},
		},

		// S3
		'm-s3-dot': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 0.35,
					reductions: energyDamageReduction,
				},
			},
		},
		'm-s3-random-hit': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 1.75,
					reductions: energyDamageReduction,
				},
			},
		},
	},
};
