'use client';
import { useMemo, useState, type CSSProperties } from 'react';

function lbsToKg(lbs: number) {
  return lbs * 0.45359237;
}

function feetInchesToMeters(feet: number, inches: number) {
  const totalInches = feet * 12 + inches;
  return totalInches * 0.0254;
}

const verdictMap = [
  { max: 18.5, label: 'Bajo peso', color: '#38bdf8', message: 'Sumemos fuerza y nutricion precisa para llegar al punto ideal.' },
  { max: 25, label: 'Rango ideal', color: '#4ade80', message: 'Excelente base. Vamos a subir potencia y performance.' },
  { max: 30, label: 'Atencion', color: '#facc15', message: 'Pequenos ajustes consolidaran tu composicion.' },
  { max: Number.POSITIVE_INFINITY, label: 'Prioridad', color: '#f97316', message: 'Es hora de un plan inteligente para recomposicion y salud.' },
];

function getVerdict(imc: number) {
  return verdictMap.find((item) => imc < item.max) ?? verdictMap[0];
}

export default function ImcPage() {
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(8);
  const [weight, setWeight] = useState(165);

  const { imc, verdict, indicatorStyle } = useMemo(() => {
    const meters = feetInchesToMeters(feet, inches);
    const kilograms = lbsToKg(weight);
    const value = meters > 0 ? +(kilograms / (meters * meters)).toFixed(1) : 0;
    const verdictData = getVerdict(value || 0);

    const percentage = value ? Math.min(1, Math.max(0, (value - 15) / 20)) : 0.2;
    const offset = percentage * 100 - 50;

    return {
      imc: value,
      verdict: verdictData,
      indicatorStyle: {
        '--offset': `${offset}%`,
        '--marker-color': verdictData.color,
      } as CSSProperties,
    };
  }, [feet, inches, weight]);

  return (
    <main className="section" style={{ display: 'grid', gap: 48 }}>
      <div className="container imc-shell">
        <div className="imc-form" style={{ width: 'min(520px, 100%)' }}>
          <div>
            <span className="section-title">Calculadora IMC</span>
            <h1 style={{ margin: '12px 0 0' }}>Evalua tu punto de partida</h1>
            <p className="link-muted" style={{ marginTop: 6 }}>
              Ingresa tu estatura en pies y pulgadas, junto al peso en libras. El resultado te mostrara en que zona estas y como mejorarla con nuestros planes.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <label className="input-label">
              Estatura (pies)
              <input
                className="input-field"
                type="number"
                min={4}
                max={7}
                value={feet}
                onChange={(event) => setFeet(Math.max(0, Number(event.target.value)))}
              />
            </label>
            <label className="input-label">
              Estatura (pulgadas)
              <input
                className="input-field"
                type="number"
                min={0}
                max={11}
                value={inches}
                onChange={(event) => setInches(Math.max(0, Math.min(11, Number(event.target.value))))}
              />
            </label>
            <label className="input-label">
              Peso (lbs)
              <input
                className="input-field"
                type="number"
                min={80}
                max={400}
                value={weight}
                onChange={(event) => setWeight(Math.max(0, Number(event.target.value)))}
              />
            </label>
          </div>
        </div>
        <div className="imc-result">
          <div>
            <span className="section-title">Resultado</span>
            <h2 style={{ margin: '8px 0' }}>IMC: {imc ? imc.toFixed(1) : '--'}</h2>
            <p className="link-muted" style={{ margin: 0 }}>Estado: {verdict.label}</p>
          </div>
          <div className="imc-gauge">
            <div className="imc-gauge-track">
              <div className="imc-gauge-marker" style={indicatorStyle} />
            </div>
            <div className="imc-gauge-labels">
              <span>Lean</span>
              <span>Ideal</span>
              <span>Atencion</span>
              <span>Prioridad</span>
            </div>
          </div>
          <p className="imc-message">{verdict.message}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a className="button primary" href="/sign-up">
              Disenar mi programa
            </a>
            <a className="button secondary" href="mailto:coach@jwfitness.co">
              Consultar con un coach
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
