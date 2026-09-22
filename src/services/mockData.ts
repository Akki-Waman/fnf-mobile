// src/services/mockData.ts
import {
  UserProfilesResponseDto,
  HomeDashboardResponseDto,
  FamilyMemberResponseDto,
  IntelligenceMetricsDto,
  MemoryResponseDto,
} from '../types/api';

export interface MockUserAccount {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  token: string;
  profile: UserProfilesResponseDto;
  familyDashboard: HomeDashboardResponseDto;
}

export const MOCK_PERSONAS: MockUserAccount[] = [
  {
    id: 'persona_admin',
    name: 'John Doe (Admin & Family Head)',
    role: 'Admin',
    phone: '+1 555 123 4567',
    email: 'john.doe@example.com',
    token: 'mock_jwt_token_john_doe_admin_2026',
    profile: {
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john.doe@example.com',
      mobileNumber: '+1 555 123 4567',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      gender: 'MALE',
      dateOfBirth: '1985-06-15',
      profileCompleted: true,
      verifiedEmail: true,
      married: true,
      spouseName: 'Jane Doe',
      spouseDob: '1988-09-20',
      anniversaryDate: '2012-10-18',
      spousePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    },
    familyDashboard: {
      userId: 1,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      mobileNumber: '+1 555 123 4567',
      familyMembers: [
        {
          familyMemberId: 1,
          userId: 1,
          memberName: 'John Doe',
          relationshipType: 'SELF',
          gender: 'MALE',
          dateOfBirth: '1985-06-15',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        {
          familyMemberId: 2,
          userId: 2,
          parentMemberId: 1,
          memberName: 'Jane Doe',
          relationshipType: 'SPOUSE',
          gender: 'FEMALE',
          dateOfBirth: '1988-09-20',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        },
        {
          familyMemberId: 3,
          userId: 3,
          parentMemberId: 1,
          memberName: 'Tommy Doe',
          relationshipType: 'SON',
          gender: 'MALE',
          dateOfBirth: '2014-04-12',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=400&q=80',
        },
        {
          familyMemberId: 4,
          userId: 4,
          parentMemberId: 1,
          memberName: 'Emma Doe',
          relationshipType: 'DAUGHTER',
          gender: 'FEMALE',
          dateOfBirth: '2017-08-25',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        },
        {
          familyMemberId: 5,
          userId: null,
          parentMemberId: 1,
          memberName: 'Robert Doe',
          relationshipType: 'FATHER',
          gender: 'MALE',
          dateOfBirth: '1958-01-10',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        },
        {
          familyMemberId: 6,
          userId: null,
          parentMemberId: 1,
          memberName: 'Margaret Doe',
          relationshipType: 'MOTHER',
          gender: 'FEMALE',
          dateOfBirth: '1960-05-04',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=400&q=80',
        },
      ],
    },
  },
  {
    id: 'persona_member',
    name: 'Jane Doe (Family Member)',
    role: 'Member',
    phone: '+1 555 987 6543',
    email: 'jane.doe@example.com',
    token: 'mock_jwt_token_jane_doe_member_2026',
    profile: {
      userId: 2,
      firstName: 'Jane',
      lastName: 'Doe',
      emailAddress: 'jane.doe@example.com',
      mobileNumber: '+1 555 987 6543',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      gender: 'FEMALE',
      dateOfBirth: '1988-09-20',
      profileCompleted: true,
      verifiedEmail: true,
      married: true,
      spouseName: 'John Doe',
      spouseDob: '1985-06-15',
      anniversaryDate: '2012-10-18',
    },
    familyDashboard: {
      userId: 2,
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      mobileNumber: '+1 555 987 6543',
      familyMembers: [
        {
          familyMemberId: 2,
          userId: 2,
          memberName: 'Jane Doe',
          relationshipType: 'SELF',
          gender: 'FEMALE',
          dateOfBirth: '1988-09-20',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        },
        {
          familyMemberId: 1,
          userId: 1,
          parentMemberId: 2,
          memberName: 'John Doe',
          relationshipType: 'SPOUSE',
          gender: 'MALE',
          dateOfBirth: '1985-06-15',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
      ],
    },
  },
  {
    id: 'persona_new',
    name: 'New User (Fresh Setup)',
    role: 'Guest / New',
    phone: '+1 555 000 1111',
    email: 'newuser@example.com',
    token: 'mock_jwt_token_new_user_2026',
    profile: {
      userId: 99,
      firstName: 'Alex',
      lastName: 'Smith',
      emailAddress: 'newuser@example.com',
      mobileNumber: '+1 555 000 1111',
      profilePhotoUrl: null,
      gender: 'OTHER',
      dateOfBirth: '1995-12-01',
      profileCompleted: false,
      verifiedEmail: false,
    },
    familyDashboard: {
      userId: 99,
      fullName: 'Alex Smith',
      email: 'newuser@example.com',
      mobileNumber: '+1 555 000 1111',
      familyMembers: [],
    },
  },
];

export const MOCK_INTELLIGENCE_METRICS: IntelligenceMetricsDto = {
  relationship_score: 92,
  upcoming_celebrations: 3,
  people_not_wished: 1,
  activity_tier: 'Gold Family Active',
};

export const MOCK_CELEBRATIONS = [
  {
    id: 101,
    title: "Tommy's 12th Birthday",
    memberName: "Tommy Doe",
    relationship: "Son",
    eventDate: "2026-09-12",
    daysRemaining: 4,
    photoUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=400&q=80",
    eventType: "BIRTHDAY",
  },
  {
    id: 102,
    title: "14th Wedding Anniversary",
    memberName: "Jane Doe",
    relationship: "Spouse",
    eventDate: "2026-10-18",
    daysRemaining: 40,
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    eventType: "ANNIVERSARY",
  },
  {
    id: 103,
    title: "Robert's 68th Birthday",
    memberName: "Robert Doe",
    relationship: "Father",
    eventDate: "2027-01-10",
    daysRemaining: 124,
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    eventType: "BIRTHDAY",
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Upcoming Birthday Reminder',
    message: "Tommy's birthday is in 4 days! Would you like to schedule a wish or gift?",
    timeAgo: '2 hours ago',
    read: false,
    type: 'EVENT_REMINDER',
  },
  {
    id: 'notif_2',
    title: 'New Memory Shared',
    message: 'Jane Doe added 3 new photos to the "Summer Vacation 2026" album.',
    timeAgo: '1 day ago',
    read: true,
    type: 'MEMORY_ADDED',
  },
  {
    id: 'notif_3',
    title: 'Family Tree Sync Success',
    message: 'Margaret Doe was linked as Mother of John Doe.',
    timeAgo: '3 days ago',
    read: true,
    type: 'SYSTEM',
  },
];

export const MOCK_MEMORIES: MemoryResponseDto[] = [
  {
    memoryId: 1,
    cloudAssetUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
    mediaType: 'IMAGE',
    caption: 'Family Picnic at Pine Creek Lake 🌲☀️',
    albumName: 'Summer 2026',
    createdAt: '2026-08-15T14:30:00Z',
  },
  {
    memoryId: 2,
    cloudAssetUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80',
    mediaType: 'IMAGE',
    caption: 'Emma singing at school talent show 🎤🎵',
    albumName: 'Celebrations',
    createdAt: '2026-06-20T10:15:00Z',
  },
  {
    memoryId: 3,
    cloudAssetUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    mediaType: 'IMAGE',
    caption: 'Reunion dinner with Grandpa Robert & Grandma Margaret',
    albumName: 'Family Dinners',
    createdAt: '2026-05-02T19:00:00Z',
  },
];
