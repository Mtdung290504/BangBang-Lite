/**
 * @type {import('.types-system/dsl/skills/manifest/manifest.active-skill').NormalSkill[]}
 */
export default [
	{
		// Tốc biến
		type: 'normal',
		property: 'skill',
		actions: [{ action: '@do:teleport', range: 280 }],
		cooldown: 2,
		'casting-method': { type: 'in-direction', display: { size: 40 }, range: 280 },
	},
];
