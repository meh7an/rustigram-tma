import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { BackButton, useTma } from "@rustigram/tma-solid";
import { Section, Code, Btn, toast } from "../components/index";

export default function MediaPage() {
  const navigate = useNavigate();
  const { bridge } = useTma();
  const wa = bridge.webApp;

  const [qrResult, setQrResult] = createSignal<string | null>(null);
  const [clipResult, setClipResult] = createSignal<string | null | undefined>(undefined);
  const [dlUrl, setDlUrl] = createSignal("https://telegram.org/favicon.ico");
  const [dlName, setDlName] = createSignal("telegram-icon.ico");

  return (
    <div class="page">
      <BackButton onBack={() => navigate(-1)} />

      <Section title="Popups">
        <div class="btn-row" style={{ display: "flex", gap: "8px" }}>
          <Btn label="Alert" size="sm" onClick={() => wa.showAlert("Hello from rustigram-tma!")} />
          <Btn label="Confirm" variant="ghost" size="sm" onClick={() =>
            wa.showConfirm("Proceed?", (ok) => toast(ok ? "Confirmed" : "Cancelled", ok ? "ok" : "err"))
          } />
          <Btn label="Popup" variant="ghost" size="sm" onClick={() =>
            wa.showPopup({
              title: "Choose action",
              message: "This is a full popup with multiple button types.",
              buttons: [
                { id: "ok", type: "default", text: "OK" },
                { id: "cancel", type: "cancel" },
                { id: "del", type: "destructive", text: "Delete" },
              ],
            }, (id) => toast(`Button: ${id}`))
          } />
        </div>
      </Section>

      <Section title="QR Scanner">
        <div class="btn-row" style={{ display: "flex", gap: "8px" }}>
          <Btn label="Open Scanner" onClick={() =>
            wa.showScanQrPopup({ text: "Scan any QR code" }, (text) => {
              setQrResult(text);
              toast("QR scanned");
              return true;
            })
          } />
          <Btn label="Close" variant="ghost" size="sm" onClick={() => wa.closeScanQrPopup()} />
        </div>
        <div class="padded mt8">
          <Code value={qrResult()} placeholder="No result yet" />
        </div>
      </Section>

      <Section title="Download File">
        <div class="field-row">
          <input class="input" value={dlUrl()} onInput={(e) => setDlUrl(e.currentTarget.value)} placeholder="https://..." />
        </div>
        <div class="field-row">
          <input class="input" value={dlName()} onInput={(e) => setDlName(e.currentTarget.value)} placeholder="filename.ext" />
        </div>
        <div class="btn-row">
          <Btn label="Download" onClick={() =>
            wa.downloadFile({ url: dlUrl(), file_name: dlName() }, (accepted) =>
              toast(accepted ? "Download started" : "Declined", accepted ? "ok" : "err")
            )
          } />
        </div>
      </Section>

      <Section title="Clipboard">
        <div class="btn-row">
          <Btn label="Read Clipboard" variant="ghost" onClick={() =>
            wa.readTextFromClipboard((text) => {
              setClipResult(text);
              toast(text != null ? "Read" : "No access / empty");
            })
          } />
        </div>
        {clipResult() !== undefined && (
          <div class="padded mt8">
            <Code value={clipResult() as string | null} placeholder="null — no clipboard access" />
          </div>
        )}
        <div class="row" style={{ "font-size": "12px", color: "var(--tg-theme-hint-color)" }}>
          Clipboard access requires attachment menu context
        </div>
      </Section>

      <Section title="Invoice">
        <div class="btn-row">
          <Btn label="Open Invoice (demo)" variant="ghost" onClick={() =>
            wa.openInvoice("https://t.me/$demo_invoice", (status) =>
              toast(`Invoice: ${status}`, status === "paid" ? "ok" : "err")
            )
          } />
        </div>
      </Section>
    </div>
  );
}
