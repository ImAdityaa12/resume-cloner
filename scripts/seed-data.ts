/** Five distinct seed profiles, mapped to the flat resume template keys. */
import type { ResumeData } from "../lib/types.ts";

interface Job {
  title: string;
  company: string;
  start: string;
  end: string;
  location: string;
  bullets: [string, string, string];
}
interface Edu {
  degree: string;
  university: string;
  year: string;
  location: string;
  gpa?: string;
  courses?: string;
}
interface Project {
  name: string;
  stack: string;
  bullets: [string, string];
}
interface Cert {
  name: string;
  issuer: string;
  year: string;
}
export interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  jobs: [Job, Job, Job];
  skills: { languages: string; frameworks: string; databases: string; tools: string; cloud: string };
  education: [Edu, Edu];
  projects: [Project, Project];
  certs: [Cert, Cert, Cert];
}

export function profileToData(p: Profile): ResumeData {
  const d: ResumeData = {
    FULL_NAME: p.name,
    JOB_TITLE: p.title,
    EMAIL: p.email,
    PHONE: p.phone,
    LOCATION: p.location,
    LINKEDIN_URL: p.linkedin,
    GITHUB_URL: p.github,
    PROFESSIONAL_SUMMARY: p.summary,
    SKILL_LANGUAGES: p.skills.languages,
    SKILL_FRAMEWORKS: p.skills.frameworks,
    SKILL_DATABASES: p.skills.databases,
    SKILL_TOOLS: p.skills.tools,
    SKILL_CLOUD: p.skills.cloud,
  };
  p.jobs.forEach((j, i) => {
    const n = i + 1;
    d[`JOB${n}_TITLE`] = j.title;
    d[`JOB${n}_COMPANY`] = j.company;
    d[`JOB${n}_START_DATE`] = j.start;
    d[`JOB${n}_END_DATE`] = j.end;
    d[`JOB${n}_LOCATION`] = j.location;
    d[`JOB${n}_BULLET_1`] = j.bullets[0];
    d[`JOB${n}_BULLET_2`] = j.bullets[1];
    d[`JOB${n}_BULLET_3`] = j.bullets[2];
  });
  p.education.forEach((e, i) => {
    const n = i + 1;
    d[`EDU${n}_DEGREE`] = e.degree;
    d[`EDU${n}_UNIVERSITY`] = e.university;
    d[`EDU${n}_GRAD_YEAR`] = e.year;
    d[`EDU${n}_LOCATION`] = e.location;
    if (e.gpa) d[`EDU${n}_GPA`] = e.gpa;
    if (e.courses) d[`EDU${n}_COURSES`] = e.courses;
  });
  p.projects.forEach((pr, i) => {
    const n = i + 1;
    d[`PROJECT${n}_NAME`] = pr.name;
    d[`PROJECT${n}_TECH_STACK`] = pr.stack;
    d[`PROJECT${n}_BULLET_1`] = pr.bullets[0];
    d[`PROJECT${n}_BULLET_2`] = pr.bullets[1];
  });
  p.certs.forEach((c, i) => {
    const n = i + 1;
    d[`CERT${n}_NAME`] = c.name;
    d[`CERT${n}_ISSUER`] = c.issuer;
    d[`CERT${n}_YEAR`] = c.year;
  });
  return d;
}

