/** Constant used in calculating dx and dy of tank */
const SPEED_CALCULATION_CONSTANT = (24 / 1000) * (50 / 67);

/** Constant used in calculating dx and dy of projectile */
const PROJECTILE_SPEED_CALCULATION_CONSTANT = 50 / 67;

/** Divide the speed by this value to get the rotation speed */
const ROTATE_CALCULATION_CONSTANT = 15;

/** Layer của tank trong hệ thống render */
const TANK_DEFAULT_LAYER = 0;

// Delta layer sẽ được cộng vào TANK_DEFAULT_LAYER để render map
const BACKGROUND_DELTA_LAYER = -5;
const SCENES_DELTA_LAYER = 5;
const SHADOW_DELTA_LAYER = -2;

export {
	SPEED_CALCULATION_CONSTANT,
	PROJECTILE_SPEED_CALCULATION_CONSTANT,
	ROTATE_CALCULATION_CONSTANT,
	TANK_DEFAULT_LAYER,
	BACKGROUND_DELTA_LAYER,
	SCENES_DELTA_LAYER,
	SHADOW_DELTA_LAYER,
};
