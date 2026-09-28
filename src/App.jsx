import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronLeft, CircleDot, Clock3,
  Filter, Plus, Search, Trash2, X
} from "lucide-react";
import { seedTickets } from "./data/tickets";

const STORAGE_KEY = "builtbygsv-support-desk-tickets";
const statuses = ["Open", "In Progress", "Resolved"];
const priorities = ["Low", "Medium", "High"];

function loadTickets() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedTickets;
  } catch {
    return seedTickets;
  }
}

function App() {
  const [tickets, setTickets] = useState(loadTickets);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  const stats = useMemo(() => ({
    Total: tickets.length,
    Open: tickets.filter(t => t.status === "Open").length,
    "In Progress": tickets.filter(t => t.status === "In Progress").length,
    Resolved: tickets.filter(t => t.status === "Resolved").length
  }), [tickets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter(t => {
      const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.client.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, query, statusFilter, priorityFilter]);

  const selected = tickets.find(t => t.id === selectedId);

  function addTicket(data) {
    const id = `TKT-${String(Date.now()).slice(-6)}`;
    setTickets(prev => [{ id, ...data, created_date: new Date().toISOString().slice(0, 10) }, ...prev]);
    setShowForm(false);
    setSelectedId(id);
  }

  function updateTicket(id, changes) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));
  }

  function removeTicket(id) {
    setTickets(prev => prev.filter(t => t.id !== id));
    setDeleteId(null);
    setSelectedId(null);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">Support Desk</div>
            <div className="brand-subtitle">BuiltbyGSV · Internal tools</div>
          </div>
        </div>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          <Plus size={17} /> New ticket
        </button>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">SUPPORT OPERATIONS</p>
            <h1>Keep every request moving.</h1>
            <p className="hero-copy">A lightweight workspace for tracking client support requests from open to resolved.</p>
          </div>
        </section>

        <section className="stats-grid" aria-label="Ticket statistics">
          <StatCard label="Total tickets" value={stats.Total} icon={<CircleDot />} />
          <StatCard label="Open" value={stats.Open} icon={<Clock3 />} tone="open" />
          <StatCard label="In Progress" value={stats["In Progress"]} icon={<AlertTriangle />} tone="progress" />
          <StatCard label="Resolved" value={stats.Resolved} icon={<CheckCircle2 />} tone="resolved" />
        </section>

        {selected ? (
          <TicketDetails
            ticket={selected}
            onBack={() => setSelectedId(null)}
            onUpdate={updateTicket}
            onDelete={() => setDeleteId(selected.id)}
          />
        ) : (
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Support tickets</h2>
                <p>{filtered.length} of {tickets.length} tickets shown</p>
              </div>
              <div className="filters">
                <div className="search-box">
                  <Search size={17} />
                  <input aria-label="Search tickets" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tickets..." />
                  {query && <button className="icon-btn" onClick={() => setQuery("")}><X size={15}/></button>}
                </div>
                <SelectFilter value={statusFilter} onChange={setStatusFilter} options={["All", ...statuses]} />
                <SelectFilter value={priorityFilter} onChange={setPriorityFilter} options={["All", ...priorities]} />
              </div>
            </div>

            <div className="ticket-table">
              <div className="table-header">
                <span>Ticket</span><span>Client</span><span>Priority</span><span>Status</span><span>Created</span><span></span>
              </div>
              {filtered.map(ticket => (
                <button className="ticket-row" key={ticket.id} onClick={() => setSelectedId(ticket.id)}>
                  <div className="ticket-title">
                    <strong>{ticket.title}</strong>
                    <small>{ticket.id}</small>
                  </div>
                  <span>{ticket.client}</span>
                  <span><PriorityBadge value={ticket.priority} /></span>
                  <span><StatusBadge value={ticket.status} /></span>
                  <span className="date">{formatDate(ticket.created_date)}</span>
                  <span className="row-arrow">→</span>
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="empty-state">
                <Filter size={28} />
                <h3>No tickets found</h3>
                <p>Try changing your search or filters.</p>
                <button className="secondary-btn" onClick={() => {setQuery(""); setStatusFilter("All"); setPriorityFilter("All");}}>Clear filters</button>
              </div>
            )}
          </section>
        )}
      </main>

      {showForm && <TicketForm onClose={() => setShowForm(false)} onSubmit={addTicket} />}
      {deleteId && <DeleteModal onCancel={() => setDeleteId(null)} onConfirm={() => removeTicket(deleteId)} />}
    </div>
  );
}

