
const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
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

    medicationName: {
      type: String,
      required: true,
      trim: true
    },

    dosage: {
      type: String,
      required: true,
      trim: true
    },

    frequency: {
      type: String,
      required: true,
      trim: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      default: null
    },

    instructions: {
      type: String,
      default: ""
    },

    prescribedBy: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
