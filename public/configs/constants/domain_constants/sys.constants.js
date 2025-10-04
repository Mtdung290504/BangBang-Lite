/** Font size tên nhân vật/vật thể */
export const STATUS_BAR_FONT_SIZE = 105 * 0.15;

// HP bar configs
export const HP_BAR_WIDTH = 115 * 0.65;
export const HP_BAR_HEIGHT = 115 * 0.093;
export const HP_BAR_BORDER_RADIUS = 3;
export const HP_BAR_BORDER_WIDTH = 0.75;

// Energy bar configs
export const ENERGY_BAR_HEIGHT = 115 * 0.04;
export const ENERGY_BAR_BORDER_RADIUS = 4;
export const ENERGY_BAR_BORDER_WIDTH = 0.75;

/**@type {{ [K in import('.types-system/src/core/combat/faction').Faction]: string } & { energy: string, damage: string }} */
export const STATUS_BAR_COLORS = {
	ally: 'rgb(52, 179, 222)',
	energy: 'rgb(93, 228, 255)',
	enemy: 'rgb(240, 0, 0)',
	neutral: '',
	self: 'rgb(0, 180, 0)',
	damage: 'rgba(230, 20, 20, 1)',
};

export const TEXT_DAMAGE_FONT_SIZE = 140 * 0.152;

// Skill UI

/** @type {([offset: number, color: string])[]} */
export const UI_ENERGY_BAR_GRADIENT = [
	[0, '#2b6bff'], // xanh lam đậm
	[0.25, '#379dff'], // xanh lam sáng hơn
	[0.5, '#44d9ff'], // xanh cyan
	[0.75, '#3dffd9'], // xanh ngọc sáng
	[1, '#3dffe3'], // xanh ngọc sáng hơn / aqua
];

/** @type {([offset: number, color: string])[]} */
export const UI_HP_BAR_GRADIENT = [
	[0, '#3aceffff'], // cyan đậm
	[0.125, '#2ff1caff'], // xanh ngọc đậm
	[0.375, '#ddff53ff'], // vàng-lục gắt
	[0.5, '#ffff00'], // vàng thuần
	[0.625, '#ffb300'], // vàng-cam đậm
	[0.75, '#ff6600'], // cam đậm
	[0.875, '#ff3300'], // đỏ-cam gắt
	[1, '#ff0000'], // đỏ thuần
];

/**
 * @satisfies {([Exclude<import('.types-system/dsl/tank-manifest').SkillSlot, 'normal-attack'>, string])[]}
 */
export const SKILL_SLOT_LABEL = /** @type {const} */ ([
	['s1', 'R'],
	['s2', 'E'],
	['ultimate', 'SPACE'],
	['sp', 'Q'],
]);

export const SKILL_BOX_SIZE = 60;
export const SKILL_BOX_BORDER_RADIUS = 5;
export const SKILL_BOX_GAP_SIZE = 10;
export const UI_STATUS_BAR_WIDTH = 135;
export const UI_STATUS_BAR_HEIGHT = 15;
export const UI_HP_ENERGY_GAP = 5;
