"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

// ── Data ────────────────────────────────────────────────────────────────────

const EDUCATION_LEVELS = [
  { value: "Diploma / Polytechnic", label: "Diploma / Polytechnic", icon: "🎓" },
  { value: "Bachelor's Degree (B.E / B.Tech / BCA / B.Sc)", label: "Bachelor's Degree", icon: "🎓" },
  { value: "Master's Degree (M.Tech / MCA / M.Sc)", label: "Master's Degree", icon: "🏆" },
  { value: "PhD / Research", label: "PhD / Research", icon: "🔬" },
];

const TECH_DOMAINS: Record<string, { icon: string; skills: string[] }> = {
  "Software Development": {
    icon: "💻",
    skills: ["Java", "Python", "JavaScript", "C++", "C#", "Go", "Rust", "TypeScript"],
  },
  "Web Development": {
    icon: "🌐",
    skills: ["React", "Next.js", "Node.js", "HTML/CSS", "Vue.js", "Angular", "Django", "Spring Boot"],
  },
  "Data Science & Analytics": {
    icon: "📊",
    skills: ["Python", "R", "SQL", "Pandas", "NumPy", "Tableau", "Power BI", "Excel"],
  },
  "AI / Machine Learning": {
    icon: "🤖",
    skills: ["TensorFlow", "PyTorch", "Scikit-learn", "NLP", "Computer Vision", "LLMs", "Deep Learning"],
  },
  "Cloud & DevOps": {
    icon: "☁️",
    skills: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"],
  },
  "Cybersecurity": {
    icon: "🔐",
    skills: ["Network Security", "Ethical Hacking", "Penetration Testing", "SIEM", "Cryptography", "SOC"],
  },
  "Mobile Development": {
    icon: "📱",
    skills: ["Android (Kotlin)", "iOS (Swift)", "React Native", "Flutter", "Dart"],
  },
  "Database & Backend": {
    icon: "🗄️",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST APIs", "Microservices"],
  },
  "UI/UX Design": {
    icon: "🎨",
    skills: ["Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Design Systems"],
  },
  "Blockchain & Web3": {
    icon: "⛓️",
    skills: ["Solidity", "Ethereum", "Smart Contracts", "Web3.js", "DeFi", "NFT Development"],
  },
};

// Career goals mapped to domains
const CAREER_GOALS_BY_DOMAIN: Record<string, { value: string; desc: string }[]> = {
  "Software Development": [
    { value: "Software Engineer", desc: "Build scalable applications & systems" },
    { value: "Backend Developer", desc: "APIs, databases & server-side logic" },
    { value: "Full Stack Developer", desc: "End-to-end product development" },
  ],
  "Web Development": [
    { value: "Full Stack Developer", desc: "End-to-end web application development" },
    { value: "Frontend Developer", desc: "React, Next.js & modern UI engineering" },
    { value: "Backend Developer", desc: "Node.js, APIs & server architecture" },
  ],
  "Data Science & Analytics": [
    { value: "Data Analyst", desc: "Insights, dashboards & business intelligence" },
    { value: "Data Scientist", desc: "Statistical modeling & predictive analytics" },
    { value: "Business Intelligence Engineer", desc: "Data pipelines & reporting systems" },
  ],
  "AI / Machine Learning": [
    { value: "AI / ML Engineer", desc: "Build & deploy machine learning models" },
    { value: "NLP Engineer", desc: "Large language models & text AI" },
    { value: "Computer Vision Engineer", desc: "Image & video AI systems" },
    { value: "AI Research Scientist", desc: "Cutting-edge AI research & publications" },
  ],
  "Cloud & DevOps": [
    { value: "Cloud Engineer", desc: "AWS / Azure / GCP infrastructure" },
    { value: "DevOps Engineer", desc: "CI/CD, automation & reliability" },
    { value: "Site Reliability Engineer (SRE)", desc: "Scalability & system uptime" },
    { value: "Platform Engineer", desc: "Internal developer tools & infra" },
  ],
  "Cybersecurity": [
    { value: "Cybersecurity Analyst", desc: "Threat detection & incident response" },
    { value: "Ethical Hacker / Penetration Tester", desc: "Offensive security & vulnerability research" },
    { value: "Security Engineer", desc: "Secure systems design & architecture" },
    { value: "SOC Analyst", desc: "Security operations & monitoring" },
  ],
  "Mobile Development": [
    { value: "Android Developer", desc: "Native Android apps with Kotlin" },
    { value: "iOS Developer", desc: "Native iOS apps with Swift" },
    { value: "Cross-Platform Mobile Developer", desc: "Flutter / React Native" },
  ],
  "Database & Backend": [
    { value: "Backend Developer", desc: "REST APIs, databases & microservices" },
    { value: "Database Administrator (DBA)", desc: "Database design, tuning & management" },
    { value: "Data Engineer", desc: "ETL pipelines & data infrastructure" },
  ],
  "UI/UX Design": [
    { value: "UI/UX Designer", desc: "User interfaces & design systems" },
    { value: "Product Designer", desc: "End-to-end product experience design" },
    { value: "Interaction Designer", desc: "Motion, animation & micro-interactions" },
  ],
  "Blockchain & Web3": [
    { value: "Blockchain Developer", desc: "Smart contracts & decentralised apps" },
    { value: "Web3 Engineer", desc: "DeFi protocols & crypto integrations" },
    { value: "Smart Contract Auditor", desc: "Security auditing of blockchain code" },
  ],
};

