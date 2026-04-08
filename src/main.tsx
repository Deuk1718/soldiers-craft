import { createRoot } from "react-dom/client";
import "./index.css";

(["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const).forEach((key) => {
  const val = import.meta.env[key];

  if (typeof val === "string") {
    (import.meta.env as Record<string, string>)[key] = val.replace(/"/g, "").trim();
  }
});

async function bootstrap() {
  const { default: App } = await import("./App.tsx");
  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
