(function () {
  "use strict";

  var CLINIC_INBOX = "divan@uop.edu.jo";
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CLINIC_INBOX;

  var students = [
    { id: "masri", label: "S. Al-Masri · 5th year · Conservative", labelAr: "س. المصري · السنة الخامسة · العلاج التحفظي", needs: ["exam", "rootcanal", "cavities"] },
    { id: "qudah", label: "A. Qudah · 5th year · Periodontics", labelAr: "أ. القضاه · السنة الخامسة · أمراض اللثة", needs: ["exam", "extraction", "denture_replace", "denture_full"] },
    { id: "haddad", label: "L. Haddad · 5th year · Pediatric", labelAr: "ل. حداد · السنة الخامسة · طب أسنان الأطفال", needs: ["exam", "rootcanal", "cavities"] },
    { id: "nasser", label: "R. Nasser · 4th year · General clinic", labelAr: "ر. ناصر · السنة الرابعة · العيادة العامة", needs: ["exam", "extraction", "denture_replace", "denture_full"] }
  ];

  var needLabels = {
    exam: { en: "Dental exam", ar: "فحص الأسنان" },
    rootcanal: { en: "Anterior root canal", ar: "سحب عصب الأسنان الأمامية" },
    extraction: { en: "Tooth and root extraction", ar: "خلع الأسنان والجذور" },
    cavities: { en: "Cavity treatment", ar: "علاج تسوسات الأسنان" },
    denture_replace: { en: "Replace old removable denture", ar: "استبدال طقم الأسنان المتحرك القديم بطقم جديد" },
    denture_full: { en: "Complete removable denture", ar: "عمل طقم أسنان كامل متحرك" }
  };

  var isAr = (document.documentElement.lang || "").toLowerCase().indexOf("ar") === 0;
  var studentSelect = document.getElementById("student");
  var form = document.getElementById("booking-form");
  var yearEl = document.querySelector("[data-year]");
  var needInputs = document.querySelectorAll("input[name='need']");
  var dentureNote = document.getElementById("denture-note");
  var submitBtn = form ? form.querySelector("[type='submit']") : null;
  var successModalEl = document.getElementById("successModal");
  var submitError = document.getElementById("submit-error");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function selectedNeed() {
    var checked = document.querySelector("input[name='need']:checked");
    return checked ? checked.value : "exam";
  }

  function needText(need) {
    var item = needLabels[need] || needLabels.exam;
    return isAr ? item.ar : item.en;
  }

  function studentText(id) {
    var found = students.filter(function (item) {
      return item.id === id;
    })[0];
    if (!found) return id;
    return isAr ? found.labelAr : found.label;
  }

  function fillStudents() {
    if (!studentSelect) return;
    var need = selectedNeed();
    var current = studentSelect.value;
    var list = students.filter(function (item) {
      return item.needs.indexOf(need) !== -1;
    });
    if (!list.length) list = students.slice();
    studentSelect.innerHTML = list
      .map(function (item) {
        return '<option value="' + item.id + '">' + (isAr ? item.labelAr : item.label) + "</option>";
      })
      .join("");
    var still = list.some(function (item) {
      return item.id === current;
    });
    studentSelect.value = still ? current : list[0].id;
    if (dentureNote) {
      dentureNote.hidden = need !== "denture_replace" && need !== "denture_full";
    }
  }

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

  function payloadFromForm() {
    var need = selectedNeed();
    return {
      _subject: isAr ? "طلب موعد — مركز جامعة البترا لطب الأسنان" : "UPDC appointment request",
      _template: "table",
      _captcha: "false",
      "Full name": (document.getElementById("fullName") || {}).value || "",
      Mobile: (document.getElementById("mobile") || {}).value || "",
      Treatment: needText(need),
      Student: studentText(studentSelect ? studentSelect.value : ""),
      Date: (document.getElementById("date") || {}).value || "",
      Time: (document.getElementById("time") || {}).value || "",
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

  needInputs.forEach(function (input) {
    input.addEventListener("change", fillStudents);
  });
  fillStudents();

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submitError) submitError.hidden = true;
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
      setBusy(true);
      sendBooking()
        .then(function () {
          form.reset();
          form.classList.remove("was-validated");
          fillStudents();
          showSuccess();
        })
        .catch(function () {
          if (submitError) submitError.hidden = false;
        })
        .then(function () {
          setBusy(false);
        });
    });
  }
})();
