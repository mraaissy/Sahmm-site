"""
Alimente automatiquement l'historique des cours (public/data/historique/{TICKER}.json)
à partir des données de la séance boursière du jour (public/data/seance_bourse.json).

À exécuter chaque fois que seance_bourse.json est mis à jour avec une nouvelle séance.
Ajoute un point {date, prix} par société, sans dupliquer si la date existe déjà.

Usage : python3 scripts/merge_seance_to_historique.py
"""
import json
import re
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
SEANCE_PATH = ROOT / "public" / "data" / "seance_bourse.json"
HIST_DIR = ROOT / "public" / "data" / "historique"
HIST_INDEX_PATH = ROOT / "public" / "data" / "historique.json"

# Correspondance nom d'instrument (tel qu'affiché dans la séance) -> ticker officiel
NOM_VERS_TICKER = {
    "STROC INDUSTRIE": "STR", "SOTHEMA": "SOT", "AFRIC INDUSTRIES SA": "AFI",
    "DOUJA PROM ADDOHA": "ADH", "MANAGEM": "MNG", "CTM": "CTM",
    "FENIE BROSSETTE": "FBR", "ATTIJARIWAFA BANK": "ATW", "M2M Group": "M2M",
    "ALUMINIUM DU MAROC": "ALM", "TGCC S.A": "TGC", "SONASID": "SID",
    "SNEP": "SNP", "SOCIETE DES BOISSONS DU MAROC": "SBM",
    "TOTALENERGIES MARKETING MAROC": "TMA", "LAFARGEHOLCIM MAR": "LHM",
    "RES DAR SAADA": "RDS", "RISMA": "RIS", "ALLIANCES": "ADI",
    "IMMORENTE INVEST": "IMO", "ATLANTASANAD": "ATL", "CIH": "CIH",
    "SALAFIN": "SLF", "DELATTRE LEVIVIER MAROC": "DLM", "S.M MONETIQUE": "S2M",
    "ENNAKL": "NKL", "BALIMA": "BAL", "CDM": "CDM", "AFMA": "AFM",
    "EQDOM": "EQD", "AKDITAL": "AKT", "WAFA ASSURANCE": "WAA",
    "ARADEI CAPITAL": "ARD", "LESIEUR CRISTAL": "LES", "BMCI": "BCI",
    "OULMES": "OUL", "REBAB COMPANY": "REB", "MAGHREB OXYGENE": "MOX",
    "UNIMER": "UMR", "IB MAROC.COM": "IBC", "AGMA": "AGM",
    "AUTO NEJMA": "NEJ", "REALISATIONS MECANIQUES": "SRM",
    "PROMOPHARM S.A.": "PRO", "MICRODATA": "MIC", "LABEL VIE": "LBV",
    "DARI COUSPATE": "DRI", "INVOLYS": "INV", "MAGHREBAIL": "MAB",
    "JET CONTRACTORS": "JET", "AUTO HALL": "ATH", "CARTIER SAADA": "CRS",
    "DELTA HOLDING": "DHO", "BANK OF AFRICA": "BOA", "SMI": "SMI",
    "MUTANDIS SCA": "MUT", "SAHAM ASSURANCE": "SAH", "SODEP-Marsa Maroc": "MSA",
    "BCP": "BCP", "MAROC LEASING": "MLE", "STOKVIS NORD AFRIQUE": "SNA",
    "DISWAY": "DWY", "COSUMAR": "CSR", "MINIERE TOUISSIT": "CMT",
    "ITISSALAT AL-MAGHRIB": "IAM", "ZELLIDJA S.A": "ZDJ", "CIMENTS DU MAROC": "CMA",
    "HPS": "HPS", "TAQA MOROCCO": "TQM", "COLORADO": "COL", "MED PAPER": "MDP",
    "AFRIQUIA GAZ": "GAZ", "DISTY TECHNOLOGIES": "DYT",
    "CFG BANK": "CFG", "CMGP GROUP": "CMG", "VICENNE": "VCN",
    "SGTM S.A": "GTM", "CASH PLUS S.A": "CAP",
    # Alias / variantes de nom rencontrées dans les fichiers de séance
    "Holcim Maroc S.A": "LHM",             # ex-LafargeHolcim Maroc, même société
    "RESIDENCES DAR SAADA": "RDS",         # variante de "RES DAR SAADA"
    "SANLAM MAROC": "SAM",                 # ticker officiel non couvert par l'historique 2019-2026
}

MOIS_FR = {
    "janvier": 1, "février": 2, "fevrier": 2, "mars": 3, "avril": 4, "mai": 5,
    "juin": 6, "juillet": 7, "août": 8, "aout": 8, "septembre": 9,
    "octobre": 10, "novembre": 11, "décembre": 12, "decembre": 12,
}


def parse_date_label(label):
    """Convertit '29 juillet 2026' -> '2026-07-29'."""
    m = re.match(r"(\d{1,2})\s+([a-zéû]+)\s+(\d{4})", label.strip().lower())
    if not m:
        raise ValueError(f"Format de date non reconnu : {label!r}")
    jour, mois_txt, annee = m.groups()
    mois = MOIS_FR.get(mois_txt)
    if not mois:
        raise ValueError(f"Mois non reconnu : {mois_txt!r}")
    return f"{annee}-{mois:02d}-{int(jour):02d}"


def parse_num(v):
    if v is None or v == "-":
        return None
    s = str(v).replace("\xa0", "").replace(" ", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def main():
    seance = json.loads(SEANCE_PATH.read_text(encoding="utf-8"))
    date_iso = parse_date_label(seance["updated_label"])
    HIST_DIR.mkdir(parents=True, exist_ok=True)

    updated, skipped_existing, unmatched = [], [], []

    for c in seance["companies"]:
        nom = c["instrument"]
        ticker = NOM_VERS_TICKER.get(nom)
        if not ticker:
            unmatched.append(nom)
            continue
        prix = parse_num(c.get("dernier_cours"))
        if prix is None:
            continue

        hist_path = HIST_DIR / f"{ticker}.json"
        rows = json.loads(hist_path.read_text(encoding="utf-8")) if hist_path.exists() else []

        if any(r["date"] == date_iso for r in rows):
            skipped_existing.append(ticker)
            continue

        rows.append({"date": date_iso, "prix": prix})
        rows.sort(key=lambda r: r["date"])
        hist_path.write_text(json.dumps(rows, ensure_ascii=False), encoding="utf-8")
        updated.append(ticker)

    # Met à jour l'index des tickers disponibles
    tickers_dispo = sorted(p.stem for p in HIST_DIR.glob("*.json"))
    index = {
        "_note": "Historique des cours par ticker. Chaque société a son propre fichier "
                 "dans /data/historique/{TICKER}.json pour eviter de tout charger a chaque fois.",
        "tickers_disponibles": tickers_dispo,
    }
    HIST_INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")

    print(f"Séance du {date_iso}")
    print(f"  Mis à jour     : {len(updated)} tickers -> {updated}")
    print(f"  Déjà à jour    : {len(skipped_existing)} tickers")
    if unmatched:
        print(f"  Non reconnus   : {unmatched}")


if __name__ == "__main__":
    main()
