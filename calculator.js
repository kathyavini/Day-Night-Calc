let display = document.querySelector('.display-main');
let preview = document.querySelector('.display-preview');

let displayValue = '';
let previewValue = '';

let operand1 = 0;
let operand2 = 0;
let lastOperation = '';
let numArray = [];

function updateDisplay() {
    // Add commas to the output
    prettifyDisplay();
    // Adjust font sizes
    if (displayValue.length > 9) {
        display.style.fontSize = "42px";
    }
    if (displayValue.length > 11) {
        display.style.fontSize = "36px";
    }
    display.textContent = displayValue;

    // Then return display to a useable form
    // Remove prev commas - this is probably not a great method
    if (displayValue.length > 0) {
        numArray = displayValue.match(/[\-\.0-9]/g);
        displayValue = numArray.join('');
    }
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
    operand1 = 0;
    operand2 = 0;
    lastOperation = '';
    display.style.fontSize = '52px';
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

let add = document.querySelector('.add');
add.addEventListener('click', () => {
    operate(addition);
})

let subtract = document.querySelector('.subtract');
subtract.addEventListener('click', () => {
    operate(subtraction);
})

let divide = document.querySelector('.divide');
divide.addEventListener('click', () => {
    operate(division);
})

let multiply = document.querySelector('.multiply');
multiply.addEventListener('click', () => {
    operate(multiplication);
})

let equals = document.querySelector('.equals');
equals.addEventListener('click', () => {
    operate(returnAns);
    operand2 = 0;
});

// Two operand functionality
function operate(mathFunction) {
    if (!operand1) {
        operand1 = +displayValue;
        lastOperation = mathFunction;
    } else {
        operand2 = +displayValue;
        operand1 = lastOperation(operand1, operand2);
        lastOperation = mathFunction;
        displayValue = operand1.toString();
        truncateDecimals();
    }
    updateDisplay();
    displayValue = '';
    if (isNaN(operand1)) {
        operand1 = 0;
    }
    return operand1;
}

function appendToValue(item, value) {
    return value + item;
}

// Calculator Operations

function division(a, b) {
    if (b == 0) {
        previewValue = "Can't divide by 0";
        updatePreview();
        setTimeout( () => {
            previewValue = '';
            updatePreview();
        }, 3000);
        return a;
    }
    return a / b;
}

function multiplication(a, b) {
    return a * b;
}

function subtraction(a, b) {
    return a - b;
}

function addition(a, b) {
    return a + b;
}

function squareRoot(a, b) {
    return Math.sqrt(a);
};

function raisePower(a, b) {
    return a ** b;
}

function factorial(a, b) {
    ans = 1;
    for (let i = a; i > 1; i--) {
        ans *= i;
    }
    return ans;
};

function makePercent(a) {
    return a/100;
}

function returnAns(a, b) {
    return a;
}

// Key binds
window.addEventListener("keydown", (ev) => {
    switch(ev.key) {
        case ' ':
            ev.preventDefault();
            break;
        case '/':
            ev.preventDefault();
            btn = divide;
            break;
        case '*':
            btn = multiply;
            break;
        case '=':
        case '+':
            btn = add;
            break;
        case '-':
            btn = subtract;
            break;
        case 'Backspace':
            btn = del;
            break;
        case 'Escape':
            btn = clear;
            break;
        case '1':
            btn = document.querySelector('.num1');
            break;
        case '2':
            btn = document.querySelector('.num2');
            break;
        case '3':
            btn = document.querySelector('.num3');
            break;
        case '4':
            btn = document.querySelector('.num4');
            break;
        case '5':
            btn = document.querySelector('.num5');
            break;
        case '6':
            btn = document.querySelector('.num6');
            break;
        case '7':
            btn = document.querySelector('.num7');
            break;
        case '8':
            btn = document.querySelector('.num8');
            break;
        case '9':
            btn = document.querySelector('.num9');
            break;
        case '0':
            btn = document.querySelector('.num0');
            break;
        case 'Enter':
            btn = document.querySelector('.equals');
            break;
        case '.':
            btn = decimal;
            break;
        default:
            return;
    }
    btn.click();
    btn.classList.add('pressed');

    setTimeout( () => {
        btn.classList.remove('pressed');
    }, 0);
});

function truncateDecimals() {
    // Truncate decimals
    // console.log(`displayValue is ${displayValue}`);
    // console.log(`type of displayValue is ${typeof(displayValue)}`)
    if (displayValue.search((/[e]/g)) !== -1) { // is scientific (decimal)
        displayValue = ((+displayValue).toExponential(3)).toString();
    } else { // Truncate decimals
        decIndex = displayValue.search((/[.]/g));
        if (decIndex !== -1) {
            decimalValues = displayValue.substring(decIndex);
            nonDecimalValues = displayValue.substring(0, decIndex);
            if (nonDecimalValues.length > 5) { // long string anyway
                shortFloat = (+displayValue).toFixed(4);
                displayValue = shortFloat.toString();
            } else if (decimalValues.length > 9) { // needs truncating
                shortFloat = (+displayValue).toFixed(9);
                displayValue = shortFloat.toString();
            }
        }
        if (displayValue.length > 13) { //needs sci notation applied
            displayValue = ((+displayValue).toExponential(3)).toString();
        }
    }
}

function prettifyDisplay() {
    // Add commas to non-decimal values
    decIndex = displayValue.search((/[.]/g));
    if (decIndex !== -1) {
        decimalValues = displayValue.substring(decIndex);
        nonDecimalValues = displayValue.substring(0, decIndex);
    } else {
        decimalValues = displayValue.substring(0, decIndex);
        nonDecimalValues = displayValue.substring(decIndex);
    }

    // console.log(`Non-decimal values string is ${nonDecimalValues}`);
    // console.log(`Decimal values string is ${decimalValues}`);
    // Remove prev commas - this is probably not a great method
    if (nonDecimalValues.length > 0) {
        numArray = nonDecimalValues.match(/[\-0-9]/g);
        nonDecimalValues = numArray.join('');
    }
    
    if (nonDecimalValues.length > 3) {
        let commasString = '';
        while (nonDecimalValues.slice(0, -3).length > 0) {
            commasString += ','+ nonDecimalValues.slice(-3);
            nonDecimalValues = nonDecimalValues.slice(0,-3);
        }
        // add any left over digits to the start
        commasString = nonDecimalValues + commasString;
        displayValue = commasString + decimalValues;
        displayValue = commasString + decimalValues;
    }
}