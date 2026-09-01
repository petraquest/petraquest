const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
const button = form?.querySelector('button[type="submit"]');
const buttonText = button?.querySelector(".button-text");
const buttonLoading = button?.querySelector(".button-loading");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    console.log("Petra Quest contact form submitted.");

    if (status) {
      status.textContent = "Sending your enquiry…";
      status.setAttribute("data-state", "sending");
    }

    if (button) {
      button.disabled = true;
    }

    if (buttonText) {
      buttonText.hidden = true;
    }

    if (buttonLoading) {
      buttonLoading.hidden = false;
    }

    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      interest: String(formData.get("interest") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      website: String(formData.get("website") || "").trim()
    };

    try {
      console.log("Sending payload to /api/contact");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log("Worker response status:", response.status);

      const responseText = await response.text();

      console.log("Worker response:", responseText);

      let result = {};

      try {
        result = JSON.parse(responseText);
      } catch {
        result = {
          raw: responseText
        };
      }

      if (!response.ok) {
        throw new Error(
          result.details ||
          result.error ||
          `Request failed with status ${response.status}.`
        );
      }

      if (status) {
        status.textContent =
          result.message ||
          "Your enquiry has been sent successfully.";

        status.setAttribute("data-state", "success");
      }

      /*
       * Only reset the form after a confirmed successful response.
       */
      form.reset();

    } catch (error) {

      console.error("Contact form error:", error);

      if (status) {
        status.textContent =
          error.message ||
          "Unable to send your enquiry. Please try again.";

        status.setAttribute("data-state", "error");
      }

    } finally {

      if (button) {
        button.disabled = false;
      }

      if (buttonText) {
        buttonText.hidden = false;
      }

      if (buttonLoading) {
        buttonLoading.hidden = true;
      }

    }
  });
}
