import { Badge } from "./ui/badge";
import { CheckCircle2 } from "lucide-react";

export function CompanyEmailBadge() {
  return (
    <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
      <CheckCircle2 className="h-3 w-3" />
      企业邮箱已认证
    </Badge>
  );
}

