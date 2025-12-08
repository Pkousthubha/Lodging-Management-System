import React from "react";

export default function Home() {
  return (
    <div className="w-full py-4">
      <div className="mb-8">
        <h4 className="mb-2 font-bold text-3xl tracking-tight text-[#1E1E1E]">Dashboard</h4>
        <p className="text-sm text-[#6B6B6B] mb-0">
          Quick overview of hotel performance across lodging, boarding, housekeeping, and billing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-[#E6E6E6] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5">
          <div className="text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-2">Occupancy</div>
          <div className="text-4xl font-bold mb-2 text-[#1E1E1E] leading-tight">78%</div>
          <div className="text-xs font-medium text-green-600">+5% vs last week</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E6E6E6] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5">
          <div className="text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-2">In-house Guests</div>
          <div className="text-4xl font-bold mb-2 text-[#1E1E1E] leading-tight">42</div>
          <div className="text-xs text-[#6B6B6B]">Across 32 rooms</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E6E6E6] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5">
          <div className="text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-2">Today's Revenue</div>
          <div className="text-4xl font-bold mb-2 text-[#1E1E1E] leading-tight">₹ 1.2L</div>
          <div className="text-xs text-[#6B6B6B]">Rooms + F&amp;B</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E6E6E6] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5">
          <div className="text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-2">Pending Check-outs</div>
          <div className="text-4xl font-bold mb-2 text-[#1E1E1E] leading-tight">6</div>
          <div className="text-xs font-medium text-yellow-600">Action required</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <div className="px-6 pt-6 pb-4 border-b border-[#E6E6E6]">
            <h6 className="text-base font-semibold text-[#1E1E1E] mb-0">Upcoming Arrivals</h6>
          </div>
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E6E6E6]">
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#FAFAFA]">Guest</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#FAFAFA]">Room Type</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#FAFAFA]">Check-in</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#FAFAFA]">Nights</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E6E6E6] hover:bg-[#F8F8F8] transition-colors">
                    <td className="py-3 px-2 text-[#1E1E1E]">Mr. Sharma</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Deluxe</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Today</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">2</td>
                  </tr>
                  <tr className="border-b border-[#E6E6E6] hover:bg-[#F8F8F8] transition-colors">
                    <td className="py-3 px-2 text-[#1E1E1E]">Ms. Rao</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Standard</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Today</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">1</td>
                  </tr>
                  <tr className="hover:bg-[#F8F8F8] transition-colors">
                    <td className="py-3 px-2 text-[#1E1E1E]">Corporate - ABC Ltd.</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Suite</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Tomorrow</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <div className="px-6 pt-6 pb-4 border-b border-[#E6E6E6]">
            <h6 className="text-base font-semibold text-[#1E1E1E] mb-0">Recent Online Bookings</h6>
          </div>
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E6E6E6]">
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#FAFAFA]">#</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#FAFAFA]">Guest</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#FAFAFA]">Dates</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#FAFAFA]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E6E6E6] hover:bg-[#F8F8F8] transition-colors">
                    <td className="py-3 px-2 text-[#1E1E1E]">OB-1024</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Mr. Iyer</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">12–14 May</td>
                    <td className="py-3 px-2">
                      <span className="chip chip-success">Paid</span>
                    </td>
                  </tr>
                  <tr className="border-b border-[#E6E6E6] hover:bg-[#F8F8F8] transition-colors">
                    <td className="py-3 px-2 text-[#1E1E1E]">OB-1025</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Ms. Khan</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">13–15 May</td>
                    <td className="py-3 px-2">
                      <span className="chip chip-warning">Pending</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F8F8F8] transition-colors">
                    <td className="py-3 px-2 text-[#1E1E1E]">OB-1026</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Walk-in</td>
                    <td className="py-3 px-2 text-[#6B6B6B]">Today</td>
                    <td className="py-3 px-2">
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
  );
}