function StatCard({ label, value, icon, tone = "" }) {
  return <div className={`stat-card ${tone}`}><div className="stat-icon">{icon}</div><div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div></div>;
}

function SelectFilter({ value, onChange, options }) {
  return <select className="filter-select" value={value} onChange={e => onChange(e.target.value)} aria-label="Filter">{options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
}

function PriorityBadge({ value }) {
  return <span className={`badge priority-${value.toLowerCase()}`}>{value}</span>;
}

function StatusBadge({ value }) {
  return <span className={`badge status-${value.toLowerCase().replace(" ", "-")}`}>{value}</span>;
}

function TicketDetails({ ticket, onBack, onUpdate, onDelete }) {
  return <section className="details-panel">
    <button className="back-btn" onClick={onBack}><ChevronLeft size={18}/> Back to tickets</button>
    <div className="details-head">
      <div>
        <span className="ticket-id">{ticket.id}</span>
        <h2>{ticket.title}</h2>
        <p>Created {formatDate(ticket.created_date)} · {ticket.client}</p>
      </div>
      <button className="danger-btn" onClick={onDelete}><Trash2 size={16}/> Delete</button>
    </div>
    <div className="detail-grid">
      <DetailControl label="Status">
        <select value={ticket.status} onChange={e => onUpdate(ticket.id, {status: e.target.value})}>{statuses.map(s => <option key={s}>{s}</option>)}</select>
      </DetailControl>
      <DetailControl label="Priority">
        <select value={ticket.priority} onChange={e => onUpdate(ticket.id, {priority: e.target.value})}>{priorities.map(p => <option key={p}>{p}</option>)}</select>
      </DetailControl>
      <DetailControl label="Client"><div className="read-only">{ticket.client}</div></DetailControl>
      <DetailControl label="Created date"><div className="read-only">{formatDate(ticket.created_date)}</div></DetailControl>
    </div>
    <div className="details-note">
      <strong>Ticket workflow</strong>
      <p>Update the status as work progresses: Open → In Progress → Resolved.</p>
    </div>
  </section>;
}

function DetailControl({ label, children }) {
  return <label className="detail-control"><span>{label}</span>{children}</label>;
}

function TicketForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({title: "", client: "", priority: "Medium", status: "Open"});
  const [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.client.trim()) return setError("Title and client are required.");
    onSubmit({...form, title: form.title.trim(), client: form.client.trim()});
  }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><div><p className="eyebrow">NEW REQUEST</p><h2>Create ticket</h2></div><button type="button" className="icon-btn large" onClick={onClose}><X/></button></div>
      <label>Title<input autoFocus value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Describe the issue" /></label>
      <label>Client<input value={form.client} onChange={e => setForm({...form,client:e.target.value})} placeholder="Client name" /></label>
      <div className="form-row">
        <label>Priority<select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}>{priorities.map(p=><option key={p}>{p}</option>)}</select></label>
        <label>Status<select value={form.status} onChange={e => setForm({...form,status:e.target.value})}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn">Create ticket</button></div>
    </form>
  </div>;
}

function DeleteModal({ onCancel, onConfirm }) {
  return <div className="modal-backdrop">
    <div className="modal small">
      <div className="danger-circle"><Trash2/></div>
      <h2>Delete this ticket?</h2>
      <p>This action cannot be undone. The ticket will be removed from this browser.</p>
      <div className="modal-actions"><button className="secondary-btn" onClick={onCancel}>Cancel</button><button className="danger-btn solid" onClick={onConfirm}>Delete ticket</button></div>
    </div>
  </div>;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {day: "2-digit", month: "short", year: "numeric"}).format(new Date(`${date}T00:00:00`));
}

export default App;