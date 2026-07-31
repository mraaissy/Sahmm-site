import React, { useState, useRef, useEffect } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Search, Bell, Settings, User, Menu, X, Moon, Sun, Star, Download, ArrowUpDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";


const hausses = [
  { code: "IAM", nom: "Maroc Telecom", var: 4.2, cours: "92.20" },
  { code: "LHM", nom: "LafargeHolcim Maroc", var: 3.1, cours: "2 480.00" },
  { code: "CIH", nom: "CIH Bank", var: 2.8, cours: "398.50" },
  { code: "ADH", nom: "Douja Prom Addoha", var: 2.3, cours: "9.87" },
  { code: "TQM", nom: "Taqa Morocco", var: 1.9, cours: "1 042.00" },
];

const baisses = [
  { code: "CMA", nom: "Ciments du Maroc", var: -3.5, cours: "1 659.00" },
  { code: "SNA", nom: "Snep", var: -2.9, cours: "845.00" },
  { code: "RIS", nom: "Risma", var: -2.1, cours: "142.00" },
  { code: "DHO", nom: "Dari Couspate", var: -1.8, cours: "410.00" },
  { code: "MNG", nom: "Managem", var: -1.4, cours: "2 960.00" },
];

const ticker = [
  { code: "IAM", var: 4.2 }, { code: "ATW", var: 0.6 }, { code: "BCP", var: -0.3 },
  { code: "CMA", var: -3.5 }, { code: "LHM", var: 3.1 }, { code: "MNG", var: -1.4 },
  { code: "TQM", var: 1.9 }, { code: "CIH", var: 2.8 }, { code: "ADH", var: 2.3 },
  { code: "SNA", var: -2.9 }, { code: "RIS", var: -2.1 }, { code: "DHO", var: -1.8 },
];

// Top 5 des OPCVM par catégorie — données de secours (utilisées uniquement si le
// robot GitHub Actions n'a pas encore pu récupérer les données live). La source
// réelle et actualisée toutes les 15 min est l'ASFIM (fundshare.asfim.ma).
const opcvmSourceDate = "16 juillet 2026";
const opcvmFunds = {
  Actions: [
    { nom: "AD CAPITAL MULTISTRATEGIE", code: "MA0000300048", valeur: "1 001,68", jour: 0.26, m1: 0.71, m3: 0.00, m6: 0.00, a1: 0.00, a2: 0.00, a5: 0.00 },
    { nom: "DAILY EQUITY FUND", code: "MA0000038820", valeur: "1 318,35", jour: -0.03, m1: -5.01, m3: -5.54, m6: -14.43, a1: -14.44, a2: 18.18, a5: 26.76 },
    { nom: "TWIN PERFORMANCE", code: "MA0000039927", valeur: "97,82", jour: -0.06, m1: -2.97, m3: -3.17, m6: 0.00, a1: 0.00, a2: 0.00, a5: 0.00 },
    { nom: "CMR ASHOUM", code: "MA0000041113", valeur: "2 684,73", jour: -0.18, m1: -3.85, m3: -5.00, m6: -12.16, a1: -12.05, a2: 27.46, a5: 51.10 },
    { nom: "WG VALEURS", code: "MA0000039059", valeur: "1 522,70", jour: -0.19, m1: -2.25, m3: -1.48, m6: -1.32, a1: 4.49, a2: 45.00, a5: 0.00 },
  ],
  "Diversifié": [
    { nom: "FCP STERLING DYNAMIC", code: "MA0000039950", valeur: "982,32", jour: 0.03, m1: -0.71, m3: 0.00, m6: 0.00, a1: 0.00, a2: 0.00, a5: 0.00 },
    { nom: "AFG ALLOCATION FUND", code: "MA0000039968", valeur: "1 008,70", jour: 0.02, m1: 0.54, m3: 0.00, m6: 0.00, a1: 0.00, a2: 0.00, a5: 0.00 },
    { nom: "CFG OPPORTUNITÉS", code: "MA0000039315", valeur: "1 240,00", jour: 0.01, m1: -2.45, m3: 0.53, m6: 0.15, a1: 1.09, a2: 0.00, a5: 0.00 },
    { nom: "FCP QUANTUM OPTIMUM DIVERSIFIE", code: "MA0000039984", valeur: "1 017,47", jour: 0.00, m1: -0.43, m3: 0.76, m6: 0.00, a1: 0.00, a2: 0.00, a5: 0.00 },
    { nom: "UPLINE CROISSANCE", code: "MA0000039331", valeur: "1 092,40", jour: -0.01, m1: 0.05, m3: -0.01, m6: -1.73, a1: -1.28, a2: 5.33, a5: 0.00 },
  ],
  OMLT: [
    { nom: "FCP EMERGENCE OBLIHORIZON", code: "MA0000038770", valeur: "1 153,10", jour: 0.42, m1: 0.70, m3: 0.72, m6: -0.29, a1: -0.66, a2: 9.13, a5: 11.60 },
    { nom: "AD CAPITAL OBLIGATAIRE PLUS", code: "MA0000300055", valeur: "1 004,68", jour: 0.26, m1: 0.87, m3: 0.00, m6: 0.00, a1: 0.00, a2: 0.00, a5: 0.00 },
    { nom: "AD CAPITAL DYNAMIC BOND", code: "MA0000300030", valeur: "1 004,24", jour: 0.26, m1: 0.85, m3: 0.00, m6: 0.00, a1: 0.00, a2: 0.00, a5: 0.00 },
    { nom: "UPLINE OBLIG PLUS", code: "MA0000037376", valeur: "1 804,33", jour: 0.17, m1: 0.53, m3: 0.97, m6: 1.33, a1: 1.64, a2: 10.17, a5: 18.63 },
    { nom: "UNIVERS OBLIGATIONS", code: "MA0000042368", valeur: "1 906,44", jour: 0.16, m1: -0.14, m3: -1.09, m6: 0.07, a1: 2.76, a2: 8.99, a5: 18.63 },
  ],
  OCT: [
    { nom: "CDG OBLIG SÉCURITÉ", code: "MA0000041154", valeur: "1 705,16", jour: 0.02, m1: 0.34, m3: 0.88, m6: 1.55, a1: 2.61, a2: 6.11, a5: 14.28 },
    { nom: "CDG DYNAMIC COURT TERME", code: "MA0000040594", valeur: "1 196,45", jour: 0.02, m1: 0.34, m3: 0.89, m6: 1.46, a1: 2.48, a2: 6.41, a5: 14.56 },
    { nom: "FCP CAM TRESO PLUS", code: "MA0000036352", valeur: "174,25", jour: 0.02, m1: 0.32, m3: 0.86, m6: 1.56, a1: 2.67, a2: 6.46, a5: 15.11 },
    { nom: "TWIN TREASURY", code: "MA0000038655", valeur: "1 185,72", jour: 0.02, m1: 0.34, m3: 0.94, m6: 1.65, a1: 2.69, a2: 7.02, a5: 15.71 },
    { nom: "AFRICAPITAL CASH", code: "MA0000036873", valeur: "1 597,88", jour: 0.01, m1: 0.28, m3: 0.78, m6: 1.35, a1: 2.30, a2: 5.99, a5: 14.33 },
  ],
  "Monétaire": [
    { nom: "FCP MONETAIRE DYNAMIQUE", code: "MA0000038945", valeur: "1 115,85", jour: 0.01, m1: 0.23, m3: 0.62, m6: 1.16, a1: 2.19, a2: 4.72, a5: 0.00 },
    { nom: "RMA TRESO PLUS", code: "MA0000041097", valeur: "102,86", jour: 0.01, m1: 0.21, m3: 0.61, m6: 3.82, a1: 4.91, a2: 10.76, a5: 32.62 },
    { nom: "BMCI MONETAIRE PLUS", code: "MA0000041899", valeur: "145 931,46", jour: 0.01, m1: 0.24, m3: 0.70, m6: 1.36, a1: 2.57, a2: 5.41, a5: 11.49 },
    { nom: "INSTIMONETAIRE", code: "MA0000036477", valeur: "139,87", jour: 0.01, m1: 0.16, m3: 1.08, m6: 1.88, a1: 4.12, a2: 7.87, a5: 11.28 },
    { nom: "AXA MONETAIRE", code: "MA0000037046", valeur: "159 560,84", jour: 0.01, m1: 0.20, m3: 0.61, m6: 1.17, a1: 2.18, a2: 4.93, a5: 12.07 },
  ],
  Contractuel: [
    { nom: "CAPITAL IMTIYAZ GARANTI", code: "MA0000039497", valeur: "1 058,43", jour: 0.01, m1: 0.17, m3: 0.52, m6: 1.04, a1: 2.11, a2: 4.53, a5: 0.00 },
    { nom: "UPLINE CAPITAL GARANTI", code: "MA0000037350", valeur: "13 204,47", jour: 0.01, m1: 0.16, m3: 0.50, m6: 1.00, a1: 2.04, a2: 4.40, a5: 10.72 },
    { nom: "HORIZON CAPITAL GARANTI", code: "MA0000041691", valeur: "142 591,16", jour: 0.01, m1: 0.14, m3: 0.45, m6: 0.93, a1: 1.93, a2: 4.20, a5: 10.35 },
    { nom: "FCP CKG GARANTI", code: "MA0000042228", valeur: "1 066,20", jour: 0.00, m1: 0.16, m3: 0.51, m6: 1.02, a1: 2.03, a2: 4.24, a5: 0.00 },
    { nom: "ATTIJARI CASH GARANTI", code: "MA0000042145", valeur: "1 088,41", jour: 0.00, m1: 0.16, m3: 0.48, m6: 0.97, a1: 1.98, a2: 4.26, a5: 0.00 },
  ],
};
const opcvmCategoryList = Object.keys(opcvmFunds);

// Statut du marché — calculé à partir des horaires réels de cotation de la Bourse
// de Casablanca : séance continue du lundi au vendredi, 9h00–15h30, heure de Casablanca.
// (source : AMMC, "Modalités pratiques d'une séance boursière")
// Limite assumée : ne tient pas compte du calendrier des jours fériés marocains,
// qui n'est pas disponible via une source accessible automatiquement.
// Détail de la séance boursière — données réelles de clôture
// Jours fériés marocains (Bourse de Casablanca fermée) — dates civiles fixes +
// dates religieuses estimées (calendrier lunaire, confirmées par le Ministère
// des Habous à l'approche de chaque fête ; à ajuster de +/-1 jour si besoin).
const MOROCCO_HOLIDAYS_2026 = [
  "2026-01-01", // Nouvel An
  "2026-01-11", // Manifeste de l'Indépendance
  "2026-01-14", // Nouvel An Amazigh (Yennayer)
  "2026-03-20", // Aïd al-Fitr (1er jour, estimé)
  "2026-03-21", // Aïd al-Fitr (2e jour, estimé)
  "2026-05-01", // Fête du Travail
  "2026-05-27", // Aïd al-Adha (1er jour, estimé)
  "2026-05-28", // Aïd al-Adha (2e jour, estimé)
  "2026-06-17", // 1er Moharram — Nouvel An Hégirien (estimé)
  "2026-07-30", // Fête du Trône
  "2026-08-14", // Récupération Oued Ed-Dahab
  "2026-08-20", // Révolution du Roi et du Peuple
  "2026-08-21", // Fête de la Jeunesse
  "2026-08-26", // Aïd Al Mawlid Annabaoui (estimé)
  "2026-10-31", // Aïd Al Wahda (Fête de l'Unité)
  "2026-11-06", // Anniversaire de la Marche Verte
  "2026-11-18", // Fête de l'Indépendance
];

// Calcule le libellé de la dernière séance de cotation réelle (saute les
// week-ends et jours fériés marocains) au lieu d'afficher bêtement la date du jour.
function getLastTradingDayLabel() {
  const d = new Date();
  for (let i = 0; i < 14; i++) {
    const iso = d.toISOString().slice(0, 10);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    if (!isWeekend && !MOROCCO_HOLIDAYS_2026.includes(iso)) {
      return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    d.setDate(d.getDate() - 1);
  }
  return new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// (source : Médias24 et Boursenews, relayant les chiffres officiels de la Bourse de
// Casablanca — le site casablanca-bourse.com bloquant l'accès automatisé, ces médias
// financiers qui reprennent ses publications officielles sont la source la plus fiable
// accessible) — séance du mardi 7 juillet 2026
const seanceDate = getLastTradingDayLabel();
const seanceIndices = [
  { nom: "MASI", valeur: "17 739,77", var: -0.34, ytd: -5.87 },
  { nom: "MASI ESG", valeur: "1 268,86", var: -0.32, ytd: 1.38 },
  { nom: "MASI 20", valeur: "1 307,76", var: -0.30, ytd: -11.97 },
];
const seanceStats = {
  capitalisation: "1 028,64 MMDH",
  volume: "165,27 MDH",
  volumeCentral: "165,27 MDH",
  volumeBlocs: "0 MDH (aucun échange sur le marché de blocs)",
  hausses: null,
  baisses: null,
  inchangees: null,
};
const seanceHausses = [
  { code: "REB", nom: "Rebab Company", var: 6.00, cours: "93,29" },
  { code: "BAL", nom: "Balima", var: 5.99, cours: "199,90" },
  { code: "INV", nom: "Involys", var: 5.79, cours: "128,00" },
  { code: "SID", nom: "Sonasid", var: 2.94, cours: "1 999,00" },
  { code: "JET", nom: "Jet Contractors", var: 2.90, cours: "2 058,00" },
];
const seanceBaisses = [
  { code: "SAHM", nom: "Sanlam Maroc", var: -5.51, cours: "2 881,00" },
  { code: "MIC", nom: "Microdata", var: -4.94, cours: "712,00" },
  { code: "SRM", nom: "Réalisations Mécaniques", var: -4.01, cours: "450,00" },
  { code: "TMA", nom: "TotalEnergies Marketing Maroc", var: -3.69, cours: "1 435,00" },
  { code: "DHO", nom: "Delta Holding", var: -3.64, cours: "53,00" },
];
const seancePlusActives = [
  { nom: "CIH Bank", volume: "16,11 MDH", var: null, cours: null },
  { nom: "Attijariwafa Bank", volume: "11,05 MDH", var: null, cours: null },
  { nom: "TGCC", volume: "9,11 MDH", var: null, cours: null },
  { nom: "Maroc Telecom", volume: "6,33 MDH", var: null, cours: null },
];
const seanceSecteurs = null;

// ---- Widgets TradingView : données de marché réelles, en direct, via embed officiel ----
// TradingView propose ces widgets gratuitement pour l'intégration sur des sites tiers
// (voir tradingview.com/widget/) — pas de scraping, données mises à jour en continu.
// La Bourse de Casablanca est couverte nativement sous le préfixe "CSEMA:".

function TradingViewTickerTape() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "CSEMA:ADH", title: "ADH" },
        { proName: "CSEMA:ADI", title: "ADI" },
        { proName: "CSEMA:AFI", title: "AFI" },
        { proName: "CSEMA:AFM", title: "AFMA" },
        { proName: "CSEMA:AGM", title: "AGM" },
        { proName: "CSEMA:AKT", title: "AKT" },
        { proName: "CSEMA:ALM", title: "ALM" },
        { proName: "CSEMA:ARD", title: "ARD" },
        { proName: "CSEMA:ATH", title: "ATH" },
        { proName: "CSEMA:ATL", title: "ATL" },
        { proName: "CSEMA:ATW", title: "ATW" },
        { proName: "CSEMA:BAL", title: "BAL" },
        { proName: "CSEMA:BCI", title: "BCI" },
        { proName: "CSEMA:BCP", title: "BCP" },
        { proName: "CSEMA:BOA", title: "BOA" },
        { proName: "CSEMA:CAP", title: "CAP" },
        { proName: "CSEMA:CDM", title: "CDM" },
        { proName: "CSEMA:CFG", title: "CFG" },
        { proName: "CSEMA:CIH", title: "CIH" },
        { proName: "CSEMA:CMA", title: "CMA" },
        { proName: "CSEMA:CMG", title: "CMG" },
        { proName: "CSEMA:CMT", title: "CMT" },
        { proName: "CSEMA:COL", title: "COL" },
        { proName: "CSEMA:CRS", title: "CRS" },
        { proName: "CSEMA:CSR", title: "CSR" },
        { proName: "CSEMA:CTM", title: "CTM" },
        { proName: "CSEMA:DRI", title: "DRI" },
        { proName: "CSEMA:DHO", title: "DHO" },
        { proName: "CSEMA:DIS", title: "DIS" },
        { proName: "CSEMA:DLM", title: "DLM" },
        { proName: "CSEMA:DWY", title: "DWY" },
        { proName: "CSEMA:DYT", title: "DYT" },
        { proName: "CSEMA:EQD", title: "EQD" },
        { proName: "CSEMA:FBR", title: "FBR" },
        { proName: "CSEMA:GAZ", title: "GAZ" },
        { proName: "CSEMA:HPS", title: "HPS" },
        { proName: "CSEMA:IAM", title: "IAM" },
        { proName: "CSEMA:IBMC", title: "IBMC" },
        { proName: "CSEMA:IMO", title: "IMO" },
        { proName: "CSEMA:INV", title: "INV" },
        { proName: "CSEMA:JET", title: "JET" },
        { proName: "CSEMA:LBV", title: "LBV" },
        { proName: "CSEMA:LES", title: "LES" },
        { proName: "CSEMA:LHM", title: "LHM" },
        { proName: "CSEMA:M2M", title: "M2M" },
        { proName: "CSEMA:MAB", title: "MAB" },
        { proName: "CSEMA:MDP", title: "MDP" },
        { proName: "CSEMA:MIC", title: "MIC" },
        { proName: "CSEMA:MLE", title: "MLE" },
        { proName: "CSEMA:MNG", title: "MNG" },
        { proName: "CSEMA:MOX", title: "MOX" },
        { proName: "CSEMA:MSA", title: "MSA" },
        { proName: "CSEMA:MUT", title: "MUT" },
        { proName: "CSEMA:NAKL", title: "NAKL" },
        { proName: "CSEMA:NEJ", title: "NEJ" },
        { proName: "CSEMA:OUL", title: "OUL" },
        { proName: "CSEMA:PRO", title: "PRO" },
        { proName: "CSEMA:RDS", title: "RDS" },
        { proName: "CSEMA:REB", title: "REB" },
        { proName: "CSEMA:RIS", title: "RIS" },
        { proName: "CSEMA:S2M", title: "S2M" },
        { proName: "CSEMA:SAH", title: "SAH" },
        { proName: "CSEMA:SBM", title: "SBM" },
        { proName: "CSEMA:SLF", title: "SLF" },
        { proName: "CSEMA:SMI", title: "SMI" },
        { proName: "CSEMA:SNA", title: "SNA" },
        { proName: "CSEMA:SNP", title: "SNP" },
        { proName: "CSEMA:SRM", title: "SRM" },
        { proName: "CSEMA:STR", title: "STR" },
        { proName: "CSEMA:TGC", title: "TGC" },
        { proName: "CSEMA:TMA", title: "TMA" },
        { proName: "CSEMA:TQM", title: "TQM" },
        { proName: "CSEMA:UMR", title: "UMR" },
        { proName: "CSEMA:VCN", title: "VCN" },
        { proName: "CSEMA:WAA", title: "WAA" },
        { proName: "CSEMA:ZDJ", title: "ZDJ" },
      ],
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "light",
      locale: "fr",
    });
    ref.current.appendChild(script);
  }, []);
  return (
    <div className="tv-widget-wrap tv-ticker-wrap">
      <div className="tradingview-widget-container" ref={ref}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}

