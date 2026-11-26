
const axios = require("axios");

const PROVIDERS = {
  openai: {
    url: "https://api.openai.com/v1",
    key: process.env.OPENAI_API_KEY
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1",
    key: process.env.NVIDIA_API_KEY
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

const getModels = async (provider) => {
  const config = getProvider(provider);

  const response = await axios.get(`${config.url}/models`, {
    headers: {
      Authorization: `Bearer ${config.key}`
    },
    timeout: 20000
  });

  return response.data.data
    .map((model) => ({
      id: model.id,
      name: model.id
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const generateChatResponse = async ({
  provider,
  model,
  messages
}) => {
  const config = getProvider(provider);

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
