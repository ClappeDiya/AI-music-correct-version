import React from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { useLoading, useErrorHandler, useSecurityLogger, useRateLimiter, validatePasswordStrength } from '../utils/authUtils';
import { cn } from '../utils';

export const RegistrationForm = () => {
  const { t } = useTranslation();
  const { isLoading, withLoading } = useLoading();
  const { error: submitError, handleError, clearError } = useErrorHandler();
  const { logEvent } = useSecurityLogger();
  const { checkLimit } = useRateLimiter(5, 60 * 1000); // 5 attempts per minute

  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [passwordRequirements, setPasswordRequirements] = React.useState<string[]>([]);
  const [successMessage, setSuccessMessage] = React.useState('');

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {};
    
    if (field === 'username') {
      if (value.length < 3) {
        errors.username = t('errors.username_too_short');
      } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        errors.username = t('errors.username_invalid');
      }
    }

    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.email = t('errors.invalid_email');
    }

    if (field === 'phone' && value && !/^\+?[1-9]\d{1,14}$/.test(value)) {
      errors.phone = t('errors.invalid_phone');
    }

    if (field === 'password') {
      const requirements = validatePasswordStrength(value);
      if (requirements.length > 0) {
        errors.password = t('errors.weak_password');
        setPasswordRequirements(requirements);
      } else {
        setPasswordRequirements([]);
      }
    }

    if (field === 'confirmPassword' && value !== formData.password) {
      errors.confirmPassword = t('errors.password_mismatch');
    }

    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    if (!checkLimit()) {
      handleError(new Error('rate_limit_exceeded'));
      return;
    }

    // Validate all fields
    const isValid = Object.entries(formData).every(([key, value]) => {
      if (key === 'agreedToTerms') return value === true;
      return validateField(key, value);
    });

    if (!isValid) return;

    await withLoading(async () => {
      try {
        const response = await fetch('/api/v1/users/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            phone_number: formData.phone,
            password: formData.password,
            confirm_password: formData.confirmPassword,
            agreed_to_terms: formData.agreedToTerms
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'registration_failed');
        }

        const data = await response.json();
        setSuccessMessage(t(data.message));
        
        // Log security event
        await logEvent('registration_success', {
          username: formData.username,
          email: formData.email
        });

        // TODO: Redirect to verification page
      } catch (error) {
        handleError(error);
        
        // Log security event
        await logEvent('registration_failed', {
          username: formData.username,
          email: formData.email,
          error: error instanceof Error ? error.message : 'unknown_error'
        });
      }
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Join our community to access exclusive features</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              onBlur={(e) => validateField('username', e.target.value)}
              error={validationErrors.username}
              aria-describedby="username-error"
            />
            {validationErrors.username && (
              <p id="username-error" className="text-sm text-red-500 mt-1">
                {validationErrors.username}
              </p>
            )}
            />
          </div>

          <div>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={(e) => validateField('email', e.target.value)}
              error={!!validationErrors.email}
              aria-describedby="email-error"
            />
            {validationErrors.email && (
              <p id="email-error" className="text-sm text-red-500 mt-1">
                {validationErrors.email}
              </p>
            )}
            />
          </div>

          <div>
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              onBlur={(e) => validateField('phone', e.target.value)}
              error={validationErrors.phone}
              aria-describedby="phone-error"
            />
            {validationErrors.phone && (
              <p id="phone-error" className="text-sm text-red-500 mt-1">
                {validationErrors.phone}
              </p>
            )}
            />
          </div>

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onBlur={(e) => validateField('password', e.target.value)}
              error={errors.password}
            />
          </div>

          <div>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              onBlur={(e) => validateField('confirmPassword', e.target.value)}
              error={validationErrors.confirmPassword}
              aria-describedby="confirm-password-error"
            />
            {validationErrors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-red-500 mt-1">
                {validationErrors.confirmPassword}
              </p>
            )}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreedToTerms}
              onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
              className={cn(
                'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
                !formData.agreedToTerms && 'border-red-500'
              )}
            />
            <label htmlFor="terms" className="text-sm">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {submitError && (
            <div className="text-red-500 text-sm mb-4">
              {submitError}
            </div>
          )}
          {successMessage && (
            <div className="text-green-500 text-sm mb-4">
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.agreedToTerms || isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-center flex-col space-y-2">
        <div>
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </div>
        <div className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

