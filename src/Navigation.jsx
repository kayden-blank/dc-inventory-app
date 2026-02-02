import React from "react";
import "./css/Navigation.css";

const Navigation = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <div className="navbar-logo">
            <span style={{ color: "#D91F29", borderRight: "1px solid black" }}>
              UBA{" "}
            </span>
            <span style={{ paddingLeft: "10px" }}> DC Inventory</span>
          </div>

          {/* Page Title - hidden on mobile */}
          <div className="navbar-title">
            <h1>Data Centre Inventory</h1>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
