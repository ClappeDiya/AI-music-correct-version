from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.utils import timezone
from .models import (
    UserProfile,
    UserInteraction,
    UserTranslation,
    SubscriptionPlan,
    FeatureFlag,
    UserSubscription,
    SubscriptionHistory,
    EnvironmentSnapshot,
    UserIdentityBridge,
    ProfileFusion,
    ProfileHistory
)
from .serializers import (
    UserProfileSerializer,
    UserTranslationSerializer,
    SubscriptionPlanSerializer,
    FeatureFlagSerializer,
    UserSubscriptionSerializer,
    SubscriptionHistorySerializer,
    EnvironmentSnapshotSerializer,
    UserIdentityBridgeSerializer,
    ProfileFusionSerializer,
    ProfileHistorySerializer
)
from .mixins import UserSecurityMixin, UserResourceMixin
from django.db.utils import IntegrityError
from django.db.transaction import atomic

User = get_user_model()

class UserTranslationViewSet(UserSecurityMixin, viewsets.ModelViewSet):
    queryset = UserTranslation.objects.all()
    serializer_class = UserTranslationSerializer
    
    def get_user_queryset(self, queryset):
        # Users can see their own translations and approved public translations
        return queryset.filter(
            Q(user=self.user) | 
            Q(status='APPROVED', is_public=True)
        )

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class FeatureFlagViewSet(viewsets.ModelViewSet):
    queryset = FeatureFlag.objects.all()
    serializer_class = FeatureFlagSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserSubscriptionViewSet(UserSecurityMixin, viewsets.ModelViewSet):
    queryset = UserSubscription.objects.all()
    serializer_class = UserSubscriptionSerializer
    
    def get_user_queryset(self, queryset):
        return queryset.filter(user=self.user)
    
    def get_staff_queryset(self, queryset):
        # Staff can see all active subscriptions
        return queryset.filter(is_active=True)

class SubscriptionHistoryViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionHistory.objects.all()
    serializer_class = SubscriptionHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

