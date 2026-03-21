import type { PassiveSkillEntry } from '../entity/skill/passive.type-entities';

/**
 * Ví dụ: Bất tử (CD 30s)
 *
 * Khi chịu sát thương đủ để chết:
 * - Xóa CD skill s1, s2
 * - Bất bại (invincible) trong 1.5s
 *
 * Flow:
 * 1. Tank spawn → passive CD=30s → CD xong → auto-trigger
 * 2. Tạo impactor tức thì trúng bản thân → áp effect vĩnh viễn với on-event
 * 3. Khi sắp chết (on-destroyed) → reset CD s1/s2 + invincible 1.5s
 * 4. Effect vĩnh viễn bị xóa (đã dùng) → passive bắt đầu CD 30s lại
 */
export default {
	cooldown: 30,
	actions: [
		{
			// Tạo impactor tức thì trúng bản thân để áp effect
			action: '@create-entity',
			from: 'self-pos',
			duration: 'frame-time',
			collider: { shape: { type: 'circle', size: { radius: 52.5 } } },
			impact: {
				actions: {
					'affected-faction': ['self'],
					'target-effect': {
						action: '@apply:effect',
						manifest: {
							unremovable: true,
							impacts: {
								'on-event': {
									'on-destroyed': [
										// Xóa CD s1, s2
										{
											action: '@apply:modify-countdown',
											slot: ['s1', 's2'],
											value: '-100%',
										},
										// Bất bại 1.5s
										{
											action: '@apply:effect',
											manifest: {
												duration: 1.5,
												impacts: {
													states: { type: 'invincible' },
												},
											},
										},
									],
								},
							},
						},
					},
				},
			},
		},
	],
} satisfies PassiveSkillEntry;
