"use client";

import { useState } from "react";
import { X, Mail, Phone, Award, Briefcase, GraduationCap } from "lucide-react";
import { LinkedinIcon } from "@/components/Icon";

type Member = {
  id: string;
  name: string;
  title: string;
  role: string;
  img?: string;
  initials?: string;
  bio: string;
  education: string[];
  practice: string[];
  bar: string;
  email: string;
  phone?: string;
  linkedin?: string;
};

const members: Record<string, Member> = {
  bishnu: {
    id: "bishnu",
    name: "Sr. Adv. Bishnu P. Sharma",
    title: "Managing Partner",
    role: "Founding & Managing Partner",
    img: "/images/attorney-1.jpg",
    bio: "Bishnu founded the chambers in 1998 out of a two-room office in Putalisadak. His practice spans constitutional review, corporate governance and cross-border commercial disputes. He has appeared in over 40 reported matters before the Supreme Court of Nepal.",
    education: [
      "LL.M., National Law School, Bangalore (2001)",
      "LL.B., Tribhuvan University (1995)",
    ],
    practice: ["Constitutional Law", "Corporate Governance", "Cross-border Disputes"],
    bar: "Nepal Bar Council · Senior Advocate (2011)",
    email: "bishnu@premiumlaw.np",
    phone: "+977 1 4000 111",
    linkedin: "#",
  },
  sabina: {
    id: "sabina",
    name: "Adv. Sabina Rana Magar",
    title: "Senior Partner",
    role: "Head of Litigation",
    img: "/images/attorney-2.jpg",
    bio: "Sabina leads the litigation team. She is known for methodical trial preparation and for a decade of pro-bono work with survivors of gender-based violence in the Kathmandu valley.",
    education: ["LL.M., Kathmandu School of Law (2008)", "B.A. LL.B., Nepal Law Campus (2004)"],
    practice: ["Civil & Commercial Litigation", "Arbitration", "Public Interest"],
    bar: "Nepal Bar Council · Advocate (2005)",
    email: "sabina@premiumlaw.np",
    linkedin: "#",
  },
  dipendra: {
    id: "dipendra",
    name: "Adv. Dipendra Shrestha",
    title: "Partner",
    role: "Head of Corporate & IP",
    img: "/images/attorney-3.jpg",
    bio: "Dipendra advises technology companies, banks and family businesses on structuring, licensing and IP protection. Before joining the chambers he served as in-house counsel to a regional fintech.",
    education: [
      "LL.M. IP, Queen Mary, University of London (2013)",
      "B.A. LL.B., Kathmandu School of Law (2009)",
    ],
    practice: ["Corporate & M&A", "Intellectual Property", "Technology & Data"],
    bar: "Nepal Bar Council · Advocate (2010)",
    email: "dipendra@premiumlaw.np",
    linkedin: "#",
  },
  kamala: {
    id: "kamala",
    name: "Adv. Kamala Adhikari",
    title: "Partner",
    role: "Head of Criminal Defence & Human Rights",
    img: "/images/attorney-4.jpg",
    bio: "Kamala's practice is at the intersection of criminal defence and constitutional rights. She has argued landmark habeas corpus matters and lectures at Nepal Law Campus.",
    education: [
      "LL.M. Human Rights, SOAS London (2015)",
      "B.A. LL.B., Tribhuvan University (2010)",
    ],
    practice: ["Criminal Defence", "Human Rights", "Constitutional Litigation"],
    bar: "Nepal Bar Council · Advocate (2011)",
    email: "kamala@premiumlaw.np",
    linkedin: "#",
  },
  ankit: {
    id: "ankit",
    name: "Adv. Ankit Baniya",
    title: "Senior Associate",
    role: "Corporate & IP Team",
    initials: "AB",
    bio: "Ankit works alongside the corporate team on transactional matters, due diligence and licensing. He drafts most of the firm's commercial contract templates.",
    education: ["LL.B., Kathmandu School of Law (2016)"],
    practice: ["Corporate Advisory", "Contracts", "IP Registrations"],
    bar: "Nepal Bar Council · Advocate (2017)",
    email: "ankit@premiumlaw.np",
  },
  pratima: {
    id: "pratima",
    name: "Adv. Pratima Karki",
    title: "Senior Associate",
    role: "Litigation Team",
    initials: "PK",
    bio: "Pratima appears regularly before district and high courts in the Bagmati province. She leads the firm's arbitration research group.",
    education: ["LL.B., Nepal Law Campus (2015)"],
    practice: ["Trial Advocacy", "Arbitration", "Commercial Disputes"],
    bar: "Nepal Bar Council · Advocate (2016)",
    email: "pratima@premiumlaw.np",
  },
  suman: {
    id: "suman",
    name: "Adv. Suman Tamang",
    title: "Associate",
    role: "Criminal & Human Rights",
    initials: "ST",
    bio: "Suman assists Kamala's team, with a focus on bail applications, custody hearings and prison visitation programmes.",
    education: ["B.A. LL.B., Kathmandu School of Law (2019)"],
    practice: ["Criminal Defence", "Bail & Remand", "Legal Aid"],
    bar: "Nepal Bar Council · Advocate (2020)",
    email: "suman@premiumlaw.np",
  },
  rojina: {
    id: "rojina",
    name: "Rojina Shakya",
    title: "Associate",
    role: "Corporate & IP Team",
    initials: "RS",
    bio: "Rojina joined the chambers after clerking at a commercial bench. She focuses on start-up advisory and trademark prosecution.",
    education: ["B.A. LL.B., Kathmandu School of Law (2020)"],
    practice: ["Start-up Advisory", "Trademarks", "Contracts"],
    bar: "Nepal Bar Council · Advocate (2021)",
    email: "rojina@premiumlaw.np",
  },
  aayush: {
    id: "aayush",
    name: "Aayush Poudel",
    title: "Junior Associate",
    role: "Litigation Team",
    initials: "AP",
    bio: "Aayush drafts pleadings and supports second-chair on trial matters. Trilingual in Nepali, Newari and English.",
    education: ["B.A. LL.B., Nepal Law Campus (2022)"],
    practice: ["Pleadings", "Case Research", "Client Interviews"],
    bar: "Nepal Bar Council · Advocate (2023)",
    email: "aayush@premiumlaw.np",
  },
  meena: {
    id: "meena",
    name: "Meena Gurung",
    title: "Practice Manager",
    role: "Operations",
    initials: "MG",
    bio: "Meena runs the day-to-day of the chambers — scheduling, billing, client intake and the library. Nothing moves without her.",
    education: ["MBA, Ace Institute of Management (2014)"],
    practice: ["Operations", "Client Intake", "Billing"],
    bar: "—",
    email: "meena@premiumlaw.np",
    phone: "+977 1 4000 100",
  },
  binod: {
    id: "binod",
    name: "Binod K.C.",
    title: "Head Paralegal",
    role: "Research & Filing",
    initials: "BK",
    bio: "Binod supervises court filings and the firm's paralegal team. Twenty-two years in and around district registries.",
    education: ["B.A., Tribhuvan University (2003)"],
    practice: ["Court Filings", "Document Management", "Registry Liaison"],
    bar: "—",
    email: "binod@premiumlaw.np",
  },
};

