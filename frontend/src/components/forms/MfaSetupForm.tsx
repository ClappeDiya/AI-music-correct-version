import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Card } from "../ui/Card";
import QRCode from "qrcode.react";

interface FormData {
  method: "sms" | "authenticator";
  phoneNumber?: string;
}

interface MFASetupResponse {
  qr_code_url?: string;
  backup_codes: string[];
}

interface MFASetupFormProps {
  onSubmit: (data: FormData) => Promise<MFASetupResponse>;
}

export const MFASetupForm: React.FC<MFASetupFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, watch } = useForm<FormData>();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const method = watch("method");

  const handleSetup = async (data: FormData) => {
    const response = await onSubmit(data);
    if (response?.qr_code_url) {
      setQrCodeUrl(response.qr_code_url);
    }
    if (response?.backup_codes) {
      setBackupCodes(response.backup_codes);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(handleSetup)} className="space-y-4">
        <div>
          <Label>MFA Method</Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="sms"
                {...register("method", { required: true })}
              />
              <span>SMS Authentication</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="authenticator"
                {...register("method", { required: true })}
              />
              <span>Authenticator App</span>
            </label>
          </div>
        </div>

        {method === "sms" && (
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              {...register("phoneNumber", {
                required: "Phone number is required for SMS",
              })}
            />
          </div>
        )}

        <Button type="submit" className="w-full">
          Setup MFA
        </Button>

        {qrCodeUrl && (
          <div className="text-center">
            <p className="mb-2">
              Scan this QR code with your authenticator app:
            </p>
            <QRCode value={qrCodeUrl} />
          </div>
        )}

        {backupCodes.length > 0 && (
          <div>
            <p className="mb-2 font-medium">Backup Codes:</p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-100 rounded text-center"
                >
                  {code}
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Store these codes in a safe place. Each code can only be used
              once.
            </p>
          </div>
        )}
      </form>
    </Card>
  );
};
