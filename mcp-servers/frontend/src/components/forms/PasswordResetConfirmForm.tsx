import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

interface FormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordResetConfirmFormProps {
  onSubmit: SubmitHandler<FormData>;
}

export const PasswordResetConfirmForm: React.FC<
  PasswordResetConfirmFormProps
> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="token">Reset Token</Label>
        <Input
          id="token"
          {...register("token", { required: "Token is required" })}
        />
        {errors.token && (
          <p className="text-sm text-red-500">
            {errors.token.message as string}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          {...register("newPassword", { required: "New password is required" })}
        />
        {errors.newPassword && (
          <p className="text-sm text-red-500">
            {errors.newPassword.message as string}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === watch("newPassword") || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message as string}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Reset Password
      </Button>
    </form>
  );
};
