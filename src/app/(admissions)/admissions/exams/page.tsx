"use client";

import { ExamMonitorList } from "@/components/tests/ExamMonitorList";

export default function AdmissionsExamsPage() {
    return <ExamMonitorList base="/admissions/exams" theme="light" resultsHref="/admissions/exam-results" />;
}
