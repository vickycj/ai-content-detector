# AI Content Detector

Detect whether an image or video is AI-generated using **Firebase AI Logic** and **Google Gemini 2.5 Flash**.

**[Live Demo](https://ai-content-detector-54774.web.app)**

## Features

- Upload images (JPG, PNG, GIF, WebP — max 10MB) or videos (MP4, WebM, MOV — max 30MB, 2 min)
- Drag-and-drop or file browser upload
- 4-stage forensic AI analysis:
  - Watermark and AI branding detection (Grok, DALL-E, Midjourney, etc.)
  - Composition and overall impression analysis
  - Technical examination (textures, lighting, edges, noise)
  - Contextual and semantic plausibility check
- Verdict with confidence score and detailed indicators
- Firebase App Check with reCAPTCHA v3 for abuse protection
- Dark theme UI

## Tech Stack

- **AI**: Firebase AI Logic + Gemini 2.5 Flash (free tier, no billing required)
- **Security**: Firebase App Check + reCAPTCHA v3
- **Hosting**: Firebase Hosting
- **Build**: Vite
- **Frontend**: Vanilla JavaScript, HTML, CSS

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/vickycj/ai-content-detector.git
   cd ai-content-detector
   npm install
   ```

2. Create a Firebase project and register a web app at [Firebase Console](https://console.firebase.google.com)

3. Enable the **Gemini Developer API** in Firebase Console > AI Logic > Settings

4. Register a reCAPTCHA v3 site key at [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)

5. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

6. Run locally:
   ```bash
   npm run dev
   ```

7. Deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Author

**Vicky** — [vickycodes.com](https://vickycodes.com)
