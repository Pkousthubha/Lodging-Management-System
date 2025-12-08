import React, { useEffect, useMemo, useState } from "react";
import {
  fetchHotels,
  fetchBranchesByHotel,
  saveHotel,
  toggleHotelActive,
  deleteHotel,
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

// ---------------- DUMMY DATA FOR UI TESTING ----------------

const USE_DUMMY_DATA = true; // <-- set to false later when API is ready

const DUMMY_HOTELS = [
  {
    HotelId: 1,
    Code: "HPUN01",
    Name: "Inspire Suites Pune",
    AddressLine1: "Pune, Maharashtra, India, 411045",
    City: "Pune",
    State: "Maharashtra",
    Country: "India",
    PostalCode: "411045",
    Phone: "020-66002001",
    Email: "pune1@inspirehotels.com",
    IsActive: true,
  },
  {
    HotelId: 2,
    Code: "HPUN02",
    Name: "Inspire City Center Pune",
    AddressLine1: "Pune, Maharashtra, India, 411004",
    City: "Pune",
    State: "Maharashtra",
    Country: "India",
    PostalCode: "411004",
    Phone: "020-66002002",
    Email: "pune2@inspirehotels.com",
    IsActive: false,
  },
  {
    HotelId: 3,
    Code: "HBLR01",
    Name: "Inspire Residency Bangalore",
    AddressLine1: "Bengaluru, Karnataka, India, 560001",
    City: "Bengaluru",
    State: "Karnataka",
    Country: "India",
    PostalCode: "560001",
    Phone: "080-44001001",
    Email: "blr@inspirehotels.com",
    IsActive: true,
  },
  {
    HotelId: 4,
    Code: "HDEL01",
    Name: "Inspire Palace Delhi",
    AddressLine1: "New Delhi, Delhi, India, 110001",
    City: "New Delhi",
    State: "Delhi",
    Country: "India",
    PostalCode: "110001",
    Phone: "011-22001001",
    Email: "delhi@inspirehotels.com",
    IsActive: true,
  },
  {
    HotelId: 5,
    Code: "HMUM01",
    Name: "Inspire Bayview Mumbai",
    AddressLine1: "Mumbai, Maharashtra, India, 400001",
    City: "Mumbai",
    State: "Maharashtra",
    Country: "India",
    PostalCode: "400001",
    Phone: "022-33001001",
    Email: "mum@inspirehotels.com",
    IsActive: true,
  },
  {
    HotelId: 6,
    Code: "HGOA01",
    Name: "Inspire Beachfront Goa",
    AddressLine1: "Calangute, Goa, India, 403516",
    City: "Goa",
    State: "Goa",
    Country: "India",
    PostalCode: "403516",
    Phone: "0832-22001001",
    Email: "goa@inspirehotels.com",
    IsActive: false,
  },
];

const DUMMY_BRANCHES = [
  // HPUN01
  {
    BranchId: 101,
    HotelId: 1,
    Code: "PUN-MAIN",
    Name: "Main Tower",
    City: "Pune",
    AddressLine1: "",
    Phone: "020-66002001",
    Email: "pun-main@inspirehotels.com",
    IsActive: true,
  },
  {
    BranchId: 102,
    HotelId: 1,
    Code: "PUN-ANNEX",
    Name: "Annexe Block",
    City: "Pune",
    AddressLine1: "",
    Phone: "",
    Email: "",
    IsActive: true,
  },

  // HPUN02
  {
    BranchId: 201,
    HotelId: 2,
    Code: "PUN-CITY",
    Name: "City Tower",
    City: "Pune",
    AddressLine1: "",
    Phone: "",
    Email: "",
    IsActive: false,
  },

  // HBLR01
  {
    BranchId: 301,
    HotelId: 3,
    Code: "BLR-MAIN",
    Name: "Main Tower",
    City: "Bengaluru",
    AddressLine1: "",
    Phone: "",
    Email: "",
    IsActive: true,
  },
  {
    BranchId: 302,
    HotelId: 3,
    Code: "BLR-ANNEX",
    Name: "Annexe Block",
    City: "Bengaluru",
    AddressLine1: "",
    Phone: "",
    Email: "",
    IsActive: true,
  },

  // HDEL01
  {
    BranchId: 401,
    HotelId: 4,
    Code: "DEL-MAIN",
    Name: "Connaught Place",
    City: "New Delhi",
    AddressLine1: "",
    Phone: "",
    Email: "",
    IsActive: true,
  },

  // HMUM01
  {
    BranchId: 501,
    HotelId: 5,
    Code: "MUM-MARINE",
    Name: "Marine Drive",
    City: "Mumbai",
    AddressLine1: "",
    Phone: "",
    Email: "",
    IsActive: true,
  },
  {
    BranchId: 502,
    HotelId: 5,
    Code: "MUM-AIR",
    Name: "Airport Annex",
    City: "Mumbai",
    AddressLine1: "",
    Phone: "",
    Email: "",
    IsActive: false,
  },

  // HGOA01
  {
    BranchId: 601,
    HotelId: 6,
    Code: "GOA-NORTH",
    Name: "North Wing",
    City: "Goa",
    AddressLine1: "",
    Phone: "",
    Email: "",
    IsActive: true,
  },
  {
    BranchId: 602,
    HotelId: 6,
    Code: "GOA-SOUTH",
    Name: "South Wing",
    City: "Goa",
    AddressLine1: "",
    Phone: "",
    Email: "",
    IsActive: false,
  },
];


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

export default function HotelsBranchesMaster() {
  // master data
  const [hotels, setHotels] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // filters
  const [hotelStatusFilter, setHotelStatusFilter] = useState("ACTIVE"); // ACTIVE | INACTIVE | ALL
  const [branchStatusFilter, setBranchStatusFilter] = useState("ACTIVE");

  // modals
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(EMPTY_HOTEL);
  const [editingBranch, setEditingBranch] = useState(EMPTY_BRANCH);
  const [savingHotel, setSavingHotel] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);

  // row action menus
  const [activeHotelMenuId, setActiveHotelMenuId] = useState(null);
  const [activeBranchMenuId, setActiveBranchMenuId] = useState(null);

  // field-level validation hooks
  const {
    errors: hotelErrors,
    setErrors: setHotelErrors,
    bindField: bindHotelField,
  } = useFieldErrors();

  const {
    errors: branchErrors,
    setErrors: setBranchErrors,
    bindField: bindBranchField,
  } = useFieldErrors();

  // --------------------------
  // Validation Rules
  // --------------------------
  const hotelRules = buildRules({
    hotelCode: { required: "Enter the Hotel Code." },
    hotelName: { required: "Enter the Hotel Name." },
    hotelEmail: { type: "email" }, // optional but type-checked when filled
  });

  const branchRules = buildRules({
    branchCode: { required: "Enter the Branch Code." },
    branchName: { required: "Enter the Branch Name." },
    branchEmail: { type: "email" },
  });

  const runHotelValidation = () => {
    const values = {
      hotelCode: editingHotel.Code,
      hotelName: editingHotel.Name,
      hotelEmail: editingHotel.Email,
    };

    const newErrors = validateValues(values, hotelRules);

    // unique hotel code
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

    // unique branch code within hotel
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
  // initial load
  // -----------------------------
  useEffect(() => {
    loadHotels();
  }, []);

  // close action menus when you click anywhere else
  useEffect(() => {
    const handler = () => {
      setActiveHotelMenuId(null);
      setActiveBranchMenuId(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const loadHotels = async () => {
  // 👉 For now always use dummy data
  if (USE_DUMMY_DATA) {
    setHotels(DUMMY_HOTELS);
    if (!selectedHotelId && DUMMY_HOTELS.length > 0) {
      setSelectedHotelId(DUMMY_HOTELS[0].HotelId);
    }
    return;
  }

  // --- real API (enable when backend is ready) ---
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

  // load branches when selection changes
  useEffect(() => {
    if (!selectedHotelId) {
      setBranches([]);
      return;
    }
    loadBranches(selectedHotelId);
  }, [selectedHotelId]);

  const loadBranches = async (hotelId) => {
  // 👉 For now always use dummy data
  if (USE_DUMMY_DATA) {
    const list = DUMMY_BRANCHES.filter((b) => b.HotelId === hotelId);
    setBranches(list);
    return;
  }

  // --- real API (enable when backend is ready) ---
  try {
    setLoadingBranches(true);
    const data = await fetchBranchesByHotel(hotelId);
    setBranches(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error loading branches", err);
    showErrorToast("Failed to load branches. Please try again.", {
      position: TOAST_POS,
    });
  } finally {
    setLoadingBranches(false);
  }
};

  // -----------------------------
  // derived collections
  // -----------------------------
  const statusFilteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      if (hotelStatusFilter === "ACTIVE" && !h.IsActive) return false;
      if (hotelStatusFilter === "INACTIVE" && h.IsActive) return false;
      return true;
    });
  }, [hotels, hotelStatusFilter]);

  const statusFilteredBranches = useMemo(() => {
    return branches.filter((b) => {
      if (branchStatusFilter === "ACTIVE" && !b.IsActive) return false;
      if (branchStatusFilter === "INACTIVE" && b.IsActive) return false;
      return true;
    });
  }, [branches, branchStatusFilter]);

  const selectedHotel = useMemo(
    () => hotels.find((h) => h.HotelId === selectedHotelId) || null,
    [hotels, selectedHotelId]
  );

  // -----------------------------
  // helpers
  // -----------------------------
  const renderStatusBadge = (isActive) => {
    const cls = "badge rounded-pill px-3 py-1";
    return isActive ? (
      <span className={`${cls} bg-success-subtle text-success`}>Active</span>
    ) : (
      <span className={`${cls} bg-secondary-subtle text-muted`}>Inactive</span>
    );
  };

  // -----------------------------
  // hotel handlers
  // -----------------------------
  const handleSelectHotel = (hotel) => {
    setSelectedHotelId(hotel.HotelId);
  };

  const openCreateHotelModal = () => {
    setEditingHotel({ ...EMPTY_HOTEL, HotelId: 0 });
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
    try {
      const newValue = !hotel.IsActive;
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
    try {
      await deleteHotel(hotel.HotelId);
      setHotels((prev) => prev.filter((h) => h.HotelId !== hotel.HotelId));
      if (selectedHotelId === hotel.HotelId) {
        setSelectedHotelId(null);
        setBranches([]);
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
      const saved = await saveHotel(editingHotel); // API returns entity
      setHotels((prev) => {
        const idx = prev.findIndex((h) => h.HotelId === saved.HotelId);
        if (idx === -1) return [...prev, saved];
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      });
      if (!selectedHotelId || selectedHotelId === 0) {
        setSelectedHotelId(saved.HotelId);
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
  // branch handlers
  // -----------------------------
  const openCreateBranchModal = () => {
    if (!selectedHotel) {
      showErrorToast("Please select a hotel first.", { position: TOAST_POS });
      return;
    }
    setEditingBranch({
      ...EMPTY_BRANCH,
      HotelId: selectedHotel.HotelId,
      BranchId: 0,
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
    try {
      const newValue = !branch.IsActive;
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
      const saved = await saveBranch(editingBranch);
      setBranches((prev) => {
        const idx = prev.findIndex((b) => b.BranchId === saved.BranchId);
        if (idx === -1) return [...prev, saved];
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      });
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
  // table column definitions
  // -----------------------------
  const hotelColumns = useMemo(
    () => [
      {
        key: "Actions",
        header: "Actions",
        sortable: false,
        filterable: false,
        width: "115px",
        render: (h) => {
          const isMenuOpen = activeHotelMenuId === h.HotelId;
          return (
            <div
              className="st-actions-cell"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="st-icon-btn st-icon-edit"
                title="Edit hotel"
                onClick={() => openEditHotelModal(h)}
              >
                ✏️
              </button>
              <button
                type="button"
                className="st-icon-btn st-icon-toggle"
                title={h.IsActive ? "Deactivate" : "Activate"}
                onClick={() => handleToggleHotelActive(h)}
              >
                {h.IsActive ? "D" : "A"}
              </button>
              <button
                type="button"
                className={`st-icon-btn st-icon-more ${
                  isMenuOpen ? "active" : ""
                }`}
                title="More actions"
                onClick={() =>
                  setActiveHotelMenuId(isMenuOpen ? null : h.HotelId)
                }
              >
                ⋮
              </button>

              {isMenuOpen && (
                <div
                  className="st-actions-menu shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      openEditHotelModal(h);
                      setActiveHotelMenuId(null);
                    }}
                  >
                    ✏️ Edit hotel
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      handleToggleHotelActive(h);
                      setActiveHotelMenuId(null);
                    }}
                  >
                    {h.IsActive ? "⏸ Deactivate" : "▶ Activate"}
                  </button>
                  <button
                    type="button"
                    className="dropdown-item text-danger"
                    onClick={() => {
                      setActiveHotelMenuId(null);
                      handleDeleteHotel(h);
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "Code",
        header: "Code",
        sortable: true,
        filterable: true,
        width: "110px",
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
        accessor: (h) => (h.IsActive ? "Active" : "Inactive"),
        render: (h) => renderStatusBadge(h.IsActive),
        width: "110px",
      },
    ],
    [activeHotelMenuId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const branchColumns = useMemo(
    () => [
      {
        key: "Actions",
        header: "Actions",
        sortable: false,
        filterable: false,
        width: "115px",
        render: (b) => {
          const isMenuOpen = activeBranchMenuId === b.BranchId;
          return (
            <div
              className="st-actions-cell"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="st-icon-btn st-icon-edit"
                title="Edit branch"
                onClick={() => openEditBranchModal(b)}
              >
                ✏️
              </button>
              <button
                type="button"
                className="st-icon-btn st-icon-toggle"
                title={b.IsActive ? "Deactivate" : "Activate"}
                onClick={() => handleToggleBranchActive(b)}
              >
                {b.IsActive ? "D" : "A"}
              </button>
              <button
                type="button"
                className={`st-icon-btn st-icon-more ${
                  isMenuOpen ? "active" : ""
                }`}
                title="More actions"
                onClick={() =>
                  setActiveBranchMenuId(isMenuOpen ? null : b.BranchId)
                }
              >
                ⋮
              </button>

              {isMenuOpen && (
                <div
                  className="st-actions-menu shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      openEditBranchModal(b);
                      setActiveBranchMenuId(null);
                    }}
                  >
                    ✏️ Edit branch
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      handleToggleBranchActive(b);
                      setActiveBranchMenuId(null);
                    }}
                  >
                    {b.IsActive ? "⏸ Deactivate" : "▶ Activate"}
                  </button>
                  <button
                    type="button"
                    className="dropdown-item text-danger"
                    onClick={() => {
                      setActiveBranchMenuId(null);
                      handleDeleteBranch(b);
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "Code",
        header: "Code",
        sortable: true,
        filterable: true,
        width: "110px",
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
    [activeBranchMenuId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // -----------------------------
  // field binders for forms
  // -----------------------------
  const bindHotelCode = bindHotelField("hotelCode", (val) =>
    handleHotelFieldChange("Code", val)
  );
  const bindHotelName = bindHotelField("hotelName", (val) =>
    handleHotelFieldChange("Name", val)
  );
  const bindHotelEmail = bindHotelField("hotelEmail", (val) =>
    handleHotelFieldChange("Email", val)
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
          <h4 className="mb-1">Hotels / Branches Master</h4>
          <p className="text-muted small mb-0">
            Maintain hotels (properties) and their operating branches.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={loadHotels}
            disabled={loadingHotels}
          >
            ⟳ Reload
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={openCreateHotelModal}
          >
            ＋ New Hotel
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* HOTELS LIST */}
        <div className="col-lg-7">
          <div className="card app-card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="small fw-semibold">Hotels</span>
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
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

            <div className="card-body p-0">
              <SmartTable
                columns={hotelColumns}
                data={statusFilteredHotels}
                defaultPageSize={6}
                enablePagination={true}
                enableSorting={true}
                enableFiltering={true}
                frozenColumnCount={1} // freeze Actions
                freezeHeader={true}
                onRowClick={handleSelectHotel}
                getRowClassName={(h) =>
                  h.HotelId === selectedHotelId ? "table-primary" : ""
                }
                getRowKey={(h) => h.HotelId}
              />
            </div>
          </div>
        </div>

        {/* BRANCHES LIST */}
        <div className="col-lg-5">
          <div className="card app-card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <span className="small fw-semibold">Branches</span>
                {selectedHotel && (
                  <span className="small text-muted ms-2">
                    for <strong>{selectedHotel.Name}</strong>
                  </span>
                )}
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

            <div className="card-body p-0">
              {selectedHotel ? (
                <>
                  {loadingBranches && (
                    <div className="small text-muted px-3 pt-2">
                      Loading…
                    </div>
                  )}
                  <SmartTable
                    columns={branchColumns}
                    data={statusFilteredBranches}
                    defaultPageSize={6}
                    enablePagination={true}
                    enableSorting={true}
                    enableFiltering={true}
                    frozenColumnCount={1}
                    freezeHeader={true}
                    getRowKey={(b) => b.BranchId}
                  />
                </>
              ) : (
                <div className="text-center text-muted small py-4">
                  Select a hotel on the left to manage its branches.
                </div>
              )}
            </div>
          </div>
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
              <div className="modal-content">
                <form onSubmit={handleHotelSubmit} noValidate>
                  <div className="modal-header">
                    <h5 className="modal-title">
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
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={closeHotelModal}
                      disabled={savingHotel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
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
                    <h5 className="modal-title">
                      {editingBranch.BranchId ? "Edit Branch" : "New Branch"}
                    </h5>
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
