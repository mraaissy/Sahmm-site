// Moteur de valorisation obligataire — circulaire CDVM/AMMC 02/04 (port du module Python pricer_obligataire).
const PE = (() => {
  const DAY = 86400000, SEUIL = 365, B360 = 360;
  const D = s => { if (s instanceof Date) return s; const [y, m, d] = String(s).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const days = (a, b) => Math.round((b - a) / DAY);
  const iso = d => d.toISOString().slice(0, 10);
  const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  function addMonths(d, n) {
    const m = d.getUTCMonth() + n, y = d.getUTCFullYear() + Math.floor(m / 12), mm = ((m % 12) + 12) % 12;
    const last = new Date(Date.UTC(y, mm + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, mm, Math.min(d.getUTCDate(), last)));
  }
  const baseAnnuelle = fin => days(addMonths(fin, -12), fin);
  const baseCal = d => leap(d.getUTCFullYear()) ? 366 : 365;
  const m2a = (tm, j) => j <= 0 ? tm : Math.pow(1 + tm * j / B360, 365 / j) - 1;
  const a2m = (ta, j) => j <= 0 ? ta : (Math.pow(1 + ta, j / 365) - 1) * B360 / j;
  const baseDu = j => j <= SEUIL ? 'monetaire' : 'actuariel';

  // ---------------------------------------------------------------- courbe
  function maturiteJours(m, d0) {
    const s = String(m).trim();
    const r = s.match(/^(\d+)\s*([jJsSmMaA])$/);
    if (r) { const n = +r[1], u = r[2].toLowerCase(); return { j: n, s: 7 * n, m: Math.round(n * 365 / 12), a: 365 * n }[u]; }
    if (/^\d+$/.test(s)) return +s;
    const dm = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (dm) return days(d0, new Date(Date.UTC(+dm[3], +dm[2] - 1, +dm[1])));
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return days(d0, D(s));
    return NaN;
  }
  function Courbe(dateCourbe, points, joursMin) {
    const d0 = D(dateCourbe), map = new Map();
    points.forEach(([j, t]) => { if (j > 0 && isFinite(t)) map.set(j, t); });
    const pts = [...map.entries()].sort((a, b) => a[0] - b[0]);
    if (!pts.length) throw new Error('La courbe ne contient aucun point valide.');
    const js = pts.map(p => p[0]);
    function interp(j) {
      if (j <= js[0]) return [pts[0][1], baseDu(js[0]), js[0]];
      const n = pts.length - 1;
      if (j >= js[n]) return [pts[n][1], baseDu(js[n]), js[n]];
      let k = js.findIndex(x => x >= j);
      if (js[k] === j) return [pts[k][1], baseDu(j), j];
      let [j1, t1] = pts[k - 1]; const [j2, t2] = pts[k];
      let base = baseDu(j1);
      if (baseDu(j1) !== baseDu(j2)) { t1 = m2a(t1, j1); base = 'actuariel'; }
      return [t1 + (t2 - t1) * (j - j1) / (j2 - j1), base, j];
    }
    function taux(jours, base) {
      jours = Math.max(Math.round(jours), 1);
      const lookup = joursMin && jours < joursMin ? joursMin : jours;
      const cible = base || baseDu(jours);
      const [t, bt, jr] = interp(lookup);
      if (bt === cible) return t;
      const ta = bt === 'actuariel' ? t : m2a(t, jr);
      return cible === 'actuariel' ? ta : a2m(ta, jours);
    }
    const decaler = bp => Courbe(d0, pts.map(([j, t]) => [j, t + bp / 1e4]), joursMin);
    return { date: d0, points: pts, taux, decaler, joursMin };
  }

  // ---------------------------------------------------------------- titre
  // ob = {type:'fixe'|'zc'|'amort'|'rev', nominal, em, ech, tf, freq, d1c, prime,
  //       differe, matTaux, spread, baseCoupon, ajust}
  function Titre(o) {
    const ob = Object.assign({ freq: 1, prime: 0, differe: 0, matTaux: 'vie_moyenne', spread: 0, baseCoupon: 'exact360', ajust: true }, o);
    ob.em = D(ob.em); ob.ech = D(ob.ech); ob.d1c = ob.d1c ? D(ob.d1c) : null;
    if (!(ob.ech > ob.em)) throw new Error("La date d'échéance doit être postérieure à la date d'émission.");
    if (ob.d1c && (ob.d1c <= ob.em || ob.d1c > ob.ech)) throw new Error("La date du 1er coupon doit être comprise entre l'émission et l'échéance.");
    if (ob.type === 'zc') ob.tf = 0;
    ob.Mi = days(ob.em, ob.ech);
    ob.courtTerme = ob.Mi <= SEUIL;
    ob.mois = 12 / ob.freq;

    ob.datesCoupon = () => {
      if (ob.courtTerme || ob.type === 'zc') return [ob.ech];
      const out = [];
      if (ob.d1c) {
        for (let k = 0; ; k++) { const d = addMonths(ob.d1c, ob.mois * k); if (d >= ob.ech) break; out.push(d); }
        out.push(ob.ech); return out;
      }
      for (let k = 0; ; k++) { const d = addMonths(ob.ech, -ob.mois * k); if (d <= ob.em) break; out.push(d); }
      return out.reverse();
    };
    ob.couponPeriode = (cap, deb, fin, t) => {
      if (ob.type === 'zc') return 0;
      if (ob.type === 'rev' && ob.baseCoupon === 'exact360') return cap * t * days(deb, fin) / B360;
      if (ob.courtTerme) return cap * t * days(deb, fin) / B360;
      if (+addMonths(deb, ob.mois) === +fin) return cap * t / ob.freq;
      return cap * t * days(deb, fin) / baseAnnuelle(fin);
    };
    ob.amortissements = dates => {
      const n = dates.length;
      if (ob.type !== 'amort') return [...Array(n - 1).fill(0), ob.nominal];
      const k = n - ob.differe;
      if (k <= 0) throw new Error(`Différé trop long : le titre n'a que ${n} échéances.`);
      return [...Array(ob.differe).fill(0), ...Array(k).fill(ob.nominal / k)];
    };
    ob.flux = () => {
      const dates = ob.datesCoupon(), am = ob.amortissements(dates);
      let cap = ob.nominal, deb = ob.em; const out = [];
      dates.forEach((d, i) => {
        out.push({ date: d, coupon: ob.couponPeriode(cap, deb, d, ob.tf), amort: am[i], capDebut: cap });
        cap -= am[i]; deb = d;
      });
      return out;
    };
    ob.restants = d => ob.flux().filter(f => f.date > d);
    ob.couponPrec = d => { const p = ob.flux().filter(f => f.date <= d); return p.length ? p[p.length - 1].date : ob.em; };
    ob.capitalRestant = d => ob.nominal - ob.flux().filter(f => f.date <= d).reduce((a, f) => a + f.amort, 0);
    ob.couponCouru = d => {
      const r = ob.restants(d); if (!r.length) return 0;
      const deb = ob.couponPrec(d), dur = days(deb, r[0].date);
      return dur ? r[0].coupon * days(deb, d) / dur : 0;
    };
    ob.joursRef = d => {
      if (ob.type === 'rev') return days(d, ob.restants(d)[0].date);
      if (ob.type === 'amort' && ob.matTaux === 'vie_moyenne') {
        const r = ob.restants(d), tot = r.reduce((a, f) => a + f.amort, 0);
        return Math.round(r.reduce((a, f) => a + f.amort * days(d, f.date), 0) / tot);
      }
      return days(d, ob.ech);
    };
    ob.fluxValo = d => {
      if (ob.type !== 'rev') return ob.restants(d);
      const p = ob.restants(d)[0];
      return [{ date: p.date, coupon: p.coupon, amort: ob.nominal, capDebut: ob.nominal }];
    };
    return ob;
  }

  // ---------------------------------------------------------------- moteur
  const facteur = (r, t, base) => base === 'monetaire' ? 1 / (1 + r * t) : Math.pow(1 + r, -t);

  function valoriser(ob, dateValo, { courbe = null, taux = null, prime = null, convA = 'periode' } = {}) {
    const d = D(dateValo);
    if (d < ob.em) throw new Error("La date de valorisation précède la date d'émission.");
    if (d >= ob.ech) throw new Error('Le titre est échu à la date de valorisation.');
    const flux = ob.fluxValo(d);
    const base = ob.courtTerme ? 'monetaire' : (days(d, flux[flux.length - 1].date) <= SEUIL ? 'monetaire' : 'actuariel');
    const jRef = ob.joursRef(d);
    let r, tA = null, p = null;
    if (taux !== null) r = taux;
    else if (courbe) { tA = courbe.taux(jRef, base); p = prime !== null ? prime : ob.prime; r = tA + p; }
    else throw new Error('Fournir une courbe ou un taux.');

    let temps;
    if (base === 'monetaire') temps = flux.map(f => days(d, f.date) / B360);
    else {
      const nj = days(d, flux[0].date), A = convA === 'periode' ? baseAnnuelle(flux[0].date) : baseCal(d);
      temps = flux.map((_, i) => nj / A + i / ob.freq);
      var Autil = A;
    }
    let P = 0, mac = 0, sens = 0, conv = 0;
    const ech = flux.map((f, i) => {
      const t = temps[i], df = facteur(r, t, base), tot = f.coupon + f.amort, pv = tot * df;
      P += pv;
      if (base === 'monetaire') { mac += pv * t * B360 / 365; sens += pv * t / (1 + r * t); conv += pv * 2 * t * t / Math.pow(1 + r * t, 2); }
      else { mac += pv * t; sens += pv * t / (1 + r); conv += pv * t * (t + 1) / Math.pow(1 + r, 2); }
      return { date: iso(f.date), jours: days(d, f.date), capDebut: f.capDebut, coupon: f.coupon, amort: f.amort, flux: tot, temps: t, df, va: pv };
    });

    let ajust = 0;
    if (ob.type === 'rev' && ob.ajust) {
      const pm = p !== null ? p : ob.prime, ecart = ob.spread - pm;
      if (Math.abs(ecart) > 1e-12) {
        let prec = ob.restants(d)[0].date;
        ob.restants(d).slice(1).forEach(f => {
          const j = days(d, f.date), b = baseDu(j);
          const rr = (taux !== null || !courbe) ? r : courbe.taux(j, b) + pm;
          ajust += ob.couponPeriode(ob.nominal, prec, f.date, ecart) * facteur(rr, j / (b === 'monetaire' ? B360 : 365), b);
          prec = f.date;
        });
      }
    }
    const P0 = P; P += ajust;
    const cc = ob.couponCouru(d), cap = ob.capitalRestant(d);
    let formule;
    if (ob.courtTerme) formule = '(1)';
    else if (base === 'monetaire') formule = ob.type === 'rev' ? '(2) jusqu’à la révision' : (ob.d1c && flux.length === 1 && ob.d1c.getTime() === ob.ech.getTime() ? '(3)' : '(2)');
    else if (ob.d1c && d < ob.d1c) formule = flux.length === 1 ? '(4.2)' : '(4.3)';
    else formule = '(4.1)';
    return {
      base, formule, taux: r, tauxRef: tA, prime: p, joursCourbe: jRef, A: Autil || null,
      maturiteResiduelle: days(d, ob.ech), capital: cap,
      prixPlein: P, couponCouru: cc, prixPied: P - cc,
      pleinPct: 100 * P / cap, piedPct: 100 * (P - cc) / cap, ccPct: 100 * cc / cap,
      duration: mac / P0, sensibilite: sens / P0, convexite: conv / P0, dv01: sens * 1e-4,
      ajustement: ajust, echeancier: ech,
    };
  }

  function tauxDepuisPrix(ob, dateValo, prix, { type = 'pied', convA = 'periode' } = {}) {
    const f = r => { const x = valoriser(ob, dateValo, { taux: r, convA }); return (type === 'pied' ? x.piedPct : x.pleinPct) - prix; };
    let lo = -0.05, hi = 0.45, flo = f(lo), fhi = f(hi);
    if (flo * fhi > 0) throw new Error('Prix hors de la plage atteignable (taux entre −5 % et 45 %).');
    for (let i = 0; i < 200 && hi - lo > 1e-14; i++) {
      const mid = (lo + hi) / 2, fm = f(mid);
      if (Math.abs(fm) < 1e-12) { lo = hi = mid; break; }
      if (flo * fm <= 0) hi = mid; else { lo = mid; flo = fm; }
    }
    return (lo + hi) / 2;
  }

  function parseCsvBam(texte) {
    const lignes = texte.split(/\r?\n/).filter(l => l.trim());
    const iH = lignes.findIndex(l => /taux/i.test(l) && /ch[ée]ance/i.test(l));
    if (iH < 0) throw new Error("En-tête introuvable : il faut les colonnes « Date d'échéance » et « Taux ».");
    const sep = [';', '\t', ','].find(s => lignes[iH].includes(s));
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const H = lignes[iH].split(sep).map(h => norm(h.replace(/"/g, '')));
    const cE = H.findIndex(h => h.includes('echeance')), cT = H.findIndex(h => h.includes('taux')), cV = H.findIndex(h => h.includes('valeur'));
    const pd = s => { const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])) : null; };
    const rows = [], vals = {};
    for (const l of lignes.slice(iH + 1)) {
      const c = l.split(sep).map(x => x.replace(/"/g, '').trim());
      const e = pd(c[cE]); const t = parseFloat(String(c[cT] || '').replace('%', '').replace(/\s/g, '').replace(',', '.'));
      if (!e || !isFinite(t)) continue;
      rows.push([e, t]);
      if (cV >= 0) { const v = pd(c[cV]); if (v) vals[iso(v)] = (vals[iso(v)] || 0) + 1; }
    }
    if (!rows.length) throw new Error('Aucune ligne de taux lisible dans le texte collé.');
    const dateVal = Object.keys(vals).sort((a, b) => vals[b] - vals[a])[0] || null;
    return { dateValeur: dateVal, lignes: rows.map(([e, t]) => ({ echeance: e, taux: t })) };
  }

  return { D, days, iso, addMonths, m2a, a2m, baseDu, maturiteJours, Courbe, Titre, valoriser, tauxDepuisPrix, parseCsvBam };
})();
export default PE;
