"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Target,
  TrendingUp,
  BookOpen,
  Upload,
  Sparkles,
  ChevronRight,
  FileText,
  MessageCircle,
  Send,
  X,
  Award,
  ExternalLink,
  Bot,
  User,
  Code,
} from "lucide-react";

type Message = { role: "bot" | "user"; text: string };

interface AnalysisResult {
  current_role?: string;
  identified_skills?: string[];
  soft_skills?: string[];
  next_role_recommendation?: string;
  skill_gaps?: string[];
  learning_path?: string[];
  timeline_months?: number;
  key_milestones?: string[];
  career_path_justification?: string;
  gap_analysis?: string;
  recommended_courses?: Array<{
    title: string;
    skill: string;
    provider: string;
    duration: string;
    level: string;
    rating: string;
    price: string;
    link: string;
  }>;
}

const SkillSageAnalyzer: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>("");
  const [interests, setInterests] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: `Hello! I'm your AI Career Advisor. Ask me anything about career transitions, skill development, or industry trends.`,
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    setUploadStatus("Processing file...");

    try {
      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        setUploadStatus("Extracting text from PDF...");
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(arrayBuffer);
        setResumeText(text);
        setUploadStatus("Successfully loaded: " + file.name);
      } else if (
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
      ) {
        setUploadStatus("Extracting text from Word document...");
        const arrayBuffer = await file.arrayBuffer();

        if (typeof window === "undefined") {
          throw new Error("Word parsing is not available on the server.");
        }

        const mammothModule: any = await import("mammoth");
        const mammoth =
          mammothModule && mammothModule.default
            ? mammothModule.default
            : mammothModule;

        const result = await mammoth.extractRawText({ arrayBuffer });
        setResumeText(result.value || result);
        setUploadStatus("Successfully loaded: " + file.name);
      } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
        setUploadStatus("Reading text file...");
        const text = await file.text();
        setResumeText(text);
        setUploadStatus("Successfully loaded: " + file.name);
      } else {
        setUploadStatus("");
        alert("Unsupported file type. Please upload PDF, DOCX, or TXT files.");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      setUploadStatus("");
      alert(
        "Error reading file. Please try another format or copy-paste the text directly."
      );
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    if (
      typeof window === "undefined" ||
      !(window as any)["pdfjs-dist/build/pdf"]
    ) {
      throw new Error(
        "PDF.js library not loaded or running on server. Please refresh the page or ensure the script loaded."
      );
    }

    const pdfjsLib = (window as any)["pdfjs-dist/build/pdf"];
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      alert("Please upload or paste your resume first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          interests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const result: AnalysisResult = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate roadmap. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!currentMessage.trim()) return;

    const userMsg: Message = { role: "user", text: currentMessage };
    setMessages((m) => [...m, userMsg]);
    setCurrentMessage("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg.text,
          context: {
            current_role: analysis?.current_role,
            next_role: analysis?.next_role_recommendation,
            skill_gaps: analysis?.skill_gaps,
            identified_skills: analysis?.identified_skills,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SkillSage</h1>
                <p className="text-sm text-gray-600">
                  AI Career Intelligence Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-700">
                  AI-Powered Edition
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!analysis && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Upload className="w-4 h-4" />
                  Resume Upload
                </label>
                <textarea
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-mono text-sm"
                  placeholder="Paste your resume text here or upload a file below..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <div className="mt-4 flex items-center gap-4">
                  <label className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                      <FileText className="w-4 h-4" />
                      Choose File (PDF, DOCX, TXT)
                    </div>
                    <input
                      type="file"
                      accept=".txt,.pdf,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadStatus && (
                    <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">
                        {uploadStatus}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Target className="w-4 h-4" />
                  Career Interests
                </label>
                <input
                  type="text"
                  className="w-full p-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  placeholder="e.g., Artificial Intelligence, Cloud Computing, Leadership"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

              <button
                onClick={analyzeResume}
                disabled={!resumeText || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating Career Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Career Roadmap
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Professional Profile */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Professional Profile
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
                    Current Role
                  </p>
                  <p className="font-semibold text-gray-900">
                    {analysis.current_role || "Not detected"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
                    Experience Level
                  </p>
                  <p className="font-semibold text-gray-900">Professional</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
                    Technical Skills ({analysis.identified_skills?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.identified_skills &&
                      analysis.identified_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
                    Soft Skills ({analysis.soft_skills?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.soft_skills &&
                      analysis.soft_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Career Path Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Career Path Analysis
                </h2>
              </div>

              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="flex-1 text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600 mb-2 uppercase tracking-wider font-bold">
                    Current Role
                  </p>
                  <p className="text-xl font-bold text-blue-900">
                    {analysis.current_role || "Not Detected"}
                  </p>
                </div>

                <ChevronRight className="w-8 h-8 text-gray-400 flex-shrink-0" />

                <div className="flex-1 text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600 mb-2 uppercase tracking-wider font-bold">
                    Recommended Next Role
                  </p>
                  <p className="text-xl font-bold text-green-900">
                    {analysis.next_role_recommendation || "Analysis needed"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">
                  AI Analysis
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {analysis.career_path_justification ||
                    "Analyzing your career path..."}
                </p>
              </div>

              {analysis.timeline_months && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Estimated Timeline:</span>{" "}
                    {analysis.timeline_months} months to transition
                  </p>
                </div>
              )}
            </div>

            {/* Key Milestones */}
            {analysis.key_milestones && analysis.key_milestones.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Key Milestones
                  </h2>
                </div>

                <div className="space-y-3">
                  {analysis.key_milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {idx + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 pt-1">{milestone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Gap Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Skill Gap Analysis
                </h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-gray-700">
                    Target Role:{" "}
                    <span className="font-bold text-gray-900">
                      {analysis.next_role_recommendation}
                    </span>
                  </p>
                </div>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {analysis.gap_analysis ||
                    "Analyzing your skill gaps..."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {analysis.skill_gaps &&
                  analysis.skill_gaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg"
                    >
                      <p className="font-bold text-gray-900">{gap}</p>
                      <p className="text-xs text-orange-600 mt-1 uppercase tracking-wider">
                        Priority Skill
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Learning Path */}
            {analysis.learning_path && analysis.learning_path.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Learning Path
                  </h2>
                </div>

                <div className="space-y-3">
                  {analysis.learning_path.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {idx + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Recommendations */}
            {analysis.recommended_courses &&
              analysis.recommended_courses.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Recommended Courses
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {analysis.recommended_courses.map((course, idx) => (
                      <div
                        key={idx}
                        className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {course.provider}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md text-sm font-bold flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {course.rating}
                            </span>
                            <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-xs font-medium">
                              {course.level}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-md text-xs font-semibold">
                              {course.skill}
                            </span>
                            <span className="text-gray-600 text-sm">
                              {course.duration}
                            </span>
                            <span className="text-gray-600 text-sm font-medium">
                              {course.price}
                            </span>
                          </div>

                          <a
                            href={course.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            View Course
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <button
              onClick={() => {
                setAnalysis(null);
                setResumeText("");
                setInterests("");
                setUploadStatus("");
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-lg font-semibold transition-colors"
            >
              Analyze Another Resume
            </button>
          </div>
        )}
      </div>

      {chatOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[550px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="bg-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">AI Career Advisor</p>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "bot" ? "bg-blue-100" : "bg-gray-200"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <Bot className="w-5 h-5 text-blue-600" />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    msg.role === "bot"
                      ? "bg-white border border-gray-200"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <p
                    className={`text-sm leading-relaxed ${
                      msg.role === "bot" ? "text-gray-800" : "text-white"
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="max-w-[75%] p-3 rounded-lg bg-white border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                placeholder="Ask about career paths..."
                className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-all z-40"
      >
        {chatOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};

export default SkillSageAnalyzer;
