#!/usr/bin/env python3
"""
Récupère le palmarès (top hausses / top baisses) depuis casablancabourse.com
(site tiers indépendant, sans lien avec le site officiel
casablanca-bourse.com — il le précise lui-même), et les écrit dans
public/data/palmares.json pour que le site les affiche.

IMPORTANT : la page contient DEUX zones qui ressemblent à un palmarès :
1. Un encart "Top Gagnants / Top Perdants" — repéré comme étant un bloc
   FIGÉ (son propre horodatage affiché reste bloqué à une date ancienne,
   jamais mise à jour). On ne l'utilise PAS.
2. Le grand tableau de toutes les sociétés cotées (colonnes Entreprise,
   Prix, Aujourd'hui), qui lui affiche "mis à jour chaque 15 minutes" et
   dont l'horodatage bouge réellement. C'est CE tableau qu'on utilise :
   on calcule nous-mêmes le top 5 hausses/baisses en triant sa colonne
   "Aujourd'hui" (variation du jour), plutôt que de faire confiance à
   l'encart pré-calculé qui s'est révélé être mort.

Ce site n'interdit pas l'accès automatisé (contrairement à
casablanca-bourse.com et Wafabourse) — vérifié avant la mise en place de ce
script.

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


def find_main_table(soup: BeautifulSoup):
    """
    Le tableau principal est celui qui a le plus de lignes (~80 sociétés),
    et dont l'en-tête contient à la fois "Entreprise" et "Aujourd'hui".
    On l'identifie ainsi plutôt que par une classe CSS, pour rester robuste
    si le HTML change légèrement.
    """
    best_table = None
    best_row_count = 0
    for table in soup.find_all("table"):
        header_text = table.get_text(" ", strip=True)[:400].lower()
        if "entreprise" not in header_text:
            continue
        if "aujourd" not in header_text:
            continue
        row_count = len(table.find_all("tr"))
        if row_count > best_row_count:
            best_row_count = row_count
            best_table = table
    return best_table


def parse_main_table(table):
    rows = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if len(cells) < 6:
            continue

        # Le nom de la société est dans la cellule qui contient un lien
        # vers /XXX/action/capitalisation
        name = None
        for c in cells:
            link = c.find("a", href=re.compile(r"/action/capitalisation"))
            if link:
                name = link.get_text(strip=True)
                break
        if not name:
            continue

        row_text = tr.get_text(" ", strip=True)

        price_match = re.search(r"([\d\s\u00a0]+[.,]\d{2})\s*DH", row_text)
        change_match = re.search(r"([↑↓]?\s*-?\d+(?:[.,]\d+)?)\s*%", row_text)
        if not price_match or not change_match:
            continue

        price_raw = price_match.group(1).replace("\u00a0", "").replace(" ", "").replace(",", ".")
        try:
            price = float(price_raw)
        except ValueError:
            continue

        change_raw = change_match.group(1).replace("\u00a0", " ").strip()
        is_down = "↓" in change_raw
        change_num_str = re.sub(r"[^\d.,\-]", "", change_raw).replace(",", ".")
        if not change_num_str:
            continue
        try:
            change = float(change_num_str)
        except ValueError:
            continue
        if is_down and change > 0:
            change = -change

        rows.append({"name": name, "price": price, "change_pct": change})

    return rows


def parse_last_update(soup: BeautifulSoup):
    """
    Il y a plusieurs horodatages "Dernière mise à jour" sur la page (dont un
    figé, dans l'encart mort). On prend le DERNIER trouvé dans le texte,
    qui correspond à celui du grand tableau (placé après lui dans la page).
    """
    text = soup.get_text()
    matches = re.findall(
        r"Dernière mise à jour\s*:?\s*([A-Za-zéû]+ \d{1,2} [A-Za-zéû]+ \d{4} \d{1,2}:\d{2}:\d{2})",
        text,
    )
    return matches[-1] if matches else None


def main():
    try:
        soup = fetch_soup()
        table = find_main_table(soup)
        if table is None:
            raise RuntimeError("Tableau principal introuvable sur la page")
        all_rows = parse_main_table(table)
        last_update = parse_last_update(soup)
    except Exception as exc:  # noqa: BLE001
        print(f"Erreur lors de la récupération/analyse : {exc}", file=sys.stderr)
        sys.exit(1)

    # On exclut les valeurs à 0% (non traitées dans la séance) du palmarès
    moved_rows = [r for r in all_rows if abs(r["change_pct"]) > 0.001]

    if len(moved_rows) < 10:
        print(
            f"Données insuffisantes ({len(all_rows)} lignes totales, {len(moved_rows)} avec variation) — "
            "abandon sans écraser le fichier existant.",
            file=sys.stderr,
        )
        sys.exit(1)

    sorted_rows = sorted(moved_rows, key=lambda r: r["change_pct"], reverse=True)
    top_hausses = sorted_rows[:5]
    top_baisses = list(reversed(sorted_rows[-5:]))

    data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source_last_update_label": last_update,
        "source": "casablancabourse.com (site tiers, calculé à partir du tableau complet des sociétés cotées)",
        "top_hausses": top_hausses,
        "top_baisses": top_baisses,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"OK — {len(all_rows)} sociétés lues, {len(moved_rows)} avec variation, "
        f"dernière mise à jour source : {last_update}, écrit dans {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()
