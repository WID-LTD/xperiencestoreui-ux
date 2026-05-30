/**
 * script.js - Main Application (Refactored)
 * Wires together router, state, pages, and components
 */

import { Auth } from './auth.js?v=3.3.4';
import { Router } from './router.js?v=3.3.4';
import { State } from './state.js?v=3.3.4';
import { Data } from './data.js?v=3.3.4';
import { Components } from './components.js?v=3.3.4';
import { Pages } from './pages.js?v=3.3.4';
import { SupportPages } from './support.js?v=3.3.4';
import { Payment } from './payment.js?v=3.3.4';
import { PaymentCheckoutModal } from './paymentModal.js?v=3.3.4';
import { Gigo } from './gigo.js?v=3.3.4';
import { Chat } from './chat.js?v=3.3.4';


// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
function setupChat() {
    // Placeholder for future live chat integration
    console.log('[CHAT] Chat service initialized.');
}

// Global helper to prevent ReferenceErrors
window.isLoggedIn = () => Auth.isLoggedIn();

// Expose functions to window EARLY for State.set visibility
window.updateMobileUI = updateMobileUI;
window.updateUserUI = updateUserUI;
window.updateNotificationsUI = updateNotificationsUI;
window.initApp = initApp;
window.Router = Router;
window.State = State;
window.Auth = Auth;
window.Pages = Pages;
window.SupportPages = SupportPages;
window.Data = Data;
window.Components = Components;

async function initApp() {
    // Initialize state
    State.init();

    // Set user role from session
    const userSession = Auth.getUserSession();
    
    // Check Auth and Decouple status
    await Auth.checkExpiry();

    // Initialize Chat System
    if (Chat) Chat.init();
    if (Gigo) Gigo.init();

    // Check if user is logged in
    if (userSession && userSession.token && !Auth.isLoggedIn()) {
        Auth.logout();
        Router.navigate('/login');
        if (window.Components && window.Components.showNotification) {
            Components.showNotification('Your session has expired. Please log in again.', 'warning');
        }
        return; // Stop initialization
    }

    const userRole = userSession?.role || 'consumer';
    State.set({ userRole });

    // Show Branded Loader
    document.body.insertAdjacentHTML('beforeend', Components.FullPageLoader('Initializing Platform...'));

    // Fetch dynamic data (Background sync - Stale While Revalidate)
    const dataFetches = [State.fetchProducts()];

    // Refresh profile if logged in
    if (userSession?.token) {
        dataFetches.push(Auth.fetchProfile());
    }

    if (userRole === 'supplier') {
        dataFetches.push(State.fetchSupplierStats());
        dataFetches.push(State.fetchSupplierOrders());
        dataFetches.push(State.fetchSupplierProducts());
    } else if (userRole === 'business') {
        dataFetches.push(State.fetchRFQs());
        dataFetches.push(State.fetchBusinessStats());
    } else if (userRole === 'warehouse') {
        dataFetches.push(State.fetchInventory());
    } else if (userRole === 'admin') {
        dataFetches.push(State.fetchAdminStats());
        dataFetches.push(State.fetchAdminUsers());
        dataFetches.push(State.fetchAdminOrders());
        dataFetches.push(State.fetchAdminAllProducts());
    } else if (userRole === 'dropshipper') {
        dataFetches.push(State.fetchStoreData());
        dataFetches.push(State.fetchDropshipperOrders());
        dataFetches.push(State.fetchDropshipperStats());
        dataFetches.push(State.fetchDropshipperWallet());
    }

    // Always fetch notifications if logged in
    if (userSession?.token) {
        dataFetches.push(State.fetchNotifications());
    }

    Promise.all(dataFetches).then(() => {
        // Remove loader when done
        Components.removeLoader();

        // Re-render current page when fresh data arrives
        const currentRoute = Router.getCurrentRoute();
        if (currentRoute) {
            console.log('Fresh data loaded, updating UI...');
            Router.handleRoute();
        }
    });

    // Setup navigation
    setupNavigation();

    // Setup chat
    setupChat();

    // Setup user dropdown
    setupUserDropdown();

    // Initialize router with routes
    initializeRouter();

    // Update cart badge
    Components.updateCartBadge();

    // Show onboarding for new/role-switched users
    setTimeout(() => Components.showOnboardingIfNew(), 1500);

    // Setup mobile menu toggle (hamburger button + overlay)
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (menuToggle) menuToggle.onclick = () => Components.toggleMobileMenu();
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    if (menuOverlay) menuOverlay.onclick = () => Components.toggleMobileMenu();

    // Initial UI Update for mobile
    updateMobileUI();

    // Update user UI
    updateUserUI();

    // Setup Notifications
    setupNotifications();

    // Initialize Lucide icons
    lucide.createIcons();

    // Start Realtime Polling for Dashboards
    startDashboardPolling();
}

/**
 * Periodically refreshes dashboard data based on the user's role
 */
function startDashboardPolling() {
    const POLLING_INTERVAL = 30000; // 30 seconds
    let pollingTimer = null;

    const performPoll = async () => {
        // Only poll if tab is visible and user is logged in
        if (document.visibilityState !== 'visible' || !Auth.isLoggedIn()) return;

        const userSession = Auth.getUserSession();
        const userRole = userSession?.role || 'consumer';
        const dataFetches = [];

        console.log(`[POLLING] Refreshing data for ${userRole}...`);

        if (userRole === 'supplier') {
            dataFetches.push(State.fetchSupplierStats(true));
            dataFetches.push(State.fetchSupplierOrders(true));
        } else if (userRole === 'warehouse') {
            dataFetches.push(State.fetchInventory(true));
            dataFetches.push(State.fetchOrders(true));
        } else if (userRole === 'admin') {
            dataFetches.push(State.fetchAdminStats(true));
            dataFetches.push(State.fetchAdminOrders(true));
        } else if (userRole === 'dropshipper') {
            dataFetches.push(State.fetchDropshipperStats(true));
            dataFetches.push(State.fetchDropshipperOrders(true));
            dataFetches.push(State.fetchDropshipperWallet(true));
        }

        // Always fetch notifications
        dataFetches.push(State.fetchNotifications());

        try {
            await Promise.allSettled(dataFetches);
            // Re-render if we are on a relevant dashboard page
            const currentRoute = Router.getCurrentRoute();
            const isInputPage = currentRoute?.path?.includes('/add') || 
                               currentRoute?.path?.includes('/edit') || 
                               currentRoute?.path?.includes('/create');
            
            const isCatalogPage = currentRoute?.path === '/supplier/products';

            if (currentRoute && currentRoute.path && !isInputPage && !isCatalogPage && (
                currentRoute.path.startsWith('/supplier') || 
                currentRoute.path.startsWith('/admin') || 
                currentRoute.path.startsWith('/warehouse') || 
                currentRoute.path.startsWith('/dropshipper') ||
                currentRoute.path === '/notifications'
            )) {
                // Targeted Update: Check if we can just update the content without a full route re-render
                const dashboardContent = document.querySelector('.glass-card');
                if (dashboardContent && !isInputPage) {
                    console.log('[POLLING] Performing targeted UI update...');
                    Router.handleRoute(); // Still using handleRoute but we could optimize further
                } else {
                    Router.handleRoute();
                }
            }
        } catch (err) {
            console.warn('[POLLING] Refresh failed', err);
        }
    };

    // Initial setup
    pollingTimer = setInterval(performPoll, POLLING_INTERVAL);

    // Pause/Resume on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Immediate poll then restart interval
            performPoll();
            if (!pollingTimer) pollingTimer = setInterval(performPoll, POLLING_INTERVAL);
        } else {
            clearInterval(pollingTimer);
            pollingTimer = null;
        }
    });
}

