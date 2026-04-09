import { Server, Zap, Wind } from "lucide-react";
import { motion } from "framer-motion";

function AssetTypeToggle({ value, onChange }) {
  const options = [
    { value: "server", label: "Server", icon: Server },
    { value: "power", label: "Power", icon: Zap },
    { value: "cooling", label: "Cooling", icon: Wind },
  ];

  return (
    <div className="toggle-container">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`toggle-btn ${isActive ? "active" : ""}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="toggle-bg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            <Icon className={`icon ${isActive ? "active-icon" : ""}`} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AssetTypeToggle;
