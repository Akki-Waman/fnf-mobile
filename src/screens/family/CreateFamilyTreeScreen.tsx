import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { familyApi } from '../../services/familyApi';
import { FamilyMemberResponseDto } from '../../types/api';
import { MIN_DATE_PICKER, MAX_DATE_PICKER, formatDateToYYYYMMDD } from '../../util/dateUtils';

// ---- Types ----
export type RelationType =
  | 'FATHER'
  | 'MOTHER'
  | 'BROTHER'
  | 'SISTER'
  | 'SPOUSE'
  | 'SON'
  | 'DAUGHTER'
  | 'GRANDFATHER'
  | 'GRANDMOTHER'
  | 'UNCLE'
  | 'AUNT'
  | 'COUSIN'
  | 'OTHER';

export type FamilyMemberNode = {
  familyMemberId: string;
  familyId?: number;
  userId?: number | null;
  name: string;
  relation: RelationType;
  dateOfBirth?: string | null;
  gender?: string | null;
  profilePhotoUrl?: string | null;
  parentMemberId?: string | null;
};

function toRelationType(value?: string | null): RelationType {
  const upper = (value ?? '').toUpperCase();
  return (RELATIONS.find((r) => r.key === upper)?.key as RelationType) ?? 'OTHER';
}

function fromApiDto(dto: FamilyMemberResponseDto, localPhotoUri?: string | null): FamilyMemberNode {
  const id = String(dto.familyMemberId ?? dto.family_member_id ?? '');
  const rawPhoto = dto.profilePhotoUrl ?? dto.profile_photo_url ?? null;
  const resolvedPhotoUrl = rawPhoto
    ? familyApi.getPhotoUrl(rawPhoto, Date.now())
    : localPhotoUri
    ? localPhotoUri
    : familyApi.getPhotoUrl(id, Date.now());

  return {
    familyMemberId: id,
    familyId: dto.familyId,
    userId: dto.userId,
    name: dto.memberName ?? dto.member_name ?? '',
    relation: toRelationType(dto.relationshipType ?? dto.relationship_type),
    dateOfBirth: dto.dateOfBirth ?? dto.date_of_birth ?? null,
    gender: dto.gender,
    profilePhotoUrl: resolvedPhotoUrl,
    parentMemberId:
      (dto.parentMemberId ?? dto.parent_member_id) != null
        ? String(dto.parentMemberId ?? dto.parent_member_id)
        : null,
  };
}

const RELATIONS: {
  key: RelationType;
  label: string;
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'FATHER', label: 'Father', color: '#3B82F6', bg: '#DBEAFE', icon: 'man-outline' },
  { key: 'MOTHER', label: 'Mother', color: '#EC4899', bg: '#FCE7F3', icon: 'woman-outline' },
  { key: 'BROTHER', label: 'Brother', color: '#10B981', bg: '#D1FAE5', icon: 'man-outline' },
  { key: 'SISTER', label: 'Sister', color: '#10B981', bg: '#D1FAE5', icon: 'woman-outline' },
  { key: 'SPOUSE', label: 'Spouse', color: '#EF4444', bg: '#FEE2E2', icon: 'heart-outline' },
  { key: 'SON', label: 'Son', color: '#8B5CF6', bg: '#EDE9FE', icon: 'man-outline' },
  { key: 'DAUGHTER', label: 'Daughter', color: '#8B5CF6', bg: '#EDE9FE', icon: 'woman-outline' },
  { key: 'GRANDFATHER', label: 'Grandfather', color: '#F97316', bg: '#FFEDD5', icon: 'man-outline' },
  { key: 'GRANDMOTHER', label: 'Grandmother', color: '#F97316', bg: '#FFEDD5', icon: 'woman-outline' },
  { key: 'UNCLE', label: 'Uncle', color: '#06B6D4', bg: '#CFFAFE', icon: 'man-outline' },
  { key: 'AUNT', label: 'Aunt', color: '#06B6D4', bg: '#CFFAFE', icon: 'woman-outline' },
  { key: 'COUSIN', label: 'Cousin', color: '#F59E0B', bg: '#FEF3C7', icon: 'people-outline' },
  { key: 'OTHER', label: 'Other', color: '#6B7280', bg: '#F3F4F6', icon: 'person-outline' },
];

