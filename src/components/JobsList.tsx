import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { JobCard, Job } from "./JobCard";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Smart Contract Developer",
    company: "DeFi Protocol",
    location: "Remote",
    salary: "$120k - $180k",
    type: "Full-time",
    category: "dev",
    tags: ["Solidity", "Web3.js", "Ethereum", "DeFi"],
    description: "Build and audit smart contracts for our decentralized lending protocol. Must have experience with Solidity and security best practices.",
    postedDate: "2 days ago",
  },
  {
    id: "2",
    title: "Web3 Frontend Developer",
    company: "NFT Marketplace",
    location: "Remote",
    salary: "$100k - $150k",
    type: "Full-time",
    category: "dev",
    tags: ["React", "ethers.js", "TypeScript", "Web3"],
    description: "Create beautiful and intuitive interfaces for our NFT marketplace. Experience with wallet integration required.",
    postedDate: "5 days ago",
  },
  {
    id: "3",
    title: "Blockchain Protocol Engineer",
    company: "Layer 1 Chain",
    location: "San Francisco, CA",
    salary: "$150k - $220k",
    type: "Full-time",
    category: "dev",
    tags: ["Rust", "Go", "Consensus", "P2P"],
    description: "Design and implement core protocol features for our high-performance blockchain. Deep understanding of distributed systems required.",
    postedDate: "1 week ago",
  },
  {
    id: "4",
    title: "DeFi Product Manager",
    company: "Crypto Exchange",
    location: "New York, NY",
    salary: "$130k - $170k",
    type: "Full-time",
    category: "non-dev",
    tags: ["DeFi", "Product", "Tokenomics", "Strategy"],
    description: "Lead product strategy for our DeFi products. Previous experience in crypto/DeFi required.",
    postedDate: "3 days ago",
  },
  {
    id: "5",
    title: "Web3 Security Auditor",
    company: "Audit Firm",
    location: "Remote",
    salary: "$140k - $200k",
    type: "Contract",
    category: "dev",
    tags: ["Security", "Solidity", "Audit", "EVM"],
    description: "Conduct security audits of smart contracts and DeFi protocols. Experience with common vulnerabilities and exploits essential.",
    postedDate: "4 days ago",
  },
  {
    id: "6",
    title: "Community Manager",
    company: "DAO",
    location: "Remote",
    salary: "$70k - $100k",
    type: "Full-time",
    category: "non-dev",
    tags: ["Community", "Discord", "Twitter", "Web3"],
    description: "Grow and engage our community across Discord, Twitter, and other platforms. Crypto-native mindset required.",
    postedDate: "1 week ago",
  },
  {
    id: "7",
    title: "Solidity Developer Intern",
    company: "GameFi Studio",
    location: "Remote",
    salary: "$40k - $60k",
    type: "Internship",
    category: "intern",
    tags: ["Solidity", "Gaming", "NFT", "Web3"],
    description: "Build smart contracts for our play-to-earn gaming platform. Experience with gaming mechanics a plus.",
    postedDate: "6 days ago",
  },
  {
    id: "8",
    title: "Web3 UX Designer",
    company: "Wallet Provider",
    location: "Remote",
    salary: "$90k - $130k",
    type: "Full-time",
    category: "non-dev",
    tags: ["UX", "UI", "Figma", "Web3"],
    description: "Design intuitive wallet experiences for both new and experienced crypto users. Portfolio required.",
    postedDate: "3 days ago",
  },
  {
    id: "9",
    title: "Frontend Development Intern",
    company: "DeFi Protocol",
    location: "Remote",
    salary: "$30k - $50k",
    type: "Internship",
    category: "intern",
    tags: ["React", "JavaScript", "Web3", "Learning"],
    description: "Join our team as a frontend intern and learn Web3 development while building real products.",
    postedDate: "1 day ago",
  },
  {
    id: "10",
    title: "Marketing Intern",
    company: "NFT Marketplace",
    location: "Remote",
    salary: "$25k - $40k",
    type: "Internship",
    category: "intern",
    tags: ["Marketing", "Social Media", "Content", "Web3"],
    description: "Help us grow our community and create engaging content for our NFT marketplace.",
    postedDate: "2 days ago",
  },
];

export function JobsList() {
  const { selectedCategory } = useOutletContext<{ selectedCategory: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [selectedCategory]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/jobs?category=${selectedCategory}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        } else {
          // Use mock data if no jobs in database
          const filtered = selectedCategory === 'all' 
            ? mockJobs 
            : mockJobs.filter(job => job.category === selectedCategory);
          setJobs(filtered);
        }
      } else {
        // Fallback to mock data on error
        const filtered = selectedCategory === 'all' 
          ? mockJobs 
          : mockJobs.filter(job => job.category === selectedCategory);
        setJobs(filtered);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Fallback to mock data
      const filtered = selectedCategory === 'all' 
        ? mockJobs 
        : mockJobs.filter(job => job.category === selectedCategory);
      setJobs(filtered);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === "all" || job.type === filterType;

    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-gray-600">
        {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading jobs...
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No jobs found matching your criteria
            </div>
          )}
        </>
      )}
    </div>
  );
}
