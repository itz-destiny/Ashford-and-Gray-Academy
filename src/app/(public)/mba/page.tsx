import CourseDetailPage from "../courses/[id]/page";

export default async function MBAPage() {
    // Resolve the params promise with the permanent ID of our hallmark Executive MBA program
    const paramsPromise = Promise.resolve({ id: "664f3a8b2d1c9e8a7f0e0010" });
    return <CourseDetailPage params={paramsPromise} />;
}

export async function generateMetadata() {
    return {
        title: "Executive MBA (The Silent Standard) — Ashford & Gray Fusion Academy",
        description: "Our ultra-premium executive-level professional development program designed to cultivate disciplined leaders, operational strategists, and institutional authorities.",
    };
}
