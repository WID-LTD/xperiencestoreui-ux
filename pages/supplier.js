/**
 * pages.js - Role Page Modules
 * Split from pages.js to enable lazy loading
 */

import { Data } from '../data.js?v=3.3.0';
import { State } from '../state.js?v=3.3.0';
import { Router } from '../router.js?v=3.3.0';
import { Components } from '../components.js?v=3.3.0';
import { Tracking } from '../tracking.js?v=3.3.0';
import { Auth } from '../auth.js?v=3.3.0';
export const supplier = {
        home() {
            const isLoading = State.isLoading();
            const stats = State.getSupplierStats() || { total_products: 0, active_orders: 0, total_revenue: 0, low_stock_count: 0 };
            const orders = State.getSupplierOrders().slice(0, 5);
            const products = State.getSupplierProducts().slice(0, 4);

            return `
                <div class="space-y-10 px-4 sm:px-0">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                        <div class="max-w-lg text-center md:text-left">
                            <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">Supplier Portal</h1>
                            <p class="mb-8 opacity-90 text-lg">Manage your catalog, fulfill orders, and track your revenue in real-time.</p>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button onclick="Router.navigate('/supplier/products')" class="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all">Manage Catalog</button>
                                <button onclick="Router.navigate('/supplier/orders')" class="border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all">Manage Orders</button>
                            </div>
                        </div>
                        <img loading="lazy" src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400" class="h-48 md:h-64 rounded-2xl shadow-2xl transform hover:rotate-2 transition-all duration-500">
                    </div>

                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        ${Components.StatCard('Total Revenue', `₦${Number(stats.total_revenue || 0).toLocaleString()}`, 'dollar-sign', 'green', 12)}
                        ${Components.StatCard('Active Orders', (stats.active_orders || 0).toString(), 'shopping-cart', 'blue')}
                        ${Components.StatCard('Total Products', (stats.total_products || 0).toString(), 'package', 'orange')}
                        ${Components.StatCard('Low Stock', (stats.low_stock_count || 0).toString(), 'alert-triangle', 'red')}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Recent Orders -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6 flex items-center gap-2">
                                <i data-lucide="shopping-bag" class="w-5 h-5 text-blue-600"></i>
                                Recent Orders
                            </h3>
                            <div class="space-y-4">
                                ${orders.length > 0 ? orders.map(order => `
                                    <div class="bg-slate-50 p-4 rounded-xl hover:bg-slate-100 transition-all cursor-pointer" onclick="Router.navigate('/supplier/orders')">
                                        <div class="flex justify-between items-start mb-2">
                                            <h4 class="font-bold">Order #${order.order_id}</h4>
                                            <span class="badge-${order.status === 'pending' ? 'orange' : order.status === 'processing' ? 'blue' : 'green'} text-xs px-2 py-1 rounded-full font-bold capitalize">${order.status}</span>
                                        </div>
                                        <p class="text-sm text-slate-600 mb-2">${order.items_count} items • ₦${Number(order.order_total).toLocaleString()}</p>
                                        <p class="text-xs text-slate-400">${new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                `).join('') : '<div class="text-center py-8 text-slate-400">No recent orders</div>'}
                            </div>
                        </div>

                        <!-- Top Selling Products -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6 flex items-center gap-2">
                                <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
                                Your Products
                            </h3>
                            <div class="space-y-3">
                                ${products.length > 0 ? products.map((product, i) => `
                                    <div class="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-all">
                                        <img loading="lazy" src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-12 h-12 rounded-lg object-cover" alt="${product.name}">
                                        <div class="flex-1">
                                            <p class="font-bold text-sm text-slate-800">${product.name}</p>
                                            <p class="text-xs text-slate-500">${product.stock} units in stock</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold text-green-600">₦${Number(product.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                `).join('') : '<div class="text-center py-8 text-slate-400">No products found</div>'}
                            </div>
                        </div>
                    </div>

                    <!-- Performance Overview -->
                    <div class="glass-card p-6 sm:p-8 rounded-2xl bg-slate-900 text-white">
                        <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 text-center sm:text-left">
                            <div>
                                <h3 class="text-xl font-bold">Store Performance</h3>
                                <p class="text-slate-400 text-sm">Real-time metrics from the database</p>
                            </div>
                            <button onclick="Router.navigate('/supplier/orders')" class="px-6 py-3 border border-slate-600 hover:bg-slate-800 rounded-xl text-sm transition-all hover:scale-105">View All Orders</button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div class="text-center">
                                <div class="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">Live</div>
                                <p class="font-bold">Database Connected</p>
                                <p class="text-xs text-slate-400">Syncing real-time stats</p>
                            </div>
                            <div class="text-center">
                                <div class="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">${stats.active_orders || 0}</div>
                                <p class="font-bold">Pending Tasks</p>
                                <p class="text-xs text-slate-400">Orders requiring attention</p>
                            </div>
                            <div class="text-center">
                                <div class="w-20 h-20 rounded-full border-4 border-orange-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">${stats.total_products || 0}</div>
                                <p class="font-bold">Total Catalog</p>
                                <p class="text-xs text-slate-400">Items listed on platform</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        products() {
            const isLoading = State.isLoading();
            const products = State.getSupplierProducts();

            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">Product Catalog</h1>
                            <p class="text-slate-600">Manage your items, pricing, and check stock levels</p>
                        </div>
                        <button onclick="Router.navigate('/supplier/products/add')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
                            Add New Product
                        </button>
                    </div>

                    <!-- Products Table -->
                    <div class="glass-card rounded-2xl overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Product</th>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Category</th>
                                    <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Price</th>
                                    <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Stock</th>
                                    <th class="text-center p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${isLoading ? Array(5).fill(`
                                    <tr class="animate-pulse">
                                        <td class="p-6">
                                            <div class="flex items-center gap-4">
                                                <div class="w-12 h-12 bg-slate-200 rounded-lg"></div>
                                                <div class="space-y-2">
                                                    <div class="h-4 w-32 bg-slate-200 rounded"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="p-6"><div class="h-4 w-24 bg-slate-200 rounded"></div></td>
                                        <td class="p-6"><div class="h-4 w-16 bg-slate-200 rounded ml-auto"></div></td>
                                        <td class="p-6"><div class="h-4 w-16 bg-slate-200 rounded ml-auto"></div></td>
                                        <td class="p-6"></td>
                                    </tr>
                                `).join('') : products.length > 0 ? products.map(product => `
                                    <tr class="hover:bg-slate-50/80 transition-colors group">
                                        <td class="p-6">
                                            <div class="flex items-center gap-4">
                                                <img loading="lazy" src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-12 h-12 rounded-lg object-cover shadow-sm" alt="${product.name}">
                                                <div>
                                                    <p class="font-bold text-slate-800">${product.name}</p>
                                                    <p class="text-xs text-slate-400">ID: ${product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="p-6 text-sm font-medium text-slate-600">${product.category_name || 'Uncategorized'}</td>
                                        <td class="p-6 text-right font-bold text-slate-800">₦${Number(product.price).toLocaleString()}</td>
                                        <td class="p-6">
                                            <div class="flex items-center justify-end gap-2">
                                                <div class="w-20 bg-slate-200 rounded-full h-1.5">
                                                    <div class="bg-${product.stock < 10 ? 'red' : 'green'}-500 h-1.5 rounded-full" style="width: ${Math.min(100, (product.stock / 100) * 100)}%"></div>
                                                </div>
                                                <span class="text-xs font-bold ${product.stock < 10 ? 'text-red-500' : 'text-slate-600'}">${product.stock}</span>
                                            </div>
                                        </td>
                                        <td class="p-6 text-center">
                                            <div class="flex justify-center gap-2">
                                                <button onclick="window.editProduct(${product.id})" class="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit Product">
                                                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                                                </button>
                                                <button onclick="window.deleteProduct(${product.id})" class="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete Product">
                                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('') : '<tr><td colspan="5" class="p-12 text-center text-slate-400">No products found. Start by adding one!</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        addProduct(params = {}) {
            const productId = params.id;
            const isEdit = !!productId;
            const products = State.getSupplierProducts();
            const product = isEdit ? products.find(p => p.id == productId) : null;

            return `
                <div class="max-w-3xl mx-auto">
                    ${Components.Breadcrumbs([
                { label: 'Home', link: '/' },
                { label: 'Products', link: '/supplier/products' },
                { label: isEdit ? 'Edit Product' : 'Add New Product' }
            ])}
                    
                    <h1 class="text-3xl font-bold mb-8">${isEdit ? 'Edit Product' : 'Add New Product'}</h1>
                    
                    <form id="addProductForm" class="glass-card p-8 rounded-2xl space-y-6" onsubmit="event.preventDefault(); window.submitProduct(event, ${productId || 'null'})">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                                <input type="text" name="name" value="${product?.name || ''}" required class="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="e.g. Premium Wireless Headphones">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea name="description" rows="4" class="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="Detailed product description...">${product?.description || ''}</textarea>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">Unit Price ($)</label>
                                    <input type="number" name="price" step="0.01" value="${product?.price || ''}" required class="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">Stock Quantity</label>
                                    <input type="number" name="stock" value="${product?.stock || ''}" required class="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="0">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                <select name="category" class="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none">
                                    ${['Consumer Electronics', 'Fashion', 'Home & Garden', 'Beauty', 'Automotive', 'Sports'].map(cat => `
                                        <option value="${cat}" ${product?.category === cat ? 'selected' : ''}>${cat}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Product Images (Max 5)</label>
                                <div class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input type="file" name="images" multiple accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange="window.handleImagePreview(this)">
                                    <div id="image-upload-placeholder" class="space-y-2 pointer-events-none ${isEdit ? 'hidden' : ''}">
                                        <i data-lucide="upload-cloud" class="w-10 h-10 text-slate-400 mx-auto"></i>
                                        <p class="text-slate-600 font-medium">Click to upload images</p>
                                        <p class="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                                    </div>
                                    <div id="preview-gallery" class="${isEdit ? '' : 'hidden'} grid grid-cols-5 gap-2 mt-4 pointer-events-none">
                                        ${isEdit ? Array.from({ length: 5 }).map((_, i) => `
                                            <div class="aspect-square rounded-lg bg-slate-100 overflow-hidden relative group">
                                                <img loading="lazy" src="${State.getMediaUrl(productId, i)}" 
                                                     onerror="this.parentElement.style.display='none'"
                                                     class="w-full h-full object-cover" alt="${product?.name || 'Product'} Gallery Image ${i + 1}">
                                            </div>
                                        `).join('') : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end gap-4 pt-4 border-t border-slate-100">
                            <button type="button" onclick="Router.navigate('/supplier/products')" class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button type="submit" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                                <i data-lucide="save" class="w-4 h-4"></i>
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            `;
        },

        orders() {
            const isLoading = State.isLoading();
            const orders = State.getSupplierOrders();

            // Helper to build status select — avoids 3-deep nested template literals
            const buildStatusSelect = (order) => {
                if (order.status === 'delivered' || order.status === 'cancelled') return '';
                const sel = (val) => order.status === val ? 'selected' : '';
                return `
                    <div class="flex gap-2">
                        <select onchange="window.updateOrderStatus(${order.order_id}, this.value)" class="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-600 outline-none">
                            <option value="">Update Status</option>
                            <option value="processing" ${sel('processing')}>Processing</option>
                            <option value="shipped" ${sel('shipped')}>Shipped</option>
                            <option value="delivered" ${sel('delivered')}>Delivered</option>
                        </select>
                    </div>
                `;
            };

            const statusColor = (s) => s === 'delivered' ? 'green' : s === 'cancelled' ? 'red' : 'orange';

            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Supplier Orders</h1>

                    <div class="flex gap-4 mb-8 overflow-x-auto pb-2">
                        <button class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 whitespace-nowrap">All Orders (${orders.length})</button>
                        <button class="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-200 whitespace-nowrap">Pending (${orders.filter(o => o.status === 'pending').length})</button>
                        <button class="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-200 whitespace-nowrap">Processing (${orders.filter(o => o.status === 'processing').length})</button>
                        <button class="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-200 whitespace-nowrap">Shipped (${orders.filter(o => o.status === 'shipped').length})</button>
                    </div>

                    <div class="space-y-4">
                        ${isLoading ? Array(3).fill(`
                            <div class="glass-card p-6 rounded-2xl animate-pulse">
                                <div class="h-24 bg-slate-100 rounded-xl"></div>
                            </div>
                        `).join('') : orders.length > 0 ? orders.map(order => `
                            <div class="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow">
                                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                    <div class="flex items-center gap-4">
                                        <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                                            #${order.order_id}
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-lg">Order from ${order.customer_name || 'Customer'}</h3>
                                            <p class="text-sm text-slate-500">Placed on ${new Date(order.created_at).toLocaleDateString()} • ${order.payment_method}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-6">
                                        <div class="text-right">
                                            <p class="text-xs text-slate-400 font-bold uppercase">Order Total</p>
                                            <p class="text-xl font-bold text-slate-800">₦${Number(order.order_total).toLocaleString()}</p>
                                        </div>
                                        <div class="relative group">
                                            <span class="px-4 py-2 bg-${statusColor(order.status)}-100 text-${statusColor(order.status)}-600 rounded-full font-bold text-sm capitalize">
                                                ${order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="bg-slate-50 rounded-xl p-4 mb-4">
                                    <h4 class="text-xs font-bold text-slate-400 uppercase mb-3">Your Products in this Order</h4>
                                    <div class="space-y-3">
                                        ${order.items.map(item => `
                                            <div class="flex justify-between items-center text-sm">
                                                <div class="flex items-center gap-3">
                                                    <img onerror="this.src='/assets/placeholder.png'; this.onerror=null;" loading="lazy" src="${State.getMediaUrl(item.product_id, 0)}" class="w-8 h-8 rounded object-cover" alt="${item.name}">
                                                    <span class="font-medium text-slate-700">
                                                        <span class="w-6 text-slate-400">x${item.quantity}</span>
                                                        ${item.name}
                                                    </span>
                                                </div>
                                                <span class="font-bold text-slate-800">₦${(Number(item.price) * Number(item.quantity)).toLocaleString()}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>

                                <div class="flex flex-col md:flex-row justify-between items-center gap-3 mt-4 border-t pt-4 border-slate-100">
                                    <div class="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg">
                                        <i data-lucide="truck" class="w-4 h-4 text-orange-500"></i>
                                        <span class="font-bold">Incoterms:</span> DDP
                                        <span class="mx-2">|</span>
                                        <span class="font-bold">WRO Tracking:</span> Pending Warehouse
                                    </div>
                                    <div class="flex justify-end gap-3">
                                        <button onclick="window.printInvoice(${order.order_id})" class="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-bold text-sm text-slate-600 transition-all flex items-center gap-2">
                                            <i data-lucide="file-text" class="w-4 h-4"></i> Comm. Invoice
                                        </button>
                                        ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
                                        <button onclick="window.submitWRO(${order.order_id})" class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-orange-200">
                                            <i data-lucide="package-check" class="w-4 h-4"></i> Send WRO
                                        </button>
                                        ` : ''}
                                        ${buildStatusSelect(order)}
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<div class="glass-card p-12 text-center text-slate-400">No orders yet.</div>'}
                    </div>
                </div>
            `;
        },




        rfq() {
            const rfqs = State.getRFQs();

            // Guard: if no RFQs yet, show empty state to avoid rfqs[0] crash
            if (rfqs.length === 0) {
                return `
                    <div class="max-w-7xl mx-auto">
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h1 class="text-3xl font-bold">RFQ Requests</h1>
                                <p class="text-slate-600">Respond to quote requests from business buyers</p>
                            </div>
                        </div>
                        <div class="glass-card p-12 rounded-3xl text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="file-text" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">No RFQ Requests Yet</h3>
                            <p class="text-slate-500">When business buyers send you quote requests, they'll appear here.</p>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">RFQ Requests</h1>
                            <p class="text-slate-600">Respond to quote requests from business buyers</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- RFQ List -->
                        <div class="lg:col-span-1 space-y-4">
                            ${rfqs.map((rfq, i) => `
                                <div class="glass-card p-5 rounded-2xl cursor-pointer hover:border-blue-400 border-2 ${i === 0 ? 'border-blue-500 bg-blue-50/50' : 'border-transparent'} transition-all">
                                    <div class="flex justify-between items-start mb-2">
                                        <span class="bg-white text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 font-bold">RFQ #${1024 + i}</span>
                                        <span class="text-xs text-slate-400 font-medium">2h ago</span>
                                    </div>
                                    <h3 class="font-bold text-slate-800 mb-2">${rfq.title}</h3>
                                    <p class="text-sm text-slate-600 line-clamp-2 mb-3">${rfq.description}</p>
                                    <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span>${rfq.quantity} units</span>
                                        <span>Budget: $${(rfq.quantity * 50).toLocaleString()}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- RFQ Detail View -->
                        <div class="lg:col-span-2">
                            <div class="glass-card p-8 rounded-3xl sticky top-24">
                                <div class="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 class="text-2xl font-bold mb-2">${rfqs[0].title}</h2>
                                        <div class="flex items-center gap-4 text-sm text-slate-500">
                                            <span class="flex items-center gap-1"><i data-lucide="building" class="w-4 h-4"></i> Tech Giant Inc.</span>
                                            <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-4 h-4"></i> New York, USA</span>
                                        </div>
                                    </div>
                                    <button class="p-2 hover:bg-slate-100 rounded-full transition-colors"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p class="text-xs text-slate-400 font-bold uppercase mb-1">Quantity</p>
                                        <p class="text-lg font-bold text-slate-800">${rfqs[0].quantity} Units</p>
                                    </div>
                                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p class="text-xs text-slate-400 font-bold uppercase mb-1">Target Price</p>
                                        <p class="text-lg font-bold text-slate-800">$45.00 / unit</p>
                                    </div>
                                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p class="text-xs text-slate-400 font-bold uppercase mb-1">Deadline</p>
                                        <p class="text-lg font-bold text-red-500">${rfqs[0].deadline}</p>
                                    </div>
                                </div>

                                <div class="mb-8">
                                    <h3 class="font-bold text-lg mb-3">Specifications</h3>
                                    <p class="text-slate-600 leading-relaxed mb-4">
                                        We are looking for high-quality components matching the specifications listed below. 
                                        Please ensure compliance with ISO standards. Needed by Q3 for our new product line launch.
                                    </p>
                                    <ul class="list-disc list-inside space-y-2 text-slate-600">
                                        <li>Material: High-grade Aluminum Alloy</li>
                                        <li>Finish: Matte Black Powder Coat</li>
                                        <li>Tolerance: ±0.05mm</li>
                                        <li>Packaging: Individual protective wrap</li>
                                    </ul>
                                </div>

                                <div class="border-t pt-6">
                                    <h3 class="font-bold text-lg mb-4">Submit Quote</h3>
                                    <div class="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label class="block text-xs font-bold text-slate-500 mb-1 pl-1">PRICE PER UNIT ($)</label>
                                            <input type="number" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" placeholder="0.00">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-bold text-slate-500 mb-1 pl-1">LEAD TIME (DAYS)</label>
                                            <input type="number" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" placeholder="14">
                                        </div>
                                    </div>
                                    <textarea class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 min-h-[100px] mb-4" placeholder="Add additional notes or terms..."></textarea>
                                    
                                    <button class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">Send Quotation</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        analytics() {
            const stats = State.getSupplierStats() || {};
            const views = stats.page_views || [12, 19, 15, 25, 22, 30, 28, 35, 40, 38, 45, 50];
            const maxView = Math.max(...views, 1);
            const pathData = views.map((v, i) => `${(i / (views.length - 1)) * 100},${100 - (v / maxView) * 100}`).join(' L ');

            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8 text-slate-800">Premium Analytics Dashboard</h1>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        ${Components.StatCard('Total Unique Visitors', '12,450', 'users', 'blue', 12)}
                        ${Components.StatCard('Page Views', '45,230', 'eye', 'purple', 8)}
                        ${Components.StatCard('Conversion Rate', '3.8%', 'activity', 'green', 1.2)}
                        ${Components.StatCard('Bounce Rate', '42%', 'corner-up-left', 'orange', -2)}
                    </div>

                    <div class="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden bg-white/60 backdrop-blur-3xl shadow-xl shadow-blue-900/5 border border-white">
                        <h3 class="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2">
                            <i data-lucide="trending-up" class="w-6 h-6 text-blue-600"></i> Traffic Trend
                        </h3>
                        <div class="h-64 relative w-full">
                            <!-- SVG Curve Graph -->
                            <svg class="w-full h-full drop-shadow-xl" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stop-color="#3b82f6" />
                                        <stop offset="50%" stop-color="#8b5cf6" />
                                        <stop offset="100%" stop-color="#ec4899" />
                                    </linearGradient>
                                    <linearGradient id="gradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
                                        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M 0,100 L 0,${100 - (views[0] / maxView) * 100} L ${pathData} L 100,100 Z" fill="url(#gradientFill)" />
                                <path d="M ${pathData}" fill="none" stroke="url(#gradientLine)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-[dash_3s_ease-out_forwards] [stroke-dasharray:1000] [stroke-dashoffset:1000]" />
                            </svg>
                            <!-- Grid Lines -->
                            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                                <div class="border-t border-slate-400 w-full"></div>
                                <div class="border-t border-slate-400 w-full"></div>
                                <div class="border-t border-slate-400 w-full"></div>
                                <div class="border-t border-slate-400 w-full"></div>
                                <div class="border-t border-slate-400 w-full"></div>
                            </div>
                        </div>
                        <div class="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                        </div>
                    </div>
                </div>
            `;
        },

        settings() {
            return `
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8 text-slate-800">Supplier Profile Settings</h1>
                    <form id="supplierSettingsForm" class="space-y-6 glass-card p-8 rounded-3xl" onsubmit="event.preventDefault(); window.updateSupplierProfile(this)">
                        
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">About Company</label>
                            <textarea name="about_me" rows="4" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="Write a compelling story about your manufacturing capabilities..."></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Certifications (Comma separated)</label>
                            <input type="text" name="certifications" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="e.g. ISO 9001, CE, FDA Approved">
                            <p class="text-xs text-slate-400 mt-2">These will be displayed as trust badges on your profile.</p>
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Factory Virtual Tours (URLs, comma separated)</label>
                            <input type="text" name="factory_tours" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="e.g. https://my3dtour.com/factory">
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Verified Production Videos (URLs, comma separated)</label>
                            <input type="text" name="verified_videos" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="e.g. https://youtube.com/...">
                        </div>

                        <div class="pt-6 border-t border-slate-100 flex justify-end">
                            <button type="submit" class="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                                <i data-lucide="save" class="w-5 h-5"></i>
                                Save Profile Enhancements
                            </button>
                        </div>
                    </form>
                </div>
            `;
        },

        finance() {
            const walletData = State.get().dropshipperWallet || State.get().supplierWallet || { wallets: [], transactions: [] };
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
                            <p class="text-slate-500 font-medium text-lg">Manage your earnings and payout requests</p>
                        </div>
                        <div class="flex gap-4">
                            <button onclick="window.openPayoutModal()" class="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2">
                                <i data-lucide="arrow-up-right" class="w-5 h-5"></i> Request Payout
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        <!-- Balance Card -->
                        <div class="lg:col-span-1 glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                            <i data-lucide="wallet" class="absolute -right-4 -bottom-4 w-48 h-48 opacity-10 rotate-12"></i>
                            <p class="text-blue-100 font-bold uppercase tracking-wider text-sm mb-4">Available Balance</p>
                            <h2 class="text-5xl font-black mb-8">₦${Number(primaryWallet.balance).toLocaleString()}</h2>
                            <div class="flex items-center gap-4 text-sm font-bold">
                                <span class="bg-white/20 px-4 py-2 rounded-full flex items-center gap-1">
                                    <i data-lucide="check-circle" class="w-4 h-4 text-green-300"></i> Verified Account
                                </span>
                            </div>
                        </div>

                        <!-- Bank Info Card -->
                        <div class="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border-2 border-slate-50 flex flex-col justify-between whitespace-nowrap">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="font-black text-slate-800 uppercase tracking-widest text-xs">Payout Method</h3>
                                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <i data-lucide="landmark" class="w-4 h-4 text-blue-600"></i>
                                </div>
                            </div>
                            ${renderBankInfo()}
                        </div>

                        <!-- Quick Stats -->
                        <div class="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border-2 border-slate-50">
                             <h3 class="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Payout Stats</h3>
                             <div class="space-y-4">
                                <div class="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
                                    <span class="text-sm font-bold text-green-700">Total Withdrawn</span>
                                    <span class="font-black text-green-700">₦0</span>
                                </div>
                                <div class="flex justify-between items-center p-4 bg-orange-50 rounded-2xl">
                                    <span class="text-sm font-bold text-orange-700">Pending Payouts</span>
                                    <span class="font-black text-orange-700">₦0</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    <!-- Transactions Table -->
                    <div class="glass-card p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative overflow-hidden">
                        <div class="flex justify-between items-center mb-8">
                            <h3 class="text-2xl font-black text-slate-800">Transaction History</h3>
                            <div class="flex gap-2">
                                <button class="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><i data-lucide="filter" class="w-5 h-5 text-slate-600"></i></button>
                                <button class="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><i data-lucide="download" class="w-5 h-5 text-slate-600"></i></button>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="text-left">
                                        <th class="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Transaction Details</th>
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
                                                    <div class="w-10 h-10 rounded-full ${t.transaction_type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} flex items-center justify-center">
                                                        <i data-lucide="${t.transaction_type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}" class="w-5 h-5"></i>
                                                    </div>
                                                    <div>
                                                        <p class="font-bold text-slate-800">${t.description}</p>
                                                        <p class="text-xs text-slate-400 font-bold uppercase mt-0.5">${new Date(t.created_at).toLocaleDateString()} • ${t.reference}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="py-6">
                                                <span class="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${t.transaction_type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                                                    ${t.transaction_type}
                                                </span>
                                            </td>
                                            <td class="py-6 text-right font-black ${t.transaction_type === 'credit' ? 'text-green-600' : 'text-slate-800'}">
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
        }
}

