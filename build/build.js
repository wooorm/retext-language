/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("wooorm~parse-latin@0.1.3", function (exports, module) {
/**!
 * parse-latin
 *
 * Licensed under MIT.
 * Copyright (c) 2014 Titus Wormer <tituswormer@gmail.com>
 */
'use strict';

var EXPRESSION_ABBREVIATION_PREFIX, EXPRESSION_NEW_LINE,
    EXPRESSION_MULTI_NEW_LINE,
    EXPRESSION_AFFIX_PUNCTUATION, EXPRESSION_INNER_WORD_PUNCTUATION,
    EXPRESSION_INITIAL_WORD_PUNCTUATION, EXPRESSION_FINAL_WORD_PUNCTUATION,
    EXPRESSION_LOWER_INITIAL_EXCEPTION,
    EXPRESSION_NUMERICAL, EXPRESSION_TERMINAL_MARKER,
    GROUP_ALPHABETIC, GROUP_ASTRAL, GROUP_CLOSING_PUNCTUATION,
    GROUP_COMBINING_DIACRITICAL_MARK, GROUP_COMBINING_NONSPACING_MARK,
    GROUP_FINAL_PUNCTUATION, GROUP_LETTER_LOWER, GROUP_NUMERICAL,
    GROUP_TERMINAL_MARKER, GROUP_WHITE_SPACE, GROUP_WORD,
    parseLatinPrototype;

/**
 * Expands a list of Unicode code points and ranges to be usable in an
 * expression.
 *
 * "Borrowed" from XRegexp.
 *
 * @param {string} value
 * @return {string}
 * @private
 */
function expand(value) {
    return value.replace(/\w{4}/g, '\\u$&');
}

/**
 * Expose Unicode Number Range (Nd, Nl, and No).
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_NUMERICAL = expand(
    /*
     * Nd: Number, Decimal Digit
     */
    '0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F' +
    '09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0B72-0B770BE6-0BF' +
    '20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F33' +
    '1040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-1819' +
    '1946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C49' +
    '1C50-1C5920702074-20792080-20892150-21822185-21892460-249B24EA-' +
    '24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293248-324F' +
    '3251-325F3280-328932B1-32BFA620-A629A6E6-A6EFA830-A835A8D0-A8D9' +
    'A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19' +

    /*
     * Nl: Number, Letter
     */
    '16EE-16F02160-21822185-218830073021-30293038-303AA6E6-A6EF' +

    /*
     * No: Number, Other
     */
    '00B200B300B900BC-00BE09F4-09F90B72-0B770BF0-0BF20C78-0C7E0D70-0D75' +
    '0F2A-0F331369-137C17F0-17F919DA20702074-20792080-20892150-215F' +
    '21892460-249B24EA-24FF2776-27932CFD3192-31953220-32293248-324F' +
    '3251-325F3280-328932B1-32BFA830-A835'
);

/**
 * Expose Unicode Alphabetic category Ll (Letter, lowercase).
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_LETTER_LOWER = expand('0061-007A00B500DF-00F600F8-00FF010101030105' +
    '01070109010B010D010F01110113011501170119011B011D011F0121012301250127' +
    '0129012B012D012F01310133013501370138013A013C013E01400142014401460148' +
    '0149014B014D014F01510153015501570159015B015D015F01610163016501670169' +
    '016B016D016F0171017301750177017A017C017E-0180018301850188018C018D0192' +
    '01950199-019B019E01A101A301A501A801AA01AB01AD01B001B401B601B901BA01BD-' +
    '01BF01C601C901CC01CE01D001D201D401D601D801DA01DC01DD01DF01E101E301E5' +
    '01E701E901EB01ED01EF01F001F301F501F901FB01FD01FF02010203020502070209' +
    '020B020D020F02110213021502170219021B021D021F02210223022502270229022B' +
    '022D022F02310233-0239023C023F0240024202470249024B024D024F-02930295-' +
    '02AF037103730377037B-037D039003AC-03CE03D003D103D5-03D703D903DB03DD' +
    '03DF03E103E303E503E703E903EB03ED03EF-03F303F503F803FB03FC0430-045F0461' +
    '0463046504670469046B046D046F04710473047504770479047B047D047F0481048B' +
    '048D048F04910493049504970499049B049D049F04A104A304A504A704A904AB04AD' +
    '04AF04B104B304B504B704B904BB04BD04BF04C204C404C604C804CA04CC04CE04CF' +
    '04D104D304D504D704D904DB04DD04DF04E104E304E504E704E904EB04ED04EF04F1' +
    '04F304F504F704F904FB04FD04FF05010503050505070509050B050D050F05110513' +
    '051505170519051B051D051F05210523052505270561-05871D00-1D2B1D6B-1D77' +
    '1D79-1D9A1E011E031E051E071E091E0B1E0D1E0F1E111E131E151E171E191E1B1E1D' +
    '1E1F1E211E231E251E271E291E2B1E2D1E2F1E311E331E351E371E391E3B1E3D1E3F' +
    '1E411E431E451E471E491E4B1E4D1E4F1E511E531E551E571E591E5B1E5D1E5F1E61' +
    '1E631E651E671E691E6B1E6D1E6F1E711E731E751E771E791E7B1E7D1E7F1E811E83' +
    '1E851E871E891E8B1E8D1E8F1E911E931E95-1E9D1E9F1EA11EA31EA51EA71EA91EAB' +
    '1EAD1EAF1EB11EB31EB51EB71EB91EBB1EBD1EBF1EC11EC31EC51EC71EC91ECB1ECD' +
    '1ECF1ED11ED31ED51ED71ED91EDB1EDD1EDF1EE11EE31EE51EE71EE91EEB1EED1EEF' +
    '1EF11EF31EF51EF71EF91EFB1EFD1EFF-1F071F10-1F151F20-1F271F30-1F371F40-' +
    '1F451F50-1F571F60-1F671F70-1F7D1F80-1F871F90-1F971FA0-1FA71FB0-1FB4' +
    '1FB61FB71FBE1FC2-1FC41FC61FC71FD0-1FD31FD61FD71FE0-1FE71FF2-1FF41FF6' +
    '1FF7210A210E210F2113212F21342139213C213D2146-2149214E21842C30-2C5E2C61' +
    '2C652C662C682C6A2C6C2C712C732C742C76-2C7B2C812C832C852C872C892C8B2C8D' +
    '2C8F2C912C932C952C972C992C9B2C9D2C9F2CA12CA32CA52CA72CA92CAB2CAD2CAF' +
    '2CB12CB32CB52CB72CB92CBB2CBD2CBF2CC12CC32CC52CC72CC92CCB2CCD2CCF2CD1' +
    '2CD32CD52CD72CD92CDB2CDD2CDF2CE12CE32CE42CEC2CEE2CF32D00-2D252D272D2D' +
    'A641A643A645A647A649A64BA64DA64FA651A653A655A657A659A65BA65DA65FA661' +
    'A663A665A667A669A66BA66DA681A683A685A687A689A68BA68DA68FA691A693A695' +
    'A697A723A725A727A729A72BA72DA72F-A731A733A735A737A739A73BA73DA73FA741' +
    'A743A745A747A749A74BA74DA74FA751A753A755A757A759A75BA75DA75FA761A763' +
    'A765A767A769A76BA76DA76FA771-A778A77AA77CA77FA781A783A785A787A78CA78E' +
    'A791A793A7A1A7A3A7A5A7A7A7A9A7FAFB00-FB06FB13-FB17FF41-FF5A'
);

/**
 * Expose Unicode Alphabetic Range: Contains Lu (Letter, uppercase),
 * Ll (Letter, lowercase), and Lo (Letter, other).
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_ALPHABETIC = expand('0041-005A0061-007A00AA00B500BA00C0-00D6' +
    '00D8-00F600F8-02C102C6-02D102E0-02E402EC02EE03450370-037403760377' +
    '037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-0527' +
    '0531-055605590561-058705B0-05BD05BF05C105C205C405C505C705D0-05EA' +
    '05F0-05F20610-061A0620-06570659-065F066E-06D306D5-06DC06E1-06E8' +
    '06ED-06EF06FA-06FC06FF0710-073F074D-07B107CA-07EA07F407F507FA0800-' +
    '0817081A-082C0840-085808A008A2-08AC08E4-08E908F0-08FE0900-093B' +
    '093D-094C094E-09500955-09630971-09770979-097F0981-09830985-098C' +
    '098F09900993-09A809AA-09B009B209B6-09B909BD-09C409C709C809CB09CC' +
    '09CE09D709DC09DD09DF-09E309F009F10A01-0A030A05-0A0A0A0F0A100A13-' +
    '0A280A2A-0A300A320A330A350A360A380A390A3E-0A420A470A480A4B0A4C0A51' +
    '0A59-0A5C0A5E0A70-0A750A81-0A830A85-0A8D0A8F-0A910A93-0AA80AAA-' +
    '0AB00AB20AB30AB5-0AB90ABD-0AC50AC7-0AC90ACB0ACC0AD00AE0-0AE30B01-' +
    '0B030B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D-0B44' +
    '0B470B480B4B0B4C0B560B570B5C0B5D0B5F-0B630B710B820B830B85-0B8A0B8E' +
    '-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BBE-' +
    '0BC20BC6-0BC80BCA-0BCC0BD00BD70C01-0C030C05-0C0C0C0E-0C100C12-0C28' +
    '0C2A-0C330C35-0C390C3D-0C440C46-0C480C4A-0C4C0C550C560C580C590C60-' +
    '0C630C820C830C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD-0CC4' +
    '0CC6-0CC80CCA-0CCC0CD50CD60CDE0CE0-0CE30CF10CF20D020D030D05-0D0C' +
    '0D0E-0D100D12-0D3A0D3D-0D440D46-0D480D4A-0D4C0D4E0D570D60-0D63' +
    '0D7A-0D7F0D820D830D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60DCF-0DD4' +
    '0DD60DD8-0DDF0DF20DF30E01-0E3A0E40-0E460E4D0E810E820E840E870E88' +
    '0E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB90EBB-' +
    '0EBD0EC0-0EC40EC60ECD0EDC-0EDF0F000F40-0F470F49-0F6C0F71-0F810F88-' +
    '0F970F99-0FBC1000-10361038103B-103F1050-10621065-1068106E-1086108E' +
    '109C109D10A0-10C510C710CD10D0-10FA10FC-1248124A-124D1250-12561258' +
    '125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-' +
    '12C512C8-12D612D8-13101312-13151318-135A135F1380-138F13A0-13F4' +
    '1401-166C166F-167F1681-169A16A0-16EA16EE-16F01700-170C170E-1713' +
    '1720-17331740-17531760-176C176E-1770177217731780-17B317B6-17C817D' +
    '717DC1820-18771880-18AA18B0-18F51900-191C1920-192B1930-19381950-' +
    '196D1970-19741980-19AB19B0-19C91A00-1A1B1A20-1A5E1A61-1A741AA71B00' +
    '-1B331B35-1B431B45-1B4B1B80-1BA91BAC-1BAF1BBA-1BE51BE7-1BF11C00-' +
    '1C351C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF31CF51CF61D00-1DBF1E00-1F15' +
    '1F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB4' +
    '1FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-' +
    '1FF41FF6-1FFC2071207F2090-209C21022107210A-211321152119-211D2124' +
    '21262128212A-212D212F-2139213C-213F2145-2149214E2160-218824B6-' +
    '24E92C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2CF22CF32D00-2D252D272D2D' +
    '2D30-2D672D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-' +
    '2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2DE0-2DFF2E2F3005-30073021-30293031' +
    '-30353038-303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-' +
    '318E31A0-31BA31F0-31FF3400-4DB54E00-9FCCA000-A48CA4D0-A4FDA500-' +
    'A60CA610-A61FA62AA62BA640-A66EA674-A67BA67F-A697A69F-A6EFA717-A71F' +
    'A722-A788A78B-A78EA790-A793A7A0-A7AAA7F8-A801A803-A805A807-A80A' +
    'A80C-A827A840-A873A880-A8C3A8F2-A8F7A8FBA90A-A92AA930-A952A960-' +
    'A97CA980-A9B2A9B4-A9BFA9CFAA00-AA36AA40-AA4DAA60-AA76AA7AAA80-' +
    'AABEAAC0AAC2AADB-AADDAAE0-AAEFAAF2-AAF5AB01-AB06AB09-AB0EAB11-' +
    'AB16AB20-AB26AB28-AB2EABC0-ABEAAC00-D7A3D7B0-D7C6D7CB-D7FBF900-' +
    'FA6DFA70-FAD9FB00-FB06FB13-FB17FB1D-FB28FB2A-FB36FB38-FB3CFB3EFB40' +
    'FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74' +
    'FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7' +
    'FFDA-FFDC'
);

/**
 * Expose Unicode White Space Range.
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_WHITE_SPACE = expand(
    '0009-000D0020008500A01680180E2000-200A20282029202F205F3000'
);

/**
 * Expose Unicode Combining Diacritical Marks, and Combining Diacritical
 * Marks for Symbols, Blocks.
 *
 * @global
 * @private
 * @constant
 */
GROUP_COMBINING_DIACRITICAL_MARK = expand('20D0-20FF0300-036F');

/**
 * Expose Unicode Mark, Nonspacing Block.
 *
 * @global
 * @private
 * @constant
 */
GROUP_COMBINING_NONSPACING_MARK = expand('0300-036F0483-04870591-05BD' +
    '05BF05C105C205C405C505C70610-061A064B-065F067006D6-06DC06DF-06E4' +
    '06E706E806EA-06ED07110730-074A07A6-07B007EB-07F30816-0819081B-0823' +
    '0825-08270829-082D0859-085B08E4-08FE0900-0902093A093C0941-0948094D' +
    '0951-095709620963098109BC09C1-09C409CD09E209E30A010A020A3C0A410A42' +
    '0A470A480A4B-0A4D0A510A700A710A750A810A820ABC0AC1-0AC50AC70AC80ACD' +
    '0AE20AE30B010B3C0B3F0B41-0B440B4D0B560B620B630B820BC00BCD0C3E-0C40' +
    '0C46-0C480C4A-0C4D0C550C560C620C630CBC0CBF0CC60CCC0CCD0CE20CE30D41' +
    '-0D440D4D0D620D630DCA0DD2-0DD40DD60E310E34-0E3A0E47-0E4E0EB10EB4-' +
    '0EB90EBB0EBC0EC8-0ECD0F180F190F350F370F390F71-0F7E0F80-0F840F86' +
    '0F870F8D-0F970F99-0FBC0FC6102D-10301032-10371039103A103D103E1058' +
    '1059105E-10601071-1074108210851086108D109D135D-135F1712-17141732-' +
    '1734175217531772177317B417B517B7-17BD17C617C9-17D317DD180B-180D' +
    '18A91920-19221927192819321939-193B1A171A181A561A58-1A5E1A601A62' +
    '1A65-1A6C1A73-1A7C1A7F1B00-1B031B341B36-1B3A1B3C1B421B6B-1B731B80' +
    '1B811BA2-1BA51BA81BA91BAB1BE61BE81BE91BED1BEF-1BF11C2C-1C331C36' +
    '1C371CD0-1CD21CD4-1CE01CE2-1CE81CED1CF41DC0-1DE61DFC-1DFF20D0-20DC' +
    '20E120E5-20F02CEF-2CF12D7F2DE0-2DFF302A-302D3099309AA66FA674-A67D' +
    'A69FA6F0A6F1A802A806A80BA825A826A8C4A8E0-A8F1A926-A92DA947-A951' +
    'A980-A982A9B3A9B6-A9B9A9BCAA29-AA2EAA31AA32AA35AA36AA43AA4CAAB0' +
    'AAB2-AAB4AAB7AAB8AABEAABFAAC1AAECAAEDAAF6ABE5ABE8ABEDFB1EFE00-FE0F' +
    'FE20-FE26'
);

/**
 * Expose word characters. Includes Unicode:
 *
 * - Number Range (Nd, Nl, and No);
 * - Alphabetic Range (Lu, Ll, and Lo);
 * - Combining Diacritical Marks block;
 * - Combining Diacritical Marks for Symbols block;
 *
 * @global
 * @private
 * @constant
 */
GROUP_WORD = GROUP_NUMERICAL + GROUP_ALPHABETIC +
    GROUP_COMBINING_DIACRITICAL_MARK + GROUP_COMBINING_NONSPACING_MARK;

/**
 * Expose Unicode Cs (Other, Surrogate) category.
 *
 * @global
 * @private
 * @constant
 */
GROUP_ASTRAL = expand('D800-DBFFDC00-DFFF');

/**
 * Expose interrobang, question-, and exclamation mark.
 *
 * - Full stop;
 * - Interrobang;
 * - Question mark;
 * - Exclamation mark;
 * - Horizontal ellipsis.
 *
 * @global
 * @private
 * @constant
 */
GROUP_TERMINAL_MARKER = '\\.\\u203D?!\\u2026';

/**
 * Expose Unicode Pe (Punctuation, Close) category.
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_CLOSING_PUNCTUATION = expand('0029005D007D0F3B0F3D169C2046' +
    '207E208E232A2769276B276D276F27712773277527C627E727E927EB27ED27EF' +
    '298429862988298A298C298E2990299229942996299829D929DB29FD2E232E25' +
    '2E272E293009300B300D300F3011301530173019301B301E301FFD3FFE18FE36' +
    'FE38FE3AFE3CFE3EFE40FE42FE44FE48FE5AFE5CFE5EFF09FF3DFF5DFF60FF63'
);

/**
 * Expose Unicode Pf (Punctuation, Final) category.
 *
 * "Borrowed" from XRegexp.
 *
 * @global
 * @private
 * @constant
 */
GROUP_FINAL_PUNCTUATION = expand('00BB2019201D203A2E032E052E0A2E0D2E1D2E21');

/**
 * A blacklist of full stop characters that should not be treated as
 * terminal sentence markers:
 *
 * - A "word" boundry,
 * - followed by a case-insensitive abbreviation,
 * - followed by full stop.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_ABBREVIATION_PREFIX = new RegExp(
    '^(' +
        '[0-9]+|' +
        '[a-z]|' +
        /*
         * Common Latin Abbreviations:
         * Based on: http://en.wikipedia.org/wiki/List_of_Latin_abbreviations
         * Where only the abbreviations written without joining full stops,
         * but with a final full stop, were extracted.
         *
         * circa, capitulus, confer, compare, centum weight, eadem, (et) alii,
         * et cetera, floruit, foliis, ibidem, idem, nemine && contradicente,
         * opere && citato, (per) cent, (per) procurationem, (pro) tempore,
         * sic erat scriptum, (et) sequentia, statim, videlicet.
         */
        'ca|cap|cca|cf|cp|cwt|ead|al|etc|fl|ff|ibid|id|nem|con|op|cit|cent|' +
        'pro|tem|sic|seq|stat|viz' +
    ')$'
);

/**
 * Matches closing or final punctuation, or terminal markers that should
 * still be included in the previous sentence, even though they follow
 * the sentence's terminal marker.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_AFFIX_PUNCTUATION = new RegExp(
    '^([' +
        GROUP_CLOSING_PUNCTUATION +
        GROUP_FINAL_PUNCTUATION +
        GROUP_TERMINAL_MARKER +
        '"\'' +
    '])\\1*$'
);

/**
 * Matches a string consisting of one or more new line characters.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_NEW_LINE = /^(\r?\n|\r)+$/;

/**
 * Matches a string consisting of two or more new line characters.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_MULTI_NEW_LINE = /^(\r?\n|\r){2,}$/;

/**
 * Matches a sentence terminal marker, one or more of the following:
 *
 * - Full stop;
 * - Interrobang;
 * - Question mark;
 * - Exclamation mark;
 * - Horizontal ellipsis.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_TERMINAL_MARKER = new RegExp(
    '^([' + GROUP_TERMINAL_MARKER + ']+)$'
);

/**
 * Matches punctuation part of the surrounding words.
 *
 * Includes:
 * - Hyphen-minus;
 * - At sign;
 * - Question mark;
 * - Equals sign;
 * - full-stop;
 * - colon;
 * - Dumb single quote;
 * - Right single quote;
 * - Ampersand;
 * - Soft hyphen;
 * - Hyphen;
 * - Non-breaking hyphen;
 * - Hyphenation point;
 * - Middle dot;
 * - Slash (one or more);
 * - Underscore (one or more).
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_INNER_WORD_PUNCTUATION =
    /^([-@?=.:'\u2019&\u00AD\u00B7\u2010\2011\u2027]|[_\/]+)$/;

/**
 * Matches punctuation part of the next word.
 *
 * Includes:
 * - Ampersand;
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_INITIAL_WORD_PUNCTUATION = /^&$/;

/**
 * Matches punctuation part of the previous word.
 *
 * Includes:
 * - Hyphen-minus.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_FINAL_WORD_PUNCTUATION = /^-$/;

/**
 * Matches a number.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_NUMERICAL = new RegExp('^[' + GROUP_NUMERICAL + ']+$');

/**
 * Matches an initial lower case letter.
 *
 * @global
 * @private
 * @constant
 */
EXPRESSION_LOWER_INITIAL_EXCEPTION = new RegExp(
    '^[' +
        GROUP_LETTER_LOWER +
    ']'
);

/**
 * Apply modifiers on a token.
 *
 * @param {Array.<Function>} modifiers
 * @param {Object} parent
 * @global
 * @private
 */
function modify(modifiers, parent) {
    var length = modifiers.length,
        iterator = -1,
        modifier, pointer, result, children;

    /* Iterate over all modifiers... */
    while (++iterator < length) {
        modifier = modifiers[iterator];
        pointer = -1;

        /*
         * We allow conditional assignment here, because the length of the
         * parent's children will probably change.
         */
        children = parent.children;

        /* Iterate over all children... */
        while (children[++pointer]) {
            result = modifier(children[pointer], pointer, parent);

            /*
             * If the modifier returns a number, move the pointer over to
             * that child.
             */
            if (typeof result === 'number') {
                pointer = result - 1;
            }
        }
    }
}

/**
 * Returns the value of all `TextNode` tokens inside a given token.
 *
 * @param {Object} token
 * @return {string} - The stringified token.
 * @global
 * @private
 */
function tokenToString(token) {
    var value = '',
        iterator, children;

    if (token.value) {
        return token.value;
    }

    iterator = -1;
    children = token.children;

    /* Shortcut: This is pretty common, and a small performance win. */
    if (children.length === 1 && children[0].type === 'TextNode') {
        return children[0].value;
    }

    while (children[++iterator]) {
        value += tokenToString(children[iterator]);
    }

    return value;
}

/**
 * Creates a (modifiable) tokenizer.
 *
 * @param {Object} context               - The class to attach to.
 * @param {Object} options               - The settings to use.
 * @param {string} options.name          - The name of the method.
 * @param {string} options.type          - The type of parent node to create.
 * @param {string} options.tokenizer     - The property where the child
 *                                         tokenizer lives
 * @param {Array.<Function>} options.modifiers - The initial modifiers to
 *                                         apply on each parse.
 * @param {RegExp} options.delimiter     - The delimiter to break children at.
 * @return {Function} - The tokenizer.
 * @global
 * @private
 */
function tokenizerFactory(context, options) {
    var name = options.name;

    context.prototype[name + 'Modifiers'] = options.modifiers;
    context.prototype[name + 'Delimiter'] = options.delimiter;

    return function (value) {
        var delimiter = this[name + 'Delimiter'],
            lastIndex, children, iterator, length, root, start, stem, tokens;

        root = {
            'type' : options.type,
            'children' : []
        };

        children = root.children;

        stem = this[options.tokenizer](value);
        tokens = stem.children;

        length = tokens.length;
        lastIndex = length - 1;
        iterator = -1;
        start = 0;

        while (++iterator < length) {
            if (
                iterator !== lastIndex &&
                !delimiter.test(tokenToString(tokens[iterator]))
            ) {
                continue;
            }

            children.push({
                'type' : stem.type,
                'children' : tokens.slice(start, iterator + 1)
            });

            start = iterator + 1;
        }

        modify(this[name + 'Modifiers'], root);

        return root;
    };
}

/**
 * Merges certain punctuation marks into their previous words.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeInitialWordPunctuation(child, index, parent) {
    var children, next, hasPreviousWord, hasNextWord;

    if (
        child.type !== 'PunctuationNode' ||
        !EXPRESSION_INITIAL_WORD_PUNCTUATION.test(tokenToString(child))
    ) {
        return;
    }

    children = parent.children;
    next = children[index + 1];

    hasPreviousWord = index !== 0 && children[index - 1].type === 'WordNode';
    hasNextWord = next && next.type === 'WordNode';

    if (hasPreviousWord || !hasNextWord) {
        return;
    }

    /* Remove `child` from parent. */
    children.splice(index, 1);

    /* Add the punctuation mark at the start of the next node. */
    next.children.unshift(child);

    /* Next, iterate over the node at the previous position. */
    return index - 1;
}

/**
 * Merges certain punctuation marks into their preceding words.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeFinalWordPunctuation(child, index, parent) {
    var children, prev, next;

    if (
        index === 0 ||
        child.type !== 'PunctuationNode' ||
        !EXPRESSION_FINAL_WORD_PUNCTUATION.test(tokenToString(child))
    ) {
        return;
    }

    children = parent.children;
    prev = children[index - 1];
    next = children[index + 1];

    if (
        (next && next.type === 'WordNode') ||
        !(prev && prev.type === 'WordNode')
    ) {
        return;
    }

    /* Remove `child` from parent. */
    children.splice(index, 1);

    /* Add the punctuation mark at the end of the previous node. */
    prev.children.push(child);

    /* Next, iterate over the node *now* at the current position (which was
     * the next node). */
    return index;
}

/**
 * Merges two words surrounding certain punctuation marks.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeInnerWordPunctuation(child, index, parent) {
    var children, prev, otherChild,
        iterator, tokens, queue;

    if (index === 0 || child.type !== 'PunctuationNode') {
        return;
    }

    children = parent.children;
    prev = children[index - 1];

    if (!prev || prev.type !== 'WordNode') {
        return;
    }

    iterator = index - 1;
    tokens = [];
    queue = [];

    /*
     * - Is a token which is neither word nor inner word punctuation is
     *   found, the loop is broken.
     * - If a inner word punctuation mark is found, it's queued.
     * - If a word is found, it's queued (and the queue stored and emptied).
     */
    while (children[++iterator]) {
        otherChild = children[iterator];

        if (otherChild.type === 'WordNode') {
            tokens = tokens.concat(queue, otherChild.children);
            queue = [];
            continue;
        }

        if (
            otherChild.type === 'PunctuationNode' &&
            EXPRESSION_INNER_WORD_PUNCTUATION.test(tokenToString(otherChild))
        ) {
            queue.push(otherChild);
            continue;
        }

        break;
    }

    /* If no tokens were found, exit. */
    if (!tokens.length) {
        return;
    }

    /* If there was a queue found, remove its length from iterator. */
    if (queue.length) {
        iterator -= queue.length;
    }

    /* Remove every (one or more) inner-word punctuation marks, and children
     * of words. */
    children.splice(index, iterator - index);

    /* Add all found tokens to prev.children */
    prev.children = prev.children.concat(tokens);

    return index;
}

/**
 * Merges initialisms.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeInitialisms(child, index, parent) {
    var prev, children, length, iterator, otherChild, isAllDigits, value;

    if (
        index === 0 || child.type !== 'PunctuationNode' ||
        tokenToString(child) !== '.'
    ) {
        return;
    }

    prev = parent.children[index - 1];
    children = prev.children;

    /* istanbul ignore else: TOSPEC: Currently not spec-able, but
     * future-friendly */
    if (children) {
        length = children.length;
    } else {
        length = 0;
    }

    if (prev.type !== 'WordNode' || length < 2 || length % 2 === 0) {
        return;
    }

    iterator = length;
    isAllDigits = true;

    while (children[--iterator]) {
        otherChild = children[iterator];
        value = tokenToString(otherChild);

        if (iterator % 2 === 0) {
            /* istanbul ignore if: TOSPEC: Currently not spec-able, but
             * future-friendly */
            if (otherChild.type !== 'TextNode') {
                return;
            }

            if (value.length > 1) {
                return;
            }

            if (!EXPRESSION_NUMERICAL.test(value)) {
                isAllDigits = false;
            }
        } else if (otherChild.type !== 'PunctuationNode' || value !== '.') {
            /* istanbul ignore else: TOSPEC */
            if (iterator < length - 2) {
                break;
            } else {
                return;
            }
        }
    }

    if (isAllDigits) {
        return;
    }

    /* Remove `child` from parent. */
    parent.children.splice(index, 1);

    /* Add child to the previous children. */
    children.push(child);
}

/**
 * Merges a sentence into its next sentence, when the sentence ends with
 * a certain word.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergePrefixExceptions(child, index, parent) {
    var children = child.children,
        node;

    if (
        !children ||
        !children.length ||
        index === parent.children.length - 1
    ) {
        return;
    }

    node = children[children.length - 1];

    if (
        !node || node.type !== 'PunctuationNode' ||
        tokenToString(node) !== '.'
    ) {
        return;
    }

    node = children[children.length - 2];

    if (!node ||
        node.type !== 'WordNode' ||
        !EXPRESSION_ABBREVIATION_PREFIX.test(
            tokenToString(node).toLowerCase()
        )
    ) {
        return;
    }

    child.children = children.concat(
        parent.children[index + 1].children
    );

    parent.children.splice(index + 1, 1);

    return index - 1;
}

/**
 * Merges a sentence into its previous sentence, when the sentence starts
 * with a comma.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeAffixExceptions(child, index, parent) {
    var children = child.children,
        node, iterator, previousChild;

    if (!children || !children.length || index === 0) {
        return;
    }

    iterator = -1;

    while (children[++iterator]) {
        node = children[iterator];

        if (node.type === 'WordNode') {
            return;
        }

        if (node.type === 'PunctuationNode') {
            break;
        }
    }

    if (
        !node ||
        node.type !== 'PunctuationNode' ||
        !(tokenToString(node) === ',' || tokenToString(node) === ';')
    ) {
        return;
    }

    previousChild = parent.children[index - 1];

    previousChild.children = previousChild.children.concat(
        children
    );

    parent.children.splice(index, 1);

    return index - 1;
}

/**
 * Moves white space starting a sentence up, so they are the siblings
 * of sentences.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function makeInitialWhiteSpaceAndSourceSiblings(child, index, parent) {
    var children = child.children;

    if (
        !children ||
        !children.length ||
        (
            children[0].type !== 'WhiteSpaceNode' &&
            children[0].type !== 'SourceNode'
        )
    ) {
        return;
    }

    parent.children.splice(index, 0, children.shift());
}

/**
 * Moves white space ending a paragraph up, so they are the siblings
 * of paragraphs.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function makeFinalWhiteSpaceAndSourceSiblings(child, index, parent) {
    var children = child.children;

    if (
        !children ||
        children.length < 1 ||
        (
            children[children.length - 1].type !== 'WhiteSpaceNode' &&
            children[children.length - 1].type !== 'SourceNode'
        )
    ) {
        return;
    }

    parent.children.splice(index + 1, 0, child.children.pop());
}

/**
 * Merges non-terminal marker full stops into, if available, the previous
 * word, or if available, the next word.
 *
 * @param {Object} child
 * @param {number} index
 * @return {undefined}
 *
 * @global
 * @private
 */
function mergeRemainingFullStops(child, index) {
    var children = child.children,
        iterator = children.length,
        grandchild, prev, next, hasFoundDelimiter;

    hasFoundDelimiter = false;

    while (children[--iterator]) {
        grandchild = children[iterator];

        if (grandchild.type !== 'PunctuationNode') {
            /* This is a sentence without terminal marker, so we 'fool' the
             * code to make it think we have found one. */
            if (grandchild.type === 'WordNode') {
                hasFoundDelimiter = true;
            }
            continue;
        }

        /* Exit when this token is not a terminal marker. */
        if (!EXPRESSION_TERMINAL_MARKER.test(tokenToString(grandchild))) {
            continue;
        }

        /* Exit when this is the first terminal marker found (starting at the
         * end), so it should not be merged. */
        if (!hasFoundDelimiter) {
            hasFoundDelimiter = true;
            continue;
        }

        /* Only merge a single full stop. */
        if (tokenToString(grandchild) !== '.') {
            continue;
        }

        prev = children[iterator - 1];
        next = children[iterator + 1];

        if (prev && prev.type === 'WordNode') {
            /* Exit when the full stop is followed by a space and another,
             * full stop, such as: `{.} .` */
            if (
                next && next.type === 'WhiteSpaceNode' &&
                children[iterator + 2] &&
                children[iterator + 2].type === 'PunctuationNode' &&
                tokenToString(children[iterator + 2]) === '.'
            ) {
                continue;
            }

            /* Remove `child` from parent. */
            children.splice(iterator, 1);

            /* Add the punctuation mark at the end of the previous node. */
            prev.children.push(grandchild);

            iterator--;
        } else if (next && next.type === 'WordNode') {
            /* Remove `child` from parent. */
            children.splice(iterator, 1);

            /* Add the punctuation mark at the start of the next node. */
            next.children.unshift(grandchild);
        }
    }
}

