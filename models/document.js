const pool = require("../config/db");

class Document {
  static async create({ tpnId, userId, documentType, url }) {
    const query = `
      INSERT INTO documents (tpn_id, user_id, document_type, url, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id, document_type, url, status
    `;
    const values = [tpnId, userId, documentType, url];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByTpnId(tpnId) {
    const query = `
      SELECT * FROM documents WHERE tpn_id = $1
    `;
    const { rows } = await pool.query(query, [tpnId]);
    return rows;
  }

  static async deleteByUserId(userId) {
    const query = `
      DELETE FROM documents WHERE user_id = $1
    `;
    await pool.query(query, [userId]);
  }
}

module.exports = Document;
