import React from "react";
import { Pencil, Trash2 } from "lucide-react";
function InventoryTable({ currentItems, handleEdit, handleDelete, activeTab }) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table className="dcTable">
        <thead>
          <tr>
            <th>S/N</th>
            {activeTab === "server" && (
              <>
                <th>Device / Label</th>
                <th>Model</th>
                <th>Status</th>
                <th>Rack No.</th>
                <th>New Rack No.</th>
                <th>Server Owner Dept.</th>
                <th>Server Admin Name</th>
                <th>Serial Number</th>
                <th>UBA Tag Number</th>
                <th>Deployment Date</th>
              </>
            )}

            {activeTab === "power" && (
              <>
                <th>Device Name</th>
                <th>Type</th>
                <th>Model</th>
                <th>Location</th>
                <th>Status</th>
                <th>Serial Number</th>
              </>
            )}

            {activeTab === "cooling" && (
              <>
                <th>Device Name</th>
                <th>Type</th>
                <th>Model</th>
                <th>Location</th>
                <th>Year Procured</th>
                <th>Year Installed</th>
                <th>Status</th>
                <th>Serial Number</th>
              </>
            )}
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                {activeTab === "server" && (
                  <>
                    <td>{item.device_label}</td>
                    <td>{item.model}</td>
                    <td>{item.status}</td>
                    <td>{item.rack_no}</td>
                    <td>{item.new_rack_no}</td>
                    <td>{item.server_owner_dept}</td>
                    <td>{item.server_admin_name}</td>
                    <td>{item.serial_number}</td>
                    <td>{item.uba_tag_number}</td>
                    <td>{item.deployment_date || "N/A"}</td>
                  </>
                )}

                {activeTab === "power" && (
                  <>
                    <td>{item.device_name}</td>
                    <td>{item.device_type}</td>
                    <td>{item.device_model}</td>
                    <td>{item.device_location}</td>
                    <td>{item.condition_status}</td>
                    <td>{item.serial_number}</td>
                  </>
                )}

                {activeTab === "cooling" && (
                  <>
                    <td>{item.device_name}</td>
                    <td>{item.device_type}</td>
                    <td>{item.device_model}</td>
                    <td>{item.device_location}</td>
                    <td>{item.year_procured}</td>
                    <td>{item.year_installed}</td>
                    <td>{item.status}</td>
                    <td>{item.serial_number}</td>
                  </>
                )}
                <td>
                  <span className="editBtn" onClick={() => handleEdit(item)}>
                    <Pencil size={18} />
                  </span>
                  <span
                    className="deleteBtn"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={18} />
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
