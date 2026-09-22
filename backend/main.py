"""
LumaCI - Assistant éclairage public (moteur Python).

Service FastAPI qui enrichit l'assistant IA du dashboard :
  * MACHINE LEARNING : intention + catégorie d'anomalie détectées par un
    modèle TF-IDF + LinearSVC entraîné sur des exemples (backend/ml_model.py),
  * se concentre sur les LAMPADAIRES et l'éclairage public,
  * répond clairement : diagnostic, étapes, moyens, délai,
  * ne renvoie JAMAIS de prix ni de tarif fixe (politique "conseil uniquement").

Lancer le serveur :
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Le modèle est entraîné automatiquement au premier lancement (backend/models/).

L'interface web appelle ce service via src/app/services/AssistantService.ts
et bascule automatiquement sur le moteur local (TypeScript) s'il est absent.
"""

from __future__ import annotations

import random
import re
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ml_model import load_or_train, predict_confidence

app = FastAPI(title="LumaCI Assistant API", version="1.1.0")

# Chargement (ou entraînement) du modèle Machine Learning au démarrage.
INTENT_MODEL, CATEGORY_MODEL = load_or_train()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Base de connaissances (conseil technique, aucun tarif)
# ---------------------------------------------------------------------------

KB: dict[str, dict[str, Any]] = {
    "Lampadaire clignotant": {
        "keywords": ["clignot", "scintill", "vacille", "clignote"],
        "steps": [
            "Vérification des contacts et du ballast",
            "Remplacement du condensateur ou du starter",
            "Resserrement des connexions et contrôle de l'étanchéité",
        ],
        "means": "Équipe éclairage : 1 technicien, intervention rapide",
        "delay": "Intervention sous 72 h",
        "complexity": "Légère",
    },
    "Lampadaire éteint": {
        "keywords": ["éteint", "eteint", "ne s'allume", "ne s'allument", "ne fonctionne", "sombre", "pas de lumiere", "toujours eteint"],
        "steps": [
            "Vérification de la cellule photodétectrice",
            "Réglage ou remplacement du capteur crépusculaire",
            "Contrôle de la ligne d'alimentation jusqu'au luminaire",
        ],
        "means": "Équipe éclairage : 1 technicien, intervention standard",
        "delay": "Intervention sous 48 h",
        "complexity": "Modérée",
    },
    "Lampadaire cassé": {
        "keywords": ["casse", "cass", "bris", "fracass", "mat endommage", "lampadaire tombe", "couche", "arrache"],
        "steps": [
            "Sécurisation de la zone (balisage lumineux)",
            "Remplacement du mât ou du luminaire endommagé",
            "Raccordement électrique, test et mise en service",
        ],
        "means": "Équipe éclairage : nacelle + 2 techniciens",
        "delay": "Intervention sous 5 jours ouvrés",
        "complexity": "Importante",
    },
    "Colonne / câblage défectueux": {
        "keywords": ["cable", "cablage", "colonne", "coffret", "fusible", "court-circuit", "disjoncteur", "coupure", "odeur"],
        "steps": [
            "Mise hors tension sécurisée du circuit concerné",
            "Remplacement du câble ou de la colonne endommagée",
            "Réparation du coffret de commande",
            "Remise sous tension et vérifications complètes",
        ],
        "means": "Équipe éclairage : nacelle + 2 techniciens",
        "delay": "Intervention sous 48 h",
        "complexity": "Importante",
    },
    "Panne d'éclairage": {
        "keywords": ["panne", "éclairage", "eclairage", "lumiere", "ampoule", "diode", "led", "secteur"],
        "steps": [
            "Diagnostic de la colonne d'éclairage concernée",
            "Remplacement de l'ampoule ou du module LED",
            "Contrôle du circuit et du disjoncteur associé",
        ],
        "means": "Équipe éclairage : 1 technicien, intervention standard",
        "delay": "Intervention sous 48 h",
        "complexity": "Modérée",
    },
}

FALLBACK_STEPS = [
    "Inspection technique sur site",
    "Diagnostic de la nature de l'anomalie",
]

# Variation des phrases d'introduction (réponses naturelles)
INTROS = [
    "Très bien, voici mon conseil pour **{category}** :",
    "Avec plaisir, voici les travaux à prévoir pour **{category}** :",
    "C'est noté ! Pour **{category}**, je vous recommande les étapes suivantes :",
    "Je comprends. Voici ce que je vous conseille pour **{category}** :",
]