function initializeRouter() {
    const routes = {
        '/': () => renderHomePage(),
        '/login': () => renderPage(Pages.login()),
        '/register': () => renderPage(Pages.register()),
        '/forgot-password': () => renderPage(Pages.forgotPassword()),
        '/chat': () => renderPage(Pages.chat()),
        '/gift-cards': () => renderPage(Pages.giftcards.dashboard()),
        '/gift-cards/buy': () => renderPage(Pages.giftcards.purchase()),
        '/gift-card/:code': (params) => renderPage(Pages.giftcards.details(params.code)),
        '/track-order': () => renderPage(Pages.tracking()),
        '/payment-status': (params) => renderPage(Pages.paymentVerify(params)),
        '/payment/failed': () => renderPage(Pages.paymentFailed()),
        '/payment/cancelled': () => renderPage(Pages.paymentFailed()),

        // Consumer routes
        '/products': () => renderPage(Pages.consumer.products()),
        '/categories': () => renderPage(Pages.consumer.categories()),
        '/category/:slug': (params) => renderPage(Pages.consumer.products({ category: params.slug })),
        '/product/:id': (params) => renderPage(Pages.consumer.productDetail(params.id)),
        '/supplier/:id': (params) => renderPage(Pages.consumer.supplierDetail(params.id)),
        '/cart': () => renderPage(Pages.consumer.cart()),
        '/checkout': () => renderPage(Pages.consumer.checkout()),
        '/order-confirmation/:id': (params) => renderPage(Pages.consumer.orderConfirmation(params.id)),
        '/account': () => renderPage(Pages.consumer.account()),
        '/account/orders': () => renderPage(Pages.consumer.orders()),
        '/account/wishlist': () => renderPage(Pages.consumer.wishlist()),
        '/account/profile': () => renderPage(Pages.consumer.profile()),
        '/notifications': () => renderPage(Pages.consumer.notifications()),

        // Business (B2B) routes
        '/business/suppliers': () => Auth.requireRole('business', () => renderPage(Pages.business.suppliers())),
        '/business/supplier/:id': (params) => Auth.requireRole('business', () => renderPage(Pages.business.supplierDetail(params.id))),
        '/business/rfq/create': (params) => Auth.requireRole('business', () => renderPage(Pages.business.rfqCreate(params))),
        '/business/rfq': () => Auth.requireRole('business', () => renderPage(Pages.business.rfq())),
        '/business/rfq/:id': (params) => Auth.requireRole('business', () => renderPage(Pages.business.rfq())),
        '/business/quotes': () => Auth.requireRole('business', () => renderPage(Pages.business.quotes())),
        '/business/account': () => Auth.requireRole('business', () => renderPage(Pages.business.account())),

        // Dropshipper routes
        '/dropshipper/storefront': () => Auth.requireRole('dropshipper', () => renderPage(Pages.dropshipper.storefront())),
        '/dropshipper/store/:slug': (params) => renderPage(Pages.dropshipper.publicStore(params.slug)),
        '/dropshipper/catalog': () => Auth.requireRole('dropshipper', () => renderPage(Pages.dropshipper.catalog())),
        '/dropshipper/profit-calculator': (params) => Auth.requireRole('dropshipper', () => renderPage(Pages.dropshipper.profitCalculator(params))),
        '/dropshipper/analytics': () => Auth.requireRole('dropshipper', () => renderPage(Pages.dropshipper.analytics())),
        '/dropshipper/management': () => Auth.requireRole('dropshipper', () => renderPage(Pages.dropshipper.storefront())),
        '/dropshipper/finance': () => Auth.requireRole('dropshipper', () => renderPage(Pages.dropshipper.finance())),
        '/dropshipper/api-management': () => Auth.requireRole('dropshipper', () => renderPage(Pages.dropshipper.apiManagement())),
        '/dropshipper/social': () => Auth.requireRole('dropshipper', () => renderPage(Pages.dropshipper.social())),

        // Warehouse routes
        '/warehouse/receiving': () => Auth.requireRole('warehouse', () => State.fetchWROs().then(() => renderPage(Pages.warehouse.receiving()))),
        '/warehouse/inventory': () => Auth.requireRole('warehouse', () => renderPage(Pages.warehouse.inventory())),
        '/warehouse/fulfillment': () => Auth.requireRole('warehouse', () => renderPage(Pages.warehouse.fulfillment())),
        '/warehouse/shipping': () => Auth.requireRole('warehouse', () => renderPage(Pages.warehouse.shipping())),
        '/warehouse/returns': () => Auth.requireRole('warehouse', () => renderPage(Pages.warehouse.returns())),
        '/warehouse/reports': () => Auth.requireRole('warehouse', () => renderPage(Pages.warehouse.reports())),

        // Supplier routes
        '/supplier/products': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.products())),
        '/supplier/products/add': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.addProduct())),
        '/supplier/products/edit': (params) => Auth.requireRole('supplier', () => renderPage(Pages.supplier.addProduct(params))),
        '/supplier/orders': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.orders())),
        '/supplier/rfq': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.rfq())),
        '/supplier/finance': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.finance())),
        '/supplier/analytics': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.analytics())),
        '/supplier/settings': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.settings())),
        // Admin routes
        '/admin/users': () => Auth.requireRole('admin', () => State.fetchAdminUsers().then(() => renderPage(Pages.admin.users()))),
        '/admin/orders': () => Auth.requireRole('admin', () => State.fetchAdminOrders().then(() => renderPage(Pages.admin.orders()))),
        '/admin/products': () => Auth.requireRole('admin', () => State.fetchAdminAllProducts().then(() => renderPage(Pages.admin.products()))),
        '/admin/marketing': () => Auth.requireRole('admin', () => renderPage(Pages.admin.marketing())),
        '/admin/reports': () => Auth.requireRole('admin', () => State.fetchAdminLogs().then(() => renderPage(Pages.admin.reports()))),
        '/admin/settings': () => Auth.requireRole('admin', () => State.fetchAdminSettings().then(() => renderPage(Pages.admin.settings()))),

        // Support pages
        '/about': () => renderPage(SupportPages.about()),
        '/contact': () => renderPage(SupportPages.contact()),
        '/faq': () => renderPage(SupportPages.faq()),
        '/shipping': () => renderPage(SupportPages.shipping()),
        '/privacy': () => renderPage(SupportPages.privacy()),
        '/terms': () => renderPage(SupportPages.terms()),
        '/rfq-guide': () => renderPage(SupportPages.rfq()),

        // Search
        '/search': (params) => renderPage(Pages.search(params)),

        // Business aliases
        '/business/rfq/new': (params) => Auth.requireRole('business', () => renderPage(Pages.business.rfqCreate(params))),

        // Supplier aliases (warehouse = rfq page for now)
        '/supplier/home': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.home())),
        '/supplier/warehouse': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.rfq())),

        // Admin aliases
        '/admin/logs': () => Auth.requireRole('admin', () => State.fetchAdminLogs().then(() => renderPage(Pages.admin.reports()))),
        '/admin/dev-console': () => Auth.requireRole('admin', () => renderPage(Pages.admin.settings())),

        // Tracking
        '/track': () => renderPage(Pages.tracking()),
        '/track/:id': (params) => renderPage(Pages.tracking(params.id)),
        '/account/order/:id': (params) => renderPage(Pages.orderDetail(params.id)),
        '/404': () => renderPage(Pages.error404())
    };

    Router.init(routes);
}

