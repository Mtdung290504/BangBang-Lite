import { createViewBinding } from '../../libs/view_binding/index.js';
import { CANVAS_ID } from '../../configs/constants/game-system-configs.js';

const { viewBinding } = createViewBinding({ canvas: `#${CANVAS_ID} = canvas` });

export const views = viewBinding.bind();

export function setup() {
	views.canvas.removeAttribute('style');
}
