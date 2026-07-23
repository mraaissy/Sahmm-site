#!/usr/bin/env python3
"""
Récupère la liste des ~79 sociétés cotées à la Bourse de Casablanca et leur
fiche détaillée depuis casabourse.ma (site tiers, non affilié au site
officiel), et écrit le résultat dans public/data/actions.json.

Ce script fait ~80 requêtes (liste paginée + une page par société), donc il
est volontairement exécuté une seule fois par jour (workflow séparé,
update-actions.yml) plutôt que toutes les 15 min, par courtoisie envers le
site source et parce que ces données fondamentales (P/E, dividendes,
TCAC...) ne changent pas à la minute près.

Si la structure du site change et que ce script ne trouve plus rien, il
n'écrase PAS le fichier existant et sort en erreur.
"""
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE = "https://casabourse.ma"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "data" / "actions.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SahmSiteBot/1.0; +https://www.sahmm.ma)"
}


def get_soup(url):
    resp = requests.get(url, headers=HEADERS, timeout=25)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def clean_num(text):
    if text is None:
        return None
    text = text.replace("\u00a0", " ").replace(",", "").strip()
    text = re.sub(r"[^\d.\-]", "", text)
    if not text or text == "-":
        return None
    try:
        return float(text)
    except ValueError:
        return None


def parse_money_md(text):
    """'13.47 Md MAD' -> 13470000000.0 (approx, en MAD)."""
    if not text:
        return None
    m = re.search(r"([\d.,]+)\s*(Md|M|K)?", text)
    if not m:
        return None
    value = clean_num(m.group(1))
    if value is None:
        return None
    mult = {"Md": 1e9, "M": 1e6, "K": 1e3}.get(m.group(2), 1)
    return value * mult


def list_companies():
    """Parcourt les pages paginées /entreprises/ et /entreprises/page/N/."""
    companies = []
    page = 1
    while True:
        url = f"{BASE}/entreprises/" if page == 1 else f"{BASE}/entreprises/page/{page}/"
        soup = get_soup(url)
        cards = soup.select("a[href*='/entreprise/']")
        found_this_page = 0
        seen_slugs = set()
        for link in soup.find_all("h3"):
            a = link.find("a", href=re.compile(r"/entreprise/[^/]+/?$"))
            if not a:
                continue
            href = a.get("href", "")
            slug_match = re.search(r"/entreprise/([^/]+)/?$", href)
            if not slug_match:
                continue
            slug = slug_match.group(1)
            if slug in seen_slugs or slug == "t2s":
                continue
            seen_slugs.add(slug)
            found_this_page += 1

            # Le bloc de la carte est le parent proche du titre
            card = link.find_parent()
            card_text = card.get_text(" ", strip=True) if card else ""

            ticker_match = re.search(r"\b([A-Z0-9]{2,5})\b\s+(?:[A-ZÉÈÀ][a-zéèàûôî]|OPCI)", card_text)

            companies.append({
                "slug": slug,
                "nom": a.get_text(strip=True),
                "url": href if href.startswith("http") else BASE + href,
            })

        if found_this_page == 0:
            break
        page += 1
        if page > 10:  # garde-fou
            break
        time.sleep(0.3)

    return companies


