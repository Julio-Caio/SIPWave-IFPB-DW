import { showToast } from './toastMessage.js';

document.getElementById("signupForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let isValid = true;

    const emailField = document.getElementById("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let emailError = document.getElementById("emailError");

    // Validação do email
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

    // Envia a solicitação de signup
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
            showToast(data.message || "Cadastrado com sucesso!", "success");

            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } else {
            if (response.status === 409) {
                showToast("Este usuário já está cadastrado. Tente outro.", "danger");
            } else {
                showToast(data.message || data.error || "Erro desconhecido", "danger");
            }
        }
    } catch (error) {
        showToast("Erro ao processar a solicitação.", "danger");
    }
});
