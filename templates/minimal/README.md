# Specra Documentation Site

Welcome to your new Specra documentation site! This project was created with `create-specra`.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn install
yarn dev
# or
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see your documentation site.

## Project Structure

```
├── src/
│   ├── routes/          # SvelteKit routes
│   │   ├── +layout.svelte   # Root layout
│   │   ├── +page.svelte     # Home page
│   │   └── docs/            # Documentation pages
│   └── app.html         # HTML template
├── docs/                # Your MDX documentation files
│   └── v1.0.0/          # Version 1.0.0 docs
├── static/              # Static assets
├── specra.config.json   # Specra configuration
├── svelte.config.js     # SvelteKit configuration
└── vite.config.ts       # Vite configuration
```

## Writing Documentation

Add your MDX files in the `docs/v1.0.0/` directory:

```mdx
---
title: My Page
description: This is my documentation page
---

# My Page

Your content here...
```

### Using Components

Specra provides built-in components for your documentation:

```mdx
<Callout type="info">
  This is an info callout!
</Callout>

<Tabs>
  <Tab title="JavaScript">
    ```js
    console.log('Hello World')
    ```
  </Tab>
  <Tab title="TypeScript">
    ```ts
    console.log('Hello World')
    ```
  </Tab>
</Tabs>
```

## Configuration

Edit `specra.config.json` to customize your site:

```json
{
  "site": {
    "title": "Your Docs",
    "description": "Your documentation site",
    "url": "https://yourdocs.com"
  },
  "navigation": {
    "links": [
      { "title": "Home", "href": "/" },
      { "title": "Docs", "href": "/docs" }
    ]
  }
}
```

## Building for Production

```bash
npm run build
npm run preview
```

## Learn More

- [Specra Documentation](https://specra-docs.com/docs)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [MDX Documentation](https://mdxjs.com)

## Deployment

Deploy your Specra documentation site to Vercel, Netlify, or any hosting platform that supports SvelteKit.

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

## Need Help?

- Check the [documentation](https://specra-docs.com/docs)
- Report issues on [GitHub](https://github.com/dalmasonto/specra/issues)
