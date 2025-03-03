document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  let isValid = true;

  const emailField = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = document.getElementById("emailError");

  if (!emailRegex.test(emailField.value)) {
      isValid = false;
      if (!emailError) {
          const errorElement = document.createElement("div");
          errorElement.id = "emailError";
          errorElement.style.color = "red";
          errorElement.textContent = "Por favor, insira um e-mail válido.";
          emailField.insertAdjacentElement("afterend", errorElement);
      }
  } else {
      if (emailError) {
          emailError.remove();
      }
  }

  // Validar se as senhas são iguais
  const passwdInput = document.getElementById("password");
  const confirmPasswdInput = document.getElementById("repeatpassword");
  const feedbackDiv = document.getElementById("feedback");

  if (passwdInput.value !== confirmPasswdInput.value) {
      isValid = false;
      confirmPasswdInput.classList.add("error");
      feedbackDiv.textContent = "As senhas não coincidem.";
  } else {
      confirmPasswdInput.classList.remove("error");
      feedbackDiv.textContent = "";
  }

  if (!isValid) return;

  // Enviar os dados via fetch() ao invés do envio padrão do formulário
  try {
      const response = await fetch('/users', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              username: document.getElementById('username').value,
              email: document.getElementById('email').value,
              password: document.getElementById('password').value,
              repeatpassword: document.getElementById('repeatpassword').value,
          }),
      });

      const data = await response.json();
      if (response.ok) {
          alert(data.message);
          window.location.href = "/login";
      } else {
          showToast(data.error);
      }
  } catch (error) {
      showToast("Erro ao processar a solicitação.");
  }
});

function showToast(message) {
    document.getElementById('toastMessage').innerText = message;
    const toastElement = new bootstrap.Toast(document.getElementById('errorToast'));
    toastElement.show();
}