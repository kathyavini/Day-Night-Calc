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
let previewNeedsClearing = false;

let helperLogging = false; // detailed console logging for troubleshooting
let helperLoggingPrettify = false; // detailed logging just for truncating

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
    'ans': '',
    'displayStr':'',
    'previewStr':'',
    'lastOperator':'',
    'operand1': '',
    'operand2': '',
}

function updateDisplay() {
    if (!calc.displayStr) {
        calc.displayStr = calc.inputStr;
    }
    calc.displayStr = addCommas(calc.displayStr);
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

// Event Listeners - Numbers
for (let each of numbers) {
    each.addEventListener('click', () => {

        if (expressionEvalMode) {
            switch (lastTwoChars()) {
                case '\u03C0 ': // pi
                case '% ':
                case '! ':
                    return; // these need to be followed with operators
            }
            switch (lastChar()) {
                case ')':
                    return // also needs operator
            }
            // Otherwise 
            calc.inputStr = calc.inputStr + each.textContent;
            updateDisplayEval();
            return
        }

        // Normal mode
        calc.inputStr = calc.inputStr + each.textContent;
        updateDisplay();

        // If equals was just pressed, a new number should be a reset
        if (calc.lastOperator === returnAns) {
            calc.operand1 = 0;
            calc.operand2 = 0;
        }
    });
}


// Event Listeners - Non-Operator Functions
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

    if (expressionEvalMode) {
        // you can only add one period per number chunk
        numericChunk = lastNumericChunk(calc.inputStr);

        if (numericChunk.length === 0) { // start of chunk
            calc.inputStr += '0.';
        } else if (numericChunk.search(/[.]/g) === -1) { // no dot yet
            calc.inputStr += '.';
        }

        updateDisplayEval();
        return;
    }

    // Regular mode
    if (calc.inputStr.length === 0) {
        calc.inputStr = '0.';
    } else if (calc.inputStr.search(/[.]/g) === -1) {
        calc.inputStr += '.';
    }
    updateDisplay();
})

del.addEventListener('click', () => {

    calc.inputStr = calc.inputStr.slice(0, -1);

    // Exit expression eval if you have deleted the opening parenthesis
    if (expressionEvalMode && calc.inputStr === '') {
        expressionEvalMode = false; 
        updateDisplay();
    } else if (expressionEvalMode) {
        updateDisplayEval();
    } else {
        updateDisplay();
    }
})

// Even listeners for the operators
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

        // Some adjusts for the fact a minus can be negative sign
        // or can be subtraction
        switch (calc.inputStr.slice(-2)) {
            case 'x ':
            case '/ ':
                calc.inputStr += '-';
                updateDisplayEval();
                return
            case '- ':
                calc.inputStr = calc.inputStr.slice(0, -2) + '+ ';
                updateDisplayEval();
                return
            case '+ ':
                calc.inputStr = calc.inputStr.slice(0, -2) + '- ';
                updateDisplayEval();
                return
        }
        switch (calc.inputStr.slice(-1)) {
            case '(':
            case '^':
                calc.inputStr += '-';
                updateDisplayEval();
                return
            default:
                printOperator(' - ');
        }
        return;
    }
    
    // Regular mode
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
    // When modifying input
    if (calc.inputStr && calc.inputStr !== '-') {
        calc.inputStr = ((+calc.inputStr)/100).toString();
        updateDisplay();
    // When modifying an answer from a prev operation
    } else if (calc.lastOperator == returnAns && calc.operand1) {
        calc.operand1 = calc.operand1/100;
        calc.displayStr = calc.operand1.toString();
        calc.inputStr = truncateDecimals(calc.inputStr);
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
        
        // Format preview
        calc.previewStr = truncateDecimals(calc.ans.toString()) + '\u03C0';

        // Format input
        calc.inputStr = truncateDecimals((calc.ans * Math.PI).toString());
        calc.operand1 = 0;
    
    // Multiplying input in the process of being entered by pi
    } else {

        // Preview shouldn't need truncating unless something weird is entered, but...
        calc.previewStr = makePreviewString() + truncateDecimals(calc.inputStr) + '\u03C0'

        // Format input display
        calc.inputStr = truncateDecimals((+calc.inputStr * Math.PI).toString());
    }

    updatePreview();
    updateDisplay();
    previewNeedsClearing = true;

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

        // Format preview
        calc.previewStr = truncateDecimals(calc.ans.toString()) + '!';

        // Format input
        calc.inputStr = (factorial(calc.ans)).toString();
        calc.inputStr = truncateDecimals(calc.inputStr);
        calc.operand1 = 0;
    
    // Factorial of current input
    } else {

        // Preview shouldn't need truncating unless something weird is entered
        calc.previewStr = makePreviewString() + truncateDecimals(calc.inputStr) + '!'

        // Operate factorial on input and format
        calc.inputStr = (factorial(+calc.inputStr)).toString();
        calc.inputStr = truncateDecimals(calc.inputStr);

    }

    updatePreview();
    updateDisplay();
    previewNeedsClearing = true;
});


