# QRGen

A modern, client-side QR Code generator with live preview, customization options, and multiple export formats.

## Features

- **Multiple QR types** — Text, URL, Email, Phone, SMS, WiFi, vCard, Geo, Calendar Event
- **Customization** — Colors, gradients, module shapes, marker styles, logo embedding
- **Export** — PNG, JPEG, WebP, SVG
- **Internationalization** — English & Spanish (easily extendable)
- **Dark mode** — System-aware theme switching

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
├── components/
│   ├── QRGenerator.vue      # Main feature component
│   ├── qr-options/          # Per-type input forms
│   └── qr-options-panel/    # Customization UI sections
├── composables/
│   └── useQRGenerator.ts    # QR generation state & actions
├── utils/
│   ├── qrFormatters.ts      # Data → encoded string
│   ├── qrRenderer.ts        # Canvas/SVG rendering
│   └── qrValidation.ts      # Zod schemas
├── types/                   # TypeScript interfaces
└── locales/                 # i18n JSON files
```

## Tech Stack

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [qrcode](https://github.com/soldair/node-qrcode)
- [vue-i18n](https://vue-i18n.intlify.dev/)
- [zod](https://zod.dev/)
- [lucide-vue-next](https://lucide.dev/)

## License

MIT
