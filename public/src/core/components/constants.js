/** Constant used in calculating dx and dy of tank */
const SPEED_CALCULATION_CONSTANT = (24 / 1000) * (50 / 67);

/** Constant used in calculating dx and dy of projectile */
const PROJECTILE_SPEED_CALCULATION_CONSTANT = 50 / 67;

/** Divide the speed by this value to get the rotation speed */
const ROTATE_CALCULATION_CONSTANT = 15;

export { SPEED_CALCULATION_CONSTANT, PROJECTILE_SPEED_CALCULATION_CONSTANT, ROTATE_CALCULATION_CONSTANT };
