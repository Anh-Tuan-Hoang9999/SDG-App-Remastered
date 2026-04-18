import { BookOpen } from "lucide-react";

export const readingItemsBySdg = {
  1: [
    { id: 1, title: "Poverty in Canada", href: "https://cwp-csp.ca/poverty/just-the-facts/" },
    { id: 2, title: "Global Poverty Facts", href: "https://www.worldvision.org/sponsorship-news-stories/global-poverty-facts" },
  ],
  2: [
    { id: 1, title: "Hunger in Canada", href: "https://foodbankscanada.ca/hunger-in-canada/" },
  ],
};

export default function Reading({ selectedSdgReadings, onBack, color = "#E73E45" }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: "var(--app-muted)", border: "1px solid var(--app-border)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text2)" }}>
          Reading
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: "var(--app-card)", color: "#5E9B7B", border: "1px solid var(--app-border)" }}
        >
          Back to Reflection
        </button>
      </div>

      <div className="space-y-3">
        {selectedSdgReadings.map((reading) => (
          <a
            key={reading.id}
            href={reading.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-3xl px-5 py-4 transition-all active:scale-[0.99]"
            style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", boxShadow: "var(--app-shadow-card)" }}
          >
            <div className="flex items-center gap-4">
              <BookOpen className="w-9 h-9 shrink-0" style={{ color }} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm uppercase tracking-wide font-semibold" style={{ color }}>
                  {reading.id} · Reading
                </p>
                <p className="text-xl font-bold truncate" style={{ color: "var(--app-text1)" }}>
                  {reading.title}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
