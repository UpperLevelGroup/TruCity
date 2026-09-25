//  labels - used for "VERIFIED", "PENDING", "POPULAR", etc.

import type { CSSProperties, ReactNode } from "react";

type TagProps = {
  children: ReactNode;
  color?: CSSProperties["color"];
  bg?: CSSProperties["background"];
  style?: CSSProperties;
};

export function Tag({ children, color, bg, style }: TagProps) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, color, background: bg, letterSpacing: 0.3, ...style }}>
      {children}
    </span>
  );
}