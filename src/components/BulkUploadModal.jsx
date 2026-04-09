import "../css/BulkUploadModal.css";
import { Upload, FileSpreadsheet } from "lucide-react";
function BulkUploadModal({
  show,
  previewData,
  uploading,
  handleExcelPreview,
  handleConfirmUpload,
  handleClose,
  activeTab,
}) {
  if (!show) return null;

  const previewColumns = {
    server: [
      "device_label",
      "model",
      "rack_no",
      "new_rack_no",
      "serial_number",
      "uba_tag_number",
      "deployment_date",
    ],
    power: [
      "device_name",
      "device_type",
      "device_model",
      "device_location",
      "serial_number",
      "uba_tag",
    ],
    cooling: [
      "device_name",
      "device_type",
      "device_model",
      "device_location",
      "serial_number",
      "uba_tag",
    ],
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>
          <Upload size={17} color="#D91E27" /> Bulk Upload Inventory
        </h3>
        <p style={{ textAlign: "left" }}>
          Upload an Excel file containing multiple device records. Download the
          template to ensure proper formatting.
        </p>

        <div className="downloadTemplate">
          <FileSpreadsheet />

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
                  <tr>
                    {previewColumns[activeTab].map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {previewColumns[activeTab].map((col) => (
                        <td key={col}>{row[col]}</td>
                      ))}
                      <td>
                        {row._isValid === false ? (
                          <span style={{ color: "red", fontSize: "12px" }}>
                            {row._errors?.join(", ")}
                          </span>
                        ) : (
                          <span style={{ color: "green", fontSize: "12px" }}>
                            Valid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="modal-actions">
          <button className="close-btn" onClick={handleClose}>
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
            {uploading ? "Saving..." : `Upload ${previewData.length} Devices`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkUploadModal;
