/* Miscellaneous utility */

function truncateToFiveDecimals(num) {
    // Convert the number to a string with 5 decimal places
    let truncated = (num).toFixed(5);
    
    // Remove any trailing zeros after the decimal point
    truncated = truncated.replace(/\.?0+$/, '');
    
    // Convert the string back to a number
    return Number(truncated);
}

/* Calculator button synthax */
const validOperations = ['+','-','x','÷','%'];
const parenthesisArray = ['(',')'];

document.addEventListener('DOMContentLoaded', function () {
    const display = document.getElementById('textDisplay');
    const buttons = document.querySelectorAll('#calculatorContainer button');
    // All of the buttons
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const buttonValue = this.textContent;

            if (buttonValue !== '=') {
                if (display.textContent === '0') {
                    display.textContent = buttonValue;
                } else {
                    display.textContent += buttonValue;
                }
            }
        });
    });
    // Reset button
    document.getElementById('btnReset').addEventListener('click', function () {
        display.textContent = '0';
    });
    // Evaluate button
    document.getElementById('btnEqual').addEventListener('click', function () {
        // Split input for formatting
        var currDisplay = display.textContent;
        // Regular expression to match the characters +, -, x, and ÷
        const operatorsRegex = /([+\-x÷%()])/;
        // split display by operators
        var arrayDisplay = currDisplay.split(operatorsRegex);
        // Check that the input is valid. If not, display error
        // Cases in which an input is invalid:
        // numbers that do not make sense (multiple dots for instance)
        // or only one number and operation
        // or insufficiently closed parenthesis
        // or two operations in a row
        // Check valid parenthesis
        const countParenthesis = {};
        for (const num of arrayDisplay) {
            countParenthesis[num] = countParenthesis[num] ? countParenthesis[num] + 1 : 1;
        }
        // Iterate only if the parenthesis are empty
        const emptyParenthesis = (JSON.stringify(countParenthesis) === '{}');
        if (!emptyParenthesis){
            if ( (! ('(' in countParenthesis) ) || (! (')' in countParenthesis) ) ){
                if (countParenthesis['('] != countParenthesis[')']){
                    display.textContent = 'ERROR';
                }
            }
        }

        // Remove empty spaces if there are parenthesis, as it generates empty spaces by default
        if (countParenthesis['('] || arrayDisplay.includes('%')){
            arrayDisplay = arrayDisplay.filter(item => item !== '');
        }

        console.log(arrayDisplay);

        // Check if there are empty spaces (means there are two operations) in a row
        /*
        if (arrayDisplay.includes("")) {
            display.textContent = 'ERROR';
            return;
        }
        */

        // Check sufficient numbers
        if (arrayDisplay.length < 3){
            // if there is a percentage, then just take the percentage. If not, then end
            if (arrayDisplay.includes('%')){
                const percCalc = Number(arrayDisplay[0])/100;
                display.textContent = percCalc;
                return;
            }else{
                display.textContent = 'ERROR';
            }
        }

        // Check numbers make sense
        // prev Operation is to check there are not two operations in a row
        var prevOperation = 0;
        arrayDisplay.forEach(function(item) {
            if (!validOperations.includes(item) && !parenthesisArray.includes(item) ){
                prevOperation = 0;
                var res = Number(item);
                if (isNaN(res)){
                    display.textContent = 'ERROR';
                }
            }
            else if (validOperations.includes(item)){
                if (item != '%'){
                    if (prevOperation > 0){
                        display.textContent = 'ERROR';
                    }else{
                        prevOperation++;
                    }
                }
            }
        });
        

        // If input is valid, call operate, if not terminate the function early
        if (display.textContent == 'ERROR'){
            return;
        }
        
        // Execute operation
        const result = evaluateExpression(arrayDisplay);
        display.textContent = truncateToFiveDecimals(result);
    });


});

/* Calculator mathematical operations*/
const add = function(a,b) {
	return a + b;
};

const subtract = function(a,b) {
	return a - b;
};

const multiply = function(a,b) {
	return a*b;
};

const divide = function(a,b) {
    if (b != 0){
        return a/b;
    }
};

const operate = function(a,b,operation){
    // Initialize result
    var result = 0;
    // Convert user input to numbers
    a = Number(a);
    b = Number(b);
    switch(operation) {
        case "+":
          result = add(a,b);
          break;
        case "-":
          // code block
          result = subtract(a,b);
          break;
        case "x":
          // code block
          result = multiply(a,b);
          break;
        case "÷":
            result = divide(a,b);
            // code block
            break;
        default:
          // code block
          result = "ERROR";
      }
    return result;
};

// Recursive function to evaluate the expression
function evaluateExpression(tokens) {
    function parseExpression(tokens) {
        let stack = [];
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i];

            if (token === '(') {
                let openParens = 1;
                let j = i + 1;
                while (j < tokens.length && openParens > 0) {
                    if (tokens[j] === '(') openParens++;
                    if (tokens[j] === ')') openParens--;
                    j++;
                }
                if (openParens === 0) {
                    const subExpression = tokens.slice(i + 1, j - 1);
                    stack.push(parseExpression(subExpression));
                    i = j;
                } else {
                    return "ERROR"; // Mismatched parentheses
                }
            } else if (validOperations.includes(token)) {
                stack.push(token);
                i++;
            } else {
                stack.push(Number(token));
                i++;
            }
        }

        // Handle the percent operator
        for (let j = 0; j < stack.length; j++) {
            if (stack[j] === "%") {
                const left = stack[j - 1];
                const result = left/100;
                stack.splice(j - 1, 2, result);
                j--; // Adjust index due to splicing
            }
        }

        // Now perform the multiplication and division
        for (let j = 0; j < stack.length; j++) {
            if (stack[j] === "x" || stack[j] === "÷") {
                const left = stack[j - 1];
                const operator = stack[j];
                const right = stack[j + 1];
                const result = operate(left, right, operator);
                stack.splice(j - 1, 3, result);
                j--; // Adjust index due to splicing
            }
        }

        // Now perform the addition and subtraction
        let result = stack[0];
        for (let j = 1; j < stack.length; j += 2) {
            const operator = stack[j];
            const nextValue = stack[j + 1];
            result = operate(result, nextValue, operator);
        }

        return result;
    }

    return parseExpression(tokens);
}
