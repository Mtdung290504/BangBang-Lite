// @ts-check

/**@type {import('.types/skill-manifest.js').SkillManifest<['modeA', 'modeB']>} */
export default {
	phases: ['modeA', 'modeB'],

	'normal-attack': {
		type: 'normal',
		cooldown: 1,
		actions: [
			{
				name: '@create:projectile',
				'init-value': {
					'orientation-method': 'tank-head-direction',
					'flight-range': 'inherit',
					'flight-speed': 'inherit',
				},
				components: [
					{
						name: 'shape',
						'init-value': {
							type: 'circle',
							size: {
								radius: 10,
							},
						},
					},
				],
			},
		],
	},

	skill_1: {
		type: 'phased',
		'default-phase': 'modeA',
		'phases-definition': {
			modeA: {
				type: 'normal',
				cooldown: 3,
				actions: [{ name: '@do-action:dash', components: [] }],
			},
			modeB: {
				type: 'normal',
				cooldown: 2,
				actions: [{ name: '@do-action:dash', components: [] }],
			},
		},
	},

	skill_2: {
		type: 'multi-stage',
		cooldown: 6,
		'time-out': 3,
		stages: [
			{ actions: [{ name: '@do-action:dash', components: [] }] },
			{ actions: [{ name: '@do-action:dash', components: [] }] },
		],
	},

	skill_3: {
		type: 'stacked',
		cooldown: 1,
		'max-stack': 3,
		'stack-time': 4,
		actions: [{ name: '@do-action:dash', components: [] }],
	},
};
