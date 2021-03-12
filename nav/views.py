from django.shortcuts import render, redirect
from django.http import HttpResponse
import json

# Create your views here.

def getJsonContext(aDict):
    return { 'jsonData' : json.dumps(aDict) }

def index(request):
    if request.method == 'POST':
        info = {
            'room': request.POST['room'],
            'username': request.POST['username'],
        }
        return render(request, 'nav/room.html',
                getJsonContext(info))
    else:
        return render(request, 'nav/index.html')
