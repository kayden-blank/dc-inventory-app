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
  loading,
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
        loading={loading}
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
        loading={loading}
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
        loading={loading}
      />
    );
  }
}

export default InventoryForm;
