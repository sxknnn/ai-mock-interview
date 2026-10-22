from django.urls import path

from . import views

urlpatterns = [
    path("roles/", views.RolesListView.as_view(), name="roles-list"),
    path("sessions/", views.SessionListCreateView.as_view(), name="session-list-create"),
    path("sessions/<str:session_id>/", views.SessionDetailView.as_view(), name="session-detail"),
    path("sessions/<str:session_id>/submit/", views.SubmitSessionView.as_view(), name="session-submit"),
]
