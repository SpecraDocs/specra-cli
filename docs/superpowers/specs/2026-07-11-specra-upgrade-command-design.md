# `specra upgrade` — design

**Date:** 2026-07-11
**Status:** Approved, ready to plan
**Repos touched:** `specra-cli` (new command, template manifests, scaffold change, modern-template badge fix)
**Test ground:** `/home/dalmas/E/projects/umbra/documentation`

## Problem

Specra templates **fork** rendering components into the developer's own repo. The `modern` template copies `ModernSidebar.svelte`, `ModernDocsPage.svelte`, `ModernToc.svelte`, `ModernFooter.svelte`, and `SidebarSelect.svelte` into `src/lib/components/`, and it renders its own sidebar from those files rather than the SDK's `DocLayout`.

When the SDK gains a per-item feature — sidebar badges landed in `specra@0.2.68`, rendered by the SDK's `SidebarMenuItems.svelte` — a forked sidebar never receives it. `npm i specra@latest` updates `node_modules`, but cannot touch a component the developer copied into their source tree. The `minimal`, `book-docs`, and `jbrains-docs` templates render the SDK's `DocLayout` directly, so they inherited badges for free; `modern` did not.

This was confirmed by diagnosis: umbra/documentation (a `modern` site upgraded to `specra@0.2.68`) added `badge: new` to a page and saw nothing, because its `ModernSidebar.svelte` has zero references to `meta.badge`.

There is no mechanism to deliver template fixes to an already-scaffolded site. This spec adds one.

## Goals

- Re-deliver template-managed files into an existing site on demand.
- Never overwrite a file the developer has edited, and never touch files the template does not own (landing page, docs content, config, static assets).
- Fix the `modern` template so new scaffolds render badges.

## Non-goals

