import trucityLogo from "../../../assets/branding/trucity-logo.png";

interface TruCityLogoProps {
  width?: number;
  className?: string;
}

export default function TruCityLogo({
  width = 150,
  className = "",
}: TruCityLogoProps) {
  return (
    <img
      src={trucityLogo}
      alt="TruCity"
      width={width}
      className={className}
    />
  );
}