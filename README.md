# React Native Voice Recognition

A React Native project with integrated voice-to-text functionality using Android's native SpeechRecognizer API.

## Features

- 🎤 **Real-time Speech Recognition** - Convert speech to text in real-time
- 📱 **Android Native Integration** - Uses Android's built-in SpeechRecognizer
- 🔄 **Partial Results** - Get intermediate results while speaking
- ⚡ **Promise-based API** - Modern async/await support
- 🎛️ **Event-driven Architecture** - Real-time updates and callbacks
- 🛡️ **Main Thread Safety** - All speech operations run on UI thread
- 🔊 **Audio Level Monitoring** - Real-time RMS (volume) feedback
- ⚠️ **Comprehensive Error Handling** - Detailed error codes and messages
- 🔐 **Permission Management** - Runtime permission handling for microphone access

## Screenshots

*Add your app screenshots here*

## Installation & Setup

### Prerequisites

- React Native development environment set up
- Android SDK and Android Studio
- Physical Android device (recommended - speech recognition doesn't work well on emulators)

### Clone and Install

```bash
git clone https://github.com/yourusername/your-voice-app.git
cd your-voice-app
npm install
# or
yarn install
```

### Android Setup

1. **Update Package Name**: Replace `com.yourappname` with your actual package name in:
   - `android/app/src/main/java/com/yourappname/VoiceModule.kt`
   - `android/app/src/main/java/com/yourappname/VoicePackage.kt`
   - `android/app/src/main/java/com/yourappname/MainApplication.kt`

2. **Permissions**: The following permissions are already added to `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.INTERNET" />
   ```

3. **Build and Run**:
   ```bash
   npx react-native run-android
   ```

## Usage

### Basic Implementation

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, PermissionsAndroid } from 'react-native';
import VoiceUtils from './src/utils/VoiceUtils';

export default function App() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Set up event listeners
    const resultsListener = VoiceUtils.onResults((data) => {
      if (data.value && data.value.length > 0) {
        setText(data.value[0]);
        setIsListening(false);
      }
    });

    const errorListener = VoiceUtils.onError((error) => {
      console.error('Voice error:', error);
      setIsListening(false);
    });

    const startListener = VoiceUtils.onStart(() => {
      setIsListening(true);
    });

    // Cleanup
    return () => {
      VoiceUtils.removeEventListener('onResults', resultsListener);
      VoiceUtils.removeEventListener('onError', errorListener);
      VoiceUtils.removeEventListener('onBeginningOfSpeech', startListener);
    };
  }, []);

  const requestPermission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const startListening = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert('Permission required', 'Microphone access needed');
      return;
    }

    try {
      await VoiceUtils.startListening();
    } catch (error) {
      Alert.alert('Error', 'Failed to start voice recognition');
    }
  };

  const stopListening = async () => {
    try {
      await VoiceUtils.stopListening();
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        {text || 'Press start and say something...'}
      </Text>
      
      <Button
        title="Start Listening"
        onPress={startListening}
        disabled={isListening}
      />
      
      <Button
        title="Stop Listening"
        onPress={stopListening}
        disabled={!isListening}
      />
    </View>
  );
}
```

## API Reference

### VoiceUtils Methods

#### `startListening(): Promise<string>`
Starts listening for speech input.

**Returns:** Promise that resolves when listening starts successfully.

**Throws:** Error if speech recognition is not available or already listening.

#### `stopListening(): Promise<string>`
Stops the current listening session.

**Returns:** Promise that resolves when listening stops successfully.

#### `destroy(): Promise<string>`
Destroys the speech recognizer and cleans up resources.

**Returns:** Promise that resolves when cleanup is complete.

#### `isAvailable(): Promise<boolean>`
Checks if speech recognition is available on the device.

**Returns:** Promise that resolves with `true` if available, `false` otherwise.

#### `isListening(): Promise<boolean>`
Checks if currently listening for speech.

**Returns:** Promise that resolves with `true` if listening, `false` otherwise.

### Event Listeners

#### `onReady(callback: () => void)`
Fired when the speech recognizer is ready to listen.

#### `onStart(callback: () => void)`
Fired when speech recognition starts.

#### `onEnd(callback: () => void)`
Fired when speech recognition ends.

#### `onResults(callback: (data: ResultData) => void)`
Fired when final speech recognition results are available.

**ResultData:**
```javascript
{
  value: string[],      // Array of recognized text results
  confidence?: number[] // Optional confidence scores
}
```

#### `onPartialResults(callback: (data: PartialData) => void)`
Fired when partial speech recognition results are available.

**PartialData:**
```javascript
{
  value: string[] // Array of partial text results
}
```

#### `onError(callback: (error: ErrorData) => void)`
Fired when an error occurs during speech recognition.

**ErrorData:**
```javascript
{
  code: number,    // Error code
  message: string  // Human-readable error message
}
```

#### `onRmsChanged(callback: (data: RmsData) => void)`
Fired when the audio level (RMS) changes.

**RmsData:**
```javascript
{
  value: number // RMS value in decibels
}
```

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 1 | `ERROR_NETWORK_TIMEOUT` | Network operation timed out |
| 2 | `ERROR_NETWORK` | Network error |
| 3 | `ERROR_AUDIO` | Audio recording error |
| 4 | `ERROR_SERVER` | Server error |
| 5 | `ERROR_CLIENT` | Client side error |
| 6 | `ERROR_SPEECH_TIMEOUT` | No speech input |
| 7 | `ERROR_NO_MATCH` | No recognition result matched |
| 8 | `ERROR_RECOGNIZER_BUSY` | RecognitionService busy |
| 9 | `ERROR_INSUFFICIENT_PERMISSIONS` | Insufficient permissions |

## Project Structure

```
src/
├── components/
│   └── VoiceRecognition.js     # Main voice recognition component
├── utils/
│   └── VoiceUtils.js           # JavaScript interface to native module
└── ...

