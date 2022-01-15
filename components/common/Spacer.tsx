import React from "react";

/**
 * Create a vertical spacer
 * @param height
 * @constructor
 */
export default function Spacer({ height }: { height: number }) {
  return <div style={{ height }}></div>;
}
