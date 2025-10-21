import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

interface FormData {
  email: string;
}

interface PasswordResetRequestFormProps {
  onSubmit: SubmitHandler<FormData>;
}

export const PasswordResetRequestForm: React.FC<
  PasswordResetRequestFormProps
> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Request Password Reset
      </Button>
    </form>
  );
};
