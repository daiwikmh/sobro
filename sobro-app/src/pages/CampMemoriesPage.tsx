import { CampMemories } from "@/components/camp";
import ConnectionTest from "@/components/camp/ConnectionTest";

export default function CampMemoriesPage() {
  return (
    <div className="space-y-6">
      <ConnectionTest />
      <CampMemories />
    </div>
  );
}