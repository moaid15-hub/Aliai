/**
 * (J'F'* 'D4.5J'* - Personas Data
 *
 * B'&E) ,EJ9 'D4.5J'* 'DE*'-) AJ 'DF8'E
 */

import { Persona } from '../types/persona.types';
import IRAQI_TEACHER_PERSONA from '../implementations/iraqi-teacher/persona';

/**
 * B'&E) ,EJ9 'D4.5J'*
 */
export const PERSONAS: Persona[] = [
  IRAQI_TEACHER_PERSONA,
  // 3J*E %6'A) 4.5J'* #.1I GF' D'-B'K
];

/**
 * 'D-5HD 9DI 4.5J) (H'37) 'DE91A
 */
export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find(p => p.id === id);
}

/**
 * 'D-5HD 9DI 'D4.5J'* 'DEEJ2)
 */
export function getFeaturedPersonas(): Persona[] {
  return PERSONAS.filter(p => p.is_featured);
}

/**
 * 'D-5HD 9DI 'D4.5J'* -3( 'DA&)
 */
export function getPersonasByCategory(category: string): Persona[] {
  return PERSONAS.filter(p => p.category === category);
}

/**
 * *5/J1 'A*1'6J
 */
export default PERSONAS;
