export type SpriteManifest = {
	loop: boolean;
	'padding-ratio': number;
	frames: {
		width: number;
		height: number;
		x: number;
		y: number;
	}[];
};
