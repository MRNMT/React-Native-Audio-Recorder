import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const STORAGE_KEY = '@voice_notes_metadata';

export const StorageService = {
  /**
   * Get all voice notes metadata
   */
  async getNotes() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading notes metadata', e);
      return [];
    }
  },

  /**
   * Save a new voice note metadata
   */
  async saveNote(note) {
    try {
      const notes = await this.getNotes();
      const newNotes = [note, ...notes];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
      return newNotes;
    } catch (e) {
      console.error('Error saving note metadata', e);
      throw e;
    }
  },

  /**
   * Update an existing voice note metadata (e.g., rename)
   */
  async updateNote(id, updates) {
    try {
      const notes = await this.getNotes();
      const index = notes.findIndex((n) => n.id === id);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      }
      return notes;
    } catch (e) {
      console.error('Error updating note metadata', e);
      throw e;
    }
  },

  /**
   * Delete a voice note (file and metadata)
   */
  async deleteNote(id) {
    try {
      const notes = await this.getNotes();
      const noteToDelete = notes.find((n) => n.id === id);
      
      if (noteToDelete) {
        // Delete physical file
        const fileInfo = await FileSystem.getInfoAsync(noteToDelete.uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(noteToDelete.uri);
        }
        
        // Update metadata
        const newNotes = notes.filter((n) => n.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
        return newNotes;
      }
      return notes;
    } catch (e) {
      console.error('Error deleting note', e);
      throw e;
    }
  }
};
