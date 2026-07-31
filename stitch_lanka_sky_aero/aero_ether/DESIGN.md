---
name: Aero Ether
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#3e4850'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#6e7881'
  outline-variant: '#bdc8d1'
  surface-tint: '#00658d'
  primary: '#00658d'
  on-primary: '#ffffff'
  primary-container: '#00aeef'
  on-primary-container: '#003e58'
  inverse-primary: '#82cfff'
  secondary: '#416900'
  on-secondary: '#ffffff'
  secondary-container: '#b7f568'
  on-secondary-container: '#457000'
  tertiary: '#825500'
  on-tertiary: '#ffffff'
  tertiary-container: '#db951f'
  on-tertiary-container: '#513300'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c6e7ff'
  primary-fixed-dim: '#82cfff'
  on-primary-fixed: '#001e2d'
  on-primary-fixed-variant: '#004c6b'
  secondary-fixed: '#b7f568'
  secondary-fixed-dim: '#9cd84f'
  on-secondary-fixed: '#102000'
  on-secondary-fixed-variant: '#304f00'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#ffb953'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-aqi:
    fontFamily: Plus Jakarta Sans
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  body-md:
    fontFamily: Fira Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Fira Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 24px
  element-gap: 16px
  glass-margin: 12px
  desktop-max-width: 1200px
---

## Brand & Style

This design system revives the **Frutiger Aero** aesthetic, focusing on optimism, high-fidelity skeuomorphism, and the intersection of technology and nature. The personality is "Eco-Digital"—fresh, vibrant, and incredibly glossy. It targets a broad audience looking for clarity and hope in environmental data.

The style leans heavily into **Glassmorphism** and **Skeuomorphism**. Expect high-gloss "wet" textures, 3D bubbly forms, and deep transparency. The interface should feel like a pane of polished glass floating over a crisp, high-resolution landscape of clouds or dew-covered grass. Every element reflects light to create a sense of three-dimensional depth and premium quality.

## Colors

The palette is driven by the vibrant hues of the natural world. 
- **Primary (Sky Blue):** Used for interactive elements and "Good" AQI states. It should always be applied with a top-down linear gradient.
- **Secondary (Grass Green):** Used for "Moderate" health states and eco-centric calls to action.
- **Tertiary (Amber/Orange):** Reserved for "Unhealthy" warnings, maintaining a bright, non-threatening tone.
- **Translucent Glass:** A semi-transparent white (Alpha 40-70%) with a heavy backdrop blur (20px+) serves as the primary surface material.

Gradient usage is mandatory: every solid color should transition from a highlight shade to a deeper base shade to mimic light hitting a convex surface.

## Typography

The typography is clean and humanist to balance the complex visual textures. **Plus Jakarta Sans** provides friendly, rounded forms for large numeric AQI displays and headers, while **Fira Sans** ensures high legibility for data points and environmental tips.

Text should rarely be pure black; use a deep Navy (#002D40) for body text to maintain the "Aero" softness. Headers over glass surfaces should utilize a very subtle white drop shadow (1px, 50% opacity) to ensure separation from busy photographic backgrounds.

## Layout & Spacing

The layout follows a **Fluid Grid** model with high internal padding to allow the background photography to breathe. Elements are organized into "Glass Pods"—individual floating containers that do not touch the edges of the screen.

- **Mobile:** Single column pods with 16px side margins. 
- **Desktop:** 12-column grid. Components like the AQI Gauge should span 6-8 columns to emphasize "Skeletal Glass" textures.
- **Spacing Rhythm:** Use a 4px baseline, but prefer larger gaps (24px, 32px) to prevent the UI from feeling "cramped" or "industrial."

## Elevation & Depth

Depth is the defining characteristic of this design system. It is achieved through three specific layers:
1. **Background Layer:** High-fidelity nature photography (e.g., macro water droplets, sun-streaked clouds) with a slight zoom-in animation.
2. **Surface Layer (Glass Pods):** 60% opaque white containers with a 1px white "inner glow" border to simulate the edge of a glass pane. High backdrop blur is essential.
3. **Interactive Layer (Glossy Buttons):** High-contrast gradients with a "specular highlight"—a thin, bright white oval at the top of the button—to make it look like a physical plastic or glass bubble.

Shadows are never black. Use "Ambient Glows"—highly diffused shadows that match the hue of the element (e.g., a blue button casts a soft blue glow).

## Shapes

Shapes are organic and "bubbly." Avoid sharp corners at all costs. The standard `rounded-lg` (1rem) is the baseline for most cards, while buttons use `rounded-xl` (1.5rem) or full pill shapes to emphasize the liquid-like quality. 

AQI indicators should be circular or "orbital," featuring concentric rings of glass that appear to rotate or pulse slowly.

## Components

### Buttons
Buttons must look like physical "Aqua" or "Gel" buttons. This requires a three-step gradient: a light top highlight, a vibrant mid-tone, and a darker bottom edge. Add a 1px white inner border on the top half only.

### AQI Indicators (Gauges)
The primary gauge is a "Skeletal Glass" ring. It uses a high-gloss 3D pipe effect. The indicator needle or glow should change color based on the air quality, casting a colored light onto the glass surface behind it.

### Cards (Glass Pods)
Cards are the primary container. They feature a `20px` blur and a `1.5px` solid white stroke at 30% opacity. If cards are stacked, the blur increases on the lower layers to simulate physical distance.

### Input Fields
Inputs are recessed (inset shadow) to look like they are molded into the glass surface. The focus state turns the inner shadow into a soft outer glow in the primary blue.

### Chips & Badges
Small pill-shaped elements with high transparency (10-20%) and a vivid color border. These should look like tiny glass beads.