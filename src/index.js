export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
      }

      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleContact(request, env) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json" },
      { status: 415 }
    );
  }

  let data;

  try {
    data = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const company = String(data.company || "").trim();
  const interest = String(data.interest || "").trim();
  const message = String(data.message || "").trim();
  const honeypot = String(data.website || "").trim();

  // Honeypot: silently reject likely bots.
  if (honeypot) {
    return Response.json({ success: true });
  }

  if (!name || name.length > 100) {
    return Response.json(
      { error: "Please provide a valid name." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email) || email.length > 254) {
    return Response.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (company.length > 150) {
    return Response.json(
      { error: "Company name is too long." },
      { status: 400 }
    );
  }

  const allowedInterests = [
    "Investment research",
    "Capital strategy",
    "Due diligence",
    "Opportunity development",
    "Speaking",
    "Partnership",
    "Other"
  ];

  if (interest && !allowedInterests.includes(interest)) {
    return Response.json(
      { error: "Invalid interest selected." },
      { status: 400 }
    );
  }

  if (!message || message.length > 5000) {
    return Response.json(
      { error: "Please provide a message under 5,000 characters." },
      { status: 400 }
    );
  }

  if (!env.RESEND_API_KEY) {
    return Response.json(
      { error: "Email service is not configured." },
      { status: 500 }
    );
  }

  const timestamp = new Date().toISOString();

  const emailResponse = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Petra Quest <hello@petraquest.io>",
        to: ["viewpetraquest@gmail.com"],
        reply_to: email,
        subject: `New Petra Quest enquiry — ${name}`,
        html: `
          <h2>New Petra Quest enquiry</h2>

          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company || "Not provided")}</p>
          <p><strong>Interest:</strong> ${escapeHtml(interest || "Not specified")}</p>

          <h3>Message</h3>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>

          <hr>

          <p>
            <small>Submitted: ${escapeHtml(timestamp)}</small>
          </p>
        `
      })
    }
  );

  if (!emailResponse.ok) {
  const resendError = await emailResponse.text();

  console.error("Resend error:", resendError);

  return Response.json(
    {
      error: "Resend rejected the email.",
      details: resendError
    },
    { status: 502 }
  );
}

  return Response.json({
    success: true,
    message: "Your enquiry has been sent."
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
