(function () {
  function setFormMessage(element, message, type) {
    element.textContent = message;
    element.className = "form-message " + type;
  }

  function initLoginPage() {
    var app = window.ShopEase;
    var form = document.getElementById("loginForm");
    var message = document.getElementById("loginMessage");
    var emailInput = document.getElementById("loginEmail");
    var passwordInput = document.getElementById("loginPassword");
    var currentUser = app.getCurrentUser();

    if (currentUser) {
      emailInput.value = currentUser.email;
    }

   
    form.addEventListener("submit", function (event) {
      var email = emailInput.value.trim();
      var password = passwordInput.value;
      var savedUser = null;

      event.preventDefault();

      if (email === "" || email === "" || password === "") {
        setFormMessage(message, "Please complete both fields.", "error");
        return;
      }

      if (email.indexOf("@") === -1) {
        setFormMessage(message, "Please enter a valid email address.", "error");
        return;
      }

      if (password.length < 6) {
        setFormMessage(message, "Password should be at least 6 characters long.", "error");
        return;
      }

      savedUser = app.findUserByEmail(email);

      if (!savedUser) {
        setFormMessage(message, "No account found with this email. Please sign up first.", "error");
        return;
      }

      if (savedUser.password !== password) {
        setFormMessage(message, "Incorrect password. Please try again.", "error");
        return;
      }

      if (!app.setCurrentUser(savedUser)) {
        setFormMessage(message, "Could not save login on this browser.", "error");
        return;
      }

      console.log("clicked!");
      setFormMessage(message, "Login successful. Redirecting...", "success");
      app.showToast("Login successful.");
      form.reset();

      window.setTimeout(function () {
        window.location.href = app.buildPageUrl("index.html");
      }, 1000);
    });
  }

  document.addEventListener("DOMContentLoaded", initLoginPage);
})();
