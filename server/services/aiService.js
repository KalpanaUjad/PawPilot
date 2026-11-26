
const axios = require("axios");

const PROVIDERS = {
  openai: {
    url: "https://api.openai.com/v1",
    key: process.env.OPENAI_API_KEY
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1",
    key: process.env.NVIDIA_API_KEY
  },
  openrouter: {
    url: "https://openrouter.ai/api/v1",
    key: process.env.OPENROUTER_API_KEY
  }
};

const getProvider = (provider) => {
  const config = PROVIDERS[provider];

  if (!config) {
    throw new Error("Invalid AI provider");
  }

  if (!config.key) {
    throw new Error(`${provider} API key is missing`);
  }

  return config;
};

// Fetch provider-specific models
const getModels = async (provider) => {
  const config = getProvider(provider);

  const response = await axios.get(`${config.url}/models`, {
    headers: {
      Authorization: `Bearer ${config.key}`
    },
    timeout: 20000
  });

  const availableModels = response.data.data || [];

  if (provider === "openrouter") {
    const freeModels = availableModels
      .filter((model) => {
        return (
          model.id.endsWith(":free") &&
          Number(model.pricing?.prompt) === 0 &&
          Number(model.pricing?.completion) === 0
        );
      })
      .map((model) => ({
        id: model.id,
        name: `${model.name} (Free)`
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return [
      {
        id: "openrouter/free",
        name: "Auto-select Free Model"
      },
      ...freeModels
    ];
  }

  return availableModels
    .map((model) => ({
      id: model.id,
      name: model.name || model.id
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Generate response using selected provider
const generateChatResponse = async ({
  provider,
  model,
  messages
}) => {
  const config = getProvider(provider);

  if (!model) {
    throw new Error("Please select an AI model");
  }

  const response = await axios.post(
    `${config.url}/chat/completions`,
    {
      model,
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json"
      },
      timeout: 60000
    }
  );

  const answer = response.data.choices?.[0]?.message?.content;

  if (!answer || typeof answer !== "string") {
    throw new Error("AI provider returned an empty response");
  }

  return answer;
};

module.exports = {
  getModels,
  generateChatResponse
};
