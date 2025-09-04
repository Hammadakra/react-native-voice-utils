import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import type { EmitterSubscription } from 'react-native';

const { VoiceModule } = NativeModules;

// Defensive check to avoid "null"
if (!VoiceModule) {
  console.error(
    'VoiceModule is not linked properly. Did you rebuild your app after adding the package?'
  );
}

const voiceEmitter = VoiceModule ? new NativeEventEmitter(VoiceModule) : null;

/**
 * Start listening for speech
 */
export const startListening = async (): Promise<string> => {
  console.log('Starting voice recognition...');

  if (!VoiceModule) {
    throw new Error('VoiceModule is not available');
  }

  try {
    const result: string = await VoiceModule.startListening();
    console.log('Voice recognition started:', result);
    return result;
  } catch (error) {
    console.error('Failed to start listening:', error);
    throw error;
  }
};

/**
 * Stop listening for speech
 */
export const stopListening = async (): Promise<string> => {
  if (!VoiceModule) {
    throw new Error('VoiceModule is not available');
  }

  try {
    const result: string = await VoiceModule.stopListening();
    console.log('Voice recognition stopped:', result);
    return result;
  } catch (error) {
    console.error('Failed to stop listening:', error);
    throw error;
  }
};

/**
 * Destroy the speech recognizer
 */
export const destroy = async (): Promise<string | undefined> => {
  if (!VoiceModule) {
    return;
  }

  try {
    const result: string = await VoiceModule.destroy();
    console.log('Voice recognition destroyed:', result);
    return result;
  } catch (error) {
    console.error('Failed to destroy:', error);
    throw error;
  }
};

/**
 * Check if speech recognition is available
 */
export const isAvailable = async (): Promise<boolean> => {
  if (!VoiceModule) {
    return false;
  }

  if (Platform.OS === 'ios') {
    console.error('VoiceUtils is not implemented on iOS yet');
    return false;
  }

  try {
    return await VoiceModule.isAvailable();
  } catch (error) {
    console.error('Failed to check availability:', error);
    return false;
  }
};

/**
 * Check if currently listening
 */
export const isListening = async (): Promise<boolean> => {
  if (!VoiceModule) {
    return false;
  }

  try {
    return await VoiceModule.isListening();
  } catch (error) {
    console.error('Failed to check listening status:', error);
    return false;
  }
};

/**
 * Add voice event listener
 */
export const addVoiceListener = (
  event: string,
  callback: (data: unknown) => void
): EmitterSubscription => {
  if (!voiceEmitter) {
    console.warn('VoiceModule emitter is not available');
    return {
      remove: () => {},
    } as EmitterSubscription;
  }

  return voiceEmitter.addListener(event, callback);
};

/**
 * Remove all listeners for a specific event
 */
export const removeAllListeners = (event: string): void => {
  if (voiceEmitter) {
    voiceEmitter.removeAllListeners(event);
  }
};

// Convenience methods for common events
export const onReady = (callback: (data: unknown) => void) =>
  addVoiceListener('onReadyForSpeech', callback);
export const onStart = (callback: (data: unknown) => void) =>
  addVoiceListener('onBeginningOfSpeech', callback);
export const onEnd = (callback: (data: unknown) => void) =>
  addVoiceListener('onEndOfSpeech', callback);
export const onError = (callback: (data: unknown) => void) =>
  addVoiceListener('onError', callback);
export const onResults = (callback: (data: unknown) => void) =>
  addVoiceListener('onResults', callback);
export const onPartialResults = (callback: (data: unknown) => void) =>
  addVoiceListener('onPartialResults', callback);
export const onRmsChanged = (callback: (data: unknown) => void) =>
  addVoiceListener('onRmsChanged', callback);

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
