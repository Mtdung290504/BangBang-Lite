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

// Survival configs
export const DEFAULT_HEALING_EFFECT = 0;
export const DEFAULT_DMG_REDUCTION = 0;
export const DEFAULT_DODGE_RATE = 0;
