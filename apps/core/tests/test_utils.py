import uuid

import pytest

from apps.core.utils import qr_payload, verify_qr_payload


@pytest.mark.django_db
def test_qr_roundtrip(settings):
    settings.QR_HMAC_SECRET = "test-secret"
    bid = str(uuid.uuid4())
    payload = qr_payload(bid)
    assert verify_qr_payload(payload) == bid


def test_qr_invalid():
    assert verify_qr_payload("not-a-valid-payload") is None
