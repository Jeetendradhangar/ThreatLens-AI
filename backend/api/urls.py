from django.urls import path
from api import views

urlpatterns = [
    path('health/', views.health_check),
    path('scan/', views.scan_url),
    path('scans/', views.scan_list),
    path('scans/<int:scan_id>/', views.scan_detail),    
]