android/
└── app/
    └── src/
        └── main/
            └── java/
                └── com/
                    └── yourappname/
                        ├── VoiceModule.kt      # Native Android module
                        ├── VoicePackage.kt     # React Native package
                        └── MainApplication.kt  # Updated with voice package
```

## Permissions

### Required Permissions
- `RECORD_AUDIO` - Required for microphone access
- `INTERNET` - Required for cloud-based speech recognition (if available)

### Runtime Permissions
The app requests microphone permission at runtime. Users must grant this permission for voice recognition to work.

## Platform Support

- ✅ **Android** - Fully supported using native SpeechRecognizer API
- 🚧 **iOS** - Coming soon

## Troubleshooting

### Common Issues

#### Speech Recognition Not Available
- **Cause**: Device doesn't have Google services or speech recognition disabled
- **Solution**: Ensure Google app is installed and speech recognition is enabled in device settings

#### Permission Denied
- **Cause**: User denied microphone permission
- **Solution**: Request permission again or guide user to app settings

#### Network Errors
- **Cause**: Poor internet connection for cloud-based recognition
- **Solution**: Check network connectivity; some devices support offline recognition

#### Audio Errors
- **Cause**: Microphone hardware issues or conflicting apps
- **Solution**: Close other apps using microphone, restart device

### Testing Tips

1. **Use Physical Device**: Speech recognition doesn't work on emulators
2. **Quiet Environment**: Test in a quiet environment for better accuracy
3. **Clear Speech**: Speak clearly and at a normal pace
4. **Check Permissions**: Ensure microphone permissions are granted
5. **Network Connection**: Some recognition requires internet connectivity

## Performance Considerations

- **Memory Usage**: Call `destroy()` when done to free resources
- **Battery Usage**: Voice recognition uses microphone and CPU resources
- **Network Usage**: Cloud-based recognition uses data

## Development

### Building for Production

```bash
cd android
./gradlew assembleRelease
```

### Debug Mode

```bash
npx react-native run-android --variant=debug
```

## Future Enhancements

- [ ] iOS support using Speech framework
- [ ] Offline speech recognition support
- [ ] Multiple language support
- [ ] Custom wake word detection
- [ ] Voice command recognition
- [ ] Audio file transcription
- [ ] Real-time translation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Native team for the excellent framework
- Android team for the SpeechRecognizer API
- Community contributors and testers

## Support

If you like this project, please give it a ⭐ on GitHub!

For issues and questions, please use the [GitHub Issues](https://github.com/yourusername/your-voice-app/issues) page.

## Related Projects

- [react-native-voice](https://github.com/react-native-voice/voice) - Popular voice recognition library
- [react-native-speech-to-text](https://github.com/your-link) - Alternative implementation

---

Made with ❤️ by [Your Name](https://github.com/yourusername)