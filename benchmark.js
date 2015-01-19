'use strict';

var Benchmark,
    Retext,
    language;

/*
 * Dependencies.
 */

Benchmark = require('benchmark');
Retext = require('retext');
language = require('./');

/*
 * Dependencies.
 */

var retext,
    retextWithLanguage;

retext = new Retext();
retextWithLanguage = new Retext().use(language);

/*
 * Test data: A (big?) section (w/ 10 paragraphs, 50
 * sentences, 1,000 words);
 *
 * Source:
 *   http://www.gutenberg.org/files/10745/10745-h/10745-h.htm
 */

var sentence,
    paragraph,
    section;

sentence = 'Where she had stood was clear, and she was gone since Sir ' +
    'Kay does not choose to assume my quarrel.';

paragraph = 'Thou art a churlish knight to so affront a lady ' +
    'he could not sit upon his horse any longer. ' +
    'For methinks something hath befallen my lord and that he ' +
    'then, after a while, he cried out in great voice. ' +
    'For that light in the sky lieth in the south ' +
    'then Queen Helen fell down in a swoon, and lay. ' +
    'Touch me not, for I am not mortal, but Fay ' +
    'so the Lady of the Lake vanished away, everything behind. ' +
    sentence;

section = paragraph + Array(10).join('\n\n' + paragraph);

/*
 * Benchmarks
 */

/**
 * Log on start.
 */
function onstart() {
    console.log();
    console.log(this.name);
}

/**
 * Log on cycle.
 *
 * @param {Event} event
 */
function oncycle(event) {
    console.log(String(event.target));
}

var options,
    suite;

options = {
    'async': true,
    'onStart': onstart,
    'onCycle': oncycle
};

suite = new Benchmark.Suite(
    'A paragraph (5 sentences, 100 words)',
    options
);

suite.add('retext w/o retext-language', function () {
    retext.parse(paragraph, function () {});
});

suite.add('retext w/ retext-language', function () {
    retextWithLanguage.parse(paragraph, function () {});
});

suite.run();

suite = new Benchmark.Suite(
    'A section (10 paragraphs, 50 sentences, 1,000 words)',
    options
);

suite.add('retext w/o retext-language', function () {
    retext.parse(section, function () {});
});

suite.add('retext w/ retext-language', function () {
    retextWithLanguage.parse(section, function () {});
});

suite.run();
