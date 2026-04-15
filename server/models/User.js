const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async create({ name, email, password, role, companyName, verificationCode, codeExpires }) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (name, email, password, role, company_name, verification_code, code_expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [name, email, hashedPassword, role || 'consumer', companyName, verificationCode, codeExpires];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    }

    static async matchPassword(enteredPassword, storedPassword) {
        return await bcrypt.compare(enteredPassword, storedPassword);
    }

    static async markVerified(email) {
        const query = 'UPDATE users SET is_verified = TRUE, verification_code = NULL, code_expires_at = NULL WHERE email = $1';
        await db.query(query, [email]);
    }

    static async saveResetToken(email, token, expires) {
        // Store the reset code directly
        const query = 'UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE email = $3';
        await db.query(query, [token, expires, email]);
    }

    static async updatePassword(email, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const query = 'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE email = $2';
        await db.query(query, [hashedPassword, email]);
    }
    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async setVerificationCode(id, code, expires) {
        const query = 'UPDATE users SET verification_code = $1, code_expires_at = $2 WHERE id = $3';
        await db.query(query, [code, expires, id]);
    }

    static async updateProfile(id, data) {
        const { name, phone, address, city, country, companyName, profileImage } = data;

        // Build dynamic query
        let query = 'UPDATE users SET ';
        const values = [];
        let index = 1;

        if (name !== undefined) { query += `name = $${index++}, `; values.push(name); }
        if (phone !== undefined) { query += `phone = $${index++}, `; values.push(phone); }
        if (address !== undefined) { query += `address = $${index++}, `; values.push(address); }
        if (city !== undefined) { query += `city = $${index++}, `; values.push(city); }
        if (country !== undefined) { query += `country = $${index++}, `; values.push(country); }
        if (companyName !== undefined) { query += `company_name = $${index++}, `; values.push(companyName); }
        if (profileImage !== undefined && profileImage !== null) { query += `profile_image = $${index++}, `; values.push(profileImage); }

        // Remove trailing comma
        query = query.slice(0, -2);
        query += ` WHERE id = $${index} RETURNING *`;
        values.push(id);

        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = User;
