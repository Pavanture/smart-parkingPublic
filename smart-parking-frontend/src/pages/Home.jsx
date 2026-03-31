import SP from "./SP.svg";
import React from "react";
import "./home.css";

function Home() {
  return (
    <div className="home">
      {/* Navbar */}
      <div className="top-bar">
        <div className="logo">
          <img src={SP} alt="logo" />
          <h2>Smart Parking</h2>
        </div>

        <div className="nav-links">
          <a href="/home">Home</a>
          <a href="/book">Book</a>
          <a href="/account">Account</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/signin" className="logout">
            Sign Out
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="hero-section">
        <h1>Park Smart 🚗</h1>
        <p>Book parking instantly with a modern smart system.</p>
        <a href="/book">
          <button>Book Now</button>
        </a>
      </div>

      {/* Features */}
      <div className="info-section">
        <div className="card fast">
          <h3>⚡ Fast Booking</h3>
          <p>Book your parking slot in just a few seconds.</p>
        </div>

        <div className="card secure">
          <h3>🔒 Secure System</h3>
          <p>Your data and payments are fully protected.</p>
        </div>

        <div className="card smart">
          <h3>📍 Smart Tracking</h3>
          <p>Find nearby parking spots easily anytime.</p>
        </div>

        <div className="card support">
          <h3>💬 24/7 Support</h3>
          <p>We are here to help you anytime.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
