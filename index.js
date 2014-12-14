/**
 * Dependencies.
 */

var Retext = require('wooorm/retext@0.5.0-rc.1');
var language = require('wooorm/retext-language@0.3.3');
var debounce = require('component/debounce@1.0.0');

/**
 * Retext.
 */

var retext = new Retext().use(language);

/**
 * Fixtures.
 */

var fixtures = require('./fixtures.js');

/**
 * DOM elements.
 */

var $input = document.getElementsByTagName('textarea')[0];
var $output = document.getElementsByTagName('output')[0];

/**
 * Event handlers
 */

function oninputchange() {
    retext.parse($input.value, function (err, tree) {
        if (err) throw err;

        $output.textContent = tree.data.language;
    });
}

/**
 * Attach event handlers.
 */

$input.addEventListener('input', debounce(oninputchange, 50));

/**
 * Set a random fixture.
 */

$input.value = fixtures[Math.floor(Math.random() * fixtures.length)];

/**
 * Provide initial answer.
 */

oninputchange();
