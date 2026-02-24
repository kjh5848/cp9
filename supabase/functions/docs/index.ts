import { serve } from "https://deno.land/std@0.224.0/http/server.ts";


// swagger.yaml 파일을 읽어오기
async function loadSwaggerYaml(): Promise<string> {
  try {
    const swaggerPath = new URL('./swagger.yaml', import.meta.url);
    const swaggerYaml = await Deno.readTextFile(swaggerPath);
    return swaggerYaml;
  } catch (error) {
    console.error('swagger.yaml 파일을 읽을 수 없습니다:', error);
    return fallbackSwaggerYaml;
  }
}

// 기본 fallback swagger 스펙
const fallbackSwaggerYaml = `openapi: 3.0.3
info:
  title: CP9 Supabase Edge Functions API
  description: |
    CP9 쿠팡 파트너스 자동 블로그 SaaS의 백엔드 API 문서입니다.
    
    **주요 기능:**
    - AI 기반 상품 리서치 및 SEO 콘텐츠 생성
    - Redis 캐싱 시스템 및 백그라운드 작업 처리
    - LangGraph 워크플로우 오케스트레이션
    
    **인증:**
    모든 API 호출시 Supabase 인증 토큰이 필요합니다.
    
    **기술 스택:**
    - Runtime: Deno (Supabase Edge Functions)
    - AI Services: Perplexity API, OpenAI GPT
    - Cache: Redis
    - Database: Supabase PostgreSQL
  version: 1.0.0
  contact:
    name: CP9 Backend Team
    email: support@cp9.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: http://localhost:54321/functions/v1
    description: 로컬 개발 서버
  - url: https://{project-ref}.supabase.co/functions/v1
    description: 프로덕션 서버
    variables:
      project-ref:
        default: your-project-ref
        description: Supabase 프로젝트 레퍼런스 ID

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Supabase 인증 토큰 (anon key 또는 access token)

  schemas:
    ApiResponse:
      type: object
      properties:
        success:
          type: boolean
          description: API 호출 성공 여부
        data:
          type: object
          description: 응답 데이터 (성공시만 포함)
        error:
          type: string
          description: 에러 메시지 (실패시만 포함)
        code:
          type: string
          description: 에러 코드 (실패시만 포함)
        details:
          type: object
          description: 추가 에러 정보 (실패시만 포함)
      required:
        - success
      example:
        success: true
        data:
          message: "Operation completed successfully"

    ResearchPack:
      type: object
      description: 상품 리서치 데이터 구조
      properties:
        itemId:
          type: string
          description: 상품 고유 ID
        title:
          type: string
          description: 상품명
        priceKRW:
          type: number
          nullable: true
          description: 상품 가격 (원)
        isRocket:
          type: boolean
          nullable: true
          description: 로켓배송 여부
        features:
          type: array
          items:
            type: string
          description: 상품 주요 기능
        pros:
          type: array
          items:
            type: string
          description: 상품 장점
        cons:
          type: array
          items:
            type: string
          description: 상품 단점
        keywords:
          type: array
          items:
            type: string
          description: 관련 키워드
        metaTitle:
          type: string
          description: SEO 메타 제목
        metaDescription:
          type: string
          description: SEO 메타 설명
        slug:
          type: string
          description: URL 슬러그
      required:
        - itemId
        - features
        - pros
        - cons
        - keywords

    ProductData:
      type: object
      description: 쿠팡 상품 데이터
      properties:
        productName:
          type: string
          description: 상품명
        productPrice:
          type: number
          description: 상품 가격
        productImage:
          type: string
          format: uri
          description: 상품 이미지 URL
        productUrl:
          type: string
          format: uri
          description: 상품 페이지 URL
        categoryName:
          type: string
          description: 카테고리명
        isRocket:
          type: boolean
          description: 로켓배송 여부
        isFreeShipping:
          type: boolean
          description: 무료배송 여부

paths:
  /item-research:
    post:
      tags:
        - Research
      summary: 상품 리서치 데이터 생성
      description: |
        Perplexity API를 활용하여 상품명 기반으로 리서치 데이터를 생성하고 
        Supabase research 테이블에 저장합니다.
      operationId: createItemResearch
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                itemName:
                  type: string
                  description: 리서치할 상품명
                  example: "무선 이어폰"
                projectId:
                  type: string
                  description: 프로젝트 ID
                  example: "project_123"
                itemId:
                  type: string
                  description: 상품 고유 ID
                  example: "item_456"
                productData:
                  $ref: '#/components/schemas/ProductData'
              required:
                - itemName
                - projectId
                - itemId
      responses:
        '200':
          description: 리서치 생성 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'

  /write:
    post:
      tags:
        - Content Generation
      summary: SEO 최적화 콘텐츠 생성
      description: |
        OpenAI GPT API를 활용하여 SEO 최적화된 블로그 콘텐츠를 생성하고 
        drafts 테이블에 저장합니다.
      operationId: generateSeoContent
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                itemId:
                  type: string
                  description: 상품 ID
                  example: "item_456"
                researchPack:
                  $ref: '#/components/schemas/ResearchPack'
              required:
                - itemId
                - researchPack
      responses:
        '200':
          description: 콘텐츠 생성 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'

  /cache-gateway:
    post:
      tags:
        - Cache
      summary: Redis 캐시 관리
      description: |
        Redis를 활용한 캐싱 시스템 및 요청 최적화를 제공합니다.
        get, set, delete, stats 액션을 지원합니다.
      operationId: manageCacheData
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                action:
                  type: string
                  enum: [get, set, delete, stats]
                key:
                  type: string
                  description: 캐시 키
                value:
                  type: object
                  description: 저장할 데이터 (set 액션시 필요)
                ttl:
                  type: integer
                  description: TTL 초 (set 액션시 선택사항)
                namespace:
                  type: string
                  description: 네임스페이스
              required:
                - action
      responses:
        '200':
          description: 캐시 작업 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'

  /queue-worker:
    post:
      tags:
        - Queue
      summary: 백그라운드 작업 관리
      description: |
        LangGraph 기반의 백그라운드 작업 처리를 위한 큐 시스템을 관리합니다.
        enqueue, status, cancel, stats 액션을 지원합니다.
      operationId: manageQueueJob
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                action:
                  type: string
                  enum: [enqueue, status, cancel, stats]
                jobId:
                  type: string
                  description: 작업 ID (status, cancel 액션시 필요)
                job:
                  type: object
                  description: 작업 정의 (enqueue 액션시 필요)
              required:
                - action
      responses:
        '200':
          description: 큐 작업 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'

  /langgraph-api:
    post:
      tags:
        - Workflow
      summary: AI 워크플로우 오케스트레이션
      description: |
        LangGraph 기반의 복잡한 AI 워크플로우를 실행하고 관리합니다.
        execute, status, cancel, resume 액션을 지원합니다.
      operationId: manageWorkflow
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                action:
                  type: string
                  enum: [execute, status, cancel, resume]
                workflow:
                  type: object
                  description: 워크플로우 정의 (execute 액션시 필요)
                executionId:
                  type: string
                  description: 실행 ID (status, cancel, resume 액션시 필요)
              required:
                - action
      responses:
        '200':
          description: 워크플로우 작업 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'

  /hello:
    post:
      tags:
        - Test
      summary: 테스트용 기본 함수
      description: |
        Edge Functions의 기본 동작을 확인하는 테스트용 함수입니다.
      operationId: testHelloFunction
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: 인사할 이름
                  example: "Claude"
                message:
                  type: string
                  description: 추가 메시지 (선택사항)
                  example: "Hello World"
              required:
                - name
      responses:
        '200':
          description: 테스트 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'

tags:
  - name: Research
    description: 상품 리서치 관련 API
  - name: Content Generation
    description: SEO 콘텐츠 생성 관련 API
  - name: Cache
    description: 캐싱 시스템 관련 API
  - name: Queue
    description: 백그라운드 작업 큐 관련 API
  - name: Workflow
    description: AI 워크플로우 오케스트레이션 API
  - name: Test
    description: 테스트 및 개발 지원 API`;

const swaggerUiHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CP9 Backend API 문서</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
    }
    .swagger-ui .topbar {
      background-color: #2d3748;
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }
    .swagger-ui .info {
      margin: 20px 0;
    }
    .swagger-ui .info .title {
      color: #2d3748;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/functions/v1/docs/swagger.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: 'list',
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // 로컬 개발시 자동으로 올바른 서버 URL 설정
          if (request.url.includes('/functions/v1/')) {
            const currentHost = window.location.origin;
            if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
              request.url = request.url.replace(
                /https?:\\/\\/[^/]+\\/functions\\/v1\\//,
                'http://localhost:54321/functions/v1/'
              );
            }
          }
          return request;
        },
        onComplete: function() {
          console.log('CP9 Backend API 문서가 로드되었습니다.');
        }
      });
    };
  </script>
</body>
</html>
`;

serve(async (req: Request) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // CORS 헤더
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey",
    "Access-Control-Max-Age": "86400",
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // swagger.yaml 파일 요청
    if (pathname.endsWith('/swagger.yaml') || pathname.endsWith('/docs/swagger.yaml')) {
      const swaggerContent = await loadSwaggerYaml();
      return new Response(swaggerContent, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/yaml; charset=utf-8",
        },
      });
    }

    // 기본 요청 - Swagger UI HTML 반환
    return new Response(swaggerUiHtml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });

  } catch (error) {
    console.error("Docs function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to serve documentation",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
});