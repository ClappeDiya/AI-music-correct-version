import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Card } from "../ui/Card";

interface FormData {
  code: string;
}

interface MFAVerificationFormProps {
  onSubmit: SubmitHandler<FormData>;
  onUseBackupCode: () => void;
}

export const MFAVerificationForm: React.FC<MFAVerificationFormProps> = ({
  onSubmit,
  onUseBackupCode,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            {...register("code", { required: "Verification code is required" })}
          />
          {errors.code && (
            <p className="text-sm text-red-500">{errors.code.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full">
          Verify
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onUseBackupCode}
            className="text-sm text-blue-600 hover:underline"
          >
            Use a backup code instead
          </button>
        </div>
      </form>
    </Card>
  );
};
