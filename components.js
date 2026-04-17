/**
 * components.js - Reusable UI Components
 * Library of reusable components for consistent UI
 */

import { State } from './state.js?v=3.1.4';
import { Router } from './router.js?v=3.1.4';

export const Components = {
    // Search Suggestions Component (Glassmorphism)
    SearchSuggestions(results, query) {
        if (!results || results.length === 0) {
            return `
                <div class="glass-card bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-2xl">
                    <p class="text-sm text-slate-500 italic">No matches found for "${query}"</p>
                </div>
            `;
        }

        return `
            <div class="glass-card bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div class="p-3 border-b border-slate-100 flex justify-between items-center">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Results</span>
                    <span class="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">${results.length} found</span>
                </div>
                <div class="max-h-[400px] overflow-y-auto">
                    ${results.map(item => `
                        <div onclick="window.handleSuggestionClick('${item.type}', '${item.id || item.slug}')" class="p-3 hover:bg-blue-50/80 cursor-pointer flex items-center gap-4 group transition-all">
                            <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                <img src="${item.image || 'assets/placeholder.png'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform" onerror="this.src='https://ui-avatars.com/api/?name=${item.name}&background=random'">
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="text-sm font-bold text-slate-800 truncate">${item.name.replace(new RegExp(query, 'gi'), match => `<span class="text-blue-600 underline">${match}</span>`)}</h4>
                                <p class="text-[10px] text-slate-400 flex items-center gap-1">
                                    <span class="font-bold text-slate-500">${item.type.toUpperCase()}</span> 
                                    ${item.category ? `• ${item.category}` : ''}
                                </p>
                            </div>
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                                <i data-lucide="arrow-up-left" class="w-4 h-4 text-blue-500 rotate-45"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="p-2 bg-slate-50/50 text-center">
                    <button onclick="Router.navigate('/search?q=${encodeURIComponent(query)}')" class="text-xs font-bold text-blue-600 hover:text-blue-700">View all results <i data-lucide="chevron-right" class="w-3 h-3 inline"></i></button>
                </div>
            </div>
        `;
    },

    // Dual Handle Range Slider (Price Filter)
    DualHandleSlider(minId, maxId, initialMin, initialMax) {
        return `
            <div class="price-slider-container px-2 py-4">
                <div class="relative h-1 bg-slate-100 rounded-full mb-6">
                    <div id="slider-track" class="absolute h-full bg-blue-500 rounded-full" style="left: 0%; right: 0%;"></div>
                    <input type="range" id="${minId}" min="0" max="1000000" value="${initialMin}" step="100" class="absolute w-full h-1 bg-transparent pointer-events-none appearance-none cursor-pointer slider-thumb-min">
                    <input type="range" id="${maxId}" min="0" max="1000000" value="${initialMax}" step="100" class="absolute w-full h-1 bg-transparent pointer-events-none appearance-none cursor-pointer slider-thumb-max">
                </div>
                <div class="flex justify-between items-center gap-2">
                    <div class="flex-1">
                        <label class="text-[10px] font-black text-slate-400 uppercase block mb-1">Min (₦)</label>
                        <input type="number" id="${minId}-val" value="${initialMin}" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-blue-500">
                    </div>
                    <span class="text-slate-300 mt-4">-</span>
                    <div class="flex-1">
                        <label class="text-[10px] font-black text-slate-400 uppercase block mb-1">Max (₦)</label>
                        <input type="number" id="${maxId}-val" value="${initialMax}" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-blue-500">
                    </div>
                </div>
            </div>
        `;
    },

    // Product Card Component
    ProductCard(product, options = {}) {
        const { showAddToCart = true, showQuickView = true, layout = 'grid' } = options;
        const state = State.get();
        const price = state.userRole === 'business' ? product.bulkPrice : product.price;
        const isInWishlist = State.isInWishlist(product.id);

        return `
            <div class="glass-card rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all cursor-pointer product-card" data-product-id="${product.id}">
                <div class="relative group">
                    <img src="${State.getMediaUrl(product.id, 0)}" onerror="console.error('Product card image failed:', this.src); this.src='https://via.placeholder.com/300?text=No+Image'" alt="${product.name}" class="h-48 w-full object-cover" loading="lazy">
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
                                <p class="text-xs text-slate-400 line-through">${State.formatCurrency(product.price)}</p>
                                <p class="text-xl font-bold text-blue-600">${State.formatCurrency(price)}</p>
                            ` : `
                                <p class="text-xl font-bold text-slate-800">${State.formatCurrency(price)}</p>
                            `}
                        </div>
                        ${showAddToCart ? `
                            <div class="flex gap-2">
                                <button onclick="event.stopPropagation(); Components.addToCartAction(${product.id})" class="bg-blue-600/10 text-blue-600 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all" title="Add to Cart">
                                    <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                                </button>
                                <button onclick="event.stopPropagation(); Components.buyNowAction(${product.id})" class="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all">
                                    Buy Now
                                </button>
                                ${state.userRole === 'dropshipper' ? `
                                    <button onclick="event.stopPropagation(); State.addToStore(${product.id})" class="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-all" title="Add to Store">
                                        <i data-lucide="plus" class="w-4 h-4"></i>
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // Skeleton Product Card Component
    SkeletonProductCard() {
        return `
            <div class="glass-card rounded-2xl overflow-hidden bg-white product-card animate-pulse">
                <div class="h-48 w-full bg-slate-200"></div>
                <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex-1 space-y-2">
                            <div class="h-3 w-1/3 bg-slate-200 rounded"></div>
                            <div class="h-4 w-3/4 bg-slate-200 rounded"></div>
                        </div>
                        <div class="w-8 h-8 bg-slate-200 rounded-lg"></div>
                    </div>
                    <div class="flex items-center gap-2 mb-3">
                        <div class="flex gap-1">
                            ${Array(5).fill('<div class="w-4 h-4 bg-slate-200 rounded-full"></div>').join('')}
                        </div>
                        <div class="h-3 w-8 bg-slate-200 rounded"></div>
                    </div>
                    <div class="flex justify-between items-center">
                        <div class="h-6 w-20 bg-slate-200 rounded"></div>
                        <div class="w-10 h-10 bg-slate-200 rounded-lg"></div>
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
            cancelled: 'bg-red-100 text-red-600',
            pending: 'bg-amber-100 text-amber-600',
            completed: 'bg-green-100 text-green-600'
        };

        const orderId = order.id || order.reference;
        const total = Number(order.total_amount || order.total || 0);
        const date = order.created_at || order.date || new Date();
        const itemCount = order.item_count || (Array.isArray(order.items) ? order.items.length : (parseInt(order.items) || 0));

        return `
            <div class="glass-card p-4 sm:p-6 rounded-2xl border border-slate-50 hover:shadow-lg transition-all">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                            <i data-lucide="package" class="text-blue-500 w-6 h-6 sm:w-8 sm:h-8"></i>
                        </div>
                        <div>
                            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Order #${orderId}</p>
                            <h4 class="font-black text-slate-800">${itemCount} item${itemCount !== 1 ? 's' : ''}</h4>
                            <p class="text-xs text-slate-500 font-bold">${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <div class="flex sm:flex-col sm:text-right flex-row items-center sm:items-end justify-between sm:justify-start gap-2">
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}">${order.status}</span>
                        <p class="font-black text-base sm:text-lg text-slate-900">${State.formatCurrency(total)}</p>
                        <div class="flex gap-2 justify-end">
                            <button onclick="Router.navigate('/account/order/${orderId}')" class="text-blue-600 text-xs hover:underline font-black">Details</button>
                            ${(order.status === 'shipped' || order.status === 'delivered') ? `
                                <span class="text-slate-300">|</span>
                                <button onclick="Router.navigate('/track/${order.tracking_number || orderId}')" class="text-orange-600 text-xs hover:underline font-black flex items-center gap-1">
                                    <i data-lucide="truck" class="w-4 h-4"></i> Track
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Skeleton Order Card
    SkeletonOrderCard() {
        return `
            <div class="glass-card p-6 rounded-2xl flex items-center justify-between animate-pulse border border-slate-50">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                    <div class="space-y-2">
                        <div class="h-2 w-24 bg-slate-100 rounded"></div>
                        <div class="h-4 w-32 bg-slate-100 rounded"></div>
                        <div class="h-3 w-48 bg-slate-100 rounded"></div>
                    </div>
                </div>
                <div class="text-right space-y-2">
                    <div class="h-5 w-20 bg-slate-100 rounded-full ml-auto"></div>
                    <div class="h-6 w-24 bg-slate-100 rounded ml-auto"></div>
                    <div class="h-3 w-16 bg-slate-100 rounded ml-auto"></div>
                </div>
            </div>
        `;
    },

    // Skeleton Cart Item
    SkeletonCartItem() {
        return `
            <div class="p-6 bg-white border border-slate-50 rounded-2xl flex items-center gap-6 animate-pulse">
                <div class="w-24 h-24 bg-slate-100 rounded-xl"></div>
                <div class="flex-1 space-y-3">
                    <div class="h-4 w-1/2 bg-slate-100 rounded"></div>
                    <div class="h-3 w-1/4 bg-slate-100 rounded"></div>
                    <div class="flex justify-between items-center pt-2">
                        <div class="h-10 w-32 bg-slate-100 rounded-lg"></div>
                        <div class="h-4 w-20 bg-slate-100 rounded"></div>
                    </div>
                </div>
                <div class="text-right space-y-2">
                    <div class="h-6 w-24 bg-slate-100 rounded"></div>
                    <div class="h-3 w-16 bg-slate-100 rounded ml-auto"></div>
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
                            ${(supplier.categories || []).map(cat => `<span class="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">${cat}</span>`).join('')}
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

    // --- Loading Components ---

    FullPageLoader(message = 'Loading Xperiencestore...') {
        return `
            <div id="full-page-loader" class="fixed inset-0 bg-slate-50/90 backdrop-blur-sm z-[5000] flex flex-col items-center justify-center transition-opacity duration-500">
                <div class="relative w-32 h-32 mb-8 animate-pulse-glow rounded-full flex items-center justify-center bg-white shadow-xl border border-slate-100">
                    <img src="assets/logo.png" alt="Xperiencestore Logo" class="w-16 h-16 object-contain glass-shine-effect">
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">${message}</h2>
                <div class="mt-6 flex gap-2">
                    <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
            </div>
        `;
    },

    PageSkeleton() {
        return `
            <div id="page-skeleton" class="w-full min-h-screen bg-slate-50 p-6 space-y-8 animate-pulse">
                <!-- Header Skeleton -->
                <div class="flex items-center justify-between mb-12">
                    <div class="w-48 h-10 bg-slate-200 rounded-xl"></div>
                    <div class="flex gap-4">
                        <div class="w-10 h-10 bg-slate-200 rounded-full"></div>
                        <div class="w-10 h-10 bg-slate-200 rounded-full"></div>
                    </div>
                </div>

                <!-- Central Logo Focal Point -->
                <div class="flex flex-col items-center justify-center py-20">
                    <div class="relative w-48 h-48 mb-6 opacity-40 grayscale-0 shadow-2xl rounded-full bg-white flex items-center justify-center p-8">
                        <img src="assets/logo.png" alt="Logo Placeholder" class="w-full h-full object-contain animate-pulse">
                    </div>
                    <div class="w-64 h-4 bg-slate-200 rounded-full"></div>
                </div>

                <!-- Content Grid Skeleton -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="h-48 bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                        <div class="w-1/2 h-4 bg-slate-100 rounded"></div>
                        <div class="w-full h-20 bg-slate-50 rounded-2xl"></div>
                    </div>
                    <div class="h-48 bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                        <div class="w-1/2 h-4 bg-slate-100 rounded"></div>
                        <div class="w-full h-20 bg-slate-50 rounded-2xl"></div>
                    </div>
                    <div class="h-48 bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                        <div class="w-1/2 h-4 bg-slate-100 rounded"></div>
                        <div class="w-full h-20 bg-slate-50 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        `;
    },

    removeLoader() {
        const loader = document.getElementById('full-page-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    },

    SkeletonCard() {
        return `
            <div class="glass-card rounded-2xl overflow-hidden glass-shine-effect border border-slate-100/50">
                <div class="h-48 w-full animate-shimmer"></div>
                <div class="p-4 space-y-3">
                    <div class="h-4 bg-slate-200 rounded w-3/4 animate-shimmer"></div>
                    <div class="h-4 bg-slate-200 rounded w-1/2 animate-shimmer"></div>
                    <div class="h-8 mt-4 bg-slate-200 rounded-lg w-full animate-shimmer"></div>
                </div>
            </div>
        `;
    },

    SkeletonImage(classes = 'w-full h-full') {
        return `
            <div class="animate-shimmer rounded-xl ${classes} bg-slate-200 glass-shine-effect"></div>
        `;
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

    async addToCartAction(productId) {
        const qtyInput = document.getElementById('product-qty-input');
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        const product = (window.currentProducts || []).find(p => p.id === productId);
        if (product) {
            await State.addToCart(product, qty);
            this.updateCartBadge();
            // showNotification is already handled inside State.addToCart logic or below
        }
    },

    async buyNowAction(productId) {
        const qtyInput = document.getElementById('product-qty-input');
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        
        // Robust product lookup: current page context -> all state products
        let product = (window.currentProducts || []).find(p => p.id === productId);
        if (!product) {
            product = (State.get().products || []).find(p => p.id === productId);
        }
        
        if (product) {
            await State.addToCart(product, qty);
            // After adding to cart, update badge and redirect
            if (State.get().cartPageOpen) {
                 // If already on cart page, just update the UI (rare case for buy now)
                 window.updateCartUI?.();
            }
            Router.navigate('/checkout');
        } else {
            // Fallback: if product isn't loaded yet, we could fetch it, but usually it's in state
            console.warn(`[BuyNow] Product ${productId} not found in state.`);
            // Optionally fetch and then add
            const res = await fetch(`${window.API_BASE}/api/products/${productId}`);
            if (res.ok) {
                const p = await res.json();
                await State.addToCart(p, qty);
                Router.navigate('/checkout');
            }
        }
    },

    updateCartBadge() {
        const badge = document.querySelector('.shopping-cart-badge');
        if (badge) {
            badge.textContent = State.getCartCount();
        }
    },

    // --- Mobile Components ---

    BottomNav() {
        const rawRole = State.get().userRole || 'consumer';
        const role = rawRole.toLowerCase().replace(/\s+/g, ''); // normalize 'drop shipper' -> 'dropshipper'
        const currentPath = Router.getCurrentRoute()?.path || '/';

        const navItems = {
            consumer: [
                { icon: 'home', label: 'Home', path: '/' },
                { icon: 'grid', label: 'Category', path: '/categories' },
                { icon: 'user', label: 'Account', path: '/account' },
                { icon: 'shopping-cart', label: 'Cart', path: '/cart' },
                { icon: 'heart', label: 'Wishlist', path: '/account/wishlist' }
            ],
            dropshipper: [
                { icon: 'home', label: 'Home', path: '/' },
                { icon: 'store', label: 'My Store', path: '/dropshipper/storefront' },
                { icon: 'shopping-bag', label: 'Orders', path: '/dropshipper/storefront' },
                { icon: 'bar-chart-2', label: 'Analytics', path: '/dropshipper/analytics' },
                { icon: 'user', label: 'Account', path: '/account' }
            ],
            business: [
                { icon: 'home', label: 'Home', path: '/' },
                { icon: 'briefcase', label: 'Suppliers', path: '/business/suppliers' },
                { icon: 'file-text', label: 'RFQ', path: '/business/rfq' },
                { icon: 'shopping-bag', label: 'Quotes', path: '/business/quotes' },
                { icon: 'user', label: 'Account', path: '/account' }
            ],
            bussiness: [ // Handling typo
                { icon: 'home', label: 'Home', path: '/' },
                { icon: 'briefcase', label: 'Suppliers', path: '/business/suppliers' },
                { icon: 'file-text', label: 'RFQ', path: '/business/rfq' },
                { icon: 'shopping-bag', label: 'Quotes', path: '/business/quotes' },
                { icon: 'user', label: 'Account', path: '/account' }
            ],
            warehouse: [
                { icon: 'home', label: 'Home', path: '/' },
                { icon: 'download', label: 'Receiving', path: '/warehouse/receiving' },
                { icon: 'box', label: 'Fulfillment', path: '/warehouse/fulfillment' },
                { icon: 'clipboard-list', label: 'Inventory', path: '/warehouse/inventory' },
                { icon: 'user', label: 'Account', path: '/account' }
            ],
            supplier: [
                { icon: 'home', label: 'Home', path: '/' },
                { icon: 'package', label: 'Products', path: '/supplier/products' },
                { icon: 'shopping-bag', label: 'Orders', path: '/supplier/orders' },
                { icon: 'dollar-sign', label: 'Finance', path: '/supplier/finance' },
                { icon: 'user', label: 'Account', path: '/account' }
            ],
            admin: [
                { icon: 'home', label: 'Home', path: '/' },
                { icon: 'bar-chart-2', label: 'Analytics', path: '/admin/reports' },
                { icon: 'users', label: 'Users', path: '/admin/users' },
                { icon: 'megaphone', label: 'Marketing', path: '/admin/marketing' },
                { icon: 'settings', label: 'Settings', path: '/admin/settings' }
            ]
        };

        const activeItems = navItems[role] || navItems.consumer;

        return activeItems.map(item => `
            <a href="#${item.path}" class="mobile-nav-item ${currentPath === item.path ? 'active' : ''}">
                <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                <span>${item.label}</span>
            </a>
        `).join('');
    },

    MobileMenu() {
        const role = State.get().userRole;
        const user = State.get().user || { name: 'Welcome', email: 'v1.0.0-beta' };
        
        return `
            <div class="flex flex-col h-full">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            ${user.name.charAt(0)}
                        </div>
                        <div>
                            <p class="font-bold text-slate-800">${user.name}</p>
                            <p class="text-xs text-slate-500">${role.toUpperCase()}</p>
                        </div>
                    </div>
                    <button onclick="Components.toggleMobileMenu()" class="p-2 hover:bg-slate-100 rounded-lg">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <div class="flex-1 space-y-2 overflow-y-auto">
                    ${this.getMobileLinks(role).map(link => `
                        <a href="#${link.path}" class="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:bg-blue-50 hover:border-blue-100 transition-all group" onclick="Components.toggleMobileMenu()">
                            <i data-lucide="${link.icon}" class="w-5 h-5 text-slate-400 group-hover:text-blue-600"></i>
                            <span class="font-bold text-slate-700">${link.label}</span>
                        </a>
                    `).join('')}
                </div>

                ${State.get().currentUser ? `
                    <div class="mt-auto pt-6 border-t border-slate-100">
                        <button onclick="Auth.logout(); setTimeout(() => { window.location.hash = '#/'; window.location.reload(); }, 500);" class="w-full flex items-center gap-4 p-4 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-all">
                            <i data-lucide="log-out" class="w-5 h-5"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                ` : `
                    <div class="mt-auto pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                        <a href="#/login" onclick="Components.toggleMobileMenu()" class="flex items-center justify-center p-4 rounded-xl bg-blue-600 text-white font-bold text-sm">Login</a>
                        <a href="#/register" onclick="Components.toggleMobileMenu()" class="flex items-center justify-center p-4 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm">Join</a>
                    </div>
                `}
            </div>
        `;
    },

    getMobileLinks(role) {
        const generalLinks = [
            { label: 'Home', path: '/', icon: 'home' },
            { label: 'All Categories', path: '/categories', icon: 'grid' },
            { label: 'About Us', path: '/about', icon: 'info' },
            { label: 'Contact Us', path: '/contact', icon: 'mail' },
            { label: 'FAQ', path: '/faq', icon: 'help-circle' },
            { label: 'Privacy Policy', path: '/privacy', icon: 'shield' },
            { label: 'Terms of Service', path: '/terms', icon: 'file-text' }
        ];

        const roleSpecificLinks = {
            dropshipper: [
                { label: 'Profit Calculator', path: '/dropshipper/profit-calculator', icon: 'calculator' },
                { label: 'API Management', path: '/dropshipper/api-management', icon: 'code' }
            ],
            business: [
                { label: 'Bulk Inquiry', path: '/business/rfq/new', icon: 'plus-circle' }
            ],
            admin: [
                { label: 'System Logs', path: '/admin/logs', icon: 'terminal' },
                { label: 'Developer Console', path: '/admin/dev-console', icon: 'cpu' }
            ]
        };

        return [...generalLinks, ...(roleSpecificLinks[role] || [])];
    },

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-side-menu');
        menu.classList.toggle('active');
    },

    // Toggle password visibility helper
    togglePasswordVisibility(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            if (btn && btn.querySelector('i')) {
                btn.querySelector('i').setAttribute('data-lucide', 'eye-off');
            }
        } else {
            input.type = 'password';
            if (btn && btn.querySelector('i')) {
                btn.querySelector('i').setAttribute('data-lucide', 'eye');
            }
        }
        if (window.lucide) lucide.createIcons();
    },

    // Onboarding Guide Component
    OnboardingGuide(role) {
        const guides = {
            consumer: {
                title: "Welcome to Xperiencestore!",
                steps: [
                    "Explore 10M+ products across multiple categories.",
                    "Save items to your wishlist for later.",
                    "Fast shipping to our regional warehouses."
                ]
            },
            dropshipper: {
                title: "Your Dropshipping Empire Starts Here",
                steps: [
                    "Search products and 'Add to Store' to build your catalog.",
                    "Set your own margins and share your store link.",
                    "Withdraw your profits to your custom wallet."
                ]
            },
            business: {
                title: "Scale Your Business with RFQs",
                steps: [
                    "Request quotes for large quantities directly from suppliers.",
                    "Compare quotes and secure the best manufacturing prices.",
                    "Manage your logistics through our warehouse network."
                ]
            },
            supplier: {
                title: "Maximize Your Reach",
                steps: [
                    "Upload your product catalog and gain 24/7 exposure.",
                    "Manage and fulfill orders directly from your dashboard.",
                    "Get paid in your local currency with Klasha integration."
                ]
            },
            warehouse: {
                title: "Efficiency is Key",
                steps: [
                    "Register incoming inventory with receiving slips.",
                    "Track local orders and fulfill shipments to final users.",
                    "Monitor warehouse capacity and stock levels."
                ]
            },
            admin: {
                title: "Platform Command Center",
                steps: [
                    "Monitor platform-wide analytics and revenue.",
                    "Approve users and manage dispute resolutions.",
                    "Broadcast notifications and updates to all users."
                ]
            }
        };

        const guide = guides[role] || guides.consumer;

        return `
            <div id="onboarding-overlay" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                <div class="glass-card bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative animate-up">
                    <div class="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
                        <i data-lucide="sparkles" class="w-10 h-10"></i>
                    </div>
                    
                    <h2 class="text-2xl font-black text-center text-slate-900 mb-4">${guide.title}</h2>
                    
                    <div class="space-y-4 mb-8">
                        ${guide.steps.map((step, i) => `
                            <div class="flex gap-4">
                                <div class="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-1">${i + 1}</div>
                                <p class="text-sm text-slate-600 leading-relaxed font-medium">${step}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex flex-col gap-3">
                        <button onclick="Components.closeOnboarding()" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Get Started</button>
                        <button onclick="Components.closeOnboarding()" class="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition-all">Skip for now</button>
                    </div>

                    <p class="text-[10px] text-slate-400 text-center mt-6">This guide will appear only during your first two sessions.</p>
                </div>
            </div>
        `;
    },

    closeOnboarding() {
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) {
            overlay.classList.add('opacity-0', 'scale-95');
            setTimeout(() => overlay.remove(), 300);
        }
    },

    showOnboardingIfNew() {
        const state = State.get();
        if (!window.isLoggedIn()) return;
        
        const countKey = `xp_onboard_${state.userRole}`;
        const count = parseInt(localStorage.getItem(countKey) || '0');
        
        if (count < 2) {
            document.body.insertAdjacentHTML('beforeend', this.OnboardingGuide(state.userRole));
            localStorage.setItem(countKey, (count + 1).toString());
            if (window.lucide) lucide.createIcons();
        }
    },

    ConfirmModal(title, message, onConfirm, confirmText = 'Confirm', type = 'danger') {
        const id = `confirm-modal-${Date.now()}`;
        const accentColor = type === 'danger' ? 'red' : 'blue';
        const icon = type === 'danger' ? 'alert-triangle' : 'help-circle';

        const modalHtml = `
            <div id="${id}" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in">
                <div class="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl transform transition-all animate-up">
                    <div class="w-16 h-16 bg-${accentColor}-100 rounded-2xl flex items-center justify-center text-${accentColor}-600 mb-6 mx-auto">
                        <i data-lucide="${icon}" class="w-8 h-8"></i>
                    </div>
                    
                    <h2 class="text-xl font-bold text-center text-slate-800 mb-2">${title}</h2>
                    <p class="text-sm text-center text-slate-500 mb-8 leading-relaxed">${message}</p>
                    
                    <div class="flex flex-col gap-3">
                        <button id="${id}-confirm" class="w-full bg-${accentColor}-600 text-white py-4 rounded-xl font-bold hover:bg-${accentColor}-700 transition-all shadow-lg shadow-${accentColor}-200">${confirmText}</button>
                        <button id="${id}-cancel" class="w-full py-3 text-slate-400 text-sm font-bold hover:text-slate-600 transition-all">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) lucide.createIcons();

        const modalEl = document.getElementById(id);
        const confirmBtn = document.getElementById(`${id}-confirm`);
        const cancelBtn = document.getElementById(`${id}-cancel`);

        const close = () => {
            modalEl.classList.add('opacity-0', 'scale-95');
            setTimeout(() => modalEl.remove(), 200);
        };

        confirmBtn.onclick = () => {
            onConfirm();
            close();
        };

        cancelBtn.onclick = close;
        modalEl.onclick = (e) => { if (e.target === modalEl) close(); };
    }
};

// Make components globally available
window.Components = Components;
window.showNotification = Components.showNotification.bind(Components);
