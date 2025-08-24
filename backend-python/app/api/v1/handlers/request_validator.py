"""Request validation and transformation for API endpoints.

This module handles input validation and converts between API schemas and domain entities,
following the Single Responsibility Principle by focusing solely on request processing.
"""

from typing import Any, Dict, List
from uuid import UUID

from pydantic import ValidationError as PydanticValidationError

from app.core.exceptions import ValidationDomainException
from app.core.logging import get_logger
from app.domain.product_entities import ProductResearchItem
from app.schemas.error_responses import ErrorCode, ValidationErrorDetail
from app.schemas.product_research_in import ProductResearchRequest

logger = get_logger(__name__)


class RequestValidator:
    """Validates and transforms API requests into domain entities.

    Responsibilities:
    - Validate request data structure and content
    - Transform API schemas to domain entities
    - Handle validation errors with detailed feedback
    - Enforce business rules at the request level
    """

    def validate_product_research_request(
        self, request: ProductResearchRequest
    ) -> List[ProductResearchItem]:
        """Validate product research request and convert to domain entities.

        Args:
            request: API request containing product research data

        Returns:
            List of validated ProductResearchItem domain entities

        Raises:
            ValidationDomainException: When validation fails with detailed errors
        """
        validation_errors = []

        # Validate batch size
        if len(request.items) == 0:
            validation_errors.append(
                ValidationErrorDetail(
                    field="items",
                    message="최소 1개 이상의 제품을 입력해야 합니다.",
                    invalid_value=len(request.items),
                )
            )

        if len(request.items) > 10:
            validation_errors.append(
                ValidationErrorDetail(
                    field="items",
                    message="최대 10개까지의 제품만 처리할 수 있습니다.",
                    invalid_value=len(request.items),
                )
            )

        # If basic validation fails, raise early
        if validation_errors:
            raise ValidationDomainException(
                validation_errors=validation_errors,
                details=f"Request validation failed for {len(validation_errors)} field(s)",
            )

        # Convert and validate individual items
        domain_items = []
        for i, item in enumerate(request.items):
            try:
                domain_item = ProductResearchItem(
                    product_name=item.product_name,
                    category=item.category,
                    price_exact=item.price_exact,
                    currency=item.currency,
                    seller_or_store=item.seller_or_store,
                    metadata=item.metadata or {},
                )
                domain_items.append(domain_item)
            except Exception as e:
                validation_errors.append(
                    ValidationErrorDetail(
                        field=f"items[{i}]",
                        message=f"Invalid product item: {str(e)}",
                        invalid_value=item.model_dump() if hasattr(item, "model_dump") else str(item),
                    )
                )

        # Raise validation errors if any items failed
        if validation_errors:
            raise ValidationDomainException(
                validation_errors=validation_errors,
                details=f"Product item validation failed for {len(validation_errors)} item(s)",
            )

        return domain_items

    def validate_uuid_parameter(self, uuid_str: str, parameter_name: str = "id") -> UUID:
        """Validate and convert UUID string parameter.

        Args:
            uuid_str: UUID string to validate
            parameter_name: Name of the parameter for error reporting

        Returns:
            Validated UUID object

        Raises:
            ValidationDomainException: When UUID format is invalid
        """
        try:
            return UUID(uuid_str)
        except ValueError:
            raise ValidationDomainException(
                validation_errors=[
                    ValidationErrorDetail(
                        field=parameter_name,
                        message=f"Invalid UUID format: {uuid_str}",
                        invalid_value=uuid_str,
                    )
                ],
                details=f"UUID validation failed for parameter '{parameter_name}'",
            )

    def validate_query_parameters(
        self, parameters: Dict[str, Any], allowed_params: Dict[str, type]
    ) -> Dict[str, Any]:
        """Validate query parameters against allowed types.

        Args:
            parameters: Dictionary of query parameters
            allowed_params: Dictionary mapping parameter names to expected types

        Returns:
            Dictionary of validated parameters

        Raises:
            ValidationDomainException: When parameter validation fails
        """
        validation_errors = []
        validated_params = {}

        for param_name, param_value in parameters.items():
            if param_name not in allowed_params:
                validation_errors.append(
                    ValidationErrorDetail(
                        field=param_name,
                        message=f"Unknown query parameter: {param_name}",
                        invalid_value=param_value,
                    )
                )
                continue

            expected_type = allowed_params[param_name]

            try:
                if expected_type == bool and isinstance(param_value, str):
                    # Handle string boolean conversion
                    validated_params[param_name] = param_value.lower() in ("true", "1", "yes")
                elif expected_type == int and isinstance(param_value, str):
                    validated_params[param_name] = int(param_value)
                elif expected_type == float and isinstance(param_value, str):
                    validated_params[param_name] = float(param_value)
                else:
                    validated_params[param_name] = expected_type(param_value)
            except (ValueError, TypeError) as e:
                validation_errors.append(
                    ValidationErrorDetail(
                        field=param_name,
                        message=f"Invalid {expected_type.__name__} value: {param_value}",
                        invalid_value=param_value,
                    )
                )

        if validation_errors:
            raise ValidationDomainException(
                validation_errors=validation_errors,
                details=f"Query parameter validation failed for {len(validation_errors)} parameter(s)",
            )

        return validated_params

    def handle_pydantic_validation_error(self, error: PydanticValidationError) -> ValidationDomainException:
        """Convert Pydantic validation error to domain exception.

        Args:
            error: Pydantic validation error

        Returns:
            ValidationDomainException with structured error details
        """
        validation_errors = []

        for pydantic_error in error.errors():
            field_name = ".".join(str(loc) for loc in pydantic_error["loc"])
            validation_errors.append(
                ValidationErrorDetail(
                    field=field_name,
                    message=pydantic_error["msg"],
                    invalid_value=pydantic_error.get("input"),
                )
            )

        return ValidationDomainException(
            validation_errors=validation_errors,
            details=f"Pydantic validation failed for {len(validation_errors)} field(s)",
        )


# Singleton instance for global use
_validator: RequestValidator = None


def get_request_validator() -> RequestValidator:
    """Get the global request validator instance.

    Returns:
        RequestValidator instance
    """
    global _validator
    if _validator is None:
        _validator = RequestValidator()
    return _validator