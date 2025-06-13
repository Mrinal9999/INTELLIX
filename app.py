import os
import requests
from flask import Flask, request, jsonify, render_template
import numpy as np
from scipy.io import wavfile
import deepspeech

app = Flask(__name__, static_url_path='/static')
app.config['UPLOAD_FOLDER'] = 'uploads'

# URLs to DeepSpeech model files
MODEL_URL = "https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm"
SCORER_URL = "https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer"

MODEL_FILE = "deepspeech-0.9.3-models.pbmm"
SCORER_FILE = "deepspeech-0.9.3-models.scorer"

# ✅ Auto-download if not present
def download_if_missing(url, filename):
    if not os.path.exists(filename):
        print(f"Downloading {filename}...")
        r = requests.get(url, stream=True)
        with open(filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print(f"{filename} downloaded.")

download_if_missing(MODEL_URL, MODEL_FILE)
download_if_missing(SCORER_URL, SCORER_FILE)

# ✅ Load DeepSpeech Model
from deepspeech import Model
model = Model(MODEL_FILE)
model.enableExternalScorer(SCORER_FILE)

# 🧠 Flask routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400

    file = request.files['audio']
    path = os.path.join(app.config['UPLOAD_FOLDER'], 'record.wav')
    file.save(path)

    rate, audio = wavfile.read(path)

    if audio.ndim > 1:
        audio = audio[:, 0]  # take first channel if stereo

    if rate != 16000:
        return jsonify({'error': 'Sample rate must be 16000 Hz'}), 400

    text = model.stt(audio)
    return jsonify({'transcript': text})

if __name__ == '__main__':
    app.run(debug=False)