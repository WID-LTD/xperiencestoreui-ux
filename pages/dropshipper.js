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
export const dropshipper = {
        home() {
            const stats = State.getDropshipperStats() || { total_products: 0, active_orders: 0, total_revenue: 0, avg_profit: '35%' };
            const orders = State.getDropshipperOrders();
            const products = (State.get().dropshipperProducts || []).slice(0, 4);
            const user = State.get().user || State.get();
            const balance = State.getDropshipperWallet()?.wallets?.[0]?.balance || user.wallet_balance || 0;

            return `
                <div class="space-y-10">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-green-600 to-teal-600 rounded-[2rem] p-12 text-white flex flex-col md:flex-row justify-between items-center">
                        <div class="max-w-lg mb-6 md:mb-0">
                            <h1 class="text-5xl font-bold mb-4">Dropship & Earn</h1>
                            <p class="mb-6 opacity-90 text-lg">Build your online store without inventory. Source products and sell with zero upfront costs.</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/dropshipper/storefront')" class="bg-white text-green-600 px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all">Manage Store</button>
                                <button onclick="Router.navigate('/dropshipper/catalog')" class="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all">Source Products</button>
                            </div>
                        </div>
                        <img loading="lazy" src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400" class="h-64 rounded-2xl shadow-2xl">
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        ${Components.StatCard('Store Products', (stats.total_products || 0).toString(), 'package', 'green')}
                        ${Components.StatCard('Active Orders', (stats.active_orders || 0).toString(), 'shopping-bag', 'blue')}
                        ${Components.StatCard('Avg Profit', stats.avg_profit || '35%', 'trending-up', 'orange')}
                        ${Components.StatCard('Balance', State.formatCurrency(balance), 'dollar-sign', 'purple')}
                    </div>

                    <!-- Store Performance -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
                                Sales Performance
                            </h3>
                            <div class="space-y-4">
                                ${stats.sales_history && stats.sales_history.length > 0 ? stats.sales_history.map(item => {
                const max = Math.max(...stats.sales_history.map(s => s.revenue || 1));
                const percentage = ((item.revenue / max) * 100).toFixed(0);
                return `
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="text-xs font-bold text-slate-500">${item.month || item.day}</span>
                                                <span class="text-sm font-bold text-slate-800">₦${Number(item.revenue).toLocaleString()}</span>
                                            </div>
                                            <div class="w-full bg-slate-100 rounded-full h-2">
                                                <div class="bg-green-500 h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
                                            </div>
                                        </div>
                                    `;
            }).join('') : `
                                    <div class="text-center py-8 text-slate-400">
                                        <p class="text-sm italic">No sales data available for this week</p>
                                    </div>
                                `}
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="star" class="w-5 h-5 text-orange-600"></i>
                                Top Selling Products
                            </h3>
                            <div class="space-y-3">
                                ${products.slice(0, 4).map((product, i) => `
                                    <div class="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl transition-all">
                                        <img loading="lazy" src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-12 h-12 rounded-lg object-cover shadow-sm" alt="${product.name}">
                                        <div class="flex-1">
                                            <p class="font-bold text-sm line-clamp-1">${product.name}</p>
                                            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">${product.category}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-sm font-bold text-blue-600">₦${Number(product.price).toLocaleString()}</p>
                                            <p class="text-[10px] text-slate-400">${product.sales || 0} sold</p>
                                        </div>
                                    </div>
                                `).join('')}
                                ${products.length === 0 ? '<div class="text-center py-8 text-slate-400 italic text-sm">No products in your store yet</div>' : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Recent Orders -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Recent Orders</h2>
                            <a href="#/dropshipper/orders" class="text-blue-600 font-bold hover:underline">View All →</a>
                        </div>
                        <div class="space-y-3">
                            ${orders.length > 0 ? orders.slice(0, 5).map(order => Components.OrderCard(order)).join('') : '<div class="glass-card p-8 text-center text-slate-400">No recent orders.</div>'}
                        </div>
                    </div>

                    <!-- Dropshipper Features -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="package-x" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Zero Inventory</h3>
                            <p class="text-sm text-slate-500">No upfront costs or storage</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="zap" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Auto Fulfillment</h3>
                            <p class="text-sm text-slate-500">Orders shipped directly</p>
                        </div>
                        <div onclick="Router.navigate('/dropshipper/api-management')" class="glass-card p-6 rounded-2xl text-center cursor-pointer hover:border-blue-500 transition-all group">
                            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <i data-lucide="code" class="w-8 h-8 text-indigo-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">API Management</h3>
                            <p class="text-sm text-slate-500">Connect external apps</p>
                        </div>
                    </div>
                </div>
            `;
        },

        storefront() {
            const state = State.get();
            const store = state.dropshipperStore || { store_name: 'My Store', store_slug: 'mystore', description: '' };
            const storeProducts = state.dropshipperProducts || [];

            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">Storefront Management</h1>
                            <p class="text-slate-600">Manage your online store and products</p>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="window.open('#/dropshipper/store/mystore', '_blank')" class="border-2 border-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                <i data-lucide="eye" class="w-5 h-5 inline mr-2"></i>
                                View Store
                            </button>
                            <button onclick="Router.navigate('/dropshipper/catalog')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
                                Add Products
                            </button>
                        </div>
                    </div>

                    <!-- Store Settings & API -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div class="lg:col-span-2 space-y-8">
                            <!-- Store Info -->
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Store Information</h3>
                                <form onsubmit="event.preventDefault(); window.updateStoreSettings(this);" class="space-y-4">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="text-xs font-bold text-slate-600 ml-1">STORE NAME</label>
                                            <input type="text" name="store_name" value="${store.store_name}" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        </div>
                                        <div>
                                            <label class="text-xs font-bold text-slate-600 ml-1">STORE URL SLUG</label>
                                            <input type="text" name="store_slug" value="${store.store_slug}" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        </div>
                                        <div class="col-span-2">
                                            <label class="text-xs font-bold text-slate-600 ml-1">WHATSAPP CONTACT</label>
                                            <input type="text" name="whatsapp_contact" value="${store.whatsapp_contact || ''}" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" placeholder="+1234567890">
                                        </div>
                                        <div class="col-span-2">
                                            <label class="text-xs font-bold text-slate-600 ml-1">DESCRIPTION</label>
                                            <textarea name="description" rows="2" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">${store.description || ''}</textarea>
                                        </div>
                                    </div>
                                    <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                        Save Changes
                                    </button>
                                </form>
                                <script>
                                    window.updateStoreSettings = async (form) => {
                                        const formData = new FormData(form);
                                        const data = Object.fromEntries(formData.entries());
                                        const btn = form.querySelector('button[type="submit"]');
                                        const originalText = btn.innerHTML;
                                        try {
                                            btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto"></i>';
                                            btn.disabled = true;
                                            await State.updateStoreSettings(data);
                                            window.showToast('Store settings updated!', 'success');
                                        } catch (e) {
                                            window.showToast('Failed to update store settings', 'error');
                                        } finally {
                                            btn.innerHTML = originalText;
                                            btn.disabled = false;
                                            if (window.lucide) window.lucide.createIcons();
                                        }
                                    };
                                </script>
                            </div>

                            <!-- API Dashboard Section -->
                            <div class="glass-card p-6 rounded-2xl border-l-4 border-blue-600">
                                <div class="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 class="font-bold text-xl">API & Developer Dashboard</h3>
                                        <p class="text-slate-500 text-sm">Real-time API access and webhook monitoring</p>
                                    </div>
                                    <button onclick="Router.navigate('/dropshipper/api-management')" class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all">
                                        Configure API
                                    </button>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Active API Key</p>
                                        <div class="flex items-center gap-2">
                                            <code class="text-xs font-mono bg-white px-2 py-1 rounded border overflow-hidden whitespace-nowrap text-ellipsis flex-1">xp_live_************************</code>
                                            <button class="text-blue-600 hover:text-blue-700"><i data-lucide="copy" class="w-4 h-4"></i></button>
                                        </div>
                                    </div>
                                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">API Requests (24h)</p>
                                        <div class="flex items-center justify-between">
                                            <span class="text-xl font-bold">1,248</span>
                                            <span class="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">99.9% Success</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg text-xs">
                                        <div class="flex items-center gap-2">
                                            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            <span class="font-bold">Webhook Listener:</span>
                                            <span class="text-slate-500">https://yourstore.com/api/webhooks</span>
                                        </div>
                                        <span class="text-blue-600 font-bold">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Management Tools -->
                        <div class="glass-card p-6 rounded-2xl h-fit sticky top-8">
                            <h3 class="font-bold mb-4">Management Tools</h3>
                            <div class="space-y-3">
                                <button onclick="Router.navigate('/dropshipper/api-management')" class="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-blue-50 transition-all group">
                                    <div class="flex items-center gap-3">
                                        <i data-lucide="code" class="w-5 h-5 text-blue-600"></i>
                                        <span class="font-bold text-sm">API Settings</span>
                                    </div>
                                    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                                <button onclick="Router.navigate('/dropshipper/social')" class="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-purple-50 transition-all group">
                                    <div class="flex items-center gap-3">
                                        <i data-lucide="share-2" class="w-5 h-5 text-purple-600"></i>
                                        <span class="font-bold text-sm">Social Commerce</span>
                                    </div>
                                    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                                <button onclick="Router.navigate('/dropshipper/finance')" class="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-green-50 transition-all group">
                                    <div class="flex items-center gap-3">
                                        <i data-lucide="wallet" class="w-5 h-5 text-green-600"></i>
                                        <span class="font-bold text-sm">Finance & Payouts</span>
                                    </div>
                                    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Products in Store -->
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold mb-1">Store Products (${storeProducts.length})</h2>
                        <p class="text-slate-600 text-sm">Products currently listed in your store</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${storeProducts.map(product => `
                            <div class="glass-card rounded-2xl overflow-hidden group">
                                <div class="relative">
                                    <img loading="lazy" src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'" alt="${product.name}" class="h-48 w-full object-cover">
                                    <div class="absolute top-2 right-2 flex gap-2">
                                        <button class="bg-white p-2 rounded-lg shadow hover:bg-red-50 transition-all">
                                            <i data-lucide="trash-2" class="w-4 h-4 text-red-600"></i>
                                        </button>
                                        <button class="bg-white p-2 rounded-lg shadow hover:bg-blue-50 transition-all">
                                            <i data-lucide="edit" class="w-4 h-4 text-blue-600"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="p-4">
                                    <h3 class="font-bold mb-2">${product.name}</h3>
                                    <div class="flex justify-between items-center mb-3">
                                        <div>
                                            <p class="text-xs text-slate-500">Cost</p>
                                            <p class="font-bold text-sm">$${(Number(product.price) || 0).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-500">Your Price</p>
                                            <p class="font-bold text-green-600">${State.formatCurrency(Number(product.price) * 1.35)}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-500">Profit</p>
                                            <p class="font-bold text-blue-600">${State.formatCurrency(Number(product.price) * 0.35)}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between text-xs text-slate-500">
                                        <span>Stock: ${product.stock}</span>
                                        <span class="text-green-600 font-bold">35% margin</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        publicStore(slug) {
            if (slug) localStorage.setItem('active_storefront', slug);
            
            const state = State.get();
            const store = state.dropshipperStore || { store_name: 'My Store', store_slug: slug || 'mystore', description: '' };
            const products = state.dropshipperProducts || [];
            window.currentProducts = products;

            return `
                <div class="max-w-7xl mx-auto">
                    <!-- Store Header -->
                    <div class="glass-card p-8 rounded-2xl mb-8 bg-gradient-to-r from-green-600 to-teal-600 text-white text-center">
                        <h1 class="text-4xl font-bold mb-2">${store.store_name}</h1>
                        <p class="opacity-90 mb-4">Your one-stop shop for amazing products</p>
                        <div class="flex items-center justify-center gap-6 text-sm">
                            <span><i data-lucide="package" class="w-4 h-4 inline mr-1"></i>${products.length}+ Products</span>
                            <span><i data-lucide="star" class="w-4 h-4 inline mr-1"></i>4.8 Rating</span>
                            <span><i data-lucide="truck" class="w-4 h-4 inline mr-1"></i>Free Shipping</span>
                        </div>
                    </div>

                    <!-- Categories -->
                    <div class="mb-8">
                        <h2 class="text-2xl font-bold mb-4">Shop by Category</h2>
                        <div class="flex gap-3 overflow-x-auto pb-2">
                            ${(Data.categories || []).map(cat => `
                                <button class="glass-card px-6 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-blue-50 transition-all">
                                    ${cat.name || cat}
                                </button>
                            `).join('')}
                            ${(!Data.categories || Data.categories.length === 0) ? '<p class="text-slate-400 text-sm italic">No categories available</p>' : ''}
                        </div>
                    </div>

                    <!-- Products -->
                    <div>
                        <h2 class="text-2xl font-bold mb-6">Featured Products</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${products.map(product => Components.ProductCard({
                ...product,
                price: product.price * 1.35 // Dropshipper markup (TODO: Make dynamic)
            })).join('')}
                        </div>
                    </div>

                    <!-- Store Footer -->
                    <div class="glass-card p-8 rounded-2xl mt-12 text-center">
                        <h3 class="text-xl font-bold mb-4">Why Shop With Us?</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div>
                                <i data-lucide="shield-check" class="w-12 h-12 mx-auto mb-3 text-blue-600"></i>
                                <p class="font-bold">Secure Checkout</p>
                            </div>
                            <div>
                                <i data-lucide="truck" class="w-12 h-12 mx-auto mb-3 text-green-600"></i>
                                <p class="font-bold">Fast Delivery</p>
                            </div>
                            <div>
                                <i data-lucide="headphones" class="w-12 h-12 mx-auto mb-3 text-orange-600"></i>
                                <p class="font-bold">24/7 Support</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        catalog() {
            const isLoading = State.isLoading();
            const products = State.getProducts();
            window.currentProducts = products;

            return `
                <div>
                    ${Components.Breadcrumbs([
                { label: 'Home', link: '/' },
                { label: 'Product Sourcing' }
            ])}

                    <div class="flex flex-col md:flex-row gap-8">
                        <!-- Filters -->
                        <aside class="w-full md:w-64 space-y-6">
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Profit Margin</h3>
                                <div class="space-y-2 text-sm">
                                    ${['20%+', '30%+', '40%+', '50%+'].map(margin => `
                                        <label class="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" class="rounded">
                                            <span>${margin}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Shipping Cost</h3>
                                <div class="space-y-2 text-sm">
                                    ${['Free', 'Under $5', 'Under $10', 'Any'].map(cost => `
                                        <label class="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="shipping" class="rounded">
                                            <span>${cost}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">In My Store</h3>
                                <div class="space-y-2 text-sm">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" class="rounded">
                                        <span>Hide added products</span>
                                    </label>
                                </div>
                            </div>
                        </aside>

                        <!-- Product Grid -->
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-6">
                                <p class="text-sm text-slate-500">${products.length} products available to dropship</p>
                                <select class="bg-transparent border rounded-lg px-4 py-2 text-sm font-bold outline-none">
                                    <option>Sort by: Best Margin</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Most Popular</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${isLoading ? Array(9).fill(Components.SkeletonProductCard()).join('') : products.map(product => {
                const cost = product.price;
                const suggestedPrice = cost * 1.35; // (TODO: Fetch markup from settings)
                const profit = suggestedPrice - cost;
                const margin = ((profit / suggestedPrice) * 100).toFixed(0);

                return `
                                        <div class="glass-card rounded-2xl overflow-hidden">
                                            <img loading="lazy" src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'" alt="${product.name}" class="h-48 w-full object-cover">
                                            <div class="p-4">
                                                <h3 class="font-bold mb-2 line-clamp-2">${product.name}</h3>
                                                <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                    <div>
                                                        <p class="text-xs text-slate-500">Your Cost</p>
                                                        <p class="font-bold">$${(Number(cost) || 0).toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-xs text-slate-500">Suggested Price</p>
                                                        <p class="font-bold text-green-600">$${(Number(suggestedPrice) || 0).toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-xs text-slate-500">Profit</p>
                                                        <p class="font-bold text-blue-600">$${(Number(profit) || 0).toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-xs text-slate-500">Margin</p>
                                                        <p class="font-bold text-orange-600">${margin}%</p>
                                                    </div>
                                                </div>
                                                <button onclick="Router.navigate('/dropshipper/profit-calculator?product=${product.id}')" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all mb-2">
                                                    <i data-lucide="calculator" class="w-4 h-4 inline mr-2"></i>
                                                    Calculate Profit
                                                </button>
                                                <button onclick="event.stopPropagation(); State.addToStore(${product.id})" class="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all">
                                                    <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                                                    Add to Store
                                                </button>
                                            </div>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        profitCalculator(params = {}) {
            const productId = params.product || 1;
            const product = (Data.products || []).find(p => p.id === parseInt(productId)) || (Data.products && Data.products[0]) || { id: 0, name: 'Product', description: '', stock: 0 };

            return `
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Profit Calculator</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Product Info -->
                        <div class="glass-card p-6 rounded-2xl">
                            <img loading="lazy" src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'" class="w-full h-48 object-cover rounded-xl mb-4" alt="${product.name}">
                            <h2 class="text-xl font-bold mb-2">${product.name}</h2>
                            <p class="text-sm text-slate-600 mb-4">${product.description}</p>
                            <div class="flex items-center gap-2">
                                <span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">In Stock</span>
                                <span class="text-sm text-slate-500">Available: ${product.stock}</span>
                            </div>
                        </div>

                        <!-- Calculator -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4">Pricing Calculator</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">PRODUCT COST</label>
                                    <input type="number" id="costPrice" value="${(Number(product.price) || 0).toFixed(2)}" step="0.01" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" oninput="updateProfitCalc()">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">SHIPPING COST</label>
                                    <input type="number" id="shippingCost" value="5.00" step="0.01" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" oninput="updateProfitCalc()">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">YOUR SELLING PRICE</label>
                                    <input type="number" id="sellingPrice" value="${((Number(product.price) || 0) * 1.35).toFixed(2)}" step="0.01" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" oninput="updateProfitCalc()">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">QUANTITY</label>
                                    <input type="number" id="quantity" value="1" min="1" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" oninput="updateProfitCalc()">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Results -->
                    <div class="glass-card p-8 rounded-2xl mt-8 bg-gradient-to-r from-green-50 to-blue-50">
                        <h3 class="text-xl font-bold mb-6 text-center">Profit Analysis</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div class="text-center">
                                <p class="text-sm text-slate-600 mb-1">Total Cost</p>
                                <p id="totalCost" class="text-2xl font-bold text-slate-800">$${(product.price + 5).toFixed(2)}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-sm text-slate-600 mb-1">Revenue</p>
                                <p id="revenue" class="text-2xl font-bold text-blue-600">${State.formatCurrency(product.price * 1.35, 'USD')}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-sm text-slate-600 mb-1">Profit per Unit</p>
                                <p id="profitPerUnit" class="text-2xl font-bold text-green-600">${State.formatCurrency(product.price * 0.35 - 5, 'USD')}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-sm text-slate-600 mb-1">Profit Margin</p>
                                <p id="profitMargin" class="text-2xl font-bold text-orange-600">26%</p>
                            </div>
                        </div>

                        <div class="mt-6 pt-6 border-t text-center">
                            <p class="text-sm text-slate-600 mb-2">Total Profit (Quantity × Profit per Unit)</p>
                            <p id="totalProfit" class="text-4xl font-bold text-green-600">${State.formatCurrency(product.price * 0.35 - 5, 'USD')}</p>
                        </div>
                    </div>

                    <script>
                        function updateProfitCalc() {
                            const cost = parseFloat(document.getElementById('costPrice').value) || 0;
                            const shipping = parseFloat(document.getElementById('shippingCost').value) || 0;
                            const selling = parseFloat(document.getElementById('sellingPrice').value) || 0;
                            const qty = parseInt(document.getElementById('quantity').value) || 1;
                            
                            const totalCost = cost + shipping;
                            const revenue = selling;
                            const profitPerUnit = selling - totalCost;
                            const margin = totalCost > 0 ? ((profitPerUnit / selling) * 100).toFixed(0) : 0;
                            const totalProfit = profitPerUnit * qty;
                            
                            document.getElementById('totalCost').textContent = '$' + (Number(totalCost) || 0).toFixed(2);
                            document.getElementById('revenue').textContent = '$' + (Number(revenue) || 0).toFixed(2);
                            document.getElementById('profitPerUnit').textContent = '$' + (Number(profitPerUnit) || 0).toFixed(2);
                            document.getElementById('profitMargin').textContent = margin + '%';
                            document.getElementById('totalProfit').textContent = '$' + (Number(totalProfit) || 0).toFixed(2);
                        }
                    </script>

                    <div class="flex gap-4 mt-8">
                        <button onclick="State.addToStore(${product.id})" class="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
                            Add to Store with This Pricing
                        </button>
                        <button onclick="Router.navigate('/dropshipper/catalog')" class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                            Back to Catalog
                        </button>
                    </div>
                </div>
            `;
        },

        analytics() {
            const stats = State.get().dropshipperStats || { total_sales: 0, total_orders: 0, conversion: 0, avg_order: 0, total_products: 0, total_revenue: 0 };

            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Store Analytics</h1>

                    <!-- Summary Stats -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        ${Components.StatCard('Total Revenue', '₦' + (Number(stats.total_revenue || 0)).toLocaleString(), 'dollar-sign', 'green', 12)}
                        ${Components.StatCard('Orders', stats.total_orders || 0, 'shopping-bag', 'blue', 5)}
                        ${Components.StatCard('Total Profit', '₦' + (Number(stats.total_profit || 0)).toLocaleString(), 'trending-up', 'orange', 8)}
                        ${Components.StatCard('Store Products', stats.total_products || 0, 'package', 'purple')}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Revenue Chart -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Revenue Over Time</h3>
                            <div class="space-y-4">
                                ${stats.sales_history && stats.sales_history.length > 0 ? stats.sales_history.map(item => {
                const max = Math.max(...stats.sales_history.map(s => s.revenue || 1));
                const percentage = ((item.revenue / max) * 100).toFixed(0);
                return `
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="text-sm font-bold">${item.month || item.day}</span>
                                                <span class="text-sm font-bold text-green-600">₦${Number(item.revenue).toLocaleString()}</span>
                                            </div>
                                            <div class="w-full bg-slate-200 rounded-full h-3">
                                                <div class="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all" style="width: ${percentage}%"></div>
                                            </div>
                                        </div>
                                    `;
            }).join('') : `
                                    <div class="text-center py-12 text-slate-400">
                                        <i data-lucide="bar-chart" class="w-12 h-12 mx-auto mb-3 opacity-20"></i>
                                        <p>No sales history available yet.</p>
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- Traffic Sources -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Traffic Sources</h3>
                            <div class="space-y-4">
                                ${[
                    { source: 'Direct', visitors: 1245, color: 'blue', percentage: 45 },
                    { source: 'Social Media', visitors: 892, color: 'purple', percentage: 32 },
                    { source: 'Search', visitors: 445, color: 'green', percentage: 16 },
                    { source: 'Referral', visitors: 198, color: 'orange', percentage: 7 }
                ].map(item => `
                                    <div>
                                        <div class="flex items-center justify-between mb-2">
                                            <div class="flex items-center gap-2">
                                                <div class="w-3 h-3 bg-${item.color}-500 rounded-full"></div>
                                                <span class="font-bold">${item.source}</span>
                                            </div>
                                            <span class="text-sm text-slate-600">${item.visitors} visits</span>
                                        </div>
                                        <div class="w-full bg-slate-200 rounded-full h-2">
                                            <div class="bg-${item.color}-500 h-2 rounded-full" style="width: ${item.percentage}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Top Products -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Best Selling Products</h3>
                            <div class="space-y-3">
                                ${(State.get().dropshipperProducts || []).slice(0, 5).map((product, i) => `
                                    <div class="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all">
                                        <span class="text-2xl font-bold text-slate-300">${i + 1}</span>
                                        <img loading="lazy" src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-12 h-12 rounded-lg object-cover" alt="${product.name}">
                                        <div class="flex-1">
                                            <p class="font-bold text-sm">${product.name}</p>
                                            <p class="text-xs text-slate-500">${15 + i * 3} sales</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold text-green-600">$${(product.price * (15 + i * 3) * 1.35).toFixed(0)}</p>
                                            <p class="text-xs text-slate-500">revenue</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Recent Activity</h3>
                            <div class="space-y-3">
                                ${[
                    { icon: 'shopping-bag', color: 'blue', text: 'New order received', time: '5 min ago' },
                    { icon: 'eye', color: 'green', text: 'Product viewed 12 times', time: '1 hour ago' },
                    { icon: 'heart', color: 'red', text: 'Product added to wishlist', time: '2 hours ago' },
                    { icon: 'share-2', color: 'purple', text: 'Store shared on social', time: '5 hours ago' },
                    { icon: 'star', color: 'orange', text: 'New 5-star review', time: '1 day ago' }
                ].map(activity => `
                                    <div class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all">
                                        <div class="w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center">
                                            <i data-lucide="${activity.icon}" class="w-5 h-5 text-${activity.color}-600"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="font-bold text-sm">${activity.text}</p>
                                            <p class="text-xs text-slate-500">${activity.time}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        finance() {
            const walletData = State.get().dropshipperWallet || { wallets: [], transactions: [] };
            const primaryWallet = (walletData.wallets || []).find(w => w.currency === 'NGN') || { balance: 0, currency: 'NGN' };

            // Helper to render bank account info
            const renderBankInfo = () => {
                const bank = State.get().bankAccount;
                if (!bank) {
                    return `
                        <div class="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                            <p class="text-slate-400 font-bold mb-4">No bank account linked</p>
                            <button onclick="window.openBankModal()" class="text-blue-600 font-black text-sm uppercase tracking-widest hover:underline">+ Link Bank Account</button>
                        </div>
                    `;
                }
                return `
                    <div class="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 flex justify-between items-center">
                        <div>
                            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">${bank.bank_name}</p>
                            <p class="font-black text-slate-800 text-lg">${bank.account_number}</p>
                            <p class="text-sm font-bold text-slate-500">${bank.account_name}</p>
                        </div>
                        <button onclick="window.openBankModal()" class="p-3 bg-white shadow-sm rounded-xl hover:bg-slate-100 transition-all">
                            <i data-lucide="edit-3" class="w-5 h-5 text-slate-600"></i>
                        </button>
                    </div>
                `;
            };

            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 class="text-4xl font-black text-slate-900 mb-2">Wallet & Finance</h1>
                            <p class="text-slate-500 font-medium text-lg">Manage your storefront earnings and payouts</p>
                        </div>
                        <div class="flex gap-4">
                            <button onclick="window.openPayoutModal()" class="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-teal-200 hover:bg-teal-700 hover:-translate-y-1 transition-all flex items-center gap-2">
                                <i data-lucide="arrow-up-right" class="w-5 h-5"></i> Request Payout
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        <!-- Balance Card -->
                        <div class="lg:col-span-1 glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-teal-600 to-emerald-700 text-white relative overflow-hidden shadow-2xl shadow-teal-200">
                            <i data-lucide="wallet" class="absolute -right-4 -bottom-4 w-48 h-48 opacity-10 rotate-12"></i>
                            <p class="text-teal-100 font-bold uppercase tracking-wider text-sm mb-4">Available Balance</p>
                            <h2 class="text-5xl font-black mb-8">₦${Number(primaryWallet.balance).toLocaleString()}</h2>
                            <div class="flex items-center gap-4 text-sm font-bold">
                                <span class="bg-white/20 px-4 py-2 rounded-full flex items-center gap-1">
                                    <i data-lucide="check-circle" class="w-4 h-4 text-teal-300"></i> Verified Seller
                                </span>
                            </div>
                        </div>

                        <!-- Bank Info Card -->
                        <div class="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border-2 border-slate-50 flex flex-col justify-between whitespace-nowrap">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="font-black text-slate-800 uppercase tracking-widest text-xs">Payout Method</h3>
                                <div class="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                                    <i data-lucide="landmark" class="w-4 h-4 text-teal-600"></i>
                                </div>
                            </div>
                            ${renderBankInfo()}
                        </div>

                        <!-- Quick Stats -->
                        <div class="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border-2 border-slate-50">
                             <h3 class="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Earnings Overview</h3>
                             <div class="space-y-4">
                                <div class="flex justify-between items-center p-4 bg-teal-50 rounded-2xl">
                                    <span class="text-sm font-bold text-teal-700">Total Profit</span>
                                    <span class="font-black text-teal-700">₦${Number(State.get().dropshipperStats?.total_profit || 0).toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between items-center p-4 bg-orange-50 rounded-2xl">
                                    <span class="text-sm font-bold text-orange-700">Pending Clearances</span>
                                    <span class="font-black text-orange-700">₦0</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    <!-- Transactions Table -->
                    <div class="glass-card p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative overflow-hidden">
                        <div class="flex justify-between items-center mb-8">
                            <h3 class="text-2xl font-black text-slate-800">Recent Transactions</h3>
                            <div class="flex gap-2">
                                <button class="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><i data-lucide="filter" class="w-5 h-5 text-slate-600"></i></button>
                                <button class="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><i data-lucide="download" class="w-5 h-5 text-slate-600"></i></button>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="text-left">
                                        <th class="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Details</th>
                                        <th class="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                                        <th class="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        <th class="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-4">Balance</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm font-medium">
                                    ${(walletData.transactions || []).length > 0 ? walletData.transactions.map(t => `
                                        <tr class="group hover:bg-slate-50/80 transition-all rounded-2xl overflow-hidden">
                                            <td class="py-6 pl-4">
                                                <div class="flex items-center gap-4">
                                                    <div class="w-10 h-10 rounded-full ${t.transaction_type === 'credit' ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'} flex items-center justify-center">
                                                        <i data-lucide="${t.transaction_type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}" class="w-5 h-5"></i>
                                                    </div>
                                                    <div>
                                                        <p class="font-bold text-slate-800">${t.description}</p>
                                                        <p class="text-xs text-slate-400 font-bold uppercase mt-0.5">${new Date(t.created_at).toLocaleDateString()} • ${t.reference}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="py-6">
                                                <span class="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${t.transaction_type === 'credit' ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-600'}">
                                                    ${t.transaction_type}
                                                </span>
                                            </td>
                                            <td class="py-6 text-right font-black ${t.transaction_type === 'credit' ? 'text-teal-600' : 'text-slate-800'}">
                                                ${t.transaction_type === 'credit' ? '+' : '-'}₦${Number(t.amount).toLocaleString()}
                                            </td>
                                            <td class="py-6 text-right font-black text-slate-800 pr-4">
                                                ₦${Number(t.balance_after).toLocaleString()}
                                            </td>
                                        </tr>
                                    `).join('') : `
                                        <tr>
                                            <td colspan="4" class="py-20 text-center">
                                                <div class="flex flex-col items-center gap-4">
                                                    <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                                        <i data-lucide="receipt" class="w-10 h-10 text-slate-300"></i>
                                                    </div>
                                                    <p class="text-slate-400 font-bold">No transactions found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Modal Containers -->
                <div id="payout-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center hidden p-4"></div>
                <div id="bank-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center hidden p-4"></div>
            `;
        },

        apiDocs() {
            setTimeout(async () => {
                try {
                    const res = await fetch('/API_USAGE.md');
                    if (res.ok) {
                        const text = await res.text();
                        const container = document.getElementById('docs-content');
                        if (container) {
                            // Simple markdown-ish rendering for the doc
                            const html = text
                                .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
                                .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$2</h2>')
                                .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2">$3</h3>')
                                .replace(/^\*\* (.*$)/gim, '<p class="font-bold">$1</p>')
                                .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
                                .replace(/```(.*?)```/gs, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl my-4 overflow-x-auto text-xs"><code>$1</code></pre>')
                                .replace(/\n/g, '<br>');
                            container.innerHTML = html;
                        }
                    }
                } catch (e) { console.error('Docs load error:', e); }
                lucide.createIcons();
            }, 100);

            return `
                <div class="max-w-4xl mx-auto py-10 px-4">
                    <div class="flex items-center gap-4 mb-8">
                        <button onclick="Router.back()" class="p-2 hover:bg-slate-100 rounded-lg transition-all"><i data-lucide="arrow-left" class="w-6 h-6"></i></button>
                        <h1 class="text-3xl font-bold">API Documentation</h1>
                    </div>
                    <div class="glass-card p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl overflow-hidden relative">
                        <div class="absolute top-0 right-0 p-8 opacity-5">
                            <i data-lucide="book-open" class="w-48 h-48 text-blue-600"></i>
                        </div>
                        <div id="docs-content" class="relative z-10 text-slate-600 leading-relaxed">
                            ${Components.LoadingSpinner()}
                        </div>
                    </div>
                </div>
            `;
        },

        apiManagement() {
            setTimeout(async () => {
                const container = document.getElementById('api-keys-list');
                const keys = await State.fetchAPIKeys();

                if (keys && keys.length > 0) {
                    container.innerHTML = keys.map(k => `
                        <div class="p-4 border border-slate-100 rounded-xl flex items-center justify-between bg-white shadow-sm mb-3">
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${k.key_name}</p>
                                <p class="font-mono text-sm text-slate-700">${k.api_key}</p>
                                <p class="text-[10px] text-slate-400 mt-1">Created: ${new Date(k.created_at).toLocaleDateString()}</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="navigator.clipboard.writeText('${k.api_key}'); Components.showNotification('Key copied!', 'success')" class="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all">
                                    <i data-lucide="copy" class="w-4 h-4"></i>
                                </button>
                                <button onclick="window.showConfirmDialog('Delete API Key?', 'Are you sure you want to delete this API key?', () => { State.deleteAPIKey('${k.id}'); Router.navigate('/api-management', true); })" class="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    `).join('');
                } else {
                    container.innerHTML = '<div class="text-center py-8 text-slate-400 text-sm">No API keys generated yet.</div>';
                }
                lucide.createIcons();

                // Handle key generation
                const genBtn = document.getElementById('generate-key-btn');
                if (genBtn) {
                    genBtn.onclick = async () => {
                        const name = prompt('Enter a name for this API key:');
                        if (name) {
                            await State.generateAPIKey(name);
                            Router.navigate('/api-management');
                        }
                    };
                }
            }, 100);

            return `
                <div class="max-w-6xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">API Management</h1>
                            <p class="text-slate-500">Connect your external stores and automate your workflow</p>
                        </div>
                        <div class="bg-blue-600/10 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold border border-blue-600/20">
                            v1.0.4 Stable
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="md:col-span-2 space-y-8">
                            <!-- API Key List Card -->
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex justify-between items-center mb-6">
                                    <h3 class="font-bold text-lg">Your API Keys</h3>
                                    <button id="generate-key-btn" class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">
                                        + Generate New Key
                                    </button>
                                </div>
                                <div id="api-keys-list" class="min-h-[100px]">
                                    ${Components.LoadingSpinner('sm')}
                                </div>
                            </div>

                            <!-- Webhooks -->
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex justify-between items-center mb-6">
                                    <h3 class="font-bold text-lg">Webhooks (Coming Soon)</h3>
                                    <button class="text-slate-300 font-bold text-sm cursor-not-allowed">+ Add Endpoint</button>
                                </div>
                                <div class="p-8 text-center text-slate-400 italic text-sm">
                                    Webhook notifications for order updates and inventory sync are coming in the next release.
                                </div>
                            </div>
                        </div>

                        <!-- Documentation Sidebar -->
                        <div class="space-y-6">
                            <div class="glass-card p-6 rounded-2xl bg-blue-50/50 border-blue-100">
                                <h3 class="font-bold mb-4 flex items-center gap-2">
                                    <i data-lucide="book-open" class="w-5 h-5 text-blue-600"></i>
                                    Quick Guide
                                </h3>
                                <div class="space-y-3 text-sm">
                                    <p class="text-slate-600 leading-relaxed">Use our RESTful API to sync orders and inventory between Xperiencestore and your custom backend.</p>
                                    <button onclick="Router.navigate('/api-docs')" class="block text-blue-600 font-bold hover:underline">View Full Documentation →</button>
                                </div>
                            </div>
                            
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Environment</h3>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-slate-500">Base URL</span>
                                        <code class="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">api-v1.xperiencestore.com</code>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-500">Headers</span>
                                        <span class="font-bold">x-api-key: YOUR_KEY</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        social() {
            return `
                <div class="max-w-6xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold font-display">Social Commerce</h1>
                            <p class="text-slate-500">Sell directly on social media platforms with automated sync</p>
                        </div>
                        <div class="flex gap-2">
                            <button class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">
                                Sync Shared Items
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        ${[
                    { name: 'Instagram', icon: 'instagram', color: 'pink', status: 'Connected', followers: '12.4k' },
                    { name: 'Facebook', icon: 'facebook', color: 'blue', status: 'Connected', followers: '8.2k' },
                    { name: 'TikTok', icon: 'music', color: 'slate', status: 'Connect Now', followers: '-' }
                ].map(platform => `
                            <div class="glass-card p-8 rounded-[2rem] text-center group hover:border-${platform.color}-200 transition-all cursor-pointer">
                                <div class="w-20 h-20 bg-${platform.color}-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <i data-lucide="${platform.icon}" class="w-10 h-10 text-${platform.color}-600"></i>
                                </div>
                                <h3 class="text-xl font-bold mb-1">${platform.name} Shopping</h3>
                                <p class="text-slate-400 text-sm mb-6">${platform.followers} Reach</p>
                                <span class="px-4 py-2 rounded-xl text-xs font-bold ${platform.status === 'Connected' ? 'bg-green-100 text-green-600' : 'bg-blue-600 text-white'}">
                                    ${platform.status}
                                </span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-12 glass-card rounded-[2.5rem] overflow-hidden">
                        <div class="p-8 border-b flex items-center justify-between bg-slate-50/50">
                            <h3 class="font-bold text-xl">Top Selling via Social</h3>
                            <select class="bg-transparent border-none font-bold text-sm text-blue-600 outline-none">
                                <option>Last 30 Days</option>
                                <option>Last 7 Days</option>
                            </select>
                        </div>
                        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="space-y-6">
                                ${[1, 2, 3].map(i => `
                                    <div class="flex items-center gap-4">
                                        <div class="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                                        <div class="flex-1">
                                            <p class="font-bold text-slate-800">Premium Leather Watch</p>
                                            <p class="text-xs text-slate-400">Sold 45 times via Instagram</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold text-green-600">₦250k</p>
                                            <p class="text-[10px] text-slate-400">Earned</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
                                <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                    <i data-lucide="trending-up" class="w-8 h-8 text-indigo-600"></i>
                                </div>
                                <h4 class="text-xl font-bold mb-2">Social Reach Growth</h4>
                                <p class="text-slate-500 text-sm mb-6">Your social reach has grown by <span class="text-green-600 font-bold">12%</span> this month.</p>
                                <button class="text-indigo-600 font-bold text-sm hover:underline">View detailed analytics →</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

    giftcards: {
        dashboard() {
            const cards = State.get().giftCards || [
                { id: 1, balance: 50000, code: 'XP-GFT-9283-4821', status: 'active', theme: 'modern' },
                { id: 2, balance: 0, code: 'XP-GFT-1122-3344', status: 'redeemed', theme: 'classic' }
            ];

            return `
                <div class="max-w-6xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-4xl font-bold">My Gift Cards</h1>
                            <p class="text-slate-500">Manage your digital assets and rewards</p>
                        </div>
                        <button onclick="Router.navigate('/gift-cards/buy')" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                            Buy New Card
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        ${cards.map(card => `
                            <div class="relative group">
                                <div class="glass-card h-56 rounded-[2rem] p-8 text-white relative overflow-hidden transition-all duration-500 group-hover:scale-[1.02] cursor-pointer ${card.theme === 'modern' ? 'bg-gradient-to-br from-indigo-600 to-purple-700' : 'bg-gradient-to-br from-slate-900 to-slate-700'}">
                                    <div class="relative z-10 h-full flex flex-col justify-between">
                                        <div class="flex justify-between items-start">
                                            <h3 class="text-xl font-black italic tracking-tighter">XPERIENCE<span class="text-blue-400">STORE</span></h3>
                                            <i data-lucide="ghost" class="w-8 h-8 opacity-50"></i>
                                        </div>
                                        
                                        <div>
                                            <p class="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Card Balance</p>
                                            <p class="text-3xl font-bold">₦${Number(card.balance).toLocaleString()}</p>
                                        </div>

                                        <div class="flex justify-between items-end">
                                            <div>
                                                <p class="text-white/40 text-[10px] uppercase font-bold">Gift Card Code</p>
                                                <p class="font-mono text-sm tracking-widest ${card.status === 'active' ? 'blur-sm group-hover:blur-none' : 'opacity-50'} transition-all">${card.code}</p>
                                            </div>
                                            <div class="badge-${card.status === 'active' ? 'green' : 'slate'} px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                                ${card.status}
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Decorative elements -->
                                    <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                    <div class="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                                    
                                    ${card.status === 'active' ? `
                                        <!-- Hide Overlay -->
                                        <div id="overlay-${card.id}" onclick="this.classList.add('opacity-0', 'pointer-events-none'); Components.showNotification('Code revealed!', 'info')" class="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-slate-900/40">
                                            <i data-lucide="lock" class="w-10 h-10 mb-2 opacity-50"></i>
                                            <p class="text-xs font-bold uppercase tracking-widest">Click to Reveal Code</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-12 glass-card p-10 rounded-[2.5rem] bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 text-center">
                        <div class="max-w-md mx-auto">
                            <div class="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-6">
                                <i data-lucide="plus" class="w-10 h-10 text-white"></i>
                            </div>
                            <h2 class="text-2xl font-bold mb-3">Redeem a Card</h2>
                            <p class="text-slate-500 mb-8">Have a physical or digital gift card? Enter the code below to add funds to your account.</p>
                            <div class="flex gap-3">
                                <input type="text" placeholder="XP-GFT-XXXX-XXXX" class="flex-1 p-4 rounded-2xl border-2 border-white bg-white outline-none focus:border-blue-500 transition-all font-mono font-bold">
                                <button class="bg-blue-600 text-white px-8 rounded-2xl font-bold hover:bg-blue-700 transition-all">Redeem</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        purchase() {
            return `
                <div class="max-w-4xl mx-auto py-10">
                    <div class="text-center mb-16">
                        <h1 class="text-5xl font-black mb-4 tracking-tight">The Perfect Gift</h1>
                        <p class="text-slate-500 text-lg">Send digital credits to your friends and family instantly.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <!-- Preview Card -->
                        <div class="sticky top-10">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Preview</p>
                            <div id="gift-card-preview" class="glass-card h-64 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                                <div class="relative z-10 flex flex-col justify-between h-full">
                                    <div class="flex justify-between items-start">
                                        <h3 class="text-2xl font-black italic tracking-tighter">XPERIENCE<span class="text-blue-400">STORE</span></h3>
                                        <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <i data-lucide="gift" class="w-6 h-6"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-white/60 text-xs font-bold uppercase mb-1">Gift Amount</p>
                                        <p class="text-4xl font-bold">₦<span id="preview-amount">50,000</span></p>
                                    </div>
                                    <p class="font-mono text-sm tracking-widest opacity-40">XP-GFT-XXXX-XXXX</p>
                                </div>
                                <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>

                        <!-- Purchase Form -->
                        <div class="glass-card p-8 rounded-[2.5rem] bg-white">
                            <h3 class="text-2xl font-bold mb-6">Configure Card</h3>
                            <form class="space-y-6">
                                <div>
                                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Select Amount</label>
                                    <div class="grid grid-cols-3 gap-3 mt-2">
                                        ${[5000, 10000, 20000, 50000, 100000, 'Custom'].map(amt => `
                                            <button type="button" onclick="document.getElementById('preview-amount').innerText = '${amt === 'Custom' ? '0' : amt}'; this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('border-blue-600', 'bg-blue-50')); this.classList.add('border-blue-600', 'bg-blue-50')" class="p-3 border-2 rounded-xl text-sm font-bold hover:border-blue-300 transition-all ${amt === 50000 ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}">
                                                ${amt === 'Custom' ? amt : '₦' + amt.toLocaleString()}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>

                                <div>
                                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Recipient Email</label>
                                    <input type="email" placeholder="who is this for?" class="w-full p-4 rounded-2xl border bg-slate-50 outline-none focus:border-blue-600 transition-all mt-2">
                                </div>

                                <div>
                                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Personal Message</label>
                                    <textarea placeholder="Write something nice..." class="w-full p-4 rounded-2xl border bg-slate-50 outline-none focus:border-blue-600 transition-all mt-2 h-24 resize-none"></textarea>
                                </div>

                                <button type="button" onclick="Router.navigate('/checkout?type=giftcard')" class="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                    Continue to Checkout
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }
    },
};
