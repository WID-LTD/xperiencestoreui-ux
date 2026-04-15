const formData = require('form-data');
const Mailgun = require('mailgun.js');
const SibApiV3Sdk = require('@getbrevo/brevo');
const path = require('path');
const fs = require('fs');

/**
 * Configure Mailgun
 */
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: 'https://api.mailgun.net' // Adjust if using EU region
});

/**
 * Configure Brevo (formerly Sendinblue)
 */const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
brevoClient.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Send Transactional Email (Brevo)
 * Uses hello@xperiencestore.store
 */
const sendTransactionalEmail = async (to, subject, htmlContent) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { "name": "Xperiencestore", "email": "hello@xperiencestore.store" };
    sendSmtpEmail.to = [{ "email": to }];

    try {
        const data = await brevoClient.sendTransacEmail(sendSmtpEmail);
        console.log('Brevo Transactional Email Sent:', data);
        return { success: true, provider: 'brevo', data };
    } catch (error) {
        console.error('Brevo Email Error:', error);
        return { success: false, provider: 'brevo', error };
    }
};

/**
 * Send Verification Code (Mixed/Redundant)
 * Uses noreply@xperiencestore.store
 * Tries Brevo first, falls back to Mailgun
 */
const sendVerificationEmail = async (to, code) => {
    const subject = "Your Verification Code - Xperiencestore";
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; text-align: center;">
                <h2 style="color: #2563eb;">Verify Your Account</h2>
                <p style="color: #4b5563; font-size: 16px;">Please use the code below to complete your verification.</p>
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h1 style="color: #1e40af; letter-spacing: 5px; margin: 0;">${code}</h1>
                </div>
                <p style="font-size: 14px; color: #6b7280;">This code expires in <strong>15 minutes</strong>.</p>
                <p style="font-size: 12px; color: #9ca3af;">If you didn't request this, please ignore this email.</p>
            </div>
        </div>
    `;

    // Try Brevo First
    try {
        if (!process.env.BREVO_API_KEY) {
            throw new Error('BREVO_API_KEY is not set in environment');
        }
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = { "name": "Xperiencestore Security", "email": "noreply@xperiencestore.store" };
        sendSmtpEmail.to = [{ "email": to }];

        await brevoClient.sendTransacEmail(sendSmtpEmail);
        console.log(`[EMAIL] Verification code sent via Brevo to ${to}`);
        return true;
    } catch (brevoError) {
        console.error(`[EMAIL] Brevo failed for ${to}:`, brevoError.message || brevoError);

        // Fallback to Mailgun
        try {
            if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
                throw new Error('MAILGUN_API_KEY or MAILGUN_DOMAIN is not set in environment');
            }
            await mg.messages.create(process.env.MAILGUN_DOMAIN, {
                from: "Xperiencestore Security <noreply@xperiencestore.store>",
                to: [to],
                subject: subject,
                html: htmlContent
            });
            console.log(`[EMAIL] Verification code sent via Mailgun to ${to}`);
            return true;
        } catch (mailgunError) {
            console.error(`[EMAIL] Mailgun also failed for ${to}:`, mailgunError.message || mailgunError);
            // Throw so the caller can respond with an appropriate error
            throw new Error(`Email delivery failed for ${to}. Brevo: ${brevoError.message}. Mailgun: ${mailgunError.message}`);
        }
    }
};

/**
 * Send Order Status Update Email
 */
const sendOrderUpdateEmail = async (to, orderId, status, trackingNumber = null) => {
    const subject = `Order #${orderId} Update - ${status.toUpperCase()}`;
    let messageBody = '';
    
    switch(status) {
        case 'confirmed':
            messageBody = `Your order #${orderId} has been confirmed and is being processed.`;
            break;
        case 'shipped':
            messageBody = `Great news! Your order #${orderId} has been shipped.`;
            if (trackingNumber) {
                messageBody += `<br><strong>Tracking Number:</strong> ${trackingNumber}`;
            }
            break;
        case 'delivered':
            messageBody = `Your order #${orderId} has been delivered. Enjoy your purchase!`;
            break;
        default:
            messageBody = `The status of your order #${orderId} has been updated to: ${status}`;
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Order Update</h2>
                <p style="color: #4b5563; font-size: 16px;">${messageBody}</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <a href="https://xperiencestore.store/account/orders/${orderId}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order Details</a>
                </div>
            </div>
        </div>
    `;

    return await sendTransactionalEmail(to, subject, htmlContent);
};

/**
 * Send Gift Card Email
 */
const sendGiftCard = async (to, data) => {
    const { code, amount, currency, sender, message } = data;
    const subject = `You received a ${currency} ${amount} Gift Card!`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; text-align: center;">
            <div style="background-color: white; padding: 40px; border-radius: 20px; max-width: 500px; margin: 0 auto; border: 2px solid #2563eb;">
                <h1 style="color: #2563eb; margin-bottom: 10px;">Gift Card for You!</h1>
                <p style="color: #4b5563; font-size: 18px;">${sender} sent you a gift card.</p>
                <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 15px; margin: 30px 0; color: white;">
                    <p style="text-transform: uppercase; font-size: 12px; margin-bottom: 10px; opacity: 0.8;">Gift Card Code</p>
                    <h2 style="letter-spacing: 2px; font-size: 24px; margin: 0;">${code}</h2>
                    <p style="font-size: 32px; font-weight: bold; margin-top: 15px;">${currency} ${amount}</p>
                </div>
                ${message ? `<p style="font-style: italic; color: #6b7280; margin-bottom: 20px;">"${message}"</p>` : ''}
                <a href="https://xperiencestore.store" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Redeem Now</a>
            </div>
        </div>
    `;
    return await sendTransactionalEmail(to, subject, htmlContent);
};

module.exports = { sendTransactionalEmail, sendVerificationEmail, sendOrderUpdateEmail, sendGiftCard };