function renderHomePage() {
    if (!Auth.isLoggedIn()) {
        const activeStorefront = localStorage.getItem('active_storefront');
        if (activeStorefront) {
            return Router.navigate(`/dropshipper/store/${activeStorefront}`, true);
        }
    }
    
    const role = State.getUserRole();

    switch (role) {
        case 'consumer':
            renderPage(Pages.consumer.home());
            break;
        case 'business':
            renderPage(Pages.business.home());
            break;
        case 'dropshipper':
            renderPage(Pages.dropshipper.home());
            break;
        case 'warehouse':
            renderPage(Pages.warehouse.home());
            break;
        case 'supplier':
            renderPage(Pages.supplier.home());
            break;
        case 'admin':
            renderPage(Pages.admin.home());
            break;
        default:
            renderPage(Pages.consumer.home());
    }
}

function createPlaceholderPage(title, message) {
    return `
        <div class="flex items-center justify-center min-h-[60vh]">
            <div class="text-center">
                <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="construction" class="w-12 h-12 text-blue-600"></i>
                </div>
                <h1 class="text-4xl font-bold mb-4">${title} Portal</h1>
                <p class="text-slate-600 mb-6">${message}</p>
                <button onclick="Router.navigate('/')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
                    Go to Homepage
                </button>
            </div>
        </div>
    `;
}

function renderPage(html) {
    const viewport = document.getElementById('app-viewport');
    viewport.innerHTML = html;
    lucide.createIcons();
    
    // Initialize price sliders if on products page
    if (window.initPriceSliders) window.initPriceSliders();

    // Update cart badge after render
    Components.updateCartBadge();
}

function setupNavigation() {
    const navLinks = document.getElementById('nav-links');
    const role = State.getUserRole();

    const links = {
        consumer: [
            { label: 'Home', path: '/' },
            { label: 'Products', path: '/products' },
            { label: 'About', path: '/about' },
            { label: 'Contact', path: '/contact' }
        ],
        business: [
            { label: 'Home', path: '/' },
            { label: 'Suppliers', path: '/business/suppliers' },
            { label: 'RFQ', path: '/business/rfq' },
            { label: 'Products', path: '/products' }
        ],
        dropshipper: [
            { label: 'Home', path: '/' },
            { label: 'My Store', path: '/dropshipper/storefront' },
            { label: 'Products', path: '/products' },
            { label: 'Analytics', path: '/dropshipper/analytics' }
        ],
        warehouse: [
            { label: 'Home', path: '/' },
            { label: 'Receiving', path: '/warehouse/receiving' },
            { label: 'Inventory', path: '/warehouse/inventory' },
            { label: 'Fulfillment', path: '/warehouse/fulfillment' }
        ],
        supplier: [
            { label: 'Home', path: '/' },
            { label: 'Products', path: '/supplier/products' },
            { label: 'Orders', path: '/supplier/orders' },
            { label: 'Finance', path: '/supplier/finance' }
        ],
        admin: [
            { label: 'Dashboard', path: '/' },
            { label: 'Orders', path: '/admin/orders' },
            { label: 'Products', path: '/admin/products' },
            { label: 'Users', path: '/admin/users' },
            { label: 'Marketing', path: '/admin/marketing' },
            { label: 'Reports', path: '/admin/reports' },
            { label: 'Settings', path: '/admin/settings' }
        ]
    };

    const roleLinks = links[role] || links.consumer;
    if (navLinks) {
        navLinks.innerHTML = roleLinks.map(link => `
            <a href="#${link.path}" class="nav-link hover:text-blue-600 transition-colors">${link.label}</a>
        `).join('');
    }

    // Advanced High-Performance Responsive Search & Suggestions
    const searchWrappers = [
        { input: document.getElementById('global-search-input'), sugg: document.getElementById('search-suggestions') },
        { input: document.getElementById('mobile-search-input'), sugg: document.getElementById('mobile-search-suggestions') }
    ];

    searchWrappers.forEach(wrapper => {
        const searchInput = wrapper.input;
        const suggestionsContainer = wrapper.sugg;
        if (!searchInput || !suggestionsContainer) return;

        let debounceTimer;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim().toLowerCase();

            if (query.length < 2) {
                suggestionsContainer.classList.add('hidden');
                return;
            }

            debounceTimer = setTimeout(() => {
                const products = State.get().products || [];
                
                // --- 1. Pre-computation (Lazy Indexing) ---
                if (products.length > 0 && !products[0]._searchTerms) {
                    for (let i = 0; i < products.length; i++) {
                        const p = products[i];
                        const name = (p.name || '').toLowerCase();
                        const cat = (p.category || '').toLowerCase();
                        const desc = (p.description || '').toLowerCase();
                        // One giant string index for ultra-fast token matching
                        products[i]._searchTerms = `${name} ${cat} ${desc}`;
                        products[i]._nameLower = name;
                        products[i]._catLower = cat;
                    }
                }

                // --- 2. Tokenization & Token-based fast exclusion ---
                const tokens = query.split(/\\s+/).filter(t => t.length > 0);
                const matches = [];

                // --- 3. High-Performance Loop ---
                for (let i = 0; i < products.length; i++) {
                    const p = products[i];
                    // Fuzzy rejection: Check how many tokens match the index. Skip only if ZERO tokens match.
                    let matchedTokensCount = 0;
                    for (let t = 0; t < tokens.length; t++) {
                        if (p._searchTerms.includes(tokens[t])) {
                            matchedTokensCount++;
                        }
                    }
                    // Fuzzy percentage matching logic based on USER SPECIFICATION:
                    // If matchedTokensCount is at least 50% of the total tokens, rank it as 100% match.
                    // If matchedTokensCount is at least 25%, rank it lower.
                    const matchRatio = tokens.length > 0 ? (matchedTokensCount / tokens.length) : 0;
                    
                    if (matchRatio < 0.25) continue; // Reject if under 25% match rate

                    let weight = 0;
                    
                    // Massive ranking boost based on percentage hitting thresholds
                    if (matchRatio >= 0.50) weight += 1000; // Rank as 100%
                    else if (matchRatio >= 0.25) weight += 200; // Still passes, rank lower
                     
                    weight += Math.pow(matchedTokensCount, 2) * 5; 

                    // Full query exact/starts-with matching (Highly rewarded)
                    if (p._nameLower === query) weight += 500;
                    else if (p._nameLower.startsWith(query)) weight += 100;
                    else if (p._nameLower.includes(query)) weight += 30;

                    // Individual token hit distributions
                    for(let t = 0; t < tokens.length; t++) {
                        if (p._nameLower.includes(tokens[t])) weight += 15;
                        if (p._catLower.includes(tokens[t])) weight += 5;
                    }

                    if (weight > 0) {
                        matches.push({
                            id: p.id,
                            name: p.name,
                            image: State.getMediaUrl(p.id, 0),
                            type: 'product',
                            category: p.category, 
                            weight: weight
                        });
                    }
                }

                // --- 4. Sort and Slice ---
                const results = matches.sort((a, b) => b.weight - a.weight).slice(0, 6);

                suggestionsContainer.innerHTML = Components.SearchSuggestions(results, query);
                
                // Force mobile container to appear floating above other elements
                suggestionsContainer.className = 'absolute top-full left-0 right-0 mt-2 z-[2000] glass-card bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300';
                suggestionsContainer.classList.remove('hidden');
                
                if (window.lucide) window.lucide.createIcons();
            }, 100); // Super fast 100ms debounce due to optimized O(1) skipping
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    suggestionsContainer.classList.add('hidden');
                    Router.navigate(`/search?q=${encodeURIComponent(query)}`);
                }
            }
        });
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        searchWrappers.forEach(wrapper => {
            if (wrapper.input && wrapper.sugg) {
                if (!wrapper.input.contains(e.target) && !wrapper.sugg.contains(e.target)) {
                    wrapper.sugg.classList.add('hidden');
                }
            }
        });
    });

    // Global helper for suggestions
    window.handleSuggestionClick = (type, id) => {
        searchWrappers.forEach(wrapper => {
            if (wrapper.sugg) wrapper.sugg.classList.add('hidden');
        });
        if (type === 'product') {
            Router.navigate(`/product/${id}`);
        } else if (type === 'category') {
            Router.navigate(`/category/${id}`);
        }
    };
}

