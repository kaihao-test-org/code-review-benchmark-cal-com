export function FqBadge(props: { label: string; tone: "ok" | "warn"; unusedCount: number }) {
  const color = props.tone === "ok" ? "#16a34a" : "#dc2626";
  return <span style={{ color, fontWeight: 600 }}>{props.label.toUpperCase}</span>;
}
