"""
아이템 해싱 유틸리티 함수 모듈.

이 모듈은 아이템 및 데이터의 고유한 해시값을 생성하는 함수들을 제공합니다.
중복 검사, 데이터 무결성 확인, 캐싱 키 생성 등에 사용됩니다.
"""

import hashlib
from typing import Any, Dict

from app.domain.entities import Item


def calculate_item_hash(item: Item) -> str:
    """
    아이템의 고유한 해시값을 계산합니다.

    아이템의 제품명, 가격, 카테고리를 기반으로 SHA-256 해시를 생성합니다.
    동일한 아이템은 항상 동일한 해시값을 가지도록 정규화를 수행합니다.

    Args:
        item: Item 엔티티 객체

    Returns:
        str: 아이템의 SHA-256 해시값 (64자 16진수 문자열)
    """
    # Create a consistent string representation of the item
    hash_data = {
        "name": item.product_name.lower().strip(),
        "price": round(item.price_exact, 2),  # Round to 2 decimal places for consistency
        "category": item.category.lower().strip() if item.category else None,
    }

    # Convert to sorted string for consistent hashing
    hash_string = _dict_to_string(hash_data)

    # Generate SHA-256 hash
    return hashlib.sha256(hash_string.encode("utf-8")).hexdigest()


def calculate_dict_hash(data: Dict[str, Any]) -> str:
    """Calculate hash for a dictionary.

    Args:
        data: Dictionary to hash

    Returns:
        SHA-256 hash of the dictionary
    """
    hash_string = _dict_to_string(data)
    return hashlib.sha256(hash_string.encode("utf-8")).hexdigest()


def _dict_to_string(data: Dict[str, Any]) -> str:
    """Convert dictionary to consistent string representation.

    Args:
        data: Dictionary to convert

    Returns:
        String representation
    """
    # Sort keys for consistent ordering
    sorted_items = []
    for key in sorted(data.keys()):
        value = data[key]
        if value is None:
            continue

        # Handle different types
        if isinstance(value, str):
            sorted_items.append(f"{key}:{value}")
        elif isinstance(value, (int, float)):
            sorted_items.append(f"{key}:{value}")
        elif isinstance(value, dict):
            # Recursively handle nested dictionaries
            nested_string = _dict_to_string(value)
            sorted_items.append(f"{key}:{nested_string}")
        elif isinstance(value, list):
            # Handle lists by sorting if possible
            try:
                sorted_list = sorted(value)
                sorted_items.append(f"{key}:{sorted_list}")
            except TypeError:
                # If items can't be sorted, use as-is
                sorted_items.append(f"{key}:{value}")
        else:
            sorted_items.append(f"{key}:{value}")

    return "|".join(sorted_items)


def verify_item_hash(item: Item, expected_hash: str) -> bool:
    """Verify if an item's hash matches the expected value.

    Args:
        item: Item entity
        expected_hash: Expected hash value

    Returns:
        True if hash matches, False otherwise
    """
    calculated_hash = calculate_item_hash(item)
    return calculated_hash == expected_hash


def generate_batch_hash(items: list) -> str:
    """Generate a hash for a batch of items.

    Args:
        items: List of items (can be Item entities or dictionaries)

    Returns:
        SHA-256 hash of the batch
    """
    batch_hashes = []

    for item in items:
        if isinstance(item, Item):
            item_hash = calculate_item_hash(item)
        elif isinstance(item, dict):
            item_hash = calculate_dict_hash(item)
        else:
            # Convert to string and hash
            item_hash = hashlib.sha256(str(item).encode("utf-8")).hexdigest()

        batch_hashes.append(item_hash)

    # Sort hashes for consistent batch ordering
    batch_hashes.sort()

    # Create final hash from all item hashes
    combined_string = "|".join(batch_hashes)
    return hashlib.sha256(combined_string.encode("utf-8")).hexdigest()