function TradingViewMarketOverview() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector("tv-market-overview")) return;

    if (!document.querySelector('script[data-tv-market-overview="1"]')) {
      const moduleScript = document.createElement("script");
      moduleScript.type = "module";
      moduleScript.src = "https://widgets.tradingview-widget.com/w/en/tv-market-overview.js";
      moduleScript.setAttribute("data-tv-market-overview", "1");
      document.head.appendChild(moduleScript);
    }

    const el = document.createElement("tv-market-overview");
    el.setAttribute(
      "symbol-sectors",
      JSON.stringify([
        {
          sectionName: "Indices",
          symbols: [
            "FOREXCOM:SPXUSD",
            "FOREXCOM:DJI",
            "FOREXCOM:NSXUSD",
            "FOREXCOM:FRXEUR",
            "XETR:DAX",
            "FOREXCOM:UKXGBP",
            "FOREXCOM:JPXJPY",
            "ASX:XJO",
            "CSEMA:MASI",
          ],
        },
        {
          sectionName: "Matières 1ères",
          symbols: ["TVC:GOLD", "TVC:SILVER", "TVC:UKOIL", "TVC:USOIL", "FOREXCOM:NATURALGAS"],
        },
      ])
    );
    ref.current.appendChild(el);
  }, []);
  return <div className="tradingview-widget-container tv-market-overview-wrap" ref={ref}></div>;
}

function TradingViewMasiOverview() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [["Bourse de Casablanca : MASI", "CSEMA:MASI|1D"]],
      chartOnly: false,
      width: "100%",
      height: "220",
      locale: "fr",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      showVolume: false,
      lineWidth: 2,
      lineType: 0,
      dateRanges: ["1d|15", "1m|30", "3m|60", "12m|1D"],
    });
    ref.current.appendChild(script);
  }, []);
  return (
    <div className="tradingview-widget-container" ref={ref}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

function TradingViewSingleQuote({ symbol }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: `CSEMA:${symbol}`,
      width: "100%",
      colorTheme: "light",
      isTransparent: true,
      locale: "fr",
    });
    ref.current.appendChild(script);
  }, [symbol]);
  return (
    <div className="tradingview-widget-container tv-single-quote" ref={ref}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

function TradingViewHotlist() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "light",
      dateRange: "1D",
      exchange: "CSEMA",
      showChart: false,
      locale: "fr",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: false,
      showFloatingTooltip: true,
      width: "100%",
      height: "450",
    });
    ref.current.appendChild(script);
  }, []);
  return (
    <div className="tradingview-widget-container" ref={ref}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

function TradingViewScreener({ screen, title }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 400,
      defaultColumn: "overview",
      defaultScreen: screen,
      market: "morocco",
      showToolbar: false,
      colorTheme: "light",
      locale: "fr",
      isTransparent: true,
    });
    ref.current.appendChild(script);
  }, [screen]);
  return (
    <div className="palmares-card">
      <div className={`palmares-head ${screen === "top_gainers" ? "gain" : "loss"}`}>
        {screen === "top_gainers" ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {title}
      </div>
      <div className="tradingview-widget-container" ref={ref}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}

function TradingViewMarketCapScreener() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 500,
      defaultColumn: "overview",
      defaultScreen: "general",
      market: "morocco",
      showToolbar: true,
      colorTheme: "light",
      locale: "fr",
      isTransparent: true,
    });
    ref.current.appendChild(script);
  }, []);
  return (
    <div className="tradingview-widget-container" ref={ref}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

function TradingViewAllStocksScreener() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 600,
      defaultColumn: "performance",
      defaultScreen: "general",
      market: "morocco",
      showToolbar: true,
      colorTheme: "light",
      locale: "fr",
      isTransparent: true,
    });
    ref.current.appendChild(script);
  }, []);
  return (
    <div className="tradingview-widget-container" ref={ref}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

// Jours fériés marocains déjà déclarés plus haut (MOROCCO_HOLIDAYS_2026) —
// réutilisés ici pour le calcul du statut ouvert/fermé du marché en direct.
function getCasablancaMarketStatus() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Casablanca",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const weekday = get("weekday");
  const isoDate = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);
  const minutesNow = hour * 60 + minute;

  const isWeekday = !["Sat", "Sun"].includes(weekday);
  const isHoliday = MOROCCO_HOLIDAYS_2026.includes(isoDate);
  const openTime = 9 * 60; // 09h00
  const closeTime = 15 * 60 + 30; // 15h30
  const isOpen = isWeekday && !isHoliday && minutesNow >= openTime && minutesNow < closeTime;

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return { isOpen, isHoliday, timeLabel: `${hh}:${mm}` };
}

// Indices boursiers internationaux — instantané réel, source investing.com (début juillet 2026)
// Les cours évoluent en continu ; ceci est une photo à un instant T, pas un flux temps réel.
const globalIndicesDate = "clôture du 08/07/2026 (Nikkei 225 et S&P/ASX 200 : 07/07/2026)";
const globalIndices = [
  { nom: "S&P 500", pays: "États-Unis", valeur: "7 482,71", var: -0.28 },
  { nom: "Dow Jones", pays: "États-Unis", valeur: "52 348,39", var: -1.09 },
  { nom: "Nasdaq Composite", pays: "États-Unis", valeur: "25 870,65", var: 0.2 },
  { nom: "CAC 40", pays: "France", valeur: "8 252,66", var: -2.18 },
  { nom: "DAX", pays: "Allemagne", valeur: "24 897,45", var: -2.23 },
  { nom: "FTSE 100", pays: "Royaume-Uni", valeur: "10 489,04", var: -1.66 },
  { nom: "Nikkei 225", pays: "Japon", valeur: "66 819,05", var: -2.11 },
  { nom: "S&P/ASX 200", pays: "Australie", valeur: "8 785,10", var: -0.21 },
];

// Matières premières — instantané réel, source investing.com (fin juin / début juillet 2026)
const commodities = [
  { nom: "Or", unite: "$ / once", valeur: "4 030,68", var: -1.87 },
  { nom: "Argent", unite: "$ / once", valeur: "58,79", var: -4.15 },
  { nom: "Pétrole Brent", unite: "$ / baril", valeur: "78,15", var: 5.38 },
  { nom: "Gaz naturel", unite: "$ / MMBtu", valeur: "3,25", var: -0.03 },
  { nom: "Nickel", unite: "$ / tonne", valeur: "16 324,38", var: 0.04 },
];

// Contenu pédagogique — synthétisé à partir de casablanca-bourse.com et ammc.ma
const learnCards = [
  {
    title: "Qu'est-ce que la Bourse de Casablanca ?",
    text: "Fondée le 7 novembre 1929, la Bourse de Casablanca est l'une des plus anciennes places financières d'Afrique et la 2ᵉ du continent par capitalisation, derrière Johannesburg. C'est un marché réglementé où les entreprises marocaines lèvent des fonds en émettant des actions ou des obligations, et où les investisseurs achètent et revendent ces titres.",
  },
  {
    title: "Comment fonctionne une séance",
    text: "Le marché ouvre du lundi au vendredi : une phase de pré-ouverture permet de collecter les ordres, suivie du fixing puis de la cotation en continu. Les transactions ne peuvent se faire qu'à la Bourse, via une société de bourse agréée. Le règlement-livraison intervient 3 jours de bourse après la transaction (T+3), en dirham marocain.",
  },
  {
    title: "Les acteurs du marché",
    text: "La Bourse de Casablanca organise et fait fonctionner le marché. L'AMMC régule et surveille l'ensemble des intervenants. Maroclear, dépositaire central, assure la conservation des titres et le règlement des transactions. Les sociétés de bourse sont les seules habilitées à exécuter les ordres d'achat et de vente pour le compte des investisseurs.",
  },
  {
    title: "Le rôle de l'AMMC",
    text: "L'Autorité Marocaine du Marché des Capitaux a pour mission de protéger l'épargne investie en instruments financiers. Elle veille à l'égalité de traitement des épargnants, à la transparence du marché, contrôle les sociétés de gestion et de bourse, vise les notes d'information des émetteurs et contribue à l'éducation financière du public.",
  },
  {
    title: "Comment investir",
    text: "Avant d'investir, il s'agit de définir un objectif de placement, de s'informer sur les valeurs qui vous intéressent, puis d'ouvrir un compte-titres auprès d'un intermédiaire financier (banque ou société de bourse). Les ordres d'achat et de vente sont ensuite transmis à cet intermédiaire, qui les exécute sur le marché.",
  },
  {
    title: "L'introduction en bourse (IPO)",
    text: "S'introduire en bourse permet à une entreprise de lever des fonds, de gagner en notoriété et de moderniser sa gouvernance. Le marché principal s'adresse aux grandes entreprises, tandis que le marché alternatif est réservé aux PME (chiffre d'affaires, bilan ou effectifs sous certains seuils), avec des exigences allégées et des avantages fiscaux à la clé.",
  },
  {
    title: "Les indices phares : MASI et MADEX",
    text: "Le MASI (Moroccan All Shares Index) regroupe l'ensemble des sociétés cotées, pondérées par leur capitalisation flottante : c'est le baromètre général du marché. Le MADEX ne retient que les valeurs les plus liquides de la cote, pour une lecture plus resserrée de la tendance du marché.",
  },
  {
    title: "Se former : l'École de la Bourse",
    text: "Créée en 2000 par la Bourse de Casablanca, l'École de la Bourse propose des formations en présentiel et en ligne pour vulgariser les mécanismes boursiers auprès du grand public. Le Championnat de la Bourse, lui, permet de gérer virtuellement un portefeuille fictif d'un million de dirhams dans des conditions proches du marché réel.",
  },
];

// Calendrier des dividendes — structure et dates officielles reprises de casablanca-bourse.com
// (capture d'écran fournie par l'utilisateur, page "Calendrier des dividendes")
// Exercice 2025, dividendes versés en 2026. Pour les sociétés dont la date officielle
// n'a pas encore été communiquée, "À confirmer" est affiché plutôt qu'une date inventée.
const dividendStats = { distributrices: 52, sansDividende: 29, rendementMoyen: 3.48, cumul: 2460, suivies: 82 };

const dividend2026 = [
  { emetteur: "MAGHREB OXYGENE", secteur: "Matériaux", montant: 4, detachement: "24/03/2026", paiement: "02/04/2026", type: "Ordinaire" },
  { emetteur: "AFRIQUIA GAZ", secteur: "Énergie", montant: 175, detachement: "24/03/2026", paiement: "02/04/2026", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 1, detachement: "22/04/2026", paiement: "04/05/2026", type: "Ordinaire" },
  { emetteur: "AUTO NEJMA", secteur: "Distribution", montant: 176, detachement: "30/04/2026", paiement: "11/05/2026", type: "Ordinaire" },
  { emetteur: "AUTO HALL", secteur: "Distribution", montant: 2, detachement: "15/05/2026", paiement: "26/05/2026", type: "Ordinaire" },
  { emetteur: "CREDIT DU MAROC", secteur: "Banques", montant: 48, detachement: "04/06/2026", paiement: "15/06/2026", type: "Ordinaire" },
  { emetteur: "CASH PLUS S.A", secteur: "Financement", montant: 9.73, detachement: "04/06/2026", paiement: "15/06/2026", type: "Ordinaire" },
  { emetteur: "SALAFIN", secteur: "Financement", montant: 30, detachement: "04/06/2026", paiement: "12/06/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE DES BOISSONS DU MAROC", secteur: "Agroalimentaire", montant: 107, detachement: "10/06/2026", paiement: "22/06/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE DES BOISSONS DU MAROC", secteur: "Agroalimentaire", montant: 20, detachement: "10/06/2026", paiement: "22/06/2026", type: "Exceptionnel" },
  { emetteur: "CFG BANK", secteur: "Banques", montant: 4, detachement: "10/06/2026", paiement: "22/06/2026", type: "Ordinaire" },
  { emetteur: "Holcim Maroc S.A", secteur: "Matériaux", montant: 96, detachement: "12/06/2026", paiement: "24/06/2026", type: "Ordinaire" },
  { emetteur: "WAFA ASSURANCE", secteur: "Assurances", montant: 150, detachement: "18/06/2026", paiement: "29/06/2026", type: "Ordinaire" },
  { emetteur: "TOTALENERGIES MARKETING MAROC", secteur: "Distribution", montant: 89.57, detachement: "18/06/2026", paiement: "29/06/2026", type: "Ordinaire" },
  { emetteur: "ATLANTASANAD", secteur: "Assurances", montant: 5.9, detachement: "19/06/2026", paiement: "30/06/2026", type: "Ordinaire" },
  { emetteur: "ARADEI CAPITAL", secteur: "Immobilier", montant: 5.71, detachement: "19/06/2026", paiement: "30/06/2026", type: "Ordinaire" },
  { emetteur: "ARADEI CAPITAL", secteur: "Immobilier", montant: 17.29, detachement: "19/06/2026", paiement: "30/06/2026", type: "Exceptionnel" },
  { emetteur: "AFRIC INDUSTRIES SA", secteur: "Biens d'équipement", montant: 20, detachement: "19/06/2026", paiement: "30/06/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE LES EAUX MINERALES D'OULMES", secteur: "Agroalimentaire", montant: 40.15, detachement: "19/06/2026", paiement: "30/06/2026", type: "Ordinaire" },
  { emetteur: "VICENNE", secteur: "Santé", montant: 8.44, detachement: "22/06/2026", paiement: "01/07/2026", type: "Ordinaire" },
  { emetteur: "RISMA", secteur: "Services", montant: 9, detachement: "22/06/2026", paiement: "01/07/2026", type: "Ordinaire" },
  { emetteur: "DISWAY", secteur: "Technologie", montant: 44, detachement: "24/06/2026", paiement: "03/07/2026", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 2.5, detachement: "24/06/2026", paiement: "03/07/2026", type: "Ordinaire" },
  { emetteur: "DISTY TECHNOLOGIES", secteur: "Technologie", montant: 19.5, detachement: "26/06/2026", paiement: "07/07/2026", type: "Ordinaire" },
  { emetteur: "LABEL VIE", secteur: "Distribution", montant: 120, detachement: "01/07/2026", paiement: "10/07/2026", type: "Ordinaire" },
  { emetteur: "MUTANDIS SCA", secteur: "Agroalimentaire", montant: 10.5, detachement: "01/07/2026", paiement: "10/07/2026", type: "Ordinaire" },
  { emetteur: "CREDIT IMMOBILIER ET HOTELIER", secteur: "Banques", montant: 14, detachement: "01/07/2026", paiement: "10/07/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE DE THERAPEUTIQUE MAROCAINE", secteur: "Pharmaceutiques", montant: 6.6, detachement: "01/07/2026", paiement: "10/07/2026", type: "Ordinaire" },
  { emetteur: "CIMENTS DU MAROC", secteur: "Matériaux", montant: 65, detachement: "06/07/2026", paiement: "15/07/2026", type: "Ordinaire" },
  { emetteur: "ENNAKL AUTOMOBILES", secteur: "Distributeurs", montant: 2.81, detachement: "06/07/2026", paiement: "15/07/2026", type: "Ordinaire" },
  { emetteur: "ATTIJARIWAFA BANK", secteur: "Banques", montant: 22, detachement: "08/07/2026", paiement: "17/07/2026", type: "Ordinaire" },
  { emetteur: "BANQUE CENTRALE POPULAIRE", secteur: "Banques", montant: 11, detachement: "09/07/2026", paiement: "20/07/2026", type: "Ordinaire" },
  { emetteur: "DELTA HOLDING", secteur: "Biens d'équipement", montant: 2, detachement: "13/07/2026", paiement: "22/07/2026", type: "Ordinaire" },
  { emetteur: "JET CONTRACTORS", secteur: "Biens d'équipement", montant: 20, detachement: "13/07/2026", paiement: "22/07/2026", type: "Ordinaire" },
  { emetteur: "ALUMINIUM DU MAROC", secteur: "Biens d'équipement", montant: 110, detachement: "14/07/2026", paiement: "23/07/2026", type: "Ordinaire" },
  { emetteur: "AGMA", secteur: "Assurances", montant: 310, detachement: "14/07/2026", paiement: "23/07/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE GENERALE DES TRAVAUX DU MAROC", secteur: "Biens d'équipement", montant: 12, detachement: "14/07/2026", paiement: "23/07/2026", type: "Ordinaire" },
  { emetteur: "MANAGEM", secteur: "Matériaux", montant: 55, detachement: "15/07/2026", paiement: "24/07/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE METALLURGIQUE D'IMITER", secteur: "Matériaux", montant: 150, detachement: "15/07/2026", paiement: "24/07/2026", type: "Ordinaire" },
  { emetteur: "HIGHTECH PAYMENT SYSTEMS", secteur: "Logiciels", montant: 8, detachement: "16/07/2026", paiement: "27/07/2026", type: "Ordinaire" },
  { emetteur: "BANK OF AFRICA", secteur: "Banques", montant: 5, detachement: "16/07/2026", paiement: "27/07/2026", type: "Ordinaire" },
  { emetteur: "BANQUE MAROCAINE POUR LE COMMERCE ET L'INDUSTRIE", secteur: "Banques", montant: 14, detachement: "17/07/2026", paiement: "28/07/2026", type: "Ordinaire" },
  { emetteur: "MICRODATA", secteur: "Logiciels", montant: 40, detachement: "17/07/2026", paiement: "28/07/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE D'EXPLOITATION DES PORTS - MARSA MAROC", secteur: "Transport", montant: 11, detachement: "17/07/2026", paiement: "28/07/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE NATIONALE DE SIDERURGIE SA", secteur: "Matériaux", montant: 52, detachement: "20/07/2026", paiement: "29/07/2026", type: "Ordinaire" },
  { emetteur: "ALLIANCES DEVELOPPEMENT IMMOBILIER SA", secteur: "Immobilier", montant: 4, detachement: "21/07/2026", paiement: "31/07/2026", type: "Ordinaire" },
  { emetteur: "COSUMAR", secteur: "Agroalimentaire", montant: 9, detachement: "22/07/2026", paiement: "03/08/2026", type: "Ordinaire" },
  { emetteur: "COSUMAR", secteur: "Agroalimentaire", montant: 1, detachement: "22/07/2026", paiement: "03/08/2026", type: "Exceptionnel" },
  { emetteur: "EQDOM", secteur: "Financement", montant: 57, detachement: "23/07/2026", paiement: "04/08/2026", type: "Ordinaire" },
  { emetteur: "BALIMA", secteur: "Immobilier", montant: 5.5, detachement: "24/07/2026", paiement: "05/08/2026", type: "Ordinaire" },
  { emetteur: "DARI COUSPATE", secteur: "Agroalimentaire", montant: 140, detachement: "31/07/2026", paiement: "11/08/2026", type: "Ordinaire" },
  { emetteur: "SANLAM MAROC", secteur: "Assurances", montant: 98, detachement: "19/08/2026", paiement: "03/09/2026", type: "Ordinaire" },
  { emetteur: "MAGHREBAIL", secteur: "Immobilier", montant: 53, detachement: "28/08/2026", paiement: "08/09/2026", type: "Ordinaire" },
  { emetteur: "ITISSALAT AL-MAGHRIB", secteur: "Télécommunications", montant: 4, detachement: "04/09/2026", paiement: "15/09/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE DE PROMOTION PHARMACEUTIQUE DU MAGHREB S.A", secteur: "Pharmaceutiques", montant: 30, detachement: "11/09/2026", paiement: "22/09/2026", type: "Ordinaire" },
  { emetteur: "TAQA MOROCCO", secteur: "Utilities", montant: 38, detachement: "16/09/2026", paiement: "25/09/2026", type: "Ordinaire" },
];

