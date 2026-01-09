# Voice Journal - React Native Audio Recorder

A beautiful and intuitive voice recording app built with React Native and Expo. Record, organize, and manage your voice notes with a clean, modern interface.

## Features

- 🎙️ **High-Quality Audio Recording**: Record voice notes with professional audio quality
- 🎵 **Playback Controls**: Play, pause, and seek through your recordings
- 🔍 **Search Functionality**: Quickly find recordings by name
- ✏️ **Rename Recordings**: Edit recording names inline
- 🗑️ **Delete Recordings**: Remove unwanted recordings with confirmation
- 📱 **Cross-Platform**: Works on iOS, Android, and Web
- 🎨 **Modern UI**: Clean design with smooth animations and background images
- 💾 **Local Storage**: All recordings and metadata stored locally on device

## Screenshots

*(Add screenshots of your app here)*

## Installation

1. **Prerequisites**
   - Node.js (v14 or later)
   - npm or yarn
   - Expo CLI: `npm install -g @expo/cli`
   - For mobile development: Expo Go app on your device

2. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd react-native-audio-recorder
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Emulator**
   - **iOS**: Press `i` in terminal or scan QR code with Camera app
   - **Android**: Press `a` in terminal or scan QR code with Expo Go
   - **Web**: Press `w` in terminal

## Project Structure

```
├── App.js                 # Main application component
├── index.js              # Entry point
├── components/
│   └── VoiceNoteItem.js  # Individual recording item component
├── services/
│   └── storage.js        # Data persistence and file management
├── assets/               # App icons and images
│   ├── icon.png
│   ├── splash-icon.png
│   └── ...
└── package.json          # Dependencies and scripts
```

## Key Components

### App.js
- Main application logic
- Recording controls and UI
- Search functionality
- Animations and background styling

### VoiceNoteItem.js
- Individual recording display
- Playback controls with progress bar
- Rename and delete functionality
- Audio status updates

### storage.js
- AsyncStorage for metadata
- File system operations for audio files
- CRUD operations for recordings

## Dependencies

- **expo-av**: Audio recording and playback
- **expo-file-system**: File system operations
- **@react-native-async-storage/async-storage**: Local data storage
- **lucide-react-native**: Beautiful icons
- **date-fns**: Date formatting
- **react-native**: Core React Native framework

## Permissions

The app requires microphone permission for recording audio. This is automatically requested when you start recording.

## Building for Production

1. **Configure app.json** for your app details (name, icon, splash screen, etc.)

2. **Build for platforms**:
   ```bash
   # iOS
   expo build:ios

   # Android
   expo build:android
   ```

3. **EAS Build** (recommended):
   ```bash
   npx eas build --platform ios
   npx eas build --platform android
   ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## Troubleshooting

### Common Issues

1. **Recording not working**
   - Ensure microphone permissions are granted
   - Check that no other app is using the microphone

2. **Playback issues**
   - Try restarting the app
   - Check file system permissions

3. **Build errors**
   - Clear Expo cache: `expo r -c`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Expo AV Deprecation Warning

The app uses `expo-av` which is deprecated in newer Expo SDK versions. Consider migrating to:
- `expo-audio` for audio recording/playback
- `expo-video` for video functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ using React Native and Expo**
