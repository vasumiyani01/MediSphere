from django.shortcuts import render, redirect
from django.conf import settings
from accounts.models import UserProfile

# Create your views here.
def index(request):
    user_id = request.session.get('user_id')
    if user_id:
        try:
            profile = UserProfile.objects.get(id=user_id)
            dest = 'pharmacies' if profile.user_type == 'pharmacy' else f'{profile.user_type}s'
            return redirect(f'/{dest}/')
        except UserProfile.DoesNotExist:
            pass
    return render(request, 'portal/index.html', {'debug': settings.DEBUG})

def dashboard_redirect(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('index')
    try:
        profile = UserProfile.objects.get(id=user_id)
        user_type = profile.user_type
        dest = 'pharmacies' if user_type == 'pharmacy' else f'{user_type}s'
        return redirect(f'/{dest}/')
    except UserProfile.DoesNotExist:
        return redirect('index')


