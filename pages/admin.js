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
export const admin = {
        home() {
            const state = State.get();
            const stats = state.adminStats || {
                total_revenue: 0,
                total_users: 0,
                active_orders: 0,
                total_products: 0,
                recent_activity: [],
                user_counts: []
            };

            return `
                <div class="space-y-10 px-4 sm:px-0">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-slate-800 to-slate-900 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                        <div class="max-w-lg text-center md:text-left">
                            <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">Admin Console</h1>
                            <p class="mb-8 opacity-90 text-lg">Oversee platform operations, manage users, and monitor system performance.</p>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button onclick="Router.navigate('/admin/users')" class="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all">Manage Users</button>
                                <button onclick="Router.navigate('/admin/reports')" class="border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all">System Reports</button>
                            </div>
                        </div>
                        <img loading="lazy" src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400" class="h-48 md:h-64 rounded-2xl shadow-2xl opacity-80 transform hover:-rotate-2 transition-all duration-500">
                    </div>

                    <!-- Platform Stats -->
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        ${Components.StatCard('Total Revenue', '₦' + Number(stats.total_revenue).toLocaleString(), 'dollar-sign', 'green')}
                        ${Components.StatCard('Total Users', stats.total_users.toString(), 'users', 'blue')}
                        ${Components.StatCard('Active Orders', stats.active_orders.toString(), 'shopping-cart', 'orange')}
                        ${Components.StatCard('Total Products', stats.total_products.toString(), 'package', 'purple')}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Recent Activity -->
                        <div class="glass-card p-6 rounded-2xl">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="font-bold flex items-center gap-2">
                                    <i data-lucide="activity" class="w-5 h-5 text-blue-600"></i>
                                    Recent System Activity
                                </h3>
                                <button onclick="Router.navigate('/admin/reports')" class="text-xs font-bold text-blue-600 hover:underline">View Logs</button>
                            </div>
                            <div class="space-y-4">
                                ${stats.recent_activity.length > 0 ? stats.recent_activity.map((act, i) => `
                                    <div class="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all">
                                        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <i data-lucide="${act.action && act.action.includes('USER') ? 'user' : act.action && act.action.includes('PRODUCT') ? 'package' : 'activity'}" class="w-5 h-5 text-slate-500"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-bold text-slate-800">
                                                ${act.actor_name || 'System'}: ${act.action ? act.action.replace(/_/g, ' ') : 'Action'}
                                            </p>
                                            <p class="text-xs text-slate-500">
                                                Target: ${act.target || 'N/A'}
                                            </p>
                                        </div>
                                        <span class="text-xs text-slate-400 font-bold">${new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                `).join('') : '<p class="text-slate-400 text-center py-4">No recent activity</p>'}
                            </div>
                        </div>

                        <!-- User Distribution -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6 flex items-center gap-2">
                                <i data-lucide="pie-chart" class="w-5 h-5 text-purple-600"></i>
                                User Distribution
                            </h3>
                            <div class="space-y-6">
                                ${(() => {
                    const roles = ['consumer', 'business', 'dropshipper', 'supplier', 'admin', 'warehouse'];
                    const colorMap = { consumer: 'blue', business: 'purple', dropshipper: 'green', supplier: 'orange', admin: 'red', warehouse: 'slate' };
                    const labelMap = { consumer: 'Consumers', business: 'Business Accounts', dropshipper: 'Dropshippers', supplier: 'Suppliers', admin: 'Admins', warehouse: 'Warehouse' };
                    const total = stats.total_users || 1;

                    return roles.map(role => {
                        const countObj = stats.user_counts?.find(u => u.role === role);
                        const count = countObj ? Number(countObj.count) : 0;
                        const percent = (count / total) * 100;
                        if (count === 0 && role !== 'admin') return ''; // Don't show empty except admin

                        return `
                                    <div>
                                        <div class="flex justify-between text-sm font-bold mb-2">
                                            <span>${labelMap[role]}</span>
                                            <span class="text-slate-500">${count.toLocaleString()}</span>
                                        </div>
                                        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-${colorMap[role]}-500 rounded-full" style="width: ${percent}%"></div>
                                        </div>
                                    </div>
                        `;
                    }).join('');
                })()}
                            </div>
                            <div class="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                                <i data-lucide="info" class="w-6 h-6 text-blue-600"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-bold text-blue-800">Growth Insight</p>
                                    <p class="text-xs text-blue-600">Business accounts grew by 15% this month, outpacing consumers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        users() {
            const users = State.get().adminUsers || [];

            return `
                <div class="max-w-7xl mx-auto px-4 sm:px-0">
                    <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 text-center md:text-left">
                        <div>
                            <h1 class="text-3xl font-bold">User Management</h1>
                            <p class="text-slate-600">Manage accounts across all platform roles (${users.length} total)</p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div id="bulk-actions" class="hidden flex gap-2">
                                <button onclick="bulkAdminVerify()" class="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                                    <i data-lucide="check-circle" class="w-4 h-4"></i> Verify Selected
                                </button>
                            </div>
                            <div class="relative w-full sm:w-64">
                                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                                <input type="text" placeholder="Search users by name, email..." oninput="window.adminUserSearch(this.value)" class="pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 w-full">
                            </div>
                            <button onclick="State.fetchAdminUsers().then(() => Router.refresh())" class="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <div class="glass-card rounded-2xl overflow-hidden mb-12">
                        <div class="border-b border-slate-100 bg-slate-50/50 p-2 flex gap-1 overflow-x-auto scrollbar-hide">
                            <button onclick="State.fetchAdminUsers({ role: 'all' }).then(() => Router.refresh())" class="px-4 py-2 ${(!State.get().lastAdminFilters?.role || State.get().lastAdminFilters?.role === 'all') ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'} rounded-xl text-xs font-black uppercase tracking-widest transition-all">All Users</button>
                            <button onclick="State.fetchAdminUsers({ role: 'consumer' }).then(() => Router.refresh())" class="px-4 py-2 ${(State.get().lastAdminFilters?.role === 'consumer') ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'} rounded-xl text-xs font-black uppercase tracking-widest transition-all">Consumers</button>
                            <button onclick="State.fetchAdminUsers({ role: 'business' }).then(() => Router.refresh())" class="px-4 py-2 ${(State.get().lastAdminFilters?.role === 'business') ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'} rounded-xl text-xs font-black uppercase tracking-widest transition-all">Business</button>
                            <button onclick="State.fetchAdminUsers({ role: 'dropshipper' }).then(() => Router.refresh())" class="px-4 py-2 ${(State.get().lastAdminFilters?.role === 'dropshipper') ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'} rounded-xl text-xs font-black uppercase tracking-widest transition-all">Dropshippers</button>
                            <button onclick="State.fetchAdminUsers({ role: 'supplier' }).then(() => Router.refresh())" class="px-4 py-2 ${(State.get().lastAdminFilters?.role === 'supplier') ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'} rounded-xl text-xs font-black uppercase tracking-widest transition-all">Suppliers</button>
                            <button onclick="State.fetchAdminUsers({ role: 'admin' }).then(() => Router.refresh())" class="px-4 py-2 ${(State.get().lastAdminFilters?.role === 'admin') ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'} rounded-xl text-xs font-black uppercase tracking-widest transition-all">Admins</button>
                            <div class="w-px h-6 bg-slate-200 mx-2 self-center"></div>
                            <button onclick="State.fetchAdminUsers({ status: 'active' }).then(() => Router.refresh())" class="px-4 py-2 ${(State.get().lastAdminFilters?.status === 'active') ? 'bg-green-600 text-white' : 'hover:bg-slate-100 text-green-600'} rounded-xl text-xs font-black uppercase tracking-widest transition-all">Active</button>
                            <button onclick="State.fetchAdminUsers({ status: 'unverified' }).then(() => Router.refresh())" class="px-4 py-2 ${(State.get().lastAdminFilters?.status === 'unverified') ? 'bg-orange-600 text-white' : 'hover:bg-slate-100 text-orange-600'} rounded-xl text-xs font-black uppercase tracking-widest transition-all">Unverified</button>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full min-w-[800px]">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="p-6 text-left">
                                        <input type="checkbox" id="select-all-users" onchange="window.toggleSelectAllUsers(this)" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                                    </th>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">User</th>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Role</th>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Status</th>
                                    <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Spent</th>
                                    <th class="text-center p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${users.length > 0 ? users.map((user, i) => {
                const isVerifiedText = user.is_verified ? 'Active' : 'Unverified';
                const statusColor = user.is_verified ? 'green' : 'orange';

                return `
                                        <tr class="hover:bg-slate-50/80 transition-colors group">
                                            <td class="p-6">
                                                <input type="checkbox" name="user-select" value="${user.id}" onchange="window.updateBulkUI()" class="user-checkbox w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                                            </td>
                                            <td class="p-6">
                                                <div class="flex items-center gap-4">
                                                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-slate-700">
                                                        ${user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <p class="font-bold text-slate-800">${user.name || 'Unknown'}</p>
                                                        <p class="text-xs text-slate-400">${user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="p-6">
                                                <select onchange="State.updateAdminUser(${user.id}, { role: this.value }).then(() => Router.refresh())" class="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:border-blue-500">
                                                    <option value="consumer" ${user.role === 'consumer' ? 'selected' : ''}>Consumer</option>
                                                    <option value="business" ${user.role === 'business' ? 'selected' : ''}>Business</option>
                                                    <option value="dropshipper" ${user.role === 'dropshipper' ? 'selected' : ''}>Dropshipper</option>
                                                    <option value="supplier" ${user.role === 'supplier' ? 'selected' : ''}>Supplier</option>
                                                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                                    <option value="warehouse" ${user.role === 'warehouse' ? 'selected' : ''}>Warehouse</option>
                                                </select>
                                            </td>
                                            <td class="p-6">
                                                <span class="text-xs font-bold flex items-center gap-1 text-${statusColor}-600">
                                                    <div class="w-2 h-2 rounded-full bg-${statusColor}-500"></div>
                                                    ${isVerifiedText}
                                                </span>
                                            </td>
                                            <td class="p-6 text-right font-medium text-slate-600">-</td>
                                            <td class="p-6">
                                                <div class="flex items-center justify-center gap-2">
                                                    <button onclick="window.editAdminUser(${user.id}, '${user.role}', ${user.is_verified})" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors" title="Edit User">
                                                        <i data-lucide="edit" class="w-4 h-4"></i>
                                                    </button>
                                                    <button onclick="window.deleteAdminUser(${user.id})" class="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors" title="Delete User">
                                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
            }).join('') : `
                                    <tr>
                                        <td colspan="6" class="p-8 text-center text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                        
                        <div class="p-6 border-t border-slate-100 flex justify-between items-center">
                            <p class="text-sm text-slate-500">Showing ${users.length} users</p>
                        </div>
                    </div>
                </div>
            `;
        },

        reports() {
            return `
                <div class="max-w-7xl mx-auto px-4 sm:px-0">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">System Reports & Logs</h1>
                            <p class="text-slate-600">Monitor service health, audit history, and internal developer logs.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <!-- Service Status -->
                        <div class="glass-card p-6 rounded-2xl md:col-span-1">
                            <h3 class="font-bold text-lg mb-4 flex items-center gap-2"><i data-lucide="activity" class="text-blue-600"></i> Service Status</h3>
                            <div class="space-y-4">
                                <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span class="font-medium text-slate-700">Database API</span>
                                    <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Online</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span class="font-medium text-slate-700">Payment Gateway</span>
                                    <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Online</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span class="font-medium text-slate-700">Email Service</span>
                                    <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">Degraded</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span class="font-medium text-slate-700">Track17 Webhook</span>
                                    <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Online</span>
                                </div>
                            </div>
                        </div>

                        <!-- Developer Logs -->
                        <div class="glass-card p-6 rounded-2xl md:col-span-2 flex flex-col">
                            <h3 class="font-bold text-lg mb-4 flex items-center gap-2"><i data-lucide="terminal" class="text-slate-800"></i> Developer Logs <span class="text-xs bg-slate-200 text-slate-600 px-2 rounded-full ml-auto">Last 24h</span></h3>
                            <div class="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-xs text-green-400 space-y-2 h-[250px]">
                                <div>[2026-03-05 14:32:11] INFO: PaymentService initialized successfully.</div>
                                <div>[2026-03-05 14:35:05] WARN: Deprecated DB connector used in product fetch.</div>
                                <div>[2026-03-05 15:10:22] ERROR: Track17 API timeout on shipment #592841. Retrying (1/3)...</div>
                                <div>[2026-03-05 15:10:25] INFO: Track17 API recovery successful for shipment #592841.</div>
                                <div>[2026-03-05 16:45:00] INFO: Admin user updated configuration 'maintenance_mode' to false.</div>
                                <div>[2026-03-05 18:22:15] DEBUG: Cache miss for category 'electronics', fetching from primary DB.</div>
                                <div>[2026-03-05 19:01:45] INFO: Nightly inventory sync started.</div>
                                <div>[2026-03-05 19:05:12] INFO: Nightly inventory sync completed. 1450 items updated.</div>
                                <div class="text-slate-500 animate-pulse">Waiting for new logs...</div>
                            </div>
                        </div>
                    </div>

                    <!-- Audit History -->
                    <div class="glass-card rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                            <h3 class="font-bold text-lg flex items-center gap-2"><i data-lucide="clipboard-list" class="text-purple-600"></i> Audit History</h3>
                            <div class="flex gap-2 w-full sm:w-auto">
                                <button onclick="State.fetchAdminLogs().then(() => Router.refresh())" class="flex-1 sm:flex-none text-xs font-bold bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2">
                                    <i data-lucide="refresh-cw" class="w-3 h-3"></i> Sync Logs
                                </button>
                                <button onclick="window.offloadAdminLogsToR2()" class="flex-1 sm:flex-none text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                                    <i data-lucide="upload-cloud" class="w-3 h-3"></i> Offload Logs
                                </button>
                                <button onclick="window.exportAdminData('logs')" class="flex-1 sm:flex-none text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                                    <i data-lucide="download" class="w-3 h-3"></i> Export CSV
                                </button>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-slate-100/50">
                                    <tr>
                                        <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Timestamp</th>
                                        <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Actor</th>
                                        <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Action</th>
                                        <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Target</th>
                                        <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${(State.get().adminLogs || []).length > 0 ? State.get().adminLogs.map(log => `
                                        <tr class="hover:bg-slate-50/80 transition-colors">
                                            <td class="p-6 text-sm text-slate-500 whitespace-nowrap">${new Date(log.created_at).toLocaleString()}</td>
                                            <td class="p-6">
                                                <div class="flex items-center gap-2">
                                                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                                                        ${log.actor_name ? log.actor_name.charAt(0) : '?'}
                                                    </div>
                                                    <span class="font-bold text-slate-700">${log.actor_name}</span>
                                                </div>
                                            </td>
                                            <td class="p-6">
                                                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${log.action.includes('DELETE') ? 'bg-red-100 text-red-600' : log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}">
                                                    ${log.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td class="p-6 text-sm text-slate-600">${log.target}</td>
                                            <td class="p-6 text-right text-xs font-mono text-slate-400">${log.ip_address || '-'}</td>
                                        </tr>
                                    `).join('') : `
                                        <tr>
                                            <td colspan="5" class="p-12 text-center text-slate-400">
                                                <div class="flex flex-col items-center gap-2">
                                                    <i data-lucide="database" class="w-8 h-8 text-slate-200"></i>
                                                    <p>No audit logs available for this period.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Log Archives (R2) -->
                    <div class="mt-12 glass-card rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                        <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 class="font-bold text-lg flex items-center gap-2"><i data-lucide="cloud" class="text-blue-600"></i> Cloud Archives (R2)</h3>
                                <p class="text-xs text-slate-500 mt-1">Historical logs offloaded from the database to save space.</p>
                            </div>
                            <button onclick="State.fetchAdminLogs().then(() => Router.refresh())" class="text-xs font-bold bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                                <i data-lucide="refresh-cw" class="w-3 h-3"></i> Sync Archives
                            </button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-slate-100/50">
                                    <tr>
                                        <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">File Name</th>
                                        <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Size</th>
                                        <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Modified</th>
                                        <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${(State.get().adminLogArchives || []).length > 0 ? State.get().adminLogArchives.map(archive => `
                                        <tr class="hover:bg-slate-50/80 transition-colors">
                                            <td class="p-6 text-sm font-mono text-slate-600">${archive.key}</td>
                                            <td class="p-6 text-sm text-slate-500">${(archive.size / 1024).toFixed(2)} KB</td>
                                            <td class="p-6 text-sm text-slate-500">${new Date(archive.lastModified).toLocaleString()}</td>
                                            <td class="p-6 text-right">
                                                <div class="flex gap-2 justify-end">
                                                    <button onclick="window.viewAdminLogArchive('${archive.key}')" class="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                        <i data-lucide="eye" class="w-3 h-3"></i> View
                                                    </button>
                                                    <button onclick="window.downloadAdminLogArchive('${archive.key}')" class="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                        <i data-lucide="download" class="w-3 h-3"></i> Download
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('') : `
                                        <tr>
                                            <td colspan="4" class="p-8 text-center text-slate-400">No log archives found in R2.</td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        },

        orders() {
            const orders = State.get().adminOrders || [];

            return `
                <div class="max-w-7xl mx-auto px-4 sm:px-0">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">Platform Orders</h1>
                            <p class="text-slate-600">Track all orders across the platform</p>
                        </div>
                        <button onclick="State.fetchAdminOrders().then(() => Router.refresh())" class="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <div class="glass-card rounded-2xl overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="text-left p-6 font-bold text-sm text-slate-500">Order ID</th>
                                    <th class="text-left p-6 font-bold text-sm text-slate-500">Customer</th>
                                    <th class="text-left p-6 font-bold text-sm text-slate-500">Date</th>
                                    <th class="text-left p-6 font-bold text-sm text-slate-500">Status</th>
                                    <th class="text-right p-6 font-bold text-sm text-slate-500">Amount</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${orders.length > 0 ? orders.map(order => `
                                    <tr class="hover:bg-slate-50/80 transition-colors">
                                        <td class="p-6 font-mono font-bold text-sm">#${order.id}</td>
                                        <td class="p-6">
                                            <div class="font-bold text-slate-800">${order.customer_name || 'Unknown'}</div>
                                            <div class="text-xs text-slate-500">${order.customer_email || ''}</div>
                                        </td>
                                        <td class="p-6 text-sm text-slate-600">${new Date(order.created_at).toLocaleDateString()}</td>
                                        <td class="p-6">
                                            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-white text-slate-600">
                                                ${order.status}
                                            </span>
                                        </td>
                                        <td class="p-6 text-right font-bold text-slate-800">₦${Number(order.total_amount).toLocaleString()}</td>
                                    </tr>
                                `).join('') : `
                                    <tr><td colspan="5" class="p-8 text-center text-slate-500">No orders found.</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        products() {
            const products = State.get().adminProducts || [];

            return `
                <div class="max-w-7xl mx-auto px-4 sm:px-0">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">Platform Products</h1>
                            <p class="text-slate-600">Manage all products on the platform</p>
                        </div>
                        <button onclick="State.fetchAdminAllProducts().then(() => Router.refresh())" class="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <div class="glass-card rounded-2xl overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="text-left p-6 font-bold text-sm text-slate-500">Product</th>
                                    <th class="text-left p-6 font-bold text-sm text-slate-500">Category</th>
                                    <th class="text-left p-6 font-bold text-sm text-slate-500">Supplier</th>
                                    <th class="text-left p-6 font-bold text-sm text-slate-500">Price</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${products.length > 0 ? products.map(product => `
                                    <tr class="hover:bg-slate-50/80 transition-colors">
                                        <td class="p-6 flex items-center gap-4">
                                            <img loading="lazy" src="${State.getMediaUrl(product.id, 0)}" class="w-12 h-12 rounded-xl object-cover bg-slate-100" onerror="this.src='/assets/placeholder.jpg'" alt="${product.name}">
                                            <span class="font-bold text-slate-800">${product.name}</span>
                                        </td>
                                        <td class="p-6 text-sm text-slate-600">${product.category}</td>
                                        <td class="p-6">
                                            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-white text-slate-600">
                                                ${product.supplier_name || 'In-House'}
                                            </span>
                                        </td>
                                        <td class="p-6 text-sm font-bold text-slate-800">₦${Number(product.price).toLocaleString()}</td>
                                        <td class="p-6 text-center">
                                            <div class="flex items-center justify-center gap-2">
                                                <button onclick="window.editAdminProduct(${product.id}, '${product.category}', ${product.is_sponsored})" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors" title="Edit Product">
                                                    <i data-lucide="edit" class="w-5 h-5"></i>
                                                </button>
                                                <button onclick="State.deleteAdminProduct(${product.id}).then(res => res && Router.refresh())" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors" title="Delete Product">
                                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('') : `
                                    <tr><td colspan="4" class="p-8 text-center text-slate-500">No products found.</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        marketing() {
            const stats = State.get().marketingStats || { reach: { delivered: 0, seen: 0 }, conversion: 0, spend: 0 };
            const coupons = State.get().coupons || [];
            const campaigns = State.get().campaigns || [];

            return `
                <div class="max-w-7xl mx-auto px-4 sm:px-0">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold text-slate-900 font-display">Marketing & Promotions</h1>
                            <p class="text-slate-500">Manage campaigns, coupons, and track real-time reach.</p>
                        </div>
                        <button onclick="State.fetchMarketingData().then(() => Router.refresh(true))" class="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-600" title="Refresh Data">
                            <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <div class="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border-white/50">
                            <div class="flex items-center justify-between mb-8">
                                <h3 class="font-bold text-xl text-slate-800">Promotions & Campaigns</h3>
                                <button onclick="window.openBroadcastModal()" class="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                                    <i data-lucide="megaphone" class="w-4 h-4"></i> Create Broadcast
                                </button>
                            </div>
                            <div class="space-y-4">
                                ${campaigns.length > 0 ? campaigns.map(campaign => `
                                    <div class="group border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all bg-white">
                                        <div class="flex items-center gap-5 flex-1">
                                            <div class="w-14 h-14 ${campaign.type === 'broadcast' ? 'bg-purple-100' : 'bg-blue-100'} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                                <i data-lucide="${campaign.type === 'broadcast' ? 'megaphone' : 'image'}" class="w-7 h-7 ${campaign.type === 'broadcast' ? 'text-purple-600' : 'text-blue-600'}"></i>
                                            </div>
                                            <div>
                                                <h4 class="font-bold text-slate-800 text-lg">${campaign.title}</h4>
                                                <div class="flex items-center gap-2 flex-wrap mt-1">
                                                    <span class="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black uppercase text-slate-500">${campaign.type}</span>
                                                    <span class="px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-black uppercase text-blue-600">${campaign.channel || 'all'}</span>
                                                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${new Date(campaign.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            ${campaign.type === 'broadcast' ? `
                                                <button onclick="State.retryBroadcastCampaign(${campaign.id})" class="p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition-all" title="Resend Broadcast">
                                                    <i data-lucide="rotate-cw" class="w-5 h-5"></i>
                                                </button>
                                            ` : ''}
                                            <button onclick="State.deleteCampaign(${campaign.id})" class="p-3 hover:bg-red-50 text-red-500 rounded-xl transition-all" title="Delete Promotion">
                                                <i data-lucide="trash-2" class="w-5 h-5"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div class="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                        <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 opacity-20"></i>
                                        <p>No active campaigns found</p>
                                    </div>
                                `}
                            </div>
                        </div>

                        <div class="glass-card p-8 rounded-[2.5rem] bg-slate-900 border-none text-white shadow-2xl relative overflow-hidden">
                            <div class="relative z-10">
                                <h3 class="font-bold text-xl mb-8">Reach Analytics</h3>
                                <div class="space-y-10">
                                    <div>
                                        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Delivered</p>
                                        <p class="text-4xl font-black">${stats.reach.delivered.toLocaleString()}</p>
                                        <div class="mt-4 flex items-center gap-2 text-xs text-green-400 bg-green-400/10 w-fit px-2 py-1 rounded-lg">
                                            <i data-lucide="trending-up" class="w-3 h-3"></i> Real-time tracking active
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Seen</p>
                                        <div class="flex items-baseline gap-3">
                                            <p class="text-4xl font-black">${stats.reach.seen.toLocaleString()}</p>
                                            <p class="text-blue-400 font-bold">(${stats.reach.delivered > 0 ? ((stats.reach.seen / stats.reach.delivered) * 100).toFixed(1) : 0}%)</p>
                                        </div>
                                        <div class="w-full bg-white/10 rounded-full h-2.5 mt-4 overflow-hidden">
                                            <div class="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" style="width: ${stats.reach.delivered > 0 ? (stats.reach.seen / stats.reach.delivered) * 100 : 0}%"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Platform ROI</p>
                                        <p class="text-4xl font-black text-green-400">${stats.conversion || '0.0'}%</p>
                                    </div>
                                </div>
                            </div>
                            <!-- Decorative background -->
                            <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
                        </div>
                    </div>

                    <div class="glass-card p-8 rounded-[2.5rem] border-white/50 mb-12 shadow-sm">
                        <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <h3 class="font-bold text-xl text-slate-800">Coupons & Vouchers</h3>
                            <button onclick="window.createCoupon()" class="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                <i data-lucide="plus-circle" class="w-4 h-4"></i> Add Coupon
                            </button>
                        </div>
                        <div class="overflow-x-auto -mx-8 sm:mx-0">
                            <table class="w-full text-sm">
                                <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th class="text-left p-6 first:rounded-l-3xl">Code</th>
                                        <th class="text-left p-6">Discount</th>
                                        <th class="text-left p-6">Usage</th>
                                        <th class="text-left p-6">Status</th>
                                        <th class="text-left p-6">Expiry</th>
                                        <th class="text-right p-6 last:rounded-r-3xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="admin-coupons-list" class="divide-y divide-slate-50">
                                    ${coupons.length > 0 ? coupons.map(c => Components.CouponRow(c)).join('') : `
                                        <tr><td colspan="6" class="p-12 text-center text-slate-400 italic font-medium">No active coupons found.</td></tr>
                                    `}
                                     <!-- Tip Card -->
                    <div class="mt-12 p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden">
                        <div class="relative z-10 flex items-center gap-6">
                            <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <i data-lucide="lightbulb" class="w-8 h-8 text-yellow-300"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold mb-1">Marketing Tip</h3>
                                <p class="text-blue-100 opacity-90 max-w-xl">Use the <b>Campaign Slider</b> to highlight new products on the homepage, and <b>Broadcasts</b> for time-sensitive flash sales. Combined, they increase conversion by up to 40%.</p>
                            </div>
                        </div>
                        <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            `;
        },

        settings() {
            const settings = State.get().adminSettings || {
                platform_name: 'Xperiencestore',
                support_email: 'support@xperiencestore.com',
                maintenance_mode: false,
                feature_registration: true,
                feature_vendor_signup: true,
                feature_reviews: true,
                feature_chat: true
            };

            return `
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Platform Settings</h1>
                    
                    <div class="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-slate-200 mb-8 w-fit">
                        <button class="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold shadow-md">General</button>
                        <button class="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition-all">Payment</button>
                        <button class="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition-all">Security</button>
                        <button class="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition-all">Notifications</button>
                    </div>

                    <div class="space-y-6">
                        <!-- General Info -->
                        <form onsubmit="event.preventDefault(); window.saveAdminSettings(this);" class="glass-card p-8 rounded-2xl">
                            <h3 class="font-bold text-xl mb-6 border-b pb-4">General Information</h3>
                            <div class="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">Platform Name</label>
                                    <input type="text" name="platform_name" value="${settings.platform_name}" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">Support Email</label>
                                    <input type="email" name="support_email" value="${settings.support_email}" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500">
                                </div>
                            </div>
                            
                            <!-- Maintenance Mode -->
                            <div class="mt-8 p-4 bg-slate-50 rounded-xl flex items-center justify-between border-l-4 border-orange-500">
                                <div>
                                    <h3 class="font-bold text-lg">Maintenance Mode</h3>
                                    <p class="text-slate-500 text-sm">Take the site offline for updates. Only admins can access.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="maintenance_mode" class="sr-only peer" ${settings.maintenance_mode ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>

                            <h3 class="font-bold text-xl mt-8 mb-6 border-b pb-4">Feature Toggles</h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-700">User Registration</span>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="feature_registration" class="sr-only peer" ${settings.feature_registration ? 'checked' : ''}>
                                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-700">Vendor Signup</span>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="feature_vendor_signup" class="sr-only peer" ${settings.feature_vendor_signup ? 'checked' : ''}>
                                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-700">Reviews System</span>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="feature_reviews" class="sr-only peer" ${settings.feature_reviews ? 'checked' : ''}>
                                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-700">Live Chat Support</span>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="feature_chat" class="sr-only peer" ${settings.feature_chat ? 'checked' : ''}>
                                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="flex justify-end pt-8 mt-8 border-t">
                                <button type="submit" class="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        }
    };

// Product Image Upload Helpers
// Product & Order Event Handlers
window.editAdminProduct = async (productId, currentCategory, currentSponsored) => {
    const category = prompt('Enter new category:', currentCategory);
    const sponsored = confirm('Mark as Sponsored (Featured on Homepage)?');
    if (category !== null) {
        await State.updateAdminProduct(productId, { category, is_sponsored: sponsored });
        Router.refresh();
    }
};

window.saveAdminSettings = async (form) => {
    const formData = new FormData(form);
    const settings = {
        platform_name: formData.get('platform_name'),
        support_email: formData.get('support_email'),
        maintenance_mode: form.querySelector('[name="maintenance_mode"]').checked,
        feature_registration: form.querySelector('[name="feature_registration"]').checked,
        feature_vendor_signup: form.querySelector('[name="feature_vendor_signup"]').checked,
        feature_reviews: form.querySelector('[name="feature_reviews"]').checked,
        feature_chat: form.querySelector('[name="feature_chat"]').checked,
    };
    await State.updateAdminSettings(settings);
};

window.updateOrderStatus = async (orderId, newStatus) => {
    if (!newStatus) return;

    const success = await State.updateOrderStatus(orderId, newStatus);
    if (success) {
        // Refresh supplier orders
        await State.fetchSupplierOrders();
        // Refresh current page to show updated status
        Router.refresh();
    }
};

window.printInvoice = (orderId) => {
    const orders = State.getSupplierOrders();
    const order = orders.find(o => o.order_id == orderId);

    if (!order) {
        Components.showNotification('Order not found', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    const invoiceHtml = `
        <html>
            <head>
                <title>Invoice #${order.order_id}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
                    .invoice-title { font-size: 32px; font-weight: bold; color: #1e293b; }
                    .details { margin-bottom: 40px; line-height: 1.6; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    th { text-align: left; border-bottom: 1px solid #eee; padding: 15px; color: #64748b; text-transform: uppercase; font-size: 12px; }
                    td { padding: 15px; border-bottom: 1px solid #eee; }
                    .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
                    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 80px; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="invoice-title">INVOICE</div>
                        <p>#${order.order_id}</p>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="margin: 0; color: #2563eb;">Xperiencestore</h2>
                        <p>Supplier Portal Service</p>
                    </div>
                </div>

                <div class="details">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <strong>Billed To:</strong><br>
                            ${order.customer_name || 'Valued Customer'}<br>
                            ${order.customer_email || ''}
                        </div>
                        <div style="text-align: right;">
                            <strong>Order Date:</strong><br>
                            ${new Date(order.created_at).toLocaleDateString()}<br><br>
                            <strong>Status:</strong><br>
                            ${order.status.toUpperCase()}
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">₦${Number(item.price).toLocaleString()}</td>
                                <td style="text-align: right;">₦${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total">
                    Grand Total: ₦${Number(order.order_total).toLocaleString()}
                </div>

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Generated by Xperiencestore Supplier Management System</p>
                </div>

                <script>
                    window.onload = () => { window.print(); window.close(); };
                </script>
            </body>
        </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
};

window.openInvoice = (orderId) => {
    // Similar to printInvoice but titled Packing Slip
    const orders = State.getOrders();
    const order = orders.find(o => o.id == orderId);

    if (!order) {
        Components.showNotification('Order not found', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    const invoiceHtml = `
        <html>
            <head>
                <title>Packing Slip #${order.id}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
                    .invoice-title { font-size: 32px; font-weight: bold; color: #1e293b; }
                    .details { margin-bottom: 40px; line-height: 1.6; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    th { text-align: left; border-bottom: 1px solid #eee; padding: 15px; color: #64748b; text-transform: uppercase; font-size: 12px; }
                    td { padding: 15px; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 80px; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="invoice-title">PACKING SLIP</div>
                        <p>Order #${order.id}</p>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="margin: 0; color: #2563eb;">Xperiencestore</h2>
                        <p>Warehouse Fulfillment</p>
                    </div>
                </div>

                <div class="details">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <strong>Ship To:</strong><br>
                            ${order.customer_name || 'Valued Customer'}<br>
                            ${order.shipping_address || 'Address Not Provided'}
                        </div>
                        <div style="text-align: right;">
                            <strong>Order Date:</strong><br>
                            ${new Date(order.created_at).toLocaleDateString()}<br><br>
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th style="text-align: center;">Qty Ordered</th>
                            <th style="text-align: center;">Picked</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: center;">[ ]</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Processed by Warehouse Team</p>
                    <p>Generated by Xperiencestore WMS</p>
                </div>

                <script>
                    window.onload = () => { window.print(); window.close(); };
                </script>
            </body>
        </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
};

window.completeReceipt = async (orderId) => {
    if (!confirm('Are you sure you want to mark this receipt as completed? This will update inventory levels.')) return;

    try {
        const success = await State.updateOrderStatus(orderId, 'received');
        if (success) {
            Components.showNotification('Receipt completed and inventory updated', 'success');
            await State.fetchOrders();
            Router.refresh();
        }
    } catch (err) {
        console.error('Complete receipt error:', err);
    }
};

window.reportIssue = (orderId) => {
    const reason = prompt('Please describe the issue with this shipment:');
    if (reason) {
        Components.showNotification('Issue reported to supplier', 'info');
        State.logAction('REPORT_ISSUE', `Order #${orderId}: ${reason}`);
    }
};


window.handlePayout = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const payoutData = {
        amount: Number(formData.get('amount')),
        bankName: formData.get('bankName'),
        binNumber: formData.get('binNumber'),
        accountName: formData.get('accountName'),
        currency: 'NGN' // Default
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = 'Processing...';

    const success = await State.requestPayout(payoutData);
    if (success) {
        document.getElementById('payout-modal').classList.add('hidden');
        form.reset();
        Router.refresh();
    }

    submitBtn.disabled = false;
    submitBtn.innerText = originalText;
};

window.submitWRO = async (orderId) => {
    if (!confirm('Submit Warehouse Receiving Order (WRO) with commercial invoice and packing list?')) return;
    const success = await State.submitWRO(orderId);
    if (success) {
        Components.showNotification('WRO sent to warehouse successfully', 'success');
        Router.refresh();
    }
};

window.completeWROReceipt = async (poId) => {
    if (!confirm('Complete receipt for this WRO? This will update warehouse inventory and process supplier payout.')) return;
    const success = await State.completeWROReceipt(poId);
    if (success) {
        Components.showNotification('WRO Receipt completed, inventory updated', 'success');
        Router.refresh();
    }
};

window.updateSupplierProfile = async (form) => {
    const formData = new FormData(form);
    const profileData = {
        about_me: formData.get('about_me'),
        certifications: formData.get('certifications').split(',').map(s => s.trim()).filter(Boolean),
        factory_tours: formData.get('factory_tours').split(',').map(s => s.trim()).filter(Boolean),
        verified_videos: formData.get('verified_videos').split(',').map(s => s.trim()).filter(Boolean)
    };
    const success = await State.updateSupplierProfile(profileData);
    if (success) {
        Components.showNotification('Profile enhancements saved', 'success');
    } else {
        Components.showNotification('Failed to update profile', 'error');
    }
};
window.editInventory = async (productId, currentStock, currentLocation) => {
    const newStock = prompt(`Update stock for Product ID: ${productId}`, currentStock);
    if (newStock === null) return;

    const stockVal = parseInt(newStock);
    if (isNaN(stockVal)) {
        Components.showNotification('Invalid stock value', 'error');
        return;
    }

    const success = await State.updateInventoryStock(productId, stockVal, currentLocation);
    if (success) {
        Router.refresh();
    }
};

window.shipOrder = (orderId) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.id = 'shipping-modal';

    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div class="p-6 border-b flex items-center justify-between bg-blue-600 text-white">
                <h3 class="text-xl font-bold">Fulfill Order #${orderId}</h3>
                <button onclick="document.getElementById('shipping-modal').remove()" class="p-2 hover:bg-white/20 rounded-full transition-all">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            
            <form id="shipping-form" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Carrier</label>
                    <select name="carrier" class="w-full p-4 rounded-2xl border bg-slate-50 outline-none focus:border-blue-600 transition-all font-bold" required>
                        <option value="dhl:DHL Express">DHL Express</option>
                        <option value="fedex:FedEx">FedEx</option>
                        <option value="ups:UPS">UPS</option>
                        <option value="custom:Other">Other Carrier</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Tracking Number</label>
                    <input type="text" name="trackingNumber" placeholder="Enter tracking ID" class="w-full p-4 rounded-2xl border bg-slate-50 outline-none focus:border-blue-600 transition-all" required>
                </div>

                <div class="pt-4 flex gap-3">
                    <button type="button" onclick="document.getElementById('shipping-modal').remove()" class="flex-1 py-4 font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                        Cancel
                    </button>
                    <button type="submit" class="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all">
                        Ship Order
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    lucide.createIcons();

    document.getElementById('shipping-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const [carrierCode, carrierName] = formData.get('carrier').split(':');
        const trackingNumber = formData.get('trackingNumber');

        const success = await State.updateOrderTracking(orderId, {
            trackingNumber,
            carrierCode,
            carrierName: carrierName || carrierCode
        });

        if (success) {
            modal.remove();
            Router.navigate('/warehouse/fulfillment');
        }
    };
};

window.editAdminUser = async (userId, currentRole, isVerified) => {
    const newRole = prompt(`Update role for User ID: ${userId} (consumer, business, dropshipper, supplier, admin)`, currentRole);
    if (!newRole) return;

    const validRoles = ['consumer', 'business', 'dropshipper', 'supplier', 'admin'];
    if (!validRoles.includes(newRole.toLowerCase())) {
        Components.showNotification('Invalid role', 'error');
        return;
    }

    const verifiedStatus = confirm('Is user verified?');

    const success = await State.updateAdminUser(userId, {
        role: newRole.toLowerCase(),
        is_verified: verifiedStatus
    });

    if (success) {
        await State.fetchAdminUsers();
        Router.refresh();
    }
};

window.editAdminProduct = async (productId) => {
    const products = State.get().adminProducts || [];
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newCategory = prompt('Enter new category:', product.category);
    if (newCategory === null) return;

    const isSponsored = confirm(`Make "${product.name}" a sponsored listing?`);

    const success = await State.updateAdminProduct(productId, {
        category: newCategory,
        is_sponsored: isSponsored
    });

    if (success) {
        await State.fetchAdminAllProducts();
        Router.refresh();
        Components.showNotification('Product updated successfully', 'success');
    }
};

window.deleteAdminProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    const success = await State.deleteAdminProduct(productId);
    if (success) {
        await State.fetchAdminAllProducts();
        Router.refresh();
        Components.showNotification('Product deleted', 'success');
    }
};

window.saveAdminSettings = async (form) => {
    const formData = new FormData(form);
    const settings = {
        platform_name: formData.get('platform_name'),
        support_email: formData.get('support_email'),
        maintenance_mode: formData.get('maintenance_mode') === 'on',
        feature_registration: formData.get('feature_registration') === 'on',
        feature_vendor_signup: formData.get('feature_vendor_signup') === 'on',
        feature_reviews: formData.get('feature_reviews') === 'on',
        feature_chat: formData.get('feature_chat') === 'on'
    };

    const success = await State.updateAdminSettings(settings);
    if (success) {
        Components.showNotification('Settings saved successfully', 'success');
    }
};

window.exportAdminData = (type, format = 'csv') => {
    let data = [];
    let filename = `export_${type}_${new Date().toISOString().split('T')[0]}`;

    if (type === 'users') data = State.get().adminUsers || [];
    else if (type === 'products') data = State.get().adminProducts || [];
    else if (type === 'orders') data = State.get().adminOrders || [];
    else if (type === 'logs') data = State.get().adminLogs || [];

    if (data.length === 0) {
        Components.showNotification('No data to export', 'warning');
        return;
    }

    if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
    } else {
        // CSV Export: sanitize and generate
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const val = row[header];
                return `"${String(val || '').replace(/"/g, '""')}"`;
            }).join(','))
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
    }
    Components.showNotification(`Data exported as ${format.toUpperCase()}`, 'success');
};

// Admin Bulk Actions
window.toggleSelectAllUsers = (el) => {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    checkboxes.forEach(cb => cb.checked = el.checked);
    window.updateBulkUI();
};

window.updateBulkUI = () => {
    const selectedCount = document.querySelectorAll('.user-checkbox:checked').length;
    const bulkBar = document.getElementById('bulk-actions');
    if (bulkBar) {
        if (selectedCount > 0) bulkBar.classList.remove('hidden');
        else bulkBar.classList.add('hidden');
    }
};

window.bulkAdminVerify = async () => {
    const selected = Array.from(document.querySelectorAll('.user-checkbox:checked')).map(cb => cb.value);
    if (selected.length === 0) return;
    if (!confirm(`Are you sure you want to verify ${selected.length} users?`)) return;

    const success = await State.bulkVerifyAdminUsers(selected);
    if (success) {
        await State.fetchAdminUsers();
        Router.refresh();
    }
};

window.broadcastAdminNotification = async (form) => {
    const formData = new FormData(form);
    const data = {
        title: formData.get('title'),
        message: formData.get('message'),
        type: formData.get('type') || 'info',
        role: formData.get('role') || null,
        channel: formData.get('channel') || 'push'
    };

    if (!data.title || !data.message) {
        Components.showNotification('Title and Message are required', 'warning');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Dispatching...';

    const success = await State.broadcastAdminNotification(data);
    if (success) {
        form.reset();
        Components.showNotification(`Broadcast launched via ${data.channel.toUpperCase()}`, 'success');
        // Refresh analytics immediately
        await State.fetchMarketingData();
        Router.refresh(true);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Launch Broadcast';
    if (window.lucide) lucide.createIcons();
};

window.adminUserSearch = debounce((search) => {
    State.fetchAdminUsers({ search }).then(() => Router.refresh());
}, 500);

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.viewAdminLogArchive = async (key) => {
    const content = await State.fetchAdminLogArchive(key);
    if (content) {
        const logString = JSON.stringify(content, null, 2);
        const win = window.open("", "_blank");
        win.document.write(`<html><head><title>Archive: ${key}</title></head><body style="margin:0; background:#0f172a;"><pre style="background: #1e293b; color: #4ade80; padding: 20px; font-family: monospace; white-space: pre-wrap; word-break: break-all;">${logString}</pre></body></html>`);
    } else {
        if (window.Components && window.Components.showNotification) {
            window.Components.showNotification("Failed to load archive content", "error");
        } else {
            alert("Failed to load archive content");
        }
    }
};

window.downloadAdminLogArchive = async (key) => {
    try {
        const content = await State.fetchAdminLogArchive(key);
        if (content) {
            const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = key.split('/').pop() || 'audit_log.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.Components && window.Components.showNotification) {
                window.Components.showNotification("Archive download triggered successfully", "success");
            }
        } else {
            throw new Error("Empty archive content received");
        }
    } catch (err) {
        console.error('Download error:', err);
        if (window.Components && window.Components.showNotification) {
            window.Components.showNotification("Failed to download archive content", "error");
        } else {
            alert("Failed to download archive content");
        }
    }
};

window.offloadAdminLogsToR2 = async () => {
    try {
        if (window.Components && window.Components.showNotification) {
            window.Components.showNotification("Initiating chunked offload to R2 storage...", "info");
        }
        
        const session = localStorage.getItem('xperince_session');
        const token = session ? JSON.parse(session).token : '';
        
        const response = await fetch(window.apiUrl('/api/admin/logs/offload'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            if (window.Components && window.Components.showNotification) {
                window.Components.showNotification(data.message, "success");
            } else {
                alert(data.message);
            }
            // Sync/Fetch updated logs and archives
            await State.fetchAdminLogs();
            window.Router.refresh();
        } else {
            throw new Error(data.message || "Failed to offload logs");
        }
    } catch (err) {
        console.error('Offload error:', err);
        if (window.Components && window.Components.showNotification) {
            window.Components.showNotification(err.message || "Failed to offload logs", "error");
        } else {
            alert(err.message || "Failed to offload logs");
        }
    }
};
