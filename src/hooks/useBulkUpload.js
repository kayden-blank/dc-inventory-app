import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabaseClient";
import { IMPORT_COLUMNS, TABLE_MAPS } from "../constants/columns";

export const useBulkUpload = (activeTab, fetchData) => {
  const [previewData, setPreviewData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const validCount = validData.length;
  // =========================
  // 📥 PREVIEW EXCEL
  // =========================
  const handleExcelPreview = async (file) => {
    if (!file) return;

    // ✅ File validation
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Only .xlsx files are accepted");
      return;
    }

    const validMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validMimeTypes.includes(file.type)) {
      alert("Invalid file type");
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("File size exceeds 5MB");
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

        // ✅ Validation
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
          _rowNumber: index + 2,
        };
      });

      const validRows = mapped
        .filter((row) => row._isValid)
        .map(({ _isValid, _errors, _rowNumber, ...clean }) => clean);

      setPreviewData(mapped);
      setValidData(validRows);
    } catch (err) {
      console.error(err);
      alert("Failed to read Excel file");
    }
  };

  // =========================
  // 📤 UPLOAD TO DATABASE
  // =========================
  const handleConfirmUpload = async () => {
    if (!validData.length) {
      alert("No valid data to upload");
      return;
    }

    const tableName = TABLE_MAPS[activeTab];

    try {
      setUploading(true);

      const { error } = await supabase.from(tableName).insert(validData);

      if (error) throw error;

      alert(
        `Uploaded ${validData.length} records. ${
          previewData.length - validData.length
        } skipped.`,
      );

      // ✅ Reset state
      setPreviewData([]);
      setValidData([]);

      // ✅ Refresh table
      fetchData();
    } catch (err) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // 🔄 RESET (optional helper)
  // =========================
  const resetBulkUpload = () => {
    setPreviewData([]);
    setValidData([]);
    setUploading(false);
  };

  return {
    previewData,
    uploading,
    handleExcelPreview,
    handleConfirmUpload,
    resetBulkUpload,
    validCount,
  };
};
