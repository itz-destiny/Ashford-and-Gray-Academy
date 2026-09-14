import { AccountsTable } from "@/components/admin/AccountsTable";

export default function AdminStudentsPage() {
    return (
        <div className="px-6 md:px-12 py-12 space-y-10 pb-32 max-w-[1400px] mx-auto bg-[#FAF9F6]">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Master Control</span>
                </div>
                <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Students.</h1>
                <p className="text-slate-500 font-medium font-serif">Every student's real login status, across the whole cohort.</p>
            </div>
            <AccountsTable role="student" />
        </div>
    );
}
