import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { createClient } from "../utils/supabase/client";
import { uploadCompanyLogo } from "../utils/upload";

export function CreateJobForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyTwitter, setCompanyTwitter] = useState("");
  const [companyTokenInput, setCompanyTokenInput] = useState("");
  const [companyTokens, setCompanyTokens] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [baseCity, setBaseCity] = useState("");
  const [salary, setSalary] = useState("");
  const [type, setType] = useState("Full-time");
  const [category, setCategory] = useState("dev");
  const [remote, setRemote] = useState(false);
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [experience, setExperience] = useState("");
  const [applicationMethod, setApplicationMethod] = useState("");
  const [hasEquities, setHasEquities] = useState(false);
  const [acceptsRecruiters, setAcceptsRecruiters] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddCompanyToken = () => {
    if (companyTokenInput.trim() && !companyTokens.includes(companyTokenInput.trim())) {
      setCompanyTokens([...companyTokens, companyTokenInput.trim()]);
      setCompanyTokenInput("");
    }
  };

  const handleRemoveCompanyToken = (tokenToRemove: string) => {
    setCompanyTokens(companyTokens.filter((token) => token !== tokenToRemove));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or GIF image');
      return;
    }

    setCompanyLogo(file);
    setIsUploadingLogo(true);

    try {
      const url = await uploadCompanyLogo(file);
      setCompanyLogoUrl(url);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      setCompanyLogo(null);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error("You must be logged in to post a job");
        setIsSubmitting(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const jobData = {
        title,
        company,
        companyLogo: companyLogoUrl,
        companyWebsite: companyWebsite || undefined,
        companyTwitter: companyTwitter || undefined,
        companyTokens: companyTokens.length > 0 ? companyTokens : undefined,
        location,
        baseCity: baseCity || undefined,
        salary,
        type,
        category,
        remote,
        description,
        requirements: requirements || undefined,
        experience: experience || undefined,
        applicationMethod: applicationMethod || undefined,
        hasEquities,
        acceptsRecruiters,
        tags,
        postedBy: user?.user_metadata?.name || user?.email || undefined,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/jobs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        }
      );

      if (response.ok) {
        toast.success("Job posted successfully!");
        
        // Navigate back
        setTimeout(() => {
          navigate("/jobs");
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to post job");
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error("Failed to post job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/jobs")}
        className="mb-6 gap-2 px-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      <div className="space-y-6">
        <div>
          <h2>Post a Job</h2>
          <p className="mt-2 text-gray-600">
            Fill out the details below to post your job opening
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Smart Contract Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              placeholder="e.g. DeFi Protocol"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyLogo">Company Logo</Label>
            <Input
              id="companyLogo"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleLogoChange}
              disabled={isUploadingLogo}
            />
            <p className="text-sm text-gray-500">
              请上传不大于 240*240 px 的正方形图片（png / jpg / gif）
            </p>
            {companyLogoUrl && (
              <img src={companyLogoUrl} alt="Company logo" className="mt-2 h-20 w-20 rounded object-cover" />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Company Website</Label>
            <Input
              id="companyWebsite"
              type="url"
              placeholder="https://example.com"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyTwitter">Company Twitter</Label>
            <Input
              id="companyTwitter"
              type="url"
              placeholder="https://twitter.com/company"
              value={companyTwitter}
              onChange={(e) => setCompanyTwitter(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyTokens">Company Tokens</Label>
            <div className="flex gap-2">
              <Input
                id="companyTokens"
                placeholder="e.g. ETH, BTC..."
                value={companyTokenInput}
                onChange={(e) => setCompanyTokenInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCompanyToken();
                  }
                }}
              />
              <Button type="button" onClick={handleAddCompanyToken} variant="outline">
                Add
              </Button>
            </div>
            {companyTokens.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {companyTokens.map((token) => (
                  <Badge key={token} variant="secondary" className="gap-1 pr-1">
                    {token}
                    <button
                      type="button"
                      onClick={() => handleRemoveCompanyToken(token)}
                      className="ml-1 rounded-full hover:bg-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseCity">Base City</Label>
              <Input
                id="baseCity"
                placeholder="e.g. New York"
                value={baseCity}
                onChange={(e) => setBaseCity(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remote" 
              checked={remote}
              onCheckedChange={(checked) => setRemote(checked as boolean)}
            />
            <Label 
              htmlFor="remote" 
              className="cursor-pointer"
            >
              Remote position
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Job Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Dev Job</SelectItem>
                <SelectItem value="non-dev">Non Dev Job</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range</Label>
            <Input
              id="salary"
              placeholder="e.g. $120k - $180k"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="Specific requirements for this position..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience Required</Label>
            <Input
              id="experience"
              placeholder="e.g. 3+ years"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationMethod">How to Apply</Label>
            <Textarea
              id="applicationMethod"
              placeholder="How should candidates apply for this position?"
              value={applicationMethod}
              onChange={(e) => setApplicationMethod(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasEquities" 
              checked={hasEquities}
              onCheckedChange={(checked) => setHasEquities(checked as boolean)}
            />
            <Label 
              htmlFor="hasEquities" 
              className="cursor-pointer"
            >
              Has Equities
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="acceptsRecruiters" 
              checked={acceptsRecruiters}
              onCheckedChange={(checked) => setAcceptsRecruiters(checked as boolean)}
            />
            <Label 
              htmlFor="acceptsRecruiters" 
              className="cursor-pointer"
            >
              Accepts Recruiters
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Skills & Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="e.g. Solidity, Web3, React..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full hover:bg-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post Job"}
          </Button>
        </form>
      </div>
    </div>
  );
}
