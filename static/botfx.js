document.addEventListener("DOMContentLoaded", () => {
  const micButton = document.getElementById("mic-button");
  if (!micButton) return;

  let micAudioContext;
  let micStream;
  let micMediaRecorder;
  let micAudioChunks = [];
  let silenceTimer;
  let analyser;

  micButton.addEventListener("click", async () => {
    if (!micMediaRecorder || micMediaRecorder.state === "inactive") {
      console.log("🎙️ Starting mic...");
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      micMediaRecorder = new MediaRecorder(micStream, { mimeType: 'audio/webm' });
      micAudioChunks = [];

      micMediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          micAudioChunks.push(e.data);
          console.log("📥 Audio chunk received:", e.data.size);
        }
      };

      micMediaRecorder.onstop = async () => {
        console.log("🛑 Recording stopped, preparing to upload...");

        const audioBlob = new Blob(micAudioChunks, { type: 'audio/webm' });
        console.log("🎧 Audio blob size:", audioBlob.size);

        const formData = new FormData();
        formData.append("audio", audioBlob, "record.webm");

        try {
          const response = await fetch("/upload", {
            method: "POST",
            body: formData
          });

          const data = await response.json();
          console.log("✅ Server response:", data);

          if (data.transcript) {
            sendMessage(data.transcript);
          } else {
            console.warn("⚠️ No transcript returned.");
          }
        } catch (err) {
          console.error("❌ Upload error:", err);
        }
      };

      micMediaRecorder.start();
      console.log("📼 Recording started");

      micAudioContext = new AudioContext();
      const source = micAudioContext.createMediaStreamSource(micStream);
      analyser = micAudioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);

      const detectSilence = () => {
        analyser.getByteTimeDomainData(dataArray);
        const avg = dataArray.reduce((a, v) => a + Math.abs(v - 128), 0) / dataArray.length;

        if (avg < 5) {
          if (!silenceTimer) {
            silenceTimer = setTimeout(() => {
              if (micMediaRecorder && micMediaRecorder.state === "recording") {
                console.log("🔇 Silence detected, stopping mic");
                micMediaRecorder.stop();
                micStream.getTracks().forEach(track => track.stop());
                micAudioContext.close();
              }
            }, 2000); // stop after 2 sec silence
          }
        } else {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }

        if (micMediaRecorder && micMediaRecorder.state === "recording") {
          requestAnimationFrame(detectSilence);
        }
      };

      detectSilence();

    } else if (micMediaRecorder.state === "recording") {
      console.log("🧼 Manual mic stop");
      micMediaRecorder.stop();
      micStream.getTracks().forEach(track => track.stop());
      micAudioContext.close();
    }
  });
});