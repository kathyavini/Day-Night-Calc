let display = document.querySelector('.display-main');
let preview = document.querySelector('.display-preview');

let displayValue = '';
let previewValue = '';

let operand1 = '';
let operand2 = '';

function updateDisplay() {
    display.textContent = displayValue;
}
function updatePreview() {
    preview.textContent = previewValue;
}

let numbers = document.querySelectorAll('.number');
for (let each of numbers) {
    each.addEventListener('click', () => {
        displayValue = appendToValue(each.textContent, displayValue);
        updateDisplay();
        
    });
}
let clear = document.querySelector('.AC');
clear.addEventListener('click', () => {
    displayValue = '';
    previewValue = '';
    updateDisplay();
    updatePreview();
})

let decimal = document.querySelector('.decimal');
decimal.addEventListener('click', () => {
    if (displayValue.length === 0) {
        displayValue = appendToValue('0.', displayValue)
    } else {
        if (displayValue.search(/[.]/g) === -1) {
            displayValue = appendToValue('.', displayValue)
        } else {
            return;
        }
    }
    updateDisplay();
})

let del = document.querySelector('.del');
del.addEventListener('click', () => {
    displayValue = displayValue.slice(0, -1);
    updateDisplay();
})


// let pi = document.querySelector('.pi');
// pi.addEventListener('click', () => {
//     if (displayValue.length === 0) {
//         displayValue = appendToValue('\u03C0', displayValue);
//         previewValue = appendToValue(Math.PI, previewValue);
//     } else {
//         return;
//         // I'll return to this!
//     }
//     updateDisplay();
//     updatePreview();
// })


function appendToValue(item, value) {
    return value + item;
}

// Calculator Operations

function division(a, b) {
    return a / b;
}

function multiplication(a, b) {
    return a - b;
}

function subtraction(a, b) {
    return a - b;
}

function addition(a, b) {
    return a + b;
}

function squareRoot(a) {
    return Math.sqrt(a);
};

function raisePower(a, b) {
    return a ** b;
}

function factorial(a) {
    ans = 1;
    for (let i = a; i > 1; i--) {
        ans *= i;
    }
    return ans;
};

function makePercent(a) {
    return a/100;
}