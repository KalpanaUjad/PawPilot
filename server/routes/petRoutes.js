const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addPet,
  getPets,
  updatePet,
  deletePet
} = require("../controllers/petController");

router.use(protect);

router.post("/", addPet);
router.get("/", getPets);
router.put("/:id", updatePet);
router.delete("/:id", deletePet);

module.exports = router;