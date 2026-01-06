import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TO_EMAIL = "behairbarber@gmail.com"; // ⚠️ THAY BẰNG EMAIL SALON THẬT

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { name, phone, email, service, message, created_at, appointment_time } = body;

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY secret");
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
            .info-row { margin: 15px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #d4af37; }
            .info-row strong { color: #0f0f0f; display: inline-block; min-width: 120px; }
            hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
            .footer { font-size: 12px; color: #777; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🎯 Nová rezervácia z webu Be Hair &amp; Barber</h2>
            
            <div class="info-row">
              <strong>Meno klienta:</strong> ${name || "N/A"}
            </div>
            
            <div class="info-row">
              <strong>Telefón:</strong> ${phone || "N/A"}
            </div>
            
            <div class="info-row">
              <strong>E‑mail:</strong> ${email || "N/A"}
            </div>
            
            <div class="info-row">
              <strong>Služba:</strong> ${service || "Nešpecifikované"}
            </div>
            
            <div class="info-row">
              <strong>Poznámka:</strong> ${message || "Bez poznámky"}
            </div>
            
            <div class="info-row">
              <strong>Čas rezervácie (Slovensko):</strong> ${
                appointment_time
                  ? new Date(appointment_time).toLocaleString("sk-SK", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Nezadané"
              }
            </div>
            
            <div class="info-row">
              <strong>Čas odoslania formulára:</strong> ${created_at ? new Date(created_at).toLocaleString("sk-SK") : new Date().toLocaleString("sk-SK")}
            </div>
            
            <hr>
            
            <div class="footer">
              <p><em>Tento e‑mail bol odoslaný automaticky z rezervačného formulára Be Hair &amp; Barber.</em></p>
              <p><em>Systém: Supabase Edge Function + Resend</em></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Be Luxury Salon <onboarding@resend.dev>", // ⚠️ Sau này thay bằng domain đã verify
        to: [TO_EMAIL],
        subject: `🎯 Nová rezervácia od ${name || "klienta"}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend API error:", errText);
      throw new Error(`Failed to send email: ${errText}`);
    }

    const result = await resendRes.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: String(error),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 500,
      }
    );
  }
});

