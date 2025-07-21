const cloudinary = require("cloudinary").v2;
const Document = require("../models/document");
const TPNApplication = require("../models/tpnApplication");
const User = require("../models/user");
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

exports.uploadDocument = async (req, res) => {
  try {
    if (!["individual", "dealer"].includes(req.user.userType)) {
      return res.status(403).json({
        message:
          "Unauthorized: Only individuals and dealers can upload documents",
      });
    }

    const { tpnId, documentType } = req.body;
    const userId = req.user.id;

    if (
      !["nin", "proof_of_ownership", "customs_papers"].includes(documentType)
    ) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    const application = await TPNApplication.findById(tpnId);
    if (!application || application.user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized: Invalid TPN ID" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `tpn_documents/${userId}`,
      resource_type: "auto",
      allowed_formats: ["pdf", "jpg", "jpeg", "png"],
    });

    const document = await Document.create({
      tpnId,
      userId,
      documentType,
      url: result.secure_url,
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        documentType: document.document_type,
        url: document.url,
        status: document.status,
      },
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { tpnId } = req.params;

    const application = await TPNApplication.findById(tpnId);
    if (
      !application ||
      (application.user_id !== req.user.id &&
        !["frsc_admin", "enforcement"].includes(req.user.userType))
    ) {
      return res.status(403).json({ message: "Unauthorized: Access denied" });
    }

    const documents = await Document.findByTpnId(tpnId);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tpnApplications = await TPNApplication.findByUserId(userId);

    const applicationsWithDocuments = await Promise.all(
      tpnApplications.map(async (app) => {
        const documents = await Document.findByTpnId(app.id);
        return { ...app, documents };
      })
    );

    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        nin: user.nin,
        userType: user.user_type,
        address: user.address,
      },
      tpnApplications: applicationsWithDocuments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const tpnApplications = await TPNApplication.findByUserId(user.id);
        const applicationsWithDocuments = await Promise.all(
          tpnApplications.map(async (app) => {
            const documents = await Document.findByTpnId(app.id);
            return { ...app, documents };
          })
        );
        return {
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            nin: user.nin,
            userType: user.user_type,
            address: user.address,
          },
          tpnApplications: applicationsWithDocuments,
        };
      })
    );
    res.json(usersWithDetails);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tpnApplications = await TPNApplication.findByUserId(userId);
    const applicationsWithDocuments = await Promise.all(
      tpnApplications.map(async (app) => {
        const documents = await Document.findByTpnId(app.id);
        return { ...app, documents };
      })
    );

    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        nin: user.nin,
        userType: user.user_type,
        address: user.address,
      },
      tpnApplications: applicationsWithDocuments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, nin, userType, address } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.update(userId, {
      firstName,
      lastName,
      email,
      phone,
      nin,
      userType,
      address,
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Document.deleteByUserId(userId);
    await TPNApplication.deleteByUserId(userId);
    await User.delete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