def parse_detail(url):
    soup = get_soup(url)
    text = soup.get_text(" ", strip=True)

    data = {}

    m = re.search(r"([A-Z0-9]{2,6})\s*\[?(?:Banques|Assurances|Immobilier|Industrie|Mines|Énergie|Distribution|Automobile|Agro-alimentaire|Technologies|Santé[^0-9]*|Transport et Logistique|OPCI|Services Financiers|Sylviculture et Papier|Télécommunications|Ciment et Matériaux|Divers)", text)
    data["ticker"] = m.group(1) if m else None

    m = re.search(r"([\d\s\u00a0,.]+)\s*MAD\s*(-?\d+(?:[.,]\d+)?)%\s*Volume", text)
    if m:
        data["prix"] = clean_num(m.group(1))
        data["variation_jour"] = clean_num(m.group(2))

    m = re.search(r"Capitalisation\s*([\d.,]+\s*(?:Md|M|K)?)\s*MAD", text)
    if m:
        data["capitalisation"] = parse_money_md(m.group(1))

    m = re.search(r"Rendement.{0,40}?(\d+(?:[.,]\d+)?)%\s*(\d+(?:[.,]\d+)?)\s*MAD", text)
    if m:
        data["dividende_rendement"] = clean_num(m.group(1))
        data["dividende_montant"] = clean_num(m.group(2))

    m = re.search(r"Payout Ratio\s*(\d+(?:[.,]\d+)?)%", text)
    if m:
        data["payout_ratio"] = clean_num(m.group(1))

    m = re.search(r"Ratio P/E \(TTM\)\s*([\d.,]+)\s*\(Forward 202\d[A-Z]?:\s*([\d.,]+)\)", text)
    if m:
        data["per_ttm"] = clean_num(m.group(1))
        data["per_forward"] = clean_num(m.group(2))

    m = re.search(r"Ratio PEG\s*([\d.,]+)", text)
    if m:
        data["peg"] = clean_num(m.group(1))

    m = re.search(r"Croissance du CA\s*\+?(-?[\d.,]+)%", text)
    if m:
        data["tcac_ca"] = clean_num(m.group(1))

    m = re.search(r"Croissance Résultat Net\s*\+?(-?[\d.,]+)%", text)
    if m:
        data["tcac_rn"] = clean_num(m.group(1))

    m = re.search(r"Code ISIN\s*([A-Z0-9]{10,12})", text)
    if m:
        data["code_isin"] = m.group(1)

    m = re.search(r"Nombre d'Actions\s*([\d.,]+\s*(?:Md|M|K)?)", text)
    if m:
        data["nombre_actions"] = parse_money_md(m.group(1))

    m = re.search(r"Site Web\s*Visiter le site", text)
    site_link = soup.find("a", string=re.compile("Visiter le site"))
    if site_link:
        data["site_web"] = site_link.get("href")

    # Historique des dividendes : table "Année | Montant | Type | Détachement | Paiement"
    history = []
    for table in soup.find_all("table"):
        header = table.get_text(" ", strip=True)[:120].lower()
        if "montant" in header and "détachement" in header:
            for tr in table.find_all("tr"):
                cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                if len(cells) < 5 or not re.match(r"^\d{4}$", cells[0]):
                    continue
                history.append({
                    "annee": cells[0],
                    "montant": clean_num(cells[1]),
                    "type": cells[2],
                    "detachement": cells[3] if cells[3] != "—" else None,
                    "paiement": cells[4] if cells[4] != "—" else None,
                })
            break
    data["dividend_history"] = history

    return data


def main():
    try:
        companies = list_companies()
    except Exception as exc:  # noqa: BLE001
        print(f"Erreur lors de la récupération de la liste : {exc}", file=sys.stderr)
        sys.exit(1)

    if len(companies) < 50:
        print(f"Liste trop courte ({len(companies)} sociétés) — abandon.", file=sys.stderr)
        sys.exit(1)

    results = []
    errors = 0
    for c in companies:
        try:
            detail = parse_detail(c["url"])
            results.append({**c, **detail})
        except Exception as exc:  # noqa: BLE001
            print(f"  ! échec sur {c['slug']}: {exc}", file=sys.stderr)
            errors += 1
        time.sleep(0.4)

    if len(results) < 50:
        print(f"Trop peu de fiches récupérées ({len(results)}) — abandon.", file=sys.stderr)
        sys.exit(1)

    data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source": "casabourse.ma (site tiers, non affilié au site officiel de la Bourse de Casablanca)",
        "companies": results,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK — {len(results)} sociétés récupérées ({errors} échecs), écrit dans {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
