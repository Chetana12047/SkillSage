type Milestone = {
  title: string
  description: string
  skills: string[]
  courses: string[]
  resources: string[]
}

type Roadmap = {
  title: string
  duration: string
  milestones: Milestone[]
}

export function generateRoadmap(
  goal: string,
  duration: string
): Roadmap {

  const lowerGoal =
    goal.toLowerCase()

  const roadmap: Roadmap = {
    title: goal,
    duration,
    milestones: [],
  }

  // =========================================
  // JAVA FULL STACK
  // =========================================

  if (
    lowerGoal.includes('java') ||
    lowerGoal.includes('fullstack')
  ) {

    roadmap.milestones = [
      {
        title: 'Foundation',

        description:
          'Learn programming basics and frontend fundamentals.',

        skills: [
          'Java Basics',
          'OOP',
          'HTML',
          'CSS',
          'JavaScript',
          'Git',
        ],

        courses: [
          'Java Programming',
          'Frontend Development',
          'Git & GitHub',
        ],

        resources: [
          'Apna College Java',
          'MDN Docs',
          'W3Schools',
        ],
      },

      {
        title:
          'Backend Development',

        description:
          'Build scalable backend applications.',

        skills: [
          'Spring Boot',
          'REST APIs',
          'MySQL',
          'Hibernate',
          'JWT Auth',
        ],

        courses: [
          'Spring Boot',
          'Backend APIs',
          'Database Design',
        ],

        resources: [
          'Spring Docs',
          'Hibernate Docs',
          'Postman',
        ],
      },

      {
        title:
          'Industry Level Projects',

        description:
          'Build projects and prepare for placements.',

        skills: [
          'Full Stack Projects',
          'Deployment',
          'DSA',
          'Interview Prep',
        ],

        courses: [
          'DSA',
          'System Design',
          'Placement Prep',
        ],

        resources: [
          'LeetCode',
          'Render',
          'Railway',
        ],
      },
    ]
  }

  // =========================================
  // FRONTEND
  // =========================================

  else if (
    lowerGoal.includes(
      'frontend'
    )
  ) {

    roadmap.milestones = [
      {
        title:
          'Frontend Basics',

        description:
          'Learn frontend technologies.',

        skills: [
          'HTML',
          'CSS',
          'JavaScript',
          'Responsive Design',
        ],

        courses: [
          'HTML & CSS',
          'JavaScript Basics',
        ],

        resources: [
          'MDN Docs',
          'CSS Tricks',
        ],
      },

      {
        title:
          'React Development',

        description:
          'Build modern frontend applications.',

        skills: [
          'React',
          'Next.js',
          'Tailwind CSS',
          'APIs',
        ],

        courses: [
          'React',
          'Next.js',
        ],

        resources: [
          'React Docs',
          'Next.js Docs',
        ],
      },

      {
        title:
          'Advanced Frontend',

        description:
          'Become industry ready.',

        skills: [
          'Redux',
          'Performance',
          'Deployment',
          'Projects',
        ],

        courses: [
          'Advanced React',
          'Interview Prep',
        ],

        resources: [
          'Vercel',
          'Netlify',
        ],
      },
    ]
  }

  // =========================================
  // DATA SCIENCE
  // =========================================

  else if (
    lowerGoal.includes('data')
  ) {

    roadmap.milestones = [
      {
        title:
          'Python Fundamentals',

        description:
          'Learn Python and data analysis.',

        skills: [
          'Python',
          'NumPy',
          'Pandas',
        ],

        courses: [
          'Python',
          'Data Analysis',
        ],

        resources: [
          'Kaggle',
          'W3Schools',
        ],
      },

      {
        title:
          'Machine Learning',

        description:
          'Learn ML concepts.',

        skills: [
          'ML Algorithms',
          'Visualization',
          'Scikit Learn',
        ],

        courses: [
          'Machine Learning',
          'Statistics',
        ],

        resources: [
          'Google ML',
          'Kaggle',
        ],
      },

      {
        title:
          'Industry Projects',

        description:
          'Build real-world AI projects.',

        skills: [
          'Deep Learning',
          'Projects',
          'Deployment',
        ],

        courses: [
          'Deep Learning',
          'AI Projects',
        ],

        resources: [
          'TensorFlow Docs',
          'HuggingFace',
        ],
      },
    ]
  }

  // =========================================
  // AI / ML
  // =========================================

  else if (
    lowerGoal.includes('ai') ||
    lowerGoal.includes('ml')
  ) {

    roadmap.milestones = [
      {
        title:
          'Programming Foundation',

        description:
          'Learn Python and math basics.',

        skills: [
          'Python',
          'Statistics',
          'Linear Algebra',
        ],

        courses: [
          'Python',
          'Math for AI',
        ],

        resources: [
          'Coursera',
          'Khan Academy',
        ],
      },

      {
        title:
          'Machine Learning',

        description:
          'Build ML models.',

        skills: [
          'Scikit Learn',
          'Regression',
          'Classification',
        ],

        courses: [
          'ML Specialization',
        ],

        resources: [
          'Google ML',
          'Kaggle',
        ],
      },

      {
        title:
          'Deep Learning',

        description:
          'Learn neural networks and LLMs.',

        skills: [
          'TensorFlow',
          'PyTorch',
          'LLMs',
        ],

        courses: [
          'Deep Learning',
          'Generative AI',
        ],

        resources: [
          'OpenAI Docs',
          'HuggingFace',
        ],
      },
    ]
  }

  // =========================================
  // CYBER SECURITY
  // =========================================

  else if (
    lowerGoal.includes(
      'cyber'
    )
  ) {

    roadmap.milestones = [
      {
        title:
          'Networking Basics',

        description:
          'Understand networking and security.',

        skills: [
          'Networking',
          'Linux',
          'Security Basics',
        ],

        courses: [
          'Networking',
          'Linux',
        ],

        resources: [
          'Cisco',
          'TryHackMe',
        ],
      },

      {
        title:
          'Ethical Hacking',

        description:
          'Learn ethical hacking tools.',

        skills: [
          'Penetration Testing',
          'Wireshark',
          'Burp Suite',
        ],

        courses: [
          'Ethical Hacking',
        ],

        resources: [
          'HackTheBox',
          'OWASP',
        ],
      },

      {
        title:
          'Advanced Security',

        description:
          'Become industry ready.',

        skills: [
          'Cloud Security',
          'Threat Analysis',
        ],

        courses: [
          'Advanced Security',
        ],

        resources: [
          'CompTIA',
          'OWASP',
        ],
      },
    ]
  }

  // =========================================
  // DEVOPS
  // =========================================

  else if (
    lowerGoal.includes(
      'devops'
    )
  ) {

    roadmap.milestones = [
      {
        title:
          'System Basics',

        description:
          'Learn Linux and networking.',

        skills: [
          'Linux',
          'Git',
          'Networking',
        ],

        courses: [
          'Linux',
          'GitHub',
        ],

        resources: [
          'Ubuntu Docs',
          'Git Docs',
        ],
      },

      {
        title:
          'CI/CD & Containers',

        description:
          'Learn deployment pipelines.',

        skills: [
          'Docker',
          'Jenkins',
          'CI/CD',
        ],

        courses: [
          'Docker',
          'CI/CD',
        ],

        resources: [
          'Docker Docs',
          'Jenkins Docs',
        ],
      },

      {
        title:
          'Cloud & Scaling',

        description:
          'Deploy scalable cloud apps.',

        skills: [
          'AWS',
          'Kubernetes',
          'Monitoring',
        ],

        courses: [
          'AWS',
          'Kubernetes',
        ],

        resources: [
          'AWS Docs',
          'Kubernetes Docs',
        ],
      },
    ]
  }

  // =========================================
  // DEFAULT
  // =========================================

  else {

    roadmap.milestones = [
      {
        title:
          'Learning Foundation',

        description:
          'Start with programming fundamentals.',

        skills: [
          'Programming',
          'Problem Solving',
        ],

        courses: [
          'Computer Basics',
        ],

        resources: [
          'YouTube',
          'Google',
        ],
      },
    ]
  }

  return roadmap
}