import { ApplyEffectAction } from './apply.action';
import { CreateImpactor, CreateTargetedImpactor } from './create.action';
import { ApplyModifierAction } from './modifier.action';
import { WaitAction } from './wait.action';

// ---------------------------------------------------------------------------
// TYPES-SYSTEM V2: UNIFIED ACTION EXPORTS
// ---------------------------------------------------------------------------

export type AnyActionEntry =
	| ApplyModifierAction
	| ApplyEffectAction<AnyActionEntry>
	| CreateImpactor<AnyActionEntry>
	| CreateTargetedImpactor<AnyActionEntry>
	| WaitAction;
