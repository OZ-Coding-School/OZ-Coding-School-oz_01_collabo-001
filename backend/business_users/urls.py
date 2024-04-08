from django.urls import path
from .views import UserDetail, SignUp
from .views import UserDetail, ChangePasswordView

urlpatterns = [
    path('<int:pk>/', UserDetail.as_view(), name='business_user_detail'),
    path('signup/', SignUp.as_view(), name='signup'),
    path('business_user/<int:pk>/', UserDetail.as_view(), name='business_user_detail'),
    path('business_user/<int:pk>/change_password/', ChangePasswordView.as_view(), name='business_user_change_password'),
]