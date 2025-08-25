# Makefile for Research Backend - Docker Development Environment
# Cross-platform development commands

.PHONY: help setup build start stop restart status logs shell test clean format lint migrate health

# Default target
help: ## Show this help message
	@echo "Research Backend - Docker Development Environment"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Environment Setup
setup: ## Initial project setup - build images, install dependencies, migrate DB
	@echo "🚀 Setting up development environment..."
	docker-compose build --no-cache
	docker-compose run --rm app poetry install
	docker-compose up -d postgres redis
	@echo "⏳ Waiting for database to be ready..."
	sleep 10
	docker-compose run --rm app poetry run alembic upgrade head
	@echo "✅ Environment setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  make start    # Start development environment"
	@echo "  make logs     # View logs"

build: ## Build Docker images
	@echo "🔨 Building Docker images..."
	docker-compose build

# Development Lifecycle
start: ## Start development environment (all services)
	@echo "🏃 Starting development environment..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	sleep 5
	@make health
	@echo ""
	@echo "🌐 Services available at:"
	@echo "  • API Server:     http://localhost:8000"
	@echo "  • API Docs:       http://localhost:8000/docs"
	@echo "  • pgAdmin:        http://localhost:5050"
	@echo ""
	@echo "📊 Useful commands:"
	@echo "  make logs       # View logs"
	@echo "  make shell      # Access app container"
	@echo "  make test       # Run tests"
	@echo "  make stop       # Stop all services"

stop: ## Stop all services
	@echo "🛑 Stopping all services..."
	docker-compose down

restart: ## Restart all services
	@echo "🔄 Restarting all services..."
	docker-compose restart

status: ## Show running containers status
	@echo "📊 Container Status:"
	docker-compose ps

logs: ## View logs (all services)
	docker-compose logs -f

logs-app: ## View application logs only
	docker-compose logs -f app

# Container Access
shell: ## Access app container shell
	@echo "🐚 Accessing app container..."
	docker-compose exec app bash

shell-postgres: ## Access PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d research_db

shell-redis: ## Access Redis CLI
	docker-compose exec redis redis-cli

# Development Tools
test: ## Run all tests
	@echo "🧪 Running tests..."
	docker-compose exec app poetry run pytest

test-cov: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	docker-compose exec app poetry run pytest --cov=app --cov-report=html

lint: ## Run code linting and formatting
	@echo "🔍 Running linters..."
	docker-compose exec app poetry run ruff --fix app/
	docker-compose exec app poetry run black app/
	docker-compose exec app poetry run mypy app/

format: ## Format code
	@echo "💅 Formatting code..."
	docker-compose exec app poetry run black app/

# Database Management
migrate: ## Run database migrations
	@echo "🔄 Running database migrations..."
	docker-compose exec app poetry run alembic upgrade head

migrate-create: ## Create new migration (usage: make migrate-create name="description")
	@echo "📝 Creating new migration: $(name)"
	docker-compose exec app poetry run alembic revision --autogenerate -m "$(name)"

migrate-rollback: ## Rollback last migration
	@echo "↩️  Rolling back last migration..."
	docker-compose exec app poetry run alembic downgrade -1

# Health Checks
health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@echo "Database:" 
	@docker-compose exec postgres pg_isready -U postgres || echo "❌ Database not ready"
	@echo "Redis:"
	@docker-compose exec redis redis-cli ping || echo "❌ Redis not ready"
	@echo "App:"
	@curl -sf http://localhost:8000/api/v1/health > /dev/null && echo "✅ App healthy" || echo "❌ App not ready"

# Cleanup
clean: ## Remove all containers, images, and volumes (DESTRUCTIVE)
	@echo "🧹 Cleaning up Docker resources..."
	@read -p "This will remove all containers, images, and volumes. Continue? [y/N]: " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v --rmi all
	docker system prune -a -f --volumes

clean-data: ## Remove only data volumes (keeps images)
	@echo "🗑️  Removing data volumes..."
	@read -p "This will delete all database data. Continue? [y/N]: " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v

# Production Commands
build-prod: ## Build production image
	@echo "🏭 Building production image..."
	docker build --target production -t research-backend:latest .

# Development Utilities
install: ## Install new dependency (usage: make install pkg="package-name")
	@echo "📦 Installing $(pkg)..."
	docker-compose exec app poetry add $(pkg)
	docker-compose restart app

install-dev: ## Install new dev dependency (usage: make install-dev pkg="package-name")
	@echo "📦 Installing dev dependency $(pkg)..."
	docker-compose exec app poetry add --group dev $(pkg)

update: ## Update all dependencies
	@echo "🔄 Updating dependencies..."
	docker-compose exec app poetry update
	docker-compose restart app

# Quick Commands for Daily Development
dev: start ## Alias for start
run: start ## Alias for start

# Environment Information
info: ## Show environment information
	@echo "🔍 Environment Information:"
	@echo "Docker Version: $$(docker --version)"
	@echo "Docker Compose Version: $$(docker-compose --version)"
	@echo ""
	@docker-compose exec app poetry --version 2>/dev/null || echo "App container not running"
	@docker-compose exec app python --version 2>/dev/null || echo "App container not running"