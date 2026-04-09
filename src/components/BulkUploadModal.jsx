import "../css/BulkUploadModal.css";
import { Upload, FileSpreadsheet, CircleCheck } from "lucide-react";
import { CircleLoader } from "react-spinners";

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
                <CircleCheck size={17} color="#01A63F" />{" "}
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
