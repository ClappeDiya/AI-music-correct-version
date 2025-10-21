import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import User, UserProfile, UserSecurityEvent
from .serializers import RegistrationSerializer
from rest_framework.test import APIClient
from django.urls import reverse
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

class UserModelTests(TestCase):
    def test_create_user(self):
        """Test creating a new user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertIsInstance(user.id, int)
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        
    def test_create_superuser(self):
        """Test creating a new superuser"""
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='testpass123'
        )
        self.assertIsInstance(user.id, int)
        self.assertEqual(user.username, 'admin')
        self.assertEqual(user.email, 'admin@example.com')
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        
    def test_username_validation(self):
        """Test username validation rules"""
        # Test minimum length
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username='ab',
                email='test@example.com',
                password='testpass123'
            )
            
        # Test invalid characters
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username='test@user',
                email='test@example.com',
                password='testpass123'
            )

class UserRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('user-register')
        
    def test_successful_registration(self):
        """Test successful user registration"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'confirm_password': 'testpass123',
            'agreed_to_terms': True
        }
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.count(), 1)
        self.assertIsInstance(User.objects.get().id, int)
        self.assertEqual(User.objects.get().username, 'testuser')
        
    def test_password_mismatch(self):
        """Test registration with mismatched passwords"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'confirm_password': 'differentpass',
            'agreed_to_terms': True
        }
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('confirm_password', response.data)
        
    def test_invalid_email(self):
        """Test registration with invalid email"""
        data = {
            'username': 'testuser',
            'email': 'invalid-email',
            'password': 'testpass123',
            'confirm_password': 'testpass123',
            'agreed_to_terms': True
        }
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

@pytest.mark.django_db
class UserProfileTests(TestCase):
    def test_profile_creation(self):
        """Test automatic profile creation for new users"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertIsInstance(user.id, int)
        self.assertTrue(hasattr(user, 'profile'))
        self.assertIsNotNone(user.profile)
        
    def test_profile_update(self):
        """Test updating user profile"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertIsInstance(user.id, int)
        profile = user.profile
        profile.bio = 'Test bio'
        profile.save()
        
        updated_profile = UserProfile.objects.get(user=user)
        self.assertIsInstance(updated_profile.id, int)
        self.assertEqual(updated_profile.bio, 'Test bio')

class UserSecurityTests(TestCase):
    def test_security_event_creation(self):
        """Test security event creation"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertIsInstance(user.id, int)
        
        event = UserSecurityEvent.objects.create(
            user=user,
            event_type='login_attempt',
            event_details={'ip': '127.0.0.1'}
        )
        
        self.assertIsInstance(event.id, int)
        self.assertEqual(UserSecurityEvent.objects.count(), 1)
        self.assertIsInstance(event.user.id, int)
        self.assertEqual(event.user, user)
        self.assertEqual(event.event_type, 'login_attempt')

class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.reset_request_url = reverse('password-reset-request')
        self.reset_confirm_url = reverse('password-reset-confirm')
        
    def test_password_reset_request(self):
        """Test successful password reset request"""
        data = {'email': 'test@example.com'}
        response = self.client.post(self.reset_request_url, data)
        self.assertIsInstance(response.data['reset_token'], int)
        self.assertEqual(response.status_code, 200)
        
    def test_password_reset_invalid_email(self):
        """Test password reset request with invalid email"""
        data = {'email': 'invalid@example.com'}
        response = self.client.post(self.reset_request_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)
        
    def test_password_reset_confirmation(self):
        """Test successful password reset confirmation"""
        # First request reset token
        request_data = {'email': 'test@example.com'}
        request_response = self.client.post(self.reset_request_url, request_data)
        reset_token = request_response.data['reset_token']
        
        # Confirm reset with new password
        confirm_data = {
            'token': reset_token,
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        }
        response = self.client.post(self.reset_confirm_url, confirm_data)
        self.assertIsInstance(response.data['reset_token'], int)
        self.assertEqual(response.status_code, 200)
        
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertIsInstance(self.user.id, int)
        self.assertTrue(self.user.check_password('newpass123'))
        
    def test_password_reset_expired_token(self):
        """Test password reset with expired token"""
        # Create expired token
        expired_token = 'expired-token-123'
        self.user.password_reset_token = expired_token
        self.user.password_reset_token_expires = timezone.now() - timedelta(hours=1)
        self.user.save()
        
        data = {
            'token': expired_token,
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        }
        response = self.client.post(self.reset_confirm_url, data)
        self.assertIsInstance(response.data['reset_token'], int)
        self.assertEqual(response.status_code, 400)
        self.assertIn('token', response.data)