sqroot.addEventListener('click', () => {

    if (expressionEvalMode) {
        // A very weird one in terms of rules
        switch (lastTwoChars()) {
            case 'x ':
            case '/ ':
            case '- ':
            case '+ ':
                calc.inputStr += '\u221A(';
                updateDisplayEval();
                squareRootMode = true;
                return
        }
        switch (lastChar()) {
            case '(':
            case '^':
            case '-':
                calc.inputStr += '\u221A(';
                updateDisplayEval();
                squareRootMode = true;
                return
            default:
                calc.inputStr += ' x \u221A(';
                updateDisplayEval();
                squareRootMode = true;
                return
        }
    }


    // If in regular mode, square root can only be the first input
    // but since it it is a parenthesis it will start eval mode
    if ((calc.inputStr.length === 0 || calc.inputStr === '-') && 
            calc.lastOperator !== returnAns) {

        calc.previewStr = calc.inputStr + '\u221A(';
        calc.inputStr = calc.previewStr;
        squareRootMode = true;
        expressionEvalMode = true;
        updateDisplay();
    }
});

parentheses.addEventListener('click', () => {
    
    if (expressionEvalMode && squareRootMode) {

        // Experimental and maybe I'll regret allowing this!!
        if (newOpenParensAllowed()) {
            printOperator('(');
            return
        }

        // If still within a larger expression
        if (numOpenParens() > numCloseParens() + 1) {
            
            // just close the parenthesis; don't eval
            printOperator(')');
            squareRootMode = false;
            return;
        }
            
        printOperator(')');

        // Show the root being taken
        rootExpression = calc.inputStr.slice(2, -1);
        solvedExpression = evaluateExpression(rootExpression);
        calc.previewStr = '\u221A(' +
                truncateDecimals(solvedExpression) +
                ')';
        updatePreview();

        // Replace input with the evaluated root
        calc.inputStr = squareRoot(solvedExpression).toString();
        calc.inputStr = truncateDecimals(calc.inputStr);
        updateDisplay();
        
        // And finish the operand there
        operate(returnAns);

        expressionEvalMode = false;
        squareRootMode = false;
        previewNeedsClearing = true;
        // }

    } else if (expressionEvalMode) {

        // Experimental and maybe I'll regret allowing this!!
        if (newOpenParensAllowed()) {
            printOperator('(');
            return
        }

        if (numOpenParens() === numCloseParens() + 1 && 
                    testOperator(')')) {

            if (helperLogging) console.log("Exiting eval mode");

            printOperator(')');

            // Show expression being evaluated
            calc.previewStr = makePreviewString() + calc.inputStr;
            updatePreview();
    
            // Replace input with the evaluated expression
            calc.inputStr = evaluateExpression(calc.inputStr).toString();
            calc.inputStr = truncateDecimals(calc.inputStr);
            updateDisplay();
    
            // And finish the operand there
            operate(returnAns);
            expressionEvalMode = false;
            previewNeedsClearing = true;

        } else { // Closing a parenthesis but not the final one
            
            if (helperLogging) console.log("Just printing a )");

            printOperator(')');
        }




    } else if (calc.inputStr === ''){

        if (helperLogging) console.log("My input is empty and I'm gonna enter expression eval mode!");

        calc.inputStr = '(';

        expressionEvalMode = true;
        updateDisplayEval();
    }
});

