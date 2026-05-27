/**
 * pages.js - Role Page Modules
 * Split from pages.js to enable lazy loading
 */

import { Data } from '../data.js?v=3.3.4';
import { State } from '../state.js?v=3.3.4';
import { Router } from '../router.js?v=3.3.4';
import { Components } from '../components.js?v=3.3.4';
import { Tracking } from '../tracking.js?v=3.3.4';
import { Auth } from '../auth.js?v=3.3.4';
export const consumer = {
        categories() {
            const categories = State.getCategories();
            const { fetchedProducts, loading: isLoading } = State.get();

            // Trigger product fetch if data not yet loaded
            if (!fetchedProducts && !isLoading) {
                State.fetchProducts({ limit: 50 }).then(() => Router.refresh());
            }

            return `
                <div class="px-4 sm:px-0">
                    ${Components.Breadcrumbs([
                { label: 'Home', link: '/' },
                { label: 'All Categories' }
            ])}

                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-bold text-slate-800 mb-4">Browse by Category</h1>
                        <p class="text-slate-500 max-w-2xl mx-auto">Explore our wide range of premium products across various high-end categories.</p>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        ${categories.map(cat => `
                            <div onclick="Router.navigate('/category/${cat.slug}')" class="glass-card p-8 rounded-[2rem] text-center hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
                                <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
                                    <i data-lucide="package" class="w-10 h-10 text-blue-600 group-hover:text-white transition-colors"></i>
                                </div>
                                <h3 class="text-xl font-bold text-slate-800 mb-2 capitalize">${cat.name}</h3>
                                <p class="text-sm text-slate-400 font-medium">${cat.count} Premium Products</p>
                                <div class="mt-6 flex items-center justify-center text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Explore More <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- CTA Section -->
                    <div class="mt-20 glass-card bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                        <div class="relative z-10">
                            <h2 class="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
                            <p class="text-slate-400 mb-8 max-w-lg mx-auto">Try our advanced search or contact our white-glove support team for assistance.</p>
                            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button onclick="document.querySelector('input[placeholder=\'Search platform...\']')?.focus()" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all w-full sm:w-auto">Use Search</button>
                                <button onclick="Router.navigate('/contact')" class="border-2 border-slate-700 hover:border-white text-white px-8 py-4 rounded-2xl font-bold transition-all w-full sm:w-auto">Contact Support</button>
                            </div>
                        </div>
                        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32"></div>
                        <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] -ml-32 -mb-32"></div>
                    </div>
                </div>
            `;
        },

        home() {
            const { fetchedProducts, fetchedSponsored, fetchedRecommended, loading: isLoading } = State.get();
            const products = State.getProducts().slice(0, 6); // Limit arrivals

            // Re-render when data is ready
            if (!fetchedProducts && !isLoading) {
                State.fetchProducts({ limit: 6 }).then(() => Router.refresh());
            }

            // Fetch extra data for sponsored and recommendations
            const sponsored = State.get().sponsoredProducts || [];
            const recommended = State.get().recommendedProducts || [];

            if (!fetchedSponsored && !isLoading) {
                State.fetchProducts({ sponsored: true, limit: 8 }).then(data => {
                    State.set({ sponsoredProducts: data, fetchedSponsored: true });
                    Router.refresh();
                });
            }
            if (!fetchedRecommended && !isLoading) {
                State.fetchRecommendations().then(data => {
                    // Filter to max 6 recommended
                    State.set({ recommendedProducts: data.slice(0, 6), fetchedRecommended: true });
                    Router.refresh();
                });
            }

            // Sync all products shown here for card actions
            window.currentProducts = [
                ...products,
                ...sponsored,
                ...recommended
            ];

            return `
                <div class="space-y-12 px-4 sm:px-0">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-blue-600 to-blue-400 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                        <div class="max-w-md text-center md:text-left">
                            <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">Shop Smarter, Live Better</h1>
                            <p class="mb-8 opacity-90 text-lg">Discover amazing products at unbeatable prices</p>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button onclick="Router.navigate('/products')" class="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all">Explore Products</button>
                                <button onclick="Router.navigate('/categories')" class="border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all">Browse Categories</button>
                            </div>
                        </div>
                        <div class="w-full md:w-1/2">
                            ${Components.CampaignSlider(State.get().campaigns)}
                        </div>
                    </div>

                    <!-- Sponsored Deals (Only for non-admin/warehouse) -->
                    ${State.get().userRole !== 'admin' && State.get().userRole !== 'warehouse' && sponsored.length > 0 ? `
                        <div>
                            <div class="flex items-center gap-2 mb-6">
                                <h2 class="text-2xl font-bold">Sponsored Deals</h2>
                                <span class="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Ad</span>
                            </div>
                            <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                ${sponsored.map(product => Components.ProductCard(product)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Categories -->
                    <div>
                        <h2 class="text-2xl font-bold mb-6">Shop by Category</h2>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            ${State.getCategories().slice(0, 6).map(cat => `
                                <div onclick="Router.navigate('/category/${cat.slug}')" class="glass-card p-6 rounded-2xl text-center hover:shadow-xl transition-all cursor-pointer">
                                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <i data-lucide="package" class="w-6 h-6 text-blue-600"></i>
                                    </div>
                                    <h3 class="font-bold text-sm capitalize">${cat.name}</h3>
                                    <p class="text-xs text-slate-400 mt-1">${cat.count} items</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Featured Products -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">New Arrivals</h2>
                            <a onclick="Router.navigate('/products')" class="text-blue-600 font-bold hover:underline cursor-pointer">View All →</a>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            ${isLoading ? Array(8).fill(Components.SkeletonProductCard()).join('') : products.map(product => Components.ProductCard(product)).join('')}
                        </div>
                    </div>

                    <!-- Recommendations -->
                    ${recommended.length > 0 ? `
                        <div class="bg-slate-50 -mx-4 sm:-mx-8 px-4 sm:px-8 py-12 rounded-[3rem]">
                            <h2 class="text-2xl font-bold mb-8 flex items-center gap-2">
                                <i data-lucide="sparkles" class="w-6 h-6 text-blue-600 font-bold"></i>
                                Recommended for You
                            </h2>
                            <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                ${recommended.map(product => Components.ProductCard(product)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Features -->
                    <div class="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pt-6 no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-all min-w-[200px] flex-1">
                            <div class="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="truck" class="w-6 h-6 md:w-8 md:h-8 text-green-600"></i>
                            </div>
                            <h3 class="font-bold mb-1 text-sm md:text-base">Free Shipping</h3>
                            <p class="text-[10px] md:text-sm text-slate-500">On orders over ₦50,000</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-all min-w-[200px] flex-1">
                            <div class="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="shield-check" class="w-6 h-6 md:w-8 md:h-8 text-blue-600"></i>
                            </div>
                            <h3 class="font-bold mb-1 text-sm md:text-base">Secure Payment</h3>
                            <p class="text-[10px] md:text-sm text-slate-500">100% secure transactions</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-all min-w-[200px] flex-1">
                            <div class="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="headphones" class="w-6 h-6 md:w-8 md:h-8 text-orange-600"></i>
                            </div>
                            <h3 class="font-bold mb-1 text-sm md:text-base">24/7 Support</h3>
                            <p class="text-[10px] md:text-sm text-slate-500">Always here to help</p>
                        </div>
                    </div>
                </div>
            `;
        },

        products(params = {}) {
            const { categoryLoading, fetchedProducts, categoryProducts, categoryMeta } = State.get();

            const { category, search, page = 1, minPrice, maxPrice, rating } = params;
            const currentPage = parseInt(page) || 1;

            // ---- Derive category list from main products (fast, already cached) ----
            const allProducts = State.getProducts();
            const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].map(c => ({
                name: c,
                slug: c.toLowerCase().replace(/ /g, '-'),
                count: allProducts.filter(p => p.category === c).length
            }));

            // ---- Kick off server-side fetch for the current page/category ----
            const fetchKey = JSON.stringify({ category, search, page: currentPage, minPrice, maxPrice, rating });
            if (State._lastFetchKey !== fetchKey && !categoryLoading) {
                State._lastFetchKey = fetchKey;
                const fetchFilters = { page: currentPage, limit: 24 };
                if (category) fetchFilters.category = categories.find(c => c.slug === category)?.name || category;
                if (search) fetchFilters.search = search;
                State.fetchProductPage(fetchFilters).then(() => Router.refresh());
            }

            // ---- Products currently in view ----
            let displayProducts = categoryProducts || [];
            const meta = categoryMeta || { total: displayProducts.length, page: currentPage, totalPages: 1, pageSize: 100 };
            const totalPages = meta.totalPages || 1;
            const totalCount = meta.total || 0;

            // Client-side filters on the returned page (price/rating — not worth a round-trip)
            if (minPrice) displayProducts = displayProducts.filter(p => (State.get().userRole === 'business' ? p.bulkPrice : p.price) >= parseFloat(minPrice));
            if (maxPrice) displayProducts = displayProducts.filter(p => (State.get().userRole === 'business' ? p.bulkPrice : p.price) <= parseFloat(maxPrice));
            if (rating) displayProducts = displayProducts.filter(p => p.rating >= parseFloat(rating));
            if (search) {
                displayProducts = displayProducts.map(p => {
                    let w = 0; const q = search.toLowerCase();
                    if (p.name.toLowerCase() === q) w += 100;
                    else if (p.name.toLowerCase().startsWith(q)) w += 50;
                    else if (p.name.toLowerCase().includes(q)) w += 20;
                    if ((p.category || '').toLowerCase().includes(q)) w += 10;
                    return { ...p, _w: w };
                }).filter(p => p._w > 0).sort((a, b) => b._w - a._w);
            }

            window.currentProducts = displayProducts;

            // ---- Build pagination URL — safe string concat (no nested template literals) ----
            function buildPageUrl(p) {
                var qs = 'page=' + p;
                if (category) qs += '&category=' + encodeURIComponent(category);
                if (search) qs += '&search=' + encodeURIComponent(search);
                if (minPrice) qs += '&minPrice=' + minPrice;
                if (maxPrice) qs += '&maxPrice=' + maxPrice;
                if (rating) qs += '&rating=' + rating;
                return '/products?' + qs;
            }

            // ---- Pagination bar — built with string concat to avoid nested backtick issues ----
            function buildPaginationBar() {
                if (totalPages <= 1) return '';
                var pageNums = [];
                var range = 2;
                for (var i = 1; i <= totalPages; i++) {
                    if (i === 1 || i === totalPages || (i >= currentPage - range && i <= currentPage + range)) {
                        pageNums.push(i);
                    } else if (pageNums[pageNums.length - 1] !== '...') {
                        pageNums.push('...');
                    }
                }
                var prevDisabled = currentPage <= 1;
                var nextDisabled = currentPage >= totalPages;
                var prevClass = prevDisabled
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                    : 'border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600';
                var nextClass = nextDisabled
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                    : 'border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600';

                var html = '<div class="flex items-center justify-center gap-2 mt-8 flex-wrap">';
                html += '<button ' + (prevDisabled ? 'disabled' : 'onclick="Router.navigate(\'' + buildPageUrl(currentPage - 1) + '\')"') +
                    ' class="flex items-center gap-1 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ' + prevClass + '">' +
                    '<i data-lucide="chevron-left" class="w-4 h-4"></i> Prev</button>';

                pageNums.forEach(function (p) {
                    if (p === '...') {
                        html += '<span class="px-2 text-slate-400 font-bold select-none">…</span>';
                    } else {
                        var isActive = p === currentPage;
                        var btnClass = isActive
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600';
                        html += '<button onclick="Router.navigate(\'' + buildPageUrl(p) + '\')" class="w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all ' + btnClass + '">' + p + '</button>';
                    }
                });

                html += '<button ' + (nextDisabled ? 'disabled' : 'onclick="Router.navigate(\'' + buildPageUrl(currentPage + 1) + '\')"') +
                    ' class="flex items-center gap-1 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ' + nextClass + '">' +
                    'Next <i data-lucide="chevron-right" class="w-4 h-4"></i></button>';
                html += '</div>';
                html += '<p class="text-center text-xs text-slate-400 mt-3">Page ' + currentPage + ' of ' + totalPages + ' &nbsp;·&nbsp; ' + totalCount.toLocaleString() + ' total products</p>';
                return html;
            }

            // ---- Pre-compute dynamic class strings to avoid template literal parsing errors ----
            var allCatActiveClass = !category ? 'border-blue-500 bg-blue-50/50 text-blue-600' : 'border-transparent hover:bg-slate-50 text-slate-600';

            var allCatCountClass = !category ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400';
            var loadingStatusHtml = categoryLoading
                ? '<span class="inline-flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-400 animate-ping inline-block"></span> Loading products\u2026</span>'
                : 'Showing <b>' + displayProducts.length + '</b> products' + (totalCount ? ' of <b>' + totalCount.toLocaleString() + '</b> total' : '');

            var categoryItemsHtml = categories.map(function (cat) {
                var isActive = category === cat.slug;
                var cls = isActive ? 'border-blue-500 bg-blue-50/50 text-blue-600' : 'border-transparent hover:bg-slate-50 text-slate-600';
                var cnt = isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400';
                return '<div onclick="Router.navigate(\'/products?category=' + cat.slug + '\')" class="flex items-center justify-between p-2 rounded-xl border-2 ' + cls + ' cursor-pointer transition-all group">'
                    + '<span class="text-sm font-bold capitalize">' + cat.name + '</span>'
                    + '<span class="text-[10px] font-bold ' + cnt + ' px-2 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">' + cat.count + '</span>'
                    + '</div>';
            }).join('');

            var ratingItemsHtml = [1, 2, 3, 4, 5].map(function (r) {
                var isActive = rating == r;
                var catParam = category ? '&category=' + category : '';
                var cls = isActive ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-300';
                var star = isActive ? 'fill-blue-500' : 'fill-slate-200 text-slate-300';
                return '<button onclick="Router.navigate(\'/products?rating=' + r + catParam + '\')" class="p-2 rounded-xl border-2 ' + cls + ' transition-all flex flex-col items-center gap-1">'
                    + '<span class="text-xs font-bold">' + r + '</span>'
                    + '<i data-lucide="star" class="w-3 h-3 ' + star + '"></i>'
                    + '</button>';
            }).join('');

            var productsGridHtml;
            if (categoryLoading) {
                productsGridHtml = '<div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">'
                    + Array(12).fill(Components.SkeletonProductCard()).join('')
                    + '</div>';
            } else if (displayProducts.length > 0) {
                productsGridHtml = '<div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">'
                    + displayProducts.map(function (p) { return Components.ProductCard(p); }).join('')
                    + '</div>'
                    + buildPaginationBar();
            } else {
                productsGridHtml = Components.EmptyState('search', 'No Products Found', 'Try adjusting your filters or search query',
                    '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Clear Filters</button>');
            }

            var breadcrumbLabel = category ? (categories.find(function (c) { return c.slug === category; }) || {}).name || 'Category' : 'All Products';

            return `
                <div class="px-4 sm:px-0">
                    ${Components.Breadcrumbs([
                { label: 'Home', link: '/' },
                { label: breadcrumbLabel }
            ])}

                    <div class="flex flex-col lg:flex-row gap-8">
                        <!-- Filters Sidebar -->
                        <aside class="w-full lg:w-72 space-y-6">
                            <div class="glass-card p-6 rounded-3xl sticky top-24">
                                <div class="flex items-center justify-between mb-6">
                                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                                        <i data-lucide="filter" class="w-4 h-4 text-blue-600"></i>
                                        Filters
                                    </h3>
                                    <button onclick="Router.navigate('/products')" class="text-xs font-bold text-blue-600 hover:text-blue-700">Clear All</button>
                                </div>

                                <!-- Categories -->
                                <div class="mb-8">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Categories</label>
                                    <div class="space-y-1 max-h-72 overflow-y-auto pr-1">
                                        <div onclick="Router.navigate('/products')" class="${allCatActiveClass} flex items-center justify-between p-2 rounded-xl border-2 cursor-pointer transition-all group">
                                            <span class="text-sm font-bold">All Products</span>
                                            <span class="text-[10px] font-bold ${allCatCountClass} px-2 py-0.5 rounded-full">${allProducts.length || totalCount}</span>
                                        </div>
                                        ${categoryItemsHtml}
                                    </div>
                                </div>

                                <!-- Price Range -->
                                <div class="mb-8 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Price Range</label>
                                    ${Components.DualHandleSlider('price-min', 'price-max', minPrice || 0, maxPrice || 1000000)}
                                    <button onclick="Pages.consumer.applyPriceFilter()" class="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Apply Price</button>
                                </div>

                                <!-- Rating -->
                                <div class="mb-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Minimum Rating</label>
                                    <div class="grid grid-cols-5 gap-2">${ratingItemsHtml}</div>
                                </div>
                            </div>
                        </aside>

                        <!-- Products Grid -->
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-center mb-6 flex-wrap gap-2">
                                <p class="text-sm text-slate-500">${loadingStatusHtml}</p>
                            </div>
                            ${productsGridHtml}
                        </div>
                    </div>
                </div>
            `;
        },

        applyPriceFilter() {
            const min = document.getElementById('price-min').value;
            const max = document.getElementById('price-max').value;
            const hash = window.location.hash.split('?')[0];
            const searchParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
            searchParams.set('minPrice', min);
            searchParams.set('maxPrice', max);
            Router.navigate(`${hash.replace('#', '')}?${searchParams.toString()}`);
        },

        productDetail(productId) {
            const product = State.getProducts().find(p => p.id === parseInt(productId));
            if (!product) return Components.EmptyState('package', 'Product Not Found', 'The product you\'re looking for doesn\'t exist');

            // Track View
            State.trackProductView(productId);

            // Define loading handler globally if not exists
            if (!window.handleImageLoad) {
                window.handleImageLoad = (img) => {
                    img.classList.remove('opacity-0');
                    img.parentElement.querySelector('.spinner')?.remove();
                };
            }

            window.currentProducts = [product];
            const state = State.get();
            const price = state.userRole === 'business' ? product.bulkPrice : product.price;
            const isInWishlist = State.isInWishlist(product.id);

            // In our Deterministic architecture, we check for images 0-3 by convention
            const galleryIndices = [0, 1, 2, 3];

            return `
                <div class="max-w-7xl mx-auto">
                    ${Components.Breadcrumbs([
                { label: 'Home', link: '/' },
                { label: 'Products', link: '/products' },
                { label: product.name }
            ])}

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <!-- Product Images -->
                        <div class="space-y-4">
                            <div class="glass-card rounded-[2rem] overflow-hidden h-72 sm:h-96 lg:h-[500px] relative flex items-center justify-center bg-gray-100">
                                <img loading="lazy" id="mainImage" src="${State.getMediaUrl(product.id, 0)}" onerror="console.error('Failed to load main product image:', this.src); this.src='https://via.placeholder.com/600?text=No+Image'" class="w-full h-full object-cover transform hover:scale-105 transition-all duration-500 relative z-10" alt="${product.name}">
                            </div>
                            <div class="grid grid-cols-4 gap-2 sm:gap-4">
                                ${galleryIndices.map(index => `
                                    <div onclick="const main = document.getElementById('mainImage'); main.src='${State.getMediaUrl(product.id, index)}';" class="glass-card rounded-xl h-16 sm:h-24 overflow-hidden cursor-pointer border-2 ${index === 0 ? 'border-blue-600' : 'border-transparent'} hover:border-blue-400 transition-all relative">
                                        <img loading="lazy" src="${State.getMediaUrl(product.id, index)}" onerror="this.parentElement.style.display='none'" class="w-full h-full object-cover" alt="${product.name} Gallery Image ${index + 1}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Product Info -->
                        <div class="flex flex-col">
                            <span class="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2">${product.category}</span>
                            <h1 class="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 leading-tight">${product.name}</h1>
                            
                            <div class="flex flex-wrap items-center gap-4 mb-6">
                                <div class="flex text-orange-400">
                                    ${Components.StarRating(product.rating)}
                                </div>
                                <span class="text-slate-400 text-sm">(${product.reviews} Reviews)</span>
                                <span class="text-green-600 text-sm font-bold flex items-center gap-1"><i data-lucide="check" class="w-4 h-4"></i> In Stock (${product.stock})</span>
                            </div>

                            <div class="mb-8 p-6 glass-card rounded-2xl border-blue-100 bg-blue-50/30">
                                ${state.userRole === 'business' ? `
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <p class="text-xs font-bold text-blue-600 uppercase">B2B Bulk Pricing</p>
                                            <p class="text-3xl font-bold">${State.formatCurrency(product.bulkPrice)} <span class="text-sm font-normal text-slate-400">/ unit</span></p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-xs text-slate-500">Min. Order: ${product.moq} Units</p>
                                            <p class="text-xs text-green-600 font-bold">In Stock: ${product.stock.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="flex items-center gap-4">
                                        <div>
                                            <p class="text-xs font-bold text-slate-400 uppercase line-through">${State.formatCurrency(Number(price) * 1.3)}</p>
                                            <p class="text-4xl font-bold text-slate-800">${State.formatCurrency(price)}</p>
                                        </div>
                                        <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm animate-pulse">Save 30%</span>
                                    </div>
                                `}
                            </div>

                            <p class="text-slate-600 leading-relaxed mb-8 text-sm sm:text-base">${product.description}</p>

                            <div class="mb-8">
                                <h3 class="font-bold mb-3">Key Features</h3>
                                <ul class="space-y-2">
                                    ${(product.features && product.features.length > 0 ? product.features : ['High quality product', 'Fast shipping available', product.category + ' category']).map(feature => `
                                        <li class="flex items-center gap-2 text-slate-600 text-sm sm:text-base">
                                            <i data-lucide="check-circle" class="w-5 h-5 text-green-600 flex-shrink-0"></i>
                                            ${feature}
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <div class="flex flex-col sm:flex-row gap-4 mb-6">
                                <div class="flex items-center border rounded-xl overflow-hidden w-full sm:w-auto justify-center">
                                    <button onclick="this.nextElementSibling.stepDown()" class="px-4 py-3 hover:bg-slate-100 transition-all text-lg font-bold w-12">-</button>
                                    <input type="number" id="product-qty-input" value="1" min="1" class="w-16 text-center border-x outline-none py-3 font-bold bg-white">
                                    <button onclick="this.previousElementSibling.stepUp()" class="px-4 py-3 hover:bg-slate-100 transition-all text-lg font-bold w-12">+</button>
                                </div>
                                <button onclick="Components.addToCartAction(${product.id})" class="flex-1 bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                                    <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                                    Add to Cart
                                </button>
                                    <button onclick="Components.toggleWishlist(${product.id})" class="border-2 ${isInWishlist ? 'border-red-500 bg-red-50' : 'border-slate-300'} px-6 py-3 sm:py-0 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center">
                                        <i data-lucide="heart" class="w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600'}"></i>
                                    </button>
                                </div>

                                ${state.userRole === 'dropshipper' ? `
                                    <button onclick="State.addToStore(${product.id})" class="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 mb-4">
                                        <i data-lucide="plus" class="w-5 h-5"></i>
                                        Add to My Store
                                    </button>
                                ` : ''}

                                <button onclick="Components.buyNowAction(${product.id})" class="w-full border-2 border-slate-800 text-slate-800 py-4 rounded-xl font-bold hover:bg-slate-800 hover:text-white transition-all">
                                    Buy Now
                                </button>

                            <div class="grid grid-cols-3 gap-2 sm:gap-4 mt-8 pt-8 border-t">
                                <div class="text-center">
                                    <i data-lucide="truck" class="w-6 h-6 mx-auto mb-2 text-blue-600"></i>
                                    <p class="text-xs font-bold">Free Shipping</p>
                                </div>
                                <div class="text-center">
                                    <i data-lucide="rotate-ccw" class="w-6 h-6 mx-auto mb-2 text-blue-600"></i>
                                    <p class="text-xs font-bold">30-Day Returns</p>
                                </div>
                                <div class="text-center">
                                    <i data-lucide="shield-check" class="w-6 h-6 mx-auto mb-2 text-blue-600"></i>
                                    <p class="text-xs font-bold">2-Year Warranty</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Related YouTube Content -->
                    <div class="mt-16 mb-16">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Product Reviews & Demos</h2>
                            <span class="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">Powered by YouTube</span>
                        </div>
                        <div id="youtube-reviews-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${[1, 2, 3, 4].map(i => `
                                <div class="glass-card rounded-2xl overflow-hidden animate-pulse">
                                    <div class="aspect-video bg-slate-200"></div>
                                    <div class="p-4 space-y-2">
                                        <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                                        <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="mt-8 flex justify-center">
                            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(product.name + ' review')}" target="_blank" class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:shadow-xl transition-all flex items-center gap-2">
                                <i data-lucide="youtube" class="w-5 h-5 text-red-500"></i>
                                View More on YouTube
                            </a>
                        </div>
                    </div>

                    <script>
                        (async () => {
                            const container = document.getElementById('youtube-reviews-container');
                            if (!container) return;
                            
                            try {
                                const videos = await State.youtubeSearch('${product.name} review');
                                if (videos && videos.length > 0) {
                                    container.innerHTML = videos.slice(0, 4).map(video => \`
                                        <div class="glass-card rounded-2xl overflow-hidden group">
                                            <div class="relative aspect-video">
                                                <img loading="lazy" src="\${video.thumbnail}" class="w-full h-full object-cover">
                                                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href="https://youtube.com/watch?v=\${video.id}" target="_blank" class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-600/40">
                                                        <i data-lucide="play" class="w-6 h-6 text-white fill-white"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div class="p-4">
                                                <h3 class="font-bold text-sm mb-2 line-clamp-2">\${video.title}</h3>
                                                <div class="flex items-center justify-between">
                                                    <span class="text-[10px] text-slate-400">\${video.channelTitle}</span>
                                                    ${state.userRole === 'dropshipper' ? `
                                                        <button onclick="State.downloadVideo('\${video.id}')" class="p-2 hover:bg-slate-100 rounded-lg transition-colors group/dl" title="Download MP4">
                                                            <i data-lucide="download" class="w-4 h-4 text-slate-400 group-hover/dl:text-blue-600"></i>
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    \`).join('');
                                    if (window.lucide) lucide.createIcons();
                                } else {
                                    container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">No review videos found for this product.</div>';
                                }
                            } catch (err) {
                                console.error('YouTube search failed:', err);
                                container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">Failed to load review videos.</div>';
                            }
                        })();
                    </script>

                    <!-- Related Products -->
                    <div class="mt-16">
                        <h2 class="text-2xl font-bold mb-6">You May Also Like</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${State.getProducts().filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4).map(p => Components.ProductCard(p)).join('')}
                        </div>
                    </div>
                </div>
            `;
        },

        cart() {
            const cart = State.get().cart;
            const total = State.getCartTotal();

            if (cart.length === 0) {
                return Components.EmptyState('shopping-cart', 'Your Cart is Empty', 'Add some products to get started!', '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Browse Products</button>');
            }

            window.currentProducts = cart;

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Shopping Cart (<span id="cart-count-title">${cart.length}</span> items)</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Cart Items -->
                        <div class="lg:col-span-2 space-y-4" id="cart-items-list">
                            ${this.renderCartItems(cart)}
                        </div>

                        <!-- Order Summary -->
                        <div class="glass-card p-6 rounded-2xl h-fit sticky top-24" id="cart-summary-details">
                            ${this.renderCartSummary(total)}
                        </div>
                    </div>
                    
                    <!-- Recommendations Section -->
                    ${Components.MoreToLoveSection(State.get().recommendedProducts || [])}
                </div>
            `;
        },

        renderCartItems(cart) {
            return cart.map(item => `
                <div class="glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-left transition-all hover:shadow-md" id="cart-item-${item.id}">
                    <img loading="lazy" src="${State.getMediaUrl(item.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" alt="${item.name}" class="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-xl shadow-sm">
                    <div class="flex-1 w-full">
                        <h3 class="font-bold mb-1 text-slate-800 text-lg sm:text-base">${item.name}</h3>
                        <p class="text-sm text-slate-500 mb-3">${item.category}</p>
                        <div class="flex flex-col sm:flex-row items-center gap-4 justify-between w-full">
                            <div class="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm">
                                <button onclick="window.updateCartQty(${item.id}, ${item.quantity - 1})" class="px-3 py-2 hover:bg-slate-100 transition-colors bg-slate-50">-</button>
                                <span class="px-4 py-2 border-x font-bold min-w-[3rem] text-center">${item.quantity}</span>
                                <button onclick="window.updateCartQty(${item.id}, ${item.quantity + 1})" class="px-3 py-2 hover:bg-slate-100 transition-colors bg-slate-50">+</button>
                            </div>
                            <button onclick="window.removeCartItem(${item.id})" class="text-red-500 text-sm hover:text-red-700 hover:underline flex items-center gap-1 transition-colors p-2 sm:p-0">
                                <i data-lucide="trash-2" class="w-4 h-4"></i> Remove
                            </button>
                        </div>
                    </div>
                    <div class="text-center sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <p class="text-xl font-bold text-blue-600">${State.formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}</p>
                        <p class="text-xs text-slate-400 mt-1">${State.formatCurrency(Number(item.price) || 0)} each</p>
                    </div>
                </div>
            `).join('');
        },

        renderCartSummary(total) {
            return `
                <h3 class="font-bold text-lg mb-4">Order Summary</h3>
                <div class="space-y-3 text-sm border-b pb-4 mb-4">
                    <div class="flex justify-between">
                        <span class="text-slate-600">Subtotal</span>
                        <span class="font-bold">${State.formatCurrency(total)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-600">Shipping</span>
                        <span class="text-green-600 font-bold">FREE</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-600">Tax (estimated)</span>
                        <span class="font-bold">${State.formatCurrency((Number(total) || 0) * 0.08)}</span>
                    </div>
                </div>
                <div class="flex justify-between text-xl font-bold mb-6">
                    <span>Total</span>
                    <span class="text-blue-600">${State.formatCurrency((Number(total) || 0) * 1.08)}</span>
                </div>
                <button onclick="Router.navigate('/checkout')" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mb-3">
                    Proceed to Checkout
                </button>
                <button onclick="Router.navigate('/products')" class="w-full border-2 border-slate-300 p-4 rounded-xl font-bold hover:bg-slate-50 transition-all">
                    Continue Shopping
                </button>
            `;
        },


        checkout() {
            const cart = State.get().cart;
            const total = State.getCartTotal();

            if (cart.length === 0) {
                Router.navigate('/cart');
                return '';
            }

            const activeStorefront = localStorage.getItem('active_storefront');
            if (activeStorefront && !Auth.isLoggedIn()) {
                setTimeout(() => {
                    if (window.showGhostLoginModal) window.showGhostLoginModal(activeStorefront);
                }, 0);
                return `<div class="p-8 text-center"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto text-blue-600"></i><p class="mt-4 text-slate-500 font-bold">Creating secure session...</p></div>`;
            }

            const user = Auth.getUserSession();
            if (user && !user.is_verified && !activeStorefront) {
                setTimeout(() => {
                    if (window.showBindEmailModal) window.showBindEmailModal();
                }, 0);
                return `<div class="p-8 text-center"><i data-lucide="alert-circle" class="w-12 h-12 mx-auto text-red-500 mb-4"></i><h3 class="text-xl font-bold mb-2">Email Verification Required</h3><p class="text-slate-500 mb-6">You must verify your email address before placing an order on the main store.</p><button onclick="window.showBindEmailModal()" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700">Verify Email</button></div>`;
            }

            // Default payment method
            window.selectedPaymentMethod = 'card';

            // Helper to set payment method
            window.selectPayment = (method) => {
                window.selectedPaymentMethod = method;
                document.querySelectorAll('.payment-btn').forEach(btn => {
                    btn.classList.remove('border-blue-600', 'bg-blue-50', 'text-blue-600');
                    btn.classList.add('border-slate-200', 'text-slate-400');
                });
                const btn = document.getElementById(`btn-${method}`);
                if (btn) {
                    btn.classList.remove('border-slate-200', 'text-slate-400');
                    btn.classList.add('border-blue-600', 'bg-blue-50', 'text-blue-600');
                }
            };

            // Fetch addresses for checkout
            setTimeout(async () => {
                const user = Auth.getUserSession();
                if (user && user.token) {
                    try {
                        const res = await fetch(window.apiUrl('/api/addresses'), {
                            headers: { 'Authorization': `Bearer ${user.token}` }
                        });
                        if (res.ok) {
                            const addresses = await res.json();
                            window.checkoutAddresses = addresses; // Store for access
                            const container = document.getElementById('checkout-addresses');
                            if (container && addresses.length > 0) {
                                container.innerHTML = `
                                    <div class="space-y-3 mb-4">
                                        <p class="text-sm font-bold text-slate-600 mb-2">Select a Saved Address:</p>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            ${addresses.map(addr => `
                                                <div id="addr-card-${addr.id}" class="border-2 ${addr.is_default ? 'border-blue-600 bg-blue-50' : 'border-slate-200'} rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-all address-card" onclick="selectCheckoutAddress('${addr.id}')">
                                                    <div class="flex justify-between items-start">
                                                        <span class="font-bold text-sm capitalize">${addr.type}</span>
                                                        ${addr.is_default ? '<i data-lucide="check-circle" class="w-4 h-4 text-blue-600"></i>' : ''}
                                                    </div>
                                                    <p class="text-sm font-bold mt-1">${addr.name}</p>
                                                    <p class="text-xs text-slate-600">${addr.address_line1}, ${addr.city}</p>
                                                    <input type="radio" name="selectedAddress" value="${addr.id}" class="hidden" ${addr.is_default ? 'checked' : ''}>
                                                </div>
                                            `).join('')}
                                        </div>
                                        <button onclick="document.getElementById('new-address-form').classList.toggle('hidden'); document.getElementById('new-address-form').scrollIntoView({behavior: 'smooth'});" class="text-blue-600 text-sm font-bold hover:underline mt-2">+ Use a different address</button>
                                    </div>
                                `;
                                lucide.createIcons();
                                // Hide the blank form now that addresses are shown
                                document.getElementById('new-address-form').classList.add('hidden');

                                // Auto-fill if default exists
                                const defaultAddr = addresses.find(a => a.is_default);
                                if (defaultAddr) window.selectCheckoutAddress(defaultAddr.id);
                            }
                        }
                    } catch (e) {
                        console.error('Failed to load addresses', e);
                    }
                }
            }, 0);

            window.selectCheckoutAddress = (id) => {
                const addr = window.checkoutAddresses?.find(a => a.id === parseInt(id) || a.id === id);
                if (!addr) return;

                document.querySelectorAll('.address-card').forEach(c => {
                    c.classList.remove('border-blue-600', 'bg-blue-50');
                    c.classList.add('border-slate-200');
                    c.querySelector('i')?.remove();
                });

                const card = document.getElementById(`addr-card-${id}`);
                if (card) {
                    card.classList.remove('border-slate-200');
                    card.classList.add('border-blue-600', 'bg-blue-50');
                    if (!card.querySelector('i')) {
                        card.querySelector('.flex').insertAdjacentHTML('beforeend', '<i data-lucide="check-circle" class="w-4 h-4 text-blue-600"></i>');
                        lucide.createIcons();
                    }
                }

                window.selectedAddressId = id;
                document.getElementById('new-address-form').classList.add('hidden');

                // Populate form for compatibility with placeOrder
                const nameParts = addr.name.split(' ');
                document.getElementById('chk-fname').value = nameParts[0] || '';
                document.getElementById('chk-lname').value = nameParts.slice(1).join(' ') || '';
                document.getElementById('chk-phone').value = addr.phone || '';
                document.getElementById('chk-address').value = addr.address_line1 || '';
                document.getElementById('chk-city').value = addr.city || '';
                document.getElementById('chk-state').value = addr.state || '';
                document.getElementById('chk-zip').value = addr.postal_code || '';
                document.getElementById('chk-country').value = addr.country || '';
            };

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Checkout</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Checkout Form -->
                        <div class="lg:col-span-2 space-y-6">
                            <!-- Shipping Address -->
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 flex items-center gap-2">
                                    <i data-lucide="map-pin" class="w-5 h-5 text-blue-600"></i>
                                    Shipping Address
                                </h3>
                                
                                <div id="checkout-addresses"></div>

                                <!-- Always-visible shipping form; hidden only after saved addresses load -->
                                <div id="new-address-form">
                                    <div class="grid grid-cols-2 gap-4">
                                        <input id="chk-fname" type="text" placeholder="First Name" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-white">
                                        <input id="chk-lname" type="text" placeholder="Last Name" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-white">
                                        <input id="chk-email" type="email" placeholder="Email" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-white col-span-2">
                                        <input id="chk-phone" type="tel" placeholder="Phone" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-white col-span-2">
                                        <input id="chk-address" type="text" placeholder="Street Address" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-white col-span-2">
                                        <input id="chk-city" type="text" placeholder="City" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-white">
                                        <input id="chk-state" type="text" placeholder="State / Province" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-white">
                                        <input id="chk-zip" type="text" placeholder="ZIP / Postal Code" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-white">
                                        <select id="chk-country" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500 text-slate-600 bg-white">
                                            <option value="">Select Country</option>
                                            <option value="NG" selected>Nigeria</option>
                                            <option value="US">United States</option>
                                            <option value="GB">United Kingdom</option>
                                            <option value="CA">Canada</option>
                                            <option value="AU">Australia</option>
                                            <option value="GH">Ghana</option>
                                            <option value="KE">Kenya</option>
                                            <option value="ZA">South Africa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>


                            <!-- Payment Method -->
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 flex items-center gap-2">
                                    <i data-lucide="credit-card" class="w-5 h-5 text-blue-600"></i>
                                    Payment Method
                                </h3>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <button id="btn-card" onclick="window.selectPayment('card')" class="payment-btn p-3 border-2 border-blue-600 bg-blue-50 rounded-xl font-bold text-blue-600 transition-all flex flex-col items-center gap-2">
                                        <i data-lucide="credit-card" class="w-5 h-5"></i>
                                        <span>Stripe</span>
                                    </button>
                                    <button id="btn-paypal" onclick="window.selectPayment('paypal')" class="payment-btn p-3 border-2 border-slate-200 rounded-xl font-bold text-slate-400 transition-all flex flex-col items-center gap-2 hover:bg-slate-50">
                                        <i data-lucide="banknote" class="w-5 h-5"></i>
                                        <span>PayPal</span>
                                    </button>
                                    <button id="btn-paystack" onclick="window.selectPayment('paystack')" class="payment-btn p-3 border-2 border-slate-200 rounded-xl font-bold text-slate-400 transition-all flex flex-col items-center gap-2 hover:bg-slate-50">
                                        <i data-lucide="layers" class="w-5 h-5"></i>
                                        <span>Paystack</span>
                                    </button>
                                    <button id="btn-flutterwave" onclick="window.selectPayment('flutterwave')" class="payment-btn p-3 border-2 border-slate-200 rounded-xl font-bold text-slate-400 transition-all flex flex-col items-center gap-2 hover:bg-slate-50">
                                        <i data-lucide="activity" class="w-5 h-5"></i>
                                        <span>Flutterwave</span>
                                    </button>
                                </div>
                                <div class="space-y-4">
                                    <input type="text" placeholder="Card Information (handled securely)" class="w-full p-3 border rounded-xl bg-slate-50 opacity-75 cursor-not-allowed" disabled>
                                    <p class="text-xs text-slate-400">For Card payments, you will be redirected to a secure payment page.</p>
                                </div>
                            </div>
                        </div>

                             <!-- Order Summary -->
                        <div class="space-y-6">
                            <!-- Gift Card / Promo Code -->
                            <div class="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white">
                                <h3 class="font-bold mb-4 flex items-center gap-2">
                                    <i data-lucide="ticket" class="w-5 h-5 text-purple-600"></i>
                                    Gift Card or Promo Code
                                </h3>
                                <div class="flex gap-2">
                                    <input type="text" id="promo-code" placeholder="Enter code" class="flex-1 p-3 rounded-xl border bg-white outline-none focus:border-purple-500 transition-all font-mono">
                                    <button onclick="State.applyPromo(document.getElementById('promo-code').value)" class="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all">
                                        Apply
                                    </button>
                                </div>
                                <div id="promo-applied" class="hidden mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center">
                                    <span class="text-green-700 text-sm font-bold"><i data-lucide="check" class="w-4 h-4 inline mr-1"></i>Applied: -${State.formatCurrency(2500)}</span>
                                    <button onclick="State.removePromo()" class="text-red-500 hover:text-red-700"><i data-lucide="x" class="w-4 h-4"></i></button>
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Order Summary</h3>
                                <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    ${cart.map(item => `
                                        <div class="flex gap-3">
                                            <img loading="lazy" src="${State.getMediaUrl(item.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-16 h-16 rounded-lg object-cover" alt="${item.name}">
                                            <div class="flex-1">
                                                <p class="font-bold text-sm">${item.name}</p>
                                                <p class="text-xs text-slate-400">Qty: ${item.quantity}</p>
                                            </div>
                                            <p class="font-bold">${State.formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}</p>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="space-y-2 text-sm border-t pt-4">
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Subtotal</span>
                                        <span class="font-bold">${State.formatCurrency(total)}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Shipping</span>
                                        <span class="text-green-600 font-bold">FREE</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Tax</span>
                                        <span class="font-bold">${State.formatCurrency((Number(total) || 0) * 0.08)}</span>
                                    </div>
                                </div>
                                <div class="flex justify-between text-xl font-bold mt-4 pt-4 border-t">
                                    <span>Total</span>
                                    <span class="text-blue-600">${State.formatCurrency((Number(total) || 0) * 1.08)}</span>
                                </div>
                            </div>

                            <button onclick="Pages.consumer.placeOrder()" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all relative group">
                                <span class="group-hover:hidden">Pay Now</span>
                                <span class="hidden group-hover:inline">Process Payment</span>
                            </button>
                            
                            <div class="flex items-center justify-center gap-2 text-xs text-slate-500">
                                <i data-lucide="lock" class="w-4 h-4"></i>
                                <span>Secure 256-bit SSL Encryption</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        notifications() {
            const notifications = State.get().notifications || [];
            return `
                <div class="max-w-4xl mx-auto px-4 sm:px-0">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold text-slate-800">Notifications</h1>
                            <p class="text-slate-500">Stay updated with your latest activity</p>
                        </div>
                        <button onclick="State.markAllNotificationsRead(); Router.navigate('/notifications')" class="text-blue-600 hover:text-blue-800 font-bold text-sm">Mark all as read</button>
                    </div>

                    <div class="glass-card rounded-[2rem] overflow-hidden">
                        ${notifications.length === 0 ? `
                            <div class="p-20 text-center">
                                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i data-lucide="bell-off" class="w-8 h-8 text-slate-300"></i>
                                </div>
                                <h3 class="font-bold text-slate-800 mb-2">No notifications yet</h3>
                                <p class="text-slate-500 text-sm">Well notify you when something important happens.</p>
                            </div>
                        ` : `
                            <div class="divide-y divide-slate-50">
                                ${notifications.map(n => `
                                    <div class="p-6 hover:bg-slate-50 transition-all cursor-pointer group ${!n.read ? 'bg-blue-50/30' : ''}" onclick="markNotificationRead(${n.id}, event)">
                                        <div class="flex gap-4">
                                            <div class="w-12 h-12 rounded-2xl ${n.type === 'order' ? 'bg-orange-100 text-orange-600' : n.type === 'system' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center shrink-0">
                                                <i data-lucide="${n.type === 'order' ? 'package' : n.type === 'system' ? 'shield-check' : 'bell'}" class="w-6 h-6"></i>
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex items-center justify-between mb-1">
                                                    <h4 class="font-bold text-slate-800">${n.title}</h4>
                                                    <span class="text-xs text-slate-400">${new Date(n.created_at).toLocaleString()}</span>
                                                </div>
                                                <p class="text-sm text-slate-600">${n.message}</p>
                                                ${!n.read ? '<span class="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2"></span>' : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;
        },

        async placeOrder() {
            const method = window.selectedPaymentMethod || 'card';
            const total = State.getCartTotal() * 1.08;
            const session = Auth.getUserSession();

            // Check auth
            if (!session || !session.token) {
                State.notify('Please login to complete your order', 'warn');
                // Store redirect target
                localStorage.setItem('authRedirect', '/checkout');
                Router.navigate('/login');
                return;
            }

            // Collect Shipping Data
            const fname = document.getElementById('chk-fname').value;
            const lname = document.getElementById('chk-lname').value;
            const phone = document.getElementById('chk-phone').value;
            const address = document.getElementById('chk-address').value;
            const city = document.getElementById('chk-city').value;
            const country = document.getElementById('chk-country').value;

            if (!fname || !address || !city) {
                State.notify('Please fill in required shipping details', 'error');
                return;
            }

            State.notify('Initiating payment gateway...', 'info');

            try {
                // We no longer create the Order here. 
                // We directly initialize payment with the transaction metadata!

                const paymentResponse = await fetch(window.apiUrl('/api/payment/initialize'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.token}`
                    },
                    body: JSON.stringify({
                        userId: session.id,
                        orderId: null, // Order is purposefully delayed until callback
                        amount: total,
                        currency: 'NGN',
                        paymentGateway: method,
                        userCurrency: 'NGN',
                        shippingAddress: `${fname} ${lname}, ${address}, ${city}, ${country}. Ph: ${phone}`,
                        notes: 'Web order',
                        storeSlug: localStorage.getItem('active_storefront')
                    })
                });

                const paymentData = await paymentResponse.json();

                if (paymentData.success) {
                    const pData = paymentData.paymentData || paymentData;
                    const redirectUrl = pData.checkoutUrl ||
                        pData.authorizationUrl ||
                        pData.paymentLink ||
                        (pData.approvalLinks?.find(l => l.rel === 'approve')?.href);

                    if (redirectUrl) {
                        window.location.href = redirectUrl;
                    } else if (paymentData.method === 'gift_card') {
                        // For perfectly synchronous zero-balance gateway transactions
                        Router.navigate(`/payment-status?gateway=gift_card&status=success&reference=${paymentData.transactionRef}`);
                    } else {
                        throw new Error('No payment redirect URL received');
                    }
                } else {
                    State.notify('Payment initialization failed: ' + (paymentData.message || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error(error);
                State.notify(error.message || 'Server connection failed', 'error');
            }
        },

        orderConfirmation(orderId) {
            return `
                <div class="max-w-3xl mx-auto text-center py-12">
                    <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="check-circle" class="w-12 h-12 text-green-600"></i>
                    </div>
                    <h1 class="text-4xl font-bold mb-4">Order Confirmed!</h1>
                    <p class="text-slate-600 mb-8">Thank you for your purchase. Your order has been received and is being processed.</p>
                    
                    <div class="glass-card p-8 rounded-2xl mb-8 text-left">
                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Order Number</p>
                                <p class="font-bold text-lg">${orderId}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Order Date</p>
                                <p class="font-bold text-lg">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Estimated Delivery</p>
                                <p class="font-bold text-lg">${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Payment Method</p>
                                <p class="font-bold text-lg">${window.selectedPaymentMethod || 'Card Payment'}</p>
                            </div>
                        </div>
                        
                        <div class="border-t pt-6">
                            <p class="text-sm text-slate-600 mb-4">A confirmation email has been sent to your email address with order details and tracking information.</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/account/orders')" class="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                    Track Order
                                </button>
                                <button onclick="Router.navigate('/products')" class="flex-1 border-2 border-slate-300 p-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
                        <div class="glass-card p-6 rounded-xl">
                            <i data-lucide="truck" class="w-8 h-8 mx-auto mb-3 text-blue-600"></i>
                            <p class="font-bold mb-1">Free Shipping</p>
                            <p class="text-slate-500 text-xs">Delivered in 5-7 days</p>
                        </div>
                        <div class="glass-card p-6 rounded-xl">
                            <i data-lucide="rotate-ccw" class="w-8 h-8 mx-auto mb-3 text-blue-600"></i>
                            <p class="font-bold mb-1">Easy Returns</p>
                            <p class="text-slate-500 text-xs">30-day return policy</p>
                        </div>
                        <div class="glass-card p-6 rounded-xl">
                            <i data-lucide="headphones" class="w-8 h-8 mx-auto mb-3 text-blue-600"></i>
                            <p class="font-bold mb-1">24/7 Support</p>
                            <p class="text-slate-500 text-xs">We're here to help</p>
                        </div>
                    </div>
                </div>
            `;
        },

        account() {
            // Auth guard: show sign-in/sign-up landing page for unauthenticated users
            if (!Auth.isLoggedIn()) {
                return `
                    <div class="min-h-[85vh] flex items-center justify-center px-4 py-12" style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #fdf2ff 100%)">
                        <div class="max-w-5xl w-full">

                            <!-- Hero Section -->
                            <div class="text-center mb-16">
                                <div class="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
                                    <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                                    Secure Account Portal
                                </div>
                                <h1 class="text-5xl md:text-6xl font-black text-slate-900 mb-5 leading-tight">
                                    Your <span style="background: linear-gradient(135deg, #2563eb, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Xperience</span><br>Awaits
                                </h1>
                                <p class="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed">
                                    Sign in to manage your orders, wishlist, and account settings — or create a free account to get started.
                                </p>
                            </div>

                            <!-- Cards -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-14">

                                <!-- Sign In Card -->
                                <div class="group relative bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer" onclick="Router.navigate('/login')" id="account-signin-card">
                                    <div class="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background: linear-gradient(135deg, rgba(37,99,235,0.04), rgba(124,58,237,0.04));"></div>
                                    <div class="relative">
                                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style="background: linear-gradient(135deg, #2563eb, #3b82f6);">
                                            <i data-lucide="log-in" class="w-7 h-7 text-white"></i>
                                        </div>
                                        <h2 class="text-2xl font-bold text-slate-900 mb-3">Sign In</h2>
                                        <p class="text-slate-500 text-sm leading-relaxed mb-6">
                                            Already have an account? Access your dashboard, view orders, and manage your profile.
                                        </p>
                                        <div class="flex flex-wrap gap-2 mb-8">
                                            <span class="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">Track Orders</span>
                                            <span class="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">Wishlist</span>
                                            <span class="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">Settings</span>
                                        </div>
                                        <button onclick="event.stopPropagation(); Router.navigate('/login')" id="account-goto-signin" class="w-full py-3.5 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2" style="background: linear-gradient(135deg, #2563eb, #3b82f6); box-shadow: 0 8px 24px rgba(37,99,235,0.3);">
                                            <i data-lucide="log-in" class="w-4 h-4"></i>
                                            Sign In to Your Account
                                        </button>
                                    </div>
                                </div>

                                <!-- Create Account Card -->
                                <div class="group relative bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer" onclick="Router.navigate('/register')" id="account-register-card">
                                    <div class="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background: linear-gradient(135deg, rgba(124,58,237,0.04), rgba(16,185,129,0.04));"></div>
                                    <div class="relative">
                                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style="background: linear-gradient(135deg, #7c3aed, #a855f7);">
                                            <i data-lucide="user-plus" class="w-7 h-7 text-white"></i>
                                        </div>
                                        <h2 class="text-2xl font-bold text-slate-900 mb-3">Create Account</h2>
                                        <p class="text-slate-500 text-sm leading-relaxed mb-6">
                                            New to Xperiencestore? Join thousands of shoppers and unlock exclusive benefits.
                                        </p>
                                        <div class="flex flex-wrap gap-2 mb-8">
                                            <span class="bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">Free to Join</span>
                                            <span class="bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">Exclusive Deals</span>
                                            <span class="bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">Fast Checkout</span>
                                        </div>
                                        <button onclick="event.stopPropagation(); Router.navigate('/register')" id="account-goto-register" class="w-full py-3.5 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2" style="background: linear-gradient(135deg, #7c3aed, #a855f7); box-shadow: 0 8px 24px rgba(124,58,237,0.3);">
                                            <i data-lucide="user-plus" class="w-4 h-4"></i>
                                            Create Free Account
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Trust Badges -->
                            <div class="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs font-bold">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="lock" class="w-4 h-4 text-green-500"></i>
                                    <span>256-bit SSL Secure</span>
                                </div>
                                <div class="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="shield" class="w-4 h-4 text-blue-500"></i>
                                    <span>Privacy Protected</span>
                                </div>
                                <div class="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="users" class="w-4 h-4 text-purple-500"></i>
                                    <span>50,000+ Happy Customers</span>
                                </div>
                                <div class="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="headphones" class="w-4 h-4 text-orange-500"></i>
                                    <span>24/7 Support</span>
                                </div>
                            </div>

                        </div>
                    </div>
                `;
            }

            const user = State.getUser() || { name: 'Welcome', email: '' };

            // Fetch real status in background
            setTimeout(() => {
                if (window.State && State.fetchOrders) {
                    State.fetchOrders().then(() => {
                        const content = document.getElementById('account-content-area');
                        if (content) {
                            // Re-render only if needed or just let the user navigate
                        }
                    });
                }
            }, 0);

            const orders = State.get().orders || [];
            const recentOrders = orders.slice(0, 3);
            const totalSpent = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? Number(o.total_amount) : 0), 0);
            const wishlistCount = (State.get().wishlist || []).length;

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">My Account</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- Sidebar -->
                        <div class="space-y-2">
                            <button onclick="Router.navigate('/account')" class="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-left">
                                <i data-lucide="user" class="w-5 h-5 inline mr-2"></i>
                                Dashboard
                            </button>
                            <button onclick="Router.navigate('/account/orders')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="package" class="w-5 h-5 inline mr-2"></i>
                                Orders
                            </button>
                            <button onclick="Router.navigate('/account/wishlist')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="heart" class="w-5 h-5 inline mr-2"></i>
                                Wishlist
                            </button>
                            <button onclick="Router.navigate('/account/profile')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="settings" class="w-5 h-5 inline mr-2"></i>
                                Settings
                            </button>
                            <button onclick="Auth.logout(); window.location.hash = '/'; window.location.reload();" class="w-full p-4 glass-card rounded-xl font-bold text-left text-red-600 hover:bg-red-50 transition-all" id="account-logout-btn">
                                <i data-lucide="log-out" class="w-5 h-5 inline mr-2"></i>
                                Logout
                            </button>
                        </div>

                        <!-- Main Content -->
                        <div class="lg:col-span-3 space-y-6" id="account-content-area">
                            <!-- Welcome Card -->
                            <div class="glass-card p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                                <h2 class="text-2xl font-bold mb-2">Welcome back, ${user.name}!</h2>
                                <p class="opacity-90">${user.email}</p>
                            </div>

                            <!-- Stats -->
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                ${Components.StatCard('Total Orders', orders.length.toString(), 'package', 'blue')}
                                ${Components.StatCard('Wishlist Items', wishlistCount.toString(), 'heart', 'red')}
                                ${Components.StatCard('Total Spent', `₦${totalSpent.toLocaleString()}`, 'dollar-sign', 'green')}
                            </div>

                            <!-- Recent Orders -->
                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-xl font-bold">Recent Orders</h3>
                                    <a href="#/account/orders" class="text-blue-600 font-bold hover:underline">View All →</a>
                                </div>
                                <div class="space-y-4">
                                    ${recentOrders.length > 0 ? recentOrders.map(order => Components.OrderCard(order)).join('') : '<p class="text-slate-500 py-10 bg-slate-50 rounded-xl text-center border-2 border-dashed">No orders yet</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        orders() {
            // Fetch real orders in background
            setTimeout(() => {
                if (window.State && State.fetchOrders) {
                    State.fetchOrders();
                }
            }, 0);

            const orders = State.get().orders || [];

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">My Orders</h1>

                    <div class="space-y-4">
                        ${State.get().fetchingOrders ? `
                            ${Array(3).fill(0).map(() => Components.SkeletonOrderCard()).join('')}
                        ` : (orders.length > 0 ? orders.map(order => Components.OrderCard(order)).join('') : '')}
                    </div>

                    ${(!State.get().fetchingOrders && orders.length === 0) ? Components.EmptyState('package', 'No Orders Yet', 'Start shopping to see your orders here', '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Browse Products</button>') : ''}
                </div>
            `;
        },

        wishlist() {
            const isLoading = State.isLoading();
            const wishlist = State.get().wishlist;
            window.currentProducts = wishlist;

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">My Wishlist (${wishlist.length} items)</h1>

                    ${State.get().fetchingWishlist ? `
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${Array(4).fill(0).map(() => Components.SkeletonProductCard()).join('')}
                        </div>
                    ` : (wishlist.length > 0 ? `
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${wishlist.map(product => Components.ProductCard(product)).join('')}
                        </div>
                    ` : Components.EmptyState('heart', 'Your Wishlist is Empty', 'Save products you love for later', '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Browse Products</button>'))}

                    <!-- Recommendations Section -->
                    ${Components.MoreToLoveSection(State.get().recommendedProducts || [])}
                </div>
            `;
        },

        profile() {
            setTimeout(() => {
                const user = Auth.getUserSession();
                const token = user?.token;

                // Profile Update Handler
                const profileForm = document.getElementById('profileForm');
                if (profileForm) {
                    profileForm.onsubmit = async (e) => {
                        e.preventDefault();
                        const formData = new FormData();
                        formData.append('id', user.id || user._id);
                        formData.append('name', document.getElementById('p-name').value);
                        formData.append('companyName', document.getElementById('p-company').value || '');
                        formData.append('phone', document.getElementById('p-phone').value);
                        // Address fields removed from here as they are now managed separately

                        const fileInput = document.getElementById('p-image');
                        if (fileInput.files[0]) {
                            formData.append('profileImage', fileInput.files[0]);
                        }

                        try {
                            const response = await fetch(window.apiUrl('/api/auth/profile'), {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: formData
                            });

                            const data = await response.json();
                            if (response.ok) {
                                Auth.setUserSession(data.role, data);
                                Components.showNotification('Profile updated successfully', 'success');
                                setTimeout(() => window.location.reload(), 1000);
                            } else {
                                Components.showNotification(data.message || 'Update failed', 'error');
                            }
                        } catch (error) {
                            Components.showNotification('Server Error', 'error');
                        }
                    }
                }

                // Image Preview Handler
                const imageInput = document.getElementById('p-image');
                if (imageInput) {
                    imageInput.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const previewImg = document.getElementById('profile-img-preview');
                                if (previewImg) previewImg.src = event.target.result;
                            };
                            reader.readAsDataURL(file);
                        }
                    };
                }

                // Password Change Handler with OTP
                const passwordForm = document.getElementById('passwordForm');
                const sendCodeBtn = document.getElementById('send-code-btn');

                if (sendCodeBtn) {
                    sendCodeBtn.onclick = async () => {
                        sendCodeBtn.disabled = true;
                        sendCodeBtn.innerText = "Sending...";
                        try {
                            const response = await fetch(window.apiUrl('/api/auth/profile/password-code'), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ id: user.id || user._id })
                            });
                            const data = await response.json();
                            if (response.ok) {
                                Components.showNotification('Verification code sent to your email', 'success');
                                document.getElementById('otp-section').classList.remove('hidden');
                                sendCodeBtn.innerText = "Resend Code";
                                sendCodeBtn.disabled = false;
                            } else {
                                Components.showNotification(data.message || 'Failed to send code', 'error');
                                sendCodeBtn.innerText = "Get Code";
                                sendCodeBtn.disabled = false;
                            }
                        } catch (err) {
                            Components.showNotification('Server Error', 'error');
                            sendCodeBtn.innerText = "Get Code";
                            sendCodeBtn.disabled = false;
                        }
                    }
                }

                if (passwordForm) {
                    passwordForm.onsubmit = async (e) => {
                        e.preventDefault();
                        const currentPassword = document.getElementById('pwd-current').value;
                        const newPassword = document.getElementById('pwd-new').value;
                        const confirmPassword = document.getElementById('pwd-confirm').value;
                        const code = document.getElementById('pwd-code').value;

                        if (newPassword !== confirmPassword) {
                            return Components.showNotification('Passwords do not match', 'error');
                        }

                        if (!code) {
                            return Components.showNotification('Please enter verification code', 'error');
                        }

                        try {
                            const response = await fetch(window.apiUrl('/api/auth/profile/password'), {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ id: user.id || user._id, currentPassword, newPassword, code })
                            });

                            const data = await response.json();
                            if (response.ok) {
                                Components.showNotification('Password updated successfully', 'success');
                                passwordForm.reset();
                                document.getElementById('otp-section').classList.add('hidden');
                            } else {
                                Components.showNotification(data.message || 'Update failed', 'error');
                            }
                        } catch (error) {
                            Components.showNotification('Server Error', 'error');
                        }
                    }
                }

                // Address Management Logic
                const loadAddresses = async () => {
                    try {
                        const response = await fetch(window.apiUrl('/api/addresses'), {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (response.ok) {
                            const addresses = await response.json();
                            window.profileAddresses = addresses; // Store globally
                            renderAddresses(addresses);
                        } else {
                            document.getElementById('address-list').innerHTML = '<div class="text-center py-4 text-red-500">Failed to load addresses</div>';
                        }
                    } catch (e) {
                        console.error(e);
                    }
                };

                window.renderAddresses = (addresses) => {
                    const list = document.getElementById('address-list');
                    if (!list) return;

                    if (addresses.length === 0) {
                        list.innerHTML = '<div class="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200"><p>No addresses found.</p><p class="text-sm mt-1">Add a new address to get started.</p></div>';
                        return;
                    }

                    list.innerHTML = addresses.map(addr => `
                        <div class="border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-blue-300 transition-all bg-white shadow-sm hover:shadow-md group">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="font-bold text-slate-800 flex items-center gap-2">
                                        <i data-lucide="${addr.type === 'Home' ? 'home' : addr.type === 'Work' ? 'briefcase' : 'map-pin'}" class="w-4 h-4 text-blue-500"></i>
                                        ${addr.type}
                                    </span>
                                    ${addr.is_default ? '<span class="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-200">Default</span>' : ''}
                                </div>
                                <p class="text-sm font-bold text-slate-700 mb-0.5">${addr.name}</p>
                                <p class="text-sm text-slate-500 mb-0.5">${addr.address_line1} ${addr.address_line2 ? ', ' + addr.address_line2 : ''}</p>
                                <p class="text-sm text-slate-500">${addr.city}, ${addr.state || ''} ${addr.postal_code || ''}, ${addr.country}</p>
                                <p class="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                    <i data-lucide="phone" class="w-3 h-3"></i> ${addr.phone}
                                </p>
                            </div>
                            <div class="flex sm:flex-col gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                <button onclick="window.editAddress('${addr.id}')" class="flex-1 sm:flex-none flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm font-bold">
                                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit
                                </button>
                                <button onclick="window.deleteAddress('${addr.id}')" class="flex-1 sm:flex-none flex items-center justify-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-bold">
                                    <i data-lucide="trash" class="w-4 h-4"></i> Delete
                                </button>
                            </div>
                        </div>
                    `).join('');
                    lucide.createIcons();
                };

                window.editAddress = (id) => {
                    const addr = window.profileAddresses?.find(a => a.id == id);
                    if (!addr) return;

                    document.getElementById('addr-id').value = addr.id;
                    document.getElementById('addr-type').value = addr.type;
                    document.getElementById('addr-name').value = addr.name;
                    document.getElementById('addr-phone').value = addr.phone;
                    document.getElementById('addr-line1').value = addr.address_line1;
                    document.getElementById('addr-line2').value = addr.address_line2 || '';
                    document.getElementById('addr-city').value = addr.city;
                    document.getElementById('addr-state').value = addr.state || '';
                    document.getElementById('addr-zip').value = addr.postal_code || '';
                    document.getElementById('addr-country').value = addr.country;
                    document.getElementById('addr-default').checked = addr.is_default;
                    document.getElementById('addressModal').classList.remove('hidden');
                };

                window.deleteAddress = async (id) => {
                    if (!(await Components.ConfirmAsync('Confirm Action', 'Are you sure you want to delete this address?'))) return;
                    try {
                        const res = await fetch(`/api/addresses/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            Components.showNotification('Address deleted', 'success');
                            loadAddresses();
                        } else {
                            Components.showNotification('Failed to delete address', 'error');
                        }
                    } catch (e) {
                        Components.showNotification('Server Error', 'error');
                    }
                };

                const addrForm = document.getElementById('addr-form');
                if (addrForm) {
                    addrForm.onsubmit = async (e) => {
                        e.preventDefault();
                        const id = document.getElementById('addr-id').value;
                        const data = {
                            type: document.getElementById('addr-type').value,
                            name: document.getElementById('addr-name').value,
                            phone: document.getElementById('addr-phone').value,
                            addressLine1: document.getElementById('addr-line1').value,
                            addressLine2: document.getElementById('addr-line2').value,
                            city: document.getElementById('addr-city').value,
                            state: document.getElementById('addr-state').value,
                            postalCode: document.getElementById('addr-zip').value,
                            country: document.getElementById('addr-country').value,
                            isDefault: document.getElementById('addr-default').checked
                        };

                        try {
                            const method = id ? 'PUT' : 'POST';
                            const url = id ? window.apiUrl(`/api/addresses/${id}`) : window.apiUrl('/api/addresses');

                            const res = await fetch(url, {
                                method: method,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(data)
                            });

                            if (res.ok) {
                                Components.showNotification(`Address ${id ? 'updated' : 'added'} successfully`, 'success');
                                document.getElementById('addressModal').classList.add('hidden');
                                loadAddresses();
                            } else {
                                Components.showNotification('Operation failed', 'error');
                            }
                        } catch (err) {
                            Components.showNotification('Server Error', 'error');
                        }
                    };
                }

                // Initial Load
                loadAddresses();
            }, 0);

            const user = Auth.getUserSession() || {};
            // Mock addresses for now until backend is connected fully to frontend for this list
            // We'll show the UI structure

            return `
                <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6">
                    <h1 class="text-3xl font-bold mb-8 text-slate-800">Profile Settings</h1>

                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
                        <!-- Sidebar / Image -->
                        <div class="md:col-span-1 space-y-6">
                            <div class="glass-card p-6 rounded-2xl text-center">
                                <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden relative group">
                                    <img loading="lazy" id="profile-img-preview" src="${user.profile_image || 'assets/default-avatar.png'}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${user.name}'">
                                    <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onclick="document.getElementById('p-image').click()">
                                        <i data-lucide="camera" class="w-6 h-6 text-white"></i>
                                    </div>
                                </div>
                                <h2 class="font-bold text-lg">${user.name}</h2>
                                <p class="text-xs text-slate-500 uppercase tracking-widest mb-4">${user.role}</p>
                            </div>
                        </div>

                        <!-- Forms -->
                        <div class="md:col-span-2 space-y-6">
                            <!-- Personal Info -->
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold text-lg mb-6 border-b pb-2">Personal Information</h3>
                                <form id="profileForm" class="space-y-4">
                                    <div>
                                        <label class="text-xs font-bold text-slate-600 ml-1">FULL NAME</label>
                                        <input type="text" id="p-name" value="${user.name || ''}" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                    </div>
                                    ${user.role === 'business' || user.role === 'supplier' ? `
                                        <div>
                                            <label class="text-xs font-bold text-slate-600 ml-1">COMPANY NAME</label>
                                            <input type="text" id="p-company" value="${user.companyName || user.company_name || ''}" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        </div>
                                    ` : `<input type="hidden" id="p-company">`}
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="text-xs font-bold text-slate-600 ml-1 flex items-center justify-between">
                                                EMAIL
                                                ${!user.is_verified ? '<span class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase flex items-center gap-1"><i data-lucide="alert-circle" class="w-3 h-3"></i> Unverified</span>' : '<span class="px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-[10px] font-black uppercase flex items-center gap-1"><i data-lucide="check-circle-2" class="w-3 h-3"></i> Verified</span>'}
                                            </label>
                                            <input type="email" value="${user.email}" disabled class="w-full p-3 rounded-xl border bg-slate-100 text-slate-500 cursor-not-allowed">
                                        </div>
                                        <div>
                                            <label class="text-xs font-bold text-slate-600 ml-1">PHONE</label>
                                            <input type="tel" id="p-phone" value="${user.phone || ''}" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        </div>
                                    </div>
                                    
                                    <input type="file" id="p-image" class="hidden" accept="image/*">
                                    <div class="pt-4 flex justify-end">
                                        <button type="submit" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Save Changes</button>
                                    </div>
                                </form>
                            </div>

                            <!-- Address Management -->
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-center justify-between mb-6 border-b pb-2">
                                     <h3 class="font-bold text-lg">My Addresses</h3>
                                     <button onclick="document.getElementById('addressModal').classList.remove('hidden'); document.getElementById('addr-form').reset(); document.getElementById('addr-id').value='';" class="text-blue-600 text-sm font-bold hover:underline">+ Add New</button>
                                </div>
                                
                                <div id="address-list" class="space-y-4">
                                    <div class="text-center py-8 text-slate-500">Loading addresses...</div>
                                </div>
                            </div>

                            <!-- Address Modal -->
                            <div id="addressModal" class="fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                                <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-up">
                                    <button type="button" onclick="document.getElementById('addressModal').classList.add('hidden')" class="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-100">
                                        <i data-lucide="x" class="w-6 h-6"></i>
                                    </button>
                                    
                                    <h3 class="font-bold text-xl mb-6 flex items-center gap-2 text-slate-800">
                                        <i data-lucide="map-pin" class="w-5 h-5 text-blue-600"></i>
                                        Manage Address
                                    </h3>

                                    <form id="addr-form" class="space-y-4">
                                        <input type="hidden" id="addr-id">
                                        <div>
                                            <label class="text-xs font-bold text-slate-600 ml-1 mb-1 block">ADDRESS TYPE</label>
                                            <div class="relative">
                                                <select id="addr-type" class="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer">
                                                    <option value="Home">Home</option>
                                                    <option value="Work">Work</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <i data-lucide="chevron-down" class="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none"></i>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label class="text-xs font-bold text-slate-600 ml-1 mb-1 block">FULL NAME</label>
                                                <input type="text" id="addr-name" required class="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all">
                                            </div>
                                            <div>
                                                <label class="text-xs font-bold text-slate-600 ml-1 mb-1 block">PHONE</label>
                                                <input type="tel" id="addr-phone" required class="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="text-xs font-bold text-slate-600 ml-1 mb-1 block">ADDRESS LINE 1</label>
                                            <input type="text" id="addr-line1" required class="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all">
                                        </div>
                                        <div>
                                            <label class="text-xs font-bold text-slate-600 ml-1 mb-1 block">ADDRESS LINE 2 (Optional)</label>
                                            <input type="text" id="addr-line2" class="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all">
                                        </div>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label class="text-xs font-bold text-slate-600 ml-1 mb-1 block">CITY</label>
                                                <input type="text" id="addr-city" required class="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all">
                                            </div>
                                            <div>
                                                <label class="text-xs font-bold text-slate-600 ml-1 mb-1 block">STATE</label>
                                                <input type="text" id="addr-state" class="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all">
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label class="text-xs font-bold text-slate-600 ml-1 mb-1 block">ZIP CODE</label>
                                                <input type="text" id="addr-zip" class="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all">
                                            </div>
                                            <div>
                                                <label class="text-xs font-bold text-slate-600 ml-1 mb-1 block">COUNTRY</label>
                                                <input type="text" id="addr-country" required class="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all">
                                            </div>
                                        </div>
                                        <label class="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                                            <input type="checkbox" id="addr-default" class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300">
                                            <span class="text-sm font-bold text-slate-700">Set as default address</span>
                                        </label>
                                        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t mt-4">
                                            <button type="button" onclick="document.getElementById('addressModal').classList.add('hidden')" class="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                                            <button type="submit" class="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                                                <i data-lucide="check" class="w-4 h-4"></i>
                                                Save Address
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <!-- Change Password -->
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold text-lg mb-6 border-b pb-2">Security</h3>
                                <form id="passwordForm" class="space-y-4">
                                    <div class="relative">
                                        <label class="text-xs font-bold text-slate-600 ml-1">CURRENT PASSWORD</label>
                                        <div class="relative">
                                            <input type="password" id="pwd-current" required class="w-full p-3 pr-12 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                            <button type="button" onclick="Components.togglePasswordVisibility('pwd-current', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                                <i data-lucide="eye" class="w-5 h-5"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p class="text-sm text-blue-800 mb-2 font-bold">Verification Required</p>
                                        <p class="text-xs text-slate-600 mb-3">To change your password, we'll send a code to your email address.</p>
                                        <div class="flex gap-2">
                                            <button type="button" id="send-code-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Get Code</button>
                                        </div>
                                        <div id="otp-section" class="hidden mt-3">
                                            <label class="text-xs font-bold text-slate-600 ml-1">ENTER CODE</label>
                                            <input type="text" id="pwd-code" placeholder="000000" class="w-full p-3 rounded-xl border bg-white outline-none focus:border-blue-500 tracking-widest font-bold text-center">
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="relative">
                                            <label class="text-xs font-bold text-slate-600 ml-1">NEW PASSWORD</label>
                                            <div class="relative">
                                                <input type="password" id="pwd-new" required class="w-full p-3 pr-12 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                                <button type="button" onclick="Components.togglePasswordVisibility('pwd-new', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                                    <i data-lucide="eye" class="w-5 h-5"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="relative">
                                            <label class="text-xs font-bold text-slate-600 ml-1">CONFIRM PASSWORD</label>
                                            <div class="relative">
                                                <input type="password" id="pwd-confirm" required class="w-full p-3 pr-12 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                                <button type="button" onclick="Components.togglePasswordVisibility('pwd-confirm', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                                    <i data-lucide="eye" class="w-5 h-5"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="pt-4 flex justify-end">
                                        <button type="submit" class="border-2 border-slate-200 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">Update Password</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        changePage(page) {
            Router.navigate(`/products?page=${page}`);
        },

        supplierDetail(supplierId) {
            const supplier = (State.getSuppliers() || []).find(s => s.id === parseInt(supplierId));
            if (!supplier) return Components.EmptyState('building', 'Supplier Not Found', 'This supplier does not exist');

            const supplierProducts = State.getProducts().filter(p => p.supplierId === supplier.id);
            window.currentProducts = supplierProducts;

            return `
                <div class="max-w-7xl mx-auto">
                    ${Components.Breadcrumbs([
                { label: 'Home', link: '/' },
                { label: 'Suppliers', link: '/business/suppliers' },
                { label: supplier.name }
            ])}

                    <!-- Supplier Header -->
                    <div class="glass-card p-8 rounded-2xl mb-8">
                        <div class="flex flex-col md:flex-row gap-6 items-start">
                            <img onerror="this.src='/assets/placeholder.png'; this.onerror=null;" loading="lazy" src="${supplier.logo}" alt="${supplier.name}" class="w-24 h-24 rounded-xl shadow-lg">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h1 class="text-3xl font-bold">${supplier.name}</h1>
                                    ${supplier.verified ? '<i data-lucide="badge-check" class="w-6 h-6 text-blue-600"></i>' : ''}
                                </div>
                                <div class="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                    <div class="flex items-center gap-1">
                                        <i data-lucide="map-pin" class="w-4 h-4"></i>
                                        <span>${supplier.location}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <i data-lucide="star" class="w-4 h-4 text-orange-400 fill-orange-400"></i>
                                        <span class="font-bold">${supplier.rating}</span>
                                        <span class="text-slate-400">(${supplier.reviews} reviews)</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <i data-lucide="clock" class="w-4 h-4"></i>
                                        <span>Responds in ${supplier.responseTime}</span>
                                    </div>
                                </div>
                                <div class="flex flex-wrap gap-2 mb-4">
                                    ${(supplier.categories || []).map(cat => `
                                        <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">${cat}</span>
                                    `).join('')}
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    ${(supplier.certifications || []).map(cert => `
                                        <span class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold flex items-center gap-1">
                                            <i data-lucide="shield-check" class="w-3 h-3"></i>${cert}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-slate-500 uppercase font-bold mb-1">Min. Order</p>
                                <p class="text-2xl font-bold text-blue-600">${supplier.minOrder}</p>
                                <button onclick="Router.navigate('/contact')" class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                    Contact Supplier
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Supplier Products -->
                    <div>
                        <h2 class="text-2xl font-bold mb-6">Products from ${supplier.name} (${supplierProducts.length})</h2>
                        ${supplierProducts.length > 0 ? `
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                ${supplierProducts.map(product => Components.ProductCard(product)).join('')}
                            </div>
                        ` : Components.EmptyState('package', 'No Products', 'This supplier has no products listed yet')}
                    </div>
                </div>
            `;
        }
}

