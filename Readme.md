# retext-language [![Build Status](https://img.shields.io/travis/wooorm/retext-language.svg?style=flat)](https://travis-ci.org/wooorm/retext-language) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-language.svg?style=flat)](https://coveralls.io/r/wooorm/retext-language?branch=master)

Detect the language of text with **[Retext](https://github.com/wooorm/retext "Retext")**.

## Installation

npm:
```sh
$ npm install retext-language
```

Component:
```sh
$ component install wooorm/retext-language
```

Bower:
```sh
$ bower install retext-language
```

## Usage

```js
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
        /**
         * 'Tots els éssers humans neixen lliures i iguals. All human beings are born free and equal.', 'cat' // Catalan
         * 'Toate ființele umane se nasc libere și egale. 人人生而自由﹐在尊嚴和權利上一律平等。', 'ron' // Romanian
         */

        tree.visit(tree.SENTENCE_NODE, function (node) {
            console.log(node.toString(), node.data.language);
        });
        /**
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

None, the plugin automatically detects the language of each sentence (using **[wooorm/franc](https://github.com/wooorm/franc)**), and stores the language in `sentenceNode.data.language`. Information about all detected languages is stored in `sentenceNode.data.languages`.

Additionally, the **retext-language** exposes the average of the detected languages on parents (paragraphs and roots), through `parent.data.language` and `parent.data.languages`.

## License

MIT © [Titus Wormer](http://wooorm.com)
