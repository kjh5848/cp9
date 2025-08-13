// @ts-ignore: Deno 모듈 import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

<<<<<<< HEAD
serve(async (req) => {
  const { name } = await req.json();
  const data = {
    message: `Hello ${name}!`,
    timestamp: new Date().toISOString(),
  };

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
}); 
=======
import { createEdgeFunctionHandler, safeJsonParse } from "../_shared/server.ts";
import { ok, fail } from "../_shared/response.ts";

interface HelloRequest {
  name: string;
}

async function handleHello(req: Request): Promise<Response> {
  const body = await safeJsonParse<HelloRequest>(req);
  
  if (!body?.name) {
    return fail("name이 필요합니다.", "VALIDATION_ERROR", 400);
  }

  const data = {
    message: `Hello ${body.name}!`,
    timestamp: new Date().toISOString(),
  };

  return ok(data);
}

serve(createEdgeFunctionHandler(handleHello));
>>>>>>> f18ff8d74d034f2f67395e7ef7f802d65ecf7746
