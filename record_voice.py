import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write

# ====== CONFIG ======
samplerate = 16000  # 16 kHz sample rate
duration = 5        # seconds to record
filename = "myvoice.wav"
# ====================

print("🎙️ Recording... Speak now!")
recording = sd.rec(int(samplerate * duration), samplerate=samplerate, channels=1, dtype='int16')
sd.wait()  # Wait for the recording to finish

write(filename, samplerate, recording)
print(f"✅ Done! Audio saved to {filename}")