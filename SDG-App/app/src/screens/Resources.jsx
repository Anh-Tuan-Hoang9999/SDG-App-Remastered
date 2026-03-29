import { Badge } from "@/components/ui/badge";
import {
  Library, ExternalLink, Globe, GraduationCap, Phone, BookOpen,
  Video, FileText, Mail, MapPin, Info
} from "lucide-react";

const RESOURCES = [
  {
    section: "SDG Learning Resources",
    icon: Globe,
    color: "bg-primary/10 text-primary",
    items: [
      { title: "UN SDGs Official Site", desc: "The official United Nations page for the 17 Sustainable Development Goals.", url: "https://sdgs.un.org/goals", tag: "External" },
      { title: "SDG Academy", desc: "Online courses and learning materials about the global goals.", url: "https://sdgacademy.org", tag: "Courses" },
      { title: "UN SDG Resource Centre", desc: "Tools, data, and content to help implement the global goals.", url: "https://sdg.iisd.org", tag: "Research" },
      { title: "SDG Tracker", desc: "Data-driven global progress reports on achieving the SDGs.", url: "https://ourworldindata.org/sdgs", tag: "Data" },
    ]
  },
  {
    section: "Student Co-op Resources",
    icon: GraduationCap,
    color: "bg-chart-3/20 text-chart-3",
    items: [
      { title: "Student Experience Portal", desc: "Access your co-op placement details, timesheets, and evaluations.", url: "#", tag: "Portal", mock: true },
      { title: "Co-op Handbook (PDF)", desc: "Complete guide for co-op students — expectations, policies, and best practices.", url: "#", tag: "Document", mock: true },
      { title: "Reflection Guide", desc: "How to write a strong SDG-aligned co-op reflection.", url: "#", tag: "Guide", mock: true },
      { title: "SDG Card Sort Instructions", desc: "Step-by-step instructions for completing the card sort activity.", url: "#", tag: "Guide", mock: true },
    ]
  },
  {
    section: "Video & Multimedia",
    icon: Video,
    color: "bg-chart-2/20 text-chart-2",
    items: [
      { title: "\"What are the SDGs?\" — UN Video", desc: "A 3-minute introduction to the 17 goals and their importance.", url: "https://www.youtube.com/watch?v=0XTBYMfZyrM", tag: "Video" },
      { title: "SDG Stories: Co-op Students", desc: "Student testimonials connecting their placements to sustainability goals.", url: "#", tag: "Video", mock: true },
      { title: "Employer SDG Webinar Series", desc: "Recorded webinars featuring employers discussing sustainability practices.", url: "#", tag: "Webinar", mock: true },
    ]
  },
  {
    section: "Coordinator Contact Information",
    icon: Phone,
    color: "bg-accent/20 text-accent-foreground",
    items: [
      { title: "Dr. Sarah Mitchell", desc: "Co-op Program Coordinator · sarah.mitchell@university.ca · Ext. 4201", url: "mailto:sarah.mitchell@university.ca", tag: "Coordinator", isContact: true },
      { title: "Co-op Office — General Inquiries", desc: "coop@university.ca · (705) 748-1011 Ext. 7777 · Bata Library Room 104", url: "mailto:coop@university.ca", tag: "Office", isContact: true },
      { title: "SDG Learning Portal Support", desc: "Technical support for this portal: portal-support@university.ca", url: "mailto:portal-support@university.ca", tag: "Support", isContact: true },
    ]
  },
];

export default function Resources() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-1">
        <Library className="w-5 h-5 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">Resources</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Curated links and contacts to support your SDG co-op learning journey.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6 text-xs text-primary flex items-start gap-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Mock Backend Note:</strong> Links marked <Badge variant="secondary" className="text-xs">Mock</Badge> are simulated and would point to internal systems in production. External links are real.
        </span>
      </div>

      <div className="space-y-8">
        {RESOURCES.map(({ section, icon: SectionIcon, color, items }) => (
          <div key={section}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                <SectionIcon className="w-4 h-4" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">{section}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  target={item.url.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`block bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30
                    transition-all group ${item.url === "#" ? "cursor-default" : "cursor-pointer"}`}
                  onClick={item.url === "#" ? (e) => e.preventDefault() : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                        <Badge variant="secondary" className="text-xs">{item.tag}</Badge>
                        {item.mock && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Mock</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      {item.isContact
                        ? <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        : <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      }
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Campus Info */}
      <div className="mt-8 bg-muted/40 border border-border rounded-xl p-5">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Co-op Office Location</h3>
            <p className="text-sm text-muted-foreground">
              Bata Library, Room 104 · Trent University, 1600 West Bank Drive, Peterborough, Ontario K9L 0G2<br />
              Office Hours: Monday–Friday, 9:00 AM – 4:30 PM EST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}