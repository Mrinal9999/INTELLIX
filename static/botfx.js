let mediaRecorder;
let audioChunks = [];
let silenceTimer;
let audioContext, analyser, micStream;

const micButton = document.getElementById("mic-button");

micButton.addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    // Start mic stream
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(micStream);
    audioChunks = [];

    // Setup audio context for silence detection
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(micStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.fftSize);

    const detectSilence = () => {
      analyser.getByteTimeDomainData(dataArray);
      const avg = dataArray.reduce((sum, val) => sum + Math.abs(val - 128), 0) / dataArray.length;

      if (avg < 5) {
        // Detected silence
        if (!silenceTimer) {
          silenceTimer = setTimeout(() => {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop();
              micStream.getTracks().forEach(track => track.stop());
              audioContext.close();
              console.log("🛑 Auto-stopped due to silence");
            }
          }, 2000); // 2 seconds of silence
        }
      } else {
        // Reset silence timer if speaking again
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }

      if (mediaRecorder.state === "recording") {
        requestAnimationFrame(detectSilence);
      }
    };

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append("audio", audioBlob, "record.wav");

      const response = await fetch("/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.transcript) {
        sendMessage(data.transcript); // insert transcript into your chat
      }
    };

    mediaRecorder.start();
    detectSilence();
    console.log("🎙️ Mic started with silence detection");

  } else if (mediaRecorder.state === "recording") {
    // Manual stop
    mediaRecorder.stop();
    micStream.getTracks().forEach(track => track.stop());
    audioContext.close();
    console.log("🛑 Mic stopped manually");
  }
});