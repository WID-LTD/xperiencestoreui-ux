const db = require('../config/db');

/**
 * @desc    Get supplier wallet balance and transaction history
 * @route   GET /api/supplier/finance/wallet
 * @access  Private (Supplier)
 */
const getSupplierWallet = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all wallets for this user (multi-currency support)
        const { rows: wallets } = await db.query(
            'SELECT * FROM user_wallets WHERE user_id = $1',
            [userId]
        );

        if (wallets.length === 0) {
            return res.json({ balance: 0, currency: 'USD', transactions: [] });
        }

        // Fetch recent transactions for the primary wallet (or all)
        const { rows: transactions } = await db.query(
            `SELECT wt.*, uw.currency 
             FROM wallet_transactions wt
             JOIN user_wallets uw ON wt.wallet_id = uw.id
             WHERE uw.user_id = $1
             ORDER BY wt.created_at DESC
             LIMIT 20`,
            [userId]
        );

        res.json({
            wallets: wallets.map(w => ({
                ...w,
                balance: Number(w.balance),
                gift_card_balance: Number(w.gift_card_balance)
            })),
            transactions: transactions.map(t => ({
                ...t,
                amount: Number(t.amount),
                balance_after: Number(t.balance_after)
            }))
        });
    } catch (error) {
        console.error('Get Supplier Wallet Error:', error);
        res.status(500).json({ message: 'Failed to fetch wallet information' });
    }
};

/**
 * @desc    Request a payout from wallet
 * @route   POST /api/supplier/finance/payout
 * @access  Private (Supplier)
 */
const requestPayout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, currency = 'NGN', binNumber, accountName, bankName } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid payout amount' });
        }

        // Check balance
        const { rows: wallets } = await db.query(
            'SELECT * FROM user_wallets WHERE user_id = $1 AND currency = $2',
            [userId, currency]
        );

        if (wallets.length === 0 || Number(wallets[0].balance) < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const walletId = wallets[0].id;

        // Begin transaction
        await db.query('BEGIN');

        try {
            // Deduct from wallet
            const { rows: updatedWallet } = await db.query(
                'UPDATE user_wallets SET balance = balance - $1, updated_at = NOW() WHERE id = $2 RETURNING balance',
                [amount, walletId]
            );

            // Record transaction
            await db.query(
                `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, balance_after, description, reference)
                 VALUES ($1, 'debit', $2, $3, $4, $5)`,
                [
                    walletId,
                    amount,
                    updatedWallet[0].balance,
                    `Payout request to ${bankName} (${binNumber})`,
                    `PAYOUT-${Date.now()}`
                ]
            );

            // In a real system, we'd record this in a dedicated 'payout_requests' table for admin approval
            // For now, we'll just log it or rely on wallet_transactions

            await db.query('COMMIT');
            res.json({ success: true, message: 'Payout request submitted successfully', newBalance: updatedWallet[0].balance });
        } catch (err) {
            await db.query('ROLLBACK');
            throw err;
        }

    } catch (error) {
        console.error('Request Payout Error:', error);
        res.status(500).json({ message: 'Failed to process payout request' });
    }
};

/**
 * @desc    Get support banks (via Paystack)
 * @route   GET /api/finance/banks
 * @access  Private
 */
const getBanks = async (req, res) => {
    try {
        // In a real app, you'd fetch from https://api.paystack.co/bank
        // For now, returning a static list of popular Nigerian banks
        const banks = [
            { id: 1, name: 'Access Bank', code: '044' },
            { id: 2, name: 'First Bank of Nigeria', code: '011' },
            { id: 3, name: 'Guaranty Trust Bank', code: '058' },
            { id: 4, name: 'United Bank for Africa', code: '033' },
            { id: 5, name: 'Zenith Bank', code: '057' },
            { id: 6, name: 'Kuda Bank', code: '50211' },
            { id: 7, name: 'Opay', code: '999992' },
            { id: 8, name: 'Palmpay', code: '999991' }
        ];
        res.json(banks);
    } catch (error) {
        console.error('Get Banks Error:', error);
        res.status(500).json({ message: 'Failed to fetch banks' });
    }
};

/**
 * @desc    Resolve bank account (Verify account name)
 * @route   GET /api/finance/resolve-account
 * @access  Private
 */
const resolveAccount = async (req, res) => {
    try {
        const { accountNumber, bankCode } = req.query;
        if (!accountNumber || !bankCode) {
            return res.status(400).json({ message: 'Account number and bank code are required' });
        }

        // Mocking Paystack Account Resolution
        // In production: const response = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, ...)
        
        // Simulating a delay
        await new Promise(resolve => setTimeout(resolve, 500));

        res.json({
            success: true,
            account_name: 'TEST ACCOUNT NAME',
            account_number: accountNumber,
            bank_code: bankCode
        });
    } catch (error) {
        console.error('Resolve Account Error:', error);
        res.status(500).json({ message: 'Failed to resolve account' });
    }
};

