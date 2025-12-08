// src/components/SmartTable.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

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
        <span className="ml-1 text-xs opacity-35">
          ↕
        </span>
      );
    }
    return (
      <span className="ml-1 text-xs">
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
      background: "inherit",
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
    <div className="flex flex-col min-h-0">
      <div className="flex-grow overflow-x-auto max-h-[420px]">
        <table className="w-full text-sm border border-gray-300 dark:border-slate-600 border-collapse">
          <thead
            className={`bg-slate-900 dark:bg-slate-900 text-white ${freezeHeader ? "sticky top-0 z-[12]" : ""}`}
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
                    className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider border-b border-r border-slate-700 dark:border-slate-600 whitespace-nowrap ${
                      enableSorting && colSortable ? "cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-800" : ""
                    }`}
                    onClick={() => handleSort(col.key, colSortable)}
                  >
                    <div className="flex items-center gap-1 relative">
                      <span
                        className={`${enableSorting && colSortable ? "hover:underline" : ""} select-none`}
                      >
                        {col.header}
                        {renderSortIcon(col, colSortable)}
                      </span>

                      {enableFiltering && colFilterable && (
                        <button
                          type="button"
                          className={`p-0 ml-1 text-slate-400 hover:text-blue-400 transition-colors ${
                            activeFilterKey === col.key ? "text-blue-500" : ""
                          }`}
                          title={`Filter ${col.header}`}
                          onClick={(e) => toggleFilterPopup(col.key, e)}
                        >
                          <span className="text-xs">⏷</span>
                        </button>
                      )}

                      {/* Filter popup */}
                      {enableFiltering &&
                        colFilterable &&
                        activeFilterKey === col.key && (
                          <div
                            className="absolute top-full left-0 z-30 mt-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-gray-300 dark:border-slate-600 rotate-45" />
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-300 dark:border-slate-600 min-w-[260px] shadow-lg">
                              <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden">
                                <span className="px-2 py-1.5 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                                  🔍
                                </span>
                                <input
                                  type="text"
                                  className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-0 outline-none"
                                  placeholder={`Search ${col.header}`}
                                  value={filters[col.key] || ""}
                                  onChange={(e) =>
                                    handleFilterChange(col.key, e.target.value)
                                  }
                                  autoFocus
                                />
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Enter minimum <strong>3 characters</strong> to search.
                              </div>
                              <div className="flex justify-end mt-2 gap-2">
                                <button
                                  type="button"
                                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                  onClick={() => {
                                    handleFilterChange(col.key, "");
                                    closeFilterPopup();
                                  }}
                                >
                                  Clear
                                </button>
                                <button
                                  type="button"
                                  className="px-3 py-1.5 text-xs font-medium bg-amber-600 dark:bg-amber-600 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-700 transition-colors"
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
          <tbody className="bg-white dark:bg-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-slate-500 dark:text-slate-400">
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
                    className={`${className} border-t border-r border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col, colIndex) => {
                      const accessor = col.accessor || ((r) => r[col.key]);
                      const stickyStyle = getStickyStyle(colIndex, false);
                      return (
                        <td key={col.key} className="px-3 py-2 border-r border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" style={stickyStyle}>
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
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {from}-{to} of {total} records
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={goFirst}
              disabled={page <= 1}
              title="First page"
            >
              «
            </button>
            <button
              type="button"
              className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={goPrev}
              disabled={page <= 1}
              title="Previous page"
            >
              ‹
            </button>
            <button
              type="button"
              className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={goNext}
              disabled={page >= totalPages}
              title="Next page"
            >
              ›
            </button>
            <button
              type="button"
              className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={goLast}
              disabled={page >= totalPages}
              title="Last page"
            >
              »
            </button>

            <select
              className="ml-2 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
