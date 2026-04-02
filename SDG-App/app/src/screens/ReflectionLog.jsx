import React, { useEffect, useMemo, useState } from "react";
import { SDG_DATA } from "@/lib/sdgData";
import { FileText, Plus, Info, Trash2, ChevronDown, ChevronUp, Save } from "lucide-react";

const STORAGE_KEY = "sdg_mock_reflection_entries";

const REFLECTION_QUESTIONS = [
  "Which SDG(s) are most connected to your co-op placement this week?",
  "What specific tasks or projects link to these goals?",
  "How has your employer addressed or discussed sustainability?",
  "What surprised you about the SDG connection in your workplace?",
  "What will you do differently after reflecting on these goals?",
];

// ── Shared card shell ──────────────────────────────────────────────────────
const SectionCard = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl ${className}`}
    style={{ border: '1px solid #DDE6DD', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
  >
    {children}
  </div>
);

// ── Tag pill (replaces shadcn Badge) ──────────────────────────────────────
const Tag = ({ children, variant = "default" }) => {
  const styles = {
    default:  { background: '#EEF2EE',  color: '#36656B'  },
    outline:  { background: 'transparent', color: '#637063', border: '1px solid #DDE6DD' },
    mock:     { background: '#FFF8EC',  color: '#A07C28'  },
    type:     { background: '#EEF2EE',  color: '#637063'  },
  };
  return (
    <span
      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize leading-none"
      style={styles[variant] ?? styles.default}
    >
      {children}
    </span>
  );
};

export default function ReflectionLog() {
  const [entries,    setEntries]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({
    title: "", reflection_type: "general",
    sdg_numbers: [], reflection_text: "", employer_discussion: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    setEntries(Array.isArray(parsed) ? parsed : []);
    setLoading(false);
  }, []);

  const saveEntries = (next) => {
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleSDGToggle = (num) => {
    setForm((prev) => {
      const has = prev.sdg_numbers.includes(num);
      return { ...prev, sdg_numbers: has ? prev.sdg_numbers.filter((n) => n !== num) : [...prev.sdg_numbers, num] };
    });
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.reflection_text.trim()) {
      window.alert("Title and reflection text are required.");
      return;
    }
    setSaving(true);
    const newEntry = {
      id: Date.now(),
      title: form.title.trim(),
      reflection_type: form.reflection_type,
      sdg_numbers: form.sdg_numbers,
      reflection_text: form.reflection_text.trim(),
      employer_discussion: form.employer_discussion.trim(),
      created_date: new Date().toISOString(),
    };
    saveEntries([newEntry, ...entries]);
    setForm({ title: "", reflection_type: "general", sdg_numbers: [], reflection_text: "", employer_discussion: "" });
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = (id) => {
    saveEntries(entries.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const sortedSdgData = useMemo(() => [...SDG_DATA].sort((a, b) => a.number - b.number), []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#EEF2EE' }}
            >
              <FileText className="w-4 h-4" style={{ color: '#36656B' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A2E1A' }}>Reflection Log</h1>
          </div>
          <p className="text-sm" style={{ color: '#637063' }}>
            Document your SDG connections throughout your co-op placement.
          </p>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto transition-all active:scale-95"
          style={{ background: '#36656B', color: '#fff', boxShadow: '0 2px 8px rgba(54,101,107,0.25)' }}
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* ── Info banner ── */}
      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs mb-6"
        style={{ background: 'rgba(54,101,107,0.08)', border: '1px solid rgba(54,101,107,0.18)', color: '#36656B' }}
      >
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Mock only:</strong> Entries are saved in your browser's localStorage — no backend calls are made.
        </span>
      </div>

      {/* ── New entry form ── */}
      {showForm && (
        <SectionCard className="mb-6 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: '#9BAA9B' }}>
            New Reflection Entry
          </h2>

          {/* Prompt guide */}
          <div
            className="rounded-xl p-4 mb-5"
            style={{ background: '#F4F7F5', border: '1px solid #DDE6DD' }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: '#637063' }}>
              Reflection Prompts
            </p>
            <ul className="space-y-1">
              {REFLECTION_QUESTIONS.map((q) => (
                <li key={q} className="text-xs flex items-start gap-1.5" style={{ color: '#637063' }}>
                  <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#36656B' }} />
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#637063' }}>
                Entry Title <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                className="auth-input"
                placeholder="e.g. Week 3 SDG Reflection"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#637063' }}>
                Reflection Type
              </label>
              <select
                className="auth-input"
                value={form.reflection_type}
                onChange={(e) => setForm((p) => ({ ...p, reflection_type: e.target.value }))}
              >
                <option value="general">General Reflection</option>
                <option value="weekly">Weekly Log</option>
                <option value="activity">Activity-Based</option>
                <option value="employer_discussion">Employer Discussion</option>
              </select>
            </div>
          </div>

          {/* SDG picker */}
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: '#637063' }}>
              Related SDGs
            </label>
            <div className="flex flex-wrap gap-2">
              {sortedSdgData.map((sdg) => {
                const selected = form.sdg_numbers.includes(sdg.number);
                return (
                  <button
                    key={sdg.number}
                    type="button"
                    onClick={() => handleSDGToggle(sdg.number)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={selected
                      ? { background: sdg.colour, color: '#fff', border: '2px solid transparent' }
                      : { background: '#fff', color: '#1A2E1A', border: '1.5px solid #DDE6DD' }
                    }
                  >
                    {sdg.number}: {sdg.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#637063' }}>
              Reflection <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              className="auth-input min-h-[120px] resize-y"
              placeholder="Write your reflection here..."
              value={form.reflection_text}
              onChange={(e) => setForm((p) => ({ ...p, reflection_text: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#637063' }}>
              Employer Discussion Notes <span style={{ color: '#9BAA9B' }}>(optional)</span>
            </label>
            <textarea
              className="auth-input min-h-[80px] resize-y"
              placeholder="Document employer discussion here..."
              value={form.employer_discussion}
              onChange={(e) => setForm((p) => ({ ...p, employer_discussion: e.target.value }))}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center justify-center gap-2"
              style={{ width: 'auto', paddingLeft: 20, paddingRight: 20 }}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Entry"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#EEF2EE', color: '#36656B', border: '1px solid #DDE6DD' }}
            >
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      {/* ── Entries list ── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9BAA9B' }}>
          Previous Entries ({entries.length})
        </h2>

        {loading && (
          <p className="text-sm" style={{ color: '#637063' }}>Loading entries…</p>
        )}

        {!loading && entries.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-14 rounded-2xl text-center"
            style={{ border: '1.5px dashed #DDE6DD', background: '#fff' }}
          >
            <FileText className="w-10 h-10 mb-3" style={{ color: '#DDE6DD' }} />
            <p className="text-sm font-medium" style={{ color: '#1A2E1A' }}>No reflections yet</p>
            <p className="text-xs mt-1" style={{ color: '#9BAA9B' }}>
              Click New Entry above to get started.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {entries.map((entry) => (
            <SectionCard key={entry.id}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold" style={{ color: '#1A2E1A' }}>
                        {entry.title}
                      </h3>
                      <Tag variant="type">
                        {entry.reflection_type?.replace("_", " ") || "general"}
                      </Tag>
                    </div>

                    <p className="text-xs mb-2" style={{ color: '#9BAA9B' }}>
                      {new Date(entry.created_date).toLocaleString()}
                    </p>

                    {entry.sdg_numbers?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.sdg_numbers.slice(0, 5).map((n) => {
                          const sdg = sortedSdgData.find((s) => s.number === n);
                          return sdg ? (
                            <span
                              key={n}
                              className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                              style={{ background: sdg.colour }}
                            >
                              Goal {n}
                            </span>
                          ) : null;
                        })}
                        {entry.sdg_numbers.length > 5 && (
                          <span className="text-[10px] px-2 py-0.5" style={{ color: '#9BAA9B' }}>
                            +{entry.sdg_numbers.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: '#F4F7F5', color: '#637063' }}
                    >
                      {expandedId === entry.id
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: '#FEF2F2', color: '#DC2626' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedId === entry.id && (
                  <div
                    className="mt-4 pt-4 space-y-4"
                    style={{ borderTop: '1px solid #EEF2EE' }}
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9BAA9B' }}>
                        Reflection
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#1A2E1A' }}>
                        {entry.reflection_text}
                      </p>
                    </div>
                    {entry.employer_discussion && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9BAA9B' }}>
                          Employer Discussion
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#1A2E1A' }}>
                          {entry.employer_discussion}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </div>
  );
}