class EnvironmentSnapshotViewSet(viewsets.ModelViewSet):
    queryset = EnvironmentSnapshot.objects.all()
    serializer_class = EnvironmentSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserIdentityBridgeViewSet(viewsets.ModelViewSet):
    queryset = UserIdentityBridge.objects.all()
    serializer_class = UserIdentityBridgeSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserProfileViewSet(UserSecurityMixin, viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    
    def get_user_queryset(self, queryset):
        # Users can see their own profiles and public profiles they follow
        return queryset.filter(
            Q(user=self.user) |
            Q(is_public=True, followers=self.user)
        )

class ProfileFusionViewSet(viewsets.ModelViewSet):
    queryset = ProfileFusion.objects.all()
    serializer_class = ProfileFusionSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProfileHistoryViewSet(viewsets.ModelViewSet):
    queryset = ProfileHistory.objects.all()
    serializer_class = ProfileHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

class RecommendationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """Get recommended users based on collaborative filtering"""
        try:
            profile = UserProfile.objects.get(user=request.user, is_active=True)
            
            # Only show recommendations if collaborative filtering is enabled
            if not profile.collaborative_filtering_enabled:
                return Response(
                    {'detail': 'Collaborative filtering is disabled for this profile'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get similar users from profile settings
            similar_users = profile.similar_users or []
            
            # Filter users who have opted in to recommendations
            recommended_profiles = UserProfile.objects.filter(
                Q(user__id__in=similar_users) &
                Q(collaborative_filtering_enabled=True)
            ).exclude(user=request.user)
            
            serializer = UserProfileSerializer(recommended_profiles, many=True)
            return Response(serializer.data)
            
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'No active profile found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def follow(self, request):
        """Handle follow actions between users"""
        target_user_id = request.data.get('target_user')
        if not target_user_id:
            return Response(
                {'error': 'target_user is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create interaction record
            UserInteraction.objects.create(
                user=request.user,
                target_user_id=target_user_id,
                interaction_type='FOLLOW',
                metadata={'timestamp': timezone.now().isoformat()}
            )
            
            # Update similar users list
            profile = UserProfile.objects.get(user=request.user, is_active=True)
            if target_user_id not in profile.similar_users:
                profile.similar_users.append(target_user_id)
                profile.save()
            
            return Response({'status': 'Follow successful'})
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get recommendation interaction history"""
        interactions = UserInteraction.objects.filter(
            user=request.user,
            interaction_type='FOLLOW'
        ).order_by('-timestamp')
        
        history = [{
            'target_user': interaction.target_user_id,
            'timestamp': interaction.timestamp,
            'metadata': interaction.metadata
        } for interaction in interactions]
        
        return Response(history)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login with JWT token generation"""
    email = request.data.get('email')
    password = request.data.get('password')

    # Validate input
    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Get the user
        user = User.objects.get(email=email)
        
        # Validate password
        if not user.check_password(password):
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Create token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Create response
        response_data = {
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.first_name
            },
            # Include tokens in response for backward compatibility
            'access': access_token,
            'refresh': refresh_token,
        }
        
        # Set the response
        response = Response(response_data)
        
        # Set cookies for enhanced security
        # HttpOnly cookies can't be accessed by JavaScript
        secure = False  # Set to True in production
        response.set_cookie(
            'accessToken',  # Match the name used in frontend middleware
            access_token,
            httponly=True,
            samesite='Lax',
            secure=secure,
            max_age=60 * 60 * 24  # 1 day in seconds
        )
        response.set_cookie(
            'refreshToken',  # Match the name used in frontend middleware
            refresh_token,
            httponly=True,
            samesite='Lax',
            secure=secure,
            max_age=60 * 60 * 24 * 7  # 7 days in seconds
        )
        
        # Set a non-httpOnly cookie that the frontend can read to know user is logged in
        response.set_cookie(
            'dashboard_session',
            'active',
            httponly=False,  # Frontend needs to read this
            samesite='Lax',
            secure=secure,
            max_age=60 * 60 * 24  # 1 day in seconds
        )
        
        # Log in the user for session authentication as well
        from django.contrib.auth import login as django_login
        django_login(request, user)
        
        return response
        
    except User.DoesNotExist:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    except Exception as e:
        # Don't expose internal errors to clients in production
        from django.conf import settings
        if settings.DEBUG:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'error': 'An error occurred during login'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """Log out a user by clearing their session and auth cookies"""
    try:
        # Clear Django session
        request.session.flush()
        
        # Clear auth cookies
        response = Response({"detail": "Successfully logged out"})
        response.delete_cookie('accessToken')
        response.delete_cookie('refreshToken')
        response.delete_cookie('dashboard_session')
        
        return response
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

# Custom throttle class for auth verification
class AuthVerificationRateThrottle(UserRateThrottle):
    rate = '120/minute'  # Much more generous rate limit for auth verification

@api_view(['GET'])
@permission_classes([AllowAny])
@throttle_classes([AuthVerificationRateThrottle])
def verify_auth(request):
    """Verify if the user is authenticated via session or token"""
    # Import Django settings
    from django.conf import settings
    
    # First check Django session authentication
    if request.user.is_authenticated:
        if settings.DEBUG:
            print(f"User is authenticated via session: {request.user.email}")
        return Response({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'email': request.user.email,
                'name': request.user.first_name,
            }
        })
    
    # If session auth failed, try token authentication from cookies
    try:
        access_token = request.COOKIES.get('accessToken')
        
        # Quick check if token is missing or empty
        if not access_token:
            if settings.DEBUG:
                print("No access token found in cookies")
            return Response({
                'authenticated': False,
                'error': 'No authentication token found'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if token is properly formatted (should have 2 periods)
        if access_token.count('.') != 2:
            if settings.DEBUG:
                print(f"Malformed token received: {access_token[:10]}...")
            return Response({
                'authenticated': False,
                'error': 'Invalid token format'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        # Import token validation
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import TokenError
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        try:
            # Validate the token
            token = AccessToken(access_token)
            user_id = token.payload.get('user_id')
            
            if not user_id:
                if settings.DEBUG:
                    print("Token has no user_id in payload")
                return Response({
                    'authenticated': False,
                    'error': 'Token missing user information'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
            user = User.objects.get(id=user_id)
            
            # Authenticate the user for this request
            from django.contrib.auth import login
            login(request, user)
            
            if settings.DEBUG:
                print(f"User authenticated via token: {user.email}")
                
            return Response({
                'authenticated': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.first_name,
                }
            })
        except (TokenError, User.DoesNotExist) as e:
            if settings.DEBUG:
                print(f"Token validation failed: {str(e)}")
            return Response({
                'authenticated': False,
                'error': 'Token is invalid or expired'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        if settings.DEBUG:
            print(f"Error during auth verification: {str(e)}")
        return Response({
            'authenticated': False,
            'error': 'Authentication verification failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # This should never execute but serves as a fallback
    return Response({
        'authenticated': False,
        'error': 'Unknown authentication failure'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh the JWT access token using the refresh token cookie"""
    refresh_token = request.COOKIES.get('refreshToken')
    
    if not refresh_token:
        return Response({
            'error': 'Refresh token not found'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Verify and create new access token
        refresh = RefreshToken(refresh_token)
        
        response = Response({
            'authenticated': True
        })
        
        # Set the new access token as HTTP-only cookie
        response.set_cookie(
            key='accessToken',
            value=str(refresh.access_token),
            httponly=True,
            samesite='Lax',
            secure=not settings.DEBUG,  # True in production
            max_age=60 * 60  # 1 hour
        )
        
        return response
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    from django.conf import settings
    from django.db import transaction

    try:
        # Extract registration data
        data = request.data

        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')

        # Validate required fields
        if not email or not password:
            return Response({
                'error': 'Email and password are required',
                'fields': {
                    'email': 'This field is required' if not email else None,
                    'password': 'This field is required' if not password else None
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'User with this email already exists',
                'fields': {
                    'email': 'User with this email already exists'
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create user in a separate transaction to ensure it's committed regardless of profile creation
        with transaction.atomic():
            # Create the user, setting username to email for compatibility
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_active=True,
                is_staff=True,
                is_superuser=True
            )

            if settings.DEBUG:
                print(f"Created user with ID: {user.id}, email: {user.email}")

        # Create profile separately so it doesn't affect user creation if it fails
        profile_created = False
        try:
            # Import models directly to ensure we're using the correct ones
            from django.apps import apps
            UserProfile = apps.get_model('user_management', 'UserProfile')

            if hasattr(UserProfile, 'default_profile_settings'):
                profile_settings = UserProfile.default_profile_settings()
            else:
                profile_settings = {}

            # Create the profile as a separate operation
            profile = UserProfile.objects.create(
                user=user,
                profile_type='CASUAL',
                name=f"Default Profile - {user.get_full_name() or email}",
                is_public=False,
                settings=profile_settings
            )
            profile_created = True

            if settings.DEBUG:
                print(f"Created profile for user ID: {user.id}")
        except Exception as profile_error:
            if settings.DEBUG:
                print(f"Warning: Unable to create profile: {str(profile_error)}")
            # Continue without a profile - user can still authenticate

        # Create tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Create response data with user info and tokens for backward compatibility
        response_data = {
            'message': 'Registration successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.first_name
            },
            'access': access_token,
            'refresh': refresh_token,
            'profile_created': profile_created
        }

        # Create response object
        response = Response(response_data, status=status.HTTP_201_CREATED)

        # Set cookies for enhanced security
        # HttpOnly cookies can't be accessed by JavaScript
        secure = False  # Set to True in production
        response.set_cookie(
            'accessToken',  # Match the name used in frontend middleware
            access_token,
            httponly=True,
            samesite='Lax',
            secure=secure,
            max_age=60 * 60 * 24  # 1 day in seconds
        )
        response.set_cookie(
            'refreshToken',  # Match the name used in frontend middleware
            refresh_token,
            httponly=True,
            samesite='Lax',
            secure=secure,
            max_age=60 * 60 * 24 * 7  # 7 days in seconds
        )

        # Set a non-httpOnly cookie that the frontend can read to know user is logged in
        response.set_cookie(
            'dashboard_session',
            'active',
            httponly=False,  # Frontend needs to read this
            samesite='Lax',
            secure=secure,
            max_age=60 * 60 * 24  # 1 day in seconds
        )

        # Log in the user for session authentication as well
        from django.contrib.auth import login as django_login
        django_login(request, user)

        return response

    except Exception as e:
        # Log the error for debugging
        if settings.DEBUG:
            print(f"Registration error: {str(e)}")

        return Response({
            'error': 'Registration failed',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_usage_quota(request):
    """Get user's current usage and quota information."""
    from ai_music_generation.models import AIMusicRequest
    from datetime import timedelta

    user = request.user

    # Get user's subscription tier (simplified - implement based on your billing model)
    # For now, assume free tier = 5/month, pro = unlimited
    try:
        is_pro = hasattr(user, 'usersubscription') and user.usersubscription.is_active and user.usersubscription.plan.name.lower() == 'pro'
    except:
        is_pro = False

    # Calculate usage this month
    month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_usage = AIMusicRequest.objects.filter(
        user=user,
        created_at__gte=month_start
    ).count()

    # Calculate usage today
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_usage = AIMusicRequest.objects.filter(
        user=user,
        created_at__gte=today_start
    ).count()

    # Determine quota
    monthly_quota = -1 if is_pro else 5  # -1 means unlimited
    daily_quota = -1 if is_pro else 2

    return Response({
        'monthly': {
            'used': month_usage,
            'limit': monthly_quota,
            'remaining': monthly_quota - month_usage if monthly_quota > 0 else -1,
        },
        'daily': {
            'used': today_usage,
            'limit': daily_quota,
            'remaining': daily_quota - today_usage if daily_quota > 0 else -1,
        },
        'plan': 'pro' if is_pro else 'free',
        'can_generate': is_pro or (month_usage < monthly_quota and today_usage < daily_quota),
    })
