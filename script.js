const password = document.getElementById("password");
const bars = document.querySelectorAll(".strength div");

password.addEventListener("input", () => {
  let value = password.value;
  let strength = 0;

  if (value.length >= 8) strength++;
  if (/[A-Z]/.test(value)) strength++;
  if (/[0-9]/.test(value)) strength++;
  if (/[^A-Za-z0-9]/.test(value)) strength++;

  bars.forEach((bar, index) => {
    if (index < strength) {
      bar.classList.add("active");
    } else {
      bar.classList.remove("active");
    }
  });
});