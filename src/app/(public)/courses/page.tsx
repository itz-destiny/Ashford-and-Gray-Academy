"use client";

import React from "react";
import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function CoursesPage() {
  // Direct matching ID registry of all signature institutional programs.
  // Degree & Diploma programs are hidden for now (see /programs) — restore by
  // swapping these ids back in whenever diplomas relaunch.
  const allCourseIds = [
    "664f3a8b2d1c9e8a7f0e0001", // Housekeeping & Domestic Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0002", // Hospitality Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0003", // Events & Protocol Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0004", // Executive Assistant Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0005", // Hospitality & Global Relationship Management (Certificate)
    "664f3a8b2d1c9e8a7f0e0011", // Certificate in Business Innovation & Entrepreneurship
    "664f3a8b2d1c9e8a7f0e0012", // Certificate in Food & Beverage Management
    "664f3a8b2d1c9e8a7f0e0013", // Certificate in Hospitality Labour Management
    "664f3a8b2d1c9e8a7f0e0014", // Certificate in Restaurant & Bar Service
    "664f3a8b2d1c9e8a7f0e0010", // The Silent Standard Certification Program
  ];

  return (
    <CurriculumCatalog
      title="Elite Academic Divisions"
      subtitle="Immersive general management curricula delivered through online classes, case study methodologies, and Board certification credentials."
      badge="Full Academic Registry"
      courseIds={allCourseIds}
    />
  );
}
