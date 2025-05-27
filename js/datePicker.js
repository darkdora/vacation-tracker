// datePicker.js – gestion du calendrier flatpickr

function initDatePicker() {
    flatpickr("#tripDateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        locale: "fr",
        showMonths: 2
    });
}
