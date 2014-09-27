'use strict';

/**
 * Dependencies.
 */

var language,
    content,
    visit,
    Retext,
    assert;

language = require('..');
content = require('retext-content');
Retext = require('retext');
visit = require('retext-visit');
assert = require('assert');

/**
 * Retext.
 */

var retext;

retext = new Retext()
    .use(content)
    .use(visit)
    .use(language);

/**
 * Fixtures.
 */

var document,
    languages,
    paragraphLanguages,
    otherSentences,
    otherLanguages,
    otherParagraphLanguages;

document =
    'Alle menslike wesens word vry. ' +
    'O Brasil caiu 26 posições em.\n' +
    'All human beings are born. ' +
    'Tous les êtres humains naissent.';

languages = ['af', 'pt-BR', 'en', 'fr'];

paragraphLanguages = [
    ['af', 'pt-BR'], ['en', 'fr']
];

otherSentences = [
    'Bütün insanlar ləyaqət və hüquqlarına görə.',
    'Tots els éssers humans neixen lliures i iguals',
    'Genir pawb yn rhydd ac yn gydradd â\'i gilydd',
    'Heghlu\'meH QaQ jajvam'
];

otherLanguages = ['az', 'ca', 'cy', 'tlh'];

otherParagraphLanguages = [
    ['az', 'ca'], ['cy', 'tlh']
];

/**
 * Tests.
 */

describe('language()', function () {
    var tree;

    before(function (done) {
        retext.parse(document, function (err, node) {
            tree = node;

            done(err);
        });
    });

    it('should be a `function`', function () {
        assert(typeof language === 'function');
    });

    it('should process `Parent`', function () {
        var index;

        index = -1;

        tree.visitType(tree.SENTENCE_NODE, function (node) {
            index++;

            assert(node.data.language === languages[index]);
        });

        index = -1;

        tree.visitType(tree.PARAGRAPH_NODE, function (node) {
            index++;

            assert(paragraphLanguages[index].indexOf(
                node.data.language
            ) !== -1);
        });

        assert(languages.indexOf(tree.data.language) !== -1);
    });

    it('should set `language` to `null` when node has no value', function () {
        tree.visitType(tree.SENTENCE_NODE, function (node) {
            node.removeContent();

            assert(node.data.language === null);
        });

        tree.visitType(tree.PARAGRAPH_NODE, function (node) {
            assert(node.data.language === null);
        });

        assert(tree.data.language === null);
    });

    it('should re-process nodes when their value changes', function () {
        var index;

        index = -1;

        tree.visitType(tree.SENTENCE_NODE, function (node) {
            index++;

            node.replaceContent(otherSentences[index]);

            assert(
                node.data.language === otherLanguages[index]
            );
        });

        index = -1;

        tree.visitType(tree.PARAGRAPH_NODE, function (node) {
            index++;

            assert(otherParagraphLanguages[index].indexOf(
                node.data.language
            ) !== -1);
        });

        assert(otherLanguages.indexOf(tree.data.language) !== -1);
    });
});
