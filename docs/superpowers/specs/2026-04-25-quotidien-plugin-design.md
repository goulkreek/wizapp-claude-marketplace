# Design — Plugin `quotidien`

**Date** : 2026-04-25
**Auteur** : Sébastien Royer
**Statut** : Approuvé pour implémentation

## Contexte et objectif

Plugin Claude Code à publier dans la marketplace `wizapp-claude-marketplace` pour résoudre une friction quotidienne précise : **le démarrage de journée**. L'utilisateur veut un briefing matinal qui agrège ses sources prioritaires (Gmail, ClickUp, GitHub) et propose un plan d'attaque concret.

### Friction adressée

> Au démarrage d'une journée pro, identifier rapidement quoi traiter en premier sans avoir à ouvrir 3 onglets et trier manuellement.

### Hors scope (v1)

- Google Calendar (réunions du jour) — pourra être ajouté en v2
- Notion (notes en attente) — pas dans le périmètre
- Vercel (déploiements) — pas dans le périmètre
- Actions automatiques (archivage emails, marquage tickets) — rapport uniquement, pas d'écriture
- Mode "fin de journée" / standup — autre plugin potentiellement

## Architecture retenue

Option 3 : **Agent + Commande slash + Skill de priorisation**.

```
plugins/quotidien/
├── .claude-plugin/
│   └── plugin.json
├── README.md
├── commands/
│   └── quotidien.md            # /quotidien — raccourci slash
├── agents/
│   └── daily-briefer.md        # orchestre la collecte et le rapport
└── skills/
    └── prioritization-rules/
        └── SKILL.md            # heuristiques de priorisation
```

