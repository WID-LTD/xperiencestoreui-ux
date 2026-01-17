/**
 * components.js - Reusable UI Components
 * Library of reusable components for consistent UI
 */

import { State } from './state.js';
import { Router } from './router.js';

export const Components = {
    // Product Card Component
    ProductCard(product, options = {}) {
        const { showAddToCart = true, showQuickView = true, layout = 'grid' } = options;
        const state = State.get();
        const price = state.userRole === 'business' ? product.bulkPrice : product.price;
        const isInWishlist = State.isInWishlist(product.id);

        return `
            <div class="glass-card rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all cursor-pointer product-card" data-product-id="${product.id}">
                <div class="relative group">
                    <img src="${product.image}" alt="${product.name}" class="h-48 w-full object-cover" loading="lazy">
                    <div class="absolute top-3 right-3 flex gap-2">
                        ${product.stock < 100 ? '<span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">Low Stock</span>' : ''}
                        ${state.userRole === 'business' && product.moq ? `<span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">MOQ: ${product.moq}</span>` : ''}
                    </div>
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        ${showQuickView ? `<button onclick="Router.navigate('/product/${product.id}')" class="bg-white text-slate-800 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all"><i data-lucide="eye" class="w-4 h-4 inline mr-1"></i> Quick View</button>` : ''}
                    </div>
                </div>
                <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex-1">
                            <p class="text-xs text-slate-400 uppercase font-bold">${product.category}</p>
                            <h4 class="font-bold text-sm mt-1 line-clamp-2">${product.name}</h4>
                        </div>
                        <button onclick="event.stopPropagation(); Components.toggleWishlist(${product.id})" class="ml-2 p-2 hover:bg-slate-100 rounded-lg transition-all">
                            <i data-lucide="heart" class="w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-400'}"></i>
                        </button>
                    </div>
                    <div class="flex items-center gap-2 mb-3">
                        <div class="flex text-orange-400">
                            ${this.StarRating(product.rating)}
                        </div>
                        <span class="text-xs text-slate-400">(${product.reviews})</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <div>
                            ${state.userRole === 'business' ? `
                                <p class="text-xs text-slate-400 line-through">$${product.price.toFixed(2)}</p>
                                <p class="text-xl font-bold text-blue-600">$${price.toFixed(2)}</p>
                            ` : `
                                <p class="text-xl font-bold text-slate-800">$${price.toFixed(2)}</p>
                            `}
                        </div>
                        ${showAddToCart ? `
                            <button onclick="event.stopPropagation(); Components.addToCartAction(${product.id})" class="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all">
                                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // Star Rating Component
    StarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i data-lucide="star" class="w-4 h-4 fill-current"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i data-lucide="star-half" class="w-4 h-4 fill-current"></i>';
            } else {
                stars += '<i data-lucide="star" class="w-4 h-4"></i>';
            }
        }
        return stars;
    },

    // Order Card Component
    OrderCard(order) {
        const statusColors = {
            delivered: 'bg-green-100 text-green-600',
            shipped: 'bg-blue-100 text-blue-600',
            processing: 'bg-orange-100 text-orange-600',
            cancelled: 'bg-red-100 text-red-600'
        };

        return `
            <div class="glass-card p-6 rounded-2xl flex items-center justify-between hover:shadow-lg transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                        <i data-lucide="package" class="text-blue-500 w-8 h-8"></i>
                    </div>
                    <div>
                        <p class="text-xs text-slate-400 font-bold uppercase">Order #${order.id}</p>
                        <h4 class="font-bold">${order.items} item${order.items > 1 ? 's' : ''}</h4>
                        <p class="text-xs text-slate-500">${new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="badge-blue ${statusColors[order.status]} px-3 py-1 rounded-full text-xs font-bold capitalize">${order.status}</span>
                    <p class="mt-2 font-bold text-lg">$${order.total.toFixed(2)}</p>
                    <button onclick="Router.navigate('/order/${order.id}')" class="text-blue-600 text-xs mt-1 hover:underline">View Details</button>
                </div>
            </div>
        `;
    },

    // Supplier Card Component
    SupplierCard(supplier) {
        return `
            <div class="glass-card p-6 rounded-2xl hover:shadow-xl transition-all cursor-pointer" onclick="Router.navigate('/supplier/${supplier.id}')">
                <div class="flex items-start gap-4">
                    <img src="${supplier.logo}" alt="${supplier.name}" class="w-16 h-16 rounded-lg">
                    <div class="flex-1">
                        <div class="flex items-start justify-between">
                            <div>
                                <h4 class="font-bold text-lg">${supplier.name}</h4>
                                <p class="text-xs text-slate-500"><i data-lucide="map-pin" class="w-3 h-3 inline"></i> ${supplier.location}</p>
                            </div>
                            ${supplier.verified ? '<i data-lucide="badge-check" class="w-5 h-5 text-blue-600"></i>' : ''}
                        </div>
                        <div class="flex items-center gap-2 mt-2">
                            <div class="flex text-orange-400">
                                ${this.StarRating(supplier.rating)}
                            </div>
                            <span class="text-xs text-slate-400">(${supplier.reviews} reviews)</span>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-3">
                            ${supplier.categories.map(cat => `<span class="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">${cat}</span>`).join('')}
                        </div>
                        <div class="grid grid-cols-2 gap-4 mt-4 text-xs">
                            <div>
                                <p class="text-slate-400">Response Time</p>
                                <p class="font-bold">${supplier.responseTime}</p>
                            </div>
                            <div>
                                <p class="text-slate-400">Min Order</p>
                                <p class="font-bold">${supplier.minOrder}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Modal Component
    Modal(id, title, content, options = {}) {
        const { size = 'md', showClose = true, footer = '' } = options;
        const sizeClasses = {
            sm: 'max-w-md',
            md: 'max-w-2xl',
            lg: 'max-w-4xl',
            xl: 'max-w-6xl'
        };

        return `
            <div id="${id}" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
                <div class="glass-card rounded-3xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden flex flex-col">
                    <div class="flex items-center justify-between p-6 border-b border-slate-200">
                        <h3 class="text-2xl font-bold">${title}</h3>
                        ${showClose ? `<button onclick="Components.closeModal('${id}')" class="p-2 hover:bg-slate-100 rounded-lg transition-all"><i data-lucide="x" class="w-5 h-5"></i></button>` : ''}
                    </div>
                    <div class="flex-1 overflow-y-auto p-6">
                        ${content}
                    </div>
                    ${footer ? `<div class="p-6 border-t border-slate-200">${footer}</div>` : ''}
                </div>
            </div>
        `;
    },

    // Notification Toast
    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-orange-500',
            info: 'bg-blue-500'
        };

        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-circle',
            info: 'info'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-6 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-[3000] flex items-center gap-3 animate-slide-in`;
        notification.innerHTML = `
            <i data-lucide="${icons[type]}" class="w-5 h-5"></i>
            <span class="font-medium">${message}</span>
        `;

        document.body.appendChild(notification);
        lucide.createIcons();

        setTimeout(() => {
            notification.style.animation = 'slide-out 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Breadcrumbs Component
    Breadcrumbs(items) {
        return `
            <nav class="flex items-center gap-2 text-sm text-slate-500 mb-6">
                ${items.map((item, index) => `
                    ${index > 0 ? '<i data-lucide="chevron-right" class="w-4 h-4"></i>' : ''}
                    ${item.link ? `<a href="#${item.link}" class="hover:text-blue-600 transition-colors">${item.label}</a>` : `<span class="text-slate-800 font-medium">${item.label}</span>`}
                `).join('')}
            </nav>
        `;
    },

    // Pagination Component
    Pagination(currentPage, totalPages, onPageChange) {
        const pages = [];
        const maxVisible = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return `
            <div class="flex items-center justify-center gap-2 mt-8">
                <button onclick="${onPageChange}(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <i data-lucide="chevron-left" class="w-5 h-5"></i>
                </button>
                ${startPage > 1 ? `
                    <button onclick="${onPageChange}(1)" class="px-4 py-2 rounded-lg hover:bg-slate-100 transition-all">1</button>
                    ${startPage > 2 ? '<span class="px-2">...</span>' : ''}
                ` : ''}
                ${pages.map(page => `
                    <button onclick="${onPageChange}(${page})" class="px-4 py-2 rounded-lg ${page === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'} transition-all">${page}</button>
                `).join('')}
                ${endPage < totalPages ? `
                    ${endPage < totalPages - 1 ? '<span class="px-2">...</span>' : ''}
                    <button onclick="${onPageChange}(${totalPages})" class="px-4 py-2 rounded-lg hover:bg-slate-100 transition-all">${totalPages}</button>
                ` : ''}
                <button onclick="${onPageChange}(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <i data-lucide="chevron-right" class="w-5 h-5"></i>
                </button>
            </div>
        `;
    },

    // Empty State Component
    EmptyState(icon, title, message, action = null) {
        return `
            <div class="flex flex-col items-center justify-center py-16 text-center">
                <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <i data-lucide="${icon}" class="w-12 h-12 text-slate-400"></i>
                </div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">${title}</h3>
                <p class="text-slate-500 mb-6 max-w-md">${message}</p>
                ${action ? action : ''}
            </div>
        `;
    },

    // Loading Spinner
    LoadingSpinner(size = 'md') {
        const sizes = {
            sm: 'w-6 h-6',
            md: 'w-12 h-12',
            lg: 'w-16 h-16'
        };

        return `
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full ${sizes[size]} border-b-2 border-blue-600"></div>
            </div>
        `;
    },

    // Stat Card Component
    StatCard(label, value, icon, color = 'blue', trend = null) {
        return `
            <div class="glass-card p-6 rounded-2xl">
                <div class="flex items-center justify-between mb-4">
                    <p class="text-slate-500 text-sm font-medium">${label}</p>
                    <div class="w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center">
                        <i data-lucide="${icon}" class="w-5 h-5 text-${color}-600"></i>
                    </div>
                </div>
                <h3 class="text-3xl font-bold text-slate-800 mb-2">${value}</h3>
                ${trend ? `
                    <div class="flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}">
                        <i data-lucide="${trend > 0 ? 'trending-up' : 'trending-down'}" class="w-4 h-4"></i>
                        <span>${Math.abs(trend)}% ${trend > 0 ? 'increase' : 'decrease'}</span>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // Helper methods
    openModal(id) {
        document.getElementById(id)?.classList.remove('hidden');
    },

    closeModal(id) {
        document.getElementById(id)?.classList.add('hidden');
    },

    toggleWishlist(productId) {
        const product = window.currentProducts?.find(p => p.id === productId);
        if (product) {
            if (State.isInWishlist(productId)) {
                State.removeFromWishlist(productId);
            } else {
                State.addToWishlist(product);
            }
            // Trigger re-render
            if (window.currentRenderFunction) {
                window.currentRenderFunction();
            }
        }
    },

    addToCartAction(productId) {
        const product = window.currentProducts?.find(p => p.id === productId);
        if (product) {
            State.addToCart(product, 1);
            // Update cart badge
            this.updateCartBadge();
        }
    },

    updateCartBadge() {
        const badge = document.querySelector('.shopping-cart-badge');
        if (badge) {
            badge.textContent = State.getCartCount();
        }
    }
};

// Make components globally available
window.Components = Components;
window.showNotification = Components.showNotification.bind(Components);
