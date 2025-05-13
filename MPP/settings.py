###################
# IMPORTS SECTION #
###################
import os
from pathlib import Path
from corsheaders.defaults import default_headers

##################
# BASE DIRECTORY #
##################
BASE_DIR = Path(__file__).resolve().parent.parent


#####################
# SECURITY SETTINGS #
#####################
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-m&h=3n9*^+gco0zd4$8j2&oa0^^)w+efuh!v488r-mytixwi67')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = ['*']

################
# APPLICATIONS #
################
INSTALLED_APPS = [
    "bookings",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "channels",
    "rest_framework.authtoken"
]

##############
# MIDDLEWARE #
##############
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

##########################
# URLS AND WSGI AND ASGI #
##########################
ROOT_URLCONF = "MPP.urls"
WSGI_APPLICATION = "MPP.wsgi.application"
ASGI_APPLICATION = "MPP.asgi.application"


#################
#   WEBSOCKET   #
#################
WS_FLAG = False
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

#############
# TEMPLATES #
#############
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / 'templates'],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

##################
# REST FRAMEWORK #
##################
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}


#####################
# DATABASE SETTINGS #
#####################
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

##################
# AUTHENTICATION #
##################
AUTH_USER_MODEL = 'bookings.BookingUser'

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

########################
# INTERNATIONALIZATION #
########################
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

################
# STATIC FILES #
################
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

##########################
# CORS AND CSRF SETTINGS #
##########################
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'HEAD',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = list(default_headers) + [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_EXPOSE_HEADERS = [
    'content-disposition',
]
CSRF_TRUSTED_ORIGINS = ['http://localhost:8000', 'https://backend-587575638625.europe-west1.run.app', 'https://frontend-587575638625.europe-west1.run.app']

##########################
# USER MONITORING CONFIG #
##########################
# Number of seconds between each scan
MONITOR_SCAN_INTERVAL = 60
# Window size (in seconds) to look back for operations
MONITOR_WINDOW_SIZE = 60
# If a user does more than this many ops in the window, flag them
MONITOR_THRESHOLD = 20