function setupUserDropdown() {
    // Setup user dropdown
    const profileArea = document.getElementById('profile-area');
    const profileTrigger = document.getElementById('profile-trigger');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (profileTrigger && userDropdown && profileArea) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });

        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', (e) => {
            if (!profileArea.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
    // Handle logout
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            Auth.logout();
            userDropdown.classList.add('hidden');
            Components.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.hash = '#/';
                window.location.reload();
            }, 500);
        };
    }
}

// Global role switcher handler
window.switchUserRole = async (newRole) => {
    const session = Auth.getUserSession();
    if (!session) return;

    try {
        Components.showNotification('Switching context...', 'info');
        const response = await fetch(`${window.API_BASE}/api/auth/switch-role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token || Auth.getToken()}`
            },
            body: JSON.stringify({ role: newRole })
        });

        const data = await response.json();
        if (response.ok) {
            // Update session through Auth module to ensure correct cookies and localstorage
            const updatedUser = data.user || { ...session, role: newRole };
            Auth.setUserSession(newRole, updatedUser);
            
            Components.showNotification(`Switched to ${newRole.toUpperCase()} view`, 'success');
            
            // Reload to apply role-specific routes and UI
            setTimeout(() => {
                window.location.hash = '#/';
                window.location.reload();
            }, 1000);
        } else {
            Components.showNotification(data.message || 'Failed to switch role', 'error');
        }
    } catch (err) {
        console.error('Role switch error:', err);
        Components.showNotification('Connection error during role switch', 'error');
    }
};

function updateUserUI() {
    const session = Auth.getUserSession();
    const isLoggedIn = session && session.email;

    // Update dropdown user info
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    
    if (isLoggedIn) {
        if (dropdownUserName) dropdownUserName.textContent = session.name || session.email.split('@')[0];
        if (dropdownUserEmail) dropdownUserEmail.textContent = session.email;
    }

    // Toggle dropdown states
    const dropdownGuest = document.getElementById('dropdown-guest');
    const dropdownUser = document.getElementById('dropdown-user');

    if (dropdownGuest && dropdownUser) {
        if (isLoggedIn) {
            dropdownGuest.classList.add('hidden');
            dropdownUser.classList.remove('hidden');
            
            // Sync role switcher
            const roleSwitcher = document.getElementById('role-switcher');
            if (roleSwitcher) {
                roleSwitcher.value = session.role || 'consumer';
            }
        } else {
            dropdownGuest.classList.remove('hidden');
            dropdownUser.classList.add('hidden');
        }
    }

    // Re-initialize icons
    if (window.lucide) lucide.createIcons();
}



function setupNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    const wrapper = document.getElementById('notifications-wrapper');
    const bellBtn = wrapper?.querySelector('.cursor-pointer');

    if (!wrapper || !dropdown) return;

    // Toggle dropdown
    if (bellBtn) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
            if (!dropdown.classList.contains('hidden')) {
                updateNotificationsUI();
            }
        });
    }

    // Request native notification permission
    if ("Notification" in window && Notification.permission === "default") {
        setTimeout(() => {
            Notification.requestPermission();
        }, 5000); // Ask after 5s to avoid annoying user immediately
    }

    // Handle dropdown toggle visibility
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Initial UI update
    updateNotificationsUI();

    // Poll for new notifications every 60 seconds
    setInterval(async () => {
        if (window.isLoggedIn()) {
            const oldNotifications = [...(State.get().notifications || [])];
            const newNotifications = await State.fetchNotifications();
            
            // Check for really new ones (not in old list by ID)
            const brandNew = newNotifications.filter(n => !oldNotifications.some(old => old.id === n.id));
            
            if (brandNew.length > 0) {
                updateNotificationsUI();
                
                // Show native browser notification
                if ("Notification" in window && Notification.permission === "granted") {
                    brandNew.forEach(n => {
                        const nativeNotify = new Notification(n.title, {
                            body: n.message,
                            icon: 'assets/favicon.png'
                        });
                        nativeNotify.onclick = () => {
                            window.focus();
                            window.location.hash = '/notifications';
                            nativeNotify.close();
                        };
                    });
                }
            }
        }
    }, 60000);
}

