import { createSignal, Show, Switch, Match } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { BackButton, useCloudStorage, useDeviceStorage, useSecureStorage } from "@rustigram/tma-solid";
import { Section, Code, Btn, toast } from "../components/index";

type Tab = "cloud" | "device" | "secure";

function StoragePanel(props: {
  getItem: (k: string) => Promise<unknown>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
  loading: () => boolean;
}) {
  const [key, setKey] = createSignal("");
  const [value, setValue] = createSignal("");
  const [result, setResult] = createSignal<string | null | undefined>(undefined);

  const save = async () => {
    if (!key()) return;
    try { await props.setItem(key(), value()); toast("Saved"); }
    catch (e: unknown) { toast((e as Error).message ?? "Error", "err"); }
  };

  const load = async () => {
    if (!key()) return;
    try { setResult((await props.getItem(key())) as string | null); }
    catch { setResult("ERROR"); }
  };

  const del = async () => {
    if (!key()) return;
    try { await props.removeItem(key()); toast("Removed"); setResult(undefined); }
    catch { toast("Error", "err"); }
  };

  return (
    <>
      <Section title="Key">
        <div class="field-row">
          <input class="input" value={key()} onInput={(e) => setKey(e.currentTarget.value)} placeholder="key" />
        </div>
      </Section>
      <Section title="Value (write)">
        <div class="field-row">
          <input class="input" value={value()} onInput={(e) => setValue(e.currentTarget.value)} placeholder="value to store" />
        </div>
        <div class="btn-row" style={{ display: "flex", gap: "8px" }}>
          <Btn label="Set" loading={props.loading()} onClick={save} />
          <Btn label="Del" variant="danger" size="sm" onClick={del} />
        </div>
      </Section>
      <Section title="Read">
        <div class="btn-row"><Btn label="Get" variant="ghost" loading={props.loading()} onClick={load} /></div>
        <Show when={result() !== undefined}>
          <div class="padded">
            <Code value={result() ?? null} placeholder="null — key not found" />
          </div>
        </Show>
      </Section>
    </>
  );
}

function SecurePanel() {
  const ss = useSecureStorage();
  const [key, setKey] = createSignal("");
  const [value, setValue] = createSignal("");
  const [result, setResult] = createSignal<{ value: string | null; canRestore: boolean } | undefined>(undefined);

  return (
    <>
      <Section title="Key">
        <div class="field-row">
          <input class="input" value={key()} onInput={(e) => setKey(e.currentTarget.value)} placeholder="key" />
        </div>
      </Section>
      <Section title="Value (write)">
        <div class="field-row">
          <input class="input" value={value()} onInput={(e) => setValue(e.currentTarget.value)} placeholder="value to secure-store" />
        </div>
        <div class="btn-row">
          <Btn label="Set" loading={ss.loading()} onClick={async () => {
            try { await ss.setItem(key(), value()); toast("Saved to Secure Storage"); }
            catch { toast("Error", "err"); }
          }} />
        </div>
      </Section>
      <Section title="Read">
        <div class="btn-row">
          <Btn label="Get" variant="ghost" loading={ss.loading()} onClick={async () => {
            try { setResult(await ss.getItem(key())); }
            catch { toast("Error", "err"); }
          }} />
        </div>
        <Show when={result() !== undefined}>
          <Code value={result()?.value ?? null} placeholder="null" />
          <Show when={result()?.canRestore}>
            <div class="btn-row" style={{ "margin-top": "8px" }}>
              <Btn label="Restore from backup" variant="ghost" onClick={async () => {
                const v = await ss.restoreItem(key());
                setResult({ value: v, canRestore: false });
                toast("Restored");
              }} />
            </div>
          </Show>
        </Show>
      </Section>
    </>
  );
}

export default function StoragePage() {
  const navigate = useNavigate();
  const [tab, setTab] = createSignal<Tab>("cloud");
  const cloud = useCloudStorage();
  const device = useDeviceStorage();

  return (
    <div class="page">
      <BackButton onBack={() => navigate(-1)} />

      <div class="section-body" style={{ "margin-top": "0" }}>
        <div class="tabs">
          {(["cloud", "device", "secure"] as Tab[]).map((t) => (
            <button class={`tab${tab() === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <Switch>
        <Match when={tab() === "cloud"}>
          <StoragePanel
            getItem={cloud.getItem}
            setItem={cloud.setItem}
            removeItem={cloud.removeItem}
            loading={cloud.loading}
          />
        </Match>
        <Match when={tab() === "device"}>
          <StoragePanel
            getItem={device.getItem}
            setItem={device.setItem}
            removeItem={device.removeItem}
            loading={device.loading}
          />
          <Section title="Actions">
            <div class="btn-row">
              <Btn label="Clear all" variant="danger" onClick={async () => {
                await device.clear(); toast("Device storage cleared");
              }} />
            </div>
          </Section>
        </Match>
        <Match when={tab() === "secure"}>
          <SecurePanel />
        </Match>
      </Switch>
    </div>
  );
}
