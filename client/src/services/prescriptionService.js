
import api from "./api";

export const getPrescriptions = async () => {
  const response = await api.get("/prescriptions");
  return response.data.prescriptions;
};

export const addPrescription = async (prescriptionData) => {
  const response = await api.post("/prescriptions", prescriptionData);
  return response.data;
};

export const updatePrescription = async (id, prescriptionData) => {
  const response = await api.put(`/prescriptions/${id}`, prescriptionData);
  return response.data;
};

export const deletePrescription = async (id) => {
  const response = await api.delete(`/prescriptions/${id}`);
  return response.data;
};
