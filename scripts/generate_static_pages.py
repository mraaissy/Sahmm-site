#!/usr/bin/env python3
"""
Génère un vrai fichier physique dist/<page>/index.html pour chaque page du
site (copie du index.html final, buildé par Vite, avec ses balises <script>
déjà pointées vers les bons fichiers hashés).

Pourquoi : GitHub Pages est un hébergeur de fichiers statiques et ne sait
pas réécrire une URL comme /actions vers index.html avec un code 200 — sans
ce script, Google reçoit un vrai 404 sur ces URLs et refuse de les indexer.
En créant un vrai fichier dist/actions/index.html, GitHub Pages le sert
nativement en 200, et React (côté client) prend ensuite le relais pour
afficher la bonne page grâce au chemin de l'URL.

En bonus, chaque copie a son <title> et sa <meta name="description">
propres, ce qui donne un vrai titre optimisé dès le premier chargement
(avant même l'exécution du JavaScript) — idéal pour le référencement.
"""
import re
from pathlib import Path

DIST = Path("dist")
SOURCE = DIST / "index.html"

PAGES = {
    "actions": (
        "Actions cotées à la Bourse de Casablanca — BourseInfo.ma",
        "Cours, PER, rendement du dividende et fiches détaillées de toutes les sociétés cotées à la Bourse de Casablanca.",
    ),
    "seance": (
        "Séance Boursière en direct — BourseInfo.ma",
        "Indices MASI, MASI 20, MASI ESG, palmarès et tableau complet des valeurs cotées à la Bourse de Casablanca.",
    ),
    "opcvm": (
        "OPCVM Maroc — Classement et performances — BourseInfo.ma",
        "Classement des OPCVM marocains par catégorie, performances et rendements à jour.",
    ),
    "comparateur": (
        "Comparateur d'actions marocaines — BourseInfo.ma",
        "Comparez PER, rendement, capitalisation et marges de plusieurs sociétés cotées à la Bourse de Casablanca.",
    ),
    "obligataire": (
        "Marché obligataire marocain — Courbe des taux — BourseInfo.ma",
        "Courbe des taux du marché obligataire marocain, adjudications du Trésor et évolution des taux.",
    ),
    "data": (
        "Calendrier des dividendes — Bourse de Casablanca — BourseInfo.ma",
        "Calendrier complet des dividendes versés par les sociétés cotées à la Bourse de Casablanca.",
    ),
    "apprendre": (
        "Apprendre la Bourse — BourseInfo.ma",
        "Guides et lexique pour comprendre les marchés financiers marocains, du débutant à l'investisseur confirmé.",
    ),
    "actualites": (
        "Actualité des marchés marocains — BourseInfo.ma",
        "Le Morning Brief quotidien et les rapports hebdomadaires sur les marchés financiers marocains.",
    ),
    "portefeuille": (
        "Mon Portefeuille — BourseInfo.ma",
        "Suivez la performance de votre portefeuille d'actions marocaines virtuel.",
    ),
}


def main():
    if not SOURCE.exists():
        print(f"Fichier introuvable : {SOURCE} (le build a-t-il réussi ?)")
        return

    base_html = SOURCE.read_text(encoding="utf-8")

    for slug, (title, description) in PAGES.items():
        html = base_html
        page_url = f"https://www.bourseinfo.ma/{slug}/"

        html = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html, count=1, flags=re.S)
        html = re.sub(
            r'(<meta name="description" content=").*?(")',
            rf"\1{description}\2",
            html,
            count=1,
        )
        # Balise canonique et Open Graph : chacune doit pointer vers SA
        # PROPRE URL, pas vers l'accueil — sinon on dit à Google d'ignorer
        # la page au profit de l'accueil, ce qui bloque son indexation.
        html = re.sub(
            r'(<link rel="canonical" href=").*?(")',
            rf"\1{page_url}\2",
            html,
            count=1,
        )
        html = re.sub(
            r'(<meta property="og:url" content=").*?(")',
            rf"\1{page_url}\2",
            html,
            count=1,
        )
        html = re.sub(
            r'(<meta property="og:title" content=").*?(")',
            rf"\1{title}\2",
            html,
            count=1,
        )
        html = re.sub(
            r'(<meta property="og:description" content=").*?(")',
            rf"\1{description}\2",
            html,
            count=1,
        )
        html = re.sub(
            r'(<meta name="twitter:title" content=").*?(")',
            rf"\1{title}\2",
            html,
            count=1,
        )
        html = re.sub(
            r'(<meta name="twitter:description" content=").*?(")',
            rf"\1{description}\2",
            html,
            count=1,
        )

        out_dir = DIST / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(html, encoding="utf-8")
        print(f"  généré : dist/{slug}/index.html (canonique : {page_url})")

    print(f"Terminé : {len(PAGES)} pages statiques générées.")


if __name__ == "__main__":
    main()
