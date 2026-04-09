import { Download } from "lucide-react";
function SearchBar({ search, setSearch, exportFilteredToExcel }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "16px",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        placeholder="Search by Device, Model, Rack no., Serial no., UBA tag no. or Owner..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px 12px",
          width: "100%",
          height: "30px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={exportFilteredToExcel}
        style={{
          backgroundColor: "#d91f29",
          color: "#fff",
          padding: "8px 14px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <Download size={20} color="#fff" />
      </button>
    </div>
  );
}

export default SearchBar;
