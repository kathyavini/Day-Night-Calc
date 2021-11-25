/* This function will work on any string representing
a mathematical expression limited to the characters:

( ) x / + - ^ ! √ % π

And evaluate it according to proper order of operations.
Return value is also a string.

String formatting:
- there must be spaces around all binary operators (except ^)
- there must be no space before and one space after unary operators
    except when followed by a term-closing parenthesis ')'
- all parentheses must be matched
- there must be no extra whitespace
- superfluous parentheses (e.g enclosing the whole expression or 
    square root radicands) are fine
- operations that produce non-real numbers will give a warning
    in the console and will adjust the operand to something 
    acceptable, rather than halting the evaluation

See below for an example of an acceptable string:*/

expressionStr = "(90π + (√4)! x 35^(5 - 3) + (3! x 2)% )";
consoleLogging = false; // Shows the expression at each iteration

const allNumbers = /[^e\+\-\.0-9]/g; /* This regex matches the first 
non-numeric char, allowing negative signs and scientific notation */

function evaluateExpression(inputStr) {

    if (consoleLogging) console.log(`Evaluating: ${inputStr}`);

    // Parentheses - will work with nesting as long as ( ) are matched
    let operatorRegex = /[\)]/g; // first parenthesis that is closed
    let operatorFunction = insideParens;
    let allowedNumericRegex = /[\(]/g; // Allows everything up to the prev open parentheses
    let numOperands = 1;

    while (inputStr.search(operatorRegex) !== -1) {

        inputStr = parseOperator(inputStr, operatorFunction,
                operatorRegex, allowedNumericRegex, numOperands);
        if (consoleLogging) console.log(inputStr);
    }

    // Square roots
    operatorRegex = /\u221A/g;
    operatorFunction = squareRoot;
    allowedNumericRegex = allNumbers;
    numOperands = 2; // To select the operand to the right of the √; first operand unused

    while (inputStr.search(operatorRegex) !== -1) {

        inputStr = parseOperator(inputStr, operatorFunction,
                operatorRegex, allowedNumericRegex, numOperands);
        if (consoleLogging) console.log(inputStr);
    }

    // Factorial
    operatorRegex = /[!]/g;
    operatorFunction = factorial;
    allowedNumericRegex = allNumbers;
    numOperands = 1;


    while (inputStr.search(operatorRegex) !== -1) {

        inputStr = parseOperator(inputStr, operatorFunction,
                operatorRegex, allowedNumericRegex, numOperands);
        if (consoleLogging) console.log(inputStr);
    }

    // Percent
    operatorRegex = /[%]/g;
    operatorFunction = takePercent;
    allowedNumericRegex = allNumbers;
    numOperands = 1;

    while (inputStr.search(operatorRegex) !== -1) {

        inputStr = parseOperator(inputStr, operatorFunction,
                operatorRegex, allowedNumericRegex, numOperands);
        if (consoleLogging) console.log(inputStr);
    }

    // Pi Symbol
    operatorRegex = /\u03C0/g;
    operatorFunction = multiplyByPi;
    allowedNumericRegex = allNumbers;
    numOperands = 1;

    while (inputStr.search(operatorRegex) !== -1) {

        inputStr = parseOperator(inputStr, operatorFunction,
                operatorRegex, allowedNumericRegex, numOperands);
        if (consoleLogging) console.log(inputStr);
    }

    // Exponents
    operatorRegex = /[\^]/g;
    operatorFunction = raisePower;
    allowedNumericRegex = allNumbers;
    numOperands = 2;

    while (inputStr.search(operatorRegex) !== -1) {

        inputStr = parseOperator(inputStr, operatorFunction,
                operatorRegex, allowedNumericRegex, numOperands);
        if (consoleLogging) console.log(inputStr);
    }

    // Multiplication and Division
    operatorRegex = / x | \/ /g;
    operatorFunction = multOrDivide;
    allowedNumericRegex = allNumbers;
    numOperands = 2;

    while (inputStr.search(operatorRegex) !== -1) {
        inputStr = parseOperator(inputStr, operatorFunction,
                operatorRegex, allowedNumericRegex, numOperands);
        if (consoleLogging) console.log(inputStr);
    }

    // Addition and Subtraction
    operatorRegex = / \+ | \- /g;
    operatorFunction = addOrSubtract;
    allowedNumericRegex = allNumbers;
    numOperands = 2;

    while (inputStr.search(operatorRegex) !== -1) {
        inputStr = parseOperator(inputStr, operatorFunction,
                operatorRegex, allowedNumericRegex, numOperands);
        if (consoleLogging) console.log(inputStr);
    }

    if (inputStr === '') return '0';

    return inputStr;
}


