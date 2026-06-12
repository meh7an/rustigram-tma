import { For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  BackButton,
  useThemeParams, useColorScheme,
  useViewportHeight, useViewportStableHeight, useIsExpanded, useTma,
} from "@rustigram/tma-solid";
import { Section, Row, Badge } from "../components/index";

const THEME_VARS: [keyof NonNullable<ReturnType<typeof useThemeParams>>, string][] = [
  ["bg_color",                  "--tg-theme-bg-color"],
  ["text_color",                "--tg-theme-text-color"],
  ["hint_color",                "--tg-theme-hint-color"],
  ["link_color",                "--tg-theme-link-color"],
  ["button_color",              "--tg-theme-button-color"],
  ["button_text_color",         "--tg-theme-button-text-color"],
  ["secondary_bg_color",        "--tg-theme-secondary-bg-color"],
  ["header_bg_color",           "--tg-theme-header-bg-color"],
  ["bottom_bar_bg_color",       "--tg-theme-bottom-bar-bg-color"],
  ["accent_text_color",         "--tg-theme-accent-text-color"],
  ["section_bg_color",          "--tg-theme-section-bg-color"],
  ["section_header_text_color", "--tg-theme-section-header-text-color"],
  ["section_separator_color",   "--tg-theme-section-separator-color"],
  ["subtitle_text_color",       "--tg-theme-subtitle-text-color"],
  ["destructive_text_color",    "--tg-theme-destructive-text-color"],
];

export default function ThemePage() {
  const navigate = useNavigate();
  const { bridge } = useTma();
  const params    = useThemeParams();
  const scheme    = useColorScheme();
  const vh        = useViewportHeight();
  const svh       = useViewportStableHeight();
  const expanded  = useIsExpanded();

  return (
    <div class="page">
      <BackButton onBack={() => navigate(-1)} />

      <Section title="Color Scheme">
        <div class="row">
          <span class="row-label">Mode</span>
          <Badge label={scheme().toUpperCase()} variant={scheme() === "dark" ? "info" : "warn"} />
        </div>
      </Section>

      <Section title="Theme Params">
        <div class="swatches">
          <For each={THEME_VARS}>
            {([field, varName]) => {
              const color = () => params()[field];
              return (
                <div class="swatch">
                  <div
                    class="swatch-dot"
                    style={{
                      background: color() ?? "transparent",
                      border: color() ? "none" : "1px dashed rgba(255,255,255,.2)",
                    }}
                  />
                  <div class="swatch-info">
                    <div class="swatch-name">{varName}</div>
                    <div class="swatch-hex">{color() ?? "—"}</div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Section>

      <Section title="Viewport">
        <Row label="viewportHeight"       value={`${vh().toFixed(1)}px`}  mono />
        <Row label="viewportStableHeight" value={`${svh().toFixed(1)}px`} mono />
        <Row label="isExpanded"           value={<Badge label={expanded() ? "YES" : "NO"} active={expanded()} />} />
      </Section>

      <Section title="Platform">
        <Row label="platform" value={bridge.launchContext.platform} mono />
        <Row label="version"  value={bridge.launchContext.version}  mono />
      </Section>
    </div>
  );
}
