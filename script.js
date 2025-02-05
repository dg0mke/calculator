const display = document.querySelector(".display");
const digits = document.querySelectorAll(".digit");
const decimalBtn =  document.querySelector(".decimal");
const operators = document.querySelectorAll(".operator");
const clearBtn = document.querySelector(".clear");
const sqrtBtn = document.querySelector(".sqrt");
const equal = document.querySelector(".equal");

// Handle digits
digits.forEach((digit) => {
    digit.addEventListener("click", () => {
        display.textContent += digit.textContent;
        operators.forEach(operator => operator.disabled = false);
        decimalBtn.disabled = false;
    })
});

// Handle operators
operators.forEach((operator) => {
    operator.addEventListener("click", () => {
        display.textContent += operator.textContent;
        operators.forEach(operator => operator.disabled = true);
        digits.forEach(digit => digit.disabled = false);
        decimalBtn.disabled = false;
    });
});

// Handle decimals
decimalBtn.addEventListener("click", () => {
    const parts = display.textContent.split(/[\+\−\×\÷]/);
    const lastNumber = parts[parts.length - 1];

    if (lastNumber === "" || lastNumber === "-") {
        display.textContent += "0.";
    } else if (!lastNumber.includes(".")) {
        display.textContent += ".";
    }

    decimalBtn.disabled = true;
});

// Clear display
clearBtn.addEventListener("click", () => {
    display.textContent = "";
    operators.forEach(operator => operator.disabled = false);
    digits.forEach(digit => digit.disabled = false);
});

// Handle square root
sqrtBtn.addEventListener("click", () => {
    const lastChar = display.textContent.slice(-1);

    // Allow `√` only when starting a number or an expression
    if (display.textContent === "" || ["+", "−", "×", "÷", "("].includes(lastChar)) {
        display.textContent += "√";
    }
});

// Evaluate expression(s)
const operate = () => {
    let expression = display.textContent;

    if (expression.startsWith("+")) {
        expression = expression.slice(1);
    }

    // Replace the operator symbols with JavaScript ones
    expression = expression.replace(/÷/g, "/").replace(/×/g, "*").replace(/−/g, "-");
    
    expression = expression.replace(/√(\d+(\.\d*)?)/g, (_match, num) => {
        return +(Math.sqrt(parseFloat(num))).toFixed(2);
    });

    if (expression.startsWith("*") || expression.startsWith("/")) {
        return "Malformed expression";
    }

    const evaluateMD = (exp) => {
        const regex = /(-?\d+(\.\d*)?)\s*([*/])\s*(-?\d+(\.\d*)?)/g;

        while (regex.test(exp)) {
            let newExp = exp.replace(regex, (_match, num1, _, operator, num2) => {
                const n1 = parseFloat(num1);
                const n2 = parseFloat(num2);

                if (operator === "/" && n2 === 0) {
                    return "ERROR";
                }

                return operator === "*" ? +(n1 * n2).toFixed(2) : +(n1 / n2).toFixed(2);
            });

            // Stop further processing if error occurs
            if (newExp.includes("ERROR")) {
                return "Cannot divide by zero";
            }

            exp = newExp;
        }

        return exp;
    };

    const evaluateAS = (exp) => {
        if (exp === "Cannot divide by zero") return exp;

        const regex = /(-?\d+(\.\d*)?)\s*([+\-])\s*(-?\d+(\.\d*)?)/g;

        while (regex.test(exp)) {
            exp = exp.replace(regex, (_match, num1, _, operator, num2) => {
                const n1 = parseFloat(num1);
                const n2 = parseFloat(num2);

                return operator === "+" ? +(n1 + n2).toFixed(2) : +(n1 - n2).toFixed(2);
            });
        }

        return exp;
    };

    // Handle multiplication and division first
    const firstHandle = evaluateMD(expression);

    // If an error occurred, stop it immediately
    if (firstHandle === "Cannot divide by zero") {
        return firstHandle;
    }

    // Then handle addition and subtraction
    return evaluateAS(firstHandle);
};

// Evaluate expression when equal sign is clicked
equal.addEventListener("click", () => {
    const result = operate();

    display.textContent = result;

    if (result === "Cannot divide by zero" || result === "Malformed expression") {
        operators.forEach(operator => operator.disabled = true);
        digits.forEach(digit => digit.disabled = true);
        decimalBtn.disabled = true;
    }

    digits.forEach(digit => digit.disabled = true);
    decimalBtn.disabled = true;
});