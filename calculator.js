let display = document.querySelector('.display-main');
let preview = document.querySelector('.display-preview');
let numbers = document.querySelectorAll('.number');
let clear = document.querySelector('.AC');
let decimal = document.querySelector('.decimal');
let del = document.querySelector('.del');
let add = document.querySelector('.add');
let subtract = document.querySelector('.subtract');
let divide = document.querySelector('.divide');
let multiply = document.querySelector('.multiply');
let equals = document.querySelector('.equals');


// Some adjusts for android font sizes and small screens
// (MOSTLY respect large font sizing but truncate values more)
let floatSci;
let floatDec;
let maxLength;

// Test for small android devices on largest font (but not landscape)
computedFont = window.getComputedStyle(display, null).getPropertyValue('font-size').slice(0,-2);
computedWidth = window.getComputedStyle(display, null).getPropertyValue('width').slice(0,-2);

if (computedFont > 70 && computedWidth <= 300) {
    floatSci = 3;
    floatDec = 6;
    maxLength = 9;
} else if (computedFont > 60 && computedWidth <= 300) {
    floatSci = 3;
    floatDec = 7;
    maxLength = 11;
} else {
    floatSci = 4;
    floatDec = 9;
    maxLength = 13;
}

const calc = {
    'inputStr':'',
    'ans': 0,
    'displayStr':'',
    'displayStrDec':'',
    'displayStrNonDec':'',
    'previewValue': 0,
    'previewStr':'',
    'lastOperator':'',
    'operand1': 0,
    'operand2': 0,
}

function updateDisplay() {
    if (!calc.displayStr) {
        calc.displayStr = calc.inputStr;
    }

    addCommas();
    adjustDisplayFontSize();

    display.textContent = calc.displayStr;
    calc.displayStr = '';
}

function updatePreview() {
    preview.textContent = calc.previewStr;
}

// Add event listeners
for (let each of numbers) {
    each.addEventListener('click', () => {
        calc.inputStr = calc.inputStr + each.textContent;
        updateDisplay();
        // If equals was just pressed, a new number should reset values
        if (calc.lastOperator === returnAns) {
            calc.operand1 = 0;
            calc.operand2 = 0;
        }
    });
}

// Function buttons
clear.addEventListener('click', () => {
    for (key in calc) {
        calc[key] = '';
    }
    updateDisplay();
    updatePreview();
})

decimal.addEventListener('click', () => {
    if (calc.inputStr.length === 0) {
        calc.inputStr = '0.';
    } else {
        if (calc.inputStr.search(/[.]/g) === -1) {
            calc.inputStr += '.';
        } else {
            return;
        }
    }
    updateDisplay();
})

del.addEventListener('click', () => {
    calc.inputStr = calc.inputStr.slice(0, -1);
    updateDisplay();
})

add.addEventListener('click', () => {
    operate(addition);
})

subtract.addEventListener('click', () => {
    operate(subtraction);
})

divide.addEventListener('click', () => {
    operate(division);
})

multiply.addEventListener('click', () => {
    operate(multiplication);
})

equals.addEventListener('click', () => {
    operate(returnAns);
    // If next key is a number, the operands should clear
    // I'll add that to the event listeners for numbers
});

// Two operand functionality
function operate(mathFunction) {

    /* --- Make more robust to bad input ----*/
    // Pressing equals or other function buttons without input should do nothing
    if (!calc.inputStr && mathFunction !== returnAns && 
                calc.lastOperator !== returnAns) { // except for right after equals
        // But you can update the operation being performed
        calc.lastOperator = mathFunction;
        return;
    } else if (!calc.inputStr && mathFunction == returnAns && 
        calc.lastOperator !== returnAns) {
        // ignore an equals after an operation completely
        return;
    }
    /* -----------------------------------*/

    if (!calc.operand1) {
        calc.operand1 = +(calc.inputStr);
        calc.lastOperator = mathFunction;
    } else {
        calc.operand2 = +(calc.inputStr);
        calc.ans = calc.lastOperator(calc.operand1, calc.operand2);
        calc.operand1 = calc.ans;
        calc.displayStr = calc.ans.toString();
        truncateDecimals();
        calc.lastOperator = mathFunction;
    }
    updateDisplay();
    calc.inputStr = '';

    // Refresh operands - basically only for divide by 0
    if (isNaN(calc.operand1)) {
        calc.operand1 = 0;
    }
}

