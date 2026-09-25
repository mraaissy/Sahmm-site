import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from "recharts";
import PE from "./pricerEngine";

// Pricer obligataire — valorisation selon la circulaire CDVM/AMMC n° 02/04.
// La courbe BAM est lue dans public/data/courbe_taux.json (prop courbeTauxData).

const MATURITES = ["13S", "26S", "52S", "2A", "5A", "10A", "15A", "20A", "30A"];
const LABELS = { "13S": "13 sem.", "26S": "26 sem.", "52S": "52 sem.", "2A": "2 ans", "5A": "5 ans", "10A": "10 ans", "15A": "15 ans", "20A": "20 ans", "30A": "30 ans" };
const TYPES = [["fixe", "Taux fixe"], ["zc", "Zéro-coupon"], ["amort", "Amortissable"], ["rev", "Révisable"]];
const MODES = [["courbe", "Courbe BAM + prime"], ["taux", "Taux saisi"], ["prix", "Prix → taux"]];
const STORE = "bourseinfo-pricer";

const today = () => new Date().toISOString().slice(0, 10);
const nf = (x, d = 2) => x.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const pc = (x, d = 3) => nf(x * 100, d) + " %";
const frd = (s) => s.split("-").reverse().join("/");
const signe = (v, d) => (v >= 0 ? "+" : "−") + nf(Math.abs(v), d);

const DEFAUT = {
  type: "fixe", code: "BDT 3,50 % 15/06/2030", nominal: "100000", freq: "1", em: "2020-06-15", ech: "2030-06-15",
  tf: "3.5", d1c: "", differe: "0", matTaux: "vie_moyenne", spread: "60", baseCoupon: "exact360",
  dv: today(), convA: "periode", mode: "courbe", prime: "", taux: "2.95", prix: "101.25", typePrix: "pied", jmin: "0",
};

function lireStore() {
  try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch { return {}; }
}

