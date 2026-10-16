import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates favicon, PWA, maskable, and Apple touch icons from public/logo.svg.
// Run: npm run icons
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0.18, resizeOptions: { background: '#14213d' } },
    apple: { ...minimal2023Preset.apple, padding: 0.12, resizeOptions: { background: '#14213d' } },
  },
  images: ['public/logo.svg'],
})
