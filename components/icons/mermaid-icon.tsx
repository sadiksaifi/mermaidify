import type { SVGProps } from "react";

export function MermaidIcon({
  size = 24,
  leafColor = "#ff3670",
  className,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number | string; leafColor?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M19.95 5.44c-3.52-.15-6.75 2.02-7.95 5.33-1.2-3.31-4.43-5.48-7.95-5.33-.12 2.79 1.22 5.46 3.53 7.04 1.18.81 1.89 2.16 1.88 3.6v2.49h5.08v-2.49c0-1.44.71-2.79 1.89-3.6 2.31-1.58 3.65-4.25 3.52-7.04z"
        fill={leafColor}
      />
    </svg>
  );
}