/**
 * Breaks a sentence if a node containing two or more white spaces is found.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function breakImplicitSentences(child, index, parent) {
    if (child.type !== 'SentenceNode') {
        return;
    }

    var children = child.children,
        iterator = -1,
        length = children.length,
        node;

    while (++iterator < length) {
        node = children[iterator];

        if (node.type !== 'WhiteSpaceNode') {
            continue;
        }

        if (!EXPRESSION_MULTI_NEW_LINE.test(tokenToString(node))) {
            continue;
        }

        child.children = children.slice(0, iterator);

        parent.children.splice(index + 1, 0, node, {
            'type' : 'SentenceNode',
            'children' : children.slice(iterator + 1)
        });

        return index + 2;
    }
}

/**
 * Merges a sentence into its previous sentence, when the sentence starts
 * with a lower case letter.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeInitialLowerCaseLetterSentences(child, index, parent) {
    var node, children, iterator, previousChild;

    children = child.children;

    if (!children || !children.length || index === 0) {
        return;
    }

    iterator = -1;

    while (children[++iterator]) {
        node = children[iterator];

        if (node.type === 'PunctuationNode') {
            return;
        } else if (node.type === 'WordNode') {
            if (
                !EXPRESSION_LOWER_INITIAL_EXCEPTION.test(tokenToString(node))
            ) {
                return;
            }

            previousChild = parent.children[index - 1];

            previousChild.children = previousChild.children.concat(
                children
            );

            parent.children.splice(index, 1);

            return index - 1;
        }
    }
}

/**
 * Merges a sentence into the following sentence, when the sentence does
 * not contain word tokens.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeNonWordSentences(child, index, parent) {
    var children, iterator, otherChild;

    children = child.children;
    iterator = -1;

    while (children[++iterator]) {
        if (children[iterator].type === 'WordNode') {
            return;
        }
    }

    otherChild = parent.children[index - 1];

    if (otherChild) {
        otherChild.children = otherChild.children.concat(children);

        /* Remove the child. */
        parent.children.splice(index, 1);

        return index - 1;
    }

    otherChild = parent.children[index + 1];

    if (otherChild) {
        otherChild.children = children.concat(otherChild.children);

        /* Remove the child. */
        parent.children.splice(index, 1);

        return 0;
    }
}

/**
 * Merges punctuation- and whitespace-only between two line breaks into a
 * source node.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeSourceLines(child, index, parent) {
    var iterator, siblings, sibling, value;

    if (
        !child ||
        child.type !== 'WhiteSpaceNode' ||
        !EXPRESSION_NEW_LINE.test(tokenToString(child))
    ) {
        return;
    }

    siblings = parent.children;
    iterator = index;
    value = '';

    while (siblings[--iterator]) {
        sibling = siblings[iterator];

        if (sibling.type === 'WordNode') {
            return;
        }

        if (
            sibling.type === 'WhiteSpaceNode' &&
            EXPRESSION_NEW_LINE.test(tokenToString(sibling))
        ) {
            break;
        }

        value = tokenToString(sibling) + value;
    }

    if (!value) {
        return;
    }

    siblings.splice(iterator + 1, index - iterator - 1, {
        'type' : 'SourceNode',
        'value' : value
    });

    return iterator + 3;
}

/**
 * Moves certain punctuation following a terminal marker (thus in the
 * next sentence) to the previous sentence.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function mergeAffixPunctuation(child, index, parent) {
    var children = child.children;

    if (!children || !children.length || index === 0) {
        return;
    }

    if (
        children[0].type !== 'PunctuationNode' ||
        !EXPRESSION_AFFIX_PUNCTUATION.test(tokenToString(children[0]))
    ) {
        return;
    }

    parent.children[index - 1].children.push(children.shift());

    return index - 1;
}

/**
 * Removes empty children.
 *
 * @param {Object} child
 * @param {number} index
 * @param {Object} parent
 * @return {undefined|number} - Either void, or the next index to iterate
 *     over.
 *
 * @global
 * @private
 */
function removeEmptyNodes(child, index, parent) {
    if ('children' in child && !child.children.length) {
        parent.children.splice(index, 1);
        return index > 0 ? index - 1 : 0;
    }
}

/**
 * Returns a function which in turn returns nodes of the given type.
 *
 * @param {string} type
 * @return {Function} - A function which creates nodes of the given type.
 * @global
 * @private
 */
function createNodeFactory(type) {
    return function (value) {
        return {
            'type' : type,
            'children' : [
                this.tokenizeText(value)
            ]
        };
    };
}

/**
 * Returns a function which in turn returns text nodes of the given type.
 *
 * @param {string} type
 * @return {Function} - A function which creates text nodes of the given type.
 * @global
 * @private
 */
function createTextNodeFactory(type) {
    return function (value) {
        if (value === null || value === undefined) {
            value = '';
        }

        return {
            'type' : type,
            'value' : String(value)
        };
    };
}

/**
 * `ParseLatin` contains the functions needed to tokenize natural Latin-script
 * language into a syntax tree.
 *
 * @constructor
 * @public
 */
function ParseLatin() {
    /*
     * TODO: This should later be removed (when this change bubbles
     * through to dependants)
     */
    if (!(this instanceof ParseLatin)) {
        return new ParseLatin();
    }
}

parseLatinPrototype = ParseLatin.prototype;

/**
 * Matches all tokens:
 * - One or more number, alphabetic, or combining characters;
 * - One or more white space characters;
 * - One or more astral plane characters;
 * - One or more of the same character;
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.EXPRESSION_TOKEN = new RegExp(
    '[' + GROUP_WORD + ']+|' +
    '[' + GROUP_WHITE_SPACE + ']+|' +
    '[' + GROUP_ASTRAL + ']+|' +
    '([\\s\\S])\\1*',
    'g'
);

/**
 * Matches a word.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.EXPRESSION_WORD = new RegExp(
    '^[' + GROUP_WORD + ']+$'
);

/**
 * Matches a string containing ONLY white space.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.EXPRESSION_WHITE_SPACE = new RegExp(
    '^[' + GROUP_WHITE_SPACE + ']+$'
);

/**
 * Tokenize natural Latin-script language into letter and numbers (words),
 * white space, and everything else (punctuation).
 *
 * @param {string?} value
 * @return {Array.<Object>} - An array of tokens.
 *
 * @public
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenize = function (value) {
    var self, tokens, delimiter, start, end, match;

    if (value === null || value === undefined) {
        value = '';
    } else if (value instanceof String) {
        value = value.toString();
    }

    if (typeof value !== 'string') {
        throw new TypeError('Illegal invocation: \'' + value +
            '\' is not a valid argument for \'ParseLatin\'');
    }

    self = this;

    tokens = [];

    if (!value) {
        return tokens;
    }

    delimiter = self.EXPRESSION_TOKEN;

    delimiter.lastIndex = 0;
    start = 0;
    match = delimiter.exec(value);

    /* for every match of the token delimiter expression... */
    while (match) {
        /*
         * Move the pointer over to after its last character.
         */
        end = match.index + match[0].length;

        /*
         * Slice the found content, from (including) start to (not including)
         * end, classify it, and add the result to tokens.
         */
        tokens.push(self.classifier(value.substring(start, end)));

        match = delimiter.exec(value);
        start = end;
    }

    return tokens;
};

/*eslint-enable no-cond-assign */

/**
 * Classify a token.
 *
 * @param {string?} value
 * @return {Object} - A classified token.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.classifier = function (value) {
    var type;

    /*
     * If the token consists solely of white space, classify it as white
     * space.
     */
    if (this.EXPRESSION_WHITE_SPACE.test(value)) {
        type = 'WhiteSpace';
    /*
     * Otherwise, if the token contains just word characters, classify it as
     * a word.
     */
    } else if (this.EXPRESSION_WORD.test(value)) {
        type = 'Word';
    /*
     * Otherwise, classify it as punctuation.
     */
    } else {
        type = 'Punctuation';
    }

    /* Return a token. */
    return this['tokenize' + type](value);
};

/**
 * Returns a source node, with its value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The SourceNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeSource = createTextNodeFactory('SourceNode');

/**
 * Returns a text node, with its value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The TextNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeText = createTextNodeFactory('TextNode');

/**
 * Returns a word node, with its children set to a single text node, its
 * value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The WordNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeWord = createNodeFactory('WordNode');

/**
 * Returns a white space node, with its children set to a single text node,
 * its value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The whiteSpaceNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeWhiteSpace = createNodeFactory('WhiteSpaceNode');

/**
 * Returns a punctuation node, with its children set to a single text node,
 * its value set to the given value.
 *
 * @param {string} value
 * @return {Object} - The PunctuationNode.
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizePunctuation =
    createNodeFactory('PunctuationNode');

/**
 * Tokenize natural Latin-script language into a sentence token.
 *
 * @param {string?} value
 * @return {Object} - A sentence token.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeSentence = function (value) {
    var root = {
        'type' : 'SentenceNode',
        'children' : this.tokenize(value)
    };

    modify(this.tokenizeSentenceModifiers, root);

    /*
     * Return a sentence token, with its children set to the result of
     * tokenizing the given value.
     */
    return root;
};

parseLatinPrototype.tokenizeSentenceModifiers = [
    mergeInitialWordPunctuation,
    mergeFinalWordPunctuation,
    mergeInnerWordPunctuation,
    mergeSourceLines,
    mergeInitialisms
];

/**
 * Tokenize natural Latin-script language into a paragraph token.
 *
 * @param {string?} value
 * @return {Object} - A paragraph token.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeParagraph = tokenizerFactory(ParseLatin, {
    'name' : 'tokenizeParagraph',
    'tokenizer' : 'tokenizeSentence',
    'type' : 'ParagraphNode',
    'delimiter' : EXPRESSION_TERMINAL_MARKER,
    'modifiers' : [
        mergeNonWordSentences,
        mergeAffixPunctuation,
        mergeInitialLowerCaseLetterSentences,
        mergePrefixExceptions,
        mergeAffixExceptions,
        mergeRemainingFullStops,
        makeInitialWhiteSpaceAndSourceSiblings,
        makeFinalWhiteSpaceAndSourceSiblings,
        breakImplicitSentences,
        removeEmptyNodes
    ]
});

/**
 * Tokenize natural Latin-script language into a root token.
 *
 * @param {string?} value
 * @return {Object} - A root token.
 *
 * @private
 * @memberof ParseLatin#
 */
parseLatinPrototype.tokenizeRoot = tokenizerFactory(ParseLatin, {
    'name' : 'tokenizeRoot',
    'tokenizer' : 'tokenizeParagraph',
    'type' : 'RootNode',
    'delimiter' : EXPRESSION_NEW_LINE,
    'modifiers' : [makeFinalWhiteSpaceAndSourceSiblings, removeEmptyNodes]
});

/**
 * Tokenize natural Latin-script language into a syntax tree.
 *
 * @param {string?} value
 * @return {Object} - The tokenized document.
 *
 * @public
 * @memberof ParseLatin#
 */
parseLatinPrototype.parse = function (value) {
    return this.tokenizeRoot(value);
};

/**
 * Export ParseLatin.
 */
module.exports = ParseLatin;

});

require.register("wooorm~textom@0.1.1", function (exports, module) {
'use strict';

/**
 * Utilities.
 */
var arrayPrototype = Array.prototype,
    arrayUnshift = arrayPrototype.unshift,
    arrayPush = arrayPrototype.push,
    arraySlice = arrayPrototype.slice,
    arrayIndexOf = arrayPrototype.indexOf,
    arraySplice = arrayPrototype.splice;

/* istanbul ignore if: User forgot a polyfill much? */
if (!arrayIndexOf) {
    throw new Error('Missing Array#indexOf() method for TextOM');
}

var ROOT_NODE = 'RootNode',
    PARAGRAPH_NODE = 'ParagraphNode',
    SENTENCE_NODE = 'SentenceNode',
    WORD_NODE = 'WordNode',
    PUNCTUATION_NODE = 'PunctuationNode',
    WHITE_SPACE_NODE = 'WhiteSpaceNode',
    SOURCE_NODE = 'SourceNode',
    TEXT_NODE = 'TextNode';

function fire(context, callbacks, args) {
    var iterator = -1;

    if (!callbacks || !callbacks.length) {
        return;
    }

    callbacks = callbacks.concat();

    while (callbacks[++iterator]) {
        callbacks[iterator].apply(context, args);
    }

    return;
}

function canInsertIntoParent(parent, child) {
    var allowed = parent.allowedChildTypes;

    if (!allowed || !allowed.length || !child.type) {
        return true;
    }

    return allowed.indexOf(child.type) > -1;
}

function validateInsert(parent, item, child) {
    if (!parent) {
        throw new TypeError('Illegal invocation: \'' + parent +
            ' is not a valid argument for \'insert\'');
    }

    if (!child) {
        throw new TypeError('\'' + child +
            ' is not a valid argument for \'insert\'');
    }

    if (parent === child || parent === item) {
        throw new Error('HierarchyError: Cannot insert a node into itself');
    }

    if (!canInsertIntoParent(parent, child)) {
        throw new Error('HierarchyError: The operation would ' +
            'yield an incorrect node tree');
    }

    if (typeof child.remove !== 'function') {
        throw new Error('The operated on node did not have a ' +
            '`remove` method');
    }

    /* Insert after... */
    if (item) {
        /* istanbul ignore if: Wrong-usage */
        if (item.parent !== parent) {
            throw new Error('The operated on node (the "pointer") ' +
                'was detached from the parent');
        }

        /* istanbul ignore if: Wrong-usage */
        if (arrayIndexOf.call(parent, item) === -1) {
            throw new Error('The operated on node (the "pointer") ' +
                'was attached to its parent, but the parent has no ' +
                'indice corresponding to the item');
        }
    }
}

/**
 * Inserts the given `child` after (when given), the `item`, and otherwise as
 * the first item of the given parents.
 *
 * @param {Object} parent
 * @param {Object} item
 * @param {Object} child
 * @api private
 */
function insert(parent, item, child) {
    var next;

    validateInsert(parent, item, child);

    /* Detach the child. */
    child.remove();

    /* Set the child's parent to items parent. */
    child.parent = parent;

    if (item) {
        next = item.next;

        /* If item has a next node... */
        if (next) {
            /* ...link the child's next node, to items next node. */
            child.next = next;

            /* ...link the next nodes previous node, to the child. */
            next.prev = child;
        }

        /* Set the child's previous node to item. */
        child.prev = item;

        /* Set the next node of item to the child. */
        item.next = child;

        /* If the parent has no last node or if item is the parent last node,
         * link the parents last node to the child. */
        if (item === parent.tail || !parent.tail) {
            parent.tail = child;
            arrayPush.call(parent, child);
        /* Else, insert the child into the parent after the items index. */
        } else {
            arraySplice.call(
                parent, arrayIndexOf.call(parent, item) + 1, 0, child
            );
        }
    /* If parent has a first node... */
    } else if (parent.head) {
        next = parent.head;

        /* Set the child's next node to head. */
        child.next = next;

        /* Set the previous node of head to the child. */
        next.prev = child;

        /* Set the parents heads to the child. */
        parent.head = child;

        /* If the the parent has no last node, link the parents last node to
         * head. */
        if (!parent.tail) {
            parent.tail = next;
        }

        arrayUnshift.call(parent, child);
    /* Prepend. There is no `head` (or `tail`) node yet. */
    } else {
        /* Set parent's first node to the prependee and return the child. */
        parent.head = child;
        parent[0] = child;
        parent.length = 1;
    }

    next = child.next;

    child.emit('insert');

    if (item) {
        item.emit('changenext', child, next);
        child.emit('changeprev', item, null);
    }

    if (next) {
        next.emit('changeprev', child, item);
        child.emit('changenext', next, null);
    }

    parent.trigger('insertinside', child);

    return child;
}

/**
 * Detach a node from its (when applicable) parent, links its (when
 * existing) previous and next items to each other.
 *
 * @param {Object} node
 * @api private
 */
function remove(node) {
    /* istanbul ignore if: Wrong-usage */
    if (!node) {
        return false;
    }

    /* Cache self, the parent list, and the previous and next items. */
    var parent = node.parent,
        prev = node.prev,
        next = node.next,
        indice;

    /* If the item is already detached, return node. */
    if (!parent) {
        return node;
    }

    /* If node is the last item in the parent, link the parents last
     * item to the previous item. */
    if (parent.tail === node) {
        parent.tail = prev;
    }

    /* If node is the first item in the parent, link the parents first
     * item to the next item. */
    if (parent.head === node) {
        parent.head = next;
    }

    /* If both the last and first items in the parent are the same,
     * remove the link to the last item. */
    if (parent.tail === parent.head) {
        parent.tail = null;
    }

    /* If a previous item exists, link its next item to nodes next
     * item. */
    if (prev) {
        prev.next = next;
    }

    /* If a next item exists, link its previous item to nodes previous
     * item. */
    if (next) {
        next.prev = prev;
    }

    /* istanbul ignore else: Wrong-usage */
    if ((indice = arrayIndexOf.call(parent, node)) !== -1) {
        arraySplice.call(parent, indice, 1);
    }

    /* Remove links from node to both the next and previous items,
     * and to the parent. */
    node.prev = node.next = node.parent = null;

    node.emit('remove', parent);

    if (next) {
        next.emit('changeprev', prev || null, node);
        node.emit('changenext', null, next);
    }

    if (prev) {
        node.emit('changeprev', null, prev);
        prev.emit('changenext', next || null, node);
    }

    parent.trigger('removeinside', node, parent);

    /* Return node. */
    return node;
}

function validateSplitPosition(position, length) {
    if (
        position === null ||
        position === undefined ||
        position !== position ||
        position === -Infinity
    ) {
            position = 0;
    } else if (position === Infinity) {
        position = length;
    } else if (typeof position !== 'number') {
        throw new TypeError('\'' + position + ' is not a valid ' +
            'argument for \'#split\'');
    } else if (position < 0) {
        position = Math.abs((length + position) % length);
    }

    return position;
}

function TextOMConstructor() {
    /**
     * Expose `Node`. Initialises a new `Node` object.
     *
     * @api public
     * @constructor
     */
    function Node() {
        if (!this.data) {
            /** @member {Object} */
            this.data = {};
        }
    }

    var prototype = Node.prototype;

    prototype.on = Node.on = function (name, callback) {
        var self = this,
            callbacks;

        if (typeof name !== 'string') {
            if (name === null || name === undefined) {
                return self;
            }

            throw new TypeError('Illegal invocation: \'' + name +
                ' is not a valid argument for \'listen\'');
        }

        if (typeof callback !== 'function') {
            if (callback === null || callback === undefined) {
                return self;
            }

            throw new TypeError('Illegal invocation: \'' + callback +
                ' is not a valid argument for \'listen\'');
        }

        callbacks = self.callbacks || (self.callbacks = {});
        callbacks = callbacks[name] || (callbacks[name] = []);
        callbacks.unshift(callback);

        return self;
    };

    prototype.off = Node.off = function (name, callback) {
        var self = this,
            callbacks, indice;

        if ((name === null || name === undefined) &&
            (callback === null || callback === undefined)) {
            self.callbacks = {};
            return self;
        }

        if (typeof name !== 'string') {
            if (name === null || name === undefined) {
                return self;
            }

            throw new TypeError('Illegal invocation: \'' + name +
                ' is not a valid argument for \'listen\'');
        }

        if (!(callbacks = self.callbacks)) {
            return self;
        }

        if (!(callbacks = callbacks[name])) {
            return self;
        }

        if (typeof callback !== 'function') {
            if (callback === null || callback === undefined) {
                callbacks.length = 0;
                return self;
            }

            throw new TypeError('Illegal invocation: \'' + callback +
                ' is not a valid argument for \'listen\'');
        }

        if ((indice = callbacks.indexOf(callback)) !== -1) {
            callbacks.splice(indice, 1);
        }

        return self;
    };

    prototype.emit = function (name) {
        var self = this,
            args = arraySlice.call(arguments, 1),
            constructors = self.constructor.constructors,
            iterator = -1,
            callbacks = self.callbacks;

        if (callbacks) {
            fire(self, callbacks[name], args);
        }

        /* istanbul ignore if: Wrong-usage */
        if (!constructors) {
            return;
        }

        while (constructors[++iterator]) {
            callbacks = constructors[iterator].callbacks;

            if (callbacks) {
                fire(self, callbacks[name], args);
            }
        }
    };

    prototype.trigger = function (name) {
        var self = this,
            args = arraySlice.call(arguments, 1),
            callbacks;

        while (self) {
            callbacks = self.callbacks;
            if (callbacks) {
                fire(self, callbacks[name], args);
            }

            callbacks = self.constructor.callbacks;
            if (callbacks) {
                fire(self, callbacks[name], args);
            }

            self = self.parent;
        }
    };

    /**
     * Inherit the contexts' (Super) prototype into a given Constructor. E.g.,
     * Node is implemented by Parent, Parent is implemented by RootNode, &c.
     *
     * @param {function} Constructor
     * @api public
     */
    Node.isImplementedBy = function (Constructor) {
        var self = this,
            constructors = self.constructors || [self],
            constructorPrototype, key, newPrototype;

        constructors = [Constructor].concat(constructors);

        constructorPrototype = Constructor.prototype;

        function AltConstructor () {}
        AltConstructor.prototype = self.prototype;
        newPrototype = new AltConstructor();

        for (key in constructorPrototype) {
            /* Note: Code climate, and probably other linters, will fail
             * here. Thats okay, their wrong. */
            newPrototype[key] = constructorPrototype[key];
        }

        if (constructorPrototype.toString !== {}.toString) {
            newPrototype.toString = constructorPrototype.toString;
        }

        for (key in self) {
            /* istanbul ignore else */
            if (self.hasOwnProperty(key)) {
                Constructor[key] = self[key];
            }
        }

        newPrototype.constructor = Constructor;
        Constructor.constructors = constructors;
        Constructor.prototype = newPrototype;
    };

    /**
     * Expose Parent. Constructs a new Parent node;
     *
     * @api public
     * @constructor
     */
    function Parent() {
        Node.apply(this, arguments);
    }

    prototype = Parent.prototype;

    /**
     * The first child of a parent, null otherwise.
     *
     * @api public
     * @type {?Child}
     * @readonly
     */
    prototype.head = null;

    /**
     * The last child of a parent (unless the last child is also the first
     * child), null otherwise.
     *
     * @api public
     * @type {?Child}
     * @readonly
     */
    prototype.tail = null;

    /**
     * The number of children in a parent.
     *
     * @api public
     * @type {number}
     * @readonly
     */
    prototype.length = 0;

    /**
     * Insert a child at the beginning of the list (like Array#unshift).
     *
     * @param {Child} child - the child to insert as the (new) FIRST child
     * @return {Child} - the given child.
     * @api public
     */
    prototype.prepend = function (child) {
        return insert(this, null, child);
    };

    /**
     * Insert a child at the end of the list (like Array#push).
     *
     * @param {Child} child - the child to insert as the (new) LAST child
     * @return {Child} - the given child.
     * @api public
     */
    prototype.append = function (child) {
        return insert(this, this.tail || this.head, child);
    };

    /**
     * Return a child at given position in parent, and null otherwise. (like
     * NodeList#item).
     *
     * @param {?number} [index=0] - the position to find a child at.
     * @return {Child?} - the found child, or null.
     * @api public
     */
    prototype.item = function (index) {
        if (index === null || index === undefined) {
            index = 0;
        } else if (typeof index !== 'number' || index !== index) {
            throw new TypeError('\'' + index + ' is not a valid argument ' +
                'for \'Parent.prototype.item\'');
        }

        return this[index] || null;
    };

    /**
     * Split the Parent into two, dividing the children from 0-position (NOT
     * including the character at `position`), and position-length (including
     * the character at `position`).
     *
     * @param {?number} [position=0] - the position to split at.
     * @return {Parent} - the prepended parent.
     * @api public
     */
    prototype.split = function (position) {
        var self = this,
            clone, cloneNode, iterator;

        position = validateSplitPosition(position, self.length);

        /* This throws if we're not attached, thus preventing appending. */
        /*eslint-disable new-cap */
        cloneNode = insert(self.parent, self.prev, new self.constructor());
        /*eslint-enable new-cap */

        clone = arraySlice.call(self);
        iterator = -1;

        while (++iterator < position && clone[iterator]) {
            cloneNode.append(clone[iterator]);
        }

        return cloneNode;
    };

    /**
     * Return the result of calling `toString` on each of `Parent`s children.
     *
     * NOTE The `toString` method is intentionally generic; It can be
     * transferred to other kinds of (linked-list-like) objects for use as a
     * method.
     *
     * @return {String}
     * @api public
     */
    prototype.toString = function () {
        var value, node;

        value = '';
        node = this.head;

        while (node) {
            value += node;
            node = node.next;
        }

        return value;
    };

    /**
     * Inherit from `Node.prototype`.
     */
    Node.isImplementedBy(Parent);

    /**
     * Expose Child. Constructs a new Child node;
     *
     * @api public
     * @constructor
     */
    function Child() {
        Node.apply(this, arguments);
    }

    prototype = Child.prototype;

    /**
     * The parent node, null otherwise (when the child is detached).
     *
     * @api public
     * @type {?Parent}
     * @readonly
     */
    prototype.parent = null;

    /**
     * The next node, null otherwise (when `child` is the parents last child
     * or detached).
     *
     * @api public
     * @type {?Child}
     * @readonly
     */
    prototype.next = null;

    /**
     * The previous node, null otherwise (when `child` is the parents first
     * child or detached).
     *
     * @api public
     * @type {?Child}
     * @readonly
     */
    prototype.prev = null;

    /**
     * Insert a given child before the operated on child in the parent.
     *
     * @param {Child} child - the child to insert before the operated on
     *                        child.
     * @return {Child} - the given child.
     * @api public
     */
    prototype.before = function (child) {
        return insert(this.parent, this.prev, child);
    };

    /**
     * Insert a given child after the operated on child in the parent.
     *
     * @param {Child} child - the child to insert after the operated on child.
     * @return {Child} - the given child.
     * @api public
     */
    prototype.after = function (child) {
        return insert(this.parent, this, child);
    };

    /**
     * Remove the operated on child, and insert a given child at its previous
     * position in the parent.
     *
     * @param {Child} child - the child to replace the operated on child with.
     * @return {Child} - the given child.
     * @api public
     */
    prototype.replace = function (child) {
        var result = insert(this.parent, this, child);

        remove(this);

        return result;
    };

    /**
     * Remove the operated on child.
     *
     * @return {Child} - the operated on child.
     * @api public
     */
    prototype.remove = function () {
        return remove(this);
    };

    /**
     * Inherit from `Node.prototype`.
     */
    Node.isImplementedBy(Child);

    /**
     * Expose Element. Constructs a new Element node;
     *
     * @api public
     * @constructor
     */
    function Element() {
        Parent.apply(this, arguments);
        Child.apply(this, arguments);
    }

    /**
     * Inherit from `Parent.prototype` and `Child.prototype`.
     */
    Parent.isImplementedBy(Element);
    Child.isImplementedBy(Element);

    /* Add Parent as a constructor (which it is) */
    Element.constructors.splice(2, 0, Parent);

    /**
     * Expose Text. Constructs a new Text node;
     *
     * @api public
     * @constructor
     */
    function Text(value) {
        Child.apply(this, arguments);

        this.fromString(value);
    }

    prototype = Text.prototype;

    /**
     * The internal value.
     *
     * @api private
     */
    prototype.internalValue = '';

    /**
     * Return the internal value of a Text;
     *
     * @return {String}
     * @api public
     */
    prototype.toString = function () {
        return this.internalValue;
    };

    /**
     * (Re)sets and returns the internal value of a Text with the stringified
     * version of the given value.
     *
     * @param {?String} [value=''] - the value to set
     * @return {String}
     * @api public
     */
    prototype.fromString = function (value) {
        var self = this,
            previousValue = self.toString(),
            parent;

        if (value === null || value === undefined) {
            value = '';
        } else {
            value = value.toString();
        }

        if (value !== previousValue) {
            self.internalValue = value;

            self.emit('changetext', value, previousValue);

            parent = self.parent;
            if (parent) {
                parent.trigger(
                    'changetextinside', self, value, previousValue
                );
            }
        }

        return value;
    };

    /**
     * Split the Text into two, dividing the internal value from 0-position
     * (NOT including the character at `position`), and position-length
     * (including the character at `position`).
     *
     * @param {?number} [position=0] - the position to split at.
     * @return {Child} - the prepended child.
     * @api public
     */
    prototype.split = function (position) {
        var self = this,
            value = self.internalValue,
            cloneNode;

        position = validateSplitPosition(position, value.length);

        /* This throws if we're not attached, thus preventing substringing. */
        /*eslint-disable new-cap */
        cloneNode = insert(self.parent, self.prev, new self.constructor());
        /*eslint-enable new-cap */

        self.fromString(value.slice(position));
        cloneNode.fromString(value.slice(0, position));

        return cloneNode;
    };

    /**
     * Inherit from `Child.prototype`.
     */
    Child.isImplementedBy(Text);

    /**
     * Expose RootNode. Constructs a new RootNode (inheriting from Parent);
     *
     * @api public
     * @constructor
     */
    function RootNode() {
        Parent.apply(this, arguments);
    }

    /**
     * The type of an instance of RootNode.
     *
     * @api public
     * @readonly
     * @static
     */
    RootNode.prototype.type = ROOT_NODE;

    RootNode.prototype.allowedChildTypes = [
        PARAGRAPH_NODE,
        WHITE_SPACE_NODE,
        SOURCE_NODE
    ];

    /**
     * Inherit from `Parent.prototype`.
     */
    Parent.isImplementedBy(RootNode);

    /**
     * Expose ParagraphNode. Constructs a new ParagraphNode (inheriting from
     * both Parent and Child);
     *
     * @api public
     * @constructor
     */
    function ParagraphNode() {
        Element.apply(this, arguments);
    }

    /**
     * The type of an instance of ParagraphNode.
     *
     * @api public
     * @readonly
     * @static
     */
    ParagraphNode.prototype.type = PARAGRAPH_NODE;

    ParagraphNode.prototype.allowedChildTypes = [
        SENTENCE_NODE,
        WHITE_SPACE_NODE,
        SOURCE_NODE
    ];

    /**
     * Inherit from `Parent.prototype` and `Child.prototype`.
     */
    Element.isImplementedBy(ParagraphNode);

    /**
     * Expose SentenceNode. Constructs a new SentenceNode (inheriting from
     * both Parent and Child);
     *
     * @api public
     * @constructor
     */
    function SentenceNode() {
        Element.apply(this, arguments);
    }

    /**
     * The type of an instance of SentenceNode.
     *
     * @api public
     * @readonly
     * @static
     */
    SentenceNode.prototype.type = SENTENCE_NODE;

    SentenceNode.prototype.allowedChildTypes = [
        WORD_NODE, PUNCTUATION_NODE, WHITE_SPACE_NODE, SOURCE_NODE
    ];

    /**
     * Inherit from `Parent.prototype` and `Child.prototype`.
     */
    Element.isImplementedBy(SentenceNode);

    /**
     * Expose WordNode.
     */
    function WordNode() {
        Element.apply(this, arguments);
    }

    /**
     * The type of an instance of WordNode.
     *
     * @api public
     * @readonly
     * @static
     */
    WordNode.prototype.type = WORD_NODE;

    WordNode.prototype.allowedChildTypes = [TEXT_NODE, PUNCTUATION_NODE];

    /**
     * Inherit from `Text.prototype`.
     */
    Element.isImplementedBy(WordNode);

    /**
     * Expose PunctuationNode.
     */
    function PunctuationNode() {
        Element.apply(this, arguments);
    }

    /**
     * The type of an instance of PunctuationNode.
     *
     * @api public
     * @readonly
     * @static
     */
    PunctuationNode.prototype.type = PUNCTUATION_NODE;

    PunctuationNode.prototype.allowedChildTypes = [TEXT_NODE];

    /**
     * Inherit from `Text.prototype`.
     */
    Element.isImplementedBy(PunctuationNode);

    /**
     * Expose WhiteSpaceNode.
     */
    function WhiteSpaceNode() {
        PunctuationNode.apply(this, arguments);
    }

    /**
     * The type of an instance of WhiteSpaceNode.
     *
     * @api public
     * @readonly
     * @static
     */
    WhiteSpaceNode.prototype.type = WHITE_SPACE_NODE;

    WhiteSpaceNode.prototype.allowedChildTypes = [TEXT_NODE];

    /**
     * Inherit from `Text.prototype`.
     */
    PunctuationNode.isImplementedBy(WhiteSpaceNode);

    /**
     * Expose SourceNode.
     */
    function SourceNode() {
        Text.apply(this, arguments);
    }

    /**
     * The type of an instance of SourceNode.
     *
     * @api public
     * @readonly
     * @static
     */
    SourceNode.prototype.type = SOURCE_NODE;

    /**
     * Inherit from `Text.prototype`.
     */
    Text.isImplementedBy(SourceNode);

    /**
     * Expose TextNode.
     */
    function TextNode() {
        Text.apply(this, arguments);
    }

    /**
     * The type of an instance of TextNode.
     *
     * @api public
     * @readonly
     * @static
     */
    TextNode.prototype.type = TEXT_NODE;

    /**
     * Inherit from `Text.prototype`.
     */
    Text.isImplementedBy(TextNode);

    var nodePrototype = Node.prototype,
        TextOM;

    /**
     * Define the `TextOM` object.
     * Expose `TextOM` on every instance of Node.
     *
     * @api public
     */
    nodePrototype.TextOM = TextOM = {};

    /**
     * Export all node types to `TextOM` and `Node#`.
     */
    TextOM.ROOT_NODE = nodePrototype.ROOT_NODE = ROOT_NODE;
    TextOM.PARAGRAPH_NODE = nodePrototype.PARAGRAPH_NODE = PARAGRAPH_NODE;
    TextOM.SENTENCE_NODE = nodePrototype.SENTENCE_NODE = SENTENCE_NODE;
    TextOM.WORD_NODE = nodePrototype.WORD_NODE = WORD_NODE;
    TextOM.PUNCTUATION_NODE = nodePrototype.PUNCTUATION_NODE =
        PUNCTUATION_NODE;
    TextOM.WHITE_SPACE_NODE = nodePrototype.WHITE_SPACE_NODE =
        WHITE_SPACE_NODE;
    TextOM.SOURCE_NODE = nodePrototype.SOURCE_NODE = SOURCE_NODE;
    TextOM.TEXT_NODE = nodePrototype.TEXT_NODE = TEXT_NODE;

    /**
     * Export all `Node`s to `TextOM`.
     */
    TextOM.Node = Node;
    TextOM.Parent = Parent;
    TextOM.Child = Child;
    TextOM.Element = Element;
    TextOM.Text = Text;
    TextOM.RootNode = RootNode;
    TextOM.ParagraphNode = ParagraphNode;
    TextOM.SentenceNode = SentenceNode;
    TextOM.WordNode = WordNode;
    TextOM.PunctuationNode = PunctuationNode;
    TextOM.WhiteSpaceNode = WhiteSpaceNode;
    TextOM.SourceNode = SourceNode;
    TextOM.TextNode = TextNode;

    /**
     * Expose `TextOM`. Used to instantiate a new `RootNode`.
     */
    return TextOM;
}

module.exports = TextOMConstructor;

});

