import { ActionTargetingRequire } from './action.enums';

export interface BaseTargetingMethod<Name extends ActionTargetingRequire> {
	mode: Name;
	strategy?: unknown;
}

export interface DirectionTargeting extends BaseTargetingMethod<'direction'> {
	/**
	 * Mặc định nếu không khai báo: { 'delta-angle': 0 }
	 * @override
	 */
	strategy?: { 'delta-angle': number };
}

export interface LockTargeting extends BaseTargetingMethod<'target'> {
	strategy: '';
}
