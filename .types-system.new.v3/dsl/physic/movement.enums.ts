import { TestKey } from '../.enums';
import { InheritDeclaration } from '../.types';

export type SpeedInheritAttribute = InheritDeclaration<'movement-speed' | 'flight-speed' | TestKey>;
export type MovementSpeedEnum = 160 | 165 | 170 | 175 | 180;
export type FlightSpeedEnum = 15 | 17.5;