**Justification** : la skill isole les règles de priorisation (qui évolueront avec l'usage) du prompt de l'agent (qui reste stable). La commande sert de raccourci ergonomique pour l'usage quotidien, l'agent reste invocable en langage naturel ou par d'autres workflows futurs.

### Mises à jour à la racine du repo

- `marketplace.json` — ajouter une entrée dans `plugins[]`
- `README.md` — ajouter une ligne dans le tableau des plugins

## Composant 1 — Métadonnées du plugin

### `plugin.json`

```json
{
  "name": "quotidien",
  "version": "1.0.0",
  "description": "Briefing matinal automatique : emails prioritaires, tickets ClickUp et PRs GitHub avec recommandations d'attaque",
  "author": { "name": "WizApp", "email": "dev@wizapp.com" },
  "keywords": ["productivity", "briefing", "clickup", "gmail", "github"]
}
```

### Entrée `marketplace.json`

```json
{
  "name": "quotidien",
  "description": "Briefing matinal automatique : emails prioritaires, tickets ClickUp et PRs GitHub avec recommandations d'attaque",
  "version": "1.0.0",
  "author": { "name": "WizApp", "email": "dev@wizapp.com" },
  "source": "./plugins/quotidien",
  "category": "productivity"
}
```

### Ligne du tableau racine `README.md`

```
| [quotidien](./plugins/quotidien/) | Briefing matinal : emails, tickets ClickUp, PRs GitHub avec plan d'attaque |
```

## Composant 2 — Commande `/quotidien`

**Rôle** : raccourci ergonomique. Délègue immédiatement à l'agent `daily-briefer`.

**Fichier** : `commands/quotidien.md`

```markdown
---
description: Génère le briefing matinal (emails, tickets ClickUp, PRs GitHub)
argument-hint: [période?]
allowed-tools: Task
---

Invoque l'agent `daily-briefer` pour produire le briefing du jour.

Argument optionnel `$ARGUMENTS` :
- vide ou "today" → briefing du jour (par défaut)
- "week" → briefing élargi à la semaine
- "late" → uniquement ce qui est en retard

Délègue immédiatement à l'agent et retourne sa réponse telle quelle.
```

**Modes d'usage** :
- `/quotidien` — cas par défaut (95% des usages)
- `/quotidien week` — vue semaine
- `/quotidien late` — focus retards

## Composant 3 — Agent `daily-briefer`

**Rôle** : orchestre la collecte multi-sources, applique les règles de priorisation, produit le rapport synthétique avec recommandations.

**Frontmatter** :

```yaml
---
name: daily-briefer
description: Use this agent for the daily morning briefing. Aggregates priority emails (Gmail), actionable tickets (ClickUp), and pending PRs (GitHub), then produces a synthesized report with attack recommendations. Examples: <example>user: "fais-moi le brief du jour" → assistant invokes daily-briefer</example> <example>user: "/quotidien" → command delegates to daily-briefer</example>
model: inherit
color: blue
tools: ["mcp__claude_ai_Gmail__search_threads", "mcp__claude_ai_Gmail__get_thread", "mcp__clickup__get_workspace_tasks", "mcp__clickup__get_task", "Bash", "Skill"]
---
```

**Outils — justification** :

| Outil | Usage |
|-------|-------|
| `mcp__claude_ai_Gmail__search_threads` | Filtrer les non-lus prioritaires (filtre Gmail intégré, pas besoin de `list_labels`) |
| `mcp__claude_ai_Gmail__get_thread` | Creuser un fil suspect (sujet ambigu) |
| `mcp__clickup__get_workspace_tasks` | Récupérer tickets assignés, statut, échéance |
| `mcp__clickup__get_task` | Détail si besoin |
| `Bash` | `gh pr list` (pas de MCP GitHub configuré) |
| `Skill` | Charger `prioritization-rules` |

**Configuration ClickUp** :
- Workspace hardcodé : `WizApp` (ID `2409053`)
- À modifier dans le prompt système de l'agent si autre workspace nécessaire

**Flux d'exécution (prompt système)** :

1. **Charger les règles** : invoquer la skill `prioritization-rules` pour avoir les heuristiques en contexte
2. **Collecter en parallèle** (3 appels simultanés) :
   - Gmail : `is:unread -category:promotions -category:social newer_than:7d`
   - ClickUp : tâches assignées à l'utilisateur, statut "à faire" ou "en cours", échéance ≤ aujourd'hui+7j, workspace `2409053`
   - GitHub : `gh pr list --search "review-requested:@me is:open" --json number,title,url,createdAt` + `gh pr list --author @me --json number,title,url,statusCheckRollup,reviewDecision,mergeable`
3. **Appliquer les règles de priorisation** (de la skill chargée à l'étape 1)
4. **Produire le rapport** au format défini ci-dessous (Composant 5)
5. **Conclure par 2-3 recommandations d'attaque concrètes** — pas d'action exécutée, juste suggestions

**Adaptation selon argument** :
- `today` (défaut) : critique + à démarrer aujourd'hui
- `week` : ajoute statut "fait" pour visibilité hebdo, élargit la fenêtre échéance à 14j
- `late` : filtre uniquement échéances dépassées et CI rouges

## Composant 4 — Skill `prioritization-rules`

**Rôle** : contenir les heuristiques de filtrage et priorisation, séparées du prompt de l'agent. Évolutive sans toucher à l'agent.

**Frontmatter** :

```yaml
---
name: prioritization-rules
description: Heuristiques de priorisation pour le briefing matinal — détermine ce qui est urgent/important parmi emails Gmail, tickets ClickUp et PRs GitHub. À invoquer par l'agent daily-briefer avant de produire le rapport.
---
```

### Règles — Emails Gmail

**Inclure** : non-lus de < 7 jours, hors catégories `promotions` et `social`.

**Marqueurs critique (🔴)** :
- Expéditeur dans liste manuelle "VIP" (vide en v1, à compléter par l'utilisateur)
- Sujet contient : `urgent`, `asap`, `bloqué`, `critique`, `prod down`, `incident`
- Dans un thread où l'utilisateur est en TO (pas seulement CC)

**Marqueurs attention (🟡)** :
- Mention explicite de `@sebastien` ou prénom dans le corps
- Demande explicite (point d'interrogation dans le sujet)

**Bruit groupé (🟢, sans détail)** :
- Notifications GitHub/Linear/CI
- Newsletters
- Digests

### Règles — Tickets ClickUp (workspace `2409053`)

**Critique (🔴)** :
- Statut "en cours" ET échéance dépassée
- Priorité `urgent` (priority 1) assignée à l'utilisateur

**À démarrer aujourd'hui (🟡)** :
- Statut "à faire" + échéance = aujourd'hui
- Statut "en cours" sans activité depuis 3+ jours (champ `date_updated` ClickUp, risque stagnation)

**À surveiller (🟢)** :
- Échéance dans 2-7 jours, pas encore démarrés

**Ignorer** : statut "fait", "annulé", "backlog" (sauf si `/quotidien week`).

### Règles — PRs GitHub

**Reviews demandées** :
- 🔴 PRs où je suis reviewer demandé, ouvertes depuis > 24h (champ `createdAt`)
- 🟡 PRs où je suis reviewer demandé, < 24h

**Mes PRs** :
- 🔴 CI échoue (statusCheckRollup = FAILURE)
- 🔴 Approuvées et mergeable (action immédiate : merger)
- 🟢 En attente de review depuis > 3 jours (relance suggérée)
- 🟡 Conflits (à rebaser)

### Règles — Recommandations d'attaque

Format : `Suggestion : commencer par [item nommé] parce que [raison concrète]`.

Critères de choix (ordre) :
1. Critique > échéance proche > effort faible > contexte déjà chargé
2. Toujours nommer **le premier item à traiter** (PR #1234, ticket CU-abc, email de Marie), pas une catégorie vague
3. Maximum 3 recommandations

### Personnalisation future

Les listes "VIP emails" et marqueurs spécifiques pourront être surchargés via un fichier `prioritization-rules.local.md` à côté du `SKILL.md` (pattern plugin-settings). Pas dans la v1.

## Composant 5 — Format de sortie du briefing

Un seul message Markdown structuré, scanable en 30 secondes. Pas d'introduction, pas de récap final.

```markdown
# Briefing du <date> · <heure>

## Critique (à traiter en priorité)
- 🔴 [PR] #1234 — Auth refactor : CI échoue (3 tests rouges) → github.com/...
- 🔴 [Ticket] CU-abc123 — Migration DB en cours, échéance hier → app.clickup.com/...
- 🔴 [Email] Marie Dupont (client) — "Prod down sur staging" il y a 2h → mail.google.com/...

## À démarrer aujourd'hui
- 🟡 [Ticket] CU-def456 — Implémenter export CSV (échéance: aujourd'hui, 4h estimées)
- 🟡 [PR] #1240 — Review demandée par @alice (ouverte hier)

## À surveiller
- 🟢 [Ticket] CU-ghi789 — Refacto auth (échéance: vendredi, pas démarré)
- 🟢 [PR] #1235 — Mes PR en attente de review depuis 4j (relance suggérée)

## Bruit groupé
- 12 notifications GitHub (CI, mentions auto)
- 3 newsletters
- 1 digest Linear

---

## Plan d'attaque suggéré

1. **Commencer par PR #1234** — la CI bloque tout downstream, ~30 min de fix probable
2. **Puis email Marie Dupont** — réponse rapide ou escalade, ne laisse pas trainer
3. **Ensuite CU-def456** — créneau 4h en PM si calendrier libre

_Source : 8 emails analysés · 12 tickets · 5 PRs · règles via prioritization-rules_
```

**Décisions de format** :
- 3 niveaux visuels (🔴 / 🟡 / 🟢) au lieu d'un score numérique
- 1 ligne par item, préfixe de type uniforme `[PR]` / `[Ticket]` / `[Email]`
- Lien direct en fin de ligne
- Section vide = ligne supprimée (pas de "Aucun email critique" qui pollue)
- Bruit groupé sans détail
- Plan d'attaque limité à 3 items max
- Footer compteurs ultra-discret

## Composant 6 — README du plugin

**Sections** (`plugins/quotidien/README.md`) :

1. **Description** — 1 paragraphe : ce que fait le plugin, pour qui
2. **Prérequis** :
   - MCP Gmail authentifié
   - MCP ClickUp authentifié avec accès workspace WizApp
   - CLI `gh` installé et authentifié pour GitHub
3. **Composants** : 1 commande, 1 agent, 1 skill (1 ligne chacun)
4. **Utilisation** :
   - `/quotidien` — briefing du jour
   - `/quotidien week` — briefing semaine
   - `/quotidien late` — focus retards
   - Invocation langage naturel : "fais-moi le brief du jour"
5. **Configuration** — workspace ClickUp hardcodé `2409053` (WizApp), procédure pour modifier
6. **Personnalisation** — comment éditer `prioritization-rules/SKILL.md` (VIP, marqueurs urgence)
7. **Limitations connues** :
   - Pas de Google Calendar dans la v1
   - Pas d'actions automatiques (rapport uniquement)
   - Workspace ClickUp unique (pas de multi-workspace)

## Critères de réussite

- `/quotidien` produit un rapport complet en < 30s
- Aucune donnée sensible exposée (pas de body d'email entier dans le rapport)
- Le rapport tient en un écran (max ~25 lignes hors footer)
- Les liens sont cliquables et mènent à la bonne ressource
- L'agent gère gracieusement l'absence d'un MCP (ex: ClickUp inaccessible → section vide + warning explicite, pas d'erreur bloquante)

## Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Bruit dans le rapport (trop d'items) | Règles de priorisation strictes, sections "À surveiller" et "Bruit groupé" pour reléguer |
| Faux positifs sur les emails urgents | Liste VIP éditable, marqueurs basés sur sujet (pas sur ML) |
| MCP indisponible | Section vide avec warning, pas d'erreur fatale |
| Workspace ClickUp changeant | Hardcodé en v1, déplaçable dans une config plus tard |
| Rate limits API | Appels en parallèle mais bornés, pas de pagination agressive |

## Évolutions possibles (hors scope v1)

- v1.1 : Ajout de Google Calendar (réunions du jour, préparation requise)
- v1.2 : Mode "fin de journée" (`/quotidien fin`) — résumé fait, prépa standup
- v1.3 : Fichier de config local (`prioritization-rules.local.md`) pour VIP et règles persos
- v1.4 : Action semi-automatique (archivage emails de notif après confirmation)
- v2.0 : Hook quotidien auto qui pose le briefing dans Notion à 8h
