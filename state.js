/**
 * state.js - State Management
 * Cart & Wishlist: DB-backed for logged-in users, localStorage for guests.
 * Orders: always from DB for logged-in users.
 */

const API = (window.API_BASE || '') + '/api';

// ---------------------------------------------------------------------------
// Helper: auth header from session token
// ---------------------------------------------------------------------------
function authHeaders() {
    try {
        const session = localStorage.getItem('xperince_session');
        if (!session) return {};
        const { token } = JSON.parse(session);
        return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    } catch {
        return {};
    }
}

function isLoggedIn() {
    try {
        const session = localStorage.getItem('xperince_session');
        if (!session) return false;
        const { token, id } = JSON.parse(session);
        return !!(token && id);
    } catch {
        return false;
    }
}

// ---------------------------------------------------------------------------
// Internal: call DB cart API and update local cache
// ---------------------------------------------------------------------------
async function _dbCartOp(method, path, body) {
    const res = await fetch(`${API}/cart${path}`, {
        method,
        headers: authHeaders(),
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Cart API error');
    }
    return res.json();
}

async function _dbWishlistOp(method, path, body) {
    const res = await fetch(`${API}/wishlist${path}`, {
        method,
        headers: authHeaders(),
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Wishlist API error');
    }
    return res.json();
}
// ---------------------------------------------------------------------------
export const State = {
    _state: {
        currentUser: null,
        userRole: 'consumer',
        cart: [],          // local cache — synced from DB for logged-in users
        wishlist: [],      // local cache — synced from DB for logged-in users
        currentPage: 'home',
        filters: {},
        searchQuery: '',
        notifications: [],
        products: [],
        supplierStats: null,
        supplierOrders: [],
        supplierProducts: [],
        rfqs: [],
        inventory: [],
        loading: false,
        adminLogs: [],
        adminLogArchives: [],
        dropshipperStore: null,
        dropshipperOrders: [],
        dropshipperStats: null,
        dropshipperWallet: null,
        mediaBaseUrl: 'https://pub-1810eb8d0d69404da7b4db4dbdd611ff.r2.dev',
        fetchingCart: false,
        fetchingWishlist: false,
        fetchingOrders: false,
        businessStats: null
    },

    // Currency Format Helper
    formatCurrency(amount, currency = 'NGN') {
        const symbol = (currency === 'NGN' || currency === 'Naira' || !currency) ? '₦' : currency === 'USD' ? '$' : currency;
        return `${symbol}${(Number(amount) || 0).toLocaleString()}`;
    },

    // Refresh all relevant data for the current user/context
    async refreshAllData() {
        if (this._state.loading) return; // Prevent concurrent refreshes
        
        const dataFetches = [this.fetchProducts()];
        const role = this._state.userRole;

        if (isLoggedIn()) {
            dataFetches.push(this.fetchNotifications());
            dataFetches.push(this._loadCartFromDB());
            dataFetches.push(this._loadWishlistFromDB());
            dataFetches.push(this.fetchOrders());

            if (role === 'admin') {
                dataFetches.push(this.fetchAdminStats());
                dataFetches.push(this.fetchAdminLogs());
            } else if (role === 'supplier') {
                dataFetches.push(this.fetchSupplierStats());
                dataFetches.push(this.fetchSupplierOrders());
                dataFetches.push(this.fetchSupplierProducts());
            } else if (role === 'warehouse') {
                dataFetches.push(this.fetchInventory());
            } else if (role === 'business') {
                dataFetches.push(this.fetchRFQs());
            } else if (role === 'dropshipper') {
                dataFetches.push(this.fetchDropshipperStore());
                dataFetches.push(this.fetchDropshipperOrders());
                dataFetches.push(this.fetchDropshipperStats());
                dataFetches.push(this.fetchDropshipperWallet());
            }
        }

        try {
            await Promise.allSettled(dataFetches);
            this._persistNonSensitive();
        } catch (err) {
            console.error('State refresh error:', err);
        }
    },

    getMediaUrl(productId, index = 0) {
        return `${this._state.mediaBaseUrl}/products/${productId}/${index}.jpg`;
    },

    get() {
        return this._state;
    },

    set(update) {
        const oldRole = this._state.userRole;
        this._state = { ...this._state, ...update };
        this._persistNonSensitive();
        
        if (update.userRole && update.userRole !== oldRole) {
            console.log(`[STATE] Role changed: ${oldRole} -> ${update.userRole}`);
        }

        // Globally notify UI of state change for reactive updates (e.g., role changes)
        if (window.updateMobileUI) window.updateMobileUI();
        if (window.updateNotificationsUI) window.updateNotificationsUI();
        if (window.updateUserUI) window.updateUserUI();
    },

    setUser(role, user) {
        this.set({ 
            userRole: role || 'consumer', 
            currentUser: user,
            loading: false 
        });
        // After setting user, refresh their specific data
        this.refreshAllData();
    },

    logout() {
        this.set({ 
            userRole: 'consumer', 
            currentUser: null,
            cart: [],
            wishlist: [],
            notifications: []
        });
        // Clear sensitive caches
        localStorage.removeItem('xperince_session');
        document.cookie = "xperince_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },

    // Fetch products from API with optional filters
    async fetchProducts(filters = {}) {
        this._state.loading = true;
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(window.apiUrl(`/api/products?${params}`));
            if (response.ok) {
                const products = await response.json();
                
                // Update specific product slices
                if (filters.sponsored) {
                    this._state.sponsoredProducts = products;
                } else if (filters.limit && !filters.category && !filters.search) {
                    this._state.recommendedProducts = products;
                }
                
                if (!filters.sponsored && !filters.category && !filters.limit) {
                    this._state.products = products;
                }
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            // Always set fetched flags to true if these filters were used, 
            // even on error, to prevent infinite retry loops in UI
            if (filters.sponsored) this._state.fetchedSponsored = true;
            if (filters.limit && !filters.category && !filters.search) this._state.fetchedRecommended = true;
            if (!Object.keys(filters).length) this._state.fetchedProducts = true;
            
            this._state.loading = false;
            this._persistNonSensitive();
        }
        return this._state.products;
    },

    async fetchRecommendations() {
        // Basic recommendation: just get 4 interesting products
        return this.fetchProducts({ limit: 4 });
    },

    // Fetch notifications for the current user
    async fetchNotifications() {
        if (!isLoggedIn()) return [];
        try {
            const res = await fetch(`${API}/notifications`, { headers: authHeaders() });
            if (res.ok) {
                const notifications = await res.json();
                this._state.notifications = notifications;
                this._persistNonSensitive();

                // Real-time: Mark undelivered notifications as delivered on this device
                const undelivered = notifications.filter(n => !n.delivered_at).map(n => n.id);
                if (undelivered.length > 0) {
                    await fetch(`${API}/notifications/mark-delivered`, {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({ ids: undelivered })
                    });
                }

                return notifications;
            }
        } catch (err) {
            console.error('Fetch notifications error:', err);
        }
        return [];
    },

    async markNotificationAsRead(id) {
        try {
            const res = await fetch(`${API}/notifications/${id}/read`, {
                method: 'PUT',
                headers: authHeaders()
            });
            if (res.ok) {
                this._state.notifications = this._state.notifications.filter(n => n.id !== id);
                this._persistNonSensitive();
                return true;
            }
        } catch (err) {
            console.error('Mark notification error:', err);
        }
        return false;
    },

    isLoading() { return this._state.loading || false; },
    getProducts() { return this._state.products || []; },
    getInventory() { return this._state.inventory || []; },

    // Initialize state from localStorage
    init() {
        const saved = localStorage.getItem('xperince_state');
        if (saved) {
            try {
                const parsedState = JSON.parse(saved);
                this._state = { ...this._state, ...parsedState };

                if (this._state.products?.length > 0) {
                    if (!this._state.products.every(p => p.id)) {
                        this._state.products = [];
                        this._persistNonSensitive();
                    }
                }
            } catch (e) {
                console.error('Failed to load state:', e);
            }
        }

        // For logged-in users: refresh cart & wishlist from DB in background
        if (isLoggedIn()) {
            this._loadCartFromDB();
            this._loadWishlistFromDB();
        }

        return this._state;
    },

    // Load cart from DB and update local cache
    async _loadCartFromDB() {
        this._state.fetchingCart = true;
        try {
            const data = await _dbCartOp('GET', '');
            this._state.cart = data.items || [];
            this._persistNonSensitive();
        } catch (err) {
            console.warn('Could not load cart from DB:', err.message);
        } finally {
            this._state.fetchingCart = false;
        }
    },

    // Load wishlist from DB and update local cache
    async _loadWishlistFromDB() {
        this._state.fetchingWishlist = true;
        try {
            const data = await _dbWishlistOp('GET', '');
            this._state.wishlist = data.items || [];
            this._persistNonSensitive();
        } catch (err) {
            console.warn('Could not load wishlist from DB:', err.message);
        } finally {
            this._state.fetchingWishlist = false;
        }
    },

    // Sync localStorage cart/wishlist to DB after login
    async syncToDBAfterLogin() {
        const localCart = this._state.cart || [];
        const localWishlist = this._state.wishlist || [];

        try {
            if (localCart.length > 0) {
                const items = localCart.map(i => ({ productId: i.id, quantity: i.quantity }));
                const data = await _dbCartOp('POST', '/sync', { items });
                this._state.cart = data.items || [];
            } else {
                await this._loadCartFromDB();
            }
        } catch (err) {
            console.warn('Cart sync error:', err.message);
            await this._loadCartFromDB();
        }

        try {
            if (localWishlist.length > 0) {
                const productIds = localWishlist.map(i => i.id);
                const data = await _dbWishlistOp('POST', '/sync', { productIds });
                this._state.wishlist = data.items || [];
            } else {
                await this._loadWishlistFromDB();
            }
        } catch (err) {
            console.warn('Wishlist sync error:', err.message);
            await this._loadWishlistFromDB();
        }

        this._persistNonSensitive();
    },

    getSuppliers() {
        if (!this._state.products) return [];
        const suppliers = [];
        const seen = new Set();
        this._state.products.forEach(p => {
            if (p.supplier && !seen.has(p.supplier.id)) {
                seen.add(p.supplier.id);
                suppliers.push(p.supplier);
            }
        });
        return suppliers;
    },

    getCategories() {
        if (!this._state.products) return [];
        const categories = [...new Set(this._state.products.map(p => p.category))];
        return categories.map(c => ({
            name: c,
            slug: c.toLowerCase().replace(/ /g, '-'),
            count: this._state.products.filter(p => p.category === c).length
        }));
    },

    getOrders() { return this._state.orders || []; },
    getRFQs() { return this._state.rfqs || []; },
    getInventory() { return this._state.inventory || []; },
    getSupplierStats() { return this._state.supplierStats; },
    getSupplierOrders() { return this._state.supplierOrders || []; },
    getSupplierProducts() { return this._state.supplierProducts || []; },
    getDropshipperStore() { return this._state.dropshipperStore; },
    getDropshipperOrders() { return this._state.dropshipperOrders || []; },
    getDropshipperStats() { return this._state.dropshipperStats; },
    getDropshipperWallet() { return this._state.dropshipperWallet; },
    getBusinessStats() { return this._state.businessStats; },

    // Dropshipper Data Fetches
    async fetchDropshipperStore() {
        if (!isLoggedIn()) return null;
        try {
            const res = await fetch(`${API}/store`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                this._state.dropshipperStore = data.store;
                this._state.dropshipperProducts = data.products; // For catalog/storefront view
                this._persistNonSensitive();
                return data;
            }
        } catch (err) {
            console.error('Fetch dropshipper store error:', err);
        }
        return { store: { store_name: 'My Store', store_slug: 'mystore', description: '' }, products: [] };
    },

    async handlePayout(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = {
            amount: parseFloat(formData.get('amount')),
            bankName: formData.get('bankName'),
            binNumber: formData.get('binNumber'),
            accountName: formData.get('accountName')
        };

        try {
            const res = await fetch(`${API}/supplier/finance/payout`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const result = await res.json();
                Components.showNotification(result.message, 'success');
                document.getElementById('payout-modal').classList.add('hidden');
                this.fetchDropshipperWallet(); // Refresh wallet
                return true;
            } else {
                const err = await res.json();
                Components.showNotification(err.message, 'error');
            }
        } catch (err) {
            console.error('Payout request error:', err);
            Components.showNotification('Failed to submit payout request', 'error');
        }
        return false;
    },

    // Persist state (excluding large product list to keep it light)
    _persistNonSensitive() {
        try {
            const toSave = { ...this._state };
            // Don't persist columns that are fetched fresh or are transient
            delete toSave.products;
            delete toSave.loading;
            localStorage.setItem('xperince_state', JSON.stringify(toSave));
        } catch (e) {
            console.error('Failed to persist state:', e);
        }
    },

    persist() { this._persistNonSensitive(); },

    // ===========================================================
    // CART METHODS (DB-backed for logged-in users, localStorage for guests)
    // ===========================================================

    async fetchOrders() {
        try {
            const res = await fetch(`${API}/orders`, { headers: authHeaders() });
            if (res.ok) {
                const orders = await res.json();
                this._state.orders = orders;
                this._persistNonSensitive();
                return orders;
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
        }
        return [];
    },

    async addToCart(product, quantity = 1) {
        if (isLoggedIn()) {
            try {
                const data = await _dbCartOp('POST', '', { productId: product.id, quantity });
                this._state.cart = data.items || [];
                this._persistNonSensitive();
                this._updateCartBadge();
                this.notify(`${product.name} added to cart`, 'success');
                return this._state.cart;
            } catch (err) {
                this.notify(err.message || 'Failed to add to cart', 'error');
                return this._state.cart;
            }
        }
        // Guest: localStorage only
        const existing = this._state.cart.find(i => i.id === product.id);
        if (existing) { existing.quantity += quantity; }
        else { this._state.cart.push({ ...product, quantity }); }
        this._persistNonSensitive();
        this._updateCartBadge();
        this.notify(`${product.name} added to cart`, 'success');
        return this._state.cart;
    },

    async removeFromCart(productId) {
        if (isLoggedIn()) {
            try {
                const data = await _dbCartOp('DELETE', `/${productId}`);
                this._state.cart = data.items || [];
                this._persistNonSensitive();
                this._updateCartBadge();
                this.notify('Removed from cart', 'info');
                return this._state.cart;
            } catch (err) {
                this.notify('Failed to remove item', 'error');
                return this._state.cart;
            }
        }
        this._state.cart = this._state.cart.filter(i => i.id !== productId);
        this._persistNonSensitive();
        this._updateCartBadge();
        this.notify('Removed from cart', 'info');
        return this._state.cart;
    },

    async updateCartQuantity(productId, quantity) {
        if (quantity <= 0) return this.removeFromCart(productId);
        if (isLoggedIn()) {
            try {
                const data = await _dbCartOp('PUT', `/${productId}`, { quantity });
                this._state.cart = data.items || [];
                this._persistNonSensitive();
                this._updateCartBadge();
                return this._state.cart;
            } catch (err) {
                this.notify('Failed to update quantity', 'error');
                return this._state.cart;
            }
        }
        const item = this._state.cart.find(i => i.id === productId);
        if (item) item.quantity = quantity;
        this._persistNonSensitive();
        this._updateCartBadge();
        return this._state.cart;
    },

    async clearCart() {
        if (isLoggedIn()) {
            try {
                await _dbCartOp('DELETE', '');
            } catch (err) {
                console.warn('Clear cart error:', err.message);
            }
        }
        this._state.cart = [];
        this._persistNonSensitive();
        this._updateCartBadge();
        return [];
    },

    getCart() { return this._state.cart || []; },

    getCartTotal() {
        return this._state.cart.reduce((total, item) => {
            const price = this._state.userRole === 'business' ? item.bulkPrice : item.price;
            return total + (price * item.quantity);
        }, 0);
    },

    getCartCount() {
        return this._state.cart.reduce((count, item) => count + item.quantity, 0);
    },

    _updateCartBadge() {
        const count = this.getCartCount();
        
        // Update both the main app badge and component badges
        const badges = [
            document.getElementById('cart-badge'),
            document.getElementById('mobile-cart-badge'),
            ...document.querySelectorAll('.shopping-cart-badge')
        ];

        badges.forEach(badge => {
            if (badge) {
                badge.textContent = count;
                badge.classList.toggle('hidden', count === 0);
                // Also handle display: none if using utility classes
                if (count === 0) {
                    badge.style.display = 'none';
                } else {
                    badge.style.display = 'flex';
                }
            }
        });
    },

    // ===========================================================
    // WISHLIST METHODS
    // ===========================================================

    async addToWishlist(product) {
        if (isLoggedIn()) {
            try {
                // Assuming _dbWishlistOp is similar to _dbCartOp
                const data = await _dbWishlistOp('POST', '', { productId: product.id });
                this._state.wishlist = data.items || [];
                this._persistNonSensitive();
                this.notify(`${product.name} added to wishlist`, 'success');
                return this._state.wishlist;
            } catch (err) {
                this.notify(err.message || 'Failed to add to wishlist', 'error');
                return this._state.wishlist;
            }
        }
        if (!this._state.wishlist.find(i => i.id === product.id)) {
            this._state.wishlist.push(product);
            this._persistNonSensitive();
            this.notify(`${product.name} added to wishlist`, 'success');
        }
        return this._state.wishlist;
    },

    async removeFromWishlist(productId) {
        if (isLoggedIn()) {
            try {
                const data = await _dbWishlistOp('DELETE', `/${productId}`);
                this._state.wishlist = data.items || [];
                this._persistNonSensitive();
                this.notify('Removed from wishlist', 'info');
                return this._state.wishlist;
            } catch (err) {
                this.notify('Failed to remove from wishlist', 'error');
                return this._state.wishlist;
            }
        }
        this._state.wishlist = this._state.wishlist.filter(i => i.id !== productId);
        this._persistNonSensitive();
        this.notify('Removed from wishlist', 'info');
        return this._state.wishlist;
    },

    isInWishlist(productId) {
        return this._state.wishlist.some(i => i.id === productId);
    },

    getWishlist() { return this._state.wishlist || []; },

    // ===========================================================
    // ORDERS (DB-backed for logged-in users)
    // ===========================================================

    async fetchOrders() {
        if (!isLoggedIn()) return this._state.orders || [];
        this._state.fetchingOrders = true;
        try {
            const res = await fetch(`${API}/orders/my`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                this._state.orders = data.orders || [];
                this._persistNonSensitive();
                return this._state.orders;
            }
        } catch (err) {
            console.warn('Could not fetch orders:', err.message);
        } finally {
            this._state.fetchingOrders = false;
        }
        return this._state.orders || [];
    },

    async fetchOrderById(id) {
        try {
            const res = await fetch(`${API}/orders/${id}`, { headers: authHeaders() });
            if (res.ok) {
                return await res.json();
            }
        } catch (err) {
            console.warn('Could not fetch order detail:', err.message);
        }
        return null;
    },

    async fetchTrackingData(trackingNumber) {
        try {
            const res = await fetch(`${API}/tracking/${trackingNumber}`);
            if (res.ok) {
                return await res.json();
            }
        } catch (err) {
            console.error('Tracking fetch error:', err);
        }
        return { success: false, message: 'Failed to load tracking info' };
    },

    // ===========================================================
    // SUPPLIER METHODS
    // ===========================================================

    async fetchSupplierStats() {
        this._state.loading = true;
        try {
            const res = await fetch(`${API}/supplier/stats`, { headers: authHeaders() });
            if (res.ok) {
                const stats = await res.json();
                this._state.supplierStats = stats;
                return stats;
            }
        } catch (err) {
            console.error('Fetch supplier stats error:', err);
        } finally {
            this._state.loading = false;
        }
        return null;
    },

    async fetchSupplierOrders() {
        this._state.loading = true;
        try {
            const res = await fetch(`${API}/supplier/orders`, { headers: authHeaders() });
            if (res.ok) {
                const orders = await res.json();
                this._state.supplierOrders = orders;
                return orders;
            }
        } catch (err) {
            console.error('Fetch supplier orders error:', err);
        } finally {
            this._state.loading = false;
        }
        return [];
    },

    async fetchSupplierProducts() {
        this._state.loading = true;
        try {
            const res = await fetch(`${API}/supplier/products`, { headers: authHeaders() });
            if (res.ok) {
                const products = await res.json();
                this._state.supplierProducts = products;
                return products;
            }
        } catch (err) {
            console.error('Fetch supplier products error:', err);
        } finally {
            this._state.loading = false;
        }
        return [];
    },

    async updateOrderStatus(orderId, status) {
        try {
            const res = await fetch(`${API}/supplier/orders/${orderId}/status`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (res.ok) {
                this.notify(data.message || 'Status updated', 'success');
                return true;
            } else {
                this.notify(data.message || 'Update failed', 'error');
            }
        } catch (err) {
            this.notify('Network error updating status', 'error');
        }
        return false;
    },

    async updateProduct(productId, updates) {
        try {
            const res = await fetch(`${API}/products/${productId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (res.ok) {
                this.notify('Product updated', 'success');
                await this.fetchProducts(); // Refresh global list
                return true;
            } else {
                this.notify(data.message || 'Update failed', 'error');
            }
        } catch (err) {
            this.notify('Network error updating product', 'error');
        }
        return false;
    },

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return false;
        try {
            const res = await fetch(`${API}/products/${productId}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (res.ok) {
                this.notify('Product deleted', 'success');
                await this.fetchProducts(); // Refresh global list
                return true;
            } else {
                const data = await res.json();
                this.notify(data.message || 'Delete failed', 'error');
            }
        } catch (err) {
            this.notify('Network error deleting product', 'error');
        }
        return false;
    },

    async fetchRFQs() {
        if (!isLoggedIn()) return [];
        try {
            const res = await fetch(`${API}/rfqs`, { headers: authHeaders() });
            if (!res.ok) {
                console.warn(`Fetch RFQs failed with status: ${res.status}`);
                return [];
            }
            const data = await res.json();
            this._state.rfqs = data || [];
            this._persistNonSensitive();
            return data || [];
        } catch (err) {
            console.error('Fetch RFQs error:', err);
            return [];
        }
    },

    async fetchBusinessStats() {
        if (!isLoggedIn()) return null;
        try {
            const res = await fetch(`${API}/business/stats`, { headers: authHeaders() });
            if (res.ok) {
                const stats = await res.json();
                this._state.businessStats = stats;
                this._persistNonSensitive();
                return stats;
            }
        } catch (err) {
            console.error('Fetch business stats error:', err);
        }
        return null;
    },

    async createRFQ(rfqData) {
        try {
            const res = await fetch(`${API}/rfqs`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(rfqData)
            });
            if (!res.ok) throw new Error('Failed to create RFQ');
            const newRFQ = await res.json();
            this._state.rfqs.unshift(newRFQ);
            this.notify('RFQ created successfully', 'success');
            return newRFQ;
        } catch (err) {
            console.error('Create RFQ error:', err);
            this.notify('Failed to create RFQ', 'error');
        }
    },

    async fetchInventory() {
        try {
            const res = await fetch(`${API}/warehouse/inventory`, { headers: authHeaders() });
            if (res.ok) {
                const inventory = await res.json();
                this._state.inventory = inventory || [];
                return inventory;
            }
        } catch (err) {
            console.error('Fetch inventory error:', err);
        }
        this._state.inventory = [];
        return [];
    },

    async updateInventoryStock(productId, stock, location) {
        try {
            const res = await fetch(`${API}/warehouse/inventory/${productId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ stock, location })
            });
            if (res.ok) {
                this.notify('Inventory updated', 'success');
                await this.fetchInventory();
                return true;
            }
        } catch (err) {
            this.notify('Error updating inventory', 'error');
        }
        return false;
    },

    async updateOrderTracking(orderId, trackingData) {
        try {
            const res = await fetch(`${API}/warehouse/orders/${orderId}/tracking`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(trackingData)
            });
            if (res.ok) {
                this.notify('Order shipped and tracking updated', 'success');
                return true;
            } else {
                const data = await res.json();
                this.notify(data.message || 'Update failed', 'error');
            }
        } catch (err) {
            this.notify('Network error updating tracking', 'error');
        }
        return false;
    },

    // ===========================================================
    // NOTIFICATION SYSTEM
    // ===========================================================

    notify(message, type = 'info') {
        const notification = { id: Date.now(), message, type, timestamp: new Date() };
        this._state.notifications.push(notification);
        if (window.Components?.showNotification) {
            window.Components.showNotification(message, type);
        } else if (window.showNotification) {
            window.showNotification(message, type);
        }
        setTimeout(() => {
            this._state.notifications = this._state.notifications.filter(n => n.id !== notification.id);
        }, 5000);
    },

    // ===========================================================
    // USER SESSION
    // ===========================================================

    setUser(role, userData = {}) {
        this._state.userRole = role;
        this._state.currentUser = userData;
        this._persistNonSensitive();
    },
    getUser() { return this._state.currentUser; },
    getUserRole() { return this._state.userRole; },

    // Clear all state on logout
    clear() {
        this._state = {
            currentUser: null,
            userRole: 'consumer',
            cart: [],
            wishlist: [],
            currentPage: 'home',
            filters: {},
            searchQuery: '',
            notifications: [],
            products: [],
            orders: [],
            inventory: [],
            supplierStats: null,
            supplierOrders: [],
            supplierProducts: [],
            rfqs: [],
            inventory: []
        };
        localStorage.removeItem('xperince_state');
    },

    // =// ===========================================================
    // FINANCE METHODS
    // ===========================================================

    async fetchSupplierWallet() {
        try {
            const res = await fetch(`${API}/supplier/finance/wallet`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                this._state.supplierWallet = data;
                this._persistNonSensitive();
                return data;
            }
        } catch (err) {
            console.error('Fetch supplier wallet error:', err);
        }
        return null;
    },

    async requestPayout(payoutData) {
        try {
            const res = await fetch(`${API}/supplier/finance/payout`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payoutData)
            });
            const data = await res.json();
            if (res.ok) {
                this.notify(data.message || 'Payout requested', 'success');
                await this.fetchSupplierWallet(); // Refresh balance
                return true;
            } else {
                this.notify(data.message || 'Payout failed', 'error');
            }
        } catch (err) {
            this.notify('Network error requesting payout', 'error');
        }
        return false;
    },

    async fetchAdminLogs() {
        try {
            const res = await fetch(`${API}/admin/logs`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                this._state.adminLogs = data.live || [];
                this._state.adminLogArchives = data.archives || [];
                this._persistNonSensitive();
                return data;
            }
        } catch (err) {
            console.error('Fetch admin logs error:', err);
        }
        return { live: [], archives: [] };
    },

    async fetchAdminLogArchive(key) {
        try {
            const res = await fetch(`${API}/admin/logs/archive?key=${encodeURIComponent(key)}`, { 
                headers: authHeaders() 
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (err) {
            console.error('Fetch admin log archive error:', err);
        }
        return null;
    },

    async fetchAdminStats() {
        try {
            const res = await fetch(`${API}/admin/stats`, { headers: authHeaders() });
            if (res.ok) {
                const stats = await res.json();
                this._state.adminStats = stats;
                this._persistNonSensitive();
                return stats;
            }
        } catch (err) {
            console.error('Fetch admin stats error:', err);
        }
        return null;
    },

    async fetchAdminUsers(filters = {}) {
        this.set({ lastAdminFilters: filters });
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`${API}/admin/users?${query}`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const users = await res.json();
                this._state.adminUsers = users;
                this._persistNonSensitive();
                return users;
            }
        } catch (err) {
            console.error('Fetch admin users error:', err);
        }
        return [];
    },

    async updateAdminUser(userId, userData) {
        try {
            const res = await fetch(`${API}/admin/users/${userId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(userData)
            });
            if (res.ok) {
                this.notify('User updated successfully', 'success');
                return true;
            }
        } catch (err) {
            this.notify('Failed to update user', 'error');
        }
        return false;
    },

    async fetchAdminOrders() {
        try {
            const res = await fetch(`${API}/admin/orders`, { headers: authHeaders() });
            if (res.ok) {
                const orders = await res.json();
                this._state.adminOrders = orders;
                this._persistNonSensitive();
                return orders;
            }
        } catch (err) {
            console.error('Fetch admin orders error:', err);
        }
        return [];
    },

    async bulkVerifyAdminUsers(userIds) {
        try {
            const res = await fetch(`${API}/admin/users/bulk-verify`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ userIds })
            });
            if (res.ok) {
                this.notify('Users verified successfully', 'success');
                return true;
            }
        } catch (err) {
            this.notify('Failed to verify users', 'error');
        }
        return false;
    },

    async broadcastAdminNotification(notificationData) {
        try {
            const res = await fetch(`${API}/admin/notifications/broadcast`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(notificationData)
            });
            if (res.ok) {
                this.notify('Broadcast sent successfully', 'success');
                return true;
            }
        } catch (err) {
            this.notify('Failed to send broadcast', 'error');
        }
        return false;
    },

    async fetchAdminAllProducts() {
        try {
            const res = await fetch(`${API}/admin/products`, { headers: authHeaders() });
            if (res.ok) {
                const products = await res.json();
                this._state.adminProducts = products;
                this._persistNonSensitive();
                return products;
            }
        } catch (err) {
            console.error('Fetch admin products error:', err);
        }
        return [];
    },

    async updateAdminProduct(productId, productData) {
        try {
            const res = await fetch(`${API}/admin/products/${productId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(productData)
            });
            if (res.ok) {
                this.notify('Product updated successfully', 'success');
                return true;
            }
        } catch (err) {
            this.notify('Failed to update product', 'error');
        }
        return false;
    },

    async deleteAdminProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return false;
        try {
            const res = await fetch(`${API}/admin/products/${productId}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (res.ok) {
                this.notify('Product deleted successfully', 'success');
                return true;
            }
        } catch (err) {
            this.notify('Failed to delete product', 'error');
        }
        return false;
    },

    async fetchAdminSettings() {
        try {
            const res = await fetch(`${API}/admin/settings`, { headers: authHeaders() });
            if (res.ok) {
                const settings = await res.json();
                this._state.adminSettings = settings;
                this._persistNonSensitive();
                return settings;
            }
        } catch (err) {
            console.error('Fetch admin settings error:', err);
        }
        return null;
    },

    async updateAdminSettings(settingsData) {
        try {
            const res = await fetch(`${API}/admin/settings`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(settingsData)
            });
            if (res.ok) {
                const settings = await res.json();
                this._state.adminSettings = settings;
                this.notify('Settings updated successfully', 'success');
                return settings;
            }
        } catch (err) {
            this.notify('Failed to update settings', 'error');
        }
        return null;
    },

    async fetchWarehouseStats() {
        try {
            const res = await fetch(`${API}/warehouse/stats`, { headers: authHeaders() });
            if (res.ok) {
                const stats = await res.json();
                this._state.warehouseStats = stats;
                this._persistNonSensitive();
                return stats;
            }
        } catch (err) {
            console.error('Fetch warehouse stats error:', err);
        }
        return null;
    },
    // --- Store Management ---
    async fetchStoreData() {
        try {
            const res = await fetch(`${API}/store`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch store data');
            const data = await res.json();
            this._state.dropshipperStore = data.store;
            this._state.dropshipperProducts = data.products;
            this._persistNonSensitive();
            return data;
        } catch (err) {
            console.error('Fetch store error:', err);
        }
    },

    async fetchDropshipperOrders() {
        try {
            // Updated to use the shared supplier/business endpoint
            const res = await fetch(`${API}/supplier/orders`, { headers: authHeaders() });
            if (res.ok) {
                const text = await res.text();
                try {
                    const orders = JSON.parse(text);
                    this._state.dropshipperOrders = Array.isArray(orders) ? orders : [];
                    this._persistNonSensitive();
                    return this._state.dropshipperOrders;
                } catch (e) {
                    console.error('Failed to parse dropshipper orders JSON:', text.substring(0, 100));
                }
            } else {
                console.error(`Fetch dropshipper orders failed with status: ${res.status}`);
            }
        } catch (err) {
            console.error('Fetch dropshipper orders error:', err);
        }
        return [];
    },

    async fetchDropshipperStats() {
        try {
            // Updated to use the shared supplier/business endpoint
            const res = await fetch(`${API}/supplier/stats`, { headers: authHeaders() });
            if (res.ok) {
                const text = await res.text();
                try {
                    const stats = JSON.parse(text);
                    this._state.dropshipperStats = stats;
                    this._persistNonSensitive();
                    return stats;
                } catch (e) {
                    console.error('Failed to parse dropshipper stats JSON:', text.substring(0, 100));
                }
            }
        } catch (err) {
            console.error('Fetch dropshipper stats error:', err);
        }
        return null;
    },

    async addToStore(productId, customPrice = null) {
        try {
            const res = await fetch(`${API}/store/products`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ productId, customPrice })
            });
            if (!res.ok) throw new Error('Failed to add to store');
            this.notify('Product added to your store', 'success');
            await this.fetchDropshipperStore(); // Refresh store data
            return await res.json();
        } catch (err) {
            console.error('Add to store error:', err);
            this.notify('Failed to add product to store', 'error');
        }
    },

    async updateStoreSettings(settings) {
        try {
            const res = await fetch(`${API}/store/settings`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(settings)
            });
            if (!res.ok) throw new Error('Failed to update store settings');
            const updated = await res.json();
            this._state.dropshipperStore = updated;
            this.notify('Store settings updated', 'success');
            return updated;
        } catch (err) {
            console.error('Update store settings error:', err);
            this.notify('Failed to update settings', 'error');
        }
    },

    // --- Warehouse Management ---
    async updateOrderTracking(orderId, data) {
        try {
            const res = await fetch(`${API}/warehouse/orders/${orderId}/tracking`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                this.notify(result.message || 'Tracking updated successfully', 'success');
                await this.fetchOrders();
                return true;
            } else {
                this.notify(result.message || 'Failed to update tracking', 'error');
                return false;
            }
        } catch (err) {
            console.error('Update tracking error:', err);
            this.notify('Network error updating tracking', 'error');
            return false;
        }
    },

    printReceivingSlip(orderId) {
        if (!orderId) return;
        const session = localStorage.getItem('xperince_session');
        const token = session ? JSON.parse(session).token : '';
        const url = `${API}/warehouse/orders/${orderId}/slip?token=${token}`;
        window.open(url, '_blank', 'width=800,height=900');
    },

    // --- Financial Management ---
    async fetchDropshipperWallet() {
        try {
            const res = await fetch(`${API}/finance/wallet`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                this._state.dropshipperWallet = data;
                this._persistNonSensitive();
                return data;
            }
        } catch (err) {
            console.error('Fetch wallet error:', err);
        }
        return null;
    },

    async fetchBanks() {
        try {
            const res = await fetch(`${API}/finance/banks`, { headers: authHeaders() });
            if (res.ok) return await res.json();
        } catch (err) {
            console.error('Fetch banks error:', err);
        }
        return [];
    },

    async resolveBankAccount(accountNumber, bankCode) {
        try {
            const res = await fetch(`${API}/finance/resolve-account?accountNumber=${accountNumber}&bankCode=${bankCode}`, {
                headers: authHeaders()
            });
            if (res.ok) return await res.json();
        } catch (err) {
            console.error('Resolve bank account error:', err);
        }
        return null;
    },

    async saveBankAccount(bankData) {
        try {
            const res = await fetch(`${API}/finance/bank-account`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(bankData)
            });
            if (res.ok) {
                this.notify('Bank account saved successfully', 'success');
                return await res.json();
            }
        } catch (err) {
            this.notify('Failed to save bank account', 'error');
        }
        return null;
    },

    async fetchBankAccounts() {
        try {
            const res = await fetch(`${API}/finance/bank-accounts`, { headers: authHeaders() });
            if (res.ok) return await res.json();
        } catch (err) {
            console.error('Fetch bank accounts error:', err);
        }
        return [];
    },

    async requestPayout(payoutData) {
        try {
            const res = await fetch(`${API}/finance/payouts/request`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payoutData)
            });
            if (res.ok) {
                this.notify('Payout request submitted successfully', 'success');
                await this.fetchDropshipperWallet(); // Refresh balance
                return await res.json();
            } else {
                const error = await res.json();
                this.notify(error.message || 'Failed to submit payout request', 'error');
            }
        } catch (err) {
            this.notify('Network error requesting payout', 'error');
        }
        return null;
    },

    async fetchPayoutHistory() {
        try {
            const res = await fetch(`${API}/finance/payouts`, { headers: authHeaders() });
            if (res.ok) return await res.json();
        } catch (err) {
            console.error('Fetch payout history error:', err);
        }
        return [];
    },

    // --- Marketing & Coupon Management ---
    async fetchMarketingData() {
        try {
            const res = await fetch(`${API}/admin/marketing/analytics`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                this._state.marketingStats = data;
                this._state.campaigns = data.campaigns || [];
                this._persistNonSensitive();
                return data;
            }
        } catch (err) {
            console.error('Fetch marketing stats error:', err);
        }
        return null;
    },

    async fetchCoupons() {
        try {
            const res = await fetch(`${API}/admin/coupons`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                this._state.coupons = data;
                this._persistNonSensitive();
                return data;
            }
        } catch (err) {
            console.error('Fetch coupons error:', err);
        }
        return [];
    },

    async toggleCouponStatus(id) {
        try {
            const res = await fetch(`${API}/admin/coupons/${id}/toggle`, {
                method: 'PATCH',
                headers: authHeaders()
            });
            if (res.ok) {
                this.notify('Coupon status updated', 'success');
                await this.fetchCoupons();
                return true;
            }
        } catch (err) {
            this.notify('Failed to update coupon', 'error');
        }
        return false;
    },

    async deleteCoupon(id) {
        try {
            const res = await fetch(`${API}/admin/coupons/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (res.ok) {
                this.notify('Coupon deleted', 'success');
                await this.fetchCoupons();
                return true;
            }
        } catch (err) {
            this.notify('Failed to delete coupon', 'error');
        }
        return false;
    },

    // --- Supplier Product Management ---
    async createSupplierProduct(productData) {
        try {
            const formData = new FormData();
            Object.keys(productData).forEach(key => {
                if (key === 'images' && productData.images instanceof FileList) {
                    Array.from(productData.images).forEach(file => formData.append('images', file));
                } else {
                    formData.append(key, productData[key]);
                }
            });

            const res = await fetch(`${API}/products`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` },
                body: formData
            });

            if (res.ok) {
                this.notify('Product created successfully', 'success');
                await this.fetchSupplierProducts(); // Use supplier specific fetch
                if (window.Router) window.Router.handleRoute(); // Force re-render with skeleton
                return true;
            } else {
                const err = await res.json();
                this.notify(err.message || 'Failed to create product', 'error');
            }
        } catch (err) {
            console.error('Create product error:', err);
            this.notify('Network error creating product', 'error');
        }
        return false;
    },

    async updateSupplierProduct(id, productData) {
        try {
            const formData = new FormData();
            Object.keys(productData).forEach(key => {
                if (key === 'images' && productData.images instanceof FileList) {
                    Array.from(productData.images).forEach(file => formData.append('images', file));
                } else if (productData[key] !== undefined) {
                    formData.append(key, productData[key]);
                }
            });

            const res = await fetch(`${API}/products/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` },
                body: formData
            });

            if (res.ok) {
                this.notify('Product updated successfully', 'success');
                await this.fetchSupplierProducts();
                if (window.Router) window.Router.handleRoute();
                return true;
            } else {
                const err = await res.json();
                this.notify(err.message || 'Failed to update product', 'error');
            }
        } catch (err) {
            console.error('Update product error:', err);
            this.notify('Network error updating product', 'error');
        }
        return false;
    },

    async deleteSupplierProduct(id) {
        try {
            const res = await fetch(`${API}/products/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });

            if (res.ok) {
                this.notify('Product deleted successfully', 'success');
                await this.fetchSupplierProducts();
                if (window.Router) window.Router.handleRoute();
                return true;
            } else {
                const err = await res.json();
                this.notify(err.message || 'Failed to delete product', 'error');
            }
        } catch (err) {
            console.error('Delete product error:', err);
            this.notify('Network error deleting product', 'error');
        }
        return false;
    }
};

const notify = (msg, type) => {
    if (window.Components && window.Components.showNotification) {
        window.Components.showNotification(msg, type);
    } else {
        alert(msg);
    }
};
