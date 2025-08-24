"""Docker 기반 통합 실행 스크립트 - Poetry Scripts 시스템."""

import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional

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
        # Docker 명령어는 shell=True로 실행 (복잡한 명령어 처리)
        result = subprocess.run(
            command,
            shell=True,
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
        if check:
            raise
        return e

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

def setup_project() -> None:
    """프로젝트 초기 설정 (Docker 버전)"""
    print_colored(f"\n{Colors.BOLD}🚀 Setting up Docker-based project...{Colors.RESET}", Colors.BLUE)
    
    # 1. Docker 확인
    print_step("1/4", "Checking Docker")
    if not check_docker_running():
        print_colored("    ✗ Docker is not running. Please start Docker first.", Colors.RED)
        sys.exit(1)
    print_colored("    ✓ Docker is running", Colors.GREEN)
    
    # 2. Docker 이미지 빌드
    print_step("2/4", "Building Docker images")
    run_command("docker-compose build --no-cache")
    
    # 3. 의존성 설치
    print_step("3/4", "Installing dependencies")
    run_command("docker-compose run --rm app poetry install")
    
    # 4. 인프라 서비스 시작 및 마이그레이션
    print_step("4/4", "Starting infrastructure and running migrations")
    run_command("docker-compose up -d postgres redis")
    
    # 서비스 대기
    print_colored("    Waiting for services to be ready...", Colors.YELLOW)
    time.sleep(10)
    
    # 마이그레이션 실행
    run_command("docker-compose run --rm app poetry run alembic upgrade head")
    
    print_colored(f"\n{Colors.BOLD}✅ Docker setup complete!{Colors.RESET}", Colors.GREEN)
    print_colored("    Next steps:", Colors.WHITE)
    print_colored("      1. make start  # Start development environment", Colors.CYAN)
    print_colored("      2. make logs   # View logs", Colors.CYAN)
    print_colored("      3. make shell  # Access container shell", Colors.CYAN)

def start_all() -> None:
    """모든 서비스 시작 (Docker 버전)"""
    print_colored(f"\n{Colors.BOLD}🚀 Starting Docker development environment...{Colors.RESET}", Colors.BLUE)
    
    # 1. Docker 확인
    print_step("1/3", "Checking Docker")
    if not check_docker_running():
        print_colored("    ✗ Docker is not running. Please start Docker first.", Colors.RED)
        sys.exit(1)
    
    # 2. 모든 서비스 시작
    print_step("2/3", "Starting all services")
    run_command("docker-compose up -d")
    
    # 3. 서비스 상태 확인
    print_step("3/3", "Checking service status")
    time.sleep(5)  # 서비스 시작 대기
    run_command("docker-compose ps")
    
    print_colored(f"\n{Colors.BOLD}🎉 Development environment is running!{Colors.RESET}", Colors.GREEN)
    print_colored("    🌐 Services available at:", Colors.WHITE)
    print_colored("      • API Server:     http://localhost:8000", Colors.CYAN)
    print_colored("      • API Docs:       http://localhost:8000/docs", Colors.CYAN)
    print_colored("      • pgAdmin:        http://localhost:5050", Colors.CYAN)
    print_colored(f"\n    📊 Useful commands:", Colors.WHITE)
    print_colored("      • make logs       # View logs", Colors.YELLOW)
    print_colored("      • make shell      # Access app container", Colors.YELLOW)
    print_colored("      • make test       # Run tests", Colors.YELLOW)
    print_colored("      • make stop       # Stop all services", Colors.YELLOW)

def stop_all() -> None:
    """모든 서비스 중지 (Docker 버전)"""
    print_colored(f"\n{Colors.BOLD}🛑 Stopping Docker services...{Colors.RESET}", Colors.YELLOW)
    
    print_step("1/1", "Stopping all containers")
    run_command("docker-compose down")
    
    print_colored(f"\n{Colors.BOLD}✅ All services stopped{Colors.RESET}", Colors.GREEN)
    print_colored("    💡 Data volumes are preserved for next session", Colors.CYAN)
    print_colored("    💡 To remove all data: make clean-data", Colors.CYAN)

def run_tests() -> None:
    """테스트 실행 (Docker 버전)"""
    print_colored(f"\n{Colors.BOLD}🧪 Running tests in Docker...{Colors.RESET}", Colors.BLUE)
    
    # 서비스가 실행 중인지 확인
    result = run_command("docker-compose ps -q app", check=False)
    if not result.stdout.strip():
        print_colored("    Starting test environment...", Colors.YELLOW)
        run_command("docker-compose up -d postgres redis")
        time.sleep(5)
    
    run_command("docker-compose exec app poetry run pytest --cov=app --cov-report=html")
    print_colored(f"\n{Colors.BOLD}✅ Tests complete{Colors.RESET}", Colors.GREEN)
    print_colored("    📊 Coverage report: htmlcov/index.html", Colors.CYAN)

def run_lint() -> None:
    """코드 품질 검사 및 수정 (Docker 버전)"""
    print_colored(f"\n{Colors.BOLD}🔍 Running code quality checks in Docker...{Colors.RESET}", Colors.BLUE)
    
    # 서비스가 실행 중인지 확인
    result = run_command("docker-compose ps -q app", check=False)
    if not result.stdout.strip():
        print_colored("    Starting lint environment...", Colors.YELLOW)
        run_command("docker-compose up -d app")
        time.sleep(5)
    
    print_step("1/3", "Running Black formatter")
    run_command("docker-compose exec app poetry run black app/")
    
    print_step("2/3", "Running Ruff linter")
    run_command("docker-compose exec app poetry run ruff --fix app/")
    
    print_step("3/3", "Running MyPy type checker")
    run_command("docker-compose exec app poetry run mypy app/", check=False)
    
    print_colored(f"\n{Colors.BOLD}✅ Code quality checks complete{Colors.RESET}", Colors.GREEN)

def run_format() -> None:
    """코드 포맷팅 (Docker 버전)"""
    print_colored(f"\n{Colors.BOLD}🎨 Formatting code in Docker...{Colors.RESET}", Colors.BLUE)
    
    # 서비스가 실행 중인지 확인
    result = run_command("docker-compose ps -q app", check=False)
    if not result.stdout.strip():
        print_colored("    Starting format environment...", Colors.YELLOW)
        run_command("docker-compose up -d app")
        time.sleep(5)
    
    run_command("docker-compose exec app poetry run black app/")
    print_colored(f"\n{Colors.BOLD}✅ Code formatting complete{Colors.RESET}", Colors.GREEN)

# Poetry Scripts 진입점들
def setup() -> None:
    """poetry run setup (Docker 버전)"""
    setup_project()

def dev() -> None:
    """poetry run dev (Docker 버전)"""
    start_all()

def stop() -> None:
    """poetry run stop (Docker 버전)"""
    stop_all()

def test() -> None:
    """poetry run test (Docker 버전)"""
    run_tests()

def lint() -> None:
    """poetry run lint (Docker 버전)"""
    run_lint()

def format() -> None:
    """poetry run format (Docker 버전)"""
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