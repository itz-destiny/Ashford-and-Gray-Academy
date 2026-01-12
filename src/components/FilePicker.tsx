"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Link as LinkIcon, X, Check, Loader2 } from 'lucide-react';
import { useStorage } from '@/firebase/provider';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

interface FilePickerProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    accept?: string;
    placeholder?: string;
}

export function FilePicker({ label, value, onChange, accept = "image/*", placeholder = "https://..." }: FilePickerProps) {
    const [mode, setMode] = useState<'url' | 'upload'>(value.startsWith('http') && !value.includes('firebasestorage') ? 'url' : 'upload');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const storage = useStorage();
    const { toast } = useToast();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setProgress(0);

        try {
            const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(p);
                },
                (error) => {
                    console.error("Upload error:", error);
                    toast({
                        variant: "destructive",
                        title: "Upload Failed",
                        description: error.message
                    });
                    setIsUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onChange(downloadURL);
                    setIsUploading(false);
                    toast({
                        title: "Success",
                        description: "File uploaded successfully"
                    });
                }
            );
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            });
            setIsUploading(false);
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
                                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Check className="w-8 h-8 text-green-500" />
                                    <span className="text-xs text-slate-500">Video Uploaded</span>
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
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors ${isUploading ? 'pointer-events-none' : ''}`}
                        >
                            {isUploading ? (
                                <div className="space-y-4">
                                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-600" />
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Uploading... {Math.round(progress)}%</p>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                        <p className="text-xs text-slate-500">{accept === 'image/*' ? 'PNG, JPG or WebP' : 'MP4, WebM or Ogg'}</p>
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

import { Trash2 } from 'lucide-react';
