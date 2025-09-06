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

export default function VoiceRecognitionExample() {
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