function updateNotificationsUI() {
    const notifications = State.get().notifications || [];
    const unreadCount = notifications.length;
    const badge = document.getElementById('unread-notifications-count');
    const list = document.getElementById('notifications-list');

    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    if (list) {
        if (notifications.length === 0) {
            list.innerHTML = '<div class="p-8 text-center text-slate-400 text-xs">No new notifications</div>';
        } else {
            list.innerHTML = notifications.map(n => `
                <div class="p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group" onclick="markNotificationRead(${n.id}, event)">
                    <div class="flex gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <i data-lucide="${n.type === 'order' ? 'package' : n.type === 'system' ? 'shield-check' : 'bell'}" class="w-4 h-4 text-blue-600"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-xs font-bold text-slate-800 mb-0.5">${n.title}</p>
                            <p class="text-[10px] text-slate-500 line-clamp-2">${n.message}</p>
                            <p class="text-[9px] text-slate-400 mt-1">${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                            <i data-lucide="check" class="w-3 h-3 text-slate-300 hover:text-green-500"></i>
                        </div>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        }
    }
}

window.markNotificationRead = async (id, event) => {
    event.stopPropagation();
    const notifications = State.get().notifications || [];
    const notification = notifications.find(n => n.id === id);
    
    // Mark as read in background
    const success = await State.markNotificationAsRead(id);
    if (success) {
        updateNotificationsUI();
        
        // Deep-linking logic
        if (notification && notification.link) {
            Router.navigate(notification.link);
        }
    }
};

function updateMobileUI() {
    const role = State.get().userRole;
    console.log('[UI] Updating Mobile Nav for role:', role);
    
    const bottomNav = document.getElementById('mobile-bottom-nav');
    const sideMenu = document.getElementById('mobile-menu-content');
    
    if (bottomNav) {
        bottomNav.setAttribute('data-role', role);
        bottomNav.innerHTML = Components.BottomNav();
        console.log(`[UI] Bottom Nav updated for role: ${role}`);
    }
    
    if (sideMenu) {
        sideMenu.innerHTML = Components.MobileMenu();
    }
    
    if (window.lucide) {
        lucide.createIcons();
    } else {
        console.warn('Lucide not loaded yet, retrying in 500ms...');
        setTimeout(() => window.lucide && lucide.createIcons(), 500);
    }
}

// Main scripts entry point
window.setupNotifications = setupNotifications;
window.updateNotificationsUI = updateNotificationsUI;
window.updateMobileUI = updateMobileUI;

// ==================== FINANCIAL INTEGRATION HANDLERS ====================

/**
 * Opens and populates the Bank Account Modal
 */
window.openBankModal = async () => {
    const modal = document.getElementById('bank-modal');
    if (!modal) return;

    // Show loading state in modal
    modal.innerHTML = `
        <div class="glass-card w-full max-w-md p-8 rounded-[2.5rem] bg-white animate-in fade-in zoom-in duration-300">
            <div class="flex flex-col items-center justify-center py-10">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p class="text-slate-500 font-bold">Loading bank list...</p>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');

    try {
        const banks = await State.fetchBanks();
        const existingBank = State.get().bankAccount;

        modal.innerHTML = `
            <div class="glass-card w-full max-w-md p-8 rounded-[2.5rem] bg-white animate-in fade-in zoom-in duration-300 relative shadow-2xl">
                <button onclick="document.getElementById('bank-modal').classList.add('hidden')" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                    <i data-lucide="x" class="w-6 h-6 text-slate-400"></i>
                </button>
                
                <h2 class="text-3xl font-black text-slate-900 mb-2">${existingBank ? 'Update Bank' : 'Link Bank'}</h2>
                <p class="text-slate-500 font-medium mb-8">Where should we send your earnings?</p>
                
                <form onsubmit="window.saveBankAccount(event)" class="space-y-6">
                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Bank</label>
                        <select name="bankCode" required onchange="window.resolveBankDetails()" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold appearance-none">
                            <option value="">Choose a bank...</option>
                            ${banks.map(b => `<option value="${b.code}" ${existingBank?.bank_code === b.code ? 'selected' : ''}>${b.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                        <input type="text" name="accountNumber" required maxlength="10" value="${existingBank?.account_number || ''}" oninput="window.resolveBankDetails()" 
                               class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" 
                               placeholder="10-digit number">
                    </div>

                    <div id="resolved-account-name" class="p-4 bg-blue-50 rounded-2xl hidden transition-all border border-blue-100">
                        <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 text-center">Verified Account Name</p>
                        <p class="text-blue-700 font-black text-center text-lg uppercase" id="account-name-display"></p>
                    </div>
                    
                    <input type="hidden" name="accountName" value="${existingBank?.account_name || ''}">

                    <div class="pt-4 flex gap-3">
                         <button type="button" onclick="document.getElementById('bank-modal').classList.add('hidden')" class="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                         <button type="submit" id="save-bank-btn" class="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                            Save Details
                         </button>
                    </div>
                </form>
            </div>
        `;
        lucide.createIcons();
        if (existingBank) window.resolveBankDetails();
    } catch (error) {
        Components.showNotification('Failed to load banks', 'error');
        modal.classList.add('hidden');
    }
};

/**
 * Resolves account name via API
 */
window.resolveBankDetails = async () => {
    const form = document.querySelector('#bank-modal form');
    const bankCode = form.bankCode.value;
    const accountNumber = form.accountNumber.value;
    const saveBtn = document.getElementById('save-bank-btn');
    const resolutionBox = document.getElementById('resolved-account-name');
    const nameDisplay = document.getElementById('account-name-display');

    if (bankCode && accountNumber.length === 10) {
        saveBtn.disabled = true;
        saveBtn.classList.add('opacity-50');
        resolutionBox.classList.remove('hidden');
        nameDisplay.innerHTML = `<span class="animate-pulse">Verifying...</span>`;

        try {
            const data = await State.resolveBankAccount({ bankCode, accountNumber });
            if (data.account_name) {
                nameDisplay.textContent = data.account_name;
                form.accountName.value = data.account_name;
                saveBtn.disabled = false;
                saveBtn.classList.remove('opacity-50');
            } else {
                nameDisplay.textContent = 'Invalid Account';
            }
        } catch (error) {
            nameDisplay.textContent = 'Account not found';
        }
    } else {
        resolutionBox.classList.add('hidden');
    }
};

/**
 * Saves bank account
 */
window.saveBankAccount = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const saveBtn = e.target.querySelector('button[type="submit"]');

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="animate-pulse">Saving...</span>';

    const result = await State.saveBankAccount(data);
    if (result) {
        document.getElementById('bank-modal').classList.add('hidden');
        // Re-render current page
        Router.handleRoute();
    } else {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Details';
    }
};

/**
 * Opens Payout Request Modal
 */
window.openPayoutModal = () => {
    const modal = document.getElementById('payout-modal');
    if (!modal) return;

    const bank = State.get().bankAccount;
    if (!bank) {
        Components.showNotification('Please link a bank account first', 'warning');
        window.openBankModal();
        return;
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
};

/**
 * Opens the platform-wide broadcast modal (lightbox)
 */
window.openBroadcastModal = () => {
    const modal = document.createElement('div');
    modal.id = 'broadcast-modal';
    modal.className = 'fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4';
    modal.innerHTML = `
        <div class="glass-card w-full max-w-2xl p-8 rounded-[2.5rem] bg-white animate-in fade-in zoom-in duration-300 relative shadow-2xl">
            <button onclick="this.closest('#broadcast-modal').remove()" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                <i data-lucide="x" class="w-6 h-6 text-slate-400"></i>
            </button>
            
            <div class="flex items-center gap-4 mb-8">
                <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <i data-lucide="megaphone" class="text-white w-7 h-7"></i>
                </div>
                <div>
                    <h2 class="text-3xl font-black text-slate-900">Platform Broadcast</h2>
                    <p class="text-slate-500 font-medium">Reach your audience instantly</p>
                </div>
            </div>

            <form onsubmit="event.preventDefault(); window.submitBroadcast(this);" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                        <input type="text" name="title" required placeholder="Flash Sale Live!" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold">
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Channel</label>
                        <select name="channel" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold appearance-none">
                            <option value="push">Push Notification</option>
                            <option value="email">Email</option>
                            <option value="both">Both</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Audience</label>
                        <select name="role" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold appearance-none">
                            <option value="all">All Users</option>
                            <option value="consumer">Consumers</option>
                            <option value="supplier">Suppliers</option>
                            <option value="dropshipper">Dropshippers</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Link (Optional)</label>
                        <input type="text" name="link" placeholder="#/products" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold">
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea name="message" required rows="3" placeholder="Get 20% off everything today..." class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"></textarea>
                </div>

                <div class="pt-4">
                    <button type="submit" class="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                        <i data-lucide="send" class="w-5 h-5"></i> Launch Broadcast
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
};

window.submitBroadcast = async (form) => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const btn = form.querySelector('button[type="submit"]');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="animate-spin" data-lucide="loader-2"></i> Launching...';
    lucide.createIcons();

    // Use createCampaign API with type 'broadcast'
    data.type = 'broadcast';
    const success = await State.createCampaign(data);
    if (success) {
        form.closest('#broadcast-modal').remove();
    } else {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Launch Broadcast';
        lucide.createIcons();
    }
};

/**
 * Opens the Campaign Slider creation modal
 */
window.openCampaignModal = () => {
    const modal = document.createElement('div');
    modal.id = 'campaign-modal';
    modal.className = 'fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4';
    modal.innerHTML = `
        <div class="glass-card w-full max-w-md p-8 rounded-[2.5rem] bg-white animate-in fade-in zoom-in duration-300 relative shadow-2xl">
            <button onclick="this.closest('#campaign-modal').remove()" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                <i data-lucide="x" class="w-6 h-6 text-slate-400"></i>
            </button>
            
            <h2 class="text-3xl font-black text-slate-900 mb-2">New Banner</h2>
            <p class="text-slate-500 font-medium mb-8">Add a slider to the homepage</p>

            <form onsubmit="event.preventDefault(); window.submitCampaign(this);" class="space-y-6">
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Banner Image</label>
                    <div class="relative group cursor-pointer">
                        <input type="file" name="image" required accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" onchange="window.previewBanner(this)">
                        <div id="banner-preview" class="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center group-hover:border-blue-400 transition-all overflow-hidden">
                            <i data-lucide="image" class="w-8 h-8 text-slate-300 mb-2"></i>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Banner</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                    <input type="text" name="title" required placeholder="Summer Collection" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold">
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Redirect URL</label>
                    <input type="text" name="redirect_url" required placeholder="#/category/Summer" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold">
                </div>

                <div class="pt-4">
                    <button type="submit" class="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-800 hover:-translate-y-1 transition-all">
                        Create Banner
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
};

window.previewBanner = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('banner-preview');
            preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.submitCampaign = async (form) => {
    const formData = new FormData(form);
    const data = {
        title: formData.get('title'),
        redirect_url: formData.get('redirect_url'),
        image: formData.get('image'),
        type: 'banner'
    };
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Uploading...';

    const success = await State.createCampaign(data);
    if (success) {
        form.closest('#campaign-modal').remove();
        Router.refresh();
    } else {
        btn.disabled = false;
        btn.textContent = 'Create Banner';
    }
};

window.pauseCoupon = async (id) => {
    try {
        const res = await fetch(`${window.API_BASE}/api/admin/coupons/${id}/toggle`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
        });
        if (res.ok) {
            Components.showNotification('Coupon status updated', 'success');
            Components.refreshCouponsList();
        }
    } catch (error) {
        console.error('Pause Coupon Error:', error);
    }
};

window.deleteCoupon = async (id) => {
    if (!(await Components.ConfirmAsync('Confirm Action', 'Are you sure you want to delete this coupon?'))) return;
    try {
        const res = await fetch(`${window.API_BASE}/api/admin/coupons/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
        });
        if (res.ok) {
            Components.showNotification('Coupon deleted', 'success');
            Components.refreshCouponsList();
        }
    } catch (error) {
        console.error('Delete Coupon Error:', error);
    }
};

/**
 * Opens Payout Request Modal
 */
window.openPayoutModal = () => {
    const modal = document.getElementById('payout-modal');
    if (!modal) return;

    const bank = State.get().bankAccount;
    if (!bank) {
        Components.showNotification('Please link your bank account first', 'warning');
        window.openBankModal();
        return;
    }

    const walletData = State.get().dropshipperWallet || State.get().supplierWallet || { wallets: [] };
    const primaryWallet = (walletData.wallets || []).find(w => w.currency === 'NGN') || { balance: 0 };

    modal.innerHTML = `
        <div class="glass-card w-full max-w-md p-8 rounded-[2.5rem] bg-white animate-in fade-in zoom-in duration-300 relative shadow-2xl">
            <button onclick="document.getElementById('payout-modal').classList.add('hidden')" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                <i data-lucide="x" class="w-6 h-6 text-slate-400"></i>
            </button>
            
            <h2 class="text-3xl font-black text-slate-900 mb-2">Request Payout</h2>
            <p class="text-slate-500 font-medium mb-8">Funds will be sent to your linked bank account.</p>
            
            <div class="p-4 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sending to</p>
                <p class="font-black text-slate-800">${bank.bank_name}</p>
                <p class="text-sm font-bold text-slate-500">${bank.account_number} • ${bank.account_name}</p>
            </div>

            <form onsubmit="window.handlePayout(event)" class="space-y-6">
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Withdrawal Amount (₦)</label>
                    <input type="number" name="amount" min="1000" max="${primaryWallet.balance}" required
                           class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-black text-3xl placeholder:text-slate-200" 
                           placeholder="0">
                    <div class="flex justify-between px-1">
                        <p class="text-[10px] font-bold text-slate-400">Min: ₦1,000</p>
                        <p class="text-[10px] font-bold text-slate-400">Max: ₦${Number(primaryWallet.balance).toLocaleString()}</p>
                    </div>
                </div>

                <div class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                    <div class="flex justify-between text-xs font-bold text-slate-600">
                        <span>Withdrawal Fee</span>
                        <span>₦0.00</span>
                    </div>
                    <div class="flex justify-between text-sm font-black text-blue-700 pt-2 border-t border-blue-100">
                        <span>Expected Credit</span>
                        <span id="expected-credit">₦0.00</span>
                    </div>
                </div>

                <div class="pt-4 flex gap-3">
                     <button type="button" onclick="document.getElementById('payout-modal').classList.add('hidden')" class="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                     <button type="submit" class="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                        Withdraw Now
                     </button>
                </div>
            </form>
        </div>
    `;

    const amountInput = modal.querySelector('input[name="amount"]');
    const expectedCredit = modal.querySelector('#expected-credit');
    
    amountInput.addEventListener('input', (e) => {
        const val = Number(e.target.value) || 0;
        expectedCredit.textContent = `₦${val.toLocaleString()}.00`;
    });

    modal.classList.remove('hidden');
    lucide.createIcons();
};

/**
 * Handles payout submission
 */
window.handlePayout = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = Number(formData.get('amount'));
    const bank = State.get().bankAccount;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!bank) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="animate-pulse">Processing...</span>';

    const result = await State.requestPayout({
        amount,
        bankAccountId: bank.id
    });

    if (result) {
        document.getElementById('payout-modal').classList.add('hidden');
        // Refresh wallet and transaction history
        if (State.getUserRole() === 'dropshipper') {
            await State.fetchDropshipperWallet();
        } else {
            await State.fetchSupplierWallet();
        }
        Router.handleRoute();
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Withdraw Now';
    }
};

