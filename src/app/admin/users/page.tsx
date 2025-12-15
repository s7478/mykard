"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import styles from "./users.module.css";
import { he } from "zod/v4/locales";

interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  city?: string;
  category?: string;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({
    email: "",
    fullName: "",
    phone: "",
    city: "",
    category: "",
    status: "",
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dummyUsers: User[] = [
    {
      id: "1",
      email: "alice@example.com",
      fullName: "Alice Johnson",
      phone: "+1 555-0101",
      city: "San Francisco",
      category: "Engineering",
      status: "active",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      email: "bob@example.com",
      fullName: "Bob Smith",
      phone: null,
      city: "New York",
      category: "Product",
      status: "inactive",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      email: "carol@example.com",
      fullName: "Carol Lee",
      phone: "+1 555-0103",
      city: "Austin",
      category: "Design",
      status: "blocked",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      email: "dan@example.com",
      fullName: "Dan Miller",
      phone: "+1 555-0104",
      city: "Seattle",
      category: "Engineering",
      status: "active",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "5",
      email: "eva@example.com",
      fullName: "Eva Brown",
      phone: "+1 555-0105",
      city: "Chicago",
      category: "Marketing",
      status: "inactive",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // ✅ Fetch users
  
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users");
        const data = await res.json();
      //  console.log(data);
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok && data.success) {
        const list = (data.categories || [])
          .filter((c: any) => c.isActive) // Only show active categories
          .map((c: any) => c.name)
          .sort((a: string, b: string) => a.localeCompare(b));
        setCategories(list);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    } finally {
      setLoadingCategories(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  // ✅ Filter logic
  const filteredUsers = users.filter((user) => {
    const rawSearch = filters.search.toLowerCase().trim();
    const searchMatch =
      !rawSearch ||
      user.fullName?.toLowerCase().includes(rawSearch) ||
      user.email?.toLowerCase().includes(rawSearch) ||
      (user.phone && user.phone.toLowerCase().includes(rawSearch)) ||
      (user.city && user.city.toLowerCase().includes(rawSearch));

    if (!searchMatch) return false;

    if (filters.status === "most-recent") {
      const userDate = new Date(user.createdAt);
      const recentThreshold = new Date();
      recentThreshold.setDate(recentThreshold.getDate() - 7);
      return userDate >= recentThreshold;
    }

    if (filters.status === "active")
      return user.status === "active";
    if (filters.status === "inactive")
      return user.status === "inactive";
    if (filters.status === "suspended")
      return user.status === "blocked";

    return true;
  });

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const allVisibleSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((user) => selectedUserIds.includes(user.id));

  const toggleSelectAllVisible = () => {
    setSelectedUserIds((prev) => {
      if (allVisibleSelected) {
        const visibleIds = new Set(filteredUsers.map((u) => u.id));
        return prev.filter((id) => !visibleIds.has(id));
      }
      const newIds = new Set(prev);
      filteredUsers.forEach((u) => newIds.add(u.id));
      return Array.from(newIds);
    });
  };

  // ✅ Actions (Edit / Delete / More)
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || "",
      city: user.city || "",
      category: user.category || "",
      status: user.status || ""
    });
    setShowPasswordFields(false);
    setPasswords({ password: "", confirm: "" });
    setErrorMessage("");
  };
  
  const handleDelete = (id: string) => setDeletingUser(id);

  const handleDeleteSelected = () => {
    if (selectedUserIds.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    const idsToDelete = [...selectedUserIds];

    try {
      for (const id of idsToDelete) {
        try {
          const res = await fetch(`/api/admin/manage/users/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: id }),
          });
          const data = await res.json();
          if (!res.ok) {
            console.error("Bulk delete failed for user", id, data);
          }
        } catch (e) {
          console.error("Bulk delete error for user", id, e);
        }
      }

      setUsers((prev) => prev.filter((user) => !idsToDelete.includes(user.id)));
      setSelectedUserIds([]);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    } finally {
      setShowBulkDeleteConfirm(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    try {
      const res = await fetch(`/api/admin/manage/users/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deletingUser }),
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      setUsers(users.filter(user => user.id !== deletingUser));
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingUser(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setErrorMessage("");
    
    if (showPasswordFields) {
      if (!passwords.password || !passwords.confirm) {
        setErrorMessage("Please enter and confirm the new password.");
        return;
      }
      if (passwords.password !== passwords.confirm) {
        setErrorMessage("Passwords do not match.");
        return;
      }
      if (passwords.password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }
    }

    try {
      setUpdateLoading(true);
      const payload: any = {
        id: editingUser.id,
        fullName: editForm.fullName,
        phone: editForm.phone,
        city: editForm.city,
        category: editForm.category,
        status: editForm.status,
      };
      
      const res = await fetch(`/api/admin/manage/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          payload, 
          passwords: showPasswordFields ? passwords.password : null 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }
      
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...data.user }
          : user
      ));
      setEditingUser(null);
      setShowPasswordFields(false);
      setPasswords({ password: "", confirm: "" });
    } catch (error: any) {
      console.error("Update failed:", error);
      setErrorMessage(error.message || "Failed to update user. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <h1>User Management</h1>
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{users.length}</div>
            <div className={styles.statLabel}>Total Users</div>
          </div>
        </div>
      </div>

      {/* ===== Filters ===== */}
      <div className={styles.filterCard}>
        <div className={styles.filterSearch}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />
        </div>

        <div className={styles.filterActions}>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className={styles.filterSelect}
          >
            <option value="all">All Users</option>
            <option value="most-recent">Most Recent</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <button className={styles.filterBtn}>
            <Filter className={styles.filterIcon} />
            Apply
          </button>
        </div>
      </div>

      {/* ===== Loading / Empty ===== */}
      {loading ? (
        <p className={styles.loadingText}>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p className={styles.loadingText}>No users found.</p>
      ) : (
        <>
          {/* ===== Desktop Table ===== */}
          <div className={styles.tableContainer}>
            <div
              style={{
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className={styles.deleteBtn}
                disabled={selectedUserIds.length === 0}
                onClick={handleDeleteSelected}
              >
                Delete Selected
              </button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                    />
                  </th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                      />
                    </td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || "N/A"}</td>
                    <td>{user.city || "N/A"}</td>
                    <td>{user.category || "N/A"}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          user.status === "active"
                            ? styles.active
                            : user.status === "inactive"
                            ? styles.inactive
                            : styles.blocked
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionBtns}>
                        <Edit
                          className={styles.editIcon}
                          onClick={() => handleEdit(user)}
                        />
                        <Trash2
                          className={styles.deleteIcon}
                          onClick={() => handleDelete(user.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== Mobile View ===== */}
          <div className={styles.mobileList}>
            {filteredUsers.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userCardTop}>
                  <div>
                    <h3>{user.fullName}</h3>
                    <p>{user.email}</p>
                    <p>{user.phone || "N/A"}</p>
                    <p>
                      <strong>City:</strong> {user.city}
                    </p>
                    <p>
                      <strong>Category:</strong> {user.category}
                    </p>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${
                      user.status === "active"
                        ? styles.active
                        : user.status === "inactive"
                        ? styles.inactive
                        : styles.blocked
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className={styles.userCardBottom}>
                  <p className={styles.createdDate}>
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <div className={styles.mobileActions}>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                    />
                    <Edit
                      className={styles.editIcon}
                      onClick={() => handleEdit(user)}
                    />
                    <Trash2
                      className={styles.deleteIcon}
                      onClick={() => handleDelete(user.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Edit Modal */}
      {editingUser && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Edit User</h2>
            {errorMessage && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleEditSubmit} className={styles.editForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label> Full Name</label>
                  <input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label> Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label> Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label> City</label>
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label> Category</label>
                  {loadingCategories ? (
                    <div style={{fontSize:'0.85rem', color:'#666'}}>Loading categories...</div>
                  ) : (
                    <select
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {(() => {
                        // Ensure current category appears even if not in list
                        const current = editForm.category;
                        const options = categories.slice();
                        if (current && !options.includes(current)) options.unshift(current);
                        return options.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ));
                      })()}
                    </select>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label> Status</label>
                  <select
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              {showPasswordFields && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label> New Password</label>
                    <input
                      type="password"
                      value={passwords.password}
                      onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label> Confirm Password</label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowPasswordFields((p) => !p)}
                >
                  {showPasswordFields ? "Hide Password" : "Change Password"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={updateLoading}>
                  {updateLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this user?</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setDeletingUser(null)}
              >
                Cancel
              </button>
              <button 
                className={styles.deleteBtn}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete the user?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowBulkDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.deleteBtn}
                onClick={confirmBulkDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
