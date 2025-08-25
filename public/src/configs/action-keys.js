import { LOCAL_CONTROL_KEY } from './constants/player-local-configs.js';

/**
 * @typedef {'LEFT' | 'DOWN' | 'RIGHT' | 'UP' | 'SKILL_SP' | 'SKILL_1' | 'SKILL_2' | 'SKILL_ULTIMATE' | 'TOGGLE_AUTO_ATK'} ActionKey
 */

/**
 * @readonly
 * @type {{ readonly LEFT: 'LEFT', readonly DOWN: 'DOWN', readonly RIGHT: 'RIGHT', readonly UP: 'UP', readonly SKILL_SP: 'SKILL_SP', readonly SKILL_1: 'SKILL_1', readonly SKILL_2: 'SKILL_2', readonly SKILL_ULTIMATE: 'SKILL_ULTIMATE', readonly TOGGLE_AUTO_ATK: 'TOGGLE_AUTO_ATK' }}
 */
export const ACTIONS_KEYS = /** @type {const} */ ({
	// Moving
	LEFT: 'LEFT',
	DOWN: 'DOWN',
	RIGHT: 'RIGHT',
	UP: 'UP',

	// Activate Skill
	SKILL_SP: 'SKILL_SP',
	SKILL_1: 'SKILL_1',
	SKILL_2: 'SKILL_2',
	SKILL_ULTIMATE: 'SKILL_ULTIMATE',

	// Setting
	TOGGLE_AUTO_ATK: 'TOGGLE_AUTO_ATK',
});

/**
 * @type {Record<string, ActionKey>}
 */
const DEFAULT_CONTROL_KEY = {
	A: /** @type {ActionKey} */ ('LEFT'),
	S: /** @type {ActionKey} */ ('DOWN'),
	D: /** @type {ActionKey} */ ('RIGHT'),
	W: /** @type {ActionKey} */ ('UP'),
	Q: /** @type {ActionKey} */ ('SKILL_SP'),
	R: /** @type {ActionKey} */ ('SKILL_1'),
	E: /** @type {ActionKey} */ ('SKILL_2'),
	' ': /** @type {ActionKey} */ ('SKILL_ULTIMATE'),
	B: /** @type {ActionKey} */ ('TOGGLE_AUTO_ATK'),
};

/**
 * Parse user config with error handling
 * @type {Record<string, ActionKey>}
 */
let userConfigData = {};

try {
	const storedConfig = localStorage.getItem(LOCAL_CONTROL_KEY);
	if (storedConfig) {
		const parsed = JSON.parse(storedConfig);

		// Validate that all values are valid ActionKeys
		/** @type {Record<string, ActionKey>} */
		const validatedConfig = {};
		for (const [key, value] of Object.entries(parsed)) {
			if (typeof value === 'string' && Object.values(ACTIONS_KEYS).includes(/** @type {ActionKey} */ (value))) {
				validatedConfig[key] = /** @type {ActionKey} */ (value);
			}
		}

		userConfigData = validatedConfig;
	}
} catch (error) {
	console.warn('Failed to parse user control config:', error);
	userConfigData = {};
}

/**
 * @type {Record<string, ActionKey>}
 */
const USER_CONFIG_CONTROL_KEY = userConfigData;

/**
 * @type {Record<string, ActionKey>}
 */
export const CONTROL_KEY = new Proxy(USER_CONFIG_CONTROL_KEY, {
	/**
	 * @param {Record<string, ActionKey>} target
	 * @param {string | symbol} prop
	 *
	 * @returns {ActionKey | undefined}
	 */
	get(target, prop) {
		if (typeof prop === 'string') {
			return target[prop] || DEFAULT_CONTROL_KEY[prop];
		}
		return undefined;
	},

	/**
	 * @param {Record<string, ActionKey>} target
	 * @param {string | symbol} prop
	 * @param {ActionKey} value
	 *
	 * @returns {boolean}
	 */
	set(target, prop, value) {
		if (typeof prop === 'string' && Object.values(ACTIONS_KEYS).includes(value)) {
			target[prop] = value;
			// Save to localStorage when setting
			try {
				localStorage.setItem(LOCAL_CONTROL_KEY, JSON.stringify(target));
			} catch (error) {
				console.warn('Failed to save control config:', error);
			}
			return true;
		}
		return false;
	},
});
