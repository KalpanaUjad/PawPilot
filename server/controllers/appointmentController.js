
const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");

// BOOK APPOINTMENT
exports.bookAppointment = async (req, res) => {
  try {
    const { pet, appointmentDate, reason, notes } = req.body;

    if (!pet || !appointmentDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Pet, appointment date and reason are required"
      });
    }

    // Verify that this pet belongs to the logged-in owner
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

    const date = new Date(appointmentDate);

    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future appointment date"
      });
    }

    const appointment = await Appointment.create({
      owner: req.user._id,
      pet,
      appointmentDate: date,
      reason,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });

  } catch (error) {
    console.error("Book appointment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to book appointment"
    });
  }
};

// GET APPOINTMENTS OF LOGGED-IN OWNER
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      owner: req.user._id
    })
      .populate("pet", "name species breed")
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (error) {
    console.error("Fetch appointments error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch appointments"
    });
  }
};
