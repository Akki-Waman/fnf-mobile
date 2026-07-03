import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  DateTimePickerEvent,
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { apiClient } from '../../services/api';

// ---- Types ----
export type RelationType =
  | 'FATHER'
  | 'MOTHER'
  | 'SPOUSE'
  | 'SIBLING'
  | 'CHILD'
  | 'GRANDPARENT'
  | 'OTHER';

// Internal, camelCase shape used throughout this screen.
export type FamilyMemberNode = {
  familyMemberId: string; // stringified Long for use as React keys / comparisons
  name: string;
  relation: RelationType;
  dateOfBirth?: string | null; // YYYY-MM-DD
  gender?: string | null;
  profilePhotoUrl?: string | null;
  parentMemberId?: string | null;
};

// Exact wire shape of FamilyMemberResponseDto (snake_case via @JsonProperty).
type FamilyMemberResponseDto = {
  family_member_id: number;
  member_name: string;
  relationship_type: string;
  gender?: string | null;
  date_of_birth?: string | null;
  profile_photo_url?: string | null;
  parent_member_id?: number | null;
};

function toRelationType(value?: string | null): RelationType {
  const upper = (value ?? '').toUpperCase();
  return (RELATIONS.find((r) => r.key === upper)?.key as RelationType) ?? 'OTHER';
}

function fromApiDto(dto: FamilyMemberResponseDto): FamilyMemberNode {
  return {
    familyMemberId: String(dto.family_member_id),
    name: dto.member_name ?? '',
    relation: toRelationType(dto.relationship_type),
    dateOfBirth: dto.date_of_birth ?? null,
    gender: dto.gender ?? null,
    profilePhotoUrl: dto.profile_photo_url ?? null,
    parentMemberId: dto.parent_member_id != null ? String(dto.parent_member_id) : null,
  };
}

// Exact wire shape expected by CreateFamilyMemberRequestDto (snake_case, matching the response DTO's convention).
type CreateFamilyMemberRequestDto = {
  member_name: string;
  relationship_type: RelationType;
  date_of_birth?: string;
  gender?: string;
  parent_member_id?: number | null;
};

type CreateFamilyTreeScreenProps = {
  onContinue?: (members: FamilyMemberNode[]) => void;
  onSkip?: () => void;
};

// ---- Relation config (used for chips, colors, and node badges) ----
const RELATIONS: {
  key: RelationType;
  label: string;
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'FATHER', label: 'Father', color: '#3B82F6', bg: '#DBEAFE', icon: 'man-outline' },
  { key: 'MOTHER', label: 'Mother', color: '#EC4899', bg: '#FCE7F3', icon: 'woman-outline' },
  { key: 'SPOUSE', label: 'Spouse', color: '#EF4444', bg: '#FEE2E2', icon: 'heart-outline' },
  { key: 'SIBLING', label: 'Sibling', color: '#10B981', bg: '#D1FAE5', icon: 'people-outline' },
  { key: 'CHILD', label: 'Child', color: '#8B5CF6', bg: '#EDE9FE', icon: 'happy-outline' },
  { key: 'GRANDPARENT', label: 'Grandparent', color: '#F97316', bg: '#FFEDD5', icon: 'walk-outline' },
  { key: 'OTHER', label: 'Relative', color: '#6B7280', bg: '#F3F4F6', icon: 'person-outline' },
];

const GENDERS = ['Male', 'Female', 'Other'];

function relationConfig(relation: RelationType) {
  return RELATIONS.find((r) => r.key === relation) ?? RELATIONS[RELATIONS.length - 1];
}

