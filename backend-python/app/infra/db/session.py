"""데이터베이스 세션 관리.

주요 역할:
- 비동기 데이터베이스 연결 관리
- SQLAlchemy 세션 팩토리 설정
- 커넥션 풀 및 라이프사이클 관리
- 트랜잭션 경계 및 에러 처리

JSDoc:
@module DatabaseSession
@description SQLAlchemy 비동기 데이터베이스 세션 관리자
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# 비동기 데이터베이스 엔진 생성
engine = create_async_engine(
    str(settings.database_url),
    echo=settings.debug,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_pre_ping=True,  # 사용 전 연결 상태 검증
)

# 비동기 세션 팩토리 생성
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Declarative Base 생성 (ORM 모델의 기본 클래스)
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """비동기 데이터베이스 세션을 반환합니다.
    
    FastAPI 의존성 주입에서 사용되는 데이터베이스 세션 제공자입니다.
    
    Yields:
        AsyncSession: 데이터베이스 세션
        
    Note:
        - 정상 완료시 자동 커밋
        - 예외 발생시 자동 롤백
        - 세션 자동 정리
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """컨텍스트 매니저로 데이터베이스 세션을 반환합니다.
    
    서비스 레이어나 직접적인 데이터베이스 접근이 필요한 곳에서 사용됩니다.
    
    Yields:
        AsyncSession: 데이터베이스 세션
        
    Note:
        - 트랜잭션 자동 관리
        - 컨텍스트 종료시 자동 정리
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """데이터베이스 테이블을 초기화합니다.
    
    애플리케이션 시작시 모든 테이블을 생성합니다.
    
    Note:
        - Base.metadata에 등록된 모든 모델의 테이블 생성
        - 이미 존재하는 테이블은 무시됨
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("데이터베이스 테이블이 생성되었습니다")


async def close_db() -> None:
    """데이터베이스 연결을 종료합니다.
    
    애플리케이션 종료시 모든 커넥션 풀을 정리합니다.
    
    Note:
        - 커넥션 풀 정리
        - 리소스 해제
    """
    await engine.dispose()
    logger.info("데이터베이스 연결이 종료되었습니다")
