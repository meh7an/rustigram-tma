import { Show, type JSX } from "solid-js";
import { createSignal } from "solid-js";

// ── Toast ─────────────────────────────────────────────────────────────────────

const [_toast, _setToast] = createSignal<{ msg: string; type: "ok" | "err" } | null>(null);
const [_leaving, _setLeaving] = createSignal(false);
let _timer: ReturnType<typeof setTimeout>;

export function toast(msg: string, type: "ok" | "err" = "ok") {
  clearTimeout(_timer);
  _setLeaving(false);
  _setToast({ msg, type });
  _timer = setTimeout(() => {
    _setLeaving(true);
    setTimeout(() => _setToast(null), 160);
  }, 2400);
}

export function Toast() {
  return (
    <Show when={_toast()}>
      {(t) => (
        <div class={`toast toast-${t().type}${_leaving() ? " toast-out" : ""}`}>
          {t().msg}
        </div>
      )}
    </Show>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

interface SectionProps { title?: string; children: JSX.Element; }
export function Section(props: SectionProps) {
  return (
    <div class="section">
      <Show when={props.title}>
        <div class="section-header">{props.title}</div>
      </Show>
      <div class="section-body">{props.children}</div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface RowProps { label: string; value?: JSX.Element; mono?: boolean; }
export function Row(props: RowProps) {
  return (
    <div class="row">
      <span class="row-label">{props.label}</span>
      <span class={`row-value${props.mono ? " mono" : ""}`}>{props.value ?? "—"}</span>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

type BadgeVariant = "on" | "off" | "info" | "warn" | "err";
interface BadgeProps { label: string; variant?: BadgeVariant; active?: boolean; }
export function Badge(props: BadgeProps) {
  const v = () => props.variant ?? (props.active ? "on" : "off");
  return <span class={`badge badge-${v()}`}>{props.label}</span>;
}

// ── Btn ───────────────────────────────────────────────────────────────────────

interface BtnProps {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  size?: "md" | "sm";
}
export function Btn(props: BtnProps) {
  const cls = () => {
    const v = props.variant ?? "primary";
    const s = props.size === "sm" ? " btn-sm" : "";
    return `btn${v === "ghost" ? " btn-ghost" : v === "danger" ? " btn-danger" : ""}${s}`;
  };
  return (
    <button
      class={cls()}
      onClick={props.onClick}
      disabled={props.loading || props.disabled}
    >
      <Show when={props.loading} fallback={props.label}>
        <span style={{ opacity: "0.6" }}>⋯</span>
      </Show>
    </button>
  );
}

// ── Code display ──────────────────────────────────────────────────────────────

interface CodeProps { value: string | null | undefined; placeholder?: string; }
export function Code(props: CodeProps) {
  return (
    <div class="code">
      <Show when={props.value != null} fallback={
        <span class="null-value">{props.placeholder ?? "null"}</span>
      }>
        {props.value}
      </Show>
    </div>
  );
}
