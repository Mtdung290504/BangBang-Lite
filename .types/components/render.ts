import { AssetReference } from '../skill-manifest.js';

export interface RotateDrawableComponent {
	name: 'rotate-drawable';
	'init-value': {
		layer: number;
		priority: number;
		image: AssetReference;
	};
}
