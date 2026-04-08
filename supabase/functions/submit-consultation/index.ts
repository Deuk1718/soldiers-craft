import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "협의 예정",
];

const PHONE_REGEX = /^[\d\-+() ]{6,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// In-memory rate limiting: max 5 requests per IP per 60 seconds
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIp = req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-real-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",").pop()?.trim()
    ?? "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "잠시 후 다시 시도해주세요." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  try {
    const body = await req.json();
    const { client_name, client_phone, client_email, expert_name, expert_expertise, consultation_date, consultation_time, memo } = body;

    // Required field validation
    if (!client_name || typeof client_name !== "string" || client_name.trim().length === 0 || client_name.trim().length > 100) {
      return new Response(JSON.stringify({ error: "이름은 1~100자 이내로 입력해주세요." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!client_phone || typeof client_phone !== "string" || !PHONE_REGEX.test(client_phone.trim())) {
      return new Response(JSON.stringify({ error: "올바른 연락처를 입력해주세요." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (client_email && (typeof client_email !== "string" || !EMAIL_REGEX.test(client_email.trim()) || client_email.length > 255)) {
      return new Response(JSON.stringify({ error: "올바른 이메일을 입력해주세요." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!expert_name || typeof expert_name !== "string" || expert_name.trim().length > 100) {
      return new Response(JSON.stringify({ error: "전문가 이름이 올바르지 않습니다." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!expert_expertise || typeof expert_expertise !== "string" || expert_expertise.trim().length > 100) {
      return new Response(JSON.stringify({ error: "전문 분야가 올바르지 않습니다." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!consultation_date || typeof consultation_date !== "string" || !DATE_REGEX.test(consultation_date)) {
      return new Response(JSON.stringify({ error: "올바른 날짜를 입력해주세요." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!consultation_time || typeof consultation_time !== "string" || !ALLOWED_TIMES.includes(consultation_time)) {
      return new Response(JSON.stringify({ error: "올바른 상담 시간을 선택해주세요." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (memo && (typeof memo !== "string" || memo.trim().length > 1000)) {
      return new Response(JSON.stringify({ error: "메모는 1000자 이내로 입력해주세요." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabaseAdmin.from("consultations").insert({
      client_name: client_name.trim().slice(0, 100),
      client_phone: client_phone.trim().slice(0, 20),
      client_email: client_email ? client_email.trim().slice(0, 255) : null,
      expert_name: expert_name.trim().slice(0, 100),
      expert_expertise: expert_expertise.trim().slice(0, 100),
      consultation_date,
      consultation_time,
      memo: memo ? memo.trim().slice(0, 1000) : null,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "접수에 실패했습니다. 다시 시도해주세요." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