const dividend2025Full = [
  { emetteur: "MAGHREB OXYGENE", secteur: "Matériaux", montant: 4, detachement: "25/03/2025", paiement: "08/04/2025", type: "Ordinaire" },
  { emetteur: "AFRIQUIA GAZ", secteur: "Énergie", montant: 175, detachement: "25/03/2025", paiement: "08/04/2025", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 1, detachement: "18/04/2025", paiement: "29/04/2025", type: "Ordinaire" },
  { emetteur: "AUTO NEJMA", secteur: "Distribution", montant: 120, detachement: "22/05/2025", paiement: "02/06/2025", type: "Ordinaire" },
  { emetteur: "ENNAKL AUTOMOBILES", secteur: "Distributeurs", montant: 2.38, detachement: "27/05/2025", paiement: "05/06/2025", type: "Ordinaire" },
  { emetteur: "ATTIJARIWAFA BANK", secteur: "Banques", montant: 19, detachement: "27/05/2025", paiement: "05/06/2025", type: "Ordinaire" },
  { emetteur: "SALAFIN", secteur: "Financement", montant: 14.75, detachement: "06/06/2025", paiement: "17/06/2025", type: "Ordinaire" },
  { emetteur: "SALAFIN", secteur: "Financement", montant: 14.75, detachement: "06/06/2025", paiement: "17/06/2025", type: "Exceptionnel" },
  { emetteur: "SOCIETE DES BOISSONS DU MAROC", secteur: "Agroalimentaire", montant: 100, detachement: "10/06/2025", paiement: "19/06/2025", type: "Ordinaire" },
  { emetteur: "AFRIC INDUSTRIES SA", secteur: "Biens d'équipement", montant: 22, detachement: "10/06/2025", paiement: "19/06/2025", type: "Ordinaire" },
  { emetteur: "ATLANTASANAD", secteur: "Assurances", montant: 5.8, detachement: "10/06/2025", paiement: "19/06/2025", type: "Ordinaire" },
  { emetteur: "AUTO HALL", secteur: "Distribution", montant: 2, detachement: "10/06/2025", paiement: "18/06/2025", type: "Ordinaire" },
  { emetteur: "ARADEI CAPITAL", secteur: "Immobilier", montant: 10.43, detachement: "11/06/2025", paiement: "20/06/2025", type: "Ordinaire" },
  { emetteur: "ARADEI CAPITAL", secteur: "Immobilier", montant: 11.57, detachement: "11/06/2025", paiement: "20/06/2025", type: "Exceptionnel" },
  { emetteur: "COLORADO", secteur: "Chimie", montant: 2.6, detachement: "12/06/2025", paiement: "23/06/2025", type: "Ordinaire" },
  { emetteur: "Holcim Maroc S.A", secteur: "Matériaux", montant: 70, detachement: "13/06/2025", paiement: "24/06/2025", type: "Ordinaire" },
  { emetteur: "CFG BANK", secteur: "Banques", montant: 3.3, detachement: "13/06/2025", paiement: "24/06/2025", type: "Ordinaire" },
  { emetteur: "BANQUE MAROCAINE POUR LE COMMERCE ET L'INDUSTRIE", secteur: "Banques", montant: 18, detachement: "16/06/2025", paiement: "25/06/2025", type: "Ordinaire" },
  { emetteur: "WAFA ASSURANCE", secteur: "Assurances", montant: 140, detachement: "17/06/2025", paiement: "26/06/2025", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 2.2, detachement: "17/06/2025", paiement: "26/06/2025", type: "Ordinaire" },
  { emetteur: "SOCIETE LES EAUX MINERALES D'OULMES", secteur: "Agroalimentaire", montant: 23, detachement: "18/06/2025", paiement: "30/06/2025", type: "Ordinaire" },
  { emetteur: "TOTALENERGIES MARKETING MAROC", secteur: "Distribution", montant: 113, detachement: "19/06/2025", paiement: "30/06/2025", type: "Ordinaire" },
  { emetteur: "SOCIETE DE THERAPEUTIQUE MAROCAINE", secteur: "Pharmaceutiques", montant: 28, detachement: "20/06/2025", paiement: "02/07/2025", type: "Ordinaire" },
  { emetteur: "DISWAY", secteur: "Technologie", montant: 40, detachement: "30/06/2025", paiement: "09/07/2025", type: "Ordinaire" },
  { emetteur: "MUTANDIS SCA", secteur: "Agroalimentaire", montant: 10.5, detachement: "30/06/2025", paiement: "09/07/2025", type: "Ordinaire" },
  { emetteur: "LESIEUR CRISTAL", secteur: "Agroalimentaire", montant: 3, detachement: "30/06/2025", paiement: "09/07/2025", type: "Ordinaire" },
  { emetteur: "CREDIT IMMOBILIER ET HOTELIER", secteur: "Banques", montant: 14, detachement: "30/06/2025", paiement: "09/07/2025", type: "Ordinaire" },
  { emetteur: "SOCIETE METALLURGIQUE D'IMITER", secteur: "Matériaux", montant: 80, detachement: "30/06/2025", paiement: "08/07/2025", type: "Ordinaire" },
  { emetteur: "MANAGEM", secteur: "Matériaux", montant: 40, detachement: "30/06/2025", paiement: "08/07/2025", type: "Ordinaire" },
  { emetteur: "CREDIT DU MAROC", secteur: "Banques", montant: 41.7, detachement: "01/07/2025", paiement: "10/07/2025", type: "Ordinaire" },
  { emetteur: "DISTY TECHNOLOGIES", secteur: "Technologie", montant: 16.5, detachement: "09/07/2025", paiement: "18/07/2025", type: "Ordinaire" },
  { emetteur: "ALLIANCES DEVELOPPEMENT IMMOBILIER SA", secteur: "Immobilier", montant: 3.6, detachement: "10/07/2025", paiement: "21/07/2025", type: "Ordinaire" },
  { emetteur: "DELTA HOLDING", secteur: "Biens d'équipement", montant: 2.25, detachement: "10/07/2025", paiement: "21/07/2025", type: "Ordinaire" },
  { emetteur: "BANK OF AFRICA", secteur: "Banques", montant: 5, detachement: "10/07/2025", paiement: "21/07/2025", type: "Ordinaire" },
  { emetteur: "ALUMINIUM DU MAROC", secteur: "Biens d'équipement", montant: 100, detachement: "11/07/2025", paiement: "22/07/2025", type: "Ordinaire" },
  { emetteur: "AGMA", secteur: "Assurances", montant: 300, detachement: "15/07/2025", paiement: "24/07/2025", type: "Ordinaire" },
  { emetteur: "BANQUE CENTRALE POPULAIRE", secteur: "Banques", montant: 10.5, detachement: "15/07/2025", paiement: "24/07/2025", type: "Ordinaire" },
  { emetteur: "HIGHTECH PAYMENT SYSTEMS", secteur: "Logiciels", montant: 7, detachement: "16/07/2025", paiement: "25/07/2025", type: "Ordinaire" },
  { emetteur: "SOCIETE D'EXPLOITATION DES PORTS - MARSA MAROC", secteur: "Transport", montant: 9.5, detachement: "17/07/2025", paiement: "28/07/2025", type: "Ordinaire" },
  { emetteur: "CIMENTS DU MAROC", secteur: "Matériaux", montant: 60, detachement: "18/07/2025", paiement: "29/07/2025", type: "Ordinaire" },
  { emetteur: "BALIMA", secteur: "Immobilier", montant: 5.5, detachement: "18/07/2025", paiement: "29/07/2025", type: "Ordinaire" },
  { emetteur: "DARI COUSPATE", secteur: "Agroalimentaire", montant: 140, detachement: "18/07/2025", paiement: "29/07/2025", type: "Ordinaire" },
  { emetteur: "JET CONTRACTORS", secteur: "Biens d'équipement", montant: 15, detachement: "18/07/2025", paiement: "29/07/2025", type: "Ordinaire" },
  { emetteur: "MICRODATA", secteur: "Logiciels", montant: 40, detachement: "18/07/2025", paiement: "29/07/2025", type: "Ordinaire" },
  { emetteur: "COSUMAR", secteur: "Agroalimentaire", montant: 10, detachement: "21/07/2025", paiement: "31/07/2025", type: "Ordinaire" },
  { emetteur: "SOCIETE NATIONALE DE SIDERURGIE SA", secteur: "Matériaux", montant: 39, detachement: "21/07/2025", paiement: "31/07/2025", type: "Ordinaire" },
  { emetteur: "LABEL VIE", secteur: "Distribution", montant: 110.57, detachement: "21/07/2025", paiement: "31/07/2025", type: "Ordinaire" },
  { emetteur: "RISMA", secteur: "Services", montant: 7, detachement: "23/07/2025", paiement: "04/08/2025", type: "Ordinaire" },
  { emetteur: "AKDITAL", secteur: "Santé", montant: 10, detachement: "24/07/2025", paiement: "05/08/2025", type: "Ordinaire" },
  { emetteur: "TRAVAUX GENERAUX DE CONSTRUCTION DE CASABLANCA", secteur: "Biens d'équipement", montant: 11.5, detachement: "04/08/2025", paiement: "13/08/2025", type: "Ordinaire" },
  { emetteur: "SANLAM MAROC", secteur: "Assurances", montant: 81, detachement: "25/08/2025", paiement: "03/09/2025", type: "Ordinaire" },
  { emetteur: "MAGHREBAIL", secteur: "Immobilier", montant: 53, detachement: "27/08/2025", paiement: "08/09/2025", type: "Ordinaire" },
  { emetteur: "ITISSALAT AL-MAGHRIB", secteur: "Télécommunications", montant: 1.43, detachement: "01/09/2025", paiement: "12/09/2025", type: "Ordinaire" },
  { emetteur: "AFMA SA", secteur: "Assurances", montant: 60, detachement: "08/09/2025", paiement: "17/09/2025", type: "Ordinaire" },
  { emetteur: "CMGP GROUP", secteur: "Agriculture", montant: 6.3, detachement: "16/09/2025", paiement: "25/09/2025", type: "Ordinaire" },
  { emetteur: "TAQA MOROCCO", secteur: "Utilities", montant: 37, detachement: "16/09/2025", paiement: "25/09/2025", type: "Ordinaire" },
  { emetteur: "MAROC LEASING", secteur: "Financement", montant: 14, detachement: "17/09/2025", paiement: "26/09/2025", type: "Ordinaire" },
  { emetteur: "COMPAGNIE DE TRANSPORT AU MAROC", secteur: "Transport", montant: 25, detachement: "18/09/2025", paiement: "29/09/2025", type: "Ordinaire" },
  { emetteur: "DOUJA PROMOTION GROUPE ADDOHA SA", secteur: "Immobilier", montant: 0.5, detachement: "19/09/2025", paiement: "30/09/2025", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 1, detachement: "23/09/2025", paiement: "02/10/2025", type: "Ordinaire" },
  { emetteur: "TOTALENERGIES MARKETING MAROC", secteur: "Distribution", montant: 67, detachement: "02/12/2025", paiement: "11/12/2025", type: "Exceptionnel" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 1, detachement: "10/12/2025", paiement: "19/12/2025", type: "Ordinaire" },
];