/**
 * @desc    Add or Update bank account
 * @route   POST /api/finance/bank-account
 * @access  Private
 */
const addBankAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { accountNumber, bankCode, bankName, accountName, currency = 'NGN' } = req.body;

        if (!accountNumber || !bankCode || !bankName) {
            return res.status(400).json({ message: 'Missing required bank details' });
        }

        // In production, you'd call Paystack to create a transfer recipient here
        const recipientCode = `RCP_${Math.random().toString(36).substring(7).toUpperCase()}`;

        const { rows } = await db.query(`
            INSERT INTO user_bank_accounts (user_id, account_number, bank_code, bank_name, account_name, recipient_code, currency, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
            ON CONFLICT (user_id) DO UPDATE SET
                account_number = EXCLUDED.account_number,
                bank_code = EXCLUDED.bank_code,
                bank_name = EXCLUDED.bank_name,
                account_name = EXCLUDED.account_name,
                recipient_code = EXCLUDED.recipient_code,
                updated_at = NOW()
            RETURNING *
        `, [userId, accountNumber, bankCode, bankName, accountName, recipientCode, currency]);

        res.json({ success: true, message: 'Bank account updated successfully', account: rows[0] });
    } catch (error) {
        console.error('Add Bank Account Error:', error);
        res.status(500).json({ message: 'Failed to save bank account' });
    }
};

/**
 * @desc    Get user's bank accounts
 * @route   GET /api/finance/bank-accounts
 * @access  Private
 */
const getBankAccounts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query('SELECT * FROM user_bank_accounts WHERE user_id = $1', [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Get Bank Accounts Error:', error);
        res.status(500).json({ message: 'Failed to fetch bank accounts' });
    }
};

/**
 * @desc    Request a withdrawal (payout)
 * @route   POST /api/finance/payouts/request
 * @access  Private
 */
const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, currency = 'NGN', bankAccountId } = req.body;

        if (!amount || amount < 1000) {
            return res.status(400).json({ message: 'Minimum withdrawal amount is ₦1,000' });
        }

        // 1. Verify bank account
        const { rows: bankRows } = await db.query('SELECT * FROM user_bank_accounts WHERE id = $1 AND user_id = $2', [bankAccountId, userId]);
        if (bankRows.length === 0) return res.status(404).json({ message: 'Bank account not found' });

        // 2. Check balance
        const { rows: wallets } = await db.query(
            'SELECT id, balance FROM user_wallets WHERE user_id = $1 AND currency = $2',
            [userId, currency]
        );

        if (wallets.length === 0 || Number(wallets[0].balance) < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const walletId = wallets[0].id;
        const reference = `PO-REQ-${Date.now()}`;

        // Begin transaction
        await db.query('BEGIN');

        try {
            // 3. Deduct from wallet
            const { rows: updatedWallet } = await db.query(
                'UPDATE user_wallets SET balance = balance - $1, updated_at = NOW() WHERE id = $2 RETURNING balance',
                [amount, walletId]
            );

            // 4. Record wallet transaction
            await db.query(
                `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, balance_after, description, reference)
                 VALUES ($1, 'debit', $2, $3, $4, $5)`,
                [walletId, amount, updatedWallet[0].balance, `Withdrawal request: ${reference}`, reference]
            );

            // 5. Create payout request
            await db.query(
                `INSERT INTO payout_requests (user_id, wallet_id, bank_account_id, amount, currency, status, reference)
                 VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
                [userId, walletId, bankAccountId, amount, currency, reference]
            );

            await db.query('COMMIT');
            res.json({ success: true, message: 'Withdrawal request submitted successfully', reference });
        } catch (err) {
            await db.query('ROLLBACK');
            throw err;
        }
    } catch (error) {
        console.error('Request Withdrawal Error:', error);
        res.status(500).json({ message: 'Failed to process withdrawal request' });
    }
};

/**
 * @desc    Get payout history
 * @route   GET /api/finance/payouts
 * @access  Private
 */
const getPayoutHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(`
            SELECT pr.*, ba.bank_name, ba.account_number 
            FROM payout_requests pr
            JOIN user_bank_accounts ba ON pr.bank_account_id = ba.id
            WHERE pr.user_id = $1
            ORDER BY pr.created_at DESC
        `, [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Get Payout History Error:', error);
        res.status(500).json({ message: 'Failed to fetch payout history' });
    }
};

module.exports = {
    getSupplierWallet,
    requestPayout, // Deprecated: use requestWithdrawal
    getBanks,
    resolveAccount,
    addBankAccount,
    getBankAccounts,
    requestWithdrawal,
    getPayoutHistory
};
