  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);

  // ---- PWA : enregistrement du Service Worker ---------------------
  // Active le mode hors-ligne + l'installation ("APK léger") en
  // production uniquement. En dev (vite dev), on garde le cache clair.
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("Erreur d'enregistrement du Service Worker:", err));
    });
  }
  