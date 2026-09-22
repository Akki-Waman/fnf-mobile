// src/components/simulator/DevSimulatorDrawer.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {
  getMockConfig,
  setMockModeEnabled,
  setActivePersona,
  setSimulatedLatency,
  setSimulatedHttpStatus,
} from '../../services/mockApiAdapter';
import { MOCK_PERSONAS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';

export type DeviceFrameType = 'pixel8' | 'galaxyS24' | 'iphone15' | 'fullscreen';

interface DevSimulatorDrawerProps {
  currentFrame: DeviceFrameType;
  onSelectFrame: (frame: DeviceFrameType) => void;
}

const useAuthSafe = () => {
  try {
    return useAuth();
  } catch {
    return null;
  }
};

export const DevSimulatorDrawer: React.FC<DevSimulatorDrawerProps> = ({
  currentFrame,
  onSelectFrame,
}) => {
  const [visible, setVisible] = useState(false);
  const [mockEnabled, setMockEnabled] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState('persona_admin');
  const [latency, setLatency] = useState(300);
  const [httpStatus, setHttpStatus] = useState(200);

  const auth = useAuthSafe();

  useEffect(() => {
    const config = getMockConfig();
    setMockEnabled(config.enabled);
    setSelectedPersona(config.personaId);
    setLatency(config.latencyMs);
    setHttpStatus(config.status);
  }, [visible]);

  const handleToggleMock = async (val: boolean) => {
    setMockEnabled(val);
    await setMockModeEnabled(val);
  };

  const handleSelectPersona = async (personaId: string) => {
    setSelectedPersona(personaId);
    await setActivePersona(personaId);
    if (auth?.checkTokenValidity) {
      await auth.checkTokenValidity();
    }
    Alert.alert('Persona Switched', `Switched active mock user persona.`);
  };

  const handleLatencyChange = async (ms: number) => {
    setLatency(ms);
    await setSimulatedLatency(ms);
  };

  const handleStatusChange = async (status: number) => {
    setHttpStatus(status);
    await setSimulatedHttpStatus(status);
  };

  const handleResetSession = async () => {
    if (auth?.signOut) {
      await auth.signOut();
    }
    Alert.alert('Session Cleared', 'AsyncStorage session & auth token wiped.');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <TouchableOpacity
        style={styles.floatingTrigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.floatingTriggerText}>⚙️ SIMULATOR</Text>
      </TouchableOpacity>

      {/* Dev Harness Modal Drawer */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerTitle}>🤖 Android Simulator & Dev Harness</Text>
                <Text style={styles.headerSubtitle}>Testing Controls & Mock API Engine</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* 1. Mock API Toggle */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>🌐 Mock API Engine</Text>
                    <Text style={styles.sectionDesc}>Intercept backend HTTP endpoints with fake data</Text>
                  </View>
                  <Switch
                    value={mockEnabled}
                    onValueChange={handleToggleMock}
                    trackColor={{ false: '#374151', true: '#4F46E5' }}
                    thumbColor={mockEnabled ? '#818CF8' : '#9CA3AF'}
                  />
                </View>
              </View>

              {/* 2. Persona Switcher */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>👤 Fast Login / Persona Switcher</Text>
                <Text style={styles.sectionDesc}>Instantly test different user account roles</Text>

                {MOCK_PERSONAS.map((p) => {
                  const isSelected = selectedPersona === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.personaOption, isSelected && styles.personaOptionActive]}
                      onPress={() => handleSelectPersona(p.id)}
                    >
                      <View style={styles.personaInfo}>
                        <Text style={[styles.personaName, isSelected && styles.personaNameActive]}>
                          {p.name}
                        </Text>
                        <Text style={styles.personaMeta}>
                          {p.role} • {p.phone}
                        </Text>
                      </View>
                      {isSelected && <Text style={styles.checkmark}>✓ Active</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 3. Device Frame Selector */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>📱 Device Chassis Frame</Text>
                <Text style={styles.sectionDesc}>Simulate different physical screen dimensions</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[styles.chip, currentFrame === 'pixel8' && styles.chipActive]}
                    onPress={() => onSelectFrame('pixel8')}
                  >
                    <Text style={[styles.chipText, currentFrame === 'pixel8' && styles.chipTextActive]}>
                      🤖 Pixel 8 Pro
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chip, currentFrame === 'galaxyS24' && styles.chipActive]}
                    onPress={() => onSelectFrame('galaxyS24')}
                  >
                    <Text style={[styles.chipText, currentFrame === 'galaxyS24' && styles.chipTextActive]}>
                      🤖 Galaxy S24
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chip, currentFrame === 'iphone15' && styles.chipActive]}
                    onPress={() => onSelectFrame('iphone15')}
                  >
                    <Text style={[styles.chipText, currentFrame === 'iphone15' && styles.chipTextActive]}>
                      🍎 iPhone 15 Pro
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chip, currentFrame === 'fullscreen' && styles.chipActive]}
                    onPress={() => onSelectFrame('fullscreen')}
                  >
                    <Text style={[styles.chipText, currentFrame === 'fullscreen' && styles.chipTextActive]}>
                      🖥️ Full Screen
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 4. Network Delay & Error Simulator */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>⚡ Network Latency & Response</Text>
                <Text style={styles.sectionDesc}>Simulate network conditions & server failure codes</Text>

                <Text style={styles.subLabel}>Artificial Latency:</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[styles.chip, latency === 0 && styles.chipActive]}
                    onPress={() => handleLatencyChange(0)}
                  >
                    <Text style={[styles.chipText, latency === 0 && styles.chipTextActive]}>0ms (Instant)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, latency === 300 && styles.chipActive]}
                    onPress={() => handleLatencyChange(300)}
                  >
                    <Text style={[styles.chipText, latency === 300 && styles.chipTextActive]}>300ms (Normal)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, latency === 1500 && styles.chipActive]}
                    onPress={() => handleLatencyChange(1500)}
                  >
                    <Text style={[styles.chipText, latency === 1500 && styles.chipTextActive]}>1.5s (Slow 3G)</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.subLabel, { marginTop: 12 }]}>Simulated HTTP Status:</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[styles.chip, httpStatus === 200 && styles.chipActive]}
                    onPress={() => handleStatusChange(200)}
                  >
                    <Text style={[styles.chipText, httpStatus === 200 && styles.chipTextActive]}>200 OK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, httpStatus === 500 && styles.chipErrorActive]}
                    onPress={() => handleStatusChange(500)}
                  >
                    <Text style={[styles.chipText, httpStatus === 500 && styles.chipTextActive]}>500 Error</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, httpStatus === 401 && styles.chipErrorActive]}
                    onPress={() => handleStatusChange(401)}
                  >
                    <Text style={[styles.chipText, httpStatus === 401 && styles.chipTextActive]}>401 Unauthorized</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 5. Session Actions */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>🧹 Storage & State Tools</Text>
                <TouchableOpacity style={styles.dangerBtn} onPress={handleResetSession}>
                  <Text style={styles.dangerBtnText}>Clear AsyncStorage & Reset Auth</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingTrigger: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 99999,
  },
  floatingTriggerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#1E1E2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D3F',
  },
  headerTitleRow: {
    flex: 1,
  },
  headerTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#2D2D3F',
    borderRadius: 16,
  },
  closeBtnText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  sectionCard: {
    backgroundColor: '#252538',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  subLabel: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 8,
  },
  personaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E2E',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  personaOptionActive: {
    borderColor: '#6366F1',
    backgroundColor: '#2D2D4D',
  },
  personaInfo: {
    flex: 1,
  },
  personaName: {
    color: '#E5E7EB',
    fontWeight: '600',
    fontSize: 14,
  },
  personaNameActive: {
    color: '#818CF8',
  },
  personaMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  checkmark: {
    color: '#818CF8',
    fontWeight: '700',
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1E1E2E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#6366F1',
  },
  chipErrorActive: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
  },
  chipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  dangerBtn: {
    backgroundColor: '#7F1D1D',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerBtnText: {
    color: '#FCA5A5',
    fontWeight: '700',
    fontSize: 13,
  },
});
