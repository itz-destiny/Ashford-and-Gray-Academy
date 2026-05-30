import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function ProgramsPage() {
  const diplomaCourseIds = [
    "664f3a8b2d1c9e8a7f0e0006", // Diploma in Hospitality Management
    "664f3a8b2d1c9e8a7f0e0008", // Diploma in Business Innovation & Entrepreneurship
    "664f3a8b2d1c9e8a7f0e0007", // Diploma in Professional Development & Global Relations
    "664f3a8b2d1c9e8a7f0e0009", // Diploma in Event & Protocol Management
  ];

  return (
    <CurriculumCatalog
      title="Diploma Programs"
      subtitle="Comprehensive professional diploma programs in hospitality, business innovation, professional development, and events management."
      badge="Diploma Programs"
      courseIds={diplomaCourseIds}
    />
  );
}

export async function generateMetadata() {
  return {
    title: "Diploma Programs — Ashford & Gray Academy",
    description: "Comprehensive professional diploma programs in hospitality, business innovation, professional development, and events management.",
  };
}
