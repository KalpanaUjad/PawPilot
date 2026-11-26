
import api from "./api";

export const getPets = async () => {
  const response = await api.get("/pets");
  return response.data.pets;
};

export const addPet = async (petData) => {
  const response = await api.post("/pets", petData);
  return response.data.pet;
};

export const updatePet = async (id, petData) => {
  const response = await api.put(`/pets/${id}`, petData);
  return response.data.pet;
};

export const deletePet = async (id) => {
  const response = await api.delete(`/pets/${id}`);
  return response.data;
};
