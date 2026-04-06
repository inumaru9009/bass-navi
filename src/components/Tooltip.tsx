// src/components/Tooltip.tsx

import { useState } from "react";

type Props = {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom";
};

export default function Tooltip({ content, children, position = "top" }: Props) {
  const [visible, setVisible] = useState(false);

  const posClass = position === "bottom"
    ? "top-full mt-1.5"
    : "bottom-full mb-1.5";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={e => { e.stopPropagation(); setVisible(v => !v); }}
    >
      {children}
      {visible && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 ${posClass} z-20 w-48 bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded-lg px-3 py-2 leading-relaxed pointer-events-none whitespace-normal`}
        >
          {content}
          <span
            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
              position === "bottom"
                ? "bottom-full border-b-gray-800"
                : "top-full border-t-gray-800"
            }`}
          />
        </span>
      )}
    </span>
  );
}
