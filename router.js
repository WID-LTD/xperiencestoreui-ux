/**
 * router.js - Client-Side Router
 * Hash-based routing for single-page navigation
 */

export const Router = {
    routes: {},
    currentRoute: null,

    // Initialize router
    init(routes) {
        this.routes = routes;

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());

        // Handle initial route
        this.handleRoute();
    },

    // Handle route changes
    async handleRoute(silent = false) {
        let hash = window.location.hash.slice(1) || '/';

        // Show Skeleton immediately only if not silent
        const contentArea = document.getElementById('app-viewport') || document.body;
        if (!silent && contentArea && window.Components && window.Components.PageSkeleton) {
            contentArea.innerHTML = window.Components.PageSkeleton();
            if (window.lucide) lucide.createIcons();
        }

        // Split path and query string
        const [pathPart, queryString] = hash.split('?');
        const path = pathPart || '/';

        // Parse query params if they exist
        const queryParams = queryString ? this.parseQueryString(queryString) : {};

        this.currentRoute = { path: path, params: queryParams };

        // Find matching route
        const route = this.matchRoute(path);

        if (route && route.handler) {
            // Merge route params (from URL path) with query params
            const allParams = { ...route.params, ...queryParams };
            route.handler(allParams);
        } else {
            console.warn('No route found for:', path);
            this.navigate('/404');
        }

        // Scroll to top only if not silent
        if (!silent) window.scrollTo(0, 0);

        // Update mobile components
        if (window.updateMobileUI) {
            window.updateMobileUI();
        }
    },

    // Match route pattern
    matchRoute(hash) {
        // Exact match
        if (this.routes[hash]) {
            return { handler: this.routes[hash], params: {} };
        }

        // Pattern match (e.g., /product/:id)
        for (const pattern in this.routes) {
            const regex = this.patternToRegex(pattern);
            const match = hash.match(regex);
            if (match) {
                const params = this.extractParams(pattern, match);
                return { handler: this.routes[pattern], params };
            }
        }

        return null;
    },

    // Convert route pattern to regex
    patternToRegex(pattern) {
        const regexPattern = pattern
            .replace(/\//g, '\\/')
            .replace(/:(\w+)/g, '([^/]+)');
        return new RegExp(`^${regexPattern}$`);
    },

    // Extract params from match
    extractParams(pattern, match) {
        const params = {};
        const keys = pattern.match(/:(\w+)/g);
        if (keys) {
            keys.forEach((key, index) => {
                const paramName = key.slice(1);
                params[paramName] = match[index + 1];
            });
        }
        return params;
    },

    // Parse query string params (e.g., ?page=2&sort=asc)
    parseQueryString(queryString) {
        const params = {};
        const pairs = queryString.split('&');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[key] = value ? decodeURIComponent(value) : '';
            }
        });
        return params;
    },

    // Navigate to route
    navigate(path, replace = false) {
        if (replace) {
            // Replace current history entry so back button skips this intermediate page
            window.history.replaceState(null, '', window.location.pathname + `#${path}`);
            // Manually trigger route handler since replaceState doesn't fire hashchange
            this.handleRoute();
        } else {
            window.location.hash = path;
        }
    },

    // Refresh current route
    refresh(silent = false) {
        this.handleRoute(silent);
    },

    // Navigate to route silently (no scroll to top, no skeleton)
    silentNavigate(path) {
        window.location.hash = path;
        // The hashchange listener will trigger handleRoute(false) by default, 
        // so for a true silent navigation we might need to skip history and call handler directly
        // but for now, we'll just use refresh(true) after a state change.
    },

    // Go back
    back() {
        window.history.back();
    },

    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    },

    // Get query param
    getParam(key) {
        return this.currentRoute?.params?.[key];
    }
};
