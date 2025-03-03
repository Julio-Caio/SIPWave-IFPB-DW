// utils.js

// Função para mostrar feedback (mensagens de sucesso, erro, etc.)
export function showFeedback(message) {
    const feedback = document.createElement("div");
    feedback.className = "alert alert-success";
    feedback.textContent = message;
    document.body.appendChild(feedback);
  
    setTimeout(() => {
      feedback.remove();
    }, 3000);
  }

// Validar as entradas
export function validateInput({ username, status, userURI, number }) {
    if (!username || !status || !number) {
      return false;
    }
    if (isNaN(number)) { 
      alert("Número deve conter apenas dígitos.");
      return false;
    }
    if (userURI && !userURI.match(/^(sip:)?[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert("URI/SIP inválido.");
      return false;
    }
    return true;
}

export function statusColor(status) {
  switch (status.toLowerCase())
  {
    case 'in call':
      return 'bg-danger'

    case 'avaliable':
      return 'bg-success'

    default:
      return 'bg-secondary'
  }
}