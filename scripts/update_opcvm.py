#!/usr/bin/env python3
"""
Récupère le Top 5 des OPCVM par catégorie depuis la vraie API publique de
l'ASFIM (Association des Sociétés de Gestion et Fonds d'Investissement
Marocains) — fundshare.asfim.ma/api/ — et les écrit dans
public/data/opcvm.json pour que le site les affiche.

Cette API a été découverte via les outils développeur du navigateur
(onglet Réseau) sur la page https://asfim.ma/publications/tableaux-des-performances/,
qui charge ses données via JavaScript depuis cette API. Elle est publique
(aucune authentification nécessaire) et renvoie la performance quotidienne
de chaque OPCVM marocain.

Fonctionnement :
1. On interroge /api/counter/ pour connaître la date de la dernière édition
   publiée (le "compteur" le plus récent).
2. On interroge /api/performances/?date=<cette date> pour récupérer la
   performance de tous les fonds à cette date.
3. On regroupe par catégorie (champ opcvm.type) et on garde le top 5 de
   chaque catégorie, trié par performance du jour.

Si la structure de l'API change et que ce script ne trouve plus rien, il
n'écrase PAS le fichier existant (pour éviter d'afficher un site vide) et
sort en erreur pour que le job GitHub Actions échoue visiblement.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

BASE = "https://fundshare.asfim.ma/api"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "data" / "opcvm.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SahmSiteBot/1.0; +https://www.sahmm.ma)",
    "Accept": "application/json",
}

# Normalisation des valeurs du champ "type" de l'API vers nos libellés.
CATEGORY_MAP = {
    "ACTIONS": "Actions",
    "DIVERSIFIÉ": "Diversifié",
    "DIVERSIFIE": "Diversifié",
    "OMLT": "OMLT",
    "OCT": "OCT",
    "MONETAIRE": "Monétaire",
    "MONÉTAIRE": "Monétaire",
    "CONTRACTUEL": "Contractuel",
}


def get_latest_date():
    resp = requests.get(
        f"{BASE}/counter/",
        params={"page": 1, "page_size": 1, "ordering": "-date"},
        headers=HEADERS,
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json()
    results = data.get("results") or []
    if not results:
        raise RuntimeError("Aucune édition trouvée dans /api/counter/")
    return results[0]["date"]


def get_performances(date_str):
    resp = requests.get(
        f"{BASE}/performances/",
        params={"date": date_str, "page_size": 500},
        headers=HEADERS,
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("results") or []


def pct(value):
    """Convertit une fraction décimale (0.0035) en pourcentage (0.35)."""
    if value is None:
        return 0.0
    return round(value * 100, 2)


def main():
    try:
        latest_date = get_latest_date()
        rows = get_performances(latest_date)
    except Exception as exc:  # noqa: BLE001
        print(f"Erreur lors de la récupération : {exc}", file=sys.stderr)
        sys.exit(1)

    funds_by_category = {}
    for r in rows:
        opcvm = r.get("opcvm") or {}
        raw_type = (opcvm.get("type") or "").strip().upper()
        label = CATEGORY_MAP.get(raw_type)
        if not label:
            continue

        vl = r.get("vl")
        if vl is None:
            continue

        fund = {
            "code": opcvm.get("code_isin") or "",
            "nom": opcvm.get("nom") or "",
            "valeur": f"{vl:,.2f}".replace(",", " ").replace(".", ","),
            "jour": pct(r.get("one_day")),
            "m1": pct(r.get("one_month")),
            "m3": pct(r.get("three_months")),
            "m6": pct(r.get("six_months")),
            "a1": pct(r.get("one_year")),
            "a2": pct(r.get("two_years")),
            "a5": pct(r.get("five_years")),
        }
        funds_by_category.setdefault(label, []).append(fund)

    if len(funds_by_category) < 4:
        print(
            f"Données insuffisantes ({len(funds_by_category)} catégories trouvées sur 6) — "
            "abandon sans écraser le fichier existant.",
            file=sys.stderr,
        )
        sys.exit(1)

    # Top 5 par catégorie, trié par performance du jour décroissante
    top5_by_category = {
        label: sorted(funds, key=lambda f: f["jour"], reverse=True)[:5]
        for label, funds in funds_by_category.items()
    }

    data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source_date_label": latest_date,
        "source": "ASFIM (fundshare.asfim.ma) — Association des Sociétés de Gestion et Fonds d'Investissement Marocains",
        "categories": top5_by_category,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    total = sum(len(v) for v in top5_by_category.values())
    print(
        f"OK — {len(top5_by_category)} catégories, {total} fonds au total, "
        f"situation au {latest_date}, écrit dans {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()
