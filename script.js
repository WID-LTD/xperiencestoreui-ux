/**
 * script.js - Main Application (Refactored)
 * Wires together router, state, pages, and components
 */

import { Auth } from './auth.js';
import { Router } from './router.js';
import { State } from './state.js';
import { Data } from './data.js';
import { Components } from './components.js';
import { Pages } from './pages.js';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Initialize state
    State.init();
    
    // Set user role from session
    const userSession = Auth.getUserSession();
    const userRole = userSession?.role || 'consumer';
    State.set({ userRole });

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
    
    // Update user UI
    updateUserUI();
    
    // Initialize Lucide icons
    lucide.createIcons();
}

function initializeRouter() {
    const routes = {
        '/': () => renderHomePage(),
        '/login': () => renderPage(Pages.login()),
        '/register': () => renderPage(Pages.register()),
        
        // Consumer routes
        '/products': () => renderPage(Pages.consumer.products()),
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
        
        // Business (B2B) routes
        '/business/suppliers': () => renderPage(Pages.business.suppliers()),
        '/business/supplier/:id': (params) => renderPage(Pages.business.supplierDetail(params.id)),
        '/business/rfq/create': (params) => renderPage(Pages.business.rfqCreate(params)),
        '/business/rfq': () => renderPage(Pages.business.rfq()),
        '/business/rfq/:id': (params) => renderPage(Pages.business.rfq()),
        '/business/quotes': () => renderPage(Pages.business.quotes()),
        '/business/account': () => renderPage(Pages.business.account()),
        
        // Dropshipper routes
        '/dropshipper/storefront': () => renderPage(Pages.dropshipper.storefront()),
        '/dropshipper/store/:name': () => renderPage(Pages.dropshipper.publicStore()),
        '/dropshipper/catalog': () => renderPage(Pages.dropshipper.catalog()),
        '/dropshipper/profit-calculator': (params) => renderPage(Pages.dropshipper.profitCalculator(params)),
        '/dropshipper/analytics': () => renderPage(Pages.dropshipper.analytics()),
        '/dropshipper/orders': () => renderPage(Pages.dropshipper.orders()),
        
        // Warehouse routes
        '/warehouse/receiving': () => renderPage(Pages.warehouse.receiving()),
        '/warehouse/inventory': () => renderPage(Pages.warehouse.inventory()),
        '/warehouse/fulfillment': () => renderPage(Pages.warehouse.fulfillment()),
        '/warehouse/shipping': () => renderPage(Pages.warehouse.shipping()),
        '/warehouse/returns': () => renderPage(Pages.warehouse.returns()),
        '/warehouse/reports': () => renderPage(Pages.warehouse.reports()),
        
        // Supplier routes
        '/supplier/products': () => renderPage(Pages.supplier.products()),
        '/supplier/orders': () => renderPage(Pages.supplier.orders()),
        '/supplier/rfq': () => renderPage(Pages.supplier.rfq()),
        '/supplier/reports': () => renderPage(Pages.supplier.reports()),
        
        // Admin routes
        '/admin/users': () => renderPage(Pages.admin.users()),
        '/admin/marketing': () => renderPage(Pages.admin.marketing()),
        '/admin/reports': () => renderPage(Pages.admin.home()), // Reusing home for reports as it's dashboard
        '/admin/settings': () => renderPage(Pages.admin.settings()),
        
        // Support pages
        '/about': () => renderPage(Pages.support.about()),
        '/contact': () => renderPage(Pages.support.contact()),
        '/faq': () => renderPage(Pages.support.faq()),
        '/shipping': () => renderPage(Pages.support.shipping()),
        '/privacy': () => renderPage(Pages.support.privacy()),
        '/terms': () => renderPage(Pages.support.terms()),
        
        // Search
        '/search': (params) => renderPage(Pages.search(params))
    };

    Router.init(routes);
}

