
import { useEffect, useState } from "react";
import { getPets } from "../services/petServices";
import {
  getAppointments,
  bookAppointment
} from "../services/appointmentService";

function Appointments() {
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    pet: "",
    appointmentDate: "",
    reason: "",
    notes: ""
  });

  const getLocalDateTime = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const loadData = async () => {
    try {
      setError("");

      const [petData, appointmentData] = await Promise.all([
        getPets(),
        getAppointments()
      ]);

      setPets(petData);
      setAppointments(appointmentData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load appointment details"
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
    setSuccess("");
    setSaving(true);

    try {
      await bookAppointment(form);

      setSuccess("Appointment booked successfully!");

      setForm({
        pet: "",
        appointmentDate: "",
        reason: "",
        notes: ""
      });

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to book appointment"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="appointment-page">
      <div className="appointment-container">

        <header className="appointment-header">
          <div>
            <span>VETERINARY CARE</span>
            <h1>Appointments</h1>
            <p>Book and manage your pets' appointments.</p>
          </div>
        </header>

        {error && <div className="appointment-error">{error}</div>}
        {success && <div className="appointment-success">{success}</div>}

        <section className="appointment-form-card">
          <h2>Book an Appointment</h2>
          <p>Provide your pet's details and preferred appointment time.</p>

          {pets.length === 0 && !loading ? (
            <p className="appointment-info">
              Please add a pet in My Pets before booking an appointment.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>
                Select Pet *
                <select
                  name="pet"
                  value={form.pet}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose your pet</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Appointment Date and Time *
                <input
                  type="datetime-local"
                  name="appointmentDate"
                  min={getLocalDateTime()}
                  value={form.appointmentDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Reason for Visit *
                <input
                  type="text"
                  name="reason"
                  placeholder="Example: Regular checkup"
                  value={form.reason}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Additional Notes
                <textarea
                  name="notes"
                  placeholder="Describe any symptoms or concerns..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>

              <button type="submit" disabled={saving || loading}>
                {saving ? "Booking..." : "Book Appointment"}
              </button>
            </form>
          )}
        </section>

        <section className="appointment-list-card">
          <div className="appointment-list-heading">
            <div>
              <h2>Appointment History</h2>
              <p>Your previously booked appointments.</p>
            </div>
            <span>{appointments.length} Total</span>
          </div>

          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <div className="appointment-empty">
              <span>📅</span>
              <h3>No appointments yet</h3>
              <p>Your booked appointments will appear here.</p>
            </div>
          ) : (
            <div className="appointment-list">
              {appointments.map((appointment) => (
                <article
                  className="appointment-item"
                  key={appointment._id}
                >
                  <div className="appointment-icon">🐾</div>

                  <div className="appointment-details">
                    <h3>
                      {appointment.pet?.name || "Pet"}
                    </h3>

                    <p>
                      {appointment.pet?.species || ""}
                      {appointment.pet?.breed
                        ? ` • ${appointment.pet.breed}`
                        : ""}
                    </p>

                    <p>
                      <strong>Reason:</strong> {appointment.reason}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleString()}
                    </p>

                    {appointment.notes && (
                      <p>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}
                  </div>

                  <span className="appointment-status">
                    {appointment.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default Appointments;
