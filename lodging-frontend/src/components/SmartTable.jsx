// src/components/SmartTable.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import "../styles/SmartTable.css";

/**
 * Generic table with:
 *  - Optional pagination
 *  - Optional sorting
 *  - Optional column filters (popup style)
 *  - Optional frozen columns (first N) & frozen header row
 *
 * columns: [
 *   {
 *     key: string,
 *     header: string,
 *     accessor?: (row) => any,   // default: row[key]
 *     sortable?: boolean,        // per-column (also needs enableSorting=true)
 *     filterable?: boolean,      // per-column (also needs enableFiltering=true)
 *     width?: string|number,
 *     render?: (row) => ReactNode // custom cell rendering
 *   }
 * ]
 *
 * PROPS:
 *  - data: array
 *  - enablePagination?: boolean (default true)
 *  - enableSorting?: boolean (default true)
 *  - enableFiltering?: boolean (default true)
 *  - frozenColumnCount?: number (default 0)  // freeze first N columns
 *  - freezeHeader?: boolean (default true)   // sticky header on vertical scroll
 *  - getRowClassName?: (row, index) => string
 *  - onRowClick?: (row) => void
 *  - getRowKey?: (row, index) => string|number   // optional stable key
 */
export default function SmartTable({
  columns,
  data,
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 25,
  onRowClick,
  getRowClassName,
  getRowKey,

  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
  frozenColumnCount = 0,
  freezeHeader = true,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [activeFilterKey, setActiveFilterKey] = useState(null);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  // sticky columns offsets
  const headerRefs = useRef([]);
  const [stickyOffsets, setStickyOffsets] = useState([]);

  const stickyEnabled = frozenColumnCount > 0;

  // measure sticky column offsets
  useLayoutEffect(() => {
    if (!stickyEnabled) {
      setStickyOffsets([]);
      return;
    }

    const offsets = [];
    let left = 0;
    for (let i = 0; i < frozenColumnCount; i += 1) {
      const th = headerRefs.current[i];
      if (!th) break;
      offsets[i] = left;
      left += th.offsetWidth;
    }
    setStickyOffsets(offsets);
  }, [columns, data, frozenColumnCount, stickyEnabled]);

  // recompute on window resize (for responsive widths)
  useEffect(() => {
    if (!stickyEnabled) return;
    const handler = () => {
      let left = 0;
      const offsets = [];
      for (let i = 0; i < frozenColumnCount; i += 1) {
        const th = headerRefs.current[i];
        if (!th) break;
        offsets[i] = left;
        left += th.offsetWidth;
      }
      setStickyOffsets(offsets);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [frozenColumnCount, stickyEnabled]);

  // reset page when data changes
  useEffect(() => {
    setPage(1);
  }, [data]);

  const { total, rows } = useMemo(() => {
    let items = Array.isArray(data) ? [...data] : [];

    // column filters (min 3 characters to actually filter)
    if (enableFiltering) {
      items = items.filter((row) =>
        columns.every((col) => {
          if (!col.filterable) return true;
          const raw = filters[col.key];
          const filterValue = typeof raw === "string" ? raw.trim() : raw;
          if (!filterValue || filterValue.length < 3) return true; // no filter yet

          const accessor = col.accessor || ((r) => r[col.key]);
          const val = accessor(row);
          const text = (val ?? "").toString().toLowerCase();
          return text.includes(filterValue.toLowerCase());
        })
      );
    }

    // sorting
    if (enableSorting && sortConfig.key) {
      const col = columns.find((c) => c.key === sortConfig.key);
      if (col) {
        const accessor = col.accessor || ((r) => r[col.key]);
        items.sort((a, b) => {
          const va = accessor(a);
          const vb = accessor(b);

          if (va == null && vb == null) return 0;
          if (va == null) return sortConfig.direction === "asc" ? -1 : 1;
          if (vb == null) return sortConfig.direction === "asc" ? 1 : -1;

          const sa =
            typeof va === "number" ? va : va.toString().toLowerCase();
          const sb =
            typeof vb === "number" ? vb : vb.toString().toLowerCase();

          if (sa < sb) return sortConfig.direction === "asc" ? -1 : 1;
          if (sa > sb) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }
    }

    // pagination
    if (!enablePagination) {
      return { total: items.length, rows: items };
    }

    const totalItems = items.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageRows = items.slice(start, end);

    return { total: totalItems, rows: pageRows };
  }, [
    columns,
    data,
    filters,
    sortConfig,
    page,
    pageSize,
    enablePagination,
    enableSorting,
    enableFiltering,
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // clamp page if total changed
  useEffect(() => {
    if (!enablePagination) return;
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page, enablePagination]);

  const handleSort = (key, sortable) => {
    if (!enableSorting || !sortable) return;
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (enablePagination) setPage(1);
  };

  const renderSortIcon = (col, isSortable) => {
    if (!enableSorting || !isSortable) return null;
    if (sortConfig.key !== col.key) {
      return (
        <span
          style={{
            opacity: 0.35,
            marginLeft: 4,
            fontSize: "0.75rem",
          }}
        >
          ↕
        </span>
      );
    }
    return (
      <span
        style={{
          marginLeft: 4,
          fontSize: "0.75rem",
        }}
      >
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const toggleFilterPopup = (key, e) => {
    if (!enableFiltering) return;
    // prevent header click from triggering sort
    e.stopPropagation();
    setActiveFilterKey((prev) => (prev === key ? null : key));
  };

  const closeFilterPopup = () => setActiveFilterKey(null);

  // Close popup on ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setActiveFilterKey(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // pagination helpers
  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);

  const from =
    total === 0 ? 0 : enablePagination ? (page - 1) * pageSize + 1 : 1;
  const to =
    total === 0 ? 0 : enablePagination ? Math.min(page * pageSize, total) : total;

  // helpers for sticky styles
  const getStickyStyle = (colIndex, isHeader) => {
    if (!stickyEnabled || colIndex >= frozenColumnCount) return undefined;
    const left = stickyOffsets[colIndex] || 0;
    return {
      position: "sticky",
      left,
      zIndex: isHeader ? 15 : 5,
      background: "#fff",
      backgroundClip: "padding-box",
    };
  };

  // generic row key resolver
  const resolveRowKey = (row, index) => {
    if (typeof getRowKey === "function") {
      return getRowKey(row, index);
    }
    // sensible fallbacks for generic use
    if (row && typeof row === "object") {
      if (row.__key != null) return row.__key;
      if (row.id != null) return row.id;
      if (row.Id != null) return row.Id;
      if (row.key != null) return row.key;
    }
    return index;
  };

  return (
    <div className="smart-table-wrapper d-flex flex-column h-100">
      <div className="table-responsive flex-grow-1">
        <table className="table table-sm align-middle mb-0">
          <thead
            className={freezeHeader ? "table-light st-sticky-header" : "table-light"}
          >
            <tr>
              {columns.map((col, colIndex) => {
                const colSortable = !!col.sortable;
                const colFilterable = !!col.filterable;
                const stickyStyle = getStickyStyle(colIndex, true);

                return (
                  <th
                    key={col.key}
                    ref={(el) => {
                      headerRefs.current[colIndex] = el;
                    }}
                    style={{ width: col.width, ...stickyStyle }}
                    className={
                      enableSorting && colSortable ? "st-header-sortable" : ""
                    }
                    onClick={() => handleSort(col.key, colSortable)}
                  >
                    <div className="d-flex align-items-center gap-1 position-relative">
                      <span
                        className={
                          enableSorting && colSortable
                            ? "st-header-text-sortable"
                            : "fw-semibold"
                        }
                        style={{ userSelect: "none" }}
                      >
                        {col.header}
                        {renderSortIcon(col, colSortable)}
                      </span>

                      {enableFiltering && colFilterable && (
                        <button
                          type="button"
                          className={`btn btn-sm btn-link p-0 ms-1 st-filter-btn ${
                            activeFilterKey === col.key ? "active" : ""
                          }`}
                          title={`Filter ${col.header}`}
                          onClick={(e) => toggleFilterPopup(col.key, e)}
                        >
                          {/* simple filter icon */}
                          <span style={{ fontSize: "0.85rem" }}>⏷</span>
                        </button>
                      )}

                      {/* Filter popup */}
                      {enableFiltering &&
                        colFilterable &&
                        activeFilterKey === col.key && (
                          <div
                            className="st-filter-popup shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="st-filter-popup-arrow" />
                            <div className="st-filter-popup-inner">
                              <div className="input-group input-group-sm">
                                <span className="input-group-text">
                                  <span
                                    className="bi bi-search"
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    🔍
                                  </span>
                                </span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder={`Search ${col.header}`}
                                  value={filters[col.key] || ""}
                                  onChange={(e) =>
                                    handleFilterChange(col.key, e.target.value)
                                  }
                                  autoFocus
                                />
                              </div>
                              <div className="form-text mt-1">
                                Enter minimum <strong>3 characters</strong> to
                                search.
                              </div>
                              <div className="d-flex justify-content-end mt-2 gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light"
                                  onClick={() => {
                                    handleFilterChange(col.key, "");
                                    closeFilterPopup();
                                  }}
                                >
                                  Clear
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={closeFilterPopup}
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => {
                const className = getRowClassName
                  ? getRowClassName(row, rowIndex)
                  : "";
                const rowKey = resolveRowKey(row, rowIndex);

                return (
                  <tr
                    key={rowKey}
                    className={className}
                    style={onRowClick ? { cursor: "pointer" } : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col, colIndex) => {
                      const accessor = col.accessor || ((r) => r[col.key]);
                      const stickyStyle = getStickyStyle(colIndex, false);
                      return (
                        <td key={col.key} style={stickyStyle}>
                          {col.render ? col.render(row) : accessor(row)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* pagination bar (optional) */}
      {enablePagination && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="small text-muted">
            Showing {from}-{to} of {total} records
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={goFirst}
              disabled={page <= 1}
              title="First page"
            >
              «
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={goPrev}
              disabled={page <= 1}
              title="Previous page"
            >
              ‹
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={goNext}
              disabled={page >= totalPages}
              title="Next page"
            >
              ›
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={goLast}
              disabled={page >= totalPages}
              title="Last page"
            >
              »
            </button>

            <select
              className="form-select form-select-sm ms-2"
              style={{ width: 120 }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) || defaultPageSize);
                setPage(1);
              }}
            >
              {pageSizeOptions.map((ps) => (
                <option key={ps} value={ps}>
                  {ps} records
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
