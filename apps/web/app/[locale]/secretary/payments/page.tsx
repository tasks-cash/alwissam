"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiPost } from "../../../../lib/api";
import { useDashboardSession } from "../../../../lib/use-dashboard-session";

type Invoice = {
  id: string;
  invoiceNumber: string;
  patientName?: string;
  remainingAmount: string;
  totalAmount: string;
  status: string;
};

type Payment = {
  id: string;
  receiptNumber: string;
  patientName?: string;
  amount: string;
  method: string;
  paymentDate: string;
};

const METHODS = ["CASH", "CARD", "BANK_TRANSFER", "OTHER"] as const;

export default function SecretaryPaymentsPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST"],
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [methods, setMethods] = useState<Record<string, string>>({});
  const [create, setCreate] = useState({
    patientId: "",
    totalAmount: "",
    notes: "",
  });
  const [patients, setPatients] = useState<
    { id: string; fullName: string; patientNumber: string }[]
  >([]);

  const load = useCallback(async () => {
    const [iRes, pRes, patRes] = await Promise.all([
      fetch("/api/secretary/invoices/open", { credentials: "include" }),
      fetch("/api/secretary/payments/recent", { credentials: "include" }),
      fetch("/api/patients?pageSize=100", { credentials: "include" }),
    ]);
    if (iRes.ok) {
      const d = await iRes.json();
      setInvoices(Array.isArray(d.invoices) ? d.invoices : []);
    }
    if (pRes.ok) {
      const d = await pRes.json();
      setPayments(Array.isArray(d.payments) ? d.payments : []);
    }
    if (patRes.ok) {
      const d = await patRes.json();
      setPatients(Array.isArray(d.patients) ? d.patients : []);
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function collect(invoiceId: string) {
    setBusy(invoiceId);
    setMsg("");
    setErr("");
    const { ok, data } = await apiPost<{ message?: string }>(
      "/api/secretary/collect-charge",
      {
        invoiceId,
        method: methods[invoiceId] || "CASH",
      },
    );
    setBusy("");
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || dict.successSaved);
    void load();
  }

  async function createInvoice(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const { ok, data } = await apiPost<{ message?: string }>(
      "/api/secretary/invoices",
      {
        patientId: create.patientId,
        totalAmount: Number(create.totalAmount),
        notes: create.notes || undefined,
      },
    );
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || dict.successSaved);
    setCreate({ patientId: "", totalAmount: "", notes: "" });
    void load();
  }

  if (loading || !user) {
    return <main className="dash-panel">{dict.loading}</main>;
  }
  if (error) {
    return <main className="dash-panel alert-error">{error}</main>;
  }

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title={dict.navPayments}
      description={dict.secretaryDashboardLead}
    >
      {msg ? <div className="alert-success">{msg}</div> : null}
      {err ? <div className="alert-error">{err}</div> : null}

      <section className="card-surface dash-actions">
        <h2>{dict.createAppointment /* reuse label slot */}</h2>
        <p className="muted">Invoice</p>
        <form className="stack-form" onSubmit={createInvoice}>
          <div className="row-2">
            <div className="field">
              <label htmlFor="patientId">{dict.patient}</label>
              <select
                id="patientId"
                className="input"
                required
                value={create.patientId}
                onChange={(e) =>
                  setCreate((c) => ({ ...c, patientId: e.target.value }))
                }
              >
                <option value="">—</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patientNumber} — {p.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="totalAmount">Amount</label>
              <input
                id="totalAmount"
                className="input"
                required
                inputMode="decimal"
                value={create.totalAmount}
                onChange={(e) =>
                  setCreate((c) => ({ ...c, totalAmount: e.target.value }))
                }
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">
            {dict.save}
          </button>
        </form>
      </section>

      <section className="card-surface dash-actions">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Open invoices</h2>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
        {invoices.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{dict.patient}</th>
                  <th>Total</th>
                  <th>Remaining</th>
                  <th>{dict.status}</th>
                  <th>{dict.actions}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} id={`invoice-${inv.id}`}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.patientName || "—"}</td>
                    <td dir="ltr">{inv.totalAmount}</td>
                    <td dir="ltr">{inv.remainingAmount}</td>
                    <td>
                      <span className="badge">{inv.status}</span>
                    </td>
                    <td>
                      <div className="toolbar">
                        <select
                          className="input"
                          value={methods[inv.id] || "CASH"}
                          onChange={(e) =>
                            setMethods((m) => ({
                              ...m,
                              [inv.id]: e.target.value,
                            }))
                          }
                        >
                          {METHODS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={busy === inv.id}
                          onClick={() => void collect(inv.id)}
                        >
                          {busy === inv.id ? dict.saving : "Collect"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-surface dash-actions">
        <h2>Recent payments</h2>
        {payments.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>RCP</th>
                  <th>{dict.patient}</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.receiptNumber}</td>
                    <td>{p.patientName || "—"}</td>
                    <td dir="ltr">{p.amount}</td>
                    <td>{p.method}</td>
                    <td>{new Date(p.paymentDate).toLocaleString(locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
