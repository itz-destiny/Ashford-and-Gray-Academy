"use client";

// Excel (.xlsx) export for the Exam Results page. The xlsx library is loaded
// only when someone clicks Export, so it doesn't slow the page down.

export interface ExportResult {
    name: string;
    email: string;
    studies: string[];
    status: 'not_taken' | 'in_progress' | 'awaiting_marking' | 'graded';
    score: number | null;
    scoreSoFar: number | null;
    maxScore: number;
    percent: number | null;
    submitReason: string | null;
    warnings: number;
    device: 'phone' | 'computer' | null;
    startedAt: string | null;
    submittedAt: string | null;
}

export interface ExportAssessment {
    title: string;
    type: 'test' | 'exam';
    opensAt: string;
    totalPoints: number;
    eligible: number;
    taken: number;
    averagePercent: number | null;
    results: ExportResult[];
}

const STATUS: Record<ExportResult['status'], string> = {
    not_taken: 'Not taken',
    in_progress: 'Writing now',
    awaiting_marking: 'Awaiting marking',
    graded: 'Submitted',
};

const WAT_DT: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
const WAT_D: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', year: 'numeric' };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-GB', WAT_DT) : '');

function rows(a: ExportAssessment) {
    // Best score first, then those still writing, then not taken.
    const order = (r: ExportResult) => (r.status === 'not_taken' ? 2 : r.status === 'in_progress' ? 1 : 0);
    return [...a.results]
        .sort((x, y) => order(x) - order(y) || (y.percent ?? -1) - (x.percent ?? -1) || x.name.localeCompare(y.name))
        .map((r, i) => ({
            '#': i + 1,
            Student: r.name,
            Email: r.email,
            'Programme of study': r.studies.join('; '),
            Status: STATUS[r.status],
            Score: r.score ?? r.scoreSoFar ?? null,
            'Out of': r.maxScore,
            'Percent (%)': r.percent,
            Warnings: a.type === 'exam' ? r.warnings : null,
            Device: r.device === 'phone' ? 'Phone' : r.device === 'computer' ? 'Computer' : '',
            'Started (WAT)': when(r.startedAt),
            'Submitted (WAT)': when(r.submittedAt),
            Note: r.submitReason === 'violations' ? 'Auto-submitted after 3 warnings'
                : r.submitReason === 'time_up' ? 'Submitted when time ran out'
                : r.status === 'awaiting_marking' ? 'Score so far; written answers still to be marked' : '',
        }));
}

const WIDTHS = [5, 26, 34, 30, 16, 8, 8, 12, 10, 10, 20, 20, 40];

/** Excel sheet names: max 31 chars, no []:*?/\ , unique. */
function sheetName(title: string, used: Set<string>): string {
    const base = title.replace(/[[\]:*?/\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 28).trim() || 'Sheet';
    let name = base;
    for (let n = 2; used.has(name.toLowerCase()); n++) name = `${base.slice(0, 26).trim()} ${n}`;
    used.add(name.toLowerCase());
    return name;
}

function fileName(text: string) {
    return `${text}`.replace(/[\\/:*?"<>|]/g, '-').slice(0, 120) + '.xlsx';
}

async function addResultsSheet(XLSX: any, wb: any, a: ExportAssessment, used: Set<string>) {
    const ws = XLSX.utils.json_to_sheet(rows(a));
    ws['!cols'] = WIDTHS.map(wch => ({ wch }));
    ws['!autofilter'] = { ref: ws['!ref'] };
    XLSX.utils.book_append_sheet(wb, ws, sheetName(a.title, used));
}

/** One exam -> one .xlsx file. */
export async function exportAssessmentToExcel(courseTitle: string, a: ExportAssessment) {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    await addResultsSheet(XLSX, wb, a, new Set());
    XLSX.writeFile(wb, fileName(`${courseTitle} - ${a.title}`));
}

/** A whole course -> one .xlsx with a Summary sheet plus one sheet per exam. */
export async function exportCourseToExcel(courseTitle: string, assessments: ExportAssessment[]) {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const used = new Set<string>(['summary']);
    const summary = XLSX.utils.json_to_sheet(assessments.map(a => ({
        Exam: a.title,
        Type: a.type === 'exam' ? 'Exam' : 'Test',
        Date: new Date(a.opensAt).toLocaleDateString('en-GB', WAT_D),
        'Out of': a.totalPoints,
        'Took it': a.taken,
        Eligible: a.eligible,
        'Average (%)': a.averagePercent,
    })));
    summary['!cols'] = [44, 8, 14, 8, 9, 9, 12].map(wch => ({ wch }));
    XLSX.utils.book_append_sheet(wb, summary, 'Summary');
    for (const a of assessments) await addResultsSheet(XLSX, wb, a, used);
    const stamp = new Date().toLocaleDateString('en-GB', WAT_D);
    XLSX.writeFile(wb, fileName(`Exam Results - ${courseTitle} - ${stamp}`));
}
