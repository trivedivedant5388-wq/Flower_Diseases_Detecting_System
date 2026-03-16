# FloraScan AI (Flower Disease Detection)

FloraScan AI is a React + Vite web app that analyzes flower images using Google Gemini (Generative Language API), detects possible plant diseases, and renders structured diagnostics.

## 🚀 Features

- Upload photo or capture from camera
- Convert image to base64 and send to Gemini generateContent API
- Parse AI response (text/JSON) and show disease detection details
- Fallback raw output for unstructured results
- Error handling for API key / network issues

## 🧠 Core technologies

- React (functional components, hooks)
- Vite (fast build/dev server)
- Google Generative Language API (Gemini)
- Browser APIs: `FileReader`, camera (`getUserMedia`), canvas (`drawImage`), `fetch`
- Lucide React icon set

## 📁 Main files

- `src/main.jsx` — app entrypoint and React root
- `src/App.jsx` — main app logic (image input, camera, API call, result rendering)
- `src/api.env` — API key environment file (`VITE_GEMINI_API_KEY`)
- `public/` — static assets

## 🔧 Setup & run locally

1. Clone:
   ```bash
   git clone https://github.com/dhruvaparnathi/Flower_Diseases_Detecting_System.git
   cd Flower_Diseases_Detecting_System
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `src/api.env` to `.env` and set your key:
   ```bash
   copy src\api.env .env
   ```
   In `.env`, set:
   ```text
   VITE_GEMINI_API_KEY=AIza...your-key...
   ```
4. If you change anything to make the project work, do so locally, then commit your code changes only (do not commit `.env`).
5. Start dev server:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:5173`

## ⚙️ Expected app flow

1. User uploads or captures flower image.
2. Image is encoded to base64 via `<canvas>`.
3. App posts to Gemini generateContent endpoint with model `gemini-2.5-flash`.
4. App receives `candidates[0].content.parts`, extracts text.
5. If text is JSON, app parses and renders disease fields (plant type, disease, confidence, recommendations). Otherwise plain text output is shown.

## 💡 Troubleshooting

- If you see `VITE_GEMINI_API_KEY not set`, verify `src/api.env` exists and restart the server.
- If API returns error: check your key, model availability, and quota in Google Cloud.
- For image parse failures, ensure the upload is a valid image and file is not empty.

## ✅ Deployment

This app can be deployed to static hosts (Netlify, Vercel, GitHub Pages) because it's a client-side React app.

### Example (Vercel)
1. Connect GitHub repo to Vercel.
2. Set `VITE_GEMINI_API_KEY` in project environment variables.
3. Deploy.

## 📌 Notes

- This project is a demo and should not be used as a substitute for certified plant disease diagnostics.
- For production use, add server-side image security checks and API request limits.

---

If you want, I can also add a quick demo GIF and “How it works” visuals to this README next.
