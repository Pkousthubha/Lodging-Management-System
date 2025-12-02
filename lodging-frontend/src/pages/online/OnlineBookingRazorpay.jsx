
import React, { useState } from "react";
import { useUi } from "../../context/UiContext.jsx";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function OnlineBookingRazorpay() {
  const { setGlobalLoading, showToast } = useUi();
  const [amount, setAmount] = useState(1500);

  const handlePayDemo = async () => {
    setGlobalLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      showToast("danger", "Unable to load Razorpay SDK");
      setGlobalLoading(false);
      return;
    }

    try {
      const options = {
        key: "rzp_test_demo",
        amount: Number(amount) * 100,
        currency: "INR",
        name: "Hotel Online Booking",
        description: "Demo payment integration",
        handler(response) {
          console.log(response);
          showToast("success", "Payment success (demo only).");
        },
        prefill: {
          name: "Demo Guest",
          email: "guest@example.com",
          contact: "9999999999"
        },
        theme: { color: "#9c27b0" }
      };
      const rp = new window.Razorpay(options);
      rp.open();
    } catch (err) {
      console.error(err);
      showToast("danger", "Payment failed (demo).");
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <h4 className="mb-3">Online Booking – Payment Integration (Demo)</h4>
      <p className="text-muted small mb-3">
        This screen demonstrates how an online booking flow can trigger Razorpay payment.
      </p>
      <div className="card app-card">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Amount (INR)</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="col-md-4 d-grid">
              <button className="btn btn-primary" onClick={handlePayDemo}>
                Pay with Razorpay (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
