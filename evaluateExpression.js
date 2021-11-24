/* This function will work on any string representing
a mathematical expression limited to the characters:

( ) x / + - ^ ! √ % π

And evaluate it according to proper order of operations.
Return value is also a string.

String formatting:
- there must be spaces around all binary operators (except ^)
- there must be no space before and one space after unary operators
    (even when followed by a term-closing parenthesis)
- all parentheses must be matched
- there must be no extra whitespace
- superfluous parentheses (e.g enclosing the whole expression or 
    square root radicands) are fine
- operations that produce non-real numbers will give a warning
    in the console and then generally adjust the operand to
    something acceptable, rather than halting the evaluation

See below for an example of an acceptable string:
*/
expressionStr = "(90π + 2! x 35^(5 - 3) + (3! x 2)% )";

consoleLogging = false; // Shows the expression at each iteration
detailedLogging = false; // Extreme detail. Shows operands and substrings

allNumbers = /[^e\+\-\.0-9]/g; // Halts on the first non-numeric char including sci notation

function evaluateExpression(inputStr) {

    if (consoleLogging) console.log(`Evaluating: ${inputStr}`);

    // Parentheses - works with nesting but the calc won't generate that
    let operatorRegex = /[\)]/g; // first parenthesis that is closed
    let operatorFunction = insideParens;
    let allowedNumericRegex = /[\(]/g; // Anything up to the prev open parentheses
    let numOperands = 1;

    while (inputStr.search(operatorRegex) !== -1) {

        if (detailedLogging) console.log(`Processing Parentheses`);
        inputStr = parseOperator(inputStr, operatorFunction,
                operatorRegex, allowedNumericRegex, numOperands);
        if (consoleLogging) console.log(inputStr);
    }

    // And square roots, which are around the parentheses
    operatorRegex = /\u221A/g;
    operatorFunction = squareRoot;
    allowedNumericRegex = allNumbers;
    numOperands = 2; //testing if this is an easy way to get after the

    while (inputStr.search(operatorRegex) !== -1) {

        if (detailedLogging) console.log(`Processing Square Roots`);
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
        if (detailedLogging) console.log(`Processing Factorial`);
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

        if (detailedLogging) console.log(`Processing Percents`);
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

        if (detailedLogging) console.log(`Processing Pi's`);
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

        if (detailedLogging) console.log(`Processing Exponents`);
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
        if (detailedLogging) console.log(`Processing Multiplication and Division`);
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
        if (detailedLogging) console.log(`Processing Addition and Subtraction`);
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
    let opStr1 = lastNumericChunk(tempSubStr1, allowedNumericRegex);    
    
    let stringBefore;    
    if (operatorFunction == insideParens) {
        stringBefore = tempSubStr1.slice(0, -(opStr1.length + 1));
    } else if (operatorFunction == squareRoot) {
        stringBefore = tempSubStr1; // there is no operand before this operator
    } else if (operatorFunction == multiplyByPi) {
        // some exceptions for standalone pi and neg pi
        switch (expressionStr[index-1]) {
            case '-':
                opStr1 = '-1';
                stringBefore = tempSubStr1.slice(0, -1)
                break;
            case '(':
            case undefined: //start of line
            case ' ': // pi after an operator
                opStr1 = 1;
                stringBefore = tempSubStr1;
                break;
            default:
                stringBefore = tempSubStr1.slice(0, -opStr1.length);
        }
            
    } else {
        stringBefore = tempSubStr1.slice(0, -opStr1.length);
    }

    if (detailedLogging) console.log(`Identified first operand as: ${opStr1}`);
    if (detailedLogging) console.log(`Previous String is: ${stringBefore}`);


    // Single operand evaluation
    let ans;
    let newStr;
    let stringAfter;

    if (numOperands === 1 ) {

        if (operatorFunction == insideParens) {
            ans = operatorFunction(opStr1);
        } else {
            ans = operatorFunction(+opStr1);
        }
        
        stringAfter = expressionStr.slice(index + 1);
        
        newStr = stringBefore + ans.toString() + stringAfter;

        if (detailedLogging) console.log(`Answer is: ${ans}`);
        if (detailedLogging) console.log(`String after is: ${stringAfter}`);
        
        return newStr;
    }


    // Second Operand
    let tempSubStr2;

    if (operatorFunction == multOrDivide || operatorFunction == addOrSubtract) {
        tempSubStr2 = expressionStr.slice(index + 3); // because of spaces
    } else {
        tempSubStr2 = expressionStr.slice(index + 1); // e.g. exponent, square root since the parenthesis was removed at previous step
    }

    let opStr2 = firstNumericChunk(tempSubStr2, allowedNumericRegex);
    stringAfter = tempSubStr2.slice(opStr2.length);

    if (opStr2 === '-') opStr1 = '-1';

    if (detailedLogging) console.log(`Identified second operand as: ${opStr2}`);
    if (detailedLogging) console.log(`Following String is: ${stringAfter}`);


    // Two operand evaluation
    if (operatorFunction == multOrDivide || operatorFunction == addOrSubtract) {
        // Need to figure out which operation it is
        let currentOperator = expressionStr[index + 1];
        let currentFunction = operatorFunction(currentOperator);
        ans = currentFunction(+opStr1, +opStr2);
    } else if (operatorFunction == squareRoot) {
        // In this case only after the root matters
        ans = operatorFunction(+opStr2);
    } else {
        // Only exponent in this form right now
        ans = operatorFunction(+opStr1, +opStr2);
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


// Functions for testing and modifying the calc.inputString in eval mode
function testOperator(opString) {

    if (helperLogging) console.log(`Operator being tested is ${opString}`);
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
                    if (helperLogging) console.log("Binary operator can follow this char");
                    // but you don't want to double the space
                    calc.inputStr = calc.inputStr.slice(0, -1);
                    return true;
                // ditto for the versions with parentheses
                case ' )':
                    if (helperLogging) console.log("Binary operator can follow this char");
                    // but you don't want to double the space
                    calc.inputStr = calc.inputStr.slice(0, -2) + ')';
                    return true;
            }
            switch (lastChar()) {
                case ')': // must be followed by operation
                case '%': // these combos can happen after using delete
                case '!':
                case '\u03C0':
                    if (helperLogging) console.log("Binary operator can follow this char");
                    return true;
            }
            break;

        // Special cases parentheses can follow
        case ')':
            if (numOpenParens() <= numCloseParens()) {
                if (helperLogging) console.log("No unmatched parentheses");
                return false;
            }

            switch (lastTwoChars()) {
                case '% ':
                case '! ':
                case '\u03C0 ': //pi
                    if (helperLogging) console.log("A closing parenthesis can go here");
                    return true;
                }
            switch (lastChar()) {
                case ')':
                    if (helperLogging) console.log("A closing parenthesis can go here");
                    return true;
            }
        // Kind of a strange one. Good for most except after numbers
        // But probably won't be used unless I add nesting functionality
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
                // At the moment raising a unary operator
                // expression to a power cannot work
                // unary operators require the space
                // and ^ wants both terms snug...
                
                // However, it can work if you wrap the
                // unary term in parentheses
                case ' )':
                    if (helperLogging) console.log("You can raise this to a power");
                    // but you need to get rid of the space
                    calc.inputStr = calc.inputStr.slice(0, -2) + ')';
                    return true;
                }
                switch(lastChar()) {
                    case ')': // i.e. just standard after a number
                        if (helperLogging) console.log("You can raise an expression to a power");
                        return true;
                }
            break;

        // Unary operators
        case '% ':
        case '! ':
            switch (lastChar()) {
                case ')':
                    if (helperLogging) console.log("Unary operator can follow this char");
                    return true;
            }
            break;
        
        // Pi is like a unary operator and a number both, depending on context
        case '\u03C0 ': //pi
            switch (lastChar()) {
                case ')': // can multiply an expression by pi
                case '(': // can start a term with pi
                    if (helperLogging) console.log("Pi can follow this char");
                    return true;
                }
                switch (lastTwoChars()) { // basically anywhere a number can go
                    case 'x ':
                    case '+ ':
                    case '/ ':
                    case '- ':
                    case ' (':
                    case '√(':
                        if (helperLogging) console.log("Pi can follow this char");
                        return true;
            }
        break;  
    }

    // All else - good after numbers; i.e. can't chain operators
    numericChunk = lastNumericChunk(calc.inputStr);
    if (numericChunk.length === 0) {
        if (helperLogging) console.log("No numbers in this chunk");
        return false
    }
    if (helperLogging) console.log("That was a number so good to go");
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
        case '(': // allowing one level of nesting
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