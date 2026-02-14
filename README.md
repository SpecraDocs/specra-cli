# create-specra

The fastest way to create a new Specra documentation site. Scaffold a complete documentation project with a single command.

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

- `--template <template>` - Template to use: `minimal` (will prompt if not provided)
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

## Examples

Create a new project with interactive prompts:

```bash
npx create-specra
```

Create a project with the minimal template using npm:

```bash
npx create-specra my-docs --template minimal --use-npm
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

## What is Specra?

Specra is a modern documentation library for SvelteKit that provides:
- Multi-version documentation support
- API reference generation
- Full-text search
- MDX-powered content
- Beautiful UI components

The official Specra site ([specra-docs](https://specra-docs.com)) also offers a SaaS platform with paid tiers (Starter, Pro, Enterprise) including authentication, Stripe/M-Pesa billing, and a user dashboard. The CLI scaffolds free, self-hosted documentation sites — no billing features are included in generated projects.

## Learn More

- [Specra on npm](https://www.npmjs.com/package/specra)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [MDX Documentation](https://mdxjs.com)

## License

MIT with Branding Requirement — see [LICENSE.MD](LICENSE.MD).

All documentation sites generated with create-specra display a "Powered by Specra" watermark by default. Removing the watermark requires an active paid subscription (Starter tier or above) at [specra-docs.com](https://specra-docs.com). Unauthorized removal is a copyright violation.

## Authors

dalmasonto, arthur-kamau
