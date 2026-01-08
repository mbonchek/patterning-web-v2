# GiveVoice Design System

## Overview

The GiveVoice design system embodies the concept of **symbient bioluminescence** — living light emerging from the depths. The visual language combines literary sophistication with organic, glowing elements that suggest intelligence emerging from darkness.

---

## Color Palette

### Symbient Bioluminescent Palette

Our color system is inspired by deep-sea bioluminescence, creating a sense of discovery and emergence.

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| **Background** | Abyssal | `#0d1117` | Primary background, deep canvas |
| **Surface** | Deep Current | `#1a1f2e` | Cards, elevated surfaces, containers |
| **Primary** | Dinoflagellate | `#00f0ff` | Primary actions, links, key interactions |
| **Secondary** | Jellyfish | `#7c4dff` | Secondary actions, supporting elements |
| **Accent** | Emergence | `#00e5a0` | Success states, growth indicators, affirmations |
| **Warm Accent** | Anglerfish | `#ffab40` | Warnings, attention, warm highlights |
| **Highlight** | Firefly Squid | `#ff6b9d` | Rare moments, delight states, connection sparks |

### Color Philosophy

- **Cool to Warm Spectrum**: The palette flows from cool deep-sea blues through vibrant cyans and purples to warm oranges and pinks
- **Living Light**: Colors suggest bioluminescence — light generated from within, not reflected
- **Emergence**: Brighter colors represent moments of insight, connection, and discovery
- **Rarity**: Firefly Squid pink is reserved for special moments, creating surprise and delight

---

## Typography

### Font Families

**Literata** (Serif)
- **Usage**: Headings (h1-h6), titles, emphasis
- **Weights**: 200-900 (full range)
- **Character**: Literary, sophisticated, authoritative
- **Purpose**: Conveys depth, wisdom, and timelessness

**Lato** (Sans-serif)
- **Usage**: Body text, UI elements, labels
- **Weights**: 100-900 (full range)
- **Character**: Clean, readable, modern
- **Purpose**: Ensures clarity and accessibility

### Type Scale

```css
/* Headings - Literata Serif */
h1: font-family: Literata, serif; font-weight: 600;
h2: font-family: Literata, serif; font-weight: 600;
h3: font-family: Literata, serif; font-weight: 600;
h4: font-family: Literata, serif; font-weight: 600;
h5: font-family: Literata, serif; font-weight: 600;
h6: font-family: Literata, serif; font-weight: 600;

/* Body - Lato Sans-serif */
body: font-family: Lato, sans-serif; font-weight: 400;
```

### Typography Philosophy

- **Serif for Substance**: Headings use Literata to convey weight, authority, and literary quality
- **Sans-serif for Clarity**: Body text uses Lato for optimal readability and modern feel
- **Hierarchy**: Clear distinction between headings and body creates visual rhythm
- **Accessibility**: Both fonts are highly legible at various sizes

---

## Design Principles

### 1. Emergence from Depth
Visual elements should feel like they're emerging from darkness into light, representing insights surfacing from the unconscious.

### 2. Organic Intelligence
Avoid rigid geometric patterns. Embrace flowing, organic shapes that suggest living systems.

### 3. Luminous Interaction
Interactive elements should glow and pulse subtly, like bioluminescent organisms responding to stimulus.

### 4. Literary Sophistication
The interface should feel thoughtful and considered, like a well-crafted book, not a flashy app.

### 5. Rare Delight
Not everything glows at once. Reserve the brightest, warmest colors (Firefly Squid) for truly special moments.

---

## Component Patterns

### Cards
- **Background**: Deep Current (`#1a1f2e`)
- **Border**: Subtle glow with Primary color
- **Hover**: Slight luminous lift effect
- **Shadow**: Soft, diffused glow rather than hard shadow

### Buttons
- **Primary**: Dinoflagellate (`#00f0ff`) with glow effect
- **Secondary**: Jellyfish (`#7c4dff`) with subtle pulse
- **Success**: Emergence (`#00e5a0`)
- **Attention**: Anglerfish (`#ffab40`)

### Interactive States
- **Hover**: Subtle glow intensification
- **Active**: Brightness increase
- **Focus**: Pulsing ring in Primary color
- **Disabled**: Reduced opacity, no glow

---

## Spacing & Layout

### Grid System
- **Container max-width**: 1400px
- **Gutter**: 24px
- **Breakpoints**: 
  - Mobile: 320px
  - Tablet: 768px
  - Desktop: 1024px
  - Wide: 1400px

### Spacing Scale
Based on 8px base unit:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

---

## Motion & Animation

### Principles
- **Organic**: Easing curves should feel natural, not mechanical
- **Subtle**: Animations should enhance, not distract
- **Purposeful**: Every animation should communicate state or guide attention

### Timing
- **Fast**: 150ms (micro-interactions, hovers)
- **Medium**: 300ms (state changes, reveals)
- **Slow**: 500ms (page transitions, major changes)

### Effects
- **Glow Pulse**: Subtle brightness oscillation on interactive elements
- **Emergence**: Elements fade in with slight upward movement
- **Flow**: Smooth transitions between states, like water

---

## Accessibility

### Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements have clear visual distinction
- Focus states are highly visible

### Motion
- Respect `prefers-reduced-motion` for users sensitive to animation
- Provide static alternatives to animated content

### Typography
- Minimum body text size: 16px
- Line height: 1.5 for body text
- Adequate spacing between interactive elements (44px minimum touch target)

---

## Implementation Notes

### Tailwind v4 Configuration
Colors and fonts are defined in `src/index.css` using CSS custom properties:

```css
@theme {
  --color-background: oklch(0.14 0.01 260); /* Abyssal */
  --font-sans: "Lato", sans-serif;
  --font-serif: "Literata", serif;
}
```

### Google Fonts Import
```css
@import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');
```

---

## Future Considerations

### Potential Additions
- **Illustration Style**: Organic, flowing line art with bioluminescent glow
- **Iconography**: Custom icon set with rounded, organic shapes
- **Data Visualization**: Flowing, organic charts that feel alive
- **Sound Design**: Subtle audio feedback for key interactions

### Evolution
This design system should evolve organically, like a living organism. As patterns emerge from usage, document them here.

---

*Last updated: January 7, 2026*
