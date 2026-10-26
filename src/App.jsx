import AIFeatures from "./components/AIFeatures";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  Plus,
  Search,
  Clock3,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  CircleAlert,
  Menu,
  X,
  ArrowUpRight,
  CalendarCheck,
  ClipboardList,
  RefreshCw,
  Sparkles
} from "lucide-react";
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from "./api";


const EMPTY_FORM = {
  title: "", date: "", startTime: "09:00", endTime: "10:00",
  location: "", status: "Planned", description: ""
};
const STATUSES = ["Planned", "In Progress", "Completed", "Cancelled"];

function formatDate(date) {
  if (!date) return "No date";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });
}
function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  async function loadSchedules() {
    setLoading(true);
    setError("");
    try {
      const data = await getSchedules(search, filterStatus);
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSchedules(); }, [search, filterStatus]);

  const counts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: schedules.length,
      upcoming: schedules.filter(s => s.date >= today && s.status !== "Completed" && s.status !== "Cancelled").length,
      completed: schedules.filter(s => s.status === "Completed").length,
      inProgress: schedules.filter(s => s.status === "In Progress").length
    };
  }, [schedules]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setNotice("");
    setPage("Add Schedule");
    setMobileNav(false);
  }

  function openEdit(schedule) {
    setEditingId(schedule._id);
    setForm({
      title: schedule.title || "", date: schedule.date || "",
      startTime: schedule.startTime || "09:00", endTime: schedule.endTime || "10:00",
      location: schedule.location || "", status: schedule.status || "Planned",
      description: schedule.description || ""
    });
    setError("");
    setNotice("");
    setPage("Edit Schedule");
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editingId) await updateSchedule(editingId, form);
      else await createSchedule(form);
      setNotice(editingId ? "Schedule updated successfully." : "Schedule created successfully.");
      setForm(EMPTY_FORM);
      setEditingId(null);
      setPage("Schedules");
      await loadSchedules();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(schedule) {
    if (!window.confirm(`Delete "${schedule.title}"? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await deleteSchedule(schedule._id);
      setNotice("Schedule deleted successfully.");
      await loadSchedules();
    } catch (err) {
      setError(err.message);
    }
  }
const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Schedules", icon: ListTodo },
  { name: "AI Assistant", icon: Sparkles }
];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><CalendarCheck size={23} /></div>
          <div><strong>SCHEAD EASE</strong><span>Schedule Management System</span></div>
          <button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19} /></button>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav>
          {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.name} className={`nav-link ${page === item.name ? "active" : ""}`} onClick={() => { setPage(item.name); setMobileNav(false); }}>
              <Icon size={18} /> <span>{item.name}</span>
            </button>;
          })}
          <button className={`nav-link ${page === "Add Schedule" || page === "Edit Schedule" ? "active" : ""}`} onClick={openCreate}>
            <Plus size={18} /> <span>Add Schedule</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><div className="tip-icon"><CalendarDays size={17} /></div><strong>Stay organized</strong><p>Keep your day clear and your plans in one place.</p></div>
          <div className="profile"><div className="avatar">SM</div><div><strong>Schedule Manager</strong><span>Workspace</span></div></div>
        </div>
      </aside>

      {mobileNav && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumbs">Workspace <span>/</span> <strong>{page}</strong></div>
          <div className="topbar-right"><div className="today-chip"><CalendarDays size={15} /> {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div><div className="avatar small-avatar">SM</div></div>
        </header>

        <div className="page-wrap">
          {error && <div className="alert error-alert"><CircleAlert size={18} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button></div>}
          {notice && <div className="alert success-alert"><CheckCircle2 size={18} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16} /></button></div>}

          {page === "Dashboard" && (
            <>
              <div className="page-heading heading-row">
                <div><div className="eyebrow">YOUR OVERVIEW</div><h1>Good day! <span className="wave">✦</span></h1><p>Here’s what’s happening with your schedule.</p></div>
                <button className="primary-button" onClick={openCreate}><Plus size={18} /> Add Schedule</button>
              </div>
              <section className="stats-grid">
                <StatCard icon={<ClipboardList size={20} />} tone="purple" label="Total schedules" value={counts.total} foot="Matching current view" />
                <StatCard icon={<CalendarDays size={20} />} tone="blue" label="Upcoming" value={counts.upcoming} foot="Planned or in progress" />
                <StatCard icon={<Clock3 size={20} />} tone="orange" label="In progress" value={counts.inProgress} foot="Currently underway" />
                <StatCard icon={<CheckCircle2 size={20} />} tone="green" label="Completed" value={counts.completed} foot="Marked as completed" />
              </section>
              <section className="panel dashboard-panel">
                <div className="panel-heading"><div><h2>Recent schedules</h2><p>Your next plans at a glance</p></div><button className="text-button" onClick={() => setPage("Schedules")}>View all <ArrowUpRight size={16} /></button></div>
                {loading ? <Loading /> : schedules.length === 0 ? <EmptyState onAdd={openCreate} /> : <div className="recent-list">
                  {schedules.slice(0, 5).map(s => <ScheduleRow key={s._id} schedule={s} onEdit={openEdit} onDelete={handleDelete} />)}
                </div>}
              </section>
              <div className="bottom-note"><span className="note-dot" /> Your schedules are saved in your MongoDB database.</div>
            </>
          )}

          {page === "Schedules" && (
            <>
              <div className="page-heading heading-row">
                <div><div className="eyebrow">STAY ON TRACK</div><h1>All schedules</h1><p>Search, review, and manage your plans.</p></div>
                <button className="primary-button" onClick={openCreate}><Plus size={18} /> Add Schedule</button>
              </div>
              <section className="panel schedule-panel">
                <div className="toolbar">
                  <div className="search-box"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, location, description..." aria-label="Search schedules" />{search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}</div>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                  <button className="secondary-button refresh-button" onClick={loadSchedules} title="Refresh"><RefreshCw size={16} /><span>Refresh</span></button>
                </div>
                <div className="list-meta"><span>{schedules.length} schedule{schedules.length === 1 ? "" : "s"} found</span><span>Sorted by date</span></div>
                {loading ? <Loading /> : schedules.length === 0 ? <EmptyState onAdd={openCreate} searching={Boolean(search || filterStatus)} /> : <div className="schedule-list">
                  {schedules.map(s => <ScheduleRow key={s._id} schedule={s} onEdit={openEdit} onDelete={handleDelete} />)}
                </div>}
              </section>
            </>
          )}
          {page === "AI Assistant" && (
  <section className="panel" style={{ padding: "24px" }}>
    <div className="page-heading">
      <div className="eyebrow">SMART PLANNING</div>
      <h1>AI Schedule Assistant</h1>
      <p>
        Create schedules, find available times, and review your schedule summary.
      </p>
    </div>

    <AIFeatures />
  </section>
)}

          {(page === "Add Schedule" || page === "Edit Schedule") && (
            <>
              <div className="page-heading"><div className="eyebrow">PLAN YOUR TIME</div><h1>{editingId ? "Edit schedule" : "Add a schedule"}</h1><p>{editingId ? "Update the details for this schedule." : "Fill in the details below to create a new schedule."}</p></div>
              <section className="panel form-panel">
                <form onSubmit={handleSave}>
                  <div className="form-section-title"><span className="section-number">01</span><div><h2>Schedule details</h2><p>Give your plan a clear title and time.</p></div></div>
                  <div className="form-grid">
                    <label className="field full-field">Schedule title <span>*</span><input required maxLength="120" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Team meeting" /></label>
                    <label className="field">Date <span>*</span><input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
                    <label className="field">Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
                    <label className="field">Start time <span>*</span><input required type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></label>
                    <label className="field">End time <span>*</span><input required type="time" min={form.startTime} value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></label>
                    <label className="field full-field">Location<input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Meeting room or online" /></label>
                    <label className="field full-field">Description<textarea rows="4" maxLength="1000" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add notes or details (optional)" /></label>
                  </div>
                  <div className="form-footer"><span><span className="required-star">*</span> Required fields</span><div><button type="button" className="secondary-button" onClick={() => { setPage(editingId ? "Schedules" : "Dashboard"); setError(""); }}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : <>{editingId ? "Save Changes" : "Save Schedule"} <ArrowUpRight size={17} /></>}</button></div></div>
                </form>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, tone, label, value, foot }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>;
}

function ScheduleRow({ schedule, onEdit, onDelete }) {
  return <article className="schedule-row">
    <div className="date-block"><span>{new Date(`${schedule.date}T00:00:00`).toLocaleDateString(undefined, { month: "short" }).toUpperCase()}</span><strong>{new Date(`${schedule.date}T00:00:00`).getDate()}</strong><small>{new Date(`${schedule.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</small></div>
    <div className="schedule-info"><div className="schedule-title-line"><h3>{schedule.title}</h3><span className={`status-badge ${statusClass(schedule.status)}`}>{schedule.status}</span></div><div className="schedule-details"><span><Clock3 size={14} /> {schedule.startTime} – {schedule.endTime}</span>{schedule.location && <span><MapPin size={14} /> {schedule.location}</span>}</div>{schedule.description && <p className="schedule-description">{schedule.description}</p>}</div>
    <div className="row-actions"><button className="action-button edit-action" onClick={() => onEdit(schedule)} title="Edit schedule" aria-label={`Edit ${schedule.title}`}><Pencil size={16} /><span>Edit</span></button><button className="action-button delete-action" onClick={() => onDelete(schedule)} title="Delete schedule" aria-label={`Delete ${schedule.title}`}><Trash2 size={16} /></button></div>
  </article>;
}

function Loading() {
  return <div className="loading-state"><span className="spinner" /> Loading schedules...</div>;
}
function EmptyState({ onAdd, searching = false }) {
  return <div className="empty-state"><div className="empty-icon"><CalendarDays size={26} /></div><h3>{searching ? "No matching schedules" : "Nothing scheduled yet"}</h3><p>{searching ? "Try another keyword or clear the status filter." : "Create your first schedule to get your plans organized."}</p>{!searching && <button className="primary-button" onClick={onAdd}><Plus size={17} /> Create schedule</button>}</div>;
}
