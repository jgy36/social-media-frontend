// src/types/dating.ts - Clean updated types

// ============================================================================
// CORE DATING TYPES
// ============================================================================

export interface DatingProfile {
  id: number;
  bio: string;
  location: string;
  height: string;
  job: string;
  religion: string;
  relationshipType: string;
  lifestyle: string;
  photos: string[];
  prompts: Array<{
    question: string;
    answer: string;
  }>;
  hasChildren: string;
  wantChildren: string;
  drinking: string;
  smoking: string;
  drugs: string;
  lookingFor: string;
  interests: string[];
  virtues: Array<{
    category: string;
    value: string;
  }>;
  // NEW: Gender field (replaces age - age now comes from user birthday)
  gender: string; // "MAN" | "WOMAN" | "NON_BINARY" | "OTHER"
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDatingProfileRequest {
  bio: string;
  location: string;
  height?: string;
  job?: string;
  religion?: string;
  relationshipType?: string;
  lifestyle?: string;
  photos: string[];
  prompts?: Array<{
    question: string;
    answer: string;
  }>;
  hasChildren?: string;
  wantChildren?: string;
  drinking?: string;
  smoking?: string;
  drugs?: string;
  lookingFor?: string;
  interests?: string[];
  virtues?: Array<{
    category: string;
    value: string;
  }>;
  // NEW: Gender field is required
  gender: string;
}

// ============================================================================
// DATING SETTINGS TYPES
// ============================================================================

export interface DatingPreferences {
  genderPreference: string; // "MEN" | "WOMEN" | "EVERYONE" | "NON_BINARY"
  minAge: number;
  maxAge: number;
  maxDistance: number;
}

export interface DatingEligibility {
  age: number | null;
  ageConfirmed: boolean;
  eligibleForDating: boolean;
  hasDatingProfile: boolean;
}

export interface AgeConfirmationResponse {
  success: boolean;
  ageConfirmed: boolean;
  eligibleForDating: boolean;
  error?: string;
}

export interface PreferencesUpdateResponse {
  success: boolean;
  preferences?: DatingPreferences;
  error?: string;
}

// ============================================================================
// MATCHING & SWIPING TYPES
// ============================================================================

export type SwipeDirection = "LIKE" | "PASS";

export interface SwipeResponse {
  success: boolean;
  matched: boolean;
  match?: Match;
  error?: string;
}

export interface Match {
  id: number;
  user1: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  user2: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  matchedAt: string;
  isActive: boolean;
  lastActivityAt?: string;
}

// ============================================================================
// GENDER & PREFERENCE ENUMS
// ============================================================================

export enum Gender {
  MAN = "MAN",
  WOMAN = "WOMAN",
  NON_BINARY = "NON_BINARY",
  OTHER = "OTHER",
}

export enum GenderPreference {
  MEN = "MEN",
  WOMEN = "WOMEN",
  EVERYONE = "EVERYONE",
  NON_BINARY = "NON_BINARY",
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface DatingUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profileImageUrl?: string;
  bio?: string;
  age?: number; // Calculated from birthday
  ageConfirmed?: boolean;
  eligibleForDating?: boolean;
  lastActive?: string;
  datingProfile?: DatingProfile;
}

export interface PotentialMatch extends DatingProfile {
  user: DatingUser;
  distance?: number; // Distance in miles/km
  compatibility?: number; // Compatibility score 0-100
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface DatingApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MatchesResponse {
  matches: Match[];
  total: number;
  hasMore: boolean;
}

export interface PotentialMatchesResponse {
  profiles: PotentialMatch[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// FORM & VALIDATION TYPES
// ============================================================================

export interface DatingProfileFormData {
  bio: string;
  location: string;
  height: string;
  job: string;
  religion: string;
  relationshipType: string;
  lifestyle: string;
  photos: string[];
  prompts: Array<{
    question: string;
    answer: string;
  }>;
  hasChildren: string;
  wantChildren: string;
  drinking: string;
  smoking: string;
  drugs: string;
  lookingFor: string;
  interests: string[];
  virtues: Array<{
    category: string;
    value: string;
  }>;
  gender: string;
}

export interface DatingPreferencesFormData {
  genderPreference: string;
  minAge: number;
  maxAge: number;
  maxDistance: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DATING_CONSTANTS = {
  MIN_AGE: 18,
  MAX_AGE: 100,
  MIN_DISTANCE: 1,
  MAX_DISTANCE: 100,
  MAX_PHOTOS: 6,
  MAX_PROMPTS: 3,
  MIN_BIO_LENGTH: 10,
  MAX_BIO_LENGTH: 500,
} as const;

export const GENDER_OPTIONS = [
  { value: Gender.MAN, label: "Man" },
  { value: Gender.WOMAN, label: "Woman" },
  { value: Gender.NON_BINARY, label: "Non-binary" },
  { value: Gender.OTHER, label: "Other" },
] as const;

export const GENDER_PREFERENCE_OPTIONS = [
  { value: GenderPreference.MEN, label: "Men", icon: "♂️" },
  { value: GenderPreference.WOMEN, label: "Women", icon: "♀️" },
  { value: GenderPreference.EVERYONE, label: "Everyone", icon: "🌟" },
  { value: GenderPreference.NON_BINARY, label: "Non-binary", icon: "⚧️" },
] as const;
