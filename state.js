/**
 * state.js - State Management with LocalStorage
 * Manages application state and persists to localStorage
 */

export const State = {
    // Default state
    _state: {
        currentUser: null,
        userRole: 'consumer',
        cart: [],
        wishlist: [],
        currentPage: 'home',
        filters: {},
        searchQuery: '',
        notifications: []
    },

    // Initialize state from localStorage
    init() {
        const saved = localStorage.getItem('xperince_state');
        if (saved) {
            try {
                this._state = { ...this._state, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load state:', e);
            }
        }
        return this._state;
    },

    // Get entire state
    get() {
        return this._state;
    },

    // Set state and persist
    set(updates) {
        this._state = { ...this._state, ...updates };
        this.persist();
        return this._state;
    },

    // Persist to localStorage
    persist() {
        try {
            localStorage.setItem('xperince_state', JSON.stringify(this._state));
        } catch (e) {
            console.error('Failed to persist state:', e);
        }
    },

    // Cart methods
    addToCart(product, quantity = 1) {
        const existing = this._state.cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this._state.cart.push({ ...product, quantity });
        }
        this.persist();
        this.notify('Product added to cart', 'success');
        return this._state.cart;
    },

    removeFromCart(productId) {
        this._state.cart = this._state.cart.filter(item => item.id !== productId);
        this.persist();
        this.notify('Product removed from cart', 'info');
        return this._state.cart;
    },

    updateCartQuantity(productId, quantity) {
        const item = this._state.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            }
        }
        this.persist();
        return this._state.cart;
    },

    clearCart() {
        this._state.cart = [];
        this.persist();
        return this._state.cart;
    },

    getCartTotal() {
        return this._state.cart.reduce((total, item) => {
            const price = this._state.userRole === 'business' ? item.bulkPrice : item.price;
            return total + (price * item.quantity);
        }, 0);
    },

    getCartCount() {
        return this._state.cart.reduce((count, item) => count + item.quantity, 0);
    },

    // Wishlist methods
    addToWishlist(product) {
        if (!this._state.wishlist.find(item => item.id === product.id)) {
            this._state.wishlist.push(product);
            this.persist();
            this.notify('Added to wishlist', 'success');
        }
        return this._state.wishlist;
    },

    removeFromWishlist(productId) {
        this._state.wishlist = this._state.wishlist.filter(item => item.id !== productId);
        this.persist();
        this.notify('Removed from wishlist', 'info');
        return this._state.wishlist;
    },

    isInWishlist(productId) {
        return this._state.wishlist.some(item => item.id === productId);
    },

    // Notification system
    notify(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        this._state.notifications.push(notification);
        
        // Trigger UI update
        if (window.showNotification) {
            window.showNotification(message, type);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this._state.notifications = this._state.notifications.filter(n => n.id !== notification.id);
        }, 5000);
    },

    // User session
    setUser(role, userData = {}) {
        this._state.userRole = role;
        this._state.currentUser = userData;
        this.persist();
    },

    getUser() {
        return this._state.currentUser;
    },

    getUserRole() {
        return this._state.userRole;
    },

    // Clear all state
    clear() {
        this._state = {
            currentUser: null,
            userRole: 'consumer',
            cart: [],
            wishlist: [],
            currentPage: 'home',
            filters: {},
            searchQuery: '',
            notifications: []
        };
        localStorage.removeItem('xperince_state');
    }
};
