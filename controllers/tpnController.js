const TPNApplication = require("../models/tpnApplication");

exports.createTPN = async (req, res) => {
  try {
    if (!["individual", "dealer"].includes(req.user.userType)) {
      return res.status(403).json({
        message: "Unauthorized: Only individuals and dealers can apply for TPN",
      });
    }
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
    res.json({
      message: "Application(s) fetched successfully",
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.renewTPN = async (req, res) => {
  try {
    if (!["individual", "dealer"].includes(req.user.userType)) {
      return res.status(403).json({
        message:
          "Unauthorized: Only individuals, dealers, and admins can renew TPN",
      });
    }
    const { tpnId, renewalPeriod } = req.body;
    const application = await TPNApplication.findById(tpnId);
    if (!application || application.user_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: Invalid TPN ID" });
    }
    const updatedApplication = await TPNApplication.updateStatus(
      tpnId,
      "renewed"
    );
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyTPN = async (req, res) => {
  try {
    if (!["frsc_admin", "enforcement"].includes(req.user.userType)) {
      return res.status(403).json({
        message:
          "Unauthorized: Only FRSC admins and enforcement can verify TPN",
      });
    }
    const { tpnId, status } = req.body;
    const updatedApplication = await TPNApplication.updateStatus(tpnId, status);
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
