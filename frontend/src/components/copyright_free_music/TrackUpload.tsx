import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tracksApi } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { useToast } from "@/components/ui/useToast";
import { Progress } from "@/components/ui/Progress";
import {
  Upload,
  Music,
  FileText,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Scale,
  Copyright,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { useFeatureFlag } from "@/lib/hooks/UseFeatureFlags";

interface UploadFormData {
  title: string;
  description: string;
  composer_credits: string;
  license_type:
    | "cc_by"
    | "cc_by_sa"
    | "cc_by_nd"
    | "cc_by_nc"
    | "cc_by_nc_sa"
    | "cc_by_nc_nd"
    | "commercial";
  usage_terms: string[];
  royalty_structure: {
    commercial_use: boolean;
    royalty_percentage: number;
    minimum_fee: number;
  };
  file: File | null;
}

const LICENSE_TYPES = [
  { value: "cc_by", label: "Creative Commons Attribution", icon: Copyright },
  { value: "cc_by_sa", label: "CC Attribution-ShareAlike", icon: Users },
  { value: "cc_by_nd", label: "CC Attribution-NoDerivs", icon: FileText },
  {
    value: "cc_by_nc",
    label: "CC Attribution-NonCommercial",
    icon: DollarSign,
  },
  {
    value: "cc_by_nc_sa",
    label: "CC Attribution-NonCommercial-ShareAlike",
    icon: Scale,
  },
  {
    value: "cc_by_nc_nd",
    label: "CC Attribution-NonCommercial-NoDerivs",
    icon: AlertCircle,
  },
  { value: "commercial", label: "Commercial License", icon: DollarSign },
];

export function TrackUpload() {
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    description: "",
    composer_credits: "",
    license_type: "cc_by",
    usage_terms: [],
    royalty_structure: {
      commercial_use: false,
      royalty_percentage: 0,
      minimum_fee: 0,
    },
    file: null,
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { isEnabled: isAdvancedUploadEnabled } = useFeatureFlag(
    "advanced-upload-features",
  );
  const { isEnabled: isBatchUploadEnabled } = useFeatureFlag("batch-upload");
  const { isEnabled: isAIProcessingEnabled } = useFeatureFlag("ai-processing");

  const validateFile = (file: File): string | null => {
    const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      return "Invalid file format. Please upload MP3, WAV, or OGG files.";
    }

    if (file.size > maxSize) {
      return "File size exceeds 100MB limit.";
    }

    return null;
  };

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
          }
        });

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/tracks/`);
        xhr.send(data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tracks"]);
      toast({
        title: "Success",
        description: "Track uploaded successfully",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
      setFormData({
        title: "",
        description: "",
        composer_credits: "",
        license_type: "cc_by",
        usage_terms: [],
        royalty_structure: {
          commercial_use: false,
          royalty_percentage: 0,
          minimum_fee: 0,
        },
        file: null,
      });
      setUploadProgress(0);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload track",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      setUploadProgress(0);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return;

    const error = validateFile(formData.file);
    if (error) {
      toast({
        title: "Invalid File",
        description: error,
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("composer_credits", formData.composer_credits);
    data.append("license_type", formData.license_type);
    data.append("usage_terms", JSON.stringify(formData.usage_terms));
    data.append(
      "royalty_structure",
      JSON.stringify(formData.royalty_structure),
    );
    data.append("file", formData.file);

    uploadMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid File",
          description: error,
          variant: "destructive",
        });
        return;
      }
    }
    setFormData((prev) => ({ ...prev, file }));
  };

  const selectedLicense = LICENSE_TYPES.find(
    (lt) => lt.value === formData.license_type,
  );
  const Icon = selectedLicense?.icon || Copyright;

  return (
    <div>
      {isAdvancedUploadEnabled && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Advanced Upload Options</h3>
          {isBatchUploadEnabled && (
            <div className="mt-2">
              {/* Batch upload features */}
              <Button
                variant="outline"
                onClick={() => console.log("Batch upload clicked")}
              >
                Batch Upload
              </Button>
            </div>
          )}
          {isAIProcessingEnabled && (
            <div className="mt-2">
              {/* AI processing features */}
              <Button
                variant="outline"
                onClick={() => console.log("AI processing clicked")}
              >
                Enable AI Processing
              </Button>
            </div>
          )}
        </div>
      )}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Upload Track
          </CardTitle>
          <CardDescription>
            Share your music with appropriate licensing and usage terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Track Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter track title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="composer">Composer Credits</Label>
                <Input
                  id="composer"
                  value={formData.composer_credits}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      composer_credits: e.target.value,
                    }))
                  }
                  placeholder="Enter composer names"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your track..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License Type</Label>
              <Select
                value={formData.license_type}
                onValueChange={(value: UploadFormData["license_type"]) =>
                  setFormData((prev) => ({ ...prev, license_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{selectedLicense?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_TYPES.map((license) => (
                    <SelectItem key={license.value} value={license.value}>
                      <div className="flex items-center gap-2">
                        <license.icon className="h-4 w-4" />
                        <span>{license.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.license_type === "commercial" && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="commercial_use">Allow Commercial Use</Label>
                  <Switch
                    id="commercial_use"
                    checked={formData.royalty_structure.commercial_use}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        royalty_structure: {
                          ...prev.royalty_structure,
                          commercial_use: checked,
                        },
                      }))
                    }
                  />
                </div>

                {formData.royalty_structure.commercial_use && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="royalty">Royalty Percentage</Label>
                      <div className="flex items-center">
                        <Input
                          id="royalty"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.royalty_structure.royalty_percentage}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              royalty_structure: {
                                ...prev.royalty_structure,
                                royalty_percentage: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minimum_fee">Minimum Fee</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <Input
                          id="minimum_fee"
                          type="number"
                          min="0"
                          value={formData.royalty_structure.minimum_fee}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              royalty_structure: {
                                ...prev.royalty_structure,
                                minimum_fee: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="file">Audio File</Label>
              <Input
                id="file"
                type="file"
                accept="audio/mpeg,audio/wav,audio/ogg"
                onChange={handleFileChange}
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-accent"
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: MP3, WAV, OGG (max 100MB)
              </p>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={uploadMutation.isLoading}
              className="w-full"
            >
              {uploadMutation.isLoading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Track
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
