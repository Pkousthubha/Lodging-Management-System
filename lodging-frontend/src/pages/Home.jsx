import React from "react";

export default function Home() {
  return (
    <div className="container-fluid py-2">
      <div className="page-inner">
        <h4 className="mb-2">Dashboard</h4>
        <p className="text-muted small mb-4">
          Quick overview of hotel performance across lodging, boarding, housekeeping, and billing.
        </p>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card app-card h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Occupancy</div>
                <div className="fs-1 fw-semibold">78%</div>
                <div className="small text-success">+5% vs last week</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card app-card h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">In-house Guests</div>
                <div className="fs-1 fw-semibold">42</div>
                <div className="small text-muted">Across 32 rooms</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card app-card h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Today's Revenue</div>
                <div className="fs-1 fw-semibold">₹ 1.2L</div>
                <div className="small text-muted">Rooms + F&amp;B</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card app-card h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Pending Check-outs</div>
                <div className="fs-1 fw-semibold">6</div>
                <div className="small text-warning">Action required</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card app-card h-100">
              <div className="card-header border-0 pb-0">
                <h6 className="mb-1">Upcoming Arrivals</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Guest</th>
                        <th>Room Type</th>
                        <th>Check-in</th>
                        <th>Nights</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Mr. Sharma</td>
                        <td>Deluxe</td>
                        <td>Today</td>
                        <td>2</td>
                      </tr>
                      <tr>
                        <td>Ms. Rao</td>
                        <td>Standard</td>
                        <td>Today</td>
                        <td>1</td>
                      </tr>
                      <tr>
                        <td>Corporate - ABC Ltd.</td>
                        <td>Suite</td>
                        <td>Tomorrow</td>
                        <td>3</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card app-card h-100">
              <div className="card-header border-0 pb-0">
                <h6 className="mb-1">Recent Online Bookings</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Guest</th>
                        <th>Dates</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>OB-1024</td>
                        <td>Mr. Iyer</td>
                        <td>12–14 May</td>
                        <td>
                          <span className="chip chip-success">Paid</span>
                        </td>
                      </tr>
                      <tr>
                        <td>OB-1025</td>
                        <td>Ms. Khan</td>
                        <td>13–15 May</td>
                        <td>
                          <span className="chip chip-warning">Pending</span>
                        </td>
                      </tr>
                      <tr>
                        <td>OB-1026</td>
                        <td>Walk-in</td>
                        <td>Today</td>
                        <td>
                          <span className="chip chip-muted">Converted</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
