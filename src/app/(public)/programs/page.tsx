import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function ProgramsPage() {
  const diplomaCourseIds = [
    "6a44e9f2bae728bb84e6765b", // Diploma in Hospitality Management
    "6a44e9f2bae728bb84e67665", // Diploma in Business Innovation & Entrepreneurship
    "6a44e9f2bae728bb84e67660", // Diploma in Professional Development & Global Relations
    "6a44e9f2bae728bb84e6766a", // Diploma in Event & Protocol Management
    "6a44e9f2bae728bb84e6766f", // Diploma in Food & Beverage Management
    "6a44e9f2bae728bb84e67676", // Diploma in Hospitality Labour Management & Workforce Development
  ];

  return (
    <CurriculumCatalog
      title="Diploma Programs"
      subtitle="Comprehensive professional diploma programs in hospitality, business innovation, professional development, and events management."
      badge="Diploma Programs"
      courseIds={diplomaCourseIds}
      acceleration="24 Weeks"
    />
  );
}

export async function generateMetadata() {
  return {
    title: "Diploma Programs — Ashford & Gray Academy",
    description: "Comprehensive professional diploma programs in hospitality, business innovation, professional development, and events management.",
  };
}
