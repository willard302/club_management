# Azure Ethereal Design System

### 1. Overview & Creative North Star
**Creative North Star: "The Celestial Sanctuary"**

Azure Ethereal is a design system that prioritizes atmospheric depth and spiritual clarity over rigid data density. Inspired by the expansive qualities of the sky, it utilizes a "Glassmorphism" foundation to create a sense of weightlessness. The system breaks from traditional "boxed" layouts by using background imagery as a primary structural element, with UI components acting as semi-transparent filters that mediate between the user and the content.

### 2. Colors
The palette is dominated by **Sky Blue (#2b9dee)** and **Ethereal White**, supported by nature-inspired accents like **Zen Green (#4CAF50)**.

- **The "No-Line" Rule:** Standard 1px solid borders are strictly prohibited for structural sectioning. Contrast must be achieved through `backdrop-filter: blur(12px)` and subtle changes in alpha transparency (e.g., transitioning from 10% to 30% white opacity).
- **Surface Hierarchy & Nesting:** Use `surface_container` tiers to layer information. A "Lowest" tier is a faint mist, while "Highest" provides enough opacity to ensure text legibility over complex backgrounds.
- **The "Glass & Gradient" Rule:** All floating elements (cards, inputs) must use a semi-transparent white background with a heavy backdrop blur.
- **Signature Textures:** Utilize `conic-gradients` and `glow-effects` (0 0 20px) to indicate active states or primary actions, mimicking the aura of a natural light source.

### 3. Typography
Azure Ethereal uses **Plus Jakarta Sans** across all levels to maintain a modern, geometric clarity that feels approachable yet professional.

- **Display (1.875rem / 30px):** Bold, tracking-widest (10-15%). Used for primary brand titles to evoke a sense of monumental calm.
- **Headline (1.125rem / 18px):** Bold, tracking-wide. Used for primary calls to action within components.
- **Body (1rem / 16px):** Standard reading size for inputs and descriptions.
- **Label (0.75rem / 12px - 0.875rem / 14px):** Uppercase, tracking-widest. Used for input headers and metadata to provide an editorial, organized feel.

The typographic rhythm relies on high-contrast tracking (letter-spacing) rather than purely on font-weight changes to signify hierarchy.

### 4. Elevation & Depth
Depth is not communicated via shadows cast *onto* a surface, but through the *refraction of light* through glass.

- **The Layering Principle:** Stacking is achieved through increasing blur intensity and opacity.
- **Ambient Shadows:** Use large, diffused glows rather than tight drop shadows. Specifically, use `0 0 40px 10px rgba(255, 255, 255, 0.5)` for focal points (like logos) and `0 0 20px rgba(43, 157, 238, 0.4)` for interactive buttons.
- **The "Ghost Border" Fallback:** If a boundary is visually necessary for accessibility, use a `1px` border at `30%` white opacity.
- **Glassmorphism:** A standard `backdrop-filter: blur(12px)` is required for all containers to ensure "visual silence" behind text.

### 5. Components
- **Buttons:** Primary buttons use a solid `#2b9dee` fill with a `glow-button` shadow. Secondary buttons are circular "glass-effect" icons.
- **Input Fields:** Styled as "Glass Wells." They feature a top-aligned uppercase label and a bottom-aligned borderless input area.
- **Chips:** Small, fully rounded (pill-shaped) containers with minimal opacity shifts.
- **Progressive Disclosure:** Elements should fade in/out using alpha transitions rather than sliding, maintaining the "ethereal" theme.

### 6. Do's and Don'ts
**Do:**
- Use high letter-spacing for uppercase labels.
- Use backdrop blurs on every container that sits over a background image.
- Ensure text shadows are used on white text when placed directly over light background areas to maintain legibility.

**Don't:**
- Do not use pitch black (#000000) for text; use a deep midnight blue or high-opacity white.
- Do not use sharp 90-degree corners; the minimum roundedness should be `0.75rem` (xl).
- Do not use opaque solid backgrounds for cards; this breaks the "Celestial Sanctuary" atmosphere.