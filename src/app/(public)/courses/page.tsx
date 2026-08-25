"use client";

import React from "react";
import { CurriculumCatalog } from "@/components/curriculum-catalog";

export default function CoursesPage() {
  // Direct matching ID registry of all signature institutional programs.
  // Degree & Diploma programs are hidden for now (see /programs) — restore by
  // swapping these ids back in whenever diplomas relaunch.
  const allCourseIds = [
    "6a44e9f2bae728bb84e67624", // Housekeeping & Domestic Management (Certificate)
    "6a44e9f2bae728bb84e67629", // Hospitality Management (Certificate)
    "6a44e9f2bae728bb84e6762e", // Events & Protocol Management (Certificate)
    "6a44e9f2bae728bb84e67633", // Executive Assistant Management (Certificate)
    "6a44e9f2bae728bb84e67638", // Hospitality & Global Relationship Management (Certificate)
    "6a44e9f2bae728bb84e6763d", // Certificate in Business Innovation & Entrepreneurship
    "6a44e9f2bae728bb84e67644", // Certificate in Food & Beverage Management
    "6a44e9f2bae728bb84e6764b", // Hospitality Workforce Management (formerly Hospitality Labour Management)
    "6a44e9f2bae728bb84e67652", // Certificate in Restaurant & Bar Service
    "6a75aaad7cc19b6ca1a85f95", // Service Excellence (formerly The Silent Standard, split from the Executive Master Class)
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
