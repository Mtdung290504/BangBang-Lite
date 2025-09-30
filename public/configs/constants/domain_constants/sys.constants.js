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
	damage: 'rgb(255, 0, 0)',
};

export const TEXT_DAMAGE_FONT_SIZE = 140 * 0.157;
