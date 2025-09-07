# react-native-voice-utils

A powerful React Native package for voice-to-text speech recognition with native Android integration, real-time transcription, and comprehensive error handling.

## Features

- 🎤 **Real-time Speech Recognition** – Convert voice to text instantly
- 📱 **Android Native Integration** – Uses Android's built-in `SpeechRecognizer`
- 🔄 **Partial Results** – Get transcription updates while speaking
- ⚡ **Promise-based API** – Works seamlessly with async/await
- 🎛 **Event-driven Architecture** – Real-time callbacks for recognition events
- 🛡 **Main Thread Safety** – Speech operations safely run on UI thread
- 🔊 **Audio Level Monitoring** – Real-time RMS (volume) feedback
- 🚨 **Error Handling** – Provides detailed error codes and messages
- 🔑 **Permission Management** – Runtime permission handling for microphone access
- 📦 **Lightweight** – Zero dependencies, minimal overhead
- 💻 **TypeScript Support** – Built-in type definitions

## Installation & Setup

### Prerequisites

- React Native 0.60+ (auto-linking support)
- Android SDK API Level 21+
- Physical Android device (recommended - speech recognition doesn't work well on emulators)

### Install Package

```bash
npm install react-native-voice-utils
# or
yarn add react-native-voice-utils
```

### Android Setup

**Permissions**: The following permissions need to be added. `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.INTERNET" />
   ```

## Complete Working Example

- Here's a complete, ready-to-use example that you can copy and paste directly into your React Native project:

```javascript
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  startListening,
  stopListening,
  destroy,
  onResults,
  onError,
  onReady,
  onStart,
  onEnd,
  isAvailable,
  isListening as checkListening,
} from 'react-native-voice-utils';

export default function App() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAvailableState, setIsAvailable] = useState(false);

  useEffect(() => {
    checkAvailability();

    const readyListener = onReady(() => {
      console.log('Ready to listen');
    });

    const startListener = onStart(() => {
      console.log('Started listening');
      setIsListening(true);
    });

    const endListener = onEnd(() => {
      console.log('Stopped listening');
      setIsListening(false);
    });

    const resultsListener = onResults(data => {
      console.log('Results:', data);
      if (data.value && data.value.length > 0) {
        setText(data.value[0]);
      }
      setIsListening(false);
    });

    const errorListener = onError(error => {
      console.error('Voice recognition error:', error);
      setIsListening(false);
      Alert.alert('Error', error.message || `Error code: ${error.code}`);
    });

    return () => {
      readyListener.remove();
      startListener.remove();
      endListener.remove();
      resultsListener.remove();
      errorListener.remove();
      destroy();
    };
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await isAvailable();
      setIsAvailable(available);
      if (!available) {
        Alert.alert(
          'Not Available',
          'Speech recognition is not available on this device',
        );
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access for voice recognition',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  };

  const handleStartListening = async () => {
    try {
      if (!isAvailableState) {
        Alert.alert('Not Available', 'Speech recognition is not available');
        return;
      }

      const currentlyListening = await checkListening();
      if (currentlyListening) {
        Alert.alert('Already Listening', 'Voice recognition is already active');
        return;
      }

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Microphone permission is needed');
        return;
      }

      setText('Listening...');
      await startListening();
    } catch (error) {
      console.error('Start listening error:', error);
      Alert.alert('Error', 'Failed to start voice recognition');
    }
  };

  const handleStopListening = async () => {
    try {
      await stopListening();
    } catch (error) {
      console.error('Stop listening error:', error);
      Alert.alert('Error', 'Failed to stop voice recognition');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Recognition Demo</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Available: {isAvailableState ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusText}>
          Listening: {isListening ? '🎤' : '🔇'}
        </Text>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>
          {text || 'Press "Start Listening" and say something...'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={handleStartListening}
          disabled={!isAvailableState || isListening}>
          <Text style={styles.buttonText}>Start Listening</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={handleStopListening}
          disabled={!isListening}>
          <Text style={styles.buttonText}>Stop Listening</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  resultText: {
    fontSize: 18,
    lineHeight: 24,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

**Build and Run**:
```bash
npx react-native run-android
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

For issues and questions, please use the [GitHub Issues](https://github.com/Hammadakra/react-native-voice-utils/issues) page.

---

Made with ❤️ by [Muhammad Hammad Akram](https://github.com/hammadakra)