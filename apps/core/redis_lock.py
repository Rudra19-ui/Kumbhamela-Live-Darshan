from django.conf import settings
from django.core.cache import cache


def slot_lock_key(slot_id) -> str:
    return f"SLOT_LOCK:{slot_id}"


def acquire_slot_lock(slot_id, owner_id: str, timeout: int | None = None) -> bool:
    timeout = timeout or getattr(settings, "SLOT_LOCK_TIMEOUT_SECONDS", 600)
    key = slot_lock_key(slot_id)
    # Only set if not exists
    return cache.add(key, owner_id, timeout=timeout)


def release_slot_lock(slot_id, owner_id: str) -> None:
    key = slot_lock_key(slot_id)
    val = cache.get(key)
    if val == owner_id:
        cache.delete(key)


def get_slot_lock_owner(slot_id) -> str | None:
    return cache.get(slot_lock_key(slot_id))
