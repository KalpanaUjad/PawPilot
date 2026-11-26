
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord
} = require("../controllers/medicalRecordController");

router.use(protect);

router.post("/", addMedicalRecord);
router.get("/", getMedicalRecords);
router.put("/:id", updateMedicalRecord);
router.delete("/:id", deleteMedicalRecord);

module.exports = router;
