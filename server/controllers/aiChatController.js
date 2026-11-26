
const Pet = require("../models/Pet");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");

const {
  generateChatResponse
} = require("../services/aiService");

const SYSTEM_INSTRUCTIONS = `
You are PawPilot AI, an informational pet-care assistant.

Your responsibilities:
1. Answer general pet-care questions in simple language.
2. Explain veterinary records and prescriptions provided as context.
3. Help owners understand recorded symptoms, treatments and visit history.
4. Suggest preventive care, hygiene, nutrition basics and responsible pet ownership.
5. Recommend consulting a qualified veterinarian when appropriate.

STRICT SAFETY RULES:
- You are not a veterinarian.
- Never diagnose a disease or claim certainty about a medical condition.
- Never prescribe medicines or recommend medication dosages.
- Never tell owners to start, stop or change prescribed medication.
- Historical prescriptions are records, NOT recommendations to use medication now.
- Do not invent medical history, diagnoses, treatments or prescription details.
- If symptoms may indicate an emergency, recommend immediate veterinary care.
- If the information is insufficient, say so clearly.
- Do not claim that you have examined the pet.
- Do not expose private information.

When using medical context, clearly distinguish recorded information from general guidance.
`;

const formatDate = (date) => {
  if (!date) return "Not recorded";

  return new Date(date).toISOString().split("T")[0];
};

const buildPetContext = async (petId, ownerId) => {
  if (!petId) {
    return "No specific pet was selected. Answer general pet-care questions.";
  }

  const pet = await Pet.findOne({
    _id: petId,
    owner: ownerId
  }).lean();

  if (!pet) {
    throw new Error("Selected pet was not found or does not belong to you");
  }

  const [records, prescriptions] = await Promise.all([
    MedicalRecord.find({
      pet: pet._id,
      owner: ownerId
    })
      .sort({ visitDate: -1 })
      .limit(8)
      .lean(),

    Prescription.find({
      pet: pet._id,
      owner: ownerId
    })
      .sort({ startDate: -1 })
      .limit(8)
      .lean()
  ]);

  const medicalHistory = records.length
    ? records.map((record, index) => `
Medical Record ${index + 1}:
Visit date: ${formatDate(record.visitDate)}
Diagnosis recorded: ${record.diagnosis}
Symptoms recorded: ${record.symptoms || "Not recorded"}
Treatment recorded: ${record.treatment || "Not recorded"}
Veterinarian: ${record.veterinarian || "Not recorded"}
Notes: ${record.notes || "None"}
`).join("\n")
    : "No medical records are available.";

  const prescriptionHistory = prescriptions.length
    ? prescriptions.map((prescription, index) => `
Prescription Record ${index + 1}:
Medication: ${prescription.medicationName}
Dosage recorded by veterinarian: ${prescription.dosage}
Frequency recorded: ${prescription.frequency}
Start date: ${formatDate(prescription.startDate)}
End date: ${formatDate(prescription.endDate)}
Status in PawPilot: ${prescription.status}
Instructions recorded: ${prescription.instructions || "None"}
Prescribed by: ${prescription.prescribedBy || "Not recorded"}
`).join("\n")
    : "No prescription records are available.";

  return `
SELECTED PET INFORMATION

Name: ${pet.name}
Species: ${pet.species}
Breed: ${pet.breed || "Not recorded"}
Age: ${pet.age ?? "Not recorded"}
Gender: ${pet.gender || "Not recorded"}
Weight: ${pet.weight ?? "Not recorded"}

MEDICAL HISTORY:
${medicalHistory}

PRESCRIPTION HISTORY:
${prescriptionHistory}

IMPORTANT:
These are owner-entered historical records. Do not assume that a medication is currently appropriate or should be administered. Do not prescribe or modify treatment.
`;
};

const chatWithAI = async (req, res) => {
  try {
    const {
      provider,
      model,
      petId,
      messages
    } = req.body;

    if (!["openai", "nvidia"].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "Select OpenAI or NVIDIA"
      });
    }

    if (!model || typeof model !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please select an AI model"
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "A chat message is required"
      });
    }

    // Accept only user and assistant messages.
    const conversation = messages
      .slice(-12)
      .filter((item) =>
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string" &&
        item.content.trim().length > 0 &&
        item.content.length <= 4000
      )
      .map((item) => ({
        role: item.role,
        content: item.content.trim()
      }));

    if (
      conversation.length === 0 ||
      conversation[conversation.length - 1].role !== "user"
    ) {
      return res.status(400).json({
        success: false,
        message: "The latest message must be a user message"
      });
    }

    const petContext = await buildPetContext(
      petId,
      req.user._id
    );

    const finalMessages = [
      {
        role: "system",
        content: `${SYSTEM_INSTRUCTIONS}\n\n${petContext}`
      },
      ...conversation
    ];

    const answer = await generateChatResponse({
      provider,
      model,
      messages: finalMessages
    });

    return res.status(200).json({
      success: true,
      provider,
      model,
      answer
    });

  } catch (error) {
  console.error("AI chat error:", {
    provider: req.body?.provider,
    model: req.body?.model,
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data,
    message: error.message
  });

  const status = error.response?.status;

  return res.status(
    status && status >= 400 && status < 500 ? status : 500
  ).json({
    success: false,
    message:
      error.response?.data?.error?.message ||
      error.message ||
      "Unable to generate AI response"
  });
}
};

module.exports = { chatWithAI };
