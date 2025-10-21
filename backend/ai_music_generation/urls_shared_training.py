from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views_shared_training

router = DefaultRouter()
router.register(
    r'shared-models',
    views_shared_training.SharedModelGroupViewSet,
    basename='shared-model'
)
router.register(
    r'group-members',
    views_shared_training.SharedModelMemberViewSet,
    basename='group-member'
)
router.register(
    r'training-contributions',
    views_shared_training.TrainingContributionViewSet,
    basename='training-contribution'
)
router.register(
    r'training-jobs',
    views_shared_training.ModelTrainingJobViewSet,
    basename='training-job'
)

urlpatterns = [
    path('', include(router.urls)),
]
