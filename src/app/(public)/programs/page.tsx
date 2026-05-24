import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function ProgramsPage() {
  const diplomaCourseIds = [
    "664f3a8b2d1c9e8a7f0e0001", // Housekeeping & Domestic Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0002", // Hospitality Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0003", // Events & Protocol Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0006", // Diploma in Hospitality Management
    "664f3a8b2d1c9e8a7f0e0009"  // Diploma in Event & Protocol Management
  ];

  return (
    <CurriculumCatalog
      title="Diplomas & Programs"
      subtitle="Rigorous, comprehensive professional programs designed to develop highly skilled operations managers, hospitality directors, and VIP coordinators."
      badge="Academic Degrees"
      courseIds={diplomaCourseIds}
    />
  );
}

export async function generateMetadata() {
  return {
    title: "Diplomas & Programs — Ashford & Gray Fusion Academy",
    description: "Rigorous, comprehensive professional programs designed to develop highly skilled operations managers, hospitality directors, and VIP coordinators.",
  };
}
