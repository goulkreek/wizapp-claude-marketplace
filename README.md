# Claude Code Marketplace

Une collection de plugins et skills pour étendre les fonctionnalités de Claude Code.

## Structure

```
plugins/
├── <nom-plugin>/
│   ├── README.md          # Documentation du plugin
│   ├── skill.md           # Définition du skill Claude Code
│   └── ...                # Fichiers additionnels
```

## Installation

Pour installer un plugin, copiez le contenu du dossier du plugin dans votre configuration Claude Code :

```bash
cp -r plugins/<nom-plugin>/* ~/.claude/commands/
```

## Plugins disponibles

*Aucun plugin pour le moment. Les plugins seront ajoutés prochainement.*

## Contribution

1. Créez un nouveau dossier dans `plugins/`
2. Ajoutez un `README.md` décrivant votre plugin
3. Ajoutez les fichiers de skill nécessaires
4. Soumettez une Pull Request

## Licence

MIT
