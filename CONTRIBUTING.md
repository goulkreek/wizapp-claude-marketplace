# Guide de contribution

Merci de contribuer à la WizApp Claude Code Marketplace !

## Créer un nouveau plugin

### 1. Structure minimale

```bash
plugins/mon-plugin/
├── .claude-plugin/
│   └── plugin.json          # Obligatoire
├── README.md                 # Obligatoire
└── commands/                 # Au moins un type de composant
    └── ma-commande.md
```

### 2. Manifeste plugin.json

```json
{
  "name": "mon-plugin",
  "version": "1.0.0",
  "description": "Description claire et concise",
  "author": {
    "name": "Votre Nom",
    "email": "email@example.com"
  },
  "keywords": ["mot-clé-1", "mot-clé-2"]
}
```

### 3. README.md du plugin

Votre README doit inclure :

- Description du plugin
- Liste des fonctionnalités (commands, agents, skills)
- Instructions d'installation
- Exemples d'utilisation
- Configuration (si applicable)

### 4. Mettre à jour marketplace.json

Ajoutez votre plugin dans le fichier `marketplace.json` à la racine :

```json
{
  "name": "mon-plugin",
  "version": "1.0.0",
  "description": "Description",
  "path": "plugins/mon-plugin",
  "author": "Votre Nom",
  "keywords": ["keyword"],
  "categories": ["development"],
  "features": {
    "skills": 0,
    "commands": 1,
    "agents": 0,
    "hooks": 0
  }
}
```

## Types de composants

### Commands (commandes slash)

Fichier Markdown avec frontmatter YAML :

```markdown
---
description: Description pour /help
argument-hint: [argument]
allowed-tools: Read, Write, Grep
---

Instructions pour Claude...
```

### Agents

Fichier Markdown avec configuration :

```markdown
---
name: mon-agent
description: Use this agent when... Examples: <example>...</example>
model: inherit
color: blue
tools: ["Read", "Grep"]
---

System prompt de l'agent...
```

### Skills

Dossier avec SKILL.md :

```
skills/mon-skill/
├── SKILL.md              # Obligatoire
├── references/           # Documentation détaillée
└── examples/             # Exemples de code
```

### Hooks

Configuration JSON dans `hooks/hooks.json`.

## Conventions de code

### Nommage

- Plugins : `kebab-case` (ex: `react-component`)
- Fichiers : `kebab-case.md` (ex: `create-component.md`)
- Skills : Dossier en `kebab-case` avec `SKILL.md`

### Documentation

- Écrire en français ou anglais (cohérent dans tout le plugin)
- Inclure des exemples concrets
- Documenter toutes les options/arguments

## Process de Pull Request

1. Fork le repository
2. Créez une branche : `git checkout -b feat/mon-plugin`
3. Développez votre plugin
4. Testez localement : `claude --plugin-dir ./plugins/mon-plugin`
5. Commit : `git commit -m "feat(mon-plugin): description"`
6. Push et créez une PR

## Checklist avant PR

- [ ] `plugin.json` valide (tester avec `python -m json.tool`)
- [ ] README.md complet
- [ ] Plugin testé avec Claude Code
- [ ] `marketplace.json` mis à jour
- [ ] Pas de données sensibles (clés API, credentials)

## Questions ?

Ouvrez une issue sur GitHub.