function initials(name?: string | null) {
  if (!name || !name.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

// Display format: 12 May 1998
function formatDateDisplay(date: Date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Payload format for the backend: 1998-05-12 (LocalDate-friendly)
function formatDateForApi(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function CreateFamilyTreeScreen({ onContinue, onSkip }: CreateFamilyTreeScreenProps) {
  const [members, setMembers] = useState<FamilyMemberNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<RelationType | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [parentMemberId, setParentMemberId] = useState<string | null>(null);

  // Load any existing tree so returning users don't lose progress.
  useEffect(() => {
    const loadTree = async () => {
      try {
        const res = await apiClient.get('/family/tree');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const raw: FamilyMemberResponseDto[] = res.data.data;
          setMembers(raw.map(fromApiDto));
        }
      } catch (error) {
        // No tree yet, or endpoint not reachable — safe to start from empty state.
        console.log('No existing family tree found', error);
      } finally {
        setLoadingTree(false);
      }
    };
    loadTree();
  }, []);

  const resetForm = () => {
    setName('');
    setRelation(null);
    setDateOfBirth(null);
    setShowDatePicker(false);
    setGender(null);
    setParentMemberId(null);
  };

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'set' && selected) {
      setDateOfBirth(selected);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      // Android: open the native dialog imperatively. Rendering <DateTimePicker />
      // declaratively while nested inside our own <Modal> can get swallowed by
      // the Modal's window, so this avoids that entirely.
      DateTimePickerAndroid.open({
        value: dateOfBirth ?? new Date(2000, 0, 1),
        mode: 'date',
        maximumDate: new Date(),
        onChange: handleDateChange,
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const openModal = (prefill?: RelationType) => {
    resetForm();
    if (prefill) setRelation(prefill);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalVisible(false);
    resetForm();
  };

  const handleAddMember = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', "Let's give this family member a name.");
      return;
    }
    if (!relation) {
      Alert.alert('Relation required', 'Choose how they relate to you.');
      return;
    }

    const dto: CreateFamilyMemberRequestDto = {
      member_name: name.trim(),
      relationship_type: relation,
      ...(dateOfBirth ? { date_of_birth: formatDateForApi(dateOfBirth) } : {}),
      ...(gender ? { gender } : {}),
      parent_member_id: parentMemberId ? Number(parentMemberId) : null,
    };

    setSaving(true);
    try {
      const res = await apiClient.post('/family/node', dto);
      if (res.data?.success && res.data?.data) {
        const newMember = fromApiDto(res.data.data as FamilyMemberResponseDto);
        setMembers((prev) => [...prev, newMember]);
        setModalVisible(false);
        resetForm();
      } else {
        Alert.alert('Something went wrong', res.data?.message || 'Could not add this family member.');
      }
    } catch (error) {
      console.log('Failed to add family member', error);
      Alert.alert('Something went wrong', 'Could not add this family member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (members.length === 0) {
      Alert.alert(
        'Your tree is empty',
        'Add at least one family member to continue, or skip for now.',
        [
          { text: 'Skip for now', style: 'cancel', onPress: onSkip },
          { text: 'Keep Adding', style: 'default' },
        ]
      );
      return;
    }
    onContinue?.(members);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7C3AED', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Create your Family Tree</Text>
            <Text style={styles.headerSubtitle}>Add your family to get started</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tree visualization card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Your Tree</Text>
            <Text style={styles.memberCount}>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>

          {loadingTree ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color="#8B5CF6" />
            </View>
          ) : (
            <>
              {/* Root node - the current user */}
              <View style={styles.rootRow}>
                <View style={styles.rootNode}>
                  <View style={styles.rootAvatar}>
                    <Ionicons name="person" size={26} color="#FFFFFF" />
                  </View>
                  <Text style={styles.rootLabel}>You</Text>
                </View>
              </View>

              {members.length > 0 && <View style={styles.treeConnectorTrunk} />}

              {members.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="git-network-outline" size={28} color="#C4B5FD" />
                  <Text style={styles.emptyStateText}>
                    No family members yet. Start with a parent, sibling or spouse.
                  </Text>
                </View>
              ) : (
                <View style={styles.nodesGrid}>
                  {members.map((member) => {
                    const cfg = relationConfig(member.relation);
                    return (
                      <View key={member.familyMemberId} style={styles.memberNode}>
                        <View style={[styles.memberAvatar, { backgroundColor: cfg.bg }]}>
                          <Text style={[styles.memberInitials, { color: cfg.color }]}>
                            {initials(member.name)}
                          </Text>
                          <View style={[styles.relationBadge, { backgroundColor: cfg.color }]}>
                            <Ionicons name={cfg.icon} size={10} color="#FFFFFF" />
                          </View>
                        </View>
                        <Text style={styles.memberName} numberOfLines={1}>
                          {member.name}
                        </Text>
                        <Text style={[styles.memberRelation, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    );
                  })}

                  <TouchableOpacity style={styles.addNode} onPress={() => openModal()}>
                    <View style={styles.addNodeCircle}>
                      <Ionicons name="add" size={22} color="#8B5CF6" />
                    </View>
                    <Text style={styles.addNodeLabel}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        {/* Quick-add relation shortcuts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Add</Text>
          <View style={styles.chipRow}>
            {RELATIONS.slice(0, 6).map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.relationChip, { backgroundColor: r.bg }]}
                onPress={() => openModal(r.key)}
              >
                <Ionicons name={r.icon} size={16} color={r.color} />
                <Text style={[styles.relationChipText, { color: r.color }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.bottomWrapper}>
        <TouchableOpacity style={styles.addMemberButton} onPress={() => openModal()}>
          <Ionicons name="person-add-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.addMemberButtonText}>Add Family Member</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Add Family Member modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Relation</Text>
              <View style={styles.chipRow}>
                {RELATIONS.map((r) => {
                  const selected = relation === r.key;
                  return (
                    <TouchableOpacity
                      key={r.key}
                      style={[
                        styles.relationChip,
                        { backgroundColor: selected ? r.color : r.bg },
                      ]}
                      onPress={() => setRelation(r.key)}
                    >
                      <Ionicons name={r.icon} size={16} color={selected ? '#FFFFFF' : r.color} />
                      <Text
                        style={[
                          styles.relationChipText,
                          { color: selected ? '#FFFFFF' : r.color },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rajesh Mehra"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>Date of Birth (optional)</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={openDatePicker}
                activeOpacity={0.7}
              >
                <Text style={dateOfBirth ? styles.dateInputText : styles.dateInputPlaceholder}>
                  {dateOfBirth ? formatDateDisplay(dateOfBirth) : 'Select date of birth'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />
              </TouchableOpacity>

              {Platform.OS === 'ios' && showDatePicker && (
                <>
                  <DateTimePicker
                    value={dateOfBirth ?? new Date(2000, 0, 1)}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                    themeVariant="light"
                  />
                  <TouchableOpacity
                    style={styles.dateDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.dateDoneButtonText}>Done</Text>
                  </TouchableOpacity>
                </>
              )}

              <Text style={styles.fieldLabel}>Gender (optional)</Text>
              <View style={styles.chipRow}>
                {GENDERS.map((g) => {
                  const selected = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderChip,
                        selected && styles.genderChipSelected,
                      ]}
                      onPress={() => setGender(selected ? null : g)}
                    >
                      <Text style={[styles.genderChipText, selected && styles.genderChipTextSelected]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {members.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>Connects to (optional)</Text>
                  <View style={styles.chipRow}>
                    <TouchableOpacity
                      style={[
                        styles.genderChip,
                        parentMemberId === null && styles.genderChipSelected,
                      ]}
                      onPress={() => setParentMemberId(null)}
                    >
                      <Text
                        style={[
                          styles.genderChipText,
                          parentMemberId === null && styles.genderChipTextSelected,
                        ]}
                      >
                        You
                      </Text>
                    </TouchableOpacity>
                    {members.map((m) => (
                      <TouchableOpacity
                        key={m.familyMemberId}
                        style={[
                          styles.genderChip,
                          parentMemberId === m.familyMemberId && styles.genderChipSelected,
                        ]}
                        onPress={() => setParentMemberId(m.familyMemberId)}
                      >
                        <Text
                          style={[
                            styles.genderChipText,
                            parentMemberId === m.familyMemberId && styles.genderChipTextSelected,
                          ]}
                        >
                          {m.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleAddMember}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Add to Tree</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerGradient: {
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 6,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -5,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  rootRow: {
    alignItems: 'center',
  },
  rootNode: {
    alignItems: 'center',
  },
  rootAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  treeConnectorTrunk: {
    alignSelf: 'center',
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  nodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
  },
  memberNode: {
    width: 76,
    alignItems: 'center',
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitials: {
    fontSize: 16,
    fontWeight: '700',
  },
  relationBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  memberRelation: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  addNode: {
    width: 76,
    alignItems: 'center',
  },
  addNodeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF8FF',
  },
  addNodeLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  relationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  relationChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  addMemberButton: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addMemberButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  skipButtonText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateInputText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  dateInputPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  dateDoneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dateDoneButtonText: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '700',
  },
  genderChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  genderChipSelected: {
    backgroundColor: '#7C3AED',
  },
  genderChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  genderChipTextSelected: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});