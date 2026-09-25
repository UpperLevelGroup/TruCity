
import { C } from './colours';

import type { CSSProperties, ReactNode } from 'react';

interface LabelProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Label({ children, style }: LabelProps) {
  return <div style={{ fontSize: 9, fontWeight: 800, color: C.textMuted, letterSpacing: 1.1, ...style }}>{children}</div>;
}