class MFATests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.mfa_setup_url = reverse('mfa-setup')
        self.mfa_verify_url = reverse('mfa-verify')
        
    def test_mfa_setup(self):
        """Test MFA setup process"""
        # Start MFA setup
        response = self.client.post(self.mfa_setup_url)
        self.assertIsInstance(response.data['secret'], int)
        self.assertIsInstance(response.data['qr_code'], int)
        self.assertEqual(response.status_code, 200)
        
        # Verify MFA setup
        self.user.refresh_from_db()
        self.assertIsInstance(self.user.mfa_secret, int)
        self.assertTrue(self.user.mfa_secret)
        
    def test_mfa_verification(self):
        """Test successful MFA verification"""
        # Setup MFA first
        setup_response = self.client.post(self.mfa_setup_url)
        secret = setup_response.data['secret']
        
        # Generate valid OTP
        totp = pyotp.TOTP(secret)
        otp = totp.now()
        
        # Verify OTP
        verify_data = {'otp': otp}
        response = self.client.post(self.mfa_verify_url, verify_data)
        self.assertIsInstance(response.data['reset_token'], int)
        self.assertEqual(response.status_code, 200)
        
    def test_mfa_invalid_otp(self):
        """Test MFA verification with invalid OTP"""
        # Setup MFA first
        self.client.post(self.mfa_setup_url)
        
        # Attempt verification with invalid OTP
        verify_data = {'otp': '000000'}
        response = self.client.post(self.mfa_verify_url, verify_data)
        self.assertIsInstance(response.data['reset_token'], int)
        self.assertEqual(response.status_code, 400)
        self.assertIn('otp', response.data)
        
    def test_mfa_backup_codes(self):
        """Test backup code generation and usage"""
        # Setup MFA
        setup_response = self.client.post(self.mfa_setup_url)
        self.assertIsInstance(setup_response.data['backup_codes'], list)
        self.assertEqual(len(setup_response.data['backup_codes']), 10)
        
        # Use a backup code
        backup_code = setup_response.data['backup_codes'][0]
        verify_data = {'otp': backup_code}
        response = self.client.post(self.mfa_verify_url, verify_data)
        self.assertIsInstance(response.data['reset_token'], int)
        self.assertEqual(response.status_code, 200)
        
        # Verify backup code was consumed
        self.user.refresh_from_db()
        self.assertIsInstance(self.user.id, int)
        self.assertNotIn(backup_code, self.user.mfa_backup_codes)

class RBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.staff = User.objects.create_user(
            username='staff',
            email='staff@example.com',
            password='staffpass123',
            is_staff=True
        )
        
    def test_admin_access(self):
        """Test admin access to protected endpoints"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse('admin-only-endpoint'))
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 200)
        
    def test_staff_access(self):
        """Test staff access to staff-only endpoints"""
        self.client.force_authenticate(user=self.staff)
        response = self.client.get(reverse('staff-only-endpoint'))
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 200)
        
    def test_user_access_denied(self):
        """Test regular user access denied to admin endpoints"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('admin-only-endpoint'))
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 403)
        
    def test_unauthenticated_access_denied(self):
        """Test unauthenticated access denied to protected endpoints"""
        response = self.client.get(reverse('admin-only-endpoint'))
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 401)

class CSRFTests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.login_url = reverse('login')
        
    def test_csrf_protection(self):
        """Test CSRF protection on POST endpoints"""
        # Attempt login without CSRF token
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 403)
        self.assertIn('CSRF', str(response.data))
        
    def test_csrf_exempt_endpoints(self):
        """Test CSRF exempt endpoints"""
        # Make API endpoint exempt from CSRF
        self.client = APIClient(enforce_csrf_checks=False)
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 200)

class RateLimitTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('login')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_login_rate_limiting(self):
        """Test rate limiting on login attempts"""
        login_data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        # Make multiple failed login attempts
        for _ in range(5):
            response = self.client.post(self.login_url, login_data)
            self.assertIsInstance(response.data['id'], int)
            self.assertEqual(response.status_code, 400)
            
        # 6th attempt should be rate limited
        response = self.client.post(self.login_url, login_data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 429)
        self.assertIn('Too many requests', str(response.data))
        
    def test_password_reset_rate_limiting(self):
        """Test rate limiting on password reset requests"""
        reset_url = reverse('password-reset-request')
        data = {'email': 'test@example.com'}
        
        # Make multiple reset requests
        for _ in range(5):
            response = self.client.post(reset_url, data)
            self.assertIsInstance(response.data['reset_token'], int)
            self.assertEqual(response.status_code, 200)
            
        # 6th request should be rate limited
        response = self.client.post(reset_url, data)
        self.assertIsInstance(response.data['reset_token'], int)
        self.assertEqual(response.status_code, 429)
        self.assertIn('Too many requests', str(response.data))

class SocialLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.social_login_url = reverse('social-login')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_google_login(self):
        """Test Google OAuth2 login flow"""
        mock_token = 'mock-google-token'
        mock_response = {
            'sub': '1234567890',
            'email': 'test@example.com',
            'name': 'Test User',
            'picture': 'https://example.com/avatar.jpg'
        }
        
        # Mock Google API response
        with patch('requests.post') as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = mock_response
            
            data = {
                'provider': 'google',
                'access_token': mock_token
            }
            response = self.client.post(self.social_login_url, data)
            
            self.assertIsInstance(response.data['id'], int)
            self.assertEqual(response.status_code, 200)
            self.assertIn('token', response.data)
            self.assertIn('user', response.data)
            
    def test_facebook_login(self):
        """Test Facebook OAuth2 login flow"""
        mock_token = 'mock-facebook-token'
        mock_response = {
            'id': '1234567890',
            'email': 'test@example.com',
            'name': 'Test User',
            'picture': {
                'data': {
                    'url': 'https://example.com/avatar.jpg'
                }
            }
        }
        
        # Mock Facebook API response
        with patch('requests.get') as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = mock_response
            
            data = {
                'provider': 'facebook',
                'access_token': mock_token
            }
            response = self.client.post(self.social_login_url, data)
            
            self.assertIsInstance(response.data['id'], int)
            self.assertEqual(response.status_code, 200)
            self.assertIn('token', response.data)
            self.assertIn('user', response.data)
            
    def test_invalid_provider(self):
        """Test login with invalid provider"""
        data = {
            'provider': 'invalid',
            'access_token': 'mock-token'
        }
        response = self.client.post(self.social_login_url, data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 400)
        self.assertIn('provider', response.data)

class SessionManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.login_url = reverse('login')
        self.session_url = reverse('session-management')
        
    def test_session_creation(self):
        """Test successful session creation"""
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertIsInstance(response.data['session_id'], int)
        self.assertEqual(response.status_code, 200)
        
        # Verify session was created
        self.assertIsInstance(self.user.sessions.first().id, int)
        
    def test_session_validation(self):
        """Test session validation"""
        # Create session
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = self.client.post(self.login_url, login_data)
        session_id = login_response.data['session_id']
        
        # Validate session
        response = self.client.get(self.session_url, 
                                 HTTP_AUTHORIZATION=f'Session {session_id}')
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 200)
        
    def test_session_expiration(self):
        """Test session expiration"""
        # Create session
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = self.client.post(self.login_url, login_data)
        session_id = login_response.data['session_id']
        
        # Expire session
        session = self.user.sessions.first()
        session.expires_at = timezone.now() - timedelta(minutes=1)
        session.save()
        
        # Attempt to use expired session
        response = self.client.get(self.session_url,
                                 HTTP_AUTHORIZATION=f'Session {session_id}')
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 401)
        
    def test_concurrent_session_limit(self):
        """Test maximum concurrent sessions"""
        # Create max sessions
        for _ in range(5):
            login_data = {
                'username': 'testuser',
                'password': 'testpass123'
            }
            self.client.post(self.login_url, login_data)
            
        # Attempt to create one more session
        response = self.client.post(self.login_url, login_data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 403)
        self.assertIn('session_limit', response.data)

class EmailVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.verify_url = reverse('user-verify')
        self.resend_url = reverse('user-resend-verification')

    def test_email_verification(self):
        """Test successful email verification"""
        # Create verification code
        code = VerificationCode.objects.create(
            user=self.user,
            code='123456',
            verification_type='email',
            expires_at=timezone.now() + timedelta(minutes=15)
        )
        
        # Verify email
        data = {
            'code': '123456',
            'verification_type': 'email'
        }
        response = self.client.post(self.verify_url, data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(self.user.id, int)
        self.assertTrue(self.user.email_verified)
        
        # Verify security event was created
        event = UserSecurityEvent.objects.filter(
            user=self.user,
            event_type='verification_success'
        ).first()
        self.assertIsNotNone(event)
        self.assertIsInstance(event.id, int)
        self.assertEqual(event.event_details['verification_type'], 'email')

    def test_email_verification_expired_code(self):
        """Test email verification with expired code"""
        # Create expired verification code
        code = VerificationCode.objects.create(
            user=self.user,
            code='123456',
            verification_type='email',
            expires_at=timezone.now() - timedelta(minutes=1)
        )
        
        data = {
            'code': '123456',
            'verification_type': 'email'
        }
        response = self.client.post(self.verify_url, data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 400)
        self.assertIn('code', response.data)

    def test_resend_verification_code(self):
        """Test resending verification code"""
        data = {'verification_type': 'email'}
        response = self.client.post(self.resend_url, data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 200)
        
        # Verify new code was created
        code = VerificationCode.objects.filter(
            user=self.user,
            verification_type='email'
        ).first()
        self.assertIsNotNone(code)
        self.assertIsInstance(code.id, int)
        self.assertFalse(code.is_expired())

class AccountDeletionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.delete_url = reverse('user-delete')

    def test_account_deletion(self):
        """Test successful account deletion"""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.delete_url)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 204)
        
        # Verify user is deleted
        with self.assertRaises(User.DoesNotExist):
            User.objects.get(id=self.user.id)
            
        # Verify security event was created
        event = UserSecurityEvent.objects.filter(
            user=self.user,
            event_type='account_deleted'
        ).first()
        self.assertIsNotNone(event)
        self.assertIsInstance(event.id, int)

class ProfileUpdateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile_url = reverse('user-profile')
        self.client.force_authenticate(user=self.user)

    def test_profile_update(self):
        """Test updating user profile"""
        data = {
            'bio': 'New bio',
            'profile_picture_url': 'https://example.com/avatar.jpg'
        }
        response = self.client.patch(self.profile_url, data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 200)
        
        # Verify profile was updated
        self.user.refresh_from_db()
        self.assertIsInstance(self.user.id, int)
        self.assertEqual(self.user.profile.bio, 'New bio')
        self.assertEqual(self.user.profile.profile_picture_url, 'https://example.com/avatar.jpg')

class PasswordComplexityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.change_password_url = reverse('change-password')
        self.client.force_authenticate(user=self.user)

    def test_password_complexity(self):
        """Test password complexity requirements"""
        test_cases = [
            {'password': 'short', 'valid': False},
            {'password': 'alllowercase', 'valid': False},
            {'password': 'ALLUPPERCASE', 'valid': False},
            {'password': '1234567890', 'valid': False},
            {'password': 'ValidPass1', 'valid': True},
            {'password': 'StrongPass123!', 'valid': True}
        ]
        
        for case in test_cases:
            data = {
                'old_password': 'testpass123',
                'new_password': case['password'],
                'confirm_password': case['password']
            }
            response = self.client.post(self.change_password_url, data)
            
            if case['valid']:
                self.assertIsInstance(response.data['id'], int)
                self.assertEqual(response.status_code, 200)
            else:
                self.assertIsInstance(response.data['id'], int)
                self.assertEqual(response.status_code, 400)
                self.assertIn('new_password', response.data)

class AccountLockoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.login_url = reverse('login')

    def test_account_lockout(self):
        """Test account lockout after multiple failed attempts"""
        login_data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        # Make max failed attempts
        for _ in range(5):
            response = self.client.post(self.login_url, login_data)
            self.assertIsInstance(response.data['id'], int)
            self.assertEqual(response.status_code, 400)
            
        # Verify account is locked
        response = self.client.post(self.login_url, login_data)
        self.assertIsInstance(response.data['id'], int)
        self.assertEqual(response.status_code, 403)
        self.assertIn('account_locked', response.data)
        
        # Verify security event was created
        event = UserSecurityEvent.objects.filter(
            user=self.user,
            event_type='account_locked'
        ).first()
        self.assertIsNotNone(event)
        self.assertIsInstance(event.id, int)