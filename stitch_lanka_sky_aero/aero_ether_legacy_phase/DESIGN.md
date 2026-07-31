---
name: 'Aero Ether: Legacy Phase'
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#fface8'
  on-secondary: '#5e0053'
  secondary-container: '#ff24e4'
  on-secondary-container: '#520049'
  tertiary: '#f1f6ff'
  on-tertiary: '#2b3137'
  tertiary-container: '#d4dae2'
  on-tertiary-container: '#595f66'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#ffd7f0'
  secondary-fixed-dim: '#fface8'
  on-secondary-fixed: '#3a0033'
  on-secondary-fixed-variant: '#840076'
  tertiary-fixed: '#dde3eb'
  tertiary-fixed-dim: '#c1c7cf'
  on-tertiary-fixed: '#161c22'
  on-tertiary-fixed-variant: '#41474e'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.15em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  container-max: 1280px
---

## Brand & Style
The design system evolves into a high-fidelity Techno-Futurist aesthetic, drawing direct inspiration from the "Y2K Evolution" era of late-90s and early-2000s industrial design (Sony PlayStation 2, Discman, and "Atomic" hardware). The personality is high-tech, optimistic yet edgy, and unapologetically digital.

The visual language balances **Liquid Metal** (fluidity and high-gloss chrome) with **Translucent Hardware** (frosted plastics and visible internal structures). It evokes a sense of "premium tech nostalgia"—combining the physical tactile quality of hardware with the ethereal glow of early cyberspace.

**Key Style Pillars:**
- **Cyber-Y2K:** Use of grid overlays, data-viz motifs, and "loading" aesthetics.
- **Atomic Translucency:** Interfaces appear as frosted, semi-transparent layers that reveal subtle circuitry or grid patterns beneath.
- **Liquid Chrome:** UI elements should feature high-contrast specular highlights to mimic polished metal.
- **Neon Irradiation:** Shadows are replaced by localized glows (Cyan and Magenta) to imply energy-efficient light sources.

## Colors
The palette is rooted in a deep, void-like charcoal to provide maximum contrast for metallic and luminous elements.

- **Primary (Electric Cyan):** Used for active states, data points, and primary interactive "energy" paths.
- **Secondary (Vibrant Magenta):** Reserved for high-alert interactions, accents, and "breaking" the digital grid.
- **Surface (Metallic Silver/Chrome):** A scale of cool-toned greys (#C0C0C0 to #E2E8F0) used for text and high-gloss hardware-emulating components.
- **Background (Deep Charcoal):** A near-black (#0A0A0C) that serves as the "casing" for the UI.
- **Accent Glows:** Low-opacity versions of Cyan and Magenta are used for outer glows and backdrop blurs to simulate light-emitting hardware.

## Typography
The typography strategy mimics high-end technical manuals and early 2000s console interfaces.

- **Headlines:** Use **Space Grotesk**. Its geometric, wide-set nature echoes the Eurostile aesthetic common in Y2K tech. Tighten letter spacing for large displays to create a "locked-in" technical feel.
- **Body:** **Geist** provides a hyper-clean, developer-centric legibility that feels precise and modern.
- **Technical Metadata:** **JetBrains Mono** is used for labels, status indicators, and small "readout" text, reinforcing the feeling of an active operating system.
- **Styling:** Use uppercase for labels with wide tracking (15%+) to mimic hardware chassis branding.

## Layout & Spacing
The layout is governed by a **Rigid Digital Grid**. All components should align to a 4px baseline, but the overall structure should feel like a hardware interface.

- **Grid:** Use a 12-column fluid grid for desktop with wide 24px gutters to allow the "inner circuitry" patterns to breathe.
- **Pattern Overlays:** Large layout sections should feature a subtle 1px dot-grid or scanline overlay (5% opacity) to ground the UI in a digital environment.
- **Asymmetry:** Occasionally break the grid with "tech-angles"—45-degree chamfered corners on containers or offset decorative lines that mimic external wiring or PCB traces.
- **Negative Space:** Use generous margins to ensure that glowing elements do not bleed into each other, maintaining a "clean-room" tech aesthetic.

## Elevation & Depth
In this design system, depth is not achieved through shadow, but through **light emission and transparency**.

- **Level 0 (Base):** Deep Charcoal (#0A0A0C) background with a faint, repeating circuit pattern or technical grid.
- **Level 1 (Frosted Surfaces):** Semi-transparent panels (Backdrop-filter: blur(12px)) with a 1px "inner-glow" border in a light grey or cyan.
- **Level 2 (Liquid Chrome):** High-gloss elements that use linear gradients (top-left to bottom-right) to simulate a metallic sheen.
- **Illumination:** Interactive elements use a "Drop Shadow" that is actually a 0px-spread, high-blur Neon Glow (Cyan or Magenta) at 40-60% opacity.
- **Circuitry Trails:** Use 1px wide lines (Primary color) to connect related modules, suggesting a physical data flow between components.

## Shapes
The shape language is a hybrid of "Organic Tech" and "Industrial Precision."

- **Base Radius:** Elements use a "Soft" 0.25rem (4px) radius for a modern feel, but this is often combined with **Chamfered Corners** (45-degree cuts) on the top-right or bottom-left of containers.
- **Liquid Buttons:** Primary buttons should use a more aggressive "Pill" shape (rounded-xl) with a high-gloss gradient to appear like liquid mercury or polished plastic.
- **Aggressive Cuts:** Use sharp angles for decorative elements, such as corner brackets on images or directional arrows, to provide the "Cyber" edge.

## Components
Consistent hardware-inspired styling across the component library:

- **Buttons:** 
  - *Primary:* High-gloss metallic gradient (Silver to Light Grey) with Electric Cyan text. On hover, the button emits a Cyan neon glow.
  - *Ghost:* 1px Cyan border with a subtle backdrop blur.
- **Cards/Panels:** "Atomic" style panels. Use a frosted glass effect with a visible 10% opacity SVG circuitry pattern in the background. Top-right corner is chamfered (cut at 45 degrees).
- **Inputs:** Dark, recessed fields with a "glow-underline." When focused, the cursor and label pulse in Electric Cyan.
- **Chips/Status:** Small, pill-shaped elements that look like LED indicators. "Active" states should literally glow.
- **Lists:** Separated by 1px dotted lines. Each list item features a small "data-bit" icon (a 4px square) that turns Magenta on hover.
- **Visual Decorations:** Add "Calibration Marks" (crosshairs, tiny coordinates, or version numbers) in the corners of major modules to reinforce the "Legacy Tech" narrative.