import React, { useState, ChangeEvent, FormEvent } from "react";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "../ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/Card";

interface VerificationFormProps {
  verificationType: "email" | "sms";
  onVerified: () => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  verificationType,
  onVerified,
}) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/users/verify/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          verification_type: verificationType,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Verification failed");
      }

      setSuccessMessage("Verification successful!");
      onVerified();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    setResendLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/v1/users/resend_verification/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verification_type: verificationType,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to resend code");
      }

      setSuccessMessage("Verification code resent successfully");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          Verify Your {verificationType === "email" ? "Email" : "Phone Number"}
        </CardTitle>
        <CardDescription>
          Enter the verification code sent to your {verificationType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Verification Code
            </label>
            <div className="relative">
              <input
                id="code"
                name="code"
                type="text"
                value={code}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCode(e.target.value)
                }
                placeholder="Enter 6-digit code"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={6}
                pattern="\d{6}"
                inputMode="numeric"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {successMessage && (
            <div className="text-green-500 text-sm">{successMessage}</div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-center flex-col space-y-2">
        <div>
          Didn't receive the code?{" "}
          <button
            onClick={handleResendCode}
            className="text-primary hover:underline"
            disabled={resendLoading}
          >
            {resendLoading ? "Sending..." : "Resend Code"}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};
