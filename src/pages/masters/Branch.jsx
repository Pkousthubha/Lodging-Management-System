// src/pages/masters/Branch.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchHotels,
  fetchBranchesByHotel,
  saveBranch,
  toggleBranchActive,
  deleteBranch,
} from "../../services/hotelService";

import {
  showSuccessToast,
  showErrorToast,
  TOAST_POSITIONS,
} from "../../utils/toast";

import { validateValues } from "../../utils/Validation";
import { buildRules } from "../../utils/ValidationHelper";
import { useFieldErrors } from "../../hooks/useFieldErrors";

import SmartTable from "../../components/SmartTable";

import { USE_DUMMY_DATA, DUMMY_HOTELS } from "../../data/hotelDummyData";

const EMPTY_BRANCH = {
  BranchId: 0,
  HotelId: 0,
  Code: "",
  Name: "",
  AddressLine1: "",
  City: "",
  Phone: "",
  Email: "",
  IsActive: true,
};

const TOAST_POS = TOAST_POSITIONS.TOP_CENTER;

export default function BranchMaster() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  const [branches, setBranches] = useState([]);
  const [branchStatusFilter, setBranchStatusFilter] = useState("ACTIVE");

  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(EMPTY_BRANCH);
  const [savingBranch, setSavingBranch] = useState(false);

  const {
    errors: branchErrors,
    setErrors: setBranchErrors,
    bindField: bindBranchField,
  } = useFieldErrors();

  // --------------------------
  // Validation Rules
  // --------------------------
  const branchRules = buildRules({
    branchCode: { required: "Enter the Branch Code." },
    branchName: { required: "Enter the Branch Name." },
    branchEmail: { type: "email" },
  });

  const runBranchValidation = () => {
    const values = {
      branchCode: editingBranch.Code,
      branchName: editingBranch.Name,
      branchEmail: editingBranch.Email,
    };

    const newErrors = validateValues(values, branchRules);

    if (!editingBranch.HotelId || editingBranch.HotelId <= 0) {
      newErrors.branchCode = newErrors.branchCode || "Select a Hotel.";
    }

    if (
      editingBranch.Code &&
      editingBranch.HotelId &&
      branches.some(
        (x) =>
          x.HotelId === editingBranch.HotelId &&
          x.BranchId !== editingBranch.BranchId &&
          x.Code?.toLowerCase() === editingBranch.Code.toLowerCase()
      )
    ) {
      newErrors.branchCode =
        "Branch code already exists for this hotel. Use a different code.";
    }

    setBranchErrors(newErrors);

    const keys = Object.keys(newErrors);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const firstMessage = newErrors[firstKey];
      showErrorToast(firstMessage, { position: TOAST_POS });
      return false;
    }
    return true;
  };

  // -----------------------------
  // load data
  // -----------------------------
  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    if (!selectedHotelId) {
      setBranches([]);
      return;
    }
    loadBranches(selectedHotelId);
  }, [selectedHotelId]);

  const loadHotels = async () => {
    if (USE_DUMMY_DATA) {
      setHotels(DUMMY_HOTELS);
      if (!selectedHotelId && DUMMY_HOTELS.length > 0) {
        setSelectedHotelId(DUMMY_HOTELS[0].HotelId);
      }
      return;
    }

    try {
      setLoadingHotels(true);
      const data = await fetchHotels();
      const list = Array.isArray(data) ? data : [];
      setHotels(list);
      if (!selectedHotelId && list.length > 0) {
        setSelectedHotelId(list[0].HotelId);
      }
    } catch (err) {
      console.error("Error loading hotels", err);
      showErrorToast("Failed to load hotels.", { position: TOAST_POS });
    } finally {
      setLoadingHotels(false);
    }
  };

  const loadBranches = async (hotelId) => {
    if (USE_DUMMY_DATA) {
      const list = DUMMY_BRANCHES.filter((b) => b.HotelId === hotelId);
      setBranches(list);
      return;
    }

    try {
      setLoadingBranches(true);
      const data = await fetchBranchesByHotel(hotelId);
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading branches", err);
      showErrorToast("Failed to load branches.", { position: TOAST_POS });
    } finally {
      setLoadingBranches(false);
    }
  };

  const selectedHotel = useMemo(
    () => hotels.find((h) => h.HotelId === selectedHotelId) || null,
    [hotels, selectedHotelId]
  );

  // -----------------------------
  // helpers
  // -----------------------------
  const statusFilteredBranches = useMemo(() => {
    return branches.filter((b) => {
      if (branchStatusFilter === "ACTIVE" && !b.IsActive) return false;
      if (branchStatusFilter === "INACTIVE" && b.IsActive) return false;
      return true;
    });
  }, [branches, branchStatusFilter]);

  const renderStatusBadge = (isActive) => {
    const cls = "badge rounded-pill px-3 py-1";
    return isActive ? (
      <span className={`${cls} bg-success-subtle text-success`}>Active</span>
    ) : (
      <span className={`${cls} bg-secondary-subtle text-muted`}>Inactive</span>
    );
  };

  const openCreateBranchModal = () => {
    if (!selectedHotel) {
      showErrorToast("Please select a hotel first.", { position: TOAST_POS });
      return;
    }
    setEditingBranch({
      ...EMPTY_BRANCH,
      BranchId: 0,
      HotelId: selectedHotel.HotelId,
      IsActive: true,
    });
    setBranchErrors({});
    setBranchModalOpen(true);
  };

  const openEditBranchModal = (branch) => {
    setEditingBranch({ ...branch });
    setBranchErrors({});
    setBranchModalOpen(true);
  };

  const closeBranchModal = () => {
    if (savingBranch) return;
    setBranchModalOpen(false);
    setEditingBranch(EMPTY_BRANCH);
  };

  const handleBranchFieldChange = (field, value) => {
    setEditingBranch((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleBranchActive = async (branch) => {
    const newValue = !branch.IsActive;

    if (USE_DUMMY_DATA) {
      setBranches((prev) =>
        prev.map((b) =>
          b.BranchId === branch.BranchId ? { ...b, IsActive: newValue } : b
        )
      );
      showSuccessToast(
        newValue ? "Branch activated successfully." : "Branch deactivated.",
        { position: TOAST_POS }
      );
      return;
    }

    try {
      await toggleBranchActive(branch.BranchId, newValue);
      setBranches((prev) =>
        prev.map((b) =>
          b.BranchId === branch.BranchId ? { ...b, IsActive: newValue } : b
        )
      );
      showSuccessToast(
        newValue ? "Branch activated successfully." : "Branch deactivated.",
        { position: TOAST_POS }
      );
    } catch (err) {
      console.error("Failed to change branch status", err);
      showErrorToast("Failed to change branch status.", {
        position: TOAST_POS,
      });
    }
  };

  const handleDeleteBranch = async (branch) => {
    const ok = window.confirm(
      `Delete branch "${branch.Name}" (${branch.Code})?`
    );
    if (!ok) return;

    if (USE_DUMMY_DATA) {
      setBranches((prev) =>
        prev.filter((b) => b.BranchId !== branch.BranchId)
      );
      showSuccessToast("Branch deleted successfully.", {
        position: TOAST_POS,
      });
      return;
    }

    try {
      await deleteBranch(branch.BranchId);
      setBranches((prev) =>
        prev.filter((b) => b.BranchId !== branch.BranchId)
      );
      showSuccessToast("Branch deleted successfully.", {
        position: TOAST_POS,
      });
    } catch (err) {
      console.error("Failed to delete branch", err);
      showErrorToast("Failed to delete branch.", {
        position: TOAST_POS,
      });
    }
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();

    if (savingBranch) return;
    if (!runBranchValidation()) return;

    try {
      setSavingBranch(true);

      if (USE_DUMMY_DATA) {
        let saved = { ...editingBranch };
        if (!saved.BranchId) {
          const maxId =
            branches.reduce(
              (max, b) => (b.BranchId > max ? b.BranchId : max),
              0
            ) || 0;
          saved.BranchId = maxId + 1;
        }

        setBranches((prev) => {
          const idx = prev.findIndex((b) => b.BranchId === saved.BranchId);
          if (idx === -1) return [...prev, saved];
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        });
      } else {
        const saved = await saveBranch(editingBranch);
        setBranches((prev) => {
          const idx = prev.findIndex((b) => b.BranchId === saved.BranchId);
          if (idx === -1) return [...prev, saved];
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        });
      }

      showSuccessToast("Branch saved successfully.", { position: TOAST_POS });
      closeBranchModal();
    } catch (err) {
      console.error("Failed to save branch", err);
      showErrorToast("Failed to save branch. Please try again.", {
        position: TOAST_POS,
      });
    } finally {
      setSavingBranch(false);
    }
  };

  // -----------------------------
  // table columns
  // -----------------------------
  const branchColumns = useMemo(
    () => [
      {
        key: "Actions",
        header: "Actions",
        sortable: false,
        filterable: false,
        width: "120px",
        render: (b) => (
          <div className="st-row-actions">
            <button
              type="button"
              className="btn btn-sm btn-link p-0 me-1"
              title="Edit"
              onClick={() => openEditBranchModal(b)}
            >
              ✏️
            </button>
            <button
              type="button"
              className="btn btn-sm btn-link p-0 me-1"
              title={b.IsActive ? "Deactivate" : "Activate"}
              onClick={() => handleToggleBranchActive(b)}
            >
              {b.IsActive ? "D" : "A"}
            </button>
            <div className="st-actions-dropdown">
              <button
                type="button"
                className="btn btn-sm btn-light rounded-circle st-actions-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  const menu = e.currentTarget.nextSibling;
                  if (menu) menu.classList.toggle("show");
                }}
              >
                ⋮
              </button>
              <div
                className="dropdown-menu st-actions-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => openEditBranchModal(b)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleToggleBranchActive(b)}
                >
                  {b.IsActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={() => handleDeleteBranch(b)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "Code",
        header: "Code",
        sortable: true,
        filterable: true,
        width: "120px",
        accessor: (b) => b.Code,
      },
      {
        key: "Name",
        header: "Name",
        sortable: true,
        filterable: true,
        accessor: (b) => b.Name,
      },
      {
        key: "City",
        header: "City",
        sortable: true,
        filterable: true,
        accessor: (b) => b.City,
      },
      {
        key: "Status",
        header: "Status",
        sortable: true,
        filterable: true,
        width: "110px",
        accessor: (b) => (b.IsActive ? "Active" : "Inactive"),
        render: (b) => renderStatusBadge(b.IsActive),
      },
    ],
    [] // stable
  );

  const bindBranchCode = bindBranchField("branchCode", (val) =>
    handleBranchFieldChange("Code", val)
  );
  const bindBranchName = bindBranchField("branchName", (val) =>
    handleBranchFieldChange("Name", val)
  );
  const bindBranchEmail = bindBranchField("branchEmail", (val) =>
    handleBranchFieldChange("Email", val)
  );

  // -----------------------------
  // render
  // -----------------------------
  return (
    <div className="container-fluid py-3">
      {/* header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h4 className="mb-1">Branches Master</h4>
          <p className="text-muted small mb-0">
            Maintain hotel branches / towers linked to each hotel.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={loadBranches.bind(null, selectedHotelId)}
            disabled={!selectedHotelId || loadingBranches}
          >
            ⟳ Reload
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={openCreateBranchModal}
            disabled={!selectedHotel}
          >
            ＋ Branch
          </button>
        </div>
      </div>

      <div className="card app-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="small fw-semibold">Hotel</span>
            <select
              className="form-select form-select-sm"
              style={{ minWidth: 220 }}
              value={selectedHotelId || ""}
              onChange={(e) => setSelectedHotelId(Number(e.target.value) || 0)}
              disabled={loadingHotels}
            >
              {hotels.length === 0 && <option value="">Loading…</option>}
              {hotels.length > 0 && <option value="">Select hotel</option>}
              {hotels.map((h) => (
                <option key={h.HotelId} value={h.HotelId}>
                  {h.Code} - {h.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: 150 }}
              value={branchStatusFilter}
              onChange={(e) => setBranchStatusFilter(e.target.value)}
              disabled={!selectedHotel}
            >
              <option value="ACTIVE">Active only</option>
              <option value="INACTIVE">Inactive only</option>
              <option value="ALL">All</option>
            </select>
            {loadingBranches && (
              <span className="small text-muted">Loading…</span>
            )}
          </div>
        </div>

        <div className="card-body">
          {selectedHotel ? (
            <SmartTable
              columns={branchColumns}
              data={statusFilteredBranches}
              defaultPageSize={10}
              enablePagination={true}
              enableSorting={true}
              enableFiltering={true}
              frozenColumnCount={2} // Actions + Code
              freezeHeader={true}
              getRowKey={(b) => b.BranchId}
            />
          ) : (
            <div className="text-center text-muted small py-4">
              Select a hotel to view and maintain its branches.
            </div>
          )}
        </div>
      </div>

      {/* ----------------- BRANCH MODAL ----------------- */}
      {branchModalOpen && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleBranchSubmit} noValidate>
                  <div className="modal-header">
                    <div>
                      <h5 className="modal-title">
                        {editingBranch.BranchId ? "Edit Branch" : "New Branch"}
                      </h5>
                      {selectedHotel && (
                        <div className="small text-muted">
                          Hotel: <strong>{selectedHotel.Name}</strong>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeBranchModal}
                    />
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${
                            branchErrors.branchCode ? "is-invalid" : ""
                          }`}
                          value={editingBranch.Code}
                          onChange={bindBranchCode}
                          maxLength={20}
                          disabled={savingBranch}
                          aria-invalid={!!branchErrors.branchCode}
                        />
                        {branchErrors.branchCode && (
                          <div className="invalid-feedback">
                            {branchErrors.branchCode}
                          </div>
                        )}
                      </div>
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold">
                          Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${
                            branchErrors.branchName ? "is-invalid" : ""
                          }`}
                          value={editingBranch.Name}
                          onChange={bindBranchName}
                          maxLength={200}
                          disabled={savingBranch}
                          aria-invalid={!!branchErrors.branchName}
                        />
                        {branchErrors.branchName && (
                          <div className="invalid-feedback">
                            {branchErrors.branchName}
                          </div>
                        )}
                      </div>

                      <div className="col-md-12">
                        <label className="form-label small fw-semibold">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingBranch.AddressLine1}
                          onChange={(e) =>
                            handleBranchFieldChange(
                              "AddressLine1",
                              e.target.value
                            )
                          }
                          maxLength={200}
                          disabled={savingBranch}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          City
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingBranch.City}
                          onChange={(e) =>
                            handleBranchFieldChange("City", e.target.value)
                          }
                          maxLength={100}
                          disabled={savingBranch}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          Phone
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingBranch.Phone}
                          onChange={(e) =>
                            handleBranchFieldChange("Phone", e.target.value)
                          }
                          maxLength={50}
                          disabled={savingBranch}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          Email
                        </label>
                        <input
                          type="email"
                          className={`form-control form-control-sm ${
                            branchErrors.branchEmail ? "is-invalid" : ""
                          }`}
                          value={editingBranch.Email}
                          onChange={bindBranchEmail}
                          maxLength={100}
                          disabled={savingBranch}
                          aria-invalid={!!branchErrors.branchEmail}
                        />
                        {branchErrors.branchEmail && (
                          <div className="invalid-feedback">
                            {branchErrors.branchEmail}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 d-flex align-items-center">
                        <div className="form-check mt-3">
                          <input
                            id="branch-active"
                            type="checkbox"
                            className="form-check-input"
                            checked={editingBranch.IsActive}
                            onChange={(e) =>
                              handleBranchFieldChange(
                                "IsActive",
                                e.target.checked
                              )
                            }
                            disabled={savingBranch}
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="branch-active"
                          >
                            Active
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={closeBranchModal}
                      disabled={savingBranch}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={savingBranch}
                    >
                      {savingBranch
                        ? "Please wait..."
                        : editingBranch.BranchId
                        ? "Save changes"
                        : "Create branch"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
}
