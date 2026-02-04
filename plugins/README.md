# WizApp Claude Code Plugins

Ce répertoire contient des plugins Claude Code développés par WizApp pour étendre les fonctionnalités de Claude Code avec des commandes, agents et workflows personnalisés.

## Qu'est-ce qu'un plugin Claude Code ?

Les plugins Claude Code sont des extensions qui ajoutent des commandes slash, des agents spécialisés, des hooks et des serveurs MCP. Les plugins peuvent être partagés entre projets et équipes.

Pour en savoir plus, consultez la [documentation officielle des plugins](https://docs.anthropic.com/en/docs/claude-code/plugins).

## Plugins disponibles

| Nom | Description | Contenu |
|-----|-------------|---------|
| [react-component](./react-component/) | Création standardisée de composants React UI avec vérification de réutilisabilité | **Commands:** `/create-component`, `/find-component` - Créer et rechercher des composants<br>**Agent:** `component-reuse-checker` - Vérifie proactivement les composants existants avant création<br>**Skill:** `react-ui-patterns` - Patterns et conventions pour composants React |

## Installation

Ces plugins peuvent être utilisés de plusieurs façons :

### Option 1 : Utilisation directe

```bash
# Cloner le repo
git clone https://github.com/wizapp/wizapp-claude-marketplace.git

# Utiliser un plugin spécifique
claude --plugin-dir ./wizapp-claude-marketplace/plugins/react-component
```

### Option 2 : Installation dans un projet

```bash
# Copier le plugin dans votre projet
cp -r ./wizapp-claude-marketplace/plugins/react-component ./.claude-plugin/
```

### Option 3 : Installation globale

```bash
# Copier dans la configuration utilisateur
cp -r ./wizapp-claude-marketplace/plugins/react-component ~/.claude/plugins/
```

## Structure des plugins

Chaque plugin suit la structure standard Claude Code :

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Métadonnées du plugin
├── commands/                # Commandes slash (optionnel)
├── agents/                  # Agents spécialisés (optionnel)
├── skills/                  # Skills Claude Code (optionnel)
├── hooks/                   # Gestionnaires d'événements (optionnel)
├── .mcp.json                # Configuration MCP (optionnel)
└── README.md                # Documentation du plugin
```

## Contribuer

Pour ajouter un nouveau plugin :

1. Suivez la structure standard des plugins
2. Incluez un README.md complet
3. Ajoutez les métadonnées dans `.claude-plugin/plugin.json`
4. Documentez toutes les commandes et agents
5. Fournissez des exemples d'utilisation

Voir [CONTRIBUTING.md](../CONTRIBUTING.md) pour plus de détails.

## En savoir plus

- [Documentation Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Documentation des plugins](https://docs.anthropic.com/en/docs/claude-code/plugins)
