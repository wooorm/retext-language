# retext-language [![Build Status](https://img.shields.io/travis/wooorm/retext-language.svg?style=flat)](https://travis-ci.org/wooorm/retext-language) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-language.svg?style=flat)](https://coveralls.io/r/wooorm/retext-language?branch=master)

Detect the language of text with **[Retext](https://github.com/wooorm/retext)**.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
$ npm install retext-language
```

[Component.js](https://github.com/componentjs/component):

```bash
$ component install wooorm/retext-language
```

[Bower](http://bower.io/#install-packages):

```bash
$ bower install retext-language
```

[Duo](http://duojs.org/#getting-started):

```javascript
var language = require('wooorm/retext-language');
```

## Usage

```javascript
var Retext = require('retext');
var visit = require('retext-visit');
var language = require('retext-language');

var retext = new Retext()
    .use(visit)
    .use(language);

retext.parse('Alle mennesker er født frie og', function (err, tree) {
    console.log(tree.data.language);
    /* 'nno' // Which is Norwegian Nynorsk. */
});

retext.parse(
    'Tots els éssers humans neixen lliures i iguals. ' + 
    'All human beings are born free and equal.\n' + 
    'Toate ființele umane se nasc libere și egale. ' + 
    '人人生而自由﹐在尊嚴和權利上一律平等。',
    function (err, tree) {
        console.log(tree.data.language);
        /* 'cat' // Catalan */

        tree.visit(tree.PARAGRAPH_NODE, function (node) {
            console.log(node.toString(), node.data.language);
        });
        /*
         * 'Tots els éssers humans neixen lliures i iguals. All human beings are born free and equal.', 'cat' // Catalan
         * 'Toate ființele umane se nasc libere și egale. 人人生而自由﹐在尊嚴和權利上一律平等。', 'ron' // Romanian
         */

        tree.visit(tree.SENTENCE_NODE, function (node) {
            console.log(node.toString(), node.data.language);
        });
        /*
         * 'Tots els éssers humans neixen lliures i iguals.', 'cat' // Catalan
         * 'All human beings are born free and equal.', 'eng' // English
         * 'Toate ființele umane se nasc libere și egale.', 'ron' // Romanian
         * '人人生而自由﹐在尊嚴和權利上一律平等。', 'cmn' // Mandarin Chinese
         */
    }
);
```

## Supported Languages

retext-language supports the 175 languages provided by **[wooorm/franc](https://github.com/wooorm/franc#supported-languages)**. 

**Note!** Results may vary depending on which [parser](https://github.com/wooorm/retext#parsers) you use. It’s probably better for most cases to detect the language (with **[wooorm/franc](https://github.com/wooorm/franc)**) before parsing, and choose a parser according to the results.

## API

None, **retext-language** automatically detects the language of each [`SentenceNode`](https://github.com/wooorm/textom#textomsentencenode-nlcstsentencenode) (using **[wooorm/franc](https://github.com/wooorm/franc)**), and stores the language in `node.data.language`. Additionally, information about all detected languages is stored in `node.data.languages`.

The average of the detected languages on parents ([paragraph](https://github.com/wooorm/textom#textomparagraphnode-nlcstparagraphnode)s and [root](https://github.com/wooorm/textom#textomrootnode-nlcstrootnode)s), through the same `parent.data.language` and `parent.data.languages`.

## Performance

On a MacBook air:

```text
A paragraph (5 sentences, 100 words)
retext w/o retext-language x 215 ops/sec ±1.48% (80 runs sampled)
retext w/ retext-language x 1.52 ops/sec ±1.27% (8 runs sampled)

A section (10 paragraphs, 50 sentences, 1,000 words)
retext w/o retext-language x 20.79 ops/sec ±2.92% (39 runs sampled)
retext w/ retext-language x 0.15 ops/sec ±4.92% (5 runs sampled)
```

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