function parseOperator(expressionStr, operatorFunction,
        operatorRegex, allowedNumericRegex, numOperands) {

    let index = expressionStr.search(operatorRegex);

    // First Operand
    let tempSubStr1 = expressionStr.slice(0, index);
    let operandStr1 = lastNumericChunk(tempSubStr1, allowedNumericRegex);
    
    // Exceptions for standalone pi and neg pi
    if (operatorFunction == multiplyByPi) {
        switch (expressionStr[index-1]) {
            case '-': // really stands for -1
                operandStr1 = '-1';
                break;
            case '(':
            case undefined: //start of line
            case ' ': // pi after an operator
                operandStr1 = 1;
                break;
        }
    }
    
    let stringBefore;
    switch (operatorFunction) {
        case insideParens:
            // + 1 to account for the open parenthesis
            stringBefore = tempSubStr1.slice(0, 
                -(operandStr1.length + 1));
            break;
        case squareRoot:
            // no operand before this operator
            stringBefore = tempSubStr1; 
            break;
        case multiplyByPi:
             // Standalone pi and neg pi
            switch (expressionStr[index-1]) {
                case '-': // length of 1
                    stringBefore = tempSubStr1.slice(0, -1)
                    break;
                case '(': // length of 0
                case undefined:
                case ' ': 
                    stringBefore = tempSubStr1;
                    break;
                default: // E.g. 40π
                    stringBefore = tempSubStr1.slice(0, 
                        -operandStr1.length);
            }
            break;
        default:
            stringBefore = tempSubStr1.slice(0, 
                -operandStr1.length);
    }


    // Single operand evaluation
    let ans;
    let newStr;
    let stringAfter;

    if (numOperands === 1 ) {

        if (operatorFunction == insideParens) {
            ans = operatorFunction(operandStr1);
        } else {
            ans = operatorFunction(+operandStr1);
        }
        
        stringAfter = expressionStr.slice(index + 1);
        
        newStr = stringBefore + ans.toString() + stringAfter;

        return newStr;
    }


    // Second Operand
    let tempSubStr2;

    if (operatorFunction == multOrDivide || operatorFunction == addOrSubtract) {
        tempSubStr2 = expressionStr.slice(index + 3); // because of spaces
    } else {
        tempSubStr2 = expressionStr.slice(index + 1); // e.g. exponent, square root since the parenthesis was removed at previous step
    }

    let operandStr2 = firstNumericChunk(tempSubStr2, allowedNumericRegex);
    stringAfter = tempSubStr2.slice(operandStr2.length);

    // Two operand evaluation
    if (operatorFunction == multOrDivide || operatorFunction == addOrSubtract) {
        // Need to figure out which operation it is
        let currentOperator = expressionStr[index + 1];
        let currentFunction = operatorFunction(currentOperator);
        ans = currentFunction(+operandStr1, +operandStr2);
    } else if (operatorFunction == squareRoot) {
        // In this case only after the root matters
        ans = operatorFunction(+operandStr2);
    } else {
        // Only exponent in this form right now
        ans = operatorFunction(+operandStr1, +operandStr2);
    }

    newStr = stringBefore + ans.toString() + stringAfter;

    return newStr;
}


function takePercent(a) {
    return a/100;
}

function multOrDivide(operator) {
    if (operator === 'x') {
        return multiplication;
    } else {
        return division;
    }
}

function addOrSubtract(operator) {
    if (operator === '+') {
        return addition;
    } else {
        return subtraction;
    }
}

function multiplyByPi(a) {
    return (a*Math.PI)
}

function insideParens(a) {
    let ans = evaluateExpression(a);
    return ans;
}

function lastNumericChunk(inputStr, allowedNumericRegex=/[^e\+\-\.0-9]/g) {
    let numericChunk;
    let nonNumericIndex = inputStr.split('').
            reverse().join('').search(allowedNumericRegex);
        if (nonNumericIndex === -1 ) { // start of string
            numericChunk = inputStr;
        } else if (nonNumericIndex === 0) { // last input not numeric
            numericChunk = '';
        } else {
            numericChunk = inputStr.slice(-nonNumericIndex);
        }
    return numericChunk;
}

