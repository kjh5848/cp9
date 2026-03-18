# 🚀 CP9 AWS Lightsail 마이그레이션 로드맵 (Phase 1 ~ 4)

기존 Vercel(또는 로컬) 환경에서 **"월 만원의 행복 + 무제한 백그라운드 확장"**이 가능한 AWS Lightsail 단일 서버 환경으로 완벽하게 이사하기 위한 실무형 마이그레이션 로드맵입니다.

---

## 📍 Phase 1. 로컬 아키텍처 리팩토링 (가장 중요)
서버 호스팅(Lightsail)의 이점을 100% 살리기 위해 코드 구조를 먼저 다듬는 단계입니다. (이 작업들은 당장 Vercel에 올려도 똑같이 잘 동작합니다.)

* **[ ] 1.1 백그라운드 Worker 분리 (AI 파이프라인)**
  * 기존 `api/item-research/pipeline/html-phase.ts` 등 오래 걸리는 코드를 웹 API에서 뺍니다.
  * 루트 디렉토리에 `worker.ts` 스크립트를 새로 만들고, 무한 루프(`setInterval`)로 DB의 `PENDING` 상태인 기사를 찾아 AI 생성을 돌리도록 작성합니다.
  * 브라우저 웹 API는 이제 "작업 큐(DB)에 추가 완료됨!" 이라는 1초짜리 빠른 응답만 하도록 바꿉니다.

* **[ ] 1.2 읽기 전용 페이지 ISR(캐싱) 적용**
  * `app/products/page.tsx` 등 변동이 적은 페이지 구조 상단에 `export const revalidate = 600;` (10분 캐시)을 추가하여 동시 접속 100명 사태(CPU 100%)를 방어합니다.

* **[ ] 1.3 데이터베이스 커넥션 제한 설정**
  * `.env` 파일의 `DATABASE_URL` 주소 끝에 `?connection_limit=15` 등 옵션을 붙입니다. (Lightsail PM2 기준)

---

## 📍 Phase 2. AWS Lightsail 인프라 셋팅 (마우스 클릭 단계)
AWS 콘솔 디자인을 처음이자 마지막으로 들어가는 단계입니다. 

* **[ ] 2.1 인스턴스(가상서버) 생성**
  * AWS Lightsail 접속 후 **OS Only -> Ubuntu 24.04** (또는 22.04) 선택.
  * 요금제 선택 (최소 RAM 2GB 모델 추천 - Node.js 빌드 시 메모리 부족 방지).
  * **(중요)** 생성 직후 `고정 IP (Static IP)`를 발급받아 인스턴스에 영구 할당합니다.

* **[ ] 2.2 기본 서버 환경 설치 (터미널 접속)**
  * 오렌지색 SSH 터미널 창을 열고 아래 3대장을 설치합니다.
    1. Node.js (버전 18+)
    2. PM2 (`npm i -g pm2`)
    3. Nginx (`sudo apt install nginx`)

* **[ ] 2.3 저장소(Github) 연동 및 권한 설정**
  * Lightsail 서버 내부에서 SSH 키를 생성(`ssh-keygen`)하고 Github Deploy Keys에 등록하여 비밀번호 없이 코드를 받아올 수 있게 연결합니다.
  * `git clone 내-프로젝트-주소`

---

## 📍 Phase 3. 깃허브 자동화 (CI/CD) 및 Nginx 문지기 세팅
내가 `git push`만 치면 알아서 서버가 돌게 만드는 "진정한 백엔드 자동화" 단계입니다.

* **[ ] 3.1 Github Actions 자동 배포 세팅**
  * 로컬 코드에 `.github/workflows/deploy.yml`을 만듭니다.
  * 파일 내용: "Main 브랜치에 코드가 푸시되면 -> Lightsail의 고정 IP로 접속해서 -> `git pull` -> `npm run build` -> `pm2 restart all` 을 실행해라!"

* **[ ] 3.2 Nginx 리버스 프록시 적용**
  * 터미널에서 Nginx 설정 파일(`/etc/nginx/sites-available/default`)을 열고, 도메인 접속 시 내부 `localhost:3000` 로 트래픽을 토스하도록 변경합니다.
  * (선택) `certbot`을 설치하여 `https://` (무료 SSL 인증서)를 1분 만에 적용합니다.

---

## 📍 Phase 4. 최종 앱 실행 및 크론(Cron) 스케줄러 투입
모든 세팅이 끝났습니다. 버튼 하나로 공장을 돌릴 차례입니다.

* **[ ] 4.1 PM2 앱 2개 동시 구동**
  * Lightsail 안에서 `pm2 start npm --name "web-app" -- run start` (Next.js 화면용) 실행.
  * `pm2 start worker.ts --name "ai-worker"` (AI 백그라운드 작업용) 실행.
  * `pm2 save`로 향후 서버 재부팅 시에도 이 2개가 영원히 켜지도록 고정.

* **[ ] 4.2 매일 도는 스케줄러(크론) 붙이기**
  * 깃허브 액션(`cron.yml`) 파일이나 리눅스 `crontab -e` 명령어를 활용하여,
  * "매일 아침 11시에 내 서버 주소 `https://mydomain.com/api/autopilot-cron` 에 접속해라!" 라고 알람시계를 켜둡니다.

> 🎉 **축하합니다!** 이제 로컬 Mac에서 기능 개발 후 `git push`만 누르시면, AWS Lightsail에서 알아서 코드를 당겨오고, Nginx가 보안을 뚫어주며, 2개의 PM2(웹, 워커)가 각자 역할을 분담하고, 매일 11시엔 깃허브 로봇이 출근 버튼(Cron)을 알아서 눌러주는 **완벽한 자체 호스팅 생태계**가 구축되었습니다!
