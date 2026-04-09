import React, { useEffect } from "react";
import {
  Library, ExternalLink, Globe, GraduationCap, Phone, Video,
  Mail, MapPin, Info,
} from "lucide-react";
import { useAuth } from "../authContext";
import client from "../api/client";

const RESOURCES = [
  {
    section: "SDG Learning Resources",
    icon: Globe,
    iconBg: '#EEF2EE',
    iconColor: '#36656B',
    items: [
      { title: "UN SDGs Official Site",     desc: "The official United Nations page for the 17 Sustainable Development Goals.", url: "https://sdgs.un.org/goals",                    tag: "External"  },
      { title: "SDG Academy",               desc: "Online courses and learning materials about the global goals.",              url: "https://sdgacademy.org",                      tag: "Courses"   },
      { title: "UN SDG Resource Centre",    desc: "Tools, data, and content to help implement the global goals.",              url: "https://sdg.iisd.org",                        tag: "Research"  },
      { title: "SDG Tracker",               desc: "Data-driven global progress reports on achieving the SDGs.",                url: "https://ourworldindata.org/sdgs",             tag: "Data"      },
    ],
  },
  {
    section: "Student Co-op Resources",
    icon: GraduationCap,
    iconBg: '#FFF8EC',
    iconColor: '#A07C28',
    items: [
      { title: "Student Experience Portal", desc: "Access your co-op placement details, timesheets, and evaluations.",                        url: "#", tag: "Portal",   mock: true },
      { title: "Co-op Handbook (PDF)",      desc: "Complete guide for co-op students — expectations, policies, and best practices.",          url: "#", tag: "Document", mock: true },
      { title: "Reflection Guide",          desc: "How to write a strong SDG-aligned co-op reflection.",                                      url: "#", tag: "Guide",    mock: true },
      { title: "SDG Card Sort Instructions",desc: "Step-by-step instructions for completing the card sort activity.",                          url: "#", tag: "Guide",    mock: true },
    ],
  },
  {
    section: "Video & Multimedia",
    icon: Video,
    iconBg: 'rgba(38,189,226,0.12)',
    iconColor: '#0A97D9',
    items: [
      { title: "\"What are the SDGs?\" — UN Video",  desc: "A 3-minute introduction to the 17 goals and their importance.",                url: "https://www.youtube.com/watch?v=0XTBYMfZyrM", tag: "Video"   },
      { title: "SDG Stories: Co-op Students",         desc: "Student testimonials connecting their placements to sustainability goals.",     url: "#", tag: "Video",   mock: true },
      { title: "Employer SDG Webinar Series",         desc: "Recorded webinars featuring employers discussing sustainability practices.",   url: "#", tag: "Webinar", mock: true },
    ],
  },
  {
    section: "Coordinator Contact Information",
    icon: Phone,
    iconBg: '#EEF2EE',
    iconColor: '#36656B',
    items: [
      { title: "Dr. Sarah Mitchell",           desc: "Co-op Program Coordinator · sarah.mitchell@university.ca · Ext. 4201",        url: "mailto:sarah.mitchell@university.ca", tag: "Coordinator", isContact: true },
      { title: "Co-op Office — General",       desc: "coop@university.ca · (705) 748-1011 Ext. 7777 · Bata Library Room 104",       url: "mailto:coop@university.ca",           tag: "Office",      isContact: true },
      { title: "SDG Portal Support",           desc: "Technical support for this portal: portal-support@university.ca",             url: "mailto:portal-support@university.ca", tag: "Support",     isContact: true },
    ],
  },
];

// Pill for resource tags
const Tag = ({ children, variant = "default" }) => {
  const styles = {
    default: { background: '#EEF2EE', color: '#36656B' },
    mock:    { background: '#FFF8EC', color: '#A07C28' },
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

export default function Resources() {
  const { user } = useAuth();

  // Record that the user has visited the resources page. Fire-and-forget.
  useEffect(() => {
    if (!user?.id) return;
    client
      .patch(`/api/progress/${user.id}`, { viewed_resources: ["resources"] })
      .catch(() => {});
  }, [user?.id]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Page header ── */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: '#EEF2EE' }}
        >
          <Library className="w-4 h-4" style={{ color: '#36656B' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: '#1A2E1A' }}>Resources</h1>
      </div>
      <p className="text-sm mb-5" style={{ color: '#637063' }}>
        Curated links and contacts to support your SDG co-op learning journey.
      </p>

      {/* ── Info banner ── */}
      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs mb-6"
        style={{ background: 'rgba(54,101,107,0.08)', border: '1px solid rgba(54,101,107,0.18)', color: '#36656B' }}
      >
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Mock only:</strong> Links labelled{' '}
          <span
            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mx-0.5"
            style={{ background: '#FFF8EC', color: '#A07C28' }}
          >
            Mock
          </span>{' '}
          are simulated and would point to internal systems in production. External links are real.
        </span>
      </div>

      {/* ── Resource sections ── */}
      <div className="space-y-8">
        {RESOURCES.map(({ section, icon: SectionIcon, iconBg, iconColor, items }) => (
          <div key={section}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: iconBg }}
              >
                <SectionIcon className="w-4 h-4" style={{ color: iconColor }} />
              </div>
              <h2 className="text-base font-bold" style={{ color: '#1A2E1A' }}>{section}</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  target={item.url.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="block group rounded-2xl p-4 transition-all"
                  style={{
                    background: '#fff',
                    border: '1px solid #DDE6DD',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    cursor: item.url === "#" ? 'default' : 'pointer',
                  }}
                  onClick={item.url === "#" ? (e) => e.preventDefault() : undefined}
                  onMouseEnter={e => { if (item.url !== "#") e.currentTarget.style.boxShadow = '0 4px 16px rgba(54,101,107,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-sm font-semibold" style={{ color: '#1A2E1A' }}>
                          {item.title}
                        </span>
                        <Tag>{item.tag}</Tag>
                        {item.mock && <Tag variant="mock">Mock</Tag>}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: '#637063' }}>{item.desc}</p>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      {item.isContact
                        ? <Mail className="w-4 h-4" style={{ color: '#9BAA9B' }} />
                        : <ExternalLink className="w-4 h-4" style={{ color: '#9BAA9B' }} />
                      }
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Campus info card ── */}
      <div
        className="mt-8 rounded-2xl p-5"
        style={{ background: '#F4F7F5', border: '1px solid #DDE6DD' }}
      >
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#637063' }} />
          <div>
            <h3 className="text-sm font-bold mb-1" style={{ color: '#1A2E1A' }}>Co-op Office Location</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#637063' }}>
              Bata Library, Room 104 · Trent University, 1600 West Bank Drive, Peterborough, Ontario K9L 0G2<br />
              Office Hours: Monday–Friday, 9:00 AM – 4:30 PM EST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
