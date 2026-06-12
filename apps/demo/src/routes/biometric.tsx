import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { BackButton, useBiometric } from "@rustigram/tma-solid";
import { Section, Row, Badge, Btn, toast } from "../components/index";

export default function BiometricPage() {
  const navigate = useNavigate();
  const bm = useBiometric();
  const [token, setToken] = createSignal("");
  const [authResult, setAuthResult] = createSignal<string | null>(null);

  const s = bm.status;

  return (
    <div class="page">
      <BackButton onBack={() => navigate(-1)} />

      <Section title="Status">
        <div class="row" style={{ gap: "6px", "flex-wrap": "wrap" }}>
          <Badge label="Inited"    active={s().isInited} />
          <Badge label="Available" active={s().isBiometricAvailable} />
          <Badge label="Granted"   active={s().isAccessGranted} />
          <Badge label="Token saved" active={s().isBiometricTokenSaved} />
        </div>
        <Row label="Type"      value={<Badge label={s().biometricType.toUpperCase()} variant="info" />} />
        <Row label="Device ID" value={s().deviceId || "—"} mono />
      </Section>

      <Section title="Flow">
        <div class="btn-row">
          <Btn
            label="1 · Initialize"
            disabled={s().isInited}
            onClick={async () => {
              await bm.init();
              toast("Initialized");
            }}
          />
        </div>
        <div class="btn-row">
          <Btn
            label="2 · Request Access"
            disabled={!s().isInited}
            onClick={async () => {
              const granted = await bm.requestAccess({ reason: "rustigram-tma demo" });
              toast(granted ? "Access granted" : "Access denied", granted ? "ok" : "err");
            }}
          />
        </div>
        <div class="btn-row">
          <Btn
            label="3 · Authenticate"
            disabled={!s().isAccessGranted}
            onClick={async () => {
              const r = await bm.authenticate({ reason: "Verify identity for demo" });
              setAuthResult(r.success ? (r.token ?? "no token") : "FAILED");
              toast(r.success ? "Authenticated" : "Auth failed", r.success ? "ok" : "err");
            }}
          />
        </div>
        {authResult() && <Row label="Auth result" value={authResult()} mono />}
      </Section>

      <Section title="Token">
        <div class="field-row">
          <input
            class="input"
            value={token()}
            onInput={(e) => setToken(e.currentTarget.value)}
            placeholder="new token value (empty to clear)"
          />
        </div>
        <div class="btn-row">
          <Btn
            label="Update Token"
            variant="ghost"
            disabled={!s().isAccessGranted}
            onClick={async () => {
              const ok = await bm.updateToken(token());
              toast(ok ? "Token updated" : "Failed", ok ? "ok" : "err");
            }}
          />
        </div>
        <div class="btn-row">
          <Btn label="Open Settings" variant="ghost" onClick={() => bm.openSettings()} />
        </div>
      </Section>
    </div>
  );
}
