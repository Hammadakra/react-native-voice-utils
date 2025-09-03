import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, 
  Text, 
  Button, 
  ScrollView, 
  PermissionsAndroid, 
  Platform, 
  Alert,
  View,
  StyleSheet
} from 'react-native';
import { 
  startListening, 
  stopListening, 
  destroy, 
  addVoiceListener,
  isAvailable,
  isListening
} from '../../src/index';

export default function App() {
  const [text, setText] = useState<string>("");
  const [listening, setListening] = useState<boolean>(false);
  const [available, setAvailable] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Request microphone permission (Android only)
  const requestMicPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to convert speech to text.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Mic permission error:', err);
        return false;
      }
    }
    return true; // iOS handled in Info.plist
  };

  useEffect(() => {
    // Check if speech recognition is available
    const checkAvailability = async () => {
      try {
        const isAvail = await isAvailable();
        setAvailable(isAvail);
        if (!isAvail) {
          setError("Speech recognition is not available on this device");
        }
      } catch (err) {
        console.error("Error checking availability:", err);
        setError("Failed to check speech recognition availability");
      }
    };

    checkAvailability();

    // Set up event listeners
    const readyListener = addVoiceListener("onReadyForSpeech", () => {
      console.log("Ready for speech");
      setError("");
    });

    const startListener = addVoiceListener("onBeginningOfSpeech", () => {
      console.log("Speech started");
      setListening(true);
    });

    const endListener = addVoiceListener("onEndOfSpeech", () => {
      console.log("Speech ended");
      setListening(false);
    });

    const resultsListener = addVoiceListener("onResults", (data) => {
      console.log("Results:", data);
      if (data && data.value && data.value.length > 0) {
        setText(data.value[0]);
      }
      setListening(false);
    });

    const partialListener = addVoiceListener("onPartialResults", (data) => {
      console.log("Partial results:", data);
      if (data && data.value && data.value.length > 0) {
        setText(data.value[0]);
      }
    });

    const errorListener = addVoiceListener("onError", (errorData) => {
      console.log("Error:", errorData);
      setListening(false);
      
      if (typeof errorData === 'object' && errorData.message) {
        setError(`Error: ${errorData.message}`);
      } else {
        setError(`Error code: ${errorData}`);
      }
    });

    const rmsListener = addVoiceListener("onRmsChanged", (data) => {
      // console.log("RMS changed:", data); // Uncomment for debugging
    });

    // Cleanup function
    return () => {
      readyListener.remove();
      startListener.remove();
      endListener.remove();
      resultsListener.remove();
      partialListener.remove();
      errorListener.remove();
      rmsListener.remove();
      
      // Destroy the speech recognizer
      destroy().catch(console.error);
    };
  }, []);

  const handleStartListening = async () => {
    try {
      setError("");
      
      // Check if already listening
      const currentlyListening = await isListening();
      if (currentlyListening) {
        Alert.alert("Already Listening", "Speech recognition is already active.");
        return;
      }

      // Check availability
      if (!available) {
        Alert.alert("Not Available", "Speech recognition is not available on this device.");
        return;
      }

      // Request permission
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Microphone access is required for speech recognition.");
        return;
      }
      
      console.log("Starting speech recognition...");
      setText("Listening...");
      
      await startListening();
    } catch (err) {
      console.error("Failed to start listening:", err);
      setError(`Failed to start: ${err.message || err}`);
      setListening(false);
    }
  };

  const handleStopListening = async () => {
    try {
      console.log("Stopping speech recognition...");
      await stopListening();
    } catch (err) {
      console.error("Failed to stop listening:", err);
      setError(`Failed to stop: ${err.message || err}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Voice to Text</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Available: {available ? "✅" : "❌"}
          </Text>
          <Text style={styles.statusText}>
            Listening: {listening ? "🎤" : "🔇"}
          </Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.resultText}>
            {text || "Say something..."}
          </Text>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button 
            title="Start Listening" 
            onPress={handleStartListening}
            disabled={!available || listening}
          />
          <View style={styles.buttonSpacer} />
          <Button 
            title="Stop Listening" 
            onPress={handleStopListening}
            disabled={!listening}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  textContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    minHeight: 100,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  buttonSpacer: {
    width: 10,
  },
});