type Node = { id: keyof typeof members; children?: Node[] };

const tree: Node = {
  id: "bishnu",
  children: [
    {
      id: "sabina",
      children: [{ id: "pratima" }, { id: "aayush" }],
    },
    {
      id: "dipendra",
      children: [{ id: "ankit" }, { id: "rojina" }],
    },
    {
      id: "kamala",
      children: [{ id: "suman" }],
    },
    {
      id: "meena",
      children: [{ id: "binod" }],
    },
  ],
};

function PersonCard({
  id,
  onOpen,
  size = "md",
}: {
  id: keyof typeof members;
  onOpen: (id: string) => void;
  size?: "lg" | "md" | "sm";
}) {
  const m = members[id];
  const dims = size === "lg" ? "w-64" : size === "md" ? "w-56" : "w-48";
  const imgH = size === "lg" ? "h-64" : size === "md" ? "h-52" : "h-40";
  return (
    <button
      onClick={() => onOpen(m.id)}
      className={`group ${dims} bg-cream border border-navy-deep/10 hover:border-gold hover:shadow-xl transition-all text-left overflow-hidden rounded-sm`}
    >
      <div className={`${imgH} w-full bg-navy-deep/90 overflow-hidden relative`}>
        {m.img ? (
          <img
            src={m.img}
            alt={m.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center font-serif text-4xl text-gold">
            {m.initials}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gold" />
      </div>
      <div className="p-4">
        <div className="font-serif text-lg leading-tight text-navy-deep group-hover:text-gold transition-colors">
          {m.name}
        </div>
        <div className="text-xs uppercase tracking-widest text-gold mt-1">{m.title}</div>
        <div className="text-xs text-charcoal/70 mt-1">{m.role}</div>
      </div>
    </button>
  );
}

function Connector({
  vertical = false,
  className = "",
}: {
  vertical?: boolean;
  className?: string;
}) {
  return <div className={`bg-gold/60 ${vertical ? "w-px" : "h-px"} ${className}`} aria-hidden />;
}

export default function TeamPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = openId ? members[openId as keyof typeof members] : null;

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-navy-deep text-cream overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, #D4A24C 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="container-x relative">
          <span className="eyebrow text-gold">The Chambers</span>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl lg:text-6xl leading-tight">
            The people behind
            <br /> <span className="text-gold">every brief we file.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-cream/70 text-lg">
            A working chambers of twelve — partners, associates and staff — organised the way we
            actually run: small teams around each practice head. Click any name to read more.
          </p>
        </div>
      </section>

      {/* Org chart */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container-x">
          <div className="text-center mb-14">
            <span className="eyebrow">Organisation</span>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl text-navy-deep">Firm Hierarchy</h2>
          </div>

          {/* Managing Partner */}
          <div className="flex flex-col items-center">
            <PersonCard id="bishnu" onOpen={setOpenId} size="lg" />
            <Connector vertical className="h-10" />

            {/* Horizontal bar over practice heads */}
            <div className="relative w-full max-w-6xl">
              <div className="hidden md:block absolute top-0 left-[12.5%] right-[12.5%] h-px bg-gold/60" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 pt-10">
                {tree.children!.map((head) => (
                  <div key={head.id} className="flex flex-col items-center">
                    <div className="hidden md:block -mt-10 mb-0 w-px h-10 bg-gold/60" />
                    <PersonCard id={head.id} onOpen={setOpenId} />
                    {head.children && head.children.length > 0 && (
                      <>
                        <Connector vertical className="h-8" />
                        <div className="flex flex-col gap-6 items-center">
                          {head.children.map((child, i) => (
                            <div key={child.id} className="flex flex-col items-center">
                              {i > 0 && <Connector vertical className="h-6" />}
                              <PersonCard id={child.id} onOpen={setOpenId} size="sm" />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-charcoal/60 text-sm mt-16 italic">
            Tap a card to read the person's background, practice areas and contact.
          </p>
        </div>
      </section>

      {/* Directory (flat list for quick scan) */}
      <section className="py-20 bg-background">
        <div className="container-x">
          <div className="mb-10">
            <span className="eyebrow">Directory</span>
            <h2 className="mt-3 font-serif text-3xl text-navy-deep">Full team, alphabetical</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-navy-deep/10 border border-navy-deep/10">
            {Object.values(members)
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => setOpenId(m.id)}
                  className="text-left bg-cream p-5 hover:bg-gold/5 transition-colors"
                >
                  <div className="font-serif text-lg text-navy-deep">{m.name}</div>
                  <div className="text-xs uppercase tracking-widest text-gold mt-1">{m.title}</div>
                  <div className="text-sm text-charcoal/70 mt-1">{m.role}</div>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative bg-cream max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              onClick={() => setOpenId(null)}
              className="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center bg-navy-deep text-cream hover:bg-gold hover:text-navy-deep transition-colors rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-[280px_1fr]">
              <div className="bg-navy-deep">
                {active.img ? (
                  <img
                    src={active.img}
                    alt={active.name}
                    className="w-full h-72 md:h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-72 md:h-full flex items-center justify-center font-serif text-6xl text-gold">
                    {active.initials}
                  </div>
                )}
              </div>
              <div className="p-8">
                <div className="text-xs uppercase tracking-widest text-gold">{active.title}</div>
                <h3 className="font-serif text-3xl text-navy-deep mt-2">{active.name}</h3>
                <div className="text-charcoal/70 mt-1">{active.role}</div>

                <p className="mt-5 text-charcoal leading-relaxed">{active.bio}</p>

                <div className="mt-6 space-y-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-navy-deep font-semibold">
                      <Briefcase className="h-4 w-4 text-gold" /> Practice
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {active.practice.map((p) => (
                        <span
                          key={p}
                          className="px-3 py-1 bg-navy-deep/5 border border-navy-deep/10 text-charcoal text-xs"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-navy-deep font-semibold">
                      <GraduationCap className="h-4 w-4 text-gold" /> Education
                    </div>
                    <ul className="mt-2 text-charcoal/80 space-y-1">
                      {active.education.map((e) => (
                        <li key={e}>· {e}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-navy-deep font-semibold">
                      <Award className="h-4 w-4 text-gold" /> Bar
                    </div>
                    <div className="mt-1 text-charcoal/80">{active.bar}</div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-navy-deep/10 flex flex-wrap gap-4 text-sm">
                  <a
                    href={`mailto:${active.email}`}
                    className="inline-flex items-center gap-2 text-navy-deep hover:text-gold"
                  >
                    <Mail className="h-4 w-4" /> {active.email}
                  </a>
                  {active.phone && (
                    <a
                      href={`tel:${active.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-2 text-navy-deep hover:text-gold"
                    >
                      <Phone className="h-4 w-4" /> {active.phone}
                    </a>
                  )}
                  {active.linkedin && (
                    <a
                      href={active.linkedin}
                      className="inline-flex items-center gap-2 text-navy-deep hover:text-gold"
                    >
                      <LinkedinIcon className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
