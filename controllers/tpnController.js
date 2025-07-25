const TPNApplication = require("../models/tpnApplication");
const pool = require("../config/db");
exports.createTPN = async (req, res) => {
  try {
    const { vin, engineNumber, make, model, year, color, bodyType } = req.body;
    const userId = req.user.id;

    const application = await TPNApplication.create({
      userId,
      vin,
      engineNumber,
      make,
      model,
      year,
      color,
      bodyType,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await TPNApplication.findByUserId(userId);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.renewTPN = async (req, res) => {
  try {
    const { tpnId, renewalPeriod } = req.body;
    const userId = req.user.id;

    const application = await TPNApplication.findById(tpnId);
    if (!application || application.user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized: Invalid TPN ID" });
    }

    const query = `
      UPDATE tpn_applications
      SET status = 'renewed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, status
    `;
    const { rows } = await pool.query(query, [tpnId]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyTPN = async (req, res) => {
  try {
    const { tpnId } = req.body;

    const application = await TPNApplication.findById(tpnId);
    if (!application) {
      return res.status(404).json({ message: "TPN application not found" });
    }

    const query = `
      UPDATE tpn_applications
      SET status = 'verified', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, status
    `;
    const { rows } = await pool.query(query, [tpnId]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
