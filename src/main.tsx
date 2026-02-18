import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Self-hosted Bengali fonts — work on all devices without internet dependency
import "@fontsource/noto-sans-bengali/400.css";
import "@fontsource/noto-sans-bengali/500.css";
import "@fontsource/noto-sans-bengali/600.css";
import "@fontsource/noto-sans-bengali/700.css";
import "@fontsource/noto-serif-bengali/400.css";
import "@fontsource/noto-serif-bengali/600.css";
import "@fontsource/noto-serif-bengali/700.css";
import "@fontsource/noto-serif-bengali/800.css";

createRoot(document.getElementById("root")!).render(<App />);
