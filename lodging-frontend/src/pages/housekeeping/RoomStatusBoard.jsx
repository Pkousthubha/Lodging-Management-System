import React from "react";

export default function RoomStatusBoard() {
  return (
    <div className="container-fluid">
      <div className="app-section-card">
        <h5 className="mb-1">Room Status Board</h5>
        <p className="text-muted small mb-3">
          Color-coded housekeeping view of clean / dirty / maintenance rooms.
        </p>
        <div className="table-responsive">
          <table className="table table-sm table-dark table-striped align-middle table-dark-neo">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Code / No</th>
                <th scope="col">Name / Description</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  Configure API bindings and replace this placeholder table with live data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
