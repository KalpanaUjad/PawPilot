
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>🐾 PawPilot</h2>
        <button onClick={logout}>Logout</button>
      </nav>

      <main>
        <h1>Welcome, {user?.name}!</h1>
        <p>Your pet care dashboard is ready.</p>

        
         <Link to="/medical-history">Medical History</Link>
         <Link to="/ai-assistant">AI Pet Care Assistant</Link>
<div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>🐶 My Pets</h3>
            <Link to="/my-pets">Manage My Pets</Link>
          </div>

          <div className="dashboard-card">
            <h3>📅 Appointments</h3>
<Link to="/appointments">Manage Appointments</Link>
          </div>

          <div className="dashboard-card">
            <h3>💊 Prescriptions</h3>
            <Link to="/prescriptions">Manage Prescriptions</Link>
          </div>

          <div className="dashboard-card">
            <h3>🤖 AI Pet Assistant</h3>
            <p>Get AI-powered pet care guidance.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