- Three-way / semantic merging. When a managed file was edited, we surface the new version as a sibling `.new` file for the developer to reconcile; we do not attempt to merge.
- Upgrading dependencies in `package.json` (that is `npm`/`yarn`'s job).
- Reworking templates to stop forking (a larger refactor; noted in Future Work).

## Design

### 1. Templates declare what they own

Each template gains a root `specra.template.json`:

```json
{
  "name": "modern",
  "managed": [
    "src/routes/docs/**",
    "src/lib/components/*.svelte"
  ]
}
```

`managed` is a list of globs, relative to the project root, that the template owns and `upgrade` may manage. Everything else belongs to the developer and is never read or written by `upgrade`:

- `src/routes/+page.svelte` — the landing page
- `docs/**` — the developer's content
- `specra.config.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `postcss.config.mjs`
- `static/**`, `package.json`, lockfiles, `.env*`

The root `+layout.svelte` is intentionally **unmanaged** in v1 — it commonly carries theme/branding wiring, and clobbering it is higher-risk than the payoff.

`specra.template.json` ships in every template but only needs a meaningful `managed` list where the template forks components. For `minimal`/`book-docs`/`jbrains-docs`, `managed` covers `src/routes/docs/**` (the route scaffolding) so future route fixes are deliverable.

### 2. Scaffold writes a manifest

`create` (in `src/index.ts` → `createProject`) writes `.specra/manifest.json` into the new project after copying the template:

```json
{
  "template": "modern",
  "templateVersion": "0.4.0",
  "files": {
    "src/lib/components/ModernSidebar.svelte": "sha256:…",
    "src/routes/docs/[version]/[...slug]/+page.svelte": "sha256:…"
  }
}
```

`templateVersion` is the CLI version that produced the scaffold. `files` maps each managed file (expanded from the globs) to the SHA-256 of its bytes as copied. This is the ground truth for "did the developer edit this file since scaffold?"

### 3. The `upgrade` command

`specra upgrade [--template <name>] [--dry-run] [--force] [--yes]`

Algorithm:

1. Load `.specra/manifest.json` from the project. If absent, enter **adopt mode** (§4).
2. Resolve the shipped template directory for `manifest.template` from the installed CLI (`templates/<name>`), and read its `specra.template.json` to expand `managed` into a concrete file list.
3. For each managed file present in the shipped template:
   - **Not in project** → create it; record its hash.
   - **In project, on-disk hash == manifest hash** (pristine) → overwrite with the shipped version; update the manifest hash.
   - **In project, on-disk hash ≠ manifest hash** (edited) → write the shipped version to `<file>.new`; leave the developer's file untouched; add to the "needs review" report.
4. A managed file present in the project but no longer in the template is left alone (never deleted), and noted.
5. Write the updated manifest.
6. Print a summary grouped as: **created**, **updated**, **needs review (.new)**, **unchanged**.

Flags:

- `--dry-run` — compute and print the plan; write nothing.
- `--force` — for edited files, overwrite in place after copying the current file to `<file>.bak`, instead of writing `.new`.
- `--template <name>` — required in adopt mode when the template can't be inferred; ignored when a manifest exists.
- `--yes` — skip the confirmation prompt (for CI/non-interactive use).

### 4. Adopt mode (sites with no manifest)

Existing sites — including umbra — have no `.specra/manifest.json`. Adopt mode differs from §3 in one key way: with no recorded baseline, it compares each managed file's current bytes directly against the **shipped template**, not against a manifest.

1. Determine the template: `--template <name>`, else infer from marker files (e.g. presence of `src/lib/components/ModernSidebar.svelte` ⇒ `modern`), else prompt.
2. For each managed file, compare current on-disk bytes against the shipped template's bytes:
   - **identical** → nothing to deliver; record the current hash as baseline.
   - **differ** → cannot prove developer-edit vs template-drift, so take the safe path: write the shipped version to `<file>.new`, leave the current file untouched, and record the **current** bytes as the baseline hash.
   - **missing in project** → create it; record its hash.
3. Write `.specra/manifest.json` from those baseline hashes — i.e. the project is adopted as-is.

Crucially, the baseline recorded is the developer's *current* bytes, not the shipped bytes. So after adoption, a file the developer later edits will diverge from that baseline and correctly route to `.new` on the next run, while a genuinely pristine file (current == shipped, baseline == both) will hash-match and update in place when a future template ships a change. Adopt mode never overwrites in place; that only happens on precise (post-manifest) runs.

`--force` in adopt mode overwrites differing files in place (with `.bak`) rather than emitting `.new`, for developers who know their managed files are unmodified.

### 5. Modern-template badge fix

Independent of the command, `templates/modern/src/lib/components/ModernSidebar.svelte` is updated to render badges:

- Import `resolveBadges` and the `SidebarBadge` component from `specra` / `specra/components` (both exported as of `0.2.68`).
- In each of the three doc-link render sites, resolve `doc.meta?.badge` and render a `SidebarBadge` pill beside the title, mirroring the SDK's `SidebarMenuItems.svelte`.

The change is additive (title still renders; a badge appears only when present), so it composes with existing template styling. This is what `upgrade` will deliver to `modern` sites; on umbra it arrives as `ModernSidebar.svelte.new` because umbra's copy is edited.

### 6. CLI version bump

`0.3.2 → 0.4.0` — a new command is a minor bump.

## Data flow

```
create ─┬─ copyRecursive(template → project)
        └─ writeManifest(.specra/manifest.json)   ← hashes of managed files

upgrade ─┬─ readManifest ──(absent)──→ adopt mode ─┐
         │                                          │
         ├─ expand managed globs from template      │
         ├─ per file: hash(project) vs manifest ────┤
         │     pristine → overwrite + rehash        │
         │     edited   → write .new                │
         │     missing  → create                    │
         └─ writeManifest + print summary ←─────────┘
```

## Error handling

- Unknown `--template`, or inference fails and none supplied → exit non-zero with the list of available templates.
- Not run from a project root (no `package.json` / no `specra.config.json`) → exit with a clear message.
- Template has no `specra.template.json` → treat `src/routes/docs/**` as the default managed set and warn.
- A `.new` (or `.bak`) target already exists → overwrite the `.new`, but never overwrite a `.bak` (suffix with a counter) so no backup is lost.
- Writes are staged and only committed to disk after the full plan computes, so a mid-run error doesn't leave a half-upgraded tree (best-effort: write to temp names, then rename).

## Testing

Unit (CLI has a test runner or falls back to `node --experimental-strip-types`, matching the SDK approach):

- Manifest round-trip: scaffold a temp project, assert `.specra/manifest.json` lists every managed file with a correct hash.
- Pristine file → overwritten and rehashed.
- Edited file → `.new` written, original untouched, manifest hash unchanged.
- `--force` → original backed up to `.bak`, overwritten in place.
- Unmanaged files (landing page, `docs/**`, `specra.config.json`) never read or written.
- `--dry-run` writes nothing.
- Adopt mode: no manifest → manifest seeded, drift emitted as `.new`.

Acceptance (umbra):

1. `specra upgrade --template modern` in umbra.
2. Assert: `.specra/manifest.json` created; `ModernSidebar.svelte.new` written; umbra's `ModernSidebar.svelte` still contains its `link()` and `renderInlineCode()` edits (no clobber); pristine managed files updated; `src/routes/+page.svelte`, `docs/**`, `specra.config.json` byte-identical to before.
3. Reconcile the badge change into umbra's real `ModernSidebar.svelte`, run the dev server, and confirm `badge: new` on `deployment/going-to-production.mdx` renders a green **New** pill in the sidebar.

Plus the standard gates: `svelte-check`/`tsc` baseline unchanged, CLI builds.

## Future work

- Reduce forking: give the `modern` template's sidebar a way to delegate per-item rendering to an SDK primitive, so per-item SDK features arrive without a template change at all. Out of scope here.
- `specra upgrade --check` in CI to flag sites drifting behind the template.
