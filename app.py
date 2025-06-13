from flask import Flask, request, jsonify, send_from_directory
import os
import wave
import numpy as np
import deepspeech
from scipy.io import wavfile

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

model = deepspeech.Model('deepspeech-0.9.3-models.pbmm')
model.enableExternalScorer('deepspeech-0.9.3-models.scorer')

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400

    file = request.files['audio']
    path = os.path.join(app.config['UPLOAD_FOLDER'], 'record.wav')
    file.save(path)

    # Proper way to load .wav audio
    rate, audio = wavfile.read(path)
    if rate != 16000:
        return jsonify({'error': 'Sample rate must be 16000 Hz'}), 400

    if audio.ndim > 1:
        audio = audio[:, 0]  # take only first channel if stereo

    text = model.stt(audio)
    return jsonify({'transcript': text})

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    app.run(debug=True)