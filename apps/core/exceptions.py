from rest_framework.exceptions import APIException
from rest_framework import status


class ServiceUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Service temporarily unavailable."
    default_code = "service_unavailable"


class SlotLocked(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "This slot is temporarily held by another devotee."
    default_code = "slot_locked"
