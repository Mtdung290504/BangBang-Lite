import { ActionDeclaration } from '../base-action';

export interface ChangePhase extends ActionDeclaration {
	action: '@do:change-phase';

	method: 'next' | `to-phase:${number}`;

	/** Thời gian kéo dài, nếu không khai báo, mặc định kéo dài đến khi nào được chuyển thì thôi */
	duration?: number;
}
