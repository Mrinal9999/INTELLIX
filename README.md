
# 🎙️ Voice Chatbot with DeepSpeech

A real-time voice-enabled chatbot powered by Mozilla DeepSpeech and Flask.

## 🌐 Live Demo (Optional)
> Add this once deployed on Render:
[https://your-chatbot.onrender.com](https://your-chatbot.onrender.com)

---

## 📦 Features

- 🎤 Voice-to-text input using DeepSpeech (offline transcription)
- 🌐 Flask backend serving a responsive chatbot UI
- 🧠 Transcribes microphone input with `MediaRecorder`
- 📥 Simple `/upload` endpoint for handling audio uploads
- ⚙️ Mobile-friendly and privacy-aware (mic auto-releases)

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chatbot-deepspeech.git
cd chatbot-deepspeech
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Download DeepSpeech Model Files

Download from:
[https://github.com/mozilla/DeepSpeech/releases/tag/v0.9.3](https://github.com/mozilla/DeepSpeech/releases/tag/v0.9.3)

Place these files in the root directory:
- `deepspeech-0.9.3-models.pbmm`
- `deepspeech-0.9.3-models.scorer`

### 4. Run the App

```bash
python app.py
```

Then open:
[http://localhost:5000](http://localhost:5000)

---

## 📁 Project Structure

```
├── app.py
├── requirements.txt
├── .gitignore
├── README.md
├── static/
│   ├── index.html
│   ├── chatbot.css
│   ├── botfx_strictmicstop.js
│   ├── user.jpg
│   └── bot.jpg
├── uploads/
```

---

## ❗ Notes

- Model files are excluded from GitHub due to size limits
- This project requires Python 3.7 or newer

---

## 📜 License

MIT License – Use freely with attribution
