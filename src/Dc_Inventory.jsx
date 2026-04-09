import { useState, useEffect, useRef } from "react";
import { supabase } from "./assets/Supabase";
import "./css/Dc_Inventory.css";
import * as XLSX from "xlsx";
import InventoryTable from "./components/InventoryTable.jsx";
import InventoryForm from "./components/InventoryForm.jsx";
import BulkUploadModal from "./components/BulkUploadModal.jsx";
import SearchBar from "./components/SearchBar.jsx";
import Pagination from "./components/Pagination.jsx";
import ExportModal from "./components/ExportModal.jsx";
import AssetTypeToggle from "./components/AssetTypeToggle.jsx";

function Dc_Inventory() {
  // console.log("SUPABASE CLIENT:", supabase);

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [activeTab, setActiveTab] = useState("server"); // default
  const [tableData, setTableData] = useState([]);
  const [validData, setValidData] = useState([]);
  const formRef = useRef(null);
  const tableMap = {
    server: "dc_inventory",
    power: "power_devices",
    cooling: "cooling_devices",
  };
  const resetFormByTab = {
    server: {
      device_label: "",
      model: "",
      status: "Active",
      rack_no: "",
      new_rack_no: "",
      server_owner_dept: "",
      server_admin_name: "",
      serial_number: "",
      uba_tag_number: "",
      deployment_date: null,
    },
    power: {
      device_name: "",
      device_type: "",
      device_model: "",
      device_location: "",
      operational_status: "Operational",
      condition_status: "",
      serial_number: "",
      uba_tag: "",
    },
    cooling: {
      device_name: "",
      device_type: "",
      device_model: "",
      device_location: "",
      year_procured: "",
      year_installed: "",
      status: "",
      serial_number: "",
      uba_tag: "",
      remarks: "",
    },
  };

  const [formData, setFormData] = useState(resetFormByTab[activeTab]);
  const formMap = {
    server: [
      "device_label",
      "model",
      "status",
      "rack_no",
      "new_rack_no",
      "server_owner_dept",
      "server_admin_name",
      "serial_number",
      "uba_tag_number",
      "deployment_date",
    ],
    power: [
      "device_name",
      "device_type",
      "device_model",
      "device_location",
      "operational_status",
      "condition_status",
      "serial_number",
      "uba_tag",
    ],
    cooling: [
      "device_name",
      "device_type",
      "device_model",
      "device_location",
      "year_procured",
      "year_installed",
      "status",
      "serial_number",
      "uba_tag",
      "remarks",
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || null, // Convert empty strings to null for optional fields
    }));
  };

  const exportFilteredToExcel = () => {
    if (!filteredItems.length) {
      alert("No data to export");
      return;
    }

    // Define export column maps per tab
    const exportColumnsMap = {
      server: {
        device_label: "Device / Label",
        model: "Model",
        status: "Status",
        rack_no: "Rack No.",
        new_rack_no: "New Rack No.",
        server_owner_dept: "Server Owner Dept.",
        server_admin_name: "Server Admin Name",
        serial_number: "Serial Number",
        uba_tag_number: "UBA Tag Number",
        deployment_date: "Deployment Date",
      },
      power: {
        device_name: "Device Name",
        device_type: "Device Type",
        device_model: "Device Model",
        device_location: "Location",
        operational_status: "Operational Status",
        condition_status: "Condition Status",
        serial_number: "Serial Number",
        uba_tag: "UBA Tag",
      },
      cooling: {
        device_name: "Device Name",
        device_type: "Device Type",
        device_model: "Model",
        device_location: "Location",
        year_procured: "Year Procured",
        year_installed: "Year Installed",
        status: "Status",
        serial_number: "Serial Number",
        uba_tag: "UBA Tag",
        remarks: "Remarks",
      },
    };

    // Get the columns for the current tab
    const columns = exportColumnsMap[activeTab];

    // Map filteredItems dynamically
    const mapped = filteredItems.map((item) => {
      const obj = {};
      Object.entries(columns).forEach(([key, label]) => {
        obj[label] = item[key] ?? "";
      });
      return obj;
    });

    // Create Excel file
    const worksheet = XLSX.utils.json_to_sheet(mapped);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Inventory");
    XLSX.writeFile(workbook, `${activeTab}_Filtered_Inventory.xlsx`);
  };

  const handleExcelPreview = async (file) => {
    if (!file) return;
    console.log("Selected file:", file);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      const importMap = {
        server: {
          "Device / Label": "device_label",
          Model: "model",
          Status: "status",
          "Rack No.": "rack_no",
          "New Rack No.": "new_rack_no",
          "Server Owner Department": "server_owner_dept",
          "Admin Name": "server_admin_name",
          "Serial Number": "serial_number",
          "UBA Tag Number": "uba_tag_number",
          "Deployment Date": "deployment_date",
        },

        power: {
          "Device Name": "device_name",
          "Device Type": "device_type",
          "Device Model": "device_model",
          Location: "device_location",
          "Operational Status": "operational_status",
          "Condition Status": "condition_status",
          "Serial Number": "serial_number",
          "UBA Tag": "uba_tag",
        },

        cooling: {
          "Device Name": "device_name",
          "Device Type": "device_type",
          Model: "device_model",
          Location: "device_location",
          "Year Procured": "year_procured",
          "Year Installed": "year_installed",
          Status: "status",
          "Serial Number": "serial_number",
          "UBA Tag": "uba_tag",
          Remarks: "remarks",
        },
      };

      const mapping = importMap[activeTab];

      const mapped = rows.map((row, index) => {
        const obj = {};
        Object.entries(mapping).forEach(([excelKey, dbKey]) => {
          obj[dbKey] = row[excelKey]?.toString().trim() ?? null;
        });
        // ✅ ADD VALIDATION
        let isValid = true;
        let errors = [];

        if (activeTab === "server") {
          if (!obj.device_label) {
            isValid = false;
            errors.push("Missing Device Label");
          }
          if (!obj.model) {
            isValid = false;
            errors.push("Missing Model");
          }
        }

        if (activeTab === "power" || activeTab === "cooling") {
          if (!obj.device_name) {
            isValid = false;
            errors.push("Missing Device Name");
          }
          if (!obj.device_type) {
            isValid = false;
            errors.push("Missing Device Type");
          }
        }

        return {
          ...obj,
          _isValid: isValid,
          _errors: errors,
          _rowNumber: index + 2, // +2 because of header and 0-index
        };
      });
      const validRows = mapped
        .filter((row) => row._isValid)
        .map(({ _isValid, _errors, _rowNumber, ...clean }) => clean);

      setValidData(validRows);

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
    if (!validData.length) {
      alert("No valid data to upload");
      return;
    }

    const tableName = tableMap[activeTab];

    try {
      setUploading(true);

      const { error } = await supabase.from(tableName).insert(validData);

      if (error) {
        throw error;
      }

      alert(
        `Uploaded ${validData.length} valid records. ${previewData.length - validData.length} ${previewData.length - validData.length === 1 ? "row was" : "rows were"} skipped due to errors.`,
      );

      setPreviewData([]);
      setValidData([]);
      fetchData();
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false); // ✅ ALWAYS runs
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
      "Submitting form with data:",
      formData,
      "Editing ID:",
      editingId,
    );
    const tableName = tableMap[activeTab];

    const allowedFields = formMap[activeTab];
    console.log("Allowed fields for this tab:", allowedFields);

    const filteredData = Object.fromEntries(
      formMap[activeTab].map((key) => [key, formData[key] ?? ""]),
    );

    console.log("Filtered Data:", filteredData);

    if (editingId) {
      const { error } = await supabase
        .from(tableName)
        .update(filteredData)
        .eq("id", editingId);

      if (error) {
        console.error(error);
        return;
      }
    } else {
      const { error } = await supabase.from(tableName).insert([filteredData]);

      if (error) {
        console.error(error);
        return;
      }
    }

    fetchData();
    setEditingId(null);
    setFormData(resetFormByTab[activeTab]);
  };

  const exportData = async ({
    format = "excel", // "excel" | "pdf"
    filterActive = false,
    selectedColumns = null, // null = all columns
  }) => {
    try {
      const tableName = tableMap[activeTab]; // ✅ dynamic table

      let query = supabase.from(tableName).select("*");

      // Optional filter (only if column exists)
      if (filterActive && activeTab === "server") {
        query = query
          .eq("status", "Active")
          .order("rack_no", { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        alert("Failed to fetch data");
        return;
      }

      if (!data || data.length === 0) {
        alert("No data to export");
        return;
      }

      // ✅ Define ALL possible columns
      const exportColumnsMap = {
        server: {
          device_label: "Device / Label",
          model: "Model",
          status: "Status",
          rack_no: "Rack No.",
          new_rack_no: "New Rack No.",
          server_owner_dept: "Server Owner Dept.",
          server_admin_name: "Server Admin Name",
          serial_number: "Serial Number",
          uba_tag_number: "UBA Tag Number",
          deployment_date: "Deployment Date",
        },

        power: {
          device_name: "Device Name",
          device_type: "Device Type",
          device_model: "Device Model",
          device_location: "Location",
          operational_status: "Operational Status",
          condition_status: "Condition Status",
          serial_number: "Serial Number",
          uba_tag: "UBA Tag",
        },

        cooling: {
          device_name: "Device Name",
          device_type: "Device Type",
          device_model: "Model",
          device_location: "Location",
          year_procured: "Year Procured",
          year_installed: "Year Installed",
          status: "Status",
          serial_number: "Serial Number",
          uba_tag: "UBA Tag",
          remarks: "Remarks",
        },
      };

      // Convert allColumns object into array of { key, label }
      // Convert exportColumnsMap[activeTab] into array of { key, label }
      const allColumnsArray = Object.entries(exportColumnsMap[activeTab]).map(
        ([key, label]) => ({ key, label }),
      );

      // Filter columns if selectedColumns is provided
      const columnsToUse =
        selectedColumns && selectedColumns.length > 0
          ? allColumnsArray.filter((col) => selectedColumns.includes(col.key))
          : allColumnsArray;

      // ✅ Map data dynamically
      const mapped = data.map((item) => {
        const obj = {};
        columnsToUse.forEach((col) => {
          obj[col.label] = item[col.key];
        });
        return obj;
      });

      // =======================
      // 📊 EXPORT EXCEL
      // =======================
      if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(mapped);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

        XLSX.writeFile(workbook, `${activeTab}_inventory.xlsx`);
      }

      // =======================
      // 📄 EXPORT PDF
      // =======================
      if (format === "pdf") {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;

        const doc = new jsPDF({
          orientation: "landscape", // 👈 VERY IMPORTANT
        });

        const headers = [columnsToUse.map((col) => col.label)];
        const rows = mapped.map((row) => Object.values(row));

        autoTable(doc, {
          head: headers,
          body: rows,

          styles: {
            fontSize: 8, // smaller text = more space
            cellPadding: 3,
            overflow: "linebreak",
          },
          tableWidth: "auto",
          headStyles: {
            fillColor: [217, 32, 41], // optional styling
          },

          didDrawPage: (data) => {
            doc.setFontSize(10);
            doc.text("Inventory Export", data.settings.margin.left, 10);
          },
        });

        doc.save("Inventory.pdf");
      }
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;

    const tableName = tableMap[activeTab]; // ✅ dynamic table

    const { error } = await supabase.from(tableName).delete().eq("id", id);

    if (error) {
      console.error("DELETE ERROR:", error);
      alert(error.message);
      return;
    }

    fetchData(); // ✅ refresh correctly
  };
  const handleEdit = (item) => {
    const fields = formMap[activeTab];

    const newFormData = {};
    fields.forEach((key) => {
      newFormData[key] = item[key] ?? "";
    });

    setFormData(newFormData);
    setEditingId(item.id);

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(resetFormByTab[activeTab]);
  };
  //Filter items based on search
  const filteredItems = tableData
    .filter((item) => {
      const query = search.toLowerCase().trim();

      if (!query) return true;

      if (activeTab === "server") {
        return (
          (item.device_label || "").toLowerCase().includes(query) ||
          (item.model || "").toLowerCase().includes(query) ||
          (item.server_owner_dept || "").toLowerCase().includes(query) ||
          (item.server_admin_name || "").toLowerCase().includes(query) ||
          (item.serial_number || "").toLowerCase().includes(query) ||
          (item.uba_tag_number || "").toLowerCase().includes(query)
        );
      }

      if (activeTab === "power" || activeTab === "cooling") {
        return (
          (item.device_name || "").toLowerCase().includes(query) ||
          (item.device_type || "").toLowerCase().includes(query) ||
          (item.device_model || "").toLowerCase().includes(query) ||
          (item.device_location || "").toLowerCase().includes(query) ||
          (item.serial_number || "").toLowerCase().includes(query)
        );
      }

      return true;
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

  const fetchData = async () => {
    const tableName = tableMap[activeTab];

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setTableData(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  return (
    <div className="wholeBody">
      <AssetTypeToggle
        value={activeTab}
        onChange={(val) => setActiveTab(val)}
      />
      <InventoryForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editingId={editingId}
        handleCancelEdit={handleCancelEdit}
        formRef={formRef}
        activeTab={activeTab}
        fetchData={fetchData}
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
        <p className="totalItems">Total Devices: {filteredItems.length}</p>

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
              Export ({activeTab})
            </button>
            <div className="dropdown-content">
              <button onClick={() => exportData({ format: "excel" })}>
                📄 Export to Excel
              </button>

              <button onClick={() => exportData({ format: "pdf" })}>
                📄 Export to PDF
              </button>

              <button onClick={() => setShowExportModal(true)}>
                Custom Export
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
          activeTab={activeTab}
          data={tableData}
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
        activeTab={activeTab}
      />
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedColumns={selectedColumns}
        activeTab={activeTab}
        setSelectedColumns={setSelectedColumns}
        onExport={(format) => {
          exportData({
            format,
            selectedColumns,
          });
          setShowExportModal(false);
        }}
      />
    </div>
  );
}

export default Dc_Inventory;
