
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  bookAppointment,
  getAppointments
} = require("../controllers/appointmentController");

router.use(protect);

router.post("/", bookAppointment);
router.get("/", getAppointments);

module.exports = router;
