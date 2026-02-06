
export interface PhaseData {
  sentence: string;
  feeling: string;
  reflection: string;
}

export interface EclipseStoryline {
  before: PhaseData;
  first_contact: PhaseData;
  during_peak: PhaseData;
  totality: PhaseData;
  return_of_light: PhaseData;
  afterglow: PhaseData;
}

export enum PhaseKey {
  BEFORE = 'before',
  FIRST_CONTACT = 'first_contact',
  DURING_PEAK = 'during_peak',
  TOTALITY = 'totality',
  RETURN_OF_LIGHT = 'return_of_light',
  AFTERGLOW = 'afterglow'
}

export const PHASES = [
  PhaseKey.BEFORE,
  PhaseKey.FIRST_CONTACT,
  PhaseKey.DURING_PEAK,
  PhaseKey.TOTALITY,
  PhaseKey.RETURN_OF_LIGHT,
  PhaseKey.AFTERGLOW
];

export const PHASE_LABELS: Record<PhaseKey, string> = {
  [PhaseKey.BEFORE]: 'Anticipation',
  [PhaseKey.FIRST_CONTACT]: 'Shift',
  [PhaseKey.DURING_PEAK]: 'Ascension',
  [PhaseKey.TOTALITY]: 'Silence',
  [PhaseKey.RETURN_OF_LIGHT]: 'Renewal',
  [PhaseKey.AFTERGLOW]: 'Presence'
};
