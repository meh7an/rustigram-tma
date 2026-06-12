import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { BackButton, useLocation } from "@rustigram/tma-solid";
import { Section, Row, Badge, Btn, toast } from "../components/index";
import type { LocationData } from "@rustigram/tma-core";

export default function LocationPage() {
  const navigate = useNavigate();
  const lm = useLocation();
  const [loc, setLoc] = createSignal<LocationData | null | "pending">(null);

  const handleRequest = async () => {
    setLoc("pending");
    try {
      await lm.init();
      const data = await lm.getLocation();
      setLoc(data);
      if (!data) toast("Access denied", "err");
    } catch (e: unknown) {
      toast((e as Error).message ?? "Error", "err");
      setLoc(null);
    }
  };

  const fmt = (v: number | null) => v != null ? v.toFixed(4) : "—";

  return (
    <div class="page">
      <BackButton onBack={() => navigate(-1)} />

      <Section title="Status">
        <div class="row" style={{ gap: "8px", "flex-wrap": "wrap" }}>
          <Badge label="Inited"    active={lm.status().isInited} />
          <Badge label="Available" active={lm.status().isLocationAvailable} />
          <Badge label="Granted"   active={lm.status().isAccessGranted} />
        </div>
      </Section>

      <Section title="Action">
        <div class="btn-row">
          <Btn
            label={loc() === "pending" ? "Requesting…" : "Request Location"}
            loading={loc() === "pending"}
            onClick={handleRequest}
          />
        </div>
        <Show when={!lm.status().isAccessGranted && lm.status().isInited}>
          <div class="btn-row">
            <Btn label="Open Settings" variant="ghost" onClick={() => lm.openSettings()} />
          </div>
        </Show>
      </Section>

      <Show when={loc() !== null && loc() !== "pending"}>
        <Show when={loc() as LocationData | null}
          fallback={
            <Section title="Result">
              <div class="row"><span style={{ color: "var(--tg-theme-destructive-text-color,#ff453a)", "font-size": "14px" }}>Access denied — enable location in Settings</span></div>
            </Section>
          }
        >
          {(d) => (
            <>
              <Section title="Coordinates">
                <Row label="Latitude"  value={d().latitude.toFixed(6)}  mono />
                <Row label="Longitude" value={d().longitude.toFixed(6)} mono />
                <Row label="Altitude"  value={`${fmt(d().altitude)} m`} mono />
              </Section>
              <Section title="Motion">
                <Row label="Course"  value={`${fmt(d().course)}°`} mono />
                <Row label="Speed"   value={`${fmt(d().speed)} m/s`} mono />
              </Section>
              <Section title="Accuracy">
                <Row label="Horizontal" value={`±${fmt(d().horizontal_accuracy)} m`} mono />
                <Row label="Vertical"   value={`±${fmt(d().vertical_accuracy)} m`} mono />
              </Section>
            </>
          )}
        </Show>
      </Show>
    </div>
  );
}
