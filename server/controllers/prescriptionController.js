
const Prescription = require("../models/Prescription");
const Pet = require("../models/Pet");

const addPrescription = async (req, res) => {
  try {
    const {
      pet,
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      instructions,
      prescribedBy
    } = req.body;

    if (!pet || !medicationName || !dosage || !frequency || !startDate) {
      return res.status(400).json({
        message: "Please provide all required fields"
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (isNaN(start.getTime()) || (end && isNaN(end.getTime()))) {
      return res.status(400).json({
        message: "Please provide valid dates"
      });
    }

    if (end && end < start) {
      return res.status(400).json({
        message: "End date cannot be before start date"
      });
    }

    const petExists = await Pet.findOne({
      _id: pet,
      owner: req.user._id
    });

    if (!petExists) {
      return res.status(404).json({
        message: "Pet not found"
      });
    }

    const prescription = await Prescription.create({
      owner: req.user._id,
      pet,
      medicationName,
      dosage,
      frequency,
      startDate: start,
      endDate: end,
      instructions,
      prescribedBy
    });

    res.status(201).json({
      message: "Prescription added successfully",
      prescription
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      owner: req.user._id
    })
      .populate("pet", "name species breed")
      .sort({ startDate: -1 });

    res.status(200).json({
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found"
      });
    }

    const allowedFields = [
      "medicationName",
      "dosage",
      "frequency",
      "startDate",
      "endDate",
      "instructions",
      "prescribedBy",
      "status"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        prescription[field] = req.body[field];
      }
    });

    if (
      !prescription.startDate ||
      isNaN(new Date(prescription.startDate).getTime())
    ) {
      return res.status(400).json({
        message: "Please provide a valid start date"
      });
    }

    if (
      prescription.endDate &&
      new Date(prescription.endDate) < new Date(prescription.startDate)
    ) {
      return res.status(400).json({
        message: "End date cannot be before start date"
      });
    }

    await prescription.save();

    res.status(200).json({
      message: "Prescription updated successfully",
      prescription
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found"
      });
    }

    res.status(200).json({
      message: "Prescription deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  addPrescription,
  getPrescriptions,
  updatePrescription,
  deletePrescription
};
