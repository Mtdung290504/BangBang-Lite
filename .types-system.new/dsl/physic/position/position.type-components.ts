import { PositionDeclaration } from './position.enums';

export interface PositionConfig<T extends PositionDeclaration> {
	from: T;
}
