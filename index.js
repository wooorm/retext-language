var Retext = require('retext');
var language = require('retext-language');
var debounce = require('debounce');
var fixtures = require('retext-language-gh-pages/fixtures.js');

var inputElement = document.getElementsByTagName('textarea')[0];
var outputElement = document.getElementsByTagName('ol')[0];
var buttonElement = document.getElementsByTagName('button')[0];
var wrapperElement = document.getElementsByTagName('div')[0];

var retext = new Retext().use(language);

inputElement.addEventListener('input', debounce(detectLanguage, 50));

inputElement.value = getRandomFixture();

function getRandomFixture() {
    return fixtures[Math.floor(Math.random() * fixtures.length)];
}

function detectLanguage() {
    retext.parse(inputElement.value, function (err, tree) {
        if (err) throw err;

        visualiseResults(tree.data.languages);
    });
}

function visualiseResults(results) {
    wrapperElement.style.display = '';

    while (outputElement.firstElementChild) {
        outputElement.removeChild(outputElement.firstElementChild);
    }

    results = results.map(createResult);

    results.forEach(function (node) {
        outputElement.appendChild(node);
    });
}

function createResult(result, n) {
    var node = document.createElement('li');

    node.textContent = result[0] + ': ' + result[1];

    return node;
}

detectLanguage();