let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let micStream = null;

const micButton = document.getElementById("mic-btn");

micButton.addEventListener("click", async () => {
  if (isRecording) {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    isRecording = false;
    canvas.classList.add("hidden");
    stopMicStream();
    return;
  }

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(micStream);
    audioChunks = [];
    isRecording = true;
    canvas.classList.remove("hidden");

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      canvas.classList.add("hidden");
      stopMicStream();

      const blob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", blob);

      try {
        const res = await fetch("/upload", {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        if (data.transcript) {
          userInput.value = data.transcript;
          handleUserInput();
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
      }
    };
  
  mediaRecorder.start();

    
  } catch (err) {
    console.error("Microphone access failed:", err);
    stopMicStream();
    canvas.classList.add("hidden");
    isRecording = false;
  }
});

function stopMicStream() {
  if (micStream) {
    micStream.getAudioTracks().forEach(track => {
      if (track.enabled || track.readyState === "live") {
        track.stop();
      }
    });
    micStream = null;
  }
}