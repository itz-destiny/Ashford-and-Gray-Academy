"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Link as LinkIcon, X, Check, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';

type Category = 'image' | 'video' | 'document';

interface FilePickerProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    accept?: string;
    placeholder?: string;
}

type SignedUrlResponse = {
    uploadUrl: string;
    publicUrl: string;
    path: string;
    maxBytes: number;
    expiresAt: string;
};

function categoryForAccept(accept: string): Category {
    if (accept.startsWith('image')) return 'image';
    if (accept.startsWith('video')) return 'video';
    return 'document';
}

async function requestSignedUrl(
    idToken: string,
    payload: { filename: string; contentType: string; category: Category }
): Promise<SignedUrlResponse> {
    const res = await fetch('/api/storage/signed-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to issue signed URL (HTTP ${res.status})`);
    }
    return res.json();
}

function uploadToSignedUrl(
    uploadUrl: string,
    file: File,
    onProgress: (pct: number) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed (HTTP ${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
    });
}

export function FilePicker({
    label,
    value,
    onChange,
    accept = 'image/*',
    placeholder = 'https://...',
}: FilePickerProps) {
    const auth = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<'url' | 'upload'>(
        value.startsWith('http') && !value.includes('firebasestorage') ? 'url' : 'upload'
    );
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset input so the same file can be re-selected after failure.
        e.target.value = '';

        const currentUser = auth?.currentUser;
        if (!currentUser) {
            toast({
                variant: 'destructive',
                title: 'Sign in required',
                description: 'You must be signed in to upload files.',
            });
            return;
        }

        const category = categoryForAccept(accept);
        setIsUploading(true);
        setProgress(0);

        try {
            const idToken = await currentUser.getIdToken();
            const signed = await requestSignedUrl(idToken, {
                filename: file.name,
                contentType: file.type,
                category,
            });

            if (file.size > signed.maxBytes) {
                throw new Error(
                    `File is too large. Maximum ${Math.round(signed.maxBytes / (1024 * 1024))} MB.`
                );
            }

            await uploadToSignedUrl(signed.uploadUrl, file, setProgress);
            onChange(signed.publicUrl);
            toast({ title: 'Upload complete', description: file.name });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Upload failed';
            console.error('Upload error:', err);
            toast({ variant: 'destructive', title: 'Upload failed', description: message });
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>{label}</Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={mode === 'url' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMode('url')}
                        className="h-7 px-2 text-xs"
                    >
                        <LinkIcon className="w-3 h-3 mr-1" /> URL
                    </Button>
                    <Button
                        type="button"
                        variant={mode === 'upload' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMode('upload')}
                        className="h-7 px-2 text-xs"
                    >
                        <Upload className="w-3 h-3 mr-1" /> Upload
                    </Button>
                </div>
            </div>

            {mode === 'url' ? (
                <div className="flex gap-2">
                    <Input
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    {value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onChange('')}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {value && !isUploading ? (
                        <div className="relative group rounded-lg overflow-hidden border bg-slate-50 aspect-video flex items-center justify-center">
                            {accept.includes('image') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Check className="w-8 h-8 text-green-500" />
                                    <span className="text-xs text-slate-500">File uploaded</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onChange('')}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors ${
                                isUploading ? 'pointer-events-none' : ''
                            }`}
                        >
                            {isUploading ? (
                                <div className="space-y-4">
                                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-600" />
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">
                                            Uploading... {Math.round(progress)}%
                                        </p>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {accept === 'image/*'
                                                ? 'PNG, JPG or WebP'
                                                : accept.startsWith('video')
                                                ? 'MP4, WebM or Ogg'
                                                : 'PDF'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept={accept}
                                onChange={handleUpload}
                                disabled={isUploading}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
