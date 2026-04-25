import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Google OAuth Config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

app.get("/api/auth/google/url", (req, res) => {
  const { clientId, clientSecret } = req.query;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  
  // Use provided credentials or fallback to env vars
  const activeClientId = (clientId as string) || GOOGLE_CLIENT_ID || "";
  const activeClientSecret = (clientSecret as string) || GOOGLE_CLIENT_SECRET || "";

  // Encode credentials in state to retrieve them in callback
  const state = Buffer.from(JSON.stringify({ 
    clientId: activeClientId, 
    clientSecret: activeClientSecret 
  })).toString('base64');

  const params = new URLSearchParams({
    client_id: activeClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file email profile",
    access_type: "offline",
    prompt: "consent",
    state: state
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code, state } = req.query;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

  let activeClientId = GOOGLE_CLIENT_ID;
  let activeClientSecret = GOOGLE_CLIENT_SECRET;

  if (state) {
    try {
      const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
      if (decodedState.clientId) activeClientId = decodedState.clientId;
      if (decodedState.clientSecret) activeClientSecret = decodedState.clientSecret;
    } catch (e) {
      console.error("Error decoding state", e);
    }
  }

  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: activeClientId,
      client_secret: activeClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const tokens = response.data;
    
    // Send success message to parent window and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'GOOGLE_AUTH_SUCCESS', 
                tokens: ${JSON.stringify(tokens)} 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Autenticación exitosa. Esta ventana se cerrará automáticamente.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Error exchanging code:", error.response?.data || error.message);
    res.status(500).send("Error en la autenticación con Google");
  }
});

// Proxy for Gemini to keep key safe (optional but good practice)
app.post("/api/ai/metadata", async (req, res) => {
    // This is handled by the client for now to keep things simple as per previous turns,
    // but we could move it here if needed.
    res.status(501).send("Not implemented yet on server");
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
