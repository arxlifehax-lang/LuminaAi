---
name: Lumina Chat System
description: Premium, credible AI companion and agent workflow interface
colors:
  primary: "#820ad1"
  primary-hover: "#9a24ea"
  primary-emerald: "#00c684"
  primary-solar: "#fd7e14"
  neutral-bg: "#080710"
  neutral-bg-emerald: "#030d0a"
  neutral-bg-solar: "#f9f8fc"
  text-main: "#f3f1f9"
  text-muted: "#9f9cb5"
typography:
  display:
    fontFamily: "Outfit, Prompt, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 5vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Outfit, Prompt, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "8px"
  md: "14px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
---

# Design System: Lumina Chat System

## 1. Overview

**Creative North Star: "The Scholar's Canvas"**

The Scholar's Canvas represents an interface of absolute clarity, academic precision, and professional utility. It is designed to foster deep focus, mirroring the behavior of expert systems like Claude. Every visual element has a functional purpose; decorative fluff and cluttered patterns are strictly rejected. Density is configured to maximize information parsing while avoiding cognitive fatigue.

**Key Characteristics:**
- High typography contrast for readability.
- Glassmorphic accents applied only to main structural container boundaries.
- Precise alignment and spacious margins to support reading flow.
- A visual tone that is serious, credible, and trustworthy.

## 2. Colors

The color system is organized around dark cosmic neutrals paired with a singular, high-contrast primary accent to direct focus to key interactive elements.

### Primary
- **Mystic Amethyst** (#820ad1): The primary accent color for active buttons, key indicators, and focused inputs.
- **Deep Jade** (#00c684): Secondary emerald accent for success logs and alternate layouts.
- **Solar Flare** (#fd7e14): Warm light-theme accent for the solar dawn mode.

### Neutral
- **Cosmic Void** (#080710): Main background neutral color.
- **Silver Stardust** (#f3f1f9): Primary text neutral color.
- **Slate Gray** (#9f9cb5): Secondary/muted text neutral color.

### Named Rules
**The Strict Accent Rule.** The primary accent colors must be used on no more than 10% of any given screen layout. Its rarity is what gives it focal power.

## 3. Typography

**Display Font:** Outfit (with fallback system-ui, sans-serif)
**Body Font:** Outfit (with fallback system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (monospace)

**Character:** A modern, clean geometric pair that balances reading speed with high-density data tables and programming logs.

### Hierarchy
- **Display** (SemiBold (600), clamp(1.5rem, 5vw, 2.5rem), 1.2): Used for primary headers and splash screen greetings.
- **Headline** (Medium (500), 20px, 1.3): Page-level titles and main panel headers.
- **Title** (Medium (500), 16px, 1.4): Section headers and active chatbot names.
- **Body** (Regular (400), 14px, 1.6): Standard chatbot response bubble text. Caps line length at 75ch.
- **Label** (Medium (500), 12px, 1.0): Small tags, time metrics, and button text.

## 4. Elevation

The elevation system uses semi-transparent borders and subtle dark-backdrop blur values instead of high-offset physical shadows to maintain flat, modern readability.

### Shadow Vocabulary
- **Tactile Glow** (`box-shadow: 0 4px 15px rgba(130, 10, 209, 0.25)`): Applied on buttons, active inputs, and key interactions.
- **Ambient Shadow** (`box-shadow: 0 24px 70px rgba(0, 0, 0, 0.4)`): Applied only to main container borders.

### Named Rules
**The Tactile Feedback Rule.** Surfaces are flat at rest. Physical shadows and glows appear only in response to state transitions (hover, active focus).

## 5. Components

Components are styled with a "Tactile and Confident" philosophy, ensuring users feel active control on every interaction.

### Buttons
- **Shape:** Rounded corners (8px)
- **Primary:** Mystic Amethyst (#820ad1) background, white text.
- **Hover / Focus:** Transitions to slightly lighter color (#9a24ea) and applies a slight translateY(-2px) elevation with a micro-glow.

### Cards / Containers
- **Corner Style:** Rounded corners (14px)
- **Background:** Semi-transparent glassmorphic backing (`rgba(22, 19, 43, 0.45)`) with backdrop-filter (`blur(24px)`).
- **Border:** Thin solid border (`1px solid rgba(255, 255, 255, 0.08)`).

### Inputs / Fields
- **Style:** Flat background (`rgba(0, 0, 0, 0.2)`), 8px border-radius, thin border.
- **Focus:** Border transitions to primary accent color with a subtle focus outline glow.

## 6. Do's and Don'ts

### Do:
- **Do** maintain a strict 4.5:1 contrast ratio for all body text against dark backgrounds.
- **Do** use the popover pop-up API or fixed-position portals for dropdown selectors.
- **Do** use JetBrains Mono for code editor, compiler, and terminal console logs.

### Don't:
- **Don't** use emojis or emoticons in AI chatbot replies to ensure a formal, academic tone.
- **Don't** use side-stripe borders (border-left/right > 1px) as colored accents on message cards.
- **Don't** use gradient text on headers or text layouts.
- **Don't** animate image elements on hover.
