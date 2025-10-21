import { useTranslation } from "next-i18next";

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

interface Errors {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const useValidation = () => {
  const { t } = useTranslation("common");

  const validateField = (name: string, value: string, formData?: FormData) => {
    let error = "";

    switch (name) {
      case "username":
        if (value.length < 3) error = t("errors.username_length");
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = t("errors.invalid_email");
        break;
      case "phone":
        if (!/^\+?[1-9]\d{1,14}$/.test(value))
          error = t("errors.invalid_phone");
        break;
      case "password":
        if (value.length < 8) error = t("errors.password_length");
        else if (!/[A-Z]/.test(value)) error = t("errors.password_uppercase");
        else if (!/[a-z]/.test(value)) error = t("errors.password_lowercase");
        else if (!/[0-9]/.test(value)) error = t("errors.password_number");
        else if (!/[^A-Za-z0-9]/.test(value))
          error = t("errors.password_special");
        break;
      case "confirmPassword":
        if (value !== formData?.password) error = t("errors.password_mismatch");
        break;
    }

    return error;
  };

  const validateForm = (formData: FormData) => {
    const errors: Errors = {
      username: validateField("username", formData.username),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      password: validateField("password", formData.password),
      confirmPassword: validateField(
        "confirmPassword",
        formData.confirmPassword,
        formData,
      ),
    };

    return {
      errors,
      isValid: Object.values(errors).every((error) => error === ""),
    };
  };

  return { validateField, validateForm };
};
