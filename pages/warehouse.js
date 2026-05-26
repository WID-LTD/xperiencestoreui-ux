import { State } from '../state.js?v=3.3.1';
import { Router } from '../router.js?v=3.3.1';
import { Components } from '../components.js?v=3.3.1';

export const warehouse = {

        home() {
            const stats = State.get().warehouseStats || {
                total_skus: 0,
                pending_orders_count: 0,
                in_transit_count: 0,
                low_stock_items: [],
                recent_orders: []
            };

            return `
                <div class="space-y-10">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-orange-600 to-red-600 rounded-[2rem] p-12 text-white flex flex-col md:flex-row justify-between items-center">
                        <div class="max-w-lg mb-6 md:mb-0">
                            <h1 class="text-5xl font-bold mb-4">Warehouse Management</h1>
                            <p class="mb-6 opacity-90 text-lg">Streamline operations with real-time inventory tracking and order fulfillment</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/warehouse/receiving')" class="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all">Receiving</button>
                                <button onclick="Router.navigate('/warehouse/fulfillment')" class="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all">Fulfillment</button>
                            </div>
                        </div>
                        <img loading="lazy" src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400" class="h-64 rounded-2xl shadow-2xl">
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        ${Components.StatCard('Total SKUs', stats.total_skus.toString(), 'package', 'orange')}
                        ${Components.StatCard('Pending Orders', stats.pending_orders_count.toString(), 'shopping-cart', 'blue')}
                        ${Components.StatCard('In Transit', stats.in_transit_count.toString(), 'truck', 'purple')}
                        ${Components.StatCard('Capacity', '78%', 'warehouse', 'green')}
                    </div>

                    <!-- Today's Activities -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="inbox" class="w-5 h-5 text-orange-600"></i>
                                Recent Orders
                            </h3>
                            <div class="space-y-3">
                                ${stats.recent_orders.length > 0 ? stats.recent_orders.map((order, i) => `
                                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <i data-lucide="package" class="w-5 h-5 text-orange-600"></i>
                                            </div>
                                            <div>
                                                <p class="font-bold text-sm">#${order.id}</p>
                                                <p class="text-xs text-slate-500">${order.customer_name}</p>
                                            </div>
                                        </div>
                                        <button onclick="Router.navigate('/warehouse/fulfillment')" class="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition-all">
                                            Process
                                        </button>
                                    </div>
                                `).join('') : '<p class="text-slate-400 text-center py-4">No pending orders</p>'}
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="alert-triangle" class="w-5 h-5 text-red-600"></i>
                                Low Stock Alerts
                            </h3>
                            <div class="space-y-3">
                                ${stats.low_stock_items.length > 0 ? stats.low_stock_items.map(item => `
                                    <div class="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                                        <div>
                                            <p class="font-bold text-sm">${item.name}</p>
                                            <p class="text-xs text-slate-500">${item.category}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-red-600 font-bold">${item.stock} units</p>
                                        </div>
                                    </div>
                                `).join('') : '<p class="text-slate-400 text-center py-4">Stock levels are healthy</p>'}
                            </div>
                        </div>
                    </div>

                    <!-- Pending Orders -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Orders to Fulfill</h2>
                            <a href="#/warehouse/fulfillment" class="text-blue-600 font-bold hover:underline">View All →</a>
                        </div>
                        <div class="grid grid-cols-1 gap-4">
                            ${stats.recent_orders.map(order => Components.OrderCard(order)).join('')}
                        </div>
                    </div>

                    <!-- WMS Features -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="zap" class="w-8 h-8 text-orange-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Real-Time Tracking</h3>
                            <p class="text-sm text-slate-500">Live inventory updates</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="scan" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Barcode Scanning</h3>
                            <p class="text-sm text-slate-500">Quick item lookup</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="bar-chart-2" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Analytics</h3>
                            <p class="text-sm text-slate-500">Performance insights</p>
                        </div>
                    </div>
                </div>
            `;
        },

        receiving() {
            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold">Receiving Dashboard</h1>
                        <button class="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                            <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
                            New Receipt
                        </button>
                    </div>

                    <!-- Incoming Shipments -->
                    <div class="space-y-4">
                        ${State.getWROs().length === 0 ? '<div class="text-center p-8 text-slate-500">No incoming shipments found.</div>' : ''}
                        ${State.getWROs().map((wro, idx) => {
                const isArrived = wro.order_status === 'delivered_to_warehouse';
                const wroData = typeof wro.wro_data === 'string' ? JSON.parse(wro.wro_data) : (wro.wro_data || {});
                const totalItems = (wroData.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
                const expectedDate = new Date(wro.created_at);
                expectedDate.setDate(expectedDate.getDate() + 5); // Approximate 5 days delivery

                return `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 class="text-xl font-bold mb-1">${wro.wro_number || 'WRO-UNKNOWN'}</h3>
                                        <p class="text-sm text-slate-600">Expected: ${expectedDate.toLocaleDateString()}</p>
                                    </div>
                                    <span class="badge-${isArrived ? 'green' : 'orange'} px-3 py-1 rounded-full text-xs font-bold">
                                        ${isArrived ? 'Arrived' : 'In Transit'}
                                    </span>
                                </div>

                                <div class="grid grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p class="text-slate-500">Supplier</p>
                                        <p class="font-bold">${wro.supplier_name || 'Unknown Supplier'}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Items</p>
                                        <p class="font-bold">${totalItems || 'N/A'} units</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Tracking</p>
                                        <p class="font-bold">${wro.tracking_number || wro.wro_number.split('-').pop()}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Priority</p>
                                        <p class="font-bold ${idx <= 1 ? 'text-red-600' : 'text-blue-600'}">${idx <= 1 ? 'High' : 'Normal'}</p>
                                    </div>
                                </div>

                                ${!isArrived ? `
                                    <div class="border-t pt-4">
                                        <h4 class="font-bold mb-3">Receiving Checklist</h4>
                                        <div class="space-y-2 mb-4">
                                            ${['Verify quantities', 'Inspect quality', 'Update inventory', 'Generate labels'].map((task, checkIdx) => `
                                                <label class="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" ${checkIdx === 0 ? 'checked' : ''} class="rounded">
                                                    <span class="text-sm">${task}</span>
                                                </label>
                                            `).join('')}
                                        </div>
                                        <div class="flex gap-3">
                                            <button onclick="window.completeWROReceipt(${wro.id})" class="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                                                Complete Receipt & Increment Stock
                                            </button>
                                            <button onclick="State.printReceivingSlip(${wro.order_id})" class="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all">
                                                <i data-lucide="printer" class="w-4 h-4 inline mr-2"></i> Print Slip
                                            </button>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="border-t pt-4 text-green-600 font-bold">
                                        <i data-lucide="check-circle" class="w-5 h-5 inline mr-1"></i> Receipt Completed
                                    </div>
                                `}
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
        },

        inventory() {
            const inventory = State.getInventory();

            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold">Inventory Management</h1>
                        <div class="flex gap-3">
                            <button onclick="State.fetchInventory()" class="border-2 border-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                <i data-lucide="refresh-cw" class="w-5 h-5 inline mr-2"></i>
                                Refresh
                            </button>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="glass-card p-4 rounded-2xl mb-6 flex gap-4">
                        <input type="text" placeholder="Search SKU or name..." class="flex-1 p-3 rounded-xl border bg-white/50 outline-none focus:border-orange-500">
                    </div>

                    <!-- Inventory Table -->
                    <div class="glass-card rounded-2xl overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-slate-100">
                                <tr>
                                    <th class="text-left p-4 font-bold">ID</th>
                                    <th class="text-left p-4 font-bold">Product</th>
                                    <th class="text-left p-4 font-bold">Category</th>
                                    <th class="text-left p-4 font-bold">Location</th>
                                    <th class="text-right p-4 font-bold">Quantity</th>
                                    <th class="text-center p-4 font-bold">Status</th>
                                    <th class="text-center p-4 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${inventory.length > 0 ? inventory.map(item => {
                const status = item.stock <= 0 ? 'out' : item.stock < 20 ? 'low' : 'ok';
                const statusColor = status === 'out' ? 'red' : status === 'low' ? 'orange' : 'green';
                const statusText = status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock';

                return `
                                        <tr class="border-t hover:bg-slate-50 transition-all">
                                            <td class="p-4 font-mono font-bold text-sm">${item.id}</td>
                                            <td class="p-4">
                                                <div class="font-bold">${item.name}</div>
                                                <div class="text-xs text-slate-500">${item.supplier_name || 'In-house'}</div>
                                            </td>
                                            <td class="p-4 text-sm text-slate-600">${item.category}</td>
                                            <td class="p-4 text-sm text-slate-600">${item.location}</td>
                                            <td class="p-4 text-right font-bold ${status !== 'ok' ? 'text-' + statusColor + '-600' : ''}">${item.stock}</td>
                                            <td class="p-4 text-center">
                                                <span class="badge-${statusColor} px-3 py-1 rounded-full text-xs font-bold">${statusText}</span>
                                            </td>
                                            <td class="p-4">
                                                <div class="flex gap-2 justify-center">
                                                    <button onclick="window.editInventory(${item.id}, ${item.stock}, '${item.location}')" class="p-2 hover:bg-blue-50 rounded-lg transition-all">
                                                        <i data-lucide="edit" class="w-4 h-4 text-blue-600"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
            }).join('') : `
                                    <tr>
                                        <td colspan="7" class="p-12 text-center">
                                            <div class="flex flex-col items-center gap-3 text-slate-400">
                                                <i data-lucide="package-search" class="w-12 h-12"></i>
                                                <p>No inventory found or still loading...</p>
                                                <button onclick="State.fetchInventory()" class="text-blue-600 font-bold hover:underline">Retry Fetch</button>
                                            </div>
                                        </td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        fulfillment() {
            const orders = State.getOrders().filter(o => o.status === 'processing');

            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold">Order Fulfillment</h1>
                        <button onclick="State.fetchOrders()" class="p-3 border rounded-xl hover:bg-slate-50 transition-all">
                            <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <!-- Status Tabs -->
                    <div class="flex gap-2 mb-6">
                        <button class="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold">To Pick (${orders.length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50">Completed (${State.getOrders().filter(o => o.status === 'shipped').length})</button>
                    </div>

                    <!-- Orders to Fulfill -->
                    <div class="space-y-4">
                        ${orders.length > 0 ? orders.map(order => `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 class="text-xl font-bold mb-1">Order #${order.id}</h3>
                                        <p class="text-sm text-slate-600">Customer: ${order.customer_name || 'N/A'}</p>
                                    </div>
                                    <div class="text-right">
                                        <span class="badge-orange px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Status: ${order.status}</span>
                                        <p class="text-sm text-slate-600">${new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div class="bg-slate-50 rounded-xl p-4 mb-4">
                                    <h4 class="font-bold mb-3">Items</h4>
                                    ${(order.items || []).map((item, idx) => `
                                        <div class="flex items-center justify-between py-2 ${idx > 0 ? 'border-t' : ''}">
                                            <div class="flex items-center gap-3">
                                                <input type="checkbox" class="rounded w-5 h-5">
                                                <div>
                                                    <p class="font-bold text-sm">${item.name}</p>
                                                    <p class="text-xs text-slate-500">Qty: ${item.quantity}</p>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <p class="text-xs text-slate-500">Price: ₦${Number(item.price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>

                                <div class="flex gap-3">
                                    <button onclick="window.shipOrder(${order.id})" class="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                                        <i data-lucide="package" class="w-5 h-5 inline mr-2"></i>
                                        Ship Order
                                    </button>
                                    <button onclick="window.openInvoice(${order.id})" class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                        Print Packing Slip
                                    </button>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                <i data-lucide="check-circle" class="w-16 h-16 text-slate-300 mx-auto mb-4"></i>
                                <h3 class="text-xl font-bold text-slate-500">All caught up!</h3>
                                <p class="text-slate-400">No orders waiting for fulfillment.</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
        },

        shipping() {
            const readyToShip = State.getOrders().filter(o => o.status === 'shipped').slice(0, 5);

            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Shipping Management</h1>

                    <!-- Quick Actions -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        ${Components.StatCard('Ready to Ship', readyToShip.length.toString(), 'package', 'orange')}
                        ${Components.StatCard('In Transit', '23', 'truck', 'blue')}
                        ${Components.StatCard('Delivered Today', '45', 'check-circle', 'green')}
                    </div>

                    <!-- Ready to Ship -->
                    <div class="mb-8">
                        <h2 class="text-2xl font-bold mb-4">Ready for Dispatch</h2>
                        <div class="space-y-4">
                            ${readyToShip.map(order => `
                                <div class="glass-card p-6 rounded-2xl">
                                    <div class="flex items-start justify-between mb-4">
                                        <div class="flex items-center gap-4">
                                            <input type="checkbox" class="rounded w-5 h-5">
                                            <div>
                                                <h3 class="font-bold text-lg">Order #${order.id}</h3>
                                                <p class="text-sm text-slate-600">${order.items.length} items • $${(Number(order.total) || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <span class="badge-green px-3 py-1 rounded-full text-xs font-bold">Packed</span>
                                    </div>

                                    <div class="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p class="text-xs text-slate-500 mb-1">Shipping Method</p>
                                            <select class="w-full p-2 rounded-lg border text-sm font-bold">
                                                <option>Standard Shipping</option>
                                                <option>Express Shipping</option>
                                                <option>Overnight</option>
                                            </select>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-500 mb-1">Carrier</p>
                                            <select class="w-full p-2 rounded-lg border text-sm font-bold">
                                                <option>USPS</option>
                                                <option>FedEx</option>
                                                <option>UPS</option>
                                                <option>DHL</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="flex gap-3">
                                        <button class="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                                            <i data-lucide="printer" class="w-5 h-5 inline mr-2"></i>
                                            Print Label
                                        </button>
                                        <button class="border-2 border-orange-600 text-orange-600 px-6 rounded-xl font-bold hover:bg-orange-50 transition-all">
                                            Mark as Shipped
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Bulk Actions -->
                    <div class="glass-card p-6 rounded-2xl bg-blue-50">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-bold mb-1">Bulk Shipping</h3>
                                <p class="text-sm text-slate-600">Process multiple orders at once</p>
                            </div>
                            <button class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                Process Selected Orders
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        returns() {
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Returns Processing</h1>

                    <div class="space-y-4">
                        ${[1, 2, 3].map(i => `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 class="text-xl font-bold mb-1">Return #RET-${1000 + i}</h3>
                                        <p class="text-sm text-slate-600">Original Order: #${i + 100}</p>
                                    </div>
                                    <span class="badge-${i === 1 ? 'orange' : 'blue'} px-3 py-1 rounded-full text-xs font-bold">
                                        ${i === 1 ? 'Pending Inspection' : 'Approved'}
                                    </span>
                                </div>

                                <div class="bg-slate-50 rounded-xl p-4 mb-4">
                                    <div class="flex items-center gap-4 mb-3">
                                        <div class="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                                            <i data-lucide="package" class="w-8 h-8 text-slate-600"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="font-bold">Wireless Headphones</p>
                                            <p class="text-sm text-slate-600">Reason: Defective</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold">$49.99</p>
                                            <p class="text-xs text-slate-500">Qty: 1</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p class="text-xs text-slate-500">Return Method</p>
                                        <p class="font-bold text-sm">${i === 1 ? 'Refund' : 'Exchange'}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-slate-500">Received</p>
                                        <p class="font-bold text-sm">Jan ${15 + i}, 2026</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-slate-500">Condition</p>
                                        <p class="font-bold text-sm">${i === 1 ? 'Pending' : 'Good'}</p>
                                    </div>
                                </div>

                                ${i === 1 ? `
                                    <div class="flex gap-3">
                                        <button class="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all">
                                            Approve & Restock
                                        </button>
                                        <button class="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all">
                                            Reject Return
                                        </button>
                                    </div>
                                ` : `
                                    <div class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
                                        <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
                                        <span class="text-sm font-bold text-green-600">Return processed and item restocked to A1</span>
                                    </div>
                                `}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        reports() {
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">WMS Reports & Analytics</h1>

                    <!-- Summary Stats -->
                    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        ${Components.StatCard('Inventory Value', '$245K', 'dollar-sign', 'green')}
                        ${Components.StatCard('Orders Fulfilled', '1,234', 'check-circle', 'blue', 15)}
                        ${Components.StatCard('Accuracy Rate', '99.2%', 'target', 'orange')}
                        ${Components.StatCard('Avg Pick Time', '3.2 min', 'clock', 'purple')}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Inventory Turnover -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Inventory Turnover</h3>
                            <div class="space-y-4">
                                ${State.getCategories().slice(0, 6).map((cat, i) => {
                const value = 20 + Math.random() * 70;
                return `
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="font-bold text-sm">${cat.name}</span>
                                                <span class="text-sm text-slate-600">${(2 + Math.random() * 3).toFixed(1)}x</span>
                                            </div>
                                            <div class="w-full bg-slate-200 rounded-full h-2">
                                                <div class="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style="width: ${value}%"></div>
                                            </div>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>

                        <!-- Fulfillment Performance -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Fulfillment Performance</h3>
                            <div class="space-y-4">
                                ${['Orders Picked', 'Orders Packed', 'Orders Shipped', 'Same Day Ship'].map((metric, i) => `
                                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <span class="font-bold">${metric}</span>
                                        <span class="text-2xl font-bold text-orange-600">${[156, 142, 138, 89][i]}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Top SKUs by Volume -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Top SKUs by Volume</h3>
                            <div class="space-y-3">
                                ${State.getInventory().slice(0, 5).map((item, i) => `
                                    <div class="flex items-center gap-4">
                                        <span class="text-2xl font-bold text-slate-300">${i + 1}</span>
                                        <div class="flex-1">
                                            <p class="font-bold text-sm">${item.productName}</p>
                                            <p class="text-xs text-slate-500">${item.sku}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold">${(Math.random() * 200 + 100).toFixed(0)} picks</p>
                                            <p class="text-xs text-slate-500">${item.location}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Space Utilization -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Warehouse Space Utilization</h3>
                            <div class="space-y-4">
                                ${['Zone A', 'Zone B', 'Zone C'].map((zone, i) => {
                const utilization = 60 + Math.random() * 30;
                return `
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="font-bold">${zone}</span>
                                                <span class="text-sm font-bold ${utilization > 85 ? 'text-red-600' : 'text-green-600'}">${utilization.toFixed(0)}%</span>
                                            </div>
                                            <div class="w-full bg-slate-200 rounded-full h-3">
                                                <div class="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full" style="width: ${utilization}%"></div>
                                            </div>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
};