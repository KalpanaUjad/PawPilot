
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addPrescription,
  getPrescriptions,
  updatePrescription,
  deletePrescription
} = require("../controllers/prescriptionController");

router.use(protect);

router.post("/", addPrescription);
router.get("/", getPrescriptions);
router.put("/:id", updatePrescription);
router.delete("/:id", deletePrescription);

module.exports = router;
