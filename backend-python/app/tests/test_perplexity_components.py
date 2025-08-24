"""Tests for Perplexity research client components."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from aiohttp.client_exceptions import ClientError
from asyncio import TimeoutError

from app.core.exceptions import ExternalServiceException, RateLimitException
from app.domain.product_entities import ProductResearchItem
from app.infra.llm.perplexity_api_client import PerplexityApiClient
from app.infra.llm.perplexity_query_builder import PerplexityQueryBuilder
from app.infra.llm.perplexity_research_coordinator import PerplexityResearchCoordinator
from app.infra.llm.perplexity_response_parser import PerplexityResponseParser
from app.schemas.error_responses import ErrorCode


class TestPerplexityApiClient:
    """Test Perplexity API client functionality."""

    @pytest.fixture
    def api_client(self):
        """Create Perplexity API client."""
        return PerplexityApiClient(
            api_key="test_api_key",
            api_url="https://api.perplexity.ai",
            timeout=30
        )

    @pytest.fixture
    def sample_request_data(self):
        """Create sample API request data."""
        return {
            "model": "llama-3.1-sonar-small-128k-online",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a research assistant."
                },
                {
                    "role": "user",
                    "content": "Research iPhone 15 Pro"
                }
            ],
            "temperature": 0.2,
            "max_tokens": 4000
        }

    @pytest.mark.asyncio
    async def test_make_request_success(self, api_client, sample_request_data):
        """Test successful API request."""
        mock_response_data = {
            "choices": [
                {
                    "message": {
                        "content": "iPhone 15 Pro analysis: Premium smartphone with advanced features..."
                    }
                }
            ],
            "usage": {
                "prompt_tokens": 100,
                "completion_tokens": 500,
                "total_tokens": 600
            }
        }

        with patch('aiohttp.ClientSession.post') as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = mock_response_data
            mock_post.return_value.__aenter__.return_value = mock_response

            result = await api_client.make_request(sample_request_data)

            assert result == mock_response_data
            mock_post.assert_called_once()

    @pytest.mark.asyncio
    async def test_make_request_rate_limit(self, api_client, sample_request_data):
        """Test API request with rate limit error."""
        with patch('aiohttp.ClientSession.post') as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 429
            mock_response.json.return_value = {
                "error": {
                    "message": "Rate limit exceeded",
                    "type": "rate_limit_error"
                }
            }
            mock_post.return_value.__aenter__.return_value = mock_response

            with pytest.raises(RateLimitException) as exc_info:
                await api_client.make_request(sample_request_data)

            assert exc_info.value.error_code == ErrorCode.RATE_LIMIT_ERROR

    @pytest.mark.asyncio
    async def test_make_request_server_error(self, api_client, sample_request_data):
        """Test API request with server error."""
        with patch('aiohttp.ClientSession.post') as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 500
            mock_response.text.return_value = "Internal Server Error"
            mock_post.return_value.__aenter__.return_value = mock_response

            with pytest.raises(ExternalServiceException) as exc_info:
                await api_client.make_request(sample_request_data)

            assert exc_info.value.error_code == ErrorCode.EXTERNAL_SERVICE_ERROR

    @pytest.mark.asyncio
    async def test_make_request_timeout(self, api_client, sample_request_data):
        """Test API request with timeout."""
        with patch('aiohttp.ClientSession.post') as mock_post:
            mock_post.side_effect = TimeoutError()

            with pytest.raises(ExternalServiceException) as exc_info:
                await api_client.make_request(sample_request_data)

            assert exc_info.value.error_code == ErrorCode.TIMEOUT_ERROR

    @pytest.mark.asyncio
    async def test_make_request_network_error(self, api_client, sample_request_data):
        """Test API request with network error."""
        with patch('aiohttp.ClientSession.post') as mock_post:
            mock_post.side_effect = ClientError("Connection failed")

            with pytest.raises(ExternalServiceException) as exc_info:
                await api_client.make_request(sample_request_data)

            assert exc_info.value.error_code == ErrorCode.EXTERNAL_SERVICE_ERROR

    @pytest.mark.asyncio
    async def test_health_check_success(self, api_client):
        """Test successful health check."""
        with patch.object(api_client, 'make_request') as mock_request:
            mock_request.return_value = {
                "choices": [{"message": {"content": "Test response"}}]
            }

            is_healthy = await api_client.health_check()

            assert is_healthy is True
            mock_request.assert_called_once()

    @pytest.mark.asyncio
    async def test_health_check_failure(self, api_client):
        """Test health check failure."""
        with patch.object(api_client, 'make_request') as mock_request:
            mock_request.side_effect = ExternalServiceException(
                error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
                message="API unavailable"
            )

            is_healthy = await api_client.health_check()

            assert is_healthy is False

    def test_build_headers(self, api_client):
        """Test HTTP headers construction."""
        headers = api_client._build_headers()

        assert "Authorization" in headers
        assert headers["Authorization"] == "Bearer test_api_key"
        assert headers["Content-Type"] == "application/json"
        assert "User-Agent" in headers


class TestPerplexityQueryBuilder:
    """Test Perplexity query builder functionality."""

    @pytest.fixture
    def query_builder(self):
        """Create query builder instance."""
        return PerplexityQueryBuilder()

    @pytest.fixture
    def sample_items(self):
        """Create sample product items."""
        return [
            ProductResearchItem(
                name="iPhone 15 Pro",
                description="Latest iPhone with advanced features",
                category="Electronics",
                keywords=["smartphone", "apple", "mobile"]
            ),
            ProductResearchItem(
                name="MacBook Air M2",
                description="Lightweight laptop with M2 chip",
                category="Electronics",
                keywords=["laptop", "apple", "macbook"]
            ),
        ]

    def test_build_system_prompt(self, query_builder):
        """Test system prompt construction."""
        prompt = query_builder.build_system_prompt()

        assert isinstance(prompt, str)
        assert len(prompt) > 0
        assert "research assistant" in prompt.lower()
        assert "json" in prompt.lower()

    def test_build_batch_query(self, query_builder, sample_items):
        """Test batch query construction."""
        query = query_builder.build_batch_query(sample_items)

        assert isinstance(query, str)
        assert len(query) > 0
        assert "iPhone 15 Pro" in query
        assert "MacBook Air M2" in query
        assert "Electronics" in query

    def test_build_batch_query_empty_items(self, query_builder):
        """Test batch query with empty items."""
        query = query_builder.build_batch_query([])

        assert isinstance(query, str)
        assert "no products" in query.lower() or "empty" in query.lower()

    def test_build_single_item_query(self, query_builder, sample_items):
        """Test single item query construction."""
        query = query_builder.build_single_item_query(sample_items[0])

        assert isinstance(query, str)
        assert "iPhone 15 Pro" in query
        assert "smartphone" in query.lower()
        assert "apple" in query.lower()

    def test_format_product_info(self, query_builder, sample_items):
        """Test product information formatting."""
        formatted = query_builder._format_product_info(sample_items[0])

        assert "iPhone 15 Pro" in formatted
        assert "Latest iPhone with advanced features" in formatted
        assert "Electronics" in formatted
        assert "smartphone" in formatted

    def test_validate_items_success(self, query_builder, sample_items):
        """Test successful item validation."""
        # Should not raise any exception
        query_builder._validate_items(sample_items)

    def test_validate_items_empty_name(self, query_builder):
        """Test item validation with empty name."""
        invalid_item = ProductResearchItem(name="", category="Electronics")

        with pytest.raises(ValueError, match="Product name cannot be empty"):
            query_builder._validate_items([invalid_item])

    def test_validate_items_too_many(self, query_builder):
        """Test item validation with too many items."""
        too_many_items = [
            ProductResearchItem(name=f"Product {i}", category="Test")
            for i in range(11)  # Exceeds maximum batch size
        ]

        with pytest.raises(ValueError, match="too many products"):
            query_builder._validate_items(too_many_items)


class TestPerplexityResponseParser:
    """Test Perplexity response parser functionality."""

    @pytest.fixture
    def response_parser(self):
        """Create response parser instance."""
        return PerplexityResponseParser()

    @pytest.fixture
    def sample_api_response(self):
        """Create sample API response."""
        return {
            "choices": [
                {
                    "message": {
                        "content": json.dumps([
                            {
                                "name": "iPhone 15 Pro",
                                "analysis": "Premium smartphone with advanced camera system",
                                "market_info": {
                                    "price_range": "$999-$1199",
                                    "availability": "Available",
                                    "rating": 4.5
                                },
                                "competitors": ["Samsung Galaxy S24", "Google Pixel 8 Pro"]
                            },
                            {
                                "name": "MacBook Air M2",
                                "analysis": "Excellent performance-to-weight ratio",
                                "market_info": {
                                    "price_range": "$1099-$1499",
                                    "availability": "Available",
                                    "rating": 4.7
                                },
                                "competitors": ["Dell XPS 13", "HP Spectre x360"]
                            }
                        ])
                    }
                }
            ],
            "usage": {
                "prompt_tokens": 150,
                "completion_tokens": 800,
                "total_tokens": 950
            }
        }

    @pytest.mark.asyncio
    async def test_parse_research_response_success(self, response_parser, sample_api_response):
        """Test successful response parsing."""
        results = await response_parser.parse_research_response(sample_api_response)

        assert len(results) == 2
        assert results[0]["name"] == "iPhone 15 Pro"
        assert results[1]["name"] == "MacBook Air M2"
        assert "analysis" in results[0]
        assert "market_info" in results[0]
        assert "competitors" in results[0]

    @pytest.mark.asyncio
    async def test_parse_research_response_invalid_json(self, response_parser):
        """Test response parsing with invalid JSON."""
        invalid_response = {
            "choices": [
                {
                    "message": {
                        "content": "This is not valid JSON content"
                    }
                }
            ]
        }

        with pytest.raises(ExternalServiceException) as exc_info:
            await response_parser.parse_research_response(invalid_response)

        assert exc_info.value.error_code == ErrorCode.EXTERNAL_SERVICE_ERROR
        assert "JSON" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_parse_research_response_missing_choices(self, response_parser):
        """Test response parsing with missing choices."""
        invalid_response = {"usage": {"total_tokens": 100}}

        with pytest.raises(ExternalServiceException) as exc_info:
            await response_parser.parse_research_response(invalid_response)

        assert exc_info.value.error_code == ErrorCode.EXTERNAL_SERVICE_ERROR

    @pytest.mark.asyncio
    async def test_parse_research_response_empty_content(self, response_parser):
        """Test response parsing with empty content."""
        empty_response = {
            "choices": [
                {
                    "message": {
                        "content": ""
                    }
                }
            ]
        }

        results = await response_parser.parse_research_response(empty_response)
        assert results == []

    @pytest.mark.asyncio
    async def test_extract_usage_info(self, response_parser, sample_api_response):
        """Test usage information extraction."""
        usage = response_parser._extract_usage_info(sample_api_response)

        assert usage["prompt_tokens"] == 150
        assert usage["completion_tokens"] == 800
        assert usage["total_tokens"] == 950

    @pytest.mark.asyncio
    async def test_extract_usage_info_missing(self, response_parser):
        """Test usage information extraction when missing."""
        response_without_usage = {
            "choices": [{"message": {"content": "test"}}]
        }

        usage = response_parser._extract_usage_info(response_without_usage)

        assert usage["prompt_tokens"] == 0
        assert usage["completion_tokens"] == 0
        assert usage["total_tokens"] == 0

    def test_validate_result_structure_success(self, response_parser):
        """Test successful result structure validation."""
        valid_result = {
            "name": "iPhone 15 Pro",
            "analysis": "Premium smartphone",
            "market_info": {"price": "$999"}
        }

        # Should not raise any exception
        response_parser._validate_result_structure(valid_result)

    def test_validate_result_structure_missing_name(self, response_parser):
        """Test result structure validation with missing name."""
        invalid_result = {
            "analysis": "Premium smartphone",
            "market_info": {"price": "$999"}
        }

        with pytest.raises(ValueError, match="name"):
            response_parser._validate_result_structure(invalid_result)


class TestPerplexityResearchCoordinator:
    """Test Perplexity research coordinator functionality."""

    @pytest.fixture
    def mock_api_client(self):
        """Create mock API client."""
        return AsyncMock(spec=PerplexityApiClient)

    @pytest.fixture
    def mock_query_builder(self):
        """Create mock query builder."""
        return MagicMock(spec=PerplexityQueryBuilder)

    @pytest.fixture
    def mock_response_parser(self):
        """Create mock response parser."""
        return AsyncMock(spec=PerplexityResponseParser)

    @pytest.fixture
    def coordinator(self, mock_api_client, mock_query_builder, mock_response_parser):
        """Create coordinator with mock dependencies."""
        return PerplexityResearchCoordinator(
            api_client=mock_api_client,
            query_builder=mock_query_builder,
            response_parser=mock_response_parser
        )

    @pytest.fixture
    def sample_items(self):
        """Create sample product items."""
        return [
            ProductResearchItem(
                name="iPhone 15 Pro",
                description="Latest iPhone",
                category="Electronics"
            )
        ]

    @pytest.mark.asyncio
    async def test_research_products_success(self, coordinator, mock_api_client, mock_query_builder, mock_response_parser, sample_items):
        """Test successful product research."""
        # Setup mocks
        mock_query_builder.build_system_prompt.return_value = "System prompt"
        mock_query_builder.build_batch_query.return_value = "Batch query"

        api_response = {
            "choices": [{"message": {"content": "response"}}],
            "usage": {"total_tokens": 100}
        }
        mock_api_client.make_request.return_value = api_response

        expected_results = [{"name": "iPhone 15 Pro", "analysis": "Great phone"}]
        mock_response_parser.parse_research_response.return_value = expected_results

        # Execute research
        results = await coordinator.research_products(sample_items)

        # Assertions
        assert results == expected_results
        mock_query_builder.build_system_prompt.assert_called_once()
        mock_query_builder.build_batch_query.assert_called_once_with(sample_items)
        mock_api_client.make_request.assert_called_once()
        mock_response_parser.parse_research_response.assert_called_once_with(api_response)

    @pytest.mark.asyncio
    async def test_research_products_api_failure(self, coordinator, mock_api_client, mock_query_builder, sample_items):
        """Test product research with API failure."""
        # Setup mocks
        mock_query_builder.build_system_prompt.return_value = "System prompt"
        mock_query_builder.build_batch_query.return_value = "Batch query"
        mock_api_client.make_request.side_effect = ExternalServiceException(
            error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
            message="API failed"
        )

        # Should propagate the exception
        with pytest.raises(ExternalServiceException):
            await coordinator.research_products(sample_items)

    @pytest.mark.asyncio
    async def test_research_products_empty_items(self, coordinator, mock_query_builder, mock_response_parser):
        """Test product research with empty items."""
        mock_query_builder.build_batch_query.return_value = "Empty query"
        mock_response_parser.parse_research_response.return_value = []

        results = await coordinator.research_products([])

        assert results == []

    @pytest.mark.asyncio
    async def test_health_check_success(self, coordinator, mock_api_client):
        """Test successful health check."""
        mock_api_client.health_check.return_value = True

        is_healthy = await coordinator.health_check()

        assert is_healthy is True
        mock_api_client.health_check.assert_called_once()

    @pytest.mark.asyncio
    async def test_health_check_failure(self, coordinator, mock_api_client):
        """Test health check failure."""
        mock_api_client.health_check.return_value = False

        is_healthy = await coordinator.health_check()

        assert is_healthy is False

    def test_validate_batch_size_success(self, coordinator, sample_items):
        """Test successful batch size validation."""
        # Should not raise any exception
        coordinator._validate_batch_size(sample_items)

    def test_validate_batch_size_empty(self, coordinator):
        """Test batch size validation with empty items."""
        with pytest.raises(ValueError, match="at least one item"):
            coordinator._validate_batch_size([])

    def test_validate_batch_size_too_large(self, coordinator):
        """Test batch size validation with too many items."""
        large_batch = [
            ProductResearchItem(name=f"Product {i}", category="Test")
            for i in range(11)
        ]

        with pytest.raises(ValueError, match="maximum batch size"):
            coordinator._validate_batch_size(large_batch)

    def test_build_request_payload(self, coordinator, mock_query_builder):
        """Test request payload construction."""
        mock_query_builder.build_system_prompt.return_value = "System prompt"
        mock_query_builder.build_batch_query.return_value = "User query"

        payload = coordinator._build_request_payload("System prompt", "User query")

        assert payload["model"] == "llama-3.1-sonar-small-128k-online"
        assert len(payload["messages"]) == 2
        assert payload["messages"][0]["role"] == "system"
        assert payload["messages"][1]["role"] == "user"
        assert payload["temperature"] == 0.2
        assert payload["max_tokens"] == 4000
