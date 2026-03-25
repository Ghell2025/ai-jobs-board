import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { ArrowRight, TrendingUp, Users, Briefcase, MapPin, ExternalLink } from "lucide-react";
import { getStatsFn } from "~/server/functions";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const Route = createFileRoute("/")({
  loader: async () => ({ stats: await getStatsFn() }),
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "AI Jobs Board - Dashboard" },
      { name: "description", content: "Discover AI, Machine Learning, and Data Science job opportunities sourced from LinkedIn." },
    ],
  }),
});

const CATEGORY_COLOURS: Record<string, string> = {
  "Machine Learning": "bg-blue-100 text-blue-800",
  NLP: "bg-purple-100 text-purple-800",
  "Computer Vision": "bg-green-100 text-green-800",
  "Data Science": "bg-amber-100 text-amber-800",
  MLOps: "bg-cyan-100 text-cyan-800",
  Research: "bg-rose-100 text-rose-800",
  "Generative AI": "bg-indigo-100 text-indigo-800",
};

function DashboardPage() {
  const { stats } = Route.useLoaderData();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const doughnutData = {
    labels: Object.keys(stats.categories),
    datasets: [{
      data: Object.values(stats.categories),
      backgroundColor: [
        "rgba(59,130,246,0.8)", "rgba(139,92,246,0.8)", "rgba(16,185,129,0.8)",
        "rgba(245,158,11,0.8)", "rgba(6,182,212,0.8)", "rgba(244,63,94,0.8)", "rgba(99,102,241,0.8)",
      ],
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: Object.keys(stats.experienceLevels),
    datasets: [{
      label: "Positions",
      data: Object.values(stats.experienceLevels),
      backgroundColor: "rgba(99,102,241,0.7)",
      borderRadius: 6,
    }],
  };

  const statCards = [
    { title: "Total AI Positions", value: stats.totalJobs.toString(), subtitle: "Sourced from LinkedIn", icon: Briefcase, color: "bg-blue-500" },
    { title: "Remote Positions", value: stats.remoteJobs.toString(), subtitle: `${Math.round(stats.remoteJobs / stats.totalJobs * 100)}% of total`, icon: MapPin, color: "bg-emerald-500" },
    { title: "Top Companies", value: stats.topCompanies.toString(), subtitle: "Hiring for AI roles", icon: Users, color: "bg-violet-500" },
    { title: "AI Categories", value: Object.keys(stats.categories).length.toString(), subtitle: "Specialization areas", icon: TrendingUp, color: "bg-amber-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-blue-200">Powered by LinkedIn Jobs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Job Opportunities Dashboard</h1>
        <p className="text-blue-100 text-lg max-w-2xl mb-6">
          Discover the latest AI, Machine Learning, and Data Science positions from top companies. Find your next role in artificial intelligence.
        </p>
        <Link to="/jobs" className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
          Browse All Positions <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Recent jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {mounted && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Jobs by Category</h2>
              <div className="max-w-xs mx-auto">
                <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: "bottom", labels: { boxWidth: 12 } } } }} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">By Experience Level</h2>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
            </div>
          </>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Latest Positions</h2>
            <Link to="/jobs" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
          </div>
          <div className="space-y-4">
            {stats.recentJobs.map((job) => (
              <div key={job.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                  {job.companyLogo}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.company}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLOURS[job.category] ?? "bg-gray-100 text-gray-800"}`}>{job.category}</span>
                    <span className="text-xs text-gray-400">{job.postedAgo}</span>
                  </div>
                </div>
                <a href={job.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 p-1 shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browse by specialization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by AI Specialization</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {Object.entries(stats.categories).map(([cat, count]) => (
            <Link key={cat} to="/jobs" search={{ category: cat }}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <span className="text-sm font-medium text-gray-900">{cat}</span>
              <span className="text-xs text-gray-500 mt-1">{count} position{count !== 1 ? "s" : ""}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
