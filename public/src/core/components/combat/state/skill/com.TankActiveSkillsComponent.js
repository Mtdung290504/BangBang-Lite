/**
 * @typedef {{ SkillSlot: import('.types-system/dsl/tank-manifest.js').SkillSlot }} Types
 */

/**
 * TankActiveSkillsComponent manages active skill slots (s1, s2, ultimate) for a tank across different phases.
 */
export default class TankActiveSkillsComponent {
	/**
	 * Timer để trở lại phase cũ nếu có hạn
	 * @type {{ fromPhase: number, backToPhase: number, at: number }[]}
	 */
	timers = [];

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
	 *
	 * @param {import('.types-system/dsl/skills/actions/apply_effect/change-phase').ChangePhase['method']} method - Method to switch phase.
	 * @param {number} [duration] - Thời gian tồn tại phase (đơn vị: s)
	 * @throws {Error} If the method provided phase is not in the registered phase list.
	 */
	setPhase(method, duration) {
		const currentIndex = this.phases.indexOf(this._phase);
		let targetPhase = this._phase;

		if (method === 'next') {
			const nextIndex = (currentIndex + 1) % this.phases.length;
			targetPhase = this.phases[nextIndex];
		} else if (method.startsWith('to-phase:')) {
			const phase = parseInt(method.replace('to-phase:', ''));

			if (isNaN(phase)) throw new Error('Phase không phải number???');
			if (!this.phases.includes(phase)) throw new Error(`Phase không tồn tại???`);

			targetPhase = phase;
		}

		// Nếu phase mới trùng với phase hiện tại và có duration
		if (targetPhase === this._phase && duration) {
			// Tìm timer của phase hiện tại (fromPhase === phase hiện tại)
			const existingTimerIndex = this.timers.findIndex((t) => t.fromPhase === this._phase);

			if (existingTimerIndex !== -1) {
				// Kéo dài thời gian bằng cách cập nhật timer
				this.timers[existingTimerIndex].at = Date.now() + duration * 1000;
			}
			// Nếu không có timer (phase vĩnh viễn), không làm gì
			return;
		}

		// Chuyển phase bình thường
		if (targetPhase !== this._phase) {
			this._phase = targetPhase;

			// Timer
			if (duration) {
				this.timers.push({
					fromPhase: targetPhase,
					backToPhase: this.phases[currentIndex],
					at: Date.now() + duration * 1000,
				});
			}
		}
	}
}
