# WizApp Claude Code Plugins

Collection de plugins Claude Code pour étendre vos capacités de développement.

## Plugins disponibles

Voir le [catalogue des plugins](./plugins/README.md) pour la liste complète.

| Plugin | Description |
|--------|-------------|
| [react-component](./plugins/react-component/) | Création standardisée de composants React UI avec vérification de réutilisabilité |

## Installation

```
/plugin marketplace add goulkreek/wizapp-claude-marketplace
```

```bash
# Cloner le repo
git clone https://github.com/wizapp/wizapp-claude-marketplace.git

# Utiliser un plugin
claude --plugin-dir ./wizapp-claude-marketplace/plugins/react-component
```

## Structure

```
plugins/
└── plugin-name/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── README.md
    ├── commands/
    ├── agents/
    ├── skills/
    └── hooks/
```

## Contribuer

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour créer un nouveau plugin.

## Licence

MIT
