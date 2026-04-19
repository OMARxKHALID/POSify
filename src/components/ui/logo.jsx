import Image from "next/image";

export function Logo({ className = "w-5 h-5", ...props }) {
  return (
    <Image
      src="/favicon.svg"
      alt="POSify Logo"
      width={20}
      height={20}
      className={className}
      {...props}
    />
  );
}
