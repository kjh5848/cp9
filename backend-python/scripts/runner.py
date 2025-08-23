"""통합 실행 스크립트 - Poetry Scripts 시스템."""

import asyncio
import json
import os
import signal
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

# 컬러 출력을 위한 ANSI 코드
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    RESET = '\033[0m'

def print_colored(message: str, color: str = Colors.WHITE) -> None:
    """컬러 메시지 출력"""
    print(f"{color}{message}{Colors.RESET}")

def print_step(step: str, message: str) -> None:
    """단계별 진행 상황 출력"""
    print_colored(f"[{step}] {message}", Colors.CYAN)

def run_command(command: str, cwd: Optional[Path] = None, check: bool = True) -> subprocess.CompletedProcess:
    """명령어 실행"""
    print_colored(f"  → {command}", Colors.YELLOW)
    try:
        result = subprocess.run(
            command.split(),
            cwd=cwd,
            capture_output=True,
            text=True,
            check=check
        )
        if result.stdout.strip():
            print_colored(f"    {result.stdout.strip()}", Colors.GREEN)
        return result
    except subprocess.CalledProcessError as e:
        print_colored(f"    Error: {e.stderr.strip()}", Colors.RED)
        raise

def check_docker_running() -> bool:
    """Docker 실행 상태 확인"""
    try:
        result = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False

def wait_for_service(host: str, port: int, timeout: int = 30) -> bool:
    """서비스가 준비될 때까지 대기"""
    import socket
    
    print_colored(f"    Waiting for {host}:{port}...", Colors.YELLOW)
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection((host, port), timeout=1):
                print_colored(f"    ✓ {host}:{port} is ready", Colors.GREEN)
                return True
        except (socket.timeout, ConnectionRefusedError):
            time.sleep(1)
    
    print_colored(f"    ✗ {host}:{port} not ready after {timeout}s", Colors.RED)
    return False

def create_env_file() -> None:
    """환경변수 파일 생성"""
    env_path = Path(".env.local")
    
    if env_path.exists():
        print_colored("    .env.local already exists", Colors.GREEN)
        return
    
    env_template = """# 애플리케이션
APP_ENV=development
DEBUG=true
API_V1_PREFIX=/api/v1

# 데이터베이스
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/research_db
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_PRE_PING=true

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/2
CELERY_RESULT_BACKEND=redis://localhost:6379/3

# Perplexity API 설정 (여기에 실제 API 키를 입력하세요)
PERPLEXITY_API_KEY=pplx-your-api-key-here
PERPLEXITY_API_URL=https://api.perplexity.ai
PERPLEXITY_MODEL=sonar-pro

# 제품 리서치 설정
MAX_RESEARCH_BATCH_SIZE=10
DEFAULT_RESEARCH_BATCH_SIZE=5
MIN_RESEARCH_BATCH_SIZE=1
MAX_CONCURRENT_REQUESTS=5
REQUEST_TIMEOUT=60
RETRY_MAX_ATTEMPTS=3
RETRY_BASE_DELAY=1
RETRY_BACKOFF_MULTIPLIER=2

# 통화 지원
SUPPORTED_CURRENCIES=KRW,USD,JPY,EUR
DEFAULT_CURRENCY=KRW
"""
    
    env_path.write_text(env_template, encoding='utf-8')
    print_colored(f"    ✓ Created {env_path}", Colors.GREEN)
    print_colored(f"    ⚠️  Please edit {env_path} and add your Perplexity API key", Colors.YELLOW)

def setup_project() -> None:
    """프로젝트 초기 설정"""
    print_colored(f"\n{Colors.BOLD}🚀 Setting up project...{Colors.RESET}", Colors.BLUE)
    
    # 1. 환경변수 파일 생성
    print_step("1/4", "Creating environment file")
    create_env_file()
    
    # 2. Docker 확인 및 서비스 시작
    print_step("2/4", "Starting Docker services")
    if not check_docker_running():
        print_colored("    ✗ Docker is not running. Please start Docker first.", Colors.RED)
        sys.exit(1)
    
    run_command("docker-compose up -d postgres redis")
    
    # 3. 서비스 대기
    print_step("3/4", "Waiting for services to be ready")
    if not wait_for_service("localhost", 5432):
        print_colored("    ✗ PostgreSQL not ready", Colors.RED)
        sys.exit(1)
    if not wait_for_service("localhost", 6379):
        print_colored("    ✗ Redis not ready", Colors.RED)
        sys.exit(1)
    
    # 4. 데이터베이스 마이그레이션
    print_step("4/4", "Running database migrations")
    run_command("alembic upgrade head")
    
    print_colored(f"\n{Colors.BOLD}✅ Setup complete!{Colors.RESET}", Colors.GREEN)
    print_colored("    Next steps:", Colors.WHITE)
    print_colored("      1. Edit .env.local and add your Perplexity API key", Colors.YELLOW)
    print_colored("      2. Run: poetry run dev", Colors.CYAN)

