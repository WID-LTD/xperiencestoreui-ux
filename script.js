/**
 * script.js - Main Application (Refactored)
 * Wires together router, state, pages, and components
 */

import { Auth } from './auth.js?v=3.1.3';
import { Router } from './router.js?v=3.1.3';
import { State } from './state.js?v=3.1.3';
import { Data } from './data.js?v=3.1.3';
import { Components } from './components.js?v=3.1.3';
import { Pages } from './pages.js?v=3.1.3';
import { Payment } from './payment.js?v=3.1.3';
import { PaymentCheckoutModal } from './paymentModal.js?v=3.1.3';


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

async function initApp() {
    // Initialize state
    State.init();

    // Set user role from session
    const userSession = Auth.getUserSession();
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

    // Setup mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.onclick = () => Components.toggleMobileMenu();
    }
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    if (menuOverlay) {
        menuOverlay.onclick = () => Components.toggleMobileMenu();
    }

    // Initial mobile nav/menu injection
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
            dataFetches.push(State.fetchSupplierStats());
            dataFetches.push(State.fetchSupplierOrders());
        } else if (userRole === 'warehouse') {
            dataFetches.push(State.fetchInventory());
            dataFetches.push(State.fetchOrders());
        } else if (userRole === 'admin') {
            dataFetches.push(State.fetchAdminStats());
            dataFetches.push(State.fetchAdminOrders());
        } else if (userRole === 'dropshipper') {
            dataFetches.push(State.fetchDropshipperStats());
            dataFetches.push(State.fetchDropshipperOrders());
            dataFetches.push(State.fetchDropshipperWallet());
        }

        // Always fetch notifications
        dataFetches.push(State.fetchNotifications());

        try {
            await Promise.allSettled(dataFetches);
            // Re-render if we are on a relevant dashboard page
            const currentRoute = Router.getCurrentRoute();
            if (currentRoute && (
                currentRoute.startsWith('/supplier') || 
                currentRoute.startsWith('/admin') || 
                currentRoute.startsWith('/warehouse') || 
                currentRoute.startsWith('/dropshipper') ||
                currentRoute === '/notifications'
            )) {
                Router.handleRoute();
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
        '/warehouse/receiving': () => Auth.requireRole('warehouse', () => renderPage(Pages.warehouse.receiving())),
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
        '/supplier/reports': () => Auth.requireRole('supplier', () => renderPage(Pages.supplier.reports())),
        // Admin routes
        '/admin/users': () => Auth.requireRole('admin', () => State.fetchAdminUsers().then(() => renderPage(Pages.admin.users()))),
        '/admin/orders': () => Auth.requireRole('admin', () => State.fetchAdminOrders().then(() => renderPage(Pages.admin.orders()))),
        '/admin/products': () => Auth.requireRole('admin', () => State.fetchAdminAllProducts().then(() => renderPage(Pages.admin.products()))),
        '/admin/marketing': () => Auth.requireRole('admin', () => renderPage(Pages.admin.marketing())),
        '/admin/reports': () => Auth.requireRole('admin', () => State.fetchAdminLogs().then(() => renderPage(Pages.admin.reports()))),
        '/admin/settings': () => Auth.requireRole('admin', () => State.fetchAdminSettings().then(() => renderPage(Pages.admin.settings()))),

        // Support pages
        '/about': () => renderPage(Pages.support.about()),
        '/contact': () => renderPage(Pages.support.contact()),
        '/faq': () => renderPage(Pages.support.faq()),
        '/shipping': () => renderPage(Pages.support.shipping()),
        '/privacy': () => renderPage(Pages.support.privacy()),
        '/terms': () => renderPage(Pages.support.terms()),

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
    const profileTrigger = document.getElementById('profile-area');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (profileTrigger && userDropdown) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!profileTrigger.contains(e.target)) {
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
            updateUserUI();
            Components.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.hash = '/';
                window.location.reload();
            }, 500);
        };
    }
}

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
    const bellBtn = wrapper?.querySelector('button');

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

    // Handle dropdown toggle visibility
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Initial UI update
    updateNotificationsUI();

    // Poll for new notifications every 60 seconds
    setInterval(() => {
        if (window.isLoggedIn()) {
            State.fetchNotifications().then(() => updateNotificationsUI());
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
    const success = await State.markNotificationAsRead(id);
    if (success) {
        updateNotificationsUI();
    }
};

function updateMobileUI() {
    const bottomNav = document.getElementById('mobile-bottom-nav');
    const sideMenu = document.getElementById('mobile-menu-content');
    
    if (bottomNav) {
        bottomNav.innerHTML = Components.BottomNav();
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

// Make Router and State globally available
window.Router = Router;
window.State = State;
window.Auth = Auth;
window.Pages = Pages;
window.Data = Data;
window.Components = Components;

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
