/**
 * Payment Checkout Modal Component
 * Usage: Include in pages that need payment processing
 */

export const PaymentCheckoutModal = {
    /**
     * Render payment gateway selection modal
     */
    render(orderId, totalAmount, userCurrency = 'USD') {
        return `
            <div id="payment-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
                <div class="glass-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <!-- Header -->
                    <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-2xl font-bold">Complete Payment</h2>
                                <p class="text-sm opacity-90 mt-1">Choose your payment method</p>
                            </div>
                            <button onclick="PaymentCheckoutModal.close()" class="p-2 hover:bg-white/10 rounded-lg transition-all">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="flex-1 overflow-y-auto p-6">
                        <!-- Currency Selector -->
                        <div class="mb-6 glass-card p-4 rounded-xl">
                            <label class="text-sm font-bold text-slate-600 mb-2 block">SELECT CURRENCY</label>
                            <select id="currency-selector" onchange="PaymentCheckoutModal.updateCurrency()" class="w-full p-3 rounded-xl border bg-white outline-none focus:border-blue-500">
                                <!-- Populated dynamically -->
                            </select>
                            <div id="conversion-info" class="mt-2 text-xs text-slate-500"></div>
                        </div>

                        <!-- Price Display -->
                        <div class="mb-6 text-center">
                            <p class="text-sm text-slate-500 mb-2">Total Amount</p>
                            <p id="display-amount" class="text-4xl font-bold text-slate-800"></p>
                            <p id="original-amount" class="text-sm text-slate-400 mt-1"></p>
                        </div>

                        <!-- Gift Card Section -->
                        <div class="mb-6 glass-card p-4 rounded-xl">
                            <div class="flex items-center justify-between mb-3">
                                <label class="text-sm font-bold text-slate-600">USE GIFT CARD BALANCE</label>
                                <span id="gift-card-balance" class="text-sm font-bold text-green-600">$0.00</span>
                            </div>
                            <div class="flex gap-2">
                                <input type="number" id="gift-card-amount" placeholder="Enter amount" class="flex-1 p-3 rounded-xl border bg-white outline-none focus:border-blue-500" min="0"/>
                                <button onclick="PaymentCheckoutModal.applyGiftCard()" class="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all">Apply</button>
                            </div>
                            <div id="gift-card-applied-info" class="mt-2 text-xs text-green-600"></div>
                        </div>

                        <!-- Payment Gateways -->
                        <div class="mb-4">
                            <label class="text-sm font-bold text-slate-600 mb-3 block">SELECT PAYMENT METHOD</label>
                            <div id="payment-gateways-container" class="space-y-2">
                                <!-- Populated dynamically -->
                            </div>
                        </div>

                        <!-- Redeem Gift Card -->
                        <div class="border-t border-slate-200 pt-4 mt-4">
                            <p class="text-xs font-bold text-slate-600 mb-2">HAVE A GIFT CARD CODE?</p>
                            <div class="flex gap-2">
                                <input type="text" id="redeem-gift-card-code" placeholder="XP-XXXX-XXXX-XXXX" class="flex-1 p-3 rounded-xl border bg-white outline-none focus:border-blue-500 uppercase"/>
                                <button onclick="PaymentCheckoutModal.redeemGiftCard()" class="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all">Redeem</button>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="p-6 border-t border-slate-200 bg-slate-50">
                        <button id="proceed-payment-btn" onclick="PaymentCheckoutModal.proceedPayment()" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Open payment modal
     */
    async open(orderId, totalAmount, userId) {
        // Store payment details
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.userId = userId;
        this.userCurrency = localStorage.getItem('preferredCurrency') || 'USD';
        this.giftCardApplied = 0;
        this.selectedGateway = null;

        // Create modal
        const modal = document.createElement('div');
        modal.innerHTML = this.render(orderId, totalAmount, this.userCurrency);
        document.body.appendChild(modal);

        // Initialize Payment module
        await Payment.init();

        // Populate currencies
        await this.populateCurrencies();

        // Populate payment gateways
        await this.populateGateways();

        // Load gift card balance
        await this.loadGiftCardBalance();

        // Update display
        await this.updateCurrency();

        // Initialize LucideIcons
        lucide.createIcons();
    },

    /**
     * Populate currency selector
     */
    async populateCurrencies() {
        const selector = document.getElementById('currency-selector');
        const currencies = Payment.currencies;

        selector.innerHTML = Object.keys(currencies).map(code => `
            <option value="${code}" ${code === this.userCurrency ? 'selected' : ''}>
                ${currencies[code].flag} ${currencies[code].name} (${currencies[code].symbol})
            </option>
        `).join('');
    },

    /**
     * Render a gateway logo — using local assets preferred
     */
    _gatewayLogoHtml(gateway) {
        const gatewayId = gateway.id.toLowerCase();
        const logoMap = {
            'stripe': 'assets/stripe.png',
            'paystack': 'assets/paystack.png',
            'flutterwave': 'assets/flutterwave.png',
            'paypal': 'assets/paypal.png'
        };

        const logoSrc = logoMap[gatewayId] || gateway.logo;

        if (logoSrc) {
            return `<div class="w-16 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm flex-shrink-0">
                <img src="${logoSrc}" alt="${gateway.name}" 
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                     class="max-w-full max-h-full object-contain" />
                <span class="hidden text-lg items-center justify-center w-full h-full font-bold text-slate-500">${gateway.name[0]}</span>
            </div>`;
        }
        // Gift card fallback
        return `<div class="w-14 h-10 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border border-purple-200 flex-shrink-0">
            <span class="text-2xl">🎁</span>
        </div>`;
    },

    /**
     * Populate payment gateways with real logos
     */
    async populateGateways() {
        const container = document.getElementById('payment-gateways-container');
        const gateways = Payment.availableGateways;

        if (!gateways || gateways.length === 0) {
            container.innerHTML = `<p class="text-center text-slate-500 py-4">No payment methods available. Please check your configuration.</p>`;
            return;
        }

        container.innerHTML = gateways.map(gateway => `
            <div onclick="PaymentCheckoutModal.selectGateway('${gateway.id}')"
                 id="gateway-${gateway.id}"
                 class="gateway-option p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4 group">
                ${this._gatewayLogoHtml(gateway)}
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-slate-800 text-sm">${gateway.name}</h4>
                    <p class="text-xs text-slate-500 mt-0.5">${gateway.description}</p>
                    <div class="flex gap-1 mt-1.5 flex-wrap">
                        ${gateway.currencies.slice(0, 5).map(curr =>
            `<span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">${curr}</span>`
        ).join('')}
                    </div>
                </div>
                <i data-lucide="check-circle" class="w-5 h-5 text-blue-600 hidden gateway-check flex-shrink-0"></i>
            </div>
        `).join('');

        lucide.createIcons();
    },

    /**
     * Select payment gateway
     */
    selectGateway(gatewayId) {
        // Remove previous selection
        document.querySelectorAll('.gateway-option').forEach(el => {
            el.classList.remove('border-blue-600', 'bg-blue-50');
            el.querySelector('.gateway-check').classList.add('hidden');
        });

        // Mark selected
        const selected = document.getElementById(`gateway-${gatewayId}`);
        selected.classList.add('border-blue-600', 'bg-blue-50');
        selected.querySelector('.gateway-check').classList.remove('hidden');

        this.selectedGateway = gatewayId;
    },

    /**
     * Update currency and convert amount
     */
    async updateCurrency() {
        const selectedCurrency = document.getElementById('currency-selector').value;
        this.userCurrency = selectedCurrency;
        Payment.setCurrency(selectedCurrency);

        // Convert amount
        const converted = await Payment.convertCurrency(this.totalAmount, 'USD', selectedCurrency);

        if (converted) {
            this.convertedAmount = converted.convertedAmount;
            document.getElementById('display-amount').textContent = Payment.formatAmount(this.convertedAmount, selectedCurrency);

            if (selectedCurrency !== 'USD') {
                document.getElementById('original-amount').textContent = `Original: ${Payment.formatAmount(this.totalAmount, 'USD')}`;
                document.getElementById('conversion-info').textContent = `Exchange Rate: 1 USD = ${converted.exchangeRate.toFixed(4)} ${selectedCurrency}`;
            } else {
                document.getElementById('original-amount').textContent = '';
                document.getElementById('conversion-info').textContent = '';
            }
        }

        // Reload gift card balance for new currency
        await this.loadGiftCardBalance();
    },

    /**
     * Load gift card balance
     */
    async loadGiftCardBalance() {
        const balance = await Payment.getGiftCardBalance(this.userId, this.userCurrency);
        document.getElementById('gift-card-balance').textContent = Payment.formatAmount(balance, this.userCurrency);
        this.giftCardBalance = balance;
    },

    /**
     * Apply gift card balance
     */
    applyGiftCard() {
        const amount = parseFloat(document.getElementById('gift-card-amount').value || 0);

        if (amount <= 0) {
            Components.showNotification('Please enter a valid amount', 'error');
            return;
        }

        if (amount > this.giftCardBalance) {
            Components.showNotification('Insufficient gift card balance', 'error');
            return;
        }

        if (amount > this.convertedAmount) {
            Components.showNotification('Amount exceeds order total', 'error');
            return;
        }

        this.giftCardApplied = amount;
        const remaining = this.convertedAmount - amount;

        document.getElementById('gift-card-applied-info').textContent =
            `✓ ${Payment.formatAmount(amount, this.userCurrency)} will be deducted from your gift card balance. Remaining: ${Payment.formatAmount(remaining, this.userCurrency)}`;

        Components.showNotification('Gift card applied successfully', 'success');
    },

    /**
     * Redeem gift card code
     */
    async redeemGiftCard() {
        const code = document.getElementById('redeem-gift-card-code').value.trim();

        if (!code) {
            Components.showNotification('Please enter a gift card code', 'error');
            return;
        }

        const result = await Payment.redeemGiftCard(this.userId, code);

        if (result.success) {
            Components.showNotification(`Gift card redeemed! ${Payment.formatAmount(result.amount, result.currency)} added to your balance`, 'success');
            document.getElementById('redeem-gift-card-code').value = '';
            await this.loadGiftCardBalance();
        } else {
            Components.showNotification(result.message, 'error');
        }
    },

    /**
     * Proceed with payment
     */
    async proceedPayment() {
        if (!this.selectedGateway) {
            Components.showNotification('Please select a payment method', 'error');
            return;
        }

        const btn = document.getElementById('proceed-payment-btn');
        btn.disabled = true;
        btn.textContent = 'Processing...';

        const paymentData = {
            userId: this.userId,
            orderId: this.orderId,
            amount: this.totalAmount,
            currency: 'USD', // Base currency
            userCurrency: this.userCurrency,
            paymentGateway: this.selectedGateway,
            useGiftCard: this.giftCardApplied > 0,
            giftCardAmount: this.giftCardApplied,
            callbackUrl: window.location.origin + window.location.pathname + '#/payment/verify'
        };

        const result = await Payment.initializePayment(paymentData);

        if (result.success) {
            if (result.requiresAction) {
                // Handle gateway-specific redirects
                this.handleGatewayRedirect(result);
            } else {
                // Payment completed (fully paid with gift card)
                Components.showNotification('Payment completed successfully!', 'success');
                this.close();
                Router.navigate('/account/orders');
            }
        } else {
            Components.showNotification(result.message || 'Payment failed', 'error');
            btn.disabled = false;
            btn.textContent = 'Proceed to Payment';
        }
    },

    /**
     * Handle gateway-specific redirects after initialization
     */
    handleGatewayRedirect(result) {
        const gw = result.gateway.toLowerCase();

        switch (gw) {
            case 'stripe': {
                // Redirect to Stripe Hosted Checkout page
                const checkoutUrl = result.paymentData?.checkoutUrl;
                if (checkoutUrl) {
                    window.location.href = checkoutUrl;
                } else {
                    Components.showNotification(
                        'Stripe is not configured. Please add STRIPE_SECRET_KEY in .env',
                        'error'
                    );
                    document.getElementById('proceed-payment-btn').disabled = false;
                    document.getElementById('proceed-payment-btn').textContent = 'Proceed to Payment';
                }
                break;
            }

            case 'paystack': {
                const url = result.paymentData?.authorizationUrl;
                if (url) {
                    window.location.href = url;
                } else {
                    Components.showNotification('Paystack initialization failed. Check your API key.', 'error');
                    document.getElementById('proceed-payment-btn').disabled = false;
                    document.getElementById('proceed-payment-btn').textContent = 'Proceed to Payment';
                }
                break;
            }

            case 'flutterwave': {
                const link = result.paymentData?.paymentLink;
                if (link) {
                    window.location.href = link;
                } else {
                    Components.showNotification('Flutterwave initialization failed. Check your API key.', 'error');
                    document.getElementById('proceed-payment-btn').disabled = false;
                    document.getElementById('proceed-payment-btn').textContent = 'Proceed to Payment';
                }
                break;
            }

            case 'paypal': {
                const approvalLink = result.paymentData?.approvalLinks?.find(l => l.rel === 'approve');
                if (approvalLink) {
                    window.location.href = approvalLink.href;
                } else {
                    Components.showNotification('PayPal initialization failed. Check your credentials.', 'error');
                    document.getElementById('proceed-payment-btn').disabled = false;
                    document.getElementById('proceed-payment-btn').textContent = 'Proceed to Payment';
                }
                break;
            }

            default:
                Components.showNotification('Unknown payment gateway.', 'error');
        }
    },

    /**
     * Close modal
     */
    close() {
        document.getElementById('payment-modal')?.remove();
    }
};

// Make globally available
window.PaymentCheckoutModal = PaymentCheckoutModal;
