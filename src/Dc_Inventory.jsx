import { useState, useEffect, useRef } from "react";
import { supabase } from "./assets/Supabase";
import "./css/Dc_Inventory.css";
import * as XLSX from "xlsx";
import InventoryTable from "./components/InventoryTable.jsx";
import InventoryForm from "./components/InventoryForm.jsx";
import BulkUploadModal from "./components/BulkUploadModal.jsx";
import SearchBar from "./components/SearchBar.jsx";
import Pagination from "./components/Pagination.jsx";

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

  const exportFilteredToExcel = () => {
    if (!filteredItems.length) {
      alert("No data to export");
      return;
    }

    const mapped = filteredItems.map((item) => ({
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

    const worksheet = XLSX.utils.json_to_sheet(mapped);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Inventory");

    XLSX.writeFile(workbook, "Filtered_Inventory.xlsx");
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
      const query = search.toLowerCase().trim();

      if (!query) return true;

      return (
        (item.device_label || "").toLowerCase().includes(query) ||
        (item.model || "").toLowerCase().includes(query) ||
        (item.server_owner_dept || "").toLowerCase().includes(query) ||
        (item.server_admin_name || "").toLowerCase().includes(query) ||
        (item.serial_number || "").toLowerCase().includes(query) ||
        (item.uba_tag_number || "").toLowerCase().includes(query) ||
        (item.new_rack_no || "").toLowerCase().includes(query)
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
      <InventoryForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editingId={editingId}
        handleCancelEdit={handleCancelEdit}
        formRef={formRef}
      />

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

      <SearchBar
        search={search}
        setSearch={setSearch}
        exportFilteredToExcel={exportFilteredToExcel}
      />
      <div style={{ overflowX: "auto", width: "100%" }}>
        <InventoryTable
          currentItems={currentItems}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          paginationRange={paginationRange}
        />
      </div>

      <BulkUploadModal
        show={showBulkModal}
        previewData={previewData}
        uploading={uploading}
        handleExcelPreview={handleExcelPreview}
        handleConfirmUpload={handleConfirmUpload}
        handleClose={handleCloseBulkModal}
      />
    </div>
  );
}

export default Dc_Inventory;