FOLLOW_UPS = [
    "Souhaitez-vous que je prépare ce signalement pour l'équipe électrique ?",
    "Voulez-vous que je transmette ce conseil dans un signalement pour l'équipe sur site ?",
    "Faut-il que je crée le signalement associé pour l'équipe d'intervention ?",
]

GREETING_REPLIES = [
    "Bonjour à vous ! Je suis LumaCI, votre agent d'assistance pour l'éclairage public. Décrivez-moi l'anomalie (ex. « lampadaire clignotant ») et je vous conseille les travaux à prévoir.",
    "Bonjour ! Comment puis-je vous aider ? Dites-moi quelle anomalie d'éclairage vous concerne, je vous donne aussitôt mes conseils.",
]

THANKS_REPLIES = [
    "Avec plaisir ! N'hésitez pas si une autre anomalie apparaît, je reste disponible pour vous conseiller.",
    "Je vous en prie, c'est avec plaisir. Je reste à votre disposition pour toute autre question.",
]

PRICE_REPLIES = [
    "Je ne donne pas de tarif : mon rôle est de vous **conseiller** sur les travaux à prévoir. L'équipe électrique confirmera le périmètre exact lors de sa visite.",
    "Désolé, je ne communique jamais de prix. Je peux en revanche vous indiquer les travaux à prévoir, leur complexité et le délai d'intervention souhaitable.",
]

PERI_REPLIES = [
    "Voici un exemple : décrivez l'anomalie, par exemple « **lampadaire clignotant rue des Fleurs** », et je vous conseille immédiatement les travaux à prévoir.",
    "Essayez « **lampe éteinte avenue de la République** » ou « **mât cassé** » : je vous détaille alors les étapes, les moyens et le délai.",
]

PRICE_WORDS = {"prix", "tarif", "tarifs", "cout", "coût", "montant", "devis", "facture", "payer", "combien", "€", "euros", "budget", "revient"}

GREETING_WORDS = {"bonjour", "salut", "coucou", "hello", "bonsoir", "hey"}

THANKS_WORDS = {"merci", "bonne journee", "super", "genial", "parfait", "top", "d'accord", "ok"}


def normalize(text: str) -> str:
    text = text.lower().strip()
    text = text.replace("'", " ")
    aliases = {
        " j'": "", " ne ": " ", " pas ": " ", " le ": " ", " la ": " ",
        " des ": " ", " un ": " ", " une ": " ",
    }
    for k, v in aliases.items():
        text = text.replace(k, v)
    return text


def detect_category_regex(message: str) -> str | None:
    n = normalize(message)
    for category, rule in KB.items():
        if any(kw in n for kw in rule["keywords"]):
            return category
    return None


def detect_intent_regex(message: str) -> str:
    n = normalize(message)
    if any(kw in n for kw in GREETING_WORDS) and len(message) <= 40:
        return "greeting"
    if any(kw in n for kw in THANKS_WORDS) and "travaux" not in n and "estim" not in n:
        return "thanks"
    if any(kw in n for kw in PRICE_WORDS):
        return "price"
    if any(kw in n for kw in ("estim", "travaux", "conseil", "quand", "delai", "reparer", "intervention")):
        return "estimate"
    if detect_category_regex(message) is not None:
        return "estimate"
    if not message.strip():
        return "empty"
    return "fallback"


def classify_intent(message: str) -> str:
    """Détection de l'intention par le modèle ML, avec repli sur les règles."""
    ml_intent, conf = predict_confidence(INTENT_MODEL, message)
    rx_intent = detect_intent_regex(message)

    # Le modèle ML est fiable sur les messages courts et bien couverts.
    if conf >= 0.55 and (len(message) <= 60 or rx_intent == "estimate"):
        if rx_intent == "price" and ml_intent != "price":
            # Une question de prix doit toujours être traitée comme telle.
            return "price"
        return ml_intent
    return rx_intent


def classify_category(message: str, fallback_to_regex: bool = True) -> str | None:
    """Détection de la catégorie d'anomalie lampadaire par le modèle ML."""
    ml_cat, conf = predict_confidence(CATEGORY_MODEL, message)
    if conf >= 0.45 and ml_cat in KB:
        return ml_cat
    if fallback_to_regex:
        return detect_category_regex(message)
    return None


