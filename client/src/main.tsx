import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp";
import "./index.css";

// Using SimpleApp instead of App to work around the shadcn error
createRoot(document.getElementById("root")!).render(<SimpleApp />);
