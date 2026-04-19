/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OutputMode = 'Normal' | 'Simplified' | 'Detailed' | 'Handwritten';
export type AssignmentFormat = 'Quick Pres' | 'Detailed Pres' | 'Short Notes' | 'Long Assignment' | 'Speech' | 'Debate' | 'Case Study';

export interface SlideContent {
  title: string;
  points: string[];
  table?: { headers: string[], rows: string[][] };
  chartData?: { name: string, value: number }[];
  shape?: { type: 'circle' | 'square' | 'triangle' | 'star', color: string };
  imageUrl?: string;
  theme?: string;
  speech?: string;
  suggestedImages?: string[];
}

export interface AssignmentVersion {
  mode: OutputMode;
  slides: SlideContent[];
}

export interface Assignment {
  id: string;
  topic: string;
  tone: string;
  language: string;
  marks: number;
  teacherMode: 'Strict' | 'Average' | 'Easy';
  format?: AssignmentFormat;
  versions: AssignmentVersion[];
  createdAt: number;
  isManual?: boolean;
}

export interface UserPreferences {
  userClass: string;
  language: string;
  writingStyle: string;
  themeColor: string;
  fontSize: 'small' | 'medium' | 'large';
  hasDonated?: boolean;
}

export type AppView = 'splash' | 'home' | 'create' | 'loading' | 'editor' | 'library' | 'profile' | 'templates' | 'export' | 'search' | 'donation';

export const INDIAN_LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Telugu', 'Bengali', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
];

export const FORMATS: AssignmentFormat[] = [
  'Quick Pres', 'Detailed Pres', 'Short Notes', 'Long Assignment', 'Speech', 'Debate', 'Case Study'
];

export const PRESETS = [
  { id: 'school', name: 'School Assignment', icon: 'School' },
  { id: 'college', name: 'College Project', icon: 'GraduationCap' },
  { id: 'simple', name: 'Simple Language', icon: 'Baby' },
  { id: 'exam', name: 'Exam Answer', icon: 'PenTool' },
];

export const TEACHER_MODES = ['Strict', 'Average', 'Easy'];