function renderHomePage() {
    const role = State.getUserRole();
    
    switch(role) {
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
            { label: 'Suppliers', path: '/suppliers' },
            { label: 'RFQ', path: '/rfq' },
            { label: 'Products', path: '/products' }
        ],
        dropshipper: [
            { label: 'Home', path: '/' },
            { label: 'My Store', path: '/storefront' },
            { label: 'Products', path: '/products' },
            { label: 'Analytics', path: '/analytics' }
        ],
        warehouse: [
            { label: 'Home', path: '/' },
            { label: 'Receiving', path: '/receiving' },
            { label: 'Inventory', path: '/inventory' },
            { label: 'Fulfillment', path: '/fulfillment' }
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
            { label: 'Users', path: '/admin/users' }
        ]
    };

    const roleLinks = links[role] || links.consumer;
    navLinks.innerHTML = roleLinks.map(link => `
        <a href="#${link.path}" class="nav-link hover:text-blue-600 transition-colors">${link.label}</a>
    `).join('');
    
    // Setup search functionality
    const searchInput = document.querySelector('input[placeholder="Search platform..."]');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    Router.navigate(`/search?q=${encodeURIComponent(query)}`);
                }
            }
        });
    }
}

function setupUserDropdown() {
    const profileTrigger = document.getElementById('profile-trigger');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Toggle dropdown on click
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
            userDropdown.classList.add('hidden');
            updateUserUI();
            Router.navigate('/');
            Components.showNotification('Logged out successfully', 'success');
        });
    }
}

function updateUserUI() {
    const session = Auth.getUserSession();
    const isLoggedIn = session && session.email;
    
    // Update user name and role labels
    const userNameLabel = document.getElementById('user-name-label');
    const userRoleLabel = document.getElementById('user-role-label');
    
    if (isLoggedIn) {
        userNameLabel.textContent = session.name || session.email.split('@')[0];
        userRoleLabel.textContent = (session.role || 'consumer').toUpperCase();
        
        // Update dropdown user info
        const dropdownUserName = document.getElementById('dropdown-user-name');
        const dropdownUserEmail = document.getElementById('dropdown-user-email');
        if (dropdownUserName) dropdownUserName.textContent = session.name || 'User';
        if (dropdownUserEmail) dropdownUserEmail.textContent = session.email;
    } else {
        userNameLabel.textContent = 'Guest User';
        userRoleLabel.textContent = 'CONSUMER';
    }
    
    // Toggle dropdown states
    const dropdownGuest = document.getElementById('dropdown-guest');
    const dropdownUser = document.getElementById('dropdown-user');
    
    if (isLoggedIn) {
        dropdownGuest.classList.add('hidden');
        dropdownUser.classList.remove('hidden');
    } else {
        dropdownGuest.classList.remove('hidden');
        dropdownUser.classList.add('hidden');
    }
    
    // Re-initialize icons
    lucide.createIcons();
}



function setupChat() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-msg');
    const chatContent = document.getElementById('chat-content');

    chatToggle.onclick = () => {
        chatWindow.classList.toggle('hidden');
    };

    chatClose.onclick = () => {
        chatWindow.classList.add('hidden');
    };

    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message-bubble ${role === 'user' ? 'message-user' : 'message-bot'}`;
        msgDiv.textContent = text;
        chatContent.appendChild(msgDiv);
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    sendBtn.onclick = () => {
        if (!chatInput.value.trim()) return;
        
        appendMessage('user', chatInput.value);
        const userMsg = chatInput.value;
        chatInput.value = '';

        // Simple AI Bot Logic
        setTimeout(() => {
            const role = State.getUserRole();
            let response = `I'm looking into your request about "${userMsg}". How else can I assist?`;
            
            if (role === 'business') {
                response = "Connecting you to the Supplier's sales team... Please hold.";
            } else if (role === 'warehouse') {
                response = "WMS Help Desk: I can help you with inventory, receiving, and fulfillment. What do you need?";
            }
            
            appendMessage('bot', response);
        }, 1000);
    };

    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') sendBtn.click();
    };
}

// Make Router and State globally available
window.Router = Router;
window.State = State;
window.Auth = Auth;
window.Pages = Pages;
window.Data = Data;
