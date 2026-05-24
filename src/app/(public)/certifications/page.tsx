import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function CertificationsPage() {
  const certificationCourseIds = [
    "664f3a8b2d1c9e8a7f0e0010", // The Silent Standard Certification
    "664f3a8b2d1c9e8a7f0e0008", // Diploma in Business Innovation & Entrepreneurship
    "664f3a8b2d1c9e8a7f0e0007"  // Diploma in Professional Development & Global Relations
  ];

  return (
    <CurriculumCatalog
      title="Professional Certifications"
      subtitle="Elite credentialing frameworks, professional development diplomacies, and innovation strategy models to earn globally recognized board badges."
      badge="Registry Credentials"
      courseIds={certificationCourseIds}
    />
  );
}

export async function generateMetadata() {
  return {
    title: "Professional Certifications — Ashford & Gray Fusion Academy",
    description: "Elite credentialing frameworks, professional development diplomacies, and innovation strategy models to earn globally recognized board badges.",
  };
}
