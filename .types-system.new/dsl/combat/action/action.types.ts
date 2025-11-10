import { ActionPrefix } from './action.enums';
import { EnsureRecordType } from '../../common.types';

export type ActionTargetMap = EnsureRecordType<
	ActionPrefix,
	string | number,
	{
		create: 'projectile' | 'area-effect';
		do: 'dash' | 'teleport' | 'change-phase';
		apply: 'damage';
		hahahaha: '';
	}
>;
