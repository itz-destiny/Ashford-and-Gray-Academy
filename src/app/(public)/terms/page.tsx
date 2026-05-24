import Link from "next/link";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export const metadata = {
    title: "Terms of Service — Ashford & Gray Fusion Academy",
    description: "The terms governing use of Ashford & Gray Fusion Academy's online learning platform, courses, certifications, and live classes.",
};

const LAST_UPDATED = "March 2026";

export default function TermsPage() {
    return (
        <div className="bg-white">
            <header className="py-24 md:py-32 text-center border-b border-slate-50">
                <div className="container px-6 lg:px-12">
                    <ScrollAnimation animation="fade-in-up">
                        <div className="inline-flex items-center gap-3 mb-8">
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                            <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Legal</span>
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                            Terms of <span className="italic text-[#C8A96A]">Service.</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-6">Last updated {LAST_UPDATED}</p>
                    </ScrollAnimation>
                </div>
            </header>

            <article className="py-20 md:py-24 container px-6 lg:px-12 max-w-3xl prose prose-slate prose-headings:font-serif prose-headings:text-[#0B1F3A] prose-h2:text-3xl prose-h2:mt-12 prose-h3:text-xl prose-h3:mt-8 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-[#0B1F3A] prose-a:text-[#1F7A5A] prose-a:no-underline hover:prose-a:underline">
                <p className="lead text-lg">
                    These Terms of Service ("Terms") govern your access to and use of Ashford &amp; Gray Fusion Academy's online learning platform, programmes, certifications, and related services (collectively, "the Services"). By creating an account or otherwise using the Services, you agree to be bound by these Terms.
                </p>

                <h2>1. Eligibility &amp; Account</h2>
                <p>You must be at least 16 years of age (or the age of majority in your jurisdiction, whichever is higher) to create an account. You are responsible for keeping your sign-in credentials confidential and for all activity that occurs under your account. Notify us immediately at <Link href="mailto:info@ashfordandgrayacademy.com">info@ashfordandgrayacademy.com</Link> if you suspect unauthorised access.</p>

                <h2>2. Programmes &amp; Certification</h2>
                <p>The Academy offers structured programmes including certificate courses, diplomas, executive masterclasses, and the Silent Standard Certification. Award of certification is contingent on completion of all stipulated assessments, attendance requirements, and adherence to academic integrity standards. Certificates are non-transferable and do not constitute employment or licensure of any kind.</p>

                <h2>3. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul>
                    <li>Share account credentials, certificates, or paid content with non-enrolled parties</li>
                    <li>Reverse-engineer, scrape, or otherwise misuse the platform's technical infrastructure</li>
                    <li>Record, transcribe, or redistribute live class content without explicit written permission</li>
                    <li>Use the Services to harass, defame, or harm any other learner, instructor, or staff member</li>
                    <li>Submit fraudulent, plagiarised, or AI-generated coursework in violation of academic integrity policy</li>
                    <li>Use the platform for any unlawful purpose</li>
                </ul>
                <p>Violation may result in immediate suspension or termination of your account without refund.</p>

                <h2>4. Fees, Payment &amp; Refunds</h2>
                <p>Tuition and event fees are stated in Nigerian Naira (₦) or other currencies as displayed. Payment is processed by Paystack and is due upon enrolment unless an instalment plan has been formally agreed in writing.</p>
                <p><strong>Refund policy:</strong></p>
                <ul>
                    <li>Full refund if requested in writing within 7 calendar days of enrolment AND before more than 10% of programme content has been accessed</li>
                    <li>Partial refund (50%) thereafter, up to 14 days from enrolment</li>
                    <li>No refund after the foregoing window or after a certificate has been issued</li>
                    <li>Refunds are made to the original payment method, within 14 business days</li>
                </ul>
                <p>The Academy reserves the right to reschedule or restructure programmes; if a cohort is cancelled by us before commencement you will receive a full refund or transfer to the next available cohort, at your election.</p>

                <h2>5. Intellectual Property</h2>
                <p>All curriculum materials, video lectures, written content, assessments, branding, and platform code are the intellectual property of Ashford &amp; Gray Fusion Academy or its licensors. You receive a limited, personal, non-transferable, non-exclusive licence to access this content for the duration of your enrolment.</p>
                <p>You retain ownership of work you submit (essays, assignments, projects), but grant the Academy a non-exclusive licence to use it for assessment, feedback, and — with appropriate anonymisation — programme improvement.</p>

                <h2>6. Live Classes &amp; Recording</h2>
                <p>Live classes may be recorded for the benefit of enrolled students who could not attend in real time. By joining a live class you consent to being recorded. Recordings are accessible only to the instructor, enrolled students of that cohort, and authorised Academy staff. Redistribution of recordings is prohibited.</p>

                <h2>7. Privacy</h2>
                <p>Your use of the Services is also subject to our <Link href="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>

                <h2>8. Disclaimers</h2>
                <p>The Services are provided on an "as is" and "as available" basis. While we work diligently to maintain platform reliability, we do not warrant that the Services will be uninterrupted, error-free, or that any specific career, examination, or financial outcome will result from completion of a programme.</p>

                <h2>9. Limitation of Liability</h2>
                <p>To the maximum extent permitted by applicable law, the Academy's aggregate liability arising out of or in connection with these Terms or your use of the Services shall not exceed the amount of fees paid by you to the Academy in the twelve (12) months preceding the event giving rise to the claim. In no event shall we be liable for indirect, incidental, consequential, or punitive damages.</p>

                <h2>10. Account Suspension &amp; Termination</h2>
                <p>We may suspend or terminate your account at any time for material breach of these Terms, fraud, harassment, payment default, or as required by law. You may close your account at any time by contacting us; outstanding obligations (including unpaid tuition) survive termination.</p>

                <h2>11. Governing Law &amp; Dispute Resolution</h2>
                <p>These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law principles. The parties agree to attempt good-faith resolution of any dispute through direct discussion for thirty (30) days before initiating formal proceedings. Proceedings, if necessary, shall be brought exclusively in the competent courts of Lagos, Nigeria.</p>

                <h2>12. Changes to these Terms</h2>
                <p>We may revise these Terms from time to time. Material changes will be communicated to active users by email or prominent in-platform notice at least 14 days before they take effect. Continued use of the Services after the effective date constitutes acceptance of the revised Terms.</p>

                <h2>13. Contact</h2>
                <p>
                    Ashford &amp; Gray Fusion Academy<br />
                    Email: <Link href="mailto:info@ashfordandgrayacademy.com">info@ashfordandgrayacademy.com</Link><br />
                    Phone: +234 916 000 8451 · +234 916 702 9427
                </p>

                <p className="text-xs text-slate-400 mt-12 italic">These Terms are a starting template prepared for the Academy. We recommend formal review by Nigerian counsel before reliance in a regulated or contentious matter.</p>
            </article>
        </div>
    );
}