const SKILL_LEVELS = [
  {
    value: "Beginner",
    label: "Beginner",
    desc: "Just starting out — familiar with basics but limited hands-on experience",
    icon: "🌱",
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    desc: "Built a few projects — comfortable with core concepts and tools",
    icon: "⚡",
  },
  {
    value: "Advanced",
    label: "Advanced",
    desc: "Production experience — can architect and lead technical solutions",
    icon: "🚀",
  },
];

const OTHER_VALUE = "__other__";

// ── Component ────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();

  // Steps: 1=credentials, 2=age, 3=education, 4=domain, 5=skills, 6=goal, 7=level
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    education: "",
    field: "",
    goal: "",
    level: "",
  });

  // Tracks which step is currently showing a custom "Other" text box
  const [otherInputs, setOtherInputs] = useState({
    education: "",
    field: "",
    goal: "",
    level: "",
    skill: "",
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setOther = (key: keyof typeof otherInputs, value: string) =>
    setOtherInputs((prev) => ({ ...prev, [key]: value }));

  const totalSteps = 7;
  const progress = Math.round((step / totalSteps) * 100);

  // ── Step handlers ──────────────────────────────────────────────────────────

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setMsg("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(form.email.trim())) {
      setMsg("Please enter a valid email address (e.g. you@gmail.com)");
      return;
    }
    setMsg("");
    setCheckingEmail(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (data.exists) {
        setMsg("An account with this email already exists. Please login.");
        return;
      }
      setStep(2);
    } catch {
      setMsg("Connection error. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleAge = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(form.age);
    if (!form.age || isNaN(age) || age < 15 || age > 45) {
      setMsg("Please enter a valid age between 15 and 45.");
      return;
    }
    setMsg("");
    setStep(3);
  };

  const handleEducation = (value: string) => {
    if (value === OTHER_VALUE) {
      set("education", OTHER_VALUE);
      setMsg("");
      return;
    }
    set("education", value);
    setMsg("");
    setTimeout(() => setStep(4), 300);
  };

  const confirmOtherEducation = () => {
    if (!otherInputs.education.trim()) {
      setMsg("Please type your education level.");
      return;
    }
    set("education", otherInputs.education.trim());
    setMsg("");
    setTimeout(() => setStep(4), 200);
  };

  const handleDomain = (value: string) => {
    if (value === OTHER_VALUE) {
      set("field", OTHER_VALUE);
      setSelectedSkills([]);
      setMsg("");
      return;
    }
    set("field", value);
    setSelectedSkills([]);
    setMsg("");
    setTimeout(() => setStep(5), 300);
  };

  const confirmOtherDomain = () => {
    if (!otherInputs.field.trim()) {
      setMsg("Please type your domain of interest.");
      return;
    }
    set("field", otherInputs.field.trim());
    setSelectedSkills([]);
    setMsg("");
    setTimeout(() => setStep(5), 200);
  };

  const handleSkillsNext = (e: React.FormEvent) => {
  e.preventDefault();

  const customSkill = otherInputs.skill.trim();

  // merge selected + manually typed skill
  const finalSkills = customSkill
    ? [...new Set([...selectedSkills, customSkill])]
    : selectedSkills;

  if (finalSkills.length === 0) {
    setMsg("Please select or add at least one skill.");
    return;
  }

  // IMPORTANT: permanently store merged skills
  setSelectedSkills(finalSkills);

  setOther("skill", "");
  setMsg("");
  setStep(6);
};

  const handleGoal = (value: string) => {
    if (value === OTHER_VALUE) {
      set("goal", OTHER_VALUE);
      setMsg("");
      return;
    }
    set("goal", value);
    setMsg("");
    setTimeout(() => setStep(7), 300);
  };

  const confirmOtherGoal = () => {
    if (!otherInputs.goal.trim()) {
      setMsg("Please type your career goal.");
      return;
    }
    set("goal", otherInputs.goal.trim());
    setMsg("");
    setTimeout(() => setStep(7), 200);
  };

  const handleLevel = async (value: string) => {
    if (value === OTHER_VALUE) {
      set("level", OTHER_VALUE);
      setMsg("");
      return;
    }
    await submitSignup(value);
  };

  const confirmOtherLevel = async () => {
    if (!otherInputs.level.trim()) {
      setMsg("Please describe your current skill level.");
      return;
    }
    await submitSignup(otherInputs.level.trim());
  };

  const submitSignup = async (levelValue: string) => {
    set("level", levelValue);
    setMsg("");
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      age: form.age,
      education: form.education,
      field: form.field,
      goal: form.goal || levelValue,
      level: levelValue,
      skills: [...new Set(selectedSkills)],
      manualSkills: [...new Set(selectedSkills)].join(", "),
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        router.replace("/dashboard");
      } else {
        setMsg(data.message || "Signup failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setMsg("Connection error. Please try again.");
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const goBack = () => {
    setMsg("");
    setStep((s) => Math.max(1, s - 1));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const stepTitles = [
    "", // step 1 has its own title
    "How old are you?",
    "What's your education level?",
    "Which tech domain interests you?",
    "What are your current skills?",
    "What's your target career goal?",
    "How do you rate your current skill level?",
  ];

  const stepSubtitles = [
    "",
    "This helps us calibrate the right learning pace for you.",
    "We'll tailor your roadmap to match your academic background.",
    "Pick the area you're most interested in or currently learning.",
    `Select all skills you already know in ${form.field || "this domain"}.`,
    "We'll build your roadmap around this specific role.",
    "Be honest — this shapes how challenging your roadmap will be.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dfe6f5] via-[#e8effe] to-[#d4e0f7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">

        {/* ── Logo ── */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SkillSage" width={64} height={64} className="rounded-2xl shadow-lg" />
        </div>

        {/* ── Progress bar ── */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              Step {step} of {totalSteps}
            </span>
            <span className="text-xs text-gray-400">{progress}% complete</span>
          </div>
          <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-3xl shadow-xl px-8 py-10">

          {/* Step title */}
          {step > 1 && (
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {stepTitles[step - 1]}
              </h2>
              <p className="text-gray-500 text-sm">{stepSubtitles[step - 1]}</p>
            </div>
          )}

          {/* Error */}
          {msg && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
              {msg}
            </div>
          )}

          {/* ════ STEP 1 — Credentials ════ */}
          {step === 1 && (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Welcome to <span className="text-blue-600">SkillSage</span>
                </h1>
                <p className="text-gray-500 text-sm">Create your account and start your tech career journey</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  placeholder="Full Name"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  minLength={6}
                  required
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 transition"
                />
              </div>

              <button
                type="submit"
                disabled={checkingEmail}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition disabled:opacity-60 mt-2"
              >
                {checkingEmail ? "Checking..." : "Let's Dive In →"}
              </button>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* ── Google button ── */}
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 font-semibold text-gray-700 transition"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                  Login
                </Link>
              </p>
            </form>
          )}

          {/* ════ STEP 2 — Age ════ */}
          {step === 2 && (
            <form onSubmit={handleAge} className="space-y-6">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Your Age</label>
                <input
                  type="number"
                  min={15}
                  max={45}
                  placeholder="Enter age"
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                  className="w-full h-14 px-4 text-2xl font-bold rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 transition"
                />
                <span className="absolute right-4 top-9 text-gray-400 text-sm">years old</span>
              </div>
              <p className="text-xs text-gray-400 text-center">Valid range: 15 – 45 years</p>
              <div className="flex gap-3">
                <button type="button" onClick={goBack} className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition">
                  ← Back
                </button>
                <button type="submit" className="flex-2 flex-grow-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">
                  Continue →
                </button>
              </div>
            </form>
          )}

          {/* ════ STEP 3 — Education ════ */}
          {step === 3 && (
            <div className="space-y-3">
              {EDUCATION_LEVELS.map((edu) => (
                <button
                  key={edu.value}
                  onClick={() => handleEducation(edu.value)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                    form.education === edu.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <span className="text-2xl">{edu.icon}</span>
                  <span className="font-semibold text-gray-800 text-sm">{edu.label}</span>
                  {form.education === edu.value && (
                    <span className="ml-auto text-blue-600 font-bold">✓</span>
                  )}
                </button>
              ))}

              {/* OTHER */}
              <button
                onClick={() => handleEducation(OTHER_VALUE)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                  form.education === OTHER_VALUE
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-2xl">✏️</span>
                <span className="font-semibold text-gray-800 text-sm">Other — type your own</span>
                {form.education === OTHER_VALUE && (
                  <span className="ml-auto text-blue-600 font-bold">✓</span>
                )}
              </button>

              {form.education === OTHER_VALUE && (
                <div className="flex gap-2 pt-1">
                  <input
                    autoFocus
                    placeholder="Specify your education"
                    value={otherInputs.education}
                    onChange={(e) => setOther("education", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmOtherEducation()}
                    className="flex-1 h-12 px-4 rounded-xl border border-blue-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm transition"
                  />
                  <button
                    type="button"
                    onClick={confirmOtherEducation}
                    className="px-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
                  >
                    Next →
                  </button>
                </div>
              )}

              <button type="button" onClick={goBack} className="w-full mt-2 h-11 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition">
                ← Back
              </button>
            </div>
          )}

          {/* ════ STEP 4 — Domain ════ */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(TECH_DOMAINS).map(([domain, { icon }]) => (
                  <button
                    key={domain}
                    onClick={() => handleDomain(domain)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                      form.field === domain
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="font-semibold text-gray-800 text-sm">{domain}</span>
                    {form.field === domain && (
                      <span className="ml-auto text-blue-600 font-bold">✓</span>
                    )}
                  </button>
                ))}

                {/* OTHER */}
                <button
                  onClick={() => handleDomain(OTHER_VALUE)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                    form.field === OTHER_VALUE
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <span className="text-xl">✏️</span>
                  <span className="font-semibold text-gray-800 text-sm">Other — type your own</span>
                  {form.field === OTHER_VALUE && (
                    <span className="ml-auto text-blue-600 font-bold">✓</span>
                  )}
                </button>
              </div>

              {form.field === OTHER_VALUE && (
                <div className="flex gap-2 pt-1">
                  <input
                    autoFocus
                    placeholder="Specify your domain interest"
                    value={otherInputs.field}
                    onChange={(e) => setOther("field", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmOtherDomain()}
                    className="flex-1 h-12 px-4 rounded-xl border border-blue-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm transition"
                  />
                  <button
                    type="button"
                    onClick={confirmOtherDomain}
                    className="px-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
                  >
                    Next →
                  </button>
                </div>
              )}

              <button type="button" onClick={goBack} className="w-full mt-2 h-11 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition">
                ← Back
              </button>
            </div>
          )}

          {/* ════ STEP 5 — Skills ════ */}
          {step === 5 && (
            <form onSubmit={handleSkillsNext} className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {(TECH_DOMAINS[form.field]?.skills ?? []).map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                      selectedSkills.includes(skill)
                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                        : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {selectedSkills.includes(skill) ? "✓ " : ""}{skill}
                  </button>
                ))}
              </div>

              {/* OTHER — free text skill not in the list */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Don't see your skill? Add it
                </label>
                <input
                  placeholder="Add your skills"
                  value={otherInputs.skill}
                  onChange={(e) => setOther("skill", e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm transition"
                />
              </div>

              {(selectedSkills.length > 0 || otherInputs.skill.trim()) && (
                <p className="text-xs text-blue-600 font-medium">
                  {selectedSkills.length + (otherInputs.skill.trim() ? 1 : 0)} skill
                  {selectedSkills.length + (otherInputs.skill.trim() ? 1 : 0) > 1 ? "s" : ""} selected
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={goBack} className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition">
                  ← Back
                </button>
                <button type="submit" className="flex-grow-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">
                  Continue →
                </button>
              </div>
            </form>
          )}

          {/* ════ STEP 6 — Career Goal ════ */}
          {step === 6 && (
            <div className="space-y-3">
              {(CAREER_GOALS_BY_DOMAIN[form.field] ?? []).map((g) => (
                <button
                  key={g.value}
                  onClick={() => handleGoal(g.value)}
                  className={`relative w-full flex flex-col gap-0.5 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                    form.goal === g.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <span className="font-bold text-gray-900 text-sm">{g.value}</span>
                  <span className="text-xs text-gray-500">{g.desc}</span>
                  {form.goal === g.value && (
                    <span className="absolute right-5 top-4 text-blue-600 font-bold">✓</span>
                  )}
                </button>
              ))}

              {/* OTHER */}
              <button
                onClick={() => handleGoal(OTHER_VALUE)}
                className={`relative w-full flex flex-col gap-0.5 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                  form.goal === OTHER_VALUE
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="font-bold text-gray-900 text-sm">Other — type your own</span>
                <span className="text-xs text-gray-500">Not seeing your target role? Specify it yourself</span>
                {form.goal === OTHER_VALUE && (
                  <span className="absolute right-5 top-4 text-blue-600 font-bold">✓</span>
                )}
              </button>

              {form.goal === OTHER_VALUE && (
                <div className="flex gap-2 pt-1">
                  <input
                    autoFocus
                    placeholder="Specify your career goal"
                    value={otherInputs.goal}
                    onChange={(e) => setOther("goal", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmOtherGoal()}
                    className="flex-1 h-12 px-4 rounded-xl border border-blue-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm transition"
                  />
                  <button
                    type="button"
                    onClick={confirmOtherGoal}
                    className="px-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
                  >
                    Next →
                  </button>
                </div>
              )}

              <button type="button" onClick={goBack} className="w-full mt-2 h-11 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition">
                ← Back
              </button>
            </div>
          )}

          {/* ════ STEP 7 — Skill Level ════ */}
          {step === 7 && (
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
                  <p className="text-gray-600 font-medium">Creating your profile...</p>
                  <p className="text-gray-400 text-sm">Setting up your personalized roadmap</p>
                </div>
              ) : (
                <>
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleLevel(level.value)}
                      className={`w-full flex items-start gap-4 px-5 py-5 rounded-2xl border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                        form.level === level.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <span className="text-3xl mt-0.5">{level.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900">{level.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{level.desc}</p>
                      </div>
                    </button>
                  ))}

                  {/* OTHER */}
                  <button
                    onClick={() => handleLevel(OTHER_VALUE)}
                    className={`w-full flex items-start gap-4 px-5 py-5 rounded-2xl border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                      form.level === OTHER_VALUE
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="text-3xl mt-0.5">✏️</span>
                    <div>
                      <p className="font-bold text-gray-900">Other — describe it myself</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        None of these quite fit? Tell us in your own words
                      </p>
                    </div>
                  </button>

                  {form.level === OTHER_VALUE && (
                    <div className="flex gap-2 pt-1">
                      <input
                        autoFocus
                        placeholder="Comfortable with basics"
                        value={otherInputs.level}
                        onChange={(e) => setOther("level", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && confirmOtherLevel()}
                        className="flex-1 h-12 px-4 rounded-xl border border-blue-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm transition"
                      />
                      <button
                        type="button"
                        onClick={confirmOtherLevel}
                        className="px-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
                      >
                        Finish →
                      </button>
                    </div>
                  )}

                  <button type="button" onClick={goBack} className="w-full mt-1 h-11 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition">
                    ← Back
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? "w-6 h-2 bg-blue-600"
                  : i + 1 < step
                  ? "w-2 h-2 bg-blue-400"
                  : "w-2 h-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}