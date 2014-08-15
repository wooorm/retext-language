'use strict';

var language, content, visit, Retext, assert, tree, languages,
    paragraphLanguages, otherSentences, otherLanguages,
    otherParagraphLanguages;

language = require('..');
content = require('retext-content');
Retext = require('retext');
visit = require('retext-visit');
assert = require('assert');

tree = new Retext()
    .use(content)
    .use(visit)
    .use(language)
    .parse(
        'Alle menslike wesens word vry. ' +
        'O Brasil caiu 26 posições em.\n' +
        'All human beings are born. ' +
        'Tous les êtres humains naissent.'
    );

languages = ['af', 'pt-BR', 'en', 'fr'];
paragraphLanguages = [['af', 'pt-BR'], ['en', 'fr']];

otherSentences = [
    'Bütün insanlar ləyaqət və hüquqlarına görə.',
    'Tots els éssers humans neixen lliures i iguals',
    'Genir pawb yn rhydd ac yn gydradd â\'i gilydd',
    'Heghlu\'meH QaQ jajvam'
];
otherLanguages = ['az', 'ca', 'cy', 'tlh'];
otherParagraphLanguages = [['az', 'ca'], ['cy', 'tlh']];

describe('language()', function () {
    it('should be of type `function`', function () {
        assert(typeof language === 'function');
    });

    it('should process each `SentenceNode`', function () {
        var iterator = -1;

        tree.visitType(tree.SENTENCE_NODE, function (sentenceNode) {
            assert(sentenceNode.data.language === languages[++iterator]);
        });

        iterator = -1;

        tree.visitType(tree.PARAGRAPH_NODE, function (paragraphNode) {
            assert(paragraphLanguages[++iterator].indexOf(
                paragraphNode.data.language
            ) !== -1);
        });

        assert(languages.indexOf(tree.data.language) !== -1);
    });

    it('should set each `language` attribute to `null` when a SentenceNode ' +
        'no longer has a value', function () {
            tree.visitType(tree.SENTENCE_NODE, function (sentenceNode) {
                sentenceNode.removeContent();
                assert(sentenceNode.data.language === null);
            });

            tree.visitType(tree.PARAGRAPH_NODE, function (paragraphNode) {
                assert(paragraphNode.data.language === null);
            });

            assert(tree.data.language === null);
        }
    );

    it('should automatically reprocess SentenceNodes when their values ' +
        'change', function () {
            var iterator = -1;

            tree.visitType(tree.SENTENCE_NODE, function (sentenceNode) {
                sentenceNode.replaceContent(otherSentences[++iterator]);
                assert(
                    sentenceNode.data.language === otherLanguages[iterator]
                );
            });

            iterator = -1;

            tree.visitType(tree.PARAGRAPH_NODE, function (paragraphNode) {
                assert(otherParagraphLanguages[++iterator].indexOf(
                    paragraphNode.data.language
                ) !== -1);
            });

            assert(otherLanguages.indexOf(tree.data.language) !== -1);
        }
    );
});
