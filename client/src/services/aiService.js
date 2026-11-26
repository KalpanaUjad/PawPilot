import api from "./api";

export const getAIModels = async (provider) => {
  const response = await api.get(`/ai/models/${provider}`);
  return response.data;
};

export const sendAIMessage = async (chatData) => {
  const response = await api.post("/ai/chat", chatData);
  return response.data;
};