const dividend2024Full = [
  { emetteur: "AFRIQUIA GAZ", secteur: "Énergie", montant: 140, detachement: "02/04/2024", paiement: "16/04/2024", type: "Ordinaire" },
  { emetteur: "MAGHREB OXYGENE", secteur: "Matériaux", montant: 4, detachement: "03/04/2024", paiement: "16/04/2024", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 1, detachement: "22/04/2024", paiement: "30/04/2024", type: "Ordinaire" },
  { emetteur: "AUTO NEJMA", secteur: "Distribution", montant: 94, detachement: "23/05/2024", paiement: "03/06/2024", type: "Ordinaire" },
  { emetteur: "SALAFIN", secteur: "Financement", montant: 14.25, detachement: "27/05/2024", paiement: "05/06/2024", type: "Ordinaire" },
  { emetteur: "SALAFIN", secteur: "Financement", montant: 14.25, detachement: "27/05/2024", paiement: "05/06/2024", type: "Exceptionnel" },
  { emetteur: "SOCIETE DES BOISSONS DU MAROC", secteur: "Agroalimentaire", montant: 160, detachement: "06/06/2024", paiement: "20/06/2024", type: "Ordinaire" },
  { emetteur: "COLORADO", secteur: "Chimie", montant: 2.25, detachement: "06/06/2024", paiement: "20/06/2024", type: "Ordinaire" },
  { emetteur: "Holcim Maroc S.A", secteur: "Matériaux", montant: 66, detachement: "06/06/2024", paiement: "20/06/2024", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 2.2, detachement: "11/06/2024", paiement: "24/06/2024", type: "Ordinaire" },
  { emetteur: "WAFA ASSURANCE", secteur: "Assurances", montant: 140, detachement: "11/06/2024", paiement: "26/06/2024", type: "Ordinaire" },
  { emetteur: "CFG BANK", secteur: "Banques", montant: 3.3, detachement: "11/06/2024", paiement: "24/06/2024", type: "Ordinaire" },
  { emetteur: "TOTALENERGIES MARKETING MAROC", secteur: "Distribution", montant: 56, detachement: "19/06/2024", paiement: "27/06/2024", type: "Ordinaire" },
  { emetteur: "AUTO HALL", secteur: "Distribution", montant: 2, detachement: "20/06/2024", paiement: "01/07/2024", type: "Ordinaire" },
  { emetteur: "ATLANTASANAD", secteur: "Assurances", montant: 5.7, detachement: "20/06/2024", paiement: "28/06/2024", type: "Ordinaire" },
  { emetteur: "EQDOM", secteur: "Financement", montant: 55, detachement: "20/06/2024", paiement: "01/07/2024", type: "Ordinaire" },
  { emetteur: "SOCIETE METALLURGIQUE D'IMITER", secteur: "Matériaux", montant: 80, detachement: "20/06/2024", paiement: "01/07/2024", type: "Ordinaire" },
  { emetteur: "LABEL VIE", secteur: "Distribution", montant: 96.75, detachement: "20/06/2024", paiement: "01/07/2024", type: "Ordinaire" },
  { emetteur: "MANAGEM", secteur: "Matériaux", montant: 30, detachement: "20/06/2024", paiement: "01/07/2024", type: "Ordinaire" },
  { emetteur: "TAQA MOROCCO", secteur: "Utilities", montant: 35, detachement: "20/06/2024", paiement: "28/06/2024", type: "Ordinaire" },
  { emetteur: "SOCIETE DE THERAPEUTIQUE MAROCAINE", secteur: "Pharmaceutiques", montant: 17, detachement: "21/06/2024", paiement: "02/07/2024", type: "Ordinaire" },
  { emetteur: "DISWAY", secteur: "Technologie", montant: 35, detachement: "25/06/2024", paiement: "04/07/2024", type: "Ordinaire" },
  { emetteur: "LESIEUR CRISTAL", secteur: "Agroalimentaire", montant: 2, detachement: "26/06/2024", paiement: "05/07/2024", type: "Ordinaire" },
  { emetteur: "SOCIETE LES EAUX MINERALES D'OULMES", secteur: "Agroalimentaire", montant: 22, detachement: "26/06/2024", paiement: "05/07/2024", type: "Ordinaire" },
  { emetteur: "MUTANDIS SCA", secteur: "Agroalimentaire", montant: 10.5, detachement: "27/06/2024", paiement: "10/07/2024", type: "Ordinaire" },
  { emetteur: "CIMENTS DU MAROC", secteur: "Matériaux", montant: 60, detachement: "02/07/2024", paiement: "15/07/2024", type: "Ordinaire" },
  { emetteur: "CIMENTS DU MAROC", secteur: "Matériaux", montant: 10, detachement: "02/07/2024", paiement: "15/07/2024", type: "Exceptionnel" },
  { emetteur: "JET CONTRACTORS", secteur: "Biens d'équipement", montant: 7, detachement: "09/07/2024", paiement: "18/07/2024", type: "Ordinaire" },
  { emetteur: "DISTY TECHNOLOGIES", secteur: "Technologie", montant: 15, detachement: "09/07/2024", paiement: "18/07/2024", type: "Ordinaire" },
  { emetteur: "CREDIT DU MAROC", secteur: "Banques", montant: 34.2, detachement: "09/07/2024", paiement: "18/07/2024", type: "Ordinaire" },
  { emetteur: "CREDIT IMMOBILIER ET HOTELIER", secteur: "Banques", montant: 14, detachement: "09/07/2024", paiement: "18/07/2024", type: "Ordinaire" },
  { emetteur: "DELTA HOLDING", secteur: "Biens d'équipement", montant: 1.5, detachement: "10/07/2024", paiement: "19/07/2024", type: "Ordinaire" },
  { emetteur: "ENNAKL AUTOMOBILES", secteur: "Distributeurs", montant: 1.99, detachement: "10/07/2024", paiement: "19/07/2024", type: "Ordinaire" },
  { emetteur: "ATTIJARIWAFA BANK", secteur: "Banques", montant: 16.5, detachement: "10/07/2024", paiement: "19/07/2024", type: "Ordinaire" },
  { emetteur: "ALLIANCES DEVELOPPEMENT IMMOBILIER SA", secteur: "Immobilier", montant: 3, detachement: "11/07/2024", paiement: "22/07/2024", type: "Ordinaire" },
  { emetteur: "COSUMAR", secteur: "Agroalimentaire", montant: 7, detachement: "11/07/2024", paiement: "22/07/2024", type: "Ordinaire" },
  { emetteur: "COSUMAR", secteur: "Agroalimentaire", montant: 3, detachement: "11/07/2024", paiement: "22/07/2024", type: "Exceptionnel" },
  { emetteur: "SOCIETE NATIONALE DE SIDERURGIE SA", secteur: "Matériaux", montant: 21, detachement: "12/07/2024", paiement: "23/07/2024", type: "Ordinaire" },
  { emetteur: "TRAVAUX GENERAUX DE CONSTRUCTION DE CASABLANCA", secteur: "Biens d'équipement", montant: 7.5, detachement: "12/07/2024", paiement: "23/07/2024", type: "Ordinaire" },
  { emetteur: "MICRODATA", secteur: "Logiciels", montant: 34, detachement: "15/07/2024", paiement: "24/07/2024", type: "Ordinaire" },
  { emetteur: "BALIMA", secteur: "Immobilier", montant: 5.5, detachement: "16/07/2024", paiement: "25/07/2024", type: "Ordinaire" },
  { emetteur: "AFRIC INDUSTRIES SA", secteur: "Biens d'équipement", montant: 20, detachement: "16/07/2024", paiement: "25/07/2024", type: "Ordinaire" },
  { emetteur: "AGMA", secteur: "Assurances", montant: 275, detachement: "16/07/2024", paiement: "25/07/2024", type: "Ordinaire" },
  { emetteur: "HIGHTECH PAYMENT SYSTEMS", secteur: "Logiciels", montant: 6.8, detachement: "17/07/2024", paiement: "26/07/2024", type: "Ordinaire" },
  { emetteur: "BANK OF AFRICA", secteur: "Banques", montant: 4, detachement: "17/07/2024", paiement: "26/07/2024", type: "Ordinaire" },
  { emetteur: "BANQUE MAROCAINE POUR LE COMMERCE ET L'INDUSTRIE", secteur: "Banques", montant: 18, detachement: "17/07/2024", paiement: "26/07/2024", type: "Ordinaire" },
  { emetteur: "ARADEI CAPITAL", secteur: "Immobilier", montant: 5.88, detachement: "18/07/2024", paiement: "29/07/2024", type: "Ordinaire" },
  { emetteur: "ARADEI CAPITAL", secteur: "Immobilier", montant: 14.59, detachement: "18/07/2024", paiement: "29/07/2024", type: "Exceptionnel" },
  { emetteur: "RISMA", secteur: "Services", montant: 6, detachement: "18/07/2024", paiement: "29/07/2024", type: "Ordinaire" },
  { emetteur: "DARI COUSPATE", secteur: "Agroalimentaire", montant: 120, detachement: "18/07/2024", paiement: "29/07/2024", type: "Ordinaire" },
  { emetteur: "BANQUE CENTRALE POPULAIRE", secteur: "Banques", montant: 10, detachement: "19/07/2024", paiement: "31/07/2024", type: "Ordinaire" },
  { emetteur: "SOCIETE D'EXPLOITATION DES PORTS - MARSA MAROC", secteur: "Transport", montant: 8.5, detachement: "24/07/2024", paiement: "07/08/2024", type: "Ordinaire" },
  { emetteur: "AKDITAL", secteur: "Santé", montant: 6, detachement: "31/07/2024", paiement: "09/08/2024", type: "Ordinaire" },
  { emetteur: "ALUMINIUM DU MAROC", secteur: "Biens d'équipement", montant: 90, detachement: "01/08/2024", paiement: "09/08/2024", type: "Ordinaire" },
  { emetteur: "MAGHREBAIL", secteur: "Immobilier", montant: 50, detachement: "06/08/2024", paiement: "15/08/2024", type: "Ordinaire" },
  { emetteur: "SANLAM MAROC", secteur: "Assurances", montant: 77, detachement: "22/08/2024", paiement: "30/08/2024", type: "Ordinaire" },
  { emetteur: "AFMA SA", secteur: "Assurances", montant: 55, detachement: "03/09/2024", paiement: "12/09/2024", type: "Ordinaire" },
  { emetteur: "ITISSALAT AL-MAGHRIB", secteur: "Télécommunications", montant: 4.2, detachement: "03/09/2024", paiement: "12/09/2024", type: "Ordinaire" },
  { emetteur: "UNIMER", secteur: "Agroalimentaire", montant: 1, detachement: "09/09/2024", paiement: "20/09/2024", type: "Ordinaire" },
  { emetteur: "COMPAGNIE DE TRANSPORT AU MAROC", secteur: "Transport", montant: 15, detachement: "10/09/2024", paiement: "23/09/2024", type: "Ordinaire" },
  { emetteur: "MAROC LEASING", secteur: "Financement", montant: 14, detachement: "18/09/2024", paiement: "27/09/2024", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 1, detachement: "19/09/2024", paiement: "30/09/2024", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 1, detachement: "11/12/2024", paiement: "20/12/2024", type: "Ordinaire" },
];

const dividendByYear = {
  "2026": { data: dividend2026, label: "Calendrier des dividendes 2026", note: "Exercice 2025 · versements en 2026" },
  "2025": { data: dividend2025Full, label: "Calendrier des dividendes 2025", note: "Exercice 2024 · versements en 2025" },
  "2024": { data: dividend2024Full, label: "Calendrier des dividendes 2024", note: "Exercice 2023 · versements en 2024" },
};

const dividendSansDividende2026 = [
  "BALIMA", "BMCI", "Banque Centrale Populaire", "Cartier Saada", "Dari Couspate", "Delattre Levivier Maroc",
  "Diac Salaf", "Douja Prom Addoha", "Fenie Brossette", "IB Maroc.com", "Involys", "Lesieur Cristal", "Lydec",
  "M2M Group", "Maroc Leasing", "Med Paper", "Minière Touissit", "Réalisations Mécaniques", "Rebab Company",
  "Res Dar Saada", "S.M Monétique", "Snep", "Stokvis Nord Afrique", "Stroc Industrie", "Samir",
  "TotalEnergies Marketing Maroc", "Timar", "Unimer", "Zellidja",
];

// Historique 2025 — dividendes réellement versés au titre de l'exercice 2025
// (source : casablancabourse.com, classement des entreprises par dividendes yield 2025)
const dividend2025Stats = { total: 80, distributrices: 56, rendementMoyen: 3.1, montantMoyen: 41.77 };
const dividend2025Top = [
  { code: "NKL", nom: "Ennakl", rendement: 6.78, montant: 2.38 },
  { code: "AFI", nom: "Afric Industries", rendement: 6.41, montant: 22.0 },
  { code: "TMA", nom: "TotalEnergies Marketing Maroc", rendement: 6.01, montant: 113.0 },
  { code: "NEJ", nom: "Auto Nejma", rendement: 5.8, montant: 120.0 },
  { code: "IMO", nom: "Immorente Invest", rendement: 5.78, montant: 4.2 },
  { code: "MAB", nom: "Maghrebail", rendement: 5.3, montant: 53.0 },
  { code: "ALM", nom: "Aluminium du Maroc", rendement: 5.09, montant: 100.0 },
  { code: "DWY", nom: "Disway", rendement: 5.03, montant: 40.0 },
  { code: "ARD", nom: "Aradei Capital", rendement: 4.95, montant: 22.0 },
  { code: "SLF", nom: "Salafin", rendement: 4.56, montant: 29.5 },
];

// Capitalisation boursière — top 5 réel, séance du 13 mai 2026
// (source : La Vie Éco)
const capDate = "13 mai 2026";
const capTop5 = [
  { code: "MNG", nom: "Managem", secteur: "Mines", cap: 168.0 },
  { code: "ATW", nom: "Attijariwafa Bank", secteur: "Banques", cap: 148.7 },
  { code: "IAM", nom: "Maroc Telecom", secteur: "Télécommunications", cap: 82.6 },
  { code: "MSA", nom: "Marsa Maroc", secteur: "Transport & logistique", cap: 61.8 },
  { code: "BCP", nom: "Banque Centrale Populaire", secteur: "Banques", cap: 48.6 },
];
const capMarketStats = { total: 1000, societes: 79, secteurBanques: 35, secteurTelecoms: 17.7 };

// Univers de valeurs pour le simulateur de portefeuille — cours réels récents
// (source : investing.com et casablancabourse.com, début juillet 2026, sauf mention contraire)
const stocksUniverse = [
  { code: "IAM", nom: "Maroc Telecom", cours: 92.2 },
  { code: "ATW", nom: "Attijariwafa Bank", cours: 680.0 },
  { code: "BCP", nom: "Banque Centrale Populaire", cours: 239.8 },
  { code: "CIH", nom: "CIH Bank", cours: 398.5 },
  { code: "BOA", nom: "Bank of Africa", cours: 202.3 },
  { code: "CFG", nom: "CFG Bank", cours: 203.0 },
  { code: "LHM", nom: "LafargeHolcim Maroc", cours: 1780.0 },
  { code: "CMA", nom: "Ciments du Maroc", cours: 1650.0 },
  { code: "SID", nom: "Sonasid", cours: 1989.0 },
  { code: "MNG", nom: "Managem", cours: 12822.0 },
  { code: "ADH", nom: "Douja Prom Addoha", cours: 31.9 },
  { code: "TQM", nom: "Taqa Morocco", cours: 1042.0 },
  { code: "SNP", nom: "Snep", cours: 348.0 },
  { code: "RIS", nom: "Risma", cours: 322.5 },
  { code: "DHO", nom: "Delta Holding", cours: 60.0 },
  { code: "MSA", nom: "Marsa Maroc", cours: 828.0 },
  { code: "CSR", nom: "Cosumar", cours: 280.0 },
  { code: "WAA", nom: "Wafa Assurance", cours: 5620.0 },
  { code: "LBV", nom: "Label'Vie", cours: 3950.0 },
  { code: "GAZ", nom: "Afriquia Gaz", cours: 3812.0 },
  { code: "NEJ", nom: "Auto Nejma", cours: 4834.0 },
  { code: "SBM", nom: "Sté des Boissons du Maroc", cours: 2449.0 },
  { code: "AGM", nom: "AGMA", cours: 7199.0 },
  { code: "ALM", nom: "Aluminium du Maroc", cours: 1896.0 },
];

