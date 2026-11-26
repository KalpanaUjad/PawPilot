
import { useEffect, useState } from "react";

import {
  getAIModels,
  sendAIMessage
} from "../services/aiService";

import { getPets } from "../services/petServices";

function AIAssistant() {
  const [provider, setProvider] = useState("openai");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");

  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [loadingModels, setLoadingModels] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  // Fetch pets for the pet selector
  useEffect(() => {
    const loadPets = async () => {
      try {
        const data = await getPets();
        setPets(data || []);
      } catch (err) {
        console.error("Unable to load pets:", err);
      }
    };

    loadPets();
  }, []);

  // Fetch models whenever provider changes
  useEffect(() => {
    fetchModels(provider);
  }, [provider]);

  const fetchModels = async (selectedProvider) => {
    try {
      setLoadingModels(true);
      setError("");
      setModels([]);
      setSelectedModel("");

      const data = await getAIModels(selectedProvider);

      setModels(data.models || []);

      if (data.models?.length > 0) {
        setSelectedModel(data.models[0].id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to fetch AI models."
      );
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const question = input.trim();

    if (!question || sending) {
      return;
    }

    if (!selectedModel) {
      setError("Please select an AI model first.");
      return;
    }

    const userMessage = {
      role: "user",
      content: question
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setError("");
    setSending(true);

    try {
      const response = await sendAIMessage({
        provider,
        model: selectedModel,
        petId: selectedPet || null,
        messages: updatedMessages
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.answer
        }
      ]);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to get an AI response. Please try again.";

      setError(message);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    if (sending) return;

    setMessages([]);
    setInput("");
    setError("");
  };

  return (
    <div className="ai-page">

      <div className="ai-header">
        <div>
          <h1>AI Pet Care Assistant</h1>
          <p>
            Ask questions and understand your pet's care information.
          </p>
        </div>
      </div>

      <div className="ai-card ai-config-card">
        <h2>AI Configuration</h2>

        <div className="ai-config-grid">

          <div className="ai-field">
            <label>AI Provider</label>

            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                setMessages([]);
                setError("");
              }}
              disabled={sending}
            >
              <option value="openai">OpenAI</option>
              <option value="nvidia">NVIDIA</option>
            </select>
          </div>

          <div className="ai-field">
            <label>AI Model</label>

            <div className="ai-model-row">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loadingModels || models.length === 0}
              >
                <option value="">
                  {loadingModels
                    ? "Loading models..."
                    : "Select model"}
                </option>

                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="ai-refresh-btn"
                onClick={() => fetchModels(provider)}
                disabled={loadingModels || sending}
              >
                {loadingModels ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="ai-field">
            <label>Select Your Pet</label>

            <select
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
              disabled={sending}
            >
              <option value="">General Pet Care</option>

              {pets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name} ({pet.species})
                </option>
              ))}
            </select>

            <small>
              Selecting a pet allows the assistant to use its
              recorded medical history and prescriptions.
            </small>
          </div>

        </div>

        {models.length > 0 && (
          <p className="ai-success">
            {models.length} models loaded successfully.
          </p>
        )}
      </div>

      <div className="ai-card ai-chat-card">

        <div className="ai-chat-header">
          <div>
            <h2>Pet Care Chat</h2>
            <p>
              {selectedPet
                ? "Using the selected pet's available records."
                : "Ask general pet-care questions."}
            </p>
          </div>

          <button
            type="button"
            className="ai-clear-btn"
            onClick={clearChat}
            disabled={messages.length === 0 || sending}
          >
            Clear Chat
          </button>
        </div>

        <div className="ai-chat-messages">

          {messages.length === 0 && (
            <div className="ai-welcome">
              <h3>How can I help your pet today?</h3>

              <p>
                Ask about pet nutrition, hygiene, preventive care,
                or information in your pet's recorded medical history.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`ai-message ${
                message.role === "user"
                  ? "ai-user-message"
                  : "ai-bot-message"
              }`}
            >
              <strong>
                {message.role === "user"
                  ? "You"
                  : "PawPilot AI"}
              </strong>

              <p>{message.content}</p>
            </div>
          ))}

          {sending && (
            <div className="ai-message ai-bot-message">
              <strong>PawPilot AI</strong>
              <p>Thinking...</p>
            </div>
          )}

        </div>

        {error && (
          <p className="ai-error">{error}</p>
        )}

        <form
          className="ai-chat-form"
          onSubmit={handleSendMessage}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something about pet care..."
            rows="2"
            maxLength="4000"
            disabled={sending}
          />

          <button
            type="submit"
            disabled={
              sending ||
              !input.trim() ||
              !selectedModel ||
              loadingModels
            }
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>

        <p className="ai-disclaimer">
          PawPilot AI provides general information, not veterinary
          diagnosis or treatment. Always consult a qualified
          veterinarian for medical concerns.
        </p>

      </div>
    </div>
  );
}

export default AIAssistant;
