import { Link } from 'react-router-dom';

interface BrandLogoProps {
  compact?: boolean;
  to?: string;
  showTagline?: boolean;
}

export default function BrandLogo({
  compact = false,
  to = '/',
  showTagline = true,
}: BrandLogoProps) {
  return (
    <Link
      to={to}
      aria-label="TruCity home"
      className="
        inline-flex
        shrink-0
        items-center
        no-underline
      "
    >
      <div
        className={`
          flex
          shrink-0
          items-center
          justify-center
          ${
            compact
              ? 'w-[92px]'
              : 'w-[150px] sm:w-[170px]'
          }
        `}
      >
        <img
          src="/trucity-logo.png"
          alt="TruCity"
          draggable={false}
          className="
            block
            h-auto
            w-full
            select-none
            object-contain
          "
        />
      </div>

      {!compact && showTagline && (
        <span className="sr-only">
          Verify • Connect • Pursue
        </span>
      )}
    </Link>
  );
}