(function () {
  "use strict";

  var students = [
    { id: "masri", label: "S. Al-Masri · 5th year · Conservative", labelAr: "س. المصري · السنة الخامسة · العلاج التحفظي", needs: ["checkup", "filling"] },
    { id: "qudah", label: "A. Qudah · 5th year · Periodontics", labelAr: "أ. القضاه · السنة الخامسة · أمراض اللثة", needs: ["checkup", "cleaning"] },
    { id: "haddad", label: "L. Haddad · 5th year · Pediatric", labelAr: "ل. حداد · السنة الخامسة · طب أسنان الأطفال", needs: ["checkup", "filling"] },
    { id: "nasser", label: "R. Nasser · 4th year · Check-up", labelAr: "ر. ناصر · السنة الرابعة · فحص", needs: ["checkup", "cleaning"] }
  ];

  var isAr = (document.documentElement.lang || "").toLowerCase().indexOf("ar") === 0;
  var studentSelect = document.getElementById("student");
  var form = document.getElementById("booking-form");
  var success = document.getElementById("booking-success");
  var yearEl = document.querySelector("[data-year]");
  var needInputs = document.querySelectorAll("input[name='need']");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function selectedNeed() {
    var checked = document.querySelector("input[name='need']:checked");
    return checked ? checked.value : "checkup";
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
  }

  needInputs.forEach(function (input) {
    input.addEventListener("change", fillStudents);
  });
  fillStudents();

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
      if (success) {
        success.classList.remove("d-none");
        success.focus();
      }
      form.reset();
      form.classList.remove("was-validated");
      fillStudents();
      window.setTimeout(function () {
        if (success) success.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    });
  }
})();
