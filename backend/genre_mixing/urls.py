from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Instantiate the DefaultRouter
router = DefaultRouter()

# Register viewsets with the router
router.register(r'genres', views.GenreViewSet, basename='genre') # Register the GenreViewSet
router.register(r'mixing-sessions', views.MixingSessionViewSet, basename='mixing-session') # Register the MixingSessionViewSet
router.register(r'mixing-session-genres', views.MixingSessionGenreViewSet, basename='mixing-session-genre') # Register the MixingSessionGenreViewSet
router.register(r'mixing-session-params', views.MixingSessionParamsViewSet, basename='mixing-session-params') # Register the MixingSessionParamsViewSet
router.register(r'mixing-outputs', views.MixingOutputViewSet, basename='mixing-output') # Register the MixingOutputViewSet
router.register(r'sessions', views.SessionAnalysisViewSet)
router.register(r'track-references', views.TrackReferenceViewSet, basename='track-reference')

# Define the app's URL patterns
urlpatterns = [
    path('', include(router.urls)), # Include the router's URLs
]

# Set the app's namespace
app_name = 'genre_mixing' # The namespace for this app
