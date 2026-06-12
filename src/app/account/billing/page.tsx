
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Loader2, Building2, Copy, CheckCircle2, Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BANK_DETAILS = {
  bankName: "Zenith Bank",
  accountName: "Ashford and Gray Fusion Academy",
  accountNumber: "1311180687",
  sortCode: "057",
};

export default function BillingPage() {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast({ title: "Copied!", description: `${field} copied to clipboard.` });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Maximum upload size is 5MB." });
      return;
    }
    setReceiptFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile || !user) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", receiptFile);
      formData.append("note", paymentNote);
      formData.append("userId", user.uid);
      formData.append("email", user.email || "");
      formData.append("displayName", user.displayName || "");

      const res = await apiFetch("/api/payments/receipt", {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }

      setSubmitted(true);
      toast({
        title: "Receipt Submitted",
        description: "Your payment receipt has been sent to the finance team for confirmation. You will be notified once verified.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error?.message || "Could not submit your receipt. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (userLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-12 w-12 text-[#1F7A5A]" /></div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif text-[#0B1F3A]">Billing & Payments</h1>
        <p className="text-slate-400 font-medium">Make your tuition payment via direct bank transfer and upload your receipt for confirmation.</p>
      </div>

      {/* Step 1: Bank Transfer Details */}
      <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0B1F3A] flex items-center justify-center text-[#C8A96A] font-black text-sm">1</div>
            <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Bank Transfer Details</CardTitle>
          </div>
          <CardDescription className="text-slate-400 pl-14">
            Transfer your tuition fee to the account below. Please use your full name as the payment reference.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-8">
          <div className="bg-gradient-to-br from-[#0B1F3A] to-[#132d52] rounded-3xl p-8 md:p-10 text-white space-y-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#C8A96A]/5 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#C8A96A]/5 rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                <Building2 className="w-7 h-7 text-[#C8A96A]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.3em]">Institution Account</p>
                <p className="text-lg font-serif text-white">{BANK_DETAILS.bankName}</p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 group hover:border-[#C8A96A]/30 transition-all">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Account Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-white">{BANK_DETAILS.accountName}</p>
                  <button
                    onClick={() => copyToClipboard(BANK_DETAILS.accountName, "Account Name")}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    {copied === "Account Name" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 group hover:border-[#C8A96A]/30 transition-all">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-[#C8A96A] tracking-wider">{BANK_DETAILS.accountNumber}</p>
                  <button
                    onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, "Account Number")}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    {copied === "Account Number" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10 bg-[#C8A96A]/10 border border-[#C8A96A]/20 rounded-2xl p-5 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-[#C8A96A] shrink-0 mt-0.5" />
              <p className="text-xs text-white/70 leading-relaxed">
                Please use your <strong className="text-white">full registered name</strong> as the payment reference so our finance team can match your transfer to your account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Upload Receipt */}
      <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0B1F3A] flex items-center justify-center text-[#C8A96A] font-black text-sm">2</div>
            <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Upload Payment Receipt</CardTitle>
          </div>
          <CardDescription className="text-slate-400 pl-14">
            After making your transfer, upload a screenshot or photo of your payment receipt. Our finance team will verify and confirm within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-8 space-y-8">
          {submitted ? (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-emerald-50 rounded-[3rem] border-2 border-dashed border-emerald-200">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h4 className="text-xl font-serif text-[#0B1F3A] mb-3">Receipt Submitted Successfully</h4>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                Your payment receipt has been sent to the finance team. You will receive a notification once your payment has been confirmed and your course access is activated.
              </p>
              <Button
                onClick={() => { setSubmitted(false); setReceiptFile(null); setReceiptPreview(null); setPaymentNote(""); }}
                className="mt-8 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black px-10 py-5 rounded-2xl h-auto text-[10px] uppercase tracking-widest"
              >
                Submit Another Receipt
              </Button>
            </div>
          ) : (
            <>
              {/* Upload Area */}
              <div
                onClick={() => fileRef.current?.click()}
                className="py-16 flex flex-col items-center justify-center text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 hover:border-[#C8A96A] hover:bg-[#C8A96A]/5 transition-all cursor-pointer group"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {receiptPreview ? (
                  <div className="space-y-4">
                    <img src={receiptPreview} alt="Receipt preview" className="max-h-48 rounded-2xl shadow-md mx-auto" />
                    <p className="text-sm font-bold text-[#0B1F3A]">{receiptFile?.name}</p>
                    <p className="text-xs text-slate-400">Click to change file</p>
                  </div>
                ) : receiptFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#C8A96A] mx-auto">
                      <FileText size={32} />
                    </div>
                    <p className="text-sm font-bold text-[#0B1F3A]">{receiptFile.name}</p>
                    <p className="text-xs text-slate-400">Click to change file</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4 group-hover:text-[#C8A96A] transition-colors">
                      <Upload size={32} />
                    </div>
                    <h4 className="text-lg font-serif text-[#0B1F3A] mb-2">Upload your payment receipt</h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Click here or drag and drop your receipt image or PDF. Maximum file size: 5MB.
                    </p>
                  </>
                )}
              </div>

              {/* Payment Note */}
              <div className="space-y-3">
                <Label htmlFor="paymentNote" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Note (Optional)</Label>
                <Input
                  id="paymentNote"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="E.g. Payment for Diploma in Hospitality Management — First installment"
                  className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1F7A5A]"
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmitReceipt}
                disabled={!receiptFile || uploading}
                className="w-full h-16 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black rounded-2xl shadow-xl transition-all text-[10px] uppercase tracking-widest gap-2 disabled:opacity-40"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={16} />}
                Submit Payment Receipt
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
