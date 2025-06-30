// src/types/dating.ts - Updated to match API response structure
export interface DatingProfile {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string;
    email: string;
    role: string;
    verified: boolean;
    createdAt: string;
    tokenExpirationTime?: string;
    emailVerified: boolean;
    following: any[];
    bio?: string;
    profileImageUrl?: string;
    datingModeEnabled: boolean;
    datingProfileComplete: boolean;
    lastActive?: string;
  };
  bio: string;
  age: number;
  location: string;
  height?: string;
  job?: string; // ADD this new field
  religion?: string;
  relationshipType?: string;
  lifestyle?: string;
  photos: string[];
  isActive: boolean;
  genderPreference: string;
  minAge: number;
  maxAge: number;
  maxDistance: number;
  prompts?: Array<{
    question: string;
    answer: string;
  }>;

  // NEW FIELDS for sliding bar (vitals & vices)
  hasChildren?: string; // "Have children" | "Don't have children"
  wantChildren?: string; // "Want children" | "Don't want children" | "Open to children"
  drinking?: string; // "Never" | "Sometimes" | "Frequently"
  smoking?: string; // "No" | "Sometimes" | "Yes"
  drugs?: string; // "No" | "Sometimes" | "Yes"

  // NEW FIELDS for virtues
  lookingFor?: string;
  interests?: string[];
  virtues?: Array<{
    category: string;
    value: string;
  }>;
}

// Rest of interfaces...

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
}

export type SwipeDirection = "LIKE" | "PASS";
