import React from "react";

function InventoryTable({ currentItems, handleEdit, handleDelete }) {
  return (
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
                <td>{index + 1}</td>
                <td>{item.device_label}</td>
                <td>{item.model}</td>
                <td>{item.status}</td>
                <td>{item.rack_no}</td>
                <td>{item.new_rack_no}</td>
                <td>{item.server_owner_dept}</td>
                <td>{item.server_admin_name}</td>
                <td>{item.serial_number}</td>
                <td>{item.uba_tag_number}</td>
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
              <td colSpan={11} style={{ textAlign: "center" }}>
                No devices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
