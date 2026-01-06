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
    const { name, phone, email, service, stylist, message, created_at, appointment_time, website } = body;

    // Kiểm tra honeypot field - chống bot
    if (website) {
      console.warn("Bot detected - honeypot field filled");
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          message: "Bot detected",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 400,
        }
      );
    }

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY secret");
    }

    // VALIDATION: Kiểm tra appointment_time không phải quá khứ
    if (appointment_time) {
      const appointmentDate = new Date(appointment_time);
      const now = new Date();
      
      // Nếu thời gian đặt lịch là quá khứ, reject
      if (appointmentDate < now) {
        return new Response(
          JSON.stringify({
            error: "Invalid appointment time",
            message: "Appointment time cannot be in the past",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            status: 400,
          }
        );
      }
      
      // Kiểm tra phải đặt trước ít nhất 1 giờ
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      if (appointmentDate < oneHourFromNow) {
        return new Response(
          JSON.stringify({
            error: "Invalid appointment time",
            message: "Appointment must be at least 1 hour in advance",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            status: 400,
          }
        );
      }
    }

    // Format datetime với timezone Slovakia để đảm bảo nhất quán
    const formatAppointmentTime = (timeStr: string | null) => {
      if (!timeStr) return "Nezadané";
      try {
        const date = new Date(timeStr);
        return date.toLocaleString("sk-SK", {
          timeZone: "Europe/Bratislava",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } catch (e) {
        return "Nezadané";
      }
    };

    const formatCreatedTime = (timeStr: string | null) => {
      const date = timeStr ? new Date(timeStr) : new Date();
      return date.toLocaleString("sk-SK", {
        timeZone: "Europe/Bratislava",
      });
    };

    const appointmentTimeFormatted = formatAppointmentTime(appointment_time);
    const createdTimeFormatted = formatCreatedTime(created_at);

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
              <strong>Stylista:</strong> ${stylist || "Nešpecifikované"}
            </div>
            
            <div class="info-row">
              <strong>Poznámka:</strong> ${message || "Bez poznámky"}
            </div>
            
            <div class="info-row">
              <strong>Čas rezervácie (Slovensko):</strong> ${appointmentTimeFormatted}
            </div>
            
            <div class="info-row">
              <strong>Čas odoslania formulára:</strong> ${createdTimeFormatted}
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