function Variation({ value, size = "md" }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`variation ${up ? "up" : "down"} ${size}`}>
      <Icon size={size === "lg" ? 18 : 14} strokeWidth={2.5} />
      {up ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

function PercentCell({ value }) {
  const v = value ?? 0;
  const cls = v > 0 ? "up" : v < 0 ? "down" : "flat";
  const sign = v > 0 ? "+" : "";
  return <td className={`perf-cell ${cls}`}>{sign}{v.toFixed(2)}%</td>;
}

export default function Sahm() {
  const [tab, setTab] = useState(opcvmCategoryList[0]);
  const [opcvmPageTab, setOpcvmPageTab] = useState(opcvmCategoryList[0]);
  const [opcvmSearch, setOpcvmSearch] = useState("");
  const [selectedOpcvm, setSelectedOpcvm] = useState(null);
  const [actionsData, setActionsData] = useState(null);
  const [actionsSearch, setActionsSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);

  // Mode sombre
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("sahm-theme") === "dark"; } catch { return false; }
  });
  React.useEffect(() => {
    try { localStorage.setItem("sahm-theme", darkMode ? "dark" : "light"); } catch {}
  }, [darkMode]);

  // Favoris (watchlist)
  const [favoris, setFavoris] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sahm-favoris") || "[]"); } catch { return []; }
  });
  React.useEffect(() => {
    try { localStorage.setItem("sahm-favoris", JSON.stringify(favoris)); } catch {}
  }, [favoris]);
  const toggleFavori = (ticker) => {
    setFavoris((prev) => prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]);
  };
  const [showFavorisOnly, setShowFavorisOnly] = useState(false);

  // Comparateur d'actions
  const [compareTickers, setCompareTickers] = useState(["", "", ""]);

  // Tri du tableau des actions (PER, rendement, capitalisation…)
  const [actionsSortKey, setActionsSortKey] = useState(null);
  const [actionsSortDir, setActionsSortDir] = useState("desc");
  const toggleActionsSort = (key) => {
    if (actionsSortKey === key) {
      setActionsSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setActionsSortKey(key);
      setActionsSortDir("desc");
    }
  };

  React.useEffect(() => {
    let cancelled = false;
    fetch("/data/actions.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setActionsData(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const [historiqueCache, setHistoriqueCache] = useState({});
  const [histRange, setHistRange] = useState("1A");
  React.useEffect(() => {
    const ticker = selectedAction?.ticker;
    if (!ticker || historiqueCache[ticker] !== undefined) return;
    let cancelled = false;
    fetch(`/data/historique/${ticker}.json`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setHistoriqueCache((prev) => ({ ...prev, [ticker]: data || [] }));
      })
      .catch(() => {
        if (!cancelled) setHistoriqueCache((prev) => ({ ...prev, [ticker]: [] }));
      });
    return () => { cancelled = true; };
  }, [selectedAction]);
  const [page, setPage] = useState("accueil");
  const [dataTab, setDataTab] = useState("dividendes");
  const [dividendYear, setDividendYear] = useState("2026");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [marketStatus, setMarketStatus] = useState(() => getCasablancaMarketStatus());

  React.useEffect(() => {
    const id = setInterval(() => setMarketStatus(getCasablancaMarketStatus()), 30000);
    return () => clearInterval(id);
  }, []);

  // MASI en direct (mis à jour toutes les 15 min par un robot GitHub,
  // source e-bourse.ma — plateforme officielle de la Bourse de Casablanca)
  const [marketData, setMarketData] = useState(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch("/data/masi.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setMarketData(data);
      })
      .catch(() => {
        // Pas grave — le site retombe sur la donnée statique de secours
      });
    return () => { cancelled = true; };
  }, []);

  // Palmarès en direct (mis à jour toutes les 15 min par un robot GitHub,
  // source casablancabourse.com — site tiers, cours parfois retardés)
  const [palmaresData, setPalmaresData] = useState(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch("/data/palmares.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setPalmaresData(data);
      })
      .catch(() => {
        // Pas grave — le site retombe sur le widget TradingView
      });
    return () => { cancelled = true; };
  }, []);

  // Top OPCVM en direct (mis à jour toutes les 15 min par un robot GitHub,
  // source API ASFIM)
  const [opcvmData, setOpcvmData] = useState(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch("/data/opcvm.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setOpcvmData(data);
      })
      .catch(() => {
        // Pas grave — le site retombe sur les données statiques de secours
      });
    return () => { cancelled = true; };
  }, []);

  // Capitalisation boursière (mise à jour manuelle, transmise par capture d'écran)
  const [capData, setCapData] = useState(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch("/data/capitalisation.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setCapData(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Séance boursière — tableau complet (mise à jour manuelle via fichier Excel)
  const [seanceBourseData, setSeanceBourseData] = useState(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch("/data/seance_bourse.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setSeanceBourseData(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Portefeuille
  const [holdings, setHoldings] = useState([]);
  const [ptfLoading, setPtfLoading] = useState(true);
  const [ptfError, setPtfError] = useState(null);
  const [formCode, setFormCode] = useState(stocksUniverse[0].code);
  const [formQte, setFormQte] = useState("");
  const [formPrix, setFormPrix] = useState("");
  const [formError, setFormError] = useState(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window === "undefined" || !window.storage) return;
        const res = await window.storage.get("portfolio:holdings", false);
        if (!cancelled && res && res.value) {
          setHoldings(JSON.parse(res.value));
        }
      } catch (e) {
        // Pas encore de portefeuille enregistré — état vide normal
      } finally {
        if (!cancelled) setPtfLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function saveHoldings(next) {
    setHoldings(next);
    if (typeof window === "undefined" || !window.storage) {
      setPtfError(null);
      return;
    }
    try {
      const res = await window.storage.set("portfolio:holdings", JSON.stringify(next), false);
      if (!res) setPtfError("La sauvegarde a échoué. Réessaie.");
      else setPtfError(null);
    } catch (e) {
      setPtfError("La sauvegarde a échoué. Réessaie.");
    }
  }

  function addHolding(e) {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const qte = parseFloat(String(formQte).replace(",", "."));
      const prix = parseFloat(String(formPrix).replace(",", "."));
      if (!qte || qte <= 0 || !prix || prix <= 0) {
        setFormError("Merci de renseigner une quantité et un prix d'achat valides (supérieurs à 0).");
        return;
      }
      setFormError(null);
      const stock = stocksUniverse.find((s) => s.code === formCode) || stocksUniverse[0];
      const next = [
        ...holdings,
        { id: `${Date.now()}`, code: stock.code, nom: stock.nom, quantite: qte, prixAchat: prix },
      ];
      saveHoldings(next);
      setFormQte("");
      setFormPrix("");
    } catch (err) {
      setFormError("Une erreur inattendue est survenue : " + (err && err.message ? err.message : String(err)));
    }
  }

  function removeHolding(id) {
    saveHoldings(holdings.filter((h) => h.id !== id));
  }

  const ptfRows = holdings.map((h) => {
    const stock = stocksUniverse.find((s) => s.code === h.code) || { cours: h.prixAchat };
    const valeur = stock.cours * h.quantite;
    const cout = h.prixAchat * h.quantite;
    const pv = valeur - cout;
    const pvPct = cout > 0 ? (pv / cout) * 100 : 0;
    return { ...h, cours: stock.cours, valeur, cout, pv, pvPct };
  });
  const ptfTotalValeur = ptfRows.reduce((s, r) => s + r.valeur, 0);
  const ptfTotalCout = ptfRows.reduce((s, r) => s + r.cout, 0);
  const ptfTotalPV = ptfTotalValeur - ptfTotalCout;
  const ptfTotalPVPct = ptfTotalCout > 0 ? (ptfTotalPV / ptfTotalCout) * 100 : 0;

  return (
    <div className={`sahm ${darkMode ? "dark" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .sahm {
          --ink: #1C242C;
          --ink-soft: #5B6773;
          --paper: #FAFAF9;
          --paper-raised: #FFFFFF;
          --navy: #2B3A4A;
          --navy-deep: #1F2A36;
          --gold: #7C8896;
          --gold-soft: #D8DBE0;
          --green: #2E7D5B;
          --green-soft: #E4F0EA;
          --red: #B4453D;
          --red-soft: #F5E7E5;
          --hairline: #DDE1E5;
          font-family: 'Inter', sans-serif;
          background: var(--paper);
          color: var(--ink);
          min-height: 100vh;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .sahm.dark {
          --ink: #EDEFF1;
          --ink-soft: #9DA8B2;
          --paper: #10151A;
          --paper-raised: #1A2129;
          --navy: #0D1217;
          --navy-deep: #090D11;
          --gold: #9AA6B0;
          --gold-soft: #2A333C;
          --green: #4CAF83;
          --green-soft: #16302A;
          --red: #E0776E;
          --red-soft: #331E1D;
          --hairline: #2A333C;
        }
        .sahm * { box-sizing: border-box; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .serif { font-family: 'Space Grotesk', sans-serif; }

        /* ---- Ticker ---- */
        .ticker-wrap {
          background: var(--navy-deep);
          overflow: hidden;
          white-space: nowrap;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .ticker-track {
          display: inline-block;
          padding: 7px 0;
          animation: scroll-left 32s linear infinite;
        }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-right: 34px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: #C9D6DB;
          letter-spacing: 0.02em;
        }
        .ticker-item .code { color: #fff; font-weight: 600; }
        .ticker-item .up { color: #7FCB9B; }
        .ticker-item .down { color: #E29999; }
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ---- Navbar ---- */
        .navbar {
          background: var(--paper-raised);
          border-bottom: 1px solid var(--hairline);
          padding: 14px 5vw;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 19px;
          color: var(--navy);
          white-space: nowrap;
        }
        .icon-badge {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: var(--navy);
          color: #EEF1F4;
          display: flex; align-items: center; justify-content: center;
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 700;
          font-size: 13px;
        }
        .nav-link {
          font-size: 14.5px;
          color: var(--ink-soft);
          font-weight: 500;
          text-decoration: none;
        }
        .nav-link.active { color: var(--navy); font-weight: 600; }
        .nav-search {
          flex: 1;
          max-width: 420px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--paper);
          border: 1px solid var(--hairline);
          border-radius: 24px;
          padding: 9px 16px;
          color: var(--ink-soft);
          font-size: 13.5px;
        }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .badge-new {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--navy);
          color: #EEF1F4;
          padding: 7px 14px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
        }
        .badge-new .pill-tag {
          background: var(--gold-soft);
          color: var(--navy);
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 10.5px;
          margin-right: 2px;
        }
        .icon-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--paper-raised);
          color: var(--ink-soft);
          border: 1px solid var(--hairline);
          cursor: pointer;
        }
        .account-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--hairline);
          border-radius: 24px;
          padding: 5px 14px 5px 5px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink);
          white-space: nowrap;
        }
        .account-pill .avatar {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: var(--gold-soft);
          color: var(--navy);
          display: flex; align-items: center; justify-content: center;
        }

        /* ---- Navigation mobile ---- */
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .nav-burger {
          display: none;
          width: 38px; height: 38px;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--hairline);
          border-radius: 8px;
          color: var(--navy);
          cursor: pointer;
        }
        .mobile-menu {
          display: none;
        }
        @media (max-width: 900px) {
          .nav-links-desktop,
          .nav-search-desktop,
          .nav-right-desktop {
            display: none;
          }
          .nav-burger { display: flex; }
          .navbar { padding: 12px 5vw; }
          .navbar-left { gap: 0; }
          .mobile-menu {
            display: flex;
            flex-direction: column;
            background: var(--paper-raised);
            border-bottom: 1px solid var(--hairline);
            padding: 16px 5vw 20px;
          }
          .mobile-link {
            padding: 13px 4px;
            font-size: 15px;
            font-weight: 500;
            color: var(--ink);
            text-decoration: none;
            border-bottom: 1px solid var(--hairline);
          }
          .mobile-link.active { color: var(--navy); font-weight: 700; }
          .mobile-menu-footer {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 16px;
          }
        }

        /* ---- Ticker (light) ---- */
        .ticker-wrap-light {
          background: var(--paper-raised);
          border-bottom: 1px solid var(--hairline);
          overflow: hidden;
          white-space: nowrap;
        }
        .ticker-item-light {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-right: 36px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
        }
        .ticker-avatar {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: var(--navy);
          color: #D8DBE0;
          font-size: 9px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .tl-code { color: var(--ink); font-weight: 600; }
        .tl-var.up { color: var(--green); }
        .tl-var.down { color: var(--red); }
        .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #E9A5A5;
        }

        /* ---- Hero ---- */
        .hero {
          background: linear-gradient(180deg, var(--navy) 0%, #1A2530 100%);
          color: #EEF1F4;
          padding: 56px 0 60px;
        }
        .hero-centered { text-align: center; }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.16);
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: #C9D6DB;
          margin-bottom: 30px;
        }
        .hero-badge.market-open {
          background: rgba(127,203,155,0.12);
          border-color: rgba(127,203,155,0.35);
          color: #8FDBB0;
        }
        .hero-badge.market-open .dot {
          background: #7FCB9B;
        }
        .hero-badge-time {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: #8DA0A8;
          padding-left: 6px;
          border-left: 1px solid rgba(255,255,255,0.15);
          margin-left: 2px;
        }
        .hero-title {
          font-size: clamp(32px, 4.6vw, 50px);
          font-weight: 600;
          line-height: 1.12;
          margin: 0 auto 16px;
          max-width: 780px;
          color: #EEF1F4;
        }
        .hero-subtitle {
          font-size: 16px;
          color: #A9BAC1;
          max-width: 560px;
          margin: 0 auto 46px;
        }
        .hero-stats-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0;
        }
        .hero-live-masi {
          max-width: 720px;
          margin: 34px auto 0;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 16px 18px 6px;
        }
        .hero-stat {
          padding: 0 34px;
          border-right: 1px solid rgba(255,255,255,0.14);
        }
        .hero-stat:last-child { border-right: none; }
        .hero-stat .value {
          font-size: 27px;
          font-weight: 600;
          color: #EEF1F4;
        }
        .hero-stat .label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #8DA0A8;
          margin-top: 8px;
        }
        @media (max-width: 640px) {
          .hero-stat { padding: 0 16px 16px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.14); }
        }

        /* ---- Layout ---- */
        .container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 5vw;
        }

        .variation {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .variation.lg { font-size: 17px; padding: 6px 14px; }
        .variation.md { font-size: 13px; }
        .variation.up { background: rgba(127,203,155,0.14); color: #8FDBB0; }
        .variation.down { background: rgba(226,153,153,0.14); color: #E9A5A5; }

        /* ---- Section shell ---- */
        .section {
          padding: 52px 0;
          border-bottom: 1px solid var(--hairline);
        }
        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 26px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 27px;
          font-weight: 600;
          color: var(--ink);
        }
        .section-note {
          font-size: 12.5px;
          color: var(--ink-soft);
          font-family: 'IBM Plex Mono', monospace;
        }

        /* ---- Palmares tables ---- */
        .palmares-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        @media (max-width: 780px) {
          .palmares-grid { grid-template-columns: 1fr; }
        }
        .palmares-card {
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 12px;
          overflow: hidden;
        }
        .palmares-head {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 1px solid var(--hairline);
        }
        .palmares-head.gain { color: var(--green); }
        .palmares-head.loss { color: var(--red); }
        table { width: 100%; border-collapse: collapse; }
        .palmares-card tr:not(:last-child) td {
          border-bottom: 1px solid var(--hairline);
        }
        .palmares-card td {
          padding: 12px 18px;
          font-size: 14px;
        }
        .stock-code {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          color: var(--ink);
        }
        .stock-nom {
          color: var(--ink-soft);
          font-size: 12.5px;
        }
        .stock-cours {
          font-family: 'IBM Plex Mono', monospace;
          color: var(--ink-soft);
          text-align: right;
        }

        /* ---- OPCVM ---- */
        .tabs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .tab-btn {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid var(--hairline);
          background: transparent;
          color: var(--ink-soft);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tab-btn.active {
          background: var(--navy);
          border-color: var(--navy);
          color: #EEF1F4;
        }
        .opcvm-card {
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 12px;
          overflow: hidden;
        }
        .opcvm-row-head td {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-soft);
          padding: 10px 18px;
          background: #EAEDEF;
        }
        .opcvm-card td {
          padding: 14px 18px;
          font-size: 14px;
          vertical-align: middle;
        }
        .opcvm-card tr:not(:last-child) td {
          border-bottom: 1px solid var(--hairline);
        }
        .fund-name { font-weight: 600; color: var(--ink); }
        .fund-gerant { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
        .fund-gerant.up { color: var(--green); }
        .fund-gerant.down { color: var(--red); }
        .opcvm-scroll {
          overflow-x: auto;
        }
        .opcvm-scroll table { min-width: 780px; }
        .cap-table-scroll {
          overflow-x: auto;
        }
        .cap-table-scroll table { width: 100%; }
        .perf-cell {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          text-align: right;
          white-space: nowrap;
        }
        .perf-cell.up { color: var(--green); }
        .perf-cell.down { color: var(--red); }
        .perf-cell.flat { color: #9CA4AC; }
        .ytd-value {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          text-align: right;
          white-space: nowrap;
        }
        .ytd-value.up { color: var(--green); }
        .ytd-value.down { color: var(--red); }

        .opcvm-footnote {
          margin-top: 14px;
          font-size: 12.5px;
          line-height: 1.6;
          color: var(--ink-soft);
          max-width: 760px;
        }

        /* ---- Nouvelles pages (Apprendre / Data) ---- */
        .page-shell {
          padding: 48px 0 60px;
        }
        .page-header {
          max-width: 720px;
          margin-bottom: 40px;
        }
        .eyebrow-mono {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 12px;
        }
        .page-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 600;
          color: var(--ink);
          margin: 0 0 12px;
        }
        .page-subtitle {
          font-size: 15.5px;
          color: var(--ink-soft);
          line-height: 1.6;
        }
        .page-footnote {
          margin-top: 28px;
          font-size: 12.5px;
          line-height: 1.6;
          color: var(--ink-soft);
          max-width: 760px;
        }

        .opcvm-search {
          width: 100%;
          max-width: 420px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          padding: 10px 16px;
          border: 1px solid var(--hairline);
          border-radius: 24px;
          background: var(--paper-raised);
          color: var(--ink);
        }
        .opcvm-search:focus {
          outline: none;
          border-color: var(--navy);
        }

        .opcvm-row-clickable {
          cursor: pointer;
        }
        .opcvm-row-clickable:hover {
          background: #EFF2F4;
        }

        .opcvm-back-link {
          display: inline-block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          color: var(--ink-soft);
          text-decoration: none;
        }
        .opcvm-back-link:hover { color: var(--navy); }

        .opcvm-detail-price {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          font-size: 26px;
          font-weight: 600;
          margin-top: 6px;
        }

        .opcvm-detail-facts {
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 12px;
          overflow: hidden;
        }
        .opcvm-detail-facts > div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 13px 18px;
          font-size: 13.5px;
          border-bottom: 1px solid var(--hairline);
        }
        .opcvm-detail-facts > div:last-child { border-bottom: none; }
        .opcvm-detail-facts > div > span:first-child {
          color: var(--ink-soft);
        }
        .opcvm-detail-facts > div > span:last-child {
          font-weight: 600;
          color: var(--ink);
          text-align: right;
        }

        .learn-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 780px) {
          .learn-grid { grid-template-columns: 1fr; }
        }
        .learn-card {
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 12px;
          padding: 22px 24px;
        }
        .learn-card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: var(--navy);
          margin: 0 0 10px;
        }
        .learn-card p {
          font-size: 14px;
          line-height: 1.65;
          color: var(--ink-soft);
          margin: 0;
        }

        .kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--hairline);
          border: 1px solid var(--hairline);
          border-radius: 10px;
          overflow: hidden;
        }
        @media (max-width: 700px) {
          .kpi-row { grid-template-columns: 1fr 1fr; }
        }
        .kpi-cell {
          background: var(--paper-raised);
          padding: 18px 20px;
        }
        .kpi-value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 24px;
          font-weight: 600;
          color: var(--navy);
        }
        .kpi-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-soft);
          margin-top: 6px;
        }

        .mini-head {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-soft);
          margin-bottom: 10px;
        }

        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        @media (max-width: 780px) {
          .two-col { grid-template-columns: 1fr; }
        }

        .cap-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cap-row {
          display: grid;
          grid-template-columns: 28px 220px 1fr 110px;
          align-items: center;
          gap: 16px;
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 10px;
          padding: 14px 18px;
        }
        @media (max-width: 700px) {
          .cap-row { grid-template-columns: 24px 1fr; grid-template-areas: "rank name" "bar bar" "val val"; }
          .cap-bar-track { grid-area: bar; }
          .cap-value { grid-area: val; text-align: left !important; }
        }
        .cap-rank {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 700;
          color: var(--gold);
          font-size: 15px;
        }
        .cap-bar-track {
          height: 8px;
          background: #E5E8EB;
          border-radius: 4px;
          overflow: hidden;
        }
        .cap-bar-fill {
          height: 100%;
          background: var(--navy);
          border-radius: 4px;
        }
        .cap-value {
          font-weight: 600;
          text-align: right;
          white-space: nowrap;
        }

        .official-table-card {
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 10px;
          overflow: hidden;
        }
        .official-table {
          width: 100%;
          border-collapse: collapse;
        }
        .official-table thead th {
          background: #EDF0F2;
          text-align: left;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--ink);
          padding: 14px 18px;
          white-space: nowrap;
          border-bottom: 1px solid var(--hairline);
        }
        .official-table tbody td {
          padding: 13px 18px;
          font-size: 13.5px;
          color: var(--ink);
          border-bottom: 1px solid #E7EAED;
          white-space: nowrap;
        }
        .official-table tbody tr:last-child td { border-bottom: none; }
        .official-table tbody tr:hover { background: var(--gold-soft); }
        .official-emetteur { color: #2E5E8C; font-weight: 500; }
        .official-table td.muted { color: var(--ink-soft); font-style: italic; }
        .type-badge {
          font-size: 11.5px;
          color: var(--ink-soft);
        }
        .type-badge.exceptionnel {
          color: var(--gold);
          font-weight: 600;
        }

        .chip-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          font-size: 12.5px;
          color: var(--ink-soft);
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 20px;
          padding: 6px 14px;
        }

        .ptf-form {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
          background: var(--paper-raised);
          border: 1px solid var(--hairline);
          border-radius: 12px;
          padding: 20px 22px;
        }
        .ptf-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ptf-field label {
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ink-soft);
        }
        .ptf-field select,
        .ptf-field input {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          padding: 9px 12px;
          border: 1px solid var(--hairline);
          border-radius: 8px;
          background: var(--paper-raised);
          color: var(--ink);
          min-width: 160px;
        }
        .ptf-field input {
          min-width: 140px;
        }
        .ptf-add-btn {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          background: var(--navy);
          color: #EEF1F4;
          border: none;
          border-radius: 8px;
          padding: 11px 22px;
          cursor: pointer;
        }
        .ptf-add-btn:hover { background: #1A2530; }
        .ptf-error {
          color: var(--red);
          font-size: 13px;
          margin-top: 10px;
        }
        .ptf-empty {
          margin-top: 28px;
          padding: 36px 24px;
          text-align: center;
          background: var(--paper-raised);
          border: 1px dashed var(--hairline);
          border-radius: 12px;
          color: var(--ink-soft);
          font-size: 14px;
        }
        .ptf-remove-btn {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          color: var(--ink-soft);
          background: transparent;
          border: 1px solid var(--hairline);
          border-radius: 14px;
          padding: 5px 12px;
          cursor: pointer;
        }
        .ptf-remove-btn:hover { color: var(--red); border-color: var(--red); }

        .tv-single-quote {
          min-width: 140px;
          max-width: 220px;
        }
        .tv-market-overview-wrap {
          width: 100%;
        }
        .tv-market-overview-wrap tv-market-overview {
          display: block;
          width: 100%;
        }

        /* ---- Footer ---- */
        .footer {
          padding: 28px 0 40px;
          text-align: center;
          font-size: 12px;
          color: var(--ink-soft);
        }

        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr; }
          .cap-grid { grid-template-columns: 1fr !important; }
          .compare-select-grid { grid-template-columns: 1fr !important; }
          .section-title { font-size: 20px; }
          .section-note { font-size: 11px; }
          .section { padding: 34px 0; }

          /* Hero */
          .hero { padding: 32px 0 36px; }
          .hero-badge { font-size: 12px; padding: 6px 14px; margin-bottom: 20px; }
          .hero-title { font-size: 26px; margin-bottom: 12px; }
          .hero-subtitle { font-size: 14px; margin-bottom: 30px; }
          .hero-stats-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px 0;
            width: 100%;
          }
          .hero-stat {
            padding: 0 8px 14px !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.14);
          }
          .hero-stat:nth-child(2n) { border-right: none; }
          .hero-stat .value { font-size: 20px; }
          .hero-live-masi { padding: 12px 12px 4px; margin-top: 24px; }

          /* Capitalisation globale : éviter le débordement du montant */
          .kpi-cell .kpi-value { word-break: break-word; }

          /* Table des meilleures capitalisations : tenir sur l'écran sans scroll horizontal */
          .cap-table-scroll .official-table th,
          .cap-table-scroll .official-table td {
            white-space: normal;
            padding: 11px 12px;
            font-size: 12.5px;
          }
        }

        @media (max-width: 420px) {
          .hero-title { font-size: 22px; }
          .kpi-cell .kpi-value { font-size: 20px !important; }
        }

        @media print {
          .navbar, .ticker-wrap-light, .mobile-menu, .footer, .nav-burger, .no-print,
          .hero-badge, .tabs { display: none !important; }
          .sahm { background: #fff !important; color: #000 !important; }
          .page-shell { padding-top: 0 !important; }
          .official-table-card, .opcvm-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          a { text-decoration: none !important; color: inherit !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="nav-logo">
            <span className="icon-badge">B</span>
            BourseInfo<span style={{ color: "var(--gold)" }}>.ma</span>
          </div>
          <div className="nav-links-desktop">
            <a className={`nav-link ${page === "accueil" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("accueil"); }}>Accueil</a>
            <a className={`nav-link ${page === "apprendre" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("apprendre"); }}>Apprendre sur la bourse</a>
            <a className={`nav-link ${page === "seance" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("seance"); }}>Séance Boursière</a>
            <a className={`nav-link ${page === "opcvm" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("opcvm"); }}>OPCVM</a>
            <a className={`nav-link ${page === "actions" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("actions"); }}>Actions</a>
            <a className={`nav-link ${page === "comparateur" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("comparateur"); }}>Comparateur</a>
            <a className={`nav-link ${page === "data" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("data"); }}>Calendrier Dividende</a>
            <a className={`nav-link ${page === "portefeuille" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("portefeuille"); }}>Mon Portefeuille</a>
          </div>
        </div>
        <div className="nav-search nav-search-desktop">
          <Search size={15} />
          Rechercher une entreprise...
        </div>
        <div className="navbar-right nav-right-desktop">
          <button className="icon-btn" onClick={() => setDarkMode((v) => !v)} aria-label="Basculer le mode sombre">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="icon-btn"><Settings size={16} /></button>
          <div className="account-pill">
            <span className="avatar"><User size={14} /></span>
            Mon Compte
          </div>
        </div>
        <button className="nav-burger" onClick={() => setMobileNavOpen((v) => !v)} aria-label="Menu">
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileNavOpen && (
        <div className="mobile-menu">
          <div className="nav-search" style={{ marginBottom: 14 }}>
            <Search size={15} />
            Rechercher une entreprise...
          </div>
          <a className={`mobile-link ${page === "accueil" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("accueil"); setMobileNavOpen(false); }}>Accueil</a>
          <a className={`mobile-link ${page === "apprendre" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("apprendre"); setMobileNavOpen(false); }}>Apprendre sur la bourse</a>
          <a className={`mobile-link ${page === "seance" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("seance"); setMobileNavOpen(false); }}>Séance Boursière</a>
          <a className={`mobile-link ${page === "opcvm" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("opcvm"); setMobileNavOpen(false); }}>OPCVM</a>
          <a className={`mobile-link ${page === "actions" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("actions"); setMobileNavOpen(false); }}>Actions</a>
          <a className={`mobile-link ${page === "comparateur" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("comparateur"); setMobileNavOpen(false); }}>Comparateur</a>
          <a className={`mobile-link ${page === "data" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("data"); setMobileNavOpen(false); }}>Calendrier Dividende</a>
          <a className={`mobile-link ${page === "portefeuille" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("portefeuille"); setMobileNavOpen(false); }}>Mon Portefeuille</a>
          <div className="mobile-menu-footer">
            <button className="icon-btn" onClick={() => setDarkMode((v) => !v)} aria-label="Basculer le mode sombre">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="icon-btn"><Settings size={16} /></button>
            <div className="account-pill">
              <span className="avatar"><User size={14} /></span>
              Mon Compte
            </div>
          </div>
        </div>
      )}

      {/* Ticker — données réelles en direct (TradingView), visible sur toutes les pages */}
      <TradingViewTickerTape />

      {page === "accueil" && (
      <>
      {/* Hero */}
      <section className="hero hero-centered">
        <div className="container">
          <div className={`hero-badge ${marketStatus.isOpen ? "market-open" : ""}`}>
            <span className="dot" />
            {marketStatus.isOpen ? "Marché Ouvert" : marketStatus.isHoliday ? "Jour férié — Marché Fermé" : "Marché Fermé"}
            <span className="hero-badge-time">{marketStatus.timeLabel}</span>
          </div>
          <h1 className="hero-title serif">Votre référence pour les marchés financiers marocains</h1>
          <p className="hero-subtitle">
            Suivez toutes les entreprises cotées à la Bourse de Casablanca en temps réel
          </p>
          <div className="hero-stats-row">
            <div className="hero-stat">
              <div className="value mono">18,8x</div>
              <div className="label">PER 2026E &middot; marché</div>
            </div>
            <div className="hero-stat">
              <div className="value mono">
                {marketData?.masi
                  ? <>{marketData.masi.value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ color: marketData.masi.change_pct >= 0 ? "#8FDBB0" : "#E9A5A5", fontSize: 15 }}>{marketData.masi.change_pct >= 0 ? "▲" : "▼"} {marketData.masi.change_pct >= 0 ? "+" : ""}{marketData.masi.change_pct.toFixed(2)}%</span></>
                  : <>{seanceIndices[0].valeur} <span style={{ color: seanceIndices[0].var >= 0 ? "#8FDBB0" : "#E9A5A5", fontSize: 15 }}>{seanceIndices[0].var >= 0 ? "▲" : "▼"} {seanceIndices[0].var >= 0 ? "+" : ""}{seanceIndices[0].var.toFixed(2)}%</span></>
                }
              </div>
              <div className="label">MASI</div>
            </div>
            <div className="hero-stat">
              <div className="value mono">{seanceStats.volumeCentral}</div>
              <div className="label">Volume (marché central)</div>
            </div>
            <div className="hero-stat">
              <div className="value mono">{seanceStats.capitalisation}</div>
              <div className="label">Capitalisation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Palmarès */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-title">Palmarès de la séance</div>
            <div className="section-note">
              {palmaresData?.source_last_update_label
                ? `Source : ${palmaresData.source_last_update_label}`
                : "Données en direct"}
            </div>
          </div>
          {palmaresData ? (
            <div className="palmares-grid">
              <div className="palmares-card">
                <div className="palmares-head gain">
                  <TrendingUp size={16} /> Plus fortes hausses
                </div>
                <table>
                  <tbody>
                    {palmaresData.top_hausses.map((s) => (
                      <tr key={s.name}>
                        <td className="stock-code">{s.name}</td>
                        <td className="stock-cours">{s.price.toLocaleString("fr-FR")} DH</td>
                        <td><Variation value={s.change_pct} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="palmares-card">
                <div className="palmares-head loss">
                  <TrendingDown size={16} /> Plus fortes baisses
                </div>
                <table>
                  <tbody>
                    {palmaresData.top_baisses.map((s) => (
                      <tr key={s.name}>
                        <td className="stock-code">{s.name}</td>
                        <td className="stock-cours">{s.price.toLocaleString("fr-FR")} DH</td>
                        <td><Variation value={s.change_pct} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="opcvm-card" style={{ padding: "12px 8px" }}>
              <TradingViewHotlist />
            </div>
          )}
        </div>
      </section>

      {/* Capitalisation boursière */}
      <section className="section">
        <div className="container">
          {!capData ? null : (
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28, alignItems: "start" }} className="cap-grid">
              <div>
                <div className="section-head">
                  <div className="section-title" style={{ fontSize: 20 }}>Dix meilleures capitalisations</div>
                </div>
                <div className="official-table-card">
                  <div className="cap-table-scroll">
                    <table className="official-table">
                      <thead>
                        <tr>
                          <th>Instrument</th>
                          <th style={{ textAlign: "right" }}>Capitalisation (MAD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {capData.top10.map((c) => (
                          <tr key={c.nom}>
                            <td className="official-emetteur">{c.nom}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.capitalisation.toLocaleString("fr-FR")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div>
                <div className="section-head">
                  <div className="section-title" style={{ fontSize: 20 }}>Capitalisation globale</div>
                </div>
                <div className="kpi-cell" style={{ background: "var(--gold)", borderRadius: 12, padding: "18px 20px", marginBottom: 28 }}>
                  <div className="kpi-value" style={{ color: "#fff", fontSize: 26 }}>{capData.global.toLocaleString("fr-FR")} MAD</div>
                </div>

                <div className="section-head">
                  <div className="section-title" style={{ fontSize: 20 }}>Capitalisation sectorielle</div>
                </div>
                <div className="opcvm-card" style={{ padding: 20 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={capData.secteurs}
                        dataKey="pct"
                        nameKey="nom"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {capData.secteurs.map((_, i) => (
                          <Cell key={i} fill={["#B4453D", "#3B6FA0", "#2E7D5B", "#7C8896", "#D8A23B"][i % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                    {capData.secteurs.map((s, i) => (
                      <div key={s.nom} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: ["#B4453D", "#3B6FA0", "#2E7D5B", "#7C8896", "#D8A23B"][i % 5], flexShrink: 0 }} />
                        <span style={{ color: "var(--ink)" }}>{s.nom}</span>
                        <span style={{ color: "var(--ink-soft)", marginLeft: "auto" }}>{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Marchés mondiaux */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-title">Marchés mondiaux</div>
            <div className="section-note">Données en direct</div>
          </div>
          <div className="opcvm-card" style={{ padding: "12px 8px" }}>
            <TradingViewMarketOverview />
          </div>
        </div>
      </section>

      {/* OPCVM */}
      <section className="section" style={{ borderBottom: "none" }}>
        <div className="container">
          <div className="section-head">
            <div className="section-title">Top 5 des OPCVM</div>
            <div className="section-note">Au {opcvmData?.source_date_label || opcvmSourceDate}</div>
          </div>

          <div className="tabs" style={{ marginBottom: 20 }}>
            {opcvmCategoryList.map((c) => (
              <button
                key={c}
                className={`tab-btn ${tab === c ? "active" : ""}`}
                onClick={() => setTab(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="opcvm-card">
            <div className="opcvm-scroll">
              <table>
                <tbody>
                  <tr className="opcvm-row-head">
                    <td>Nom de l'OPCVM</td>
                    <td style={{ textAlign: "right" }}>Valeur</td>
                    <td style={{ textAlign: "right" }}>1 mois</td>
                    <td style={{ textAlign: "right" }}>3 mois</td>
                    <td style={{ textAlign: "right" }}>6 mois</td>
                    <td style={{ textAlign: "right" }}>1 an</td>
                    <td style={{ textAlign: "right" }}>2 ans</td>
                    <td style={{ textAlign: "right" }}>5 ans</td>
                  </tr>
                  {(opcvmData?.categories?.[tab]?.slice(0, 5) || opcvmFunds[tab]).map((f) => (
                    <tr
                      key={f.code}
                      className="opcvm-row-clickable"
                      onClick={() => { setSelectedOpcvm(f); setPage("opcvm-detail"); }}
                    >
                      <td>
                        <div className="fund-name">{f.nom}</div>
                        <div className="fund-gerant">{f.code}</div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="mono" style={{ fontWeight: 600 }}>{f.valeur} MAD</div>
                        <div className={`fund-gerant ${f.jour >= 0 ? "up" : "down"}`}>
                          {f.jour >= 0 ? "+" : ""}{f.jour.toFixed(2)}%/jour
                        </div>
                      </td>
                      <PercentCell value={f.m1} />
                      <PercentCell value={f.m3} />
                      <PercentCell value={f.m6} />
                      <PercentCell value={f.a1} />
                      <PercentCell value={f.a2} />
                      <PercentCell value={f.a5} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="opcvm-footnote">
            Situation au {opcvmData?.source_date_label || opcvmSourceDate}. Performances passées, ne préjugent pas des performances
            futures.
          </p>
        </div>
      </section>

      </>
      )}

      {page === "apprendre" && (
        <section className="page-shell">
          <div className="container">
            <div className="page-header">
              <div className="eyebrow-mono">Éducation financière</div>
              <h1 className="page-title serif">Apprendre sur la bourse</h1>
              <p className="page-subtitle">
                Les bases pour comprendre le fonctionnement de la Bourse de Casablanca et le rôle
                de son régulateur, l'AMMC — pour investir en connaissance de cause.
              </p>
            </div>

            <div className="learn-grid">
              {learnCards.map((c) => (
                <div className="learn-card" key={c.title}>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>

            <p className="page-footnote">
              Contenu pédagogique général, ne constitue pas un conseil en investissement.
            </p>
          </div>
        </section>
      )}

      {page === "seance" && (
        <section className="page-shell">
          <div className="container">
            <div className="page-header">
              <div className="eyebrow-mono">Détail de séance</div>
              <h1 className="page-title serif">Séance Boursière</h1>
              <p className="page-subtitle">
                Compte-rendu détaillé de la dernière séance de cotation de la Bourse de Casablanca —
                {" "}{seanceDate}.
              </p>
            </div>

            <div className="kpi-row">
              {seanceIndices.map((idx) => (
                <div className="kpi-cell" key={idx.nom}>
                  <div className="kpi-value" style={{ color: idx.var >= 0 ? "var(--green)" : "var(--red)" }}>
                    {idx.valeur}
                  </div>
                  <div className="kpi-label">
                    {idx.nom} &middot; {idx.var >= 0 ? "+" : ""}{idx.var.toFixed(2)}%
                    {idx.ytd !== null && ` (YTD ${idx.ytd >= 0 ? "+" : ""}${idx.ytd.toFixed(2)}%)`}
                  </div>
                </div>
              ))}
              <div className="kpi-cell">
                <div className="kpi-value">{seanceStats.capitalisation}</div>
                <div className="kpi-label">Capitalisation boursière</div>
              </div>
            </div>

            <div className="section-head" style={{ marginTop: 40 }}>
              <div className="section-title" style={{ fontSize: 22 }}>Volume &amp; largeur de marché</div>
            </div>
            <div className="two-col" style={{ marginBottom: 36 }}>
              <div className="opcvm-card" style={{ padding: "18px 22px" }}>
                <div className="mini-head">Volume global des échanges</div>
                <div className="kpi-value" style={{ fontSize: 26, marginBottom: 10 }}>{seanceStats.volume}</div>
                <div className="fund-gerant">Marché central : {seanceStats.volumeCentral} &middot; Marché de blocs : {seanceStats.volumeBlocs}</div>
              </div>
              <div className="opcvm-card" style={{ padding: "18px 22px" }}>
                <div className="mini-head">Meilleure hausse / plus forte baisse</div>
                {(() => {
                  const meilleureHausse = palmaresData?.top_hausses?.[0];
                  const plusForteBaisse = palmaresData?.top_baisses?.[0];
                  if (!meilleureHausse || !plusForteBaisse) {
                    return <div className="fund-gerant" style={{ marginTop: 10 }}>Données indisponibles</div>;
                  }
                  return (
                    <div style={{ display: "flex", gap: 22, marginTop: 6 }}>
                      <div>
                        <div className="kpi-value" style={{ color: "var(--green)", fontSize: 20 }}>
                          {meilleureHausse.change_pct >= 0 ? "+" : ""}{meilleureHausse.change_pct.toFixed(2)}%
                        </div>
                        <div className="fund-gerant">{meilleureHausse.name}</div>
                      </div>
                      <div>
                        <div className="kpi-value" style={{ color: "var(--red)", fontSize: 20 }}>
                          {plusForteBaisse.change_pct >= 0 ? "+" : ""}{plusForteBaisse.change_pct.toFixed(2)}%
                        </div>
                        <div className="fund-gerant">{plusForteBaisse.name}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {seanceSecteurs && (
              <>
                <div className="section-head">
                  <div className="section-title" style={{ fontSize: 22 }}>Secteurs : meilleure et pire performance</div>
                </div>
                <div className="two-col" style={{ marginBottom: 36 }}>
                  <div className="opcvm-card" style={{ padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="fund-name">{seanceSecteurs.meilleur.nom}</div>
                      <div className="fund-gerant">Meilleur secteur de la séance</div>
                    </div>
                    <div className="ytd-value up">+{seanceSecteurs.meilleur.var.toFixed(2)}%</div>
                  </div>
                  <div className="opcvm-card" style={{ padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="fund-name">{seanceSecteurs.pire.nom}</div>
                      <div className="fund-gerant">Pire secteur de la séance</div>
                    </div>
                    <div className="ytd-value down">{seanceSecteurs.pire.var.toFixed(2)}%</div>
                  </div>
                </div>
              </>
            )}

            <div className="section-head">
              <div className="section-title" style={{ fontSize: 22 }}>Palmarès de la séance</div>
              <div className="section-note">
                {palmaresData?.source_last_update_label
                  ? `Source : ${palmaresData.source_last_update_label}`
                  : "Données en direct"}
              </div>
            </div>
            {palmaresData ? (
              <div className="palmares-grid" style={{ marginBottom: 36 }}>
                <div className="palmares-card">
                  <div className="palmares-head gain">
                    <TrendingUp size={16} /> Plus fortes hausses
                  </div>
                  <table>
                    <tbody>
                      {palmaresData.top_hausses.map((s) => (
                        <tr key={s.name}>
                          <td className="stock-code">{s.name}</td>
                          <td className="stock-cours">{s.price.toLocaleString("fr-FR")} DH</td>
                          <td><Variation value={s.change_pct} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="palmares-card">
                  <div className="palmares-head loss">
                    <TrendingDown size={16} /> Plus fortes baisses
                  </div>
                  <table>
                    <tbody>
                      {palmaresData.top_baisses.map((s) => (
                        <tr key={s.name}>
                          <td className="stock-code">{s.name}</td>
                          <td className="stock-cours">{s.price.toLocaleString("fr-FR")} DH</td>
                          <td><Variation value={s.change_pct} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="opcvm-card" style={{ padding: "12px 8px", marginBottom: 36 }}>
                <TradingViewHotlist />
              </div>
            )}

            <div className="section-head">
              <div className="section-title" style={{ fontSize: 22 }}>Toutes les valeurs cotées</div>
            </div>
            {!seanceBourseData ? (
              <p className="page-subtitle">Chargement…</p>
            ) : (
              <div className="opcvm-card" style={{ padding: "12px 8px" }}>
                <div className="opcvm-scroll">
                  <table className="official-table" style={{ minWidth: 1400 }}>
                    <thead>
                      <tr>
                        <th>Instrument</th>
                        <th style={{ textAlign: "right" }}>Cours réf.</th>
                        <th style={{ textAlign: "right" }}>Ouverture</th>
                        <th style={{ textAlign: "right" }}>Dernier cours</th>
                        <th style={{ textAlign: "right" }}>Quantité</th>
                        <th style={{ textAlign: "right" }}>Volume</th>
                        <th style={{ textAlign: "right" }}>Variation</th>
                        <th style={{ textAlign: "right" }}>+ haut</th>
                        <th style={{ textAlign: "right" }}>+ bas</th>
                        <th style={{ textAlign: "right" }}>Meilleur achat</th>
                        <th style={{ textAlign: "right" }}>Meilleur vente</th>
                        <th style={{ textAlign: "right" }}>Capitalisation</th>
                        <th style={{ textAlign: "right" }}>Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...seanceBourseData.companies].sort((a, b) => a.instrument.localeCompare(b.instrument, "fr")).map((c) => {
                        const isUp = typeof c.variation_pct === "string" && c.variation_pct.trim().startsWith("-") === false && !c.variation_pct.startsWith("0,00");
                        const isDown = typeof c.variation_pct === "string" && c.variation_pct.trim().startsWith("-");
                        return (
                          <tr key={c.instrument}>
                            <td className="official-emetteur">{c.instrument}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.cours_ref}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.ouverture}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.dernier_cours}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.quantite}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.volume}</td>
                            <td className="mono" style={{ textAlign: "right", color: isDown ? "var(--red)" : isUp ? "var(--green)" : "inherit", fontWeight: 600 }}>{c.variation_pct}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.haut}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.bas}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.meilleur_achat}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.meilleur_vente}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.capitalisation}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{c.nb_transactions}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {page === "actions-detail" && selectedAction && (
        <section className="page-shell">
          <div className="container">
            <a
              href="#"
              className="opcvm-back-link"
              onClick={(e) => { e.preventDefault(); setPage("actions"); }}
            >
              ← Retour à la liste des actions
            </a>

            <div className="page-header" style={{ marginTop: 18 }}>
              <div className="eyebrow-mono" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span>{selectedAction.secteur} &middot; {selectedAction.ticker}</span>
                <button
                  onClick={() => toggleFavori(selectedAction.ticker)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid var(--hairline)", borderRadius: 20, padding: "6px 14px", cursor: "pointer", color: "var(--ink)", fontSize: 13, fontFamily: "inherit" }}
                >
                  <Star size={14} color={favoris.includes(selectedAction.ticker) ? "var(--gold)" : "var(--ink-soft)"} fill={favoris.includes(selectedAction.ticker) ? "var(--gold)" : "none"} />
                  {favoris.includes(selectedAction.ticker) ? "Dans mes favoris" : "Ajouter aux favoris"}
                </button>
              </div>
              <h1 className="page-title serif">{selectedAction.nom}</h1>
              <div className="opcvm-detail-price">
                <span className="mono">
                  {selectedAction.prix != null ? `${selectedAction.prix.toLocaleString("fr-FR")} MAD` : "—"}
                </span>
                {selectedAction.variation_jour != null && <Variation value={selectedAction.variation_jour} size="lg" />}
              </div>
            </div>

            <div className="kpi-row" style={{ marginBottom: 32 }}>
              <div className="kpi-cell">
                <div className="kpi-value">
                  {selectedAction.capitalisation != null
                    ? `${(selectedAction.capitalisation / 1e9).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Mrd`
                    : "—"}
                </div>
                <div className="kpi-label">Capitalisation (MAD)</div>
              </div>
              <div className="kpi-cell">
                <div className="kpi-value">{selectedAction.per ?? "—"}</div>
                <div className="kpi-label">P/E Ratio</div>
              </div>
              <div className="kpi-cell">
                <div className="kpi-value">{selectedAction.rendement_dividende != null ? `${selectedAction.rendement_dividende}%` : "—"}</div>
                <div className="kpi-label">Rendement dividende</div>
              </div>
              <div className="kpi-cell">
                <div className="kpi-value">{selectedAction.classement != null ? `#${selectedAction.classement}` : "—"}</div>
                <div className="kpi-label">Classement (capitalisation)</div>
              </div>
            </div>

            <div className="section-head">
              <div className="section-title" style={{ fontSize: 20 }}>Évolution du cours</div>
            </div>
            <div className="opcvm-card" style={{ padding: 20, marginBottom: 32 }}>
              {historiqueCache[selectedAction.ticker] === undefined ? (
                <p className="fund-gerant" style={{ padding: "24px 4px" }}>Chargement de l'historique…</p>
              ) : historiqueCache[selectedAction.ticker] && historiqueCache[selectedAction.ticker].length > 1 ? (
                (() => {
                  const full = historiqueCache[selectedAction.ticker];
                  const ranges = { "3M": 90, "6M": 182, "1A": 365, "3A": 1095, "Tout": null };
                  const range = histRange in ranges ? histRange : "1A";
                  const lastDate = new Date(full[full.length - 1].date);
                  const data = ranges[range] == null
                    ? full
                    : full.filter((d) => (lastDate - new Date(d.date)) / 86400000 <= ranges[range]);
                  const tickEvery = Math.max(1, Math.floor(data.length / 6));
                  return (
                    <>
                      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                        {Object.keys(ranges).map((r) => (
                          <button
                            key={r}
                            onClick={() => setHistRange(r)}
                            style={{
                              fontSize: 12, padding: "5px 12px", borderRadius: 14,
                              border: "1px solid var(--hairline)",
                              background: range === r ? "var(--gold)" : "transparent",
                              color: range === r ? "#fff" : "var(--ink-soft)",
                              cursor: "pointer", fontFamily: "inherit",
                            }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={data}>
                          <CartesianGrid stroke="var(--hairline)" strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                            interval={tickEvery}
                            tickFormatter={(v) => {
                              const d = new Date(v);
                              return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
                            }}
                          />
                          <YAxis tick={{ fontSize: 11, fill: "var(--ink-soft)" }} domain={["auto", "auto"]} width={54} />
                          <Tooltip
                            formatter={(v) => [`${v.toLocaleString("fr-FR")} MAD`, "Cours"]}
                            labelFormatter={(v) => new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                          />
                          <Line type="monotone" dataKey="prix" stroke="var(--gold)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  );
                })()
              ) : (
                <p className="fund-gerant" style={{ padding: "24px 4px" }}>
                  Historique des cours pas encore disponible pour cette valeur. Il sera affiché ici dès que les données seront transmises.
                </p>
              )}
            </div>

            {selectedAction.description && (
              <p className="page-subtitle" style={{ marginBottom: 28, maxWidth: 760 }}>{selectedAction.description}</p>
            )}

            <div className="two-col" style={{ marginBottom: 32 }}>
              <div>
                <div className="section-head">
                  <div className="section-title" style={{ fontSize: 22 }}>Caractéristiques</div>
                </div>
                <div className="opcvm-detail-facts">
                  <div><span>Secteur</span><span>{selectedAction.secteur || "—"}</span></div>
                  <div><span>Ticker</span><span>{selectedAction.ticker || "—"}</span></div>
                  <div><span>Date IPO</span><span>{selectedAction.date_ipo || "—"}</span></div>
                  <div><span>Nombre d'actions</span><span>{selectedAction.nombre_actions != null ? selectedAction.nombre_actions.toLocaleString("fr-FR") : "—"}</span></div>
                  <div><span>Chiffre d'affaires</span><span>{selectedAction.chiffre_affaires != null ? `${(selectedAction.chiffre_affaires / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} MDH` : "—"}</span></div>
                  <div><span>Résultat net</span><span>{selectedAction.resultat_net != null ? `${(selectedAction.resultat_net / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} MDH` : "—"}</span></div>
                  <div><span>Marge opérationnelle</span><span>{selectedAction.marge_operationnelle != null ? `${selectedAction.marge_operationnelle}%` : "—"}</span></div>
                  <div><span>Marge nette</span><span>{selectedAction.marge_nette != null ? `${selectedAction.marge_nette}%` : "—"}</span></div>
                </div>
              </div>
              <div>
                <div className="section-head">
                  <div className="section-title" style={{ fontSize: 22 }}>Structure actionnariale</div>
                </div>
                {selectedAction.actionnariat && selectedAction.actionnariat.length > 0 ? (
                  <div className="opcvm-detail-facts">
                    {selectedAction.actionnariat.map((a) => (
                      <div key={a.nom}>
                        <span>{a.nom}</span>
                        <span>{a.pct != null ? `${a.pct}%` : "—"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="page-subtitle">Structure actionnariale non disponible pour cette valeur.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {page === "comparateur" && (
        <section className="page-shell">
          <div className="container">
            <div className="page-header">
              <div className="eyebrow-mono">Analyse comparative</div>
              <h1 className="page-title serif">Comparateur d'actions</h1>
              <p className="page-subtitle">
                Sélectionnez jusqu'à 3 sociétés pour comparer leurs principaux indicateurs côte à côte.
              </p>
            </div>

            {!actionsData ? (
              <p className="page-subtitle" style={{ marginTop: 16 }}>Chargement des données…</p>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }} className="compare-select-grid">
                  {[0, 1, 2].map((i) => (
                    <select
                      key={i}
                      value={compareTickers[i]}
                      onChange={(e) => {
                        const next = [...compareTickers];
                        next[i] = e.target.value;
                        setCompareTickers(next);
                      }}
                      style={{ fontSize: 14, padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 8, background: "var(--paper-raised)", color: "var(--ink)", fontFamily: "inherit" }}
                    >
                      <option value="">— Choisir une société {i + 1} —</option>
                      {actionsData.companies.map((c) => (
                        <option key={c.ticker} value={c.ticker}>{c.nom} ({c.ticker})</option>
                      ))}
                    </select>
                  ))}
                </div>

                {(() => {
                  const selected = compareTickers
                    .filter(Boolean)
                    .map((t) => actionsData.companies.find((c) => c.ticker === t))
                    .filter(Boolean);

                  if (selected.length < 2) {
                    return (
                      <p className="page-subtitle">Choisissez au moins 2 sociétés pour lancer la comparaison.</p>
                    );
                  }

                  const rows = [
                    { label: "Secteur", get: (c) => c.secteur || "—" },
                    { label: "Prix", get: (c) => (c.prix != null ? `${c.prix.toLocaleString("fr-FR")} MAD` : "—") },
                    { label: "Variation du jour", get: (c) => (c.variation_jour != null ? `${c.variation_jour >= 0 ? "+" : ""}${c.variation_jour.toFixed(2)}%` : "—"), color: (c) => (c.variation_jour >= 0 ? "var(--green)" : "var(--red)") },
                    { label: "Capitalisation", get: (c) => (c.capitalisation != null ? `${(c.capitalisation / 1e9).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Mrd MAD` : "—") },
                    { label: "P/E (PER)", get: (c) => c.per ?? "—" },
                    { label: "Rendement dividende", get: (c) => (c.rendement_dividende != null ? `${c.rendement_dividende}%` : "—") },
                    { label: "Chiffre d'affaires", get: (c) => (c.chiffre_affaires != null ? `${(c.chiffre_affaires / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} MDH` : "—") },
                    { label: "Résultat net", get: (c) => (c.resultat_net != null ? `${(c.resultat_net / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} MDH` : "—") },
                    { label: "Marge opérationnelle", get: (c) => (c.marge_operationnelle != null ? `${c.marge_operationnelle}%` : "—") },
                    { label: "Marge nette", get: (c) => (c.marge_nette != null ? `${c.marge_nette}%` : "—") },
                    { label: "Classement (capitalisation)", get: (c) => (c.classement != null ? `#${c.classement}` : "—") },
                    { label: "Date IPO", get: (c) => c.date_ipo || "—" },
                  ];

                  return (
                    <div className="official-table-card">
                      <div className="opcvm-scroll">
                        <table className="official-table">
                          <thead>
                            <tr>
                              <th>Indicateur</th>
                              {selected.map((c) => (
                                <th key={c.ticker} style={{ textAlign: "right" }}>{c.nom}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => (
                              <tr key={row.label}>
                                <td className="official-emetteur">{row.label}</td>
                                {selected.map((c) => (
                                  <td
                                    key={c.ticker}
                                    className="mono"
                                    style={{ textAlign: "right", color: row.color ? row.color(c) : undefined }}
                                  >
                                    {row.get(c)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </section>
      )}

      {page === "actions" && (
        <section className="page-shell">
          <div className="container">
            <div className="page-header">
              <div className="eyebrow-mono">Sociétés cotées</div>
              <h1 className="page-title serif">Actions de la Bourse de Casablanca</h1>
              <p className="page-subtitle">
                Les ~79 sociétés cotées, avec prix, capitalisation, P/E et rendement du dividende —
                données réelles, actualisées automatiquement une fois par jour.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                className="opcvm-search"
                placeholder="Rechercher une société par nom ou ticker..."
                value={actionsSearch}
                onChange={(e) => setActionsSearch(e.target.value)}
                style={{ flex: 1, minWidth: 220 }}
              />
              <button
                className={`tab-btn ${showFavorisOnly ? "active" : ""}`}
                onClick={() => setShowFavorisOnly((v) => !v)}
                style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
              >
                <Star size={14} fill={showFavorisOnly ? "currentColor" : "none"} />
                Favoris {favoris.length > 0 ? `(${favoris.length})` : ""}
              </button>
            </div>

            {!actionsData ? (
              <p className="page-subtitle" style={{ marginTop: 16 }}>Chargement des données…</p>
            ) : (
              <div className="opcvm-card" style={{ marginTop: 16 }}>
                <div className="opcvm-scroll">
                  <table>
                    <tbody>
                      <tr className="opcvm-row-head">
                        <td style={{ width: 34 }}></td>
                        <td>Société</td>
                        <td>Secteur</td>
                        <td style={{ textAlign: "right", cursor: "pointer" }} onClick={() => toggleActionsSort("prix")}>
                          Prix <ArrowUpDown size={11} style={{ verticalAlign: -1, opacity: actionsSortKey === "prix" ? 1 : 0.35 }} />
                        </td>
                        <td style={{ textAlign: "right", cursor: "pointer" }} onClick={() => toggleActionsSort("capitalisation")}>
                          Capitalisation <ArrowUpDown size={11} style={{ verticalAlign: -1, opacity: actionsSortKey === "capitalisation" ? 1 : 0.35 }} />
                        </td>
                        <td style={{ textAlign: "right", cursor: "pointer" }} onClick={() => toggleActionsSort("per")}>
                          P/E <ArrowUpDown size={11} style={{ verticalAlign: -1, opacity: actionsSortKey === "per" ? 1 : 0.35 }} />
                        </td>
                        <td style={{ textAlign: "right", cursor: "pointer" }} onClick={() => toggleActionsSort("rendement_dividende")}>
                          Dividende <ArrowUpDown size={11} style={{ verticalAlign: -1, opacity: actionsSortKey === "rendement_dividende" ? 1 : 0.35 }} />
                        </td>
                      </tr>
                      {actionsData.companies
                        .filter((c) => {
                          const q = actionsSearch.trim().toLowerCase();
                          if (q && !(c.nom.toLowerCase().includes(q) || (c.ticker || "").toLowerCase().includes(q))) return false;
                          if (showFavorisOnly && !favoris.includes(c.ticker)) return false;
                          return true;
                        })
                        .sort((a, b) => {
                          if (!actionsSortKey) return 0;
                          const av = a[actionsSortKey];
                          const bv = b[actionsSortKey];
                          if (av == null) return 1;
                          if (bv == null) return -1;
                          return actionsSortDir === "asc" ? av - bv : bv - av;
                        })
                        .map((c) => (
                          <tr
                            key={c.ticker}
                            className="opcvm-row-clickable"
                          >
                            <td onClick={(e) => { e.stopPropagation(); toggleFavori(c.ticker); }} style={{ cursor: "pointer", width: 34 }}>
                              <Star
                                size={16}
                                color={favoris.includes(c.ticker) ? "var(--gold)" : "var(--hairline)"}
                                fill={favoris.includes(c.ticker) ? "var(--gold)" : "none"}
                              />
                            </td>
                            <td onClick={() => { setSelectedAction(c); setPage("actions-detail"); }}>
                              <div className="fund-name">{c.nom}</div>
                              <div className="fund-gerant">{c.ticker}</div>
                            </td>
                            <td onClick={() => { setSelectedAction(c); setPage("actions-detail"); }} style={{ color: "var(--ink-soft)", fontSize: 13 }}>{c.secteur || "—"}</td>
                            <td onClick={() => { setSelectedAction(c); setPage("actions-detail"); }} className="mono" style={{ textAlign: "right", fontWeight: 600 }}>
                              {c.prix != null ? `${c.prix.toLocaleString("fr-FR")} MAD` : "—"}
                            </td>
                            <td onClick={() => { setSelectedAction(c); setPage("actions-detail"); }} className="mono" style={{ textAlign: "right", color: "var(--ink-soft)" }}>
                              {c.capitalisation != null ? `${(c.capitalisation / 1e9).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Mrd` : "—"}
                            </td>
                            <td onClick={() => { setSelectedAction(c); setPage("actions-detail"); }} className="mono" style={{ textAlign: "right", color: "var(--ink-soft)" }}>
                              {c.per ?? "—"}
                            </td>
                            <td onClick={() => { setSelectedAction(c); setPage("actions-detail"); }} className="mono" style={{ textAlign: "right", color: "var(--ink-soft)" }}>
                              {c.rendement_dividende != null ? `${c.rendement_dividende}%` : "—"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {page === "opcvm-detail" && selectedOpcvm && (
        <section className="page-shell">
          <div className="container">
            <a
              href="#"
              className="opcvm-back-link"
              onClick={(e) => { e.preventDefault(); setPage("opcvm"); }}
            >
              ← Retour à la liste des OPCVM
            </a>

            <div className="page-header" style={{ marginTop: 18 }}>
              <div className="eyebrow-mono">{selectedOpcvm.classification}</div>
              <h1 className="page-title serif">{selectedOpcvm.nom}</h1>
              <div className="opcvm-detail-price">
                <span className="mono">{selectedOpcvm.valeur} MAD</span>
                <Variation value={selectedOpcvm.jour} size="lg" />
                <span className="section-note">variation du jour</span>
              </div>
            </div>

            <div className="kpi-row" style={{ marginBottom: 32 }}>
              <div className="kpi-cell">
                <div className="kpi-value" style={{ color: (selectedOpcvm.ytd ?? 0) >= 0 ? "var(--green)" : "var(--red)" }}>
                  {(selectedOpcvm.ytd ?? 0) >= 0 ? "+" : ""}{(selectedOpcvm.ytd ?? 0).toFixed(2)}%
                </div>
                <div className="kpi-label">Depuis le 1er janvier (YTD)</div>
              </div>
              <div className="kpi-cell">
                <div className="kpi-value" style={{ color: (selectedOpcvm.a1 ?? 0) >= 0 ? "var(--green)" : "var(--red)" }}>
                  {(selectedOpcvm.a1 ?? 0) >= 0 ? "+" : ""}{(selectedOpcvm.a1 ?? 0).toFixed(2)}%
                </div>
                <div className="kpi-label">Performance sur 1 an</div>
              </div>
              <div className="kpi-cell">
                <div className="kpi-value">
                  {selectedOpcvm.encours != null ? selectedOpcvm.encours.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) : "—"}
                </div>
                <div className="kpi-label">Encours géré (MAD)</div>
              </div>
              <div className="kpi-cell">
                <div className="kpi-value">{(selectedOpcvm.fraisGestion ?? 0).toFixed(2)}%</div>
                <div className="kpi-label">Frais de gestion</div>
              </div>
            </div>

            <div className="section-head">
              <div className="section-title" style={{ fontSize: 22 }}>Performance par horizon</div>
            </div>
            <div className="opcvm-card" style={{ marginBottom: 32 }}>
              <div className="opcvm-scroll">
                <table>
                  <tbody>
                    <tr className="opcvm-row-head">
                      <td>Depuis janv.</td>
                      <td>1 jour</td>
                      <td>1 semaine</td>
                      <td>1 mois</td>
                      <td>3 mois</td>
                      <td>6 mois</td>
                      <td>1 an</td>
                      <td>2 ans</td>
                      <td>3 ans</td>
                      <td>5 ans</td>
                      <td>Depuis création</td>
                    </tr>
                    <tr>
                      <PercentCell value={selectedOpcvm.ytd} />
                      <PercentCell value={selectedOpcvm.jour} />
                      <PercentCell value={selectedOpcvm.semaine} />
                      <PercentCell value={selectedOpcvm.m1} />
                      <PercentCell value={selectedOpcvm.m3} />
                      <PercentCell value={selectedOpcvm.m6} />
                      <PercentCell value={selectedOpcvm.a1} />
                      <PercentCell value={selectedOpcvm.a2} />
                      <PercentCell value={selectedOpcvm.a3} />
                      <PercentCell value={selectedOpcvm.a5} />
                      <PercentCell value={selectedOpcvm.sinceCreated} />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="two-col" style={{ marginBottom: 32 }}>
              <div>
                <div className="section-head">
                  <div className="section-title" style={{ fontSize: 22 }}>Caractéristiques</div>
                </div>
                <div className="opcvm-detail-facts">
                  <div><span>Code ISIN</span><span>{selectedOpcvm.code || "—"}</span></div>
                  <div><span>Code Maroclear</span><span>{selectedOpcvm.codeMaroclear || "—"}</span></div>
                  <div><span>Nature juridique</span><span>{selectedOpcvm.natureJuridique || "—"}</span></div>
                  <div><span>Classification</span><span>{selectedOpcvm.classification || "—"}</span></div>
                  <div><span>Périodicité de VL</span><span>{selectedOpcvm.periodicite || "—"}</span></div>
                  <div><span>Affectation du résultat</span><span>{selectedOpcvm.affectationResultat || "—"}</span></div>
                  <div><span>Souscripteurs</span><span>{selectedOpcvm.souscripteur || "—"}</span></div>
                  <div><span>Profil investisseur</span><span>{selectedOpcvm.promoteur || "—"}</span></div>
                  <div><span>Indice de référence</span><span>{selectedOpcvm.benchmark || "—"}</span></div>
                  <div><span>Sensibilité (risque)</span><span>{selectedOpcvm.sensibilite || "—"}</span></div>
                  <div><span>Dépositaire</span><span>{selectedOpcvm.depositaire || "—"}</span></div>
                </div>
              </div>
              <div>
                <div className="section-head">
                  <div className="section-title" style={{ fontSize: 22 }}>Frais &amp; société de gestion</div>
                </div>
                <div className="opcvm-detail-facts">
                  <div><span>Droits d'entrée</span><span>{(selectedOpcvm.droitsEntree ?? 0).toFixed(2)}%</span></div>
                  <div><span>Droits de sortie</span><span>{(selectedOpcvm.droitsSortie ?? 0).toFixed(2)}%</span></div>
                  <div><span>Frais de gestion</span><span>{(selectedOpcvm.fraisGestion ?? 0).toFixed(2)}%</span></div>
                  <div><span>Société de gestion</span><span>{selectedOpcvm.societeGestion?.nom || "—"}</span></div>
                  <div><span>Directeur général</span><span>{selectedOpcvm.societeGestion?.directeur || "—"}</span></div>
                  <div><span>Téléphone</span><span>{selectedOpcvm.societeGestion?.telephone || "—"}</span></div>
                  <div><span>Adresse</span><span>{selectedOpcvm.societeGestion?.adresse || "—"}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {page === "opcvm" && (
        <section className="page-shell">
          <div className="container">
            <div className="page-header">
              <div className="eyebrow-mono">Fonds d'investissement</div>
              <h1 className="page-title serif">Performance de tous les OPCVM</h1>
              <p className="page-subtitle">
                L'ensemble des fonds marocains, par catégorie, avec leur performance sur plusieurs
                horizons — données réelles de l'ASFIM, actualisées automatiquement.
              </p>
            </div>

            <div className="section-head">
              <div className="section-note">
                {opcvmData?.source_date_label
                  ? `Situation au ${opcvmData.source_date_label}`
                  : "Chargement des données en direct…"}
              </div>
            </div>

            <div className="tabs" style={{ marginBottom: 16 }}>
              {opcvmCategoryList.map((c) => (
                <button
                  key={c}
                  className={`tab-btn ${opcvmPageTab === c ? "active" : ""}`}
                  onClick={() => setOpcvmPageTab(c)}
                >
                  {c}
                  {opcvmData?.categories?.[c] ? ` (${opcvmData.categories[c].length})` : ""}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="opcvm-search"
              placeholder="Rechercher un fonds par nom ou code ISIN..."
              value={opcvmSearch}
              onChange={(e) => setOpcvmSearch(e.target.value)}
            />

            {!opcvmData ? (
              <p className="page-subtitle">Chargement des données en direct…</p>
            ) : (
              <div className="opcvm-card" style={{ marginTop: 16 }}>
                <div className="opcvm-scroll">
                  <table>
                    <tbody>
                      <tr className="opcvm-row-head">
                        <td>Nom de l'OPCVM</td>
                        <td style={{ textAlign: "right" }}>Encours (MAD)</td>
                        <td style={{ textAlign: "right" }}>Valeur</td>
                        <td style={{ textAlign: "right" }}>Depuis janv.</td>
                        <td style={{ textAlign: "right" }}>1 jour</td>
                        <td style={{ textAlign: "right" }}>1 semaine</td>
                        <td style={{ textAlign: "right" }}>1 mois</td>
                        <td style={{ textAlign: "right" }}>3 mois</td>
                        <td style={{ textAlign: "right" }}>6 mois</td>
                        <td style={{ textAlign: "right" }}>1 an</td>
                        <td style={{ textAlign: "right" }}>2 ans</td>
                        <td style={{ textAlign: "right" }}>3 ans</td>
                        <td style={{ textAlign: "right" }}>5 ans</td>
                      </tr>
                      {(opcvmData.categories?.[opcvmPageTab] || [])
                        .filter((f) => {
                          const q = opcvmSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            f.nom.toLowerCase().includes(q) ||
                            (f.code || "").toLowerCase().includes(q)
                          );
                        })
                        .map((f) => (
                          <tr
                            key={f.code || f.nom}
                            className="opcvm-row-clickable"
                            onClick={() => { setSelectedOpcvm(f); setPage("opcvm-detail"); }}
                          >
                            <td>
                              <div className="fund-name">{f.nom}</div>
                              <div className="fund-gerant">{f.code}</div>
                            </td>
                            <td className="mono" style={{ textAlign: "right", color: "var(--ink-soft)" }}>
                              {f.encours != null ? f.encours.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) : "—"}
                            </td>
                            <td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>
                              {f.valeur} MAD
                            </td>
                            <PercentCell value={f.ytd} />
                            <PercentCell value={f.jour} />
                            <PercentCell value={f.semaine} />
                            <PercentCell value={f.m1} />
                            <PercentCell value={f.m3} />
                            <PercentCell value={f.m6} />
                            <PercentCell value={f.a1} />
                            <PercentCell value={f.a2} />
                            <PercentCell value={f.a3} />
                            <PercentCell value={f.a5} />
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {page === "data" && (
        <section className="page-shell">
          <div className="container">
            <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div className="eyebrow-mono">Données de marché</div>
                <h1 className="page-title serif">Calendrier Dividende</h1>
                <p className="page-subtitle">Calendrier des dividendes et capitalisation des sociétés cotées.</p>
              </div>
              <button className="tab-btn no-print" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                <Download size={14} /> Exporter en PDF
              </button>
            </div>

            <div className="tabs" style={{ marginBottom: 28 }}>
              <button
                className={`tab-btn ${dataTab === "dividendes" ? "active" : ""}`}
                onClick={() => setDataTab("dividendes")}
              >
                Calendrier de dividende
              </button>
            </div>

            {dataTab === "dividendes" && (
              <div>
                <div className="kpi-row">
                  <div className="kpi-cell">
                    <div className="kpi-value">{dividendStats.distributrices}</div>
                    <div className="kpi-label">Sociétés distributrices</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value">{dividendStats.sansDividende}</div>
                    <div className="kpi-label">Sans dividende</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value">{dividendStats.rendementMoyen}%</div>
                    <div className="kpi-label">Rendement moyen</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value">{dividendStats.cumul} DH</div>
                    <div className="kpi-label">Cumul DPA (82 sociétés)</div>
                  </div>
                </div>

                <div className="tabs" style={{ marginTop: 36, marginBottom: 0 }}>
                  {["2026", "2025", "2024"].map((y) => (
                    <button
                      key={y}
                      className={`tab-btn ${dividendYear === y ? "active" : ""}`}
                      onClick={() => setDividendYear(y)}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                <div className="section-head" style={{ marginTop: 20 }}>
                  <div className="section-title" style={{ fontSize: 22 }}>{dividendByYear[dividendYear].label}</div>
                  <div className="section-note">{dividendByYear[dividendYear].note} · {dividendByYear[dividendYear].data.length} lignes</div>
                </div>
                <div className="official-table-card">
                  <div className="opcvm-scroll">
                    <table className="official-table">
                      <thead>
                        <tr>
                          <th>Émetteur</th>
                          <th style={{ textAlign: "right" }}>Montant</th>
                          <th>Date de détachement</th>
                          <th>Date de paiement</th>
                          <th>Type Dividende</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dividendByYear[dividendYear].data.map((d, i) => (
                          <tr key={d.emetteur + i}>
                            <td className="official-emetteur">{d.emetteur}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{d.montant.toFixed(2)}</td>
                            <td className={d.detachement === "À confirmer" ? "muted" : ""}>{d.detachement}</td>
                            <td className={d.paiement === "À confirmer" ? "muted" : ""}>{d.paiement}</td>
                            <td>
                              <span className={`type-badge ${d.type === "Exceptionnel" ? "exceptionnel" : ""}`}>{d.type}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="page-footnote">
                  Calendrier 2025/2026. Les dates non confirmées le seront au fil des Assemblées
                  Générales. Montants en dirhams (DH) par action ; performances passées, ne
                  préjugent pas des performances futures.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {page === "portefeuille" && (
        <section className="page-shell">
          <div className="container">
            <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div className="eyebrow-mono">Simulateur</div>
                <h1 className="page-title serif">Gérer votre portefeuille en temps réel</h1>
                <p className="page-subtitle">
                  Ajoutez les valeurs qui composent votre portefeuille pour suivre sa valeur, votre
                  plus-value ou moins-value. Le calcul utilise un cours enregistré (mis à jour
                  manuellement), mais chaque ligne affiche aussi son <strong>cours en direct via
                  TradingView</strong> pour comparaison ; vos lignes sont enregistrées uniquement
                  dans votre navigateur, elles ne sont pas visibles par les autres visiteurs.
                </p>
              </div>
              <button className="tab-btn no-print" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                <Download size={14} /> Exporter en PDF
              </button>
            </div>

            <div className="ptf-form">
              <div className="ptf-field">
                <label>Valeur</label>
                <select value={formCode} onChange={(e) => setFormCode(e.target.value)}>
                  {stocksUniverse.map((s) => (
                    <option key={s.code} value={s.code}>{s.nom} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div className="ptf-field">
                <label>Quantité</label>
                <input
                  type="text" inputMode="numeric" placeholder="ex. 10"
                  value={formQte} onChange={(e) => setFormQte(e.target.value)}
                />
              </div>
              <div className="ptf-field">
                <label>Prix d'achat unitaire (MAD)</label>
                <input
                  type="text" inputMode="decimal" placeholder="ex. 105,00"
                  value={formPrix} onChange={(e) => setFormPrix(e.target.value)}
                />
              </div>
              <button type="button" className="ptf-add-btn" onClick={addHolding}>Ajouter à mon portefeuille</button>
            </div>
            {formError && <p className="ptf-error">{formError}</p>}
            {ptfError && <p className="ptf-error">{ptfError}</p>}

            {ptfLoading ? (
              <p className="page-subtitle">Chargement de votre portefeuille…</p>
            ) : ptfRows.length === 0 ? (
              <div className="ptf-empty">
                Votre portefeuille est vide pour le moment. Ajoutez une première valeur ci-dessus
                pour commencer à suivre sa performance.
              </div>
            ) : (
              <>
                <div className="kpi-row" style={{ margin: "32px 0 28px" }}>
                  <div className="kpi-cell">
                    <div className="kpi-value">{ptfTotalValeur.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} DH</div>
                    <div className="kpi-label">Valeur du portefeuille</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value">{ptfTotalCout.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} DH</div>
                    <div className="kpi-label">Coût total investi</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value" style={{ color: ptfTotalPV >= 0 ? "var(--green)" : "var(--red)" }}>
                      {ptfTotalPV >= 0 ? "+" : ""}{ptfTotalPV.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} DH
                    </div>
                    <div className="kpi-label">Plus/moins-value</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value" style={{ color: ptfTotalPVPct >= 0 ? "var(--green)" : "var(--red)" }}>
                      {ptfTotalPVPct >= 0 ? "+" : ""}{ptfTotalPVPct.toFixed(2)}%
                    </div>
                    <div className="kpi-label">Performance globale</div>
                  </div>
                </div>

                <div className="opcvm-card">
                  <div className="opcvm-scroll">
                    <table>
                      <tbody>
                        <tr className="opcvm-row-head">
                          <td>Valeur</td>
                          <td style={{ textAlign: "right" }}>Quantité</td>
                          <td style={{ textAlign: "right" }}>Prix d'achat</td>
                          <td style={{ textAlign: "right" }}>Cours enregistré</td>
                          <td style={{ minWidth: 150 }}>Cours en direct (TradingView)</td>
                          <td style={{ textAlign: "right" }}>Valeur actuelle</td>
                          <td style={{ textAlign: "right" }}>Plus/moins-value</td>
                          <td></td>
                        </tr>
                        {ptfRows.map((r) => (
                          <tr key={r.id}>
                            <td>
                              <div className="fund-name">{r.nom}</div>
                              <div className="fund-gerant">{r.code}</div>
                            </td>
                            <td className="mono" style={{ textAlign: "right" }}>{r.quantite}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{r.prixAchat.toFixed(2)} DH</td>
                            <td className="mono" style={{ textAlign: "right" }}>{r.cours.toFixed(2)} DH</td>
                            <td>
                              <TradingViewSingleQuote symbol={r.code} />
                            </td>
                            <td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>
                              {r.valeur.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} DH
                            </td>
                            <td className={`ytd-value ${r.pv >= 0 ? "up" : "down"}`} style={{ textAlign: "right" }}>
                              {r.pv >= 0 ? "+" : ""}{r.pv.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} DH
                              <div style={{ fontSize: 11.5, fontWeight: 400 }}>
                                {r.pvPct >= 0 ? "+" : ""}{r.pvPct.toFixed(2)}%
                              </div>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button className="ptf-remove-btn" onClick={() => removeHolding(r.id)}>Retirer</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            <p className="page-footnote">
              Simulateur à but pédagogique — le calcul de plus/moins-value se base sur un cours
              enregistré (pas un flux en continu, il ne bouge pas tout seul), tandis que la colonne
              "Cours en direct" reflète le vrai marché via TradingView. Vos données sont stockées
              localement pour cette session de navigation et ne sont partagées avec personne.
            </p>
          </div>
        </section>
      )}

      <footer className="footer">
        BourseInfo.ma — statut du marché calculé à partir des horaires réels de cotation (hors jours fériés marocains) &middot; non affilié à la Bourse de Casablanca
      </footer>
    </div>
  );
}
