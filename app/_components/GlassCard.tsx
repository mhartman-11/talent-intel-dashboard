import clsx from "clsx";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "article" | "section";
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  style,
  as: Tag = "div",
  hover = false,
}: GlassCardProps) {
  return (
    <Tag
      className={clsx(
        "rounded-2xl glass",
        hover &&
          "transition-all duration-300 hover:bg-white/[0.05] cursor-pointer",
        className
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}