export default function Pricer({ courbeTauxData }) {
  const [f, setF] = useState(() => ({ ...DEFAUT, ...lireStore().form }));
  const [dateCourbe, setDateCourbe] = useState(null);
  const [points, setPoints] = useState(null); // { "13S": "2.228", ... } — modifiables

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setV = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify({ form: f })); } catch {} }, [f]);

  // Dernière courbe BAM disponible par défaut
  useEffect(() => {
    if (courbeTauxData?.length && !dateCourbe) choisirCourbe(courbeTauxData[courbeTauxData.length - 1].date);
  }, [courbeTauxData]);

  function choisirCourbe(date) {
    const row = courbeTauxData.find((d) => d.date === date);
    if (!row) return;
    setDateCourbe(date);
    setPoints(Object.fromEntries(MATURITES.map((m) => [m, row[m] != null ? String(row[m]) : ""])));
  }

  const calc = useMemo(() => {
    const n = (v) => (v === "" || v == null ? NaN : +v);
    try {
      if (!f.em || !f.ech || !f.dv) throw new Error("Renseigne les dates d'émission, d'échéance et de valorisation.");
      const nominal = n(f.nominal);
      if (!(nominal > 0)) throw new Error("Le nominal doit être positif.");
      const tf = f.type === "zc" ? 0 : n(f.tf);
      if (!isFinite(tf)) throw new Error("Renseigne le taux facial.");
      const spread = (n(f.spread) || 0) / 1e4;
      const prime = f.prime === "" ? (f.type === "rev" ? spread : 0) : n(f.prime) / 1e4;
      const ob = PE.Titre({
        type: f.type, nominal, em: f.em, ech: f.ech, tf: tf / 100, freq: f.type === "zc" ? 1 : +f.freq,
        d1c: f.d1c || null, prime, differe: Math.max(0, Math.round(n(f.differe) || 0)), matTaux: f.matTaux,
        spread, baseCoupon: f.baseCoupon,
      });

      let courbe = null;
      if (points && dateCourbe) {
        const d0 = PE.D(dateCourbe);
        const pts = MATURITES.map((m) => [PE.maturiteJours(m, d0), n(points[m]) / 100]).filter(([, t]) => isFinite(t));
        if (pts.length) courbe = PE.Courbe(d0, pts, +f.jmin || null);
      }

      let r, inv = null;
      if (f.mode === "courbe") {
        if (!courbe) throw new Error("Courbe BAM indisponible.");
        r = PE.valoriser(ob, f.dv, { courbe, convA: f.convA });
      } else if (f.mode === "taux") {
        if (f.taux === "") throw new Error("Renseigne le taux de rendement.");
        r = PE.valoriser(ob, f.dv, { taux: n(f.taux) / 100, convA: f.convA });
      } else {
        if (f.prix === "") throw new Error("Renseigne le prix.");
        const t = PE.tauxDepuisPrix(ob, f.dv, n(f.prix), { type: f.typePrix, convA: f.convA });
        r = PE.valoriser(ob, f.dv, { taux: t, convA: f.convA });
        inv = { t, tA: courbe ? courbe.taux(r.joursCourbe, r.base) : null };
      }

      const chocs = [-100, -50, -25, 25, 50, 100];
      const stress = chocs.map((bp) => {
        const x = f.mode === "courbe"
          ? PE.valoriser(ob, f.dv, { courbe: courbe.decaler(bp), convA: f.convA })
          : PE.valoriser(ob, f.dv, { taux: r.taux + bp / 1e4, convA: f.convA });
        return { bp, dh: x.prixPlein - r.prixPlein, pct: (x.prixPlein / r.prixPlein - 1) * 100 };
      });

      let chart = null;
      if (courbe) {
        const jMax = Math.max(courbe.points[courbe.points.length - 1][0], r.joursCourbe, 400);
        const data = [];
        for (let j = 7; j <= jMax; j += j < 400 ? 5 : 30) data.push({ x: +(j / 365).toFixed(3), t: +(courbe.taux(j, "actuariel") * 100).toFixed(4), j });
        const ans = Math.ceil(jMax / 365), pas = ans > 20 ? 5 : ans > 8 ? 2 : 1;
        const ticks = []; for (let a = 0; a <= ans; a += pas) ticks.push(a);
        chart = { data, ticks, xMax: ticks[ticks.length - 1] < jMax / 365 ? ans : ticks[ticks.length - 1], lu: { x: r.joursCourbe / 365, t: courbe.taux(r.joursCourbe, "actuariel") * 100 }, courbe };
      }
      return { ob, r, inv, stress, chart };
    } catch (e) {
      return { err: e.message };
    }
  }, [f, points, dateCourbe]);

  const { r, inv, stress, chart, err } = calc;
  const typeLbl = r && { fixe: calc.ob.courtTerme ? "Bon du Trésor / TCN" : "Taux fixe in fine", zc: "Zéro-coupon", amort: "Amortissable", rev: "Taux révisable" }[f.type];
  const amortCol = r && f.type === "amort";

  return (
    <section className="page-shell pricer">
      <style>{CSS}</style>
      <div className="container">
        <div className="page-header">
          <div className="eyebrow-mono">Marché de la dette</div>
          <h1 className="page-title serif">Pricer obligataire</h1>
          <p className="page-subtitle">
            Valorisez un bon du Trésor ou une obligation à partir de la courbe des taux de référence de
            Bank Al-Maghrib, selon les méthodes de la circulaire AMMC n° 02/04.
          </p>
        </div>

        <div className="pr-grid">
          {/* ---------------- Saisie ---------------- */}
          <div className="pr-col">
            <div className="opcvm-card pr-card">
              <div className="pr-h">Caractéristiques du titre</div>
              <div className="pr-seg pr-seg4" role="group" aria-label="Type de titre">
                {TYPES.map(([v, l]) => (
                  <button key={v} type="button" aria-pressed={f.type === v} onClick={() => setV("type", v)}>{l}</button>
                ))}
              </div>
              <label className="pr-f">Libellé<input id="pr-code" value={f.code} onChange={set("code")} /></label>
              <div className="pr-row">
                <label className="pr-f">Nominal (DH)<input id="pr-nominal" type="number" step="100" value={f.nominal} onChange={set("nominal")} /></label>
                <label className="pr-f">Fréquence<select id="pr-freq" value={f.freq} onChange={set("freq")} disabled={f.type === "zc"}>
                  <option value="1">Annuelle</option><option value="2">Semestrielle</option><option value="4">Trimestrielle</option>
                </select></label>
              </div>
              <div className="pr-row">
                <label className="pr-f">Date d'émission<input id="pr-em" type="date" value={f.em} onChange={set("em")} /></label>
                <label className="pr-f">Date d'échéance<input id="pr-ech" type="date" value={f.ech} onChange={set("ech")} /></label>
              </div>
              <div className="pr-row">
                {f.type !== "zc" && (
                  <label className="pr-f">{f.type === "rev" ? "Coupon en cours (%)" : "Taux facial (%)"}<input id="pr-tf" type="number" step="0.01" value={f.tf} onChange={set("tf")} /></label>
                )}
                <label className="pr-f">1er coupon <span className="pr-muted">(ligne postérieure)</span><input id="pr-d1c" type="date" value={f.d1c} onChange={set("d1c")} /></label>
              </div>
              {f.type === "amort" && (
                <div className="pr-row">
                  <label className="pr-f">Différé (échéances)<input id="pr-differe" type="number" min="0" step="1" value={f.differe} onChange={set("differe")} /></label>
                  <label className="pr-f">Taux lu à<select id="pr-mat" value={f.matTaux} onChange={set("matTaux")}>
                    <option value="vie_moyenne">Vie moyenne</option><option value="echeance">Échéance</option>
                  </select></label>
                </div>
              )}
              {f.type === "rev" && (
                <div className="pr-row">
                  <label className="pr-f">Spread d'émission (pb)<input id="pr-spread" type="number" step="1" value={f.spread} onChange={set("spread")} /></label>
                  <label className="pr-f">Base du coupon<select id="pr-bc" value={f.baseCoupon} onChange={set("baseCoupon")}>
                    <option value="exact360">Exact/360</option><option value="annuel">Annuelle</option>
                  </select></label>
                </div>
              )}
              <p className="pr-hint">{{
                fixe: "Maturité initiale ≤ 1 an : BT, formule (1). Laisser « 1er coupon » vide pour une ligne normale.",
                zc: "Un seul flux : le nominal à l'échéance.",
                amort: "Amortissement constant après le différé ; coupon calculé sur le capital restant dû.",
                rev: "Révision à chaque date de coupon ; actualisation jusqu'à la prochaine révision.",
              }[f.type]}</p>
            </div>

            <div className="opcvm-card pr-card">
              <div className="pr-h">Valorisation</div>
              <div className="pr-row">
                <label className="pr-f">Date de valorisation<input id="pr-dv" type="date" value={f.dv} onChange={set("dv")} /></label>
                <label className="pr-f">Convention A<select id="pr-conva" value={f.convA} onChange={set("convA")}>
                  <option value="periode">Période de coupon</option><option value="calendaire">Année calendaire</option>
                </select></label>
              </div>
              <div className="pr-seg pr-seg3" role="group" aria-label="Méthode">
                {MODES.map(([v, l]) => (
                  <button key={v} type="button" aria-pressed={f.mode === v} onClick={() => setV("mode", v)}>{l}</button>
                ))}
              </div>
              {f.mode === "courbe" && (
                <label className="pr-f">Prime de risque / liquidité (pb)
                  <input id="pr-prime" type="number" step="1" value={f.prime} placeholder={f.type === "rev" ? `${f.spread || 0} (= spread)` : "0"} onChange={set("prime")} />
                </label>
              )}
              {f.mode === "taux" && (
                <label className="pr-f">Taux de rendement (%) {r && <span className="pr-muted">— {r.base === "monetaire" ? "monétaire, Exact/360" : "actuariel"}</span>}
                  <input id="pr-taux" type="number" step="0.001" value={f.taux} onChange={set("taux")} />
                </label>
              )}
              {f.mode === "prix" && (
                <div className="pr-row">
                  <label className="pr-f">Prix (% du nominal)<input id="pr-prix" type="number" step="0.001" value={f.prix} onChange={set("prix")} /></label>
                  <label className="pr-f">Type de prix<select id="pr-tp" value={f.typePrix} onChange={set("typePrix")}>
                    <option value="pied">Pied de coupon</option><option value="plein">Plein coupon</option>
                  </select></label>
                </div>
              )}
            </div>

            <div className="opcvm-card pr-card">
              <div className="pr-h">Courbe BAM</div>
              {!courbeTauxData ? <p className="pr-hint">Chargement de la courbe…</p> : (
                <>
                  <div className="pr-row">
                    <label className="pr-f">Courbe du<select id="pr-dc" value={dateCourbe || ""} onChange={(e) => choisirCourbe(e.target.value)}>
                      {[...courbeTauxData].reverse().map((d) => <option key={d.date} value={d.date}>{frd(d.date)}</option>)}
                    </select></label>
                    <label className="pr-f">Sous 8 semaines<select id="pr-jmin" value={f.jmin} onChange={set("jmin")}>
                      <option value="0">Plat avant le 1er point</option><option value="56">Taux figé à 56 j</option>
                    </select></label>
                  </div>
                  {points && (
                    <div className="pr-pts">
                      {MATURITES.map((m) => (
                        <label key={m} className="pr-f pr-pt">{LABELS[m]}
                          <input id={`pr-c-${m}`} type="number" step="0.001" value={points[m]} onChange={(e) => setPoints((p) => ({ ...p, [m]: e.target.value }))} />
                        </label>
                      ))}
                    </div>
                  )}
                  <p className="pr-hint">Taux en %, monétaires jusqu'à 52 semaines, actuariels au-delà. Modifiables pour tester un scénario.</p>
                  <button type="button" className="pr-btn" onClick={() => choisirCourbe(dateCourbe)}>Revenir aux taux publiés</button>
                </>
              )}
            </div>
          </div>

          {/* ---------------- Résultats ---------------- */}
          <div className="opcvm-card pr-out" aria-live="polite">
            <div className="pr-head">
              <h2 className="serif">{f.code || "Titre"}</h2>
              {r && <>
                <span className="pr-chip">{typeLbl}</span>
                <span className="pr-chip pr-chip-acc">Formule {r.formule}</span>
                <span className="pr-chip">{r.base === "monetaire" ? "Monétaire · Exact/360" : `Actuariel${r.A ? " · A = " + r.A : ""}`}</span>
                <span className="pr-chip">Mr {r.maturiteResiduelle.toLocaleString("fr-FR")} j</span>
              </>}
            </div>

            {err ? <div className="pr-sect"><div className="pr-err">{err}</div></div> : (
              <>
                {inv && (
                  <div className="pr-inv">
                    Au prix {f.typePrix} de <b>{nf(+f.prix, 3)} %</b>, le taux est de <b>{pc(inv.t, 4)}</b>
                    {inv.tA !== null && <>, soit <b>{nf((inv.t - inv.tA) * 1e4, 1)} pb</b> au-dessus de la courbe BAM ({pc(inv.tA)} à {r.joursCourbe} j)</>}.
                  </div>
                )}
                <div className="pr-hero">
                  <div>
                    <div className="pr-l">Prix pied de coupon</div>
                    <div className="pr-big mono">{nf(r.piedPct, 3)} %</div>
                    <div className="pr-s mono">{nf(r.prixPied)} DH</div>
                  </div>
                  <div className="pr-kv">
                    {[
                      ["Prix plein", nf(r.pleinPct, 3) + " %"],
                      ["Coupon couru", nf(r.couponCouru) + " DH"],
                      ["Taux d'actualisation", pc(r.taux)],
                      ["Sensibilité", nf(r.sensibilite, 3)],
                      ["Duration", nf(r.duration, 3) + " ans"],
                      ["DV01 / titre", nf(r.dv01) + " DH"],
                    ].map(([l, v]) => <div key={l}><div className="pr-l">{l}</div><div className="pr-v mono">{v}</div></div>)}
                  </div>
                </div>
                <p className="pr-note">
                  Taux : {r.tauxRef !== null ? `BAM ${pc(r.tauxRef)} (${r.joursCourbe} j) + ${nf(r.prime * 1e4, 1)} pb` : f.mode === "prix" ? "implicite au prix saisi" : "saisi"}
                  {" "}· convexité {nf(r.convexite, 2)} · capital restant {nf(r.capital)} DH
                  {r.ajustement ? ` · ajustement spread ${nf(r.ajustement)} DH` : ""}
                </p>

                {chart && (
                  <div className="pr-sect">
                    <div className="pr-h3">Courbe BAM du {frd(dateCourbe)}</div>
                    <p className="pr-sub">Équivalent actuariel, interpolation linéaire. Le repère marque la maturité lue pour ce titre.</p>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={chart.data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="var(--hairline)" strokeDasharray="3 3" />
                        <XAxis dataKey="x" type="number" domain={[0, chart.xMax]} ticks={chart.ticks} tickFormatter={(v) => `${v} a`} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} />
                        <YAxis domain={["auto", "auto"]} tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} width={48} />
                        <Tooltip
                          labelFormatter={(v) => `${Math.round(v * 365)} j (${nf(v, 2)} a)`}
                          formatter={(v, _n, p) => {
                            const j = p.payload.j;
                            return PE.baseDu(j) === "monetaire"
                              ? [`${pc(chart.courbe.taux(j))} (monétaire)`, "Taux"]
                              : [`${nf(v, 3)} %`, "Taux actuariel"];
                          }}
                        />
                        <Line type="linear" dataKey="t" stroke="var(--gold)" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <ReferenceLine x={chart.lu.x} stroke="var(--ink-soft)" strokeDasharray="4 4" />
                        <ReferenceDot x={chart.lu.x} y={chart.lu.t} r={5} fill="var(--paper)" stroke="var(--ink)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="pr-sect">
                  <div className="pr-h3">Échéancier actualisé</div>
                  <p className="pr-sub">{r.base === "monetaire" ? "Temps = jours / 360" : "Temps = nj/A + (i − 1)/f"}{f.type === "rev" ? " · flux fictif (coupon connu + nominal) à la prochaine révision" : ""}</p>
                  <div className="pr-tbl">
                    <table>
                      <thead><tr><th>Date</th><th>Jours</th>{amortCol && <th>Capital début</th>}<th>Coupon</th><th>{amortCol ? "Amortissement" : "Remboursement"}</th><th>Flux</th><th>Temps</th><th>Facteur</th><th>Valeur actuelle</th></tr></thead>
                      <tbody>
                        {r.echeancier.map((e) => (
                          <tr key={e.date}>
                            <td>{frd(e.date)}</td><td>{e.jours}</td>{amortCol && <td>{nf(e.capDebut)}</td>}
                            <td>{nf(e.coupon)}</td><td>{e.amort ? nf(e.amort) : "—"}</td><td>{nf(e.flux)}</td>
                            <td>{nf(e.temps, 4)}</td><td>{nf(e.df, 6)}</td><td>{nf(e.va)}</td>
                          </tr>
                        ))}
                        <tr className="pr-tot"><td>Total</td><td colSpan={amortCol ? 7 : 6}></td><td>{nf(r.echeancier.reduce((a, e) => a + e.va, 0))}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pr-sect">
                  <div className="pr-h3">Stress test</div>
                  <p className="pr-sub">{f.mode === "courbe" ? "Translation parallèle de la courbe" : "Choc sur le taux"} · variation du prix plein</p>
                  <div className="pr-tbl">
                    <table>
                      <thead><tr><th>Choc</th>{stress.map((s) => <th key={s.bp}>{s.bp > 0 ? "+" : "−"}{Math.abs(s.bp)} pb</th>)}</tr></thead>
                      <tbody>
                        <tr><td>Δ DH</td>{stress.map((s) => <td key={s.bp} className={s.dh >= 0 ? "up" : "down"}>{signe(s.dh, 2)}</td>)}</tr>
                        <tr><td>Δ %</td>{stress.map((s) => <td key={s.bp} className={s.pct >= 0 ? "up" : "down"}>{signe(s.pct, 3)}</td>)}</tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="page-footnote" style={{ marginTop: 32 }}>
          Outil de calcul à but informatif, selon les méthodes de la circulaire AMMC n° 02/04 — ne constitue pas un conseil en investissement.
        </p>
      </div>
    </section>
  );
}

const CSS = `
.pricer .pr-grid{display:grid;grid-template-columns:360px minmax(0,1fr);gap:20px;align-items:start}
@media (max-width:980px){.pricer .pr-grid{grid-template-columns:1fr}}
.pricer .pr-col{display:grid;gap:14px}
.pricer .pr-card{padding:18px;display:grid;gap:12px}
.pricer .pr-h{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft)}
.pricer .pr-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pricer .pr-f{display:grid;gap:4px;font-size:12px;color:var(--ink-soft)}
.pricer .pr-muted{color:var(--gold);font-size:11px}
.pricer input,.pricer select{font:inherit;font-size:14px;color:var(--ink);background:var(--paper);border:1px solid var(--hairline);border-radius:6px;padding:7px 9px;width:100%;min-width:0}
.pricer input[type=number]{font-family:'IBM Plex Mono',monospace;font-size:13px}
.pricer input:focus-visible,.pricer select:focus-visible,.pricer button:focus-visible{outline:2px solid var(--navy);outline-offset:1px}
.pricer .pr-seg{display:grid;gap:3px;background:#F3F4F6;border:1px solid var(--hairline);border-radius:8px;padding:3px}
.pricer .pr-seg4{grid-template-columns:repeat(4,1fr)}
.pricer .pr-seg3{grid-template-columns:repeat(3,1fr)}
.pricer .pr-seg button{font:inherit;font-size:12px;line-height:1.25;border:0;background:transparent;color:var(--ink-soft);padding:7px 4px;border-radius:6px;cursor:pointer}
.pricer .pr-seg button[aria-pressed=true]{background:var(--navy);color:#fff;font-weight:600}
.pricer .pr-hint{font-size:12px;color:var(--ink-soft);margin:0}
.pricer .pr-pts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pricer .pr-btn{justify-self:start;font:inherit;font-size:12.5px;background:transparent;border:1px solid var(--hairline);border-radius:6px;padding:6px 10px;color:var(--ink);cursor:pointer}
.pricer .pr-btn:hover{border-color:var(--gold)}
.pricer .pr-out{padding:0;overflow:hidden}
.pricer .pr-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:18px 20px 0}
.pricer .pr-head h2{font-size:20px;margin:0 6px 0 0}
.pricer .pr-chip{font-size:11.5px;border:1px solid var(--hairline);border-radius:999px;padding:2px 9px;color:var(--ink-soft);white-space:nowrap}
.pricer .pr-chip-acc{background:var(--navy);border-color:var(--navy);color:#fff}
.pricer .pr-inv{background:var(--gold-soft);border-radius:8px;padding:10px 12px;font-size:13px;margin:14px 20px 0}
.pricer .pr-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,2fr);gap:20px;padding:18px 20px 8px;align-items:end}
@media (max-width:640px){.pricer .pr-hero{grid-template-columns:1fr}}
.pricer .pr-l{font-size:12px;color:var(--ink-soft)}
.pricer .pr-big{font-size:34px;font-weight:500;letter-spacing:-.02em;line-height:1.1;color:var(--ink)}
.pricer .pr-s{font-size:13px;color:var(--ink-soft);margin-top:4px}
.pricer .pr-kv{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 16px}
@media (max-width:480px){.pricer .pr-kv{grid-template-columns:repeat(2,minmax(0,1fr))}}
.pricer .pr-kv>div{border-top:1px solid var(--hairline);padding-top:6px}
.pricer .pr-v{font-size:15px}
.pricer .pr-note{font-size:12px;color:var(--ink-soft);margin:0;padding:0 20px 16px}
.pricer .pr-sect{border-top:1px solid var(--hairline);padding:16px 20px}
.pricer .pr-h3{font-size:14px;font-weight:600}
.pricer .pr-sub{font-size:12px;color:var(--ink-soft);margin:2px 0 10px}
.pricer .pr-tbl{overflow-x:auto}
.pricer .pr-tbl table{border-collapse:collapse;width:100%;font-size:12px}
.pricer .pr-tbl th{font-weight:500;color:var(--ink-soft);font-size:11px;text-align:right;padding:5px 6px;border-bottom:1px solid var(--hairline);white-space:nowrap;background:transparent;text-transform:none;letter-spacing:0}
.pricer .pr-tbl td{font-family:'IBM Plex Mono',monospace;font-size:12px;text-align:right;padding:5px 6px;border-bottom:1px solid #EEF0F2;white-space:nowrap}
.pricer .pr-tbl th:first-child,.pricer .pr-tbl td:first-child{text-align:left}
.pricer .pr-tbl td.up{color:var(--green)} .pricer .pr-tbl td.down{color:var(--red)}
.pricer .pr-tbl tr.pr-tot td{font-weight:600;border-bottom:0;border-top:1px solid var(--hairline)}
.pricer .pr-err{background:var(--red-soft);color:var(--red);border-radius:8px;padding:10px 12px;font-size:13px}
`;
