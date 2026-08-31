const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
const button = form?.querySelector('button[type="submit"]');
const buttonText = button?.querySelector(".button-text");
const buttonLoading = button?.querySelector(".button-loading");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    status.textContent = "";
    status.removeAttribute("data-state");

    button.disabled = true;

    if (buttonText) buttonText.hidden = true;
    if (buttonLoading) buttonLoading.hidden = false;

    const formData = new FormData(form);

    const payload = {
      name: formData.get("name")?.trim() || "",
      email: formData.get("email")?.trim() || "",
      company: formData.get("company")?.trim() || "",
      interest: formData.get("interest")?.trim() || "",
      message: formData.get("message")?.trim() || "",
      website: formData.get("website")?.trim() || ""
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.error || "Something went wrong. Please try again."
        );
      }

      status.textContent =
        result.message ||
        "Thank you. Your enquiry has been sent successfully.";

      status.setAttribute("data-state", "success");

      form.reset();

    } catch (error) {
      status.textContent =
        error.message ||
        "Unable to send your enquiry. Please try again.";

      status.setAttribute("data-state", "error");

    } finally {
      button.disabled = false;

      if (buttonText) buttonText.hidden = false;
      if (buttonLoading) buttonLoading.hidden = true;
    }
  });
}
