import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LeadModal from '../components/LeadModal';

const STATUS_COLORS = {
  new:       { bg: '#E6F1FB', color: '#0C447C' },
  contacted: { bg: '#FAEEDA', color: '#633806' },
  converted: { bg: '#EAF3DE', color: '#27500A' },
  lost:      { bg: '#FCEBEB', color: '#791F1F' }
};

const AVATAR_COLORS = [
  { bg: '#B5D4F4', color: '#0C447C' },
  { bg: '#9FE1CB', color: '#085041' },
  { bg: '#F5C4B3', color: '#712B13' },
  { bg: '#CECBF6', color: '#3C3489' },
  { bg: '#FAC775', color: '#633806' }
];

function initials(name) { return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(); }
function avatarStyle(name) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function fmtDate(iso) { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function Dashboard() {
  const { admin, logout } = useAuth();
  const [leads, setLeads]     = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Filters
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [sourceFilter, setSource] = useState('');
  const [sort, setSort]           = useState('newest');
  const [activeTab, setActiveTab] = useState('all');

  // Modal
  const [modal, setModal] = useState(null); // null | {} (new) | lead object (edit)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      if (sort === 'oldest') params.sort = 'oldest';
      if (sort === 'name')   params.sort = 'name';

      const [leadsRes, statsRes] = await Promise.all([
        axios.get('/api/leads', { params }),
        axios.get('/api/leads/stats')
      ]);
      setLeads(leadsRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load leads. Make sure the backend is running.');
    }
    setLoading(false);
  }, [search, statusFilter, sourceFilter, sort]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/leads/${id}`, { status });
      fetchLeads();
    } catch {}
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await axios.delete(`/api/leads/${id}`);
      fetchLeads();
    } catch {}
  };

  const onSaved = () => fetchLeads();

  // Filter leads by active tab
  const displayed = activeTab === 'all' ? leads : leads.filter(l => l.status === activeTab);

  const tabCount = (key) => key === 'all' ? leads.length : leads.filter(l => l.status === key).length;

  return (
    <div style={S.app}>
      {/* ── Sidebar ── */}
      <aside style={S.sidebar}>
        <div style={S.logoArea}>
          <div style={S.logoBox}>CRM</div>
          <div>
            <div style={S.logoName}>Mini CRM</div>
            <div style={S.logoSub}>Lead Manager</div>
          </div>
        </div>
        <nav style={S.nav}>
          {[
            { key: 'all',       label: 'All Leads' },
            { key: 'new',       label: 'New' },
            { key: 'contacted', label: 'Contacted' },
            { key: 'converted', label: 'Converted' },
            { key: 'lost',      label: 'Lost' }
          ].map(t => (
            <button key={t.key} style={{ ...S.navItem, ...(activeTab === t.key ? S.navActive : {}) }} onClick={() => setActiveTab(t.key)}>
              <span>{t.label}</span>
              <span style={S.navCount}>{tabCount(t.key)}</span>
            </button>
          ))}
        </nav>
        <div style={S.sidebarFooter}>
          <div style={S.adminInfo}>
            <div style={S.adminAvatar}>{admin?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={S.adminName}>{admin?.name}</div>
              <div style={S.adminEmail}>{admin?.email}</div>
            </div>
          </div>
          <button style={S.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={S.main}>
        {/* Header */}
        <div style={S.topBar}>
          <div>
            <h1 style={S.pageTitle}>Lead Management</h1>
            <div style={S.pageSub}>Track and manage all your incoming client leads</div>
          </div>
          <button style={S.addBtn} onClick={() => setModal({})}>+ Add Lead</button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={S.statsGrid}>
            {[
              { label: 'Total Leads',  value: stats.total,     sub: 'All time' },
              { label: 'New',          value: stats.new,       sub: 'Awaiting contact' },
              { label: 'Contacted',    value: stats.contacted, sub: 'In progress' },
              { label: 'Converted',    value: stats.converted, sub: `${stats.total ? Math.round(stats.converted/stats.total*100) : 0}% rate` },
            ].map(c => (
              <div key={c.label} style={S.statCard}>
                <div style={S.statLabel}>{c.label}</div>
                <div style={S.statValue}>{c.value}</div>
                <div style={S.statSub}>{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={S.toolbar}>
          <input style={S.searchInput} placeholder="Search by name, email, company..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={S.select} value={sourceFilter} onChange={e => setSource(e.target.value)}>
            <option value="">All Sources</option>
            {['Website','LinkedIn','Referral','Cold Email','Event','Other'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={S.select} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {/* Error */}
        {error && <div style={S.errorBox}>{error}</div>}

        {/* Table */}
        <div style={S.tableWrap}>
          {loading ? (
            <div style={S.loading}>Loading leads...</div>
          ) : displayed.length === 0 ? (
            <div style={S.empty}>No leads found. Add your first lead or adjust filters.</div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['Name / Email','Company','Source','Status','Added','Notes','Actions'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(lead => {
                  const av = avatarStyle(lead.name);
                  const st = STATUS_COLORS[lead.status] || STATUS_COLORS.new;
                  return (
                    <tr key={lead._id} style={S.tr}>
                      <td style={S.td}>
                        <div style={S.nameCell}>
                          <div style={{ ...S.avatar, background: av.bg, color: av.color }}>{initials(lead.name)}</div>
                          <div>
                            <div style={S.leadName}>{lead.name}</div>
                            <div style={S.leadEmail}>{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...S.td, color: '#777', fontSize: 13 }}>{lead.company || '—'}</td>
                      <td style={S.td}><span style={S.sourceBadge}>{lead.source}</span></td>
                      <td style={S.td}>
                        <select style={{ ...S.statusSelect, background: st.bg, color: st.color }}
                          value={lead.status} onChange={e => updateStatus(lead._id, e.target.value)}>
                          {['new','contacted','converted','lost'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ ...S.td, fontSize: 12, color: '#aaa' }}>{fmtDate(lead.createdAt)}</td>
                      <td style={{ ...S.td, fontSize: 12, color: '#888' }}>
                        {lead.notes?.length ? `${lead.notes.length} note${lead.notes.length > 1 ? 's' : ''}` : '—'}
                      </td>
                      <td style={S.td}>
                        <div style={S.actions}>
                          <button style={S.iconBtn} title="Edit" onClick={() => setModal(lead)}>✎</button>
                          <button style={{ ...S.iconBtn, color: '#c00' }} title="Delete" onClick={() => deleteLead(lead._id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal */}
      {modal !== null && (
        <LeadModal lead={modal} onClose={() => setModal(null)} onSaved={onSaved} />
      )}
    </div>
  );
}

const S = {
  app: { display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f5f5f0' },
  sidebar: { width: 220, background: '#fff', borderRight: '1px solid #e5e5e0', display: 'flex', flexDirection: 'column', padding: '1.25rem 0', flexShrink: 0 },
  logoArea: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 1rem 1.25rem', borderBottom: '1px solid #f0f0f0', marginBottom: '0.75rem' },
  logoBox: { width: 36, height: 36, background: '#185FA5', color: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 },
  logoName: { fontWeight: 600, fontSize: 14, color: '#1a1a1a' },
  logoSub: { fontSize: 11, color: '#aaa' },
  nav: { flex: 1, padding: '0 0.5rem' },
  navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 10px', borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#555', marginBottom: 2 },
  navActive: { background: '#E6F1FB', color: '#185FA5', fontWeight: 500 },
  navCount: { fontSize: 11, color: '#aaa', background: '#f0f0f0', padding: '1px 6px', borderRadius: 10 },
  sidebarFooter: { padding: '1rem', borderTop: '1px solid #f0f0f0' },
  adminInfo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  adminAvatar: { width: 30, height: 30, borderRadius: '50%', background: '#185FA5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 },
  adminName: { fontSize: 12, fontWeight: 500, color: '#333' },
  adminEmail: { fontSize: 11, color: '#aaa' },
  logoutBtn: { width: '100%', padding: '6px', background: '#fff', border: '1px solid #e5e5e0', borderRadius: 7, fontSize: 12, cursor: 'pointer', color: '#555' },
  main: { flex: 1, padding: '1.5rem 2rem', overflowX: 'auto' },
  topBar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: 12 },
  pageTitle: { fontSize: 20, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 },
  pageSub: { fontSize: 13, color: '#888' },
  addBtn: { padding: '9px 16px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.25rem' },
  statCard: { background: '#fff', border: '1px solid #e5e5e0', borderRadius: 10, padding: '12px 14px' },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 600, color: '#1a1a1a' },
  statSub: { fontSize: 11, color: '#aaa', marginTop: 2 },
  toolbar: { display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 200, padding: '8px 12px', fontSize: 13, border: '1px solid #ddd', borderRadius: 7, outline: 'none', fontFamily: 'inherit' },
  select: { padding: '8px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 7, background: '#fff', fontFamily: 'inherit' },
  errorBox: { background: '#fff0f0', border: '1px solid #fcc', color: '#c00', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 },
  tableWrap: { background: '#fff', border: '1px solid #e5e5e0', borderRadius: 12, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#888', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' },
  tr: { borderBottom: '1px solid #f8f8f5' },
  td: { padding: '11px 14px', verticalAlign: 'middle' },
  nameCell: { display: 'flex', alignItems: 'center', gap: 9 },
  avatar: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 },
  leadName: { fontWeight: 500, color: '#1a1a1a', fontSize: 13 },
  leadEmail: { fontSize: 11, color: '#aaa' },
  sourceBadge: { background: '#f5f5f0', color: '#666', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  statusSelect: { fontSize: 12, padding: '3px 8px', border: '1px solid transparent', borderRadius: 6, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  actions: { display: 'flex', gap: 6 },
  iconBtn: { width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', borderRadius: 6, cursor: 'pointer', background: '#fff', fontSize: 13, color: '#555' },
  loading: { textAlign: 'center', padding: '3rem', color: '#888', fontSize: 14 },
  empty: { textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: 14 },
};
