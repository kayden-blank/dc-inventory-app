import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "./lib/supabaseClient.jsx";
import "./css/DcInventory.css";
import * as XLSX from "xlsx";
import InventoryTable from "./components/InventoryTable.jsx";
import InventoryForm from "./components/InventoryForm.jsx";
import BulkUploadModal from "./components/BulkUploadModal.jsx";
import SearchBar from "./components/SearchBar.jsx";
import Pagination from "./components/Pagination.jsx";
import ExportModal from "./components/ExportModal.jsx";
import AssetTypeToggle from "./components/AssetTypeToggle.jsx";
import { EXPORT_COLUMNS, IMPORT_COLUMNS } from "./constants/columns.js";
import { Upload, Download } from "lucide-react";

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
  //would be nice to have a dynamic form that uses formMap to generate fields based on activeTab, but for now we'll keep them separate for simplicity
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

  // console.log("Current formData:", formData);

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

    // Get the columns for the current tab
    const columns = EXPORT_COLUMNS[activeTab];

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
    // ✅ 1. Check file extension
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Only .xlsx files are accepted");
      return;
    }

    // ✅ 2. Check MIME type (extra protection)
    const validMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validMimeTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a valid Excel file.");
      return;
    }

    // ✅ 3. Check file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (file.size > MAX_SIZE) {
      alert("File size exceeds 5MB limit");
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const mapping = IMPORT_COLUMNS[activeTab];

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
    format = "excel",
    filterActive = false,
    selectedColumns = null,
  }) => {
    try {
      let data;

      // ✅ Use already available data
      data = filterActive ? filteredItems : tableData;

      // ✅ Single check is enough
      if (!data || data.length === 0) {
        alert("No data to export");
        return;
      }

      const allColumnsArray = Object.entries(EXPORT_COLUMNS[activeTab]).map(
        ([key, label]) => ({ key, label }),
      );

      const columnsToUse =
        selectedColumns && selectedColumns.length > 0
          ? allColumnsArray.filter((col) => selectedColumns.includes(col.key))
          : allColumnsArray;

      const mapped = data.map((item) => {
        const obj = {};
        columnsToUse.forEach((col) => {
          obj[col.label] = item[col.key];
        });
        return obj;
      });

      // 📊 Excel Export
      if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(mapped);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

        XLSX.writeFile(workbook, `${activeTab}_inventory.xlsx`);
      }

      // 📄 PDF Export
      if (format === "pdf") {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;

        const doc = new jsPDF({ orientation: "landscape" });

        const headers = [columnsToUse.map((col) => col.label)];
        const rows = mapped.map((row) => Object.values(row));

        autoTable(doc, {
          head: headers,
          body: rows,
          styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: "linebreak",
          },
          tableWidth: "auto",
          headStyles: {
            fillColor: [217, 32, 41],
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
  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();
    return tableData
      .filter((item) => {
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
  }, [tableData, search, activeTab]);
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

  const fetchData = useCallback(async () => {
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
  }, [activeTab]); // ✅ include any other state used inside

  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ include fetchData

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
            <Upload size={17} /> Bulk Upload
          </button>

          {/* Export Dropdown */}
          <div className="dropdown">
            <button className="selectbtn">
              <Download size={17} /> Export ({activeTab})
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
