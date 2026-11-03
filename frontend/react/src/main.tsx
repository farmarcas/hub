import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/app/AppRoutes";
import { SessionProvider } from "@/features/session";
import "@/styles/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Elemento #root não encontrado em index.html");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>,
);
