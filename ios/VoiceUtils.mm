import Foundation
import React

@objc(VoiceUtils)
class VoiceUtils: RCTEventEmitter {
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func supportedEvents() -> [String]! {
    return ["onResults", "onPartialResults", "onError"]
  }

  @objc func startListening() {
    // iOS stub - not implemented
    sendEvent(withName: "onError", body: "iOS not supported yet")
  }

  @objc func stopListening() {
    // stub
  }

  @objc func destroy() {
    // stub
  }
}
