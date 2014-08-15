'use strict';

var franc = require('franc'),
    visit = require('retext-visit');

/**
 * Deep regular sort on the number at `1` in both objects.
 *
 * @param {Array} a
 * @param {Array} b
 * @api private
 */
function sort(a, b) {
    return a[1] - b[1];
}

function sortDistanceObject(distanceObject) {
    var distances = [],
        iterator = -1,
        distance;

    for (distance in distanceObject) {
        distances[++iterator] = [distance, distanceObject[distance]];
    }

    return distances.sort(sort);
}

function setLanguages(node, languages) {
    var primaryLanguage = languages[0][0];

    node.data.language = primaryLanguage === 'und' ? null : primaryLanguage;
    node.data.languages = languages;
}

function onchangeinparent(parent) {
    var node, languageObject, languages, iterator, length, language;

    if (!parent) {
        return;
    }

    node = parent.head;
    languageObject = {};

    while (node) {
        languages = node.data.languages;

        if (languages) {
            iterator = -1;
            length = languages.length;

            while (++iterator < length) {
                language = languages[iterator];

                if (language[0] in languageObject) {
                    languageObject[language[0]] += language[1];
                } else {
                    languageObject[language[0]] = language[1];
                }
            }
        }

        node = node.next;
    }

    setLanguages(parent, sortDistanceObject(languageObject));

    onchangeinparent(parent.parent);
}

function onchange() {
    setLanguages(this, franc.all(this.toString()));

    onchangeinparent(this.parent);
}

function plugin(tree) {
    tree.visitType(tree.PARAGRAPH_NODE, onchangeinparent);
}

exports = module.exports = plugin;

function attach(retext) {
    var TextOM = retext.parser.TextOM;

    retext.use(visit);

    TextOM.SentenceNode.on('changetextinside', onchange);
    TextOM.SentenceNode.on('removeinside', onchange);
    TextOM.SentenceNode.on('insertinside', onchange);
}

exports.attach = attach;
