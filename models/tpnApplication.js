const pool = require("../config/db");

class TPNApplication {
  static async create({
    userId,
    vin,
    engineNumber,
    make,
    model,
    year,
    color,
    bodyType,
  }) {
    const query = `
      INSERT INTO tpn_applications (user_id, vin, engine_number, make, model, year, color, body_type, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING id, user_id, vin, engine_number, make, model, year, color, body_type, status
    `;
    const values = [
      userId,
      vin,
      engineNumber,
      make,
      model,
      year,
      color,
      bodyType,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, user_id, vin, engine_number, make, model, year, color, body_type, status
      FROM tpn_applications WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT id, user_id, vin, engine_number, make, model, year, color, body_type, status
      FROM tpn_applications WHERE user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async deleteByUserId(userId) {
    const query = `
      DELETE FROM tpn_applications WHERE user_id = $1
    `;
    await pool.query(query, [userId]);
  }
}

module.exports = TPNApplication;
