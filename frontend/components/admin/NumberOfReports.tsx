import { TriangleAlert } from "lucide-react";

interface NumberOfReportsProps {}

export default function NumberOfReports({}: NumberOfReportsProps) {
  return (
    <div className="flex items-center gap-2 px-2 mt-8">
      <TriangleAlert
        size={36}
        fill="#A53A3A"
        color="black"
        className="text-red-emergency"
      />
      <span className="text-red-emergency text-xl">Number of reports: 7</span>
    </div>
  );
}
