#!/usr/bin/env python3
"""
Récupère le MASI en direct depuis e-bourse.ma (plateforme officielle et
éducative de la Bourse de Casablanca, partenaire TradingView), et l'écrit
dans public/data/marche.json pour que le site l'affiche.

Ce site est officiellement exploité par la Bourse de Casablanca et n'interdit
pas l'accès automatisé (contrairement à casablanca-bourse.com) — vérifié avant
la mise en place de ce script. Les cours y sont différés de 15 minutes.

Note : ce site ne semble pas se rafraîchir aussi souvent qu'annoncé (vérifié
à plusieurs heures d'intervalle avec les mêmes chiffres). Le MASI qu'il
affiche reste néanmoins une vraie donnée réelle, juste pas forcément la plus
récente à la minute près.

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

URL = "https://www.e-bourse.ma/"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "data" / "marche.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SahmSiteBot/1.0; +https://www.sahmm.ma)"
}


def fetch_page_text() -> str:
    resp = requests.get(URL, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return resp.text


def parse_index(html: str, label: str):
    """
    Cherche la valeur d'un indice (MASI ou MASI 20) juste après son label,
    au format "17 677,27" suivi d'une variation en %.

    Attention : "MASI" est un sous-texte de "MASI 20", donc pour le label
    "MASI" seul on exclut explicitement les occurrences suivies de "20".
    """
    text = re.sub(r"<[^>]+>", "\n", html)

    if label == "MASI":
        label_pattern = re.compile(r"MASI(?!\s*20)")
    elif label == "MASI 20":
        label_pattern = re.compile(r"MASI\s*20")
    else:
        label_pattern = re.compile(re.escape(label))

    match_label = label_pattern.search(text)
    if not match_label:
        return None
    idx = match_label.end()
    window = text[idx: idx + 400]
    m = re.search(
        r"([\d]{1,3}(?:[ \u00a0]\d{3})*,\d{2})\s*[\r\n]+\s*([+-]?\d+[.,]\d+)\s*%",
        window,
    )
    if not m:
        return None
    value = float(m.group(1).replace("\u00a0", " ").replace(" ", "").replace(",", "."))
    change = float(m.group(2).replace(",", "."))
    return {"value": value, "change_pct": change}


def main():
    try:
        html = fetch_page_text()
        masi = parse_index(html, "MASI")
        masi20 = parse_index(html, "MASI 20")
    except Exception as exc:  # noqa: BLE001
        print(f"Erreur lors de la récupération/analyse : {exc}", file=sys.stderr)
        sys.exit(1)

    if masi is None:
        print("MASI introuvable — abandon sans écraser le fichier existant.", file=sys.stderr)
        sys.exit(1)

    data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source": "e-bourse.ma (plateforme officielle Bourse de Casablanca, cours différés de 15 min)",
        "masi": masi,
        "masi20": masi20,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK — MASI={masi['value']} ({masi['change_pct']}%), écrit dans {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
