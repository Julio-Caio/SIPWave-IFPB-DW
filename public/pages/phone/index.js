import maskPhone from './maskPhone.js';

const { maskNumber, sanitizeInput } = maskPhone;

const MAX_LENGTH = 15; 
const ALLOWED_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'];

document.addEventListener('DOMContentLoaded', initializeInput);
document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

function initializeInput() {
    const displayInput = getDisplayInput();
    displayInput.value = '';
}

function getDisplayInput() {
    return document.getElementById('displayInput');
}

function handleKeydown(event) {
    const displayInput = getDisplayInput();

    if (displayInput.value.length >= MAX_LENGTH && event.key !== 'Backspace' && event.key !== 'Clear') {
        event.preventDefault();
        return;
    }

    if (ALLOWED_KEYS.includes(event.key)) {
        updateInputValue(displayInput, event.key);
    }

    if (event.key === 'Backspace') {
        displayInput.value = displayInput.value.slice(0, -1);
        updateInputValue(displayInput);
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
}

function updateInputValue(displayInput, key =null) {
    let currentValue = displayInput.value;

    if (key) {
        currentValue += key;
    }

    currentValue = sanitizeInput(currentValue);
    currentValue = maskNumber(currentValue);
    displayInput.value = currentValue;
}