require.register("visionmedia~co@3.1.0", function (exports, module) {

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co;

/**
 * Wrap the given generator `fn` and
 * return a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var isGenFun = isGeneratorFunction(fn);

  return function (done) {
    var ctx = this;

    // in toThunk() below we invoke co()
    // with a generator, so optimize for
    // this case
    var gen = fn;

    // we only need to parse the arguments
    // if gen is a generator function.
    if (isGenFun) {
      var args = slice.call(arguments), len = args.length;
      var hasCallback = len && 'function' == typeof args[len - 1];
      done = hasCallback ? args.pop() : error;
      gen = fn.apply(this, args);
    } else {
      done = done || error;
    }

    next();

    // #92
    // wrap the callback in a setImmediate
    // so that any of its errors aren't caught by `co`
    function exit(err, res) {
      setImmediate(function(){
        done.call(ctx, err, res);
      });
    }

    function next(err, res) {
      var ret;

      // multiple args
      if (arguments.length > 2) res = slice.call(arguments, 1);

      // error
      if (err) {
        try {
          ret = gen.throw(err);
        } catch (e) {
          return exit(e);
        }
      }

      // ok
      if (!err) {
        try {
          ret = gen.next(res);
        } catch (e) {
          return exit(e);
        }
      }

      // done
      if (ret.done) return exit(null, ret.value);

      // normalize
      ret.value = toThunk(ret.value, ctx);

      // run
      if ('function' == typeof ret.value) {
        var called = false;
        try {
          ret.value.call(ctx, function(){
            if (called) return;
            called = true;
            next.apply(ctx, arguments);
          });
        } catch (e) {
          setImmediate(function(){
            if (called) return;
            called = true;
            next(e);
          });
        }
        return;
      }

      // invalid
      next(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following was passed: "' + String(ret.value) + '"'));
    }
  }
}

/**
 * Convert `obj` into a normalized thunk.
 *
 * @param {Mixed} obj
 * @param {Mixed} ctx
 * @return {Function}
 * @api private
 */

function toThunk(obj, ctx) {

  if (isGeneratorFunction(obj)) {
    return co(obj.call(ctx));
  }

  if (isGenerator(obj)) {
    return co(obj);
  }

  if (isPromise(obj)) {
    return promiseToThunk(obj);
  }

  if ('function' == typeof obj) {
    return obj;
  }

  if (isObject(obj) || Array.isArray(obj)) {
    return objectToThunk.call(ctx, obj);
  }

  return obj;
}

/**
 * Convert an object of yieldables to a thunk.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToThunk(obj){
  var ctx = this;
  var isArray = Array.isArray(obj);

  return function(done){
    var keys = Object.keys(obj);
    var pending = keys.length;
    var results = isArray
      ? new Array(pending) // predefine the array length
      : new obj.constructor();
    var finished;

    if (!pending) {
      setImmediate(function(){
        done(null, results)
      });
      return;
    }

    // prepopulate object keys to preserve key ordering
    if (!isArray) {
      for (var i = 0; i < pending; i++) {
        results[keys[i]] = undefined;
      }
    }

    for (var i = 0; i < keys.length; i++) {
      run(obj[keys[i]], keys[i]);
    }

    function run(fn, key) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        if ('function' != typeof fn) {
          results[key] = fn;
          return --pending || done(null, results);
        }

        fn.call(ctx, function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[key] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  }
}

/**
 * Convert `promise` to a thunk.
 *
 * @param {Object} promise
 * @return {Function}
 * @api private
 */

function promiseToThunk(promise) {
  return function(fn){
    promise.then(function(res) {
      fn(null, res);
    }, fn);
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return obj && 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return obj && 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return val && Object == val.constructor;
}

/**
 * Throw `err` in a new stack.
 *
 * This is used when co() is invoked
 * without supplying a callback, which
 * should only be for demonstrational
 * purposes.
 *
 * @param {Error} err
 * @api private
 */

function error(err) {
  if (!err) return;
  setImmediate(function(){
    throw err;
  });
}

});

require.register("matthewmueller~wrap-fn@0.1.1", function (exports, module) {
/**
 * Module Dependencies
 */

var slice = [].slice;
var co = require("visionmedia~co@3.1.0");
var noop = function(){};

/**
 * Export `wrap-fn`
 */

module.exports = wrap;

/**
 * Wrap a function to support
 * sync, async, and gen functions.
 *
 * @param {Function} fn
 * @param {Function} done
 * @return {Function}
 * @api public
 */

function wrap(fn, done) {
  done = done || noop;

  return function() {
    var args = slice.call(arguments);
    var ctx = this;

    // done
    if (!fn) {
      return done.apply(ctx, [null].concat(args));
    }

    // async
    if (fn.length > args.length) {
      return fn.apply(ctx, args.concat(done));
    }

    // generator
    if (generator(fn)) {
      return co(fn).apply(ctx, args.concat(done));
    }

    // sync
    return sync(fn, done).apply(ctx, args);
  }
}

/**
 * Wrap a synchronous function execution.
 *
 * @param {Function} fn
 * @param {Function} done
 * @return {Function}
 * @api private
 */

function sync(fn, done) {
  return function () {
    var ret;

    try {
      ret = fn.apply(this, arguments);
    } catch (err) {
      return done(err);
    }

    if (promise(ret)) {
      ret.then(function (value) { done(null, value); }, done);
    } else {
      ret instanceof Error ? done(ret) : done(null, ret);
    }
  }
}

/**
 * Is `value` a generator?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function generator(value) {
  return value
    && value.constructor
    && 'GeneratorFunction' == value.constructor.name;
}


/**
 * Is `value` a promise?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function promise(value) {
  return value && 'function' == typeof value.then;
}

});

require.register("segmentio~ware@1.2.0", function (exports, module) {
/**
 * Module Dependencies
 */

var slice = [].slice;
var wrap = require("matthewmueller~wrap-fn@0.1.1");

/**
 * Expose `Ware`.
 */

module.exports = Ware;

/**
 * Initialize a new `Ware` manager, with optional `fns`.
 *
 * @param {Function or Array or Ware} fn (optional)
 */

function Ware (fn) {
  if (!(this instanceof Ware)) return new Ware(fn);
  this.fns = [];
  if (fn) this.use(fn);
}

/**
 * Use a middleware `fn`.
 *
 * @param {Function or Array or Ware} fn
 * @return {Ware}
 */

Ware.prototype.use = function (fn) {
  if (fn instanceof Ware) {
    return this.use(fn.fns);
  }

  if (fn instanceof Array) {
    for (var i = 0, f; f = fn[i++];) this.use(f);
    return this;
  }

  this.fns.push(fn);
  return this;
};

/**
 * Run through the middleware with the given `args` and optional `callback`.
 *
 * @param {Mixed} args...
 * @param {Function} callback (optional)
 * @return {Ware}
 */

Ware.prototype.run = function () {
  var fns = this.fns;
  var ctx = this;
  var i = 0;
  var last = arguments[arguments.length - 1];
  var done = 'function' == typeof last && last;
  var args = done
    ? slice.call(arguments, 0, arguments.length - 1)
    : slice.call(arguments);

  // next step
  function next (err) {
    if (err) return done(err);
    var fn = fns[i++];
    var arr = slice.call(args);

    if (!fn) {
      return done && done.apply(null, [null].concat(args));
    }

    wrap(fn, next).apply(ctx, arr);
  }

  next();

  return this;
};

});

require.register("wooorm~retext@0.2.0-rc.3", function (exports, module) {
'use strict';

var TextOMConstructor,
    ParseLatin,
    Ware,
    has;

/**
 * Module dependencies.
 */

TextOMConstructor = require("wooorm~textom@0.1.1");
ParseLatin = require("wooorm~parse-latin@0.1.3");
Ware = require("segmentio~ware@1.2.0");

/**
 * Cached, fast, secure existence test.
 */

has = Object.prototype.hasOwnProperty;

/**
 * Transform a concrete syntax tree into a tree constructed
 * from a given object model.
 *
 * @param {Object} TextOM - the object model.
 * @param {Object} cst - the concrete syntax tree to
 *   transform.
 * @return {Node} the node constructed from the
 *   CST and the object model.
 */

function fromCST(TextOM, cst) {
    var index,
        node,
        children,
        data,
        attribute;

    node = new TextOM[cst.type]();

    if ('children' in cst) {
        index = -1;
        children = cst.children;

        while (children[++index]) {
            node.append(fromCST(TextOM, children[index]));
        }
    } else {
        node.fromString(cst.value);
    }

    /**
     * Currently, `data` properties are not really
     * specified or documented. Therefore, the following
     * branch is ignored by Istanbul.
     *
     * The idea is that plugins and parsers can each
     * attach data to nodes, in a similar fashion to the
     * DOMs dataset, which can be stringified and parsed
     * back and forth between the concrete syntax tree
     * and the node.
     */

    /* istanbul ignore if: TODO, Untestable, will change soon. */
    if ('data' in cst) {
        data = cst.data;

        for (attribute in data) {
            if (has.call(data, attribute)) {
                node.data[attribute] = data[attribute];
            }
        }
    }

    return node;
}

/**
 * Construct an instance of `Retext`.
 *
 * @param {Function?} parser - the parser to use. Defaults
 *   to a new instance of `parse-latin`.
 * @constructor
 */

function Retext(parser) {
    var self,
        TextOM;

    if (!parser) {
        parser = new ParseLatin();
    }

    self = this;
    TextOM = new TextOMConstructor();

    self.ware = new Ware();
    self.parser = parser;
    self.TextOM = TextOM;

    /**
     * Expose `TextOM` on `parser`, and vice versa.
     */

    parser.TextOM = TextOM;
    TextOM.parser = parser;
}

/**
 * Attaches `plugin`: a humble function.
 *
 * When `parse` or `run` is invoked, `plugin` is
 * invoked with `node` and a `retext` instance.
 *
 * If `plugin` contains asynchronous functionality, it
 * should accept a third argument (`next`) and invoke
 * it on completion.
 *
 * `plugin.attach` is invoked with a `retext` instance
 * when attached, enabling `plugin` to depend on other
 * plugins.
 *
 * Code to initialize `plugin` should go into its `attach`
 * method, such as functionality to modify the object model
 * (TextOM), the parser (e.g., `parse-latin`), or the
 * `retext` instance. `plugin.attach` is invoked when
 * `plugin` is attached to a `retext` instance.
 *
 * @param {function(Node, Retext, Function?)} plugin -
 *   functionality to analyze and manipulate a node.
 * @param {function(Retext)} plugin.attach - functionality
 *   to initialize `plugin`.
 * @return this
 */

Retext.prototype.use = function (plugin) {
    var self;

    if (typeof plugin !== 'function') {
        throw new TypeError(
            'Illegal invocation: `' + plugin + '` ' +
            'is not a valid argument for `Retext#use(plugin)`'
        );
    }

    self = this;

    if (self.ware.fns.indexOf(plugin) === -1) {
        self.ware.use(plugin);

        if (plugin.attach) {
            plugin.attach(self);
        }
    }

    return self;
};

/**
 * Transform a given value into a node, applies attached
 * plugins to the node, and invokes `done` with either an
 * error (first argument) or the transformed node (second
 * argument).
 *
 * @param {string?} value - The value to transform.
 * @param {function(Error, Node)} done - Callback to
 *   invoke when the transformations have completed.
 * @return this
 */

Retext.prototype.parse = function (value, done) {
    var self,
        cst;

    if (typeof done !== 'function') {
        throw new TypeError(
            'Illegal invocation: `' + done + '` ' +
            'is not a valid argument for `Retext#parse(value, done)`.\n' +
            'This breaking change occurred in 0.2.0-rc.1, see GitHub for ' +
            'more information.'
        );
    }

    self = this;

    cst = self.parser.parse(value);

    self.run(fromCST(self.TextOM, cst), done);

    return self;
};

/**
 * Applies attached plugins to `node` and invokes `done`
 * with either an error (first argument) or the transformed
 * `node` (second argument).
 *
 * @param {Node} node - The node to apply attached
 *   plugins to.
 * @param {function(Error, Node)} done - Callback to
 *   invoke when the transformations have completed.
 * @return this
 */

Retext.prototype.run = function (node, done) {
    var self;

    if (typeof done !== 'function') {
        throw new TypeError(
            'Illegal invocation: `' + done + '` ' +
            'is not a valid argument for ' +
            '`Retext#run(node, done)`.\n' +
            'This breaking change occurred in 0.2.0-rc.1, see GitHub for ' +
            'more information.'
        );
    }

    self = this;

    self.ware.run(node, self, done);

    return self;
};

/**
 * Expose `Retext`.
 */

module.exports = Retext;

});

require.register("wooorm~n-gram@0.0.1", function (exports, module) {
'use strict';

/**
 * A factory returning a function that converts a given string to n-grams.
 *
 * @example
 *   nGram(2) // [Function]
 *
 * @example
 *   nGram(4) // [Function]
 *
 *
 * @param {number} n - The `n` in n-gram.
 * @throws {Error} When `n` is not a number (incl. NaN), Infinity, or lt 1.
 * @return {Function} A function creating n-grams from a given value.
 */

function nGram(n) {
    if (
        typeof n !== 'number' ||
        n < 1 ||
        n !== n ||
        n === Infinity
    ) {
        throw new Error(
            'Type error: `' + n + '` is not a valid argument for n-gram'
        );
    }

    /**
     * Create n-grams from a given value.
     *
     * @example
     *   nGram(4)('n-gram')
     *   // ['n-gr', '-gra', 'gram']
     *
     * @param {*} value - The value to stringify and convert into n-grams.
     * @return {Array.<string>} n-grams
     */

    return function (value) {
        var nGrams = [],
            index;

        if (value === null || value === undefined) {
            return nGrams;
        }

        value = String(value);
        index = value.length - n + 1;

        if (index < 1) {
            return [];
        }

        while (index--) {
            nGrams[index] = value.substr(index, n);
        }

        return nGrams;
    };
}

/**
 * Export `n-gram`.
 */

module.exports = nGram;

/**
 * Create bigrams from a given value.
 *
 * @example
 *   bigram('n-gram')
 *   // ["n-", "-g", "gr", "ra", "am"]
 *
 * @param {*} value - The value to stringify and convert into bigrams.
 * @return {Array.<string>} bigrams
 */

nGram.bigram = nGram(2);

/**
 * Create trigrams from a given value.
 *
 * @example
 *   trigram('n-gram')
 *   // ["n-g", "-gr", "gra", "ram"]
 *
 * @param {*} value - The value to stringify and convert into trigrams.
 * @return {Array.<string>} trigrams
 */

nGram.trigram = nGram(3);

});

require.register("wooorm~trigram-utils@0.0.2", function (exports, module) {
// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// ==/ClosureCompiler==

'use strict';

var getTrigrams, EXPRESSION_SYMBOLS, has;

/**
 * Module dependencies.
 */

getTrigrams = require("wooorm~n-gram@0.0.1").trigram;

/**
 * Faster, securer, existence checks.
 */

has = Object.prototype.hasOwnProperty;

/**
 * An expression matching general non-important (as in, for
 * language detection) punctuation marks, symbols, and numbers.
 *
 * | Unicode | Character | Name               |
 * | ------: | :-------: | :----------------- |
 * |  \u0021 |     !     | EXCLAMATION MARK   |
 * |  \u0022 |     "     | QUOTATION MARK     |
 * |  \u0023 |     #     | NUMBER SIGN        |
 * |  \u0024 |     $     | DOLLAR SIGN        |
 * |  \u0025 |     %     | PERCENT SIGN       |
 * |  \u0026 |     &     | AMPERSAND          |
 * |  \u0027 |     '     | APOSTROPHE         |
 * |  \u0028 |     (     | LEFT PARENTHESIS   |
 * |  \u0029 |     )     | RIGHT PARENTHESIS  |
 * |  \u002A |     *     | ASTERISK           |
 * |  \u002B |     +     | PLUS SIGN          |
 * |  \u002C |     ,     | COMMA              |
 * |  \u002D |     -     | HYPHEN-MINUS       |
 * |  \u002E |     .     | FULL STOP          |
 * |  \u002F |     /     | SOLIDUS            |
 * |  \u0030 |     0     | DIGIT ZERO         |
 * |  \u0031 |     1     | DIGIT ONE          |
 * |  \u0032 |     2     | DIGIT TWO          |
 * |  \u0033 |     3     | DIGIT THREE        |
 * |  \u0034 |     4     | DIGIT FOUR         |
 * |  \u0035 |     5     | DIGIT FIVE         |
 * |  \u0036 |     6     | DIGIT SIX          |
 * |  \u0037 |     7     | DIGIT SEVEN        |
 * |  \u0038 |     8     | DIGIT EIGHT        |
 * |  \u0039 |     9     | DIGIT NINE         |
 * |  \u003A |     :     | COLON              |
 * |  \u003B |     ;     | SEMICOLON          |
 * |  \u003C |     <     | LESS-THAN SIGN     |
 * |  \u003D |     =     | EQUALS SIGN        |
 * |  \u003E |     >     | GREATER-THAN SIGN  |
 * |  \u003F |     ?     | QUESTION MARK      |
 * |  \u0040 |     @     | COMMERCIAL AT      |
 */

EXPRESSION_SYMBOLS = /[\u0021-\u0040]+/g;

/**
 * Clean a text input stream.
 *
 * @example
 *   > clean('Some dirty  text.')
 *   // 'some dirty text'
 *
 * @param {string} value - the input value.
 * @returns {string} the cleaned value.
 */

function clean(value) {
    if (value === null || value === undefined) {
        value = '';
    }

    return String(value)
        .replace(EXPRESSION_SYMBOLS, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

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
 * Get clean, padded, trigrams.
 *
 * @param {string} value - the input value.
 * @returns {Array.<string>} the cleaned, padded, tigrams.
 */

function getCleanTrigrams(value) {
    return getTrigrams(' ' + clean(value) + ' ');
}

/**
 * Get an object with trigrams as its attributes, and their
 * occurence count as their values
 *
 * @param {string} value
 * @return {Object.<string, number>} - Object containing
 *   weighted trigrams.
 */

function getCleanTrigramsAsDictionary(value) {
    var trigrams,
        dictionary,
        index,
        trigram;

    trigrams = getCleanTrigrams(value);
    dictionary = {};
    index = trigrams.length;

    while (index--) {
        trigram = trigrams[index];

        if (has.call(dictionary, trigram)) {
            dictionary[trigram]++;
        } else {
            dictionary[trigram] = 1;
        }
    }

    return dictionary;
}

/**
 * Get the array containing trigram--count tuples from a
 * given value.
 *
 * @param {string} value
 * @return {Array.<Array.<string, number>>} An array containing
 *   trigram--count tupples, sorted by count (low to high).
 */

function getCleanTrigramsAsTuples(value) {
    var dictionary,
        tuples,
        trigram;

    dictionary = getCleanTrigramsAsDictionary(value);
    tuples = [];

    for (trigram in dictionary) {
        tuples.push([trigram, dictionary[trigram]]);
    }

    tuples.sort(sort);

    return tuples;
}

/**
 * Get the array containing trigram--count tuples from a
 * given value.
 *
 * @param {Array.<Array.<string, number>>} tuples - the tuples
 *   to transform into a dictionary.
 * @return {Object.<string, number>} The dictionary.
 */

function getCleanTrigramTuplesAsDictionary(tuples) {
    var dictionary,
        index,
        tuple;

    dictionary = {};
    index = tuples.length;

    while (index--) {
        tuple = tuples[index];
        dictionary[tuple[0]] = tuple[1];
    }

    return dictionary;
}

/**
 * Export the utilities.
 */

module.exports = {
    'clean' : clean,
    'trigrams' : getCleanTrigrams,
    'asDictionary' : getCleanTrigramsAsDictionary,
    'asTuples' : getCleanTrigramsAsTuples,
    'tuplesAsDictionary' : getCleanTrigramTuplesAsDictionary
};

});

require.register("wooorm~franc@0.1.1", function (exports, module) {
/* Guess the natural language of a text
 * Copyright (c) 2014 Titus Wormer <tituswormer@gmail.com>
 * http://github.com/wooorm/franc/
 *
 * Original Python package:
 * Copyright (c) 2008, Kent S Johnson
 * http://code.google.com/p/guess-language/
 *
 * Original C++ version for KDE:
 * Copyright (c) 2006 Jacob R Rideout <kde@jacobrideout.net>
 * http://websvn.kde.org/branches/work/sonnet-refactoring/common/
 *     nlp/guesslanguage.cpp?view=markup
 *
 * Original Language::Guess Perl module:
 * Copyright (c) 2004-2006 Maciej Ceglowski
 * http://web.archive.org/web/20090228163219/http://languid.cantbedone.org/
 *
 * Note: Language::Guess is GPL-licensed. KDE developers received permission
 * from the author to distribute their port under LGPL:
 * http://lists.kde.org/?l=kde-sonnet&m=116910092228811&w=2
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

var models,
    utilities,
    FOURTY_PERCENT,
    TWENTY_PERCENT,
    MAX_LENGTH,
    MIN_LENGTH,
    MAX_DIFFERENCE,
    SINGLETONS,
    ALL_LATIN,
    CYRILLIC,
    ARABIC,
    DEVANAGARI,
    PT,
    unicodeBlocks,
    singletonsLength,
    unicodeBlockCount;

/**
 * Load `trigram-utils`.
 */

utilities = require("wooorm~trigram-utils@0.0.2");

/**
 * Load trigram data files.
 */

models = require("wooorm~franc@0.1.1/data.json");

/**
 * Construct trigram dictionaries.
 */

(function () {
    var languageModel,
        languageName,
        index,
        newModel;

    for (languageName in models) {
        languageModel = models[languageName].split('|');

        index = languageModel.length;
        models[languageName] = newModel = {};

        while (index--) {
            newModel[languageModel[index]] = index;
        }
    }
})();

/**
 * Maximum sample length.
 */

MAX_LENGTH = 4096;

/**
 * Minimum sample length.
 */

MIN_LENGTH = 10;

/**
 * The maximum distance to add when a given trigram does
 * not exist in a trigram dictionary.
 */

MAX_DIFFERENCE = 300;

/**
 * When the characters of certain scripts account for
 * 40% (or higher) of a string, the string is tested
 * against fewer than all trigrams.
 */

FOURTY_PERCENT = 0.4;

/**
 * When the characters of certain scripts account for
 * 20% (or higher) of a string, the string is tested
 * against fewer than all trigrams.
 */

TWENTY_PERCENT = 0.2;

/**
 * Some scripts are exclusivly used by a single language.
 * This list contains this mapping.
 */

SINGLETONS = [
  ['armenian', 'hy'],
  ['bengali', 'bn'],
  ['burmese', 'my'],
  ['georgian', 'ka'],
  ['greek', 'el'],
  ['gujarati', 'gu'],
  ['gurmukhi', 'pa'],
  ['hebrew', 'he'],
  ['kannada', 'kn'],
  ['khmer', 'km'],
  ['lao', 'lo'],
  ['malayalam', 'ml'],
  ['mongolian', 'mn'],
  ['oriya', 'or'],
  ['sinhala', 'si'],
  ['tamil', 'ta'],
  ['telugu', 'te'],
  ['thai', 'th'],
  ['tibetan', 'bo']
];

/**
 * Cached length of the above singletons.
 */

singletonsLength = SINGLETONS.length;

/**
 * A list of all languages which use the Latin
 * script (both basic and extended).
 */

ALL_LATIN = [
    /* Basic Latin */
    'ceb', 'en', 'eu', 'ha', 'haw', 'id', 'la', 'nr', 'nso', 'so', 'ss',
    'st', 'sw', 'tlh', 'tn', 'ts', 'xh', 'zu',

    /* Extended Latin */
    'af', 'az', 'ca', 'cs', 'cy', 'da', 'de', 'es', 'et', 'fi', 'fr', 'hr',
    'hu', 'is', 'it', 'lt', 'lv', 'nl', 'no', 'pl', 'pt', 'ro', 'sk', 'sl',
    'sq', 'sv', 'tl', 'tr', 've', 'vi'
];

/**
 * A list of all languages which use the Cyrillic script.
 */

CYRILLIC = ['bg', 'kk', 'ky', 'mk', 'mn', 'ru', 'sr', 'uk', 'uz'];

/**
 * A list of all languages which use the Arabic script.
 */

ARABIC = ['ar', 'fa', 'ps', 'ur'];

/**
 * A list of all languages which use the Devanagari script.
 */

DEVANAGARI = ['hi', 'ne'];

/**
 * The two supported portuguese languages.
 */

PT = ['pt-BR', 'pt-PT'];

/**
 * Expressions to match certain scripts.
 */

unicodeBlocks = [
    ['arabic', /[\u0600-\u06FF]/g],
    ['arabicPresentationFormsA', /[\uFB50-\uFDFF]/g],
    ['arabicPresentationFormsB', /[\uFE70-\uFEFF]/g],
    ['armenian', /[\u0530-\u058F]/g],
    ['bengali', /[\u0980-\u09FF]/g],
    ['bopomofo', /[\u3100-\u312F]/g],
    ['bopomofoExtended', /[\u31A0-\u31BF]/g],
    ['burmese', /[\u1000-\u109F]/g],
    ['CJKUnifiedIdeographs', /[\u4E00-\u9FFF]/g],
    ['cyrillic', /[\u0400-\u04FF]/g],
    ['devanagari', /[\u0900-\u097F]/g],
    ['georgian', /[\u10A0-\u10FF]/g],
    ['greekAndCoptic', /[\u0370-\u03FF]/g],
    ['gujarati', /[\u0A80-\u0AFF]/g],
    ['gurmukhi', /[\u0A00-\u0A7F]/g],
    ['hangulCompatibilityJamo', /[\u3130-\u318F]/g],
    ['hangulJamo', /[\u1100-\u11FF]/g],
    ['hangulSyllables', /[\uAC00-\uD7AF]/g],
    ['hebrew', /[\u0590-\u05FF]/g],
    ['hiragana', /[\u3040-\u309F]/g],
    ['xangXiRadicals', /[\u2F00-\u2FDF]/g],
    ['kannada', /[\u0C80-\u0CFF]/g],
    ['katakana', /[\u30A0-\u30FF]/g],
    ['katakanaPhoneticExtensions', /[\u31F0-\u31FF]/g],
    ['khmer', /[\u1780-\u17FF]/g],
    ['lao', /[\u0E80-\u0EFF]/g],
    ['malayalam', /[\u0D00-\u0D7F]/g],
    ['mongolian', /[\u1800-\u18AF]/g],
    ['oriya', /[\u0B00-\u0B7F]/g],
    ['sinhala', /[\u0D80-\u0DFF]/g],
    ['tamil', /[\u0B80-\u0BFF]/g],
    ['telugu', /[\u0C00-\u0C7F]/g],
    ['thai', /[\u0E00-\u0E7F]/g],
    ['tibetan', /[\u0F00-\u0FFF]/g]
];

/**
 * Cached length of the above script expression.
 */

unicodeBlockCount = unicodeBlocks.length;

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
 * Get the distance between an array of trigram--count tuples,
 * and a language dictionary.
 *
 * @param {Array.<Array.<string, number>>} trigrams - An
 *   array containing trigram--count tupples.
 * @param {Object.<string, number>} model - Object
 *   containing weighted trigrams.
 * @return {number} - The distance between the two.
 */

function getDistance(trigrams, model) {
    var distance,
        index,
        trigram,
        difference;

    distance = 0;
    index = trigrams.length;

    while (index--) {
        trigram = trigrams[index];

        if (trigram[0] in model) {
            difference = trigram[1] - model[trigram[0]];

            if (difference < 0) {
                difference = -difference;
            }

            distance += difference;
        } else {
            distance += MAX_DIFFERENCE;
        }
    }

    return distance;
}

/**
 * Get the distance between an array of trigram--count tuples,
 * and multiple languages.
 *
 * @param {Array.<Array.<string, number>>} trigrams - An
 *   array containing trigram--count tupples.
 * @param {Array.<string>} languages - multiple language
 *   codes to test against.
 * @return {Array.<Array.<string, number>>} An array
 *   containing language--distance tuples.
 */

function getDistances(trigrams, languages) {
    var distances,
        index,
        language,
        model;

    distances = [];
    index = languages.length;

    while (index--) {
        language = languages[index];
        model = models[language];

        distances[index] = [language, getDistance(trigrams, model)];
    }

    return distances.sort(sort);
}

/**
 * Get an object listing, from a given value, per script
 * the ammount of characters.
 *
 * @param {string} value - The value to test.
 * @return {Object.<string, number>} An object with scripts
 *   as keys and character occurrance couns as values.
 */

function getScripts(value) {
    var index,
        scripts,
        length,
        script,
        count;

    index = unicodeBlockCount;
    scripts = {};
    length = value.length;

    while (index--) {
        script = unicodeBlocks[index];
        count = value.match(script[1]);

        scripts[script[0]] = (count ? count.length : 0) / length;
    }

    return scripts;
}

/**
 * Create a single tuple as a list of tuples from a given
 * language code.
 *
 * @param {Array.<string, number>} An single
 *   language--distance tuple.
 * @return {Array.<Array.<string, number>>} An array
 *   containing a single language--distance.
 */

function singleLanguageTuples(language) {
    return [[language, 1]];
}

/**
 * Get a list of probable languages the given value is
 * written in.
 *
 * @param {string} value - The value to test.
 * @return {Array.<Array.<string, number>>} An array
 *   containing language--distance tuples.
 */

function detectAll(value) {
    var scripts,
        distances,
        index,
        singleton,
        trigrams;

    if (!value) {
        return singleLanguageTuples('und');
    }

    value = value.substr(0, MAX_LENGTH);

    scripts = getScripts(value);

    if (
        scripts.hangulSyllables +
        scripts.hangulJamo +
        scripts.hangulCompatibilityJamo >= FOURTY_PERCENT
    ) {
        return singleLanguageTuples('ko');
    }

    if (scripts.greekAndCoptic >= FOURTY_PERCENT) {
        return singleLanguageTuples('el');
    }

    if (
        scripts.hiragana +
        scripts.katakana +
        scripts.katakanaPhoneticExtensions >= TWENTY_PERCENT
    ) {
        return singleLanguageTuples('ja');
    }

    if (
        scripts.CJKUnifiedIdeographs +
        scripts.bopomofo +
        scripts.bopomofoExtended +
        scripts.xangXiRadicals >= FOURTY_PERCENT
    ) {
        return singleLanguageTuples('zh');
    }

    if (value.length < MIN_LENGTH) {
        return singleLanguageTuples('und');
    }

    index = singletonsLength;

    while (index--) {
        singleton = SINGLETONS[index];

        if (scripts[singleton[0]] >= FOURTY_PERCENT) {
            return singleLanguageTuples(singleton[1]);
        }
    }

    trigrams = utilities.asTuples(value);

    if (scripts.cyrillic >= FOURTY_PERCENT) {
        return getDistances(trigrams, CYRILLIC);
    }

    if (
        scripts.arabic +
        scripts.arabicPresentationFormsA +
        scripts.arabicPresentationFormsB >= FOURTY_PERCENT
    ) {
        return getDistances(trigrams, ARABIC);
    }

    if (scripts.devanagari >= FOURTY_PERCENT) {
        return getDistances(trigrams, DEVANAGARI);
    }

    distances = getDistances(trigrams, ALL_LATIN);

    if (distances[0][0] === 'pt') {
        distances = getDistances(trigrams, PT).concat(distances);
    }

    return distances;
}

/**
 * Get the most probable language the given value is
 * written in.
 *
 * @param {string} value - The value to test.
 * @param {string} The most probable language.
 */

function detect(value) {
    return detectAll(value)[0][0];
}

/**
 * Expose `detectAll` on `franc`.
 */

detect.all = detectAll;

/**
 * Expose `franc`.
 */

module.exports = detect;

});

require.define("wooorm~franc@0.1.1/data.json", {
    "af": "ie | di|die|en |ing|an | en|van| va|ng |te |n d|ver|er |e v| ge| be|de | ve|nde| in| te|le |der|ers|et |oor| 'n|'n |at |eer|ste|ord|aar|sie| wa|es |e s|aan| on|is |in |e o|rde|e b|asi|rin|ond|e w|el | is|and|e e|eid|e d|om |ke | om|eri| wo|e g|r d|ale|wat| vo|id |it |rd | aa|lik| we|t d| op|e t|ngs|se |end|uit| st| le|ens|ter| re|e a|ies|wor|g v|sta|n s| na| pr|n o| me|al |of | vi|erd|lee|e k| de|ite|erk|ik |e r|e p|n v|e i|e n|een|eli|wer| of| da|tel|nie|ike|s e|taa|ge |vir|hei|ir |reg|ede|s v|ur |pro|ele|ion|wet|e l| mo|e m|daa|sio|s d| he| to|ent|ard|nge| oo|eur|lle|ien|n b|eke|lin|raa| ni|ont|bes|rdi|voo|ns |n a|del|dig|nas| sa| gr|nis|kom| ui|men|op |ins|ona|ere|s o| so|n g|ig |moe| ko|rs |ges|nal|vol|e h|geb|rui|ang|ige|oet|ar |wys|lig|as |n w| as|met|gs |deu|t v|aal|erw|dit|ken|sse|kel| hu|ewe|din|n t| se|est|ika|n p|ntw|t i|eni| ka|n e|doe|ali|eme|gro|nte| ho|nsi|gen|ier|gew|n h|or | ma|ind|ne |ek |aat|n '| sk|ide| ta|dat|ska|ger|soo|n k|s i| af|tee|nd |eel|hul|nee|woo|rik|d v|n m|re |art|ebr|lan|kke|ron|aam|tre|str|kan|ree|lei|t o|gra|het|evo|tan|den|ist| do|bru|toe|olg|rsk|uik|rwy|min|lge|g e|g o|nst|r v|gte|waa|we |ans|esi|ese|voe|epa|gel| hi|vin|nse|s w|s t|tei|eit|pre",
    "ar": " ال|الع|لعر|عرا|راق| في|في |ين |ية |ن ا|الم|ات |من |ي ا| من|الأ|ة ا|اق | وا|اء |الإ| أن|وال|ما | عل|لى |ت ا|ون |هم |اقي|ام |ل ا|أن |م ا|الت|لا |الا|ان |ها |ال |ة و|ا ا|رها|لام|يين| ول|لأم|نا |على|ن ي|الب|اد |الق|د ا|ذا |ه ا| با|الد|ب ا|مري|لم | إن| لل|سلا|أمر|ريك|مة |ى ا|ا ي| عن| هذ|ء ا|ر ا|كان|قتل|إسل|الح|وا | إل|ا أ|بال|ن م|الس|رة |لإس|ن و|هاب|ي و|ير | كا|لة |يات| لا|انت|ن أ|يكي|الر|الو|ة ف|دة |الج|قي |وي |الذ|الش|امي|اني|ذه |عن |لما|هذه|ول |اف |اوي|بري|ة ل| أم| لم| ما|يد | أي|إره|ع ا|عمل|ولا|إلى|ابي|ن ف|ختط|لك |نه |ني |إن |دين|ف ا|لذي|ي أ|ي ب| وأ|ا ع|الخ|تل |تي |قد |لدي| كل| مع|اب |اخت|ار |الن|علا|م و|مع |س ا|كل |لاء|ن ب|ن ت|ي م|عرب|م ب| وق| يق|ا ل|ا م|الف|تطا|داد|لمس|له |هذا| مح|ؤلا|بي |ة م|ن ل|هؤل|كن |لإر|لتي| أو| ان| عم|ا ف|ة أ|طاف|عب |ل م|ن ع|ور |يا | يس|ا ت|ة ب|راء|عال|قوا|قية|لعا|م ي|مي |مية|نية|أي |ابا|بغد|بل |رب |عما|غدا|مال|ملي|يس | بأ| بع| بغ| وم|بات|بية|ذلك|عة |قاو|قيي|كي |م م|ي ع| عر| قا|ا و|رى |ق ا|وات|وم | هؤ|ا ب|دام|دي |رات|شعب|لان|لشع|لقو|ليا|ن ه|ي ت|ي ي| وه| يح|جرا|جما|حمد|دم |كم |لاو|لره|ماع|ن ق|نة |هي | بل| به| له| وي|ا ك|اذا|اع |ت م|تخا|خاب|ر م|لمت|مسل|ى أ|يست|يطا| لأ| لي|أمن|است|بعض|ة ت|ري |صدا|ق و|قول|مد |نتخ|نفس|نها|هنا|أعم|أنه|ائن|الآ|الك|حة |د م|ر ع|ربي",
    "az": "lər|in |ın |lar|da |an |ir |də |ki | bi|ən |əri|arı|ər |dir|nda| ki|rin|nın|əsi|ini| ed| qa| tə| ba| ol|ası|ilə|rın| ya|anı| və|ndə|ni |ara|ını|ınd| bu|si |ib |aq |dən|iya|nə |rə |n b|sın|və |iri|lə |nin|əli| de| mü|bir|n s|ri |ək | az| sə|ar |bil|zər|bu |dan|edi|ind|man|un |ərə| ha|lan|yyə|iyy| il| ne|r k|ə b| is|na |nun|ır | da| hə|a b|inə|sin|yan|ərb| də| mə| qə|dır|li |ola|rba|azə|can|lı |nla| et| gö|alı|ayc|bay|eft|ist|n i|nef|tlə|yca|yət|əcə| la|ild|nı |tin|ldi|lik|n h|n m|oyu|raq|ya |əti| ar|ada|edə|mas|sı |ına|ə d|ələ|ayı|iyi|lma|mək|n d|ti |yin|yun|ət |azı|ft |i t|lli|n a|ra | cə| gə| ko| nə| oy|a d|ana|cək|eyi|ilm|irl|lay|liy|lub|n ə|ril|rlə|unu|ver|ün |ə o|əni| he| ma| on| pa|ala|dey|i m|ima|lmə|mət|par|yə |ətl| al| mi| sa| əl|adı|akı|and|ard|art|ayi|i a|i q|i y|ili|ill|isə|n o|n q|olu|rla|stə|sə |tan|tel|yar|ədə| me| rə| ve| ye|a k|at |baş|diy|ent|eti|həs|i i|ik |la |miş|n n|nu |qar|ran|tər|xan|ə a|ə g|ə t| dü|ama|b k|dil|era|etm|i b|kil|mil|n r|qla|r s|ras|siy|son|tim|yer|ə k| gü| so| sö| te| xa|ai |bar|cti|di |eri|gör|gün|gəl|hbə|ihə|iki|isi|lin|mai|maq|n k|n t|n v|onu|qan|qəz|tə |xal|yib|yih|zet|zır|ıb |ə m|əze| br| in| ir| pr| ta| to| üç|a o|ali|ani|anl|aql|azi|bri",
    "bg": "на | на|то | пр| за|та | по|ите|те |а п|а с| от|за |ата|ия | в |е н| да|а н| се| ко|да |от |ани|пре|не |ени|о н|ни |се | и |но |ане|ето|а в|ва |ван|е п|а о|ото|ран|ат |ред| не|а д|и п| до|про| съ|ли |при|ния|ски|тел|а и|по |ри | е | ка|ира|кат|ние|нит|е з|и с|о с|ост|че | ра|ист|о п| из| са|е д|ини|ки |мин| ми|а б|ава|е в|ие |пол|ств|т н| въ| ст| то|аза|е о|ов |ст |ът |и н|ият|нат|ра | бъ| че|алн|е с|ен |ест|и д|лен|нис|о о|ови| об| сл|а р|ато|кон|нос|ров|ще | ре| с | сп|ват|еше|и в|иет|о в|ове|ста|а к|а т|дат|ент|ка |лед|нет|ори|стр|стъ|ти |тър| те|а з|а м|ад |ана|ено|и о|ина|ити|ма |ска|сле|тво|тер|ция|ят | бе| де| па|ате|вен|ви |вит|и з|и и|нар|нов|ова|пов|рез|рит|са |ята| го| ще|али|в п|гра|е и|еди|ели|или|каз|кит|лно|мен|оли|раз| ве| гр| им| ме| пъ|ави|ако|ача|вин|во |гов|дан|ди |до |ед |ери|еро|жда|ито|ков|кол|лни|мер|нач|о з|ола|он |она|пра|рав|рем|сия|сти|т п|тан|ха |ше |шен|ълг| ба| си|аро|бъл|в р|гар|е е|елн|еме|ико|има|ко |кои|ла |лга|о д|ози|оит|под|рес|рие|сто|т к|т м|т с|уст| би| дв| дъ| ма| мо| ни| ос|ала|анс|ара|ати|аци|беш|вър|е р|едв|ема|жав|и к|иал|ица|иче|кия|лит|о б|ово|оди|ока|пос|род|сед|слу|т и|тов|ува|циа|чес|я з| во| ил| ск| тр| це|ами|ари|бат|би |бра|бъд",
    "ca": " de|es |de |la | la|el |que| el| co|ent|s d| qu| i |en |er | a |ls |nt | pe|e l|a d| en|per|ci |ar |ue |al | se|est|at | es|ts | s | pr|aci| un|res|men|s e|del|s a|s p| re|les| l'|na |a l| ca| d'|els|a p|ia |ns |con| le|tat|a c|i d|a a|ra |a e| no|ant| al|t d|s i| di|ta |re |a s|com|s c|ita|ons|sta|ica| po|r a| in|pro|tre| pa|ues|amb|ion|des|un | ma|da |s s|a i|an |mb | am|l d|e d|va |pre|ter|e e|e c|a m|cia|una|i e|nci|tra| te|ona|os |t e|n e|l c|ca |cio|l p| tr|par|r l|t a|e p|aqu|nta| so|ame|era|r e|e s|ada|n a|s q| si| ha|als|tes| va| m |ici|nte|s l|s m|i a|or | mo|ist|ect|lit|m s| to|ir |a t|esp|ran|str|om |l s|st |nts| me|no |r d|d'a|l'a|ats|ria|s t| ta|sen|rs |eix|tar|s n|n l|tal|e a|t p|art| mi| ll|tic|ten|ser| aq|ina|ntr|a f|sti|ol |a q|for|ura|ers|ari|int|act|l'e| fi|r s|e t|tor|si |ste|rec|a r| fe|is |em |n d|car|bre| fo| vi| an|ali|i p|ix |ell|l m|pos|orm|l l|i l| ac|fer|s r|ess|eu |e m|ens|ara|eri|sa |ssi|us |ort|tot|ll |por|ora| ci|tan|ass|n c|ost|nes|rac|a u|ver|ont|ha | ti|itz|gra|t c| n |a v|ren|cat|nal| ri|qua|t l| do|t s|rma|ual|i s|s f|n p|s v|te |t i| ba|cte|tam|man|l t|ial| fa|ic | ve|ble|a n|all|tza|ies| s'|le |omp|r c| nc|rti|it |rre|fic|any|on | sa|r p|tur",
    "ceb": "ng |sa | sa|ang|ga |nga| ka| ng|an | an| na| ma| ni|a s|a n|on | pa| si|a k|a m| ba|ong|a i|ila| mg|mga|a p|iya|a a|ay |ka |ala|ing|g m|n s|g n|lan| gi|na |ni |o s|g p|n n| da|ag |pag|g s|yan|ayo|o n|si | mo|a b|g a|ail|g b|han|a d|asu|nag|ya |man|ne |pan|kon| il| la|aka|ako|ana|bas|ko |od |yo | di| ko| ug|a u|g k|kan|la |len|sur|ug | ai|apa|aw |d s|g d|g g|ile|nin| iy| su|ene|og |ot |aba|aha|as |imo| ki|a t|aga|ban|ero|nan|o k|ran|ron|sil|una|usa| us|a g|ahi|ani|er |ha |i a|rer|yon| pu|ini|nak|ro |to |ure| ed| og| wa|ili|mo |n a|nd |o a| ad| du| pr|aro|i s|ma |n m|ulo|und| ta|ara|asa|ato|awa|dmu|e n|edm|ina|mak|mun|niy|san|wa | tu| un|a l|bay|iga|ika|ita|kin|lis|may|os | ar|ad |ali|ama|ers|ipa|isa|mao|nim|t s|tin| ak| ap| hi|abo|agp|ano|ata|g i|gan|gka|gpa|i m|iha|k s|law|or |rs |siy|tag| al| at| ha| hu| im|a h|bu |e s|gma|kas|lag|mon|nah|ngo|r s|ra |sab|sam|sul|uba|uha| lo| re|ada|aki|aya|bah|ce |d n|lab|pa |pak|s n|s s|tan|taw|te |uma|ura| in| lu|a c|abi|at |awo|bat|dal|dla|ele|g t|g u|gay|go |hab|hin|i e|i n|kab|kap|lay|lin|nil|pam|pas|pro|pul|ta |ton|uga|ugm|unt| co| gu| mi| pi| ti|a o|abu|adl|ado|agh|agk|ao |art|bal|cit|di |dto|dun|ent|g e|gon|gug|ia |iba|ice|in |inu|it |kaa",
    "cs": " pr| po|ní |pro| na|na | př|ch | je| ne|že | že| se| do| ro| st| v | ve|pře|se |ho |sta| to| vy| za|ou | a |to | by|la |ce |e v|ist|le |pod|í p| vl|e n|e s|je |ké |by |em |ých| od|ova|řed|dy |ení|kon|li |ně |str| zá|ve | ka| sv|e p|it |lád|oho|rov|roz|ter|vlá|ím | ko|hod|nis|pří|ský| mi| ob| so|a p|ali|bud|edn|ick|kte|ku |o s|al |ci |e t|il |ny |né |odl|ová|rot|sou|ání| bu| mo| o |ast|byl|de |ek |ost| mí| ta|es |jed|ky |las|m p|nes|ním|ran|rem|ros|ého| de| kt| ni| si| vý|at |jí |ký |mi |pre|tak|tan|y v|řek| ch| li| ná| pa| ře|da |dle|dne|i p|i v|ly |min|o n|o v|pol|tra|val|vní|ích|ý p|řej| ce| kd| le|a s|a z|cen|e k|eds|ekl|emi|kl |lat|lo |mié|nov|pra|sku|ské|sti|tav|ti |ty |ván|vé |y n|y s|í s|í v|ě p| dn| ně| sp| čs|a n|a t|ak |dní|doh|e b|e m|ejn|ena|est|ini|m z|nal|nou|ná |ovi|ové|ový|rsk|stá|tí |tře|tů |ude|za |é p|ém |í d| ir| zv|ale|aně|ave|cké|den|e z|ech|en |erý|hla|i s|iér|lov|mu |neb|nic|o b|o m|pad|pot|rav|rop|rý |sed|si |t p|tic|tu |tě |u p|u v|vá |výš|zvý|ční|ří |ům | bl| br| ho| ja| re| s | z | zd|a v|ani|ato|bla|bri|ečn|eře|h v|i n|ie |ila|irs|ite|kov|nos|o o|o p|oce|ody|ohl|oli|ovo|pla|poč|prá|ra |rit|rod|ry |sd |sko|ssd|tel|u s|vat|veř|vit|vla|y p|áln|čss|šen| al",
    "cy": "yn |dd | yn| y |ydd|eth|th | i |aet|d y|ch |od |ol |edd| ga| gw|'r |au |ddi|ad | cy| gy| ei| o |iad|yr |an |bod|wed| bo| dd|el |n y| am|di |edi|on | we| ym| ar| rh|odd| ca| ma|ael|oed|dae|n a|dda|er |h y|all|ei | ll|am |eu |fod|fyd|l y|n g|wyn|d a|i g|mae|neu|os | ne|d i|dod|dol|n c|r h|wyd|wyr|ai |ar |in |rth| fy| he| me| yr|'n |dia|est|h c|hai|i d|id |r y|y b| dy| ha|ada|i b|n i|ote|rot|tes|y g|yd | ad| mr| un|cyn|dau|ddy|edo|i c|i w|ith|lae|lla|nd |oda|ryd|tho| a | dr|aid|ain|ddo|dyd|fyn|gyn|hol|io |o a|wch|wyb|ybo|ych| br| by| di| fe| na| o'| pe|art|byd|dro|gal|l e|lai|mr |n n|r a|rhy|wn |ynn| on| r |cae|d g|d o|d w|gan|gwy|n d|n f|n o|ned|ni |o'r|r d|ud |wei|wrt| an| cw| da| ni| pa| pr| wy|d e|dai|dim|eud|gwa|idd|im |iri|lwy|n b|nol|r o|rwy| ch| er| fo| ge| hy| i'| ro| sa| tr|bob|cwy|cyf|dio|dyn|eit|hel|hyn|ich|ll |mdd|n r|ond|pro|r c|r g|red|rha|u a|u c|u y|y c|ymd|ymr|yw | ac| be| bl| co| os|adw|ae |af |d p|efn|eic|en |eol|es |fer|gel|h g|hod|ied|ir |laf|n h|na |nyd|odo|ofy|rdd|rie|ros|stw|twy|yda|yng| at| de| go| id| oe| â |'ch|ac |ach|ae'|al |bl |d c|d l|dan|dde|ddw|dir|dla|ed |ela|ell|ene|ewn|gyd|hau|hyw|i a|i f|iol|ion|l a|l i|lia|med|mon|n s|no |obl|ola|ref|rn |thi|un ",
    "da": "er |en | de|et |der|de |for| fo| i |at | at|re |det| ha|nde|ere|ing|den| me| og|ger|ter| er| si|and| af|or | st| ti| en|og |ar |il |r s|ige|til|ke |r e|af |kke| ma| på|om |på |ed |ge |end|nge|t s|e s|ler| sk|els|ern|sig|ne |lig|r d|ska| vi|har| be| se|an |ikk|lle|gen|n f|ste|t a|t d|rin| ik|es |ng |ver|r b|sen|ede|men|r i| he| et|ig |lan|med|nd |rne| da| in|e t|mme|und| om|e e|e m|her|le |r f|t f|så |te | so|ele|t e| ko|est|ske| bl|e f|ekt|mar|bru|e a|el |ers|ret|som|tte|ve | la| ud| ve|age|e d|e h|lse|man|rug|sel|ser| fi| op| pr|dt |e i|n m|r m| an| re| sa|ion|ner|res|t i|get|n s|one|orb|t h|vis|år | fr|bil|e k|ens|ind|omm|t m| hv| je|dan|ent|fte|nin| mi|e o|e p|n o|nte| ku|ell|nas|ore|r h|r k|sta|sto|dag|eri|kun|lde|mer|r a|r v|rek|rer|t o|tor|tør| få| må| to|boe|che|e v|i d|ive|kab|ns |oel|se |t v| al| bo| un|ans|dre|ire|køb|ors|ove|ren|t b|ør | ka|ald|bet|gt |isk|kal|kom|lev|n d|n i|pri|r p|rbr|søg|tel| så| te| va|al |dir|eje|fis|gså|isc|jer|ker|ogs|sch|st |t k|uge| di|ag |d a|g i|ill|l a|lsk|n a|on |sam|str|tet|var| mo|art|ash|att|e b|han|hav|kla|kon|n t|ned|r o|ra |rre|ves|vil| el| kr| ov|ann|e u|ess|fra|g a|g d|int|ngs|rde|tra| år|akt|asi|em |gel|gym|hol|kan|mna|n h|nsk|old",
    "de": "en |er | de|der|ie | di|die|sch|ein|che|ich|den|in |te |ch | ei|ung|n d|nd | be|ver|es | zu|eit|gen|und| un| au| in|cht|it |ten| da|ent| ve|and| ge|ine| mi|r d|hen|ng |nde| vo|e d|ber|men|ei |mit| st|ter|ren|t d| er|ere|n s|ste| se|e s|ht |des|ist|ne |auf|e a|isc|on |rte| re| we|ges|uch| fü| so|bei|e e|nen|r s|ach|für|ier|par|ür | ha|as |ert| an| pa| sa| sp| wi|for|tag|zu |das|rei|he |hre|nte|sen|vor| sc|ech|etz|hei|lan|n a|pd |st |sta|ese|lic| ab| si|gte| wa|iti|kei|n e|nge|sei|tra|zen| im| la|art|im |lle|n w|rde|rec|set|str|tei|tte| ni|e p|ehe|ers|g d|nic|von| al| pr|an |aus|erf|r e|tze|tür|uf |ag |als|ar |chs|end|ge |ige|ion|ls |n m|ngs|nis|nt |ord|s s|sse| tü|ahl|e b|ede|em |len|n i|orm|pro|rke|run|s d|wah|wer|ürk| me|age|att|ell|est|hat|n b|oll|raf|s a|tsc| es| fo| gr| ja|abe|auc|ben|e n|ege|lie|n u|r v|re |rit|sag| am|agt|ahr|bra|de |erd|her|ite|le |n p|n v|or |rbe|rt |sic|wie|übe| is| üb|cha|chi|e f|e m|eri|ied|mme|ner|r a|sti|t a|t s|tis| ko|arb|ds |gan|n z|r f|r w|ran|se |t i|wei|wir| br| np|am |bes|d d|deu|e g|e k|efo|et |eut|fen|hse|lte|n r|npd|r b|rhe|t w|tz | fr| ih| ke| ma|ame|ang|d s|eil|el |era|erh|h d|i d|kan|n f|n l|nts|och|rag|rd |spd|spr|tio| ar| en| ka|ark|ass",
    "en": " th|the|he |ed | to| in|er |ing|ng | an|nd | of|and|to |of | co|at |on |in | a |d t| he|e t|ion|es | re|re |hat| sa| st| ha|her|tha|tio|or | ''|en | wh|e s|ent|n t|s a|as |for|is |t t| be|ld |e a|rs | wa|ut |ve |ll |al | ma|e i| fo|'s |an |est| hi| mo| se| pr|s t|ate|st |ter|ere|ted|nt |ver|d a| wi|se |e c|ect|ns | on|ly |tol|ey |r t| ca|ati|ts |all| no|his|s o|ers|con|e o|ear|f t|e w|was|ons|sta|'' |sti|n a|sto|t h| we|id |th | it|ce | di|ave|d h|cou|pro|ad |oll|ry |d s|e m| so|ill|cti|te |tor|eve|g t|it | ch| de|hav|oul|ty |uld|use| al|are|ch |me |out|ove|wit|ys |chi|t a|ith|oth| ab| te| wo|s s|res|t w|tin|e b|e h|nce|t s|y t|e p|ele|hin|s i|nte| li|le | do|aid|hey|ne |s w| as| fr| tr|end|sai| el| ne| su|'t |ay |hou|ive|lec|n't| ye|but|d o|o t|y o| ho| me|be |cal|e e|had|ple| at| bu| la|d b|s h|say|t i| ar|e f|ght|hil|igh|int|not|ren| is| pa| sh|ays|com|n s|r a|rin|y a| un|n c|om |thi| mi|by |d i|e d|e n|t o| by|e r|eri|old|ome|whe|yea| gr|ar |ity|mpl|oun|one|ow |r s|s f|tat| ba| vo|bou|sam|tim|vot|abo|ant|ds |ial|ine|man|men| or| po|amp|can|der|e l|les|ny |ot |rec|tes|tho|ica|ild|ir |nde|ose|ous|pre|ste|era|per|r o|red|rie| bo| le|ali|ars|ore|ric|s m|str| fa|ess|ie |ist|lat|uri",
    "es": " de|de | la|os |la |el |es | qu| co|e l|as |que| el|ue |en |ent| en| se|nte|res|con|est| es|s d| lo| pr|los| y |do |ón |ión| un|ció|del|o d| po|a d|aci|sta|te |ado|pre|to |par|a e|a l|ra |al |e e|se |pro|ar |ia |o e| re|ida|dad|tra|por|s p| a |a p|ara|cia| pa|com|no | di| in|ien|n l|ad |ant|e s|men|a c|on |un |las|nci| tr|cio|ier|nto|tiv|n d|n e|or |s c|enc|ern|io |a s|ici|s e| ma|dos|e a|e c|emp|ica|ivo|l p|n c|r e|ta |ter|e d|esa|ez |mpr|o a|s a| ca| su|ion| cu| ju|an |da |ene|ero|na |rec|ro |tar| al| an|bie|e p|er |l c|n p|omp|ten| em|ist|nes|nta|o c|so |tes|era|l d|l m|les|ntr|o s|ore|rá |s q|s y|sto|a a|a r|ari|des|e q|ivi|lic|lo |n a|one|ora|per|pue|r l|re |ren|una|ía |ada|cas|ere|ide|min|n s|ndo|ran|rno| ac| ex| go| no|a t|aba|ble|ece|ect|l a|l g|lid|nsi|ons|rac|rio|str|uer|ust| ha| le| mi| mu| ob| pe| pu| so|a i|ale|ca |cto|e i|e u|eso|fer|fic|gob|jo |ma |mpl|o p|obi|s m|sa |sep|ste|sti|tad|tod|y s| ci|and|ces|có |dor|e m|eci|eco|esi|int|iza|l e|lar|mie|ner|orc|rci|ria|tic|tor| as| si|ce |den|e r|e t|end|eri|esp|ial|ido|ina|inc|mit|o l|ome|pli|ras|s t|sid|sup|tab|uen|ues|ura|vo |vor| sa| ti|abl|ali|aso|ast|cor|cti|cue|div|duc|ens|eti|imi|ini|lec|o q|oce|ort|ral|rma|roc|rod",
    "et": "st | ka|on |ja | va| on| ja| ko|se |ast|le |es |as |is |ud | sa|da |ga | ta|aja|sta| ku| pe|a k|est|ist|ks |ta |al |ava|id |saa|mis|te |val| et|nud| te|inn| se| tu|a v|alu|e k|ise|lu |ma |mes| mi|et |iku|lin|ad |el |ime|ne |nna| ha| in| ke| võ|a s|a t|ab |e s|esi| la| li|e v|eks|ema|las|les|rju|tle|tsi|tus|upa|use|ust|var| lä|ali|arj|de |ete|i t|iga|ilm|kui|li |tul| ei| me| sõ|aal|ata|dus|ei |nik|pea|s k|s o|sal|sõn|ter|ul |või| el| ne|a j|ate|end|i k|ita|kar|kor|l o|lt |maa|oli|sti|vad|ään| ju| jä| kü| ma| po| üt|aas|aks|at |ed |eri|hoi|i s|ka |la |nni|oid|pai|rit|us |ütl| aa| lo| to| ve|a e|ada|aid|ami|and|dla|e j|ega|gi |gu |i p|idl|ik |ini|jup|kal|kas|kes|koh|s e|s p|sel|sse|ui | pi| si|aru|eda|eva|fil|i v|ida|ing|lää|me |na |nda|nim|ole|ots|ris|s l|sia|t p| en| mu| ol| põ| su| vä| üh|a l|a p|aga|ale|aps|arv|e a|ela|ika|lle|loo|mal|pet|t k|tee|tis|vat|äne|õnn| es| fi| vi|a i|a o|aab|aap|ala|alt|ama|anu|e p|e t|eal|eli|haa|hin|iva|kon|ku |lik|lm |min|n t|odu|oon|psa|ri |si |stu|t e|t s|ti |ule|uur|vas|vee| ki| ni| nä| ra|aig|aka|all|atu|e e|eis|ers|i e|ii |iis|il |ima|its|kka|kuh|l k|lat|maj|ndu|ni |nii|oma|ool|rso|ru |rva|s t|sek|son|ste|t m|taj|tam|ude|uho|vai| ag| os| pa| re",
    "eu": "en |an |eta|ta | et|iza|n e|ko |ide| ba|a e|giz| es| gi|arr|bid|ren|rri|are|la |sku| be|asu|esk|sun|tas| iz|ean|eko|ela|ik |kub|n a|n i|tza|ubi|za |zan| er|a b|ask|era|n b|rre|ten|tze| as| ko|a a|a g|ald|ani|de |dee|ea |ek |kat|kon|n d|ont|uan| du| na|ata|egi|est|k e|nik|ntu|ntz|ska|tua| de| di| ez| he|a d|a k|ak |aki|ako|art|atu|azi|bat|ber|itz|kun|n h|o b|ria|rte|tat|une|zar| al| ar| ha|aku|atz|bai|dar|dea|del|een|ema|err|iak|iar|in |ina|kia|nar|naz|nea|o e|orr|ra |ste|tek|zak|zek|zio| da| em| hi| ho| ma| oi|agu|ate|aur|bes|din|dir|dut|ert|ez |ezi|har|her|hit|ia |ien|ika|io |ire|ite|k b|k g|kid|kor|lda|n o|nko|o a|oin|ori|rak|rea|rie|rik|rra|tan|tea|tu |una|und|unt|urr|ute|z e|zko| au| eg| gu| ir| ki| or|a h|a j|abe|agi|ai |ail|ait|ape|ari|dez|e e|ear|eek|erd|ere|eza|ezk|gir|git|hor|i e|ian|iek|ila|ink|int|ira|ita|itu|k n|kap|koa|kum|lan|lde|mai|man|men|n g|n u|na |nta|o h|oa |oro|pen|rdi|ri |rta|sta|tel|tet|tik|tue|tzi|ume|un |uzt|zea|zen|zia|zin| az| bi| bu| el| ga| jo| mu| ti| un| za| zi|a n|a o|a s|a t|a z|aba|adi|ake|ala|and|ar |aud|bak|bal|beg|beh|bul|dau|den|du |dui|e b|e d|e h|e o|eak|eet|eha|elk|enb|ete|eti|gab|gin|go |gus|gut|guz|hau|ibe|inb|ine|ioa|iru|iur|izi|izk|izo",
    "fa": "ان |ای |ه ا| اي| در|به | بر|در |ران| به|ی ا|از |ين |می | از|ده |ست |است| اس| که|که |اير|ند |اين| ها|يرا|ود | را|های| خو|ته |را |رای|رد |ن ب|کرد| و | کر|ات |برا|د ک|مان|ی د| ان|خوا|شور| با|ن ا| سا|تمی|ری |اتم|ا ا|واه| ات| عر|اق |ر م|راق|عرا|ی ب| تا| تو|ار |ر ا|ن م|ه ب|ور |يد |ی ک| ام| دا| کن|اهد|هد | آن| می| ني| گف|د ا|گفت| کش|ا ب|نی |ها |کشو| رو|ت ک|نيو|ه م|وی |ی ت| شو|ال |دار|مه |ن ک|ه د|يه | ما|امه|د ب|زار|ورا|گزا| پي|آن |انت|ت ا|فت |ه ن|ی خ|اما|بات|ما |ملل|نام|ير |ی م|ی ه| آم| ای| من|انس|اني|ت د|رده|ساز|ن د|نه |ورد| او| بي| سو| شد|اده|اند|با |ت ب|ر ب|ز ا|زما|سته|ن ر|ه س|وان|وز |ی ر|ی س| هس|ابا|ام |اور|تخا|خاب|خود|د د|دن |رها|روز|رگز|نتخ|ه ش|ه ه|هست|يت |يم | دو| دي| مو| نو| هم| کا|اد |اری|انی|بر |بود|ت ه|ح ه|حال|رش |عه |لی |وم |ژان| سل|آمر|اح |توس|داد|دام|ر د|ره |ريک|زی |سلا|شود|لاح|مري|نند|ه ع|يما|يکا|پيم|گر | آژ| ال| بو| مق| مل| وی|آژا|ازم|ازی|بار|برن|ر آ|ز س|سعه|شته|مات|ن آ|ن پ|نس |ه گ|وسع|يان|يوم|کا |کام|کند| خا| سر|آور|ارد|اقد|ايم|ايی|برگ|ت ع|تن |خت |د و|ر خ|رک |زير|فته|قدا|ل ت|مين|ن گ|ه آ|ه خ|ه ک|ورک|ويو|يور|يوي|يی |ک ت|ی ش| اق| حا| حق| دس| شک| عم| يک|ا ت|ا د|ارج|بين|ت م|ت و|تاي|دست|ر ح|ر س|رنا|ز ب|شکا|لل |م ک|مز |ندا|نوا|و ا|وره|ون |وند|يمز| آو| اع| فر| مت| نه| هر| وز| گز",
    "fi": "en |in |an |on |ist|ta |ja |n t|sa |sta|aan|n p| on|ssa|tta|tä | ka| pa|si | ja|n k|lla|än |een|n v|ksi|ett|nen|taa|ttä| va|ill|itt| jo| ko|n s| tu|ia | su|a p|aa |la |lle|n m|le |tte|na | ta| ve|at | vi|utt| sa|ise|sen| ku| nä| pä|ste| ol|a t|ais|maa|ti |a o|oit|pää| pi|a v|ala|ine|isi|tel|tti| si|a k|all|iin|kin|stä|uom|vii| ma| se|enä| mu|a s|est|iss|llä|lok|lä |n j|n o|toi|ven|ytt| li|ain|et |ina|n a|n n|oll|plo|ten|ust|äll|ään| to|den|men|oki|suo|sä |tää|uks|vat| al| ke| te|a e|lii|tai|tei|äis|ää | pl|ell|i t|ide|ikk|ki |nta|ova|yst|yt |ä p|äyt| ha| pe| tä|a n|aik|i p|i v|nyt|näy|pal|tee|un | me|a m|ess|kau|pai|stu|ut |voi| et|a h|eis|hte|i o|iik|ita|jou|mis|nin|nut|sia|ssä|van| ty| yh|aks|ime|loi|me |n e|n h|n l|oin|ome|ott|ouk|sit|sti|tet|tie|ukk|ä k| ra| ti|aja|asi|ent|iga|iig|ite|jan|kaa|kse|laa|lan|li |näj|ole|tii|usi|äjä| ov|a a|ant|ava|ei |eri|kan|kku|lai|lis|läi|mat|ois|pel|sil|sty|taj|tav|ttu|työ|yös|ä o| ai| pu|a j|a l|aal|arv|ass|ien|imi|imm|itä|ka |kes|kue|lee|lin|llo|one|ri |t o|t p|tu |val|vuo| ei| he| hy| my| vo|ali|alo|ano|ast|att|auk|eli|ely|hti|ika|ken|kki|lys|min|myö|oht|oma|tus|umi|yks|ät |ääl|ös | ar| eu| hu| na|aat|alk|alu|ans|arj|enn|han|kuu|n y|set|sim",
    "fr": "es | de|de | le|ent|le |nt |la |s d| la|ion|on |re | pa|e l|e d| l'|e p| co| pr|tio|ns | en|ne |que|r l|les|ur |en |ati|ue | po| d'|par| a |et |it | qu|men|ons|te | et|t d| re|des| un|ie |s l| su|pou| au| à |con|er | no|ait|e c|se |té |du | du| dé|ce |e e|is |n d|s a| so|e r|e s|our|res|ssi|eur| se|eme|est|us |sur|ant|iqu|s p|une|uss|l'a|pro|ter|tre|end|rs | ce|e a|t p|un | ma| ru| ré|ous|ris|rus|sse|ans|ar |com|e m|ire|nce|nte|t l| av| mo| te|il |me |ont|ten|a p|dan|pas|qui|s e|s s| in|ist|lle|nou|pré|'un|air|d'a|ir |n e|rop|ts | da|a s|as |au |den|mai|mis|ori|out|rme|sio|tte|ux |a d|ien|n a|ntr|omm|ort|ouv|s c|son|tes|ver|ère| il| m | sa| ve|a r|ais|ava|di |n p|sti|ven| mi|ain|enc|for|ité|lar|oir|rem|ren|rro|rés|sie|t a|tur| pe| to|d'u|ell|err|ers|ide|ine|iss|mes|por|ran|sit|st |t r|uti|vai|é l|ési| di| n'| ét|a c|ass|e t|in |nde|pre|rat|s m|ste|tai|tch|ui |uro|ès | es| fo| tr|'ad|app|aux|e à|ett|iti|lit|nal|opé|r d|ra |rai|ror|s r|tat|uté|à l| af|anc|ara|art|bre|ché|dre|e f|ens|lem|n r|n t|ndr|nne|onn|pos|s t|tiq|ure| tu|ale|and|ave|cla|cou|e n|emb|ins|jou|mme|rie|rès|sem|str|t i|ues|uni|uve|é d|ée | ch| do| eu| fa| lo| ne| ra|arl|att|ec |ica|l a|l'o|l'é|mmi|nta|orm|ou |r u|rle",
    "ha": " da|da |in |an |ya | wa| ya|na |ar |a d| ma|wa |a a|a k|a s| ta|wan| a | ba| ka|ta |a y|n d| ha| na| su| sa|kin|sa |ata| ko|a t|su | ga|ai | sh|a m|uwa|iya|ma |a w|asa|yan|ka |ani|shi|a b|a h|a c|ama|ba |nan|n a| mu|ana| yi|a g| za|i d| ku|aka|yi |n k|ann|ke |tar| ci|iki|n s|ko | ra|ki |ne |a z|mat|hak|nin|e d|nna|uma|nda|a n|ada|cik|ni |rin|una|ara|kum|akk| ce| du|man|n y|nci|sar|aki|awa|ci |kan|kar|ari|n m|and|hi |n t|ga |owa|ash|kam|dan|ewa|nsa|ali|ami| ab| do|anc|n r|aya|i n|sun|uka| al| ne|a'a|cew|cin|mas|tak|un |aba|kow|a r|ra | ja| ƙa|en |r d|sam|tsa| ru|ce |i a|abi|ida|mut|n g|n j|san|a ƙ|har|on |i m|suk| ak| ji|yar|'ya|kwa|min| 'y|ane|ban|ins|ruw|i k|n h| ad|ake|n w|sha|utu| ƴa|bay|tan|ƴan|bin|duk|e m|n n|oka|yin|ɗan| fa|a i|kki|re |za |ala|asu|han|i y|mar|ran|ƙas|add|ars|gab|ira|mma|u d| ts|abb|abu|aga|gar|n b| ɗa|aci|aik|am |dun|e s|i b|i w|kas|kok|wam| am|amf|bba|din|fan|gwa|i s|wat|ano|are|dai|iri|ma'| la|all|dam|ika|mi |she|tum|uni| an| ai| ke| ki|dag|mai|mfa|no |nsu|o d|sak|um | bi| gw| kw|jam|yya|a j|fa |uta| hu|'a |ans|aɗa|dda|hin|niy|r s|bat|dar|gan|i t|nta|oki|omi|sal|a l|kac|lla|wad|war|amm|dom|r m|ras|sai| lo|ats|hal|kat|li |lok|n c|nar|tin|afa|bub|i g|isa|mak",
    "haw": " ka|na | o |ka | ma| a | la|a i|a m| i |la |ana|ai |ia |a o|a k|a h|o k| ke|a a|i k| ho| ia|ua | na| me|e k|e a|au |ke |ma |mai|aku| ak|ahi| ha| ko| e |a l| no|me |ku |aka|kan|no |i a|ho |ou | ai|i o|a p|o l|o a|ama|a n| an|i m|han|i i|iho|kou|ne | ih|o i|iki|ona|hoo|le |e h| he|ina| wa|ea |ako|u i|kah|oe |i l|u a| pa|hoi|e i|era|ko |u m|kua|mak|oi |kai|i n|a e|hin|ane| ol|i h|mea|wah|lak|e m|o n|u l|ika|ki |a w|mal|hi |e n|u o|hik| ku|e l|ele|ra |ber|ine|abe|ain|ala|lo | po|kon| ab|ole|he |pau|mah|va |ela|kau|nak| oe|kei|oia| ie|ram| oi|oa |eho|hov|ieh|ova| ua|una|ara|o s|awa|o o|nau|u n|wa |wai|hel| ae| al|ae |ta |aik| hi|ale|ila|lel|ali|eik|olo|onu| lo|aua|e o|ola|hon|mam|nan| au|aha|lau|nua|oho|oma| ao|ii |alu|ima|mau|ike|apa|elo|lii|poe|aia|noa| in|o m|oka|'u |aho|ei |eka|ha |lu |nei|hol|ino|o e|ema|iwa|olu|ada|naa|pa |u k|ewa|hua|lam|lua|o h|ook|u h| li|ahu|amu|ui | il| mo| se|eia|law| hu| ik|ail|e p|li |lun|uli|io |kik|noh|u e| sa|aaw|awe|ena|hal|kol|lan| le| ne|a'u|ilo|kap|oko|sa | pe|hop|loa|ope|pe | ad| pu|ahe|aol|ia'|lai|loh|na'|oom|aau|eri|kul|we |ake|kek|laa|ri |iku|kak|lim|nah|ner|nui|ono|a u|dam|kum|lok|mua|uma|wal|wi |'i |a'i|aan|alo|eta|mu |ohe|u p|ula|uwa| nu|amo",
    "hi": "ें | है|में| मे|ने |की |के |है | के| की| को|ों |को |ा ह| का|से |ा क|े क|ं क|या | कि| से|का |ी क| ने| और|और |ना |कि |भी |ी स| जा| पर|ार | कर|ी ह| हो|ही |िया| इस| रह|र क|ुना|ता |ान |े स| भी| रा|े ह| चु| पा|पर |चुन|नाव| कह|प्र| भा|राज|हैं|ा स|ै क|ैं |नी |ल क|ीं |़ी |था |री |ाव |े ब| प्|क्ष|पा |ले | दे|ला |हा |ाजप| था| नह|इस |कर |जपा|नही|भाज|यों|र स|हीं| अम| बा| मा| वि|रीक|िए |े प|्या| ही|ं म|कार|ा ज|े ल| ता| दि| सा| हम|ा न|ा म|ाक़|्ता| एक| सं| स्|अमर|क़ी|ताज|मरी|स्थ|ा थ|ार्| हु|इरा|एक |न क|र म|राक|ी ज|ी न| इर| उन| पह|कहा|ते |े अ| तो| सु|ति |ती |तो |मिल|िक |ियो|्रे| अप| फ़| लि| लो| सम|म क|र्ट|हो |ा च|ाई |ाने|िन |्य | उस| क़| सक| सै|ं प|ं ह|गी |त क|मान|र न|ष्ट|स क|स्त|ाँ |ी ब|ी म|्री| दो| मि| मु| ले| शा|ं स|ज़ा|त्र|थी |लिए|सी |़ा |़ार|ांग|े द|े म|्व | ना| बन|ंग्|कां|गा |ग्र|जा |ज्य|दी |न म|पार|भा |रही|रे |रेस|ली |सभा|ा र|ाल |ी अ|ीकी|े त|ेश | अं| तक| या|ई ह|करन|तक |देश|वर्|ाया|ी भ|ेस |्ष | गय| जि| थी| बड| यह| वा|ंतर|अंत|क़ |गया|टी |निक|न्ह|पहल|बड़|मार|र प|रने|ाज़|ि इ|ी र|े ज|े व|्ट |्टी| अब| लग| वर| सी|ं भ|उन्|क क|किय|देख|पूर|फ़्|यह |यान|रिक|रिय|र्ड|लेक|सकत|हों|होग|ा अ|ा द|ा प|ाद |ारा|ित |ी त|ी प|ो क|ो द| ते| नि| सर| हा|ं द|अपन|जान|त म|थित|पनी|महल|र ह|लोग|व क|हना|हल |हाँ|ाज्|ाना|िक्|िस्",
    "hr": "je | na| pr| po|na | je| za|ije|ne | i |ti |da | ko| ne|li | bi| da| u |ma |mo |a n|ih |za |a s|ko |i s|a p|koj|pro|ju |se | go|ost|to |va | do| to|e n|i p| od| ra|no |ako|ka |ni | ka| se| mo| st|i n|ima|ja |pri|vat|sta| su|ati|e p|ta |tsk|e i|nij| tr|cij|jen|nos|o s| iz|om |tro|ili|iti|pos| al|a i|a o|e s|ija|ini|pre|str|la |og |ovo| sv|ekt|nje|o p|odi|rva| ni|ali|min|rij|a t|a z|ats|iva|o t|od |oje|ra | hr|a m|a u|hrv|im |ke |o i|ovi|red|riv|te |bi |e o|god|i d|lek|umi|zvo|din|e u|ene|jed|ji |lje|nog|su | a | el| mi| o |a d|alu|ele|i u|izv|ktr|lum|o d|ori|rad|sto|a k|anj|ava|e k|men|nic|o j|oj |ove|ski|tvr|una|vor| di| no| s | ta| tv|i i|i o|kak|roš|sko|vod| sa| će|a b|adi|amo|eni|gov|iju|ku |o n|ora|rav|ruj|smo|tav|tru|u p|ve | in| pl|aci|bit|de |diš|ema|i m|ika|išt|jer|ki |mog|nik|nov|nu |oji|oli|pla|pod|st |sti|tra|tre|vo | sm| št|dan|e z|i t|io |ist|kon|lo |stv|u s|uje|ust|će |ći |što| dr| im| li|ada|aft|ani|ao |ars|ata|e t|emo|i k|ine|jem|kov|lik|lji|mje|naf|ner|nih|nja|ogo|oiz|ome|pot|ran|ri |roi|rtk|ska|ter|u i|u o|vi |vrt| me| ug|ak |ama|drž|e e|e g|e m|em |eme|enj|ent|er |ere|erg|eur|go |i b|i z|jet|ksi|o u|oda|ona|pra|reb|rem|rop|tri|žav| ci| eu| re| te| uv| ve|aju|an ",
    "hu": " a | az| sz|az | me|en | el| ho|ek |gy |tt |ett|sze| fe|és | ki|tet| be|et |ter| kö| és|hog|meg|ogy|szt|te |t a|zet|a m|nek|nt |ség|szá|ak | va|an |eze|ra |ta | mi|int|köz| is|esz|fel|min|nak|ors|zer| te|a a|a k|is | cs|ele|er |men|si |tek|ti | ne|csa|ent|z e|a t|ala|ere|es |lom|lte|mon|ond|rsz|sza|tte|zág|ány| fo| ma|ai |ben|el |ene|ik |jel|tás|áll| ha| le| ál|agy|alá|isz|y a|zte|ás | al|e a|egy|ely|for|lat|lt |n a|oga|on |re |st |ság|t m|án |ét |ült| je|gi |k a|kül|lam|len|lás|más|s k|vez|áso|özö| ta|a s|a v|asz|atá|ető|kez|let|mag|nem|szé|z m|át |éte|ölt| de| gy| ké| mo| vá| ér|a b|a f|ami|at |ato|att|bef|dta|gya|hat|i s|las|ndt|rt |szo|t k|tár|tés|van|ásá|ól | bé| eg| or| pá| pé| ve|ban|eke|ekü|elő|erv|ete|fog|i a|kis|lád|nte|nye|nyi|ok |omá|os |rán|rás|sal|t e|vál|yar|ágo|ála|ége|ény|ött| tá|adó|elh|fej|het|hoz|ill|jár|kés|llo|mi |ny |ont|ren|res|rin|s a|s e|ssz|zt | ez| ka| ke| ko| re|a h|a n|den|dó |efo|gad|gat|gye|hel|k e|ket|les|mán|nde|nis|ozz|t b|t i|t é|tat|tos|val|z o|zak|ád |ály|ára|ési|ész| ak| am| es| há| ny| tö|aka|art|ató|azt|bbe|ber|ció|cso|em |eti|eté|gal|i t|ini|ist|ja |ker|ki |kor|koz|l é|ljá|lye|n v|ni |pál|ror|ról|rül|s c|s p|s s|s v|sok|t j|t t|tar|tel|vat",
    "id": "an | me|kan|ang|ng | pe|men| di| ke| da| se|eng| be|nga|nya| te|ah |ber|aka| ya|dan|di |yan|n p|per|a m|ita| pa|da |ata|ada|ya |ta | in|ala|eri|ia |a d|n k|am |ga |at |era|n d|ter| ka|a p|ari|emb|n m|ri | ba|aan|ak |ra | it|ara|ela|ni |ali|ran|ar |eru|lah|a b|asi|awa|eba|gan|n b| ha|ini|mer| la| mi|and|ena|wan| sa|aha|lam|n i|nda| wa|a i|dua|g m|mi |n a|rus|tel|yak| an|dal|h d|i s|ing|min|ngg|tak|ami|beb|den|gat|ian|ih |pad|rga|san|ua | de|a t|arg|dar|elu|har|i k|i m|i p|ika|in |iny|itu|mba|n t|ntu|pan|pen|sah|tan|tu |a k|ban|edu|eka|g d|ka |ker|nde|nta|ora|usa| du| ma|a s|ai |ant|bas|end|i d|ira|kam|lan|n s|uli|al |apa|ere|ert|lia|mem|rka|si |tal|ung| ak|a a|a w|ani|ask|ent|gar|haa|i i|isa|ked|mbe|ska|tor|uan|uk |uka| ad| to|asa|aya|bag|dia|dun|erj|mas|na |rek|rit|sih|us | bi|a h|ama|dib|ers|g s|han|ik |kem|ma |n l|nit|r b|rja|sa | ju| or| si| ti|a y|aga|any|as |cul|eme|emu|eny|epa|erb|erl|gi |h m|i a|kel|li |mel|nia|opa|rta|sia|tah|ula|un |unt| at| bu| pu| ta|agi|alu|amb|bah|bis|er |i t|ibe|ir |ja |k m|kar|lai|lal|lu |mpa|ngk|nja|or |pa |pas|pem|rak|rik|seb|tam|tem|top|tuk|uni|war| al| ga| ge| ir| ja| mu| na| pr| su| un|ad |adi|akt|ann|apo|bel|bul|der|ega|eke|ema|emp|ene|enj|esa",
    "is": "að |um | að|ir |ið |ur | ve| í |na | á | se| er| og|ar |og |ver| mi|inn|nn | fy|er |fyr| ek| en| ha| he|ekk| st|ki |st |ði | ba| me| vi|ig |rir|yri| um|g f|leg|lei|ns |ð s| ei| þa|in |kki|r h|r s|egi|ein|ga |ing|ra |sta| va| þe|ann|en |mil|sem|tjó|arð|di |eit|haf|ill|ins|ist|llj|ndi|r a|r e|seg|un |var| bi| el| fo| ge| yf|and|aug|bau|big|ega|eld|erð|fir|foo|gin|itt|n s|ngi|num|od |ood|sin|ta |tt |við|yfi|ð e|ð f| hr| sé| þv|a e|a á|em |gi |i f|jar|jór|lja|m e|r á|rei|rst|rða|rði|rðu|stj|und|veg|ví |ð v|það|því| fj| ko| sl|eik|end|ert|ess|fjá|fur|gir|hús|jár|n e|ri |tar|ð þ|ðar|ður|þes| br| hú| kr| le| up|a s|egg|i s|irt|ja |kið|len|með|mik|n b|nar|nir|nun|r f|r v|rið|rt |sti|t v|ti |una|upp|ða |óna| al| fr| gr|a v|all|an |da |eið|eð |fa |fra|g e|ger|gið|gt |han|hef|hel|her|hra|i a|i e|i v|i þ|iki|jón|jör|ka |kró|lík|m h|n a|nga|r l|ram|ru |ráð|rón|svo|vin|í b|í h|ð h|ð k|ð m|örð| af| fa| lí| rá| sk| sv| te|a b|a f|a h|a k|a u|afi|agn|arn|ast|ber|efu|enn|erb|erg|fi |g a|gar|iðs|ker|kke|lan|ljó|llt|ma |mið|n v|n í|nan|nda|ndu|nið|nna|nnu|nu |r o|rbe|rgi|slö|sé |t a|t h|til|tin|ugu|vil|ygg|á s|ð a|ð b|órn|ögn|öku| at| fi| fé| ka| ma| no| sa| si| ti| ák|a m|a t|a í|a þ|afa|afs|ald|arf",
    "it": " di|to |la | de|di |no | co|re |ion|e d| e |le |del|ne |ti |ell| la| un|ni |i d|per| pe|ent| in|one|he |ta |zio|che|o d|a d|na |ato|e s| so|i s|lla|a p|li |te | al| ch|er | pa| si|con|sta| pr|a c| se|el |ia |si |e p| da|e i|i p|ont|ano|i c|all|azi|nte|on |nti|o s| ri|i a|o a|un | an|are|ari|e a|i e|ita|men|ri | ca| il| no| po|a s|ant|il |in |a l|ati|cia|e c|ro |ann|est|gli|tà | qu|e l|nta| a |com|o c|ra | le| ne|ali|ere|ist| ma| è |io |lle|me |era|ica|ost|pro|tar|una| pi|da |tat| mi|att|ca |mo |non|par|sti| fa| i | re| su|ess|ini|nto|o l|ssi|tto|a e|ame|col|ei |ma |o i|za | st|a a|ale|anc|ani|i m|ian|o p|oni|sio|tan|tti| lo|i r|oci|oli|ona|ono|tra| l |a r|eri|ett|lo |nza|que|str|ter|tta| ba| li| te|ass|e f|enz|for|nno|olo|ori|res|tor| ci| vo|a i|al |chi|e n|lia|pre|ria|uni|ver| sp|imo|l a|l c|ran|sen|soc|tic| fi| mo|a n|ce |dei|ggi|gio|iti|l s|lit|ll |mon|ola|pac|sim|tit|utt|vol| ar| fo| ha| sa|acc|e r|ire|man|ntr|rat|sco|tro|tut|va | do| gi| me| sc| tu| ve| vi|a m|ber|can|cit|i l|ier|ità|lli|min|n p|nat|nda|o e|o f|o u|ore|oro|ort|sto|ten|tiv|van|art|cco|ci |cos|dal|e v|i i|ila|ino|l p|n c|nit|ole|ome|po |rio|sa | ce| es| tr|a b|and|ata|der|ens|ers|gi |ial|ina|itt|izi|lan|lor|mil",
    "kk": "ан |ен |ың | қа| ба|ай |нда|ын | са| ал|ді |ары|ды |ып | мұ| бі|асы|да |най| жа|мұн|ста|ған|н б|ұна| бо|ның|ін |лар|сын| де|аға|тан| кө|бір|ер |мен|аза|ынд|ыны| ме|анд|ері|бол|дың|қаз|аты|сы |тын|ғы | ке|ар |зақ|ық |ала|алы|аны|ара|ағы|ген|тар|тер|тыр|айд|ард|де |ға | қо|бар|ің |қан| бе| қы|ақс|гер|дан|дар|лық|лға|ына|ір |ірі|ғас| та|а б|гі |еді|еле|йды|н к|н т|ола|рын|іп |қст|қта|ң б| ай| ол| со|айт|дағ|иге|лер|лып|н а|ік |ақт|бағ|кен|н қ|ны |рге|рға|ыр | ар|алғ|аса|бас|бер|ге |еті|на |нде|не |ниг|рды|ры |сай| ау| кү| ни| от| өз|ауд|еп |иял|лты|н ж|н о|осы|оты|рып|рі |тке|ты |ы б|ы ж|ылы|ысы|і с|қар| бұ| да| же| тұ| құ|ады|айл|ап |ата|ені|йла|н м|н с|нды|нді|р м|тай|тін|ы т|ыс |інд| би|а ж|ауы|деп|дің|еке|ери|йын|кел|лды|ма |нан|оны|п ж|п о|р б|рия|рла|уда|шыл|ы а|ықт|і а|і б|із |ілі|ң қ| ас| ек| жо| мә| ос| ре| се|алд|дал|дег|дей|е б|ет |жас|й б|лау|лда|мет|нын|сар|сі |ті |ыры|ыта|ісі|ң а|өте| ат| ел| жү| ма| то| шы|а а|алт|ама|арл|аст|бұл|дай|дық|ек |ель|есі|зді|көт|лем|ль |н е|п а|р а|рес|са |та |тте|тұр|шы |ы д|ы қ|ыз |қыт| ко| не| ой| ор| сұ| тү|аль|аре|атт|дір|ев |егі|еда|екі|елд|ерг|ерд|ияд|кер|кет|лыс|ліс|мед|мпи|н д|ні |нін|п т|пек|рел|рта|ріл|рін|сен|тал|шіл|ы к|ы м|ыст",
    "ky": "ын |ан | жа|ен |да | та|ар |ин | ка|ары| ал| ба| би|лар| бо| кы|ала|н к| са|нда|ган|тар| де|анд|н б| ке|ард|мен|н т|ара|нын| да| ме|кыр| че|н а|ры | ко|ген|дар|кен|кта|уу |ене|ери| ша|алы|ат |на | кө| эм|аты|дан|деп|дын|еп |нен|рын| бе|кан|луу|ргы|тан|шай|ырг|үн | ар| ма|агы|акт|аны|гы |гыз|ды |рда|ай |бир|бол|ер |н с|нды|ун |ча |ынд|а к|ага|айл|ана|ап |га |лге|нча|п к|рды|туу|ыны| ан| өз|ама|ата|дин|йт |лга|лоо|оо |ри |тин|ыз |ып |өрү| па| эк|а б|алг|асы|ашт|биз|кел|кте|тал| не| су|акы|ент|инд|ир |кал|н д|нде|ого|онд|оюн|р б|р м|ран|сал|ста|сы |ура|ыгы| аш| ми| сы| ту|ал |арт|бор|елг|ени|ет |жат|йло|кар|н м|огу|п а|п ж|р э|сын|ык |юнч| бу| ур|а а|ак |алд|алу|бар|бер|бою|ге |дон|еги|ект|ефт|из |кат|лды|н ч|н э|н ө|ндо|неф|он |сат|тор|ты |уда|ул |ула|ууд|ы б|ы ж|ы к|ыл |ына|эке|ясы| ат| до| жы| со| чы|аас|айт|аст|баа|баш|гар|гын|дө |е б|ек |жыл|и б|ик |ияс|кыз|лда|лык|мда|н ж|нди|ни |нин|орд|рдо|сто|та |тер|тти|тур|тын|уп |ушу|фти|ыкт|үп |өн | ай| бү| ич| иш| мо| пр| ре| өк| өт|а д|а у|а э|айм|амд|атт|бек|бул|гол|дег|еге|ейт|еле|енд|жак|и к|ини|ири|йма|кто|лик|мак|мес|н у|н ш|нтт|ол |оло|пар|рак|рүү|сыр|ти |тик|тта|төр|у ж|у с|шка|ы м|ызы|ылд|эме|үрү|өлү|өтө| же| тү| эл| өн|а ж|ады",
    "la": "um |us |ut |et |is | et| in| qu|tur| pr|est|tio| au|am |em |aut| di|ent|in |dic|t e| es|ur |ati|ion|st | ut|ae |qua| de|nt | su| si|itu|unt|rum|ia |es |ter| re|nti|rae|s e|qui|io |pro|it |per|ita|one|ici|ius| co|t d|bus|pra|m e| no|edi|tia|ue |ibu| se| ad|er | fi|ili|que|t i|de |oru| te|ali| pe|aed|cit|m d|t s|tat|tem|tis|t p|sti|te |cum|ere|ium| ex|rat|ta |con|cti|oni|ra |s i| cu| sa|eni|nis|nte|eri|omi|re |s a|min|os |ti |uer| ma| ue|m s|nem|t m| mo| po| ui|gen|ict|m i|ris|s s|t a|uae| do|m a|t c| ge|as |e i|e p|ne | ca|ine|quo|s p| al|e e|ntu|ro |tri|tus|uit|atu|ini|iqu|m p|ost|res|ura| ac| fu|a e|ant|nes|nim|sun|tra|e a|s d| pa| uo|ecu| om| tu|ad |cut|omn|s q| ei|ex |icu|tor|uid| ip| me|e s|era|eru|iam|ide|ips| iu|a s|do |e d|eiu|ica|im |m c|m u|tiu| ho|cat|ist|nat|on |pti|reg|rit|s t|sic|spe| en| sp|dis|eli|liq|lis|men|mus|num|pos|sio| an| gr|abi|acc|ect|ri |uan| le|ecc|ete|gra|non|se |uen|uis| fa| tr|ate|e c|fil|na |ni |pul|s f|ui |at |cce|dam|i e|ina|leg|nos|ori|pec|rop|sta|uia|ene|iue|iui|siu|t t|t u|tib|tit| da| ne|a d|and|ege|equ|hom|imu|lor|m m|mni|ndo|ner|o e|r e|sit|tum|utu|a p|bis|bit|cer|cta|dom|fut|i s|ign|int|mod|ndu|nit|rib|rti|tas|und| ab|err|ers|ite|iti|m t|o p",
    "lt": "as | pa| ka|ai |us |os |is | ne| ir|ir |ti | pr|aus|ini|s p|pas|ių | ta| vi|iau| ko| su|kai|o p|usi| sa|vo |tai|ali|tų |io |jo |s k|sta|iai| bu| nu|ius|mo | po|ien|s s|tas| me|uvo|kad| iš| la|to |ais|ie |kur|uri| ku|ijo|čia|au |met|je | va|ad | ap|and| gr| ti|kal|asi|i p|iči|s i|s v|ink|o n|ės |buv|s a| ga|aip|avi|mas|pri|tik| re|etu|jos| da|ent|oli|par|ant|ara|tar|ama|gal|imo|išk|o s| at| be| į |min|tin| tu|s n| jo|dar|ip |rei| te|dži|kas|nin|tei|vie| li| se|cij|gar|lai|art|lau|ras|no |o k|tą | ar|ėjo|vič|iga|pra|vis| na|men|oki|raš|s t|iet|ika|int|kom|tam|aug|avo|rie|s b| st|eim|ko |nus|pol|ria|sau|api|me |ne |sik| ši|i n|ia |ici|oja|sak|sti|ui |ame|lie|o t|pie|čiu| di| pe|gri|ios|lia|lin|s d|s g|ta |uot| ja| už|aut|i s|ino|mą |oje|rav|dėl|nti|o a|toj|ėl | to| vy|ar |ina|lic|o v|sei|su | mi| pi|din|iš |lan|si |tus| ba|asa|ata|kla|omi|tat| an| ji|als|ena|jų |nuo|per|rig|s m|val|yta|čio| ra|i k|lik|net|nė |tis|tuo|yti|ęs |ų s|ada|ari|do |eik|eis|ist|lst|ma |nes|sav|sio|tau| ki|aik|aud|ies|ori|s r|ska| ge|ast|eig|et |iam|isa|mis|nam|ome|žia|aba|aul|ikr|ką |nta|ra |tur| ma|die|ei |i t|nas|rin|sto|tie|tuv|vos|ų p| dė|are|ats|enė|ili|ima|kar|ms |nia|r p|rod|s l| o |e p|es |ide|ik |ja ",
    "lv": "as | la| pa| ne|es | un|un | ka| va|ar |s p| ar| vi|is |ai | no|ja |ija|iem|em |tu |tie|vie|lat|aks|ien|kst|ies|s a|rak|atv|tvi| ja| pi|ka | ir|ir |ta | sa|ts | kā|ās | ti|ot |s n| ie| ta|arī|par|pie| pr|kā | at| ra|am |inā|tā | iz|jas|lai| na|aut|ieš|s s| ap| ko| st|iek|iet|jau|us |rī |tik|ība|na | ga|cij|s i| uz|jum|s v|ms |var| ku| ma|jā |sta|s u| tā|die|kai|kas|ska| ci| da|kur|lie|tas|a p|est|stā|šan|nes|nie|s d|s m|val| di| es| re|no |to |umu|vai|ši | vē|kum|nu |rie|s t|ām |ad |et |mu |s l| be|aud|tur|vij|viņ|āju|bas|gad|i n|ika|os |a v|not|oti|sts|aik|u a|ā a|āk | to|ied|stu|ti |u p|vēl|āci| šo|gi |ko |pro|s r|tāj|u s|u v|vis|aun|ks |str|zin|a a|adī|da |dar|ena|ici|kra|nas|stī|šu | mē|a n|eci|i s|ie |iņa|ju |las|r t|ums|šie|bu |cit|i a|ina|ma |pus|ra | au| se| sl|a s|ais|eši|iec|iku|pār|s b|s k|sot|ādā| in| li| tr|ana|eso|ikr|man|ne |u k| tu|an |av |bet|būt|im |isk|līd|nav|ras|ri |s g|sti|īdz| ai|arb|cin|das|ent|gal|i p|lik|mā |nek|pat|rēt|si |tra|uši|vei| br| pu| sk|als|ama|edz|eka|ešu|ieg|jis|kam|lst|nāk|oli|pre|pēc|rot|tās|usi|ēl |ēs | bi| de| me| pā|a i|aid|ajā|ikt|kat|lic|lod|mi |ni |pri|rād|rīg|sim|trā|u l|uto|uz |ēc |ītā| ce| jā| sv|a t|aga|aiz|atu|ba |cie|du |dzi|dzī",
    "mk": "на | на|та |ата|ија| пр|то |ја | за|а н| и |а с|те |ите| ко|от | де| по|а д|во |за | во| од| се| не|се | до|а в|ка |ање|а п|о п|ува|циј|а о|ици|ето|о н|ани|ни | вл|дек|ека|њет|ќе | е |а з|а и|ат |вла|го |е н|од |пре| го| да| ма| ре| ќе|али|и д|и н|иот|нат|ово| па| ра| со|ове|пра|што|ње |а е|да |дат|дон|е в|е д|е з|е с|кон|нит|но |они|ото|пар|при|ста|т н| шт|а к|аци|ва |вањ|е п|ени|ла |лад|мак|нес|нос|про|рен|јат| ин| ме| то|а г|а м|а р|аке|ако|вор|гов|едо|ена|и и|ира|кед|не |ниц|ниј|ост|ра |рат|ред|ска|тен| ка| сп| ја|а т|аде|арт|е г|е и|кат|лас|нио|о с|ри | ба| би|ава|ате|вни|д н|ден|дов|држ|дув|е о|ен |ере|ери|и п|и с|ина|кој|нци|о м|о о|одн|пор|ски|спо|ств|сти|тво|ти | об| ов|а б|алн|ара|бар|е к|ед |ент|еѓу|и о|ии |меѓ|о д|оја|пот|раз|раш|спр|сто|т д|ци | бе| гр| др| из| ст|аа |бид|вед|гла|еко|енд|есе|етс|зац|и т|иза|инс|ист|ки |ков|кол|ку |лиц|о з|о и|ова|олк|оре|ори|под|рањ|реф|ржа|ров|рти|со |тор|фер|цен|цит| а | вр| гл| дп| мо| ни| но| оп| от|а ќ|або|ада|аса|аша|ба |бот|ваа|ват|вот|ги |гра|де |дин|дум|евр|еду|ено|ера|ес |ење|же |зак|и в|ила|иту|коа|кои|лан|лку|лож|мот|нду|нст|о в|оа |оал|обр|ов |ови|овн|ои |ор |орм|ој |рет|сед|ст |тер|тиј|тоа|фор|ции|ѓу | ал| ве| вм| ги| ду",
    "mn": "ын | ба|йн |бай|ийн|уул| ул|улс|ан | ха|ний|н х|гаа|сын|ий |лсы| бо|й б|эн |ах |бол|ол |н б|оло| хэ|онг|гол|гуу|нго|ыг |жил| мо|лаг|лла|мон| тє| ху|айд|ны |он |сан|хий| аж| ор|л у|н т|улг|айг|длы|йг | за|дэс|н а|ндэ|ула|ээ |ага|ийг|vй |аа |й а|лын|н з| аю| зє|аар|ад |ар |гvй|зєв|ажи|ал |аюу|г х|лгv|лж |сни|эсн|юул|йдл|лыг|нхи|ууд|хам| нэ| са|гий|лах|лєл|рєн|єгч| та|илл|лий|лэх|рий|эх | ер| эр|влє|ерє|ийл|лон|лєг|євл|єнх| хо|ари|их |хан|эр |єн |vvл|ж б|тэй|х х|эрх| vн| нь|vнд|алт|йлє|нь |тєр| га| су|аан|даа|илц|йгу|л а|лаа|н н|руу|эй | то|н с|рил|єри|ааг|гч |лээ|н о|рэг|суу|эрэ|їїл| yн| бу| дэ| ол| ту| ши|yнд|аши|г т|иг |йл |хар|шин|эг |єр | их| хє| хї|ам |анг|ин |йга|лса|н v|н е|нал|нд |хуу|цаа|эд |ээр|єл |vйл|ада|айн|ала|амт|гах|д х|дал|зар|л б|лан|н д|сэн|улл|х б|хэр| бv| да| зо|vрэ|аад|гээ|лэн|н и|н э|нга|нэ |тал|тын|хур|эл | на| ни| он|vлэ|аг |аж |ай |ата|бар|г б|гад|гїй|й х|лт |н м|на |оро|уль|чин|эж |энэ|ээд|їй |їлэ| би| тэ| эн|аны|дий|дээ|лал|лга|лд |лог|ль |н у|н ї|р б|рал|сон|тай|удл|элт|эрг|єлє| vй| в | гэ| хv|ара|бvр|д н|д о|л х|лс |лты|н г|нэг|огт|олы|оёр|р т|рээ|тав|тог|уур|хоё|хэл|хээ|элэ|ёр | ав| ас| аш| ду| со| чи| эв| єр|аал|алд|амж|анд|асу|вэр|г у|двэ|жvv|лца|лэл",
    "no": "er |en |et | de|det| i |for|il | fo| me|ing|om | ha| og|ter| er| ti| st|og |til|ne | vi|re | en| se|te |or |de |kke|ke |ar |ng |r s|ene| so|e s|der|an |som|ste|at |ed |r i| av| in|men| at| ko| på|har| si|ere|på |nde|and|els|ett|tte|lig|t s|den|t i|ikk|med|n s|rt |ser|ska|t e|ker|sen|av |ler|r a|ten|e f|r e|r t|ede|ig | re|han|lle|ner| bl| fr|le | ve|e t|lan|mme|nge| be| ik| om| å |ell|sel|sta|ver| et| sk|nte|one|ore|r d|ske| an| la|del|gen|nin|r f|r v|se | po|ir |jon|mer|nen|omm|sjo| fl| sa|ern|kom|r m|r o|ren|vil|ale|es |n a|t f| le|bli|e e|e i|e v|het|ye | ir|al |e o|ide|iti|lit|nne|ran|t o|tal|tat|tt | ka|ans|asj|ge |inn|kon|lse|pet|t d|vi | ut|ent|eri|oli|r p|ret|ris|sto|str|t a| ga|all|ape|g s|ill|ira|kap|nn |opp|r h|rin| br| op|e m|ert|ger|ion|kal|lsk|nes| gj| mi| pr|ang|e h|e r|elt|enn|i s|ist|jen|kan|lt |nal|res|tor|ass|dre|e b|e p|mel|n t|nse|ort|per|reg|sje|t p|t v| hv| nå| va|ann|ato|e a|est|ise|isk|oil|ord|pol|ra |rak|sse|toi| gr|ak |eg |ele|g a|ige|igh|m e|n f|n v|ndr|nsk|rer|t m|und|var|år | he| no| ny|end|ete|fly|g i|ghe|ier|ind|int|lin|n d|n p|rne|sak|sie|t b|tid| al| pa| tr|ag |dig|e d|e k|ess|hol|i d|lag|led|n e|n i|n o|pri|r b|st | fe| li| ry|air|ake|d s|eas|egi",
    "ne": "को |का |मा |हरु| ने|नेप|पाल|ेपा| सम|ले | प्|प्र|कार|ा स|एको| भए| छ | भा|्रम| गर|रुक| र |भार|ारत| का| वि|भएक|ाली|ली |ा प|ीहर|ार्|ो छ|ना |रु |ालक|्या| बा|एका|ने |न्त|ा ब|ाको|ार |ा भ|ाहर|्रो|क्ष|न् |ारी| नि|ा न|ी स| डु|क्र|जना|यो |ा छ|ेवा|्ता| रा|त्य|न्द|हुन|ा क|ामा|ी न|्दा| से|छन्|म्ब|रोत|सेव|स्त|स्र|ेका|्त | बी| हु|क्त|त्र|रत |र्न|र्य|ा र|ाका|ुको| एक| सं| सु|बीब|बीस|लको|स्य|ीबी|ीसी|ेको|ो स|्यक| छन| जन| बि| मु| स्|गर्|ताह|न्ध|बार|मन्|मस्|रुल|लाई|ा व|ाई |ाल |िका| त्| मा| यस| रु|ताक|बन्|र ब|रण |रुप|रेक|ष्ट|सम्|सी |ाएक|ुका|ुक्| अध| अन| तथ| थि| दे| पर| बै|तथा|ता |दा |द्द|नी |बाट|यक्|री |रीह|र्म|लका|समस|ा अ|ा ए|ाट |िय |ो प|ो म|्न |्ने|्षा| पा| यो| हा|अधि|डुव|त भ|त स|था |धिक|पमा|बैठ|मुद|या |युक|र न|रति|वान|सार|ा आ|ा ज|ा ह|ुद्|ुपम|ुले|ुवा|ैठक|ो ब|्तर|्य |्यस| क्| मन| रह|चार|तिय|दै |निर|नु |पर्|रक्|र्द|समा|सुर|ाउन|ान |ानम|ारण|ाले|ि ब|ियो|ुन्|ुरक|्त्|्बन|्रा|्ष | आर| जल| बे| या| सा|आएक|एक |कर्|जलस|णका|त र|द्र|धान|धि |नका|नमा|नि |ममा|रम |रहे|राज|लस्|ला |वार|सका|हिल|हेक|ा त|ारे|िन्|िस्|े स|ो न|ो र|ोत |्धि|्मी|्रस| दु| पन| बत| बन| भन|ंयु|आरम|खि |ण्ड|तका|ताल|दी |देख|निय|पनि|प्त|बता|मी |म्भ|र स|रम्|लमा|विश|षाक|संय|ा ड|ा म|ानक|ालम|ि भ|ित |ी प|ी र|ु भ|ुने|े ग|ेखि|ेर |ो भ|ो व|ो ह|्भ |्र | ता| नम| ना",
    "nl": "en |de | de|et |an | he|er | va|n d|van|een|het| ge|oor| ee|der| en|ij |aar|gen|te |ver| in| me|aan|den| we|at |in | da| te|eer|nde|ter|ste|n v| vo| zi|ing|n h|voo|is | op|tie| aa|ede|erd|ers| be|eme|ten|ken|n e| ni| ve|ent|ijn|jn |mee|iet|n w|ng |nie| is|cht|dat|ere|ie |ijk|n b|rde|ar |e b|e a|met|t d|el |ond|t h| al|e w|op |ren| di| on|al |and|bij|zij| bi| hi| wi|or |r d|t v| wa|e h|lle|rt |ang|hij|men|n a|n z|rs | om|e o|e v|end|est|n t|par| pa| pr| ze|e g|e p|n p|ord|oud|raa|sch|t e|ege|ich|ien|aat|ek |len|n m|nge|nt |ove|rd |wer| ma| mi|daa|e k|lij|mer|n g|n o|om |sen|t b|wij| ho|e m|ele|gem|heb|pen|ude| bo| ja|die|e e|eli|erk|le |pro|rij| er| za|e d|ens|ind|ke |n k|nd |nen|nte|r h|s d|s e|t z| b | co| ik| ko| ov|eke|hou|ik |iti|lan|ns |t g|t m| do| le| zo|ams|e z|g v|it |je |ls |maa|n i|nke|rke|uit| ha| ka| mo| re| st| to|age|als|ark|art|ben|e r|e s|ert|eze|ht |ijd|lem|r v|rte|t p|zeg|zic|aak|aal|ag |ale|bbe|ch |e t|ebb|erz|ft |ge |led|mst|n n|oek|r i|t o|t w|tel|tte|uur|we |zit| af| li| ui|ak |all|aut|doo|e i|ene|erg|ete|ges|hee|jaa|jke|kee|kel|kom|lee|moe|n s|ort|rec|s o|s v|teg|tij|ven|waa|wel| an| au| bu| gr| pl| ti|'' |ade|dag|e l|ech|eel|eft|ger|gt |ig |itt|j d|ppe|rda",
    "nr": "oku|la |nga|a n| ng|na |ama|a i|ko | uk|ele|lo |ela|ang|a u|a k|uku|aba| ku|wa |enz|lel|ho |ni |ngo|ath|pha|eth|kha|ana|isa|nge| na|o n|tho|e n|the|ha |esi|nye|kwe|tjh| kw|ise| um|a a| ne|le |hla|a e|lan|ben|ndl| no|imi|und|ung|thi|nzi|ye |isi|uth|o e|ebe|het|kut|and|sa |elo|fun|eko|seb|ban|ulu|aka|eli|wen|e i| am|eni|ba |we |nel| we|kuf|lwa|i n| is|zi | lo|kwa|lok|elw|gok|ona|lek|hi |li |gan|bon| ii|ing|ka |o i|akh|ane|thu|ula|kel|mth| im|ga | le|nda|fan|nok|i k|end|si |o w|aph|hat|e u|ala|kub|lun|ikh|o l|ezi|a l|o u|sis|nam|emi| ab|hul|kus| wo|sek|azi|kho|iin|i u|asi|lol|ini|uph|uhl|khu|no |o y|ako|a b|i e|o k|i l| be|mal| ye|i i|nde|iph|mel|eke|tha|kun|ngi|e k|eng|o s| yo|so |ma |mkh|jha|isw|lwe| ez|di |a w|e a|kul|uny|ume|za |any|ahl|kuh|een| si|ili|itj|zok|ihl| es|ke |hlo|hak|phe|lul|dle|luk|da |eka|amb| se|zis|mbi|hon|dla|aku|jen|zin| ba|ham|i a| bo|o a|ali|use|ile|sik|han|wok|okh|hlu|nya|sit|ani|kuz|o o|ufa|swa|ind|zak|nis|lis|gab|mi | em| ko|ano| el|hwa|ufu|a y|wo | in|lim|tlo|kat|wak|kan|thw|o z|ith|ndi|yok|yo |mit|mis|abo|eku|hab|iny|nan|eze|khe|alo|lu |man|he |ezo|kup|ubu| zo|gam|hel|wan|omb|amk|nza|ola|hum|kuk|du | la|kom|i y|obu|i b|odu|okw|gap| ka|be | il|alu|atj|e b",
    "nso": "go | go| le| a |le | di|a g|ya |lo | ya|a m|ka | ka|la | t |o y|a t|a k|ba |et |wa | mo| e |a b| se| ba| ma| bo|e g|t a| o |a l|o t|na |o l|a d|elo|di |a s|o g|o k|ele|o a|ng |t e|o b|mo |e t|e m|ego|eo |e l|ngw|se |e b|kgo|ela| wa| ga|e k|ago|o m| kg|ga |dit|olo|t h|e d|o d| ye|ane|lel|we | tl|thu|ona| th|t w|hut|ana|tla|wan|aba|ola| me|gwa|re |ong|t o|lao|e s|o s|a y|alo|set|a p|i a|eng|a a|o e|tho| ke|gwe| ha|hlo|edi| la|ao | ts|aka|hla|ala|swa| we| bj|o o|gor|aga|hab|gob|let|ke |dik|sa | i |oba| hl|the|dir|a n|ith|bja|ye |no | sa|mol|lwa|ti |man|ole|e e|tse|o w|ore|to |at |eth|e y|kan|tsh|gon|net|ano|kar|ge |ho |lok| sw| na|i b|dip|i o|oka| ge| om|ko |emo|pel|nt |e a|mel|leg|tlh|me |ete|phe|a e|o n|o i|wal|oko|nya|bol|odi|weg|te |e n|ta |any|yeo|kga|pol|ang|ri |it |uto| mm|iti|are|o f|ha |gat|oth|ika|o h| it|she|ath|ale|iri|pha|ahl| te|ohl|tha| re|bon|lha| ph|din| pe|ro |mi |omi|i t| fa|aro|ase|i l|ne |lal|ogo|kol| wo|t i|omo| be|mog|mok|len|ile|lwe|ma |uta|nse|amo|a o| fe|okg|ja |pan|nag|ekg|i i|apa|get|lon|ra |aem| yo|atl|tlo|kel|tel| kh| po|e o|a w|ent|i e|bo |gan|het|mal|a f|otl|uti|oga|sen|kwa|mae|eka|mme|kge|jal|a r|ing|lek|sep|lag|ofe|wag|g y|rol|epe|eko|bok|o p|adi|log",
    "pl": "ie |nie|em | ni| po| pr|dzi| na|że |rze|na |łem|wie| w | że|go | by|prz|owa|ię | do| si|owi| pa| za|ch |ego|ał |się|ej |wał|ym |ani|ałe|to | i | to| te|e p| je| z |czy|był|pan|sta|kie| ja|do | ch| cz| wi|iał|a p|pow| mi|li |eni|zie| ta| wa|ło |ać |dy |ak |e w| a | od| st|nia|rzy|ied| kt|odz|cie|cze|ia |iel|któ|o p|tór|ści| sp| wy|jak|tak|zy | mo|ałę|pro|ski|tem|łęs| tr|e m|jes|my | ro|edz|eli|iej| rz|a n|ale|an |e s|est|le |o s|i p|ki | co|ada|czn|e t|e z|ent|ny |pre|rzą|y s| ko| o |ach|am |e n|o t|oli|pod|zia| go| ka|by |ieg|ier|noś|roz|spo|ych|ząd| mn|acz|adz|bie|cho|mni|o n|ost|pra|ze |ła | so|a m|cza|iem|ić |obi|ył |yło| mu| mó|a t|acj|ci |e b|ich|kan|mi |mie|ośc|row|zen|zyd| al| re|a w|den|edy|ił |ko |o w|rac|śmy| ma| ra| sz| ty|e j|isk|ji |ka |m s|no |o z|rez|wa |ów |łow|ść | ob|ech|ecz|ezy|i w|ja |kon|mów|ne |ni |now|nym|pol|pot|yde| dl| sy|a s|aki|ali|dla|icz|ku |ocz|st |str|szy|trz|wia|y p|za | wt|chc|esz|iec|im |la |o m|sa |wać|y n|zac|zec| gd|a z|ard|co |dar|e r|ien|m n|m w|mia|moż|raw|rdz|tan|ted|teg|wił|wte|y z|zna|zło|a r|awi|bar|cji|czą|dow|eż |gdy|iek|je |o d|tał|wal|wsz|zed|ówi|ęsa| ba| lu| wo|aln|arn|ba |dzo|e c|hod|igi|lig|m p|myś|o c|oni|rel|sku|ste|y w|yst|z w",
    "ps": " د |اؤ | اؤ|نو |ې د|ره | په|نه |چې | چې|په |ه د|ته |و ا|ونو|و د| او|انو|ونه|ه ک| دا|ه ا|دې |ښې | کې|ان |لو |هم |و م|کښې|ه م|ى ا| نو| ته| کښ|رون|کې |ده |له |به |رو | هم|ه و|وى |او |تون|دا | کو| کړ|قام| تر|ران|ه پ|ې و|ې پ| به| خو|تو |د د|د ا|ه ت|و پ|يا | خپ| دو| را| مش| پر|ارو|رې |م د|مشر| شو| ور|ار |دى | اد| دى| مو|د پ|لي |و ک| مق| يو|ؤ د|خپل|سره|ه چ|ور | تا| دې| رو| سر| مل| کا|ؤ ا|اره|برو|مه |ه ب|و ت|پښت| با| دغ| قب| له| وا| پا| پښ|د م|د ه|لې |مات|مو |ه ه|وي |ې ب|ې ک| ده| قا|ال |اما|د ن|قبر|ه ن|پار| اث| بي| لا| لر|اثا|د خ|دار|ريخ|شرا|مقا|نۍ |ه ر|ه ل|ولو|يو |کوم| دد| لو| مح| مر| وو|اتو|اري|الو|اند|خان|د ت|سې |لى |نور|و ل|ي چ|ړي |ښتو|ې ل| جو| سي|ام |بان|تار|تر |ثار|خو |دو |ر ک|ل د|مون|ندې|و ن|ول |وه |ى و|ي د|ې ا|ې ت|ې ي| حک| خب| نه| پو|ا د|تې |جوړ|حکم|حکو|خبر|دان|ر د|غه |قاف|محک|وال|ومت|ويل|ى د|ى م|يره|پر |کول|ې ه| تي| خا| وک| يا| ځا|ؤ ق|انۍ|بى |غو |ه خ|و ب|ودا|يدو|ړې |کال| بر| قد| مي| وي| کر|ؤ م|ات |ايي|تى |تيا|تير|خوا|دغو|دم |ديم|ر و|قدي|م خ|مان|مې |نيو|نږ |ه ي|و س|و چ|وان|ورو|ونږ|پور|ړه |ړو |ۍ د|ې ن| اه| زي| سو| شي| هر| هغ| ښا|اتل|اق |اني|بري|بې |ت ا|د ب|د س|ر م|رى |عرا|لان|مى |نى |و خ|وئ |ورک|ورې|ون |وکړ|ى چ|يمه|يې |ښتن|که |کړي|ې خ|ے ش| تح| تو| در| دپ| صو| عر| ول| يؤ| پۀ| څو|ا ا",
    "pt": "de | de|os |as |que| co|ão |o d| qu|ue | a |do |ent| se|a d|s d|e a|es | pr|ra |da | es| pa|to | o |em |con|o p| do|est|nte|ção| da| re|ma |par| te|ara|ida| e |ade|is | um| po|a a|a p|dad|no |te | no|açã|pro|al |com|e d|s a| as|a c|er |men|s e|ais|nto|res|a s|ado|ist|s p|tem|e c|e s|ia |o s|o a|o c|e p|sta|ta |tra|ura| di| pe|ar |e e|ser|uma|mos|se | ca|o e| na|a e|des|ont|por| in| ma|ect|o q|ria|s c|ste|ver|cia|dos|ica|str| ao| em|das|e t|ito|iza|pre|tos| nã|ada|não|ess|eve|or |ran|s n|s t|tur| ac| fa|a r|ens|eri|na |sso| si| é |bra|esp|mo |nos|ro |um |a n|ao |ico|liz|min|o n|ons|pri|ten|tic|ões| tr|a m|aga|e n|ili|ime|m a|nci|nha|nta|spe|tiv|am |ano|arc|ass|cer|e o|ece|emo|ga |o m|rag|so |são| au| os| sa|ali|ca |ema|emp|ici|ido|inh|iss|l d|la |lic|m c|mai|onc|pec|ram|s q| ci| en| fo|a o|ame|car|co |der|eir|ho |io |om |ora|r a|sen|ter| br| ex|a u|cul|dev|e u|ha |mpr|nce|oca|ove|rio|s o|sa |sem|tes|uni|ven|zaç|çõe| ad| al| an| mi| mo| ve| à |a i|a q|ala|amo|bli|cen|col|cos|cto|e m|e v|ede|gás|ias|ita|iva|ndo|o t|ore|r d|ral|rea|s f|sid|tro|vel|vid|ás | ap| ar| ce| ou| pú| so| vi|a f|act|arr|bil|cam|e f|e i|el |for|lem|lid|lo |m d|mar|nde|o o|omo|ort|per|púb|r u|rei|rem|ros|rre|ssi",
    "pt-BR": "eq |ent| en|q e|q i|g e|g i|ng | id|ida|nte|te | es| in|ade|ag |dad|de |ia |ing| br| sa|est|inq|lin|mo |nq |o a|seq| co| li| ni| o |a a|a c|ado|asi|bra|dor|iq |nta|o b|or |q n|ras|sil|str|ta |tre|us | a | ag| an| ca| e | eq| g | i | ir| nc| q | se| ve|ant|ar |cia|con|e a|eir|el |ig |ili|imo|io |ir |nci|o t|ro |vel| ap| bo| de| fr| tr|a b|a e|a g|a v|apo|as |bus|ca |cet|cin|des|e b|e s|eta|fre|i a|ibu|il |iro|la |liq|nib|nti|o c|o q|os |ra |re |req|s a|s s|san|sim|tar|to |ult| ba| ci| el| em| fi| gr| gu| ia| mu| pe| po| re| ri| si| su| te| vi|a o|a s|abe|alc|and|ara|arg|ari|ben|boc|car|co |do |e f|e g|e l|e o|em |emo|en |es |esp|exe|fic|g n|g s|gra|gua|ias|ica|idi|ila|ile|inh|l b|l e|lei|loq|mos|mul|nad|nio|nt |nto|o g|o r|oce|ont|oq |pos|q v|r b|r e|r i|r s|rad|ran|rem|rg |ria|rio|s e|s p|sta|sti|tig|til|tra|ua |ue |va |xeq| ' | ab| ad| ae| al| am| aq| ar| b | bi| bl| bu| cc| ch| di| et| ex| fa| ic| il| im| is| it| ll| m | me| na| ne| ng| nu| ob| ou| pi| qu| ss| st| ti| ub| un| v | x |' c|a d|a f|a i|a n|a p|a t|abr|aci|ad |ada|adr|aer|afe|alv|amb|amp|an |ana|ang|anh|ani|ano|anq|apa|aq |ati|ato|azi|b n|ban|bar|big|bil|biq|bli|blu|bon|bre|bri|bse|buc|c f|c i|cad|caf|cag|cal|can|cc ",
    "pt-PT": "equ|ent|que|qui|gui|uen| li|ngu|qu |uid| co| ve|de |gue|ida|nte|o a|a a|ade|dad|el |ing|mo |nqu|nta|seq|u n|vel| de| o | se|a c|ado|ar |est|ia |inq|io |iqu|lin|o c|o p|ort|por|ta |te | ag| eq| nc| pi| po| sa|a d|a e|ant|as |ca |cia|des|do |gu |imo|l p|nci|ro |rtu|str|tug|u s|ues|ui | a | an| ap| ba| bi| ca| fr| gu| in| pe| qu|agu|apa|con|dor|e f|e g|eir|fre|ho |i a|ica|igu|iro|liq|nti|o b|o l|o s|or |r o|ra |req|s c|sim|tar|to |ue |uin|ult| ci| en| ho| mu| ni| re| s | si| su|a s|a v|abe|ag |al |and|anh|apo|ata|ban|ben|bic|boi|cap|car|cin|co |com|cto|dei|e b|e o|e s|eca|en |er |es |exe|fic|for|gal|gra|ias|ich|ico|idi|ili|ir |ira|isb|la |lis|mbo|mul|na |nho|nio|nt |o q|o r|o t|oc |oio|omb|oo |os |par|pe |r b|r e|r s|ran|re |rec|s a|s s|san|sbo|so |sta|tan|tra|tre|u v|uga|ugu|xeq| ab| ad| al| am| aq| ar| au| b | bo| c | ch| ct| cu| el| es| ex| fa| fi| ga| gr| id| ir| ne| ng| nu| ob| oo| pa| ps| pt| r | ra| ri| ss| st| ta| te| tr| ub| un| vi| vo|a f|a i|a l|a m|a o|a r|ach|aci|act|ad |afa|age|agr|alf|alh|am |amb|ami|ana|ang|anq|aqu|ara|arb|arc|arg|ari|arr|asa|ati|aut|azi|b n|bar|bat|ber|big|bil|biq|bli|boa|boe|bor|bse|c i|c l|c p|cad|cam|cas|ch |cha|che|chi|cio|coc|coi|cou|ctr|cue|cul",
    "ro": " de| în|de | a |ul | co|în |re |e d|ea | di| pr|le |şi |are|at |con|ui | şi|i d|ii | cu|e a|lui|ern|te |cu | la|a c|că |din|e c|or |ulu|ne |ter|la |să |tat|tre| ac| să|est|st |tă | ca| ma| pe|cur|ist|mân|a d|i c|nat| ce|i a|ia |in |scu| mi|ato|aţi|ie | re| se|a a|int|ntr|tru|uri|ă a| fo| pa|ate|ini|tul|ent|min|pre|pro|a p|e p|e s|ei |nă |par|rna|rul|tor| in| ro| tr| un|al |ale|art|ce |e e|e î|fos|ita|nte|omâ|ost|rom|ru |str|ver| ex| na|a f|lor|nis|rea|rit| al| eu| no|ace|cer|ile|nal|pri|ri |sta|ste|ţie| au| da| ju| po|ar |au |ele|ere|eri|ina|n a|n c|res|se |t a|tea| că| do| fi|a s|ată|com|e ş|eur|guv|i s|ice|ili|na |rec|rep|ril|rne|rti|uro|uve|ă p| ar| o | su| vi|dec|dre|oar|ons|pe |rii| ad| ge|a m|a r|ain|ali|car|cat|ecu|ene|ept|ext|ilo|iu |n p|ori|sec|u p|une|ă c|şti|ţia| ch| gu|ai |ani|cea|e f|isc|l a|lic|liu|mar|nic|nt |nul|ris|t c|t p|tic|tid|u a|ucr| as| dr| fa| nu| pu| to|cra|dis|enţ|esc|gen|it |ivi|l d|n d|nd |nu |ond|pen|ral|riv|rte|sti|t d|ta |to |uni|xte|ând|îns|ă s| bl| st| uc|a b|a i|a l|air|ast|bla|bri|che|duc|dul|e m|eas|edi|esp|i l|i p|ica|ică|ir |iun|jud|lai|lul|mai|men|ni |pus|put|ra |rai|rop|sil|ti |tra|u s|ua |ude|urs|ân |înt|ţă | lu| mo| s | sa| sc|a u|an |atu",
    "ru": " на| пр|то | не|ли | по|но | в |на |ть |не | и | ко|ом |про| то|их | ка|ать|ото| за|ие |ова|тел|тор| де|ой |сти| от|ах |ми |стр| бе| во| ра|ая |ват|ей |ет |же |иче|ия |ов |сто| об|вер|го |и в|и п|и с|ии |ист|о в|ост|тра| те|ели|ере|кот|льн|ник|нти|о с|рор|ств|чес| бо| ве| да| ин| но| с | со| сп| ст| чт|али|ами|вид|дет|е н|ель|еск|ест|зал|и н|ива|кон|ого|одн|ожн|оль|ори|ров|ско|ся |тер|что| мо| са| эт|ант|все|ерр|есл|иде|ина|ино|иро|ите|ка |ко |кол|ком|ла |ния|о т|оло|ран|ред|сь |тив|тич|ых | ви| вс| го| ма| сл|ако|ани|аст|без|дел|е д|е п|ем |жно|и д|ика|каз|как|ки |нос|о н|опа|при|рро|ски|ти |тов|ые | вы| до| ме| ни| од| ро| св| чи|а н|ает|аза|ате|бес|в п|ва |е в|е м|е с|ез |ени|за |зна|ини|кам|ках|кто|лов|мер|мож|нал|ниц|ны |ным|ора|оро|от |пор|рав|рес|рис|рос|ска|т н|том|чит|шко| бы| о | тр| уж| чу| шк|а б|а в|а р|аби|ала|ало|аль|анн|ати|бин|вес|вно|во |вши|дал|дат|дно|е з|его|еле|енн|ент|ете|и о|или|ись|ит |ици|ков|лен|льк|мен|мы |нет|ни |нны|ног|ной|ном|о п|обн|ове|овн|оры|пер|по |пра|пре|раз|роп|ры |се |сли|сов|тре|тся|уро|цел|чно|ь в|ько|ьно|это|ют |я н| ан| ес| же| из| кт| ми| мы| пе| се| це|а м|а п|а т|авш|аже|ак |ал |але|ане|ачи|ают|бна|бол|бы |в и|в с|ван|гра|даж|ден|е к",
    "sk": " pr| po| ne| a |ch | na| je|ní |je | do|na |ova| v |to |ho |ou | to|ick|ter|že | st| za|ost|ých| se|pro| te|e s| že|a p| kt|pre| by| o |se |kon| př|a s|né |ně |sti|ako|ist|mu |ame|ent|ky |la |pod| ve| ob|om |vat| ko|sta|em |le |a v|by |e p|ko |eri|kte|sa |ého|e v|mer|tel| ak| sv| zá|hla|las|lo | ta|a n|ej |li |ne | sa|ak |ani|ate|ia |sou| so|ení|ie | re|ce |e n|ori|tic| vy|a t|ké |nos|o s|str|ti |uje| sp|lov|o p|oli|ová| ná|ale|den|e o|ku |val| am| ro| si|nie|pol|tra| al|ali|o v|tor| mo| ni|ci |o n|ím | le| pa| s |al |ati|ero|ove|rov|ván|ích| ja| z |cké|e z| od|byl|de |dob|nep|pra|ric|spo|tak| vš|a a|e t|lit|me |nej|no |nýc|o t|a j|e a|en |est|jí |mi |slo|stá|u v|for|nou|pos|pře|si |tom| vl|a z|ly |orm|ris|za |zák| k |at |cký|dno|dos|dy |jak|kov|ny |res|ror|sto|van| op|da |do |e j|hod|len|ný |o z|poz|pri|ran|u s| ab|aj |ast|it |kto|o o|oby|odo|u p|va |ání|í p|ým | in| mi|ať |dov|ka |nsk|áln| an| bu| sl| tr|e m|ech|edn|i n|kýc|níc|ov |pří|í a| aj| bo|a d|ide|o a|o d|och|pov|svo|é s| kd| vo| vý|bud|ich|il |ili|ni |ním|od |osl|ouh|rav|roz|st |stv|tu |u a|vál|y s|í s|í v| hl| li| me|a m|e b|h s|i p|i s|iti|lád|nem|nov|opo|uhl|eno|ens|men|nes|obo|te |ved|vlá|y n| ma| mu| vá|bez|byv|cho",
    "sl": "je | pr| po| je| v | za| na|pre|da | da|ki |ti |ja |ne | in|in |li |no |na |ni | bi|jo | ne|nje|e p|i p|pri|o p|red| do|anj|em |ih | bo| ki| iz| se| so|al | de|e v|i s|ko |bil|ira|ove| br| ob|e b|i n|ova|se |za |la | ja|ati|so |ter| ta|a s|del|e d| dr| od|a n|ar |jal|ji |rit| ka| ko| pa|a b|ani|e s|er |ili|lov|o v|tov| ir| ni| vo|a j|bi |bri|iti|let|o n|tan|še | le| te|eni|eri|ita|kat|por|pro|ali|ke |oli|ov |pra|ri |uar|ve | to|a i|a v|ako|arj|ate|di |do |ga |le |lo |mer|o s|oda|oro|pod| ma| mo| si|a p|bod|e n|ega|ju |ka |lje|rav|ta |a o|e t|e z|i d|i v|ila|lit|nih|odo|sti|to |var|ved|vol| la| no| vs|a d|agu|aja|dej|dnj|eda|gov|gua|jag|jem|kon|ku |nij|omo|oči|pov|rak|rja|sta|tev|a t|aj |ed |eja|ent|ev |i i|i o|ijo|ist|ost|ske|str| ra| s | tr| še|arn|bo |drž|i j|ilo|izv|jen|lja|nsk|o d|o i|om |ora|ovo|raz|rža|tak|va |ven|žav| me| če|ame|avi|e i|e o|eka|gre|i t|ija|il |ite|kra|lju|mor|nik|o t|obi|odn|ran|re |sto|stv|udi|v i|van| am| sp| st| tu| ve| že|ajo|ale|apo|dal|dru|e j|edn|ejo|elo|est|etj|eva|iji|ik |im |itv|mob|nap|nek|pol|pos|rat|ski|tič|tom|ton|tra|tud|tve|v b|vil|vse|čit| av| gr|a z|ans|ast|avt|dan|e m|eds|for|i z|kot|mi |nim|o b|o o|od |odl|oiz|ot |par|pot|rje|roi|tem|val",
    "so": "ka |ay |da | ay|aal|oo |aan| ka|an |in | in|ada|maa|aba| so|ali|bad|add|soo| na|aha|ku |ta | wa|yo |a s|oma|yaa| ba| ku| la| oo|iya|sha|a a|dda|nab|nta| da| ma|nka|uu |y i|aya|ha |raa| dh| qa|a k|ala|baa|doo|had|liy|oom| ha| sh|a d|a i|a n|aar|ee |ey |y k|ya | ee| iy|aa |aaq|gaa|lam| bu|a b|a m|ad |aga|ama|iyo|la |a c|a l|een|int|she|wax|yee| si| uu|a h|aas|alk|dha|gu |hee|ii |ira|mad|o a|o k|qay| ah| ca| wu|ank|ash|axa|eed|en |ga |haa|n a|n s|naa|nay|o d|taa|u b|uxu|wux|xuu| ci| do| ho| ta|a g|a u|ana|ayo|dhi|iin|lag|lin|lka|o i|san|u s|una|uun| ga| xa| xu|aab|abt|aq |aqa|ara|arl|caa|cir|eeg|eel|isa|kal|lah|ney|qaa|rla|sad|sii|u d|wad| ad| ar| di| jo| ra| sa| u | yi|a j|a q|aad|aat|aay|ah |ale|amk|ari|as |aye|bus|dal|ddu|dii|du |duu|ed |ege|gey|hay|hii|ida|ine|joo|laa|lay|mar|mee|n b|n d|n m|no |o b|o l|oog|oon|rga|sh |sid|u q|unk|ush|xa |y d| bi| gu| is| ke| lo| me| mu| qo| ug|a e|a o|a w|adi|ado|agu|al |ant|ark|asa|awi|bta|bul|d a|dag|dan|do |e s|gal|gay|guu|h e|hal|iga|ihi|iri|iye|ken|lad|lid|lsh|mag|mun|n h|n i|na |o n|o w|ood|oor|ora|qab|qor|rab|rit|rta|s o|sab|ska|to |u a|u h|u u|ud |ugu|uls|uud|waa|xus|y b|y q|y s|yad|yay|yih| aa| bo| br| go| ji| mi| of| ti| um| wi| xo|a x",
    "sq": "të | të|në |për| pë| e |sht| në| sh|se |et |ë s|ë t| se|he |jë |ër |dhe| pa|ë n|ë p| që| dh|një|ë m| nj|ësh|in | me|që | po|e n|e t|ish|më |së |me |htë| ka| si|e k|e p| i |anë|ar | nu|und|ve | ës|e s| më|nuk|par|uar|uk |jo |rë |ta |ë f|en |it |min|het|n e|ri |shq|ë d| do| nd|sh |ën |atë|hqi|ist|ë q| gj| ng| th|a n|do |end|imi|ndi|r t|rat|ë b|ëri| mu|art|ash|qip| ko|e m|edh|eri|je |ka |nga|si |te |ë k|ësi| ma| ti|eve|hje|ira|mun|on |po |re | pr|im |lit|o t|ur |ë e|ë v|ët | ku| së|e d|es |ga |iti|jet|ndë|oli|shi|tje| bë| z |gje|kan|shk|ënd|ës | de| kj| ru| vi|ara|gov|kjo|or |r p|rto|rug|tet|ugo|ali|arr|at |d t|ht |i p|ipë|izi|jnë|n n|ohe|shu|shë|t e|tik|a e|arë|etë|hum|nd |ndr|osh|ova|rim|tos|va | fa| fi|a s|hen|i n|mar|ndo|por|ris|sa |sis|tës|umë|viz|zit| di| mb|aj |ana|ata|dër|e a|esh|ime|jes|lar|n s|nte|pol|r n|ran|res|rrë|tar|ë a|ë i| at| jo| kë| re|a k|ai |akt|hë |hën|i i|i m|ia |men|nis|shm|str|t k|t n|t s|ë g|ërk|ëve| ai| ci| ed| ja| kr| qe| ta| ve|a p|cil|el |erë|gji|hte|i t|jen|jit|k d|mën|n t|nyr|ori|pas|ra |rie|rës|tor|uaj|yre|ëm |ëny| ar| du| ga| je|dës|e e|e z|ha |hme|ika|ini|ite|ith|koh|kra|ku |lim|lis|qën|rën|s s|t d|t t|tir|tën|ver|ë j| ba| in| tr| zg|a a|a m|a t|abr",
    "sr": " на| је| по|је | и | не| пр|га | св|ог |а с|их |на |кој|ога| у |а п|не |ни |ти | да|ом | ве| ср|и с|ско| об|а н|да |е н|но |ног|о ј|ој | за|ва |е с|и п|ма |ник|обр|ова| ко|а и|диј|е п|ка |ко |ког|ост|све|ств|сти|тра|еди|има|пок|пра|раз|те | бо| ви| са|аво|бра|гос|е и|ели|ени|за |ики|ио |пре|рав|рад|у с|ју |ња | би| до| ст|аст|бој|ебо|и н|им |ку |лан|неб|ово|ого|осл|ојш|пед|стр|час| го| кр| мо| чл|а м|а о|ако|ача|вел|вет|вог|еда|ист|ити|ије|око|сло|срб|чла| бе| ос| от| ре| се|а в|ан |бог|бро|вен|гра|е о|ика|ија|ких|ком|ли |ну |ота|ојн|под|рбс|ред|рој|са |сни|тач|тва|ја |ји | ка| ов| тр|а ј|ави|аз |ано|био|вик|во |гов|дни|е ч|его|и о|ива|иво|ик |ине|ини|ипе|кип|лик|ло |наш|нос|о т|од |оди|она|оји|поч|про|ра |рис|род|рст|се |спо|ста|тић|у д|у н|у о|чин|ша |јед|јни|ће | м | ме| ни| он| па| сл| те|а у|ава|аве|авн|ана|ао |ати|аци|ају|ања|бск|вор|вос|вск|дин|е у|едн|ези|ека|ено|ето|ења|жив|и г|и и|и к|и т|ику|ичк|ки |крс|ла |лав|лит|ме |мен|нац|о н|о п|о у|одн|оли|орн|осн|осп|оче|пск|реч|рпс|сво|ски|сла|срп|су |та |тав|тве|у б|јез|ћи | ен| жи| им| му| од| су| та| хр| ча| шт| ње|а д|а з|а к|а т|аду|ало|ани|асо|ван|вач|вањ|вед|ви |вно|вот|вој|ву |доб|дру|дсе|ду |е б|е д|е м|ем |ема|ент|енц",
    "ss": " ku| le|la |eku|a k|nga| ng|a n|nge|a l|lo | ne|eti|kwe|ndz|e n|o l| lo|ela|ema|ent|si | kw|tsi|i l|wa |lel|kut|e k|und|ni |elo|fun|esi| si|ele|tin|tfo| ti|le |kha|tse|e l|pha|ung|i k| em|ti |sa | um|isa|eli|ndl|ing|set|we |ise|na |ang|etf|khe|and|o n| we|nti|nye|tfu|ben|a e|uts|let|dza|imi|sek|ko |lok|eni|ye |ba |nkh|ebe|alo|o k|lan|ga |aba|seb| ye|he |lwa|kel| te| la|kus|wem|ati|ikh|nek|ala|kuf|i n|oku|ats|mts|hla|wen|a t| na|gek|uhl|kub|ngu|ka |aka|fut|kan|kwa| li|kuc|onk|ban|ana|ulu| se| im|akh|ume|a i|les|tim|ula|ini|lwe|za |fo |hul| no|han|li |iph|a s|tis|khu|ta |dzi|be |emi|ma |end|o t|eke|a u| ka|ane|lek|mel|elw|kun|sis|lon|utf|any|kho|kul|hlo| ba|ufu|aph|lun|e s|hal|ind|isw|o s|use|ekw|me |ndv|eng|uph|hat|ne |so |lul|nom|te |lol|awu|nel|lu |ha |wat|men|ete| lw|nem|ako|zin|kuh|sha|bha|gab| in|ale|mis|tem|e e|o e|e t|wek|dze|ome|wel| lu|emb|nis| ek|tsa|u l|o y|dle|ute|len|swa|phe|mkh|ntf|uke|sit|iny|e i|wo |ani|phi|wet|sin|nhl|mal|mba|mfu|fu |lab|sik|taw|no |hle|e u|eki|ase|ali|ulw|ve |eka|zel|nta|bon|tek|bo |sig|ama|ile|ule|tfw|mph|uma|kup|emt|asi|dlu|ish|umt|gen|o w|ike|iga|hak|abe|net|gan|kis|nde|ngi|ukh|bek|mo |phu|sel|elu|i t|ant|dvo|a y|vo |hum|lis|dla|gam|ive|jen|ket",
    "st": "ng |ho | le|le | ho| ts|a m|sa |la | ka|a h| di|ya |ka | ya|a t|eng|ets| ba| mo|a l| se|lo | bo|wa |tsa|a b|na |ba | e | a |a k| ma|ang|tse|se |o t|a d|a s|ha |so |o l|e h|o y|e t|tla|tsh|olo|e l|e m|o b|o e|seb|ebe|ela|thu|ele|e k|ana|e b| th| ha|tso|o a|o k| wa|kgo|tsw|tho|o h|ong| la|hut|dit|ane| me|a e| tl|ola|edi|elo|di |ona| ke|wan| o |a p|apa|tjh|hlo| sa|she|let|aba|lok|lao|eo |a a|o s|man|to | hl|a n|isa|e d|swe|set|pa | na|o m|g l|het| kg|got|aha|eth|re |e e|jha|phe|lan|otl|g k|lek|its|ekg|sen|ao |dis|g m|oth|e a|ith|hla|e s|ke |mol|pel|g h|hab|bet|san|ats|mo |lwa|we |ala|len|nts|dip|kap|iso| mm|uto|alo|e n|si |ta |o w|emo|swa|tsi|oke|bed|the| ph|a y|wen|ken|ena|hwa|ne |ore|atl|ano|hel|mot|bo |g t|i b|kga|hor|ngo|nan|no |o n|tlh|shw|kel|pha|etj|bon|ell|g s|gol|tha|ale|dik|kol|bak| nt|ika|o d| te|ohl|g y| lo|ti |his|ile|g b|oko| et|han|a o|mat|oho|odi|lel|mel|din|kar|o o|uo |mon|hah|te |me | it|o f|nen|heb|ing|bol|bel|hle|puo|lal|tlo|hal|oph|eba|hat|heo|aro|bat|ko |ban|leh|o i|ole|tle| fe|kge|pan|ake|g e|aka|eko| pe|rik|e y|mme|ama|lha|eha| fa|ebo|moh|mae|ete|aem|ots|ahi|o p|uta|okg|ntl|pal|get|i l|e f|oka|sep|lat|ahl|bot|ese|lah|lon|akg|a f| pu|ase|g a|mor|kan|nah|boh|e p",
    "sv": "en | de|et |er |tt |om |för|ar |de |att| fö|ing| in| at| i |det|ch |an |gen| an|t s|som|te | oc|ter| ha|lle|och| sk| so|ra |r a| me|var|nde|är | ko|on |ans|int|n s|na | en| fr| på| st| va|and|nte|på |ska|ta | vi|der|äll|örs| om|da |kri|ka |nst| ho|as |stä|r d|t f|upp| be|nge|r s|tal|täl|ör | av|ger|ill|ng |e s|ekt|ade|era|ers|har|ll |lld|rin|rna|säk|und|inn|lig|ns | ma| pr| up|age|av |iva|kti|lda|orn|son|ts |tta|äkr| sj| ti|avt|ber|els|eta|kol|men|n d|t k|vta|år |juk|man|n f|nin|r i|rsä|sju|sso| är|a s|ach|ag |bac|den|ett|fte|hor|nba|oll|rnb|ste|til| ef| si|a a|e h|ed |eft|ga |ig |it |ler|med|n i|nd |så |tiv| bl| et| fi| sä|at |des|e a|gar|get|lan|lss|ost|r b|r e|re |ret|sta|t i| ge| he| re|a f|all|bos|ets|lek|let|ner|nna|nne|r f|rit|s s|sen|sto|tor|vav|ygg| ka| så| tr| ut|ad |al |are|e o|gon|kom|n a|n h|nga|r h|ren|t d|tag|tar|tre|ätt| få| hä| se|a d|a i|a p|ale|ann|ara|byg|gt |han|igt|kan|la |n o|nom|nsk|omm|r k|r p|r v|s f|s k|t a|t p|ver| bo| br| ku| nå|a b|a e|del|ens|es |fin|ige|m s|n p|någ|or |r o|rbe|rs |rt |s a|s n|skr|t o|ten|tio|ven| al| ja| p | r | sa|a h|bet|cke|dra|e f|e i|eda|eno|erä|ess|ion|jag|m f|ne |nns|pro|r t|rar|riv|rät|t e|t t|ust|vad|öre| ar| by| kr| mi|arb",
    "sw": " wa|wa |a k|a m| ku| ya|a w|ya |ni | ma|ka |a u|na |za |ia | na|ika|ma |ali|a n| am|ili|kwa| kw|ini| ha|ame|ana|i n| za|a h|ema|i m|i y|kuw|la |o w|a y|ata|sem| la|ati|chi|i w|uwa|aki|li |eka|ira| nc|a s|iki|kat|nch| ka| ki|a b|aji|amb|ra |ri |rik|ada|mat|mba|mes|yo |zi |da |hi |i k|ja |kut|tek|wan| bi|a a|aka|ao |asi|cha|ese|eza|ke |moj|oja| hi|a z|end|ha |ji |mu |shi|wat| bw|ake|ara|bw |i h|imb|tik|wak|wal| hu| mi| mk| ni| ra| um|a l|ate|esh|ina|ish|kim|o k| ir|a i|ala|ani|aq |azi|hin|i a|idi|ima|ita|rai|raq|sha| ms| se|afr|ama|ano|ea |ele|fri|go |i i|ifa|iwa|iyo|kus|lia|lio|maj|mku|no |tan|uli|uta|wen| al|a j|aad|aid|ari|awa|ba |fa |nde|nge|nya|o y|u w|ua |umo|waz|ye | ut| vi|a d|a t|aif|di |ere|ing|kin|nda|o n|oa |tai|toa|usa|uto|was|yak|zo | ji| mw|a p|aia|amu|ang|bik|bo |del|e w|ene|eng|ich|iri|iti|ito|ki |kir|ko |kuu|mar|mbo|mil|ngi|ngo|o l|ong|si |ta |tak|u y|umu|usi|uu |wam| af| ba| li| si| zi|a v|ami|atu|awi|eri|fan|fur|ger|i z|isi|izo|lea|mbi|mwa|nye|o h|o m|oni|rez|saa|ser|sin|tat|tis|tu |uin|uki|ur |wi |yar| da| en| mp| ny| ta| ul| we|a c|a f|ais|apo|ayo|bar|dhi|e a|eke|eny|eon|hai|han|hiy|hur|i s|imw|kal|kwe|lak|lam|mak|msa|ne |ngu|ru |sal|swa|te |ti |uku|uma|una|uru",
    "tl": "ng |ang| na| sa|an |nan|sa |na | ma| ca|ay |n g| an|ong| ga|at | pa|ala| si|a n|ga |g n|g m|ito|g c|man|san|g s|ing|to |ila|ina| di| ta|aga|iya|aca|g t| at|aya|ama|lan|a a|qui|a c|a s|nag| ba|g i|tan|'t | cu|aua|g p| ni|os |'y |a m| n |la | la|o n|yan| ay|usa|cay|on |ya | it|al |apa|ata|t n|uan|aha|asa|pag| gu|g l|di |mag|aba|g a|ara|a p|in |ana|it |si |cus|g b|uin|a t|as |n n|hin| hi|a't|ali| bu|gan|uma|a d|agc|aqu|g d| tu|aon|ari|cas|i n|niy|pin|a i|gca|siy|a'y|yao|ag |ca |han|ili|pan|sin|ual|n s|nam| lu|can|dit|gui|y n|gal|hat|nal| is|bag|fra| fr| su|a l| co|ani| bi| da|alo|isa|ita|may|o s|sil|una| in| pi|l n|nil|o a|pat|sac|t s| ua|agu|ail|bin|dal|g h|ndi|oon|ua | ha|ind|ran|s n|tin|ulo|eng|g f|ini|lah|lo |rai|rin|ton|g u|inu|lon|o'y|t a| ar|a b|ad |bay|cal|gya|ile|mat|n a|pau|ra |tay|y m|ant|ban|i m|nas|nay|no |sti| ti|ags|g g|ta |uit|uno| ib| ya|a u|abi|ati|cap|ig |is |la'| do| pu|api|ayo|gos|gul|lal|tag|til|tun|y c|y s|yon|ano|bur|iba|isi|lam|nac|nat|ni |nto|od |pa |rgo|urg| m |adr|ast|cag|gay|gsi|i p|ino|len|lin|m g|mar|nah|to'| de|a h|cat|cau|con|iqu|lac|mab|min|og |par|sal| za|ao |doo|ipi|nod|nte|uha|ula| re|ill|lit|mac|nit|o't|or |ora|sum|y p| al| mi| um|aco|ada|agd|cab",
    "tlh": "tlh|e' |gh |i' | 'e|u' | vi|atl|a' | gh|ej | ho| ch| mu| tl|nga|mey|wi'|be'|an |ch |gan|chu|lh |ing|'e'|hin|jat|lhi| da| ja|o' |ugh|aq |cha| po|ey | 'a| je|'ej| pa|ng |ad | qa|oh |eh |ah |gha|je | lu|hol|aw'| ji|ong|pu'|aj |vad|w' |' j|ha'|is |tah|' '|ang|h '|pon|am |law|mo'|qu'|hbe|ol |vam|agh|mu'|ahv|bej|ogh|uch|' v|ach|hug| lo| qu|cho|hva|ij | la|lu'|vis| ne| pu| so| ta| va|'ac|di'|hu'|lah|moh| 'o|' m|daq|hah|n h|neh|u'm|ay'|gho|h v|meh|oy | ma| nu|'me|el | ba| be| de| ng|' t|h d|hvi|oq | wa|' l|'wi|hme|li'|uq | bo|bog|del|h p|h t|ich|vil| qe| wi|ahb|ban|eng|haq|hoh|ov |viq| ha| ti|' n|' p|'a'|hwi|igh|lo'|y' | du| no| yu|'mo|'va|daj|das|egh|hom|muc|om |otl|us | bi| tu|' h|chm|h q|hov|nis|qar|uj |' q|'ch|h m|hmo|jih|par|wij| hu|' d|'a |etl|h g|h j|h l|lod|maq|och|wa'|yuq| di| le| pe| ya|'di|che|ech|ih |ija|in |j '|j m|lhw|pa'| 'i| mi| qi| ro| ru|'be|anp|ghi|ghu|h b|hay|hch|iq |npu|od |paq|qay|rda|soh| do| me| qo| sa|' c|' g|' s|'lu|aml|ard|as |d p|gme|h n|hta|i'v|j j|jij|len|ngm|qan|qme|vaj|wiv| mo| ni|'la|'pu|'qu|ar |arm|dwi|g p|ghd|h c|ham|hla|hqu|ilo|iqa|iqi|j p|j t|j v|lad|lho|mar|mug|pus|q s|q t|rgh|rma|sov|ta'|tin|tu'|u'd|vet|yli|yu'| to|'oh|aqq|art|at |ayl|ayt|et |haj|har",
    "tn": " di| le|go |le | go|ng | ts|ya | ya|sa |tlh| mo| bo|a m|lo |tsa| e |o t|a b|wa | ka|a k|a t|ka |a g|eng|olo|o y|la | a |a d|ets|mo |se | tl| ba|tsh| ma|ba |a l|tse|so |na |elo| se|ele|e d|o l|lho|e t|di |e g| kg|dit|kgo|o k|ang|lha|e m|e e|we |ane|o m|e k|e l|ong|set|wan|ela|tso|tla|o d|e b|ola|ngw|gwe|o b|aba|atl|a p| o |a a|o a|otl|a s|o e|dir|thu|ga | ga|shw|ots|aka|hab|hwa|aga|o g|gan|tsw|ana|mol| ke|hut| me|ona|lel|its|lao|kga|dik|got| fa|let| wa|ose|no |t h|swe|edi|ats|a n|e s|oko|oth|kwa|kar| th|a e|ala|tir|o n|dip|isa|gat|ti |ano|bot| nn| ha|len|alo|any|aro|iti|iri|o s|sen|net|ke |ho |mai|ika|eka|to |ith|re |g m|hat|bo |g l|et |emo|ama|iso|rol|fa |iwa|kan|she|si |ao |g k|wen|lol|o o|bos|itl|a y|the|lwa|e n| la|ore| mm|ko |tha|e a|eo |lhe|bol|ha | po|isi|i b|lan| na|i t|ale|ne |gon|ris|ira|bon| sa|g y|g g|pha|oga|mel|ro |gol|o w| kw|i l| ti|tlo|log|por| ja|a f| ne|hok|lot| pu|e y|uto|g t|hom|okg| ko|o f|ame|gor|ta | pe|nts| kh|tho|gel|adi|are|ete|ase|mon|heo|oro|omo|nen|nel|ile|nng|ntl|abo|ogo|ara|nse|ego|hel|uo |mog|san|ula|rag|kol|te |etl|bat| te|puo|amo|ofe|lat|ati|ole|rab|tsi|iro|man|ael|ega|lwe|ra |din|tle|sek|ing|yo |a o| re|aot|uso|o r|ere|jwa|aem|lam|lek| jw|gwa|mok",
    "tr": "lar|en |ler|an |in | bi| ya|eri|de | ka|ir |arı| ba| de| ha|ın |ara|bir| ve| sa|ile|le |nde|da | bu|ana|ini|ını|er |ve | yı|lma|yıl| ol|ar |n b|nda|aya|li |ası| ge|ind|n k|esi|lan|nla|ak |anı|eni|ni |nı |rın|san| ko| ye|maz|baş|ili|rin|alı|az |hal|ınd| da| gü|ele|ılm|ığı|eki|gün|i b|içi|den|kar|si | il|e y|na |yor|ek |n s| iç|bu |e b|im |ki |len|ri |sın| so|ün | ta|nin|iği|tan|yan| si|nat|nın|kan|rı |çin|ğı |eli|n a|ır | an|ine|n y|ola| ar|al |e s|lik|n d|sin| al| dü|anl|ne |ya |ım |ına| be|ada|ala|ama|ilm|or |sı |yen| me|atı|di |eti|ken|la |lı |oru| gö| in|and|e d|men|un |öne|a d|at |e a|e g|yar| ku|ayı|dan|edi|iri|ünü|ği |ılı|eme|eği|i k|i y|ıla| ça|a y|alk|dı |ede|el |ndı|ra |üne| sü|dır|e k|ere|ik |imi|işi|mas|n h|sür|yle| ad| fi| gi| se|a k|arl|aşı|iyo|kla|lığ|nem|ney|rme|ste|tı |unl|ver| sı| te| to|a s|aşk|ekl|end|kal|liğ|min|tır|ulu|unu|yap|ye |ı i|şka|ştı| bü| ke| ki|ard|art|aşa|n i|ndi|ti |top|ı b| va| ön|aki|cak|ey |fil|isi|kle|kur|man|nce|nle|nun|rak|ık | en| yo|a g|lis|mak|n g|tir|yas| iş| yö|ale|bil|bul|et |i d|iye|kil|ma |n e|n t|nu |olu|rla|te |yön|çık| ay| mü| ço| çı|a a|a b|ata|der|gel|i g|i i|ill|ist|ldı|lu |mek|mle|n ç|onu|opl|ran|rat|rdı|rke|siy|son|ta |tçı|tın",
    "ts": " ku|ku |na |ka |wa |a n| sw|a m|ya |a k| ti|swi|hi |la | ya| le| hi|a t|a v| va|ni | na|ndz| ma|a h| xi|a s|i n|ele|i k|ana|a l|nga|lo |va |le |aka|ela|irh|eka| vu|iwa|a x| ka|yi | wa|isa|sa |ko |ta |ga |wu |wi |tir| ek| mi| ni|o y|elo|awu|isi|swa|i t|hla|a e| ta| ng| la|a y|ri |eri| ri|rhi|eke|umb|u t|ndl| yi|lan|i v|esw|mbe|i l|a r|e k|ang|les|ula|ti |yon|o w|ona|law|xa |nel|yo |lel|iko| lo|amb| a |i y| xa|ane|wan|i s|ond|fan|end|i h|o l|u k|mbi|n'w|ke |dyo| fa|lam|nhl|o s|ong|no | ko|u n| ha|ho |oko|u h|i m|o n| yo|ngu|o k|u y|ati|u l|van|ulu|and|mba|kum|u v|wo |be |ha |riw|dza|si | en|o h| hl|o t|eyi| nt|ila|lok|dzi|nge| mu|ala|to |a w| by|arh|aku|tsa|wak|rho|'wa| nd|min|lav|tim|ley|tik|dle|tin|mat|ler|let|sel|his|mel|lu |ika|a a|ngo|eng|o x| nk|amu|siw|ani|eni|ma | nh|mi |swo|eti|tan|mo |ham|iwe| kh|han|lek|nti|ung|hak|dzo|ete| ts|ava|hu |fum|kar|vul| wu|kul|und|i x|nhu|yis|xik|bis|xi |e y|ra |hle| hu|wek|ano|yen|a d|sis|olo|pfu|i w|nyi|e n|so |ki |fun|iso|tsh|kon|nku|hel|i b|e h|ari|imi|i e|ind|vum|nts|ime|kom|mfu|ise| mf|hin|dla|vut|gan|i r|ban|bya|mil|int|ats| dy|u s|e x|ile|kel|kwa| no|i f|asi|za |uri|o m|rha|e l|in'|eta|von|i a|kho| wo|iki| ra|u e|o e|zo |yin|ink|any|ket",
    "uk": " на| за|ння|ня |на | пр|ого|го |ськ| по| у |від|ере| мі| не|их |ть |пер| ві|ів | пе| що|льн|ми |ні |не |ти |ати|енн|міс|пра|ува|ник|про|рав|івн| та|буд|влі|рів| ко| рі|аль|но |ому|що | ви|му |рев|ся |інн| до| уп|авл|анн|ком|ли |лін|ног|упр| бу| з | ро|за |и н|нов|оро|ост|ста|ті |ють| мо| ні| як|бор|ва |ван|ень|и п|нь |ові|рон|сті|та |у в|ько|іст| в | ре|до |е п|заб|ий |нсь|о в|о п|при|і п| ку| пі| сп|а п|або|анс|аці|ват|вни|и в|ими|ка |нен|ніч|она|ої |пов|ьки|ьно|ізн|ічн| ав| ма| ор| су| чи| ін|а з|ам |ає |вне|вто|дом|ент|жит|зни|им |итл|ла |них|ниц|ова|ови|ом |пор|тьс|у р|ься|ідо|іль|ісь| ва| ді| жи| че| і |а в|а н|али|вез|вно|еве|езе|зен|ицт|ки |ких|кон|ку |лас|ля |мож|нач|ним|ної|о б|ову|оди|ою |ро |рок|сно|спо|так|тва|ту |у п|цтв|ьни|я з|і м|ії | вс| гр| де| но| па| се| ук| їх|а о|авт|аст|ают|вар|ден|ди |ду |зна|и з|ико|ися|ити|ког|мен|ном|ну |о н|о с|обу|ово|пла|ран|рив|роб|ска|тан|тим|тис|то |тра|удо|чин|чни|і в|ію | а | во| да| кв| ме| об| ск| ти| фі| є |а р|а с|а у|ак |ані|арт|асн|в у|вик|віз|дов|дпо|дів|еві|енс|же |и м|и с|ика|ичн|кі |ків|між|нан|нос|о у|обл|одн|ок |оло|отр|рен|рим|роз|сь |сі |тла|тів|у з|уго|уді|чи |ше |я н|я у|ідп|ій |іна|ія | ка| ни| ос| си| то| тр| уг",
    "ur": "یں | کی|کے | کے|نے | کہ|ے ک|کی |میں| می|ہے |وں |کہ | ہے|ان |ہیں|ور | کو|یا | ان| نے|سے | سے| کر|ستا| او|اور|تان|ر ک|ی ک| اس|ے ا| پا| ہو| پر|رف | کا|ا ک|ی ا| ہی|در |کو | ای|ں ک| مش| مل|ات |صدر|اکس|شرف|مشر|پاک|کست|ی م| دی| صد| یہ|ا ہ|ن ک|وال|یہ |ے و| بھ| دو|اس |ر ا|نہی|کا |ے س|ئی |ہ ا|یت |ے ہ|ت ک| سا|لے |ہا |ے ب| وا|ار |نی |کہا|ی ہ|ے م| سی| لی|انہ|انی|ر م|ر پ|ریت|ن م|ھا |یر | جا| جن|ئے |پر |ں ن|ہ ک|ی و|ے د| تو| تھ| گی|ایک|ل ک|نا |کر |ں م|یک | با|ا ت|دی |ن س|کیا|یوں|ے ج|ال |تو |ں ا|ے پ| چا|ام |بھی|تی |تے |دوس|س ک|ملک|ن ا|ہور|یے | مو| وک|ائی|ارت|الے|بھا|ردی|ری |وہ |ویز|ں د|ھی |ی س| رہ| من| نہ| ور| وہ| ہن|ا ا|است|ت ا|ت پ|د ک|ز م|ند |ورد|وکل|گی |گیا|ہ پ|یز |ے ت| اع| اپ| جس| جم| جو| سر|اپن|اکث|تھا|ثری|دیا|ر د|رت |روی|سی |ملا|ندو|وست|پرو|چاہ|کثر|کلا|ہ ہ|ہند|ہو |ے ل| اک| دا| سن| وز| پی|ا چ|اء |اتھ|اقا|اہ |تھ |دو |ر ب|روا|رے |سات|ف ک|قات|لا |لاء|م م|م ک|من |نوں|و ا|کرن|ں ہ|ھار|ہوئ|ہی |یش | ام| لا| مس| پو| پہ|انے|ت م|ت ہ|ج ک|دون|زیر|س س|ش ک|ف ن|ل ہ|لاق|لی |وری|وزی|ونو|کھن|گا |ں س|ں گ|ھنے|ھے |ہ ب|ہ ج|ہر |ی آ|ی پ| حا| وف| گا|ا ج|ا گ|اد |ادی|اعظ|اہت|جس |جمہ|جو |ر س|ر ہ|رنے|س م|سا |سند|سنگ|ظم |عظم|ل م|لیے|مل |موہ|مہو|نگھ|و ص|ورٹ|وہن|کن |گھ |گے |ں ج|ں و|ں ی|ہ د|ہن |ہوں|ے ح|ے گ|ے ی| اگ| بع| رو| شا",
    "uz": "ан |ган|лар|га |нг |инг|нин|да |ни |ида|ари|ига|ини|ар |ди | би|ани| бо|дан|лга| ҳа| ва| са|ги |ила|н б|и б| кў| та|ир | ма|ага|ала|бир|ри |тга|лан|лик|а к|аги|ати|та |ади|даг|рга| йи| ми| па| бў| қа| қи|а б|илл|ли |аси|и т|ик |или|лла|ард|вчи|ва |иб |ири|лиг|нга|ран| ке| ўз|а с|ахт|бўл|иги|кўр|рда|рни|са | бе| бу| да| жа|а т|ази|ери|и а|илг|йил|ман|пах|рид|ти |увч|хта| не| со| уч|айт|лли|тла| ай| фр| эт| ҳо|а қ|али|аро|бер|бил|бор|ими|ист|он |рин|тер|тил|ун |фра|қил| ба| ол|анс|ефт|зир|кат|мил|неф|саг|чи |ўра| на| те| эн|а э|ам |арн|ат |иш |ма |нла|рли|чил|шга| иш| му| ўқ|ара|ваз|и у|иқ |моқ|рим|учу|чун|ши |энг|қув|ҳам| сў| ши|бар|бек|дам|и ҳ|иши|лад|оли|олл|ори|оқд|р б|ра |рла|уни|фт |ўлг|ўқу| де| ка| қў|а ў|аба|амм|атл|б к|бош|збе|и в|им |ин |ишл|лаб|лей|мин|н д|нда|оқ |р м|рил|сид|тал|тан|тид|тон|ўзб| ам| ки|а ҳ|анг|анд|арт|аёт|дир|ент|и д|и м|и о|и э|иро|йти|нсу|оди|ор |си |тиш|тоб|эти|қар|қда| бл| ге| до| ду| но| пр| ра| фо| қо|а м|а о|айд|ало|ама|бле|г н|дол|ейр|ек |ерг|жар|зид|и к|и ф|ий |ило|лди|либ|лин|ми |мма|н в|н к|н ў|н ҳ|ози|ора|оси|рас|риш|рка|роқ|сто|тин|хат|шир| ав| рў| ту| ўт|а п|авт|ада|аза|анл|б б|бой|бу |вто|г э|гин|дар|ден|дун|иде|ион|ирл|ишг|йха|кел|кўп|лио",
    "ve": "ha | vh|a m|na | u |a n|tsh|wa |a u| na|nga|vha| ts| dz| kh|dza|a v|ya | ya|a t|ho |la | zw| mu|edz|vhu|ga |shi|za |a k| ng|kha| ma|hum|ne | nd|o n|lo |dzi|shu| ha|a d|o y|nda|ele|zwi|aho|ang|no | a |ela|a z|hu |sha|i n| wa|ana|hi |kan|o d|ano|a h|zwa| th| mi|gan|a l|sa |han|di |u t|and|ndi|yo |the|do |ri |vho|ni |ka |uri|si |o t|mbe|o w|ane|we |zo |i t|e n|i h|she|ush|o k|zi |da |a a|thu| la|a p|zan| i |a s|lwa|ula|i d|aka| do|mis|hed|ita|li | hu|iwa| lu|i v|he | ka|elo|so |amb|avh| sh|o v|i k|lel|u v|dzo|u s| fh|mo |nwe|o l|umi|wah|isi|hel|a i|vel|adz|tan|i m|ath|thi|wi | ur|hat|ine|le |vhe|any|a y|hon|isa|ala|o a|alu|udi|umb| bv|ash| te| li|lus|nya|has|led|swa|hus|o i|umo|one|nde|tha| it|kho|ngo|mus|hak|e y|ea |ivh|o m|u n|hin|tho|mut|ayo|fhi| sa|tel|hul|hun|ulo|ith|ma | yo|lan|e v| ph|go |i a|o u|hud| pf|uka|zhi|uvh|dzw|ing|elw|ila|wo |mbo|u d|ite|isw|asi|e k|ndu|fhe|o h|mel|u b|ika|bo |gud|dzh|kon|ifh| ta|e d|uth| ho|i z|wan|ulu|mad|inw|oth|ani|dis|wit|ou |bve|ets|u i|adi|e m|fha|nah|dal|win| si|sho| in|yam|lay|eka|a f|i u|end|i y|alo|i l|uso|mul|ta |del|u k| mb|pha| di|dad|ali|o s|pfu|khw|e a| ko| ne|hen|mas|ume|ini|ish|udz|ira|oni|luk|nel|iso|mba|dzu|hom|i s|zwo|ngu|ara|unz",
    "vi": "ng | th| ch|g t| nh|ông| kh| tr|nh | cô|côn| ty|ty |i t|n t| ng|ại | ti|ch |y l|ền | đư|hi | gở|gởi|iền|tiề|ởi | gi| le| vi|cho|ho |khá| và|hác| ph|am |hàn|ách|ôi |i n|ược|ợc | tô|chú|iệt|tôi|ên |úng|ệt | có|c t|có |hún|việ|đượ| na|g c|i c|n c|n n|t n|và |n l|n đ|àng|ác |ất |h l|nam|ân |ăm | hà| là| nă| qu| tạ|g m|năm|tại|ới | lẹ|ay |e g|h h|i v|i đ|le |lẹ |ều |ời |hân|nhi|t t| củ| mộ| về| đi|an |của|là |một|về |ành|ết |ột |ủa | bi| cá|a c|anh|các|h c|iều|m t|ện | ho|'s |ave|e's|el |g n|le'|n v|o c|rav|s t|thi|tra|vel|ận |ến | ba| cu| sa| đó| đế|c c|chu|hiề|huy|khi|nhâ|như|ong|ron|thu|thư|tro|y c|ày |đến|ười|ườn|ề v|ờng| vớ|cuộ|g đ|iết|iện|ngà|o t|u c|uộc|với|à c|ài |ơng|ươn|ải |ộc |ức | an| lậ| ra| sẽ| số| tổ|a k|biế|c n|c đ|chứ|g v|gia|gày|hán|hôn|hư |hức|i g|i h|i k|i p|iên|khô|lập|n k|ra |rên|sẽ |t c|thà|trê|tổ |u n|y t|ình|ấy |ập |ổ c| má| để|ai |c s|gườ|h v|hoa|hoạ|inh|m n|máy|n g|ngư|nhậ|o n|oa |oàn|p c|số |t đ|y v|ào |áy |ăn |đó |để |ước|ần |ển |ớc | bá| cơ| cả| cầ| họ| kỳ| li| mạ| sở| tặ| vé| vụ| đạ|a đ|bay|cơ |g s|han|hươ|i s|kỳ |m c|n m|n p|o b|oại|qua|sở |tha|thá|tặn|vào|vé |vụ |y b|àn |áng|ơ s|ầu |ật |ặng|ọc |ở t|ững| du| lu| ta| to| từ| ở |a v|ao |c v|cả |du |g l|giả",
    "xh": "la | ku|lo |nga|a k| ng|oku| kw| uk|a n|uku|ye |a i|yo |ela|ele|a u|nye|we |wa |ama|e n|ise|aba|ba |ho |enz|o n|ngo|kub|nge|ath|fun|o e|lel|ung|uba|ko |elo|ezi|o k|the|kwa|na |kwe|ang|e i|le |ka |esi|o y| na|e k|eth|pha| in|kun|nzi|and|ni |ban| ye| no|lwa|lun| ok|any|zi |li | ne|ulu|a e|eli|gok|o l|ebe|und|isa|seb|ndo| ez|tho|o i|do |ben|ing|kwi|ndl|uny|ala|a a|eyo|e u|kan| ab|thi|i k|i n|o u|o z|elw|sa |sek|ayo|het|o o|eka| um|hi |bo |so |isi|wen|lwe|aph|a l|ya |eko|ana| yo|kuf|ini|imi|ali|ha |awu|wan|ent|uth|tha|za |ula|kho| ii|ane|e a|iso|uph| le|ile|zin|nts| si|eng|nok|ong|hla|zwe| el|oka|eki|lis|azi| lo|tsh| am|ufu|ant|isw|o a|ngu|o s| ba|int|eni|une|wul|hul|sel|i e|use|lan|ke |nis|emi| li| is|iph| im|a o|aka|mfu| zi|ink|mal|ley|man|nya|nek|akh|ume| ko|alo|tu |i u|ntu|izw|kel|izi|i i|si |gan|ase|ind|i a|ndi|nel|alu|sis|ubo|kut|mth|kus|lek|mis|nde| zo| we|ani|ga |iko|siz|no |phu|e e|hon|ond|ne |ith|kul|gam|gen|pho| iz|phe|hat|khu|iin|han|zo |lu |ulo|nda|qo |zik|hel|o m| lw|zis|dle|uhl|men|olo|mel|del|nza|oko|okw|olu|kuk|nte|swa|law|enk| ya|i y|gaq|sha|aqo|e l|ikh|nkq|ule| ka|onk|thu|wo |bon|kup|qub|a y|kqu|dla| es|he |ano|lum|be |iga| ze|o w|aku|mga|nke|te | ol|ze |kum|emf|esh",
    "zu": "oku|la |nga| ng|a n| ku|a k|thi| uk|ezi|e n|uku|le |lo |hi |wa | no|a u|ela|we |a i|ni |ele|zin|uth|ama|elo|pha|ing|aba|ath|and|enz|eth|esi|ma |lel| um| ka|the|ung|nge|ngo|tho|nye|kwe|eni|izi|ye | kw|ndl|ho |a e|na |zi |het|kan|e u|e i|und|ise|isi|nda|kha|ba |i k|nom|fun| ez| iz|ke |ben|o e|isa|zwe|kel|ka |aka|nzi|o n|e k|oma|kwa| ne|any|ang|hla|i u|mth|kub|o k|ana|ane|ikh|ebe|kut|ha | is|azi|ulu|seb|ala|onk|ban|i e|azw|wen| ab|han|a a|i n|imi|lan|hat|lwa| na|ini|akh|li |ngu|nke|nok|ume|eke|elw|yo |aph|kus| es| ok|iph| im|mel|i i| lo| in| am|kho|za |gok|sek|lun|kun|lwe|sha|sik|kuf|hak|a y|thu|sa |o u|khu|ayo|hul|e a|ali|eng|lu |ne | ko|eli|uba|dle|e e|ith| yo|a l|nel|mis| si|kul|a o|sis|lok|gen|o z|i a|emi|uma|eka|alo|man|isw|tha|o i|lon|so |uph|uhl|ntu|zim|mal|ind|wez| ba|o o| yi| we|ula|phe|o y|ile|o l|wo |wel|ga |tu |hle|okw|fan| le|kaz|ase|ani|nde|bo |ngi|ule| em|men|iny|amb|mbi|gan|ifu|o s|ant|hel|ika|ona|i l|fut| fu|ze |u a|nhl|nin| zo|end|sig|u k|gab|ufa|ish|ush|kuz|no |gam|kuh| ye|nya|nez|zis|dlu|kat|dla|tsh| se|ike|kuq|gu |osi|swa|lul| zi|ima|e l|kup|mo |nza|asi|ko |kum|lek|she|umt|uny|yok|wan|wam|ame|ong|lis|mkh|ahl|ale|use|o a|alu|gap|si |hlo|nje|omt|o w|okh|he |kom|i s"
});

require.register("wooorm~retext-visit@0.1.1", function (exports, module) {
'use strict';

/**
 * Define `plugin`.
 */

function plugin() {}

/**
 * Invoke `callback` for every descendant of the
 * operated on context.
 *
 * @param {function(Node): boolean?} callback - Visitor.
 *   Stops visiting when the return value is `false`.
 * @this {Node} Context to search in.
 */

function visit(callback) {
    var node,
        next;

    node = this.head;

    while (node) {
        /**
         * Allow for removal of the node by `callback`.
         */

        next = node.next;

        if (callback(node) === false) {
            return;
        }

        /**
         * If possible, invoke the node's own `visit`
         *  method, otherwise call retext-visit's
         * `visit` method.
         */

        (node.visit || visit).call(node, callback);

        node = next;
    }
}

/**
 * Invoke `callback` for every descendant with a given
 * `type` in the operated on context.
 *
 * @param {string} type - Type of a node.
 * @param {function(Node): boolean?} callback - Visitor.
 *   Stops visiting when the return value is `false`.
 * @this {Node} Context to search in.
 */

function visitType(type, callback) {
    /**
     * A wrapper for `callback` to check it the node's
     * type property matches `type`.
     *
     * @param {node} type - Descendant.
     * @return {*} Passes `callback`s return value
     *   through.
     */

    function wrapper(node) {
        if (node.type === type) {
            return callback(node);
        }
    }

    this.visit(wrapper);
}

function attach(retext) {
    var TextOM,
        parentPrototype,
        elementPrototype;

    TextOM = retext.TextOM;
    parentPrototype = TextOM.Parent.prototype;
    elementPrototype = TextOM.Element.prototype;

    /**
     * Expose `visit` and `visitType` on Parents.
     *
     * Due to multiple inheritance of Elements (Parent
     * and Child), these methods are explicitly added.
     */

    elementPrototype.visit = parentPrototype.visit = visit;
    elementPrototype.visitType = parentPrototype.visitType = visitType;
}

/**
 * Expose `attach`.
 */

plugin.attach = attach;

/**
 * Expose `plugin`.
 */

exports = module.exports = plugin;

});

require.register("wooorm~retext-language@0.1.2", function (exports, module) {
'use strict';

/**
 * Dependencies.
 */

var franc,
    visit;

franc = require("wooorm~franc@0.1.1");
visit = require("wooorm~retext-visit@0.1.1");

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
        tuple,
        index;

    if (!parent) {
        return;
    }

    dictionary = {};

    node = parent.head;

    while (node) {
        languages = node.data.languages;

        if (languages) {
            index = languages.length;

            while (index--) {
                tuple = languages[index];

                if (tuple[0] in dictionary) {
                    dictionary[tuple[0]] += tuple[1];
                } else {
                    dictionary[tuple[0]] = tuple[1];
                }
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
    tree.visitType(tree.PARAGRAPH_NODE, onchangeinparent);
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

});

require.register("raynos~date-now@v1.0.1", function (exports, module) {
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

});

require.register("component~debounce@1.0.0", function (exports, module) {

/**
 * Module dependencies.
 */

var now = require("raynos~date-now@v1.0.1");

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

});

require.register("retext-language-gh-pages/fixtures.js", function (exports, module) {
var fixtureMap = {
    "af": "Alle menslike wesens word vry, met gelyke waardigheid en regte, gebore. Hulle het rede en gewete en behoort in die gees van broederskap teenoor mekaar op te tree.",
    "ar": "يولد جميع الناس أحراراً متساوين في الكرامة والحقوق. وقد وهبوا عقلاً وضميراً وعليهم ان يعامل بعضهم بعضاً بروح اﻹخاء.",
    "az": "Bütün insanlar ləyaqət və hüquqlarına görə azad bərabər doğulurlar. Onarın şüuralrı və vicdanları var və bir-birlərinə münasibətdə qardaşlıq runhunda davranmalıdırlar.",
    "bg": "Всички хора се раждат свободни и равни по достойнство и права. Tе са надарени с разум и съвест и следва да се отнасят помежду си в дух на братство.",
    "bn": "সমস্ত মানুষ স্বাধীনভাবে সমান মর্যাদা এবং অধিকার নিয়ে জন্মগ্রহণ করে | তাঁদের বিবেক এবং বুদ্ধি আছে সুতরাং সকলেরই একে অপরের প্রতি ভ্রাতৃত্বসুলভ মনোভাব নিয়ে আচরণ করা উচিত্ |",
    "bo": "སྐྱེ་བོ་རེ་རེར་གསལ་བསྒྲགས་འདི་ནང་བཀོད་པའི་ཐོབ་ཐང་དང་རང་དབང་སྟེ། མི་རིགས་དང། ཥ་མདོག། ཕོ་མོ། སྐད་ཡིག། ཆོས་ལུགས། སྲིད་དོན་བཅས་སམ། འདོད་ཚུལ་གཞན་དག་དང་། རྒྱལ་ཁབ་དང་སྤྱི་ཚོགས་ཀྱི་འབྱུང་ཁུངས་། མཁར་དབང་། རིགས་རྒྱུད། དེ་མིན་གནས་ཚུལ་འདི་རིགས་གང་ཡང་རུང་བར་དབྱེ་འབྱེད་མེད་པའི་ཐོབ་དབང་ཡོད།།",
    "ca": "Tots els éssers humans neixen lliures i iguals en dignitat i en drets. Són dotats de raó i de consciència, i han de comportar-se fraternalment els uns amb els altres.",
    "ceb": "Ang tanan katawhan gipakatawo nga may kagawasan ug managsama sa kaligdong. Sila gigasahan pangisip ug tanlag ug mag-ilhanay usa'g usa sa diwa managsoon",
    "cs": "Francouzský ministr financí zmírnil výhrady vůči nízkým firemním daním v nových členských státech EU.",
    "cy": "Genir pawb yn rhydd ac yn gydradd â'i gilydd mewn urddas a hawliau. Fe'u cynysgaeddir â rheswm a chydwybod, a dylai pawb ymddwyn y naill at y llall mewn ysbryd cymodlon.",
    "da": "Alle mennesker er født frie og lige i værdighed og rettigheder. De er udstyret med fornuft og samvittighed, og de bør handle mod hverandre i en broderskabets ånd.",
    "de": "Alle Menschen sind frei und gleich an Würde und Rechten geboren. Sie sind mit Vernunft und Gewissen begabt und sollen einander im Geist der Brüderlichkeit begegnen.",
    "el": "'Ολοι οι άνθρωποι γεννιούνται ελεύθεροι και ίσοι στην αξιοπρέπεια και τα δικαιώματα. Είναι προικισμένοι με λογική και συνείδηση, και οφείλουν να συμπεριφέρονται μεταξύ τους με πνεύμα αδελφοσύνης.",
    "en": "All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.",
    "es": "Todos los seres humanos nacen libres e iguales en dignidad y derechos y, dotados como están de razón y conciencia, deben comportarse fraternalmente los unos con los otros.",
    "et": "Kõik inimesed sünnivad vabadena ja võrdsetena oma väärikuselt ja õigustelt. Neile on antud mõistus ja südametunnistus ja nende suhtumist üksteisesse peab kandma vendluse vaim.",
    "eu": "Gizon-emakume guztiak aske jaiotzen dira, duintasun eta eskubide berberak dituztela; eta ezaguera eta kontzientzia dutenez gero, elkarren artean senide legez jokatu beharra dute.",
    "fa": "تمام افراد بشر آزاد به دنیا می آیند و از لحاظ حیثیت و حقوق با هم برابرند, همه دارای عقل و وجدان می باشند و باید نسبت به یک دیگر با روح برادری رفتار کنند.",
    "fi": "Kaikki ihmiset syntyvät vapaina ja tasavertaisina arvoltaan ja oikeuksiltaan. Heille on annettu järki ja omatunto, ja heidän on toimittava toisiaan kohtaan veljeyden hengessä.",
    "fr": "Tous les êtres humains naissent libres et égaux en dignité et en droits. Ils sont doués de raison et de conscience et doivent agir les uns envers les autres dans un esprit de fraternité.",
    "gu": "પ્રતિષ્ઠા અને અધિકારોની દૃષ્ટિએ સર્વ માનવો જન્મથી સવતંત્ર અને સમાન હોય છે.\nતેમનામાં વિચારશકતિ અને અંતઃકરણ હોય છે અને તેમણે પરસ્પર બંધુત્વની ભાવનાથી વર્તવું જોઇએ.",
    "ha": "Su dai yan-adam, ana haifuwarsu ne duka yantattu, kuma kowannensu na da mutunci da hakkoki daidai da na kowa. Suna da hankali da tunani, saboda haka duk abin da za su aikata wa juna, ya kamata su yi shi a cikin yan-uwanci.",
    "haw": "Hānau kū'oko'a 'ia nā kānaka apau loa, a ua kau like ka hanohano a me nā pono kīvila ma luna o kākou pākahi. Ua ku'u mai ka no'ono'o pono a me ka 'ike pono ma luna o kākou, no laila, e aloha kākou kekahi i kekahi.",
    "he": "כל בני האדם נולדו בני חורין ושווים בערכם ובזכויותיהם. כולם חוננו בתבונה ובמצפון, לפיכך חובה עליהם לנהוג איש ברעהו ברוח של אחווה.",
    "hi": "रेल दुर्घटनाओं की रोकथाम के लिए आधुनिक प्रौद्योगिकी का आरंभ।",
    "hr": "Sva ljudska bića rađaju se slobodna i jednaka u dostojanstvu i pravima. Ona su obdarena razumom i sviješću i trebaju jedna prema drugima postupati u duhu bratstva.",
    "hu": "Minden emberi lény szabadon születik és egyenlő méltósága és joga van. Az emberek, ésszel és lelkiismerettel bírván, egymással szemben testvéri szellemben kell hogy viseltessenek.",
    "hy": "Բոլոր մարդիկ ծնվում են ազատ ու հավասար` իրենց արժանապատվությամբ և իրավունքներով: Նրանք օժտված են բանականությամբ ու խղճով, և պարտավոր են միմյանց նկատմամբ վարվել եղբայրության ոգով:",
    "id": "Semua orang dilahirkan merdeka dan mempunyai martabat dan hak-hak yang sama. Mereka dikaruniai akal dan hati nurani dan hendaknya bergaul satu sama lain dalam semangat persaudaraan.",
    "is": "Hver maður er borinn frjáls og jafn öðrum að virðingu og réttindum. Menn eru gæddir vitsmunum og samvisku, og ber þeim að breyta bróðurlega hverjum við annan.",
    "it": "Tutti gli esseri umani nascono liberi ed eguali in dignità e diritti. Essi sono dotati di ragione e di coscienza e devono agire gli uni verso gli altri in spirito di fratellanza.",
    "ja": "すべての人間は、生まれながらにして自由であり、かつ、尊厳と権利とについて平等である。人間は、理性と良心を授けられてあり、互いに同胞の精神をもって行動しなければならない。",
    "ka": "ყველა ადამიანი იბადება თავისუფალი და თანასწორი თავისი ღირსებითა და უფლებებით. მათ მინიჭებული აქვთ გონება და სინდისი და ერთმანეთის მიმართ უნდა იქცეოდნენ ძმობის სულისკვეთებით.",
    "kk": "Барлық адамдар тумысынан азат және қадір-қасиеті мен кұқықтары тең болып дүниеге келеді. Адамдарға ақыл-парасат, ар-ождан берілген, сондықтан олар бір-бірімен туыстық, бауырмалдық қарым-қатынас жасаулары тиіс.",
    "km": "មនុស្សទាំងអស់កើតមកមានសេរីភាពនិងភាពស្មើៗគ្នាក្នុងសិទ្ធិនិងសេចក្ដីថ្លៃថ្នូរ។ មនុស្សគ្រប់រូបសុទ្ធតែមានវិចារណញ្ញាណនិងសតិសម្បជញ្ញៈ ហើយត្រូវប្រព្រឹត្ដចំពោះគ្នាទៅវិញទៅមកក្នុងស្មារតីរាប់អានគ្នាជាបងប្អូន។",
    "kn": "ಎಲ್ಲಾ ಮಾನವರೂ ಸ್ವತಂತ್ರರಾಗಿಯೇ ಜನಿಸಿದ್ದಾರೆ. ಹಾಗೂ ಘನತೆ ಮತ್ತು ಹಕ್ಕು ಗಳಲ್ಲಿ ಸಮಾನರಾಗಿದ್ದರೆ. ವಿವೇಕ ಮತ್ತು ಅಂತಃಕರಣ ಗಳನ್ನು ಪಡೆದವರಾದ್ದರಿಂದ ಅವರು ಪರಸ್ಪರ ಸಹೋದರ ಭಾವದಿಂದ ವರ್ತಿಸಬೇಕು.",
    "ko": "ㅎㅏㄴㄱㅡㄹ for 한글",
    "ky": "Ба дык адамда ө з беделинде жана укукта ында кин жана тең укуктуу болуп жа а лат. Ала дын аң -сезими менен абийи и ба жана би и-би ине би туугандык мамиле кылууга тийиш.",
    "la": "Omnes homines dignitate et iure liberi et pares nascuntur, rationis et conscientiae participes sunt, quibus inter se concordiae studio est agendum.",
    "lo": "ມະນຸດທຸກຄົນເກີດມາມີກຽດສັກສີ, ສິດທິ, ເສຣີພາບແລະຄວາມສເມີພາບເທົ່າທຽມກັນ. ທຸກໆຄົນມີເຫດຜົນແລະຄວາມຄິດຄວາມເຫັນສ່ວນຕົວຂອງໃຜຂອງມັນ, ແຕ່ວ່າມະນຸດທຸກໆຄົນຄວນປະພຶດຕໍ່ກັນຄືກັນກັບເປັນອ້າຍນ້ອງກັນ.",
    "lt": "Visi žmonės gimsta laisvi ir lygūs savo orumu ir teisėmis. Jiems suteiktas protas ir sąžinė ir jie turi elgtis vienas kito atžvilgiu kaip broliai.",
    "lv": "Visi cilvēki piedzimst brīvi un vienlīdzīgi savā pašcieņā un tiesībās. Viņi ir apveltīti ar saprātu un sirdsapziņu, un viņiem jāizturas citam pret citu brālības garā.",
    "mk": "на јавното мислење покажуваат дека трката е толку тесна, што се очекува двајцата соперници да ја прекршат традицијата и да се појават и на самиот изборен ден.",
    "ml": "മനുഷ്യരെല്ലാവരും തുല്യാവകാശങ്ങളോടും അന്തസ്സോടും സ്വാതന്ത്ര്യത്തോടുംകൂടി ജനിച്ചവരാണ്. അന്യോന്യം ഭ്രാതൃഭാവത്തോടെ പെരുമാറുവാനാണ് മനുഷ്യന്നു വിവേകബുദ്ധിയും മനസ്സാക്ഷിയും സിദ്ധമായിരിക്കുന്നത്.",
    "mn": "Хүн бүр төрж мэндлэхдээ эрх чөлөөтэй, адилхан нэр төртэй, ижил эрхтэй байдаг. Оюун ухаан нандин чанар заяасан хүн гэгч өөр хоорондоо ахан дүүгийн үзэл санаагаар харьцах учиртай.",
    "my": "လူတိုင်းသည် တူညီ လွတ်လပ်သော ဂုဏ်သိက္ခါဖြင့် လည်းကောင်း၊ တူညီလွတ်လပ်သော အခွင့်အရေးများဖြင့် လည်းကောင်း၊ မွေးဖွားလာသူများ ဖြစ်သည်။ ထိုသူတို့၌ ပိုင်းခြား ဝေဖန်တတ်သော ဉာဏ်နှင့် ကျင့်ဝတ် သိတတ်သော စိတ်တို့ရှိကြ၍ ထိုသူတို့သည် အချင်းချင်း မေတ္တာထား၍ ဆက်ဆံကျင့်သုံးသင့်၏။",
    "ne": "हरेक वल्लो डाँडाबाट हेर्दा ओहो पल्लो डाँडाबाट त आकाश",
    "nl": "Alle mensen worden vrij en gelijk in waardigheid en rechten geboren. Zij zijn begiftigd met verstand en geweten, en behoren zich jegens elkander in een geest van broederschap te gedragen.",
    "no": "Alle mennesker er født frie og med samme menneskeverd og menneskerettigheter. De er utstyrt med fornuft og samvittighet og bør handle mot hverandre i brorskapets ånd.",
    "nr": "UmSebenzi wesiTjhaba wezamaLimi ukhuthaza ube ukghonakalise iindlela zokuthintana kiwo woke amalimi.",
    "nso": "Batho ka moka ba belegwe ba lokologile le gona ba na le seriti sa go lekana le ditokelo. Ba filwe monagano le letswalo mme ba swanetše go swarana ka moya wa bana ba mpa.",
    "or": "ସବୁ ମନୁଷ୍ୟ ଜନ୍ମୁକାଳରୁ ସ୍ଵଧୀନ, ଷେମାନଙ୍କର ମର୍ସ୍ୟାଡା ଓ ଅଧିକାର ସମାନ, ସେମାନଙଠାରେ ପ୍ରବଁ ଓ ବିବେକ ନିହ ଟଛି, ସେମାନେ ପରସ୍ପର ପବ ବ୍ରାଦହବ ପୋଷଷ କରି ଠାର୍ପ୍ୟ ଜକିରା ଡରକାର.",
    "pa": "ਸਾਰਾ ਮਨੁੱਖੀ ਪਰਿਵਾਰ ਆਪਣੀ ਮਹਿਮਾ, ਸ਼ਾਨ ਅਤੇ ਹੱਕਾਂ ਦੇ ਪੱਖੋਂ ਜਨਮ ਤੋਂ ਹੀ ਆਜ਼ਾਦ ਹੈ ਅਤੇ ਸੁਤੇ ਸਿੱਧ ਸਾਰੇ ਲੋਕ ਬਰਾਬਰ ਹਨ। ਉਨ੍ਹਾਂ ਸਭਨਾ ਲੂੰ ਤਰਕ ਅਤੇ ਜ਼ਮੀਰ ਦੀ ਸੌਗਾਤ ਸਿਲੀ ਹੋਈ ਹੈ ਅਤੇ ਉਨ੍ਹਾਂ ਲੂੰ ਭਰਾਤਰੀਭਾਵ ਦੀ ਭਾਵਨਾ ਰਾਖਦਿਆਂ ਆਪਸ ਵੀਚਾ ਵਿਚਰਣਾ ਚਾਹੀਦਾ ਹੈ।",
    "pl": "Wszyscy ludzie rodzą się wolni i równi w swojej godności i prawach. Są obdarzeni rozumem i sumieniem i powinni postępować wobec siebie w duchu braterstwa.",
    "ps": "زه کولای شي چې بښنه وغواړي",
    "pt-BR": "O Brasil caiu 26 posições em ranking de oportunidades de crescimento e ficou para trás da Etiópia e de Uganda.",
    "pt-PT": "Eu te peço, me deixa ser feliz hoje, amanhã e depois, e depois...",
    "ro": "Toate ființele umane se nasc libere și egale în demnitate și în drepturi. Ele sunt înzestrate cu rațiune și conștiință și trebuie să se comporte unele față de altele în spiritul fraternității.",
    "ru": "Все люди рождаются свободными и равными в своем достоинстве и правах. Они наделены разумом и совестью и должны поступать в отношении друг друга в духе братства.",
    "si": "සියලූ මනුෂ්‍යයෝ නිදහස්ව උපත ලබා ඇත. ගරුත්වයෙන් හා අයිතිවාසිකම් සමාන වෙති. යුක්ති අයුක්ති පිළිබඳ හැඟීමෙන් හා හෘදය සාක්ෂියෙන් යුත් ඔවුනොවුන්වුන්ට සැළකිය යුත්තේ සහෝදරත්වය පිළිබඳ හැඟීමෙනි.",
    "sk": "Všetci ľudia sa rodia slobodní a sebe rovní, čo sa týka ich dostôjnosti a práv. Sú obdarení rozumom a majú navzájom jednať v bratskom duchu.",
    "sl": "Vsi ljudje se rodijo svobodni in imajo enako dostojanstvo in enake pravice. Obdarjeni so z razumom in vestjo in bi morali ravnati drug z drugim kakor bra",
    "so": "Aadanaha dhammaantiis wuxuu dhashaa isagoo xor ah kana siman xagga sharafta iyo xuquuqada Waxaa Alle (Ilaah) siiyay aqoon iyo wacyi, waana in qof la arkaa qofka kale ula dhaqmaa si walaaltinimo ah.",
    "sq": "Të gjithë njerëzit lindin të lirë dhe të barabartë në dinjitet dhe në të drejta. Ata kanë arsye dhe ndërgjegje dhe duhet të sillen ndaj njëri tjetrit me frymë vëllazërimi.",
    "sr": "Cвa људскa бићa рaђajу сe слoбoднa и jeднaкa у дoстojaнству и прaвимa. Oнa су oбдaрeнa рaзумoм и свeшћу и трeбa jeдни прeмa другимa дa пoступajу у духу брaтствa.",
    "ss": "Bonkhe bantfu batalwa bakhululekile balingana ngalokufananako ngesitfunti nangemalungelo. Baphiwe ingcondvo nekucondza kanye nanembeza ngakoke bafanele batiphatse nekutsi baphatse nalabanye ngemoya webuzalwane.",
    "st": "Batho bohle ba tswetswe ba lokolohile mme ba lekana ka botho le ditokelo. Ba tswetswe le monahano le letswalo mme ba tlamehile ho phedisana le ba bang ka moya wa boena.",
    "sv": "Alla människor är födda fria och lika i värdighet och rättigheter. De är utrustade med förnuft och samvete och bör handla gentemot varandra i en anda av broderskap.",
    "sw": "Watu wote wamezaliwa huru, hadhi na haki zao ni sawa. Wote wamejaliwa akili na dhamiri, hivyo yapasa watendeane kindugu.",
    "ta": "மனிதப் பிறவியினர் சகலரும் சுதந்திரமாகவே பிறக்கின்றனர்; அவர்கள் மதிப்பிலும் உரிமைகளிலும் சமமானவர்கள். அவர்கள் நியாயத்தையும் மனசாட்சியையும் இயற்பண்பாகப் பெற்றவர்கள். அவர்கள் ஒருவருடனொருவர் சகோதர உணர்வுப் பாங்கில் நடந்துகொள்ளல் வேண்டும்.",
    "te": "ప్రతిపత్తిస్వత్వముల విషయమున మానవులెల్లరును జన్మతః స్వతంత్రులును సమానులును నగుదురు. వారు వివేదనాంతఃకరణ సంపన్నులగుటచే పరస్పరము భ్రాతృభావముతో వర్తింపవలయును.",
    "th": "เราทุกคนเกิดมาอย่างอิสระ เราทุกคนมีความคิดและความเข้าใจเป็นของเราเอง เราทุกคนควรได้รับการปฏิบัติในทางเดียวกัน.",
    "tl": "Ang lahat ng tao'y isinilang na malaya at pantay-pantay sa karangalan at mga karapatan. Sila'y pinagkalooban ng katwiran at budhi at dapat magpalagayan ang isa't isa sa diwa ng pagkakapatiran.",
    "tlh": "Heghlu'meH QaQ jajvam",
    "tn": "Batho botlhe ba tsetswe ba gololosegile le go lekalekana ka seriti le ditshwanelo. Ba abetswe go akanya le maikutlo, mme ba tshwanetse go direlana ka mowa wa bokaulengwe.",
    "tr": "Bütün insanlar hür, haysiyet ve haklar bakımından eşit doğarlar. Akıl ve vicdana sahiptirler ve birbirlerine karşı kardeşlik zihniyeti ile hareket etmelidirler.",
    "ts": "Mina ndza yi vona huku",
    "uk": "Всі люди народжуються вільними і рівними у своїй гідності та правах. Вони наділені розумом і совістю і повинні діяти у відношенні один до одного в дусі братерства.",
    "und": "",
    "ur": "دفعہ ۱: تمام انسان آزاد اور حقوق و عزت کے اعتبار سے برابر پیدا ہوئے ہیں۔ انہیں ضمیر اور عقل ودیعت ہوئی ہے۔ اس لئے انہیں ایک دوسرے کے ساتھ بھائ چارے کا سلوک کرنا چاہئے۔",
    "uz": "Барча одамлар эрҝин, қадр-қиммат ва ҳуқуқларда танг бўлиб туғиладилар. Улар ақл ва виждон соҳибидирлар ва бир-бирларига биродарларча муомала қилишлари зарур.",
    "ve": "Vhathu vhoṱhe vha bebwa vhe na mbofholowo nahone vha tshi lingana siani ḽa tshirunzi na pfanelo. Vhathu vhoṱhe vho ṋewa mihumbulo na mvalo ngauralo vha tea u konou farana sa vhathu vhathihi.",
    "vi": "Tất cả mọi người sinh ra đều được tự do và bình đẳng về nhân phẩm và quyền lợi. Mọi con người đều được tạo hóa ban cho lý trí và lương tâm và cần phải đối xử với nhau trong tình anh em.",
    "xh": "IsiXhosa yenye yeelwimi zaseMzantsi Afrika ezingundoqo nezaziwayo.",
    "zh": "人人生而自由﹐在尊嚴和權利上一律平等。他們賦有理性和良心﹐並應以兄弟關係的精神互相對待。",
    "zu": "Ezisemthethweni imibhalo nemiqulu yakwaHulumeni. Kikskdorpas hutsi muaoi"
}

var fixtures = [],
    fixture;
    
for (fixture in fixtureMap) {
    fixtures.push(fixtureMap[fixture]);
}

module.exports = fixtures;
});

require.register("retext-language-gh-pages", function (exports, module) {
var Retext = require("wooorm~retext@0.2.0-rc.3");
var language = require("wooorm~retext-language@0.1.2");
var debounce = require("component~debounce@1.0.0");
var fixtures = require("retext-language-gh-pages/fixtures.js");

var inputElement = document.getElementsByTagName('textarea')[0];
var outputElement = document.getElementsByTagName('ol')[0];
var buttonElement = document.getElementsByTagName('button')[0];
var wrapperElement = document.getElementsByTagName('div')[0];

var retext = new Retext().use(language);

inputElement.addEventListener('input', debounce(detectLanguage, 50));

inputElement.value = getRandomFixture();

console.log(fixtures);

function getRandomFixture() {
    return fixtures[Math.floor(Math.random() * fixtures.length)];
}

function detectLanguage() {
    retext.parse(inputElement.value, function (err, tree) {
        if (err) throw err;

        visualiseResults(tree.data.languages);
    });
}

function visualiseResults(results) {
    wrapperElement.style.display = '';
    cleanOutputElement();
    results = results.map(createResult);

    results.forEach(function (node) {
        outputElement.appendChild(node);
    });
}

function cleanOutputElement() {
    while (outputElement.firstElementChild) {
        outputElement.removeChild(outputElement.firstElementChild);
    }
}

function createResult(result, n) {
    var node = document.createElement('li');

    node.textContent = result[0] + ': ' + result[1];

    return node;
}

detectLanguage();
});

require("retext-language-gh-pages")
