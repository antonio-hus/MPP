###################
# IMPORTS SECTION #
###################
from pathlib import Path

##################
# BASE DIRECTORY #
##################
BASE_DIR = Path(__file__).resolve().parent.parent

#####################
# SECURITY SETTINGS #
#####################
SECRET_KEY = "django-insecure-m&h=3n9*^+gco0zd4$8j2&oa0^^)w+efuh!v488r-mytixwi67"
DEBUG = True
ALLOWED_HOSTS = []

################
# APPLICATIONS #
################
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "bookings"
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

#################
# URLS AND WSGI #
#################
ROOT_URLCONF = "MPP.urls"
WSGI_APPLICATION = "MPP.wsgi.application"

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
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
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
STATIC_URL = "static/"

##########################
# CORS AND CSRF SETTINGS #
##########################
CORS_ALLOW_ALL_ORIGINS = True
