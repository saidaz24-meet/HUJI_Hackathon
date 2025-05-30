export class VoiceTranscriptionService {
  private recognition: SpeechRecognition | null = null
  private isSupported = false

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.isSupported = true
        this.setupRecognition()
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = "en-US"
  }

  startRecording(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.recognition) {
        reject(new Error("Speech recognition not supported"))
        return
      }

      // For browsers that don't support speech recognition, we'll mock it
      if (typeof this.recognition.start !== "function") {
        // Mock implementation
        setTimeout(() => {
          onResult("This is a mock transcription because your browser doesn't support speech recognition.", true)
          resolve()
        }, 2000)
        return
      }

      this.recognition.onresult = (event) => {
        let transcript = ""
        let isFinal = false

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
          if (event.results[i].isFinal) {
            isFinal = true
          }
        }

        onResult(transcript, isFinal)
      }

      this.recognition.onerror = (event) => {
        onError(event.error)
        reject(new Error(event.error))
      }

      this.recognition.onstart = () => {
        resolve()
      }

      this.recognition.start()
    })
  }

  stopRecording(): void {
    if (this.recognition && typeof this.recognition.stop === "function") {
      this.recognition.stop()
    }
  }

  isRecognitionSupported(): boolean {
    return this.isSupported
  }
}

// Global speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
