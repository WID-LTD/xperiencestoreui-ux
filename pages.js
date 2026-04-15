/**
 * pages.js - All Page Templates
 * Centralized page rendering for all user types
 */

import { Data } from './data.js';
import { State } from './state.js';
import { Router } from './router.js';
import { Components } from './components.js';
import { Tracking } from './tracking.js';


export const Pages = {
    // ==================== SHARED PAGES ====================

    paymentVerify(params) {
        const { gateway, ref, status } = params;

        // === STEP 1: Immediately clean the messy Paystack query params from the URL ===
        // This removes ?trxref=...&reference=... from the browser address bar right away.
        window.history.replaceState(null, '', '/#/payment/verify');

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
                    // Backend issued a redirect (302 → to /account/orders), treat as success
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
                                        <img src="${State.getMediaUrl(item.product_id, 0)}" class="w-16 h-16 rounded-lg object-cover">
                                        <div class="flex-1">
                                            <p class="font-bold">${item.name || 'Product Details'}</p>
                                            <p class="text-xs text-slate-500">Qty: ${item.quantity} × ${State.formatCurrency(item.price)}</p>
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
                                    <span class="font-bold">₦${Number(order.total_amount).toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-slate-500">Shipping</span>
                                    <span class="text-green-600 font-bold">FREE</span>
                                </div>
                                <div class="border-t pt-3 flex justify-between text-lg">
                                    <span class="font-bold">Total</span>
                                    <span class="font-bold text-blue-600">₦${Number(order.total_amount).toLocaleString()}</span>
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
                Components.showNotification('Email verified! Welcome to Xperiencestore 🎉', 'success');
                const role = result.user?.role || 'consumer';
                setTimeout(() => {
                    if (role === 'admin') Router.navigate('/admin/reports');
                    else if (role === 'consumer') Router.navigate('/products');
                    else if (role === 'business') Router.navigate('/business/account');
                    else if (role === 'dropshipper') Router.navigate('/dropshipper/storefront');
                    else if (role === 'supplier') Router.navigate('/supplier/reports');
                    else Router.navigate('/');
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
                            window.location.reload();
                        }, 500); // Small delay to show notification, then reload to update UI/router state fully
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
                        <img src="assets/logo.png" class="h-12 mx-auto mb-4">
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
                        <img src="assets/logo.png" class="h-12 mx-auto mb-4">
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

            // Check for server redirect params (all gateways redirect via server which then → #/account/orders?payment=success)
            // But for direct frontend hash params (e.g. Paystack older approach):
            const params = Router.getCurrentRoute()?.params || {};
            const paymentStatus = params.payment;   // 'success' or undefined
            const ref = params.ref;

            // If server redirect set payment=success, it already updated the DB
            if (paymentStatus === 'success') {
                container.innerHTML = `
                    <div class="glass-card p-12 text-center rounded-2xl max-w-md mx-auto mt-10 shadow-xl">
                        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i data-lucide="check-circle" class="w-10 h-10 text-green-600"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h3>
                        <p class="text-slate-500 mb-2">Your payment has been confirmed and your order is now being processed.</p>
                        ${ref ? `<p class="text-xs text-slate-400 mb-6 font-mono">Ref: ${ref}</p>` : '<br>'}
                        <button onclick="Router.navigate('/account/orders'); window.location.reload();" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            View My Orders
                        </button>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            // If we have a legacy reference (old Paystack callback without server-side redirect)
            const reference = params.reference || params.trxref;
            if (!reference && paymentStatus !== 'success') {
                // Show generic verification UI — maybe user navigated here manually
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

    // ==================== CONSUMER PAGES ====================

    consumer: {
        categories() {
            const categories = State.getCategories();
            
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
            const products = State.getProducts().slice(0, 8);

            // Re-render when data is ready
            if (!fetchedProducts && !isLoading) {
                State.fetchProducts().then(() => Router.refresh());
            }

            // Fetch extra data for sponsored and recommendations
            const sponsored = State.get().sponsoredProducts || [];
            const recommended = State.get().recommendedProducts || [];

            if (!fetchedSponsored && !isLoading) {
                State.fetchProducts({ sponsored: true, limit: 4 }).then(data => {
                    State.set({ sponsoredProducts: data, fetchedSponsored: true });
                    Router.refresh();
                });
            }
            if (!fetchedRecommended && !isLoading) {
                State.fetchRecommendations().then(data => {
                    State.set({ recommendedProducts: data, fetchedRecommended: true });
                    Router.refresh();
                });
            }

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
                        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400" class="h-48 md:h-64 rounded-2xl shadow-2xl transform hover:rotate-2 transition-all duration-500">
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
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                        <div class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-all">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="truck" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Free Shipping</h3>
                            <p class="text-sm text-slate-500">On orders over ₦50,000</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-all">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="shield-check" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Secure Payment</h3>
                            <p class="text-sm text-slate-500">100% secure transactions</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-all">
                            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="headphones" class="w-8 h-8 text-orange-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">24/7 Support</h3>
                            <p class="text-sm text-slate-500">Always here to help</p>
                        </div>
                    </div>
                </div>
            `;
        },

        products(params = {}) {
            const isLoading = State.isLoading();
            const { category, search, page = 1 } = params;
            // Get products from state
            let products = State.getProducts();

            // Get unique categories from products
            const categories = [...new Set(products.map(p => p.category))].map(c => ({
                name: c,
                slug: c.toLowerCase().replace(/ /g, '-'),
                count: products.filter(p => p.category === c).length
            }));

            // Filter by category
            if (category) {
                products = products.filter(p => p.slug === category || p.category.toLowerCase().replace(/ /g, '-') === category);
            }

            // Filter by Price
            if (params.minPrice) products = products.filter(p => (State.get().userRole === 'business' ? p.bulkPrice : p.price) >= params.minPrice);
            if (params.maxPrice) products = products.filter(p => (State.get().userRole === 'business' ? p.bulkPrice : p.price) <= params.maxPrice);

            // Filter by Rating
            if (params.rating) products = products.filter(p => p.rating >= parseFloat(params.rating));

            // Advanced Weighted Search
            if (search) {
                products = products.map(p => {
                    let weight = 0;
                    const q = search.toLowerCase();
                    if (p.name.toLowerCase() === q) weight += 100;
                    else if (p.name.toLowerCase().startsWith(q)) weight += 50;
                    else if (p.name.toLowerCase().includes(q)) weight += 20;
                    if (p.category.toLowerCase().includes(q)) weight += 10;
                    return { ...p, searchWeight: weight };
                }).filter(p => p.searchWeight > 0).sort((a, b) => b.searchWeight - a.searchWeight);
            }

            window.currentProducts = products;
            const itemsPerPage = 12;
            const totalPages = Math.ceil(products.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

            return `
                <div class="px-4 sm:px-0">
                    ${Components.Breadcrumbs([
                { label: 'Home', link: '/' },
                { label: category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products' }
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
                                    <div class="space-y-1">
                                        ${categories.map(cat => `
                                            <div onclick="Router.navigate('/category/${cat.slug}')" class="flex items-center justify-between p-2 rounded-xl border-2 ${category === cat.slug ? 'border-blue-500 bg-blue-50/50 text-blue-600' : 'border-transparent hover:bg-slate-50 text-slate-600'} cursor-pointer transition-all group">
                                                <span class="text-sm font-bold capitalize">${cat.name}</span>
                                                <span class="text-[10px] font-bold ${category === cat.slug ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'} px-2 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">${cat.count}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- Price Range -->
                                <div class="mb-8 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Price Range</label>
                                    ${Components.DualHandleSlider('price-min', 'price-max', params.minPrice || 0, params.maxPrice || 1000000)}
                                    <button onclick="Pages.consumer.applyPriceFilter()" class="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Apply Price</button>
                                </div>

                                <!-- Rating -->
                                <div class="mb-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Minimum Rating</label>
                                    <div class="grid grid-cols-5 gap-2">
                                        ${[1, 2, 3, 4, 5].map(r => `
                                            <button onclick="Router.navigate('/products?rating=${r}${category ? '&category='+category : ''}')" class="p-2 rounded-xl border-2 ${params.rating == r ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-300'} transition-all flex flex-col items-center gap-1">
                                                <span class="text-xs font-bold">${r}</span>
                                                <i data-lucide="star" class="w-3 h-3 ${params.rating == r ? 'fill-blue-500' : 'fill-slate-200 text-slate-300'}"></i>
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <!-- Products Grid -->
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-6">
                                <p class="text-sm text-slate-500">Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, products.length)} of ${products.length} products</p>
                                <select class="bg-transparent border rounded-lg px-4 py-2 text-sm font-bold text-slate-800 outline-none">
                                    <option>Sort by: Newest</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Rating: High to Low</option>
                                    <option>Most Popular</option>
                                </select>
                            </div>

                            ${isLoading ? `
                                <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    ${Array(itemsPerPage).fill(Components.SkeletonProductCard()).join('')}
                                </div>
                            ` : (paginatedProducts.length > 0 ? `
                                <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    ${paginatedProducts.map(product => Components.ProductCard(product)).join('')}
                                </div>
                                ${Components.Pagination(page, totalPages, 'Pages.consumer.changePage')}
                            ` : Components.EmptyState('search', 'No Products Found', 'Try adjusting your filters or search query', '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Clear Filters</button>'))}
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
                                <img id="mainImage" src="${State.getMediaUrl(product.id, 0)}" onerror="console.error('Failed to load main product image:', this.src); this.src='https://via.placeholder.com/600?text=No+Image'" class="w-full h-full object-cover transform hover:scale-105 transition-all duration-500 relative z-10">
                            </div>
                            <div class="grid grid-cols-4 gap-2 sm:gap-4">
                                ${galleryIndices.map(index => `
                                    <div onclick="const main = document.getElementById('mainImage'); main.src='${State.getMediaUrl(product.id, index)}';" class="glass-card rounded-xl h-16 sm:h-24 overflow-hidden cursor-pointer border-2 ${index === 0 ? 'border-blue-600' : 'border-transparent'} hover:border-blue-400 transition-all relative">
                                        <img src="${State.getMediaUrl(product.id, index)}" onerror="this.parentElement.style.display='none'" class="w-full h-full object-cover">
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
                                                <img src="\${video.thumbnail}" class="w-full h-full object-cover">
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
                    <h1 class="text-3xl font-bold mb-8">Shopping Cart (${cart.length} items)</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Cart Items -->
                        <div class="lg:col-span-2 space-y-4">
                            ${State.get().fetchingCart ? `
                                ${Array(3).fill(0).map(() => Components.SkeletonCartItem()).join('')}
                            ` : cart.map(item => `
                                <div class="glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-left transition-all hover:shadow-md">
                                    <img src="${State.getMediaUrl(item.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" alt="${item.name}" class="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-xl shadow-sm">
                                    <div class="flex-1 w-full">
                                        <h3 class="font-bold mb-1 text-slate-800 text-lg sm:text-base">${item.name}</h3>
                                        <p class="text-sm text-slate-500 mb-3">${item.category}</p>
                                        <div class="flex flex-col sm:flex-row items-center gap-4 justify-between w-full">
                                            <div class="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm">
                                                <button onclick="State.updateCartQuantity(${item.id}, ${item.quantity - 1}); Router.navigate('/cart')" class="px-3 py-2 hover:bg-slate-100 transition-colors bg-slate-50">-</button>
                                                <span class="px-4 py-2 border-x font-bold min-w-[3rem] text-center">${item.quantity}</span>
                                                <button onclick="State.updateCartQuantity(${item.id}, ${item.quantity + 1}); Router.navigate('/cart')" class="px-3 py-2 hover:bg-slate-100 transition-colors bg-slate-50">+</button>
                                            </div>
                                            <button onclick="State.removeFromCart(${item.id}); Router.navigate('/cart')" class="text-red-500 text-sm hover:text-red-700 hover:underline flex items-center gap-1 transition-colors p-2 sm:p-0">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i> Remove
                                            </button>
                                        </div>
                                    </div>
                                    <div class="text-center sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                        <p class="text-xl font-bold text-blue-600">${State.formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}</p>
                                        <p class="text-xs text-slate-400 mt-1">${State.formatCurrency(Number(item.price) || 0)} each</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Order Summary -->
                        <div class="glass-card p-6 rounded-2xl h-fit sticky top-24">
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
                        </div>
                    </div>
                </div>
            `;
        },

        checkout() {
            const cart = State.get().cart;
            const total = State.getCartTotal();

            if (cart.length === 0) {
                Router.navigate('/cart');
                return '';
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
                                            <img src="${State.getMediaUrl(item.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-16 h-16 rounded-lg object-cover">
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

            State.notify('Creating order...', 'info');

            try {
                // 1. Create Order in DB
                const orderResponse = await fetch(window.apiUrl('/api/orders'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.token}`
                    },
                    body: JSON.stringify({
                        shippingAddress: `${fname} ${lname}, ${address}, ${city}, ${country}. Ph: ${phone}`,
                        notes: 'Web order'
                    })
                });

                const orderData = await orderResponse.json();
                if (!orderResponse.ok) {
                    throw new Error(orderData.message || 'Failed to create order');
                }

                const orderId = orderData.orderId;
                State.notify('Initiating payment...', 'info');

                // 2. Initialize Payment Gateway Redirect
                const paymentResponse = await fetch(window.apiUrl('/api/payment/initialize'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.token}`
                    },
                    body: JSON.stringify({
                        userId: session.id,
                        orderId: orderId,
                        amount: total,
                        currency: 'NGN',
                        paymentGateway: method,
                        userCurrency: 'NGN'
                    })
                });

                const paymentData = await paymentResponse.json();

                if (paymentData.success) {
                    // Stripe / Paystack / Flutterwave/ PayPal redirect logic
                    const pData = paymentData.paymentData || paymentData;
                    const redirectUrl = pData.checkoutUrl ||
                        pData.authorizationUrl ||
                        pData.paymentLink ||
                        (pData.approvalLinks?.find(l => l.rel === 'approve')?.href);

                    if (redirectUrl) {
                        window.location.href = redirectUrl;
                    } else if (paymentData.method === 'gift_card') {
                        State.clearCart();
                        Router.navigate(`/order-confirmation/${orderId}`);
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
                            <button onclick="Auth.logout(); Router.navigate('/')" class="w-full p-4 glass-card rounded-xl font-bold text-left text-red-600 hover:bg-red-50 transition-all">
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
                    if (!confirm('Are you sure you want to delete this address?')) return;
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
                                    <img id="profile-img-preview" src="${user.profile_image || 'assets/default-avatar.png'}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${user.name}'">
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
                                            <label class="text-xs font-bold text-slate-600 ml-1">EMAIL</label>
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
                            <img src="${supplier.logo}" alt="${supplier.name}" class="w-24 h-24 rounded-xl shadow-lg">
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
    },

    // ==================== SEARCH PAGE ====================

    search(params = {}) {
        const { q = '', page = 1 } = params;
        let products = State.getProducts();

        // Filter by search query
        if (q) {
            const query = q.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
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
                            Xperiencestore is revolutionizing e-commerce by creating the world's first truly unified multi-tier commerce platform. We connect consumers, businesses, dropshippers, warehouses, and in one seamless ecosystem.
                        </p>
                        <p class="text-slate-600 leading-relaxed">
                            Our mission is to democratize global trade, making it accessible and efficient for everyone from individual shoppers to large enterprises.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        ${Components.StatCard('Active Users', '50K+', 'users', 'blue')}
                        ${Components.StatCard('Products', '1M+', 'package', 'green')}
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

    // ==================== BUSINESS (B2B) PAGES ====================

    business: {
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
                        <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400" class="h-48 md:h-64 rounded-2xl shadow-2xl transform hover:-rotate-2 transition-all duration-500">
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
                                <h3 class="font-bold mb-4">Certifications</h3>
                                <div class="flex flex-wrap gap-2">
                                    ${(supplier.certifications || []).map(cert => `
                                        <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">${cert}</span>
                                    `).join('')}
                                </div>
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
    },

    // ==================== DROPSHIPPER PAGES ====================

    dropshipper: {
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
                        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400" class="h-64 rounded-2xl shadow-2xl">
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
                                        <img src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-12 h-12 rounded-lg object-cover shadow-sm">
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
                                <form onsubmit="event.preventDefault(); /* Handle store update */" class="space-y-4">
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
                                            <label class="text-xs font-bold text-slate-600 ml-1">DESCRIPTION</label>
                                            <textarea name="description" rows="2" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">${store.description || ''}</textarea>
                                        </div>
                                    </div>
                                    <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                        Save Changes
                                    </button>
                                </form>
                            </div>

                            <!-- API Dashboard Section -->
                            <div class="glass-card p-6 rounded-2xl border-l-4 border-blue-600">
                                <div class="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 class="font-bold text-xl">API & Developer Dashboard</h3>
                                        <p class="text-slate-500 text-sm">Real-time API access and webhook monitoring</p>
                                    </div>
                                    <button onclick="Router.navigate('/api-management')" class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all">
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
                                <button onclick="Router.navigate('/api-management')" class="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-blue-50 transition-all group">
                                    <div class="flex items-center gap-3">
                                        <i data-lucide="code" class="w-5 h-5 text-blue-600"></i>
                                        <span class="font-bold text-sm">API Settings</span>
                                    </div>
                                    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                                <button onclick="Router.navigate('/social')" class="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-purple-50 transition-all group">
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
                                    <img src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'" alt="${product.name}" class="h-48 w-full object-cover">
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
                                            <p class="font-bold text-green-600">${State.formatCurrency(Number(product.price) * 1.35, 'USD')}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-500">Profit</p>
                                            <p class="font-bold text-blue-600">${State.formatCurrency(Number(product.price) * 0.35, 'USD')}</p>
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

        publicStore() {
            const state = State.get();
            const store = state.dropshipperStore || { store_name: 'My Store', store_slug: 'mystore', description: '' };
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
                                            <img src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'" alt="${product.name}" class="h-48 w-full object-cover">
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
                            <img src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'" class="w-full h-48 object-cover rounded-xl mb-4">
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
                                        <img src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-12 h-12 rounded-lg object-cover">
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
                                <button onclick="if(confirm('Delete this API key?')) State.deleteAPIKey('${k.id}'); Router.navigate('/api-management')" class="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
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
        }
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

    warehouse: {
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
                        <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400" class="h-64 rounded-2xl shadow-2xl">
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
                        ${[1, 2, 3, 4].map(i => `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 class="text-xl font-bold mb-1">PO-${1000 + i}</h3>
                                        <p class="text-sm text-slate-600">Expected: Jan ${18 + i}, 2026</p>
                                    </div>
                                    <span class="badge-${i === 1 ? 'green' : 'orange'} px-3 py-1 rounded-full text-xs font-bold">
                                        ${i === 1 ? 'Arrived' : 'In Transit'}
                                    </span>
                                </div>

                                <div class="grid grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p class="text-slate-500">Supplier</p>
                                        <p class="font-bold">Supplier ${i}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Items</p>
                                        <p class="font-bold">${50 + i * 20} units</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Tracking</p>
                                        <p class="font-bold">TRK${Math.random().toString().slice(2, 14)}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Priority</p>
                                        <p class="font-bold ${i <= 2 ? 'text-red-600' : 'text-blue-600'}">${i <= 2 ? 'High' : 'Normal'}</p>
                                    </div>
                                </div>

                                ${i === 1 ? `
                                    <div class="border-t pt-4">
                                        <h4 class="font-bold mb-3">Receiving Checklist</h4>
                                        <div class="space-y-2 mb-4">
                                            ${['Verify quantities', 'Inspect quality', 'Update inventory', 'Generate labels'].map((task, idx) => `
                                                <label class="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" ${idx === 0 ? 'checked' : ''} class="rounded">
                                                    <span class="text-sm">${task}</span>
                                                </label>
                                            `).join('')}
                                        </div>
                                        <div class="flex gap-3">
                                            <button class="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                                                Complete Receipt
                                            </button>
                                            <button onclick="State.printReceivingSlip(${1000 + i})" class="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all">
                                                <i data-lucide="printer" class="w-4 h-4 inline mr-2"></i> Print Slip
                                            </button>
                                            <button class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                                Report Issue
                                            </button>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
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
    },

    // ==================== SUPPLIER PAGES ====================

    supplier: {
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
                        <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400" class="h-48 md:h-64 rounded-2xl shadow-2xl transform hover:rotate-2 transition-all duration-500">
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
                                        <img src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-12 h-12 rounded-lg object-cover">
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
                                                <img src="${State.getMediaUrl(product.id, 0)}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-12 h-12 rounded-lg object-cover shadow-sm">
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
                                        ${isEdit ? `
                                            <div class="aspect-square rounded-lg bg-slate-100 overflow-hidden relative group">
                                                <img src="${State.getMediaUrl(productId, 0)}" class="w-full h-full object-cover">
                                            </div>
                                        ` : ''}
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
                                                    <img src="${State.getMediaUrl(item.product_id, 0)}" class="w-8 h-8 rounded object-cover">
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

                                <div class="flex justify-end gap-3">
                                    <button onclick="window.printInvoice(${order.order_id})" class="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-bold text-sm text-slate-600 transition-all flex items-center gap-2">
                                        <i data-lucide="printer" class="w-4 h-4"></i> Print Invoice
                                    </button>
                                    ${buildStatusSelect(order)}
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

        reports() {
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Analytics & Reports</h1>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        ${Components.StatCard('Total Sales', '$142,394', 'dollar-sign', 'green', 15)}
                        ${Components.StatCard('Avg Order Value', '$3,150', 'shopping-bag', 'blue', 8)}
                        ${Components.StatCard('Total Orders', '156', 'package', 'purple')}
                        ${Components.StatCard('Conversion Rate', '4.2%', 'activity', 'orange', -2)}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div class="lg:col-span-2 glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Revenue Trend</h3>
                            <div class="h-64 flex items-end justify-between gap-2">
                                ${[35, 45, 30, 60, 75, 50, 65, 80, 70, 90, 85, 95].map(h => `
                                    <div class="w-full bg-blue-100 rounded-t-lg relative group h-full">
                                        <div class="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all group-hover:bg-blue-600" style="height: ${h}%"></div>
                                        <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">$${h}k</div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="flex justify-between mt-4 text-xs text-slate-400 font-bold uppercase">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Sales by Category</h3>
                            <div class="space-y-6">
                                ${[
                    { label: 'Electronics', val: 75, color: 'blue' },
                    { label: 'Accessories', val: 55, color: 'purple' },
                    { label: 'Wearables', val: 35, color: 'green' },
                    { label: 'Home Tech', val: 20, color: 'orange' }
                ].map(item => `
                                    <div>
                                        <div class="flex justify-between text-sm font-bold mb-2">
                                            <span>${item.label}</span>
                                            <span>${item.val}%</span>
                                        </div>
                                        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-${item.color}-500 rounded-full" style="width: ${item.val}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="glass-card p-6 rounded-2xl">
                        <h3 class="font-bold mb-6">Recent Transactions</h3>
                        <table class="w-full">
                            <thead>
                                <tr class="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                                    <th class="pb-4">Transaction ID</th>
                                    <th class="pb-4">Customer</th>
                                    <th class="pb-4">Date</th>
                                    <th class="pb-4">Amount</th>
                                    <th class="pb-4">Status</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                ${Array(5).fill(0).map((_, i) => `
                                    <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td class="py-4 font-mono">TRX-${Math.random().toString(36).substr(2, 8).toUpperCase()}</td>
                                        <td class="py-4 font-bold">Client Company ${i + 1}</td>
                                        <td class="py-4 text-slate-500">Jan ${15 - i}, 2026</td>
                                        <td class="py-4 font-bold">$${(Math.random() * 5000).toFixed(2)}</td>
                                        <td class="py-4"><span class="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded-full">Completed</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
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
    },

    // ==================== ADMIN PAGES ====================

    admin: {
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
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400" class="h-48 md:h-64 rounded-2xl shadow-2xl opacity-80 transform hover:-rotate-2 transition-all duration-500">
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

                    <div class="glass-card rounded-2xl overflow-hidden">
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
                        
                        <table class="w-full">
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
                                            <td class="p-6 text-center">
                                                <button onclick="window.editAdminUser(${user.id}, '${user.role}', ${user.is_verified})" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors" title="Edit User">
                                                    <i data-lucide="edit" class="w-5 h-5"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
            }).join('') : `
                                    <tr>
                                        <td colspan="5" class="p-8 text-center text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                        
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
                                                <button onclick="window.viewAdminLogArchive('${archive.key}')" class="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2 ml-auto">
                                                    <i data-lucide="eye" class="w-3 h-3"></i> View Content
                                                </button>
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
                                            <img src="${State.getMediaUrl(product.id, 0)}" class="w-12 h-12 rounded-xl object-cover bg-slate-100" onerror="this.src='/assets/placeholder.jpg'">
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
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Marketing & Promotions</h1>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div class="md:col-span-2 glass-card p-6 rounded-2xl">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="font-bold text-lg">Active Campaigns</h3>
                                <button class="text-blue-600 font-bold text-sm hover:underline">+ Create New</button>
                            </div>
                            <div class="space-y-4">
                                ${['Summer Sale 2026', 'New Customer Welcome', 'Black Friday Early Access'].map(campaign => `
                                    <div class="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 hover:shadow-md transition-all bg-white">
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <i data-lucide="megaphone" class="w-6 h-6 text-purple-600"></i>
                                            </div>
                                            <div>
                                                <h4 class="font-bold text-slate-800">${campaign}</h4>
                                                <p class="text-xs text-slate-400">Ends in 5 days • 12k reach</p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="text-xs font-bold text-slate-500">ROI</span>
                                                <span class="text-sm font-bold text-green-600">450%</span>
                                            </div>
                                            <div class="w-24 bg-slate-100 rounded-full h-1.5 ml-auto">
                                                <div class="bg-green-500 h-1.5 rounded-full" style="width: 75%"></div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                            <h3 class="font-bold text-lg mb-4">Quick Stats</h3>
                            <div class="space-y-6">
                                <div>
                                    <p class="text-blue-200 text-sm">Total Campaign Reach</p>
                                    <p class="text-3xl font-bold">1.2M</p>
                                </div>
                                <div>
                                    <p class="text-blue-200 text-sm">Conversion Rate</p>
                                    <p class="text-3xl font-bold">2.4%</p>
                                </div>
                                <div>
                                    <p class="text-blue-200 text-sm">Marketing Spend</p>
                                    <p class="text-3xl font-bold">$45,000</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card p-6 rounded-2xl">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="font-bold text-lg">Coupons & Vouchers</h3>
                            <button class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">Add Coupon</button>
                        </div>
                        <table class="w-full text-sm">
                            <thead class="bg-slate-50 text-slate-500">
                                <tr>
                                    <th class="text-left p-4 rounded-l-lg">Code</th>
                                    <th class="text-left p-4">Discount</th>
                                    <th class="text-left p-4">Usage</th>
                                    <th class="text-left p-4">Status</th>
                                    <th class="text-right p-4 rounded-r-lg">Expiry</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${[
                    { code: 'WELCOME10', disc: '10%', use: '1,240', status: 'Active', exp: 'Never' },
                    { code: 'SUMMER25', disc: '25%', use: '450', status: 'Scheduled', exp: 'Jul 30' },
                    { code: 'FLASH50', disc: '$50 Off', use: '89', status: 'Expired', exp: 'Jan 10' },
                    { code: 'SHIPFREE', disc: 'Free Ship', use: '3,102', status: 'Active', exp: 'Dec 31' }
                ].map(c => `
                                    <tr class="border-b border-slate-50 last:border-0">
                                        <td class="p-4 font-mono font-bold text-slate-800">${c.code}</td>
                                        <td class="p-4">${c.disc}</td>
                                        <td class="p-4 text-slate-600">${c.use}</td>
                                        <td class="p-4">
                                            <span class="px-2 py-1 rounded text-xs font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-600' : c.status === 'expired' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}">
                                                ${c.status}
                                            </span>
                                        </td>
                                        <td class="p-4 text-right text-slate-500">${c.exp}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Platform Broadcast -->
                    <div class="mt-12 glass-card p-8 rounded-2xl border border-blue-100 bg-blue-50/30">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                <i data-lucide="megaphone" class="text-white"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-slate-800">Platform-wide Broadcast</h2>
                                <p class="text-slate-500 text-sm">Send a real-time notification to all users or specific roles.</p>
                            </div>
                        </div>

                        <form onsubmit="event.preventDefault(); window.broadcastAdminNotification(this);" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label class="block text-sm font-bold text-slate-700">Notification Title</label>
                                    <input type="text" name="title" placeholder="e.g., Flash Sale live now!" class="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-sm" required>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-bold text-slate-700">Target Role (Optional)</label>
                                    <select name="role" class="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-sm">
                                        <option value="">All Users</option>
                                        <option value="consumer">Consumers</option>
                                        <option value="business">Business Accounts</option>
                                        <option value="supplier">Suppliers</option>
                                        <option value="dropshipper">Dropshippers</option>
                                    </select>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-slate-700">Message Body</label>
                                <textarea name="message" rows="3" placeholder="Enter the detailed message here..." class="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-sm" required></textarea>
                            </div>
                            <div class="flex justify-end gap-3">
                                <select name="type" class="p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold shadow-sm">
                                    <option value="info">ℹ️ Info (Blue)</option>
                                    <option value="success">✅ Success (Green)</option>
                                    <option value="warning">⚠️ Warning (Orange)</option>
                                    <option value="error">🚨 Alert (Red)</option>
                                </select>
                                <button type="submit" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                                    <i data-lucide="send" class="w-4 h-4"></i> Send Broadcast
                                </button>
                            </div>
                        </form>
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
    }
};

// Make Pages globally available
window.Pages = Pages;

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

window.handleImagePreview = (input) => {
    const preview = document.getElementById('preview-gallery');
    const placeholder = document.getElementById('image-upload-placeholder');
    preview.innerHTML = '';

    if (input.files && input.files.length > 0) {
        placeholder.classList.add('hidden');
        preview.classList.remove('hidden');
        preview.innerHTML = ''; // Clear existing

        Array.from(input.files).slice(0, 5).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('div');
                img.className = 'aspect-square rounded-lg bg-slate-100 overflow-hidden relative group';
                img.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <i data-lucide="check" class="text-white w-6 h-6"></i>
                    </div>
                `;
                preview.appendChild(img);
                lucide.createIcons(); // Re-run icons for new elements
            };
            reader.readAsDataURL(file);
        });
    } else {
        placeholder.classList.remove('hidden');
        preview.classList.add('hidden');
    }
};

window.submitProduct = async (event, productId = null) => {
    const form = event.target;
    const isEdit = !!productId;

    // Only require images for new products
    const imageInput = form.querySelector('input[name="images"]');
    if (!isEdit && imageInput.files.length === 0) {
        Components.showNotification('Please upload at least one product image', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Saving...';
    lucide.createIcons();

    try {
        const token = Auth.getToken();

        let response;
        if (isEdit) {
            // For editing, we use JSON if no new images are selected, or we can use FormData anyway
            const data = {};
            const formData = new FormData(form);
            formData.forEach((value, key) => {
                if (key !== 'images') data[key] = value;
            });

            response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            const formData = new FormData(form);
            response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
        }

        if (response.ok) {
            Components.showNotification(isEdit ? 'Product updated successfully!' : 'Product created successfully!', 'success');
            await State.fetchProducts();
            Router.navigate('/supplier/products');
        } else {
            const error = await response.json();
            Components.showNotification(error.message || 'Action failed', 'error');
        }
    } catch (error) {
        console.error(error);
        Components.showNotification('An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
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
        role: formData.get('role') || null
    };

    if (!data.title || !data.message) {
        Components.showNotification('Title and Message are required', 'warning');
        return;
    }

    const success = await State.broadcastAdminNotification(data);
    if (success) {
        form.reset();
        Components.showNotification('Broadcast sent to all eligible users', 'success');
    }
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
