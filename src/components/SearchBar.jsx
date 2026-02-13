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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-download w-4 h-4"
          data-fg-rmj4="49.16:49.10853:/components/ExportMenu.tsx:211:13:6801:32:e:Download::::::yh6"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" x2="12" y1="15" y2="3"></line>
        </svg>
      </button>
    </div>
  );
}

export default SearchBar;
