import { useEffect } from "react";
import { EXPORT_COLUMNS } from "../constants/columns";
function ExportModal({
  show,
  onClose,
  onExport,
  selectedColumns,
  setSelectedColumns,

  activeTab,
}) {
  if (!show) return null;
  const columnEntries = Object.entries(EXPORT_COLUMNS[activeTab] || {});

  const toggleColumn = (key) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key],
    );
  };
  const selectAll = () => {
    setSelectedColumns(columnEntries.map(([key]) => key));
  };

  const clearAll = () => {
    setSelectedColumns([]);
  };
  const tabLabels = {
    server: "Servers",
    power: "Power Devices",
    cooling: "Cooling Devices",
  };
  useEffect(() => {
    setSelectedColumns([]);
  }, [activeTab, setSelectedColumns]);
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Custom Export - {tabLabels[activeTab]}</h3>
        <p>Choose which columns to include in your Excel export</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={selectAll}
              disabled={selectedColumns.length === columnEntries.length}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid #D92029",
                backgroundColor:
                  selectedColumns.length === columnEntries.length
                    ? "#eee"
                    : "#fff",
                color:
                  selectedColumns.length === columnEntries.length
                    ? "#999"
                    : "#D92029",
                cursor:
                  selectedColumns.length === columnEntries.length
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "500",
                transition: "0.2s ease",
              }}
            >
              Select All
            </button>

            <button
              onClick={clearAll}
              disabled={selectedColumns.length === 0}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: selectedColumns.length === 0 ? "#eee" : "#fff",
                color: selectedColumns.length === 0 ? "#999" : "#333",
                cursor:
                  selectedColumns.length === 0 ? "not-allowed" : "pointer",
                fontWeight: "500",
                transition: "0.2s ease",
              }}
            >
              Clear All
            </button>
          </div>
          <p style={{ margin: 0 }}>
            {selectedColumns.length} out of {columnEntries.length} selected
          </p>
        </div>
        <hr></hr>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px 22px",
            marginTop: "30px",
          }}
        >
          {columnEntries.map(([key, label]) => (
            <label
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid #E5E6EA",
                borderRadius: "4px",
                padding: "10px 12px",
              }}
            >
              <input
                style={{
                  backgroundColor: "#E5E6EA",
                  borderRadius: "4px",
                  border: "1px solid #E5E6EA",
                }}
                type="checkbox"
                checked={selectedColumns.includes(key)}
                onChange={() => toggleColumn(key)}
              />
              {label}
            </label>
          ))}
        </div>
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={() => onExport("excel")}
            disabled={selectedColumns.length === 0}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor:
                selectedColumns.length === 0 ? "#ccc" : "#D92029",
              color: "#fff",
              cursor: selectedColumns.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "500",
              transition: "0.2s ease",
            }}
          >
            Export Excel
          </button>

          <button
            onClick={() => onExport("pdf")}
            disabled={selectedColumns.length === 0}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor:
                selectedColumns.length === 0 ? "#ccc" : "#D92029",
              color: "#fff",
              cursor: selectedColumns.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "500",
              transition: "0.2s ease",
            }}
          >
            Export PDF
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              color: "#333",
              cursor: "pointer",
              fontWeight: "500",
              transition: "0.2s ease",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
export default ExportModal;
