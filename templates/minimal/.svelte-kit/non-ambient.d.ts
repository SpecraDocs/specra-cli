
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/docs" | "/docs/[product=product]" | "/docs/[product=product]/[version]" | "/docs/[product=product]/[version]/[...slug]" | "/docs/[version]" | "/docs/[version]/[...slug]";
		RouteParams(): {
			"/docs/[product=product]": { product: MatcherParam<typeof import('../src/params/product.js').match> };
			"/docs/[product=product]/[version]": { product: MatcherParam<typeof import('../src/params/product.js').match>; version: string };
			"/docs/[product=product]/[version]/[...slug]": { product: MatcherParam<typeof import('../src/params/product.js').match>; version: string; slug: string };
			"/docs/[version]": { version: string };
			"/docs/[version]/[...slug]": { version: string; slug: string }
		};
		LayoutParams(): {
			"/": { product?: MatcherParam<typeof import('../src/params/product.js').match>; version?: string; slug?: string };
			"/docs": { product?: MatcherParam<typeof import('../src/params/product.js').match>; version?: string; slug?: string };
			"/docs/[product=product]": { product: MatcherParam<typeof import('../src/params/product.js').match>; version?: string; slug?: string };
			"/docs/[product=product]/[version]": { product: MatcherParam<typeof import('../src/params/product.js').match>; version: string; slug?: string };
			"/docs/[product=product]/[version]/[...slug]": { product: MatcherParam<typeof import('../src/params/product.js').match>; version: string; slug: string };
			"/docs/[version]": { version: string; slug?: string };
			"/docs/[version]/[...slug]": { version: string; slug: string }
		};
		Pathname(): "/" | `/docs/${string}/${string}` & {} | `/docs/${string}/${string}/${string}` & {} | `/docs/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/api-specs/openapi-example.json" | "/api-specs/postman-example.json" | "/api-specs/test-api.json" | "/api-specs/users-api.json" | "/favicon.svg" | string & {};
	}
}