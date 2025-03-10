import { showToast } from "./toastMessage";

document.getElementById("signupForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let isValid = true;

    const emailField = document.getElementById("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let emailError = document.getElementById("emailError");

    if (!emailRegex.test(emailField.value)) {
        isValid = false;
        if (!emailError) {
            emailError = document.createElement("div");
            emailError.id = "emailError";
            emailError.style.color = "red";
            emailError.textContent = "Por favor, insira um e-mail válido.";
            emailField.insertAdjacentElement("afterend", emailError);
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

    // Enviar os dados via fetch()
    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            credentials: 'include',
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

        let data;
        try {
            data = await response.json();
        } catch {
            data = { error: "Erro inesperado" };
        }

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