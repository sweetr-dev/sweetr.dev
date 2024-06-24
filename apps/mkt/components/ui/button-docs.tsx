import { IconBook2 } from "@tabler/icons-react";

interface ButtonDocsProps {
  href: string;
  className?: string;
}

export const ButtonDocs = ({ href, className = "" }: ButtonDocsProps) => {
  return (
    <a
      href={href}
      target="_blank"
      className={`${className} text-dark-100 text-sm inline-flex rounded px-2 py-1 hover:scale-105 transition border border-dark-400 items-center gap-2`}
    >
      <IconBook2 stroke={1.5} size={20} />
      Documentation
    </a>
  );
};