function firstNumericChunk(inputStr, allowedNumericRegex=/[^e\+\-\.0-9]/g) {
    let numericChunk;
    let nonNumericIndex = inputStr.search(allowedNumericRegex);

    if (nonNumericIndex === -1) { // end of string
        numericChunk = inputStr;
    } else {
        numericChunk = inputStr.slice(0, nonNumericIndex);
    }

    return numericChunk;
}


// Functions for modifying the calc.inputString in eval mode
function testOperator(opString) {

    // Some allowed exceptions
    switch (opString) {

        // Basic operators
        case ' + ':
        case ' - ':
        case ' x ':
        case ' / ':

        // Characters basic operators can follow
            switch (lastTwoChars()) {
                case '% ':
                case '! ':
                case '\u03C0 ': //pi
                    // but you don't want to double the space
                    calc.inputStr = calc.inputStr.slice(0, -1);
                    return true;

                // ditto for the versions with parentheses
                case ' )':
                    // Remove space
                    calc.inputStr = calc.inputStr.slice(0, -2) + ')';
                    return true;
            }
            switch (lastChar()) {
                // These versions without trailing space can occur after using
                // delete on a subsequent binary operator
                case ')':
                case '%':
                case '!':
                case '\u03C0':
                    return true;
            }
            break;

        // Special cases parentheses can follow
        case ')':
            if (numOpenParens() <= numCloseParens()) {
                return false;
            }

            switch (lastTwoChars()) {
                case '% ':
                case '! ':
                case '\u03C0 ': //pi
                    return true;
                }
            switch (lastChar()) {
                case ')':
                    return true;
            }
        // Kind of a strange one. Good for most except after numbers
        case '(':
            switch(lastChar()) {
                case '^':
                    return true;
            }
            switch (lastTwoChars()) {
                case 'x ':
                case '+ ':
                case '/ ':
                case '- ':
                case ' (':
                case '(': // i.e start of line only. No unlimited nesting
                case '√(':
                    return true;
            }
            break;
        case '^':
            switch(lastTwoChars()) {
                /* Raising a unary operator expression to a power directly
                cannot work because unary operators require the space to be 
                parsed and and ^ wants both terms snug...
                
                However, it will work if you wrap the
                unary term in parentheses */
                case ' )':
                    // but you need to get rid of the space
                    calc.inputStr = calc.inputStr.slice(0, -2) + ')';
                    return true;
                }
                switch(lastChar()) {
                    case ')': // i.e. just standard after a number
                        return true;
                }
            break;

        // Unary operators
        case '% ':
        case '! ':
            switch (lastChar()) {
                // Can be applied to expression terms
                case ')':
                    return true;
            }
            break;
        
        // Pi is like a unary operator and a number both, depending on context
        case '\u03C0 ': //pi
            switch (lastChar()) {
                case ')': // can multiply an expression by pi
                case '(': // can start a term with pi
                    return true;
                }
                switch (lastTwoChars()) { // Using π where a number can go
                    case 'x ':
                    case '+ ':
                    case '/ ':
                    case '- ':
                    case ' (':
                    case '√(':
                        return true;
            }
        break;  
    }

    // All else - good after numbers; i.e. can't chain operators
    numericChunk = lastNumericChunk(calc.inputStr);
    if (numericChunk.length === 0) {
        return false
    }
    return true;
}

function printOperator(opString) {

    if (!testOperator(opString)) return;

    calc.inputStr = calc.inputStr + opString;
    updateDisplayEval();
}


// Functions specifically on calc.inputStr
function lastTwoChars() {
    return calc.inputStr.slice(-2);
}
function lastChar() {
    return calc.inputStr.slice(-1);
}

function numOpenParens() {
    let match = calc.inputStr.match(/\(/g);
    if (match) {
        return match.length;
    }
    return 0;
}

function numCloseParens() {
    let match = calc.inputStr.match(/\)/g);
    if (match) {
        return match.length;
    }
    return 0;
}

function newOpenParensAllowed() {

    switch (lastChar()) {
        case '(': // One level of nesting allowed. Then it will fail testOperator
        case '^':
            return true;
    }
    switch (lastTwoChars()) {
        case 'x ':
        case '/ ':
        case '+ ':
        case '- ': // allowing a new binary term to be opened
            return true;
    }
    return false;
}