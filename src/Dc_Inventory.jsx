import { useState, useEffect } from "react";
import { supabase } from "./assets/Supabase";
import "./css/Dc_Inventory.css";

function Dc_Inventory() {
  // console.log("SUPABASE CLIENT:", supabase);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    device_label: "",
    model: "",
    active: "Active",
    rack_no: "",
    new_rack_no: "",
    server_owner_dept: "",
    server_admin_name: "",
    serial_number: "",
    uba_tag_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      // UPDATE existing item
      const { error } = await supabase
        .from("dc_inventory")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        console.error("UPDATE ERROR:", error);
        alert(error.message);
        return;
      }

      // Update item in state
      setItems(
        items.map((item) =>
          item.id === editingId ? { ...item, ...formData } : item,
        ),
      );
      setEditingId(null); // stop editing
    } else {
      // INSERT new item
      const { error } = await supabase.from("dc_inventory").insert([formData]);
      if (error) {
        console.error("INSERT ERROR:", error);
        alert(error.message);
        return;
      }

      const { data } = await supabase
        .from("dc_inventory")
        .select("*")
        .order("id", { ascending: true });

      setItems(data);
    }

    // Reset form
    setFormData({
      device_label: "",
      model: "",
      active: "Active",
      rack_no: "",
      new_rack_no: "",
      server_owner_dept: "",
      server_admin_name: "",
      serial_number: "",
      uba_tag_number: "",
    });
  };

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("dc_inventory")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("SUPABASE ERROR:", error);
      } else {
        console.log("SUPABASE DATA:", data);
        setItems(data);
      }
    };

    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;

    const { error } = await supabase.from("dc_inventory").delete().eq("id", id);

    if (error) {
      console.error("DELETE ERROR:", error);
      alert(error.message);
      return;
    }

    // Remove deleted item from state
    setItems(items.filter((item) => item.id !== id));
  };
  const handleEdit = (item) => {
    setFormData({
      device_label: item.device_label,
      model: item.model,
      active: item.active,
      rack_no: item.rack_no,
      new_rack_no: item.new_rack_no,
      server_owner_dept: item.server_owner_dept,
      server_admin_name: item.server_admin_name,
      serial_number: item.serial_number,
      uba_tag_number: item.uba_tag_number,
    });
    setEditingId(item.id);
  };
  //Filter items based on search
  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.device_label.toLowerCase().includes(query) ||
      item.model.toLowerCase().includes(query) ||
      item.server_owner_dept.toLowerCase().includes(query) ||
      item.uba_tag_number.toLowerCase().includes(query)
    );
  });
  //Paginate filtered items

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div>
      <p className="addNew">Add New Device</p>
      <form onSubmit={handleSubmit} className="inventory-form">
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

        <button type="submit" className="submit-btn">
          {editingId ? "Update Device" : "Add Device"}
        </button>
      </form>

      <p className="inventoryList">Inventory List</p>
      <p className="totalItems">Total Devices: {currentItems.length}</p>

      <input
        type="text"
        placeholder="Search by Device, Model, or Owner..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "16px",
          padding: "8px 12px",
          width: "97%",
          height: "30px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <div style={{ overflowX: "auto", width: "100%" }}>
        <table className="dcTable">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Device / Label</th>
              <th>Model</th>
              <th>Active</th>
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
            {currentItems.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td> {/* S/N */}
                <td data-label="Device / Label">{item.device_label}</td>
                <td data-label="Model">{item.model}</td>
                <td data-label="Active">{item.active}</td>
                <td data-label="Rack No.">{item.rack_no}</td>
                <td data-label="New Rack No.">{item.new_rack_no}</td>
                <td data-label="Server Owner Dept.">
                  {item.server_owner_dept}
                </td>
                <td data-label="Server Admin Name">{item.server_admin_name}</td>
                <td data-label="Serial Number">{item.serial_number}</td>
                <td data-label="UBA Tag Number">{item.uba_tag_number}</td>
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
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "16px" }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ marginRight: "8px" }}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                marginRight: "4px",
                fontWeight: currentPage === i + 1 ? "bold" : "normal",
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            style={{ marginLeft: "8px" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// const thStyle = {
//   border: "1px solid #E5E6EA",
//   padding: "8px",
//   background: "#F9FBFA",
//   textAlign: "left",
// };

// const tdStyle = {
//   border: "1px solid #ddd",
//   padding: "8px",
//   background: "#FFFFFF",
// };

export default Dc_Inventory;
