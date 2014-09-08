# retext-language [![Build Status](https://travis-ci.org/wooorm/retext-language.svg?branch=master)](https://travis-ci.org/wooorm/retext-language) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-language.svg)](https://coveralls.io/r/wooorm/retext-language?branch=master)

[![browser support](https://ci.testling.com/wooorm/retext-language.png) ](https://ci.testling.com/wooorm/retext-language)

---

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
var Retext = require('retext'),
    visit = require('retext-visit'),
    language = require('retext-language'),
    retext, root;

retext = new Retext()
    .use(visit)
    .use(language);

root = retext.parse('Alle mennesker er født frie og');

console.log(root.data.language); // 'no' // Norsk

root = retext.parse(
    'Tots els éssers humans neixen lliures i iguals. ' + 
    'All human beings are born free and equal.\n' + 
    'Toate ființele umane se nasc libere și egale. ' + 
    '人人生而自由﹐在尊嚴和權利上一律平等。'
);

console.log(root.data.language); // 'zh' // Chinese

root.visitType(root.PARAGRAPH_NODE, function (node) {
    console.log(node.toString(), node.data.language);
});
// 'Tots els éssers humans neixen lliures i iguals. All human beings are born free and equal.', 'en' // English
// 'Toate ființele umane se nasc libere și egale. 人人生而自由﹐在尊嚴和權利上一律平等。', 'zh' // Chinese

root.visitType(root.SENTENCE_NODE, function (node) {
    console.log(node.toString(), node.data.language);
});
// 'Tots els éssers humans neixen lliures i iguals.', 'ca' // Catalan; Valencian
// 'All human beings are born free and equal.', 'en' // English
// 'Toate ființele umane se nasc libere și egale.', 'ro' // Romanian; Moldavian; Moldovan
// '人人生而自由﹐在尊嚴和權利上一律平等。' 'zh' // Chinese
```

The example also uses [retext-visit](https://github.com/wooorm/retext-visit).

## Supported Languages
retext-language supports the 86 languages provided by [wooorm/franc](https://github.com/wooorm/franc). There's a whole list of supported languages at [franc's repo](https://github.com/wooorm/franc#supported-languages).

**Note!** Results may vary depending on which [parser](https://github.com/wooorm/retext#parsers) you use. It's probably better for some cases to detect the language (with [wooorm/franc](https://github.com/wooorm/franc)) before parsing, and choose a parser according to the results.

## API
None, the plugin automatically detects the language of each sentence (using [wooorm/franc](https://github.com/wooorm/franc)) when it’s created or changed, and stores the language in `sentenceNode.data.language`. Information about all the detected languages is stored in `sentenceNode.data.languages`.

In addition, the plugin exposes the average of the detected languages on paragraph and root nodes, through, in the case of a root node, `rootNode.data.language` and `rootNode.data.languages`.

## License

  MIT
