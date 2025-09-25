import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 18.5V5.5" />
      <path d="M5 12h14" />
      <path d="M18 7.5a6 6 0 0 0-12 0" />
      <path d="M18 16.5a6 6 0 0 1-12 0" />
    </svg>
  );
}
