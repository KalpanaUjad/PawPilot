
import { useEffect, useState } from "react";
import {
  getPets,
  addPet,
  updatePet,
  deletePet
} from "../services/petServices";

const initialForm = {
  name: "",
  species: "Dog",
  breed: "",
  age: 0,
  gender: "Unknown",
  weight: 0,
  notes: ""
};

function MyPets() {
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPets = async () => {
    try {
      setError("");
      const data = await getPets();
      setPets(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const openAddForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const data = {
        ...form,
        age: Number(form.age),
        weight: Number(form.weight)
      };

      if (editingId) {
        await updatePet(editingId, data);
      } else {
        await addPet(data);
      }

      closeForm();
      await loadPets();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save pet");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pet) => {
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      age: pet.age || 0,
      gender: pet.gender || "Unknown",
      weight: pet.weight || 0,
      notes: pet.notes || ""
    });

    setEditingId(pet._id);
    setError("");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) {
      return;
    }

    try {
      setError("");
      await deletePet(id);
      await loadPets();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete pet");
    }
  };

  const getPetIcon = (species) => {
    const icons = {
      Dog: "🐶",
      Cat: "🐱",
      Bird: "🐦",
      Rabbit: "🐰",
      Other: "🐾"
    };

    return icons[species] || "🐾";
  };

  return (
    <div className="pets-page">
      <div className="pets-container">

        <header className="pets-header">
          <div>
            <span className="pets-eyebrow">PET MANAGEMENT</span>
            <h1>My Pets</h1>
            <p>Keep all your pet information organized in one place.</p>
          </div>

          <button className="add-pet-btn" onClick={openAddForm}>
            + Add New Pet
          </button>
        </header>

        {error && <div className="pets-error">{error}</div>}

        <section className="pet-summary">
          <div className="summary-card">
            <span className="summary-icon">🐾</span>
            <div>
              <h2>{pets.length}</h2>
              <p>Total Pets</p>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">🐶</span>
            <div>
              <h2>{pets.filter(p => p.species === "Dog").length}</h2>
              <p>Dogs</p>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">🐱</span>
            <div>
              <h2>{pets.filter(p => p.species === "Cat").length}</h2>
              <p>Cats</p>
            </div>
          </div>
        </section>

        {showForm && (
          <section className="pet-form-panel">
            <div className="pet-form-heading">
              <div>
                <h2>{editingId ? "Update Pet Details" : "Add a New Pet"}</h2>
                <p>Enter your pet's basic information below.</p>
              </div>

              <button className="close-form-btn" onClick={closeForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="pet-form-grid">
                <label>
                  Pet Name *
                  <input
                    name="name"
                    placeholder="Enter pet name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Species *
                  <select name="species" value={form.species} onChange={handleChange}>
                    {["Dog", "Cat", "Bird", "Rabbit", "Other"].map(item => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Breed
                  <input
                    name="breed"
                    placeholder="Enter breed"
                    value={form.breed}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Age (years)
                  <input
                    name="age"
                    type="number"
                    min="0"
                    placeholder="Enter age"
                    value={form.age}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Gender
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option>Unknown</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </label>

                <label>
                  Weight (kg)
                  <input
                    name="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Enter weight"
                    value={form.weight}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <label className="pet-notes-label">
                Additional Notes
                <textarea
                  name="notes"
                  placeholder="Any important information about your pet..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>

              <div className="pet-form-actions">
                <button type="button" className="cancel-btn" onClick={closeForm}>
                  Cancel
                </button>

                <button type="submit" className="save-pet-btn" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Pet" : "Save Pet"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="pet-list-section">
          <div className="pet-list-heading">
            <div>
              <h2>Your Pet Profiles</h2>
              <p>View and manage your registered pets.</p>
            </div>
            <span>{pets.length} {pets.length === 1 ? "Pet" : "Pets"}</span>
          </div>

          {loading ? (
            <div className="pet-empty-state">Loading your pets...</div>
          ) : pets.length === 0 ? (
            <div className="pet-empty-state">
              <div className="empty-pet-icon">🐾</div>
              <h3>No pets added yet</h3>
              <p>Add your first pet to start managing its profile.</p>
              <button className="add-pet-btn" onClick={openAddForm}>
                + Add Your First Pet
              </button>
            </div>
          ) : (
            <div className="pet-grid">
              {pets.map(pet => (
                <article className="pet-profile-card" key={pet._id}>
                  <div className="pet-card-top">
                    <div className="pet-avatar">
                      {getPetIcon(pet.species)}
                    </div>
                    <span className="pet-species">{pet.species}</span>
                  </div>

                  <h3>{pet.name}</h3>
                  <p className="pet-breed">{pet.breed || "Breed not specified"}</p>

                  <div className="pet-details">
                    <div>
                      <span>Age</span>
                      <strong>{pet.age} years</strong>
                    </div>
                    <div>
                      <span>Gender</span>
                      <strong>{pet.gender}</strong>
                    </div>
                    <div>
                      <span>Weight</span>
                      <strong>{pet.weight} kg</strong>
                    </div>
                  </div>

                  {pet.notes && (
                    <p className="pet-notes">{pet.notes}</p>
                  )}

                  <div className="pet-card-actions">
                    <button onClick={() => handleEdit(pet)}>
                      Edit Profile
                    </button>
                    <button onClick={() => handleDelete(pet._id)}>
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

export default MyPets;
