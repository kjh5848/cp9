# Next.js 프론트/백엔드 통합 프로젝트 AWS 마이그레이션 분석 보고서

## 1. 개요
현재 프로젝트는 Next.js의 App Router를 활용하여 프론트엔드와 백엔드(API Routes, Proxy, DB 연동 등)가 하나로 통합되어 있는 **풀스택 형태 (Monorepo/Monolithic)** 입니다. 
Vercel이나 로컬 환경에서는 프레임워크가 알아서 서버리스 변환이나 라우팅을 최적화해주지만, 이를 순수 **AWS 인프라**로 직접 마이그레이션 할 때는 **인프라 프로비저닝, 상태 관리, 캐싱 전략, 백그라운드 작업 처리** 등 여러 측면에서 고려할 사항이 발생합니다.

---

## 2. 주요 고려사항 (Critical Considerations)

### 가. 캐싱 (Caching) 및 ISR (Incremental Static Regeneration)
Next.js의 강력한 기능인 Data Cache, Full Route Cache, ISR 등을 유지하려면 호스팅 환경에서 이를 어떻게 지원할지 결정해야 합니다.
- **이슈:** 로컬 디스크를 캐시 저장소로 쓰게 되면 다중 서버(Scale-out) 환경이나 컨테이너 재시작 시 캐시가 유실되거나 서버 간 불일치가 발생합니다.
- **해결책:** Redis (Amazon ElastiCache) 등 외부 중앙 집중형 캐시를 사용하거나, AWS Amplify 같은 Next.js 최적화 관리형 서비스를 사용해야 합니다.

### 나. 데이터베이스 연결 (Database Connection Pooling)
현재 **Prisma**를 사용하고 있는 것으로 파악됩니다. 
- **이슈:** 서버리스(Lambda) 환경으로 배포될 경우, 요청이 몰릴 때 수많은 Lambda 컨테이너가 생성되며 DB 커넥션을 맺게 되어 DB가 뻗을(Connection Exhaustion) 위험이 큽니다.
- **해결책:** `Prisma Accelerate`, `PgBouncer`, 또는 **Amazon RDS Proxy**를 적극 도입하여 커넥션 풀링(Connection Pooling)을 구성해야 합니다. 만약 상시 구동되는 EC2나 ECS/Fargate를 사용한다면 기존과 같이 인스턴스/포드 내에서 커넥션을 관리할 수 있습니다.

### 다. 크론 작업 (Cron Jobs) 및 백그라운드 큐
Autopilot 캠페인 생성 등 백그라운드 스케줄링(Cron) 로직이 존재합니다.
- **이슈:** Next.js 자체 API 로직 내부에서 `node-cron` 등을 띄워두는 방식은 Vercel이나 Serverless 환경에서는 즉시 종료되거나 동작을 보장하지 않습니다. EC2 컨테이너 환경에서도 다중 인스턴스가 띄워지면 중복 실행될 위험이 있습니다.
- **해결책:** AWS의 **Amazon EventBridge**를 사용하여 주기적으로 이벤트를 발생시켜 분리된 워커(Worker) 인스턴스나 별도의 Lambda/SQS 큐를 호출하는 방식으로 비동기 작업을 분리해야 합니다.

### 라. 파일 및 미디어 스토리지
- **이슈:** 서버 로컬 파일 시스템에 저장하는 로직은 다중 서버 환경에서 유실됩니다.
- **해결책:** 모든 사용자 업로드 파일(이미지 등)은 **AWS S3**로 직접 업로드하고, 백엔드는 파일의 URL 정보만 DB에 저장하도록 분리(Decoupling)해야 합니다.

---

## 3. 아키텍처 옵션 분석

Next.js 프로젝트를 AWS로 올리는 대표적인 3가지 방법을 비교합니다.

