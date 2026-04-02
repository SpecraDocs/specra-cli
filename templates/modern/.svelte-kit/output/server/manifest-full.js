export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["api-specs/openapi-example.json","api-specs/postman-example.json","api-specs/test-api.json","api-specs/users-api.json","favicon.svg"]),
	mimeTypes: {".json":"application/json",".svg":"image/svg+xml"},
	_: {
		client: null,
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/docs/[product=product]/[version]",
				pattern: /^\/docs\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"product","matcher":"product","optional":false,"rest":false,"chained":false},{"name":"version","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/docs/[product=product]/[version]/[...slug]",
				pattern: /^\/docs\/([^/]+?)\/([^/]+?)(?:\/([^]*))?\/?$/,
				params: [{"name":"product","matcher":"product","optional":false,"rest":false,"chained":false},{"name":"version","optional":false,"rest":false,"chained":false},{"name":"slug","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/docs/[version]",
				pattern: /^\/docs\/([^/]+?)\/?$/,
				params: [{"name":"version","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/docs/[version]/[...slug]",
				pattern: /^\/docs\/([^/]+?)(?:\/([^]*))?\/?$/,
				params: [{"name":"version","optional":false,"rest":false,"chained":false},{"name":"slug","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 8 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			const { match: product } = await import ('./entries/matchers/product.js')
			return { product };
		},
		server_assets: {}
	}
}
})();
