import React, { useState } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Search, Bell, Settings, User, Menu, X } from "lucide-react";


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

// Top 5 des OPCVM par catégorie — données réelles publiées par OPCVM Today
// (source : opcvmtoday.com, situation au 2 juillet 2026)
const opcvmSourceDate = "2 juillet 2026";
const opcvmFunds = {
  Actions: [
    { nom: "STAFF ACTION", code: "MA0000035735", valeur: "4 478,88", jour: 1.35, m1: -0.77, m3: 7.72, m6: -1.74, a1: -1.41, a2: 41.34, a5: 70.48 },
    { nom: "CFG VALEURS", code: "MA0000035784", valeur: "680,12", jour: 1.12, m1: -0.89, m3: 5.85, m6: -3.46, a1: -4.79, a2: 33.08, a5: 41.75 },
    { nom: "HORIZON EPARGNE", code: "MA0000041709", valeur: "248,75", jour: 1.11, m1: -1.51, m3: 7.00, m6: 0.00, a1: 0.00, a2: 0.00, a5: 56.80 },
    { nom: "FCP OPTIMA PERFORMANCE", code: "MA0000039729", valeur: "949,60", jour: 1.10, m1: -0.67, m3: 7.59, m6: -1.62, a1: -4.54, a2: 0.00, a5: 0.00 },
    { nom: "CFG PERFORMANCE", code: "MA0000035743", valeur: "1 161,11", jour: 1.09, m1: -1.48, m3: 6.73, m6: -2.42, a1: -4.51, a2: 40.32, a5: 52.42 },
  ],
  "Diversifié": [
    { nom: "WG RENDEMENT", code: "MA0000042392", valeur: "166 465,43", jour: 1.76, m1: -2.51, m3: 11.28, m6: 7.75, a1: 16.15, a2: 34.33, a5: 48.96 },
    { nom: "FCP ALLOCATIONS", code: "MA0000040792", valeur: "1 899,75", jour: 0.85, m1: 0.24, m3: 0.52, m6: -1.59, a1: 0.23, a2: 7.21, a5: 13.23 },
    { nom: "ATTIJARI DIVERSIFIE", code: "MA0000030520", valeur: "760,33", jour: 0.68, m1: -2.05, m3: 7.98, m6: 5.87, a1: 0.00, a2: 0.00, a5: 33.69 },
    { nom: "CDM OPTIMUM", code: "MA0000030579", valeur: "6 950,97", jour: 0.64, m1: -1.36, m3: 6.17, m6: 1.50, a1: 1.69, a2: 25.99, a5: 31.91 },
    { nom: "CFG Diversifié", code: "MA0000039323", valeur: "1 196,35", jour: 0.64, m1: -0.71, m3: 4.50, m6: -2.65, a1: -0.86, a2: 10.07, a5: 0.00 },
  ],
  OMLT: [
    { nom: "FCP EMERGENCE OBLIRENDEMENT", code: "MA0000038200", valeur: "1 206,56", jour: 0.50, m1: 0.27, m3: 1.68, m6: -0.32, a1: 0.51, a2: 8.54, a5: 9.74 },
    { nom: "CAPITAL TRUST OBLIG PLUS", code: "MA0000038051", valeur: "1 334,29", jour: 0.27, m1: 0.71, m3: 2.52, m6: 2.29, a1: 3.68, a2: 12.06, a5: 19.37 },
    { nom: "EMERGENCE RENDEMENT PLUS", code: "MA0000042210", valeur: "1 117,14", jour: 0.21, m1: 0.33, m3: 1.92, m6: -0.62, a1: 0.01, a2: 8.89, a5: 8.85 },
    { nom: "CFG PROFIL PRUDENT", code: "MA0000038168", valeur: "1 176,75", jour: 0.11, m1: 0.31, m3: 1.21, m6: 0.07, a1: 0.58, a2: 7.75, a5: 10.85 },
    { nom: "FCP EMERGENCE OBLIHORIZON", code: "MA0000038770", valeur: "1 149,53", jour: 0.05, m1: 0.06, m3: 1.30, m6: -1.25, a1: -0.19, a2: 9.48, a5: 11.32 },
  ],
  OCT: [
    { nom: "FCP INSTITUTIONS", code: "MA0000040677", valeur: "1 761,06", jour: 0.02, m1: 0.19, m3: 0.62, m6: 1.05, a1: 2.10, a2: 4.73, a5: 12.53 },
    { nom: "OBLIDYNAMIC", code: "MA0000040180", valeur: "210,44", jour: 0.02, m1: 0.27, m3: 0.92, m6: 1.37, a1: 2.67, a2: 6.07, a5: 12.81 },
    { nom: "FCP EMERGENCE TRESOR PLUS", code: "MA0000038119", valeur: "1 209,48", jour: 0.02, m1: 0.18, m3: 0.62, m6: 1.04, a1: 2.01, a2: 5.03, a5: 11.48 },
    { nom: "CIMR MONETAIRE PLUS", code: "MA0000037558", valeur: "1 402,41", jour: 0.02, m1: 0.21, m3: 0.84, m6: 1.23, a1: 2.36, a2: 5.55, a5: 13.00 },
    { nom: "ATLAS OBLIGBANCAIRES", code: "MA0000042061", valeur: "125,17", jour: 0.02, m1: 0.22, m3: 0.88, m6: 1.36, a1: 2.59, a2: 6.06, a5: 14.25 },
  ],
  "Monétaire": [
    { nom: "FCP MONETAIRE DYNAMIQUE", code: "MA0000038945", valeur: "1 114,61", jour: 0.01, m1: 0.20, m3: 0.61, m6: 1.12, a1: 2.18, a2: 4.73, a5: 0.00 },
    { nom: "FCP LIQUIDITES", code: "MA0000040776", valeur: "3 423,16", jour: 0.01, m1: 0.20, m3: 0.64, m6: 1.18, a1: 2.30, a2: 5.00, a5: 11.96 },
    { nom: "CFG CASH SECURE", code: "MA0000037814", valeur: "1 252,37", jour: 0.01, m1: 0.18, m3: 0.57, m6: 1.11, a1: 2.14, a2: 4.95, a5: 12.04 },
    { nom: "FCP EMERGENCE TRESOR", code: "MA0000038127", valeur: "1 172,99", jour: 0.01, m1: 0.11, m3: 0.47, m6: 0.91, a1: 1.94, a2: 4.49, a5: 10.98 },
    { nom: "CDM MONETAIRE PLUS", code: "MA0000041303", valeur: "1 279,35", jour: 0.01, m1: 0.20, m3: 0.66, m6: 1.26, a1: 2.48, a2: 5.58, a5: 13.59 },
  ],
  Contractuel: [
    { nom: "CAPITAL IMTIYAZ GARANTI", code: "MA0000039497", valeur: "1 057,60", jour: 0.01, m1: 0.17, m3: 0.52, m6: 1.05, a1: 2.12, a2: 4.56, a5: 0.00 },
    { nom: "ATTIJARI CASH GARANTI", code: "MA0000042145", valeur: "1 087,63", jour: 0.01, m1: 0.16, m3: 0.48, m6: 0.98, a1: 1.98, a2: 4.29, a5: 0.00 },
    { nom: "UPLINE CAPITAL GARANTI", code: "MA0000037350", valeur: "13 194,52", jour: 0.01, m1: 0.16, m3: 0.51, m6: 1.01, a1: 2.05, a2: 4.42, a5: 10.68 },
    { nom: "HORIZON CAPITAL GARANTI", code: "MA0000041691", valeur: "142 505,25", jour: 0.01, m1: 0.15, m3: 0.46, m6: 0.95, a1: 1.95, a2: 4.23, a5: 10.33 },
    { nom: "FCP CKG GARANTI", code: "MA0000042228", valeur: "1 065,38", jour: 0.00, m1: 0.16, m3: 0.51, m6: 1.02, a1: 2.04, a2: 4.25, a5: 0.00 },
  ],
};
const opcvmCategoryList = Object.keys(opcvmFunds);

