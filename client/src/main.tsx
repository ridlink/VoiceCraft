import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the page title
document.title = "VoiceCraft AI | Text-to-Speech Generator";

createRoot(document.getElementById("root")!).render(<App />);
