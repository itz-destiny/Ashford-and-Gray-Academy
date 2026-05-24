"use client";

import React from "react";
import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function CoursesPage() {
  // Direct matching ID registry of all signature institutional programs
  const allCourseIds = [
    "664f3a8b2d1c9e8a7f0e0001", // Housekeeping & Domestic Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0002", // Hospitality Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0003", // Events & Protocol Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0004", // Executive Assistant Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0005", // Hospitality & Global Relationship Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0006", // Diploma in Hospitality Management
    "664f3a8b2d1c9e8a7f0e0007", // Diploma in Professional Development & Global Relations
    "664f3a8b2d1c9e8a7f0e0008", // Diploma in Business Innovation & Entrepreneurship
    "664f3a8b2d1c9e8a7f0e0009", // Diploma in Event & Protocol Management
    "664f3a8b2d1c9e8a7f0e0010"  // The Silent Standard Certification Program (MBA)
  ];

  return (
    <CurriculumCatalog
      title="Elite Academic Divisions"
      subtitle="Immersive general management curricula built on case study methodologies, physical residency modules, and Board certification credentials."
      badge="Full Academic Registry"
      courseIds={allCourseIds}
    />
  );
}
