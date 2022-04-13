import * as React from "react";

/**
 * Use sticky tab bar. Will return the current tab bar index
 * and can set the tab bar index programmatically
 * @param initialIndex
 */
export function useStickyTabBar(
  initialIndex?: number
): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [value, setValue] = React.useState<number>(initialIndex ?? 0);

  React.useEffect(() => {
    if (initialIndex !== undefined) {
      if (typeof initialIndex === "number") {
        setValue(initialIndex);
      } else if (typeof initialIndex === "string") {
        setValue(parseInt(initialIndex));
      }
    }
  }, [initialIndex]);

  return [value, setValue];
}
