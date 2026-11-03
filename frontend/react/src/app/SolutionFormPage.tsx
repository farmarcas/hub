import { useParams } from "react-router-dom";
import { SolutionForm } from "@/features/solutions-admin";

export function SolutionFormPage() {
  const { id } = useParams();
  return (
    <div className="p-6 lg:p-9">
      <SolutionForm key={id ?? "new"} solutionId={id} />
    </div>
  );
}
