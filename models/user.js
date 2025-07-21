const pool = require("../config/db");

class User {
  static async create({
    firstName,
    lastName,
    email,
    phone,
    nin,
    userType,
    address,
    password,
  }) {
    const query = `
      INSERT INTO users (first_name, last_name, email, phone, nin, user_type, address, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, first_name, last_name, email, phone, nin, user_type, address
    `;
    const values = [
      firstName,
      lastName,
      email,
      phone,
      nin,
      userType,
      address,
      password,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, first_name, last_name, email, phone, nin, user_type, address
      FROM users WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT * FROM users WHERE email = $1
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT id, first_name, last_name, email, phone, nin, user_type, address
      FROM users
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async update(
    id,
    { firstName, lastName, email, phone, nin, userType, address }
  ) {
    const query = `
      UPDATE users
      SET first_name = $1, last_name = $2, email = $3, phone = $4, nin = $5, user_type = $6, address = $7
      WHERE id = $8
      RETURNING id, first_name, last_name, email, phone, nin, user_type, address
    `;
    const values = [
      firstName,
      lastName,
      email,
      phone,
      nin,
      userType,
      address,
      id,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM users WHERE id = $1
    `;
    await pool.query(query, [id]);
  }
}

module.exports = User;