// Statut du marché — calculé à partir des horaires réels de cotation de la Bourse
// de Casablanca : séance continue du lundi au vendredi, 9h00–15h30, heure de Casablanca.
// (source : AMMC, "Modalités pratiques d'une séance boursière")
// Limite assumée : ne tient pas compte du calendrier des jours fériés marocains,
// qui n'est pas disponible via une source accessible automatiquement.
// Détail de la séance boursière — données réelles de clôture
// (source : Médias24 et Boursenews, relayant les chiffres officiels de la Bourse de
// Casablanca — le site casablanca-bourse.com bloquant l'accès automatisé, ces médias
// financiers qui reprennent ses publications officielles sont la source la plus fiable
// accessible) — séance du mardi 7 juillet 2026
const seanceDate = "mercredi 8 juillet 2026";
const seanceIndices = [
  { nom: "MASI", valeur: "18 055,63", var: -0.93, ytd: -4.2 },
  { nom: "MASI ESG", valeur: "1 287,00", var: -0.73, ytd: null },
  { nom: "MASI 20", valeur: "1 328,05", var: -1.0, ytd: -10.61 },
];
const seanceStats = {
  capitalisation: "1 037,05 MMDH",
  volume: "2,67 MMDH",
  volumeCentral: "108,80 MDH",
  volumeBlocs: "0 MDH (le solde provient de l'augmentation de capital de Sanlam Maroc, 2,56 MMDH)",
  hausses: 16,
  baisses: 43,
  inchangees: 10,
};
const seanceHausses = [
  { nom: "Sonasid", var: 3.06, cours: "1 989,00" },
  { nom: "Colorado", var: 2.44, cours: "79,90" },
  { nom: "Ciments du Maroc", var: 1.16, cours: "1 650,00" },
  { nom: "Auto Hall", var: 0.98, cours: "97,60" },
  { nom: "Salafin", var: 0.91, cours: "666,00" },
];
const seanceBaisses = [
  { nom: "Promopharm", var: -5.93, cours: "1 269,00" },
  { nom: "SMI", var: -4.77, cours: "5 966,00" },
  { nom: "Compagnie Minière de Touissit", var: -4.11, cours: "4 600,00" },
  { nom: "Managem", var: -3.96, cours: "12 822,00" },
  { nom: "Alliances", var: -3.78, cours: "522,00" },
];
const seancePlusActives = [
  { nom: "CIH Bank", volume: "15,63 MDH", var: null, cours: null },
  { nom: "Label'Vie", volume: "13,70 MDH", var: null, cours: null },
  { nom: "TGCC", volume: "12,38 MDH", var: null, cours: null },
  { nom: "Attijariwafa Bank", volume: "9,49 MDH", var: null, cours: null },
  { nom: "Akdital", volume: "7,65 MDH", var: null, cours: null },
];
const seanceSecteurs = {
  meilleur: { nom: "Industrie agricole", var: 0.6 },
  pire: { nom: "Ingénieries et biens d'équipement industriels", var: -2.75 },
};

