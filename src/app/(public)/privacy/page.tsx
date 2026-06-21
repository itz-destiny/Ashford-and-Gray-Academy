import Link from "next/link";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export const metadata = {
    title: "Privacy Policy — Ashford & Gray Fusion Academy",
    description: "How Ashford & Gray Fusion Academy collects, uses, stores, and protects the personal data of students, instructors, and visitors.",
};

const LAST_UPDATED = "March 2026";

export default function PrivacyPage() {
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
                            Privacy <span className="text-[#C8A96A]">Policy.</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-6">Last updated {LAST_UPDATED}</p>
                    </ScrollAnimation>
                </div>
            </header>

            <article className="py-20 md:py-24 container px-6 lg:px-12 max-w-3xl prose prose-slate prose-headings:font-serif prose-headings:text-[#0B1F3A] prose-h2:text-3xl prose-h2:mt-12 prose-h3:text-xl prose-h3:mt-8 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-[#0B1F3A] prose-a:text-[#1F7A5A] prose-a:no-underline hover:prose-a:underline">
                <p className="lead text-lg">
                    Ashford &amp; Gray Fusion Academy ("the Academy", "we", "our", "us") is committed to safeguarding the privacy of every student, instructor, staff member, and visitor who engages with our platform. This Privacy Policy explains what personal information we collect, how it is used, with whom it is shared, and the rights you have over it.
                </p>

                <h2>1. Information We Collect</h2>
                <h3>1.1 Information you provide directly</h3>
                <ul>
                    <li><strong>Identity</strong>: full name, date of birth, prior institution, professional title</li>
                    <li><strong>Contact</strong>: email address, phone number where supplied</li>
                    <li><strong>Account credentials</strong>: securely hashed passwords (we never see plaintext)</li>
                    <li><strong>Academic content</strong>: assignment submissions, course progress, messages sent to instructors and peers</li>
                    <li><strong>Payment information</strong>: handled directly by Paystack — we receive only a transaction reference, not card numbers or CVV</li>
                </ul>
                <h3>1.2 Information collected automatically</h3>
                <ul>
                    <li>Device and browser type</li>
                    <li>IP address and approximate location, used for security and rate limiting</li>
                    <li>Live class attendance and recording metadata (LiveKit)</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <ul>
                    <li>To operate the Academy: authentication, course delivery, live classes, certification, payments</li>
                    <li>To communicate with you: enrolment confirmations, password resets, system alerts, optional newsletter updates</li>
                    <li>To improve the platform: aggregate analytics on programme performance and academic outcomes</li>
                    <li>To comply with legal obligations and detect misuse</li>
                </ul>

                <h2>3. Service Providers</h2>
                <p>We rely on a small set of trusted infrastructure providers. Each receives only the data needed to perform their function:</p>
                <ul>
                    <li><strong>Firebase Authentication &amp; Storage</strong> (Google LLC) — identity verification, file uploads</li>
                    <li><strong>MongoDB Atlas</strong> — encrypted persistence of profiles, enrolments, transactions</li>
                    <li><strong>Paystack</strong> — payment processing, PCI-DSS compliant</li>
                    <li><strong>LiveKit Cloud</strong> — live class video infrastructure</li>
                    <li><strong>Resend</strong> — transactional email delivery</li>
                    <li><strong>Vercel</strong> — application hosting</li>
                </ul>
                <p>We do not sell your personal data to any third party.</p>

                <h2>4. Cookies &amp; Local Storage</h2>
                <p>We use strictly necessary cookies and browser local storage to keep you signed in, remember your notification preferences, and prevent cross-site request forgery. We do not use third-party advertising cookies.</p>

                <h2>5. Data Retention</h2>
                <p>We retain account information for as long as your account is active, plus a reasonable period thereafter for academic records, financial reconciliation, and legal compliance. Live class recordings are retained for the duration of the relevant cohort plus 12 months unless you request earlier deletion. Newsletter subscribers may unsubscribe at any time via the link in every email.</p>

                <h2>6. Your Rights</h2>
                <p>Subject to applicable law, you have the right to:</p>
                <ul>
                    <li>Access the personal data we hold about you</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of your account and associated data</li>
                    <li>Object to or restrict certain processing</li>
                    <li>Withdraw consent for newsletter communications</li>
                </ul>
                <p>To exercise any of these rights, contact us at <Link href="mailto:info@ashfordgrayacademy.com">info@ashfordgrayacademy.com</Link>.</p>

                <h2>7. Security</h2>
                <p>We protect your data with industry-standard safeguards including encrypted transport (HTTPS), encrypted storage, role-based access controls, signed authentication tokens, and rate limiting. Despite these measures, no system can be guaranteed to be entirely secure. If a breach occurs that materially affects your data, we will notify you in accordance with applicable law.</p>

                <h2>8. Children's Privacy</h2>
                <p>The Academy's programmes are designed for adult learners. We do not knowingly collect personal data from individuals under the age of 16 without verifiable parental consent.</p>

                <h2>9. International Data Transfers</h2>
                <p>Our infrastructure providers are headquartered primarily in the United States and the European Union. By using the Academy, you consent to the transfer and processing of your information in these jurisdictions in accordance with this Policy.</p>

                <h2>10. Changes to this Policy</h2>
                <p>We may update this Privacy Policy from time to time. Material changes will be communicated to you via email or a prominent notice within the platform. The "Last updated" date at the top of this page reflects the most recent revision.</p>

                <h2>11. Contact</h2>
                <p>
                    Ashford &amp; Gray Fusion Academy<br />
                    Email: <Link href="mailto:info@ashfordgrayacademy.com">info@ashfordgrayacademy.com</Link><br />
                    Phone: +234 816 691 8942 · +234 808 097 1690
                </p>
            </article>
        </div>
    );
}
