package com.voiceutils

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.*

class VoiceModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), RecognitionListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false

    override fun getName(): String {
        return "VoiceModule"
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        // CRITICAL: Run on UI thread
        UiThreadUtil.runOnUiThread {
            try {
                if (isListening) {
                    promise.reject("ALREADY_LISTENING", "Speech recognition is already active")
                    return@runOnUiThread
                }

                if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
                    promise.reject("NOT_AVAILABLE", "Speech recognition not available")
                    return@runOnUiThread
                }

                setupSpeechRecognizer()
                
                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toString())
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactContext.packageName)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
                }

                speechRecognizer?.startListening(intent)
                isListening = true
                promise.resolve("Started listening")
                
            } catch (e: Exception) {
                promise.reject("START_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                speechRecognizer?.stopListening()
                isListening = false
                promise.resolve("Stopped listening")
            } catch (e: Exception) {
                promise.reject("STOP_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun destroy(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                speechRecognizer?.destroy()
                speechRecognizer = null
                isListening = false
                promise.resolve("Destroyed")
            } catch (e: Exception) {
                promise.reject("DESTROY_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun isAvailable(promise: Promise) {
        val available = SpeechRecognizer.isRecognitionAvailable(reactContext)
        promise.resolve(available)
    }

    @ReactMethod
    fun isListening(promise: Promise) {
        promise.resolve(isListening)
    }

    private fun setupSpeechRecognizer() {
        speechRecognizer?.destroy()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext).apply {
            setRecognitionListener(this@VoiceModule)
        }
    }

    private fun sendEvent(eventName: String, params: Any?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    // RecognitionListener callbacks
    override fun onReadyForSpeech(params: Bundle?) {
        sendEvent("onReadyForSpeech", null)
    }

    override fun onBeginningOfSpeech() {
        sendEvent("onBeginningOfSpeech", null)
    }

    override fun onRmsChanged(rmsdB: Float) {
        val data = Arguments.createMap().apply {
            putDouble("value", rmsdB.toDouble())
        }
        sendEvent("onRmsChanged", data)
    }

    override fun onBufferReceived(buffer: ByteArray?) {
    }

    override fun onEndOfSpeech() {
        isListening = false
        sendEvent("onEndOfSpeech", null)
    }

    override fun onError(error: Int) {
        isListening = false
        val errorData = Arguments.createMap().apply {
            putInt("code", error)
            putString("message", getErrorMessage(error))
        }
        sendEvent("onError", errorData)
    }

    override fun onResults(results: Bundle?) {
        isListening = false
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val confidence = results?.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES)
        
        val data = Arguments.createMap().apply {
            val matchesArray = Arguments.createArray()
            matches?.forEach { match ->
                matchesArray.pushString(match)
            }
            putArray("value", matchesArray)
            
            if (confidence != null) {
                val confidenceArray = Arguments.createArray()
                confidence.forEach { conf ->
                    confidenceArray.pushDouble(conf.toDouble())
                }
                putArray("confidence", confidenceArray)
            }
        }
        sendEvent("onResults", data)
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val data = Arguments.createMap().apply {
            val matchesArray = Arguments.createArray()
            matches?.forEach { match ->
                matchesArray.pushString(match)
            }
            putArray("value", matchesArray)
        }
        sendEvent("onPartialResults", data)
    }

    override fun onEvent(eventType: Int, params: Bundle?) {
        // Handle other events if needed
    }

    private fun getErrorMessage(error: Int): String {
        return when (error) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client side error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
            SpeechRecognizer.ERROR_NETWORK -> "Network error"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No match found"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognition service busy"
            SpeechRecognizer.ERROR_SERVER -> "Server error"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
            else -> "Unknown error ($error)"
        }
    }
}
 