import React from "react";
import { BeatLoader } from "react-spinners";

const PowerForm = ({
  formData,
  handleChange,
  handleSubmit,
  editingId,
  handleCancelEdit,
  formRef,
  loading,
}) => {
  return (
    <>
      <p className="addNew">
        {editingId ? "Edit Power Device" : "Add New Power Device"}
      </p>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(formData);
        }}
        className="inventory-form"
      >
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
            <label>Operational Status</label>
            <select
              name="operational_status"
              value={formData.operational_status}
              onChange={handleChange}
            >
              <option value="Operational">Operational</option>
              <option value="Non-Operational">Non-Operational</option>
            </select>
          </div>

          <div className="form_content">
            <label>Condition Status:</label>
            <select
              name="condition_status"
              value={formData.condition_status}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select Condition Status
              </option>
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
              placeholder="UBA Tag "
              value={formData.uba_tag}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit" className="submit-btn">
            {loading ? (
              <BeatLoader color="white" size={10} />
            ) : editingId ? (
              "Update Power Device"
            ) : (
              "Add Power Device"
            )}
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

export default PowerForm;
