"use client";

import { ExamMonitorList } from "@/components/tests/ExamMonitorList";

export default function RegistrarExamsPage() {
    return <ExamMonitorList base="/registrar/exams" theme="light" resultsHref="/registrar/exam-results" />;
}
