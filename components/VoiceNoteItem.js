import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Play, Pause, Rewind, FastForward, Trash2, Edit2, Check, X, Clock, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';

const VoiceNoteItem = ({ note, onDelete, onRename, onPlay, currentPlayingId, currentPosition, currentDuration, onSeek, onRewind, onFastForward, isPaused }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(note.name);

    const playSound = () => {
        onPlay(note.id, note.uri);
    };

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

    const seekToPosition = (event) => {
        const { locationX } = event.nativeEvent;
        const progressBarWidth = 300; // Approximate width, could be made dynamic
        const seekPosition = (locationX / progressBarWidth) * currentDuration;
        onSeek(seekPosition);
    };

    return (
        <View style={styles.container}>
            <View style={styles.mainContent}>
                {currentPlayingId === note.id && (
                    <TouchableOpacity style={styles.skipButton} onPress={onRewind}>
                        <Rewind size={20} color="#6366f1" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.playButton} onPress={playSound}>
                    {currentPlayingId === note.id ? (
                        isPaused ? (
                            <Play size={24} color="#6366f1" fill="#6366f1" />
                        ) : (
                            <Pause size={24} color="#6366f1" fill="#6366f1" />
                        )
                    ) : (
                        <Play size={24} color="#6366f1" fill="#6366f1" />
                    )}
                </TouchableOpacity>
                {currentPlayingId === note.id && (
                    <TouchableOpacity style={styles.skipButton} onPress={onFastForward}>
                        <FastForward size={20} color="#6366f1" />
                    </TouchableOpacity>
                )}

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
                                    <Text style={styles.metaText}>{formatDuration(note.duration)}</Text>
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

            {currentPlayingId === note.id && currentDuration > 0 && (
                <>
                    <TouchableOpacity style={styles.progressBarBg} onPress={seekToPosition} activeOpacity={0.7}>
                        <View style={[styles.progressBarFill, { width: `${(currentPosition / currentDuration) * 100}%` }]} />
                    </TouchableOpacity>
                    <Text style={styles.timeDisplay}>
                        {formatDuration(currentPosition)} / {formatDuration(currentDuration)}
                    </Text>
                </>
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
    skipButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f5f3ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    timeDisplay: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 4,
    },
});

export default VoiceNoteItem;
