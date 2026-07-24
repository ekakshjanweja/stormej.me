import type { SVGProps } from "react";

const TailwindCss = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d="M12.0001 6.00017C6.00009 6.00017 2.00009 10.0002 2.00009 12.0002C2.00009 14.0002 6.00009 18.0002 12.0001 18.0002C18.0001 18.0002 22.0001 14.0002 22.0001 12.0002C22.0001 10.0002 18.0001 6.00017 12.0001 6.00017Z"
      stroke="#38B2AC"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.0001 8.00017C14.2092 8.00017 16.0001 9.79103 16.0001 12.0002C16.0001 14.2093 14.2092 16.0002 12.0001 16.0002C9.79095 16.0002 8.00009 14.2093 8.00009 12.0002C8.00009 9.79103 9.79095 8.00017 12.0001 8.00017Z"
      fill="#38B2AC"
    />
  </svg>
);

export { TailwindCss };
