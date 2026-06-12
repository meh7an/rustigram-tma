import { createSignal, Switch, Match, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  BackButton,
  useAccelerometer,
  useGyroscope,
  useDeviceOrientation,
} from "@rustigram/tma-solid";
import { Section, Badge, Btn, toast } from "../components/index";

type Tab = "accel" | "gyro" | "orient";

const RATES = [100, 250, 500, 1000] as const;

function SensorXYZPanel(props: {
  hook: ReturnType<typeof useAccelerometer>;
  range: number;
  unit: string;
}) {
  const [rate, setRate] = createSignal<number>(250);

  const barPct = (v: number) =>
    Math.max(0, Math.min(100, ((v + props.range) / (props.range * 2)) * 100));
  const barColor = (v: number) =>
    v >= 0
      ? "var(--tg-theme-link-color,#0a84ff)"
      : "var(--tg-theme-destructive-text-color,#ff453a)";

  return (
    <>
      <Section title="Controls">
        <div class="chips">
          {RATES.map((r) => (
            <button class={`chip${rate() === r ? " active" : ""}`} onClick={() => setRate(r)}>
              {r}ms
            </button>
          ))}
        </div>
        <div class="btn-row">
          <Show
            when={!props.hook.isRunning()}
            fallback={
              <Btn
                label="Stop"
                variant="danger"
                onClick={() => {
                  props.hook.stop();
                  toast("Stopped");
                }}
              />
            }
          >
            <Btn
              label="Start tracking"
              onClick={() => {
                const refreshRate = rate();
                props.hook
                  .start({ refresh_rate: refreshRate })
                  .then(() => {
                    toast("Tracking started");
                  })
                  .catch((e: unknown) => {
                    toast((e as Error).message ?? "Not supported", "err");
                  });
              }}
            />
          </Show>
        </div>
      </Section>

      <Section title="Live data">
        <Show
          when={props.hook.data()}
          fallback={<div class="empty">Start tracking to see live data</div>}
        >
          {(d) => (
            <>
              {(["x", "y", "z"] as const).map((axis) => (
                <div class="gauge-row">
                  ...
                  <div
                    class="gauge-fill"
                    style={{ width: `${barPct(d()[axis])}%`, background: barColor(d()[axis]) }}
                  />
                  <span class="gauge-value">
                    {d()[axis].toFixed(3)} {props.unit}
                  </span>
                </div>
              ))}
            </>
          )}
        </Show>
      </Section>
    </>
  );
}

function OrientPanel() {
  const { start, stop, data, isRunning } = useDeviceOrientation();
  const [rate, setRate] = createSignal(250);

  const toDeg = (r: number) => ((r * 180) / Math.PI).toFixed(1) + "°";

  return (
    <>
      <Section title="Controls">
        <div class="chips">
          {RATES.map((r) => (
            <button class={`chip${rate() === r ? " active" : ""}`} onClick={() => setRate(r)}>
              {r}ms
            </button>
          ))}
        </div>
        <div class="btn-row">
          <Show
            when={!isRunning()}
            fallback={<Btn label="Stop" variant="danger" onClick={() => stop()} />}
          >
            <Btn
              label="Start tracking"
              onClick={() => {
                start({ refresh_rate: rate(), need_absolute: true }).catch(() => {
                  toast("Not supported", "err");
                });
              }}
            />
          </Show>
        </div>
      </Section>
      <Section title="Orientation">
        <Show when={data()} fallback={<div class="empty">Start tracking to see orientation</div>}>
          {(d) => (
            <>
              <div class="row">
                <span class="row-label">Alpha (Z)</span>
                <span class="row-value mono">{toDeg(d().alpha)}</span>
              </div>
              <div class="row">
                <span class="row-label">Beta (X)</span>
                <span class="row-value mono">{toDeg(d().beta)}</span>
              </div>
              <div class="row">
                <span class="row-label">Gamma (Y)</span>
                <span class="row-value mono">{toDeg(d().gamma)}</span>
              </div>
              <div class="row">
                <span class="row-label">Absolute</span>
                <span class="row-value">
                  <Badge label={d().absolute ? "YES" : "NO"} active={d().absolute} />
                </span>
              </div>
            </>
          )}
        </Show>
      </Section>
    </>
  );
}

export default function SensorsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = createSignal<Tab>("accel");
  const accel = useAccelerometer();
  const gyro = useGyroscope();

  return (
    <div class="page">
      <BackButton onBack={() => navigate(-1)} />
      <div class="section-body">
        <div class="tabs">
          {(
            [
              ["accel", "ACCEL"],
              ["gyro", "GYRO"],
              ["orient", "ORIENT"],
            ] as [Tab, string][]
          ).map(([t, l]) => (
            <button class={`tab${tab() === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <Switch>
        <Match when={tab() === "accel"}>
          <SensorXYZPanel hook={accel} range={15} unit="m/s²" />
        </Match>
        <Match when={tab() === "gyro"}>
          <SensorXYZPanel hook={gyro} range={10} unit="rad/s" />
        </Match>
        <Match when={tab() === "orient"}>
          <OrientPanel />
        </Match>
      </Switch>
    </div>
  );
}
