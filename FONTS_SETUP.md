# Font Setup Required

The UI uses **Figtree** (headings) and **Inter** (body) from the design system.

## Steps to add fonts

1. Download font files:
   - Figtree: https://fonts.google.com/specimen/Figtree (Regular 400, Medium 500, SemiBold 600, Bold 700, ExtraBold 800)
   - Inter: https://fonts.google.com/specimen/Inter (Regular 400, Medium 500, SemiBold 600, Bold 700)

2. Place `.ttf` files in `assets/fonts/`:
   ```
   assets/fonts/Figtree-Regular.ttf
   assets/fonts/Figtree-Medium.ttf
   assets/fonts/Figtree-SemiBold.ttf
   assets/fonts/Figtree-Bold.ttf
   assets/fonts/Inter-Regular.ttf
   assets/fonts/Inter-Medium.ttf
   assets/fonts/Inter-SemiBold.ttf
   assets/fonts/Inter-Bold.ttf
   ```

3. Create `react-native.config.js` at the project root:
   ```js
   module.exports = {
     assets: ['./assets/fonts/'],
   };
   ```

4. Run: `npx react-native-asset`

5. For iOS: `npx pod-install`

Until fonts are linked, React Native will fall back to the system font (San Francisco on iOS, Roboto on Android).
