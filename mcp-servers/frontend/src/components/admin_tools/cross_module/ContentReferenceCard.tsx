import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Music, MessageSquare, User, Flag, ExternalLink } from "lucide-react";
import {
  ContentReference,
  ModuleType,
} from "@/services/admin_tools/CrossModule";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

const moduleIcons: Record<ModuleType, React.ReactNode> = {
  ai_dj: <Music className="h-4 w-4" />,
  social: <MessageSquare className="h-4 w-4" />,
  music_sharing: <Music className="h-4 w-4" />,
  user_profile: <User className="h-4 w-4" />,
};

const moduleColors: Record<ModuleType, string> = {
  ai_dj: "bg-purple-100 text-purple-800",
  social: "bg-blue-100 text-blue-800",
  music_sharing: "bg-green-100 text-green-800",
  user_profile: "bg-orange-100 text-orange-800",
};

interface ContentReferenceCardProps {
  reference: ContentReference;
  onStatusUpdate?: (referenceId: string, status: string) => void;
}

export function ContentReferenceCard({
  reference,
  onStatusUpdate,
}: ContentReferenceCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const moduleIcon = moduleIcons[reference.module];
  const moduleColor = moduleColors[reference.module];

  const highestSeverityFlag = reference.flags.reduce((prev, current) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[current.severity] > severityOrder[prev.severity]
      ? current
      : prev;
  }, reference.flags[0]);

  return (
    <>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={moduleColor}>
                <span className="mr-1">{moduleIcon}</span>
                {reference.module.replace("_", " ").toUpperCase()}
              </Badge>
              {highestSeverityFlag && (
                <Badge
                  variant="outline"
                  className={`
                    ${highestSeverityFlag.severity === "critical" && "bg-red-100 text-red-800"}
                    ${highestSeverityFlag.severity === "high" && "bg-orange-100 text-orange-800"}
                    ${highestSeverityFlag.severity === "medium" && "bg-yellow-100 text-yellow-800"}
                    ${highestSeverityFlag.severity === "low" && "bg-blue-100 text-blue-800"}
                  `}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  {highestSeverityFlag.severity.toUpperCase()}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowDetails(true)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-base font-medium line-clamp-1">
            {reference.metadata.title || reference.content_type}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reference.metadata.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {reference.metadata.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {reference.user_ref}
            </div>
            {reference.metadata.created_at && (
              <div>
                Created: {format(new Date(reference.metadata.created_at), "PP")}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <div className="flex flex-wrap gap-2 w-full">
            {reference.related_refs.length > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="cursor-help">
                    {reference.related_refs.length} Related Items
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <ul className="text-xs space-y-1">
                    {reference.related_refs.map((ref) => (
                      <li key={ref.id}>
                        {ref.module}: {ref.content_type}
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
            {reference.flags.length > 0 && (
              <Badge variant="outline">
                {reference.flags.length} Flag
                {reference.flags.length !== 1 && "s"}
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl w-[90vw] sm:w-full max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-6 p-4">
              {/* Content Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Content Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">ID</label>
                    <p className="text-sm mt-1">{reference.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <p className="text-sm mt-1">{reference.content_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      User Reference
                    </label>
                    <p className="text-sm mt-1">{reference.user_ref}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Module</label>
                    <p className="text-sm mt-1">{reference.module}</p>
                  </div>
                </div>
              </div>

              {/* Flags */}
              {reference.flags.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Flags</h3>
                  <div className="space-y-3">
                    {reference.flags.map((flag) => (
                      <Card key={flag.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`
                                ${flag.severity === "critical" && "bg-red-100 text-red-800"}
                                ${flag.severity === "high" && "bg-orange-100 text-orange-800"}
                                ${flag.severity === "medium" && "bg-yellow-100 text-yellow-800"}
                                ${flag.severity === "low" && "bg-blue-100 text-blue-800"}
                              `}
                            >
                              {flag.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {flag.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm">{flag.type}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created:{" "}
                              {format(new Date(flag.created_at), "PPp")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Related References */}
              {reference.related_refs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Related Content</h3>
                  <div className="space-y-2">
                    {reference.related_refs.map((ref) => (
                      <Link
                        key={ref.id}
                        href={`/admin_tools/content/${ref.id}`}
                        className="block"
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    moduleColors[ref.module as ModuleType]
                                  }
                                >
                                  {moduleIcons[ref.module as ModuleType]}
                                  <span className="ml-1">
                                    {ref.module.replace("_", " ").toUpperCase()}
                                  </span>
                                </Badge>
                                <span className="text-sm">
                                  {ref.content_type}
                                </span>
                              </div>
                              <Badge variant="outline">
                                {ref.relationship_type.toUpperCase()}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
