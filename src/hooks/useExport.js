import * as XLSX from "xlsx";
import { EXPORT_COLUMNS } from "../constants/columns";

export const useExport = (activeTab, tableData, filteredItems) => {
  const exportFilteredToExcel = () => {
    if (!filteredItems.length) return;

    const columns = EXPORT_COLUMNS[activeTab];

    const mapped = filteredItems.map((item) => {
      const obj = {};
      Object.entries(columns).forEach(([key, label]) => {
        obj[label] = item[key] ?? "";
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(mapped);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered");

    XLSX.writeFile(wb, `${activeTab}_filtered.xlsx`);
  };

  const exportData = async ({ format = "excel", selectedColumns = [] }) => {
    if (!tableData || tableData.length === 0) {
      alert("No data to export");
      return;
    }

    const allColumns = Object.entries(EXPORT_COLUMNS[activeTab]).map(
      ([key, label]) => ({ key, label }),
    );

    const columnsToUse =
      selectedColumns.length > 0
        ? allColumns.filter((col) => selectedColumns.includes(col.key))
        : allColumns;

    const mapped = tableData.map((item) => {
      const obj = {};
      columnsToUse.forEach((col) => {
        obj[col.label] = item[col.key];
      });
      return obj;
    });

    // =========================
    // 📊 EXCEL EXPORT
    // =========================
    if (format === "excel") {
      const ws = XLSX.utils.json_to_sheet(mapped);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");

      XLSX.writeFile(wb, `${activeTab}.xlsx`);
    }

    // =========================
    // 📄 PDF EXPORT
    // =========================
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

      doc.save(`${activeTab}.pdf`);
    }
  };

  return { exportData, exportFilteredToExcel };
};
