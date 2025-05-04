###################
# IMPORTS SECTION #
###################
from .settings import *


#####################
# DATABASE SETTINGS #
#####################
# override the default DATABASES setting:
DATABASES['default']['NAME'] = BASE_DIR / 'db_loadtest.sqlite3'