// Initialize Sliders
window.initPriceSliders = () => {
    const minRange = document.getElementById('price-min');
    const maxRange = document.getElementById('price-max');
    const minInput = document.getElementById('price-min-val');
    const maxInput = document.getElementById('price-max-val');
    const track = document.getElementById('slider-track');

    if (!minRange || !maxRange || !track) return;

    const updateTrack = () => {
        const min = parseInt(minRange.value);
        const max = parseInt(maxRange.value);
        const minPercent = (min / 1000000) * 100;
        const maxPercent = 100 - (max / 1000000) * 100;
        track.style.left = minPercent + "%";
        track.style.right = maxPercent + "%";
        if (minInput) minInput.value = min;
        if (maxInput) maxInput.value = max;
    };

    minRange.oninput = () => {
        if (parseInt(minRange.value) > parseInt(maxRange.value)) {
            minRange.value = maxRange.value;
        }
        updateTrack();
    };

    maxRange.oninput = () => {
        if (parseInt(maxRange.value) < parseInt(minRange.value)) {
            maxRange.value = minRange.value;
        }
        updateTrack();
    };

    if (minInput) {
        minInput.onchange = () => {
            minRange.value = minInput.value;
            updateTrack();
        };
    }

    if (maxInput) {
        maxInput.onchange = () => {
            maxRange.value = maxInput.value;
            updateTrack();
        };
    }

    updateTrack();
};

