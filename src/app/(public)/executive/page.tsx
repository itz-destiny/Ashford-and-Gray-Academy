import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function ExecutiveEducationPage() {
  const executiveCourseIds = [
    "664f3a8b2d1c9e8a7f0e0004", // Executive Assistant Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0005"  // Hospitality & Global Relationship Management (Certificate)
  ];

  return (
    <CurriculumCatalog
      title="Executive Education"
      subtitle="High-level administrative leadership training, bespoke corporate alignment, and strategic calendar authority for C-Suite assistants and luxury hotel directors."
      badge="Professional Training"
      courseIds={executiveCourseIds}
    />
  );
}

export async function generateMetadata() {
  return {
    title: "Executive Education — Ashford & Gray Fusion Academy",
    description: "High-level administrative leadership training, bespoke corporate alignment, and strategic calendar authority for C-Suite assistants and luxury hotel directors.",
  };
}
