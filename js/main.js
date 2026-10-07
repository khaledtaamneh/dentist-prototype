(function () {
  "use strict";

  var CLINIC_INBOX = "divan@uop.edu.jo";
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CLINIC_INBOX;

  var isAr = (document.documentElement.lang || "").toLowerCase().indexOf("ar") === 0;
  var form = document.getElementById("booking-form");
  var yearEl = document.querySelector("[data-year]");
  var submitBtn = form ? form.querySelector("[type='submit']") : null;
  var successModalEl = document.getElementById("successModal");
  var submitError = document.getElementById("submit-error");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function showSuccess() {
    if (!window.bootstrap || !successModalEl) return;
    window.bootstrap.Modal.getOrCreateInstance(successModalEl).show();
  }

  function setBusy(busy) {
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
    submitBtn.classList.toggle("is-busy", busy);
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el && el.value ? el.value.trim() : "";
  }

  function payloadFromForm() {
    return {
      _subject: isAr ? "طلب موعد — مركز جامعة البترا لطب الأسنان" : "UPDC appointment request",
      _template: "table",
      _captcha: "false",
      "Full name": fieldValue("fullName"),
      Mobile: fieldValue("mobile"),
      "Treatment needed": fieldValue("treatment"),
      "Preferred doctor": fieldValue("doctor") || (isAr ? "غير محدد" : "Not specified"),
      Date: fieldValue("date"),
      Language: isAr ? "Arabic" : "English",
      Submitted: new Date().toISOString()
    };
  }

  function sendBooking() {
    return fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payloadFromForm())
    }).then(function (res) {
      if (!res.ok) throw new Error("clinic inbox error");
      return res.json().catch(function () {
        return { success: true };
      });
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submitError) submitError.hidden = true;
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
      showSuccess();
      setBusy(true);
      sendBooking()
        .catch(function () {
          if (submitError) submitError.hidden = false;
        })
        .then(function () {
          form.reset();
          form.classList.remove("was-validated");
          setBusy(false);
        });
    });
  }
})();