export const PROFILES: Profile[] = [
  {
    name: "Aarav Sharma",
    title: "Senior Backend Engineer",
    email: "aarav.sharma@gmail.com",
    phone: "+1 (415) 555-0142",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/aaravsharma",
    github: "github.com/aaravsharma",
    summary:
      "Backend engineer with 8+ years building high-throughput distributed systems and payment infrastructure. Specializes in Go and event-driven architectures, with a track record of cutting latency and scaling services to millions of requests per minute.",
    jobs: [
      {
        title: "Senior Backend Engineer",
        company: "Stripe",
        start: "Mar 2021",
        end: "Present",
        location: "San Francisco, CA",
        bullets: [
          "Led the redesign of the ledger service, reducing p99 write latency from 240ms to 38ms across 12M daily transactions.",
          "Drove migration of 40+ microservices to a gRPC mesh, eliminating a class of cascading timeout failures.",
          "Mentored 5 engineers and established the team's incident-review and on-call runbook practices.",
        ],
      },
      {
        title: "Backend Engineer",
        company: "Square",
        start: "Jun 2018",
        end: "Feb 2021",
        location: "Oakland, CA",
        bullets: [
          "Built the merchant payouts pipeline processing $3B+ annually with exactly-once delivery guarantees.",
          "Introduced load-shedding and circuit breakers that improved availability from 99.5% to 99.97%.",
          "Owned the fraud-scoring API, adding real-time feature lookups with sub-10ms cache hits.",
        ],
      },
      {
        title: "Software Engineer",
        company: "Twilio",
        start: "Jul 2016",
        end: "May 2018",
        location: "San Francisco, CA",
        bullets: [
          "Developed messaging rate-limiting middleware adopted across the SMS platform.",
          "Reduced database load 35% by adding read replicas and query-level caching.",
          "Shipped a self-serve webhook debugger used by 20k+ developers monthly.",
        ],
      },
    ],
    skills: {
      languages: "Go, Python, Java, SQL, TypeScript",
      frameworks: "gRPC, Protobuf, Kafka, gin, FastAPI",
      databases: "PostgreSQL, Redis, DynamoDB, Cassandra",
      tools: "Docker, Kubernetes, Terraform, Datadog, Git",
      cloud: "AWS (EKS, RDS, SQS), GCP",
    },
    education: [
      {
        degree: "B.S. in Computer Science",
        university: "UC Berkeley",
        year: "2016",
        location: "Berkeley, CA",
        gpa: "3.8/4.0",
        courses: "Distributed Systems, Databases, Operating Systems, Algorithms",
      },
      {
        degree: "Certificate, Cloud Architecture",
        university: "Stanford Continuing Studies",
        year: "2019",
        location: "Stanford, CA",
      },
    ],
    projects: [
      {
        name: "ratekeeper",
        stack: "Go, Redis",
        bullets: [
          "Open-source distributed rate limiter with 2.1k GitHub stars and token-bucket + sliding-window modes.",
          "Sustains 500k decisions/sec per node with a sub-millisecond p99.",
        ],
      },
      {
        name: "ledgerlint",
        stack: "Rust, WASM",
        bullets: [
          "Static analyzer that flags double-entry accounting mistakes in financial code.",
          "Runs in CI and in-browser via a WASM build.",
        ],
      },
    ],
    certs: [
      { name: "AWS Certified Solutions Architect – Professional", issuer: "Amazon Web Services", year: "2023" },
      { name: "Certified Kubernetes Administrator (CKA)", issuer: "CNCF", year: "2022" },
      { name: "HashiCorp Terraform Associate", issuer: "HashiCorp", year: "2021" },
    ],
  },
  {
    name: "Maya Rodriguez",
    title: "Full-Stack Software Engineer",
    email: "maya.rodriguez@outlook.com",
    phone: "+1 (512) 555-0198",
    location: "Austin, TX",
    linkedin: "linkedin.com/in/mayarodriguez",
    github: "github.com/mayacodes",
    summary:
      "Product-minded full-stack engineer who ships end-to-end features in React and Node. Six years turning ambiguous requirements into polished, accessible web apps used by hundreds of thousands of people.",
    jobs: [
      {
        title: "Full-Stack Engineer",
        company: "Notion",
        start: "Jan 2022",
        end: "Present",
        location: "Remote",
        bullets: [
          "Shipped the public API and SDK now used by 30k+ integrations, owning design through GA launch.",
          "Cut initial page load by 1.4s by code-splitting the editor and prefetching critical data.",
          "Partnered with design to rebuild the permissions UI, lifting task-completion rate 22%.",
        ],
      },
      {
        title: "Software Engineer",
        company: "HubSpot",
        start: "Aug 2019",
        end: "Dec 2021",
        location: "Cambridge, MA",
        bullets: [
          "Built a drag-and-drop email builder adopted by 60% of active customers within two quarters.",
          "Led the front-end accessibility initiative, bringing core flows to WCAG 2.1 AA.",
          "Introduced a component testing harness that reduced UI regressions 45%.",
        ],
      },
      {
        title: "Junior Web Developer",
        company: "Indeed",
        start: "Jun 2018",
        end: "Jul 2019",
        location: "Austin, TX",
        bullets: [
          "Implemented job-alert subscription flows handling 5M emails per day.",
          "Migrated legacy jQuery widgets to React, shrinking bundle size 30%.",
          "Added end-to-end tests with Cypress covering the apply funnel.",
        ],
      },
    ],
    skills: {
      languages: "TypeScript, JavaScript, Python, HTML, CSS",
      frameworks: "React, Next.js, Node.js, Express, Tailwind",
      databases: "PostgreSQL, MongoDB, Prisma, Redis",
      tools: "Vite, Webpack, Jest, Cypress, Figma, Git",
      cloud: "Vercel, AWS (Lambda, S3, CloudFront)",
    },
    education: [
      {
        degree: "B.A. in Computer Science",
        university: "University of Texas at Austin",
        year: "2018",
        location: "Austin, TX",
        gpa: "3.7/4.0",
        courses: "Web Systems, HCI, Data Structures, Compilers",
      },
      {
        degree: "Frontend Masters Professional Path",
        university: "Frontend Masters",
        year: "2020",
        location: "Online",
      },
    ],
    projects: [
      {
        name: "a11y-snap",
        stack: "TypeScript, Playwright",
        bullets: [
          "CLI that snapshots accessibility trees and diffs them in CI to catch a11y regressions.",
          "Integrates with GitHub Actions and posts inline PR annotations.",
        ],
      },
      {
        name: "recipe-radar",
        stack: "Next.js, Postgres",
        bullets: [
          "Meal-planning PWA with offline support and 8k monthly active users.",
          "Implements ingredient-based fuzzy search with trigram indexes.",
        ],
      },
    ],
    certs: [
      { name: "Meta Front-End Developer Professional Certificate", issuer: "Meta", year: "2021" },
      { name: "Certified Professional in Accessibility (CPACC)", issuer: "IAAP", year: "2022" },
      { name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", year: "2020" },
    ],
  },
  {
    name: "Liam Chen",
    title: "Machine Learning Engineer",
    email: "liam.chen@protonmail.com",
    phone: "+1 (206) 555-0173",
    location: "Seattle, WA",
    linkedin: "linkedin.com/in/liamchen-ml",
    github: "github.com/liamchen",
    summary:
      "ML engineer bridging research and production. Builds recommendation and ranking systems end to end, from feature pipelines to low-latency serving, with a focus on measurable lift in production metrics.",
    jobs: [
      {
        title: "Machine Learning Engineer",
        company: "Amazon",
        start: "Apr 2021",
        end: "Present",
        location: "Seattle, WA",
        bullets: [
          "Owned the homepage personalization model, driving a 6.2% increase in click-through via online A/B tests.",
          "Built a feature store serving 4B features/day at p99 < 15ms.",
          "Cut training cost 40% by switching to spot GPU clusters with checkpointing.",
        ],
      },
      {
        title: "Data Scientist",
        company: "Zillow",
        start: "Sep 2018",
        end: "Mar 2021",
        location: "Seattle, WA",
        bullets: [
          "Improved the home-value model MAPE by 0.9pp using gradient-boosted ensembles.",
          "Productionized nightly retraining pipelines orchestrated with Airflow.",
          "Authored the experimentation guidelines adopted across the analytics org.",
        ],
      },
      {
        title: "Research Assistant",
        company: "Allen Institute for AI",
        start: "Jun 2017",
        end: "Aug 2018",
        location: "Seattle, WA",
        bullets: [
          "Co-authored a paper on transfer learning for low-resource NLP (EMNLP workshop).",
          "Built data-cleaning tooling that processed 2TB of web text.",
          "Implemented baseline transformer models in PyTorch.",
        ],
      },
    ],
    skills: {
      languages: "Python, SQL, Scala, C++",
      frameworks: "PyTorch, TensorFlow, scikit-learn, Spark, Ray",
      databases: "Snowflake, BigQuery, Redis, Postgres",
      tools: "Airflow, MLflow, Docker, Kubeflow, Git",
      cloud: "AWS (SageMaker, EMR), GCP (Vertex AI)",
    },
    education: [
      {
        degree: "M.S. in Machine Learning",
        university: "University of Washington",
        year: "2017",
        location: "Seattle, WA",
        gpa: "3.9/4.0",
        courses: "Deep Learning, NLP, Convex Optimization, Statistics",
      },
      {
        degree: "B.S. in Mathematics",
        university: "University of Michigan",
        year: "2015",
        location: "Ann Arbor, MI",
      },
    ],
    projects: [
      {
        name: "rankbench",
        stack: "Python, Ray",
        bullets: [
          "Benchmark suite comparing learning-to-rank algorithms on public datasets.",
          "Reproducible experiments with one-command runs and tracked metrics.",
        ],
      },
      {
        name: "tinygrad-notes",
        stack: "Python, NumPy",
        bullets: [
          "Educational reimplementation of autodiff with annotated walkthroughs.",
          "Used as teaching material in two university reading groups.",
        ],
      },
    ],
    certs: [
      { name: "TensorFlow Developer Certificate", issuer: "Google", year: "2021" },
      { name: "AWS Certified Machine Learning – Specialty", issuer: "Amazon Web Services", year: "2022" },
      { name: "Deep Learning Specialization", issuer: "DeepLearning.AI", year: "2019" },
    ],
  },
  {
    name: "Sofia Almeida",
    title: "Frontend Engineer",
    email: "sofia.almeida@gmail.com",
    phone: "+44 20 7946 0321",
    location: "London, UK",
    linkedin: "linkedin.com/in/sofiaalmeida",
    github: "github.com/sofiaalmeida",
    summary:
      "Frontend engineer obsessed with performance, motion, and design systems. Five years crafting fast, delightful interfaces and the component libraries that keep teams consistent and shipping quickly.",
    jobs: [
      {
        title: "Frontend Engineer",
        company: "Spotify",
        start: "Feb 2022",
        end: "Present",
        location: "London, UK",
        bullets: [
          "Rebuilt the web player's now-playing view, improving Core Web Vitals to all-green for 90% of sessions.",
          "Maintained the design-system component library used by 200+ engineers.",
          "Prototyped scroll-driven animations that increased playlist engagement 11%.",
        ],
      },
      {
        title: "UI Engineer",
        company: "Monzo",
        start: "Mar 2020",
        end: "Jan 2022",
        location: "London, UK",
        bullets: [
          "Led the marketing-site migration to Next.js, halving time-to-interactive.",
          "Built an internal Storybook with visual regression tests on every PR.",
          "Shaped the accessibility standards now part of the engineering handbook.",
        ],
      },
      {
        title: "Web Developer",
        company: "Deliveroo",
        start: "Jul 2019",
        end: "Feb 2020",
        location: "London, UK",
        bullets: [
          "Implemented a restaurant-discovery carousel with lazy loading and prefetch.",
          "Reduced layout shift on the menu page to near-zero CLS.",
          "Localized the checkout flow into six languages.",
        ],
      },
    ],
    skills: {
      languages: "TypeScript, JavaScript, HTML, CSS, GLSL",
      frameworks: "React, Next.js, Svelte, Tailwind, Framer Motion",
      databases: "GraphQL, Postgres, IndexedDB",
      tools: "Vite, Storybook, Playwright, Figma, Lighthouse",
      cloud: "Vercel, Cloudflare, AWS S3",
    },
    education: [
      {
        degree: "B.Sc. in Computer Science",
        university: "Imperial College London",
        year: "2019",
        location: "London, UK",
        gpa: "First Class Honours",
        courses: "Computer Graphics, HCI, Networks, Software Engineering",
      },
      {
        degree: "Erasmus Exchange, Interaction Design",
        university: "KTH Royal Institute of Technology",
        year: "2018",
        location: "Stockholm, SE",
      },
    ],
    projects: [
      {
        name: "motion-kit",
        stack: "TypeScript, WebGL",
        bullets: [
          "Tiny animation primitives library with spring physics and 3.4k GitHub stars.",
          "Tree-shakeable, zero-dependency, under 4kb gzipped.",
        ],
      },
      {
        name: "perfwatch",
        stack: "Next.js, Lighthouse CI",
        bullets: [
          "Dashboard that tracks Core Web Vitals across deploys with budget alerts.",
          "Posts a performance summary comment on each pull request.",
        ],
      },
    ],
    certs: [
      { name: "Google Mobile Web Specialist", issuer: "Google", year: "2021" },
      { name: "Professional Scrum Developer I", issuer: "Scrum.org", year: "2020" },
      { name: "Frontend Masters Certificate of Completion", issuer: "Frontend Masters", year: "2022" },
    ],
  },
  {
    name: "Noah Patel",
    title: "DevOps / Platform Engineer",
    email: "noah.patel@gmail.com",
    phone: "+1 (646) 555-0110",
    location: "New York, NY",
    linkedin: "linkedin.com/in/noahpatel",
    github: "github.com/noahpatel",
    summary:
      "Platform engineer who treats infrastructure as a product. Seven years building golden paths, CI/CD, and observability that let product teams ship safely dozens of times a day.",
    jobs: [
      {
        title: "Senior Platform Engineer",
        company: "Datadog",
        start: "May 2021",
        end: "Present",
        location: "New York, NY",
        bullets: [
          "Built the internal developer platform that reduced new-service setup from days to under an hour.",
          "Managed 60+ Kubernetes clusters via GitOps with Argo CD and policy-as-code.",
          "Designed the multi-region failover runbook, achieving a tested RTO of 8 minutes.",
        ],
      },
      {
        title: "Site Reliability Engineer",
        company: "Peloton",
        start: "Jan 2019",
        end: "Apr 2021",
        location: "New York, NY",
        bullets: [
          "Cut cloud spend 28% through right-sizing, spot fleets, and autoscaling policies.",
          "Rolled out distributed tracing that reduced mean time to resolution by half.",
          "Automated certificate rotation across 300+ services, eliminating expiry incidents.",
        ],
      },
      {
        title: "DevOps Engineer",
        company: "Etsy",
        start: "Aug 2016",
        end: "Dec 2018",
        location: "Brooklyn, NY",
        bullets: [
          "Migrated the deploy pipeline to containers, tripling deploy frequency.",
          "Built self-service Terraform modules adopted by every product team.",
          "Hardened the CI fleet, reducing flaky-build rate from 9% to 1.5%.",
        ],
      },
    ],
    skills: {
      languages: "Go, Python, Bash, HCL, SQL",
      frameworks: "Kubernetes, Argo CD, Helm, Prometheus, OpenTelemetry",
      databases: "PostgreSQL, Redis, etcd, InfluxDB",
      tools: "Terraform, Docker, GitHub Actions, Vault, Grafana",
      cloud: "AWS, GCP, Azure",
    },
    education: [
      {
        degree: "B.S. in Information Systems",
        university: "Carnegie Mellon University",
        year: "2016",
        location: "Pittsburgh, PA",
        gpa: "3.6/4.0",
        courses: "Cloud Computing, Networks, Security, Operating Systems",
      },
      {
        degree: "SRE Certified Professional Program",
        university: "Linux Foundation",
        year: "2020",
        location: "Online",
      },
    ],
    projects: [
      {
        name: "driftguard",
        stack: "Go, Terraform",
        bullets: [
          "Detects infrastructure drift between Terraform state and live cloud resources.",
          "Posts a daily drift report to Slack with one-click remediation plans.",
        ],
      },
      {
        name: "k8s-costmap",
        stack: "Go, Prometheus",
        bullets: [
          "Attributes Kubernetes cost down to the namespace and deployment level.",
          "Surfaces idle workloads and recommends right-sizing.",
        ],
      },
    ],
    certs: [
      { name: "Certified Kubernetes Administrator (CKA)", issuer: "CNCF", year: "2021" },
      { name: "AWS Certified Solutions Architect – Associate", issuer: "Amazon Web Services", year: "2020" },
      { name: "HashiCorp Certified: Terraform Associate", issuer: "HashiCorp", year: "2022" },
    ],
  },
];
