import type { ValueWithUnit } from '../utils-types';

interface OnActivateSkillPayload {
	skill: 'normal-attack' | 's1' | 's2' | 'ultimate';
}

interface OnHitPayload {
	'source-tank': string;
	sourceSkill: ValueWithUnit;
}

interface OnReceiveFatalDamagePayload {
	'source-tank': string;
	damage: ValueWithUnit;
	// có thể flag "is-blockable" để passive cứu mạng
}

interface OnDestroyedPayload {
	'source-tank': string;
	// cho hệ thống ghi nhận ai kill
}

export type { OnActivateSkillPayload, OnHitPayload, OnReceiveFatalDamagePayload, OnDestroyedPayload };
