// src/types/search.ts

export interface ApiSearchResult {
  id?: number;
  type: "user" | "hashtag" | "community" | "post";
  title: string;
  subtitle?: string;
  username?: string;
  profileImageUrl?: string;
  description?: string;
  score?: number;
}

export interface HashtagInfo {
  tag: string;
  postCount?: number;
  trending?: boolean;
}

export interface UserSearchResult {
  id: number;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  bio?: string;
  followerCount?: number;
  isVerified?: boolean;
}

export interface CommunitySearchResult {
  id: number;
  name: string;
  description?: string;
  memberCount?: number;
  imageUrl?: string;
  isPrivate?: boolean;
}

export interface PostSearchResult {
  id: number;
  content: string;
  author: string;
  authorDisplayName?: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
  hasMedia?: boolean;
}

// Search request/response types
export interface SearchRequest {
  query: string;
  type?: "all" | "users" | "hashtags" | "communities" | "posts";
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: ApiSearchResult[];
  total: number;
  hasMore: boolean;
}

// Trending data types
export interface TrendingHashtag {
  tag: string;
  postCount: number;
  growthRate?: number;
}

export interface TrendingTopic {
  id: string;
  title: string;
  description?: string;
  postCount: number;
  category?: string;
}
