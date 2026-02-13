function BulkUploadModal({
  show,
  previewData,
  uploading,
  handleExcelPreview,
  handleConfirmUpload,
  handleClose,
}) {
  if (!show) return null;

  return (
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
          Upload an Excel file containing multiple device records. Download the
          template to ensure proper formatting.
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
            {uploading ? "Saving..." : `Upload ${previewData.length} Devices`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkUploadModal;