function getCasablancaMarketStatus() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Casablanca",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const weekday = get("weekday");
  const hour = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);
  const minutesNow = hour * 60 + minute;

  const isWeekday = !["Sat", "Sun"].includes(weekday);
  const openTime = 9 * 60; // 09h00
  const closeTime = 15 * 60 + 30; // 15h30
  const isOpen = isWeekday && minutesNow >= openTime && minutesNow < closeTime;

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return { isOpen, timeLabel: `${hh}:${mm}` };
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
const dividendStats = { distributrices: 53, sansDividende: 29, rendementMoyen: 3.48, cumul: 2460, suivies: 82 };

const dividend2026 = [
  { emetteur: "AFRIQUIA GAZ", secteur: "Énergie", montant: 175.0, detachement: "24/03/2026", paiement: "02/04/2026", type: "Ordinaire" },
  { emetteur: "MAGHREB OXYGENE", secteur: "Matériaux", montant: 4.0, detachement: "24/03/2026", paiement: "02/04/2026", type: "Ordinaire" },
  { emetteur: "IMMORENTE INVEST", secteur: "Immobilier", montant: 1.0, detachement: "22/04/2026", paiement: "04/05/2026", type: "Ordinaire" },
  { emetteur: "AUTO NEJMA", secteur: "Distribution", montant: 176.0, detachement: "30/04/2026", paiement: "11/05/2026", type: "Ordinaire" },
  { emetteur: "AUTO HALL", secteur: "Distribution", montant: 2.0, detachement: "15/05/2026", paiement: "26/05/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE DES BOISSONS DU MAROC", secteur: "Agroalimentaire", montant: 107.0, detachement: "10/06/2026", paiement: "22/06/2026", type: "Ordinaire" },
  { emetteur: "SOCIETE DES BOISSONS DU MAROC", secteur: "Agroalimentaire", montant: 20.0, detachement: "10/06/2026", paiement: "22/06/2026", type: "Exceptionnel" },
  { emetteur: "CASH PLUS S.A", secteur: "Financement", montant: 9.73, detachement: "04/06/2026", paiement: "15/06/2026", type: "Ordinaire" },
  { emetteur: "CREDIT DU MAROC", secteur: "Banques", montant: 48.0, detachement: "04/06/2026", paiement: "15/06/2026", type: "Ordinaire" },
  { emetteur: "DELTA HOLDING", secteur: "Biens d'équipement", montant: 2.0, detachement: "13/07/2026", paiement: "22/07/2026", type: "Ordinaire" },
  { emetteur: "AGMA", secteur: "Assurances", montant: 310.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "WAFA ASSURANCE", secteur: "Assurances", montant: 150.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "SMI", secteur: "Matériaux", montant: 150.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "LABEL'VIE", secteur: "Distribution", montant: 120.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "ALUMINIUM DU MAROC", secteur: "Biens d'équipement", montant: 110.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "SANLAM MAROC", secteur: "Assurances", montant: 98.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "LAFARGEHOLCIM MAROC", secteur: "Matériaux", montant: 96.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "CIMENTS DU MAROC", secteur: "Matériaux", montant: 65.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "AFMA", secteur: "Assurances", montant: 62.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "EQDOM", secteur: "Financement", montant: 57.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "MANAGEM", secteur: "Matériaux", montant: 55.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "MAGHREBAIL", secteur: "Immobilier", montant: 53.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "SONASID", secteur: "Matériaux", montant: 52.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "DISWAY", secteur: "Technologie", montant: 44.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "OULMES", secteur: "Agroalimentaire", montant: 40.15, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "MICRODATA", secteur: "Logiciels", montant: 40.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "TAQA MOROCCO", secteur: "Utilities", montant: 38.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "SOTHEMA", secteur: "Pharmaceutiques", montant: 33.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "SALAFIN", secteur: "Financement", montant: 30.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "PROMOPHARM", secteur: "Pharmaceutiques", montant: 30.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "CTM", secteur: "Transport", montant: 26.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "ARADEI CAPITAL", secteur: "Immobilier", montant: 23.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "ATTIJARIWAFA BANK", secteur: "Banques", montant: 22.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "AFRIC INDUSTRIES", secteur: "Biens d'équipement", montant: 20.0, detachement: "À confirmer", paiement: "30/06/2026", type: "Ordinaire" },
  { emetteur: "DISTY TECHNOLOGIES", secteur: "Technologie", montant: 20.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "JET CONTRACTORS", secteur: "Biens d'équipement", montant: 20.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "TGCC", secteur: "Biens d'équipement", montant: 15.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "CIH BANK", secteur: "Banques", montant: 14.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "AKDITAL", secteur: "Santé", montant: 14.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "SGTM", secteur: "Biens d'équipement", montant: 12.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "MARSA MAROC", secteur: "Transport", montant: 11.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "MUTANDIS", secteur: "Agroalimentaire", montant: 10.5, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "COSUMAR", secteur: "Agroalimentaire", montant: 10.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "RISMA", secteur: "Services", montant: 9.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "VICENNE", secteur: "Santé", montant: 8.44, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "HPS", secteur: "Logiciels", montant: 8.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "CMGP GROUP", secteur: "Agriculture", montant: 6.5, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "ATLANTA SANAD", secteur: "Assurances", montant: 5.9, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "BANK OF AFRICA", secteur: "Banques", montant: 5.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "MAROC TELECOM", secteur: "Télécommunications", montant: 4.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "CFG BANK", secteur: "Banques", montant: 4.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "ALLIANCES", secteur: "Immobilier", montant: 4.0, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "COLORADO", secteur: "Matériaux", montant: 3.5, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
  { emetteur: "ENNAKL", secteur: "Distributeurs", montant: 3.15, detachement: "À confirmer", paiement: "À confirmer", type: "Ordinaire" },
];

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
  { code: "SNA", nom: "Snep", cours: 348.0 },
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
  const cls = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const sign = value > 0 ? "+" : "";
  return <td className={`perf-cell ${cls}`}>{sign}{value.toFixed(2)}%</td>;
}

