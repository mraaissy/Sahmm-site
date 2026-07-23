#!/usr/bin/env python3
"""
Récupère la fiche de chaque société cotée à la Bourse de Casablanca depuis
casablancabourse.com (le même site tiers que celui utilisé pour le
palmarès — déjà connu pour être accessible aux robots), page
/{TICKER}/action/capitalisation/, et écrit le résultat dans
public/data/actions.json.

Ce script fait ~80 requêtes, donc il est volontairement exécuté une seule
fois par jour (workflow update-actions.yml) plutôt que toutes les 15 min.

Si la structure du site change et que ce script ne trouve plus rien pour
une majorité de sociétés, il n'écrase PAS le fichier existant.
"""
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE = "https://www.casablancabourse.com"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "data" / "actions.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SahmSiteBot/1.0; +https://www.sahmm.ma)"
}

# Liste des tickers, relevée depuis le bandeau de cours affiché en haut de
# chaque page du site (~79 sociétés cotées).
TICKERS = [
    "ATW", "MNG", "MSA", "GTM", "TGC", "IAM", "AKT", "BCP", "LHM", "BOA",
    "ADH", "LBV", "CMA", "TQM", "HPS", "ADI", "CMG", "CFG", "JET", "SMI",
    "CIH", "ATL", "VCN", "DHO", "CDM", "SBM", "CAP", "BCI", "RIS", "ATH",
    "SLF", "RDS", "CSR", "GAZ", "SAH", "ARD", "CRS", "SOT", "COL", "SID",
    "SNP", "SNA", "MUT", "AFI", "MDP", "WAA", "IMO", "FBR", "STR", "LES",
    "DWY", "TMA", "MIC", "ALM", "CTM", "DYT", "EQD", "ZDJ", "MLE", "PRO",
    "S2M", "SRM", "NKL", "BAL", "M2M", "INV", "REB", "MOX", "DIS", "IBC",
    "SAM", "DLM", "OUL", "MAB", "CMT", "AGM", "NEJ", "UMR", "DRI", "AFM",
]


def clean_num(text):
    if text is None:
        return None
    text = text.replace("\u00a0", " ").replace(",", "").strip()
    m = re.match(r"(-?\d+(?:\.\d+)?)\s*(B|M|K)?", text)
    if not m:
        return None
    value = float(m.group(1))
    mult = {"B": 1e9, "M": 1e6, "K": 1e3}.get(m.group(2), 1)
    return value * mult


def parse_company(ticker):
    url = f"{BASE}/{ticker}/action/capitalisation/"
    resp = requests.get(url, headers=HEADERS, timeout=25)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    text = soup.get_text(" ", strip=True)

    h1 = soup.find("h1")
    nom = None
    if h1:
        nom = re.sub(r"\s*Capitalisation.*$", "", h1.get_text(strip=True)).strip()

    data = {"ticker": ticker, "nom": nom, "url": url}

    m = re.search(r"Capitalisation\s+([\d.,]+\s*[BMK]?)\s+P/E Ratio", text)
    if m:
        data["capitalisation"] = clean_num(m.group(1))

    m = re.search(r"P/E Ratio\s+([\d.,]+)\s+Rendement Dividende", text)
    if m:
        data["per"] = clean_num(m.group(1))

    m = re.search(r"Rendement Dividende\s+([\d.,]+)%\s+Classement", text)
    if m:
        data["rendement_dividende"] = clean_num(m.group(1))

    m = re.search(r"Classement\s+#(\d+)", text)
    if m:
        data["classement"] = int(m.group(1))

    m = re.search(r"Chiffre d'Affaires\s+([\d.,]+\s*MDH)", text)
    if m:
        data["chiffre_affaires"] = clean_num(m.group(1))

    m = re.search(r"Résultat Net\s+([\d.,\-]+\s*MDH)", text)
    if m:
        data["resultat_net"] = clean_num(m.group(1))

    m = re.search(r"Marge Opérationnelle\s+([\d.,\-]+)%", text)
    if m:
        data["marge_operationnelle"] = clean_num(m.group(1))

    m = re.search(r"Marge Nette\s+([\d.,\-]+)%", text)
    if m:
        data["marge_nette"] = clean_num(m.group(1))

    m = re.search(r"([\d\s.,]+)\s*DH\s+Prix de l'action", text)
    if m:
        data["prix"] = clean_num(m.group(1))

    m = re.search(r"([\d\s.,]+)\s+Nombre d'actions", text)
    if m:
        data["nombre_actions"] = clean_num(m.group(1))

    m = re.search(r"Nombre d'actions\s+(.+?)\s+Secteur", text)
    if m:
        data["secteur"] = m.group(1).strip()

    m = re.search(r"([\d.,\-]+)\s*%\s+Change \(1 jour\)", text)
    if m:
        data["variation_jour"] = clean_num(m.group(1))

    m = re.search(r"Change \(1 jour\).+?(\d{2}/\d{2}/\d{4})\s+Date IPO", text)
    if m:
        data["date_ipo"] = m.group(1)

    # Description : paragraphe libre juste après "Date IPO"
    idx = text.find("Date IPO")
    if idx != -1:
        desc_window = text[idx + len("Date IPO"):idx + 900]
        m = re.match(r"\s*(.+?)\s*(?:-\s*\[Capitalisation\]|Capitalisation Boursière de)", desc_window)
        if m:
            data["description"] = m.group(1).strip()

    # Structure actionnariale : liste "Nom  XX.X%"
    actionnariat = []
    idx = text.find("Structure Actionnariat")
    if idx != -1:
        window = text[idx: idx + 600]
        for am in re.finditer(r"([A-ZÀ-Ü][\w .\-'À-ÿ]{2,40}?)\s+(\d{1,2}(?:[.,]\d+)?)%", window):
            actionnariat.append({"nom": am.group(1).strip(), "pct": clean_num(am.group(2))})
    data["actionnariat"] = actionnariat[:8]

    return data


def main():
    results = []
    errors = 0
    for ticker in TICKERS:
        try:
            results.append(parse_company(ticker))
        except Exception as exc:  # noqa: BLE001
            print(f"  ! échec sur {ticker}: {exc}", file=sys.stderr)
            errors += 1
        time.sleep(0.5)

    if len(results) < 50:
        print(f"Trop peu de fiches récupérées ({len(results)}/{len(TICKERS)}) — abandon.", file=sys.stderr)
        sys.exit(1)

    data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source": "casablancabourse.com (site tiers, non affilié au site officiel de la Bourse de Casablanca)",
        "companies": results,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK — {len(results)}/{len(TICKERS)} sociétés récupérées ({errors} échecs), écrit dans {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
