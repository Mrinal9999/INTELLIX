import os, requests, assemblyai as aai
from flask import Flask, request, jsonify

aai.settings.api_key = os.environ.get("6ddc26c2ca3449f5bad38b20a3566a48")

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload():
    f = request.files['audio']
    resp = requests.post("https://api.assemblyai.com/v2/upload",
                         headers={'authorization': aai.settings.api_key},
                         files={'file': f})
    audio_url = resp.json()['upload_url']
    transcript = aai.transcribe(audio_url)
    return jsonify({'transcript': transcript.text})