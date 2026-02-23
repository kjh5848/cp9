# 03. 백엔드 연동 및 비동기 폴링 상태 관리

본 프로젝트의 백엔드는 모듈러 모놀리스 아키텍처를 가질 수 있으며, 외부 API 연동이나 무거운 AI 처럼 오래 걸리는 작업은 비동기(Asynchronous)로 처리되도록 설계되는 경우가 많습니다. 이 문서에서는 프론트엔드(Next.js)에서 이런 백엔드 API와 통신하는 방법을 다룹니다.

## 1. 기본 API 호출 컨벤션

- 모든 공통 Axios 인스턴스 셋업 및 공통 헤더 지정(인증 토큰 등)은 `shared/api/axios.ts` 또는 유관 파일에 둡니다.
- 프론트엔드는 통상적으로 `/v1/...` 으로 시작하는 API 엔드포인트를 호출합니다.
- (선택사항) Server Action을 쓸 때도 로직 분리를 위해 `shared/api` 나 `features/.../api` 함수를 따로 호출하도록 래핑하는 것이 좋습니다.

## 2. 롱 폴링 (Long Polling) 또는 상태 확인 패턴

시간이 소요되는 복잡한 요청(예: 대규모 데이터 분석, 리포트 생성) API는 백엔드에서 즉시 완료된 결과를 주지 않고 `202 Accepted` 응답과 함께 **Job ID**를 발급할 수 있습니다. 프론트엔드(`features/task/model/useTaskViewModel.ts`)에서는 발급된 Job ID를 사용해 상태를 반복 조회해야 합니다.

### ViewModel 구현 로직 가이드
아래는 비동기 작업을 클라이언트 측에서 기다릴 때의 전형적인 폴링 구현 예시입니다:

```ts
import { useState, useCallback, useRef } from 'react';
import { requestTask, checkTaskStatus, getTaskResult } from '../api'; 

export const useTaskViewModel = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<"IDLE" | "PENDING" | "RUNNING" | "SUCCESS" | "FAILED">("IDLE");
  const [result, setResult] = useState<any>(null); // 실제로는 명확한 Entity 타입 사용
  const [error, setError] = useState<string | null>(null);

  // Poll 관리를 위한 ref
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. 작업 시작 (제출)
  const submitTask = async (inputData: any, configData: any) => {
    try {
      setStatus("PENDING");
      setError(null);
      // 백엔드는 202 응답과 함께 jobId 반환
      const response = await requestTask(inputData, configData);
      setJobId(response.jobId);
      
      // 폴링 시작 (예: 3초 간격)
      startPolling(response.jobId);
    } catch (err) {
      setStatus("FAILED");
      setError("작업 요청에 실패했습니다.");
    }
  };

  // 2. 상태 폴링
  const startPolling = useCallback((id: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusRes = await checkTaskStatus(id);
        setStatus(statusRes.status); // RUNNING 등

        if (statusRes.status === "SUCCESS") {
          // 완료되면 폴링 정지 후 결과 데이터 페치
          stopPolling();
          fetchResult(id);
        } else if (statusRes.status === "FAILED") {
          stopPolling();
          setError("작업 중 오류가 발생했습니다.");
        }
        // PARTIAL 일 때도 UI에 피드백을 주어야 할 수 있습니다.
      } catch (err) {
        stopPolling();
        setStatus("FAILED");
        setError("상태 확인 중 네트워크 오류가 발생했습니다.");
      }
    }, 3000);
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // 3. 최종 결과 수신
  const fetchResult = async (id: string) => {
    try {
      const data = await getTaskResult(id);
      setResult(data);
    } catch (err) {
      setError("결과를 가져오는데 실패했습니다.");
    }
  };

  return {
    jobId,
    status,
    result,
    error,
    actions: {
      submitTask,
      stopPolling
    }
  };
};
```

## 3. UI 처리 (`features/.../ui/...`)

- `status === 'RUNNING'` 또는 `status === 'PENDING'` 일 때, 스피너나 진행도를 나타내는 스켈레톤(Skeleton UI, Glassmorphism 적용 등)을 보여줍니다.
- 에러가 나면 해당 ViewModel 상태의 `error` 값을 바탕으로 유저에게 알림(Toast 메세지, 경고 카드 등)을 표시합니다.
- 데이터(`result` 엔티티)는 `entities/[domain]/ui` 쪽에 정의된 '덤(Dumb) 뷰어 컴포넌트'로 전달하여 렌더링되게 합니다.
