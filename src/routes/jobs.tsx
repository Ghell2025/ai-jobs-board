import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, Briefcase, Clock, Search, ExternalLink } from "lucide-react";
import { getJobsFn } from "~/server/functions";
import type { Job } from "~/data/jobs";

const CATEGORY_COLOURS: Record<string, string> = {
  "Machine Learning": "bg-blue-100 text-blue-800",
  NLP: "bg-purple-100 text-purple-800",
  "Computer Vision": "bg-green-100 text-green-800",
  "Data Science": "bg-amber-100 text-amber-800",
  MLOps: "bg-cyan-100 text-cyan-800",
  Research: "bg-rose-100 text-rose-800",
  "Generative AI": "bg-indigo-100 text-indigo-800",
};

const LOGO_COLOURS: Record<string, string> = {
  G: "bg-blue-600", O: "bg-emerald-600", T: "bg-red-600", N: "bg-red-700",
  D: "bg-orange-600", A: "bg-amber-700", S: "bg-green-600", M: "bg-blue-700",
  MS: "bg-sky-600", HF: "bg-yellow-500", NV: "bg-lime-600", AW: "bg-orange-500",
  AC: "bg-violet-600", AD: "bg-red-600", ST: "bg-indigo-600",
};

const CATEGORIES = ["All", "Machine Learning", "NLP", "Computer Vision", "Data Science", "MLOps", "Research", "Generative AI"];
const EXPERIENCES = ["All", "Entry", "Mid", "Senior", "Lead", "Director"];
const TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship"];

type SearchParams = {
  category?: string;
  search?: string;
  experience?: string;
  type?: string;
  remote?: string;
};

export const Route = createFileRoute("/jobs")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    category: search.category as string | undefined,
    search: search.search as string | undefined,
    experience: search.experience as string | undefined,
    type: search.type as string | undefined,
    remote: search.remote as string | undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => ({
    jobs: await getJobsFn({ data: {
      category: deps.category,
      search: deps.search,
      experience: deps.experience,
      type: deps.type,
      remote: deps.remote === "true",
    }}),
    initialFilters: deps,
  }),
  component: JobsPage,
  head: () => ({
    meta: [{ title: "AI Jobs Board - Browse Positions" }],
  }),
});

function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`${LOGO_COLOURS[job.companyLogo] ?? "bg-gray-600"} w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {job.companyLogo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">{job.title}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
            </div>
            <a href={job.linkedinUrl} target="_blank" rel="noopener noreferrer"
               className="shrink-0 text-blue-600 hover:text-blue-800 p-1" title="View on LinkedIn">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.type}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.postedAgo}</span>
          </div>
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{job.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CATEGORY_COLOURS[job.category] ?? "bg-gray-100 text-gray-800"}`}>{job.category}</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">{job.experience} Level</span>
            {job.remote && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Remote</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skills.slice(0, 4).map((s) => (
              <span key={s} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{s}</span>
            ))}
            {job.skills.length > 4 && <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
            <span className="text-sm font-semibold text-gray-900">{job.salary}</span>
            <a href={job.linkedinUrl} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
              Apply on LinkedIn <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobsPage() {
  const { jobs: initialJobs, initialFilters } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/jobs" });

  const [filters, setFilters] = useState({
    search: initialFilters.search ?? "",
    category: initialFilters.category ?? "All",
    experience: initialFilters.experience ?? "All",
    type: initialFilters.type ?? "All",
    remote: initialFilters.remote === "true",
  });
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await getJobsFn({ data: {
          category: filters.category !== "All" ? filters.category : undefined,
          search: filters.search || undefined,
          experience: filters.experience !== "All" ? filters.experience : undefined,
          type: filters.type !== "All" ? filters.type : undefined,
          remote: filters.remote,
        }});
        setJobs(result);
      } finally {
        setLoading(false);
      }
      navigate({
        search: {
          category: filters.category !== "All" ? filters.category : undefined,
          search: filters.search || undefined,
          experience: filters.experience !== "All" ? filters.experience : undefined,
          type: filters.type !== "All" ? filters.type : undefined,
          remote: filters.remote ? "true" : undefined,
        },
        replace: true,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI & Machine Learning Positions</h1>
          <p className="text-gray-500 mt-1">Browse curated AI job opportunities from top tech companies</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filter AI/ML Jobs</h2>
          <span className="text-sm text-gray-500">{jobs.length} position{jobs.length !== 1 ? "s" : ""} found</span>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search jobs, companies, skills..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {EXPERIENCES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 w-full">
              <input type="checkbox" checked={filters.remote} onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Remote Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 mt-2">Loading positions...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No positions match your filters</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
          <button onClick={() => setFilters({ search: "", category: "All", experience: "All", type: "All", remote: false })}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">Clear all filters</button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">Job listings sourced from LinkedIn. Click any position to apply directly on LinkedIn.</p>
      </div>
    </div>
  );
}
