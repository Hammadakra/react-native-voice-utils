import { Platform } from 'react-native';
import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

const { VoiceModule } = NativeModules;

// Defensive check to avoid "null"
if (!VoiceModule) {
  console.error("VoiceModule is not linked properly. Did you rebuild your app after adding the package?");
}

const voiceEmitter = VoiceModule ? new NativeEventEmitter(VoiceModule) : null;

/**
 * Start listening for speech
 * @returns {Promise<string>} Promise that resolves when listening starts
 */
export const startListening = async () => {
  console.log("Starting voice recognition...");
  
  if (!VoiceModule) {
    throw new Error("VoiceModule is not available");
  }
  
  try {
    const result = await VoiceModule.startListening();
    console.log("Voice recognition started:", result);
    return result;
  } catch (error) {
    console.error("Failed to start listening:", error);
    throw error;
  }
};

/**
 * Stop listening for speech
 * @returns {Promise<string>} Promise that resolves when listening stops
 */
export const stopListening = async () => {
  if (!VoiceModule) {
    throw new Error("VoiceModule is not available");
  }
  
  try {
    const result = await VoiceModule.stopListening();
    console.log("Voice recognition stopped:", result);
    return result;
  } catch (error) {
    console.error("Failed to stop listening:", error);
    throw error;
  }
};

/**
 * Destroy the speech recognizer
 * @returns {Promise<string>} Promise that resolves when destroyed
 */
export const destroy = async () => {
  if (!VoiceModule) {
    return;
  }
  
  try {
    const result = await VoiceModule.destroy();
    console.log("Voice recognition destroyed:", result);
    return result;
  } catch (error) {
    console.error("Failed to destroy:", error);
    throw error;
  }
};

/**
 * Check if speech recognition is available
 * @returns {Promise<boolean>} Promise that resolves with availability status
 */
export const isAvailable = async () => {
  if (!VoiceModule) {
    return false;
  }
  if(Platform.OS){
    console.error("VoiceUtils is not implemented on iOS yet");
  }
  try {
    return await VoiceModule.isAvailable();
  } catch (error) {
    console.error("Failed to check availability:", error);
    return false;
  }
};

/**
 * Check if currently listening
 * @returns {Promise<boolean>} Promise that resolves with listening status
 */
export const isListening = async () => {
  if (!VoiceModule) {
    return false;
  }
  
  try {
    return await VoiceModule.isListening();
  } catch (error) {
    console.error("Failed to check listening status:", error);
    return false;
  }
};

/**
 * Add voice event listener
 * @param {string} event - Event name
 * @param {function} callback - Event callback
 * @returns {EmitterSubscription} Subscription object
 */
export const addVoiceListener = (
  event,
  callback
) => {
  if (!voiceEmitter) {
    console.warn("VoiceModule emitter is not available");
    // Return a dummy subscription so `.remove()` won't crash
    return {
      remove: () => {},
    };
  }
  
  return voiceEmitter.addListener(event, callback);
};

/**
 * Remove all listeners for a specific event
 * @param {string} event - Event name
 */
export const removeAllListeners = (event) => {
  if (voiceEmitter) {
    voiceEmitter.removeAllListeners(event);
  }
};

// Convenience methods for common events
export const onReady = (callback) => addVoiceListener("onReadyForSpeech", callback);
export const onStart = (callback) => addVoiceListener("onBeginningOfSpeech", callback);
export const onEnd = (callback) => addVoiceListener("onEndOfSpeech", callback);
export const onError = (callback) => addVoiceListener("onError", callback);
export const onResults = (callback) => addVoiceListener("onResults", callback);
export const onPartialResults = (callback) => addVoiceListener("onPartialResults", callback);
export const onRmsChanged = (callback) => addVoiceListener("onRmsChanged", callback);

// Default export for convenience
export default {
  startListening,
  stopListening,
  destroy,
  isAvailable,
  isListening,
  addVoiceListener,
  removeAllListeners,
  onReady,
  onStart,
  onEnd,
  onError,
  onResults,
  onPartialResults,
  onRmsChanged,
};