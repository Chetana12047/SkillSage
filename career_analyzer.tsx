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

const SkillSageAnalyzer: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>("");
  const [interests, setInterests] = useState<string>("");
  const [analysis, setAnalysis] = useState<any | null>(null);
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

  const careerGraph: Record<
    string,
    { next: string[]; skills: string[] }
  > = {
    "Software Engineer": {
      next: ["Senior Software Engineer", "Tech Lead", "Solutions Architect"],
      skills: [
        "JavaScript",
        "Python",
        "Java",
        "Git",
        "API Design",
        "Testing",
        "Agile",
      ],
    },
    "Senior Software Engineer": {
      next: ["Staff Engineer", "Engineering Manager", "Principal Engineer"],
      skills: [
        "System Design",
        "Architecture",
        "Mentoring",
        "Code Review",
        "Performance Optimization",
      ],
    },
    "Data Analyst": {
      next: ["Senior Data Analyst", "Data Scientist", "Business Intelligence Engineer"],
      skills: [
        "SQL",
        "Python",
        "Excel",
        "Tableau",
        "Power BI",
        "Statistics",
        "Data Visualization",
      ],
    },
    "Data Scientist": {
      next: ["Senior Data Scientist", "ML Engineer", "AI Research Scientist"],
      skills: [
        "Machine Learning",
        "Deep Learning",
        "Python",
        "TensorFlow",
        "PyTorch",
        "Statistics",
        "NLP",
      ],
    },
    "Frontend Developer": {
      next: ["Senior Frontend Developer", "Full Stack Developer", "UI/UX Engineer"],
      skills: ["React", "Vue", "Angular", "TypeScript", "CSS", "Webpack", "Responsive Design"],
    },
    "Backend Developer": {
      next: ["Senior Backend Developer", "Full Stack Developer", "DevOps Engineer"],
      skills: ["Node.js", "Python", "Java", "Database Design", "API Development", "Microservices"],
    },
    "DevOps Engineer": {
      next: ["Senior DevOps Engineer", "Cloud Architect", "Site Reliability Engineer"],
      skills: ["Docker", "Kubernetes", "AWS", "Azure", "CI/CD", "Terraform", "Monitoring"],
    },
    "Product Manager": {
      next: ["Senior Product Manager", "Director of Product", "VP Product"],
      skills: ["Roadmapping", "User Research", "Data Analysis", "Stakeholder Management", "Agile"],
    },
  };

  const courseDatabase = [
    /* same courseDatabase entries as before (omitted here for brevity) */
  ] as const; // keep as const to preserve structure if needed

  const extractSkills = (text: string) => {
    const commonSkills = [
      "JavaScript",
      "Python",
      "Java",
      "C++",
      "React",
      "Angular",
      "Vue",
      "Node.js",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Azure",
      "GCP",
      "Docker",
      "Kubernetes",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "PyTorch",
      "Git",
      "Agile",
      "Scrum",
      "API",
      "REST",
      "GraphQL",
      "TypeScript",
      "HTML",
      "CSS",
      "Data Analysis",
      "Excel",
      "Tableau",
      "Power BI",
      "Statistics",
      "NLP",
      "DevOps",
      "CI/CD",
      "Terraform",
      "Jenkins",
      "Microservices",
      "System Design",
    ];

    const textLower = text.toLowerCase();
    return commonSkills.filter((skill) =>
      textLower.includes(skill.toLowerCase())
    );
  };

  const inferSoftSkills = (text: string) => {
    const softSkillsMap: Record<string, string[]> = {
      Leadership: ["led", "managed", "directed", "coordinated", "mentored"],
      Communication: ["presented", "collaborated", "communicated", "documented"],
      "Problem Solving": ["solved", "optimized", "improved", "analyzed", "debugged"],
      Teamwork: ["collaborated", "team", "partnered", "coordinated"],
      "Project Management": ["managed", "planned", "organized", "delivered", "roadmap"],
    };

    const textLower = text.toLowerCase();
    return Object.keys(softSkillsMap).filter((skill) =>
      softSkillsMap[skill].some((keyword) => textLower.includes(keyword))
    );
  };

  const determineCurrentRole = (skills: string[], text: string) => {
    const roleMappings = [
      { role: "Data Scientist", keywords: ["machine learning", "deep learning", "tensorflow", "pytorch", "data science"], minMatch: 2 },
      { role: "DevOps Engineer", keywords: ["docker", "kubernetes", "aws", "ci/cd", "terraform", "jenkins"], minMatch: 2 },
      { role: "Frontend Developer", keywords: ["react", "angular", "vue", "html", "css", "typescript"], minMatch: 2 },
      { role: "Backend Developer", keywords: ["node.js", "python", "java", "api", "sql", "mongodb"], minMatch: 2 },
      { role: "Data Analyst", keywords: ["sql", "excel", "tableau", "power bi", "data analysis"], minMatch: 2 },
      { role: "Software Engineer", keywords: ["javascript", "python", "java", "git", "api"], minMatch: 2 },
    ];

    const textLower = text.toLowerCase();

    for (const mapping of roleMappings) {
      const matches = mapping.keywords.filter((kw) => textLower.includes(kw)).length;
      if (matches >= mapping.minMatch) {
        return mapping.role;
      }
    }

    return "Software Engineer";
  };

  const findNextRole = (currentRole: string, interestsList: string[]) => {
    const interestsLower = interestsList.map((i) => i.toLowerCase());

    if (careerGraph[currentRole]) {
      const possibleNext = careerGraph[currentRole].next;

      if (
        interestsLower.includes("ai") ||
        interestsLower.includes("artificial intelligence") ||
        interestsLower.includes("machine learning")
      ) {
        const mlRoles = possibleNext.filter(
          (role) => role.includes("ML") || role.includes("AI") || role.includes("Data")
        );
        if (mlRoles.length > 0) return mlRoles[0];
      }

      if (interestsLower.includes("management") || interestsLower.includes("leadership")) {
        const mgmtRoles = possibleNext.filter((role) => role.includes("Manager") || role.includes("Lead"));
        if (mgmtRoles.length > 0) return mgmtRoles[0];
      }

      if (interestsLower.includes("cloud") || interestsLower.includes("devops")) {
        const cloudRoles = possibleNext.filter((role) => role.includes("Cloud") || role.includes("DevOps") || role.includes("Architect"));
        if (cloudRoles.length > 0) return cloudRoles[0];
      }

      return possibleNext[0];
    }

    return "Senior " + currentRole;
  };

  const identifySkillGaps = (currentSkills: string[], targetRole: string) => {
    const requiredSkills = careerGraph[targetRole]?.skills || [];
    const currentSkillsLower = currentSkills.map((s) => s.toLowerCase());

    return requiredSkills.filter((skill) => !currentSkillsLower.includes(skill.toLowerCase()));
  };

  const recommendCourses = (gaps: string[]) => {
    const recommendations: any[] = [];

    gaps.forEach((gap) => {
      const courses = (courseDatabase as unknown as any[]).filter(
        (course) =>
          course.skill.toLowerCase() === gap.toLowerCase() ||
          gap.toLowerCase().includes(course.skill.toLowerCase())
      );

      if (courses.length > 0) {
        recommendations.push(courses[0]);
      }
    });

    return recommendations.slice(0, 6);
  };

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

        // Dynamic import of mammoth to avoid SSR issues
        const mammothModule: any = await import("mammoth");
        const mammoth = mammothModule && mammothModule.default ? mammothModule.default : mammothModule;

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
      // keep console error for debugging
      // eslint-disable-next-line no-console
      console.error("Error reading file:", error);
      setUploadStatus("");
      alert("Error reading file. Please try another format or copy-paste the text directly.");
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    if (typeof window === "undefined" || !(window as any)["pdfjs-dist/build/pdf"]) {
      throw new Error("PDF.js library not loaded or running on server. Please refresh the page or ensure the script loaded.");
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

  const analyzeResume = () => {
    setLoading(true);

    setTimeout(() => {
      const skills = extractSkills(resumeText);
      const softSkills = inferSoftSkills(resumeText);
      const currentRole = determineCurrentRole(skills, resumeText);
      const interestsList = interests.split(",").map((i) => i.trim()).filter(Boolean);
      const nextRole = findNextRole(currentRole, interestsList);
      const gaps = identifySkillGaps(skills, nextRole);
      const courses = recommendCourses(gaps);

      const nameMatch = resumeText.match(/^([A-Z][a-z]+\s[A-Z][a-z]+)/);
      const name = nameMatch ? nameMatch[1] : "Professional";

      const result = {
        user_profile: {
          name,
          education_summary:
            resumeText.includes("Bachelor") || resumeText.includes("Master")
              ? "Degree holder with relevant technical background"
              : "Technical background",
          experience_summary: `Experienced ${currentRole} with ${skills.length} identified technical skills`,
          inferred_soft_skills: softSkills,
          identified_technical_skills: skills,
        },
        career_analysis: {
          current_best_fit_role: currentRole,
          next_recommended_role: nextRole,
          career_path_justification: `Based on your current skills in ${skills
            .slice(0, 3)
            .join(", ")} and your interest in ${interestsList.join(", ")}, ${nextRole} is the natural next step. This role builds upon your existing expertise while aligning with your career interests.`,
        },
        skill_gaps: {
          target_role: nextRole,
          gaps_identified: gaps,
          gap_analysis:
            gaps.length > 0
              ? `To transition to ${nextRole}, you should focus on developing ${gaps.length} key skills. Priority should be given to ${gaps[0] || "advanced concepts"}.`
              : "You have most skills needed for this role. Focus on depth and experience.",
        },
        top_recommendations: courses,
      };

      setAnalysis(result);
      setLoading(false);
    }, 800); // shorter delay for UX
  };

  const handleChatSend = () => {
    if (!currentMessage.trim()) return;

    const userMsg: Message = { role: "user", text: currentMessage };
    setMessages((m) => [...m, userMsg]);

    setTimeout(() => {
      const botResponse = generateBotResponse(currentMessage);
      setMessages((prev) => [...prev, { role: "bot", text: botResponse }]);
    }, 600);

    setCurrentMessage("");
  };

  const generateBotResponse = (question: string) => {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes("data scientist") || lowerQ.includes("machine learning")) {
      return "To become a Data Scientist, focus on: Python, Statistics, Machine Learning (TensorFlow/PyTorch), SQL, and Data Visualization. Start with Coursera's Machine Learning Specialization by Stanford. Build a portfolio with 3-5 projects on Kaggle to demonstrate practical skills.";
    }
    if (lowerQ.includes("software engineer") || lowerQ.includes("developer")) {
      return "Software Engineering has multiple paths: Frontend (React/Vue), Backend (Node.js/Python/Java), or Full-Stack. Start with freeCodeCamp for fundamentals. Build 3-5 portfolio projects. Contribute to open source. Practice data structures and algorithms on LeetCode.";
    }
    if (lowerQ.includes("devops") || lowerQ.includes("cloud")) {
      return "DevOps/Cloud careers require: Docker, Kubernetes, AWS/Azure/GCP, CI/CD pipelines, and Infrastructure as Code (Terraform). Start with AWS Solutions Architect certification. Practice on cloud free tiers. Automate everything in your projects.";
    }
    if (lowerQ.includes("career change") || lowerQ.includes("transition")) {
      return "Career transitions typically take 6-12 months. Steps: 1) Identify transferable skills, 2) Learn new required skills through courses, 3) Build portfolio projects, 4) Network in target industry, 5) Apply strategically. Consider adjacent roles for easier transition.";
    }
    if (lowerQ.includes("salary") || lowerQ.includes("pay")) {
      return "Tech salaries vary by location and experience. US averages: Entry-level $70-90k, Mid-level $100-140k, Senior $150-200k+. Check Levels.fyi and Glassdoor for specific roles and companies. Specializations in AI, Cloud, or Security can add 20-30% premium.";
    }
    if (lowerQ.includes("course") || lowerQ.includes("learn")) {
      return "Top learning platforms: Coursera (university courses with certificates), Udemy (practical hands-on courses), Educative (interactive coding), freeCodeCamp (free full curriculum). For certifications: AWS/Azure/GCP for cloud, CompTIA for IT fundamentals.";
    }
    if (lowerQ.includes("interview") || lowerQ.includes("preparation")) {
      return "Interview preparation: 1) Solve 75+ LeetCode problems (Easy/Medium), 2) Study system design (Educative, SystemDesignPrimer), 3) Practice behavioral questions (STAR method), 4) Research company culture. Timeline: 2-3 months of consistent practice.";
    }

    return "I can help with career guidance! Ask me about: specific tech roles (Data Science, DevOps, Software Engineering), career transitions, learning roadmaps, interview preparation, salary insights, or skill development strategies. What interests you?";
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
                <p className="text-sm text-gray-600">AI Career Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Professional Edition</span>
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
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-mono text-sm resize-none"
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
                    <input type="file" accept=".txt,.pdf,.docx" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {uploadStatus && (
                    <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">{uploadStatus}</p>
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
                    Analyzing Career Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Career Analysis
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
                <h2 className="text-2xl font-bold text-gray-900">Professional Profile</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Name</p>
                  <p className="font-semibold text-gray-900">{analysis.user_profile.name}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Education</p>
                  <p className="font-semibold text-gray-900">{analysis.user_profile.education_summary}</p>
                </div>

                <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Experience</p>
                  <p className="font-semibold text-gray-900">{analysis.user_profile.experience_summary}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.user_profile.identified_technical_skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.user_profile.inferred_soft_skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm font-medium">
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
                <h2 className="text-2xl font-bold text-gray-900">Career Path Analysis</h2>
              </div>

              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="flex-1 text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600 mb-2 uppercase tracking-wider font-bold">Current Role</p>
                  <p className="text-xl font-bold text-blue-900">{analysis.career_analysis.current_best_fit_role}</p>
                </div>

                <ChevronRight className="w-8 h-8 text-gray-400 flex-shrink-0" />

                <div className="flex-1 text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600 mb-2 uppercase tracking-wider font-bold">Recommended Next Role</p>
                  <p className="text-xl font-bold text-green-900">{analysis.career_analysis.next_recommended_role}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Analysis</p>
                <p className="text-gray-700 leading-relaxed">{analysis.career_analysis.career_path_justification}</p>
              </div>
            </div>

            {/* Skill Gap Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-gray-700">
                    Target Role: <span className="font-bold text-gray-900">{analysis.skill_gaps.target_role}</span>
                  </p>
                </div>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">{analysis.skill_gaps.gap_analysis}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {analysis.skill_gaps.gaps_identified.map((gap: string, idx: number) => (
                  <div key={idx} className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                    <p className="font-bold text-gray-900">{gap}</p>
                    <p className="text-xs text-orange-600 mt-1 uppercase tracking-wider">Priority Skill</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Recommendations */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Learning Recommendations</h2>
              </div>

              <div className="space-y-4">
                {analysis.top_recommendations.map((course: any, idx: number) => (
                  <div key={idx} className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.provider}</p>
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
                        <span className="text-gray-600 text-sm">{course.duration}</span>
                        <span className="text-gray-600 text-sm font-medium">{course.price}</span>
                      </div>

                      <a href={course.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                        View Course
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
            <button onClick={() => setChatOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "bot" ? "bg-blue-100" : "bg-gray-200"}`}>
                  {msg.role === "bot" ? <Bot className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-gray-600" />}
                </div>
                <div className={`max-w-[75%] p-3 rounded-lg ${msg.role === "bot" ? "bg-white border border-gray-200" : "bg-blue-600 text-white"}`}>
                  <p className={`text-sm leading-relaxed ${msg.role === "bot" ? "text-gray-800" : "text-white"}`}>{msg.text}</p>
                </div>
              </div>
            ))}
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
              <button onClick={handleChatSend} className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
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
        {chatOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
};

export default SkillSageAnalyzer;