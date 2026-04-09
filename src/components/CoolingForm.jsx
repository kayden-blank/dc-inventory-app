import React from "react";

const CoolingForm = ({
  formData,
  handleChange,
  handleSubmit,
  editingId,
  handleCancelEdit,
  formRef,
}) => {
  return (
    <>
      <p className="addNew">
        {editingId ? "Edit Cooling Device" : "Add New Cooling Device"}
      </p>
      <form ref={formRef} onSubmit={handleSubmit} className="inventory-form">
        <div className="form-grid">
          <div className="form_content">
            <label>Device Name:</label>
            <input
              name="device_name"
              placeholder="Device Name"
              value={formData.device_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form_content">
            <label>Device Model:</label>
            <input
              name="device_model"
              placeholder="Device Model"
              value={formData.device_model}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form_content">
            <label>Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="ShutDown">Shut Down</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>

          <div className="form_content">
            <label>Device Location:</label>
            <input
              name="device_location"
              placeholder="Device Location"
              value={formData.device_location}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Year Procured:</label>
            <input
              name="year_procured"
              placeholder="Year Procured"
              value={formData.year_procured}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Year Installed:</label>
            <input
              name="year_installed"
              placeholder="Year Installed"
              value={formData.year_installed}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Device Type:</label>
            <input
              name="device_type"
              placeholder="Device Type"
              value={formData.device_type}
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
              name="uba_tag"
              placeholder="UBA Tag Number"
              value={formData.uba_tag}
              onChange={handleChange}
            />
          </div>

          <div className="form_content">
            <label>Remark:</label>
            <input
              name="remarks"
              placeholder="Remark"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit" className="submit-btn">
            {editingId ? "Update Cooling Device" : "Add Cooling Device"}
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
};

export default CoolingForm;
