# Bee — Design System

Référence complète des couleurs, typographies et composants pour la marketplace Bee (Cameroun).
Stack ciblée : Next.js 14 + Tailwind CSS + Poppins/Inter.

---

## 1. Philosophie visuelle

- **Orange = action et énergie** — réservé aux CTA, prix, promos, états critiques.
- **Teal = différenciation premium** — badges Elite, statuts spéciaux, accents secondaires.
- **Neutres slate (bleutés)** — fond et texte. Pas de gris pur, pas de noir pur.
- **Règle 60-30-10** — 60% neutres, 30% surfaces blanches/sombres, 10% orange.
- **Mobile-first** — boutons tactiles ≥ 48px, contraste WCAG AA minimum.
- **Dark mode obligatoire** — toggle utilisateur + lié au mode éco batterie < 20%.

---

## 2. Palette de couleurs

### 2.1 Primaire — Orange (action)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#FFF7ED` | Backgrounds très subtils, badges légers |
| `primary-100` | `#FFEDD5` | Hover backgrounds, alertes douces |
| `primary-200` | `#FED7AA` | Borders accentuées, états hover |
| `primary-300` | `#FDBA74` | Illustrations, accents |
| `primary-400` | `#FB923C` | Variations |
| `primary-500` | `#F97316` | **CTA principal, prix, logo** |
| `primary-600` | `#EA580C` | Hover boutons primaires |
| `primary-700` | `#C2410C` | Pressed states, texte sur fond orange clair |
| `primary-800` | `#9A3412` | Texte foncé sur primary-100/200 |
| `primary-900` | `#7C2D12` | Texte très foncé, états sombres |

### 2.2 Secondaire — Teal (différenciation)

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary-50` | `#F0FDFA` | Backgrounds éco/info |
| `secondary-100` | `#CCFBF1` | Badges éco, alertes positives |
| `secondary-200` | `#99F6E4` | Variations |
| `secondary-300` | `#5EEAD4` | Accents |
| `secondary-400` | `#2DD4BF` | Variations |
| `secondary-500` | `#14B8A6` | **Badge Elite, cashback, statut "en route"** |
| `secondary-600` | `#0D9488` | Hover sur secondary-500 |
| `secondary-700` | `#0F766E` | Texte sur fond teal clair |
| `secondary-800` | `#115E59` | Texte foncé |
| `secondary-900` | `#134E4A` | Backgrounds dark mode pour cards teal |

### 2.3 Neutres — Light mode

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#F8FAFC` | Fond principal de page |
| `surface` | `#FFFFFF` | Cards, modales, surfaces élevées |
| `surface-muted` | `#F1F5F9` | Surfaces secondaires, sections |
| `border` | `#E2E8F0` | Bordures fines (default) |
| `border-strong` | `#CBD5E1` | Bordures hover, séparateurs marqués |
| `text` | `#0F172A` | Texte principal (titres, body) |
| `text-secondary` | `#64748B` | Texte secondaire, labels |
| `text-muted` | `#94A3B8` | Placeholders, hints |

### 2.4 Neutres — Dark mode

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0F172A` | Fond principal de page |
| `surface` | `#1E293B` | Cards, modales |
| `surface-muted` | `#334155` | Surfaces secondaires |
| `border` | `#334155` | Bordures fines |
| `border-strong` | `#475569` | Bordures marquées |
| `text` | `#F1F5F9` | Texte principal |
| `text-secondary` | `#94A3B8` | Texte secondaire |
| `text-muted` | `#64748B` | Placeholders, hints |

### 2.5 Couleurs sémantiques

| Token | Hex (500) | Hex (light bg) | Usage |
|-------|-----------|----------------|-------|
| `success` | `#10B981` | `#D1FAE5` | Validations, "En stock", livraison réussie |
| `error` | `#EF4444` | `#FEE2E2` | Erreurs, échecs, suspensions, prix barrés (alt) |
| `warning` | `#F59E0B` | `#FEF3C7` | Alertes, étoiles avis, batterie faible |
| `info` | `#3B82F6` | `#DBEAFE` | Notifications neutres, tooltips |

---

## 3. Typographie

### 3.1 Polices

- **Poppins** — Titres et éléments à fort impact (prix, headings, logo).
  Poids utilisés : 500, 600, 700.
- **Inter** — Body, UI, labels, navigation.
  Poids utilisés : 400, 500, 600.

### 3.2 Hiérarchie

