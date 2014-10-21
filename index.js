'use strict';

/**
 * Dependencies.
 */

var franc,
    visit;

franc = require('franc');
visit = require('retext-visit');

/**
 * Deep regular sort on the number at `1` in both objects.
 *
 * @example
 *   > [[0, 20], [0, 1], [0, 5]].sort(sort);
 *   // [[0, 1], [0, 5], [0, 20]]
 *
 * @param {{1: number}} a
 * @param {{1: number}} b
 */

function sort(a, b) {
    return a[1] - b[1];
}

/**
 * Get a sorted array containing language--distance
 * tuples from an object with trigrams as its
 * attributes, and their occurence count as their
 * values.
 *
 * @param {Object.<string, number>} dictionary
 * @return {Array.<Array.<string, number>>} An
 *   array containing language--distance tupples,
 *   sorted by count (low to high).
 */

function sortDistanceObject(dictionary) {
    var distances,
        distance;

    distances = [];

    for (distance in dictionary) {
        distances.push([distance, dictionary[distance]]);
    }

    return distances.sort(sort);
}

/**
 * Set languages on `node` from multiple
 * language--distance tuples.
 *
 * @param {Node} node
 * @param {Array.<Array.<string, number>>} languages
 */

function setLanguages(node, languages) {
    var primaryLanguage;

    primaryLanguage = languages[0][0];

    node.data.language = primaryLanguage === 'und' ? null : primaryLanguage;
    node.data.languages = languages;
}

/**
 * Handler for a change inside a parent.
 *
 * @param {Parent} parent
 */

function onchangeinparent(parent) {
    var node,
        dictionary,
        languages,
        tuple;

    if (!parent) {
        return;
    }

    dictionary = {};

    node = parent.head;

    while (node) {
        languages = node.data.languages;

        if (languages) {
            tuple = languages[0];

            if (tuple[0] in dictionary) {
                dictionary[tuple[0]] += tuple[1];
            } else {
                dictionary[tuple[0]] = tuple[1];
            }
        }

        node = node.next;
    }

    setLanguages(parent, sortDistanceObject(dictionary));

    onchangeinparent(parent.parent);
}

/**
 * Handler for a change inside a `SentenceNode`.
 *
 * @this {SentenceNode}
 */

function onchange() {
    var self;

    self = this;

    setLanguages(self, franc.all(self.toString()));

    onchangeinparent(self.parent);
}

/**
 * Define `language`.
 *
 * @param {Node} tree
 */

function language(tree) {
    tree.visit(tree.PARAGRAPH_NODE, onchangeinparent);
}

/**
 * Define `attach`.
 *
 * @param {Retext} retext
 */

function attach(retext) {
    var SentenceNode;

    retext.use(visit);

    SentenceNode = retext.parser.TextOM.SentenceNode;

    SentenceNode.on('changetextinside', onchange);
    SentenceNode.on('removeinside', onchange);
    SentenceNode.on('insertinside', onchange);
}

/**
 * Expose `attach`.
 */

language.attach = attach;

/**
 * Expose `language`.
 */

module.exports = language;
