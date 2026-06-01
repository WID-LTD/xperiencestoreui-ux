/**
 * pages.js - All Page Templates
 * Centralized page rendering for all user types
 */

import { Data } from './data.js?v=3.3.4';
import { State } from './state.js?v=3.3.4';
import { Router } from './router.js?v=3.3.4';
import { Components } from './components.js?v=3.3.4';
import { Tracking } from './tracking.js?v=3.3.4';
import { Auth } from './auth.js?v=3.3.4';

import { consumer } from './pages/consumer.js?v=3.3.4';
import { business } from './pages/business.js?v=3.3.4';
import { dropshipper } from './pages/dropshipper.js?v=3.3.4';
import { supplier } from './pages/supplier.js?v=3.3.4';
import { admin } from './pages/admin.js?v=3.3.4';
import { warehouse } from './pages/warehouse.js?v=3.3.4';

export const Pages = {
    consumer,
    business,
    dropshipper,
    supplier,
    admin,
    warehouse,
    // ==================== SHARED PAGES ====================
    chat() {
        return `
            <div class="h-[calc(100vh-80px)] flex bg-slate-50 overflow-hidden">
                <!-- Sidebar -->
                <div class="w-full md:w-80 border-r border-slate-200 bg-white flex flex-col">
                    <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 class="text-xl font-bold text-slate-800">Support Center</h2>
                        <button onclick="Chat.fetchConversations()" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <i data-lucide="rotate-cw" class="w-5 h-5 text-slate-500"></i>
                        </button>
                    </div>
                    <div id="chat-sidebar-list" class="flex-1 overflow-y-auto">
                        <div class="p-8 text-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                            <p class="text-sm text-slate-400">Loading conversations...</p>
                        </div>
                    </div>
                </div>

                <!-- Main Chat Area -->
                <div id="chat-messages-container" class="hidden md:flex flex-1 flex-col bg-slate-50 relative">
                    <div class="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <i data-lucide="message-square" class="w-12 h-12 text-blue-600"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-slate-800 mb-2">Welcome to Support</h3>
                        <p class="text-slate-500 max-w-sm">Select a conversation from the list to start chatting with our team. We're here to help!</p>
                    </div>
                </div>
            </div>
        `;
    },

    paymentVerify(params) {
        // Parse possible Paystack root URL query parameters
        const searchParams = new URLSearchParams(window.location.search);

        const gateway = params.gateway || searchParams.get('gateway') || 'paystack';
        const status = params.status || 'success';
        const ref = params.ref || searchParams.get('reference') || searchParams.get('trxref') || params.reference;

        // === STEP 1: Immediately clean the messy Paystack query params from the URL ===
        // This physically removes ?trxref=...&reference=... from the browser address bar right away.
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '/#/payment-status');
        }

        // === STEP 2: Background verification with server ===
        setTimeout(async () => {
            const verifyingEl = document.getElementById('payment-verifying');
            const successEl = document.getElementById('payment-success');
            const failedEl = document.getElementById('payment-failed-msg');

            try {
                // If Paystack already redirected us here and provided status=success,
                // we can trust it and navigate directly if the backend already verified.
                const session = Auth.getUserSession();
                const response = await fetch(window.apiUrl(`/api/payment/verify?gateway=${gateway}&ref=${ref}&status=${status}`), {
                    headers: { 'Authorization': `Bearer ${session?.token || ''}` }
                });

                // Backend may return JSON or issue a redirect (handled by fetch as a resolved response)
                let result = {};
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                } else {
                    // Backend issued a redirect (302 G�� to /account/orders), treat as success
                    result = { success: true };
                }

                if (result.success || response.ok) {
                    State.clearCart();
                    if (verifyingEl) verifyingEl.classList.add('hidden');
                    if (successEl) successEl.classList.remove('hidden');
                    // Auto-navigate after 2s
                    setTimeout(() => {
                        window.location.href = '/#/account/orders';
                        window.location.reload();
                    }, 2000);
                } else {
                    if (verifyingEl) verifyingEl.classList.add('hidden');
                    if (failedEl) failedEl.classList.remove('hidden');
                    setTimeout(() => Router.navigate('/payment/failed', true), 2000);
                }
            } catch (err) {
                console.error('[PaymentVerify]', err);
                if (verifyingEl) verifyingEl.classList.add('hidden');
                if (failedEl) failedEl.classList.remove('hidden');
                setTimeout(() => Router.navigate('/payment/failed', true), 2000);
            }
        }, 800);

        return `
            <div class="max-w-lg mx-auto text-center py-20 px-6">

                <!-- Verifying State -->
                <div id="payment-verifying">
                    <div class="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                    <h1 class="text-2xl font-bold mb-2 text-slate-900">Verifying Payment...</h1>
                    <p class="text-slate-500">Please wait, we are confirming your payment.</p>
                    <p class="text-xs text-slate-400 mt-4 font-mono">Ref: ${ref || 'N/A'}</p>
                </div>

                <!-- Success State (hidden initially) -->
                <div id="payment-success" class="hidden">
                    <div class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="check-circle" class="w-12 h-12 text-green-600"></i>
                    </div>
                    <h1 class="text-3xl font-bold mb-3 text-slate-900">Payment Successful!</h1>
                    <p class="text-slate-500 mb-8">Your order has been placed and is being processed.</p>
                    <button onclick="window.location.href = '/#/account/orders'; window.location.reload();" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                        <i data-lucide="package" class="w-5 h-5"></i>
                        View My Orders
                    </button>
                    <p class="text-xs text-slate-400 mt-4">Redirecting automatically in a moment...</p>
                </div>

                <!-- Failed State (hidden initially) -->
                <div id="payment-failed-msg" class="hidden">
                    <div class="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="x-circle" class="w-12 h-12 text-red-600"></i>
                    </div>
                    <h1 class="text-3xl font-bold mb-3 text-slate-900">Verification Failed</h1>
                    <p class="text-slate-500 mb-8">We could not verify your payment. If money was deducted, please contact support.</p>
                    <button onclick="Router.navigate('/checkout', true)" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all">
                        Try Again
                    </button>
                </div>

            </div>
        `;
    },

    paymentFailed() {
        return `
            <div class="max-w-md mx-auto text-center py-20">
                <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="x-circle" class="w-12 h-12 text-red-600"></i>
                </div>
                <h1 class="text-3xl font-bold mb-4">Payment Failed</h1>
                <p class="text-slate-600 mb-8">We couldn't process your payment. Please try again or use a different payment method.</p>
                <div class="flex flex-col gap-3">
                    <button onclick="Router.navigate('/checkout')" class="bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
                        Try Again
                    </button>
                    <button onclick="Router.navigate('/support/contact')" class="text-slate-500 font-bold hover:underline">
                        Contact Support
                    </button>
                </div>
            </div>
        `;
    },

    error404() {
        return `
            <div class="min-h-[80vh] flex items-center justify-center p-6">
                <div class="max-w-2xl w-full text-center">
                    <div class="relative mb-12">
                        <h1 class="text-[12rem] font-black text-slate-100 select-none">404</h1>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-32 h-32 bg-blue-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-blue-500/40">
                                <i data-lucide="ghost" class="w-16 h-16 text-white animate-bounce"></i>
                            </div>
                        </div>
                    </div>
                    
                    <h2 class="text-4xl font-bold text-slate-900 mb-4">You've Discovered a Dead End</h2>
                    <p class="text-lg text-slate-600 mb-10 max-w-md mx-auto">
                        The page you are looking for has been moved, deleted, or possibly never existed in this dimension.
                    </p>
                    
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onclick="Router.navigate('/')" class="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-all">
                            Back to Home
                        </button>
                        <button onclick="Router.back()" class="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    tracking(id = '') {
        setTimeout(async () => {
            if (id) {
                Tracking.init(id);
            }

            const btn = document.getElementById('tracking-btn');
            const input = document.getElementById('tracking-input');
            if (btn && input) {
                btn.onclick = () => {
                    const val = input.value.trim();
                    if (val) Router.navigate(`/track/${val}`);
                    else Components.showNotification('Please enter a tracking number', 'warning');
                };
                input.onkeypress = (e) => { if (e.key === 'Enter') btn.click(); };
            }
        }, 100);

        return `
            <div class="max-w-7xl mx-auto py-10 px-4">
                <div class="text-center mb-12">
                    <div class="w-20 h-20 bg-blue-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-3">
                        <i data-lucide="truck" class="w-10 h-10 text-blue-600"></i>
                    </div>
                    <h1 class="text-4xl font-bold mb-4">Track Your Order</h1>
                    <p class="text-slate-500 mb-8 max-w-md mx-auto text-lg">See real-time updates from our logistic partners.</p>
                    <div class="flex max-w-lg mx-auto gap-3 p-2 bg-white rounded-3xl shadow-xl border border-slate-100">
                        <input type="text" id="tracking-input" value="${id}" placeholder="Enter tracking ID (e.g. TRK123...)" class="flex-1 p-4 rounded-2xl outline-none font-bold text-slate-700">
                        <button id="tracking-btn" class="bg-blue-600 text-white px-8 rounded-2xl font-bold hover:bg-blue-700 transition-all">
                            Track
                        </button>
                    </div>
                </div>
                
                <div id="tracking-container" class="min-h-[400px]">
                    ${id ? `
                        <div class="flex flex-col items-center justify-center p-20 text-slate-400">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p class="font-bold">Locating shipment #${id}...</p>
                        </div>
                    ` : `
                        <div class="glass-card p-12 text-center rounded-[2rem]">
                            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="map" class="w-8 h-8 text-blue-500"></i>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">Ready to Track</h3>
                            <p class="text-slate-500">Enter your tracking number above to see real-time status.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    orderDetail(id) {
        setTimeout(async () => {
            const container = document.getElementById('order-detail-container');
            const order = await State.fetchOrderById(id);

            if (!order) {
                container.innerHTML = Components.EmptyState('package', 'Order Not Found', 'We couldn\'t find the order details you\'re looking for.');
                return;
            }

            container.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 space-y-6">
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4">Ordered Items</h3>
                            <div class="space-y-4">
                                ${order.items.map(item => `
                                    <div class="flex items-center gap-4">
                                        <img onerror="this.src='/assets/placeholder.png'; this.onerror=null;" loading="lazy" src="${State.getMediaUrl(item.product_id, 0)}" class="w-16 h-16 rounded-lg object-cover" alt="${item.name || 'Product'}">
                                        <div class="flex-1">
                                            <p class="font-bold">${item.name || 'Product Details'}</p>
                                            <p class="text-xs text-slate-500">Qty: ${item.quantity} +� ${State.formatCurrency(item.price)}</p>
                                        </div>
                                        <p class="font-bold">${State.formatCurrency(Number(item.price) * item.quantity)}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4">Order Timeline</h3>
                            <div class="space-y-6">
                                <div class="flex gap-4 relative">
                                    <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 z-10">
                                        <i data-lucide="check" class="w-4 h-4 text-white"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold">Order Placed</p>
                                        <p class="text-xs text-slate-500">${new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                    <div class="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>
                                </div>
                                <div class="flex gap-4 relative">
                                    <div class="w-8 h-8 rounded-full ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-blue-500' : 'bg-slate-200'} flex items-center justify-center shrink-0 z-10">
                                        <i data-lucide="package" class="w-4 h-4 text-white"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold">Processing</p>
                                        <p class="text-xs text-slate-500">${order.status === 'processing' ? 'Currently being prepared' : 'Completed'}</p>
                                    </div>
                                    <div class="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>
                                </div>
                                <div class="flex gap-4">
                                    <div class="w-8 h-8 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-slate-200'} flex items-center justify-center shrink-0 z-10">
                                        <i data-lucide="map-pin" class="w-4 h-4 text-white"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold">Delivered</p>
                                        <p class="text-xs text-slate-500">${order.status === 'delivered' ? 'Package arrived' : 'Pending delivery'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4">Summary</h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-slate-500">Subtotal</span>
                                    <span class="font-bold">G�${Number(order.total_amount).toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-slate-500">Shipping</span>
                                    <span class="text-green-600 font-bold">FREE</span>
                                </div>
                                <div class="border-t pt-3 flex justify-between text-lg">
                                    <span class="font-bold">Total</span>
                                    <span class="font-bold text-blue-600">G�${Number(order.total_amount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        ${order.tracking_number ? `
                            <button onclick="Router.navigate('/track/${order.tracking_number}')" class="w-full bg-orange-600 text-white p-4 rounded-xl font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                                <i data-lucide="truck" class="w-5 h-5"></i>
                                Track Order
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            lucide.createIcons();
        }, 100);

        return `
            <div class="max-w-7xl mx-auto px-4 py-8">
                <div class="flex items-center gap-4 mb-8">
                    <button onclick="Router.back()" class="p-2 hover:bg-slate-100 rounded-lg transition-all"><i data-lucide="arrow-left" class="w-6 h-6"></i></button>
                    <h1 class="text-3xl font-bold text-slate-800">Order Details</h1>
                    <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">#${id}</span>
                </div>

                <div id="order-detail-container" class="min-h-[400px]">
                    ${Components.LoadingSpinner()}
                </div>
            </div>
        `;
    },

    // Helper for Verification Modal
    showVerificationModal(email) {
        // Remove any existing modal first
        document.getElementById('xp-verify-modal')?.remove();

        const modal = document.createElement('div');
        modal.id = 'xp-verify-modal';
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="mail" class="w-8 h-8 text-blue-600"></i>
                </div>
                <h3 class="text-2xl font-bold mb-2">Verify Your Email</h3>
                <p class="text-slate-500 mb-1 text-sm">Enter the 6-digit code sent to</p>
                <p class="font-bold text-slate-800 mb-6 text-sm break-all">${email}</p>
                <div class="space-y-3">
                    <input type="text" id="xp-verificationCode" placeholder="000000" maxlength="6"
                        inputmode="numeric" pattern="[0-9]*"
                        oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                        class="text-center text-3xl tracking-[0.5em] w-full p-4 border-2 rounded-xl outline-none focus:border-blue-600 font-bold transition-all">
                    <button id="xp-verifyBtn" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        Verify Code
                    </button>
                    <button id="xp-resendBtn" disabled class="w-full text-slate-400 text-sm font-semibold py-2 rounded-xl hover:text-blue-600 transition-all disabled:cursor-not-allowed disabled:hover:text-slate-400">
                        Resend Code (<span id="xp-resend-countdown">60</span>s)
                    </button>
                    <button onclick="document.getElementById('xp-verify-modal').remove()" class="text-slate-400 text-xs hover:underline">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        // Resend countdown timer
        let seconds = 60;
        const countdownEl = document.getElementById('xp-resend-countdown');
        const resendBtn = document.getElementById('xp-resendBtn');
        const timer = setInterval(() => {
            seconds--;
            if (countdownEl) countdownEl.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(timer);
                if (resendBtn) {
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Resend Code';
                    resendBtn.classList.add('text-blue-600');
                    resendBtn.classList.remove('text-slate-400');
                }
            }
        }, 1000);

        // Resend logic
        resendBtn.onclick = async () => {
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sending...';
            try {
                // Trigger a fresh code by re-calling register with the same email
                // or by calling a dedicated resend endpoint
                await fetch(window.apiUrl('/api/auth/resend-code'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                Components.showNotification('New verification code sent!', 'success');
                // Restart countdown
                seconds = 60;
                resendBtn.disabled = true;
                resendBtn.textContent = `Resend Code (60s)`;
                const newCountdown = document.getElementById('xp-resend-countdown');
                // Rebuild countdown span
                resendBtn.innerHTML = `Resend Code (<span id="xp-resend-countdown">60</span>s)`;
                resendBtn.classList.remove('text-blue-600');
                resendBtn.classList.add('text-slate-400');
                const newTimer = setInterval(() => {
                    seconds--;
                    const el = document.getElementById('xp-resend-countdown');
                    if (el) el.textContent = seconds;
                    if (seconds <= 0) {
                        clearInterval(newTimer);
                        resendBtn.disabled = false;
                        resendBtn.textContent = 'Resend Code';
                        resendBtn.classList.add('text-blue-600');
                        resendBtn.classList.remove('text-slate-400');
                    }
                }, 1000);
            } catch (err) {
                Components.showNotification('Failed to resend code. Try again.', 'error');
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend Code';
            }
        };

        // Verify logic
        const verifyBtn = document.getElementById('xp-verifyBtn');
        verifyBtn.onclick = async () => {
            const code = document.getElementById('xp-verificationCode').value.trim();
            if (!code || code.length < 6) {
                Components.showNotification('Please enter the full 6-digit code', 'error');
                return;
            }

            verifyBtn.disabled = true;
            verifyBtn.textContent = 'Verifying...';

            const result = await Auth.verify(email, code);
            if (result.success) {
                clearInterval(timer);
                modal.remove();
                Auth.setUserSession(result.user?.role || 'consumer', result.user);
                Components.showNotification('Email verified! Welcome to Xperiencestore =���', 'success');
                const role = result.user?.role || 'consumer';
                setTimeout(() => {
                    window.location.hash = '#/';
                    window.location.reload();
                }, 500);
            } else {
                Components.showNotification(result.message || 'Invalid code. Please try again.', 'error');
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verify Code';
                // Shake animation hint
                const input = document.getElementById('xp-verificationCode');
                input.classList.add('border-red-500');
                input.value = '';
                input.focus();
                setTimeout(() => input.classList.remove('border-red-500'), 2000);
            }
        };

        // Auto submit when 6 digits entered
        document.getElementById('xp-verificationCode').addEventListener('input', (e) => {
            if (e.target.value.length === 6) verifyBtn.click();
        });
    },


    login() {
        // Defer execution to attach event listeners after render
        setTimeout(() => {
            const form = document.getElementById('loginForm');
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;

                    const result = await Auth.login(email, password);
                    if (result.success) {
                        Components.showNotification(`Welcome back! Logged in as ${result.role}`, 'success');
                        setTimeout(() => {
                            window.location.hash = '#/';
                            window.location.reload();
                        }, 500);
                        /*
                        // Previous navigation (kept for reference, but reload ensures full state refresh)
                        if (result.role === 'admin') Router.navigate('/admin/reports');
                        else if (result.role === 'consumer') Router.navigate('/products');
                        else if (result.role === 'business') Router.navigate('/business/account');
                        else if (result.role === 'dropshipper') Router.navigate('/dropshipper/storefront');
                        else if (result.role === 'supplier') Router.navigate('/supplier/reports');
                        else Router.navigate('/');
                        */
                    } else if (result.requiresVerification) {
                        Pages.showVerificationModal(result.email);
                    } else {
                        Components.showNotification(result.message, 'error');
                    }
                };
            }
        }, 0);

        return `
            <div class="flex items-center justify-center min-h-[70vh] px-4 py-8">
                <div class="glass-card p-6 md:p-8 rounded-3xl w-full max-w-md border border-white mx-auto">
                    <div class="text-center mb-8">
                        <img loading="lazy" src="assets/logo.png" class="h-12 mx-auto mb-4">
                        <h2 class="text-2xl font-bold text-slate-800">Welcome Back</h2>
                        <p class="text-slate-500 text-sm">Login to access your account</p>
                    </div>
                    <form id="loginForm" class="space-y-4">
                        <div>
                            <label class="text-xs font-bold text-slate-600 ml-1">EMAIL</label>
                            <input type="email" id="loginEmail" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500 transition-all">
                        </div>
                        <div class="relative">
                            <label class="text-xs font-bold text-slate-600 ml-1">PASSWORD</label>
                            <div class="relative">
                                <input type="password" id="loginPassword" required class="w-full p-3 pr-12 rounded-xl border bg-white/50 outline-none focus:border-blue-500 transition-all">
                                <button type="button" onclick="Components.togglePasswordVisibility('loginPassword', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                    <i data-lucide="eye" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-wrap items-center justify-between text-sm gap-2">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="rounded text-blue-600 focus:ring-blue-500 border-gray-300">
                                <span class="text-slate-600 select-none">Remember me</span>
                            </label>
                            <a href="#/forgot-password" class="text-blue-600 hover:underline">Forgot password?</a>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform active:scale-[0.98]">Sign In</button>
                    </form>
                    <div class="mt-6 text-center text-sm">
                        <span class="text-slate-500">Don't have an account?</span>
                        <a onclick="Router.navigate('/register')" class="text-blue-600 font-bold hover:underline ml-1 cursor-pointer">Sign Up</a>
                    </div>
                </div>
            </div>
        `;
    },

    register() {
        // Defer execution
        setTimeout(() => {
            const form = document.getElementById('registerForm');
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();

                    const firstName = document.getElementById('regFirstName').value;
                    const lastName = document.getElementById('regLastName').value;
                    const email = document.getElementById('regEmail').value;
                    const password = document.getElementById('regPassword').value;
                    const role = document.getElementById('regRole').value;

                    const userData = { firstName, lastName, email, password, role };

                    const result = await Auth.register(userData);
                    if (result.success) {
                        if (result.requiresVerification) {
                            Components.showNotification(result.message, 'success');
                            Pages.showVerificationModal(result.email);
                        } else {
                            Components.showNotification('Account created successfully!', 'success');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000); // Allow time for toast
                            /*
                            // Previous navigation
                            if (result.role === 'admin') Router.navigate('/admin/reports');
                            else if (result.role === 'consumer') Router.navigate('/products');
                            else if (result.role === 'business') Router.navigate('/business/account');
                            else if (result.role === 'dropshipper') Router.navigate('/dropshipper/storefront');
                            else if (result.role === 'supplier') Router.navigate('/supplier/reports');
                            else Router.navigate('/');
                            */
                        }
                    } else {
                        Components.showNotification(result.message, 'error');
                    }
                };
            }
        }, 0);

        return `
            <div class="flex items-center justify-center min-h-[70vh] py-10 px-4">
                <div class="glass-card p-6 md:p-8 rounded-3xl w-full max-w-2xl border border-white mx-auto">
                    <div class="text-center mb-8">
                        <img loading="lazy" src="assets/logo.png" class="h-12 mx-auto mb-4">
                        <h2 class="text-2xl font-bold text-slate-800">Create Account</h2>
                        <p class="text-slate-500 text-sm">Join Xperiencestore today</p>
                    </div>
                    <form id="registerForm" class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">FIRST NAME</label>
                                <input type="text" id="regFirstName" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500 transition-all">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">LAST NAME</label>
                                <input type="text" id="regLastName" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500 transition-all">
                            </div>
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-600 ml-1">EMAIL</label>
                            <input type="email" id="regEmail" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                        </div>
                        <div class="relative">
                            <label class="text-xs font-bold text-slate-600 ml-1">PASSWORD</label>
                            <div class="relative">
                                <input type="password" id="regPassword" required class="w-full p-3 pr-12 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                <button type="button" onclick="Components.togglePasswordVisibility('regPassword', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                    <i data-lucide="eye" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-600 ml-1">ACCOUNT TYPE</label>
                            <select id="regRole" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                <option value="consumer">Consumer (B2C)</option>
                                <option value="business">Business (B2B)</option>
                                <option value="dropshipper">Dropshipper</option>
                                <option value="supplier">Supplier</option>
                            </select>
                        </div>
                        <div class="flex items-start gap-2">
                            <input type="checkbox" required class="mt-1">
                            <label class="text-xs text-slate-600">I agree to the <a href="#/terms" class="text-blue-600 hover:underline">Terms of Service</a> and <a href="#/privacy" class="text-blue-600 hover:underline">Privacy Policy</a></label>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Create Account</button>
                    </form>
                    <div class="mt-6 text-center text-sm">
                        <span class="text-slate-500">Already have an account?</span>
                        <a onclick="Router.navigate('/login')" class="text-blue-600 font-bold hover:underline ml-1 cursor-pointer">Sign In</a>
                    </div>
                </div>
            </div>
        `;
    },

    // ==================== SHARED PAGES ====================

    forgotPassword() {
        setTimeout(() => {
            const form = document.getElementById('forgotPasswordForm');
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('forgotEmail').value;

                    const result = await Auth.forgotPassword(email);
                    Components.showNotification(result.message, 'info');
                    // In a real app, maybe navigate away or show modal for code if using code flow
                    // For code flow:
                    Pages.showResetModal(email);
                }
            }
        }, 0);

        return `
            <div class="flex items-center justify-center min-h-[70vh]">
                <div class="glass-card p-8 rounded-3xl w-full max-w-md border border-white">
                    <h2 class="text-2xl font-bold text-center mb-6">Reset Password</h2>
                    <form id="forgotPasswordForm" class="space-y-4">
                        <input type="email" id="forgotEmail" placeholder="Enter your email" required class="w-full p-4 rounded-xl border outline-none focus:border-blue-600">
                        <button type="submit" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700">Send Reset Code</button>
                    </form>
                    <div class="text-center mt-4">
                        <a href="#/login" class="text-slate-500 hover:text-blue-600 text-sm">Back to Login</a>
                    </div>
                </div>
            </div>
        `;
    },

    showResetModal(email) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50';

        const renderModalContent = () => {
            modal.innerHTML = `
                <div class="glass-card bg-white rounded-2xl p-8 max-w-sm w-full text-center relative border border-slate-200 shadow-2xl">
                    <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="lock" class="w-8 h-8 text-blue-600"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-2 text-slate-800">Reset Password</h3>
                    <p class="text-slate-500 text-sm mb-6">Enter the 6-digit code sent to <span class="font-bold text-slate-800">${email}</span> along with your new password.</p>
                    
                    <div class="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                        <div id="timer" class="text-3xl font-bold text-blue-600 font-mono mb-1">05:00</div>
                        <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Code expires in</p>
                    </div>

                    <div class="space-y-4">
                        <input type="text" id="resetCode" placeholder="Enter 6-digit Code" maxlength="6" class="w-full p-3 border border-slate-200 rounded-xl outline-none text-center font-bold tracking-[0.5em] text-lg focus:border-blue-600 transition-all placeholder:tracking-normal placeholder:font-normal" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                        <div class="relative">
                            <input type="password" id="newPassword" placeholder="New Password" class="w-full p-3 pr-12 border border-slate-200 rounded-xl outline-none focus:border-blue-600 transition-all">
                            <button type="button" onclick="Components.togglePasswordVisibility('newPassword', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                <i data-lucide="eye" class="w-5 h-5"></i>
                            </button>
                        </div>
                        
                        <button id="resetBtn" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300">
                            Update Password
                        </button>
                        
                        <button id="resendBtn" disabled class="w-full bg-transparent text-slate-400 p-2 rounded-xl font-bold text-sm hover:text-blue-600 disabled:opacity-50 disabled:hover:text-slate-400 transition-all flex items-center justify-center gap-2">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i> Resend Code
                        </button>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        };

        renderModalContent();
        document.body.appendChild(modal);

        // Timer Logic
        let timeLeft = 300; // 5 minutes
        let countdown;

        const startTimer = () => {
            clearInterval(countdown);
            timeLeft = 300;
            const timerDisplay = document.getElementById('timer');
            const resetBtn = document.getElementById('resetBtn');
            const resendBtn = document.getElementById('resendBtn');
            const codeInput = document.getElementById('resetCode');

            if (timerDisplay) {
                timerDisplay.classList.remove('text-red-500');
                timerDisplay.classList.add('text-blue-600');
            }
            if (resetBtn) {
                resetBtn.disabled = false;
                resetBtn.textContent = 'Update Password';
            }
            if (resendBtn) {
                resendBtn.disabled = true;
                resendBtn.classList.remove('text-blue-600');
            }
            if (codeInput) codeInput.disabled = false;

            countdown = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(countdown);
                    if (timerDisplay) {
                        timerDisplay.textContent = "00:00";
                        timerDisplay.classList.remove('text-blue-600');
                        timerDisplay.classList.add('text-red-500');
                    }

                    if (resetBtn) {
                        resetBtn.disabled = true;
                        resetBtn.textContent = 'Code Expired';
                    }

                    if (resendBtn) {
                        resendBtn.disabled = false;
                        resendBtn.classList.add('text-blue-600');
                        resendBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i> Resend Code';
                        if (window.lucide) window.lucide.createIcons();
                    }

                    if (codeInput) codeInput.disabled = true;
                } else {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    if (timerDisplay) timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    timeLeft--;
                }
            }, 1000);
        };

        startTimer();

        // Resend Button Logic
        const resendBtn = document.getElementById('resendBtn');
        if (resendBtn) {
            resendBtn.onclick = async () => {
                resendBtn.disabled = true;
                resendBtn.innerHTML = '<i class="animate-spin" data-lucide="loader-2"></i> Sending...';
                if (window.lucide) window.lucide.createIcons();

                try {
                    const result = await Auth.forgotPassword(email);
                    if (result.message && (result.message.toLowerCase().includes('sent') || result.success)) {
                        Components.showNotification('New code sent successfully!', 'success');
                        startTimer();
                    } else {
                        Components.showNotification(result.message || 'Failed to resend code', 'error');
                        resendBtn.disabled = false;
                        resendBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i> Try Again';
                        if (window.lucide) window.lucide.createIcons();
                    }
                } catch (error) {
                    console.error('Resend error:', error);
                    Components.showNotification('Failed to resend code', 'error');
                    resendBtn.disabled = false;
                    resendBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i> Try Again';
                    if (window.lucide) window.lucide.createIcons();
                }
            };
        }

        // Reset Logic
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.onclick = async () => {
                const code = document.getElementById('resetCode').value;
                const password = document.getElementById('newPassword').value;

                if (!code || !password) {
                    Components.showNotification('Please enter code and new password', 'warning');
                    return;
                }

                const originalText = resetBtn.textContent;
                resetBtn.textContent = 'Updating...';
                resetBtn.disabled = true;

                try {
                    // Use Auth.resetPassword if available, else direct fetch
                    let result;
                    if (Auth.resetPassword) {
                        result = await Auth.resetPassword(email, code, password);
                    } else {
                        const response = await fetch(window.apiUrl('/api/auth/reset-password'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, code, newPassword: password })
                        });
                        result = await response.json();
                    }

                    if (result.message === 'Password updated successfully' || result.success) {
                        Components.showNotification('Password updated! Please login.', 'success');
                        modal.remove();
                        Router.navigate('/login');
                    } else {
                        Components.showNotification(result.message, 'error');
                        resetBtn.textContent = originalText;
                        resetBtn.disabled = false;
                    }
                } catch (error) {
                    console.error('Reset error:', error);
                    Components.showNotification('An error occurred', 'error');
                    resetBtn.textContent = originalText;
                    resetBtn.disabled = false;
                }
            };
        }

        // Clean up interval when modal is closed
        const observer = new MutationObserver((mutations) => {
            if (!document.body.contains(modal)) {
                clearInterval(countdown);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true });
    },



    paymentVerify() {
        // Execute verification logic after mount
        setTimeout(async () => {
            const container = document.getElementById('payment-verify-container');

            // Check for server redirect params (all gateways redirect via server which then G�� #/account/orders?payment=success)
            // But for direct frontend hash params (e.g. Paystack older approach):
            const params = Router.getCurrentRoute()?.params || {};
            const paymentStatus = params.payment;   // 'success' or undefined
            const ref = params.ref;

            // If server redirect set payment=success, it already updated the DB
            if (paymentStatus === 'success') {
                const ghostCredsStr = sessionStorage.getItem('ghost_credentials');
                let ghostHTML = '';
                if (ghostCredsStr) {
                    try {
                        const creds = JSON.parse(ghostCredsStr);
                        ghostHTML = `
                            <div class="mt-8 p-6 bg-slate-50 border border-blue-100 rounded-2xl text-left">
                                <div class="flex items-center gap-3 mb-4 text-blue-600">
                                    <i data-lucide="info" class="w-6 h-6"></i>
                                    <h4 class="font-bold">Guest Account Created</h4>
                                </div>
                                <p class="text-sm text-slate-600 mb-4">We've automatically created an account so you can track your order. Please save these temporary credentials:</p>
                                <div class="space-y-3">
                                    <div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                                        <div>
                                            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Email</p>
                                            <p class="font-mono text-sm font-bold text-slate-800" id="ghost-email">${creds.email}</p>
                                        </div>
                                        <button onclick="navigator.clipboard.writeText('${creds.email}'); State.notify('Email copied', 'success');" class="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                            <i data-lucide="copy" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                    <div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                                        <div>
                                            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Password</p>
                                            <p class="font-mono text-sm font-bold text-slate-800" id="ghost-pwd">${creds.password}</p>
                                        </div>
                                        <button onclick="navigator.clipboard.writeText('${creds.password}'); State.notify('Password copied', 'success');" class="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                            <i data-lucide="copy" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="mt-4 text-xs text-slate-500 italic">
                                    * You can bind your actual email address and change this password later in your Account Settings.
                                </div>
                            </div>
                        `;
                        // Remove so it only shows once
                        sessionStorage.removeItem('ghost_credentials');
                    } catch (e) {}
                }

                container.innerHTML = `
                    <div class="glass-card p-12 text-center rounded-2xl max-w-md mx-auto mt-10 shadow-xl">
                        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i data-lucide="check-circle" class="w-10 h-10 text-green-600"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h3>
                        <p class="text-slate-500 mb-2">Your payment has been confirmed and your order is now being processed.</p>
                        ${ref ? `<p class="text-xs text-slate-400 mb-6 font-mono">Ref: ${ref}</p>` : '<br>'}
                        <button onclick="Router.navigate('/account/orders'); window.location.reload();" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 w-full">
                            View My Orders
                        </button>
                        ${ghostHTML}
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            // If we have a legacy reference (old Paystack callback without server-side redirect)
            const reference = params.reference || params.trxref;
            if (!reference && paymentStatus !== 'success') {
                // Show generic verification UI G�� maybe user navigated here manually
                container.innerHTML = `
                    <div class="glass-card p-12 text-center rounded-2xl max-w-md mx-auto mt-10">
                        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="info" class="w-8 h-8 text-amber-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">Check Order Status</h3>
                        <p class="text-slate-500 mb-6">Your payment is being processed. Please check your orders for the latest status.</p>
                        <button onclick="window.location.hash = '/account/orders'; window.location.reload();" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">View Orders</button>
                    </div>
                `;
                lucide.createIcons();
                return;
            }
        }, 100);

        return `
            <div class="min-h-[60vh] flex items-center justify-center px-4" id="payment-verify-container">
                <div class="glass-card p-12 text-center rounded-2xl max-w-md w-full shadow-lg">
                    <i data-lucide="loader-2" class="animate-spin w-16 h-16 text-blue-600 mx-auto mb-6"></i>
                    <h3 class="text-2xl font-bold text-slate-800 mb-2 mt-4">Verifying Payment</h3>
                    <p class="text-slate-500">Please wait while we confirm your transaction securely...</p>
                </div>
            </div>
        `;
    },

    paymentFailed() {
        return `
            <div class="min-h-[60vh] flex items-center justify-center px-4">
                <div class="glass-card p-12 text-center rounded-2xl max-w-md w-full shadow-lg">
                    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="x-circle" class="w-10 h-10 text-red-600"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-800 mb-2">Payment Failed</h3>
                    <p class="text-slate-500 mb-8">Your payment could not be completed. No charges have been made to your account.</p>
                    <div class="flex flex-col gap-3">
                        <button onclick="window.history.back()" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                            Try Again
                        </button>
                        <button onclick="Router.navigate('/contact')" class="text-blue-600 font-bold hover:underline text-sm">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    giftCard() {
        setTimeout(() => {
            const form = document.getElementById('giftCardForm');
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();

                    const amount = document.getElementById('customAmount').value;
                    const recipientEmail = document.getElementById('gc-email').value;
                    const message = document.getElementById('gc-message').value;

                    if (!amount || !recipientEmail) return Components.showNotification('Please fill all fields', 'error');

                    Components.showNotification('Processing Gift Card...', 'info');

                    try {
                        const response = await fetch(window.apiUrl('/api/gift-cards/purchase'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                amount: parseInt(amount),
                                recipientEmail,
                                message,
                                paymentMethod: 'card' // Simplified for demo
                            })
                        });

                        const data = await response.json();
                        if (response.ok) {
                            Components.showNotification('Gift Card Sent Successfully!', 'success');
                            form.reset();
                        } else {
                            Components.showNotification(data.message || 'Failed to send gift card', 'error');
                        }
                    } catch (err) {
                        Components.showNotification('Server Error', 'error');
                    }
                }
            }
        }, 0);

        return `
            <div class="max-w-4xl mx-auto py-10">
                <div class="text-center mb-10">
                    <h1 class="text-4xl font-bold mb-4">Send a Gift Card</h1>
                    <p class="text-slate-500">The perfect gift for friends and family</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Card Preview -->
                    <div class="glass-card p-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-xl h-64 flex flex-col justify-between">
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-2xl">Xperience<span class="font-light">Gift</span></h3>
                            <i data-lucide="gift" class="w-8 h-8 opacity-80"></i>
                        </div>
                        <div class="text-right">
                            <p class="text-sm opacity-80 mb-1">VALUE</p>
                            <p class="text-4xl font-bold" id="cardValueDisplay">$100.00</p>
                        </div>
                    </div>

                    <!-- Purchase Form -->
                    <div class="glass-card p-8 rounded-2xl">
                        <form id="giftCardForm" class="space-y-4">
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">SELECT AMOUNT</label>
                                <div class="grid grid-cols-3 gap-2 mt-2">
                                    <button type="button" class="p-2 border rounded-xl hover:bg-slate-50" onclick="document.getElementById('customAmount').value='50'; document.getElementById('cardValueDisplay').innerText='$50.00'">$50</button>
                                    <button type="button" class="p-2 border rounded-xl hover:bg-slate-50 border-blue-600 bg-blue-50 text-blue-600" onclick="document.getElementById('customAmount').value='100'; document.getElementById('cardValueDisplay').innerText='$100.00'">$100</button>
                                    <button type="button" class="p-2 border rounded-xl hover:bg-slate-50" onclick="document.getElementById('customAmount').value='200'; document.getElementById('cardValueDisplay').innerText='$200.00'">$200</button>
                                </div>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">CUSTOM AMOUNT</label>
                                <input type="number" id="customAmount" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" value="100">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">RECIPIENT EMAIL</label>
                                <input type="email" id="gc-email" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" placeholder="friend@example.com">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">MESSAGE</label>
                                <textarea id="gc-message" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500 h-24" placeholder="Write a personal message..."></textarea>
                            </div>
                            <button type="submit" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Buy Gift Card</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    // ==================== SEARCH PAGE ====================

    search(params = {}) {
        const { q = '', page = 1 } = params;
        let products = State.getProducts();

        // Filter by search query using advanced fuzzy token ranking
        if (q) {
            const query = q.toLowerCase();

            // 1. Ensure pre-computation index exists
            if (products.length > 0 && !products[0]._searchTerms) {
                for (let i = 0; i < products.length; i++) {
                    const p = products[i];
                    const name = (p.name || '').toLowerCase();
                    const cat = (p.category || '').toLowerCase();
                    const desc = (p.description || '').toLowerCase();
                    products[i]._searchTerms = `${name} ${cat} ${desc}`;
                    products[i]._nameLower = name;
                    products[i]._catLower = cat;
                }
            }

            const tokens = query.split(/\\s+/).filter(t => t.length > 0);
            const matches = [];

            for (let i = 0; i < products.length; i++) {
                const p = products[i];
                let matchedTokensCount = 0;

                for (let t = 0; t < tokens.length; t++) {
                    if (p._searchTerms.includes(tokens[t])) {
                        matchedTokensCount++;
                    }
                }

                const matchRatio = tokens.length > 0 ? (matchedTokensCount / tokens.length) : 0;

                if (matchRatio < 0.25) continue; // Reject if under 25% match rate

                let weight = 0;

                // Massive ranking boost based on percentage hitting thresholds
                if (matchRatio >= 0.50) weight += 1000; // Rank as 100%
                else if (matchRatio >= 0.25) weight += 200; // Still passes, rank lower

                weight += Math.pow(matchedTokensCount, 2) * 5;

                if (p._nameLower === query) weight += 500;
                else if (p._nameLower.startsWith(query)) weight += 100;
                else if (p._nameLower.includes(query)) weight += 30;

                for (let t = 0; t < tokens.length; t++) {
                    if (p._nameLower.includes(tokens[t])) weight += 15;
                    if (p._catLower.includes(tokens[t])) weight += 5;
                }

                if (weight > 0) {
                    p._searchWeight = weight;
                    matches.push(p);
                }
            }

            // Sort by search relevance weight
            products = matches.sort((a, b) => b._searchWeight - a._searchWeight);
        }

        window.currentProducts = products;
        const itemsPerPage = 12;
        const totalPages = Math.ceil(products.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

        return `
            <div>
                <h1 class="text-3xl font-bold mb-6">Search Results for "${q}"</h1>
                <p class="text-slate-600 mb-8">Found ${products.length} products</p>

                ${paginatedProducts.length > 0 ? `
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        ${paginatedProducts.map(product => Components.ProductCard(product)).join('')}
                    </div>
                    ${Components.Pagination(page, totalPages, 'Pages.searchChangePage')}
                ` : Components.EmptyState('search', 'No Results Found', `No products match "${q}". Try a different search term.`, '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Browse All Products</button>')}
            </div>
        `;
    },

    searchChangePage(page) {
        const url = new URL(window.location.href);
        const query = url.searchParams.get('q') || '';
        Router.navigate(`/search?q=${query}&page=${page}`);
    },

    // ==================== SUPPORT PAGES ====================

    support: {
        about() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">About Xperiencestore</h1>
                    
                    <div class="glass-card p-8 rounded-2xl mb-8">
                        <h2 class="text-2xl font-bold mb-4">Our Mission</h2>
                        <p class="text-slate-600 leading-relaxed mb-6">
                            Xperiencestore is a revolutionizing e-commerce ecosystem by creating the world's first truly unified multi-tier commerce platform. We connect consumers, businesses, dropshippers, suppliers on one seamless ecosystem.
                        </p>
                        <p class="text-slate-600 leading-relaxed">
                            Our mission is to democratize global trade, while maintaining advanced shopping experience making it accessible and efficient for everyone from individual shoppers to large enterprises.
                        </p>
                        <p class="text-slate-600 leading-relaxed">
                        
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        ${Components.StatCard('Active Users', '50K+', 'users', 'blue')}
                        ${Components.StatCard('Products', '2M+', 'package', 'green')}
                        ${Components.StatCard('Countries', '150+', 'globe', 'orange')}
                    </div>
                </div>
            `;
        },

        contact() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Contact Us</h1>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="glass-card p-8 rounded-2xl">
                            <h2 class="text-2xl font-bold mb-6">Get in Touch</h2>
                            <form class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">NAME</label>
                                    <input type="text" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">EMAIL</label>
                                    <input type="email" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">MESSAGE</label>
                                    <textarea rows="5" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500"></textarea>
                                </div>
                                <button type="submit" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                    Send Message
                                </button>
                            </form>
                        </div>

                        <div class="space-y-6">
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i data-lucide="mail" class="w-6 h-6 text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-bold">Email</h3>
                                        <p class="text-sm text-slate-600">support@xperiencestore.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        faq() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
                    
                    ${[
                    {
                        category: "Ordering & Payment",
                        questions: [
                            { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, Paystack, Flutterwave, and bank transfers for B2B orders." },
                            { q: "Can I cancel my order?", a: "Yes, you can cancel your order within 24 hours of placement if it hasn't been shipped yet." }
                        ]
                    },
                    {
                        category: "Shipping & Returns",
                        questions: [
                            { q: "How do I track my order?", a: "You can track your order using the 'Track Order' with the track order button in your order dashboard." },
                            { q: "Do you ship internationally?", a: "Yes, we ship to over 150 countries via DHL and FedEx and many other shipping service ." }
                        ]
                    }
                ].map((category) => `
                        <div class="mb-8">
                            <h2 class="text-2xl font-bold mb-4">${category.category}</h2>
                            <div class="space-y-3">
                                ${category.questions.map((faq) => `
                                    <div class="glass-card rounded-2xl overflow-hidden">
                                        <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-all">
                                            <span class="font-bold">${faq.q}</span>
                                            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400"></i>
                                        </button>
                                        <div class="hidden p-6 pt-0 text-slate-600">
                                            ${faq.a}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        shipping() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Shipping & Returns</h1>
                    
                    <div class="glass-card p-8 rounded-2xl mb-8">
                        <h2 class="text-2xl font-bold mb-4">Shipping Policy</h2>
                        <div class="space-y-4 text-slate-600">
                            <p>Standard shipping: 5-7 business days. Free on orders over $100.</p>
                            <p>Express shipping: 2-3 business days. Additional $15 fee.</p>
                        </div>
                    </div>

                    <div class="glass-card p-8 rounded-2xl">
                        <h2 class="text-2xl font-bold mb-4">Returns Policy</h2>
                        <p class="text-slate-600">We offer a 30-day return policy for most items. Products must be unused and in original packaging.</p>
                    </div>
                </div>
            `;
        },

        privacy() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
                    
                    <div class="glass-card p-8 rounded-2xl space-y-6 text-slate-600">
                        <div>
                            <h2 class="text-xl font-bold text-slate-800 mb-3">Information We Collect</h2>
                            <p>We collect information you provide directly to us, including name, email address, shipping address, and payment information.</p>
                        </div>

                        <div>
                            <h2 class="text-xl font-bold text-slate-800 mb-3">How We Use Your Information</h2>
                            <p>We use your information to process orders, send updates, respond to questions, and improve our services.</p>
                        </div>

                        <p class="text-sm italic">Last updated: Febuary 23, 2026</p>
                    </div>
                </div>
            `;
        },

        terms() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
                    
                    <div class="glass-card p-8 rounded-2xl space-y-6 text-slate-600">
                        <div>
                            <h2 class="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing and using Xperiencestore, you accept and agree to be bound by these terms.</p>
                        </div>

                        <div>
                            <h2 class="text-xl font-bold text-slate-800 mb-3">2. User Accounts</h2>
                            <p>You must provide accurate information and maintain account security.</p>
                        </div>

                        <p class="text-sm italic">Last updated: Febuary 23, 2026</p>
                    </div>
                </div>
            `;
        }
    },

    consumer,
    business,
    dropshipper,
    supplier,
    admin,
};


// ===========================================================
// SUPPLIER PRODUCT HANDLERS
// ===========================================================

window.editProduct = (productId) => {
    Router.navigate(`/supplier/products/edit?id=${productId}`);
};

window.deleteProduct = (productId) => {
    Components.ConfirmModal(
        'Delete Product',
        'Are you sure you want to remove this product? This action cannot be undone.',
        async () => {
            const success = await State.deleteSupplierProduct(productId);
            if (success) {
                // Silent refresh to update the list without a flicker
                Router.refresh(true);
            }
        },
        'Delete'
    );
};

window.handleImagePreview = (input) => {
    const gallery = document.getElementById('preview-gallery');
    const placeholder = document.getElementById('image-upload-placeholder');
    if (!gallery) return;

    if (input.files && input.files.length > 0) {
        placeholder?.classList.add('hidden');
        gallery.classList.remove('hidden');
        gallery.innerHTML = ''; // Clear old previews (existing or previous selection)

        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                gallery.insertAdjacentHTML('beforeend', `
                    <div class="aspect-square rounded-lg bg-slate-100 overflow-hidden relative group">
                        <img onerror="this.src='/assets/placeholder.png'; this.onerror=null;" loading="lazy" src="${e.target.result}" class="w-full h-full object-cover">
                    </div>
                `);
            };
            reader.readAsDataURL(file);
        });
    } else {
        // If no files selected, we don't clear the gallery if we're in edit mode 
        // because the existing images are still there until replaced.
        // However, if it's a fresh add, we show placeholder.
    }
};

window.submitProduct = async (event, productId) => {
    const form = event.target;
    const formData = new FormData(form);
    const isEdit = !!productId;

    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        category: formData.get('category'),
        images: form.querySelector('input[name="images"]').files
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Saving...';
    if (window.lucide) lucide.createIcons();

    try {
        let success;
        if (isEdit) {
            success = await State.updateSupplierProduct(productId, data);
        } else {
            success = await State.createSupplierProduct(data);
        }

        if (success) {
            Components.showNotification(isEdit ? 'Product updated' : 'Product created', 'success');
            Router.navigate('/supplier/products');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        if (window.lucide) lucide.createIcons();
    }
};

// ===========================================================
// MARKETING & COUPON HANDLERS
// ===========================================================

// ===========================================================
// CART UX HANDLERS (PARTIAL RE-RENDERING)
// ===========================================================

window.updateCartUI = () => {
    const cart = State.get().cart;
    const total = State.getCartTotal();

    // If cart becomes empty, just full re-render
    if (cart.length === 0) {
        Router.navigate('/cart');
        return;
    }

    const itemsContainer = document.getElementById('cart-items-list');
    const summaryContainer = document.getElementById('cart-summary-details');
    const countTitle = document.getElementById('cart-count-title');

    if (itemsContainer) itemsContainer.innerHTML = Pages.consumer.renderCartItems(cart);
    if (summaryContainer) summaryContainer.innerHTML = Pages.consumer.renderCartSummary(total);
    if (countTitle) countTitle.textContent = cart.length;

    // Update global cart badge
    Components.updateCartBadge();

    if (window.lucide) lucide.createIcons();
};

window.updateCartQty = async (id, qty) => {
    if (qty < 1) return;
    await State.updateCartQuantity(id, qty);
    window.updateCartUI();
};


window.removeCartItem = async (id) => {
    await State.removeFromCart(id);
    window.updateCartUI();
};


// ===========================================================
// WISHLIST UX HANDLERS (PARTIAL RE-RENDERING)
// ===========================================================

window.updateWishlistUI = (productId, isInWishlist) => {
    // 1. Update all heart icons globally
    const heartIcons = document.querySelectorAll(`[onclick*="toggleWishlist(${productId})"] i, [onclick*="toggleWishlist('${productId}')"] i`);
    heartIcons.forEach(icon => {
        if (isInWishlist) {
            icon.classList.add('fill-red-500', 'text-red-500');
            icon.classList.remove('text-slate-400', 'text-slate-600');
        } else {
            icon.classList.remove('fill-red-500', 'text-red-500');
            icon.classList.add('text-slate-400');
        }
    });

    // 2. If we are on the wishlist page, refresh the grid
    if (window.Router.getCurrentRoute()?.path === '/account/wishlist') {
        window.updateWishlistGrid();
    }
};

window.updateWishlistGrid = () => {
    const wishlist = State.get().wishlist;
    const container = document.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    const title = document.querySelector('h1.text-3xl.font-bold');

    if (title) title.textContent = `My Wishlist (${wishlist.length} items)`;

    if (container) {
        if (wishlist.length > 0) {
            container.innerHTML = wishlist.map(product => Components.ProductCard(product)).join('');
            if (window.lucide) lucide.createIcons();
        } else {
            // If empty, just full refresh to show empty state
            Router.navigate('/account/wishlist');
        }
    }
};

window.deleteAdminUser = async (userId) => {
    const success = await State.deleteAdminUser(userId);
    if (success) {
        await State.fetchAdminUsers();
        Router.refresh();
    }
};
