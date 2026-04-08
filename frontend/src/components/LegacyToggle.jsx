import { useState, useEffect } from "react";
import "../css/LegacyToggleCSS.css";

export default function LegacyToggle() {
  const [legacyMode, setLegacyMode] = useState(() => {
    return localStorage.getItem("legacyMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("legacyMode", legacyMode);
  }, [legacyMode]);

  return (
    <div className="toggle-container">
      <span>Legacy Mode</span>

      <label className="switch">
        <input
          type="checkbox"
          checked={legacyMode}
          onChange={() => {setLegacyMode(prev => !prev); window.location.reload()}}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
}