equals.addEventListener('click', () => {
    if (expressionEvalMode) {
        if (numOpenParens() !==  numCloseParens()) {
            calc.previewStr = "Please match all ()"
            updatePreview();
            setTimeout( () => {
                calc.previewStr = '';
                updatePreview();
            }, 3000);
            
            return
        }
    }
    operate(returnAns);
});

// Two operand functionality
function operate(mathFunction) {
    
    // Clear the preview screen when a fresh operator
    switch (mathFunction) {
        case multiplication:
        case division:
        case addition:
        case subtraction:
        case raisePower:
            calc.previewStr = '';
            updatePreview();
    }
    // Or if evaluate expression has just been applied
    if (previewNeedsClearing) {
        calc.previewStr = '';
        updatePreview();
        previewNeedsClearing = false;
    }
    
    if (helperLogging) {
        console.log("Here is the object I'm about to operate on");
        console.log(calc);
    }


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

    // Main functionality
    if (!calc.operand1) {
        calc.operand1 = +(calc.inputStr);
        calc.lastOperator = mathFunction;
    } else {
        calc.operand2 = +(calc.inputStr);
        calc.ans = calc.lastOperator(calc.operand1, calc.operand2);
        calc.operand1 = calc.ans;
        calc.displayStr = calc.ans.toString();
        calc.displayStr = truncateDecimals(calc.displayStr);
        calc.lastOperator = mathFunction;
    }

    if (helperLogging) {
        console.log("Here is the result of my operation:");
        console.log(calc);
    }

    updateDisplay();
    calc.inputStr = '';
}


// Functions that prettify the display
function splitAtDecimal(numString) {

    decIndex = numString.search((/[.]/g));
    if (decIndex !== -1) {
        decimals = numString.substring(decIndex);
        nonDecimals = numString.substring(0, decIndex);
    } else {
        decimals = numString.substring(0, decIndex);
        nonDecimals = numString.substring(decIndex);
    }

    return [decimals, nonDecimals];
}


function truncateDecimals(inputStr=calc.displayStr) {

    let [decimals, nonDecimals] = splitAtDecimal(inputStr);

    if (helperLoggingPrettify) console.log("About to truncate");
    if (helperLoggingPrettify) console.log(`String is ${inputStr}`)
    if (helperLoggingPrettify) console.log(`String Non-Decimal is ${nonDecimals.length} chars long`)
    if (helperLoggingPrettify) console.log(`String Decimal is ${decimals.length} chars long`);

     // Maintain existing scientific notation for decimals
     if (decimals.length > floatSci && 
                inputStr.search((/[e]/g)) !== -1) {
        inputStr = ((+inputStr).toExponential(floatSci)).toString();
        if (helperLoggingPrettify) console.log("Was already sci notation decimal");
        return inputStr;
    }

    // Six is kind of arbitrary but it seems like the precision js tends to store for large floats?
    if (decimals.length >= 6 && 
            nonDecimals.length <= 2) { // all decimals
        shortFloat = (+inputStr).toFixed(floatDec);
        inputStr = shortFloat.toString();
        if (helperLoggingPrettify) console.log("Treating as all decimals");
    // Number that is all decimals plus medium length number
    } else if (inputStr.length > maxLength && 
                nonDecimals.length > 2 && 
                nonDecimals.length <= (maxLength - 6)) {
        shortFloat = (+inputStr).toFixed(floatDec - 3);
        inputStr = shortFloat.toString();
        if (helperLoggingPrettify) console.log("Treating as a medium number");
    // Long decimals in a fairly long number
    } else if (inputStr.length > maxLength && 
                nonDecimals.length > (maxLength - 6)) {
        shortFloat = (+inputStr).
            toFixed(Math.max(2, maxLength - nonDecimals.length - 1));
        inputStr = shortFloat.toString();
        if (helperLoggingPrettify) console.log("Treating as a large number");
    }

    // A sloppy workaround to JS's precision issues
    let precision;
    [decimals, nonDecimals] = splitAtDecimal(inputStr);
    if (decimals && decimals.match((/0/g)) && //otherwise error
            decimals.match((/0/g)).length > 5) {
        
        if (helperLoggingPrettify) console.log('Too many zeros; discarding them');

        inputStr = inputStr.slice(0, (inputStr.search(/000000/g)));
    }
    if (decimals && decimals.match((/9/g)) && //otherwise error
        decimals.match((/9/g)).length > 5) {
        
        if (helperLoggingPrettify) console.log('Too many 9s; rounding up');

        precision = inputStr.slice(0, (inputStr.search(/999999/g))).length - 1;
        inputStr = (+inputStr).toPrecision(precision);
    }
    
    // Apply scientific notation to large numbers
    if (nonDecimals.length > maxLength || 
            (decimals.length > 0 && 
                nonDecimals.length > (maxLength - 3))) {
        inputStr = ((+inputStr).toExponential(floatSci)).toString();
        // But remove that odd plus formatting
        plusIndex = inputStr.search((/[+]/g));
        inputStr = inputStr.slice(0, plusIndex) + 
            inputStr.slice(plusIndex + 1);
        if (helperLoggingPrettify) console.log("Treating as number in need of sci notation");
    }

    return inputStr;

}

