
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  fetchModels
} = require("../controllers/aiController");

const {
  chatWithAI
} = require("../controllers/aiChatController");

router.use(protect);

router.get("/models/:provider", fetchModels);

router.post("/chat", chatWithAI);

module.exports = router;
