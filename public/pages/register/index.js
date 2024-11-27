// Validar e-mail

document.getElementById("inputEmail").addEventListener("input", function () {
    const emailField = this;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errorMessage = document.getElementById("emailError");
  
    if (!emailRegex.test(emailField.value)) {
      if (!errorMessage) {
        const errorElement = document.createElement("div");
        errorElement.id = "emailError";
        errorElement.style.color = "red";
        errorElement.textContent = "Por favor, insira um e-mail válido.";
        emailField.insertAdjacentElement("afterend", errorElement);
      }
    } else {
      if (errorMessage) {
        errorMessage.remove();
      }
    }
  });

// Validar se as senhas são iguais

  const passwdInput = document.getElementById("inputPassword");
  const confirmPasswdInput = document.getElementById("inputRepeatPassword");
  const feedbackDiv = document.getElementById("feedback");

  confirmPasswdInput.addEventListener("input", () => {
    const confirmPassword = confirmPasswdInput.value;

    if (confirmPassword === passwdInput.value) {
      confirmPasswdInput.classList.remove("error");
      confirmPasswdInput.classList.add("success");
      feedbackDiv.textContent = "";
    } else {
      confirmPasswdInput.classList.remove("success");
      confirmPasswdInput.classList.add("error");
      feedbackDiv.textContent = "Passwords do not match";
    }
});