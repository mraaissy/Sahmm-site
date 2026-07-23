#!/usr/bin/env python3
"""
Récupère le palmarès (top hausses / top baisses) depuis casablancabourse.com
(site tiers indépendant, sans lien avec le site officiel
casablanca-bourse.com — il le précise lui-même), et les écrit dans
public/data/palmares.json pour que le site les affiche.

La page contient DEUX zones qui donnent chacune un palmarès, avec chacune
leur propre horodatage "Dernière mise à jour" :
1. Un encart "Top Gagnants / Top Perdants" tout fait (5 valeurs de chaque).
2. Le grand tableau de toutes les sociétés cotées, à partir duquel on
   calcule nous-mêmes un top 5 en triant la colonne "Aujourd'hui".

Les deux ne se rafraîchissent pas forcément au même rythme (observé : tantôt
l'un est plus récent, tantôt l'autre — et l'encart a même déjà été vu figé
pendant plusieurs mois). Pour rester fiable dans la durée, ce script
récupère les DEUX, compare leurs horodatages respectifs, et retient
automatiquement celui qui est le plus récent à chaque exécution.

Ce site n'interdit pas l'accès automatisé (contrairement à
casablanca-bourse.com et Wafabourse) — vérifié avant la mise en place de ce
script.

Si la structure de la page change et qu'aucune des deux sources n'est
exploitable, ce script n'écrase PAS le fichier existant (pour éviter
d'afficher un site vide) et sort en erreur pour que le job GitHub Actions
échoue visiblement.
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

MOIS_FR = {
    "janvier": 1, "février": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6,
    "juillet": 7, "août": 8, "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12,
}


def fetch_soup() -> BeautifulSoup:
    resp = requests.get(URL, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def clean_num(text: str) -> float:
    text = text.replace("\u00a0", " ").replace(",", "").strip()
    text = re.sub(r"[^\d.\-+]", "", text)
    return float(text)


def parse_datetime_fr(label):
    """Parse 'jeudi 23 juillet 2026 15:22:00' (ou sans les secondes) en datetime."""
    if not label:
        return None
    m = re.search(
        r"(\d{1,2}) ([a-zéû]+) (\d{4}) (\d{1,2}):(\d{2})(?::(\d{2}))?",
        label.lower(),
    )
    if not m:
        return None
    day, mois_txt, year, h, mn, sec = m.groups()
    mois = MOIS_FR.get(mois_txt)
    if not mois:
        return None
    try:
        return datetime(int(year), mois, int(day), int(h), int(mn), int(sec or 0))
    except ValueError:
        return None


def get_all_update_labels(soup: BeautifulSoup):
    """Renvoie tous les horodatages 'Dernière mise à jour' trouvés, dans
    l'ordre où ils apparaissent sur la page."""
    text = soup.get_text()
    return re.findall(
        r"Dernière mise à jour\s*:?\s*([A-Za-zéû]+ \d{1,2} [A-Za-zéû]+ \d{4} \d{1,2}:\d{2}(?::\d{2})?)",
        text,
    )


# ---- Méthode 1 : l'encart "Top Gagnants / Top Perdants" tout fait ----

def parse_top_box(soup: BeautifulSoup, heading_text: str):
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


# ---- Méthode 2 : calculé depuis le grand tableau de toutes les sociétés ----

def find_main_table(soup: BeautifulSoup):
    best_table, best_row_count = None, 0
    for table in soup.find_all("table"):
        header_text = table.get_text(" ", strip=True)[:400].lower()
        if "entreprise" not in header_text or "aujourd" not in header_text:
            continue
        row_count = len(table.find_all("tr"))
        if row_count > best_row_count:
            best_row_count, best_table = row_count, table
    return best_table


def parse_main_table(table):
    rows = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if len(cells) < 6:
            continue
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

        try:
            price = clean_num(price_match.group(1).replace("DH", ""))
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


def top5_from_full_table(all_rows):
    moved = [r for r in all_rows if abs(r["change_pct"]) > 0.001]
    if len(moved) < 10:
        return None
    sorted_rows = sorted(moved, key=lambda r: r["change_pct"], reverse=True)
    return sorted_rows[:5], list(reversed(sorted_rows[-5:]))


def main():
    try:
        soup = fetch_soup()
        update_labels = get_all_update_labels(soup)

        # Méthode 1 : encart tout fait
        box_hausses = parse_top_box(soup, "Top Gagnants")
        box_baisses = parse_top_box(soup, "Top Perdants")
        box_label = update_labels[0] if len(update_labels) >= 1 else None
        box_dt = parse_datetime_fr(box_label)

        # Méthode 2 : calculé depuis le grand tableau
        table = find_main_table(soup)
        all_rows = parse_main_table(table) if table is not None else []
        table_result = top5_from_full_table(all_rows)
        table_label = update_labels[-1] if len(update_labels) >= 1 else None
        table_dt = parse_datetime_fr(table_label)
    except Exception as exc:  # noqa: BLE001
        print(f"Erreur lors de la récupération/analyse : {exc}", file=sys.stderr)
        sys.exit(1)

    candidates = []
    if len(box_hausses) >= 3 and len(box_baisses) >= 3:
        candidates.append(("encart Top Gagnants/Perdants", box_dt, box_label, box_hausses[:5], box_baisses[:5]))
    if table_result:
        candidates.append(("calculé depuis le tableau complet", table_dt, table_label, table_result[0], table_result[1]))

    if not candidates:
        print("Aucune des deux méthodes n'a donné de résultat exploitable — abandon.", file=sys.stderr)
        sys.exit(1)

    # On choisit la source dont l'horodatage est le plus récent.
    # Si une des deux dates n'a pas pu être lue, elle est traitée comme la
    # plus ancienne possible (datetime.min) pour ne jamais être choisie à
    # tort par défaut.
    candidates.sort(key=lambda c: c[1] or datetime.min, reverse=True)
    method, chosen_dt, chosen_label, top_hausses, top_baisses = candidates[0]

    data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source_last_update_label": chosen_label,
        "source": f"casablancabourse.com (site tiers, {method})",
        "top_hausses": top_hausses,
        "top_baisses": top_baisses,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"OK — méthode retenue : {method}, dernière mise à jour source : {chosen_label}, "
        f"écrit dans {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()
