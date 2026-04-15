const db = require('../config/db');

// @desc    Purchase a gift card
// @route   POST /api/gift-cards/purchase
const purchaseGiftCard = async (req, res) => {
    const { amount, recipientEmail, message, paymentMethod, paymentReference } = req.body;
    
    try {
        // 1. Generate a standardized code
        const code = 'XP-' + Math.random().toString(36).substring(2, 10).toUpperCase();

        const query = `
            INSERT INTO gift_cards (code, balance, original_amount, currency, purchaser_id, recipient_email)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        // In a real scenario, req.user.id should be present. Using null fallback for guest/unprotected routes.
        const values = [code, amount, amount, 'USD', req.user ? req.user.id : null, recipientEmail];
        
        const { rows } = await db.query(query, values);
        
        // 2. Track the transaction
        await db.query(
            'INSERT INTO gift_card_transactions (gift_card_id, user_id, transaction_type, amount, currency, payment_method, payment_reference) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [rows[0].id, req.user ? req.user.id : null, 'purchase', amount, 'USD', paymentMethod, paymentReference]
        );

        // 3. Send notification email via emailService (Brevo/Mailgun)
        try {
            const emailService = require('../services/emailService');
            await emailService.sendGiftCard(recipientEmail, {
                code,
                amount,
                currency: 'USD',
                sender: req.user ? req.user.name : 'A Friend',
                message: message || 'You received a gift card!'
            });
        } catch (emailErr) {
            console.error('Email Dispatch Error:', emailErr.message);
        }
        
        res.status(201).json({
            success: true,
            giftCard: rows[0],
            message: `Gift card sent to ${recipientEmail}`
        });
    } catch (error) {
        console.error('Gift Card Error:', error);
        res.status(500).json({ message: 'Gift card purchase failed' });
    }
};

// @desc    Check gift card balance
// @route   GET /api/gift-cards/:code
const checkBalance = async (req, res) => {
    try {
        const { code } = req.params;
        const query = 'SELECT * FROM gift_cards WHERE code = $1';
        const { rows } = await db.query(query, [code]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Gift card not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { purchaseGiftCard, checkBalance };
