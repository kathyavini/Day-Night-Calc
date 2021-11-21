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
let sqroot = document.querySelector('.root');
let parentheses = document.querySelector('.parens');

let expressionEvalMode = false;
let squareRootMode = false;

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
        if (expressionEvalMode) {
            nonNumericChunk = findLastNonNumericChunk(calc.inputStr);
            switch (nonNumericChunk) {
                case '\u03C0 ':
                case '% ':
                case '! ':
                case ')':
                    return; // these need to be followed with operators
            }
            calc.inputStr = calc.inputStr + each.textContent;
            updateDisplayEval();
            return
        }
        calc.inputStr = calc.inputStr + each.textContent;
        updateDisplay();
        // If equals was just pressed, a new number should be a reset
        if (calc.lastOperator === returnAns) {
            calc.operand1 = 0;
            calc.operand2 = 0;
        }
    });
}


// Functions (non-operator)
clear.addEventListener('click', () => {
    for (key in calc) {
        calc[key] = '';
    }
    expressionEvalMode = false;
    squareRootMode = false;
    updateDisplay();
    updatePreview();
})

decimal.addEventListener('click', () => {
    
    // Expression evaluation mode
    if (expressionEvalMode) {
        // you can only add one period per number chunk
        numericChunk = findLastNumericChunk(calc.inputStr);

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

    // Regular mode
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
    if (expressionEvalMode && calc.inputStr === '') {
        expressionEvalMode = false;
        updateDisplayEval();
    } else if (expressionEvalMode) {
        updateDisplayEval();
    } else {
        updateDisplay();
    }
})

// Operators
add.addEventListener('click', () => {
    if (expressionEvalMode) {
        printOperator(' + ');
        return;
    }
    // Regular mode
    operate(addition);
})

subtract.addEventListener('click', () => {
    if (expressionEvalMode) {
        printOperator(' - ');
        return;
    }
    
    // Regular mode
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
    if (expressionEvalMode) {
        printOperator(' / ');
        return;
    }

    //Regular Mode
    operate(division);
})

multiply.addEventListener('click', () => {
    if (expressionEvalMode) {
        printOperator(' x ');
        return;
    }
    // Regular mode
    operate(multiplication);
})

power.addEventListener('click', () => {
    if (expressionEvalMode) {
        printOperator('^');
        return;
    }
    // Regular mode
    operate(raisePower);
});

percent.addEventListener('click', () => {
    if (expressionEvalMode) {
        printOperator('% ');
        return;
    }

    // Regular mode
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
    if (expressionEvalMode) {
        printOperator('\u03C0 ');
        return;
    }
    // Regular mode
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
    if (expressionEvalMode) {
        printOperator('! ');
        return;
    }

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
        console.log("Making factorial of current input!");
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


sqroot.addEventListener('click', () => {
    // Square root or negative square root of following input
    // Nothing else allowed for simplicity!
    if ((calc.inputStr.length === 0 || calc.inputStr === '-') && 
            calc.lastOperator !== returnAns) {
        calc.previewStr = calc.inputStr + '\u221A(';
        calc.inputStr = calc.previewStr;
        updateDisplay();

        expressionEvalMode = true;
        squareRootMode = true;
    }
});

parentheses.addEventListener('click', () => {
    if (expressionEvalMode && squareRootMode) {
        if (printOperator(')')) {
            console.log("I'm in squareRoot!");
            printOperator(')');
            calc.previewStr = evaluateExpression(calc.inputStr);
            updatePreview();
            calc.inputStr = calc.previewStr.slice(2, -1);
            expressionEvalMode = false;
            squareRootMode = false;
            operate(squareRoot);
            calc.inputStr = 1; // not used, but to prevent aborting
            operate(returnAns);
        }

    } else if (expressionEvalMode) {
        console.log("I'll put a closing parentheses if I can!");
        if (printOperator(')')) {
        }
    } else if (calc.inputStr === ''){
        console.log("My input is empty and I'm gonna enter expression eval mode!");
        calc.inputStr = '(';
        expressionEvalMode = true;
        updateDisplayEval();
    }
    // } else if (printOperator('')) {
    //     console.log("I'm going to enter evaluation mode after a num!");
    //     calc.inputStr += ' x (';
    //     expressionEvalMode = true;
    //     updateDisplayEval();
    // }
});

equals.addEventListener('click', () => {
    if (expressionEvalMode) {
        expressionEvalMode = false;
        calc.inputStr = evaluateExpression(calc.inputStr).slice(1, -1);
        console.log(calc);
    }
    operate(returnAns);
});

// Two operand functionality
function operate(mathFunction) {
    // clear preview at the right times
    switch (mathFunction) {
        case multiplication:
        case division:
        case addition:
        case subtraction:
        case power:
            calc.previewStr = '';
            updatePreview()
    }


    /* --- Make more robust to bad input ----*/
    // Pressing function buttons without number input should do nothing
    // Except if you have just returned an ans with equals
    if ((!calc.inputStr || calc.inputStr == '-') && 
            mathFunction !== returnAns && 
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
    // Main functionality
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
    // precision js tends to store for large floats?
    if (calc.displayStrDec.length >= 6 && 
            calc.displayStrNonDec.length <= 2) {
        shortFloat = (+calc.displayStr).toFixed(floatDec);
        calc.displayStr = shortFloat.toString();
    // Number that is all decimals plus medium length number
    } else if (calc.displayStr.length > maxLength && 
                calc.displayStrNonDec.length > 2 && 
                calc.displayStrNonDec.length <= (maxLength - 6)) {
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

function squareRoot(a) {
    if (a < 0 ) {
        calc.previewStr = "Keep it real!"
        console.log("Negative numbers don't have real square roots.");
        updatePreview();
        setTimeout( () => {
            calc.previewStr = '';
            updatePreview();
        }, 3000);
        return a;
    }
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
        case '(':
            if (expressionEvalMode) {
                return;
            }
            btn = parentheses;
            break;
        case ')':
            if (!expressionEvalMode) {
                return;
            }
            btn = parentheses;
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