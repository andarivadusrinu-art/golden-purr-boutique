// @ts-ignore: Deno URL imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno URL imports
import { SMTPClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// @ts-ignore: Deno types
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text } = await req.json();

    const client = new SMTPClient({
      connection: {
        // @ts-ignore: Deno namespace
        hostname: Deno.env.get("SMTP_HOST") || "",
        // @ts-ignore: Deno namespace
        port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
        tls: true,
        auth: {
          // @ts-ignore: Deno namespace
          user: Deno.env.get("SMTP_USER") || "",
          // @ts-ignore: Deno namespace
          pass: Deno.env.get("SMTP_PASS") || "",
        },
      },
    });

    await client.send({
      // @ts-ignore: Deno namespace
      from: Deno.env.get("SMTP_FROM") || Deno.env.get("SMTP_USER") || "",
      to,
      subject,
      content: text || "",
      html: html || "",
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
