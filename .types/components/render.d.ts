import { AssetReference } from '../skill-manifest.d.ts';

export interface RotateDrawableComponent {
	name: 'rotate-drawable';
	'init-value': {
		layer: number;
		priority: number;
		image: AssetReference;
	};
}
