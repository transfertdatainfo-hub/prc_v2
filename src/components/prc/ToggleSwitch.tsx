// src/components/prc/ToggleSwitch.tsx

export function ToggleSwitch({
  checked,
  onChange,
  color = "green",
}: {
  checked: boolean;
  onChange: () => void;
  color?: "green" | "amber" | "blue";
}) {
  const colors = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
  };

  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
        checked ? colors[color] : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
