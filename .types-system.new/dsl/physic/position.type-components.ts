import { PositionDeclaration } from './position.enums';

export interface RequireInitPositionMethod<T extends PositionDeclaration = PositionDeclaration> {
	/**Skill xuất phát từ đâu */
	from: T;
}
