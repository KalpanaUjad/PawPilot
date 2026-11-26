
const MedicalRecord = require("../models/MedicalRecord");
const Pet = require("../models/Pet");

const addMedicalRecord = async (req, res) => {
  try {
    const {
      pet,
      visitDate,
      diagnosis,
      symptoms,
      treatment,
      veterinarian,
      notes
    } = req.body;

    if (!pet || !visitDate || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: "Pet, visit date and diagnosis are required"
      });
    }

    const date = new Date(visitDate);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid visit date"
      });
    }

    const petExists = await Pet.findOne({
      _id: pet,
      owner: req.user._id
    });

    if (!petExists) {
      return res.status(404).json({
        success: false,
        message: "Pet not found"
      });
    }

    const record = await MedicalRecord.create({
      owner: req.user._id,
      pet,
      visitDate: date,
      diagnosis,
      symptoms,
      treatment,
      veterinarian,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Medical record added successfully",
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      owner: req.user._id
    })
      .populate("pet", "name species breed")
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found"
      });
    }

    const allowedFields = [
      "visitDate",
      "diagnosis",
      "symptoms",
      "treatment",
      "veterinarian",
      "notes"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        record[field] = req.body[field];
      }
    });

    if (
      !record.visitDate ||
      isNaN(new Date(record.visitDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid visit date"
      });
    }

    if (!record.diagnosis || !record.diagnosis.trim()) {
      return res.status(400).json({
        success: false,
        message: "Diagnosis is required"
      });
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Medical record deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord
};
