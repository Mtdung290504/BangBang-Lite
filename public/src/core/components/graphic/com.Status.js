/**
 * Component thể hiện entity cần render thanh status
 */
export default class StatusBarComponent {
	/**
	 * @param {import('.types/src/core/combat/faction').Faction} faction
	 * @param {string} displayName
	 */
	constructor(faction, displayName = '') {
		this.faction = faction;
		this.displayName = displayName;
	}
}