function relationConfig(key: RelationType) {
  return (
    RELATIONS.find((r) => r.key === key) ?? {
      key: 'OTHER',
      label: 'Relative',
      color: '#6B7280',
      bg: '#F3F4F6',
      icon: 'person-outline',
    }
  );
}

function initials(name: string) {
  if (!name) return 'FM';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CreateFamilyTreeScreen({ onContinue }: { onContinue?: () => void }) {
  const [familyTree, setFamilyTree] = useState<FamilyMemberNode[]>([]);
  const [userDetails, setUserDetails] = useState<{ fullName?: string; email?: string; mobileNumber?: string }>({});
  const [loadingTree, setLoadingTree] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<RelationType | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [parentMemberId, setParentMemberId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Photo Upload & Error State per Member Card
  const [updatingPhotoNodeId, setUpdatingPhotoNodeId] = useState<string | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [imageLoadingMap, setImageLoadingMap] = useState<Record<string, boolean>>({});

  // Success Modal
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadTree = async () => {
    try {
      let treeNodes: FamilyMemberNode[] = [];
      const res = await familyApi.getFamilyTree();
      if (res.success && res.data) {
        const data = res.data;
        setUserDetails({
          fullName: data.fullName,
          email: data.email,
          mobileNumber: data.mobileNumber,
        });

        if (Array.isArray(data.familyMembers)) {
          treeNodes = data.familyMembers.map((dto) => fromApiDto(dto));
        } else if (Array.isArray(data)) {
          treeNodes = (data as any[]).map((dto) => fromApiDto(dto));
        }
      }

      // Merge Spouse info if added via Profile Edit
      const spouseRaw = await AsyncStorage.getItem('@user_spouse_info');
      if (spouseRaw) {
        const spouseData = JSON.parse(spouseRaw);
        if (spouseData.spouseName && !treeNodes.some((m) => m.relation === 'SPOUSE' || m.name === spouseData.spouseName)) {
          treeNodes.push({
            familyMemberId: 'spouse_auto_id',
            name: spouseData.spouseName,
            relation: 'SPOUSE',
            dateOfBirth: spouseData.spouseDob || null,
            gender: 'FEMALE',
            profilePhotoUrl: spouseData.spousePhotoUrl || null,
          });
        }
      }

      setFamilyTree(treeNodes);
    } catch (error) {
      console.log('No existing family tree found', error);
    } finally {
      setLoadingTree(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTree();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTree();
  };

  // Image Selection with Client-Side Validation
  const handleSelectFormImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Permission to access photo gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      // Client-side validation: File size max 5MB
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select an image smaller than 5MB.');
        return;
      }

      // Client-side validation: Image type check
      const ext = (asset.uri.split('.').pop() || '').toLowerCase();
      const validExts = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
      if (ext && !validExts.includes(ext) && asset.type && !asset.type.includes('image')) {
        Alert.alert('Invalid Format', 'Only JPG, PNG, and WEBP image files are supported.');
        return;
      }

      setSelectedImage(asset.uri);
    }
  };

  // Edit Photo for existing Family Member Node
  const handleUpdateMemberPhoto = async (member: FamilyMemberNode) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Permission to access photo gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      // Client-side validation: Max 5MB
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select an image smaller than 5MB.');
        return;
      }

      // Client-side validation: Image format check
      const ext = (asset.uri.split('.').pop() || '').toLowerCase();
      const validExts = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
      if (ext && !validExts.includes(ext) && asset.type && !asset.type.includes('image')) {
        Alert.alert('Invalid Format', 'Only JPG, PNG, and WEBP image files are supported.');
        return;
      }

      try {
        setUpdatingPhotoNodeId(member.familyMemberId);
        const res = await familyApi.updateMemberPhoto(member.familyMemberId, asset.uri);

        if (res.success && res.data) {
          const timestamp = Date.now();
          const rawPhotoUrl = res.data.profilePhotoUrl ?? res.data.profile_photo_url;
          const newPhotoUrl = familyApi.getPhotoUrl(rawPhotoUrl || member.familyMemberId, timestamp);

          // Optimistically update local state with cache-busting timestamp
          setFamilyTree((prev) =>
            prev.map((m) =>
              m.familyMemberId === member.familyMemberId
                ? { ...m, profilePhotoUrl: newPhotoUrl }
                : m
            )
          );

          // Clear error state for this node
          setImageErrorMap((prev) => ({ ...prev, [member.familyMemberId]: false }));

          setSuccessMessage(res.message || 'Profile photo updated successfully!');
          setSuccessModalVisible(true);
        } else {
          Alert.alert('Update Failed', res.message || 'Could not update profile photo.');
        }
      } catch (error: any) {
        console.log('Update photo error', error);
        Alert.alert(
          'Update Failed',
          error?.response?.data?.message || 'Failed to upload new photo. Please try again.',
        );
      } finally {
        setUpdatingPhotoNodeId(null);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setRelation(null);
    setDateOfBirth(null);
    setGender(null);
    setParentMemberId(null);
    setSelectedImage(null);
    setShowDatePicker(false);
  };

  const handleSaveNode = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your family member.');
      return;
    }
    if (!relation) {
      Alert.alert('Missing Relationship', 'Please select a relationship.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        familyId: 1,
        memberName: name.trim(),
        relationshipType: relation,
        gender: gender || (['FATHER', 'BROTHER', 'SON', 'GRANDFATHER', 'UNCLE'].includes(relation) ? 'MALE' : 'FEMALE'),
        dateOfBirth: dateOfBirth ? formatDateToYYYYMMDD(dateOfBirth) : '1990-01-01',
        parentMemberId: parentMemberId ? Number(parentMemberId) : null,
      };

      const res = await familyApi.addFamilyMember(payload, selectedImage);

      if (res.success && res.data) {
        const createdId = res.data.familyMemberId ?? res.data.family_member_id;

        if (selectedImage && createdId) {
          try {
            await familyApi.updateMemberPhoto(createdId, selectedImage);
          } catch (photoErr) {
            console.log('Background member photo sync error:', photoErr);
          }
        }

        const newMember = fromApiDto(res.data, selectedImage);

        if (createdId) {
          setImageErrorMap((prev) => ({ ...prev, [String(createdId)]: false }));
        }

        setFamilyTree((prev) => [...prev, newMember]);
        setModalVisible(false);
        resetForm();
        setSuccessMessage(res.message || 'Family member added successfully.');
        setSuccessModalVisible(true);
      } else {
        Alert.alert('Validation Error', res.message || 'Could not add this family member.');
      }
    } catch (error: any) {
      console.log('Failed to add family member', error);
      const backendError = error?.response?.data?.message || error?.message || 'Could not add this family member. Please try again.';
      Alert.alert('Error', backendError);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNode = (nodeId: string, memberName: string) => {
    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove ${memberName} from your family tree?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const res = await familyApi.removeFamilyMember(nodeId);
              if (res.success) {
                setFamilyTree((prev) => prev.filter((m) => m.familyMemberId !== nodeId));
                setSuccessMessage(res.message || 'Family member removed successfully.');
                setSuccessModalVisible(true);
              } else {
                Alert.alert('Error', res.message || 'Could not remove member.');
              }
            } catch (error: any) {
              console.log('Delete node error', error);
              Alert.alert('Error', error?.response?.data?.message || 'Failed to remove family member.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#FF9A62', '#FF6B8A', '#A53FE7']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Create your Family Tree</Text>
          <Text style={styles.headerSubtitle}>
            Add your loved ones to build your family network
          </Text>
        </View>

        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B8A']} />}
        >
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Family Canvas</Text>
              <Text style={styles.memberCount}>
                {familyTree.length} {familyTree.length === 1 ? 'member' : 'members'}
              </Text>
            </View>

            {loadingTree ? (
              <View style={styles.skeletonContainer}>
                <View style={styles.skeletonNodeRow}>
                  <View style={styles.skeletonNode}>
                    <View style={styles.skeletonAvatar} />
                    <View style={styles.skeletonTextShort} />
                  </View>
                  <View style={styles.skeletonNode}>
                    <View style={styles.skeletonAvatar} />
                    <View style={styles.skeletonTextShort} />
                  </View>
                </View>
                <ActivityIndicator color="#FF6B8A" size="small" style={{ marginTop: 12 }} />
              </View>
            ) : (
              <View style={styles.treeContainer}>
                {(() => {
                  const olderGen = familyTree.filter((m) => ['GRANDFATHER', 'GRANDMOTHER'].includes(m.relation));
                  const parentsGen = familyTree.filter((m) => ['FATHER', 'MOTHER', 'UNCLE', 'AUNT'].includes(m.relation));
                  const sameGen = familyTree.filter((m) => ['BROTHER', 'SISTER', 'SPOUSE', 'COUSIN', 'OTHER'].includes(m.relation));
                  const youngerGen = familyTree.filter((m) => ['SON', 'DAUGHTER'].includes(m.relation));

                  const renderNodes = (nodes: typeof familyTree, title: string) => {
                    if (nodes.length === 0) return null;
                    return (
                      <View style={styles.generationGroup}>
                        <Text style={styles.generationTitle}>{title}</Text>
                        <View style={styles.nodesGrid}>
                          {nodes.map((member) => {
                            const cfg = relationConfig(member.relation);
                            const photoUrl = member.profilePhotoUrl;
                            const hasPhoto = Boolean(photoUrl) && !imageErrorMap[member.familyMemberId];
                            const isUpdatingPhoto = updatingPhotoNodeId === member.familyMemberId;
                            const isImageLoading = imageLoadingMap[member.familyMemberId];

                            return (
                              <View key={member.familyMemberId} style={styles.memberNode}>
                                {/* Delete Button */}
                                <TouchableOpacity
                                  style={styles.deleteHint}
                                  onPress={() => handleDeleteNode(member.familyMemberId, member.name)}
                                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                  <Ionicons name="trash" size={14} color="#EF4444" />
                                </TouchableOpacity>

                                {/* Avatar Container */}
                                <View style={[styles.memberAvatar, { borderColor: cfg.color, backgroundColor: cfg.bg }]}>
                                  {hasPhoto ? (
                                    <Image
                                      source={{ uri: photoUrl! }}
                                      style={styles.memberImage}
                                      resizeMode="cover"
                                      onLoadStart={() =>
                                        setImageLoadingMap((prev) => ({ ...prev, [member.familyMemberId]: true }))
                                      }
                                      onLoadEnd={() =>
                                        setImageLoadingMap((prev) => ({ ...prev, [member.familyMemberId]: false }))
                                      }
                                      onError={() => {
                                        setImageLoadingMap((prev) => ({ ...prev, [member.familyMemberId]: false }));
                                        setImageErrorMap((prev) => ({ ...prev, [member.familyMemberId]: true }));
                                      }}
                                    />
                                  ) : (
                                    <Text style={[styles.memberInitials, { color: cfg.color }]}>
                                      {initials(member.name)}
                                    </Text>
                                  )}

                                  {/* Loading Spinner for Image Fetch or Photo Upload */}
                                  {(isImageLoading || isUpdatingPhoto) && (
                                    <View style={styles.avatarLoadingOverlay}>
                                      <ActivityIndicator size="small" color={cfg.color} />
                                    </View>
                                  )}

                                  {/* Relation Badge */}
                                  <View style={[styles.relationBadge, { backgroundColor: cfg.color }]}>
                                    <Ionicons name={cfg.icon} size={10} color="#FFFFFF" />
                                  </View>

                                  {/* Edit/Change Photo Overlay Button */}
                                  <TouchableOpacity
                                    style={[styles.editPhotoButton, { backgroundColor: cfg.color }]}
                                    onPress={() => handleUpdateMemberPhoto(member)}
                                    disabled={isUpdatingPhoto}
                                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                  >
                                    {isUpdatingPhoto ? (
                                      <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                      <Ionicons name="camera" size={10} color="#FFFFFF" />
                                    )}
                                  </TouchableOpacity>
                                </View>

                                <Text style={styles.memberName} numberOfLines={1}>
                                  {member.name}
                                </Text>
                                <View style={[styles.chipBadge, { backgroundColor: cfg.bg }]}>
                                  <Text style={[styles.chipText, { color: cfg.color }]}>{cfg.label}</Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                        <View style={styles.treeConnectorTrunk} />
                      </View>
                    );
                  };

                  return (
                    <>
                      {renderNodes(olderGen, 'Grandparents')}
                      {renderNodes(parentsGen, 'Parents')}

                      {/* Root node - current user */}
                      <View style={styles.generationGroup}>
                        <Text style={styles.generationTitle}>You</Text>
                        <View style={styles.rootRow}>
                          <View style={styles.rootNode}>
                            <LinearGradient
                              colors={['#FF6B8A', '#A53FE7']}
                              style={styles.rootAvatarRing}
                            >
                              <View style={styles.rootAvatarInner}>
                                <Ionicons name="person" size={28} color="#FFFFFF" />
                              </View>
                            </LinearGradient>
                            <Text style={styles.rootLabel}>
                              {userDetails?.fullName || 'You'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.treeConnectorTrunk} />
                      </View>

                      {renderNodes(sameGen, 'Spouse & Siblings')}
                      {renderNodes(youngerGen, 'Children')}
                    </>
                  );
                })()}

                {familyTree.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyStateText}>
                      No family members added yet.{'\n'}Tap below to build your family network!
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomWrapper}>
          <TouchableOpacity
            style={styles.addFamilyBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B8A', '#FF9A62']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.addFamilyBtnText}>Add Family Member</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Add Member Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Photo Upload Section */}
              <View style={styles.photoUploadContainer}>
                <TouchableOpacity onPress={handleSelectFormImage} style={styles.photoPreviewWrapper}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.photoPreview} resizeMode="cover" />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                      <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Upload Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.photoHelperText}>Optional • Max 5MB (JPG, PNG, WEBP)</Text>
              </View>

              <Text style={styles.fieldLabel}>Member Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Dad, Pooja"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.datePickerBox}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {dateOfBirth ? formatDateDisplay(dateOfBirth) : 'Select Date of Birth'}
                </Text>
                <Ionicons name="calendar-outline" size={22} color="#FF6B8A" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth || new Date('1995-01-01')}
                  mode="date"
                  display="default"
                  minimumDate={MIN_DATE_PICKER}
                  maximumDate={MAX_DATE_PICKER}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) setDateOfBirth(selectedDate);
                  }}
                />
              )}

              <Text style={styles.fieldLabel}>Relationship</Text>
              <View style={styles.chipRow}>
                {RELATIONS.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[
                      styles.relationChip,
                      { backgroundColor: r.bg },
                      relation === r.key && { borderWidth: 2, borderColor: r.color },
                    ]}
                    onPress={() => setRelation(r.key)}
                  >
                    <Ionicons name={r.icon} size={16} color={r.color} />
                    <Text style={[styles.relationChipText, { color: r.color }]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveNode}
                disabled={saving}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#FF6B8A', '#FF9A62']} style={styles.saveGradient}>
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Add to Family Tree</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={54} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Success</Text>
            <Text style={styles.successText}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.successBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B8A',
  },
  treeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  skeletonContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    width: '100%',
  },
  skeletonNodeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  skeletonNode: {
    width: 90,
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  skeletonTextShort: {
    width: 50,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  generationGroup: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  generationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  nodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  memberNode: {
    width: 108,
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  deleteHint: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 4,
    zIndex: 10,
  },
  memberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  memberImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  memberInitials: {
    fontSize: 18,
    fontWeight: '800',
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editPhotoButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 12,
  },
  memberName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  chipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  treeConnectorTrunk: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
  rootRow: {
    alignItems: 'center',
  },
  rootNode: {
    alignItems: 'center',
  },
  rootAvatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  rootAvatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    backgroundColor: '#A53FE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 10,
  },
  addFamilyBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  gradientBtn: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFamilyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  photoUploadContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  photoPreviewWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHelperText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 14,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  datePickerBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 15,
    color: '#111827',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  relationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  relationChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 20,
  },
  saveGradient: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 30,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    elevation: 8,
  },
  successIconCircle: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  successText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  successBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  successBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});