import { showToast } from "./toastMessage.js";

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailField = document.getElementById("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let emailError = document.getElementById("emailError");

    if (!emailRegex.test(emailField.value)) {
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

    try {
        const response = await fetch('/auth/signin', {
            method: 'POST',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
            }),
        });

        let data;
        try {
            data = await response.json();
        } catch {
            data = { error: "Erro inesperado" };
        }

        if (response.ok) {
            // Exibe o toast de sucesso
            showToast(data.message || "Login bem-sucedido!", "success");

            // Após 3 segundos, redireciona para a página de domínios
            setTimeout(() => {
                window.location.href = "/domains";
            }, 3000);
        } else {
            // Exibe o toast de erro
            showToast(data.message || data.error || "Erro desconhecido", "danger");
        }
    } catch (error) {
        // Exibe o toast em caso de erro ao processar a solicitação
        showToast("Erro ao processar a solicitação.", "danger");
    }
});