// ==================== CAMPAIGN & MARKETING HANDLERS ====================

window.createCampaign = () => {
    const modal = document.createElement('div');
    modal.id = 'campaign-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-card w-full max-w-lg p-8 rounded-[2.5rem] bg-white shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onclick="this.closest('#campaign-modal').remove()" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                <i data-lucide="x" class="w-6 h-6 text-slate-400"></i>
            </button>
            <h2 class="text-3xl font-black text-slate-900 mb-2">New Campaign</h2>
            <p class="text-slate-500 font-medium mb-8">Boost your reach with a homepage banner.</p>
            
            <form id="campaign-form" class="space-y-6">
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Title</label>
                    <input type="text" name="title" required class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" placeholder="e.g. Summer Mega Sale">
                </div>
                
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Redirect URL</label>
                    <input type="text" name="redirect_url" required class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" placeholder="e.g. /#/category/electronics">
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Banner Image</label>
                    <div class="relative group">
                        <input type="file" name="image" accept="image/*" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onchange="window.previewCampaignImage(this)">
                        <div id="image-preview-container" class="w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 group-hover:border-blue-400 transition-all overflow-hidden">
                            <i data-lucide="image" class="w-10 h-10 text-slate-300 mb-2"></i>
                            <p class="text-xs font-bold text-slate-400">Click to upload banner (1200x400 recommended)</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="button" onclick="this.closest('#campaign-modal').remove()" class="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                    <button type="submit" class="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all">Launch Campaign</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();

    const form = document.getElementById('campaign-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-pulse">Launching...</span>';

        const formData = {
            title: form.title.value,
            redirect_url: form.redirect_url.value,
            image: form.image.files[0]
        };

        const success = await State.createCampaign(formData);
        if (success) {
            modal.remove();
            Router.refresh(true);
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Launch Campaign';
        }
    };
};

