import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ImageBackground,
} from 'react-native';
import { Mic, Square, Search, X, MicOff } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';

import { StorageService } from './services/storage';
import VoiceNoteItem from './components/VoiceNoteItem';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const timerRef = useRef(null);
  const recordButtonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const currentSoundRef = useRef(null);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    loadNotes();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function loadNotes() {
    const savedNotes = await StorageService.getNotes();
    setNotes(savedNotes);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Animate record button
      Animated.spring(recordButtonScale, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }).start();

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1000);
      }, 1000);

      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setIsRecording(false);
    clearInterval(timerRef.current);

    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    setRecording(undefined);

    const noteName = `Voice Note ${notes.length + 1}`;
    const newNote = {
      id: Date.now().toString(),
      name: noteName,
      uri: uri,
      timestamp: new Date().toISOString(),
      duration: recordingDuration,
    };

    const updatedNotes = await StorageService.saveNote(newNote);
    setNotes(updatedNotes);
    setRecordingDuration(0);
  }

  const handleDelete = async (id) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this voice note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedNotes = await StorageService.deleteNote(id);
            setNotes(updatedNotes);
          } catch (error) {
            console.error('Error deleting note:', error);
            Alert.alert('Error', 'Failed to delete the voice note. Please try again.');
          }
        },
      },
    ]);
  };

  const handleRename = async (id, newName) => {
    const updatedNotes = await StorageService.updateNote(id, { name: newName });
    setNotes(updatedNotes);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setCurrentPosition(status.positionMillis);
      setCurrentDuration(status.durationMillis);
      if (status.didJustFinish) {
        setCurrentPlayingId(null);
        setCurrentPosition(0);
        setCurrentDuration(0);
        if (currentSoundRef.current) {
          currentSoundRef.current.unloadAsync();
          currentSoundRef.current = null;
        }
      }
    }
  };

  const playNote = async (noteId, noteUri) => {
    try {
      if (currentPlayingId === noteId) {
        // Toggle pause/resume for the current note
        if (currentSoundRef.current) {
          if (isPaused) {
            await currentSoundRef.current.playAsync();
            setIsPaused(false);
          } else {
            await currentSoundRef.current.pauseAsync();
            setIsPaused(true);
          }
        }
      } else {
        // Stop any current playback
        if (currentSoundRef.current) {
          await currentSoundRef.current.stopAsync();
          await currentSoundRef.current.unloadAsync();
          currentSoundRef.current = null;
        }
        // Start new playback
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: noteUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        currentSoundRef.current = newSound;
        setCurrentPlayingId(noteId);
        setIsPaused(false);
      }
    } catch (error) {
      console.error('Error playing sound', error);
      Alert.alert('Error', 'Could not play the audio');
    }
  };

  const seekNote = async (seekPosition) => {
    if (!currentSoundRef.current || currentDuration === 0) return;
    try {
      await currentSoundRef.current.setPositionAsync(Math.max(0, Math.min(seekPosition, currentDuration)));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const rewindNote = async () => {
    if (!currentSoundRef.current || currentDuration === 0) return;
    const newPosition = Math.max(0, currentPosition - 10000); // 10 seconds back
    try {
      await currentSoundRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error rewinding:', error);
    }
  };

  const fastForwardNote = async () => {
    if (!currentSoundRef.current || currentDuration === 0) return;
    const newPosition = Math.min(currentDuration, currentPosition + 10000); // 10 seconds forward
    try {
      await currentSoundRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error fast forwarding:', error);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice Journal</Text>
        <Text style={styles.subtitle}>{notes.length} recordings</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search voice notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        <ImageBackground
          source={require('./assets/icon.png')}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VoiceNoteItem
                note={item}
                onDelete={handleDelete}
                onRename={handleRename}
                onPlay={playNote}
                currentPlayingId={currentPlayingId}
                currentPosition={currentPosition}
                currentDuration={currentDuration}
                onSeek={seekNote}
                onRewind={rewindNote}
                onFastForward={fastForwardNote}
                isPaused={isPaused}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No notes match your search' : 'No recordings yet. Start reflecting!'}
                </Text>
              </View>
            }
          />
        </ImageBackground>
      </Animated.View>

      {/* Recorder UI */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.recorderContainer}
      >
        {isRecording && (
          <View style={styles.recordingStatus}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingTime}>{formatTime(recordingDuration)}</Text>
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: recordButtonScale }] }}>
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingActive]}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
          {isRecording ? (
            <Square size={32} color="#ffffff" fill="#ffffff" />
          ) : (
            <Mic size={32} color="#ffffff" />
          )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.recordLabel}>
          {isRecording ? 'Tap to Save' : 'Tap to Record'}
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  listContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.1, // Very subtle background
    resizeMode: 'cover',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 180, // Space for the record button
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  recorderContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  recordingActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  recordLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  recordingTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
