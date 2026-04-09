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
import { useInventory } from "./hooks/useInventory.js";
import { useExport } from "./hooks/useExport.js";
import { useBulkUpload } from "./hooks/useBulkUpload.js";

function Dc_Inventory() {
  // console.log("SUPABASE CLIENT:", supabase);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [activeTab, setActiveTab] = useState("server"); // default
  const tableMap = {
    server: "dc_inventory",
    power: "power_devices",
    cooling: "cooling_devices",
  };
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

  const {
    tableData,
    formData,
    setFormData,
    editingId,
    handleSubmit,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    fetchData,
    loading,
    error,
  } = useInventory(activeTab, formMap, resetFormByTab);

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
  const { exportData, exportFilteredToExcel } = useExport(
    activeTab,
    tableData,
    filteredItems,
    EXPORT_COLUMNS,
  );
  const {
    previewData,
    uploading,
    handleExcelPreview,
    handleConfirmUpload,
    resetBulkUpload,
  } = useBulkUpload(activeTab, tableMap, fetchData);
  const [validData, setValidData] = useState([]);
  const formRef = useRef(null);

  //would be nice to have a dynamic form that uses formMap to generate fields based on activeTab, but for now we'll keep them separate for simplicity

  // console.log("Current formData:", formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || null, // Convert empty strings to null for optional fields
    }));
  };

  const handleCloseBulkModal = () => {
    setShowBulkModal(false);
    resetBulkUpload();
  };

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

  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ include fetchData

  return (
    <div className="wholeBody">
      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
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
        loading={loading}
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
        loading={loading}
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
