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
export const business = {
        home() {
            const suppliers = State.getSuppliers().slice(0, 4);
            const rfqs = State.getRFQs() || [];
            const stats = State.getBusinessStats() || { activeRFQs: 0, suppliers: 0, pendingQuotes: 0, monthlySpend: 0 };

            return `
                <div class="space-y-10 px-4 sm:px-0">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                        <div class="max-w-lg text-center md:text-left">
                            <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">B2B Marketplace</h1>
                            <p class="mb-8 opacity-90 text-lg">Connect with suppliers, request quotes, and streamline your procurement process</p>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button onclick="Router.navigate('/business/suppliers')" class="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all">Find Suppliers</button>
                                <button onclick="Router.navigate('/business/rfq/create')" class="border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all">Create RFQ</button>
                            </div>
                        </div>
                        <img loading="lazy" src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400" class="h-48 md:h-64 rounded-2xl shadow-2xl transform hover:-rotate-2 transition-all duration-500">
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        ${Components.StatCard('Active RFQs', `${stats.activeRFQs || rfqs.length}`, 'file-text', 'purple')}
                        ${Components.StatCard('Suppliers', `${stats.suppliers || suppliers.length}`, 'building', 'blue')}
                        ${Components.StatCard('Pending Quotes', `${stats.pendingQuotes || rfqs.filter(r => r.status === 'open').length}`, 'clipboard-list', 'orange')}
                        ${Components.StatCard('Spend (MTD)', State.formatCurrency(stats.monthlySpend || 0), 'dollar-sign', 'green', 12)}
                    </div>

                    <!-- Active RFQs -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Active RFQs</h2>
                            <a href="#/business/rfq" class="text-blue-600 font-bold hover:underline">View All →</a>
                        </div>
                        <div class="grid grid-cols-1 gap-4">
                            ${(() => {
                    const rfqsList = State.getRFQs() || [];
                    if (rfqsList.length === 0) {
                        return '<div class="glass-card p-8 text-center text-slate-400">No active RFQs. <a href="#/business/rfq/create" class="text-blue-600 font-bold hover:underline">Create one</a> to get started.</div>';
                    }
                    return rfqsList.map(rfq => `
                                <div class="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-lg transition-all border border-transparent hover:border-blue-100">
                                    <div class="flex-1 w-full text-center sm:text-left">
                                        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                                            <h3 class="font-bold text-lg">${rfq.title}</h3>
                                            <span class="badge-${rfq.status === 'open' ? 'blue' : rfq.status === 'quoted' ? 'orange' : 'green'} px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm">${rfq.status}</span>
                                        </div>
                                        <p class="text-sm text-slate-600 mb-3">${rfq.description}</p>
                                        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
                                            <span class="bg-slate-100 px-2 py-1 rounded"><i data-lucide="calendar" class="w-3 h-3 inline mr-1"></i>Due: ${rfq.deadline}</span>
                                            <span class="bg-slate-100 px-2 py-1 rounded"><i data-lucide="package" class="w-3 h-3 inline mr-1"></i>Qty: ${rfq.quantity}</span>
                                            ${rfq.responses ? `<span class="bg-blue-50 text-blue-600 px-2 py-1 rounded"><i data-lucide="message-square" class="w-3 h-3 inline mr-1"></i>${rfq.responses} Responses</span>` : ''}
                                        </div>
                                    </div>
                                    <button onclick="Router.navigate('/business/rfq/${rfq.id}')" class="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                                        View Details <i data-lucide="arrow-right" class="w-4 h-4"></i>
                                    </button>
                                </div>
                                `).join('');
                })()}
                        </div>
                    </div>

                    <!-- Featured Suppliers -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Featured Suppliers</h2>
                            <a href="#/business/suppliers" class="text-blue-600 font-bold hover:underline">View All →</a>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${suppliers.map(supplier => Components.SupplierCard(supplier)).join('')}
                        </div>
                    </div>

                    <!-- B2B Features -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="percent" class="w-8 h-8 text-purple-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Bulk Pricing</h3>
                            <p class="text-sm text-slate-500">Up to 40% off on bulk orders</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="headphones" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Dedicated Support</h3>
                            <p class="text-sm text-slate-500">Personal account manager</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="clock" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Fast Fulfillment</h3>
                            <p class="text-sm text-slate-500">Priority processing</p>
                        </div>
                    </div>
                </div>
            `;
        },

        suppliers() {
            const suppliers = State.getSuppliers();
            window.currentSuppliers = suppliers;

            return `
                <div>
                    ${Components.Breadcrumbs([
                { label: 'Home', link: '/' },
                { label: 'Supplier Directory' }
            ])}

                    <div class="flex flex-col md:flex-row gap-8">
                        <!-- Filters Sidebar -->
                        <aside class="w-full md:w-64 space-y-6">
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-slate-800">Location</h3>
                                <div class="space-y-2 text-sm">
                                    ${['China', 'USA', 'India', 'Germany', 'Vietnam'].map(location => `
                                        <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                                            <input type="checkbox" class="rounded">
                                            <span>${location}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-slate-800">Certifications</h3>
                                <div class="space-y-2 text-sm">
                                    ${['ISO 9001', 'ISO 14001', 'BSCI', 'FDA', 'CE'].map(cert => `
                                        <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                                            <input type="checkbox" class="rounded">
                                            <span>${cert}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-slate-800">Minimum Order</h3>
                                <select class="w-full p-3 rounded-xl border bg-white/50 outline-none text-sm">
                                    <option>Any</option>
                                    <option>Under 100 units</option>
                                    <option>100-500 units</option>
                                    <option>500+ units</option>
                                </select>
                            </div>
                        </aside>

                        <!-- Suppliers Grid -->
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-6">
                                <p class="text-sm text-slate-500">${suppliers.length} suppliers found</p>
                                <select class="bg-transparent border rounded-lg px-4 py-2 text-sm font-bold text-slate-800 outline-none">
                                    <option>Sort by: Recommended</option>
                                    <option>Rating: High to Low</option>
                                    <option>Response Time</option>
                                    <option>Transaction Level</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${suppliers.map(supplier => Components.SupplierCard(supplier)).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        supplierDetail(supplierId) {
            const supplier = (Data.suppliers || []).find(s => s.id === parseInt(supplierId));
            if (!supplier) return Components.EmptyState('building', 'Supplier Not Found', 'The supplier you\'re looking for doesn\'t exist');

            const products = Data.products.filter(p => p.supplierId === supplier.id);
            window.currentProducts = products;

            return `
                <div class="max-w-7xl mx-auto">
                    ${Components.Breadcrumbs([
                { label: 'Home', link: '/' },
                { label: 'Suppliers', link: '/business/suppliers' },
                { label: supplier.name }
            ])}

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Supplier Info -->
                        <div class="lg:col-span-1 space-y-6">
                            <div class="glass-card p-6 rounded-2xl text-center">
                                <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i data-lucide="building" class="w-12 h-12 text-blue-600"></i>
                                </div>
                                <h1 class="text-2xl font-bold mb-2">${supplier.name}</h1>
                                <div class="flex items-center justify-center gap-2 mb-4">
                                    <div class="flex text-orange-400">
                                        ${Components.StarRating(supplier.rating)}
                                    </div>
                                    <span class="text-sm text-slate-400">(${supplier.reviews} reviews)</span>
                                </div>
                                <p class="text-sm text-slate-600 mb-4">${supplier.location}</p>
                                
                                <div class="flex gap-2">
                                    <button onclick="Router.navigate('/business/rfq/create?supplier=${supplier.id}')" class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                        Request Quote
                                    </button>
                                    <button class="border-2 border-slate-300 px-4 rounded-xl hover:bg-slate-50 transition-all">
                                        <i data-lucide="message-circle" class="w-5 h-5 text-slate-600"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Company Details</h3>
                                <div class="space-y-3 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Transaction Level</span>
                                        <span class="font-bold text-green-600">${supplier.transactionLevel}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Response Time</span>
                                        <span class="font-bold">${supplier.responseTime}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Minimum Order</span>
                                        <span class="font-bold">${supplier.moq} units</span>
                                    </div>
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">About Us</h3>
                                <p class="text-sm text-slate-600 mb-6">${supplier.about_me || 'A premium supplier on our platform.'}</p>
                                
                                <h3 class="font-bold mb-4">Certifications</h3>
                                <div class="flex flex-wrap gap-2 mb-6">
                                    ${(supplier.certifications || []).map(cert => `
                                        <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <i data-lucide="award" class="w-3 h-3"></i> ${cert.name || cert}
                                        </span>
                                    `).join('')}
                                </div>
                                
                                ${(supplier.factory_tours || []).length > 0 ? `
                                    <h3 class="font-bold mb-4">Factory Virtual Tours</h3>
                                    <div class="space-y-2 mb-6">
                                        ${supplier.factory_tours.map(tour => `
                                            <a href="${tour}" target="_blank" class="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                                <i data-lucide="video" class="w-4 h-4"></i> View Factory Tour
                                            </a>
                                        `).join('')}
                                    </div>
                                ` : ''}

                                ${(supplier.verified_videos || []).length > 0 ? `
                                    <h3 class="font-bold mb-4">Verified Videos</h3>
                                    <div class="grid grid-cols-2 gap-2">
                                        ${supplier.verified_videos.map(video => `
                                            <div class="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                <a href="${video}" target="_blank" title="Play Video">
                                                    <i data-lucide="play-circle" class="w-8 h-8 text-blue-600 hover:scale-110 transition-transform"></i>
                                                </a>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Products -->
                        <div class="lg:col-span-2">
                            <div class="mb-6">
                                <h2 class="text-2xl font-bold mb-2">Products from ${supplier.name}</h2>
                                <p class="text-slate-600">${products.length} products available</p>
                            </div>
                            
                            ${products.length > 0 ? `
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    ${products.map(product => Components.ProductCard(product, { showBulkPrice: true })).join('')}
                                </div>
                            ` : Components.EmptyState('package', 'No Products Yet', 'This supplier hasn\'t listed any products')}
                        </div>
                    </div>
                </div>
            `;
        },

        rfqCreate(params = {}) {
            const supplierId = params.supplier;
            const supplier = supplierId ? Data.suppliers.find(s => s.id === parseInt(supplierId)) : null;

            return `
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Create RFQ (Request for Quotation)</h1>

                    <form id="rfqForm" class="space-y-6">
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="file-text" class="w-5 h-5 text-blue-600"></i>
                                Basic Information
                            </h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">RFQ TITLE *</label>
                                    <input type="text" required placeholder="e.g., 1000 Units of Wireless Headphones" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">PRODUCT CATEGORY *</label>
                                    <select required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        <option value="">Select category...</option>
                                        ${(Data.categories || []).map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">DETAILED DESCRIPTION *</label>
                                    <textarea rows="4" required placeholder="Provide detailed specifications and requirements..." class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="package" class="w-5 h-5 text-blue-600"></i>
                                Quantity & Specifications
                            </h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">QUANTITY *</label>
                                    <input type="number" required min="1" placeholder="1000" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">UNIT</label>
                                    <select class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        <option>Pieces</option>
                                        <option>Cartons</option>
                                        <option>Pallets</option>
                                        <option>Containers</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">TARGET PRICE (per unit)</label>
                                    <input type="number" step="0.01" placeholder="10.00" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">CURRENCY</label>
                                    <select class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>GBP</option>
                                        <option>CNY</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="calendar" class="w-5 h-5 text-blue-600"></i>
                                Timeline & Delivery
                            </h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">QUOTE DEADLINE *</label>
                                    <input type="date" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">DELIVERY DEADLINE</label>
                                    <input type="date" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div class="col-span-1 sm:col-span-2">
                                    <label class="text-xs font-bold text-slate-600 ml-1">SHIPPING TERMS</label>
                                    <select class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        <option>FOB (Free On Board)</option>
                                        <option>CIF (Cost, Insurance & Freight)</option>
                                        <option>EXW (Ex Works)</option>
                                        <option>DDP (Delivered Duty Paid)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        ${supplier ? `
                            <div class="glass-card p-6 rounded-2xl bg-blue-50">
                                <div class="flex items-center gap-3">
                                    <i data-lucide="info" class="w-5 h-5 text-blue-600"></i>
                                    <div>
                                        <p class="font-bold">Sending to: ${supplier.name}</p>
                                        <p class="text-sm text-slate-600">${supplier.location}</p>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Send to Suppliers</h3>
                                <div class="space-y-2">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" class="rounded">
                                        <span class="text-sm">Send to all verified suppliers</span>
                                    </label>
                                    <p class="text-xs text-slate-500 ml-6">Your RFQ will be sent to ${Data.suppliers.length} verified suppliers matching your category</p>
                                </div>
                            </div>
                        `}

                        <div class="flex flex-col sm:flex-row gap-4">
                            <button type="submit" class="flex-1 bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all text-center">
                                Submit RFQ
                            </button>
                            <button type="button" onclick="Router.navigate('/business/rfq')" class="flex-1 sm:flex-none border-2 border-slate-300 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all text-center">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            `;
        },

        rfq() {
            const rfqs = Data.rfqs;

            return `
                <div class="max-w-6xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold">My RFQs</h1>
                        <button onclick="Router.navigate('/business/rfq/create')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                            <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
                            Create RFQ
                        </button>
                    </div>

                    <!-- Status Tabs -->
                    <div class="flex gap-2 mb-6">
                        <button class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">All (${(rfqs || []).length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50 transition-all">Open (${(rfqs || []).filter(r => r.status === 'open').length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50 transition-all">Quoted (${(rfqs || []).filter(r => r.status === 'quoted').length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50 transition-all">Closed (${(rfqs || []).filter(r => r.status === 'closed').length})</button>
                    </div>

                    <!-- RFQ List -->
                    <div class="space-y-4">
                        ${(rfqs || []).map(rfq => `
                            <div class="glass-card p-6 rounded-2xl hover:shadow-lg transition-all">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-3 mb-2">
                                            <h3 class="text-xl font-bold">${rfq.title}</h3>
                                            <span class="badge-${rfq.status === 'open' ? 'blue' : rfq.status === 'quoted' ? 'orange' : 'green'} px-3 py-1 rounded-full text-xs font-bold capitalize">${rfq.status}</span>
                                        </div>
                                        <p class="text-slate-600 mb-3">${rfq.description}</p>
                                        <div class="flex items-center gap-6 text-sm text-slate-500">
                                            <span><i data-lucide="package" class="w-4 h-4 inline mr-1"></i>Qty: ${rfq.quantity}</span>
                                            <span><i data-lucide="calendar" class="w-4 h-4 inline mr-1"></i>Deadline: ${rfq.deadline}</span>
                                            ${rfq.responses ? `<span><i data-lucide="message-square" class="w-4 h-4 inline mr-1"></i>${rfq.responses} Quotes Received</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="Router.navigate('/business/rfq/${rfq.id}')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                            View Quotes
                                        </button>
                                        <button class="border-2 border-slate-300 px-4 rounded-xl hover:bg-slate-50 transition-all">
                                            <i data-lucide="more-vertical" class="w-5 h-5 text-slate-600"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    ${rfqs.length === 0 ? Components.EmptyState('file-text', 'No RFQs Yet', 'Create your first RFQ to get quotes from suppliers', '<button onclick="Router.navigate(\'/business/rfq/create\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Create RFQ</button>') : ''}
                </div>
            `;
        },

        quotes() {
            return `
                <div class="max-w-6xl mx-auto px-4 sm:px-0">
                    <h1 class="text-3xl font-bold mb-8">Quote Management</h1>

                    <div class="grid grid-cols-1 gap-6">
                        ${[1, 2, 3].map(i => `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-4 gap-4 text-center sm:text-left">
                                    <div class="flex flex-col sm:flex-row items-center gap-4">
                                        <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <i data-lucide="building" class="w-8 h-8 text-blue-600"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-lg">Acme Manufacturing Co.</h3>
                                            <div class="flex justify-center sm:justify-start text-orange-400 text-sm">
                                                ${Components.StarRating(4.5)}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-center sm:text-right">
                                        <p class="text-3xl font-bold text-blue-600">${State.formatCurrency(8.50 + i * 0.5, 'USD')}</p>
                                        <p class="text-xs text-slate-400">per unit</p>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
                                    <div class="p-3 bg-slate-50 rounded-xl text-center sm:text-left">
                                        <p class="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Quantity</p>
                                        <p class="font-bold text-slate-800">1,000 units</p>
                                    </div>
                                    <div class="p-3 bg-slate-50 rounded-xl text-center sm:text-left">
                                        <p class="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Total</p>
                                        <p class="font-bold text-slate-800">${State.formatCurrency((8.50 + i * 0.5) * 1000, 'USD')}</p>
                                    </div>
                                    <div class="p-3 bg-slate-50 rounded-xl text-center sm:text-left">
                                        <p class="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Lead Time</p>
                                        <p class="font-bold text-slate-800">${15 + i * 5} days</p>
                                    </div>
                                    <div class="p-3 bg-slate-50 rounded-xl text-center sm:text-left">
                                        <p class="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Valid Until</p>
                                        <p class="font-bold text-slate-800">Jan ${20 + i}, 2026</p>
                                    </div>
                                </div>

                                <div class="flex flex-col sm:flex-row gap-3">
                                    <button class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
                                        Accept Quote
                                    </button>
                                    <button class="flex-1 sm:flex-none border-2 border-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                        Message Supplier
                                    </button>
                                    <button class="flex-1 sm:flex-none border-2 border-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                        Compare
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        account() {
            const user = State.getUser() || { name: 'Business Account', email: 'business@company.com' };
            const stats = State.getBusinessStats() || { activeRFQs: 0, pendingQuotes: 0, totalSpend: 0 };

            return `
                <div class="max-w-6xl mx-auto px-4 sm:px-0">
                    <h1 class="text-3xl font-bold mb-8">Business Account</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- Sidebar -->
                        <div class="space-y-2">
                            <button onclick="Router.navigate('/business/account')" class="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-left shadow-lg">
                                <i data-lucide="building" class="w-5 h-5 inline mr-2"></i>
                                Dashboard
                            </button>
                            <button onclick="Router.navigate('/business/rfq')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="file-text" class="w-5 h-5 inline mr-2"></i>
                                My RFQs
                            </button>
                            <button onclick="Router.navigate('/business/quotes')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="clipboard-list" class="w-5 h-5 inline mr-2"></i>
                                Quotes
                            </button>
                            <button onclick="Router.navigate('/account/orders')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="package" class="w-5 h-5 inline mr-2"></i>
                                Orders
                            </button>
                            <button onclick="Router.navigate('/business/suppliers')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="users" class="w-5 h-5 inline mr-2"></i>
                                Suppliers
                            </button>
                            <button onclick="Router.navigate('/account/profile')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="settings" class="w-5 h-5 inline mr-2"></i>
                                Settings
                            </button>
                            <button onclick="Auth.logout()" class="w-full p-4 glass-card rounded-xl font-bold text-left text-red-600 hover:bg-red-50 transition-all">
                                <i data-lucide="log-out" class="w-5 h-5 inline mr-2"></i>
                                Logout
                            </button>
                        </div>

                        <!-- Main Content -->
                        <div class="lg:col-span-3 space-y-6">
                            <!-- Welcome Card -->
                            <div class="glass-card p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl relative overflow-hidden">
                                <div class="relative z-10">
                                    <h2 class="text-2xl font-bold mb-2">Welcome back, ${user.name}!</h2>
                                    <p class="opacity-90">${user.email}</p>
                                </div>
                                <i data-lucide="building-2" class="absolute right-4 bottom-4 w-32 h-32 text-white opacity-10 -rotate-12"></i>
                            </div>

                            <!-- Stats -->
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                ${Components.StatCard('Active RFQs', `${stats.activeRFQs || '0'}`, 'file-text', 'purple')}
                                ${Components.StatCard('Pending Quotes', `${stats.pendingQuotes || '0'}`, 'clipboard-list', 'blue')}
                                ${Components.StatCard('Total Spend', `₦${(stats.totalSpend || 0).toLocaleString()}`, 'dollar-sign', 'green', 12)}
                            </div>

                            <!-- Recent Activity -->
                            <div>
                                <h3 class="text-xl font-bold mb-4">Recent Activity</h3>
                                <div class="space-y-3">
                                    ${[
                    { action: 'New quote received', detail: 'Wireless Headphones - $8.50/unit', time: '2 hours ago', icon: 'message-square', color: 'blue' },
                    { action: 'RFQ created', detail: '500 Units of Smart Watches', time: '1 day ago', icon: 'file-plus', color: 'green' },
                    { action: 'Quote accepted', detail: 'USB Cables - Order placed', time: '2 days ago', icon: 'check-circle', color: 'purple' }
                ].map(activity => `
                                        <div class="glass-card p-4 rounded-xl flex items-center gap-4">
                                            <div class="w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center">
                                                <i data-lucide="${activity.icon}" class="w-5 h-5 text-${activity.color}-600"></i>
                                            </div>
                                            <div class="flex-1">
                                                <p class="font-bold">${activity.action}</p>
                                                <p class="text-sm text-slate-600">${activity.detail}</p>
                                            </div>
                                            <p class="text-xs text-slate-400">${activity.time}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
}

