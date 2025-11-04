import { useState, useEffect } from "react";
import { TalentCard, Talent } from "./TalentCard";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const mockTalents: Talent[] = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Senior Smart Contract Engineer",
    location: "Singapore",
    bio: "5+ years building secure smart contracts for DeFi protocols. Specialized in gas optimization and security audits.",
    skills: ["Solidity", "Hardhat", "Foundry", "Security", "DeFi"],
    availability: "Available",
    rate: "$150/hr",
    walletAddress: "0x742d...3a9f",
  },
  {
    id: "2",
    name: "Alex Rodriguez",
    title: "Full-Stack Web3 Developer",
    location: "Remote",
    bio: "Building decentralized applications with modern web technologies. Previous experience at top DeFi protocols.",
    skills: ["React", "Next.js", "ethers.js", "TypeScript", "Solidity"],
    availability: "Available",
    rate: "$120/hr",
    walletAddress: "0x8f2e...7b1c",
  },
  {
    id: "3",
    name: "Maya Patel",
    title: "Blockchain Architect",
    location: "London, UK",
    bio: "Designed and implemented scalable blockchain solutions for enterprise clients. Expert in consensus mechanisms.",
    skills: ["Rust", "Go", "Architecture", "Consensus", "L2"],
    availability: "Busy",
    rate: "$200/hr",
    walletAddress: "0x3d9a...5e2f",
  },
  {
    id: "4",
    name: "Jordan Kim",
    title: "Web3 Product Designer",
    location: "Seoul, South Korea",
    bio: "Creating intuitive Web3 experiences. Passionate about making crypto accessible to everyone.",
    skills: ["Figma", "UI/UX", "Product Design", "Prototyping", "Web3"],
    availability: "Available",
    rate: "$100/hr",
  },
  {
    id: "5",
    name: "Marcus Johnson",
    title: "DApp Developer",
    location: "Remote",
    bio: "Specialized in NFT marketplaces and gaming applications. Built multiple successful Web3 projects.",
    skills: ["React", "Web3.js", "IPFS", "NFT", "Smart Contracts"],
    availability: "Available",
    rate: "$130/hr",
    walletAddress: "0x6c4f...9d8a",
  },
  {
    id: "6",
    name: "Emily Zhang",
    title: "Solidity Security Specialist",
    location: "Berlin, Germany",
    bio: "Former auditor with deep expertise in smart contract security. Helped secure over $500M in TVL.",
    skills: ["Solidity", "Security", "Auditing", "Formal Verification"],
    availability: "Busy",
    rate: "$180/hr",
    walletAddress: "0x1a2b...4c5d",
  },
  {
    id: "7",
    name: "David Martinez",
    title: "Blockchain Backend Engineer",
    location: "Barcelona, Spain",
    bio: "Building scalable infrastructure for Web3 applications. Experience with high-throughput systems.",
    skills: ["Node.js", "GraphQL", "PostgreSQL", "Redis", "Web3"],
    availability: "Available",
    rate: "$110/hr",
  },
  {
    id: "8",
    name: "Lisa Thompson",
    title: "Crypto Community Manager",
    location: "Remote",
    bio: "Grew communities from 0 to 100k+ members. Expert in Discord, Twitter, and DAO governance.",
    skills: ["Community", "Discord", "Twitter", "DAO", "Marketing"],
    availability: "Available",
    rate: "$80/hr",
    walletAddress: "0x9e7f...2a3b",
  },
];

export function TalentsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [talents, setTalents] = useState<Talent[]>(mockTalents);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTalents();
  }, []);

  const loadTalents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/talents`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.talents && data.talents.length > 0) {
          setTalents(data.talents);
        }
      }
    } catch (error) {
      console.error('Error loading talents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTalents = talents.filter((talent) => {
    const matchesSearch =
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAvailability =
      filterAvailability === "all" || talent.availability === filterAvailability;

    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search talents, roles, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterAvailability} onValueChange={setFilterAvailability}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Busy">Busy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-gray-600">
        {filteredTalents.length} talent{filteredTalents.length !== 1 ? "s" : ""} found
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading talents...
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {filteredTalents.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>

          {filteredTalents.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No talents found matching your criteria
            </div>
          )}
        </>
      )}
    </div>
  );
}
