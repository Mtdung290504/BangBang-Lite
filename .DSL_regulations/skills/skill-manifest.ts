import type { SkillEntry } from './active-skill-manifest';
import type { PassiveSkillEntry } from './passive-skill-manifest';

/**
 * Định nghĩa tổng cho manifest, có thể có phase hoặc skill
 * @todo Cần bổ sung thêm `passive` skill
 */
interface SkillManifest<Phases extends number[] = []> {
	/** Nếu có phase, khai báo các phase */
	phases?: Phases extends [] ? never : Phases;

	// Passive skills
	passive: PassiveSkillEntry<Phases>[];

	// Active skills
	'normal-attack': SkillEntry<Phases>;
	s1: SkillEntry<Phases>;
	s2: SkillEntry<Phases>;
	ultimate: SkillEntry<Phases>;
}

export type { SkillManifest };

const test: SkillManifest = {
	passive: [
		{
			type: 'permanent-buff',
			'stat-modifiers': [
				{
					attribute: 'flight-speed',
					value: { amount: 50 },
				},
			],
		},
		{
			type: 'event-triggered',
			'trigger-event': 'on-activate-skill',
			actions: 'implement-later: Tạo khiên phản đòn',
		},
	],

	'normal-attack': {
		type: 'normal',
		actions: [
			{
				name: 'create-default-projectile',
				enhancements: [{ name: 'bouncing', 'hit-limit': 3, 'damage-reduction': { amount: 50 } }],
				'on-dealt-damage': { self: ['implement-later: Hồi 5 năng lượng'] },
			},
		],
	},

	s1: {
		type: 'normal',
		cooldown: 8,
		'resource-consumption': { energy: { amount: 25, unit: 'point' } },
		actions: ['implement-later: Gây damage, tăng tốc, bóng quay về'],
	},

	s2: {
		type: 'stacked',
		'max-stack': 2,
		'stack-time': 8,
		cooldown: 1.5,
		'resource-consumption': { energy: { amount: 50, unit: 'point' } },
		actions: ['implement-later: Lướt'],
	},

	ultimate: {
		type: 'normal',
		cooldown: 8,
		'resource-consumption': { energy: { amount: 0, unit: 'point' } },
		actions: ['implement-later: Tung bóng bay xuyên, đẩy lui'],
	},
};
