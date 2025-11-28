import { TestKey } from '../../common.enums';
import { InheritDeclaration } from '../../common.types';

export type RangeInheritAttribute = InheritDeclaration<'fire-range' | TestKey>;
export type RangeEnum = 1000 | 672 | 555 | 480 | 408 | 336 | 260 | 180;

export type SpeedInheritAttribute = InheritDeclaration<'movement-speed' | 'flight-speed' | TestKey>;
export type MovementSpeedEnum = 160 | 165 | 170 | 175 | 180;
export type FlightSpeedEnum = 15 | 17.5;
