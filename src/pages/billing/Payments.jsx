import React, { useState } from "react";
import { addCharge, addPayment } from "../../services/folioService.js";
import { useUi } from "../../context/UiContext.jsx";

export default function Payments() {
  const { setGlobalLoading, showToast } = useUi();

  const [folioId, setFolioId] = useState("");

  const [chargeForm, setChargeForm] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxPercent: 0,
    sourceModule: "Manual",
    sourceRefId: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentMethodId: "",
    amount: 0,
    referenceNo: "",
    remarks: ""
  });

  const handleChargeChange = (e) => {
    const { name, value } = e.target;
    setChargeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCharge = async (e) => {
    e.preventDefault();
    if (!folioId) {
      showToast("warning", "Enter a Folio Id first.");
      return;
    }
    setGlobalLoading(true);
    try {
      const payload = {
        description: chargeForm.description,
        quantity: Number(chargeForm.quantity),
        unitPrice: Number(chargeForm.unitPrice),
        taxPercent: Number(chargeForm.taxPercent),
        sourceModule: chargeForm.sourceModule || null,
        sourceRefId: chargeForm.sourceRefId ? Number(chargeForm.sourceRefId) : null
      };
      await addCharge(Number(folioId), payload);
      showToast("success", "Charge posted to folio.");
      // Reset form
      setChargeForm({
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxPercent: 0,
        sourceModule: "Manual",
        sourceRefId: ""
      });
    } catch (err) {
      console.error(err);
      showToast("danger", "Failed to post charge.");
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!folioId) {
      showToast("warning", "Enter a Folio Id first.");
      return;
    }
    setGlobalLoading(true);
    try {
      const payload = {
        paymentMethodId: Number(paymentForm.paymentMethodId),
        amount: Number(paymentForm.amount),
        referenceNo: paymentForm.referenceNo || null,
        remarks: paymentForm.remarks || null
      };
      await addPayment(Number(folioId), payload);
      showToast("success", "Payment posted to folio.");
      // Reset form
      setPaymentForm({
        paymentMethodId: "",
        amount: 0,
        referenceNo: "",
        remarks: ""
      });
    } catch (err) {
      console.error(err);
      showToast("danger", "Failed to post payment.");
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="app-section-card mb-3">
        <h5 className="mb-1">Charges &amp; Payments</h5>
        <p className="text-muted small mb-3">
          Post manual charges (e.g. extras) and payments to an open folio.
        </p>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Folio Id</label>
            <input
              type="number"
              className="form-control"
              value={folioId}
              onChange={(e) => setFolioId(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="app-section-card">
            <h6 className="mb-2">Add Charge</h6>
            <form className="row g-3" onSubmit={handleAddCharge}>
              <div className="col-12">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  name="description"
                  className="form-control"
                  value={chargeForm.description}
                  onChange={handleChargeChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Qty</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  value={chargeForm.quantity}
                  onChange={handleChargeChange}
                  min="0"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Unit Price</label>
                <input
                  type="number"
                  name="unitPrice"
                  className="form-control"
                  value={chargeForm.unitPrice}
                  onChange={handleChargeChange}
                  min="0"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Tax %</label>
                <input
                  type="number"
                  name="taxPercent"
                  className="form-control"
                  value={chargeForm.taxPercent}
                  onChange={handleChargeChange}
                  min="0"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Source Ref (opt.)</label>
                <input
                  type="number"
                  name="sourceRefId"
                  className="form-control"
                  value={chargeForm.sourceRefId}
                  onChange={handleChargeChange}
                />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-outline-primary">
                  Post Charge
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="app-section-card">
            <h6 className="mb-2">Add Payment</h6>
            <form className="row g-3" onSubmit={handleAddPayment}>
              <div className="col-md-6">
                <label className="form-label">Payment Method Id</label>
                <input
                  type="number"
                  name="paymentMethodId"
                  className="form-control"
                  value={paymentForm.paymentMethodId}
                  onChange={handlePaymentChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  value={paymentForm.amount}
                  onChange={handlePaymentChange}
                  min="0"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Reference No</label>
                <input
                  type="text"
                  name="referenceNo"
                  className="form-control"
                  value={paymentForm.referenceNo}
                  onChange={handlePaymentChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  className="form-control"
                  value={paymentForm.remarks}
                  onChange={handlePaymentChange}
                />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-outline-success">
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
