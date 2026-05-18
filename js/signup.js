(function () {
  function setFormMessage(element, message, type) {
    element.textContent = message;
    element.className = "form-message " + type;
  }

  function initSignupPage() {
    var app = window.ShopEase;
    var form = document.getElementById("signupForm");
    var message = document.getElementById("signupMessage");
    var nameInput = document.getElementById("signupName");
    var emailInput = document.getElementById("signupEmail");
    var passwordInput = document.getElementById("signupPassword");
    var confirmPasswordInput = document.getElementById("signupConfirmPassword");
    var termsInput = document.getElementById("acceptTerms");


    form.addEventListener("submit", function (event) {
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var password = passwordInput.value;
      var confirmPassword = confirmPasswordInput.value;

      event.preventDefault();

      if (name === "" || email === "" || email === "" || password === "" || confirmPassword === "") {
        setFormMessage(message, "Please fill in all required fields.", "error");
        return;
      }

      if (email.indexOf("@") === -1) {
        setFormMessage(message, "Please enter a valid email address.", "error");
        return;
      }

      if (password.length < 8) {
        setFormMessage(message, "Password must be at least 8 characters long.", "error");
        return;
      }

      if (password !== confirmPassword) {
        setFormMessage(message, "Passwords do not match.", "error");
        return;
      }

      if (!termsInput.checked) {
        setFormMessage(message, "Please accept the demo form notice to continue.", "error");
        return;
      }

      console.log("clicked!");
      setFormMessage(message, "Account details validated. Redirecting to login...", "success");
      app.showToast("Signup form submitted.");
      form.reset();

      window.setTimeout(function () {
        window.location.href = app.buildPageUrl("login.html");
      }, 1000);
    });
  }

  document.addEventListener("DOMContentLoaded", initSignupPage);
})();
