import type { ActionDeclaration } from '../base-action';

interface Dash extends ActionDeclaration {
	action: '@do:dash';
	range: number;
	speed: number;

	/**Mặc định: false */
	'through-wall'?: boolean;

	/**Mặc định: false */
	'through-tank'?: boolean;
}

interface Teleport extends ActionDeclaration {
	action: '@do:teleport';
	range: number;
}

export type SuperMoveAction = Dash | Teleport;