function appendToValue(item, value) {
    return value + item;
}




// Prettify functions
function splitAtDecimal() {
    decIndex = calc.displayStr.search((/[.]/g));
    if (decIndex !== -1) {
        calc.displayStrDec = calc.displayStr.substring(decIndex);
        calc.displayStrNonDec = calc.displayStr.substring(0, decIndex);
    } else {
        calc.displayStrDec = calc.displayStr.substring(0, decIndex);
        calc.displayStrNonDec = calc.displayStr.substring(decIndex);
    }
}
function truncateDecimals() {

    splitAtDecimal();

     // Maintain existing scientific notation; don't use toFixed() then    
     if (calc.displayStrDec.length > floatSci && 
                calc.displayStr.search((/[e]/g)) !== -1) {
        calc.displayStr = ((+calc.displayStr).toExponential(floatSci)).toString();
        return;
    }

    // Truncate so that decimals + nonDecimals < maxLength
    if (calc.displayStrDec.length > floatDec && 
            calc.displayStrNonDec.length <= 2) { // all decimals
        shortFloat = (+calc.displayStr).toFixed(floatDec);
        calc.displayStr = shortFloat.toString();
    } else if (calc.displayStrDec.length > floatDec && 
                calc.displayStrNonDec.length > 2 && 
                calc.displayStrNonDec.length <= maxLength - 6) { // mostly decimals
        shortFloat = (+calc.displayStr).toFixed(floatDec - 3);
        calc.displayStr = shortFloat.toString();
    } else if (calc.displayStrDec.length > 4 && 
                calc.displayStrNonDec.length > (maxLength - 6)) {
        shortFloat = (+calc.displayStr).
            toFixed(Math.max(2, maxLength - calc.displayStrNonDec.length));
        calc.displayStr = shortFloat.toString();
    } else
    
    // Apply scientific notation to large numbers
    if (calc.displayStr.length > maxLength) {
        calc.displayStr = ((+calc.displayStr).toExponential(floatSci)).toString();
        // But remove that odd plus formatting
        plusIndex = calc.displayStr.search((/[+]/g));
        calc.displayStr = calc.displayStr.slice(0, plusIndex) + 
            calc.displayStr.slice(plusIndex + 1);
    }

}

function addCommas() {

    splitAtDecimal();

    // Might have been better to work with the number Value, but...
    if (calc.displayStrNonDec.length > 0) {
        numArray = calc.displayStrNonDec.match(/[\-0-9]/g);
        calc.displayStrNonDec = numArray.join('');
    }
    
    if (calc.displayStrNonDec.length > 3) {
        let commasString = '';
        while (calc.displayStrNonDec.slice(0, -3).length > 0) {
            commasString += ','+ calc.displayStrNonDec.slice(-3);
            calc.displayStrNonDec = calc.displayStrNonDec.slice(0,-3);
        }
        // add any left over digits to the start
        commasString = calc.displayStrNonDec + commasString;
        // And re-create final string
        calc.displayStr = commasString + calc.displayStrDec;
    }
}

function adjustDisplayFontSize() {
    if (calc.displayStr.length > 11) {
        display.style.fontSize = '36px';
    } else if (calc.displayStr.length > 9) {
        display.style.fontSize = '42px';
    } else display.style.fontSize = '54px'; // the default-largest
}


// Math Operations
function division(a, b) {
    if (b == 0) {
        calc.previewStr = "Can't divide by 0";
        updatePreview();
        setTimeout( () => {
            calc.previewStr = '';
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
    }, 150);
});