| Niveau | Taille (mobile) | Taille (desktop) | Poids | Police | Letter-spacing |
|--------|-----------------|------------------|-------|--------|----------------|
| `h1` | 28px | 40px | 700 | Poppins | -0.025em |
| `h2` | 24px | 30px | 600 | Poppins | -0.02em |
| `h3` | 20px | 24px | 600 | Poppins | -0.015em |
| `h4` | 18px | 20px | 600 | Poppins | -0.01em |
| `body` | 16px | 16px | 400 | Inter | 0 |
| `body-strong` | 16px | 16px | 500 | Inter | 0 |
| `small` | 14px | 14px | 400 | Inter | 0 |
| `caption` | 12px | 12px | 500 | Inter | 0.02em |
| `price` | 16px | 18px | 600 | Poppins | -0.01em |

### 3.3 Line-height

- Titres : `1.2` (compact, fort impact)
- Body : `1.5` à `1.6` (lisibilité)
- Boutons : `1` (centré)

### 3.4 Configuration Next.js (next/font)

```typescript
// app/fonts.ts
import { Poppins, Inter } from 'next/font/google'

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})
```

```tsx
// app/layout.tsx
import { poppins, inter } from './fonts'

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-inter">{children}</body>
    </html>
  )
}
```

---

## 4. Espacement et layout

### 4.1 Spacing scale (Tailwind standard, conservée)

| Token | Valeur | Usage typique |
|-------|--------|---------------|
| `1` | 4px | Gaps très serrés |
| `2` | 8px | Gaps internes composants |
| `3` | 12px | Padding boutons, gaps cards |
| `4` | 16px | Padding standard, marges sections |
| `6` | 24px | Espacement entre sections |
| `8` | 32px | Sections principales |
| `12` | 48px | Séparation gros blocs |
| `16` | 64px | Hero, séparations majeures |

### 4.2 Border radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `radius-sm` | 6px | Badges, pills |
| `radius-md` | 8px | Boutons, inputs |
| `radius-lg` | 12px | Cards petites, alerts |
| `radius-xl` | 16px | Cards produits, modales |
| `radius-2xl` | 24px | Hero, banners flash |
| `radius-full` | 9999px | Avatars, boutons icônes |

### 4.3 Touch targets (mobile)

- **Minimum 48×48 px** pour tout élément cliquable (Material Design + Apple HIG).
- Inputs et boutons : hauteur 48px minimum sur mobile.
- Espacement entre cibles cliquables : 8px minimum.

### 4.4 Box shadows (light mode uniquement)

```css
--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.06);
--shadow-lg: 0 10px 32px rgba(15, 23, 42, 0.08);
```

En dark mode : pas d'ombres, on délimite avec `border` à la place.

### 4.5 Transitions

- Standard : `transition: all 0.2s ease`
- Hover boutons : `0.15s ease`
- Animations modales : `0.3s cubic-bezier(0.16, 1, 0.3, 1)`

---

## 5. Composants — Recettes

### 5.1 Boutons

**Primary (CTA principal — Acheter, Ajouter au panier)**
- Light & Dark : bg `primary-500`, texte `#FFFFFF`, radius `md`
- Hover : bg `primary-600`
- Pressed : bg `primary-700`, scale `0.98`
- Disabled : bg `primary-500` opacity `0.5`

**Secondary (action secondaire)**
- Light : bg transparent, border `border`, texte `text`
- Dark : bg transparent, border `border`, texte `text`
- Hover : bg `surface-muted`

**Outline ghost (action tertiaire)**
- Bg transparent, pas de border
- Texte `primary-500`
- Hover : bg `primary-50` (light) / `primary-900/30` (dark)

