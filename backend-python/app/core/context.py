"""애플리케이션 컨텍스트 변수 정의.

이 모듈은 애플리케이션 전반에서 사용되는 컨텍스트 변수들을 정의합니다.
컨텍스트 변수는 비동기 환경에서 요청별 정보를 안전하게 전달하는데 사용됩니다.

주요 역할:
- 요청별 고유 식별자 관리
- 비동기 태스크 간 컨텍스트 전달
- 로깅과 추적을 위한 메타데이터 관리

JSDoc:
@module Context
@description 애플리케이션 컨텍스트 변수 정의 및 관리
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

from contextvars import ContextVar
from typing import Optional

# 요청별 고유 식별자를 저장하는 컨텍스트 변수
REQUEST_ID_VAR: ContextVar[Optional[str]] = ContextVar('request_id', default=None)

def get_request_id() -> Optional[str]:
    """현재 컨텍스트의 request_id를 가져옵니다.
    
    Returns:
        현재 컨텍스트의 request_id 또는 None
        
    JSDoc:
    @function get_request_id
    @description 현재 실행 컨텍스트의 요청 ID 조회
    @returns {string|null} 요청 ID 또는 null
    """
    return REQUEST_ID_VAR.get()

def set_request_id(request_id: str) -> None:
    """현재 컨텍스트에 request_id를 설정합니다.
    
    Args:
        request_id: 설정할 요청 ID
        
    JSDoc:
    @function set_request_id  
    @description 현재 실행 컨텍스트에 요청 ID 설정
    @param {string} request_id - 설정할 요청 고유 식별자
    """
    REQUEST_ID_VAR.set(request_id)