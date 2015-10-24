'use strict';

/* eslint-env mocha */

/*
 * Dependencies.
 */

var assert = require('assert');
var retext = require('retext');
var visit = require('unist-util-visit');
var language = require('./');

/*
 * Methods.
 */

var dequal = assert.deepEqual;

/*
 * Fixtures.
 */

var fixture =
    'Alle menslike wesens word vry. ' +
    'O Brasil caiu 26 posições em.\n' +
    'All human beings are born. ' +
    'Tous les êtres humains naissent. ' +
    'Another very English sentence. ' +
    '1.';

var sentences = ['afr', 'por', 'eng', 'fra', 'eng', null];
var paragraphs = [sentences.slice(0, 2), sentences.slice(2)];

/*
 * Tests.
 */

describe('language()', function () {
    var tree;

    before(function (done) {
        retext.use(language).process(fixture, function (err, file) {
            tree = file.namespace('retext').tree;

            done(err);
        });
    });

    it('should work', function () {
        var index = -1;

        visit(tree, 'SentenceNode', function (node) {
            dequal(node.data.language, sentences[++index]);
        });

        index = -1;

        visit(tree, 'ParagraphNode', function (node) {
            assert(paragraphs[++index].indexOf(node.data.language) !== -1);
        });

        assert(sentences.indexOf(tree.data.language) !== -1);
    });
});