**Danger**
- Bg `error` (#EF4444), texte blanc
- Pour suspensions, suppressions, refus

### 5.2 Cards

**Card produit standard**
```css
background: var(--surface);
border: 1px solid var(--border);
border-radius: 16px;
overflow: hidden;
/* Light mode uniquement */
box-shadow: var(--shadow-sm);
transition: transform 0.2s ease, box-shadow 0.2s ease;
```
Hover : `translateY(-2px)`, `shadow-md`.

**Card dashboard / stats**
- Padding `16px` (mobile) / `24px` (desktop)
- Border-radius `12px`
- Header : titre `h4` Poppins + valeur `h2` Poppins
- Optionnel : indicateur tendance (success/error)

### 5.3 Inputs

```css
height: 48px;
padding: 0 16px;
border: 1px solid var(--border);
border-radius: 8px;
background: var(--surface);
font: 400 16px/1.5 Inter;
color: var(--text);
```
- Focus : border `primary-500`, ring `0 0 0 3px primary-500/20`
- Error : border `error`
- Disabled : opacity `0.5`, cursor `not-allowed`

### 5.4 Badges (génériques)

```css
padding: 4px 10px;
border-radius: 6px;
font: 600 12px/1 Inter;
letter-spacing: 0.02em;
```

### 5.5 Alerts

| Type | Bg light | Border light | Texte light | Bg dark | Texte dark |
|------|----------|--------------|-------------|---------|------------|
| Info | `#DBEAFE` | `#3B82F6` | `#1E40AF` | `#1E3A8A` | `#BFDBFE` |
| Success | `#D1FAE5` | `#10B981` | `#065F46` | `#064E3B` | `#A7F3D0` |
| Warning | `#FEF3C7` | `#F59E0B` | `#92400E` | `#78350F` | `#FDE68A` |
| Error | `#FEE2E2` | `#EF4444` | `#991B1B` | `#7F1D1D` | `#FECACA` |

---

## 6. Patterns spécifiques Bee

### 6.1 Tier badges vendeur

| Tier | Bg | Texte | Logique |
|------|-----|-------|---------|
| **Start** | `surface-muted` (`#F1F5F9` / `#334155`) | `text-secondary` | Neutre, pas d'attention spéciale |
| **Pro** | `primary-500` (`#F97316`) | `#FFFFFF` | Couleur de marque, montée en importance |
| **Elite** | `secondary-500` (`#14B8A6`) | `#FFFFFF` | Différenciation forte par contraste chaud/froid |

### 6.2 Tier badges livreur

| Tier | Bg | Texte |
|------|-----|-------|
| **Freelance** | `surface-muted` | `text-secondary` |
| **Premium** | `secondary-500` | `#FFFFFF` |
| **Fiable** (50 livraisons clean) | `success` (#10B981) | `#FFFFFF` |

### 6.3 Flash sale banner

- Bg : `primary-500` plein OU dégradé `primary-500 → #FB923C` (amber-400)
- Border-radius : `radius-2xl` (24px)
- Texte principal : Poppins 700, `#FFFFFF`
- Sous-texte : Inter 400, `primary-100` (`#FFEDD5`)
- Timer : pill blanche, texte `primary-700`

### 6.4 Prix produits

- Prix actuel : Poppins 600, `primary-500`, taille selon contexte
- Prix barré : Inter 400, `text-muted`, `text-decoration: line-through`, taille 80% du prix actuel
- Cashback : Inter 500, `secondary-500`, taille `12px` ou `caption`

### 6.5 États commande / livraison

| État | Couleur | Usage |
|------|---------|-------|
| En attente | `warning` (#F59E0B) | Validation vendeur en cours |
| Acceptée | `info` (#3B82F6) | Vendeur a accepté |
| En préparation | `primary-500` | Préparation en cours |
| En route | `secondary-500` | Livreur en chemin |
| Livrée | `success` (#10B981) | Confirmée |
| Litige | `error` (#EF4444) | Problème ouvert |

### 6.6 Tiers d'enchères

- Enchère classique : badge `info`
- Enchère décroissante : badge `primary-500`
- Enchère gagnée : badge `success`
- Enchère perdue : `text-muted`

---

## 7. Code prêt à coller

### 7.1 `globals.css` (Tailwind v4 — recommandé)

```css
@import "tailwindcss";

@theme {
  /* Polices */
  --font-poppins: 'Poppins', system-ui, sans-serif;
  --font-inter: 'Inter', system-ui, sans-serif;
  --font-sans: var(--font-inter);
  --font-display: var(--font-poppins);

  /* Orange (primary) */
  --color-primary-50: #FFF7ED;
  --color-primary-100: #FFEDD5;
  --color-primary-200: #FED7AA;
  --color-primary-300: #FDBA74;
  --color-primary-400: #FB923C;
  --color-primary-500: #F97316;
  --color-primary-600: #EA580C;
  --color-primary-700: #C2410C;
  --color-primary-800: #9A3412;
  --color-primary-900: #7C2D12;

  /* Teal (secondary) */
  --color-secondary-50: #F0FDFA;
  --color-secondary-100: #CCFBF1;
  --color-secondary-200: #99F6E4;
  --color-secondary-300: #5EEAD4;
  --color-secondary-400: #2DD4BF;
  --color-secondary-500: #14B8A6;
  --color-secondary-600: #0D9488;
  --color-secondary-700: #0F766E;
  --color-secondary-800: #115E59;
  --color-secondary-900: #134E4A;

  /* Sémantiques */
  --color-success: #10B981;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
}

/* Tokens contextuels light/dark */
:root {
  --bg: #F8FAFC;
  --surface: #FFFFFF;
  --surface-muted: #F1F5F9;
  --border: #E2E8F0;
  --border-strong: #CBD5E1;
  --text: #0F172A;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;

  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 10px 32px rgba(15, 23, 42, 0.08);
}

.dark {
  --bg: #0F172A;
  --surface: #1E293B;
  --surface-muted: #334155;
  --border: #334155;
  --border-strong: #475569;
  --text: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;

  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-inter);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-poppins);
  letter-spacing: -0.02em;
  line-height: 1.2;
}
```

### 7.2 `tailwind.config.ts` (Tailwind v3 — alternative)

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)'],
        inter: ['var(--font-inter)'],
      },
      colors: {
        primary: {
          50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74',
          400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C',
          800: '#9A3412', 900: '#7C2D12',
        },
        secondary: {
          50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4',
          400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E',
          800: '#115E59', 900: '#134E4A',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      borderRadius: {
        sm: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px',
      },
    },
  },
} satisfies Config
```

### 7.3 Toggle dark mode (Zustand store)

```typescript
// src/store/theme.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  theme: 'light' | 'dark'
  toggle: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      toggle: () => set((s) => {
        const next = s.theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', next === 'dark')
        return { theme: next }
      }),
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      },
    }),
    { name: 'bee-theme' }
  )
)
```

### 7.4 Mode éco batterie (<20% → dark mode auto)

```typescript
// src/hooks/useBatteryEcoMode.ts
import { useEffect } from 'react'
import { useTheme } from '@/store/theme'