window.previewCampaignImage = (input) => {
    const container = document.getElementById('image-preview-container');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            container.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.createCoupon = () => {
    const modal = document.createElement('div');
    modal.id = 'coupon-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-card w-full max-w-md p-8 rounded-[2.5rem] bg-white shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onclick="this.closest('#coupon-modal').remove()" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                <i data-lucide="x" class="w-6 h-6 text-slate-400"></i>
            </button>
            <h2 class="text-3xl font-black text-slate-900 mb-2">Add Coupon</h2>
            <p class="text-slate-500 font-medium mb-8">Create a discount for your customers.</p>
            
            <form id="coupon-form" class="space-y-6">
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Coupon Code</label>
                    <input type="text" name="code" required class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono font-bold uppercase" placeholder="e.g. XPERIENCE20">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                        <select name="discount_type" class="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed (₦)</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Value</label>
                        <input type="number" name="discount_value" required class="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" placeholder="0">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Usage Limit</label>
                        <input type="number" name="usage_limit" class="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" placeholder="∞">
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Min Purchase</label>
                        <input type="number" name="min_purchase" class="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" placeholder="0">
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                    <input type="date" name="expires_at" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold">
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="button" onclick="this.closest('#coupon-modal').remove()" class="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                    <button type="submit" class="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 transition-all">Create Coupon</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();

    const form = document.getElementById('coupon-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-pulse">Creating...</span>';

        const formData = {
            code: form.code.value.trim().toUpperCase(),
            discount_type: form.discount_type.value,
            discount_value: parseFloat(form.discount_value.value) || 0,
            usage_limit: parseInt(form.usage_limit.value) || null,
            min_purchase: parseFloat(form.min_purchase.value) || 0,
            expires_at: form.expires_at.value || null,
            is_active: true
        };

        if (!formData.code || formData.discount_value <= 0) {
            State.notify('Please provide a valid code and value', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Coupon';
            return;
        }

        const success = await State.createCoupon(formData);
        if (success) {
            modal.remove();
            Router.refresh();
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Coupon';
        }
    };
};

window.showConfirmDialog = (title, message, onConfirm) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[4000] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-card w-full max-w-sm p-8 rounded-[2.5rem] bg-white shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <h2 class="text-2xl font-black text-slate-900 mb-2 text-center">${title}</h2>
            <p class="text-slate-500 font-medium mb-8 text-center">${message}</p>
            <div class="flex gap-4">
                <button id="cancel-btn" class="flex-1 py-3 text-slate-500 font-black tracking-widest hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                <button id="confirm-btn" class="flex-1 py-3 bg-red-600 text-white rounded-xl font-black tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 transition-all">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancel-btn').onclick = () => modal.remove();
    document.getElementById('confirm-btn').onclick = () => {
        modal.remove();
        if (onConfirm) onConfirm();
    };
};

window.showGhostLoginModal = (storeSlug) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-card w-full max-w-md p-8 rounded-[2.5rem] bg-white shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onclick="this.closest('div.fixed').remove()" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                <i data-lucide="x" class="w-6 h-6 text-slate-400"></i>
            </button>
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <i data-lucide="user-plus" class="w-8 h-8"></i>
            </div>
            <h2 class="text-3xl font-black text-center text-slate-900 mb-2">Guest Checkout</h2>
            <p class="text-slate-500 text-center font-medium mb-8">We will automatically create a secure account for you to track this order.</p>
            
            <button id="ghost-login-btn" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Continue to Payment <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>
            <p class="text-center text-xs text-slate-400 mt-4">You can update your account details later.</p>
        </div>
    `;
    document.body.appendChild(modal);
    if(window.lucide) window.lucide.createIcons();

    document.getElementById('ghost-login-btn').onclick = async function() {
        this.disabled = true;
        this.innerHTML = '<i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto"></i>';
        if(window.lucide) window.lucide.createIcons();
        
        const result = await Auth.ghostRegister(storeSlug);
        if (result.success) {
            modal.remove();
            State.notify('Account created successfully. Continuing to checkout...', 'success');
            Router.navigate('/checkout', true);
        } else {
            State.notify(result.message || 'Failed to create guest account', 'error');
            this.disabled = false;
            this.innerHTML = 'Continue to Payment <i data-lucide="arrow-right" class="w-5 h-5"></i>';
            if(window.lucide) window.lucide.createIcons();
        }
    };
};

window.showBindEmailModal = () => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-card w-full max-w-md p-8 rounded-[2.5rem] bg-white shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onclick="this.closest('div.fixed').remove()" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all">
                <i data-lucide="x" class="w-6 h-6 text-slate-400"></i>
            </button>
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <i data-lucide="mail-warning" class="w-8 h-8"></i>
            </div>
            <h2 class="text-3xl font-black text-center text-slate-900 mb-2">Verify Email</h2>
            <p class="text-slate-500 text-center font-medium mb-8">Please link a valid email address to your account to continue placing orders on the main store.</p>
            
            <form id="bind-email-form" class="space-y-4">
                <input type="email" id="bind-email-input" placeholder="Your Email Address" required class="w-full p-4 rounded-xl border bg-slate-50 outline-none focus:border-blue-500 transition-all font-bold">
                <button type="submit" class="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
                    Send Verification Code
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    if(window.lucide) window.lucide.createIcons();

    document.getElementById('bind-email-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('bind-email-input').value;
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto"></i>';
        if(window.lucide) window.lucide.createIcons();
        
        try {
            const token = Auth.getToken();
            const res = await fetch(window.apiUrl('/api/auth/bind-email/request'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                State.notify('Verification email sent!', 'success');
                modal.remove();
                Router.navigate('/login?verify=true&email=' + encodeURIComponent(email));
            } else {
                throw new Error(data.message || 'Failed to request binding');
            }
        } catch (error) {
            State.notify(error.message, 'error');
            btn.disabled = false;
            btn.innerHTML = 'Send Verification Code';
            if(window.lucide) window.lucide.createIcons();
        }
    };
};

window.shipOrder = async (orderId) => {
    const trackingInput = document.getElementById(`tracking-${orderId}`);
    const carrierInput = document.getElementById(`carrier-${orderId}`);
    
    if (trackingInput && trackingInput.value) {
        const trackingNumber = trackingInput.value;
        const carrierCode = carrierInput.value;
        
        window.showConfirmDialog('Ship Order', `Are you sure you want to add tracking number ${trackingNumber} and mark this order as shipped?`, async () => {
            const success = await State.updateOrderTracking(orderId, {
                trackingNumber,
                carrierCode,
                carrierName: carrierCode
            });
            if (success) {
                await State.updateOrderStatus(orderId, 'shipped');
                Components.showNotification('Order shipped successfully', 'success');
                Router.refresh(true);
            }
        });
    } else {
        Components.showNotification('Please enter a tracking number', 'error');
    }
};

window.openInvoice = async (orderId) => {
    try {
        const response = await fetch(`${window.API_BASE || '/api'}/warehouse/orders/${orderId}/invoice`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('xperience_session') || ''}` }
        });
        if (!response.ok) throw new Error('Failed to fetch commercial invoice');
        
        const html = await response.text();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
    } catch (error) {
        Components.showNotification('Failed to generate commercial invoice', 'error');
        console.error(error);
    }
};
