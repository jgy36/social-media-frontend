// src/types/dating.ts - Updated with new filter and feature types

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
  gender: string;
  age?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: DatingUser;
  // NEW: Algorithm fields
  eloScore?: number;
  totalLikesReceived?: number;
  totalSwipesReceived?: number;
  isFreshProfile?: boolean;
  profileBoostUntil?: string;
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
  gender: string;
  age?: number;
}

// ============================================================================
// NEW FILTER TYPES
// ============================================================================

export interface DatingFilters {
  location?: string;
  education?: string;
  lifestyle?: string;
  religion?: string;
  relationshipType?: string;
  drinking?: string;
  smoking?: string;
  hasChildren?: string;
  wantChildren?: string;
}

// ============================================================================
// DATING SETTINGS TYPES
// ============================================================================

export interface DatingPreferences {
  genderPreference: string;
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

export type SwipeDirection = "LIKE" | "PASS" | "SUPER_LIKE";

export interface SwipeResponse {
  success: boolean;
  matched: boolean;
  match?: Match;
  superLike?: boolean;
  error?: string;
}

export interface SwipeAction {
  targetUserId: number;
  direction: SwipeDirection;
  timestamp: number;
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
// NEW FEATURE TYPES
// ============================================================================

export interface UndoSwipeResponse {
  success: boolean;
  message?: string;
  undoneProfile?: DatingProfile;
  direction?: string;
  error?: string;
}

export interface BoostStatus {
  isBoosted: boolean;
  canBoost: boolean;
  boostEndsAt?: string;
  minutesLeft?: number;
}

export interface BoostResponse {
  success: boolean;
  message?: string;
  boostEndsAt?: string;
  boostDurationMinutes?: number;
  error?: string;
  upgradeRequired?: boolean;
}

export interface SubscriptionStatus {
  tier: string;
  canSwipe: boolean;
  canSuperLike: boolean;
  canBoost: boolean;
  hasPassportMode: boolean;
  canSeeWhoLikedMe: boolean;
  canUndoSwipes: boolean;
  hasAdvancedFilters: boolean;
  dailySwipesUsed: number;
  dailySwipeLimit: number;
  dailySuperLikesUsed: number;
  dailySuperLikeLimit: number;
  monthlyBoostsUsed: number;
  monthlyBoostLimit: number;
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
  age?: number;
  ageConfirmed?: boolean;
  eligibleForDating?: boolean;
  lastActive?: string;
  datingProfile?: DatingProfile;
}

export interface PotentialMatch extends DatingProfile {
  user: DatingUser;
  distance?: number;
  compatibility?: number;
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
  UNDO_TIME_LIMIT: 1800, // 30 minutes in seconds
  BOOST_DURATION: 30, // 30 minutes
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

// Filter option constants
export const FILTER_OPTIONS = {
  lifestyle: [
    "Active",
    "Laid back",
    "Social butterfly",
    "Homebody",
    "Adventurous",
    "Career-focused",
  ],
  religion: [
    "Christian",
    "Muslim",
    "Jewish",
    "Hindu",
    "Buddhist",
    "Atheist",
    "Agnostic",
    "Spiritual",
    "Other",
  ],
  relationshipType: [
    "Long-term relationship",
    "Casual dating",
    "New friends",
    "Open to anything",
  ],
  drinking: ["Never", "Sometimes", "Frequently"],
  smoking: ["No", "Sometimes", "Yes"],
  hasChildren: ["No", "Yes"],
  wantChildren: ["Yes", "No", "Maybe"],
} as const;
