import { useState } from "react";
import { useApiMutation } from "@/lib/hooks/use-api-query";
import { licenseTermsApi } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { FileCheck } from "lucide-react";

interface LicenseFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function LicenseForm({ onSuccess, initialData }: LicenseFormProps) {
  const [formData, setFormData] = useState({
    license_name: initialData?.license_name || "",
    description: initialData?.description || "",
    base_conditions: initialData?.base_conditions || {
      attribution_required: false,
      commercial_use: false,
      modification_allowed: false,
      redistribution_allowed: false,
    },
  });

  const { create, update } = useApiMutation("licenses", licenseTermsApi, {
    onSuccess,
    successMessage: initialData
      ? "License updated successfully"
      : "License created successfully",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      update.mutate({ id: initialData.id, data: formData });
    } else {
      create.mutate(formData);
    }
  };

  const handleConditionChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      base_conditions: {
        ...prev.base_conditions,
        [key]: checked,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="license_name">License Name</Label>
        <Input
          id="license_name"
          value={formData.license_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, license_name: e.target.value }))
          }
          placeholder="e.g., CC-BY 4.0"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe the license terms..."
          required
        />
      </div>

      <div className="space-y-4">
        <Label>Base Conditions</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="attribution_required"
              checked={formData.base_conditions.attribution_required}
              onCheckedChange={(checked) =>
                handleConditionChange(
                  "attribution_required",
                  checked as boolean,
                )
              }
            />
            <Label htmlFor="attribution_required">Attribution Required</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="commercial_use"
              checked={formData.base_conditions.commercial_use}
              onCheckedChange={(checked) =>
                handleConditionChange("commercial_use", checked as boolean)
              }
            />
            <Label htmlFor="commercial_use">Commercial Use Allowed</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="modification_allowed"
              checked={formData.base_conditions.modification_allowed}
              onCheckedChange={(checked) =>
                handleConditionChange(
                  "modification_allowed",
                  checked as boolean,
                )
              }
            />
            <Label htmlFor="modification_allowed">Modification Allowed</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="redistribution_allowed"
              checked={formData.base_conditions.redistribution_allowed}
              onCheckedChange={(checked) =>
                handleConditionChange(
                  "redistribution_allowed",
                  checked as boolean,
                )
              }
            />
            <Label htmlFor="redistribution_allowed">
              Redistribution Allowed
            </Label>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={create.isLoading || update.isLoading}
      >
        <FileCheck className="h-4 w-4 mr-2" />
        {initialData ? "Update License" : "Create License"}
      </Button>
    </form>
  );
}
