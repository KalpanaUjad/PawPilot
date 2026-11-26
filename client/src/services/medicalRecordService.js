
import api from "./api";

export const getMedicalRecords = async () => {
  const response = await api.get("/medical-records");
  return response.data.records;
};

export const addMedicalRecord = async (recordData) => {
  const response = await api.post("/medical-records", recordData);
  return response.data;
};

export const updateMedicalRecord = async (id, recordData) => {
  const response = await api.put(`/medical-records/${id}`, recordData);
  return response.data;
};

export const deleteMedicalRecord = async (id) => {
  const response = await api.delete(`/medical-records/${id}`);
  return response.data;
};