| 배포 옵션 | 장점 | 단점 | 적합성 |
| :--- | :--- | :--- | :--- |
| **AWS Amplify Hosting** | - Vercel과 가장 유사한 형태<br>- Next.js 14+ 지원 및 SSR, ISR 자동 구성<br>- CI/CD 자동화 내장 | - 내부 인프라 세부 제어 부족<br>- Vercel 대비 빌드 속도가 약간 느릴 수 있음 | **추천도 (상)**<br>가장 빠르게 마이그레이션 가능, 기존 코드를 거의 수정할 필요 없음. |
| **AWS ECS / Fargate (Docker)** | - 상시 구동 컨테이너 (서버리스의 콜드 스타트 없음)<br>- `node-cron` 등 특정 백그라운드 프로세스 유지가 용이함<br>- 인프라 제어권 확실 | - 도커 이미지 빌드 파이프라인(ECR, CodePipeline 등) 구축 필요<br>- Vercel의 Edge/ISR 지원이 까다로움 | **추천도 (중상)**<br>장기적인 안정성과 대규모 트래픽 대비, 백엔드 의존도가 높을 때 적합. |
| **SST / OpenNext (Serverless)** | - 순수 AWS Serverless(Lambda, CloudFront, S3 등)로 변환해 배포<br>- 사용한 만큼만 과금되므로 비용 매우 효율적 | - 초기 설정의 러닝 커브 높음<br>- Lambda 콜드 스타트 우려<br>- Prisma 커넥션 및 폴링 전략 필수 | **추천도 (중)**<br>인프라 리소스를 극도로 쪼개거나 비용을 최적화하려는 경우. |

---

## 4. 권장 마이그레이션 방향 (로드맵)

프로젝트를 안정적으로 넘기기 위해 점진적인 **2-Phase 접근법**을 추천합니다.

### Phase 1: AWS Amplify Hosting 적용 (가장 빠르고 안전한 전환)
마이그레이션 초기의 불확실성을 최소화하는 방향입니다.
1. **인프라 설정:** AWS Amplify 콘솔을 통해 Github 레포지토리를 연결합니다. Next.js App Router와 SSR, ISR을 프레임워크 단에서 알아서 분석하여 프로비저닝해 줍니다.
2. **환경변수 이전:** `.env`에 있는 데이터베이스 URL, 인증(Auth) Secret, 외부 API 키(Coupang, OpenAI 등)를 Amplify Secrets에 맵핑합니다.
3. **DB 커넥션:** 데이터베이스가 연결 가능하도록 VPC 피어링 혹은 IP 화이트리스팅을 세팅합니다.
4. **결과:** 인프라를 깊게 몰라도 기존 프론트+백엔드 통합 코드가 99% 정상 동작합니다.

### Phase 2: Docker + AWS ECS Fargate 분리 (대규모 스케일업 및 안정화)
사용자가 많아지고 Cron이나 스케줄러, 백그라운드 작업이 고도화될 경우의 아키텍처입니다.
1. **도커라이징:** Next.js 애플리케이션을 `Dockerfile` 기반 (Standalone Mode)으로 패키징합니다.
2. **배포 환경 구축:** AWS ECR에 이미지를 푸시하고, ECS / Fargate를 통해 로드 밸런서(ALB) 뒤에 컨테이너를 상시 띄웁니다.
3. **Queue / Worker 분리:**
   - 기존 Next.js API의 긴 시간이 걸리는 작업 (Autopilot, 스크래핑 파이프라인 등)을 분리합니다.
   - 메인 웹앱 컨테이너는 프론트 및 가벼운 백엔드 API만 담당합니다.
   - SQS + 별도의 Worker 컨테이너/Lambda를 만들어 무거운 비동기 파이프라인 처리를 위임합니다.
   - Amazon EventBridge로 크론 작업을 중앙 통제합니다.
4. **정적 리소스 분리:** CloudFront 배포를 통해 정적 리소스 로드를 분산하여 컨테이너 부하를 줄입니다.

---

## 5. 결론 및 Next Step 행동 지침

현재 프로젝트는 **"데이터베이스/크론잡/외부API연동"** 까지 붙어 있는 무거운 어플리케이션 성격을 지닙니다. 따라서 무작정 코드를 복사해서 올리기보다는 **상태(State)를 가진 요소들(로컬 파일, 로컬 캐시 지정, 내부 스케줄러)**을 어떻게 AWS 관리형 서비스로 분리(Decoupling)할 것인지가 가장 핵심 과제입니다.

1. **Prisma Connection Pooling 검토:** Supabase를 사용 중이시라면 Supabase PGBouncer 설정을 활용하여 풀링을 적용하세요.
2. **크론(Cron) 구조 점검:** `node-cron` 등을 API 내부에서 직접 띄웠다면, 외부(예: Vercel Cron, GitHub Actions, AWS EventBridge)에서 API Endpoint를 호출하는 방식으로 전환을 단행하십시오.
3. **PoC (Proof of Concept) 진행:** 당장 모든 것을 바꾸기보다는, 테스트용 브랜치를 파서 **AWS Amplify**로 1차 배포 테스트를 해보는 것을 강력히 권장합니다. 이를 통해 어떤 환경 변수/연동이 실패하는지 손쉽게 파악할 수 있습니다.
