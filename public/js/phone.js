const MAX_LENGTH = 15;
const ALLOWED_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'];

document.addEventListener('DOMContentLoaded', initializeInput);
document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

let isKeydownInProgress = false;

function initializeInput() {
    const displayInput = getDisplayInput();
    displayInput.value = '';
}

function getDisplayInput() {
    return document.getElementById('displayInput');
}

function handleKeydown(event) {
    const displayInput = getDisplayInput();

    if (isKeydownInProgress) {
        event.preventDefault();
        return;
    }

    isKeydownInProgress = true; 

    if (displayInput.value.length >= MAX_LENGTH && event.key !== 'Backspace' && event.key !== 'Clear') {
        event.preventDefault();
        return;
    }

    if (ALLOWED_KEYS.includes(event.key)) {
        setTimeout(() => updateInputValue(displayInput, event.key), 0);
    }

    if (event.key === 'Backspace') {
        setTimeout(() => {
            displayInput.value = displayInput.value.slice(0, -1);
            updateInputValue(displayInput);
        }, 0);
    }

    const button = document.querySelector(`button[data-digit="${event.key}"]`);
    if (button) {
        button.classList.add('hover');
    }
}

function handleKeyup(event) {
    const button = document.querySelector(`button[data-digit="${event.key}"]`);
    if (button) {
        button.classList.remove('hover');
    }
    
    isKeydownInProgress = false;
}

function updateInputValue(displayInput, key = null) {
    let currentValue = displayInput.value;

    if (key) {
        currentValue += key;
    }

    currentValue = sanitizeInput(currentValue);
    currentValue = maskNumber(currentValue);
    displayInput.value = currentValue;
}