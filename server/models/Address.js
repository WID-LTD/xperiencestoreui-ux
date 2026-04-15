const pool = require('../config/db');

class Address {
    static async create({ userId, type, name, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault }) {
        if (isDefault) {
            await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
        }

        const query = `
            INSERT INTO addresses (user_id, type, name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        const values = [userId, type, name, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault || false];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async findByUserId(userId) {
        const query = 'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC';
        const { rows } = await pool.query(query, [userId]);
        return rows;
    }

    static async update(id, userId, data) {
        const { type, name, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = data;

        if (isDefault) {
            await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
        }

        let query = 'UPDATE addresses SET ';
        const values = [];
        let index = 1;

        if (type) { query += `type = $${index++}, `; values.push(type); }
        if (name) { query += `name = $${index++}, `; values.push(name); }
        if (phone) { query += `phone = $${index++}, `; values.push(phone); }
        if (addressLine1) { query += `address_line1 = $${index++}, `; values.push(addressLine1); }
        if (addressLine2) { query += `address_line2 = $${index++}, `; values.push(addressLine2); }
        if (city) { query += `city = $${index++}, `; values.push(city); }
        if (state) { query += `state = $${index++}, `; values.push(state); }
        if (postalCode) { query += `postal_code = $${index++}, `; values.push(postalCode); }
        if (country) { query += `country = $${index++}, `; values.push(country); }
        if (isDefault !== undefined) { query += `is_default = $${index++}, `; values.push(isDefault); }

        query = query.slice(0, -2); // Remove trailing comma
        query += ` WHERE id = $${index} AND user_id = $${index + 1} RETURNING *`;
        values.push(id, userId);

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id, userId) {
        const query = 'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await pool.query(query, [id, userId]);
        return rows[0];
    }
}

module.exports = Address;
