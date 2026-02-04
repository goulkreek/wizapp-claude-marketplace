# React Component Plugin

Plugin Claude Code pour la création standardisée de composants React UI.

## Fonctionnalités

- **Standardisation** : Génère des composants suivant des conventions cohérentes
- **Réutilisabilité** : Vérifie les composants existants avant d'en créer de nouveaux
- **Tailwind CSS** : Utilise cn/clsx pour la gestion des classes conditionnelles

## Commandes

### `/create-component`

Crée un nouveau composant React UI standardisé.

```bash
/create-component Button
/create-component UserAvatar
```

### `/find-component`

Recherche des composants similaires dans le codebase.

```bash
/find-component button
/find-component card avec image
```

## Agent

### Component Reuse Checker

Agent proactif qui s'active automatiquement quand vous demandez de créer un composant React. Il analyse le codebase pour :

- Identifier les composants similaires existants
- Suggérer des extensions plutôt que des créations
- Éviter la duplication de code

## Configuration

Créez un fichier `.claude/react-component.local.md` pour personnaliser le comportement :

```yaml
---
componentsPath: src/components
namingConvention: PascalCase
fileExtension: tsx
---
```

## Conventions appliquées

- **Structure** : Fichier unique par composant (Button.tsx)
- **Types** : `export interface Props extends ComponentPropsWithoutRef<'element'>`
- **Composant** : `export const Component: FC<Props> = () => {}`
- **Styling** : Tailwind CSS avec `cn()` de `@/lib/utils`
- **Props** : Interface exportée pour permettre l'héritage
- **Export** : Named export (pas de default)

## Installation

```bash
claude --plugin-dir /chemin/vers/react-component
```

Ou copiez le dossier dans `.claude-plugin/` de votre projet.
