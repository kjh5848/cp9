"""Utility functions for hashing items."""

import hashlib
from typing import Any, Dict

from app.domain.entities import Item


def calculate_item_hash(item: Item) -> str:
    """Calculate a unique hash for an item.

    Args:
        item: Item entity

    Returns:
        SHA-256 hash of the item
    """
    # Create a consistent string representation of the item
    hash_data = {
        "name": item.name.lower().strip(),
        "price": round(item.price, 2),  # Round to 2 decimal places for consistency
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