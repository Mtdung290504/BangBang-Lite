import { PositionDeclaration } from './position.enums';

export interface RequireInitPositionMethod<T extends PositionDeclaration = PositionDeclaration> {
	/**
	 * Skill xuất phát từ đâu
	 * @default "self-pos"
	 */
	from?: T;
}
