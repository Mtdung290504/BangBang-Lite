/** Constant used in calculating dx and dy of tank */
export const SPEED_CALCULATION_CONSTANT = (24 / 1000) * (50 / 67);

/** Constant used in calculating dx and dy of projectile */
export const PROJECTILE_SPEED_CALCULATION_CONSTANT = 50 / 67;

/** Divide the speed by this value to get the rotation speed */
export const ROTATE_CALCULATION_CONSTANT = 15;

/** Layer của tank trong hệ thống render */
export const TANK_DEFAULT_LAYER = 0;

// Delta layer sẽ được cộng vào TANK_DEFAULT_LAYER để render map
export const BACKGROUND_DELTA_LAYER = -5;
export const SCENES_DELTA_LAYER = 5;
export const SHADOW_DELTA_LAYER = -2;

/** Size mặc định của tank dùng cho cả default render và hitbox */
export const TANK_DEFAULT_SIZE = 52.5;

/** Font size tên nhân vật/vật thể */
export const STATUS_BAR_FONT_SIZE = 105 * 0.15;

export const HP_BAR_WIDTH = 115 * 0.65;
export const HP_BAR_HEIGHT = 115 * 0.093;
export const HP_BAR_BORDER_RADIUS = 3;
export const HP_BAR_BORDER_WIDTH = 0.75;

export const ENERGY_BAR_HEIGHT = 115 * 0.04;
export const ENERGY_BAR_BORDER_RADIUS = 4;
export const ENERGY_BAR_BORDER_WIDTH = 0.75;

/**@type {{ [K in import('.types/src/core/combat/faction').Faction]: string } & { energy: string }} */
export const STATUS_BAR_COLORS = {
	ally: 'rgb(240, 0, 0)',
	energy: 'rgb(93, 228, 255)',
	enemy: 'rgb(240, 0, 0)',
	neutral: '',
	self: 'rgb(0, 180, 0)',
};
