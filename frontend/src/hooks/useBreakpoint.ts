import { useState, useEffect } from 'react';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type Breakpoint = keyof typeof breakpoints;

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState<boolean>(
    window.innerWidth >= breakpoints[breakpoint]
  );

  useEffect(() => {
    const checkSize = () => {
      setIsAboveBreakpoint(window.innerWidth >= breakpoints[breakpoint]);
    };

    window.addEventListener('resize', checkSize);
    checkSize(); // Check on mount

    return () => window.removeEventListener('resize', checkSize);
  }, [breakpoint]);

  return isAboveBreakpoint;
}

export function useBreakpoints() {
  const [activeBreakpoints, setActiveBreakpoints] = useState<Record<Breakpoint, boolean>>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  });

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setActiveBreakpoints({
        sm: width >= breakpoints.sm,
        md: width >= breakpoints.md,
        lg: width >= breakpoints.lg,
        xl: width >= breakpoints.xl,
        '2xl': width >= breakpoints['2xl'],
      });
    };

    window.addEventListener('resize', checkBreakpoints);
    checkBreakpoints(); // Check on mount

    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  return activeBreakpoints;
}
