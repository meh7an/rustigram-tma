import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { TmaProvider } from "@rustigram/tma-solid";
import { Toast } from "./components/index";
import "./app.css";

function NotInTelegram() {
  return (
    <div style={{ padding: "48px 24px", "text-align": "center" }}>
      <div
        style={{
          "font-family": "'SF Mono','Fira Code',monospace",
          "font-size": "12px",
          color: "var(--tg-theme-hint-color,#8e8e93)",
          "margin-bottom": "16px",
        }}
      >
        ERR_NO_TELEGRAM_CONTEXT
      </div>
      <div style={{ "font-size": "18px", "font-weight": "600", "margin-bottom": "8px" }}>
        Open in Telegram
      </div>
      <div style={{ "font-size": "14px", color: "var(--tg-theme-hint-color,#8e8e93)" }}>
        This app requires Telegram WebApp context.
      </div>
    </div>
  );
}

export default function App() {
  console.log("[App] rendering");
  console.log("Telegram object:", window.Telegram);
  console.log("WebApp:", window.Telegram?.WebApp);
  console.log("initData:", window.Telegram?.WebApp?.initData);
  return (
    <Router
      root={(props) => (
        <TmaProvider fallback={<NotInTelegram />}>
          <Suspense>{props.children}</Suspense>
          <Toast />
        </TmaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
