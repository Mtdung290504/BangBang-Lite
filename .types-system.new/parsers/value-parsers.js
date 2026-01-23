/**
 * @param {string} valueWithUnit
 * @returns {{ value: number, unit: import('../dsl/.types').ValueUnit, scaleRate: number}}
 */
function parseValueWithUnit(valueWithUnit) {
	const splitIndex = valueWithUnit.indexOf('+*');

	// Parse phần value + unit
	const valueUnitPart = splitIndex === -1 ? valueWithUnit : valueWithUnit.substring(0, splitIndex);
	const unitIndex = valueUnitPart.indexOf('u');

	let unit, value;
	if (unitIndex !== -1) {
		unit = 'u';
		value = parseFloat(valueUnitPart);
	} else {
		const percentIndex = valueUnitPart.indexOf('%');
		if (percentIndex === -1) throw new Error(`Invalid format: "${valueWithUnit}"`);
		unit = '%';
		value = parseFloat(valueUnitPart);
	}

	if (isNaN(value)) {
		throw new Error(`Invalid value: "${valueWithUnit}"`);
	}

	// Parse scale rate (default 0 nếu không có)
	let scaleRate = 0;
	if (splitIndex !== -1) {
		scaleRate = parseFloat(valueWithUnit.substring(splitIndex + 2));
		if (isNaN(scaleRate)) {
			throw new Error(`Invalid scale rate: "${valueWithUnit}"`);
		}
	}

	return { value, unit, scaleRate };
}
