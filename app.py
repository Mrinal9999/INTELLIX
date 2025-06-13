import os
from flask import Flask, request, jsonify
import assemblyai as aai

# Load API key from environment variable
aai.settings.api_key = os.environ.get("ASSEMBLYAI_KEY")

transcriber = aai.Transcriber()
app = Flask(__name__)

@app.route('/')
def index():
    return "AssemblyAI Chatbot Backend is Running!"

@app.route('/upload', methods=['POST'])
def upload():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400

    audio_file = request.files['audio']
    temp_path = "temp_audio.wav"
    audio_file.save(temp_path)

    try:
        transcript = transcriber.transcribe(temp_path)
        return jsonify({'transcript': transcript.text})
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)