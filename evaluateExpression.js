// inputStr = '10! / 2! x 900% + -23^.3 / 4! x -3 + 2.08 + 2^10 x -2';
// expressionStr = '16329600 + 2.875 + 2.08 + -2048';
// inputTest = '2.08';

// evaluateExpression(inputStr);

function evaluateExpression(inputStr) {

    console.log(`Evaluating: ${inputStr}`);

    // Factorial
    operatorRegex = /[!]/g;
    operatorFunction = factorial;
    allowedNumericRegex = /[^0-9]/g; // only defined for non-neg integers
    numOperands = 1;

    while (inputStr.search(operatorRegex) !== -1) {
        inputStr = parseOperator(inputStr, operatorFunction,
            operatorRegex, allowedNumericRegex, numOperands);
        console.log(inputStr);
    }

    // Percent
    operatorRegex = /[%]/g;
    operatorFunction = takePercent;
    allowedNumericRegex = /[^\-\.0-9]/g; // all numbers
    numOperands = 1;

    while (inputStr.search(operatorRegex) !== -1) {
        inputStr = parseOperator(inputStr, operatorFunction,
            operatorRegex, allowedNumericRegex, numOperands);
            console.log(inputStr);
    }


    // Exponents
    operatorRegex = /[\^]/g;
    operatorFunction = raisePower;
    allowedNumericRegex = /[^\-\.0-9]/g; // all numbers
    numOperands = 2;

    while (inputStr.search(operatorRegex) !== -1) {
        inputStr = parseOperator(inputStr, operatorFunction,
            operatorRegex, allowedNumericRegex, numOperands);
        console.log(inputStr);
    }

    // Multiplication and Division
    operatorRegex = / x | \/ /g;
    operatorFunction = multOrDivide;
    allowedNumericRegex = /[^\-\.0-9]/g; // all numbers
    numOperands = 2;

    while (inputStr.search(operatorRegex) !== -1) {
        inputStr = parseOperator(inputStr, operatorFunction,
            operatorRegex, allowedNumericRegex, numOperands);
        console.log(inputStr);
    }

    // Addition and Subtraction
    operatorRegex = / \+ | \- /g;
    operatorFunction = addOrSubtract;
    allowedNumericRegex = /[^\-\.0-9]/g; // all numbers
    numOperands = 2;

    while (inputStr.search(operatorRegex) !== -1) {
        inputStr = parseOperator(inputStr, operatorFunction,
            operatorRegex, allowedNumericRegex, numOperands);
        console.log(inputStr);
    }

}

function parseOperator(expressionStr, operatorFunction,
        operatorRegex, allowedNumericRegex, numOperands) {
    
    index = expressionStr.search(operatorRegex);

    // First Operand
    tempSubStr1 = expressionStr.slice(0, index);
    nonNumberIndex1 = tempSubStr1.split('').
            reverse().join('').
            search(allowedNumericRegex);

    if (nonNumberIndex1 === -1) { // start of string
        operand1 = tempSubStr1;
        nonNumberIndex1 = operand1.toString().length;
    } else {
        operand1 = tempSubStr1.slice(-nonNumberIndex1);
    }

    if (numOperands === 1) {
        ans = operatorFunction(operand1);
        newStr = tempSubStr1.slice(0, -nonNumberIndex1) + 
            ans.toString() + expressionStr.slice(index + 1);

        return newStr;
    }


    // Second Operand
    if (operatorFunction == multOrDivide || 
                operatorFunction == addOrSubtract) {
        tempSubStr2 = expressionStr.slice(index + 3);
    } else {
        tempSubStr2 = expressionStr.slice(index + 1);
    }
    
    nonNumberIndex2 = tempSubStr2.search(allowedNumericRegex);

    if (nonNumberIndex2 === -1) { // end of string
        operand2 = tempSubStr2;
        nonNumberIndex2 = operand2.toString().length;
    }
    else {
        operand2 = tempSubStr2.slice(0, nonNumberIndex2);
    }


    // Evaluate
    if (operatorFunction == multOrDivide || 
            operatorFunction == addOrSubtract) {
        currentOperator = expressionStr[index + 1];
        currentFunction = operatorFunction(currentOperator);
        ans = currentFunction(+operand1, +operand2);
        nonNumberIndex2 += 2;
    } else {
        ans = operatorFunction(+operand1, +operand2);
    }

    // Concatenate the new string
    newStr = tempSubStr1.slice(0, index - nonNumberIndex1) + 
        ans.toString() + 
        expressionStr.slice(index + 1 + nonNumberIndex2);

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

function findNumericChunk(inputStr) {
    nonNumericIndex = inputStr.split('').
            reverse().join('').search(/[^\-\.0-9]/g);
        if (nonNumericIndex === -1 ) { // start of string
            numericChunk = inputStr;
        } else {
            numericChunk = inputStr.slice(-nonNumericIndex);
        }
    return numericChunk;
}