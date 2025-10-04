/**
 * @typedef {{
 *  	SkillSlot: import('.types-system/dsl/tank-manifest.js').SkillSlot
 * }} Types
 */

/**
 * TankActiveSkillsComponent manages active skill slots (s1, s2, ultimate) for a tank across different phases.
 */
export default class TankActiveSkillsComponent {
	/**
	 * @param {number} ownerEID
	 * @param {number[]} [phases=[1]] - List of valid phases. Default is [1] (for tanks with a single phase).
	 */
	constructor(ownerEID, phases = [1]) {
		this.ownerEID = ownerEID;
		this.phases = phases;

		/** @private */
		this._phase = phases[0];

		/**
		 * Internal skill registry.
		 * Each skill slot maps phase number -> skill entity ID.
		 * @private
		 * @type {Record<Types['SkillSlot'], Record<number, number>>}
		 */
		this._skills = { 'normal-attack': {}, s1: {}, s2: {}, ultimate: {}, sp: {} };
	}

	/**
	 * Assign a skill entity to a slot for a given phase.
	 *
	 * @param {number} eID - Skill entity ID.
	 * @param {Types['SkillSlot']} slot - Slot to assign the skill to.
	 * @param {number} [phase=1] - Phase in which this skill is active.
	 *
	 * @throws {Error} If the given phase is not in the registered phase list.
	 */
	setSkill(eID, slot, phase = 1) {
		if (!this.phases.includes(phase)) {
			throw new Error(`> [com.TankActiveSkillsComponent] Phase::[${phase}] does not match registered phase list`);
		}
		this._skills[slot][phase] = eID;
	}

	/**
	 * - Retrieve the skill entity for the current phase in the given slot.
	 * - Falls back to phase 1 if no skill is set for the current phase.
	 *
	 * @param {Types['SkillSlot']} slot - Slot to retrieve the skill from.
	 * @returns {number | undefined} The skill entity ID, or undefined if not found.
	 */
	getSkill(slot) {
		return this._skills[slot][this._phase] ?? this._skills[slot][1];
	}

	/**
	 * Set or advance the current phase.
	 * - If a phase is provided, switch directly to it (with validation).
	 * - If no phase is provided, move to the next phase in the list, wrapping around to the first phase if necessary.
	 *
	 * @param {number} [phase] - Phase to switch to. If omitted, advance to next phase.
	 * @throws {Error} If the provided phase is not in the registered phase list.
	 */
	setPhase(phase) {
		if (typeof phase === 'number') {
			if (!this.phases.includes(phase)) {
				throw new Error(
					`> [com.TankActiveSkillsComponent] Phase::[${phase}] does not match registered phase list`
				);
			}
			this._phase = phase;
		} else {
			const currentIndex = this.phases.indexOf(this._phase);
			const nextIndex = (currentIndex + 1) % this.phases.length;
			this._phase = this.phases[nextIndex];
		}
	}
}
