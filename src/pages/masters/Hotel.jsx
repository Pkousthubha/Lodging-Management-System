// src/pages/masters/Hotel.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchHotels,
  saveHotel,
  toggleHotelActive,
  deleteHotel,
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

// defaults shaped like DB / API (PascalCase)
const EMPTY_HOTEL = {
  HotelId: 0,
  Code: "",
  Name: "",
  AddressLine1: "",
  AddressLine2: "",
  City: "",
  State: "",
  Country: "",
  PostalCode: "",
  Phone: "",
  Email: "",
  IsActive: true,
};

const TOAST_POS = TOAST_POSITIONS.TOP_CENTER;

export default function HotelMaster() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  const [hotelStatusFilter, setHotelStatusFilter] = useState("ACTIVE");
  const [loadingHotels, setLoadingHotels] = useState(false);

  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(EMPTY_HOTEL);
  const [savingHotel, setSavingHotel] = useState(false);

  // which row's Actions dropdown is currently open
  const [openActionHotelId, setOpenActionHotelId] = useState(null);

  const {
    errors: hotelErrors,
    setErrors: setHotelErrors,
    bindField: bindHotelField,
  } = useFieldErrors();

  // --------------------------
  // Validation Rules
  // --------------------------
  const hotelRules = buildRules({
    hotelCode: { required: "Enter the Hotel Code." },
    hotelName: { required: "Enter the Hotel Name." },
    hotelEmail: { type: "email" },
  });

  const runHotelValidation = () => {
    const values = {
      hotelCode: editingHotel.Code,
      hotelName: editingHotel.Name,
      hotelEmail: editingHotel.Email,
    };

    const newErrors = validateValues(values, hotelRules);

    // unique code
    if (
      editingHotel.Code &&
      hotels.some(
        (x) =>
          x.Code?.toLowerCase() === editingHotel.Code.toLowerCase() &&
          x.HotelId !== editingHotel.HotelId
      )
    ) {
      newErrors.hotelCode = "Hotel code already exists. Use a different code.";
    }

    setHotelErrors(newErrors);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      showErrorToast("Failed to load hotels. Please try again.", {
        position: TOAST_POS,
      });
    } finally {
      setLoadingHotels(false);
    }
  };

  // close any open actions dropdown on global click
  useEffect(() => {
    const handleDocClick = () => {
      setOpenActionHotelId(null);
    };
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  // -----------------------------
  // helpers
  // -----------------------------
  const statusFilteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      if (hotelStatusFilter === "ACTIVE" && !h.IsActive) return false;
      if (hotelStatusFilter === "INACTIVE" && h.IsActive) return false;
      return true;
    });
  }, [hotels, hotelStatusFilter]);

  const renderStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 shadow-sm">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">
        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
        Inactive
      </span>
    );
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotelId(hotel.HotelId);
  };

  const openCreateHotelModal = () => {
    setEditingHotel({ ...EMPTY_HOTEL, HotelId: 0, IsActive: true });
    setHotelErrors({});
    setHotelModalOpen(true);
  };

  const openEditHotelModal = (hotel) => {
    setEditingHotel({ ...hotel });
    setHotelErrors({});
    setHotelModalOpen(true);
  };

  const closeHotelModal = () => {
    if (savingHotel) return;
    setHotelModalOpen(false);
    setEditingHotel(EMPTY_HOTEL);
  };

  const handleHotelFieldChange = (field, value) => {
    setEditingHotel((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleHotelActive = async (hotel) => {
    const newValue = !hotel.IsActive;

    if (USE_DUMMY_DATA) {
      setHotels((prev) =>
        prev.map((h) =>
          h.HotelId === hotel.HotelId ? { ...h, IsActive: newValue } : h
        )
      );
      showSuccessToast(
        newValue ? "Hotel activated successfully." : "Hotel deactivated.",
        { position: TOAST_POS }
      );
      return;
    }

    try {
      await toggleHotelActive(hotel.HotelId, newValue);
      setHotels((prev) =>
        prev.map((h) =>
          h.HotelId === hotel.HotelId ? { ...h, IsActive: newValue } : h
        )
      );
      showSuccessToast(
        newValue ? "Hotel activated successfully." : "Hotel deactivated.",
        { position: TOAST_POS }
      );
    } catch (err) {
      console.error("Failed to change hotel status", err);
      showErrorToast("Failed to change hotel status.", {
        position: TOAST_POS,
      });
    }
  };

  const handleDeleteHotel = async (hotel) => {
    const ok = window.confirm(
      `Delete hotel "${hotel.Name}" (${hotel.Code})? This cannot be undone.`
    );
    if (!ok) return;

    if (USE_DUMMY_DATA) {
      setHotels((prev) => prev.filter((h) => h.HotelId !== hotel.HotelId));
      if (selectedHotelId === hotel.HotelId) {
        setSelectedHotelId(null);
      }
      showSuccessToast("Hotel deleted successfully.", {
        position: TOAST_POS,
      });
      return;
    }

    try {
      await deleteHotel(hotel.HotelId);
      setHotels((prev) => prev.filter((h) => h.HotelId !== hotel.HotelId));
      if (selectedHotelId === hotel.HotelId) {
        setSelectedHotelId(null);
      }
      showSuccessToast("Hotel deleted successfully.", {
        position: TOAST_POS,
      });
    } catch (err) {
      console.error("Failed to delete hotel", err);
      showErrorToast("Failed to delete hotel.", { position: TOAST_POS });
    }
  };

  const handleHotelSubmit = async (e) => {
    e.preventDefault();

    if (savingHotel) return;
    if (!runHotelValidation()) return;

    try {
      setSavingHotel(true);

      if (USE_DUMMY_DATA) {
        let saved = { ...editingHotel };
        if (!saved.HotelId) {
          const maxId =
            hotels.reduce(
              (max, h) => (h.HotelId > max ? h.HotelId : max),
              0
            ) || 0;
          saved.HotelId = maxId + 1;
        }

        setHotels((prev) => {
          const idx = prev.findIndex((h) => h.HotelId === saved.HotelId);
          if (idx === -1) return [...prev, saved];
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        });

        if (!selectedHotelId) setSelectedHotelId(saved.HotelId);
      } else {
        const saved = await saveHotel(editingHotel);
        setHotels((prev) => {
          const idx = prev.findIndex((h) => h.HotelId === saved.HotelId);
          if (idx === -1) return [...prev, saved];
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        });
        if (!selectedHotelId) setSelectedHotelId(saved.HotelId);
      }

      showSuccessToast("Hotel saved successfully.", { position: TOAST_POS });
      closeHotelModal();
    } catch (err) {
      console.error("Failed to save hotel", err);
      showErrorToast("Failed to save hotel. Please try again.", {
        position: TOAST_POS,
      });
    } finally {
      setSavingHotel(false);
    }
  };

  // -----------------------------
  // table columns (Actions first)
  // -----------------------------
  const hotelColumns = useMemo(
    () => [
      {
        key: "Actions",
        header: "Actions",
        sortable: false,
        filterable: false,
        width: "90px",
        render: (h) => {
          const isOpen = openActionHotelId === h.HotelId;
          return (
            <div
              className="dropdown st-actions-dropdown"
              onClick={(e) => e.stopPropagation()} // don't trigger row click
            >
              <button
                type="button"
                className="btn btn-sm btn-light rounded-circle st-actions-toggle d-flex align-items-center justify-content-center w-8 h-8 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                title="More actions"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionHotelId((prev) =>
                    prev === h.HotelId ? null : h.HotelId
                  );
                }}
              >
                ⋮
              </button>
              <ul
                className={
                  "dropdown-menu dropdown-menu-end shadow-lg border-0 st-actions-menu" +
                  (isOpen ? " show" : "")
                }
                style={{ minWidth: "160px" }}
              >
                <li>
                  <button
                    type="button"
                    className="dropdown-item py-2"
                    onClick={() => {
                      setOpenActionHotelId(null);
                      openEditHotelModal(h);
                    }}
                  >
                    Edit
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="dropdown-item py-2"
                    onClick={() => {
                      setOpenActionHotelId(null);
                      handleToggleHotelActive(h);
                    }}
                  >
                    {h.IsActive ? "Deactivate" : "Activate"}
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button
                    type="button"
                    className="dropdown-item py-2 text-danger"
                    onClick={() => {
                      setOpenActionHotelId(null);
                      handleDeleteHotel(h);
                    }}
                  >
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          );
        },
      },
      {
        key: "Code",
        header: "Code",
        sortable: true,
        filterable: true,
        width: "120px",
        accessor: (h) => h.Code,
      },
      {
        key: "Name",
        header: "Name",
        sortable: true,
        filterable: true,
        accessor: (h) => h.Name,
      },
      {
        key: "Location",
        header: "Location",
        sortable: true,
        filterable: true,
        accessor: (h) =>
          [h.City, h.State, h.Country, h.PostalCode]
            .filter(Boolean)
            .join(", "),
      },
      {
        key: "Contact",
        header: "Contact",
        sortable: false,
        filterable: true,
        accessor: (h) =>
          [h.Phone, h.Email].filter(Boolean).join(" · ") || "",
      },
      {
        key: "Status",
        header: "Status",
        sortable: true,
        filterable: true,
        width: "110px",
        accessor: (h) => (h.IsActive ? "Active" : "Inactive"),
        render: (h) => renderStatusBadge(h.IsActive),
      },
    ],
    [openActionHotelId] // we intentionally ignore handler deps to keep memo simple
  );

  // field binders for form
  const bindHotelCode = bindHotelField("hotelCode", (val) =>
    handleHotelFieldChange("Code", val)
  );
  const bindHotelName = bindHotelField("hotelName", (val) =>
    handleHotelFieldChange("Name", val)
  );
  const bindHotelEmail = bindHotelField("hotelEmail", (val) =>
    handleHotelFieldChange("Email", val)
  );

  // -----------------------------
  // render
  // -----------------------------
  return (
    <div className="container-fluid py-4">
      {/* header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="mb-1 fw-bold text-gray-900">Hotels Master</h4>
          <p className="text-muted small mb-0">
            Maintain hotels (properties) with contact and address details.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-gray-300 hover:bg-gray-50 transition-all"
            onClick={loadHotels}
            disabled={loadingHotels}
          >
            Reload
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg transition-all"
            onClick={openCreateHotelModal}
          >
            New Hotel
          </button>
        </div>
      </div>

      <div className="card app-card border-0 shadow-lg">
        <div className="card-header bg-white border-bottom border-gray-200 d-flex justify-content-between align-items-center py-3">
          <span className="small fw-semibold text-gray-700">Hotels</span>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              style={{ width: 150 }}
              value={hotelStatusFilter}
              onChange={(e) => setHotelStatusFilter(e.target.value)}
            >
              <option value="ACTIVE">Active only</option>
              <option value="INACTIVE">Inactive only</option>
              <option value="ALL">All</option>
            </select>
            {loadingHotels && (
              <span className="small text-muted">Loading…</span>
            )}
          </div>
        </div>
        <div className="card-body">
          <SmartTable
            columns={hotelColumns}
            data={statusFilteredHotels}
            defaultPageSize={10}
            enablePagination={true}
            enableSorting={true}
            enableFiltering={true}
            frozenColumnCount={2} // Actions + Code
            freezeHeader={true}
            onRowClick={handleSelectHotel}
            getRowClassName={(h) =>
              h.HotelId === selectedHotelId ? "table-primary" : ""
            }
            getRowKey={(h) => h.HotelId}
          />
        </div>
      </div>

      {/* ----------------- HOTEL MODAL ----------------- */}
      {hotelModalOpen && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-xl">
                <form onSubmit={handleHotelSubmit} noValidate>
                  <div className="modal-header bg-gradient-to-r from-blue-50 to-indigo-50 border-bottom border-gray-200">
                    <h5 className="modal-title fw-bold mb-0 text-gray-900">
                      {editingHotel.HotelId
                        ? "Edit Hotel"
                        : "New Hotel / Property"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeHotelModal}
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
                            hotelErrors.hotelCode ? "is-invalid" : ""
                          }`}
                          value={editingHotel.Code}
                          onChange={bindHotelCode}
                          maxLength={20}
                          disabled={savingHotel}
                          aria-invalid={!!hotelErrors.hotelCode}
                        />
                        {hotelErrors.hotelCode && (
                          <div className="invalid-feedback">
                            {hotelErrors.hotelCode}
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
                            hotelErrors.hotelName ? "is-invalid" : ""
                          }`}
                          value={editingHotel.Name}
                          onChange={bindHotelName}
                          maxLength={200}
                          disabled={savingHotel}
                          aria-invalid={!!hotelErrors.hotelName}
                        />
                        {hotelErrors.hotelName && (
                          <div className="invalid-feedback">
                            {hotelErrors.hotelName}
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
                          value={editingHotel.AddressLine1}
                          onChange={(e) =>
                            handleHotelFieldChange(
                              "AddressLine1",
                              e.target.value
                            )
                          }
                          maxLength={200}
                          disabled={savingHotel}
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label small fw-semibold">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingHotel.AddressLine2}
                          onChange={(e) =>
                            handleHotelFieldChange(
                              "AddressLine2",
                              e.target.value
                            )
                          }
                          maxLength={200}
                          disabled={savingHotel}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          City
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingHotel.City}
                          onChange={(e) =>
                            handleHotelFieldChange("City", e.target.value)
                          }
                          disabled={savingHotel}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          State
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingHotel.State}
                          onChange={(e) =>
                            handleHotelFieldChange("State", e.target.value)
                          }
                          disabled={savingHotel}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          Country
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingHotel.Country}
                          onChange={(e) =>
                            handleHotelFieldChange("Country", e.target.value)
                          }
                          disabled={savingHotel}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingHotel.PostalCode}
                          onChange={(e) =>
                            handleHotelFieldChange(
                              "PostalCode",
                              e.target.value
                            )
                          }
                          maxLength={20}
                          disabled={savingHotel}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          Phone
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingHotel.Phone}
                          onChange={(e) =>
                            handleHotelFieldChange("Phone", e.target.value)
                          }
                          maxLength={50}
                          disabled={savingHotel}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          Email
                        </label>
                        <input
                          type="email"
                          className={`form-control form-control-sm ${
                            hotelErrors.hotelEmail ? "is-invalid" : ""
                          }`}
                          value={editingHotel.Email}
                          onChange={bindHotelEmail}
                          maxLength={100}
                          disabled={savingHotel}
                          aria-invalid={!!hotelErrors.hotelEmail}
                        />
                        {hotelErrors.hotelEmail && (
                          <div className="invalid-feedback">
                            {hotelErrors.hotelEmail}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 d-flex align-items-center">
                        <div className="form-check mt-3">
                          <input
                            id="hotel-active"
                            type="checkbox"
                            className="form-check-input"
                            checked={editingHotel.IsActive}
                            onChange={(e) =>
                              handleHotelFieldChange(
                                "IsActive",
                                e.target.checked
                              )
                            }
                            disabled={savingHotel}
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="hotel-active"
                          >
                            Active
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      className="btn btn-light border-gray-300 hover:bg-gray-100 transition-all"
                      onClick={closeHotelModal}
                      disabled={savingHotel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg transition-all"
                      disabled={savingHotel}
                    >
                      {savingHotel
                        ? "Please wait..."
                        : editingHotel.HotelId
                        ? "Save changes"
                        : "Create hotel"}
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