export default function Sahm() {
  const [tab, setTab] = useState(opcvmCategoryList[0]);
  const [page, setPage] = useState("accueil");
  const [dataTab, setDataTab] = useState("dividendes");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [marketStatus, setMarketStatus] = useState(() => getCasablancaMarketStatus());

  React.useEffect(() => {
    const id = setInterval(() => setMarketStatus(getCasablancaMarketStatus()), 30000);
    return () => clearInterval(id);
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
    <div className="sahm">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,600;1,6..72,500&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .sahm {
          --ink: #14262F;
          --ink-soft: #4C6470;
          --paper: #F6F4EE;
          --paper-raised: #FFFFFF;
          --navy: #0D2B3A;
          --navy-deep: #081C27;
          --gold: #B08D3F;
          --gold-soft: #E4D3A6;
          --green: #1E7145;
          --green-soft: #E5F0E8;
          --red: #A83A3A;
          --red-soft: #F5E7E5;
          --hairline: #DAD4C4;
          font-family: 'IBM Plex Sans', sans-serif;
          background: var(--paper);
          color: var(--ink);
          min-height: 100vh;
        }
        .sahm * { box-sizing: border-box; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .serif { font-family: 'Newsreader', serif; }

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
          background: #fff;
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
          font-family: 'Newsreader', serif;
          font-weight: 600;
          font-size: 19px;
          color: var(--navy);
          white-space: nowrap;
        }
        .icon-badge {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: var(--navy);
          color: #F3EFE3;
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
          color: #F3EFE3;
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
          background: #fff;
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
            background: #fff;
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
          background: #fff;
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
          color: #E4D3A6;
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
          background: linear-gradient(180deg, var(--navy) 0%, #123245 100%);
          color: #F3EFE3;
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
          color: #F8F5EC;
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
        .hero-stat {
          padding: 0 34px;
          border-right: 1px solid rgba(255,255,255,0.14);
        }
        .hero-stat:last-child { border-right: none; }
        .hero-stat .value {
          font-size: 27px;
          font-weight: 600;
          color: #F8F5EC;
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
          font-family: 'Newsreader', serif;
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
          color: #F3EFE3;
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
          background: #F0EDE3;
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
        .perf-cell {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          text-align: right;
          white-space: nowrap;
        }
        .perf-cell.up { color: var(--green); }
        .perf-cell.down { color: var(--red); }
        .perf-cell.flat { color: #B7B0A0; }
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
          font-family: 'Newsreader', serif;
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
          background: #EAE6D8;
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
          background: #fff;
          border: 1px solid var(--hairline);
          border-radius: 10px;
          overflow: hidden;
        }
        .official-table {
          width: 100%;
          border-collapse: collapse;
        }
        .official-table thead th {
          background: #F3F1EA;
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
          border-bottom: 1px solid #EFEBE0;
          white-space: nowrap;
        }
        .official-table tbody tr:last-child td { border-bottom: none; }
        .official-table tbody tr:hover { background: #FAF8F2; }
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
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          padding: 9px 12px;
          border: 1px solid var(--hairline);
          border-radius: 8px;
          background: #fff;
          color: var(--ink);
          min-width: 160px;
        }
        .ptf-field input {
          min-width: 140px;
        }
        .ptf-add-btn {
          font-family: 'IBM Plex Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          background: var(--navy);
          color: #F3EFE3;
          border: none;
          border-radius: 8px;
          padding: 11px 22px;
          cursor: pointer;
        }
        .ptf-add-btn:hover { background: #123245; }
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

        /* ---- Footer ---- */
        .footer {
          padding: 28px 0 40px;
          text-align: center;
          font-size: 12px;
          color: var(--ink-soft);
        }

        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr; }
          .section-title { font-size: 22px; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="nav-logo">
            <span className="icon-badge">S</span>
            sahm<span style={{ color: "var(--gold)" }}>.ma</span>
          </div>
          <div className="nav-links-desktop">
            <a className={`nav-link ${page === "accueil" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("accueil"); }}>Accueil</a>
            <a className={`nav-link ${page === "apprendre" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("apprendre"); }}>Apprendre sur la bourse</a>
            <a className={`nav-link ${page === "seance" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("seance"); }}>Séance Boursière</a>
            <a className={`nav-link ${page === "data" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("data"); }}>Data</a>
            <a className={`nav-link ${page === "portefeuille" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("portefeuille"); }}>Mon Portefeuille</a>
          </div>
        </div>
        <div className="nav-search nav-search-desktop">
          <Search size={15} />
          Rechercher une entreprise...
        </div>
        <div className="navbar-right nav-right-desktop">
          <div className="badge-new">
            <span className="pill-tag">NOUVEAU</span>
            <Bell size={13} />
            T2S IPO
          </div>
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
          <a className={`mobile-link ${page === "data" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("data"); setMobileNavOpen(false); }}>Data</a>
          <a className={`mobile-link ${page === "portefeuille" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); setPage("portefeuille"); setMobileNavOpen(false); }}>Mon Portefeuille</a>
          <div className="mobile-menu-footer">
            <button className="icon-btn"><Settings size={16} /></button>
            <div className="account-pill">
              <span className="avatar"><User size={14} /></span>
              Mon Compte
            </div>
          </div>
        </div>
      )}

      {/* Ticker — reste visible sur toutes les pages */}
      <div className="ticker-wrap-light">
        <div className="ticker-track">
          {[...ticker, ...ticker].map((t, i) => (
            <span className="ticker-item-light" key={i}>
              <span className="ticker-avatar">{t.code.slice(0, 2)}</span>
              <span className="tl-code">{t.code}</span>
              <span className={`tl-var ${t.var >= 0 ? "up" : "down"}`}>
                {t.var >= 0 ? "+" : ""}{t.var.toFixed(1)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {page === "accueil" && (
      <>
      {/* Hero */}
      <section className="hero hero-centered">
        <div className="container">
          <div className={`hero-badge ${marketStatus.isOpen ? "market-open" : ""}`}>
            <span className="dot" />
            {marketStatus.isOpen ? "Marché Ouvert" : "Marché Fermé"}
            <span className="hero-badge-time">{marketStatus.timeLabel}</span>
          </div>
          <h1 className="hero-title serif">Votre référence pour les marchés financiers marocains</h1>
          <p className="hero-subtitle">
            Suivez toutes les entreprises cotées à la Bourse de Casablanca en temps réel
          </p>
          <div className="hero-stats-row">
            <div className="hero-stat">
              <div className="value mono">19,40</div>
              <div className="label">P/E 2025 &middot; 17,85 P/E 2026E</div>
            </div>
            <div className="hero-stat">
              <div className="value mono">
                14 528 <span style={{ color: "#8FDBB0", fontSize: 15 }}>▲ +0,82%</span>
              </div>
              <div className="label">MASI</div>
            </div>
            <div className="hero-stat">
              <div className="value mono">312,4K</div>
              <div className="label">Volume total</div>
            </div>
            <div className="hero-stat">
              <div className="value mono">892,3 Mrd</div>
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
            <div className="section-note">Variation en %</div>
          </div>
          <div className="palmares-grid">
            <div className="palmares-card">
              <div className="palmares-head gain">
                <TrendingUp size={16} /> Plus fortes hausses
              </div>
              <table>
                <tbody>
                  {hausses.map((s) => (
                    <tr key={s.code}>
                      <td>
                        <div className="stock-code">{s.code}</div>
                        <div className="stock-nom">{s.nom}</div>
                      </td>
                      <td><Variation value={s.var} /></td>
                      <td className="stock-cours">{s.cours} MAD</td>
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
                  {baisses.map((s) => (
                    <tr key={s.code}>
                      <td>
                        <div className="stock-code">{s.code}</div>
                        <div className="stock-nom">{s.nom}</div>
                      </td>
                      <td><Variation value={s.var} /></td>
                      <td className="stock-cours">{s.cours} MAD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Marchés mondiaux */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-title">Marchés mondiaux</div>
            <div className="section-note">Source : investing.com &middot; {globalIndicesDate}</div>
          </div>
          <div className="two-col">
            <div>
              <div className="mini-head">Principaux indices boursiers</div>
              <div className="opcvm-card">
                <table>
                  <tbody>
                    <tr className="opcvm-row-head">
                      <td>Indice</td>
                      <td style={{ textAlign: "right" }}>Valeur</td>
                      <td style={{ textAlign: "right" }}>Var.</td>
                    </tr>
                    {globalIndices.map((idx) => (
                      <tr key={idx.nom}>
                        <td>
                          <div className="fund-name">{idx.nom}</div>
                          <div className="fund-gerant">{idx.pays}</div>
                        </td>
                        <td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>{idx.valeur}</td>
                        <td className={`ytd-value ${idx.var >= 0 ? "up" : "down"}`}>
                          {idx.var >= 0 ? "+" : ""}{idx.var.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="mini-head">Principales matières premières</div>
              <div className="opcvm-card">
                <table>
                  <tbody>
                    <tr className="opcvm-row-head">
                      <td>Matière première</td>
                      <td style={{ textAlign: "right" }}>Valeur</td>
                      <td style={{ textAlign: "right" }}>Var.</td>
                    </tr>
                    {commodities.map((c) => (
                      <tr key={c.nom}>
                        <td>
                          <div className="fund-name">{c.nom}</div>
                          <div className="fund-gerant">{c.unite}</div>
                        </td>
                        <td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>{c.valeur}</td>
                        <td className={`ytd-value ${c.var >= 0 ? "up" : "down"}`}>
                          {c.var >= 0 ? "+" : ""}{c.var.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p className="page-footnote">
            Données réelles — source : investing.com. Il s'agit d'un instantané figé au moment de la
            rédaction ; les cours des marchés internationaux évoluent en continu pendant les heures
            d'ouverture de chaque place.
          </p>
        </div>
      </section>

      {/* OPCVM */}
      <section className="section" style={{ borderBottom: "none" }}>
        <div className="container">
          <div className="section-head">
            <div className="section-title">Top 5 des OPCVM</div>
            <div className="section-note">Au {opcvmSourceDate}</div>
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
                  {opcvmFunds[tab].map((f) => (
                    <tr key={f.code}>
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
            Données réelles — source : OPCVM Today (opcvmtoday.com), situation au {opcvmSourceDate}.
            Performances passées, ne préjugent pas des performances futures.
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
              Contenu synthétisé à partir des sites de la Bourse de Casablanca (casablanca-bourse.com)
              et de l'Autorité Marocaine du Marché des Capitaux (ammc.ma). Ceci est un contenu
              pédagogique général et ne constitue pas un conseil en investissement.
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
                <div className="mini-head">Valeurs en hausse / baisse / stables</div>
                <div style={{ display: "flex", gap: 22, marginTop: 6 }}>
                  <div>
                    <div className="kpi-value" style={{ color: "var(--green)", fontSize: 24 }}>{seanceStats.hausses}</div>
                    <div className="fund-gerant">en hausse</div>
                  </div>
                  <div>
                    <div className="kpi-value" style={{ color: "var(--red)", fontSize: 24 }}>{seanceStats.baisses}</div>
                    <div className="fund-gerant">en baisse</div>
                  </div>
                  <div>
                    <div className="kpi-value" style={{ color: "var(--ink-soft)", fontSize: 24 }}>{seanceStats.inchangees}</div>
                    <div className="fund-gerant">inchangées</div>
                  </div>
                </div>
              </div>
            </div>

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

            <div className="section-head">
              <div className="section-title" style={{ fontSize: 22 }}>Palmarès de la séance</div>
            </div>
            <div className="palmares-grid" style={{ marginBottom: 36 }}>
              <div className="palmares-card">
                <div className="palmares-head gain">
                  <TrendingUp size={16} /> Plus fortes hausses
                </div>
                <table>
                  <tbody>
                    {seanceHausses.map((s) => (
                      <tr key={s.nom}>
                        <td><div className="stock-code">{s.nom}</div></td>
                        <td><Variation value={s.var} /></td>
                        <td className="stock-cours">{s.cours} MAD</td>
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
                    {seanceBaisses.map((s) => (
                      <tr key={s.nom}>
                        <td><div className="stock-code">{s.nom}</div></td>
                        <td><Variation value={s.var} /></td>
                        <td className="stock-cours">{s.cours} MAD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="section-head">
              <div className="section-title" style={{ fontSize: 22 }}>Valeurs les plus actives (par volume)</div>
            </div>
            <div className="opcvm-card">
              <table>
                <tbody>
                  <tr className="opcvm-row-head">
                    <td>Société</td>
                    <td style={{ textAlign: "right" }}>Volume échangé</td>
                    <td style={{ textAlign: "right" }}>Cours</td>
                    <td style={{ textAlign: "right" }}>Variation</td>
                  </tr>
                  {seancePlusActives.map((s) => (
                    <tr key={s.nom}>
                      <td className="fund-name">{s.nom}</td>
                      <td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>{s.volume}</td>
                      <td className="mono" style={{ textAlign: "right", color: "var(--ink-soft)" }}>
                        {s.cours ? `${s.cours} DH` : "—"}
                      </td>
                      <td className={`perf-cell ${s.var == null ? "flat" : s.var >= 0 ? "up" : "down"}`} style={{ textAlign: "right" }}>
                        {s.var == null ? "—" : `${s.var >= 0 ? "+" : ""}${s.var.toFixed(2)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="page-footnote">
              Données réelles de clôture — séance du {seanceDate}. Le site officiel casablanca-bourse.com
              bloque l'accès automatisé ; ces chiffres proviennent donc de Médias24 et Boursenews, deux
              médias économiques marocains qui relaient les publications officielles de clôture de la
              Bourse de Casablanca. Cette page reflète la dernière séance disponible au moment de sa
              création, pas un flux en temps réel.
            </p>
          </div>
        </section>
      )}

      {page === "data" && (
        <section className="page-shell">
          <div className="container">
            <div className="page-header">
              <div className="eyebrow-mono">Données de marché</div>
              <h1 className="page-title serif">Data</h1>
              <p className="page-subtitle">Calendrier des dividendes et capitalisation des sociétés cotées.</p>
            </div>

            <div className="tabs" style={{ marginBottom: 28 }}>
              <button
                className={`tab-btn ${dataTab === "dividendes" ? "active" : ""}`}
                onClick={() => setDataTab("dividendes")}
              >
                Calendrier de dividende
              </button>
              <button
                className={`tab-btn ${dataTab === "capitalisation" ? "active" : ""}`}
                onClick={() => setDataTab("capitalisation")}
              >
                Capitalisation
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

                <div className="section-head" style={{ marginTop: 36 }}>
                  <div className="section-title" style={{ fontSize: 22 }}>Calendrier des dividendes 2025</div>
                  <div className="section-note">Exercice 2025 · versements en 2026 · {dividend2026.length} lignes</div>
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
                        {dividend2026.map((d, i) => (
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

                <div className="section-head" style={{ marginTop: 36 }}>
                  <div className="section-title" style={{ fontSize: 22 }}>Sans dividende en 2026 ({dividendSansDividende2026.length} sociétés)</div>
                </div>
                <div className="chip-wrap">
                  {dividendSansDividende2026.map((n) => (
                    <span className="chip" key={n}>{n}</span>
                  ))}
                </div>

                <div className="section-head" style={{ marginTop: 44 }}>
                  <div className="section-title" style={{ fontSize: 22 }}>Historique — exercice 2025</div>
                  <div className="section-note">Rendements réellement versés au titre de 2025</div>
                </div>
                <div className="kpi-row" style={{ marginBottom: 24 }}>
                  <div className="kpi-cell">
                    <div className="kpi-value">{dividend2025Stats.distributrices}/{dividend2025Stats.total}</div>
                    <div className="kpi-label">Sociétés distributrices</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value">{dividend2025Stats.rendementMoyen}%</div>
                    <div className="kpi-label">Rendement moyen</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value">{dividend2025Stats.montantMoyen} DH</div>
                    <div className="kpi-label">Montant moyen</div>
                  </div>
                </div>
                <div className="opcvm-card">
                  <table>
                    <tbody>
                      <tr className="opcvm-row-head">
                        <td>#</td>
                        <td>Société</td>
                        <td style={{ textAlign: "right" }}>Montant 2025</td>
                        <td style={{ textAlign: "right" }}>Rendement 2025</td>
                      </tr>
                      {dividend2025Top.map((d, i) => (
                        <tr key={d.code}>
                          <td className="mono" style={{ color: "var(--gold)", fontWeight: 700 }}>{i + 1}</td>
                          <td>
                            <div className="fund-name">{d.nom}</div>
                            <div className="fund-gerant">{d.code}</div>
                          </td>
                          <td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>{d.montant.toFixed(2)} DH</td>
                          <td className="perf-cell up" style={{ textAlign: "right" }}>{d.rendement.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="page-footnote">
                  Calendrier 2025/2026 : structure et dates reprises de casablanca-bourse.com (page officielle
                  "Calendrier des dividendes"). Les dates non confirmées le seront au fil des Assemblées
                  Générales. Historique 2025 : casablancabourse.com, classement des sociétés par dividendes
                  yield 2025. Montants en dirhams (DH) par action ; performances passées, ne
                  préjugent pas des performances futures.
                </p>
              </div>
            )}

            {dataTab === "capitalisation" && (
              <div>
                <div className="kpi-row">
                  <div className="kpi-cell">
                    <div className="kpi-value">{capMarketStats.total}+ Mrd</div>
                    <div className="kpi-label">Capitalisation totale (MAD)</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value">{capMarketStats.societes}</div>
                    <div className="kpi-label">Sociétés cotées</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value">{capMarketStats.secteurBanques}%</div>
                    <div className="kpi-label">Poids du secteur bancaire</div>
                  </div>
                  <div className="kpi-cell">
                    <div className="kpi-value">{capMarketStats.secteurTelecoms}%</div>
                    <div className="kpi-label">Poids des télécoms</div>
                  </div>
                </div>

                <div className="section-head" style={{ marginTop: 36 }}>
                  <div className="section-title" style={{ fontSize: 22 }}>Top 5 des capitalisations</div>
                  <div className="section-note">Séance du {capDate}</div>
                </div>

                <div className="cap-list">
                  {capTop5.map((c, i) => {
                    const max = capTop5[0].cap;
                    const pct = (c.cap / max) * 100;
                    return (
                      <div className="cap-row" key={c.code}>
                        <div className="cap-rank">{i + 1}</div>
                        <div className="cap-name-block">
                          <div className="fund-name">{c.nom}</div>
                          <div className="fund-gerant">{c.secteur} &middot; {c.code}</div>
                        </div>
                        <div className="cap-bar-track">
                          <div className="cap-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="cap-value mono">{c.cap.toFixed(1)} Mrd DH</div>
                      </div>
                    );
                  })}
                </div>

                <p className="page-footnote">
                  Données réelles — Top 5 : La Vie Éco, séance du {capDate}. Statistiques de marché
                  (capitalisation totale, nombre de sociétés cotées, poids sectoriels) : Bourse de
                  Casablanca / Wikipédia, 2025 — la répartition sectorielle exacte évolue en continu.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {page === "portefeuille" && (
        <section className="page-shell">
          <div className="container">
            <div className="page-header">
              <div className="eyebrow-mono">Simulateur</div>
              <h1 className="page-title serif">Gérer votre portefeuille en temps réel</h1>
              <p className="page-subtitle">
                Ajoutez les valeurs qui composent votre portefeuille pour suivre sa valeur, votre
                plus-value ou moins-value. Les cours utilisés ici sont des cours de démonstration
                (non temps réel) ; vos lignes sont enregistrées uniquement dans votre navigateur,
                elles ne sont pas visibles par les autres visiteurs.
              </p>
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
                          <td style={{ textAlign: "right" }}>Cours actuel</td>
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
              Simulateur à but pédagogique — les cours affichés sont rapprochés de cours réels récents
              (investing.com, casablancabourse.com, début juillet 2026) mais ne sont pas un flux temps
              réel : ils ne bougeront pas tout seuls. Le site officiel de la Bourse de Casablanca
              (casablanca-bourse.com) bloque l'accès automatisé, donc ces cours n'en sont pas
              directement extraits. Vos données sont stockées localement pour cette session de
              navigation et ne sont partagées avec personne.
            </p>
          </div>
        </section>
      )}

      <footer className="footer">
        Sahm — récap de séance à but de démonstration (données fictives) &middot; OPCVM, dividendes et capitalisation : données réelles sourcées &middot; statut du marché calculé à partir des horaires réels de cotation (hors jours fériés marocains) &middot; non affilié à la Bourse de Casablanca
      </footer>
    </div>
  );
}
