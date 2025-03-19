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
            alert(data.message);
            window.location.href = '/login';
        }
    })
    .catch(error => console.error('Erro no logout:', error));
});
