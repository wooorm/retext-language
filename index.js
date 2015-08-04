/**
 * @author Titus Wormer
 * @copyright 2014-2015 Titus Wormer
 * @license MIT
 * @module retext:language
 * @fileoverview Detect the language of text with Retext.
 */

'use strict';

/*
 * Dependencies.
 */

var franc = require('franc');
var visit = require('unist-util-visit');
var nlcstToString = require('nlcst-to-string');

/**
 * Patch a `language` and `languages` properties on `node`.
 *
 * @param {NLCSTNode} node - Node.
 * @param {Array.<Array.<string, number>>} languages - Languages.
 */
function patch(node, languages) {
    var data = node.data || {};
    var primary = languages[0][0];

    data.language = primary === 'und' ? null : primary;
    data.languages = languages;

    node.data = data;
}

/**
 * Deep regular sort on the number at `1` in both objects.
 *
 * @example
 *   > [[0, 20], [0, 1], [0, 5]].sort(sort);
 *   // [[0, 1], [0, 5], [0, 20]]
 *
 * @param {Object} a - Value.
 * @param {Object} b - Comparator.
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
 * @param {Object.<string, number>} dictionary - Map of
 *   language-codes to distances.
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
 * Patch a properties on `SentenceNode`s.
 *
 * @param {NLCSTSentenceNode} node - Sentence.
 */
function any(node) {
    patch(node, franc.all(nlcstToString(node)));
}

/**
 * Factory to gather parents and patch them based on their
 * childrens directionality.
 *
 * @return {function(node, index, parent)} - Can be passed
 *   to `visit`.
 */
function concatenateFactory() {
    var queue = [];

    /**
     * Gather a parent if not already gathered.
     *
     * @param {NLCSTChildNode} node - Child.
     * @param {number} index - Position of `node` in
     *   `parent`.
     * @param {NLCSTParentNode} parent - Parent of `child`.
     */
    function concatenate(node, index, parent) {
        if (
            parent &&
            (parent.type === 'ParagraphNode' || parent.type === 'RootNode') &&
            queue.indexOf(parent) === -1
        ) {
            queue.push(parent);
        }
    }

    /**
     * Patch one parent.
     *
     * @param {NLCSTParentNode} node - Parent
     * @return {Array.<Array.<string, number>>} - Language
     *  map.
     */
    function one(node) {
        var children = node.children;
        var length = children.length;
        var index = -1;
        var languages;
        var child;
        var dictionary = {};
        var tuple;

        while (++index < length) {
            child = children[index];
            languages = child.data && child.data.languages;

            if (languages) {
                tuple = languages[0];

                if (tuple[0] in dictionary) {
                    dictionary[tuple[0]] += tuple[1];
                } else {
                    dictionary[tuple[0]] = tuple[1];
                }
            }
        }

        return sortDistanceObject(dictionary);
    }

    /**
     * Patch all parents in reverse order: this means
     * that first the last and deepest parent is invoked
     * up to the first and highest parent.
     */
    function done() {
        var index = queue.length;

        while (index--) {
            patch(queue[index], one(queue[index]));
        }
    }

    concatenate.done = done;

    return concatenate;
}

/**
 * Transformer.
 *
 * @param {NLCSTNode} cst - Syntax tree.
 */
function transformer(cst) {
    var concatenate = concatenateFactory();

    visit(cst, 'SentenceNode', any);
    visit(cst, concatenate);

    concatenate.done();
}

/**
 * Attacher.
 *
 * @return {Function} - `transformer`.
 */
function attacher() {
    return transformer;
}

/*
 * Expose.
 */

module.exports = attacher;
