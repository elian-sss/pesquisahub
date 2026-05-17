export function BrandMark({ size = 14 }: { size?: number }) {
  return (
    <div className="brand-mark">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 19V5l8 14L20 5v14" />
      </svg>
    </div>
  );
}

export function BrandLogo({ subtitle = "UFOPA · 2026/1" }: { subtitle?: string }) {
  return (
    <div className="sidebar-brand">
      <BrandMark />
      <div>
        <div className="brand-name">PesquisaHub</div>
        <div className="brand-sub">{subtitle}</div>
      </div>
    </div>
  );
}
