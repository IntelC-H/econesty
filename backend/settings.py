"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 1.11.1.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = True

_DEBUG_SECRET_KEY = '#tqu#1=+6)nyncev1$_i25*od)^^o!=bbfuav!@k2u7$#!1*+n'
SECRET_KEY = os.environ.get('SECRET_KEY', None) or _DEBUG_SECRET_KEY if not DEBUG else _DEBUG_SECRET_KEY

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]'] if not DEBUG else ["*"]

# Application definition

REST_FRAMEWORK = {
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
    'DEFAULT_AUTHENTICATION_CLASSES': [], # handled app-wide by middleware
    'DEFAULT_PERMISSION_CLASSES': [],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'PAGE_SIZE': 10
}

if DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append('rest_framework.renderers.BrowsableAPIRenderer');
    REST_FRAMEWORK["DEFAULT_PARSER_CLASSES"].append('rest_framework.parsers.FormParser');
    REST_FRAMEWORK["DEFAULT_PARSER_CLASSES"].append('rest_framework.parsers.MultiPartParser');

INSTALLED_APPS = [
    'backend.api',
    'rest_framework',
    'safedelete',
    'corsheaders',
    'django.contrib.staticfiles',
    'django_filters',
    'django.contrib.auth',
    'django.contrib.contenttypes'
]

MIDDLEWARE = [
    'backend.api.middleware.AppendSlashNoRedirect',
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.http.ConditionalGetMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'backend.api.middleware.ResetAuth',
    'backend.api.middleware.TokenAuth',
    'backend.api.middleware.RewriteMeToUserID',
]

CORS_URLS_REGEX = r'^/api.*$'
CORS_ORIGIN_ALLOW_ALL = True
CORS_ORIGIN_WHITELIST = (
    'localhost:8000',
    '127.0.0.1:9000'
)

X_FRAME_OPTIONS = 'DENY'
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True

SECURE_SSL_REDIRECT = False # TODO: config this

ROOT_URLCONF = 'backend.urls'

APPEND_SLASH = False

WSGI_APPLICATION = 'backend.wsgi.application'

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'econesty',
        'USER': 'econesty',
        'PASSWORD': 'econesty',
        'HOST': 'localhost',
        'PORT': '',
    }
}

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.BCryptPasswordHasher'
]

# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        },
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# REST API Config

API_ROOT = r'^api/'

# Frontend config

with open(os.path.join(BASE_DIR, 'package.json')) as file:
    pkg = json.load(file)

FRONTEND_PATH = os.path.join(BASE_DIR, pkg["files"])
STATIC_URL = "/static/"
