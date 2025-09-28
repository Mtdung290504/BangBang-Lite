/**
 * Manifest mặc định cho đánh thường, gây (100% x Tấn Công)
 * @type {import('.types-system/dsl/skills/actions/apply_effect/dealt-damage').DealtDamage}
 */
export const DEFAULT_HIT_HANDLER = {
	action: '@apply:damage',
	source: { attribute: 'attack-power', of: 'self' },
	value: { amount: 100 },
};

export const INHERIT_DECLARATION = /** @type {const} */ ('inherit');
