# Research Backend

A modern Python backend built with Clean Architecture and Layered Architecture patterns, featuring FastAPI, SQLAlchemy, Celery, and Perplexity AI integration for research automation.

## 🏗️ Architecture

This project follows Clean Architecture principles with clear separation of concerns:

```
backend-v2/
├── app/
│   ├── core/           # 🔧 Configuration & Logging
│   ├── domain/         # 🎯 Pure Business Logic (Framework Independent)
│   ├── infra/          # 🔌 External Adapters (DB, LLM, Tasks)
│   ├── services/       # 🎭 Orchestration Layer
│   ├── api/            # 🌐 REST API Controllers
│   ├── schemas/        # 📝 Data Transfer Objects
│   ├── utils/          # 🛠️ Utility Functions
│   └── tests/          # 🧪 Test Suite
├── alembic/            # 📊 Database Migrations
└── docker-compose.yml  # 🐳 Local Development Environment
```

### Layer Responsibilities

- **Domain Layer**: Pure business entities and rules (no framework dependencies)
- **Infrastructure Layer**: Database, external APIs, task queue implementations
- **Service Layer**: Orchestrates domain logic with infrastructure
- **API Layer**: HTTP endpoints and request/response handling
- **Core Layer**: Cross-cutting concerns (config, logging)

## 🚀 Features

- **Research Automation**: Batch research processing using Perplexity AI
- **Async Processing**: Celery-based background tasks with Redis
- **Clean Architecture**: Testable, maintainable, and framework-independent domain logic
- **Type Safety**: Full typing with Pydantic validation
- **Database**: PostgreSQL with async SQLAlchemy and Alembic migrations
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Monitoring**: Structured logging and health checks

## 🛠️ Tech Stack

- **Framework**: FastAPI 0.109+
- **Database**: PostgreSQL 16 with asyncpg
- **ORM**: SQLAlchemy 2.0 (async)
- **Task Queue**: Celery with Redis
- **AI Integration**: Perplexity AI API
- **Validation**: Pydantic 2.0
- **Migrations**: Alembic
- **Testing**: pytest with async support
- **Code Quality**: Black, Ruff, MyPy

## 📋 Prerequisites

- Python 3.11+
- Poetry (for dependency management)
- Docker & Docker Compose (for local services)
- PostgreSQL 16
- Redis 7

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd backend-v2
cp .env.example .env
# Edit .env with your configuration
```

### 2. Install Dependencies

```bash
poetry install
poetry shell
```

### 3. Start Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Wait for services to be ready
docker-compose ps
```

### 4. Database Setup

```bash
# Create and run migrations
alembic upgrade head
```

### 5. Start Application

```bash
# Development server
python app/main.py

# Or with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Start Celery Worker

```bash
# In a separate terminal
celery -A app.infra.tasks.celery_app worker --loglevel=info
```

### 7. API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

## 📖 API Usage

### Create Research Job

```bash
curl -X POST "http://localhost:8000/api/v1/research/jobs" \
     -H "Content-Type: application/json" \
     -d '{
       "items": [
         {
           "name": "iPhone 15 Pro",
           "price": 999.99,
           "category": "Electronics"
         },
         {
           "name": "Samsung Galaxy S24",
           "price": 899.99,
           "category": "Electronics"
         }
       ],
       "metadata": {
         "priority": "high"
       }
     }'
```

### Start Research Job

```bash
curl -X POST "http://localhost:8000/api/v1/research/jobs/{job_id}/start"
```

### Check Job Status

```bash
curl "http://localhost:8000/api/v1/research/jobs/{job_id}"
```

### Monitor Task Progress

```bash
curl "http://localhost:8000/api/v1/research/tasks/{task_id}/status"
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/test_research.py

# Run with verbose output
pytest -v
```

## 🔧 Configuration

Key environment variables in `.env`:

```bash
# Application
APP_ENV=development
DEBUG=true

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/research_db

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/2

# Perplexity API
PERPLEXITY_API_KEY=your_api_key_here

# Research Settings
MAX_BATCH_SIZE=10
MAX_CONCURRENT_REQUESTS=5
```

## 📊 Database Schema

The system uses three main entities:

- **ResearchJob**: Manages batch research operations
- **Item**: Individual products to research
- **Result**: Research results for each item

## 🎯 Business Rules

- Maximum batch size: 10 items
- Automatic deduplication based on item hash
- Exponential backoff for failed requests
- Job priority scoring based on size and metadata

## 🔄 Task Processing

1. **Job Creation**: Validate items and create database records
2. **Task Dispatch**: Queue Celery task for async processing
3. **Research Execution**: Call Perplexity API for each item
4. **Result Storage**: Save research results to database
5. **Job Completion**: Update job status and statistics

## 📝 Development

### Code Style

```bash
# Format code
black app/
ruff --fix app/

# Type checking
mypy app/
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Adding New Features

1. Define domain entities in `app/domain/entities.py`
2. Add business rules in `app/domain/usecases.py`
3. Implement infrastructure adapters in `app/infra/`
4. Create service orchestration in `app/services/`
5. Add API endpoints in `app/api/v1/endpoints/`
6. Write tests in `app/tests/`

## 🚦 Health Checks

- **API Health**: `GET /api/v1/health`
- **Database**: Connection and migration status
- **Redis**: Connectivity and queue status
- **Celery**: Worker status and task processing

## 📈 Monitoring

The application provides structured JSON logging with:

- Request/response logging
- Performance metrics
- Error tracking
- Task progress monitoring

## 🔒 Security

- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- API rate limiting ready
- Environment-based configuration
- No secrets in code

## 🤝 Contributing

1. Follow Clean Architecture principles
2. Maintain test coverage above 80%
3. Use type hints everywhere
4. Follow conventional commits
5. Update documentation

## 📚 Further Reading

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Celery User Guide](https://docs.celeryq.dev/en/stable/userguide/)

## 📄 License

This project is licensed under the MIT License.