import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function ExecutiveEducationPage() {
  const executiveCourseIds = [
    "6a44e9f2bae728bb84e67681", // Professional Excellence & The Silent Standard
  ];

  return (
    <CurriculumCatalog
      title="Executive Master Class"
      subtitle="Our signature executive-level programme designed to cultivate disciplined leaders, operational strategists, and institutional authorities."
      badge="Executive Master Class"
      courseIds={executiveCourseIds}
      acceleration="4 Weeks"
    />
  );
}

export async function generateMetadata() {
  return {
    title: "Executive Master Class — Ashford & Gray Academy",
    description: "Our signature executive-level programme designed to cultivate disciplined leaders, operational strategists, and institutional authorities.",
  };
}
