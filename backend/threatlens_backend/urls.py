from django.contrib import admin
from django.urls import path, include
from api.views import health_check, root_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', root_check),
    path('api/', include('api.urls')),
]
