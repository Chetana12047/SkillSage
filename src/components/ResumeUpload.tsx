"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Eye,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface ResumeUploadProps {
  onUpload: (data: any) => void;
  savedData?: any;
  onReset?: () => void;
}

export default function ResumeUpload({
  onUpload,
  savedData,
  onReset,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "info">("info");

  // Skills detected from resume by AI
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
  const [resumeLevel, setResumeLevel] = useState("");
  const [resumeSummary, setResumeSummary] = useState("");
  const [suggestedGoals, setSuggestedGoals] = useState<string[]>([]);

  // Manual fields
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("College Student");

  const abortRef = useRef<AbortController | null>(null);

  /* ── Auto-load saved data ────────────────────────────────── */
  useEffect(() => {
    if (!savedData) return;

    if (savedData.resume) {
      setUploadedFile(savedData.resume);
    } else if (savedData.resumeUrl) {
      setUploadedFile({ name: "Uploaded Resume", url: savedData.resumeUrl, size: 0 });
    }

    // Show previously detected skills if any
    if (savedData.skills?.length > 0) {
      setDetectedSkills(savedData.skills);
    }

    setSkills(savedData.manualSkills || savedData.skills?.join(", ") || "");
    setGoal(savedData.goal || "");
    setExperience(savedData.experience || "College Student");
  }, [savedData]);

  /* ── Drag handlers ───────────────────────────────────────── */
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  /* ── Main upload + AI extraction ─────────────────────────── */
  const handleFileUpload = async (file: File) => {
    setMsg("");
    setDetectedSkills([]);
    setResumeSummary("");
    setSuggestedGoals([]);

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(file.type)) {
      setMsg("Only PDF, DOC, DOCX files allowed.");
      setMsgType("error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMsg("Max file size is 2MB.");
      setMsgType("error");
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setMsg("Uploading and analyzing your resume with AI...");
    setMsgType("info");

    const formData = new FormData();
    formData.append("resume", file);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json();
      setIsProcessing(false);

      if (res.ok) {
        const fileData = { name: file.name, size: file.size, url: data.url };
        setUploadedFile(fileData);

        // ── FIXED: use AI-extracted skills from server response ──
        const extractedSkills: string[] = data.skills ?? [];
        const level: string = data.level ?? "";
        const summary: string = data.summary ?? "";
        const goals: string[] = data.suggestedGoals ?? [];

        setDetectedSkills(extractedSkills);
        setResumeLevel(level);
        setResumeSummary(summary);
        setSuggestedGoals(goals);

        // Auto-populate skills textarea with detected skills
        if (extractedSkills.length > 0) {
          setSkills(extractedSkills.join(", "));
        }

        // Auto-populate goal if we found one and user hasn't typed one
        if (goals.length > 0 && !goal) {
          setGoal(goals[0]);
        }

        setMsg(`✓ Resume analyzed! Found ${extractedSkills.length} skills.`);
        setMsgType("success");

        // Pass EVERYTHING to dashboard — including AI-extracted data
        onUpload({
          resume: fileData,
          resumeUrl: data.url,
          skills: extractedSkills,           // ← AI-detected skills array
          currentSkills: extractedSkills,    // ← used by GoalSetting for skill gap
          manualSkills: extractedSkills.join(", "),
          currentLevel: level,
          resumeLevel: level,
          resumeSummary: summary,
          suggestedGoals: goals,
          goal: goal || goals[0] || "",
          experience,
        });

      } else {
        setMsg(data.error || "Upload failed.");
        setMsgType("error");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setIsProcessing(false);
        setMsg("Upload failed. Please try again.");
        setMsgType("error");
      }
    }
  };

  const removeFile = async () => {
    if (abortRef.current) abortRef.current.abort();
    await fetch("/api/resume/delete", { method: "POST" });
    setUploadedFile(null);
    setDetectedSkills([]);
    setResumeSummary("");
    setSuggestedGoals([]);
    setMsg("File removed.");
    setMsgType("info");
    if (onReset) onReset();
  };

  const viewFile = () => {
    const url = uploadedFile?.url || savedData?.resumeUrl;
    if (url) window.open(url, "_blank");
  };

  const continueManual = () => {
    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    onUpload({
      manualSkills: skills,
      skills: skillsArray,
      currentSkills: skillsArray,
      goal,
      experience,
      resume: uploadedFile,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">

        {/* ── LEFT: File Upload ────────────────────────────── */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-[22px]">
              <Upload className="w-5 h-5" />
              Upload Your Resume
            </CardTitle>
            <CardDescription className="text-md">
              AI will extract your skills, projects & experience automatically
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FileText className="w-14 h-14 mx-auto mb-4 text-gray-400" />
                <p className="text-[22px] font-medium mb-2">Drop your resume here</p>
                <p className="text-gray-500 mb-5">or</p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="inline-block px-6 py-3 border rounded-xl hover:bg-gray-100 transition">
                    Browse Files
                  </span>
                </label>
                <p className="text-sm text-gray-400 mt-5">PDF, DOC, DOCX — Max 2MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {uploadedFile.size ? `${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB` : "Saved File"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={viewFile} className="p-2 hover:bg-gray-200 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={removeFile} className="p-2 hover:bg-gray-200 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isProcessing ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">AI is analyzing your resume...</p>
                  </div>
                ) : (
                  <div className="flex gap-2 text-green-600 items-center">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Resume analyzed successfully</span>
                  </div>
                )}
              </div>
            )}

            {msg && (
              <div className={`mt-4 flex items-start gap-2 text-sm p-3 rounded-lg ${
                msgType === "success" ? "bg-green-50 text-green-700" :
                msgType === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
              }`}>
                {msgType === "error" ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : null}
                {msg}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── RIGHT: Manual + Preview ──────────────────────── */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-[22px]">Or Enter Skills Manually</CardTitle>
            <CardDescription className="text-md">
              {detectedSkills.length > 0
                ? "Skills below were auto-extracted from your resume"
                : "Your signup data auto appears here"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <label className="font-medium">
                Your Skills
                {detectedSkills.length > 0 && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ {detectedSkills.length} extracted from resume
                  </span>
                )}
              </label>
              <textarea
                rows={4}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Java, React, Spring Boot, MySQL..."
                className="w-full mt-2 p-4 rounded-xl border resize-none text-sm"
              />
            </div>

            <div>
              <label className="font-medium">Career Goals</label>
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Java Full Stack Developer"
                className="mt-2"
              />
              {suggestedGoals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">AI suggests:</span>
                  {suggestedGoals.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setGoal(g)}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="font-medium">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full mt-2 p-4 rounded-xl border"
              >
                <option>College Student</option>
                <option>Recent Graduate</option>
                <option>Fresher</option>
                <option>Working Professional</option>
              </select>
            </div>

            <Button onClick={continueManual} className="w-full h-12">
              Continue to Goal Setting
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── AI-extracted skills preview ──────────────────────── */}
      {detectedSkills.length > 0 && resumeSummary && (
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">AI Resume Analysis</h3>
              {resumeLevel && (
                <Badge className="bg-blue-600 text-white text-xs">{resumeLevel}</Badge>
              )}
            </div>

            {resumeSummary && (
              <p className="text-sm text-blue-800 mb-4 leading-relaxed">{resumeSummary}</p>
            )}

            <div>
              <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">
                Skills detected ({detectedSkills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {detectedSkills.map((skill, i) => (
                  <Badge key={i} className="bg-white text-blue-800 border border-blue-200 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}