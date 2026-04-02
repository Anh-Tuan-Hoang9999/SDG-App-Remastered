import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SDG_DATA } from "@/lib/sdgData";
import {
  FileText,
  Plus,
  Info,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";

const STORAGE_KEY = "sdg_mock_reflection_entries";

const REFLECTION_QUESTIONS = [
  "Which SDG(s) are most connected to your co-op placement this week?",
  "What specific tasks or projects link to these goals?",
  "How has your employer addressed or discussed sustainability?",
  "What surprised you about the SDG connection in your workplace?",
  "What will you do differently after reflecting on these goals?",
];

function ActionButton({ children, onClick, variant = "primary", type = "button", className = "", disabled = false }) {
  const style =
    variant === "outline"
      ? "border border-border bg-background text-foreground hover:bg-muted"
      : variant === "ghost"
        ? "text-foreground hover:bg-muted"
        : "bg-primary text-primary-foreground hover:opacity-90";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${style} ${className}`}
    >
      {children}
    </button>
  );
}

export default function ReflectionLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    reflection_type: "general",
    sdg_numbers: [],
    reflection_text: "",
    employer_discussion: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    setEntries(Array.isArray(parsed) ? parsed : []);
    setLoading(false);
  }, []);

  const saveEntries = (nextEntries) => {
    setEntries(nextEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
  };

  const handleSDGToggle = (num) => {
    setForm((prev) => {
      const has = prev.sdg_numbers.includes(num);
      return {
        ...prev,
        sdg_numbers: has ? prev.sdg_numbers.filter((n) => n !== num) : [...prev.sdg_numbers, num],
      };
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

    const nextEntries = [newEntry, ...entries];
    saveEntries(nextEntries);

    setForm({
      title: "",
      reflection_type: "general",
      sdg_numbers: [],
      reflection_text: "",
      employer_discussion: "",
    });
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = (id) => {
    const nextEntries = entries.filter((e) => e.id !== id);
    saveEntries(nextEntries);
    if (expandedId === id) setExpandedId(null);
  };

  const sortedSdgData = useMemo(() => [...SDG_DATA].sort((a, b) => a.number - b.number), []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Reflection Log</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Frontend-only reflection entries for UI testing.
          </p>
        </div>
        <ActionButton onClick={() => setShowForm((v) => !v)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          New Entry
        </ActionButton>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-5 text-xs text-primary flex items-start gap-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span><strong>Mock only:</strong> Entries are saved in localStorage on this browser, no backend calls.</span>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/30 shadow-md">
          <CardHeader className="pb-0 pt-5 px-5">
            <h2 className="font-semibold text-foreground">New Reflection Entry</h2>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="bg-muted/60 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Reflection Prompts:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {REFLECTION_QUESTIONS.map((q) => <li key={q}>{q}</li>)}
              </ul>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="text-sm font-medium">Entry Title *</label>
                <input
                  id="title"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Week 3 SDG Reflection"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="type" className="text-sm font-medium">Reflection Type</label>
                <select
                  id="type"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
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

            <div>
              <p className="text-sm font-medium">Related SDGs</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {sortedSdgData.map((sdg) => {
                  const selected = form.sdg_numbers.includes(sdg.number);
                  return (
                    <button
                      key={sdg.number}
                      type="button"
                      onClick={() => handleSDGToggle(sdg.number)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                        selected
                          ? "text-white border-transparent"
                          : "bg-card border-border text-foreground hover:border-primary/40"
                      }`}
                      style={selected ? { backgroundColor: sdg.colour } : {}}
                    >
                      Goal {sdg.number}: {sdg.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="reflection" className="text-sm font-medium">Reflection *</label>
              <textarea
                id="reflection"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[120px]"
                placeholder="Write your reflection here..."
                value={form.reflection_text}
                onChange={(e) => setForm((p) => ({ ...p, reflection_text: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="employer" className="text-sm font-medium">Employer Discussion Notes (optional)</label>
              <textarea
                id="employer"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                placeholder="Document employer discussion here..."
                value={form.employer_discussion}
                onChange={(e) => setForm((p) => ({ ...p, employer_discussion: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <ActionButton onClick={handleSave} disabled={saving} className="gap-1.5">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Entry"}
              </ActionButton>
              <ActionButton variant="outline" onClick={() => setShowForm(false)}>Cancel</ActionButton>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Previous Entries ({entries.length})</h2>
        {loading && <p className="text-sm text-muted-foreground">Loading entries...</p>}
        {!loading && entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card border border-dashed border-border rounded-xl">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No reflections yet. Click New Entry to get started.</p>
          </div>
        )}

        {entries.map((entry) => (
          <Card key={entry.id} className="border-border hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{entry.title}</h3>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {entry.reflection_type?.replace("_", " ") || "general"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(entry.created_date).toLocaleString()}
                  </p>

                  {entry.sdg_numbers?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.sdg_numbers.slice(0, 5).map((n) => {
                        const sdg = sortedSdgData.find((s) => s.number === n);
                        return sdg ? (
                          <span
                            key={n}
                            className="text-xs text-white px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: sdg.colour }}
                          >
                            Goal {n}
                          </span>
                        ) : null;
                      })}
                      {entry.sdg_numbers.length > 5 && (
                        <span className="text-xs text-muted-foreground px-2 py-0.5">
                          +{entry.sdg_numbers.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <ActionButton
                    variant="ghost"
                    className="h-8 w-8 px-0"
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  >
                    {expandedId === entry.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </ActionButton>
                  <ActionButton
                    variant="ghost"
                    className="h-8 w-8 px-0 text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </ActionButton>
                </div>
              </div>

              {expandedId === entry.id && (
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Reflection</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{entry.reflection_text}</p>
                  </div>
                  {entry.employer_discussion && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Employer Discussion</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{entry.employer_discussion}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
