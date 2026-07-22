#!/usr/bin/env python3
"""
Récupère le palmarès (top hausses / top baisses) et le MASI depuis
casablancabourse.com (site tiers indépendant, sans lien avec le site
officiel casablanca-bourse.com — il le précise lui-même), et les écrit
dans public/data/marche.json pour que le site les affiche.

Ce site n'interdit pas l'accès automatisé (contrairement à
casablanca-bourse.com et Wafabourse) et annonce une mise à jour "chaque 15
minutes" pour son classement — vérifié avant la mise en place de ce script.
Le site précise aussi honnêtement que les cours peuvent être retardés de
quelques minutes à plusieurs heures : on récupère donc aussi l'horodatage
"Dernière mise à jour" qu'il affiche lui-même, pour rester honnête sur la
fraîcheur réelle des données côté site.

Si la structure de la page change et que ce script ne trouve plus rien,
il n'écrase PAS le fichier existant (pour éviter d'afficher un site vide) et
sort en erreur pour que le job GitHub Actions échoue visiblement.
"""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

URL = "https://www.casablancabourse.com/"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "data" / "palmares.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SahmSiteBot/1.0; +https://www.sahmm.ma)"
}


def fetch_soup() -> BeautifulSoup:
    resp = requests.get(URL, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def clean_num(text: str) -> float:
    text = text.replace("\u00a0", " ").replace(",", "").strip()
    text = re.sub(r"[^\d.\-+]", "", text)
    return float(text)


def parse_top_table(soup: BeautifulSoup, heading_text: str):
    """
    Cherche un titre (h1-h4) contenant heading_text, puis le tableau HTML
    le plus proche qui suit, et en extrait Entreprise / Var% / Cours.
    """
    heading = None
    for tag in soup.find_all(re.compile("^h[1-4]$")):
        if heading_text.lower() in tag.get_text(strip=True).lower():
            heading = tag
            break
    if heading is None:
        return []

    table = heading.find_next("table")
    if table is None:
        return []

    rows = []
    for tr in table.find_all("tr"):
        cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        if len(cells) < 3:
            continue
        name, var_text, cours_text = cells[0], cells[1], cells[2]
        if not re.search(r"\d", var_text):
            continue  # ligne d'en-tête
        try:
            var = clean_num(var_text.replace("%", ""))
            cours = clean_num(cours_text.replace("DH", ""))
        except ValueError:
            continue
        rows.append({"name": name, "change_pct": var, "price": cours})

    return rows


def parse_last_update(soup: BeautifulSoup):
    text = soup.get_text()
    m = re.search(r"Dernière mise à jour\s*:?\s*([A-Za-zéû]+ \d{1,2} [A-Za-zéû]+ \d{4} \d{1,2}:\d{2}:\d{2})", text)
    return m.group(1) if m else None


def parse_masi(soup: BeautifulSoup):
    text = soup.get_text()
    idx = text.find("MASI Index")
    if idx == -1:
        return None
    window = text[idx: idx + 300]
    for candidate in re.findall(r"[\d]{2}[\s\u00a0]?\d{3}[.,]\d{2}", window):
        try:
            return clean_num(candidate)
        except ValueError:
            continue
    return None


def main():
    try:
        soup = fetch_soup()
        hausses = parse_top_table(soup, "Top Gagnants")
        baisses = parse_top_table(soup, "Top Perdants")
        last_update = parse_last_update(soup)
        masi_value = parse_masi(soup)
    except Exception as exc:  # noqa: BLE001
        print(f"Erreur lors de la récupération/analyse : {exc}", file=sys.stderr)
        sys.exit(1)

    if len(hausses) < 3 or len(baisses) < 3:
        print(
            f"Données insuffisantes (hausses={len(hausses)}, baisses={len(baisses)}) — "
            "abandon sans écraser le fichier existant.",
            file=sys.stderr,
        )
        sys.exit(1)

    data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source_last_update_label": last_update,
        "source": "casablancabourse.com (site tiers, cours retardés de quelques minutes à plusieurs heures)",
        "masi_value": masi_value,
        "top_hausses": hausses[:5],
        "top_baisses": baisses[:5],
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"OK — {len(hausses)} hausses, {len(baisses)} baisses, "
        f"dernière mise à jour source : {last_update}, écrit dans {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()