function addCommas(inputStr=calc.displayStr) {
    let [decimals, nonDecimals] = splitAtDecimal(inputStr);

    // If it's become large for JavaScript just return it
    if (inputStr === 'Infinity') {
        calc.previewStr = "Number too large"
        console.log("This is a number larger than JavaScript can handle");
        updatePreview();
        setTimeout( () => {
            calc.previewStr = '';
            updatePreview();
        }, 3000);
        return inputStr;
    }

    // Might have been better to work with the number Value, but...
    if (nonDecimals.length > 0) {
        numArray = nonDecimals.match(/[\-0-9]/g);
        if (numArray) nonDecimals = numArray.join('');
    }
    
    if (nonDecimals.length > 3) {
        let commasString = '';
        let negSign = '';


        // save the negative sign but don't include in commas!
        if (nonDecimals[0] === '-') {
            negSign = '-';
            nonDecimals = nonDecimals.slice(1);
        }

        let tempNonDecStr = nonDecimals;
        while (tempNonDecStr.slice(0, -3).length > 0) {
            commasString = ','+ tempNonDecStr.slice(-3) + commasString;
            tempNonDecStr = tempNonDecStr.slice(0, -3);
        }
        // add any left over digits to the start
        commasString = tempNonDecStr + commasString;
        // And re-create final string
        inputStr = negSign + commasString + decimals;
    }

    return inputStr;
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
        console.log("Negative numbers don't have real square roots. Taking the square root of the opposite instead");
        updatePreview();
        setTimeout( () => {
            calc.previewStr = '';
            updatePreview();
        }, 3000);
        return Math.sqrt(a*-1); // Not totally ideal, but...
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
        calc.previewStr = "Factorial domain error"
        console.log("The factorial operation can only be applied to positive integers");
        updatePreview();
        setTimeout( () => {
            calc.previewStr = '';
            updatePreview();
        }, 3000);
        return a;
    } else if (a > 170) {
        calc.previewStr = "Too big for factorial"
        console.log("This is a number larger than JavaScript can handle");
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

// Show operands in the preview area
// Could be extended if preview behaviour is changed
function makePreviewString() {
    let opSymbol;
    switch (calc.lastOperator) {
        case multiplication:
            opSymbol = ' x ';
            break; 
        case division:
            opSymbol = ' / ';
            break; 
        case addition:
            opSymbol = ' + ';
            break; 
        case subtraction:
            opSymbol = ' - ';
            break; 
        case raisePower:
            opSymbol = '^';
            break;
        default:
            opSymbol = '';
    }

    let prevOperand = truncateDecimals(calc.operand1.toString());

    return prevOperand + opSymbol;
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
        case ')':
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
