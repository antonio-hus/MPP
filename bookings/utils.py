###########################
##    IMPORTS SECTION    ##
###########################
# Python Libraries
from functools import wraps

from django.contrib.auth import get_user_model

# Project Libraries
from bookings.models import OperationLog


###########################
##   CONSTANTS SECTION   ##
###########################
BookingUser = get_user_model()

_METHOD_TO_ACTION = {
    'GET':     'RETRIEVE',
    'POST':    'CREATE',
    'PUT':     'UPDATE',
    'PATCH':   'UPDATE',
    'DELETE':  'DELETE',
    'HEAD':    'LIST',
}


###########################
##  DECORATORS  SECTION  ##
###########################
def log_crud(model_name):
    def decorator(func):
        @wraps(func)
        def wrapped(request, *args, **kwargs):
            response = func(request, *args, **kwargs)

            if 200 <= getattr(response, 'status_code', 0) < 300:
                method = request.method.upper()
                if method == 'GET':
                    if 'pk' in kwargs:
                        action = 'RETRIEVE'
                        obj_id = kwargs['pk']
                    else:
                        action = 'LIST'
                        obj_id = 'ALL'
                elif method in ('PUT', 'PATCH'):
                    action = 'UPDATE'
                    obj_id = kwargs.get('pk') or response.data.get('id')
                elif method == 'DELETE':
                    action = 'DELETE'
                    obj_id = kwargs.get('pk')
                elif method == 'POST':
                    action = 'CREATE'
                    obj_id = response.data.get('id')
                elif method == 'HEAD':
                    action = 'LIST'
                    obj_id = 'ALL'
                else:
                    action = 'RETRIEVE'
                    obj_id = kwargs.get('pk')

                if request.user.is_authenticated and isinstance(request.user, BookingUser):
                    OperationLog.objects.create(
                        user=request.user,
                        model=model_name,
                        object_id=str(obj_id) if obj_id else '',
                        action=action
                    )

            return response
        return wrapped
    return decorator



###########################
##   FUNCTIONS SECTION   ##
###########################
