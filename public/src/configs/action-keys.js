export const ACTIONS_KEYS = {
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
};

const DEFAULT_CONTROL_KEY = {
	A: 'LEFT',
	S: 'DOWN',
	D: 'RIGHT',
	W: 'UP',
	Q: 'SKILL_SP',
	R: 'SKILL_1',
	E: 'SKILL_2',
	' ': 'ULTIMATE',
	B: 'TOGGLE_AUTO_ATK',
};

const USER_CONFIG_CONTROL_KEY = JSON.parse(localStorage.getItem('CONTROL-KEY'));

export const CONTROL_KEY = new Proxy(USER_CONFIG_CONTROL_KEY, {
	get(self, prop) {
		return self[prop] || DEFAULT_CONTROL_KEY[prop];
	},
});
