# create-specra

The fastest way to create a new Specra documentation site. Scaffold a complete documentation project with a single command.

## What is Specra?

Specra is a modern documentation library for SvelteKit that provides:
- Multi-version documentation support
- API reference generation
- Full-text search
- MDX-powered content
- Beautiful UI components

The official Specra site ([specra-docs](https://specra-docs.com)) also offers a SaaS platform with paid tiers (Starter, Pro, Enterprise) including authentication, Stripe/M-Pesa billing, and a user dashboard. The CLI scaffolds free, self-hosted documentation sites — no billing features are included in generated projects.

## Usage

### With npx (recommended)

```bash
npx create-specra my-docs
```

### With npm

```bash
npm create specra my-docs
```

### With yarn

```bash
yarn create specra my-docs
```

### With pnpm

```bash
pnpm create specra my-docs
```

## Options

```bash
npx create-specra [project-directory] [options]
```

### Arguments

- `[project-directory]` - The directory to create the project in (optional, will prompt if not provided)

### Options

- `--template <template>` - Template to use: `minimal`, `book-docs`, `jbrains-docs` (will prompt if not provided)
- `--use-npm` - Use npm as the package manager
- `--use-pnpm` - Use pnpm as the package manager
- `--use-yarn` - Use yarn as the package manager
- `--skip-install` - Skip package installation

## Templates

### Minimal (Default)

Minimal setup to get started quickly:
- Basic documentation structure
- Essential configuration
- Clean starting point
- Ready to customize

### Book Docs

Knowledge base style inspired by popular docs platforms:
- Dark theme by default
- Categorized sidebar with section headers (Content, Customization)
- Site-wide banner
- Flush sidebar layout (attached to screen edge)
- Version badge in sidebar

### JBrains Docs

Reference documentation style with tabbed navigation:
- Light theme by default
- Tab groups for organizing content (Language, Multiplatform)
- Collapsible tree-style sidebar
- No table of contents (right panel)
- Flush sidebar layout
- Version badge in sidebar

## Examples

Create a new project with interactive prompts:

```bash
npx create-specra
```

Create a project with the minimal template using npm:

```bash
npx create-specra my-docs --template minimal --use-npm
```

Create a project with the book-docs template:

```bash
npx create-specra my-docs --template book-docs
```

Create a project and skip installation:

```bash
npx create-specra my-docs --skip-install
```

## What's Created

The CLI creates a new SvelteKit project with Specra pre-configured:

```
my-docs/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── docs/
│   │       └── [version]/[...slug]/
│   │           ├── +page.svelte
│   │           └── +page.ts
│   └── app.html
├── docs/
│   └── v1.0.0/
│       └── index.mdx
├── static/
├── specra.config.json
├── svelte.config.js
├── vite.config.ts
└── package.json
```

## After Creation

Once your project is created, you can:

1. Start the development server:
   ```bash
   cd my-docs
   npm run dev
   ```

2. Open [http://localhost:5173](http://localhost:5173) in your browser

3. Edit your documentation in the `docs/` directory

4. Customize your site in `specra.config.json`

## Deployment

Specra projects are standard SvelteKit apps, so you can deploy anywhere SvelteKit runs.

### Static Hosting (Vercel, Netlify, Cloudflare Pages)

Install the appropriate SvelteKit adapter:

```bash
# Vercel
npm install -D @sveltejs/adapter-vercel

# Netlify
npm install -D @sveltejs/adapter-netlify

# Cloudflare Pages
npm install -D @sveltejs/adapter-cloudflare
```

Update `svelte.config.js` to use the adapter:

```js
import adapter from '@sveltejs/adapter-vercel'; // or adapter-netlify, etc.

export default {
  kit: {
    adapter: adapter()
  }
};
```

Then push to your Git provider — the platform handles the rest.

### Node Server (VPS, Docker, Railway)

Use `@sveltejs/adapter-node` (included by default):

```bash
npm run build
node build
```

The server listens on port 3000 by default. Configure with environment variables:

```bash
PORT=8080 HOST=0.0.0.0 node build
```

### Static Site Generation

For fully static docs with no server needed:

```bash
npm install -D @sveltejs/adapter-static
```

Update `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      fallback: '404.html'
    })
  }
};
```

```bash
npm run build
```

Upload the `build/` directory to any static host (GitHub Pages, S3, etc.).

## Learn More

- [Specra on npm](https://www.npmjs.com/package/specra)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [MDX Documentation](https://mdxjs.com)

## License

MIT with Branding Requirement — see [LICENSE.MD](LICENSE.MD).

All documentation sites generated with create-specra display a "Powered by Specra" watermark by default. Removing the watermark requires an active paid subscription (Starter tier or above) at [specra-docs.com](https://specra-docs.com). Unauthorized removal is a copyright violation.

## Authors

dalmasonto, arthur-kamau
