# Choon Native-Feeling UX Specification

## Navigation diagram
- **Fan tabs:** Home → Search → Map → Saved → Profile.
- **Artist tabs:** Dashboard → Shows → Post → Messages → Profile.
- **Venue tabs:** Calendar → Lineups → Create Event → Messages → Venue.
- Event detail, profiles, and message threads are pushed secondary routes from any tab.

## Interaction spec
- Tap feedback: scale to 98% over 200ms, release in 260ms.
- Save/follow animation: 260ms with standard easing.
- Page transition: 260ms horizontal slide/fade.
- Pull-to-refresh: dampened spring + spinner lock state.
- Bottom sheet + toast/snackbar: 320ms translate + fade.

## Responsive behaviour
- **Mobile (<600px):** single-column, edge-safe with iOS safe-area insets.
- **Tablet (600–1024px):** centered content lane with wider cards and larger media.
- **Desktop (>1024px):** centered mobile core with optional side filter rail; IA unchanged.

## Icon usage guide
- One 24px SVG outline family, stroke width 1.8.
- Maintain consistent visual weight and corner radius.
- Actionable icons require accessible names via labels.
- Do not mix filled and outline variants in tab bars.
