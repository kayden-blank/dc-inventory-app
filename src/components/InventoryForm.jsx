import React from "react";
import ServerForm from "./ServerForm";
import PowerForm from "./PowerForm";
import CoolingForm from "./CoolingForm";

function InventoryForm({
  formData,
  handleChange,
  handleSubmit,
  editingId,
  handleCancelEdit,
  formRef,
  activeTab,
}) {
  if (activeTab === "server") {
    return (
      <ServerForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editingId={editingId}
        handleCancelEdit={handleCancelEdit}
        formRef={formRef}
      />
    );
  }

  if (activeTab === "power") {
    return (
      <PowerForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editingId={editingId}
        handleCancelEdit={handleCancelEdit}
        formRef={formRef}
      />
    );
  }

  if (activeTab === "cooling") {
    return (
      <CoolingForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editingId={editingId}
        handleCancelEdit={handleCancelEdit}
        formRef={formRef}
      />
    );
  }
}

export default InventoryForm;
