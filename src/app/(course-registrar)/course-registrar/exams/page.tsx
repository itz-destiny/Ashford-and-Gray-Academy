"use client";

import { ExamMonitorList } from "@/components/tests/ExamMonitorList";

export default function AcademicAffairsExamsPage() {
    return <ExamMonitorList base="/course-registrar/exams" theme="light" resultsHref="/course-registrar/exam-results" />;
}
