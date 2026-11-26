
const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true
    },

    visitDate: {
      type: Date,
      required: true
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true
    },

    symptoms: {
      type: String,
      default: ""
    },

    treatment: {
      type: String,
      default: ""
    },

    veterinarian: {
      type: String,
      default: ""
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
