"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  const [mobile, setMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!mobile;
}