def start_all() -> None:
    """모든 서비스 시작"""
    print_colored(f"\n{Colors.BOLD}🚀 Starting development environment...{Colors.RESET}", Colors.BLUE)
    
    # 1. Docker 서비스 확인/시작
    print_step("1/5", "Checking Docker services")
    if not check_docker_running():
        print_colored("    ✗ Docker is not running. Please start Docker first.", Colors.RED)
        sys.exit(1)
    
    run_command("docker-compose up -d postgres redis")
    
    # 2. 서비스 대기
    print_step("2/5", "Waiting for services")
    wait_for_service("localhost", 5432)
    wait_for_service("localhost", 6379)
    
    # 3. 데이터베이스 마이그레이션 (필요시)
    print_step("3/5", "Checking database migrations")
    run_command("alembic upgrade head")
    
    # 4. Celery worker 백그라운드 시작
    print_step("4/5", "Starting Celery worker")
    worker_cmd = [
        sys.executable, "-m", "celery", 
        "-A", "app.infra.tasks.celery_app", 
        "worker", "--loglevel=info"
    ]
    
    # PID 파일에 프로세스 정보 저장
    pid_file = Path(".celery_worker.pid")
    try:
        worker_process = subprocess.Popen(
            worker_cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        pid_file.write_text(str(worker_process.pid))
        print_colored(f"    ✓ Celery worker started (PID: {worker_process.pid})", Colors.GREEN)
    except Exception as e:
        print_colored(f"    ⚠️  Could not start Celery worker: {e}", Colors.YELLOW)
    
    # 5. FastAPI 서버 시작
    print_step("5/5", "Starting FastAPI server")
    print_colored(f"\n{Colors.BOLD}🎉 Development server starting...{Colors.RESET}", Colors.GREEN)
    print_colored("    API Server: http://localhost:8000", Colors.CYAN)
    print_colored("    Swagger UI: http://localhost:8000/docs", Colors.CYAN)
    print_colored("    Press Ctrl+C to stop all services", Colors.YELLOW)
    
    # FastAPI 서버를 foreground에서 실행
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--reload", 
            "--host", "0.0.0.0",
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        print_colored(f"\n\n{Colors.BOLD}🛑 Shutting down services...{Colors.RESET}", Colors.YELLOW)
        stop_all()

def stop_all() -> None:
    """모든 서비스 중지"""
    print_colored(f"\n{Colors.BOLD}🛑 Stopping all services...{Colors.RESET}", Colors.YELLOW)
    
    # 1. Celery worker 종료
    print_step("1/3", "Stopping Celery worker")
    pid_file = Path(".celery_worker.pid")
    if pid_file.exists():
        try:
            pid = int(pid_file.read_text().strip())
            os.kill(pid, signal.SIGTERM)
            pid_file.unlink()
            print_colored(f"    ✓ Celery worker stopped (PID: {pid})", Colors.GREEN)
        except (ValueError, ProcessLookupError, OSError) as e:
            print_colored(f"    ⚠️  Could not stop Celery worker: {e}", Colors.YELLOW)
    
    # 2. FastAPI 서버는 Ctrl+C로 이미 종료됨
    print_step("2/3", "FastAPI server stopped")
    
    # 3. Docker 서비스 정리 (선택적)
    print_step("3/3", "Docker services cleanup (optional)")
    print_colored("    Docker services are still running for next session", Colors.GREEN)
    print_colored("    To stop all: docker-compose down", Colors.CYAN)
    
    print_colored(f"\n{Colors.BOLD}✅ All services stopped{Colors.RESET}", Colors.GREEN)

def run_tests() -> None:
    """테스트 실행"""
    print_colored(f"\n{Colors.BOLD}🧪 Running tests...{Colors.RESET}", Colors.BLUE)
    run_command("pytest --cov=app --cov-report=html")
    print_colored(f"\n{Colors.BOLD}✅ Tests complete{Colors.RESET}", Colors.GREEN)

def run_lint() -> None:
    """코드 품질 검사 및 수정"""
    print_colored(f"\n{Colors.BOLD}🔍 Running code quality checks...{Colors.RESET}", Colors.BLUE)
    
    print_step("1/3", "Running Black formatter")
    run_command("black app/")
    
    print_step("2/3", "Running Ruff linter")
    run_command("ruff --fix app/")
    
    print_step("3/3", "Running MyPy type checker")
    try:
        run_command("mypy app/")
    except subprocess.CalledProcessError:
        print_colored("    ⚠️  Type checking found issues", Colors.YELLOW)
    
    print_colored(f"\n{Colors.BOLD}✅ Code quality checks complete{Colors.RESET}", Colors.GREEN)

def run_format() -> None:
    """코드 포맷팅"""
    print_colored(f"\n{Colors.BOLD}🎨 Formatting code...{Colors.RESET}", Colors.BLUE)
    run_command("black app/")
    print_colored(f"\n{Colors.BOLD}✅ Code formatting complete{Colors.RESET}", Colors.GREEN)

# Poetry Scripts 진입점들
def setup() -> None:
    """poetry run setup"""
    setup_project()

def dev() -> None:
    """poetry run dev"""
    start_all()

def stop() -> None:
    """poetry run stop"""
    stop_all()

def test() -> None:
    """poetry run test"""
    run_tests()

def lint() -> None:
    """poetry run lint"""
    run_lint()

def format() -> None:
    """poetry run format"""
    run_format()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "setup":
            setup()
        elif command == "dev":
            dev()
        elif command == "stop":
            stop()
        elif command == "test":
            test()
        elif command == "lint":
            lint()
        elif command == "format":
            format()
        else:
            print_colored(f"Unknown command: {command}", Colors.RED)
            sys.exit(1)
    else:
        print_colored("Available commands: setup, dev, stop, test, lint, format", Colors.CYAN)