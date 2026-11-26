
import { useEffect, useState } from "react";
import { getPets } from "../services/petServices";
import {
  getPrescriptions,
  addPrescription,
  updatePrescription,
  deletePrescription
} from "../services/prescriptionService";

const initialForm = {
  pet: "",
  medicationName: "",
  dosage: "",
  frequency: "",
  startDate: "",
  endDate: "",
  prescribedBy: "",
  instructions: "",
  status: "Active"
};

function Prescriptions() {
  const [pets, setPets] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [petData, prescriptionData] = await Promise.all([
        getPets(),
        getPrescriptions()
      ]);

      setPets(petData);
      setPrescriptions(prescriptionData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load prescriptions"
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

    if (form.endDate && form.endDate < form.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        medicationName: form.medicationName,
        dosage: form.dosage,
        frequency: form.frequency,
        startDate: form.startDate,
        endDate: form.endDate || null,
        prescribedBy: form.prescribedBy,
        instructions: form.instructions,
        status: form.status
      };

      if (editingId) {
        await updatePrescription(editingId, payload);
      } else {
        await addPrescription({
          ...payload,
          pet: form.pet
        });
      }

      setForm(initialForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save prescription"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (prescription) => {
    setEditingId(prescription._id);

    setForm({
      pet: prescription.pet?._id || "",
      medicationName: prescription.medicationName || "",
      dosage: prescription.dosage || "",
      frequency: prescription.frequency || "",
      startDate: prescription.startDate
        ? new Date(prescription.startDate).toISOString().slice(0, 10)
        : "",
      endDate: prescription.endDate
        ? new Date(prescription.endDate).toISOString().slice(0, 10)
        : "",
      prescribedBy: prescription.prescribedBy || "",
      instructions: prescription.instructions || "",
      status: prescription.status || "Active"
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deletePrescription(id);

      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete prescription"
      );
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  if (loading) {
    return <div className="prescription-page">Loading prescriptions...</div>;
  }

  return (
    <div className="prescription-page">
      <div className="prescription-header">
        <div>
          <p className="prescription-eyebrow">PET HEALTH RECORDS</p>
          <h1>Prescriptions</h1>
          <p>Keep your pets' prescribed medications organized.</p>
        </div>

        <div className="prescription-count">
          <strong>{prescriptions.length}</strong>
          <span>Total prescriptions</span>
        </div>
      </div>

      {error && <div className="prescription-error">{error}</div>}

      <div className="prescription-layout">
        <section className="prescription-form-card">
          <h2>{editingId ? "Edit Prescription" : "Add Prescription"}</h2>
          <p>Enter the details provided by your veterinarian.</p>

          <form onSubmit={handleSubmit}>
            {!editingId && (
              <div className="prescription-field">
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

            <div className="prescription-field">
              <label>Medication Name *</label>
              <input
                name="medicationName"
                value={form.medicationName}
                onChange={handleChange}
                placeholder="Enter medication name"
                required
              />
            </div>

            <div className="prescription-field">
              <label>Dosage *</label>
              <input
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                placeholder="As written on the prescription"
                required
              />
            </div>

            <div className="prescription-field">
              <label>Frequency *</label>
              <input
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                placeholder="As prescribed by the vet"
                required
              />
            </div>

            <div className="prescription-field">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prescription-field">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={handleChange}
              />
            </div>

            <div className="prescription-field">
              <label>Prescribed By</label>
              <input
                name="prescribedBy"
                value={form.prescribedBy}
                onChange={handleChange}
                placeholder="Veterinarian's name"
              />
            </div>

            {editingId && (
              <div className="prescription-field">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}

            <div className="prescription-field">
              <label>Instructions</label>
              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                placeholder="Additional instructions from the vet"
                rows="3"
              />
            </div>

            <button
              className="prescription-submit"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Prescription"
                  : "Save Prescription"}
            </button>

            {editingId && (
              <button
                type="button"
                className="prescription-cancel"
                onClick={cancelEdit}
              >
                Cancel Editing
              </button>
            )}
          </form>
        </section>

        <section className="prescription-list-section">
          <div className="prescription-list-heading">
            <h2>Prescription History</h2>
            <span>{prescriptions.length} records</span>
          </div>

          {prescriptions.length === 0 ? (
            <div className="prescription-empty">
              <h3>No prescriptions yet</h3>
              <p>Your saved prescriptions will appear here.</p>
            </div>
          ) : (
            <div className="prescription-list">
              {prescriptions.map((item) => (
                <article className="prescription-card" key={item._id}>
                  <div className="prescription-card-top">
                    <div>
                      <span className="prescription-pet-name">
                        {item.pet?.name || "Pet"}
                      </span>
                      <h3>{item.medicationName}</h3>
                    </div>

                    <span
                      className={`prescription-status ${
                        item.status === "Active" ? "active" : "completed"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="prescription-details">
                    <p><strong>Dosage:</strong> {item.dosage}</p>
                    <p><strong>Frequency:</strong> {item.frequency}</p>
                    <p>
                      <strong>Start:</strong>{" "}
                      {new Date(item.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>End:</strong>{" "}
                      {item.endDate
                        ? new Date(item.endDate).toLocaleDateString()
                        : "Not specified"}
                    </p>
                    {item.prescribedBy && (
                      <p><strong>Prescribed by:</strong> {item.prescribedBy}</p>
                    )}
                    {item.instructions && (
                      <p><strong>Instructions:</strong> {item.instructions}</p>
                    )}
                  </div>

                  <div className="prescription-actions">
                    <button onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item._id)}>
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

export default Prescriptions;
