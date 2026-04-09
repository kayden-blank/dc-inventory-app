import { useEffect } from "react";
function ExportModal({
  show,
  onClose,
  onExport,
  selectedColumns,
  setSelectedColumns,
  setExportFormat,
  activeTab,
}) {
  if (!show) return null;

  const columnsMap = {
    server: [
      { key: "device_label", label: "Device / Label" },
      { key: "model", label: "Model" },
      { key: "status", label: "Status" },
      { key: "rack_no", label: "Rack No." },
      { key: "new_rack_no", label: "New Rack No." },
      { key: "server_owner_dept", label: "Server Owner Dept." },
      { key: "server_admin_name", label: "Admin Name" },
      { key: "serial_number", label: "Serial Number" },
      { key: "uba_tag_number", label: "UBA Tag Number" },
      { key: "deployment_date", label: "Deployment Date" },
    ],

    power: [
      { key: "device_name", label: "Device Name" },
      { key: "device_type", label: "Device Type" },
      { key: "device_model", label: "Model" },
      { key: "device_location", label: "Location" },
      { key: "operational_status", label: "Operational Status" },
      { key: "condition_status", label: "Condition Status" },
      { key: "serial_number", label: "Serial Number" },
      { key: "uba_tag", label: "UBA Tag" },
    ],

    cooling: [
      { key: "device_name", label: "Device Name" },
      { key: "device_type", label: "Device Type" },
      { key: "device_model", label: "Model" },
      { key: "device_location", label: "Location" },
      { key: "year_procured", label: "Year Procured" },
      { key: "year_installed", label: "Year Installed" },
      { key: "status", label: "Status" },
      { key: "serial_number", label: "Serial Number" },
      { key: "uba_tag", label: "UBA Tag" },
      { key: "remarks", label: "Remarks" },
    ],
  };
  const columns = columnsMap[activeTab];

  const toggleColumn = (key) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key],
    );
  };
  const selectAll = () => {
    setSelectedColumns(columns.map((col) => col.key));
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
  }, [activeTab]);
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
              disabled={selectedColumns.length === columns.length}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid #D92029",
                backgroundColor:
                  selectedColumns.length === columns.length ? "#eee" : "#fff",
                color:
                  selectedColumns.length === columns.length
                    ? "#999"
                    : "#D92029",
                cursor:
                  selectedColumns.length === columns.length
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
            {selectedColumns.length} out of {columns.length} selected
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
          {columns.map((col) => (
            <label
              key={col.key}
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
                checked={selectedColumns.includes(col.key)}
                onChange={() => toggleColumn(col.key)}
              />
              {col.label}
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
