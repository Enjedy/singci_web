"""
Modèle Machine Learning de l'assistant LumaCI (éclairage public / lampadaires).

Pipeline :
  * TF-IDF (caractères 1-3 grammes -> robuste aux fautes de frappe / accents)
  * Classifieur LinearSVC entraîné sur deux tâches :
      - INTENTION   : greeting | thanks | price | estimate
      - CATÉGORIE   : les anomalies lampadaire supportées
  * Seuil de confiance : si la prédiction est trop incertaine, le moteur
    bascule sur une réponse de clarification.

Entraînement automatique :
  * au premier lancement, si le modèle sauvegardé n'existe pas, il est
    entraîné puis conservé dans backend/models/ (joblib).

Commandes :
    python ml_model.py                 # entraîne + sauvegarde le modèle
    python ml_model.py --check         # court-circuit de validation
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
import joblib

MODELS_DIR = Path(__file__).resolve().parent / "models"
MODELS_FILE = MODELS_DIR / "luma_models.joblib"

# ---------------------------------------------------------------------------
# Jeu d'apprentissage : focus lampadaires / éclairage public
# ---------------------------------------------------------------------------

INTENT_SAMPLES: list[tuple[str, str]] = [
    # greeting
    ("bonjour", "greeting"), ("bonjour luma", "greeting"), ("salut", "greeting"),
    ("bonsoir", "greeting"), ("coucou", "greeting"), ("hello", "greeting"),
    ("bonjour comment vas tu", "greeting"), ("hey luma", "greeting"),
    ("rebonjour", "greeting"), ("salut luma", "greeting"),
    # thanks
    ("merci", "thanks"), ("merci beaucoup", "thanks"), ("très bien merci", "thanks"),
    ("parfait merci", "thanks"), ("super merci", "thanks"), ("d'accord merci", "thanks"),
    ("ok merci beaucoup", "thanks"), ("merci pour votre aide", "thanks"),
    ("c'est noté merci", "thanks"), ("merci luma", "thanks"),
    # price (question tarif -> on refuse poliment et on conseille)
    ("combien ça coûte", "price"), ("quel est le prix", "price"), ("je veux un devis", "price"),
    ("quel tarif", "price"), ("combien coute l'intervention", "price"),
    ("c'est payant ?", "price"), ("quel montant", "price"), ("ça coûte combien", "price"),
    ("vous facturez ?", "price"), ("budget à prévoir ?", "price"),
    ("quel est le tarif de l'équipe", "price"),
    # estimate - lampadaire clignotant
    ("lampadaire clignotant", "estimate"), ("le lampadaire clignote", "estimate"),
    ("le lampadaire scintille sans arrêt", "estimate"), ("le luminaire vacille", "estimate"),
    ("la lampe clignote la nuit", "estimate"), ("éclairage qui clignotement", "estimate"),
    ("le lampadaire clignote sans arrêt depuis plusieurs nuits", "estimate"),
    ("une lampe qui scintille", "estimate"),
    # estimate - lampadaire éteint
    ("lampadaire éteint", "estimate"), ("le lampadaire ne s'allume plus", "estimate"),
    ("lampadaire ne fonctionne plus", "estimate"), ("éclairage en panne", "estimate"),
    ("plus de lumière dans la rue", "estimate"), ("le lampadaire est éteint depuis une semaine", "estimate"),
    ("pas de lumière la nuit", "estimate"), ("le lampadaire est mort", "estimate"),
    ("lumière ne s'allume pas", "estimate"), ("le réverbère est éteint", "estimate"),
    # estimate - lampadaire cassé
    ("lampadaire cassé", "estimate"), ("le lampadaire est cassé", "estimate"),
    ("le mât est cassé", "estimate"), ("luminaire brisé", "estimate"),
    ("le lampadaire est tombé", "estimate"), ("un poteau renversé", "estimate"),
    ("le lampadaire a été vandalisé", "estimate"), ("le verre du lampadaire est brisé", "estimate"),
    ("lampadaire arraché", "estimate"), ("le lampadaire est couché par terre", "estimate"),
    # estimate - colonne / câblage
    ("câble défectueux", "estimate"), ("colonne d'éclairage défectueuse", "estimate"),
    ("le coffret saute", "estimate"), ("fusible qui grille", "estimate"),
    ("court-circuit dans l'éclairage", "estimate"), ("le disjoncteur saute la nuit", "estimate"),
    ("odeur de brûlé près du lampadaire", "estimate"), ("câblage endommagé", "estimate"),
    ("les fils du lampadaire sont à nu", "estimate"), ("coupure secteur éclairage", "estimate"),
    # estimate - panne générale / ampoule
    ("panne d'éclairage public", "estimate"), ("ampoule grillée", "estimate"),
    ("module led en panne", "estimate"), ("l'éclairage ne marche plus", "estimate"),
    ("panne d'électricité rue", "estimate"), ("éclairage public en panne", "estimate"),
    ("la rue est dans le noir", "estimate"), ("plus aucun lampadaire ne fonctionne", "estimate"),
    # estimate - générique (à lever par confiance du modèle catégorie)
    ("estimation travaux", "estimate"), ("que faut il prévoir comme travaux", "estimate"),
    ("délai d'intervention", "estimate"), ("comment réparer ce lampadaire", "estimate"),
    ("le lampadaire a un problème", "estimate"), ("j'ai un souci avec mon lampadaire", "estimate"),
    ("un lampadaire est en panne", "estimate"),
]

CATEGORY_SAMPLES: list[tuple[str, str]] = [
    # Lampadaire clignotant
    ("lampadaire clignotant", "Lampadaire clignotant"),
    ("le lampadaire clignote", "Lampadaire clignotant"),
    ("le lampadaire scintille", "Lampadaire clignotant"),
    ("le luminaire vacille", "Lampadaire clignotant"),
    ("clignotements la nuit", "Lampadaire clignotant"),
    ("la lampe clignote sans arrêt", "Lampadaire clignotant"),
    ("le lampadaire clignote sans arrêt depuis plusieurs nuits", "Lampadaire clignotant"),
    ("éclairage qui scintille", "Lampadaire clignotant"),
    # Lampadaire éteint
    ("lampadaire éteint", "Lampadaire éteint"),
    ("ne s'allume plus", "Lampadaire éteint"),
    ("ne fonctionne plus", "Lampadaire éteint"),
    ("pas de lumière", "Lampadaire éteint"),
    ("le réverbère ne s'allume pas", "Lampadaire éteint"),
    ("plus de lumière la nuit", "Lampadaire éteint"),
    ("le lampadaire est éteint depuis une semaine", "Lampadaire éteint"),
    ("lumière ne fonctionne pas", "Lampadaire éteint"),
    # Lampadaire cassé
    ("lampadaire cassé", "Lampadaire cassé"),
    ("le mât est cassé", "Lampadaire cassé"),
    ("luminaire brisé", "Lampadaire cassé"),
    ("le lampadaire est tombé", "Lampadaire cassé"),
    ("un poteau renversé", "Lampadaire cassé"),
    ("le lampadaire a été vandalisé", "Lampadaire cassé"),
    ("lampadaire arraché", "Lampadaire cassé"),
    ("verre brisé", "Lampadaire cassé"),
    # Colonne / câblage
    ("câble défectueux", "Colonne / câblage défectueux"),
    ("colonne d'éclairage défectueuse", "Colonne / câblage défectueux"),
    ("le coffret saute", "Colonne / câblage défectueux"),
    ("fusible qui grille", "Colonne / câblage défectueux"),
    ("court-circuit", "Colonne / câblage défectueux"),
    ("disjoncteur qui saute", "Colonne / câblage défectueux"),
    ("odeur de brûlé", "Colonne / câblage défectueux"),
    ("câblage endommagé", "Colonne / câblage défectueux"),
    ("fils à nu", "Colonne / câblage défectueux"),
    # Panne d'éclairage
    ("panne d'éclairage public", "Panne d'éclairage"),
    ("ampoule grillée", "Panne d'éclairage"),
    ("module led en panne", "Panne d'éclairage"),
    ("éclairage public en panne", "Panne d'éclairage"),
    ("la rue est dans le noir", "Panne d'éclairage"),
    ("ampoule à remplacer", "Panne d'éclairage"),
    ("plus aucun lampadaire ne fonctionne", "Panne d'éclairage"),
]


def _build(
    samples: list[tuple[str, str]],
) -> Pipeline:
    texts = [t for t, _ in samples]
    labels = [l for _, l in samples]

    model = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 3),
                    analyzer="char",
                    sublinear_tf=True,
                    max_features=20000,
                ),
            ),
            ("clf", CalibratedClassifierCV(LinearSVC(class_weight="balanced"), cv=3)),
        ]
    )
    model.fit(texts, labels)
    return model


def train() -> tuple[Pipeline, Pipeline]:
    return _build(INTENT_SAMPLES), _build(CATEGORY_SAMPLES)


def save(intent_model: Pipeline, category_model: Pipeline) -> Path:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    payload = {"intent": intent_model, "category": category_model}
    joblib.dump(payload, MODELS_FILE)
    return MODELS_FILE


def load_or_train() -> tuple[Pipeline, Pipeline]:
    if MODELS_FILE.exists():
        try:
            payload = joblib.load(MODELS_FILE)
            return payload["intent"], payload["category"]
        except Exception:
            pass
    intent_model, category_model = train()
    save(intent_model, category_model)
    return intent_model, category_model


def predict_confidence(
    model: Pipeline, text: str
) -> tuple[str, float]:
    probs = model.predict_proba([text])[0]
    idx = int(probs.argmax())
    return model.classes_[idx], float(probs[idx])


def quick_check() -> None:
    intent_model, category_model = load_or_train()
    tests = [
        "bonjour",
        "merci",
        "combien ça coûte",
        "lampadaire clignotant sur la place",
        "le lampadaire ne s'allume plus",
        "le mât est cassé",
        "le coffret saute",
        "je ne comprends rien",
    ]
    print(f"{'Message':<40} {'Intention':<10} {'Catégorie'}")
    print("-" * 70)
    for t in tests:
        intent, ci = predict_confidence(intent_model, t)
        cat, cc = predict_confidence(category_model, t)
        print(f"{t:<40} {intent:<8} {cat:<12} ({ci:.2f} / {cc:.2f})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="court-circuit de validation")
    args = parser.parse_args()

    if args.check:
        quick_check()
    else:
        intent_model, category_model = train()
        saved = save(intent_model, category_model)
        print(f"Modèle entraîné et sauvegardé dans {saved}")
        os.environ["_LUMA_TRAINED"] = "1"