def build_estimate_response(category: str) -> dict[str, Any]:
    rule = KB[category]
    steps = rule["steps"]
    intro = random.choice(INTROS).format(category=category)

    lines = [intro, ""]
    lines.append("### Diagnostic")
    lines.append(f"- Anomalie détectée : **{category}**")
    lines.append(f"- Complexité estimée : **{rule['complexity']}**")
    lines.append("")
    lines.append("### Travaux à prévoir")
    for step in steps:
        lines.append(f"- {step}")
    lines += ["", "### Moyens et délai"]
    lines += [f"- **Moyens à mobiliser** : {rule['means']}"]
    lines += [f"- **Délai souhaitable** : {rule['delay']}"]
    disclaimer = (
        "_Conseil technique indicatif : seule l'équipe sur site valide le périmètre "
        "définitif. L'assistant ne communique aucun tarif._"
    )
    lines += ["", disclaimer, ""]
    lines.append(random.choice(FOLLOW_UPS))

    reply = "\n".join(lines)

    return {
        "reply": reply,
        "intent": "estimate",
        "category": category,
        "estimate": {
            "category": category,
            "subCategory": None,
            "lines": [{"label": s} for s in steps],
            "mainWork": rule["means"],
            "delay": rule["delay"],
            "complexity": rule["complexity"],
            "disclaimer": (
                "Conseil technique indicatif des travaux à réaliser. "
                "Le périmètre définitif sera confirmé après visite technique de l'équipe éclairage."
            ),
        },
    }


def build_fallback_response() -> dict[str, Any]:
    steps = FALLBACK_STEPS
    reply = "\n".join([
        "Merci pour la précision. Je me concentre sur les **lampadaires** et l'éclairage public :",
        "",
        "- **Lampadaire clignotant** : s'allume et s'éteint par intermittence",
        "- **Lampadaire éteint** : ne s'allume plus du tout",
        "- **Lampadaire cassé** : mât, luminaire ou verre endommagé",
        "- **Colonne / câblage défectueux** : coffret, câbles, fusibles ou odeurs",
        "- **Panne d'éclairage** : ampoule ou module LED en cause",
        "",
        "Décrivez l'anomalie concernant votre lampadaire (ex. « le lampadaire de la place clignote ») et je vous détaille les travaux à prévoir.",
    ])
    return {
        "reply": reply,
        "intent": "fallback",
        "category": None,
        "estimate": {
            "category": "Éclairage public (autre)",
            "subCategory": None,
            "lines": [{"label": s} for s in steps],
            "mainWork": "Équipe éclairage : 1 technicien",
            "delay": "Estimée après inspection sur site",
            "complexity": "Modérée",
            "disclaimer": (
                "Conseil technique indicatif. Le périmètre définitif sera confirmé après visite technique de l'équipe éclairage."
            ),
        },
    }


class HistoryMessage(BaseModel):
    role: str
    text: str


class AssistantRequest(BaseModel):
    message: str
    history: list[HistoryMessage] = []
    report: dict[str, Any] | None = None


class AssistantResponse(BaseModel):
    reply: str
    intent: str
    category: str | None = None
    estimate: dict[str, Any] | None = None


@app.get("/api/assistant/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "luma-ci-assistant"}


@app.post("/api/assistant", response_model=AssistantResponse)
def assistant(req: AssistantRequest) -> AssistantResponse:
    message = req.message.strip()

    # Si un signalement est fourni (sélectionné dans l'interface), on répond
    # directement avec le conseil associé.
    if req.report:
        cat = req.report.get("subCategory") or req.report.get("category") or "Panne d'éclairage"
        base = build_estimate_response(cat)
        title = req.report.get("title") or "ce signalement"
        base["reply"] = f"J'ai analysé le signalement **{title}** ({cat}).\n\n{base['reply']}"
        return AssistantResponse(**base)

    intent = classify_intent(message)

    if intent == "greeting":
        return AssistantResponse(reply=random.choice(GREETING_REPLIES), intent=intent)
    if intent == "thanks":
        return AssistantResponse(reply=random.choice(THANKS_REPLIES), intent=intent)
    if intent == "price":
        return AssistantResponse(reply=random.choice(PRICE_REPLIES), intent=intent)
    if intent == "estimate":
        category = classify_category(message)
        if category:
            return AssistantResponse(**build_estimate_response(category))
        return AssistantResponse(**build_fallback_response())
    return AssistantResponse(**build_fallback_response())