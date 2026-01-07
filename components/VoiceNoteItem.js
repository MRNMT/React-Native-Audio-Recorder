import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Play, Pause, Trash2, Edit2, Check, X, Clock, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import { Audio } from 'expo-av';

const VoiceNoteItem = ({ note, onDelete, onRename }) => {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(note.name);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(note.duration || 0);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
            }
        }
    };

    async function playSound() {
        try {
            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                } else {
                    await sound.playAsync();
                }
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: note.uri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );
                setSound(newSound);
            }
        } catch (error) {
            console.error('Error playing sound', error);
            Alert.alert('Error', 'Could not play the audio');
        }
    }

    const handleRename = () => {
        if (newName.trim()) {
            onRename(note.id, newName.trim());
            setIsEditing(false);
        }
    };

    const formatDuration = (millis) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.mainContent}>
                <TouchableOpacity style={styles.playButton} onPress={playSound}>
                    {isPlaying ? (
                        <Pause size={24} color="#6366f1" fill="#6366f1" />
                    ) : (
                        <Play size={24} color="#6366f1" fill="#6366f1" />
                    )}
                </TouchableOpacity>

                <View style={styles.details}>
                    {isEditing ? (
                        <View style={styles.editContainer}>
                            <TextInput
                                style={styles.input}
                                value={newName}
                                onChangeText={setNewName}
                                autoFocus
                            />
                            <TouchableOpacity onPress={handleRename}>
                                <Check size={20} color="#10b981" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsEditing(false)}>
                                <X size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.name} numberOfLines={1}>
                                {note.name}
                            </Text>
                            <View style={styles.metaRow}>
                                <View style={styles.metaIcon}>
                                    <Calendar size={12} color="#94a3b8" />
                                    <Text style={styles.metaText}>
                                        {format(new Date(note.timestamp), 'MMM d, h:mm a')}
                                    </Text>
                                </View>
                                <View style={styles.metaIcon}>
                                    <Clock size={12} color="#94a3b8" />
                                    <Text style={styles.metaText}>{formatDuration(duration)}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.actions}>
                    {!isEditing && (
                        <>
                            <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing(true)}>
                                <Edit2 size={18} color="#94a3b8" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(note.id)}>
                                <Trash2 size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {isPlaying && (
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${(position / duration) * 100}%` }]} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f3ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    details: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    metaText: {
        fontSize: 12,
        color: '#94a3b8',
        marginLeft: 4,
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 8,
        marginLeft: 4,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#6366f1',
        marginRight: 8,
        paddingVertical: 2,
        color: '#1e293b',
    },
    progressBarBg: {
        height: 3,
        backgroundColor: '#f1f5f9',
        borderRadius: 2,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6366f1',
    },
});

export default VoiceNoteItem;
