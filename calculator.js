let calculator = document.querySelector('.calculator');
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
let power = document.querySelector('.power');
let percent = document.querySelector('.percent');
let pi = document.querySelector('.pi');
let fact = document.querySelector('.factorial');
let sqroot = document.querySelector('.root')


let expressionEvalMode = false;


// Some adjusts for android font sizes and small screens
// Respect large system font but truncate values so they fit

let floatSci;
let floatDec;
let maxLength;

function testDisplaySetFloats() {
    let computedFont = window.getComputedStyle(display, 
            null).getPropertyValue('font-size').slice(0,-2);
    let computedWidth = window.getComputedStyle(calculator, 
            null).getPropertyValue('width').slice(0,-2);
    let computedHeight = window.getComputedStyle(calculator, 
            null).getPropertyValue('height').slice(0,-2);

    // dimensions are slow to update after re-orientation
    if (screen.orientation && 
            (screen.orientation.type == "portrait-primary") && 
            computedWidth > computedHeight) {
        computedWidth = computedHeight;
    }

    // Test for small screens on largest font
    if (computedFont > 70 && computedWidth <= 340) {
        floatSci = 5;
        floatDec = 6;
        maxLength = 11;
    } else if (computedFont > 60 && computedWidth <= 340) {
        floatSci = 6;
        floatDec = 7;
        maxLength = 12;
    } else {
        floatSci = 7;
        floatDec = 9;
        maxLength = 13;
    }

    // values can be longer in landscape mode for browsers that support this
    if (screen.orientation && 
            (screen.orientation.type == "landscape-primary") && 
            screen.orientation.angle == 90) {
        if (computedFont > 70 && computedHeight <= 340) {
            floatSci = 7;
            floatDec = 13;
            maxLength = 15;
        } else {
            floatSci = 10;
            floatDec = 15;
            maxLength = 18;
        }
    }

}

testDisplaySetFloats();

// For supporting browsers (Firefox and Chrome but not Safari)
if (screen.orientation) {
    screen.orientation.addEventListener('change', testDisplaySetFloats);
}

