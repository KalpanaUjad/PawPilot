
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <nav className="navbar">
        <h2>🐾 PawPilot</h2>

        <div>
          <Link to="/login">Login</Link>
          <Link to="/register" className="nav-button">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">SMARTER PET CARE</p>

        <h1>
          Your Pet's Health,
          <br />
          Smarter and Simpler.
        </h1>

        <p>
          Manage your pet's health, appointments,
          prescriptions and get AI-powered pet care assistance.
        </p>

        <Link to="/register" className="primary-button">
          Get Started →
        </Link>
      </section>
    </div>
  );
}

export default Home;
