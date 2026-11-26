
import { useEffect, useState } from "react";
import { getPets } from "../services/petServices";
import {
  getMedicalRecords,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} from "../services/medicalRecordService";

const initialForm = {
  pet: "",
  visitDate: "",
  diagnosis: "",
  symptoms: "",
  treatment: "",
  veterinarian: "",
  notes: ""
};

const formatDateForInput = (date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function MedicalHistory() {
  const [pets, setPets] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [petData, recordData] = await Promise.all([
        getPets(),
        getMedicalRecords()
      ]);

      setPets(petData);
      setRecords(recordData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load medical records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!editingId && !form.pet) {
      setError("Please select a pet.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        visitDate: form.visitDate,
        diagnosis: form.diagnosis.trim(),
        symptoms: form.symptoms,
        treatment: form.treatment,
        veterinarian: form.veterinarian,
        notes: form.notes
      };

      if (editingId) {
        await updateMedicalRecord(editingId, payload);
      } else {
        await addMedicalRecord({
          ...payload,
          pet: form.pet
        });
      }

      setForm(initialForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save medical record"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);

    setForm({
      pet: record.pet?._id || "",
      visitDate: formatDateForInput(record.visitDate),
      diagnosis: record.diagnosis || "",
      symptoms: record.symptoms || "",
      treatment: record.treatment || "",
      veterinarian: record.veterinarian || "",
      notes: record.notes || ""
    });

    setError("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medical record?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteMedicalRecord(id);

      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete medical record"
      );
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  if (loading) {
    return (
      <div className="medical-page">
        Loading medical history...
      </div>
    );
  }

  return (
    <div className="medical-page">
      <div className="medical-header">
        <div>
          <p className="medical-eyebrow">PET HEALTH RECORDS</p>
          <h1>Medical History</h1>
          <p>Keep track of your pets' previous veterinary visits.</p>
        </div>

        <div className="medical-count">
          <strong>{records.length}</strong>
          <span>Total medical records</span>
        </div>
      </div>

      {error && (
        <div className="medical-error">
          {error}
        </div>
      )}

      <div className="medical-layout">
        <section className="medical-form-card">
          <h2>
            {editingId ? "Edit Medical Record" : "Add Medical Record"}
          </h2>

          <p>Record information from your pet's veterinary visit.</p>

          <form onSubmit={handleSubmit}>
            {!editingId && (
              <div className="medical-field">
                <label>Select Pet *</label>
                <select
                  name="pet"
                  value={form.pet}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a pet</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="medical-field">
              <label>Visit Date *</label>
              <input
                type="date"
                name="visitDate"
                value={form.visitDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="medical-field">
              <label>Diagnosis *</label>
              <input
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="Enter diagnosis from veterinarian"
                required
              />
            </div>

            <div className="medical-field">
              <label>Symptoms</label>
              <textarea
                name="symptoms"
                value={form.symptoms}
                onChange={handleChange}
                placeholder="Describe observed symptoms"
                rows="3"
              />
            </div>

            <div className="medical-field">
              <label>Treatment</label>
              <textarea
                name="treatment"
                value={form.treatment}
                onChange={handleChange}
                placeholder="Enter treatment details"
                rows="3"
              />
            </div>

            <div className="medical-field">
              <label>Veterinarian</label>
              <input
                name="veterinarian"
                value={form.veterinarian}
                onChange={handleChange}
                placeholder="Veterinarian's name"
              />
            </div>

            <div className="medical-field">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Other important information"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="medical-submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Record"
                  : "Save Medical Record"}
            </button>

            {editingId && (
              <button
                type="button"
                className="medical-cancel"
                onClick={cancelEdit}
              >
                Cancel Editing
              </button>
            )}
          </form>
        </section>

        <section className="medical-list-section">
          <div className="medical-list-heading">
            <h2>Medical History</h2>
            <span>{records.length} records</span>
          </div>

          {records.length === 0 ? (
            <div className="medical-empty">
              <h3>No medical records yet</h3>
              <p>Your pets' veterinary visit history will appear here.</p>
            </div>
          ) : (
            <div className="medical-list">
              {records.map((record) => (
                <article className="medical-card" key={record._id}>
                  <div className="medical-card-top">
                    <div>
                      <span className="medical-pet-name">
                        {record.pet?.name || "Pet"}
                      </span>

                      <h3>{record.diagnosis}</h3>
                    </div>

                    <span className="medical-date">
                      {new Date(record.visitDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="medical-details">
                    {record.symptoms && (
                      <p>
                        <strong>Symptoms:</strong> {record.symptoms}
                      </p>
                    )}

                    {record.treatment && (
                      <p>
                        <strong>Treatment:</strong> {record.treatment}
                      </p>
                    )}

                    {record.veterinarian && (
                      <p>
                        <strong>Veterinarian:</strong> {record.veterinarian}
                      </p>
                    )}

                    {record.notes && (
                      <p>
                        <strong>Notes:</strong> {record.notes}
                      </p>
                    )}
                  </div>

                  <div className="medical-actions">
                    <button onClick={() => handleEdit(record)}>
                      Edit
                    </button>

                    <button onClick={() => handleDelete(record._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MedicalHistory;