const calc = {
    'inputStr':'',
    'ans': 0,
    'displayStr':'',
    'displayStrNonDec':'',
    'displayStrDec':'',
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

function updateDisplayEval() {
    if (!calc.displayStr) {
        calc.displayStr = calc.inputStr;
    }
    
    adjustDisplayFontSize();

    display.textContent = calc.displayStr;
    calc.displayStr = '';
}

function updatePreview() {
    preview.textContent = calc.previewStr;
}

// Add event listeners
// Numbers
for (let each of numbers) {
    each.addEventListener('click', () => {
        calc.inputStr = calc.inputStr + each.textContent;
        updateDisplay();
        // If equals was just pressed, a new number should be a reset
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

    if (expressionEvalMode) {
        // you can add one period per number chunk
        numericChunk = findNumericChunk(calc.inputStr);

        if (numericChunk.length === 0) {
            calc.inputStr = '0.';
        } else {
            if (numericChunk.search(/[.]/g) === -1) {
                calc.inputStr += '.';
            } else {
                return;
            }
        }
        updateDisplayEval();
        return;
    }


    // Regular (non-expression evaluation) mode
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

    if (expressionEvalMode) {
        if (calc.inputStr.length === 0 || 
                calc.inputStr === '-') {
            return;
        } else {
            calc.inputStr = calc.inputStr + ' + ';
            updateDisplayEval();
            return;
        }
    }

    operate(addition);
})

subtract.addEventListener('click', () => {
    // Use to make negatives as well
    if (calc.inputStr.length === 0 && 
            calc.lastOperator !== returnAns) { // after equals, subtract
        calc.inputStr = '-';
        updateDisplay();
        return;
    } else if (calc.inputStr === '-') { // allowing a toggle
        calc.inputStr = '';
        updateDisplay();
        return;
    }
    operate(subtraction);
})


divide.addEventListener('click', () => {
    operate(division);
})

multiply.addEventListener('click', () => {
    operate(multiplication);
})

power.addEventListener('click', () => {
    operate(raisePower);
});

percent.addEventListener('click', () => {
    if (calc.inputStr && calc.inputStr !== '-') {
        calc.inputStr = ((+calc.inputStr)/100).toString();
        updateDisplay();
    } else if (calc.lastOperator == returnAns && calc.operand1) {
        calc.operand1 = calc.operand1/100;
        calc.displayStr = calc.operand1.toString();
        truncateDecimals();
        updateDisplay();
    }
});

pi.addEventListener('click', () => {
    // Pi as first input on cleared display
    if ((calc.inputStr.length === 0 || calc.inputStr === '-') && 
            calc.lastOperator !== returnAns) {
        calc.previewStr = calc.inputStr + '\u03C0';
        calc.inputStr += (Math.PI.toFixed(floatDec)).toString();
    
    // Multiplying a previous answer by pi
    } else if ((calc.inputStr.length === 0 || calc.inputStr === '-') && 
            calc.lastOperator === returnAns) {
        
        // Format for preview first
        calc.displayStr = calc.ans.toString();
        truncateDecimals();
        calc.previewStr = calc.displayStr + '\u03C0';
        calc.displayStr = '';

        // Format input as well
        calc.ans = calc.ans * Math.PI;
        calc.inputStr = calc.ans.toString();
        calc.displayStr = calc.inputStr;
        truncateDecimals();
        calc.inputStr = calc.displayStr;
        calc.displayStr = '';
        calc.operand1 = 0;
    
    // Multiplying current display by pi
    } else {
        // Format for preview first
        calc.displayStr = calc.inputStr;
        truncateDecimals();
        calc.previewStr = calc.displayStr + '\u03C0';

        // Next format input display
        calc.inputStr = (+calc.inputStr * Math.PI).toFixed(floatDec).toString();
        calc.displayStr = calc.inputStr; // to format
        truncateDecimals();
        calc.inputStr = calc.displayStr;
        calc.displayStr = '';
    }
    updatePreview();
    updateDisplay();
});

fact.addEventListener('click', () => {

    // Factorial cannot be first input
    if ((calc.inputStr.length === 0 || calc.inputStr === '-') && 
            calc.lastOperator !== returnAns) {
        return;

    // Factorial of previous answer
    } else if ((calc.inputStr.length === 0 || calc.inputStr === '-') && 
            calc.lastOperator === returnAns) {

        // Format for preview first
        calc.displayStr = calc.ans.toString();
        truncateDecimals();
        calc.previewStr = calc.displayStr + '!';
        calc.displayStr = '';

        // Format input as well
        calc.ans = factorial(calc.ans);
        calc.inputStr = calc.ans.toString();
        calc.displayStr = calc.inputStr;
        truncateDecimals();
        calc.inputStr = calc.displayStr;
        calc.displayStr = '';
        calc.operand1 = 0;
    
    // Factorial of current input
    } else {
        // Format for preview first
        calc.displayStr = calc.inputStr;
        truncateDecimals();
        calc.previewStr = calc.displayStr + '!';

        // Next format input display
        calc.inputStr = (factorial(+calc.inputStr)).toString();
        calc.displayStr = calc.inputStr; // to format
        truncateDecimals();
        calc.inputStr = calc.displayStr;
        calc.displayStr = '';
    }
    updatePreview();
    updateDisplay();
});


// sqroot.addEventListener('click', () => {
//     // Square root or negative square root of following input
//     if ((calc.inputStr.length === 0 || calc.inputStr === '-') && 
//             calc.lastOperator !== returnAns) {
//         calc.previewStr = calc.inputStr + '\u221A(';
//         calc.inputStr = calc.previewStr;
//         updateDisplay();
//         updatePreview();
//             }
// });


equals.addEventListener('click', () => {
    operate(returnAns);
    // If next key is a number, the operands should clear - added to event listeners for numbers
});

// Two operand functionality
function operate(mathFunction) {
    calc.previewStr = ''; // for pi display
    updatePreview();

    // console.log(`Operand 1 is ${calc.operand1}`);
    // console.log(`Operand 2 is ${calc.operand2}`);

    /* --- Make more robust to bad input ----*/
    // Pressing function buttons without number input should do nothing
    // Except if you have just returned an ans with equals
    if ((!calc.inputStr || calc.inputStr == '-') && mathFunction !== returnAns && 
                calc.lastOperator !== returnAns) {
        // But you can update the operation being performed
        calc.lastOperator = mathFunction;
        return;
    // ignore an equals after an operation completely
    } else if ((!calc.inputStr || calc.inputStr == '-') && mathFunction == returnAns && 
        calc.lastOperator !== returnAns) {
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

    // console.log("about to truncate!");
    // console.log(calc);
    // console.log(`Display String Length is ${calc.displayStr.length} chars long`)
    // console.log(`Display String Non-Decimal is ${calc.displayStrNonDec.length} chars long`)
    // console.log(`Display String Decimal is ${calc.displayStrDec.length} chars long`);

     // Maintain existing scientific notation for decimals
     if (calc.displayStrDec.length > floatSci && 
                calc.displayStr.search((/[e]/g)) !== -1) {
        calc.displayStr = ((+calc.displayStr).toExponential(floatSci)).toString();
        return;
    }

    // For a number that's all decimals
    // Six is kind of arbitrary but it seems like the max
    // precision the  ans variable tends to store
    if (calc.displayStrDec.length >= 6 && 
            calc.displayStrNonDec.length <= 2) {
        shortFloat = (+calc.displayStr).toFixed(floatDec);
        calc.displayStr = shortFloat.toString();
    // Number that is all decimals plus medium length number
    } else if (calc.displayStr.length > maxLength && 
                calc.displayStrNonDec.length > 2 && 
                calc.displayStrNonDec.length <= (maxLength - 6)) { // mostly decimals
        shortFloat = (+calc.displayStr).toFixed(floatDec - 3);
        calc.displayStr = shortFloat.toString();
    // Long decimals in a fairly long number
    } else if (calc.displayStr.length > maxLength && 
                calc.displayStrNonDec.length > (maxLength - 6)) {
        shortFloat = (+calc.displayStr).
            toFixed(Math.max(2, maxLength - calc.displayStrNonDec.length - 1));
        calc.displayStr = shortFloat.toString();
    }
    
    // Apply scientific notation to large numbers
    if (calc.displayStrNonDec.length > maxLength || 
            (calc.displayStrDec.length > 0 && 
                calc.displayStrNonDec.length > (maxLength - 3))) {
        calc.displayStr = ((+calc.displayStr).toExponential(floatSci)).toString();
        // But remove that odd plus formatting
        plusIndex = calc.displayStr.search((/[+]/g));
        calc.displayStr = calc.displayStr.slice(0, plusIndex) + 
            calc.displayStr.slice(plusIndex + 1);
    }

}

function addCommas() {
    splitAtDecimal();

    // If it's become large for JavaScript just return it
    if (calc.displayStr === 'Infinity') {
        return;
    }

    // Might have been better to work with the number Value, but...
    if (calc.displayStrNonDec.length > 0) {
        numArray = calc.displayStrNonDec.match(/[\-0-9]/g);
        if (numArray) calc.displayStrNonDec = numArray.join('');
    }
    
    if (calc.displayStrNonDec.length > 3) {
        let commasString = '';
        let negSign = '';


        // save the negative sign but don't include in commas!
        if (calc.displayStrNonDec[0] === '-') {
            negSign = '-';
            calc.displayStrNonDec = calc.displayStrNonDec.slice(1);
        }

        let tempNonDecStr = calc.displayStrNonDec;
        while (tempNonDecStr.slice(0, -3).length > 0) {
            commasString = ','+ tempNonDecStr.slice(-3) + commasString;
            tempNonDecStr = tempNonDecStr.slice(0, -3);
        }
        // add any left over digits to the start
        commasString = tempNonDecStr + commasString;
        // And re-create final string
        calc.displayStr = negSign + commasString + calc.displayStrDec;
    }
}

function adjustDisplayFontSize() {
    if (calc.displayStr.length > (maxLength - 2)) {
        display.style.fontSize = '36px';
    } else if (calc.displayStr.length > (maxLength - 4)) {
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
    if (a < 0 && b > 0 && b < 1) {
        calc.previewStr = "Keep it real!"
        console.log("You raised a negative number to a fractional exponent, but negative numbers don't have real roots. Ignoring the exponent.");
        updatePreview();
        setTimeout( () => {
            calc.previewStr = '';
            updatePreview();
        }, 3000);
        return a;
    }
    return a ** b;
}

function factorial(a) {
    if (a < 0 || (a % 1 != 0)) {
        calc.previewStr = "Math domain error"
        console.log("The factorial operation can only be applied to positive integers");
        updatePreview();
        setTimeout( () => {
            calc.previewStr = '';
            updatePreview();
        }, 3000);
        return a;
    }
    ans = 1;
    for (let i = a; i > 1; i--) {
        ans *= i;
    }
    return ans;
};

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
        case '^':
            btn = power;
            break;
        case '%':
            btn = percent;
            break;
        case '!':
            btn = fact;
            break;
        default:
            return;
    }

    btn.click();
    btn.classList.add('pressed');

    setTimeout( () => {
        btn.classList.remove('pressed');
    }, 100);
});