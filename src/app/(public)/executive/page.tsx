import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function ExecutiveEducationPage() {
  const executiveCourseIds = [
    "664f3a8b2d1c9e8a7f0e0010", // The Silent Standard
  ];

  return (
    <CurriculumCatalog
      title="Executive Master Class"
      subtitle="Our signature executive-level programme designed to cultivate disciplined leaders, operational strategists, and institutional authorities."
      badge="Executive Master Class"
      courseIds={executiveCourseIds}
    />
  );
}

export async function generateMetadata() {
  return {
    title: "Executive Master Class — Ashford & Gray Academy",
    description: "Our signature executive-level programme designed to cultivate disciplined leaders, operational strategists, and institutional authorities.",
  };
}
