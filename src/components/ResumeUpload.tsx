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

const EXPERIENCE_OPTIONS = [
  "College Student",
  "Recent Graduate",
  "Fresher",
  "Working Professional",
];

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
  const [goalLocked, setGoalLocked] = useState(false);
  const [experience, setExperience] = useState("College Student");
  const [otherExperience, setOtherExperience] = useState("");
  const [atsData, setAtsData] =
  useState<{
    score: number
    matchedSkills: string[]
    missingSkills: string[]
  } | null>(null)
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
if (
  savedData?.atsData &&
  savedData?.resumeUrl
) {
  setAtsData({
    score:
      savedData.atsData.score || 0,

    matchedSkills:
      Array.isArray(
        savedData.atsData.matchedSkills
      )
        ? savedData.atsData.matchedSkills
        : [],

    missingSkills:
      Array.isArray(
        savedData.atsData.missingSkills
      )
        ? savedData.atsData.missingSkills
        : [],
  });
} else {
  setAtsData(null);
}

    // Prefer the freshest, most complete source: AI-extracted skills (array)
    // over manualSkills (a string that can go stale — e.g. left over from
    // signup, or a smaller set typed in before a later, more thorough
    // resume re-upload). Only fall back to manualSkills when there's no
    // extracted skills array to show.
    if (savedData.skills?.length > 0) {
      setSkills(savedData.skills.join(", "));
    } else {
      setSkills(savedData.manualSkills || "");
    }

    const savedGoal = savedData.goal || "";
    setGoal(savedGoal);
    // A goal decided earlier (at signup, or by AI extraction) is locked by
    // default — the user explicitly clicks "Change" to edit it here, so we
    // stop asking the same question on every page. Respect an explicit
    // goalLocked:false (e.g. user clicked "Change" and was sent back here).
    setGoalLocked(
      savedData.goalLocked === false
        ? false
        : Boolean(savedGoal)
    );

    // If the saved experience isn't one of the preset options, treat it as
    // a custom value the user typed in previously and restore it into the
    // "Other" text box instead of silently dropping it.
    const savedExperience = savedData.experience || "College Student";
    if (savedExperience && !EXPERIENCE_OPTIONS.includes(savedExperience)) {
      setExperience("Other");
      setOtherExperience(savedExperience);
    } else {
      setExperience(savedExperience);
    }
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
  if (isProcessing) return;

  setMsg("");
  setDetectedSkills([]);
  setResumeSummary("");
  setSuggestedGoals([]);
  //setAtsData(null);

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
  setMsg(" ");
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
      const fileData = {
        name: file.name,
        size: file.size,
        url: data.url,
      };

      setUploadedFile(fileData);

      const extractedSkills: string[] =
        data.skills ?? [];

      const level: string =
        data.level ?? "";

      const summary: string =
        data.summary ?? "";

      const goals: string[] =
        data.suggestedGoals ?? [];

      /* ATS SCORE */

       setAtsData(data.atsData || null);

      /* STORE DATA */

      setDetectedSkills(extractedSkills);
      setResumeLevel(level);
      setResumeSummary(summary);
      setSuggestedGoals(goals);

      if (extractedSkills.length > 0) {
        setSkills(
          extractedSkills.join(", ")
        );
      }

      if (goals.length > 0 && !goal) {
        setGoal(goals[0]);
      }

      setMsg(
        `✓ Resume analyzed! Found ${extractedSkills.length} skills.`
      );

      setMsgType("success");

      onUpload({
        resume: fileData,
        resumeUrl: data.url,

        skills: extractedSkills,

        currentSkills:
          extractedSkills,

        manualSkills:
          extractedSkills.join(", "),

        currentLevel: level,
        resumeLevel: level,
        resumeSummary: summary,

        suggestedGoals: goals,

        goal:
          goal || goals[0] || "",

        goalLocked:
          goalLocked ||
          Boolean(goal) ||
          goals.length > 0,

        experience:
          experience === "Other"
            ? otherExperience
            : experience,

        atsData: data.atsData,
      });
    } else {
      setMsg(
        data.error || "Upload failed."
      );

      setMsgType("error");
    }
  } catch (err: any) {
    if (err.name !== "AbortError") {
      setIsProcessing(false);

      setMsg(
        "Upload failed. Please try again."
      );

      setMsgType("error");
    }
  }
};

  const removeFile = async () => {
    if (abortRef.current) abortRef.current.abort();
    try {
      await fetch("/api/resume/delete", { method: "POST" });
    } catch (err) {
      // Non-fatal: even if the delete request fails (e.g. server briefly
      // unreachable), we still clear the local UI state below so the user
      // isn't stuck looking at a stale "uploaded" card.
      console.error("[Resume] Delete request failed:", err);
    }
    setUploadedFile(null);
    setDetectedSkills([]);
    setResumeSummary("");
    setSuggestedGoals([]);
    setSkills("");
    setAtsData(null);
    setMsg("File removed.");
    setMsgType("info");
    if (onReset) onReset();
  };

