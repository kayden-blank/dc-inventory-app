import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { TABLE_MAPS } from "../constants/columns.js";

export const useInventory = (activeTab, formMap, resetFormByTab) => {
  const [tableData, setTableData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(resetFormByTab[activeTab]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const tableName = TABLE_MAPS[activeTab];
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTableData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setFormData(resetFormByTab[activeTab]);
    setEditingId(null);
  }, [activeTab, resetFormByTab]);

  const handleSubmit = async () => {
    const tableName = TABLE_MAPS[activeTab];
    try {
      setLoading(true);
      setError(null);
      const filteredData = {};
      formMap[activeTab].forEach((key) => {
        filteredData[key] = formData[key] ?? null; // only include valid columns
      });
      if (editingId) {
        const { error } = await supabase
          .from(tableName)
          .update(filteredData)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from(tableName).insert([filteredData]);

        if (error) throw error;
      }

      await fetchData();
      setEditingId(null);
      setFormData(resetFormByTab[activeTab]);
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert("Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const tableName = TABLE_MAPS[activeTab];
    if (!window.confirm("Are you sure?")) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.from(tableName).delete().eq("id", id);

      if (error) throw error;

      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    const newFormData = {};
    formMap[activeTab].forEach((key) => {
      newFormData[key] = item[key] ?? "";
    });

    setFormData(newFormData);
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(resetFormByTab[activeTab]);
  };

  return {
    tableData,
    formData,
    setFormData,
    editingId,
    handleSubmit,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    fetchData,
    loading,
    error,
  };
};
