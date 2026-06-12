import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { useTma, useIsVersionAtLeast } from "@rustigram/tma-solid";
import { Badge } from "../components/index";

const NAV = [
  { path: "/buttons",    tag: "UI",  color: "#0a84ff", label: "UI Controls"    },
  { path: "/storage",    tag: "DB",  color: "#30d158", label: "Storage"         },
  { path: "/sensors",    tag: "IMU", color: "#bf5af2", label: "Motion Sensors"  },
  { path: "/location",   tag: "GPS", color: "#ff9f0a", label: "Location"        },
  { path: "/biometric",  tag: "BIO", color: "#ff453a", label: "Biometrics"      },
  { path: "/fullscreen", tag: "FS",  color: "#5ac8fa", label: "Fullscreen"      },
  { path: "/media",      tag: "SHR", color: "#ff375f", label: "Media & Sharing" },
  { path: "/theme",      tag: "THM", color: "#ffd60a", label: "Theme Inspector" },
];

export default function HomePage() {
  const { bridge } = useTma();
  const ctx = bridge.launchContext;
  const user = ctx.initDataUnsafe.user;
  const isV8 = useIsVersionAtLeast("8.0");

  return (
    <div class="page">
      {/* User card */}
      <div class="user-card">
        <div class="user-avatar">
          {user?.first_name?.[0]?.toUpperCase() ?? "T"}
        </div>
        <div>
          <div class="user-name">
            {user ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}` : "Telegram User"}
          </div>
          <div class="user-meta">
            {user?.username ? `@${user.username}` : "No username"} · {ctx.platform}
          </div>
          <div class="user-badges">
            <Badge label={`v${ctx.version}`} variant="info" />
            <Show when={user?.is_premium}>
              <Badge label="PREMIUM" variant="warn" />
            </Show>
            <Show when={isV8()}>
              <Badge label="API 8.0+" variant="on" />
            </Show>
          </div>
        </div>
      </div>

      {/* Nav list */}
      <div style={{ background: "var(--tg-theme-section-bg-color,var(--tg-theme-secondary-bg-color,#2c2c2e))", "border-top": "1px solid var(--tg-theme-section-separator-color,rgba(255,255,255,.07))", "border-bottom": "1px solid var(--tg-theme-section-separator-color,rgba(255,255,255,.07))" }}>
        {NAV.map((item) => (
          <A href={item.path} class="nav-row">
            <div class="nav-tag" style={{ background: item.color }}>{item.tag}</div>
            <span class="nav-label">{item.label}</span>
            <span class="nav-arrow">›</span>
          </A>
        ))}
      </div>

      <div class="padded mt12" style={{ "text-align": "center" }}>
        <span style={{ "font-size": "11px", color: "var(--tg-theme-hint-color,#8e8e93)", "font-family": "'SF Mono','Fira Code',monospace" }}>
          rustigram-tma demo · {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
}