const viewFile = () => {
  const url =
    uploadedFile?.url ||
    savedData?.resumeUrl

  if (!url) {
    setMsg("Resume preview unavailable.")
    setMsgType("error")
    return
  }

  window.open(
  `https://docs.google.com/viewer?url=${encodeURIComponent(
    url
  )}&embedded=true`,
  "_blank"
)
}

  const continueManual = () => {
    if (!goal.trim()) {
      setMsg("Please add a career goal before continuing.");
      setMsgType("error");
      return;
    }
    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    onUpload({
      manualSkills: skills,
      skills: skillsArray,
      currentSkills: skillsArray,
      goal,
      goalLocked: true,
      experience: experience === "Other" ? otherExperience : experience,
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

                {isProcessing && (
                <div className="flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">AI is analyzing your resume...</p>
                </div>
                )}
              </div>
            )}

            {msg.trim() && (
             <div
               className={`mt-4 flex items-start gap-2 text-sm p-3 rounded-lg ${
                 msgType === "success"
                   ? "bg-green-50 text-green-700"
                   : msgType === "error"
                   ? "bg-red-50 text-red-700"
                   : "bg-blue-50 text-blue-700"
               }`}
             >
               {msgType === "error" ? (
                 <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
               ) : null}
           
               {msg}
             </div>
           )}
           {/* ── ATS SCORE CARD ──────────────────────── */}

{atsData && (
  <div className="mt-5">

    <Card className="border-green-200 bg-green-50 shadow-none">
      <CardContent className="p-5 space-y-4">

        {/* TOP */}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-green-900">
              ATS Resume Score
            </h3>

            <p className="text-sm text-green-700">
              AI analysis of resume quality
            </p>
          </div>

          <div className="text-3xl font-bold text-green-700">
            {atsData.score}%
          </div>
        </div>

        <div>
  <p className="text-sm font-semibold text-green-800 mb-2">
    Matched Skills
  </p>

  <div className="flex flex-wrap gap-2">
    {atsData.matchedSkills.length > 0 ? (
      atsData.matchedSkills.map(
        (
          skill: string,
          i: number
        ) => (
          <Badge
            key={i}
            className="bg-green-600 text-white"
          >
            {skill}
          </Badge>
        )
      )
    ) : (
      <p className="text-sm text-gray-500">
        No matched skills found
      </p>
    )}
  </div>
</div>
        <div>
  <p className="text-sm font-semibold text-red-700 mb-2">
    Missing Skills
  </p>

  <div className="flex flex-wrap gap-2">
    {atsData.missingSkills.length > 0 ? (
      atsData.missingSkills.map(
        (
          skill: string,
          i: number
        ) => (
          <Badge
            key={i}
            className="bg-red-100 text-red-700 border border-red-200"
          >
            {skill}
          </Badge>
        )
      )
    ) : (
      <p className="text-sm text-gray-500">
        No missing skills 🎉
      </p>
    )}
  </div>
</div>

      </CardContent>
    </Card>

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
              <div className="flex items-center justify-between">
                <label className="font-medium">Career Goal</label>
                {goalLocked && goal && (
                  <button
                    type="button"
                    onClick={() => setGoalLocked(false)}
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >
                    Change
                  </button>
                )}
              </div>

              {goalLocked && goal ? (
                <div className="mt-2 flex items-center justify-between p-4 rounded-xl border bg-gray-50">
                  <span className="font-medium text-gray-800">{goal}</span>
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g. Java Full Stack Developer"
                      autoFocus={!goalLocked && Boolean(suggestedGoals.length === 0)}
                    />
                    {goal && (
                      <Button
                        type="button"
                        onClick={() => setGoalLocked(true)}
                        className="px-5 whitespace-nowrap"
                      >
                        Confirm
                      </Button>
                    )}
                  </div>
                  {suggestedGoals.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">AI suggests:</span>
                      {suggestedGoals.map((g, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setGoal(g);
                            setGoalLocked(true);
                          }}
                          className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100"
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="font-medium">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full mt-2 p-4 rounded-xl border"
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
                <option>Other</option>
              </select>

              {experience === "Other" && (
                <input
                  type="text"
                  autoFocus
                  value={otherExperience}
                  onChange={(e) => setOtherExperience(e.target.value)}
                  placeholder="Please specify your experience level"
                  className="w-full mt-2 p-4 rounded-xl border text-sm"
                />
              )}
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