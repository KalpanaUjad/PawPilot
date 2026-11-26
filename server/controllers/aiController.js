
const { getModels } = require("../services/aiService");

const fetchModels = async (req, res) => {
  try {
    const { provider } = req.params;

    if (!["openai", "nvidia", "openrouter"].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "Provider must be openai, nvidia, or openrouter"
      });
    }

    const models = await getModels(provider);

    return res.status(200).json({
      success: true,
      provider,
      count: models.length,
      models
    });

  } catch (error) {
    console.error(
      "Fetch models error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unable to fetch models"
    });
  }
};

module.exports = { fetchModels };
