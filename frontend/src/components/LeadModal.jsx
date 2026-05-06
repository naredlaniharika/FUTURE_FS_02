import React, { useState } from 'react';
import axios from 'axios';

export default function LeadModal({ lead, onClose, onSaved }) {
  const isEdit = !!lead._id;
  const [form, setForm]     = useState({ name: lead.name || '', email: lead.email || '', phone: lead.phone || '', company: lead.company || '', source: lead.source || 'Website', status: lead.status || 'new' });
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes]   = useState(lead.notes || []);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        const res = await axios.put(`/api/leads/${lead._id}`, form);
        onSaved(res.data);
      } else {
        const res = await axios.post('/api/leads', form);
        onSaved(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await axios.post(`/api/leads/${lead._id}/notes`, { text: newNote });
      setNotes(res.data.notes);
      setNewNote('');
      onSaved(res.data);
    } catch (err) {
      setError('Failed to add note');
    }
    setAddingNote(false);
  };

  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.header}>
          <h2 style={S.title}>{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.body}>
          {/* Row 1 */}
          <div style={S.row}>
            <div style={S.field}>
              <label style={S.label}>Full Name *</label>
              <input style={S.input} name="name" value={form.name} onChange={handle} placeholder="Priya Sharma" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Company</label>
              <input style={S.input} name="company" value={form.company} onChange={handle} placeholder="TechWave Inc." />
            </div>
          </div>
          {/* Row 2 */}
          <div style={S.row}>
            <div style={S.field}>
              <label style={S.label}>Email *</label>
              <input style={S.input} name="email" type="email" value={form.email} onChange={handle} placeholder="priya@company.com" />
            </div>
            <div style={S.field}>
              <label style={S.label}>Phone</label>
              <input style={S.input} name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" />
            </div>
          </div>
          {/* Row 3 */}
          <div style={S.row}>
            <div style={S.field}>
              <label style={S.label}>Source</label>
              <select style={S.input} name="source" value={form.source} onChange={handle}>
                {['Website','LinkedIn','Referral','Cold Email','Event','Other'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Status</label>
              <select style={S.input} name="status" value={form.status} onChange={handle}>
                {['new','contacted','converted','lost'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {error && <div style={S.error}>{error}</div>}

          {/* Notes — only when editing */}
          {isEdit && (
            <div style={S.notesSection}>
              <div style={S.notesTitle}>Follow-up Notes</div>
              {notes.length === 0 && <div style={S.noNotes}>No notes yet.</div>}
              {notes.map((n, i) => (
                <div key={i} style={S.noteItem}>
                  <div style={S.noteText}>{n.text}</div>
                  <div style={S.noteMeta}>{fmtDate(n.createdAt)}</div>
                </div>
              ))}
              <div style={S.noteInput}>
                <input style={{ ...S.input, flex: 1 }} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a follow-up note..." onKeyDown={e => e.key === 'Enter' && addNote()} />
                <button style={S.addNoteBtn} onClick={addNote} disabled={addingNote}>
                  {addingNote ? '...' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' },
  modal: { background: '#fff', borderRadius: 16, border: '1px solid #e5e5e0', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0' },
  title: { fontSize: 17, fontWeight: 600, color: '#1a1a1a' },
  closeBtn: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#888', padding: 4 },
  body: { padding: '1.25rem 1.5rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  field: {},
  label: { display: 'block', fontSize: 12, color: '#555', marginBottom: 5, fontWeight: 500 },
  input: { width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 7, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' },
  error: { background: '#fff0f0', border: '1px solid #fcc', color: '#c00', borderRadius: 7, padding: '8px 12px', fontSize: 13, marginBottom: 10 },
  notesSection: { marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 14 },
  notesTitle: { fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  noNotes: { fontSize: 12, color: '#aaa', marginBottom: 8 },
  noteItem: { background: '#f8f8f5', borderRadius: 7, padding: '8px 10px', marginBottom: 6 },
  noteText: { fontSize: 13, color: '#333' },
  noteMeta: { fontSize: 11, color: '#aaa', marginTop: 2 },
  noteInput: { display: 'flex', gap: 8, marginTop: 8 },
  addNoteBtn: { padding: '8px 14px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f0' },
  cancelBtn: { padding: '8px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: 7, fontSize: 13, cursor: 'pointer' },
  saveBtn: { padding: '8px 16px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer' }
};
