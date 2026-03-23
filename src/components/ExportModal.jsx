function ExportModal({
  show,
  onClose,
  onExport,
  selectedColumns,
  setSelectedColumns,
  setExportFormat,
}) {
  if (!show) return null;

  const columns = [
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
  ];

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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Custom Export - Select Columns</h3>
        <p>Choose which columns to include in your Excel export</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={selectAll}
              disabled={selectedColumns.length === columns.length}
            >
              Select All
            </button>

            <button onClick={clearAll} disabled={selectedColumns.length === 0}>
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
        <div style={{ marginTop: "16px" }}>
          <button onClick={() => onExport("excel")}>Export Excel</button>

          <button onClick={() => onExport("pdf")}>Export PDF</button>

          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
export default ExportModal;
