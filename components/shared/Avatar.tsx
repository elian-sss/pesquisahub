import { avatarColor, initials } from "@/lib/ui-utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

export function Avatar({
  nome,
  size = "md",
  title,
}: {
  nome: string;
  size?: AvatarSize;
  title?: string;
}) {
  const cls =
    size === "sm" ? "avatar avatar-sm"
      : size === "lg" ? "avatar avatar-lg"
      : size === "xl" ? "avatar avatar-xl"
      : "avatar";
  return (
    <span
      className={cls}
      style={{ background: avatarColor(nome) }}
      title={title ?? nome}
    >
      {initials(nome)}
    </span>
  );
}
