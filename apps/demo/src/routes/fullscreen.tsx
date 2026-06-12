import { useNavigate } from "@solidjs/router";
import {
  BackButton, SecondaryButton,
  useIsFullscreen, useIsOrientationLocked,
  useSafeAreaInset, useContentSafeAreaInset,
  useTma,
} from "@rustigram/tma-solid";
import { Section, Row, Badge, Btn, toast } from "../components/index";

export default function FullscreenPage() {
  const navigate = useNavigate();
  const { bridge } = useTma();
  const wa = bridge.webApp;

  const isFS    = useIsFullscreen();
  const isLocked = useIsOrientationLocked();
  const safeArea = useSafeAreaInset();
  const cSafeArea = useContentSafeAreaInset();

  return (
    <div class="page">
      <BackButton onBack={() => navigate(-1)} />
      <SecondaryButton text="Exit FS" onClick={() => wa.exitFullscreen()} />

      <Section title="Fullscreen">
        <div class="row" style={{ gap: "8px" }}>
          <Badge label="Fullscreen" active={isFS()} />
          <Badge label="Locked" active={isLocked()} />
        </div>
        <div class="btn-row" style={{ display: "flex", gap: "8px" }}>
          <Btn label="Enter" onClick={() => { wa.requestFullscreen(); toast("Fullscreen requested"); }} />
          <Btn label="Exit" variant="ghost" size="sm" onClick={() => wa.exitFullscreen()} />
        </div>
      </Section>

      <Section title="Orientation">
        <div class="btn-row" style={{ display: "flex", gap: "8px" }}>
          <Btn label="Lock" onClick={() => { wa.lockOrientation(); toast("Locked"); }} />
          <Btn label="Unlock" variant="ghost" size="sm" onClick={() => { wa.unlockOrientation(); toast("Unlocked"); }} />
        </div>
      </Section>

      <Section title="Safe Area Insets (px)">
        <Row label="top"    value={`${safeArea().top}px`}    mono />
        <Row label="bottom" value={`${safeArea().bottom}px`} mono />
        <Row label="left"   value={`${safeArea().left}px`}   mono />
        <Row label="right"  value={`${safeArea().right}px`}  mono />
      </Section>

      <Section title="Content Safe Area (px)">
        <Row label="top"    value={`${cSafeArea().top}px`}    mono />
        <Row label="bottom" value={`${cSafeArea().bottom}px`} mono />
        <Row label="left"   value={`${cSafeArea().left}px`}   mono />
        <Row label="right"  value={`${cSafeArea().right}px`}  mono />
      </Section>

      <Section title="Home Screen">
        <div class="btn-row" style={{ display: "flex", gap: "8px" }}>
          <Btn label="Add to Home" onClick={() => { wa.addToHomeScreen(); toast("Requested"); }} />
          <Btn label="Check" variant="ghost" size="sm" onClick={() => {
            wa.checkHomeScreenStatus((s) => toast(`Status: ${s}`));
          }} />
        </div>
      </Section>
    </div>
  );
}
