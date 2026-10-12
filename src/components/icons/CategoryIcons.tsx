interface IconProps {
  className?: string;
}

function DocumentStackIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 3h7l4 4v14H7V3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9.5 12h5M9.5 15.5h5M9.5 8.5h2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function TrainIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="4" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M5 11h14M9 16l-2.5 4M15 16l2.5 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="8.5" cy="13.3" r=".9" fill="currentColor" />
      <circle cx="15.5" cy="13.3" r=".9" fill="currentColor" />
    </svg>
  );
}

function BankIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 9.5 12 4l9 5.5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path
        d="M5 10v9M9.5 10v9M14.5 10v9M19 10v9M3.5 19h17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GraduationCapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m2.5 9 9.5-4.5L21.5 9 12 13.5 2.5 9Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M6.5 11.3V16c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4.7" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M21.5 9v5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function LandmarkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 21h16M5 21V10M19 21V10M3 10l9-6 9 6M9 21v-7M15 21v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UmbrellaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3C7.5 3 4 6.8 4 11h16c0-4.2-3.5-8-8-8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M12 3v15.5a2.5 2.5 0 0 1-2.5 2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 3v8" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function GearIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6M17.8 17.8l-1.6-1.6M7.8 7.8 6.2 6.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BookOpenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 6.5c-1.8-1.3-4.2-2-6.5-2S3 5 3 5v13s2-1 3.5-1 3.5.8 4.5 1.5m1-12c1.8-1.3 4.2-2 6.5-2s2.5.5 2.5.5v13s-2-1-3.5-1-3.5.8-4.5 1.5m0-12v12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StethoscopeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 4v5a4 4 0 0 0 8 0V4M10 4H4M18 4h-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M14 9v3a5 5 0 0 0 5 5v0a2.5 2.5 0 1 0 0-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="19" cy="12" r="1.3" fill="currentColor" />
    </svg>
  );
}

function GavelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m8.5 3.5 5 5M5 7l3.5-3.5 5 5L10 12M3 16l5-5M4 21l6-6M15 9l6 6-2.5 2.5-6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScaleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3v18M7 21h10M5 7h14M5 7 2.5 12a2.5 2.5 0 0 0 5 0L5 7ZM19 7l-2.5 5a2.5 2.5 0 0 0 5 0L19 7Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BriefcaseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="7.5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5M3 12.5h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function WheatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21V8M12 8c-2-1-3-3-3-5 2 0 4 1 5 3M12 8c2-1 3-3 3-5-2 0-4 1-5 3M12 13c-2-1-3-3-3-5 2 0 4 1 5 3M12 13c2-1 3-3 3-5-2 0-4 1-5 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CompassIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="m15 9-4.5 2-1.5 4.5 4.5-2 1.5-4.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s7-6.5 7-11.5a7 7 0 0 0-14 0C5 14.5 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

const iconsBySlug: Record<string, (props: IconProps) => React.ReactElement> = {
  ssc: DocumentStackIcon,
  "ssc-je": GearIcon,
  railway: TrainIcon,
  bank: BankIcon,
  insurance: UmbrellaIcon,
  "ugc-net": GraduationCapIcon,
  teaching: GraduationCapIcon,
  bpsc: LandmarkIcon,
  "state-psc": LandmarkIcon,
  "up-police": LandmarkIcon,
  "mp-exams": LandmarkIcon,
  tre: BookOpenIcon,
  upsc: CompassIcon,
  defence: ShieldIcon,
  police: ShieldIcon,
  nursing: StethoscopeIcon,
  judiciary: GavelIcon,
  clat: ScaleIcon,
  "ntpc-group": BriefcaseIcon,
  agriculture: WheatIcon,
  "entrance-exams": MapPinIcon,
};

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = iconsBySlug[slug] ?? DocumentStackIcon;
  return <Icon className={className} />;
}
