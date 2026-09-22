// src/types/api.ts
/**
 * Exact DTO types derived directly from Swagger OpenAPI spec:
 * http://192.168.1.3:8080/fnf/v3/api-docs (or http://localhost:8080/fnf/v3/api-docs)
 */

// Generic API Envelope
export interface CommonApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Authentication DTOs
export interface SendOtpRequestDto {
  username: string;
}

export interface VerifyOtpRequestDto {
  username: string;
  otp: string;
}

export interface OAuthLoginRequestDto {
  provider: string; // "GOOGLE" | "APPLE"
  providerToken: string;
  email?: string | null;
  fullName?: string | null;
}

export interface LoginResponseDto {
  jwt_token: string;
  profile_completed: boolean;
  user_id: number;
}

export interface CreateProfileRequestDto {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string; // Format: YYYY-MM-DD
  profile_photo_url?: string | null;
}

// User Profile DTOs
export interface UserProfilesResponseDto {
  userId: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobileNumber: string;
  profilePhotoUrl?: string | null;
  gender: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
  profileCompleted: boolean;
  verifiedEmail: boolean;
  married?: boolean;
  spouseName?: string;
  spouseDob?: string;
  anniversaryDate?: string;
  spousePhotoUrl?: string | null;
  anniversaryPhotoUrl?: string | null;
}

export interface UserProfileResponseDto {
  user_id: number;
  first_name: string;
  last_name: string;
  email_address: string;
  mobile_number: string;
  profile_photo_url?: string | null;
  gender: string;
  date_of_birth: string;
  profile_completed: boolean;
}

export interface UpdateUserProfileRequestDto {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePhotoUrl?: string;
  married?: boolean;
  anniversaryDate?: string;
  spouseName?: string;
  spouseDob?: string;
  spousePhotoUrl?: string;
  anniversaryPhotoUrl?: string;
}

export interface UpdatePrivacyRequestDto {
  allowFamilyVisibility: boolean;
  allowFriendVisibility: boolean;
  allowRelativeVisibility: boolean;
}

// Family Graph & Tree DTOs
export interface CreateFamilyMemberRequestDto {
  familyId?: number;
  userId?: number | null;
  parentMemberId?: number | null;
  memberName: string;
  relationshipType: string;
  gender?: string;
  dateOfBirth?: string; // YYYY-MM-DD

  // Legacy / fallback snake_case support
  member_name?: string;
  relationship_type?: string;
  date_of_birth?: string;
  parent_member_id?: number | null;
  profile_photo_url?: string | null;
}

export interface FamilyMemberResponseDto {
  familyMemberId: number;
  familyId?: number;
  userId?: number | null;
  parentMemberId?: number | null;
  memberName: string;
  relationshipType: string;
  gender?: string;
  dateOfBirth?: string;
  profilePhotoUrl?: string | null;

  // Legacy / fallback snake_case support
  family_member_id?: number;
  member_name?: string;
  relationship_type?: string;
  date_of_birth?: string;
  parent_member_id?: number | null;
  profile_photo_url?: string | null;
}

export interface HomeDashboardResponseDto {
  userId: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  familyMembers: FamilyMemberResponseDto[];
}

// Intelligence Dashboard DTOs
export interface IntelligenceMetricsDto {
  relationship_score: number;
  upcoming_celebrations: number;
  people_not_wished: number;
  activity_tier: string;
}

// Memories / Digital Vault DTOs
export interface MemoryResponseDto {
  memoryId: number;
  cloudAssetUrl?: string;
  mediaUrl?: string;
  mediaType: string;
  caption?: string;
  albumName?: string;
  createdAt: string;
}

export interface CursorPageResponse<T> {
  content: T[];
  hasNext: boolean;
  nextCursorId?: number;
}

// Wish Scheduler DTOs
export interface ScheduleWishRequestDto {
  receiverMemberId: number;
  scheduledDateTime: string;
  wishMessage: string;
  mediaTemplateUrl?: string;
}

export interface ScheduledWishResponseDto {
  wish_id: number;
  receiver_name: string;
  relationship_type: string;
  wish_message: string;
  scheduled_time: string;
  status: string;
}
