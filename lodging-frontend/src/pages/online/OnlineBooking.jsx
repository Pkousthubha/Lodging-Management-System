
import React from "react";

export default function OnlineBooking() {
  return (
    <div className="container-fluid py-3">
      <h4 className="mb-3">Online Booking (Public Widget)</h4>
      <p className="text-muted small mb-3">
        This page represents the public-facing booking widget: select dates, room type, and guests.
        It can call the /api/OnlineBooking APIs when integrated with the backend.
      </p>
      <div className="card app-card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Check-in</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Check-out</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Room Type</label>
              <select className="form-select">
                <option>Any</option>
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Suite</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Guests</label>
              <input type="number" min="1" className="form-control" defaultValue={2} />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-primary">Search Rooms</button>
            </div>
          </div>
        </div>
      </div>
      <div className="card app-card">
        <div className="card-body">
          <p className="small mb-0">
            TODO: display available rooms and connect confirm action to the OnlineBooking Web API.
          </p>
        </div>
      </div>
    </div>
  );
}
