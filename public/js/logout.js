import { showToast } from "./toastMessage.js";

document.getElementById('log-out').addEventListener('click', function() {
    fetch('/sign-out', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showToast(data.message, "success");

            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }
    })
    .catch(error => console.error('Erro no logout:', error));
});
