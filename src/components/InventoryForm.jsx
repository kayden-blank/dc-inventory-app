import React from "react";

function InventoryForm({
  formData,
  handleChange,
  handleSubmit,
  editingId,
  handleCancelEdit,
  formRef,
}) {
  return (
    <>
      <p className="addNew">{editingId ? "Edit Device" : "Add New Device"}</p>
      <form ref={formRef} onSubmit={handleSubmit} className="inventory-form">
        <div className="form-grid">
          <div className="form_content">
            <label>Device / Label:</label>
            <input
              name="device_label"
              placeholder="Device / Label"
              value={formData.device_label}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form_content">
            <label>Model:</label>
            <input
              name="model"
              placeholder="Model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form_content">
            <label>Status:</label>
            <select
              name="active"
              value={formData.active}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="ShutDown">Shut Down</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>

          <div className="form_content">
            <label>Rack No:</label>
            <input
              name="rack_no"
              placeholder="Rack No."
              value={formData.rack_no}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>New Rack No:</label>
            <input
              name="new_rack_no"
              placeholder="New Rack No."
              value={formData.new_rack_no}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Server Owner Dept.:</label>
            <input
              name="server_owner_dept"
              placeholder="Server Owner Dept."
              value={formData.server_owner_dept}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Server Admin Name:</label>
            <input
              name="server_admin_name"
              placeholder="Server Admin Name"
              value={formData.server_admin_name}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Serial Number:</label>
            <input
              name="serial_number"
              placeholder="Serial Number"
              value={formData.serial_number}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>UBA Tag Number:</label>

            <input
              name="uba_tag_number"
              placeholder="UBA Tag Number"
              value={formData.uba_tag_number}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit" className="submit-btn">
            {editingId ? "Update Device" : "Add Device"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}

export default InventoryForm;