export function useBatteryEcoMode() {
  const { setTheme } = useTheme()

  useEffect(() => {
    if (!('getBattery' in navigator)) return

    let battery: any
    const handleChange = () => {
      if (battery.level < 0.2 && !battery.charging) {
        setTheme('dark')
      }
    }

    ;(navigator as any).getBattery().then((b: any) => {
      battery = b
      handleChange()
      battery.addEventListener('levelchange', handleChange)
      battery.addEventListener('chargingchange', handleChange)
    })

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', handleChange)
        battery.removeEventListener('chargingchange', handleChange)
      }
    }
  }, [setTheme])
}
```

---

## 8. Bonnes pratiques

### 8.1 Accessibilité

- Tester chaque combinaison fond/texte avec [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
- Cible : ratio AA minimum (4.5:1 pour le texte normal, 3:1 pour le large).
- Ne **jamais** utiliser orange clair (`primary-300/400`) sur fond blanc pour du texte → contraste insuffisant.
- Toujours fournir un `focus-visible` ring orange sur les inputs et boutons.

### 8.2 Mobile-first

- Tous les boutons cliquables : hauteur ≥ 48px.
- Espacement minimum entre cibles tactiles : 8px.
- Tester en condition de plein soleil (Cameroun) → contraste élevé essentiel.
- Limiter les animations en mode éco batterie.

### 8.3 Limites strictes

- **Ne pas** mélanger Poppins et Inter dans une même phrase.
- **Ne pas** utiliser plus de 2 niveaux d'orange sur un même écran (sinon ça sature).
- **Ne pas** mettre du texte sur fond orange `primary-300` ou plus clair → préférer `primary-500/600/700`.
- **Ne pas** utiliser de noir pur (`#000`) ou blanc pur sur les neutres → toujours les slates définis.
- **Ne pas** créer de nouvelles couleurs hors palette sans validation.

### 8.4 Cohérence

- Un seul CTA orange par écran (le plus important). Les actions secondaires sont en outline.
- Le teal n'est jamais une alternative au orange — il est complémentaire (Elite, cashback, statut "en route").
- Les couleurs sémantiques (success, error, warning, info) sont **réservées aux états système**, pas au branding.

---

## 9. Checklist d'intégration

- [ ] `next/font/google` configuré pour Poppins et Inter
- [ ] `globals.css` avec variables et @theme Tailwind v4
- [ ] Class `dark` toggle sur `<html>`
- [ ] Composant `<Button>` avec variants `primary`, `secondary`, `outline`, `ghost`, `danger`
- [ ] Composant `<Badge>` avec variants `start`, `pro`, `elite`, `freelance`, `premium`, `fiable`
- [ ] Composant `<Card>` avec hover state
- [ ] Composant `<Input>` avec états focus, error, disabled
- [ ] Composant `<FlashSaleBanner>` avec timer
- [ ] Hook `useBatteryEcoMode`
- [ ] Test contraste WCAG sur tous les composants
- [ ] Test sur appareil bas de gamme + plein soleil
