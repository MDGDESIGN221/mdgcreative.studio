'use client';
import LightingCanvas from '../../../components/learning/core/LightingCanvas';
import Bust from '../../../components/learning/core/Bust';
import LightRig from '../../../components/learning/core/LightRig';
import LightGizmo from '../../../components/learning/core/LightGizmo';
import CameraRig from '../../../components/learning/core/CameraRig';
import { useLightStore } from '../../../lib/learning/store';

function Slider({ label, value, min, max, step, onChange, suffix = '' }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'rgba(232,224,208,0.75)' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <span style={{ color: '#3DBFA3', fontFamily: 'monospace' }}>
          {typeof value === 'number' ? value.toFixed(2) : value}
          {suffix}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </label>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 12,
        color: 'rgba(232,224,208,0.4)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginTop: 12,
      }}
    >
      {children}
    </div>
  );
}

export default function Phase1TestPage() {
  const s = useLightStore();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', minHeight: '100vh', background: '#0B0C0D' }}>
      <div style={{ position: 'relative' }}>
        <LightingCanvas>
          <Bust />
          <LightRig />
          <LightGizmo />
          <CameraRig />
        </LightingCanvas>
      </div>

      <aside
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          borderLeft: '1px solid rgba(232,224,208,0.1)',
          overflowY: 'auto',
          fontFamily: 'sans-serif',
        }}
      >
        <SectionLabel>Lumière (Ch.1)</SectionLabel>
        <Slider label="Intensité" value={s.intensity} min={0.1} max={3} step={0.05} onChange={(v) => s.setLight({ intensity: v })} suffix="×" />
        <Slider label="Dureté" value={s.softness} min={0} max={1} step={0.01} onChange={(v) => s.setLight({ softness: v })} />
        <Slider label="Distance" value={s.distance} min={1.2} max={4} step={0.05} onChange={(v) => s.setLight({ distance: v })} suffix=" m" />
        <Slider label="Température" value={s.kelvin} min={2000} max={10000} step={100} onChange={(v) => s.setLight({ kelvin: v })} suffix="K" />
        <Slider label="Azimuth" value={s.azimuth} min={-180} max={180} step={1} onChange={(v) => s.setLight({ azimuth: v })} suffix="°" />
        <Slider label="Élévation" value={s.elevation} min={-80} max={85} step={1} onChange={(v) => s.setLight({ elevation: v })} suffix="°" />

        <SectionLabel>Fresnel / Rim (Ch.5)</SectionLabel>
        <Slider label="Wrap (face → arrière)" value={s.rimWrap} min={0} max={1} step={0.01} onChange={(v) => s.setLight({ rimWrap: v })} />
        <Slider label="Intensité rim" value={s.rimIntensity} min={0} max={3} step={0.05} onChange={(v) => s.setLight({ rimIntensity: v })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(232,224,208,0.75)' }}>
          <input type="checkbox" checked={s.showFresnelMask} onChange={(e) => s.setLight({ showFresnelMask: e.target.checked })} />
          Afficher le masque de Fresnel
        </label>

        <SectionLabel>Ambiance (postprocessing)</SectionLabel>
        <Slider label="Bloom" value={s.bloom} min={0} max={2} step={0.05} onChange={(v) => s.setLight({ bloom: v })} />
        <Slider label="Grain" value={s.grain} min={0} max={0.5} step={0.01} onChange={(v) => s.setLight({ grain: v })} />
        <Slider label="Vignette" value={s.vignette} min={0} max={1} step={0.01} onChange={(v) => s.setLight({ vignette: v })} />
        <Slider label="Force du grade" value={s.gradeStrength} min={0} max={1} step={0.01} onChange={(v) => s.setLight({ gradeStrength: v })} />
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'rgba(232,224,208,0.75)' }}>
          Teinte du grade
          <input type="color" value={s.gradeTint} onChange={(e) => s.setLight({ gradeTint: e.target.value })} />
        </label>
      </aside>
    </div>
  );
}
