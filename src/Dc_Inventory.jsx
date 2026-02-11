import { useState, useEffect, useRef } from "react";
import { supabase } from "./assets/Supabase";
import "./css/Dc_Inventory.css";
import * as XLSX from "xlsx";

function Dc_Inventory() {
  // console.log("SUPABASE CLIENT:", supabase);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    device_label: "",
    model: "",
    active: "Active",
    rack_no: "",
    new_rack_no: "",
    server_owner_dept: "",
    server_admin_name: "",
    serial_number: "",
    uba_tag_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExcelPreview = async (file) => {
    if (!file) return;
    console.log("Selected file:", file);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const mapped = rows.map((row) => ({
        device_label: row["Device / Label"]?.toString().trim(),
        model: row["Model"]?.toString().trim(),
        status: row["Status"]?.toString().trim(),
        rack_no: row["Rack No."]?.toString().trim(),
        new_rack_no: row["New Rack No."]?.toString().trim(),
        server_owner_dept: row["Server Owner Department"]?.toString().trim(),
        server_admin_name: row["Admin Name"]?.toString().trim(),
        serial_number: row["Serial Number"]?.toString().trim(),
        uba_tag_number: row["UBA Tag Number"]?.toString().trim(),
      }));

      setPreviewData(mapped);
      console.log("Raw Excel Rows:", rows);
      console.log("Preview Data:", mapped);
    } catch (err) {
      console.error(err);
      alert("Failed to read Excel file");
    }
  };

  const handleCloseBulkModal = () => {
    setShowBulkModal(false);
    setPreviewData([]);
    setUploading(false);
  };
  const handleConfirmUpload = async () => {
    if (!previewData.length) return;

    setUploading(true);

    const { error } = await supabase.from("dc_inventory").insert(previewData);

    setUploading(false);

    if (error) {
      console.error("UPLOAD ERROR:", error);
      alert(error.message);
      return;
    }

    alert(`Successfully uploaded ${previewData.length} records`);
    setPreviewData([]);
    setShowBulkModal(false);
    fetchItems();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      // UPDATE existing item
      const { error } = await supabase
        .from("dc_inventory")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        console.error("UPDATE ERROR:", error);
        alert(error.message);
        return;
      }

      // Update item in state
      setItems(
        items.map((item) =>
          item.id === editingId ? { ...item, ...formData } : item,
        ),
      );
      setEditingId(null); // stop editing
    } else {
      // INSERT new item
      const { error } = await supabase.from("dc_inventory").insert([formData]);
      if (error) {
        console.error("INSERT ERROR:", error);
        alert(error.message);
        return;
      }

      const { data } = await supabase
        .from("dc_inventory")
        .select("*")
        .order("id", { ascending: true });

      setItems(data);
    }

    // Reset form
    setFormData({
      device_label: "",
      model: "",
      active: "Active",
      rack_no: "",
      new_rack_no: "",
      server_owner_dept: "",
      server_admin_name: "",
      serial_number: "",
      uba_tag_number: "",
    });
  };
  const exportToExcel = async (filterActive = false) => {
    try {
      // Fetch data from Supabase
      let query = supabase.from("dc_inventory").select("*");

      if (filterActive) {
        query = query
          .eq("status", "Active")
          .order("rack_no", { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch error:", error);
        alert("Failed to fetch data for export");
        return;
      }

      if (!data || data.length === 0) {
        alert("No data to export");
        return;
      }

      // Map data to proper format for Excel
      const mapped = data.map((item) => ({
        "Device / Label": item.device_label,
        Model: item.model,
        Status: item.status,
        "Rack No.": item.rack_no,
        "New Rack No.": item.new_rack_no,
        "Server Owner Dept.": item.server_owner_dept,
        "Server Admin Name": item.server_admin_name,
        "Serial Number": item.serial_number,
        "UBA Tag Number": item.uba_tag_number,
      }));

      // Create workbook and sheet
      const worksheet = XLSX.utils.json_to_sheet(mapped);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

      // Export file
      const fileName = filterActive
        ? "Active_Inventory.xlsx"
        : "All_Inventory.xlsx";

      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error(err);
      alert("Failed to export Excel file");
    }
  };
  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("dc_inventory")
      .select("*")
      .order("rack_no", { ascending: true });

    if (error) {
      console.error("SUPABASE ERROR:", error);
    } else {
      console.log("SUPABASE DATA:", data);
      setItems(data);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;

    const { error } = await supabase.from("dc_inventory").delete().eq("id", id);

    if (error) {
      console.error("DELETE ERROR:", error);
      alert(error.message);
      return;
    }

    // Remove deleted item from state
    setItems(items.filter((item) => item.id !== id));
  };
  const handleEdit = (item) => {
    setFormData({
      device_label: item.device_label,
      model: item.model,
      active: item.active,
      rack_no: item.rack_no,
      new_rack_no: item.new_rack_no,
      server_owner_dept: item.server_owner_dept,
      server_admin_name: item.server_admin_name,
      serial_number: item.serial_number,
      uba_tag_number: item.uba_tag_number,
    });
    setEditingId(item.id);

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setFormData({
      device_label: "",
      model: "",
      active: "Active",
      rack_no: "",
      new_rack_no: "",
      server_owner_dept: "",
      server_admin_name: "",
      serial_number: "",
      uba_tag_number: "",
    });
  };
  //Filter items based on search
  const filteredItems = items
    .filter((item) => {
      const query = search.toLowerCase();
      return (
        (item.device_label || "").toLowerCase().includes(query) ||
        (item.model || "").toLowerCase().includes(query) ||
        (item.server_owner_dept || "").toLowerCase().includes(query) ||
        (item.uba_tag_number || "").toLowerCase().includes(query) ||
        (item.rack_no || "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const rackA = parseInt(a.rack_no) || 0;
      const rackB = parseInt(b.rack_no) || 0;

      if (rackA !== rackB) {
        return rackA - rackB;
      }

      const labelA = (a.device_label || "").toLowerCase();
      const labelB = (b.device_label || "").toLowerCase();

      return labelA.localeCompare(labelB);
    });
  //Paginate filtered items

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const formRef = useRef(null);
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getPaginationRange = (currentPage, totalPages) => {
    const delta = 2; // how many pages to show around current
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    let lastPage;

    for (let i of range) {
      if (lastPage) {
        if (i - lastPage === 2) {
          rangeWithDots.push(lastPage + 1);
        } else if (i - lastPage > 2) {
          rangeWithDots.push("...");
        }
      }

      rangeWithDots.push(i);
      lastPage = i;
    }

    return rangeWithDots;
  };
  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <div className="wholeBody">
      <p className="addNew">{editingId ? "Edit Device" : "Add New Device"}</p>
      <form ref={formRef} onSubmit={handleSubmit} className="inventory-form">
        <div className="form-grid">
          <div className="form_content">
            <label>Device / Label:</label>
            <input
              name="device_label"
              placeholder="Device / Label"
              value={formData.device_label}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form_content">
            <label>Model:</label>
            <input
              name="model"
              placeholder="Model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form_content">
            <label>Status:</label>
            <select
              name="active"
              value={formData.active}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="ShutDown">Shut Down</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>

          <div className="form_content">
            <label>Rack No:</label>
            <input
              name="rack_no"
              placeholder="Rack No."
              value={formData.rack_no}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>New Rack No:</label>
            <input
              name="new_rack_no"
              placeholder="New Rack No."
              value={formData.new_rack_no}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Server Owner Dept.:</label>
            <input
              name="server_owner_dept"
              placeholder="Server Owner Dept."
              value={formData.server_owner_dept}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Server Admin Name:</label>
            <input
              name="server_admin_name"
              placeholder="Server Admin Name"
              value={formData.server_admin_name}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Serial Number:</label>
            <input
              name="serial_number"
              placeholder="Serial Number"
              value={formData.serial_number}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>UBA Tag Number:</label>

            <input
              name="uba_tag_number"
              placeholder="UBA Tag Number"
              value={formData.uba_tag_number}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit" className="submit-btn">
            {editingId ? "Update Device" : "Add Device"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <p className="inventoryList">Inventory List</p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <p className="totalItems">
          Total Devices: {search ? filteredItems.length : items.length}
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            alignItems: "center",
          }}
        >
          {/* Bulk Upload */}
          <button className="bulkBtn" onClick={() => setShowBulkModal(true)}>
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
              class="lucide lucide-upload w-4 h-4"
              data-fg-b7rw65="0.8:49.4582:/App.tsx:335:21:11992:30:e:Upload::::::4gZ"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" x2="12" y1="3" y2="15"></line>
            </svg>{" "}
            Bulk Upload
          </button>

          {/* Export Dropdown */}
          <div className="dropdown">
            <button className="selectbtn">
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
              </svg>{" "}
              Export
            </button>
            <div className="dropdown-content">
              <button onClick={() => exportToExcel(false)}>
                <span>📄</span> Export All
              </button>
              <button onClick={() => exportToExcel(true)}>
                <span>✅</span> Export Active
              </button>
            </div>
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by Device, Model, or Owner..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "16px",
          padding: "8px 12px",
          width: "97%",
          height: "30px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <div style={{ overflowX: "auto", width: "100%" }}>
        <table className="dcTable">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Device / Label</th>
              <th>Model</th>
              <th>Status</th>
              <th>Rack No.</th>
              <th>New Rack No.</th>
              <th>Server Owner Dept.</th>
              <th>Server Admin Name</th>
              <th>Serial Number</th>
              <th>UBA Tag Number</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td> {/* S/N */}
                  <td data-label="Device / Label">{item.device_label}</td>
                  <td data-label="Model">{item.model}</td>
                  <td data-label="Status">{item.status}</td>
                  <td data-label="Rack No.">{item.rack_no}</td>
                  <td data-label="New Rack No.">{item.new_rack_no}</td>
                  <td data-label="Server Owner Dept.">
                    {item.server_owner_dept}
                  </td>
                  <td data-label="Server Admin Name">
                    {item.server_admin_name}
                  </td>
                  <td data-label="Serial Number">{item.serial_number}</td>
                  <td data-label="UBA Tag Number">{item.uba_tag_number}</td>
                  <td>
                    <span className="editBtn" onClick={() => handleEdit(item)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-pencil"
                        data-fg-cuwo110="1.15:24.1808:/components/InventoryTable.tsx:182:17:8195:20:e:Pencil::::::CHAv"
                      >
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                        <path d="m15 5 4 4"></path>
                      </svg>
                    </span>
                    <span
                      className="deleteBtn"
                      onClick={() => handleDelete(item.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-trash2 lucide-trash-2"
                        data-fg-cuwo112="1.15:24.1808:/components/InventoryTable.tsx:189:17:8491:20:e:Trash2::::::CuIQ"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" x2="10" y1="11" y2="17"></line>
                        <line x1="14" x2="14" y1="11" y2="17"></line>
                      </svg>{" "}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No devices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button
            style={{
              marginLeft: "8px",
              backgroundColor: "#d91f29",
              color: "#fff",
            }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          {paginationRange.map((page, index) =>
            page === "..." ? (
              <span key={index} className="dots">
                ...
              </span>
            ) : (
              <button
                key={index}
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ),
          )}

          <button
            style={{
              marginLeft: "8px",
              backgroundColor: "#d91f29",
              color: "#fff",
            }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                viewBox="0 0 24 24"
                color="red"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-upload w-5 h-5 text-[#D91E27]"
                data-fg-ccgn4="49.13:49.13256:/components/BulkUploadDialog.tsx:163:13:6188:45:e:Upload::::::4gZ"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" x2="12" y1="3" y2="15"></line>
              </svg>{" "}
              Bulk Upload Inventory
            </h3>
            <p style={{ textAlign: "left" }}>
              Upload an Excel file containing multiple device records. Download
              the template to ensure proper formatting.
            </p>

            <div className="downloadTemplate">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-file-spreadsheet w-5 h-5 text-gray-600"
                data-fg-ccgn12="49.13:49.13256:/components/BulkUploadDialog.tsx:175:15:6748:53:e:FileSpreadsheet::::::EINS"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="M8 13h2"></path>
                <path d="M14 13h2"></path>
                <path d="M8 17h2"></path>
                <path d="M14 17h2"></path>
              </svg>

              <div>
                <p style={{ fontSize: "12px", color: "#555" }}>
                  <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                    Download Template
                  </span>
                  <br></br>
                  Get the Excel template for bulk uploading inventory data.
                </p>
              </div>
              <a href="/dc_inventory_template.xlsx" download>
                <button className="download-btn">Download Template</button>
              </a>
            </div>

            <p>Select Excel file</p>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => handleExcelPreview(e.target.files[0])}
            />

            {previewData.length > 0 && (
              <>
                <div className="readyToUpload">
                  <p>{previewData.length} records ready to upload</p>
                  <p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      color="#01A63F"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-circle-check w-4 h-4"
                      data-fg-ccgn48="49.13:49.13256:/components/BulkUploadDialog.tsx:240:23:9333:36:e:CheckCircle2::::::CELI"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>{" "}
                    <span style={{ color: "#01A63F" }}>Ready to upload</span>
                  </p>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <th
                        colSpan={6}
                        style={{ textAlign: "left", fontSize: "12px" }}
                      >
                        Preview (first 5 records)
                      </th>
                      <tr>
                        <th>Device / Label</th>
                        <th>Model</th>
                        <th>Rack No.</th>
                        <th>New Rack No.</th>
                        <th>Serial Number</th>
                        <th>UBA Tag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          <td>{row.device_label}</td>
                          <td>{row.model}</td>
                          <td>{row.rack_no}</td>
                          <td>{row.new_rack_no}</td>
                          <td>{row.serial_number}</td>
                          <td>{row.uba_tag_number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <div className="modal-actions">
              <button className="close-btn" onClick={handleCloseBulkModal}>
                Close
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={uploading || previewData.length === 0}
                style={{
                  opacity: previewData.length === 0 ? 0.5 : 1,
                  backgroundColor: "#d91f29",
                  color: "#fff",
                }}
              >
                {uploading
                  ? "Saving..."
                  : `Upload ${previewData.length} Devices`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// const thStyle = {
//   border: "1px solid #E5E6EA",
//   padding: "8px",
//   background: "#F9FBFA",
//   textAlign: "left",
// };

// const tdStyle = {
//   border: "1px solid #ddd",
//   padding: "8px",
//   background: "#FFFFFF",
// };

export default Dc_Inventory;
