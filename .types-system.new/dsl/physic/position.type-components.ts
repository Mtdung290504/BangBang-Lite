import { PositionDeclaration } from './position.enums';

export interface RequireInitPositionMethod<T extends PositionDeclaration> {
	from: T;
}
