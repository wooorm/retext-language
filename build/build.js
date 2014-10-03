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

require.register("wooorm~franc@0.2.0", function (exports, module) {
'use strict';

module.exports = require("wooorm~franc@0.2.0/lib/franc.js");

});

require.register("wooorm~franc@0.2.0/lib/franc.js", function (exports, module) {
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

var data,
    utilities,
    expressions,
    singletons;

/**
 * Load `trigram-utils`.
 */

utilities = require("wooorm~trigram-utils@0.0.2");

/**
 * Load `expressions` (regular expressions matching
 * scripts).
 */

expressions = require("wooorm~franc@0.2.0/lib/expressions.js");

/**
 * Load `singletons` (regular expressions matching
 * scripts, their occurrence denoting a single
 * language).
 */

singletons = require("wooorm~franc@0.2.0/lib/singletons.js");

/**
 * Load `data` (trigram information per language,
 * per script).
 */

data = require("wooorm~franc@0.2.0/lib/data.json");

/**
 * Construct trigram dictionaries.
 */

(function () {
    var languages,
        name,
        trigrams,
        model,
        script,
        weight;

    for (script in data) {
        languages = data[script];

        for (name in languages) {
            model = languages[name].split('|');

            weight = model.length;

            trigrams = {};

            while (weight--) {
                trigrams[model[weight]] = weight;
            }

            languages[name] = trigrams;
        }
    }
})();

var MAX_LENGTH,
    MIN_LENGTH,
    MAX_DIFFERENCE;

/**
 * Maximum sample length.
 */

MAX_LENGTH = 2048;

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
 *   array containing trigram--count tuples.
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
        } else {
            difference = MAX_DIFFERENCE;
        }

        distance += difference;
    }

    return distance;
}

/**
 * Get the distance between an array of trigram--count tuples,
 * and multiple trigram dictionaries.
 *
 * @param {Array.<Array.<string, number>>} trigrams - An
 *   array containing trigram--count tuples.
 * @param {Object.<string, Object>} languages - multiple
 *   trigrams to test against.
 * @return {Array.<Array.<string, number>>} An array
 *   containing language--distance tuples.
 */

function getDistances(trigrams, languages) {
    var distances,
        language;

    distances = [];

    for (language in languages) {
        distances.push([
            language,
            getDistance(trigrams, languages[language])
        ]);
    }

    return distances.sort(sort);
}

/**
 * Get the occurrence ratio of `expression` for
 * `value`.
 *
 * @param {string} value
 * @param {RegExp} expression
 * @return {number} Float between 0 and 1.
 */

function getOccurrence(value, expression) {
    var count;

    count = value.match(expression);

    return (count ? count.length : 0) / value.length || 0;
}

/**
 * From `scripts`, get the most occurring expression for
 * `value`.
 *
 * @param {string} value
 * @param {Object.<string, RegExp>} scripts
 * @return {{0: string, 1: number} Top script and its
 *   occurrence percentage.
 */

function getTopScript(value, scripts) {
    var topCount,
        topScript,
        script,
        count,
        length,
        selection,
        subvalue,
        index;

    subvalue = value.substr(0, 50);
    selection = [];

    for (script in scripts) {
        if (getOccurrence(subvalue, scripts[script]) > 0) {
            selection.push(script);
        }
    }

    length = selection.length;

    if (length === 1) {
        topScript = selection[0];
        topCount = getOccurrence(value, scripts[selection[0]]);
    } else if (length > 1) {
        topCount = -1;
        index = -1;

        while (++index < length) {
            count = getOccurrence(value, scripts[selection[index]]);

            if (count > topCount) {
                topCount = count;
                topScript = selection[index];
            }
        }
    }

    return [topScript, topCount];
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
    var script;

    if (!value || value.length < MIN_LENGTH) {
        return singleLanguageTuples('und');
    }

    value = value.substr(0, MAX_LENGTH);

    /**
     * If value contains more than 60% of a certain
     * unique script, return its corresponding language.
     */

    script = getTopScript(value, singletons);

    if (script[1] > 0.6) {
        return singleLanguageTuples(script[0]);
    }

    /**
     * Get the script which characters occur the most
     * in `value`.
     */

    script = getTopScript(value, expressions);

    /**
     * Get all distances for a given script.
     */

    return getDistances(utilities.asTuples(value), data[script[0]]);
}

/**
 * Get the most probable language for the given value.
 *
 * @param {string} value - The value to test.
 * @return {string} The most probable language.
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

require.register("wooorm~franc@0.2.0/lib/expressions.js", function (exports, module) {
module.exports = {
  Latin: /[A-Za-z\xAA\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02E0-\u02E4\u1D00-\u1D25\u1D2C-\u1D5C\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1DBE\u1E00-\u1EFF\u2071\u207F\u2090-\u209C\u212A\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\uA722-\uA787\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uFB00-\uFB06\uFF21-\uFF3A\uFF41-\uFF5A]/g,
  Cyrillic: /[\u0400-\u0484\u0487-\u052F\u1D2B\u1D78\u2DE0-\u2DFF\uA640-\uA69D\uA69F]/g,
  Arabic: /[\u0600-\u0604\u0606-\u060B\u060D-\u061A\u061E\u0620-\u063F\u0641-\u064A\u0656-\u065F\u066A-\u066F\u0671-\u06DC\u06DE-\u06FF\u0750-\u077F\u08A0-\u08B2\u08E4-\u08FF\uFB50-\uFBC1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFD\uFE70-\uFE74\uFE76-\uFEFC]|\uD803[\uDE60-\uDE7E]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB\uDEF0\uDEF1]/g,
  Devanagari: /[\u0900-\u0950\u0953-\u0963\u0966-\u097F\uA8E0-\uA8FB]/g,
  Ethiopic: /[\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u137C\u1380-\u1399\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E]/g,
  Hebrew: /[\u0591-\u05C7\u05D0-\u05EA\u05F0-\u05F4\uFB1D-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFB4F]/g
};

});

require.register("wooorm~franc@0.2.0/lib/singletons.js", function (exports, module) {
module.exports = {
  cmn: /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]|[\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/g,
  ben: /[\u0980-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09FB]/g,
  kor: /[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/g,
  tel: /[\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C78-\u0C7F]/g,
  tam: /[\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BFA]/g,
  guj: /[\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AF1]/g,
  mal: /[\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D75\u0D79-\u0D7F]/g,
  kan: /[\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2]/g,
  ori: /[\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B77]/g,
  mya: /[\u1000-\u109F\uA9E0-\uA9FE\uAA60-\uAA7F]/g,
  pan: /[\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75]/g,
  tha: /[\u0E01-\u0E3A\u0E40-\u0E5B]/g,
  sin: /[\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF4]|\uD804[\uDDE1-\uDDF4]/g,
  ell: /[\u0370-\u0373\u0375-\u0377\u037A-\u037D\u037F\u0384\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03E1\u03F0-\u03FF\u1D26-\u1D2A\u1D5D-\u1D61\u1D66-\u1D6A\u1DBF\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FC4\u1FC6-\u1FD3\u1FD6-\u1FDB\u1FDD-\u1FEF\u1FF2-\u1FF4\u1FF6-\u1FFE\u2126\uAB65]|\uD800[\uDD40-\uDD8C\uDDA0]|\uD834[\uDE00-\uDE45]/g,
  khm: /[\u1780-\u17DD\u17E0-\u17E9\u17F0-\u17F9\u19E0-\u19FF]/g,
  hye: /[\u0531-\u0556\u0559-\u055F\u0561-\u0587\u058A\u058D-\u058F\uFB13-\uFB17]/g,
  sat: /[\u1C50-\u1C7F]/g,
  bod: /[\u0F00-\u0F47\u0F49-\u0F6C\u0F71-\u0F97\u0F99-\u0FBC\u0FBE-\u0FCC\u0FCE-\u0FD4\u0FD9\u0FDA]/g,
  kat: /[\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u10FF\u2D00-\u2D25\u2D27\u2D2D]/g,
  lao: /[\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF]/g,
  iii: /[\uA000-\uA48C\uA490-\uA4C6]/g,
  aii: /[\u0700-\u070D\u070F-\u074A\u074D-\u074F]/g,
  jpn: /[\u3041-\u3096\u309D-\u309F]|\uD82C\uDC01|\uD83C\uDE00|[\u30A1-\u30FA\u30FD-\u30FF\u31F0-\u31FF\u32D0-\u32FE\u3300-\u3357\uFF66-\uFF6F\uFF71-\uFF9D]|\uD82C\uDC00|[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]|[\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/g
};

});

require.define("wooorm~franc@0.2.0/lib/data.json", {
  "Latin": {
    "spa": " de|os |de | la|la | y | a |es |ón |ión|rec|ere|der| co|e l|el |en |ien|cho|ent|ech|ció|aci|o a|a p| el|a l|al |as |e d| en|na |ona|s d|da |nte| to|ad |ene|con| pr| su|tod| se|ho |los| pe|per|ers| lo|o d| ti|cia|n d|cio| es|ida|res|a t|tie|ion|rso|te |do | in|son| re| li|to |dad|tad|e s|est|pro|que|men| po|a e|oda|nci| qu| un|ue |ne |n e|s y|lib|su | na|s e|nac|ia |e e|tra| pa|or |ado|a d|nes|ra |se |ual|a c|er |por|com|nal|rta|a s|ber| o |one|s p|dos|rá |sta|les|des|ibe|ser|era|ar |ert|ter| di|ale|l d|nto|hos|del|ica|a a|s n|n c|oci|imi|io |o e|re |y l|e c|ant|cci| as|las|par|ame| cu|ici|ara|enc|s t|ndi| so|o s|mie|tos|una|bre|dic|cla|s l|e a|l p|pre|ntr|o t|ial|y a|nid|n p|a y|man|omo|so |n l| al|ali|s a|no | ig|s s|e p|nta|uma|ten|gua|ade|y e|soc|mo | fu|igu|o p|n t|hum|d d|ran|ria|y d|ada|tiv|l e|cas| ca|vid|l t|s c|ido|das|dis|s i| hu|s o|nad|fun| ma|rac|nda|eli|sar|und| ac|uni|mbr|a u|die|e i|qui|a i| ha|lar| tr|odo|ca |tic|o y|cti|lid|ori|ndo|ari| me|ta |ind|esa|cua|un |ier|tal|esp|seg|ele|ons|ito|ont|iva|s h|d y|nos|ist|rse| le|cie|ide|edi|ecc|ios|l m|r e|med|tor|sti|n a|rim|uie|ple|tri|ibr|sus|lo |ect|pen|y c|an |e h|n s|ern|tar|l y|egu|gur|ura|int|ond|mat|l r|r a|isf|ote",
    "eng": " th|the| an|he |nd |and|ion| of|of |tio| to|to |on | in|al |ati|igh|ght|rig| ri|or |ent|as |ed |is |ll |in | be|e r|ne |one|ver|all|s t|eve|t t| fr|s a| ha| re|ty |ery| or|d t| pr|ht | co| ev|e h|e a|ng |ts |his|ing|be |yon| sh|ce |ree|fre|ryo|n t|her|men|nat|sha|pro|nal|y a|has|es |for| hi|hal|f t|n a|n o|nt | pe|s o| fo|d i|nce|er |ons|res|e s|ect|ity|ly |l b|ry |e e|ers|e i|an |e o| de|cti|dom|edo|eed|hts|ter|ona|re | no| wh| a | un|d f| as|ny |l a|e p|ere| en| na| wi|nit|nte|d a|any|ted| di|ns |sta|th |per|ith|e t|st |e c|y t|om |soc| ar|ch |t o|d o|nti|s e|equ|ve |oci|man| fu|ote|oth|ess| al| ac|wit|ial| ma|uni| se|rea| so| on|lit|int|r t|y o|enc|thi|ual|t a| eq|tat|qua|ive| st|ali|e w|l o|are|f h|con|te |led| is|und|cia|e f|le | la|y i|uma|by | by|hum|f a|ic | hu|ave|ge |r a| wo|o a|ms |com| me|eas|s d|tec| li|n e|en |rat|tit|ple|whe|ate|o t|s r|t f|rot| ch|cie|dis|age|ary|o o|anc|eli|no | fa| su|son|inc|at |nda|hou|wor|t i|nde|rom|oms| ot|g t|eme|tle|iti|gni|s w|itl|duc|d w|whi|act|hic|aw |law| he|ich|min|imi|ort|o s|se |e b|ntr|tra|edu|oun|tan|e d|nst|l p|d n|ld |nta|s i|ble|n p| pu|n s| at|ily|rth|tho|ful|ssi|der|o e|cat|uca|unt|ien| ed|o p|h a|era|ind|pen|sec|n w|omm|r s",
    "hlt": "ng |na |ah | th|ang| na|ai | kh|ham|eh |la | ha| ah| la|tha|lan|hla|eng|oei|ih |thl| ka|om |am |hai|i a| ma|kha|boe| ne| a |a t|el |h t|kah|a h| bo|ing| pa|oel|neh|moe|eih| ti|a n| ca|mai|i n|h k|hmo|ngt|amh|a k|ong|mhm| te|te |h a|oe |a a| ra|ung|h l|haw|hui|ek |aw |g t|loe|ram| lo| om|h n| sa|g k|en |m b|g a|uen|ina|ui |oen|ain| at|awn|i t|nga|h h|mah|tom|kho|oh |m t|khu|h p|ka |loh|a l| ni|at |h m| do|tun|amt|g n|aih|hin|h b| va|h r|ak |gto|hoe|aen|e a|don|paw|oek| tu| ng|a o|hat|l a| ta|gai|wn |k t|taw|aek|aeh|mue|a r| bi|ei |sae|sak|ueh|g h|pae|a c|e t|m m|he |ngh| ba|mtu|ni |olh|thu| ro|coe|ghi|g m|lam|kna|can| he|ata|i h|tih|n t|tlo|awt|ala|m k|w t| bu| hn|k n|a b| u |bi |ban|hno|ngp|a s|tho|un |tue|vae|hlo|osa|i k| co|lai|cal|e k|adi| da|ihl| up|i l|a d|roe| mu|g l|wh |awh|e n|hos| ol|m o|pad|i p|di |ca |ae |hue|a p| ya|gna|ngn|l n|no |dan|upa|ith| po|tae|a u| ko|ama|phu|m n|l t|n m| am|tan| ph|a m|ti |sai|wt |h y|o n|bue|tis|nda| me|hol|van|pa | ak|pin|t n|lh |isa|um |nen|lpo|gta|dah|wnd|nin|daw|ait|h u|han| hm|alp|yal|g p| im|g b|uek|h d|an |pui|g c|ol |poe|h c|ngl|baw|it |kun|e l| ku|anp|o a| un|h s|pit|ben| be|n n|npi|hae| tl|pon|ona| hi| as|tik|nah|eba|nya|roi|e b|the",
    "por": "os |de | de| a | e |o d|to |ão | di|ent|da |ito|em | co|eit|as |dir|es |ire|rei| se|ção|ade|a p|dad|e d|s d|men|nte|do |s e| pr| pe|dos| to| da|a a|o e| o |o a|ess|con|tod|que| qu|te |e a| do|al |res|ida|m d| in| ou|er |sso| na| re| po|a s| li|uma|cia|ar |pro|e e|a d| te|açã|a t| es| su|ou |ue |s p|tos|a e|des|ra |com|no |ame|ia |e p|tem|nto| pa|is |est|tra|ões|na |s o|oda|das|ser|soa|s n|pes|o p|s a|o s|e o| em| as| à |o o|ais|ber|ado|oa |o t|e s|man|sua|ua | no| os|a c|ter|çõe|erd|lib|rda|s s|nci|ibe|e n|ica|odo|so |nal|ntr|s t|hum|ura| ao|ona|ual| so|or |ma |sta|o c|a n|pre|ara|era|ons|e t|r a|par|o à| hu|ind|por|cio|ria|m a|s c| um|a l|gua|ran| en|ndi|o i|e c|raç|ion|nid|aci|ano|soc|e r|oci| ac|und|sen|nos|nsi|rec|ime|ali|int|um |per|nac| al|m o|r p| fu|ndo|ont|açõ| ig|igu|fun|nta| ma|uni|cçã|ere| ex|a i| me|ese|rio|l d|a o|s h|pel|ada|pri|ide|am |m p|pod|s f|ém |a f|io |ode|ca |ita|lid|tiv|e f|vid|r e|esp|nda|omo|e l|naç|o r|ant|a q|tad|lic|iva| fa|ver|s l|ial|cla|ngu|ing| ca|mo |der| vi|eli|ist|ta |se |ati|ios|ido|r o|eci|dis| un|e i|r d|ecç|o q|s i|qua|ênc|a m|seu|sti|nin|uer|rar|cas|aos|ens|gué|ias|sid|uém|tur|dam|sse|ao |ela|l e|for|tec|ote| pl|ena| tr|m c|tro| ni|ico|rot",
    "ind": "an |ang| da|ng | pe|ak | ke| me|ata| se|dan|kan| di| be|hak|ber|per|ran|nga|yan|eng| ya| ha|asa|gan|men|ara|nya|n p|n d|n k|a d|tan| at|at |ora|ala|san| ba|ap |erh|n b|rha|ya | ma|g b|a s|pen|eba|as |aan|uk |ntu| or|eti|tas|aka|tia|ban|set| un|n s|ter|n y| te|k m|tuk|bas|iap|lam|beb|am | de|k a|keb|n m|i d|unt|ama|dal|ah |ika|dak|ebe|p o|sa |pun|mem|n h|end|den|ra |ela|ri |nda| sa|di |ma |a m|n t|k d|n a|ngg|tau|man|gar|eri|asi| ti|un |al |ada|um |a p|lak|ari|au | ne|neg|a b|ngs|ta |ole|leh|ert|ers|ida|k h|ana|gsa|dar|uka|tid|bat|sia|era|eh |dap|ila|dil|h d|atu|sam|ia |i m| in|lan|aha|uan|tu |ai |t d|a a|g d|har|sem|na |apa|ser|ena|kat|uat|erb|erl|mas|rta|ega|ung|nan|emp|n u|kum|l d|g s| hu|ka |ent|pat|mba|aga|nta|adi| su|eni|uku|n i|huk|ind|ar |rga|i s|aku|ndi|sua|ni |rus|han|si |car|nny| la|in |u d|ik |ua |lah|rik|usi|emb|ann|mer|ian|gga|lai|min|a u|lua|ema|emu|arg|dun|dip|a t|mat|aya|rbu|aru|erk|rka|ini|eka|a k|rak|kes|yat|iba|nas|rma|ern|ese|s p|nus| pu|anu|ina| ta|mel|mua|kel|k s|us |ndu|nak|da |sya|das|pem|lin|ut |yar|ami|upu|seo|aik|eor|iny|aup|tak|ipe|ing|tin| an|dik|uar|ili|g t|rse|sar|ant|g p|a n|aks|ain| ja|t p| um|g m|dir|ksa|umu|kep|mum|i k|eca|rat|m p|h p|aba|ses|m m",
    "fra": " de|es |de |ion|nt |et |tio| et|ent| la|la |e d|on |ne |oit|e l|le | le|s d|e p|t d|ati|roi| dr|dro|it | à | co|té |ns |te |e s|men|re | to|con| l’|tou|que| qu|les| so|des|son| pe|ons| un|s l|s e| pr|ue | pa|e c|t l|ts |onn| au|e a|eme|e e| li|ont|ant|out|ute|t à|res|ers| sa|ce | a |tre|per|a d|cti|er |lib|ité| en|ux | re|en |rso|à l| ou| in|lle|un |nat|ou |nne|n d|une| d’| se|par|nte|us |ur |s s|ans|dan|a p|r l|pro|its|és |t p|ire|e t|s p|sa | dé|ond|é d|a l|nce|ert|aux|omm|nal|me | na| fo|iqu| ce|rté|ect|ale|ber|t a|s a| da|mme|ibe|san|e r| po|com|al |s c|qui|our|t e| ne|e n|ous|r d|ali|ter| di|fon|e o|au | ch|air|ui |ell| es|lit|s n|iss|éra|tes|soc|aut|oci|êtr|ien|int|du |est|été|tra|pou| pl|rat|ar |ran|rai|s o|ona|ain|cla|éga|anc|rs |eur|pri|n c|e m|s t|à u| do|ure|bre|ut | êt|age| ét|nsi|sur|ein|sen|ser|ndi|ens|ess|ntr|ir | ma|cia|n p|st |a c| du|l e| su|bli|ge |rés| ré|e q|ass|nda|peu|ée |l’a| te|a s|tat|il |tés|ais|u d|ine|ind|é e|qu’| ac|s i|n t|t c|n a|l’h|t q|soi|t s|cun|rit| ég|oir|’en|nta|hom| on|n e| mo|ie |ign|rel|nna|t i|l n| tr|ill|ple|s é|l’e|rec|a r|ote|sse|uni|idé|ive|s u|t ê|ins|act| fa|n s| vi|gal| as|lig|ssa|pré|leu|e f|lic|dis|ver| nu|ten|ssi|rot|tec|s m|abl",
    "deu": "en |er |der| un|nd |und|ein|ung|cht| de|ich|sch|ng | ge|ie |che|ech| di|die|rec|gen|ine|eit| re|ch | da|n d|ver|hen| zu|t d| au|ht | ha|lic|it |ten|rei| be|in | ve| in| ei|nde|auf|den|ede|zu |n s|uf |fre|ne |ter|es | je|jed|n u| an|sei|and| fr|run|at | se|e u|das|hei|s r|hte|hat|nsc|nge|r h|as |ens| al|ere|lle|t a| we|n g|rde|nte|ese|men| od|ode|ner|g d|all|t u|ers|te |nen| so|d d|n a|ben|lei| gr| vo|wer|e a|ege|ion| st|ige|le |cha| me|haf|aft|n j|ren| er|erk|ent|bei| si|eih|ihe|kei|erd|tig|n i|on |lun|r d|len|gem|ies|gru|tli|unt|chu|ern|ges|end|e s|ft |st |ist|tio|ati| gl|sta|gun|mit|sen|n n| na|n z|ite| wi|r g|eic|e e|ei |lie|r s|n w|gle|mei|de |uch|em |chl|nat|rch|t w|des|n e|hre|ale|spr|d f|ach|sse|r e| sc|urc|r m|nie|e f|fen|e g|e d| ni|dur|dar|int| du|geh|ied|t s| mi|alt|her|hab|f g|sic|ste|taa|aat|he |ang|ruc|hli|tz |eme|abe|h a|n v|nun|geg|arf|rf |ehe|pru| is|erf|e m|ans|ndl|e b|tun|n o|d g|n r|r v|wie|ber|r a|arb|bes|t i|h d|r w|r b| ih|d s|igk|gke|nsp|dig|ema|ell|eru|n f|ins|rbe|ffe|esc|igu|ger|str|ken|e v|gew|han|ind|rt | ar|ieß|n h|rn |man|r i|hut|utz|d a|ls |ebe|von|lte|r o|rli|etz|tra|aus|det|hul|e i|one|nne|isc|son|sel|et |ohn|t g|sam| fa|rst|rkl|ser|iem|g v|t z|err",
    "jav": "ng |an |ang| ka|ing|kan| sa|ak |lan| la|hak| ha| pa| ma|ngg|ara|sa |abe|ne | in|n k|ant| ng|tan|nin| an|nga|ata|en |ran| ba|man|ban|ane|hi |n u|ong|ra |nth|ake|ke |thi| da|won|uwo|ung|ngs| uw|asa|gsa|ben|sab|ana|aka|beb|a k|g p|nan|nda|adi|at |awa|san|ni |dan|g k|pan|eba| be|e k|g s|ani|bas| pr|dha|aya|gan|ya |wa |di |mar|n s| wa|ta |a s|g u| na|e h|arb|a n|a b|a l|n n| ut|yan|n p|asi|g d|han|ah |g n| tu| um|as |wen|dak|rbe|dar| di|ggo|sar|mat|k h|a a|iya| un|und|eni|kab|be |art|ka |uma|ora|n b|ala|n m|ngk|rta|i h| or|gar|yat|kar|al |a m|n i|na |g b|ega|pra|ina|kak|g a|a p|tum|nya|kal|ger|gge| ta|kat|i k|ena|oni|kas| pe|dad|aga|g m|duw|k k|uta|uwe| si| ne|adh|pa |n a|go |and|i l| ke|nun|nal|ngu|uju|apa|a d|t m|i p|min|iba|er | li|anu|sak|per|ama|gay|war|pad|ggu|ha |ind|taw|ras|n l|ali|eng|awi|a u| bi|we |bad|ndu|uwa|awe|bak|ase|eh | me|neg|pri| ku|ron|ih |g t|bis|iji|i t|e p| pi|aba|isa|mba|ini|a w|g l|ika|n t|ebu|ndh|ar |sin|lak|ur |mra|men|ku | we|e s|a i|liy| ik|ayo|rib|ngl|ami|arg|nas|yom|wae|ut |kon|ae |rap|aku| te|dil|tin|rga|jud|umu| as|rak|bed|k b|il |kap|h k|jin|k a| nd|e d|i s| lu|i w|eka|mum|um |uha|ate| mi|k p|gon|eda| ti|but|n d|r k|ona|uto|tow|wat|gka|si |umr|k l|oma",
    "vie": "ng |̣c |́c | qu| th|à |nh | ng|̣i | nh|và| va|̀n |uyê| ph| ca|quy|ền|yề|̀i | ch|̀nh| tr| cu|ngư|i n|gươ|ườ|́t |ời| gi|ác| co|̣t |ó |c t|ự |n t|cá|ông| kh|ượ|ợc| tư| đư|iệ|đươ|ìn|́i | ha|có|i đ|gia| đê|pha| mo|ọi|mọ|như|n n|củ| ba|̣n |̉a |ủa|n c|̀u |̃ng|ân |ều|ất| bi|tự|hôn| vi|g t| la|n đ|đề|nhâ| ti|t c| đô|ên |bả|hiê|u c| tô|do |hân| do|ch |́ q|̀ t| na|́n |ay | hi|àn|̣ d|ới|há| đi|hay|g n| mô|ốc|uố|n v|ội|hữ|thư|́p |quô| ho|̣p |nà|ào|̀ng|̉n |ị |́ch|ôn |̀o |khô|c h|i c|c đ| hô|i v|tro| đa|́ng|mộ|i t|ột|g v|ia |̣ng|ản|ướ|ữn|̉ng|h t|hư |ện|n b|ộc|ả |là|c c|g c| đo|̉ c|n h|hà|hộ| bâ|ã |̀y | vơ|̣ t|̉i |iế| cô|t t|g đ|ức|iên| vê|viê|vớ|h v|ớc|ực|ật|tha|̉m |ron|ong|áp|g b|hươ| sư|a c|sự|̉o |ảo|h c|ể |o v|uậ|a m|ế |iá|̀ c|cho|qua|hạ|ục| mi|̀ n|phâ|c q|côn|o c|á |i h|ại| hơ|̃ h| cư|n l|bị| lu|bấ|cả|ín|h đ| xa|độ|g h|c n|c p|thu|ải|ệ | hư|́ c|o n| nư|ốn|́o |áo|xã|oà|y t|hả|tộ|̣ c| tâ|thô| du|m v|mì|ho |hứ|ệc|́ t|hợ|án|n p|cũ|ũn|iể|ối|tiê|ề |hấ|ợp|hoa|y đ|chi|o h|ở |ày|̉ t|đó|c l|về|̀ đ|i b|kha|c b| đâ|luâ|ai |̉ n|đố|ết|hự|tri|p q|nươ|dụ|hí|g q|yên|họ|́nh| ta| bă|c g|n g|thê|o t|c v|am |c m|an ",
    "ita": " di|to | de|ion| in|la |e d|di |ne | e |zio|re |le |ni |ell|one|lla|rit|a d|o d|del|itt|iri|dir| co|ti |ess|ent| al|azi|tto|te |i d|i i|ere|tà | pr|ndi|e l|ale|o a|ind|e e|e i|gni|nte|con|i e|li |a s| un|men|ogn| ne|uo | og|idu|e a|ivi|duo|vid| es|tti| ha|div| li|a p|no |all|pro|za |ato|per|sse|ser| so|i s| la| su|e p| pe|ibe|na |a l| il|ber|e n|il |ali|lib|ha |che|in |o s|e s| qu|o e|ia |e c| ri|nza|ta |nto|he |oni|o i| o |sta|o c|nel| a |o p|naz|e o|so | po|o h|gli|i u|ond|i c|ers|ame|i p|lle|un |era|ri |ver|ro |el |una|a c| ch|ert|ua |i a|ssi|rtà|a e|ei |dis|ant| l |tat|a a|ona|ual| le|ità|are|ter| ad|nit| da|pri|dei|à e|cia| st| si|nal|est|tut|ist|com|uni| ed|ono| na|sua|al |si |anz| pa| re|raz|gua|ita|res|der|soc|man|o o|ad |i o|ese|que|enz|ed | se|io |ett|on | tu|dic|à d|sia|i r|rso|oci|rio|ari|qua|ial|pre|ich|rat|ien|tra|ani|uma|se |ll |eri|a n|o n| um|do |ara|a t|zza|er |tri|att|ico|pos|sci|i l|son|nda|par|e u|fon| fo|nti|uzi|str|utt|ati|sen|int|nes|iar| i |hia|n c|sti|chi|ann|ra | eg|egu|isp|bil|ont|a r| no|rop| me|opr|ost| ma|ues|ica|sso|tal|cie|sun|lit|ore|ina|ite|tan| ra|non|gio|d a|e r|dev|i m|l i|ezz|izi| cu|nno|rà |a i|tta|ria|lia|cos|ssu|dal|l p| as|ass|opo|ve |eve",
    "tur": " ve| ha|ve |ler|lar|ir |in |hak| he|her|bir|er |an |arı|eri|ya | bi|ak |r h|eti|ın |iye|yet| ka|ası|ını| ol|tle|eya|kkı|ara|akk|etl|sın|esi|na |de |ek | ta|nda|ini| bu|ile|rın|rin|vey|ne |kla|e h|ine|ır |ere|ama|dır|n h| sa|ına|sin|e k|le | ge|mas|ınd|nın|ı v| va|lan|lma|erk|rke|nma|tin|rle| te|nin|akl|a v|da | de|let|ill|e m|ard|en |riy|aya|nı | hü| şa|e b|k v|kın|k h| me|mil|san| il|si |rdı|e d|dan|hür|var|ana|e a|kes|et |mes|şah|dir| mi|ret|rri| se|ola|ürr|irl|bu |mak| ma|mek|n e|kı |n v|n i|lik|lle| ed| hi|n b|a h| ba|nsa| iş|eli|kar| iç|ı h|ala|li |ulu|rak|evl|e i|ni |re |r ş|eme|etm|e t|ik |e s|a b|iş |n k|hai|nde|aiz| eş|izd|un |olm|hiç|zdi|ar |unm|ma | gö|ilm|lme|im |n t|tir|dil|mal|e g|i v| ko|lun|e e|mel|ket|ık |n s|ele|la |el |r v|ede|şit|ili|eşi|yla|a i| an|anı| et|rı |ahs| ya|sı |edi|siy|t v|i b|se |içi|çin|bul|ame| da|miş|may|tim|a k|tme|r b|ins|yan|nla|mle| di|eye|ger|ye |uğu|erd|din|ser| mü|mem|vle| ke|nam|ind|len|eke|es | ki|n m|it | in| ku|rşı|a s|arş| ay|eml|lek|oru|rme|kor|rde|i m| so|tür|al |lam|eni|nun| uy|ken|hsı|i i|a d|ri |dev|ün |a m|r a|mey|cak|ıyl|maz|e v|ece|ade|iç |şma|mse|te |tün|ims|kim|e y|şı |end|k g|ndi|alı| ce|lem|öğr|ütü|k i|r t| öğ|büt|anl| bü",
    "pol": " pr|nie| i |ie |pra| po|ani|raw|ia |nia|wie|go | do|ch |ego|iek|owi| ni|ści|ci |a p|do |awo| cz|ośc|ych| ma|ek |rze| na|prz| w |wo |ej | za|noś|czł|zło|eni|wa | je|łow|i p|wol|oln| lu|rod| ka| wo|lno|wsz|y c|ma |ny |każ|ażd|o d|stw|owa|dy |żdy| wy|rzy|sta|ecz| sw|dzi|i w|e p|czn|twa|na |zys|ów |szy|ub |lub|a w|est|kie|k m|wan| sp|ają| ws|e w|pow|pos|nyc|rac|spo|ać |a i|cze|sze|neg|yst|jak| ja|o p|pod|acj|ne |ńst|aro|mi | z |i i|nar| ko|obo|awa| ro|i n|jąc|zec|zne|zan|dow| ró|iej|zy |zen|nic|ony|aw |i z|czy|no |nej|o s|rów|odn|cy |ówn|odz|o w|o z|jeg|edn|o o|aki|mie|ien|kol| in|zie|bez|ami|eńs|owo|dno| ob| or| st|a s|ni |orz|o u|ym |stę|tęp|łec|jed|i k| os|w c|lwi|ez |olw|ołe|poł|cji|y w|o n|wia| be|któ|a j|zna|zyn|owe|wob|ka |wyc|owy|ji | od|aln|inn|jes|icz|h p|i s|się|a o|ją |ost|kra|st |sza|swo|war|cza|roz|y s|raz|nik|ara|ora|lud|i o|a z|zes| kr|ran|ows|ech|w p|dów|ą p|pop|a n|tki|stk|gan|zon|raj|e o|iec|i l| si|że |eka| kt| de|em |tór|ię |wni|lni|ejs|ini|odo|dni|ełn|kow|peł|a d|ron|dek|pie|udz|bod|nan|h i|dst|ieg|taw|z p|z w|zeń|god|iu |ano|lar| to|y z|a k|ale|kla|trz|zaw|ich|e i|ier|iko|dzy|chn|w z|by |ków|adz|ekl|ywa|ju |och|kor|sob|ocz|oso|u p|du |tyc|tan|ędz| mi|e s| ta|ki ",
    "gax": "aa |an |uu | ka|ni |aan|umm|ii |mma|maa| wa|ti |nam| fi|ta |tti| na|saa|fi | mi|rga|i k|a n| qa|dha|iyy|oot|in |mir|irg|raa|qab|a i|a k|kan|akk|isa|chu|amu|a f|huu|aba|kka| ta|kam|a a| is|amn|ami|att|ach|mni|yaa| bi|yuu|yyu|ee |wal|miy|waa|ga |ata|aat|tii|oo |a e|moo| ni| ee|ba | ak|ota|a h|i q| ga| dh|daa|haa|a m|ama|yoo|a b|i a|ka |kaa| hi|sum|aas|arg|man| hu| uu|u n| yo| ar| ke| ha|ees| ba|uf |i i|taa|uuf|iin|ada|a w|i f|ani|rra|na |isu| ad|i w|a u|nya|irr|da |hun|hin|ess| ho| ma|i m|und|i b|bar|ana|een|mu |is |bu |f m| ir| sa|u a|add|aad| la|i d|n h|eeg|i h|sa |hoj|abu| ya|kee|al |udh|ook|goo|ala|ira|nda|itt|gac|as |n k|mum|see|rgo|uum|ra |n t|n i|ara|muu|ums|mat|nii|sii|ssa|a d|a q| da|haw|a g|yya|asu|eef|u h|tum|biy| mo|a t|ati|eny|gam|abs|awa|roo|uma|n b|n m|u y|a s|sat|baa|gar|n a|mmo|nis| qo|nna| ku|eer| to|kko|bil|ili|lis|bir|otu|tee|ya |msa|aaf|suu|n d|jii|n w|okk|rka|gaa|ald|un |rum| ye|ame| fu|mee|yer|ero|amm|era|kun|i y|oti|tok|ant|ali|nni| am|lda|lii|n u|lee|ura|lab|aal|tan|laa|i g|ila|ddu|aru|u m|oji|gum|han|ega| se|ffa|dar|faa|ark|n y|hii|qix|gal|ndi| qi|asa|art|ef |uud| bu|jir| ji|arb|n g|chi|tam|u b|dda|bat|di |kar|lam|a l| go|bsi|sad|oka|a j|egu|u t|bee|u f|uun",
    "swh": "a k|wa |na | ya| ku|ya | na| wa|a m| ha|i y|a h|a n|ana|ki |aki|kwa| kw|hak| ka| ma|la |a w|tu |li |a u|ni |i k|a a|ila| ki|ali|a y|ati|za |ili|ifa| mt|ke | an|kil|kat|mtu|ake|ote|te |ka |ika|ma |we |a s|yo |fa |i n|ata|e k|ama|zi |amb|u a|ia |u w| yo|azi|kut|ina|i z|asi| za|o y|uhu|yak|au |ish|mba|e a|u k|hur|ha |tik|wat| au|uru| bi|sha|mu |ara|u n| as|hi | hi|ru |aif|tai|cha|ayo|a b|hal| uh| ch|yot|i h| zi|awa|chi|atu|e n|ngi|u y|mat|shi|ani|eri| am|uli|ele|sa |ja |e y|a t|oja|o k|nch|i a|a j| nc|ima| sh|ami| ta|end|any|moj|i w|ari|ham|uta|ii |iki|ra |ada|wan|wak|nay|ye |uwa| la|ti |eza|o h|iri|iwa|kuw|iwe| wo|fan| sa|she|bu |kan|ao |jam|wen|lim|i m|her|uto|ria| ja| ni|kam|di | hu|zo |a l|da |kaz|ahi|amu|wot|o w|si |dha|bin|ing|adh|a z|bil|e w|nya|kup|har|ri |ang|aka|sta|aji|ne |kus|e m|zim|ini|ind|lin|kul|agu|kuf|ita|bar|o n|uu |iyo|u h|nad|maa|mwe|ine|gin|nye|nde|dam|ta | nd|ndi|rik|asa| ba|rif|uni|nga|hii|lez|bo |azo|uzi|mbo|sil|ush|tah|wam|ibu|uba|imu| ye|esh| ut|taa|aar|wez|i s|e b| si|ala|dhi|eng|aza|tak|hir|saw|izo|kos|tok|oka|yan|a c|wal|del|i b|pat| um|ndo|zwa|mam|a i|guz|ais|eli|mai|laz|ian|aba|man|ten|zin|ba |nda|oa |u m|uku|ufu| mw|liw|aha|ndw|kuh|ua |upa| el|umi|sia",
    "sun": "an |na |eun| ka|ng | sa|ana|ang| di|ak | ha|nga|hak|un |ung|keu|anu| ba| an|nu |a b| bo| je|a h|ata|asa|jeu|ina| ng|ara|nan|awa|gan|ah |sa |a k| na|n k|kan|aha|a p|a s|ga |ban| ma|a n|ing|oga|bog|sar| pa| ku|man|a a|ha |san|ae |bae|din|g s|aga|sah|ra |tan|n s| pe|ala| si|kat|ma |per| ti|aya|sin| at| pi| te|n a|aan|lah|pan|gar|n n|u d|ta |eu |ari|kum|ngs|a m|n b|n d|ran|a d|gsa|wa |taw|k h|ama|ku |ike|n p|eba|bas| ja|al |a t|ika|at |beb|kab|pik|asi|atu|nda|una|a j|nag|e b|n h|en |g k|oh |aba|ila|rta|aku|boh|ngg|abe|art|ar |n j|di |ima|um |ola|geu|usa|aca|sak|adi|k a|udu|teu|car|tin| me| ay|h k| po|eh |u s|aka|rim|ti |sac|k n|ngt|jen|awe|ent|u a|uma|teh|law|ur |h s|dan|bar|uku|gaw|aru|ate|iba|dil|pol|aja|ieu|ere|jal|nar| hu|n t|nya|pa |are|upa|mas|ake|ut |wan| ge|kal|nus| so|ngk|ya |yan|huk| du|tun| mi|mpa|isa|lan|ura|u m|uan|ern|ena|nte|rup|tay|n m| ke|ka |han|und|us |h b|kud|ula|tut| tu| ie|hna|kaw|u k|lak|gam|mna|umn|g d| nu|yun|ri |ayu|wat| wa|eri|g n|a u|i m|u p| ta|du |dit|umu|k k|ren|mba|rik|gta| be|ali|h p|h a|eus|u n|alm|il | da|sas|ami|min|lma|ngu|nas|yat|rak|amp|mer|k j|sab|mum| ra|rua|ame|ua |ter|sal|ksa|men|kas|nge|k d|ona| bi|bis|sio|ion|nal|taa| de|uh |gal|dip|we |bad",
    "ron": " de|și | și|re | în|are|te |de |ea |ul |rep|le |ept|dre|e d| dr|ie |în |e a|ate|ptu| sa|tul| pr|or |e p| pe|la |e s|ori| la| co|lor| or|ii |rea|ce |au |tat|ați| a | ca|ent| fi|ale|ă a|a s| ar|ers|per|ice| li|uri|a d|al | re|e c|ric|nă |i s|e o|ei |tur| să|lib|con|men|ibe|ber|rso|să |tăț|sau| ac|ilo|pri|ăți|i a|i l|car|l l|ter| in|ție|că |soa|oan|ții|lă |tea|ri |a p| al|ril|e ș|ană|in |nal|pre|i î|uni|ui |se |e f|ere|i d|e î|ita| un|ert|ile|tă |a o| se|i ș|pen|ia |ele|fie|i c|a l|ace|nte|ntr|eni| că|ală| ni|ire|ă d|pro|est|a c| cu| nu|n c|lui|eri|ona| as|sal|ând|naț|ecu|i p|rin|inț| su|ră |e n| om|ici|nu |i n|oat|ări|l d| to|tor| di| na|iun| po|oci|tre|ni |ste|soc|ega|i o|gal| so| tr|ă p|a a|n m|sta|va |ă î|fi |res|rec|ulu|nic|din|sa |cla|nd | mo| ce| au|ara|lit|int|i e|ces|uie|at |rar|rel|iei|ons|e e|leg|nit|ă f| îm|a î|act|e l|ru |u d|nta|a f|ial|ra |ă c| eg|ță | fa|i f|rtă|tru|tar|ți |ă ș|ion|ntu|dep|ame|i i|reb|ect|ali|l c|eme|nde|n a|ite|ebu|bui|ât |ili|toa|dec| o |pli|văț|nt |e r|u c|ța |t î|l ș|cu |rta|cia|ane|țio|ca |ită|poa|cți|împ|bil|r ș| st|omu|ăță|țiu|rie|uma|mân| ma|ani|nța|cur|era|u a|tra|oar| ex|t s|iil|ta |rit|rot|mod|tri|riv|od |lic|rii|eze|man|înv|ne |nvă|a ș|cti",
    "hau": "da | da|in |a k|ya |an |a d|a a| ya| ko| wa| a |sa |na | ha|a s|ta |kin|wan|wa | ta| ba|a y|a h|n d|n a|iya|ko |a t|ma |ar | na|yan|ba | sa|asa| za| ma|a w|hak|ata| ka|ama|akk|i d|a m| mu|su |owa|a z|iki|a b|nci| ƙa| ci| sh|ai |kow|anc|nsa|a ƙ|a c| su|shi|ka | ku| ga|ci |ne |ani|e d|uma|‘ya|cik|kum|uwa|ana| du| ‘y|ɗan|ali|i k| yi|ada|ƙas|aka|kki|utu|n y|a n|hi | ra|mut| do| ad|tar| ɗa|nda| ab|man|a g|nan|ars|and|cin|ane|i a|yi |n k|min|sam|ke |a i|ins|yin|ki |nin|aɗa|ann|ni |tum|za |e m|ami|dam|kan|yar|en |um |n h|oka|duk|mi | ja|ewa|abi|kam|i y|dai|mat|nna|waɗ|n s|ash|ga |kok|oki|re |am |ida|sar|awa|mas|abu|uni|n j|una|ra |i b| ƙu|dun|a ‘|cew|a r|aba|ƙun|ce |e s|a ɗ|san|she|ara|li |kko|ari|n w|m n|buw|aik|u d|kar| ai|niy| ne|hal|rin|bub|zam|omi| la|rsa|ubu|han|are|aya|a l|i m|zai|ban|o n|add|n m|i s| fa|bin|r d|ake|n ‘|uns|sas|tsa|dom| ce|ans| hu|me |kiy|ƙar| am|ɗin| an|ika|jam|i w|wat|n t|yya|ame|n ƙ|abb|bay|har|din|hen|dok|yak|n b|nce|ray|gan|fa |on | ki|aid| ts|rsu| al|aye| id|n r|u k|ili|nsu|bba|aur|kka|ayu|ant|aci|dan|ukk|ayi|tun|aga|fan|unc| lo|o d|lok|sha|un |lin|kac|aɗi|fi |gam|i i|yuw|sun|aif|aja| ir|yay|imi|war| iy|riy|ace|nta|uka|o a|bat|mar|bi |sak|n i| ak|tab|afi|sab",
    "fuc": "de | e |e n|nde| ha|la |e e|akk| ka| nd|ina| wa|al |hak|na |ndi| in|kke|ɗo |di |ii |aad|ade|um |ko |i h|ala| mu|lla| ne| jo|mum|wal|ji | fo|all|eɗɗ|neɗ| le|kal|e h| ko|taa|re | ng|aaw|aa |e k|e w|ee |jog|ley|e m|laa|ke |ɗɗo|e l|eed|nnd|aag|ol | ta|kee|gu |o k|ogi|ond|le |eji|waa|am |dee|nga|a j|ti |gal|m e|awa|e d|ɗe | wo|ɓe |eej|gii|ede|gol| re|aan|i e| go|agu|e t|ann|eyd|fot|oti|ɗee|naa| de| po|pot|maa|oto|ydi|enn|i n| he|ni |een|taw|e j|goo|a k|to |dim|e f|a i|der| aa|ele| fa|o n|ngu|oot|dir| ba|er |a f|ndo|ima|ay | sa|ota|ka |oor|a n|won|ngo|i k|tee|a e| ja|e ɓ|o f|i w| to|wa |i f|ren|hay|and|a w|awi|ore|o t|eyɗ|ma |nan|yɗe|o e|kam|i m|too|fof|e y|hee|aak| do|eel|of |nka|ñaa|e g|e s|l e|ira| la|e i|tin|e r|aar|ani| ɓe| te|are|ral|a t| so|dii|e p| na|o w| ho|oo |ooj| ña|en |gaa|kaa| yi|so | mo|und|nng|faw|nge| ma|aam|woo|awo| ya|dow|u m|i l|e b| mb|ita|ude|o h|igg|ɗi |o i| li|nda|e a|lig| o | nj|baa|haa|tal|tuu|tii| tu|aaɗ|a h| no| di| fe|iiɗ|ama|inn|iin|iti|den|yan| da|go | hu|ank|guu|do |mii| ke|l n|a d|bel|imɓ|je |jey|yim|no |ugn|uug|ano|ine|non|nee|lit|lli|njo|edd| je|ŋde|aŋd|jaŋ|mɓe|ow | su|ent|wit|alt|i a|ago| ɗe|l h| ɗu|y g|gna|m t|nna|a a| ɓa|ɓam|amt|ind|ɗɗa|tde|aga|eɗe",
    "nld": "en |de |an | de|van| va| en| he|ing|cht|der|ng |n d|n v|et |een| ge|ech|n e|ver|rec|nde| ee| re| be|ede|er |e v|gen|den|het|ten| te| in| op|n i| ve|lij| zi|ere|eli|zij|ijk|te |oor|ht |ens|n o|and|t o|ijn|ied|ke | on|eid|op | vo|jn |id |ond|in |sch| vr|aar|n z|aan| ie|rde|rij|men|ren|ord|hei|hte| we|eft|n g|ft |n w|or |n h|eef|vri|wor| me|hee|al |t r|of |le | of|ati|g v|e b|eni| aa|lle| wo|n a|e o|nd |r h|voo| al|ege|n t|erk| da| na|t h|sta|jke|at |nat|nge|e e|end| st|om |e g|tie|n b|ste|die|e r|erw|wel|e s|r d| om|ij |dig|t e|ige|ter|ie |gel|re |jhe|t d| za|e m|ers|ijh|nig|zal|nie|d v|ns |d e|e w|e n|est|ele|bes| do|g e|che|vol|ge |eze|e d|ig |gin|dat|hap|cha|eke| di|ona|e a|lke|nst|ard| gr|tel|min| to|waa|len|elk|lin|eme|jk |n s|del|str|han|eve|gro|ich|ven|doo| wa|t v|it |ove|rin|aat|n n|wet|uit|ijd|ze | zo|ion| ov|dez|gem|met|tio|bbe|ach| ni|hed|st |all|ies|per|heb|ebb|e i|toe|es |taa|n m|nte|ien|el |nin|ale|ben|daa|sti| ma|mee|kin|pen|e h|wer|ont|iet|tig|g o|s e| er|igd|ete|ang|lan|nsc|ema|man|t g|is |beg|her|esc|bij|d o|ron|tin|nal|eer|p v|edi|erm|ite|t w|t a| hu|rwi|wij|ijs|r e|weg|js |rmi|naa|t b|app|rwe| bi|t z|ker|ame|eri|ken| an|ar | la|tre|ger|rdi|tan|eit|gde|g i|d z|oep",
    "hrv": " pr| i |je |rav|pra|ma | na|ima| sv|na |ti |a p|nje| po|a s|anj|a i|vo |ko |da |vat|va |no | za|i s|o i|ja |avo| u | im|sva|i p| bi|e s|ju |tko|o n|li |ili|van|ava| sl|ih |ne |ost| dr|ije| ne|jed|slo| ra|u s|lob|obo| os|bod| da| ko|ova|nja|koj|i d|atk|iti| il|stv|pri|om |im | je| ob| su| ka|i i|i n|e i|vje|i u|se |dru|bit|voj|ati|i o|ćen|a o|o p|a b|a n|ući| se|enj|sti|a u|edn|dje|lo |ćav| mo|raz|u p| od|ran|ni |rod|a k|su |aro|drć|svo|ako|u i|rća|a j|mij|ji |nih|eni|e n|e o| nj|pre|pos|ćiv|oje|eno|e p|nar|oda|nim|ovo|aju|ra |ći |og |nov|iva|a d|nos|bra|bil|i b|avn|a z|jen|e d|ve |ora|tva|jel|sta|mor|u o|cij|pro|ovi|za |jer|ka |sno|ilo|jem|red|em |lju|osn|oji| iz|aci| do|lje|i m| ni|odn|nom|jeg| dj|vno|vim|elj|u z|o d|rad|o o|m i|du |uje| sa|nit|e b| st|oj |tit|a ć|dno|e u|o s|u d|eću|ani|dna|nak|nst|stu| sm|e k|u u|an |gov|nju|juć|aln|m s|tu |a r|ćov|jan|u n|o k|ist|ću |te |tvo|ans|šti|nu |ara|nap|m p|nić|olj|bud| bu|edi|ovj|i v|pod|sam|obr|tel| mi|ina|zaš|e m|ašt| vj|ona|nji|jek| ta|duć|ija| ćo|tup|h p|oja|smi|ada| op|oso|una|sob|odu|dni|rug|udu|ao |di |avi|tno|jim|itu|itk|će |odr|ave|meć|nog|din|svi| ći|kak|kla|rim|akv|elo|štv|ite|vol|jet|opć|pot|tan|ak |nic|nac|uće| sk| me|ven",
    "srp": " pr| i |rav|pra| na|na |ma | po|je | sv|da |a p|ima|ja |a i|vo |nje|va |ko |anj|ti |i p| u |ako|a s| da|avo|i s|ju |ost| za|sva|o i|vak| im|e s|o n|ava| sl|nja| ko|no |ne |li |om | ne|ili| dr|u s|slo|koj|a n|obo|ih |lob|bod|im |sti|stv|a o| bi| il| ra|pri|a u|og | je|jed|e p|enj|ni |van|u p|nos|a d|iti|a k|edn|i u|pro|o d|ova| su|ran|cij|i i|sta|se | os|e i|dru| ob|i o|rod|aju|ove| de|i n| ka|aci|e o| ni| od|ovo|i d|ve | se|eni|voj|ija|su |u i|žav|avn|uje| st|red|m i|dna|a b|odi|ara|drž|ji |nov|lju|e b|rža|tva|što|u o|oja| ov|a j|odn|u u|jan|poš|jen| nj|nim|ka |ošt|du |raz|a z| iz|sno|o p|vu |u n|u d|šti|osn|e d|pre|u z|de |ave|nih|bit|aro|oji|bez|tu |gov|lje|ičn| sa|lja|svo|lo |za |vno|e n|eđu| tr|nar| me|vim|čno|oda|ani|đen|nac|nak|an |to |tre|ašt| kr|stu|nog|o k|m s|tit|aln|nom|oj |pos|e u|reb| vr|olj|dno|iko|ku |me |nik| do|ika|e k|jeg|nst|tav|em |i m|sme|o s|dni|bra|nju|šen|ovi|tan|te |avi|vol| li|zaš|ilo|rug|var|kao|ao |riv|tup|st |živ|ans|eno|čov|štv|kla|vre|bud|ena| ve|ver|odu|međ|oju|ušt| bu|kom|kri|pod|ruš|m n|i b|ba |a t|ugi|edi| mo|la |u v|kak| sm|ego|akv|o j|rad|dst|jav|del|tvo| op|nu |por|vlj|avl|m p|od |jem|oje| čo|a r|sam|i v|ere|pot|o o|šte|rem|vek|svi| on|rot|e r",
    "bos": " pr| i |je |rav| na|pra|na |da |ma |ima| sv|a s|nje|a p| da| po|anj|a i|vo |va |ko |ja | u |ako|o i|no | za|e s|ju |avo| im|ti |sva|ava|i p|o n|li |ili|i s|van|ost| ko|vak|ih |ne |a u| sl|nja|koj| dr| ne|jed| bi|i d|ije|stv|u s|lob|im |slo| il|bod|obo| ra|sti|pri| je| su|vje|om |a d|se |e i| ob|a n|i i| se|dru|enj| os|voj|cij|e p|a b|su |o d|uje|u p|raz|i n|a o| od|lo |u o|ova|u i|edn|i u| nj|ovo|jen|lju|ni |oje|nos|a k|ran|dje|iti|o p|aci|žav|a j|i o|e o|pre|pro|bra|nih|ji | ka|e d|jeg|og |sta| tr|tre|bud|u n|drž|u z|rža|bit|svo|ija|elj|reb|e b|mij|jem|avn|pos| bu|ka |aju| iz|ba |ve |rod|de |aro|e u|iva|a z|em |šti|ilo|eni|lje|ći |red|bil|jel|jer| ni|odn|m i|du |tva|nar|gov| sa|oji| do|tu |vim|u d| st|o k|e n|a t|za |nim| dj| sm|ući|ičn|dna|i m|oda|vno|eba|ist|nac|e k|čno|nak|ave|tiv|eđu|nov|olj|sno|ani|aln|an |nom|i b|stu|nst|eno|oj |osn|a r|ovj|nap|smi|nog|čov|oja|nju|ara|nu |dno|ans|ovi|jan|edi|m s| kr|h p|tup| op| čo|iko|jek|tvo| vj| mi|tel|vu |obr|živ|tit|o o|una|odu| mo| ov|kri|ego|din|rug|nik|rad|pod|nji|sam|sto|lja|dst|rim|ite|riv| te|m n|vol|i v|e t|vni|akv|itu|g p| ta|ašt|zaš|svi|ao |te |o s|ak |mje|a č|odr|udu|kla|i t|avi|tno|nič| vr|nic|dni|u u|ina| de|oba|od |jih|st ",
    "ckb": " he| û |ên | bi| ma|in |na | di|maf|an |ku | de| ku| ji|xwe|her| xw|iya|ya |kes|kir|rin|iri| ne|ji |bi |yên|afê|e b|de |tin|e h|iyê|ke |es |ye | we|er |di |we |ê d|i b| be|erk|ina| na| an|î û|yê |eye|î y|kî |rke|nê |diy|ete|eke|ber|hem|hey| li| ci|wek|li |n d|fê | bê| te|ne |yî | se|net|rî |tew|yek|sti|af | ki|re |yan|n b|kar|hev|e k|aza|n û|wî | ew|i h|n k|û b|î b| mi| az|dan| wî|ekî|î a|a m|zad|e d|mir|bin|est|ara|iro|nav|ser|a w|adi|rov|n h|anê|tê |ewe|be |ewl|ev |mû | ya|tî |ta |emû| yê|ast|wle| tê|n m| bo|wey|s m|bo | tu|n j|ras| da| me|din|î d|ê h|n n|n w|ing|st | ke| ge|în |ar | pê|iye|îna|bat|r k|ema|cih|ê b|wed|û m|dî |û a|vak|ê t|ekh|par| ye|vî |civ|n e|ana|î h|ê k|khe|geh|nge|ûna|fên|ane|av |î m|bik|eyê|eyî|e û| re|man|erb|a x|vê |ê m|iva|e n|hî |bûn|kê | pa|erî|jî |end| ta|ela|nên|n x|a k|ika|f û|f h|î n|ari|mî |a s|e j|eza|tên|nek| ni|ra |ehî|tiy|n a|bes|rbe|û h|rwe|zan| a |erw|ov |inê|ama|ek |nîn|bê |ovî|ike|a n| ra|riy|i d|anî|û d|e e|etê|ê x|yet|aye|ê j|tem|e t|erd|i n|eta|ibe|a g|u d|xeb|atê|i m|tu | wi|dew|mal|let|nda|ewa| ên|awa|e m|a d|mam|han|u h|a b|pêş|ere| ba|lat|ist| za|bib|uke|tuk|are|asî|rti|arî|i a|hîn| hî|edi|nûn|anû|qan| qa| hi| şe|ine|n l|mên|ûn |e a",
    "yor": "ti | ní|ó̩ | è̩|ní | lá|̩n |o̩n|é̩ |wo̩|àn | e̩|kan|an |tí | tí|tó̩| kò|ò̩ |̩tó| àw| àt|è̩ |è̩t|e̩n|bí |àti|lát|áti| gb|lè̩|s̩e| ló| ó |àwo|gbo|̩nì|n l| a | tó|í è|ra | s̩|n t|ò̩k|sí |tó |̩ka|kò̩|ìyà|o̩ | sí|ílè|orí|ni |yàn|dè |̩‐è|ì k|̩ à|èdè| or|ún |ríl|è̩‐|í à|jé̩|‐èd|àbí|̩ò̩|ò̩ò|tàb|nì |í ó|n à| tà|̩ l|jo̩| ti|̩e |̩ t| wo|nìy|í ì|ó n| jé| sì|ló |kò |n è|wó̩| bá|n n|sì | fú|̩ s|í a|rè̩|fún| pé| òm|̩ni|gbà| kí| èn|ènì|in |òmì|ìí |ba |nir|pé |ira|mìn|ìni|n o|ràn|ìgb| ìg|bá |e̩ | rè|̩ n|kí |n e|un |gba|̩ p|í ò|nú | o̩|nín|gbé|yé | ka|ínú|a k|fi | fi|mo̩|bé̩|o̩d|dò̩|̩dò|ó s|i l|̩ o|̩ ì|wà |í i|i ì|hun|bò |i ò|dá |bo̩|o̩m|̩mo|̩wó|bo |áà |̩ k|ó j|ló̩|àgb|ohu| oh| bí| ò̩|bà |ara|yìí|ogb|írà|n s|ú ì| ìb|pò̩|í k| lè|bog|i t|à t|óò |yóò|kó̩|gé̩|à l|ó̩n|rú |lè | yó|̩ ò|̩ e|a w|̩ y|ò̩r|̩ f| wà|ò l|í t|ó b|i n|ó̩w|̩gb|yí |í w|ìké|̩ a|láà|wùj|àbò|i è|ùjo|fin|é̩n|n k|í e|i j|ú à| ìk|òfi| òf| ar|i s|mìí|ìír| mì| ir|rin|náà| ná|jú |̩ b| yì|ó t|̩é̩| i |̩ m|fé̩|kàn|rí |ú è|à n|wù |s̩é|é à| mú| èt|áyé|í g|̩kó|̩dá|è̩d|àwù|è̩k| ìd|irú|í o|i o|i à|láì|í n|ípa| kú|níp| ìm|a l|ké̩|bé |i g|de |ábé|ìn |báy|̩è̩|ígb|wò̩|níg|mú |láb| àà|n f|è̩s|̩ w|ùn |i a|ayé|èyí| èy|mó̩|á è| ni|n b| wó|je̩| ìj|gbá|ò̩n|ó̩g",
    "uzn": "lar|ish|an |ga |ar | va| bi|da |va |ir | hu|iga|sh |uqu|shi|bir|quq|huq|gan| bo| ha|ini|ng |a e|r b| ta|lis|ni |ing|lik|ida|oʻl|ili|ari|nin|on |ins| in|adi|nso|son|iy | oʻ|lan| ma|dir|hi |kin|har|i b|ash| yo|boʻ| mu|dan|uqi|ila|ega|qla|r i|qig|oʻz| eg|kla|a b|qil|erk|ki | er|oli|nli|at | ol|gad|lga|rki|oki|i h|a o| qa|yok|lig|osh|igi|ib |las|n b|atl|n m| ba|ara| qi|ri | sh|iya|ala|lat|in |ham|bil|a t|a y|bos|r h|siy|n o|yat|inl|ik |a q|cha|a h| et|eti|nis|a s|til|ani|h h|i v|mas|tla|osi|asi| qo|ʻli|ati|i m|rni|im |uql|arn|ris|qar|a i|gi | da|n h|ha |sha|i t|mla|rch| xa|i o|li |hun|bar|lin|ʻz |arc|rla| bu|a m|a a| as|mum| be| tu|aro|r v|ikl|lib|taʼ|h v|tga|tib|un |lla|mda| ke|shg| to|n q|sid|n e|mat|amd|shu|hga| te|tas|ali|umk|oya|hla|ola|aml|iro|ill|tis|iri|rga|mki|irl| ya|xal|dam| de|gin|eng|rda|tar|ush|rak|ayo| eʼ| so|ten|alq| sa|ur | is|imo|r t| ki|mil| mi|era|zar|hqa|aza|k b| si|nda|hda|kat|ak |oʻr|n v|a k|or |rat|ada|ʻlg|miy|tni|i q|shq|oda|shl|bu |dav|nid|y t|ch |asl|sos|ilg|aso|n t|atn|sin|am |ti |as |ana|rin|siz|yot|lim|uni|nga|lak|n i|a u|qon|i a|h k|vla|avl|ami|dek| ja|ema|a d|na | em|ekl|gʻi|si |i e|ino| ka|uch|bor|ker| ch|lma|liy|a v|ʼti|lli|aka|muh|rig|ech|i y|uri|ror",
    "ibo": "a n|e n|ke | na|na | ọ | bụ| n |nwe|ere|ọ b|re |nye| nk|ya |la | nw| ik| ma|ye |e ọ|ike|a o|nke|a m|ụ n| ya|a ọ|ma |bụl|ụla| on| a |e i|kik|iki|ka |ony|ta |bụ |kwa| nd|a i|i n|di |a a|wa |wer|do | mm|dụ |e a|ha | ga|any| ob|ndi| ok|he |e m|e o|a e|ọ n|ite|rụ |hi |mma|ga‐|wu |ara| dị|aka|che|oke|we |o n| ih|n o|adụ|mad|obo|bod|a g|odo| ka| ez|te |hị |be |ụta|dị | an|zi | oh|a‐e|akw|gba|i m|me | ak|u n|nya|ihe|ala|ohe|ghi|ri | ọz|her|ra |weg| nt| iw| mb|ba |pụt| si|ro |oro|iwu|chi|a‐a|rị |ụ i|ụ ọ| eb|iri|ebe|ụrụ|zọ | in|a y|ezi|e ị|kpa|le |ile|ịrị|n e|kpe|mba| ha|bi |sit|e e|inw|nil|asị| en|mak|a u| ni|apụ|chị|i i|ghị|i ọ|i o|si | e |ide|o i|e y|ụ m|a s|u o|kwu|ozu|yer|ru |enw|ụ o|ọzọ|gid|hụ |n a|ahụ|nkw|sor|egh|edo|a ụ|tar|n i|toz|ị o|pa |i a| me|ime|uru|kwe| mk|tu |ama|eny|uso|de | im|ọ d|osi|hed|a d| kw|mkp|wet| ọr| ọn|obi|ọrụ| ịk| to|gas| ch|ịch|nha|ọnọ|nọd| nc| al|n ụ|ị m| us|nọ |u ọ|nch| o |eta|n u| ot|otu|sir|sịr| nh|a k|ali|o m| ag| gb|e s|ọta|nwa|ị n|lit|ega|ji |ọdụ|e k|ban|e g|ị k|esi|agb|eme|hu |ikp|zu |pe |nta|na‐|chọ|u a|a b|uch|n ọ|onw|ram|kwụ|ekọ|i e| nọ| ug|ọch|u m|gwu|a h|zụz|ugw|meg|ị e|nat|e h|dịg|o y|kpu|pụr|cha|zụ |hịc|ich| ng|ach| og|wap|wan|ịgh|uwa| di| nn|i ị",
    "ceb": "sa | sa|ng |ang| ka|an | pa|ga | ma|nga|pag| ng|a p|on |kat|a k|ug |od | ug|g m| an|ana|n s|ay |ung|ata|ngo|a m|atu|ala|san|ag |tun|g s|g k|god|d s|a s|ong|mga| mg|g p|n u|yon|a a|pan|ing|usa|tan|tag|una|aga|mat|ali|g u|han|nan| us|man|y k|ina|non|kin| na|syo|lan|a b|asa|nay|n n|a i|awa| ta|taw|gaw|nsa|a n|nas| o |ban|agp|isa|dun|was|iya| gi|asy|adu|ini|bis| ad|ili|o s| bi|g a|nah|nag|a t| ki|lin|lay|ahi|sam|al |wal| di|nal|asu| ba|ano|agt| wa|ama|yan|a u| iy|kan|him|n k|gan|ags|n a|kag| un|ya |kas|gpa|g t| su|aha|wha|agk|awh|gka|a g|kal|l n|gla|gsa|sud|gal|imo|ud |d u|ran|uka|ig |aka|aba|ika|g d|ara|ipo|ngl|g n|uns|n o|kau|i s|y s|og |uta|d n|li | si|gik|g i|mta|ot |iin| la| og|o a|ayo|ok |awo|aki|kab|aho|n m|hat|o p|gpi|a w|apa|lip|ip | hu| ga|a h|uba|na | ti|bal|gon|la |ati|wo |ad |hin|sal|gba|buh| bu| ub|uha|agb|hon|ma |nin|uga|t n|ihi| pi|may| pu|mak|ni | ni|d a|pin|abu|agh|ahu|uma|as |dil|say| in|at |ins|lak|hun|ila|mo |s s|sak|amt|o u|pod|ngp|tin|a d|but|ura|lam|aod|t s|bah|ami|aug|mal|sos|os |k s| il|tra| at|gta|bat|aan|ulo|iha|ha |n p| al|g b|lih|kar|lao|agi|amb|mah|ho |sya|ona|aya|ngb|in |inu|a l| hi|mag|iko|it |agl|mbo|oon|tar|o n|til|ghi|rab|y p| re|yal|aw |nab|osy|dan",
    "tgl": "ng |ang| pa|an |sa | sa|at | ka| ng| ma|ala|g p|apa| na|ata|pag|pan| an| at|ay |ara|ga |a p|tan|g m|mga| mg|n n|pat| ba|n a|aya|na |ama|g k|awa|kar|a k|lan|rap|gka|nga|n s|g n|aha|g b|a a| ta|agk|gan|tao|asa|aka|yan|ao |a m|may|man|kal|ing|a s|nan|aga| la|ban|ali|g a|ana|y m|kat|san|kan|g i|ong|pam|mag|a n|o a|baw|isa|wat| y |lay|g s|y k|in |ila|t t| ay|aan|o y|kas|ina|t n|ag |t p|wal|una|yon| o | it|nag|lal|tay|pin|ili|ans|ito|nsa|lah|kak|any|a i|nta|nya|to |hay|gal|mam|aba|ran|ant|agt|on |t s|agp| wa| ga|gaw|han|kap|o m|lip|ya |as |g t|hat|y n|ngk|ung|no |g l|gpa|wa |lag|gta|t m|kai|yaa|sal|ari|lin|a l|pap|ahi| is| di|ita| pi|pun|agi|ipi|mak|a b|y s|bat|yag|ags|o n|aki|tat|pah|la |gay|hin| si|di |i n|sas|iti|a t|t k|mal|ais|s n|t a|al |ipu|ika|lit|gin| ip|ano|gsa|alo|nin|uma|hal|ira|ap |ani|od |i a|gga|y p|par|tas|ig |sap|ihi|nah|ini| bu|ngi|syo|o s|nap|o p|a g| ha|uka|a h|aru|a o|mah|iba|asy|li |usa|g e|uha|ipa|mba|lam|kin|kil|duk|n o|iga| da|dai|aig|igd|gdi|pil|dig|pak| tu|d n|sam|nas|nak|ba |ad |lim|sin|buh|ri |lab|it |tag|g g|lun|ain|and|nda|pas|kab|aho|lig|nar|ula| ed|edu| ib|git|ma |mas|agb|ami|agg|gi |sar|i m|siy|g w|api|pul|iya|amb|nil|agl|sta|uli|ino|abu|aun|ayu| al|iyo",
    "hun": " sz| a |en | va|és | és|min|ek | mi| jo|jog|ind|an |nek|sze|ság| az|gy |sza|nde|ala|az |den|a v|val|ele| el|oga|mél|egy| eg|n a|ga |zab| me|zem|emé|aba|int|van|bad|tel|tet| te|ak |tás|ény|t a| ne|gye|ély|tt |n s|ben|ség|zet|lam|meg|nak|ni | se|ete|sen|agy|let|lyn|s a|yne|ra |z e|et | al|mel|kin|k j|eté|ok |tek| ki|vag|re |n m|oz |hoz|ez |s s|ett|gok|ogy| kö|mbe|es |em |nem|ely| le|ell|emb|hog|k a|atá|köz|nt | ho|yen|hez|el |z a|len|dsá|ásá|tés|ads|k m| ál| em|a s|nte|a m|szt|a t|áll|ás |y a|ogo|sem|a h|enk|nye|ese|nki|ágo|t s|lap|ame|ber|ló |k é|nyi|ban|mén|s e|i m|t m| vé|lla|ly |ébe|lat|ág |ami|on |mze|n v|emz|fel|a n|lő |a a|eki|eri|yes| cs|lle|tat|elő|nd |i é|ég |ésé|lis|yil|vet|át |kül|ért| ke|éte|rés|l a|het|szo|art|alá| ny|tar|koz| am|a j|ész|enl|elé|ól |s k|tár|s é|éle|s t|lem|sít|ges|ott| fe|n k|tko|zás|t é|kel|ja | ha|aló|zés|nlő|ése|ot |ri |lek|más|tő |vel|i j|se |ehe|tes|eve|ssá|tot|t k|olg|eze|i v|áza|leh|n e|ül |tte|os |ti |atk|zto|e a|tos|ány|ána|zte|fej|del|árs|k k|kor|ége|szá|t n| bi|zat|véd|nev|elm|éde|zer|téb|biz|rra|ife|izt|ere|at |ll |k e|ny |sel| né|ába|lt |ai |sül|ház|kif|t e| ar|leg|d a|is |i e|arr|t t|áso|it |ető|al | má|t v| bá|bár|a é|esü|lye|m l| es|nyo",
    "azj": " və|və |ər |lar| hə|in |ir | ol| hü| bi|hüq|üqu|quq|na |lər|də |hər| şə|bir|an |lik| tə|r b|mal|lma|ası|ini|r h|əxs|şəx|ən |arı|qla|a m|dir|aq |uqu|ali| ma|una|ilə|ın |yət| ya|ara|ikd|əri|ar |əsi|əti|r ş|rin|yyə|n h| az|dən|nin|ərə|tin|iyy|mək|zad| mü|sin| mə|ni |nda|ət |ndə|aza|rın|ün |ını|ə a|i v|nın|olu|qun| qa| et|ilm|lıq|ə y|ək |lmə|lə |kdi|ind|ına|olm|lun|mas|xs |sın|ə b| in|n m|q v|nə |əmi|n t|ya |da | bə|tmə|dlı|adl|bər| on|əya|ə h|sı |nun|maq|dan|inə|etm|un |ə v|rlə|n b|si |raq| va|ə m|n a|ınd|rı |anı| öz|əra|nma|n i|ama|a b|irl|ala|li |ins|bil|ik | al| di|ığı|ə d|lət|il |ələ|ə i|ıq |nı |nla|dil|müd|n v|ə e|unm|alı| sə|xsi|ə o|uq |uql|nsa|ətl| də|ili|üda|asi| he|ola|san|əni|məs| da|lan| bu|tər|həm|dır|kil|iş |u v| ki|min|eyn|mi |yin| ha|sos|heç|bu |eç | ed|kim|lığ|alq|xal| as|sia|osi|r v|q h|rə |yan|i s| əs|daf|afi| iş|ı h|fiə| ta|ə q|ıql|a q|yar|sas|lı |ill|mil|əsa|liy|tlə|siy|a h|məz|tün|ə t| is|ist|iyi| so|n ə|al |ifa|ina|lıd|ı o|ıdı|əmə|ır |ədə|ial| mi|əyi|miy|çün|n e|iya|edi| cə| bü|büt|ütü|xil|üçü|mən|adə|t v|a v|axi|dax|r a|onu| üç|seç| nə| se|man|ril|sil|əz |iə |öz |ılı|aya|qan|i t|şər|təm|ulm|rəf|məh| xa|ğın| dö| ni|sti|ild|amə|qu |nam|n o|n d|var|ad |zam|tam|təh",
    "ces": " pr| a |ní | ne|prá|ráv|ost| sv| po|na |ch |ho | na|nos|o n| ro|ání|ti |vo |neb|ávo|má |bo |ebo| má|kaž| ka|ou |ažd| za| je|dý |svo|ždý| př|a s| st|sti|á p| v |obo|vob| sp|bod| zá|ých|pro|rod|ván|ení|né |ý m|ého| by| ná|spo|ně |o p|mi |í a|ter|roz|ová|to | ja| li|áro|nár|by |jak|a p|a z|ny | vš|kte|i a|lid|ím |o v|í p|u p|mu |at | vy|odn| so| ma|a v| kt|í n|zák|li |oli|ví |kla|tní|pod|stá|en |do |t s|mí |je |em |áva| do|byl| se|být|í s|rov| k |čin| ve|ýt |í b|it |dní|vše|pol|o s| bý|tví|nýc|stn|nou|ejn|sou|ran|ci |vol|se |nes|a n|pří|eho|ným|tát|va |ním|mez|ají|i s|stv|ké |ích|ečn|žen|e s|vé |ova|své|ým |kol|du |u s|jeh|kon|ave|ech|eré|nu | ze|i v|o d|í v|hra|ids|m p|ému|ole|y s| i |maj|o z| to|aby|sta| ab|m a|pra| ta|chn| ni|že |ovn|ako|néh|len|dsk|rac|lad|chr| že|vat| os|sob|aké|i p|smí|esm|st |i n|m n|a m|lně|lní|při|bez|dy |áln|ens|zem|t v|čen|leč|kdo|ými| ji|oci|i k| s |í m|jí | či|áv |ste|och| oc|vou|ákl| vz|rav|odu|nez|inn|ský|nit|ivo|a j|u k|iál| me|ezi|ské|ven|stu|u a|tej|oln|slu|zen|í z|y b|oko|zac|níc|jin|ky |a o|řís|obe|u v|tak|věd|oje| vý|ikd|h n| od|čno|oso|ciá|h p| de|a t|ům |soc|jíc|odů|něn|adn|tup|dů |děl|jno|kéh|por|ože|hov|aci|nem|é v|rok|i j|u o|od |ího|vin|odi",
    "plt": "ny |na |ana| ny|y f|a n|sy |aha|ra |a a| fa|n n|y n|a m|an | fi|tra|any| ma|han|nan|ara|y a| am|ka |in |y m|ami|olo| ts|lon|min| mi| sy| na|a t| ol|fan| ha|a i|man|iza| iz|ina|ona|y h|aka|o a|ian|a h|reh|etr|a s|het|on |a f|ire|fah|tsy|mba| ar| hi|zan|ay |ndr|y o|ira|y t| an|ehe|o h|afa|y i|ren|ran| zo|ena|amb|dia|ala|amp|zo |ika| di|tan|y s|y z| az|ia |m p|rin|jo |n j| jo| dr|zy |ry |a d|ao |and|dre|haf|nen|mpi|rah| ka|eo |n d| ir|ho |am |rai|fa |elo|ene|oan|omb| ta| pi| ho|ava|azo|dra|itr|iny|ant|tsi|zon|asa|tsa| to|ari|ha |a k|van|n i|fia|ray| fo|mbe|ony|sa |isy|azy|o f|lal|ly |ova|lom| vo|nat|fir|sam|oto|zay|mis|ham|bel| ra|a r|ban|kan|iha|nin|a e|ary|ito| he| re| no|ita|voa|nam|fit|iar| ko|tok|isa|fot|no |otr|mah|aly|har|y v|y r| sa|o n|ain|kam|aza|n o|oka|ial|ila|ano|atr|oa | la|y l|eri|y d|ata|hev|sia|pia|its|reo| ao|pan|anj|aro|tov|nja|o s|fam|pir| as|ty |nto|oko|y k|sir|air|tin|hia|ais|mit|ba | it| eo|o t|mpa|kon|a z|a v|ity|ton|rak|era|ani|ive|mik|ati|tot|vy |hit|hoa|aho|ank|ame|ver|vah|tao|o m|ino|dy |dri|oni|ori| mo|hah|nao|koa|ato|end|n t| za|eha|nga|jak|bar|lah|mia|lna|aln|va | mb|lan| pa|aov|ama|eve|za |dro|ria|to |nar|izy|ifa|adi|via|aja| va|ind|n k|idi|fiv|rov|vel",
    "nya": "ndi|ali|a k|a m| ku| nd|wa |na |nth| mu| al|yen|thu|se |ra |nse|hu |di |a n|la | pa|mun| wa|nga|unt| la|a u|u a|e a|ons|za | ma| lo|iye|ace|ce |a l|idw|ang| ka|kha|liy|ens|li |ala|ira|ene|pa |i n|we |e m|ana|dwa|era|hal|ulu|lo |ko |dzi| ci|yo |o w|iko|ga |a p|chi| mo|lu |o l|o m|oyo|ufu| um|moy|zik| an|ner|and|umo|ena| uf|dan|iri|ful|a a|ka |to |hit|nch| nc|a c|ito|fun|dwe| da|kuk|wac| dz|e l|a z|ape|kap|u w|e k|ere|ti |lir| za|pen|tha|aye|kut|mu |ro |ofu|ing|lid| zo|amu|o c|i m|mal|kwa|mwa|o a|eza|i p|o n|so |i d|lin|nso| mw|iro|zo | a |ati| li|i l|a d|ri |edw|kul|una|uti|lan|a b|iki|i c|alo|i k| ca|lam|o k|dza|ung|o z|mul|ulo|uni|gan|ant|nzi| na|nkh|e n|san|oli|wir|tsa|u k|ome|ca |gwi|unz|lon|dip|ipo|yan|gwe|pon|akh|uli|aku|mer|ngw|cit| po| ko|kir|mba|ukh|tsi|bun|iya|ope|kup|bvo|han| bu|pan|ame|vom|ama| ya|siy| am|rez|u n|zid|men|osa|ao |pez|i a| kw| on|u o|lac|ezo|aka|nda|hun|u d|ank|diz|ina|its|adz| kh|ne |nik|e p|o o|ku |phu|eka| un|eze|mol|ma | ad|pat|oma|ets|wez|kwe|kho|ya |izo|sa |o p|kus|oci|khu|okh|ans|awi|izi|zi |ndu|iza|no |say| si|i u|aik|jir|ats|ogw|du |mak|ukw|nji|mai|ja |sam|ika|aph|sid|isa|amb|ula|osi|haw|u m| zi|oye|lok|win|lal|ani| ba|si | yo|e o|opa|ha |map|emb",
    "qug": "una|ta | ka|na |ka |ash|cha|a k|ari|ish|kun|kta|ana|pak|hka|shk|apa|mi |ach|hay|akt|shp|man|ak | ch| ha|rin|ata|tak|lla|ita|ami|ama|aku|har| pa|pas|ayñ|yñi|ina| ma| ru|uku|sh |hpa|run|all|kuy|aka|an | tu|tuk|yta|chi|chu|a c|ñit|in |nak|a h|nka|ris|tap|kan| ki|ayt|pi | sh|pa |i k|a p|nap|kam|kaw|pay|nam|ayp|aws|iri|wsa|a s|ank|nta|uy |a t|hin|a m|ay | li|ant|lia|kay|nat|a r|shi|iak|lak|uya| wa|yuy|say|kis|y r|ypa|hun|a a| yu|n t|tam| ti|yay|n k| ya|a w|hpi|lli| al|api|yku|un |ipa|a i|iku|ayk|shu| sa|ush|pir|ich|kat|hu |huk| il|ill|kas|a y|rik|yac|a l| ku|kac|hik|tan|wan|ypi|ink|ika| ni|ila|ima|i c|yll|ayl| wi|mac|nis| ta|i y|kus|tin|n s|i p|yan|llu|la |iks|tik|kpi| pi|awa|may|lan|li | ri|kll|yas|kin|kak|aya|ksi|k h|aym|war|ura| ay|lat|ukt|i t|iya|ull|mas|sha|kir|uch|h k|nch|akp|uma|pip|han|kik|iki|riy|aki| ii|i s|n p|h m|kar|nal|y h|tac| su|nac|mak|n m|nki|k a|mam|iwa|k t|k k|i m|yma| ña|wil|asi|nmi|kap|pal|sam|pam|k i|k l|i i|pan|sum|i w| hu|his| mu|iia|mun|k m|u t|pik|was|ik |ma |hat|k r|akl|huc| im|mal|uyk|imi|n y|anc|y k|a n|iñi| iñ|wak|unk|yka| mi|iña|a u|has|ywa| ak|llp|ian|ha |tar|rmi|i a|arm|las|ati|pur|sak|ayw|hap|yar|uti|si |iyt|uri|kim| ar|san|h p|akk|iy |wat|wpa|y i|u k",
    "mad": "an |eng|ban|ng | sa| ka|dha| ba|ren|ak |ang| se| ha|hak| dh|na | pa|se |adh|a s|aba|n s|ara|ngg|are|ha |aga|sa | or|ore|asa|sar|ana| ma|aan|a k|ale|gi | ag|gad|a b|n o|n k|eba|ala|ra |gan| ke|dhu|ota|aja|bas|n b|ka |man|tab|dhi|beb|sab|ama|ako|abb|at |ggu|nga| ta|pan|wi |huw|uwi|eka|ata|a d|san| ot|agi|lak|hal|ba |bba|i h|ong|em |kab|g a|lem|a o| pe| na|ane|par|ngs|nge|gar|a a|tan|gsa|a p|ran|i s|k h|n p|uy |guy|ken|n a|al |ada| ga|apa|pon|e d| e |nek| an|g s|ta |kaa|on |kal|a m|ssa|ona|abe|kat| la|a e|e e|sal|ate|jan|ri |nan|lab|asi|sad|i p|e a|lan|aka|a h|ari| bi|ena|si |daj| ng|ton|e k|har|oss|gen|i k|g k|car|ase|ano|era|kon| be|nya|n d|nag|bad|ar |epo| da|mas| kl| al|n t|mat|nos|n n|ela|g e|a n|k k|uwa|adi|pad|ggi|uan|i d|ne | so|hi |sae|oan|wan|as |le |gap|ter|yat|om |kla|k a|e b|ina|ah |k s|koa|i a|ega|neg|n h|m p|aha| as| ja|abi|ma |kas|bi | mo|aon| di|one| ep|per|aya|e s|nto|te |bat|epa|nda|n e| ca|int|pam|di |ann| ra|aen|k d|amp|a t|nta|and|e p|rga|pen|yar|mpo|ste|dra|ok |oko|ila|g p|k b|i b|set|to |isa|nao|nna|n m|ett| a |bis|hid|bin|i m|nas| ho|kar|t s| po|dil| to|aju|ika|kom|arg|ant|raj|a l|das|tto|ost|mos|lae|ga |rek|idh|tad|hig|en |rny|arn|ndh|eta|adu| dr|jat|jua|gam",
    "kin": "ra | ku| mu|se |a k|ntu|nga|tu |umu|ye |li | um|mun|unt|a n|ira| n |ere|wa |we | gu|mu |ko |a b|e n|o k|e a|a u|a a|u b|e k|ose|uli|aba|ro | ab|gom|e b|ba |ugu| ag|omb|ang| ib|eng|mba|o a|gu | ub|ama| by| bu|za |ihu|ga |e u|o b| ba|kwi|hug|ash|ren|yo |ndi|e i| ka| ak| cy|iye| bi|ora|re |gih|igi|ban|ubu| nt| kw|di |gan|a g|a m|aka|nta|aga| am|a i|ku |iro|i m|ta |ka |ago|byo|ali|and|ibi|na |uba|ili| bw|sha|cya|u m|yan|o n| ig|ese|no |obo|ana|ish|kan|sho| we|era|ya |aci|wes|ura|i a|uko|e m|n a|o i|kub|uru|hob|ber|ran|bor| im|ure|u w|wo |cir|gac|ani|bur|u a|o m|ush| no|e y| y |rwa|eke|nge|ara|wiy|uga|zo |ne |ho |bwa|yos|anz|aha|ind|mwe|teg|ege|are|ze |n i|rag|ane|u n|ge |mo |u k|bul| uk|bwo|bye|iza|age|ngo|u g|gir|ger|zir|kug|ite|bah| al| ki|uha|go |mul|ugo|n u|tan|guh|y i| ry|gar|bih|iki|atu|ha |mbe|bat|o g|akw|iby|imi|kim|ate|abo|e c|aho|o u|eye|tur|kir| ni|je |bo |ata|u u| ng|shy|a s|gek| ru|iko| bo|bos|i i| gi|nir|i n|gus|eza|nzi|i b|kur| ya|o r|ung|rez|ugi|ngi|nya| se|mat|eko|o y| in|uki| as|any|bis|ako|gaz|imw|rer|bak|ige|mug|ing|byi|kor|eme|nu | at|bit| ik|hin|ire|kar|shi|yem|yam| yi|gen|tse|ets|ihe|hak|ubi|key|rek|icy| na|bag|yer| ic|eze|awe|but|irw| ur|fit|ruk|ubw|rya|uka|afi",
    "zul": "nge|oku|lo | ng|a n|ung|nga|le |lun| no|elo|wa |la |e n|ele|ntu|gel|tu |we |ngo| um|e u|thi|uth|ke |hi |lek|ni |ezi| ku|ma |nom|o n|pha|gok|nke|onk|a u|nel|ulu|oma|o e|o l|kwe|unt|ang|lul|kul| uk|a k|eni|uku|hla| ne| wo|mun| lo|kel|ama|ath|umu|ho |ela|lwa|won|zwe|ban|elw|ule|a i| un|ana|une|lok|ing|elu|wen|aka|tho|aba| kw|gan|ko |ala|enz|o y|khe|akh|thu|u u|na |enk|kho|a e|zin|gen|i n|kun|alu|mal|lel|e k|nku|e a|eko| na|kat|lan|he |hak| ez|o a|kwa|o o|ayo|okw|kut|kub|lwe| em|yo |nzi|ane|obu| ok|eth|het|ise|so |ile|nok| ba|ben|eki|nye|ike|i k|isi| is|aph|esi|nhl|mph| ab|fan|e i|isa| ye|nen|ini|ga |zi |fut| fu|uba|ukh|ka |ant|uhl|hol|ba |and|do |kuk|abe|za |nda| ya|e w|kil|the| im|eke|a a|olo|sa |olu|ith|kuh|o u|ye |nis| in|ekh|e e| ak|i w|any|khu|eng|eli|yok|ne |no |ume|ndl|iph|amb|emp| ko|i i| le|isw|zo |a o|emi|uny|mel|eka|mth|uph|ndo|vik| yo|hlo|alo|kuf|yen|enh|o w|nay|lin|hul|ezw|ind|eze|ebe|kan|kuz|phe|kug|nez|ake|nya|wez|wam|seb|ufa|bo |din|ahl|azw|fun|yez|und|a l|li |bus|ale|ula|kuq|ola|izi|ink|i e|da |nan|ase|phi|ano|nem|hel|a y|hut|kis|kup|swa|han|ili|mbi|kuv|o k|kek|omp|pho|kol|i u|oko|izw|lon|e l| el|uke|kus|kom|ulo|zis|hun|nje|lak|u n|huk|sek|ham| ol|ani|o i|ubu|mba| am",
    "swe": " oc|och|ch |er |ing|för|tt |ar |en |ätt|nde| fö|rät|ill|et |and| rä| en| ti| de|til|het|ll |de |om |var|lig|gen| fr|ell|ska|nin|ng |ter| ha|as | in|ka |att|lle|der|sam| i |und|lla|ghe|fri|all|ens|ete|na |ler| at|ör |den| el|av | av| so|igh|r h|nva|ga |r r|env|la |tig|nsk|iga|har|t a|som|tti| ut|ion|t t|a s|nge|ns |a f|r s|män|a o| sk| si|rna|isk|an | st|är |ra | vi| al|t f| sa|a r|ati| är| me| be|n s| an|tio|nna|lan|ern|t e|med| va|ig |äns| åt|sta|ta |nat| un|kli|ten| gr|vis|äll| la|one|han|änd|t s|stä|t i|ner|ans|gru| ge|ver| må| li|lik|ihe|ers|rih|r a| re|må |sni|n f|t o| mä| na|r e|ri |ad |ent|kla|det| vä|run|rkl|da |h r|upp|dra|rin|igt|dig|n e|erk|kap|tta|ed |d f|ran|e s|tan|uta|nom|lar|gt |s f| på| om|kte|lin|r u|vid|g o|änn|erv|ika|ari|a i|lag|rvi|id |r o|s s|vil|r m|örk|ot |ndl|str|els|ro |a m|mot| mo|i o|på |r d|on |del|isn|sky|e m|ras| hä|r f|i s|a n|nad|n o|gan|tni|era|ärd|a d|täl|ber|nga|r i|enn|nd |n a| up|sin|dd |örs|je |itt|kal|n m|amt|n i|kil|lse|ski|nas|end|s e| så|inn|tat|per|t v|arj|e f|l a|rel|t b|int|tet|g a|öra|l v|kyd|ydd|rje| fa|bet|se |t l|lit|sa |när|häl|l s|ndr|nis|yck|h a|llm|lke|h f|arb|lmä|nda|bar|ckl|v s|rän|gar|tra|re |ege|r g|ara|ess|d e|vär|mt |ap ",
    "lin": "na | na| ya|ya |a m| mo|a b|to | ko| bo|li |o n| li|i n| pe|i y|a y|a n|ngo|ki | ba| ma|kok|pe |la |a l|zal|oki|ali|nso|oto|ala|ons|so |mot|a k|nyo|eng|kol|go |nge| ny|yon|o e|ang|eko|te |o y|oko|olo|ma |iko|a e|e m|e b|lik|ko |o a|ako|ong| ye|mak|ye |isa| ek|si |lo |aza|sal|ama| te|bat|o p|oyo|e n| az|a p|ani|sen|o m|ela|ta |amb|i k|ban|ni | es|yo |mi |mba|osa| oy|aka|lis|i p|eli|a t|mok|i m|ba |mbo| to| mi|isi|bok|lon|ato|ing|o b| nd|ota|bot| ez|ge |nga|eza|o t|nde|ka |bo |gel|kan|e k|lam|sa |ese|koz| po|den|ga |oba|omb|oli|yan|kop|bon|mos|e e|kob|oka|kos|bik|lin|po |e a| lo| bi|kot|‘te|ngi|sam| ‘t|omi|e y|ti |i b| el|elo|som|lok|esa|gom|ate|kam|i t|ika|a s|ata|kat|ati|wa |ope|oza|iki|i e| ka|bom|tal|o l|bek|zwa|oke|pes| se|bos|o o|ola|bak|lak|mis|omo|oso|nza| at|nda|bal|ndi|mu |mob|osu|e t|asi|bis|ase|i l|ele|sus|usu|su |ozw|and|mol|tel|lib|mbi|ami| nz|ne |ene|kel|aye|emb|yeb|nis|gi |obo|le |kum|mal|wan|a ‘|pon| ep|baz|tan|sem|nya|e l| ta|gis|opo|ana|ina|tin|obe| ti|san| ak|mab|bol|oku|u y|mat|oti|bas|ote|mib|ebi|a o|da |bi | mb|lel|tey|ibe|eta|boy|umb|e p|eni|za |be |mbe|bwa|ike|se | et|ibo|eba|ale|yok|kom| en|i a|mik|ben|i o| so|gob|bu |son|sol|sik|ime|eso|abo| as|kon|eya|mel",
    "som": " ka|ay |ka |an |uu |oo |da |yo |aha| iy|ada|aan|iyo|a i| wa| in|sha| ah| u |a a| qo|ama| la|hay|ga |ma |aad| dh| xa|ah |qof|in | da|a d|aa |iya|a s|a w| si| oo|isa|yah|eey|xaq|ku | le|lee| ku|u l|la |taa| ma|q u|dha|y i|ta |aq |eya|sta|ast|a k|of |ha |u x|kas|wux| wu|doo|sa |ara|wax|uxu| am|xuu|inu|nuu|a x|iis|ala|a q|ro |maa|o a| qa|nay|o i| sh| aa|kal|loo| lo|le |a u| xo| xu|o x|f k| ba|ana|o d| uu|iga|a l|yad|dii|yaa|si |a m|gu |ale|u d|ash|ima|adk|do |aas| ca|o m|lag|san|dka|xor|adi|add| so|o k| is|lo | mi|aqa|na | fa|soo|baa| he|kar|mid|dad|rka|had|iin|a o|aro|ado|aar|u k|qaa| ha|ad |nta|o h|har|axa|quu| sa|n k| ay|mad|u s| ga|eed|aga|dda|hii|aal|haa|n l|daa|xuq|o q|o s|uqu|uuq|aya|i k|hel|id |n i| ee|nka| ho|ina|waa|dan|nim|elo|agu|ihi|naa|mar|ark|saa|riy|rri|qda|uqd| bu|ax |a h|o w|ya |ays|gga|ee |ank| no|n s|oon|u h|n a|ab |haq|iri|o l| gu|uur|lka|laa|u a|ida|int|lad|aam|ood|ofk|dhi|dah|orr|eli| xi|ysa|arc|rci|to |yih|ool|kii|h q|a f| ug|ayn|asa| ge|sho|n x|siy|ido|a g|gel|ami|hoo|i a|jee|n q|agg|al | di| ta|e u|o u| ji|goo|a c|sag|alk|aba|sig| mu|caa|aqo|u q|ooc|oob|bar|ii |ra |a b|ago|xir|aaq| ci|dal|oba|mo |iir|hor|fal|qan| du|dar|ari|uma|d k|ban|y d|qar|ugu| ya|xay|a j",
    "ilo": "ti |iti|an |nga|ga | ng| pa| it|en | ka| ke| ma|ana| a | ti|pan|ken|agi|ang|a n|a k|aya|gan|n a|int|lin|ali|n t|a m|dag|git|a a|i p|teg|a p| na|nte|man|awa|kal|da |ng |ega|ada|way|nag|n i| da|na |i k|sa |n k|ysa|n n|no |a i|al |add|aba| me|i a|eys|nna|dda|ngg|mey| sa|pag|ann|ya |gal| ba|mai| tu|gga|kad|i s|yan|ung|nak|tun|wen|aan|nan|aka| ad|enn| ag|asa| we|yaw|i n|wan|nno|ata| ta|l m|i t|ami|a t| si|ong|apa|kas|li |i m|ina| an|aki|ay |n d|ala|gpa|a s|g k|ara|et |n p|at |ili|eng|mak|ika|ama|dad|nai|g i|ipa|in | aw|toy|oy |ao |yon|ag |on |aen|ta |ani|ily|bab|tao|ket|lya|sin|aik| ki|bal|oma|agp|ngi|a d|y n|iwa|o k|kin|naa|uma|daa|o t|gil|bae|i i|g a|mil| am| um|aga|kab|pad|ram|ags|syo|ar |ida|yto|i b|gim|sab|ino|n w| wa| de|a b|nia|dey|n m|o n|min|nom|asi|tan|aar|eg |agt|san|pap|eyt|iam|i e|saa|sal|pam|bag|nat|ak |sap|ed |gsa|lak|t n|ari|i u| gi|o p|nay|kan|t k|sia|aw |g n|day|i l|kit|uka|lan|i d|aib|pak|imo|y a|ias|mon|ma | li|den|i g|to |dum|sta|apu|o i|ubo|ged|lub|agb|pul|bia|i w|ita|asy|mid|umi|abi|akd|kar|kap|kai| ar|gin|kni| id|ban|bas|ad |bon|agk|nib|o m|ibi|ing|ran|kda|din|abs|iba|akn|nnu|t i|isu|o a|aip|as |inn|sar| la|maa|nto|amm|idi|g t|ulo|lal|bsa|waw|kip|w k|ura|d n|y i",
    "uig": "ish| he|ini|ing|nin|gha|ng |ili| we|we |sh |in | bo|quq|oqu|ni |hoq| ho|ush|shi|lik|qil|bol|shq|en |lis|qa |hqa|n b|hem| qi|ki |dem|iy | ad|ade|igh|e a|em |han|liq|et |ge |uq |nda|din| te| bi|idi|let|qan|nli|ige|ash|tin|ha |kin|iki|her|de | er| ba|and|iti|olu|an | dö|döl|aq |luq| ya|me |lus|öle|mme|emm| qa|daq|rki|lgh|erq|erk|shk|esh|rqa|iq |uqi|ile|rim|i w|er |ik |yak|aki|ara|a h| be|men| ar|du |shu|uql|hri|hi |qlu|q h|inl|lar|da |i b|ime| as|ler|etl|nis| öz|ehr|lin|e q|ar |ila| mu|len| me|qi |asi|beh|a b|ayd|q a|bir|bil| sh|che|rli|ke |bar|hke|yet|éli|shl|tni|u h|ek |may|e b| ké|h h| ig|ydu|isi|ali|hli|k h| qo|iri|emd|ari|e h|ida|e t|tle|rni| al|siy|lid|olm|iye|anl| tu|iqi|lma|ip |mde|e e|tur|a i|uru|i k|raw|hu |mus|kil| is|i a|ir |éti|r b|özi|ris|asa|i h|sas| je|he | ch|qig|bas|n q|alg|ett|les| xi|tid| él|tes|ti |awa|ima|nun|a a| xe| bu|hil|n h| xa|adi|dig|anu|uni|mni| sa|arl|rek|ére| hö|kér| ji|min|i q|tis|rqi| iy|elq|xel|p q| qe|y i|i s|lig| ma|iya|i y|siz|ani| ki|qti| de|q w|emn|met|jin|niy|i i|tim|irl| ti|rin|éri|i d|ati|si |tew|i t|tli|eli|e m|rus|oli|ami|gen|ide|ina|chi|dil|nay|ken|ern|n w| to|ayi| ij|elg|she|tti|arq|hek|e i|n a|zin|r a|ijt|g b|atn|qar|his|uch|lim|hki|dik",
    "hat": "ou |an | li|on |wa |yon| po|li |pou|te | yo|oun| mo|un |mou|ak | na|en |n p|nan|tou|syo| dw| to|yo | fè|dwa| ak| ki|ki | pa| sa|out| la| ko| ge|ut |n s|gen| de|se |asy|èt |i p|n d| a | so|n l|a a|fè |n k| se|pa |e d|u l| re|ite|sa | ch|kon|n n|e l|t p|ni |cha|a p|nn |ans|pi |t m| ka| an|nm |fèt|i s|son|man| me|n m|n a|e p|swa|sou|e k|hak|òt |n y|men|i l|epi| pe|ote|san| ep|i k| si|yen|eyi|a l| ap|i a|yi |pey|je |n t|e a|k m|e s| ni|lib|e n|i t|lit|ran|lè |enn|al |a s| pr|a f|ns | lò|ap |lòt|enm|k l|n e|t l|kla|anm|e y|a k| ma|e t|ay |i m|ali| lè|è a|ye |a y|ant| os| ba|i g| tè|aso|u t|a n| pw|ras| pè|n f|nas|ka |n g|osw| ta|dek|i d|pwo|e m| di| vi|la |i n|u s|sos|bli| te|o t| tr|lwa|ète|a t|le |u y|i f|tan|a c|lar|a m|ete|ara|t k| pi|ibè|bèt|re |osy|de |ati|ke |res|tis|i y|tè |nen| fa|ekl|ze |nal|ons|ksy|ini|che| le|e r|a d| en|aye|he |o p|alw| kò|lal| no|esp|a g|ava|kou|las|way|u f|isy| za| ok|oke|kal|ken|sye|ta |onn|k k|nje|pra|van|esi|pès|kot|ret|sya|n v|lek|jan|ik |a b|eks|wot|è n|di |òl |tra|u k|i r|nou| as|k a|u d|ist|èso|ib | ne|iti|ti |is |y a|des|è l|a r|ont| ke|nsa|pat|rit|sit|pòt|ona|ab |è s| sw|ond|ide| ja|rav|t a|ri |bon|viv| sè|pre|vay|k p|l l|kòm|i o| ra|era|fan|dev",
    "aka": "sɛ |a a| sɛ|ne |ra |a n| wɔ| a |ara|an |eɛ |no | ne| bi| no| as|iar|bia|yɛ |mu |aa | an|ɛ s|e a|ma | ho|bi |man|deɛ| mu|ho |ɛ a|na |a ɛ| ob|obi|e n|a b|n a|so |o n|pa |ama|ɛ o|o a|ipa|nip|ɛ n|naa| na|a w|ana| so| ad| nn|ɛ ɔ|ɛde|asɛ|kwa| on|oni|wan| am|a ɔ|sɛd|wɔ | ah|ɛyɛ| ny|oɔ | n |mma|i a| mm|nni| kw|ie |wɔn|ɛ w|de | ɛy| ba|ase|ɔ n|o b|i m|ɔ a|uo |n n|a m|o s|iri| yi|ni |e s|nyi|di |u n|a o|aho| de|tum| ɛn|ɔn |nya|i n|ɔma|e m|adw| yɛ|umi|die|mi |ɛ ɛ|o k| ab|ɛm |a s| ma|nam| ɔm| ɛs|yin| at| bɔ|o d|ina|pɛ |sɛm|ua |n s|bɔ |adi|ya |e h|aso|mar|ani|kuo|rɛ |fa |a k|ɔde|a h|ba |n b|re |uma|wum|om |ɔ h|m n|yi |u a| sa|se |dwu|ɔ b| nt|m a|erɛ| kɔ|a y|orɔ| nk| bɛ| ɔd|ten|rɔ |hyɛ|saa|ka |ɛ b|e b|i s|ade|am |nka|kor|i ɛ|ene|ena| ns|ban|ɛns| ku|ɛsɛ|ane|nsɛ|fof|ɛɛ | fi|gye|ɔtu| di|ano|i k|o m| ɔt| ko|yɛɛ|bir| ak|im |kye| pɛ|a d|yie|ko |nti|i b|ete|ofo|amm|ye |ri |foɔ|kɔ |bom|abo|ɔ s|ɔne| ɛb|soɔ|for|isɛ|m k|asa|nod|ɛ m|fir|ti | da|e y|sua| be|nii|seɛ|wa |ber| aw|dwe|n f| fo|o ɛ|i h|u b|ɔ m| mf|hɔ |kab|wɛ |to |rib|hwɛ|ibi| dw|dis|nso|ans|tir|u ɛ| ti| hɔ|sa |e o| tu|odi|ɛ y|ia |ofa| ɔn|o w|ɛbɛ|aba| ka|ii |wen|ɛsi|m m|sia|ada|yer|ian|da |set| gy|dua|i d|som|mfa|ɔ w| af|i y|any|ora|rim|wɔd|dwa|nsi",
    "hil": "nga|ang| ka|ga |ng | sa|an |sa | ng| pa| ma|ag |on |san|pag| an|ung|kag|a p|n s|a k|n n|a m|ata|kat| ta|gan|g p|ay |tar|g k|ags|run|ala|aru|gsa|tag|a s|g m| mg|mga|n k|a t|od |kon|g s|a n|ing|a i|man|g t|agp|tan| si|n a|y k|mag|gpa|may|hil|pan|ya |ahi|la |g a|sin|gin|ina|aya|ana|ili| pu|han|g i|yon|nan| in|way|uko|gka| gi|aha| uk|ilw|lwa|asa|apa|kas|syo|at |ban|lin|iya|kah|n p| na|o n|lan|a a|in |ngk|g n|ini|aba|pat|pun|a g|ali|o s| iy|yan|agt|tao|ngs|gba|kab|wal|ngo|al |nag|agk|o m|ni |i s|aga|ano| wa|isa|abu|kal|a h|dap|ong|a d|mat| tu|gso|no |aho|aki|sod|agb| da|asy|ila|d k|pas| hi|agh|d s|n m|na |lal|yo |di |til| la|o k|s n|non|gay|sal|a b|god|ao |ati|aan|uha| is|ka |aka|asu|ngb|o a|ama|ato|atu|uga|paa|but|una|n u|bah|uan|iba| di| ba|pah|bat| du|ulo|os |y s|nah| ko|aag|agi|sil|gi |i m|hay|yag|gon|y n|sta|n d|ot |oha|tun|ida| pr| su|a l|uta|m s| al|do |uli|sug|n t|as |lon|sul|og |pam|pro|him|gua|alo|lig| bi|bis|asi|ula|ton|ksy|gtu|a e|k s| ib|n b|maa|ugu|ko |lib|ron|i a|hi |hin|tek|lab|abi|ika|mak|bot|aoh|ok | hu|ghi|ind|ote|tok|i n|t n|g e|eks|dal|uma|ubo|tum|hat|to |ado|kin| ed|rot|ho |ndi|inu|ibu|y a|nta|ad |gko|lah|duk|abo|iko|nda|aro|gal|mo |g o| bu|int| o |n o|aay|da |gsu",
    "sna": "wa |a k|ana|ro |na | ku| mu|nhu|dze|hu |a m| zv|mun|oku|chi|a n|aka|dzi|ka |zer|ero| ch|che|se |unh|odz|rwa|ra |kod|zvi| ne| pa|kan| we| dz| no|ika|va |iri| an|kut|nyi|o y|yik|van|nek|ese|eko|zva|idz|e a| ka|ane|ano|ngu|eku|cha|ung| yo|ri |ake|ke |ach|udz|iro|a z|u w| va|ira|wes|ang|ech|nge|i p|eng|yok|nok|edz|o i|irw|ani|ino|uva|ich|nga|ti |zir|anh|rir|ko |dza|o n|wan|wo |tan|sun|ipi|dzw|eny|asi|hen|zve|kur|vak|a p|sha|unu|zwa|ita|kwa|e k|rud|nun|uru|guk|a c|a d| ya|a y|bat|pas|ezv|ta |e n|uti| kw|o k|o c|o m|ara| ma|si |ga |uko|ata|ose|ema|dzo|uch|hip|kuv|no |rus|hec|omu|i z|wak|o r|kus|kwe|ere|re | rw| po|o a|mwe|yak|mo |usu|isi|za |sa |e z|uta|gar| in|hin|nem|pac|kuc|we |ete| ye|twa|pos|o d|a i|hur|get|ari|ong|pan|erw|uka|rwo|vo | ak|tem|zo |emu|emo|oru| ha|uit|wen|uye|kui| uy|vin|hak|kub|i m|a a|kud| se| ko|yo |and|da |nor|sin|uba|a s|a u| ic|zvo|mut|mat|nez|e m|a w|adz|ura|eva|ava|pi |a r|era|ute|oko|vis| iy|ha |u a|han|cho|aru|asa|fan|aan|pir|ina|guv|ush|ton| hu|uny|enz|ran|yor|ted|ait|hek| ny|uri|hok|nen|osh| ac|ngi|muk|ngo|o z|azv|kun|nid|uma|i h|vem|a h|mir|usa|o p|i n|a v|i k|amb|zan|nza|kuz|zi |kak|ing|u v|ngw|mum|mba|nir|sar|ewo|e p|uwa|vic|i i|gwa|aga|ama|go |yew|pam",
    "xho": "lo |lun|oku|nge|elo|ntu|tu |e n|ele| ku|nye|ye |nga|ung|la | ng|lek|a n|o n|yo |o l|e u|nel|gel|a k|ko |ho |ulu|ke | ne| na|lul|we |le |wa |ngo| kw|ule|kub| no|a u|onk| um|nke|o e| lo|ela|kun|ama|any|unt|ang|eko|uba|elu|ezi|mnt| wo|a i|eyo|alu|lel|umn|lwa|kwe|olu|ba | uk|kuk|won|ukh|une|uku|gok|nok|enz| un|khu| ok|the|e k|zwe|kan|eki|aph|ane|uny|ile|o z|aku|ley|lok| ez|het|eth|ath|oka|pha|sel|ala|o y|kul|akh|kil|enk| in|esi|o k| yo|use|hul|u u|tho|obu|wen|ana|nku|khe|o o|e a|na |kho|ban|a e|ise|ent|gan|uth|ni |kel| zo|he |izw|o w|hi |elw|nam|ing|eli|fun|za |lwe|eng|ya |kwa|fan|isa|o a|ndl|ntl|ayo|eni|gen|hus|uhl|iph|tha|nzi|isw|sa |phi|aba|ben|und|ume|thi|ha |alo|ka |ink|hla|lal|wan|i k| lw|i n|bel| ba|o u|azi|e o|swa|ngu|bal|pho| ab|man|kut|emf|e i|mfa|a a|e e|een|int|uph|eka|ebe|seb|lan|nee|zi |o i|mal|sha|sek|dle|ziz|mth|nen|zel| se|okw|tya|ike|lin|tla|ene|sis|ima|ase|yal|ubu| ak|ant|sen|olo|wak| ko|a o|mfu|ezo|sid|nay|oko| ub|ulo|zo |do |isi|wez|iso|han|nte| ph|zim| ya|ga |li | le|iba|ham|ube|kup|aza|jik| ul| en|eem|phu| ol|and|imf| es|o s| im|kuf|u k|kwi|nak|ma |nan|ety|kuh|kus|yol| am|hel|idi| so|lis| nj|nje|jen|tsh|aka|zin|kuz|‐ji|no |ufu|ale|ong| el|bo |a y|e l|men|yen|lum",
    "min": "an |ak |ang| ma| da| ka| sa|ara| ha|yo |nyo|hak| ba|ran|dan|man|nan|ng | pa| di|kan|ura| na|ata|asa|ok |nda|ala| pu|pun|uak|ntu|n d|k m| ti|ah |o h|n s|k u|n k| ur| un|tua|n b|and|unt| ta|uny|n p|tio|iok|ama|pan|ek |ban|jo |n m|k h|k d|ado|nga|aan|g p|tan|aka|ind|at |dak|dap|o p|tau|pek|uan| at|amo|mar|ape|au |kat|mo |sas|ari|asi|di |o s|ia |ngg|bas|ika|sam|am |lia|o d|san|gan|sia|tar|n n| jo| su|anu|lam|gar|o t| in|par|sua|dek|sar|k s|ri |o m|ana|bat|asu|ko |ai | la|ant|dal|lak|aga|alu|iah|o u|n a|tu |k a|adi|rad|i m|mal|dok|usi|aku|i d|k k|al |aro|eka|neg|ega|ato|to | ne|mam|o b|eba|ian|beb|n u|um |si |aba|rat|uah|ro |mas|ila|a d|ali|uka|ard|kam|ti |atu|nus|dar|ami|n t|sa |in |amp|kal|car|lan|aha|kab|so |rde|un |i k|gsa|das|ngs|aca|yar|ka |ati|ar | an|uku|ras| ko|sya|mat|k n|aya|nta|lo |any|sur|kaa|dil|kar|o a|u d|k t|pam|dia|ra |iba|lai|i t|lah| bu|mpa|kum|abe|n h|ili|nny| as|u p|aki|amb|sac|as |k b|h d|uli|ajo|a n|raj|n i|dua|ndu|k p|i p|itu|lin|han|huk|o k|rik|a b| li|ik |ggu|jam|bai|a a|i a|nia| ad|i j| hu|gam|sal|aso|ngk|sad|apa|ann| mu|ony|dik|bad|ain|did|min|l d|ada|bul|rga|tin|ga |ani|alo| de|arg|ahn|sio|hny|n l|sti|awa|uju|per|bak| pe|tik|ans| pi|a s| um|bag|ndi|anj|mba",
    "afr": "ie |die|en | di| en|an |ing|ng |van| va|te |e v|reg| re|n d| ge|ens|et |e r|e e| te| be|le |ver|een| in|ke | ve| he|eg |het|lke|lik|n h|de |nie|aan|t d|id |men| vr|nde|eid|e o| aa|in |of |der|hei|om |g v| op| ni|e b| el|al |and|elk|er | me|ord|e w|g t| to| of|ers| we| sa| vo|ot |erk|n v|vry|ge |kee|asi|tot| wa|sie|ere| om|aar|sal|dig|wor|egt|gte|rdi|rd |at |nd |e s|ede|ige| de| ’n|n a|eni| wo|e g| on|n s|’n |e t|erd|ns |oor|bes|ond|se |ska|aak|nig|lle|yhe|ryh|is |eli|esk|ien|sta|vol|ele|e m| vi|ik |r d|vir|edi|kap|g e|ir |es |sy |ang|din| st|ewe|gem|gel|g o| is|el |e i|op |ker|ak |uit|ike|nse|hie|ur |eur| al|e a|nas|e n|nge|ier|n o|wer|e d|ap | hu|ale|rin| hi|eme|deu|min|wat|n e|s o| as| so|as |e h|del|d v|ter|ten|gin|end|kin|it | da| sy|per|re |n w|ges|wet|ger|e k|oed|s v|nte|s e|ona|nal|waa|d t|ees|soo| ma|d s|ies|tel|ema|d e|red|ite| na|ske|ely|lyk|ren|nsk|d o|oon|t e|eke|esi|ese|eri|hul| gr|ig |sio|man|rde|ion|n b|n g|voo|hed|ind|tee| pe|rso|t v|s d|all|n t|rse|n i|eem|d w|ort|ndi|daa|maa|t g|erm|ont|ent|ans|ame|yke|ari|n m|lan|voe|n ’|nli|rkl|r m|sia|ods|ard|iem|g s|wee|r e|l g|taa|sek|bar|gti|n n|lin|sen|t o|t a|raa|ene|opv|pvo|ete| ty|arb| sl|igh|dee|g a|str|nsl|sel|ern|ste",
    "lua": "ne |wa | ne|a m| ku|a k| mu|di | bu|a b| di|e b|tu |nga|bwa|ntu| bw|udi|a d|e m|i b| ba| ma|shi|adi|u b|a n|la |ons|mun|i n|ung|nsu|ga |yi |ya |na |unt| dy|idi|e k|buk|mu |ika|esh|su |u m|ku |nde|any| bi|lu |nyi|end|yon|dik|ba | ci| ka|ang|u n|u y| mw|ka |i m| yo|we |oke|tun|de |kes|hi |kok|mwa| kw|e n|ban|dya|sha|u d|ken|kwa|ji |ha |wen|dit| ud|a a| an|mwe|itu| pa|le | a | wa|nji|kan|kum|ibw|bwe|a c|ant|ena|yen|mba|did|e d|ala|u u|ish|mak|bul|i a|nda|enj|u a|ila|pa |ako|ans|uke|ana|nso|amb|hin|umw|kal|uko|i k|bad|aka|ela|ele|u w|u k|du |ja |bu | mi|ind|ndu|kwi| ns|mbu|atu|bud|dil|ile|sun|eng|ula|enz|nan|nsh|kad|alu| cy|bis|kud|lon|u c|gan|dib|da |dye|bid| by|ukw|i d|aa |ngu|a p|sam|isa| aa|ilu| na|aba|lel|ye |dim|cya|kub|so |ond|kus|mat|nge|e c| bo|aku|bak|mus|ta |umb|ulo|elu|man|iki|mon|ngi|abu|mud|kuk|omb| mo|und|diy|kwe|umu|mal| ke|ush|gil|uba|imu|dis|wil|wu |san|gad|uka|bon|ma |aci|mik|wik| me|pan|iku|nza|ben|ulu|ifu|iba|kak|ata|som|ong|e a|apa| tu|o b|umo|bya|utu|uja|yan| be|ke |akw|ale|ilo|uku|cil|tup|kul|cik|kup|upe|bel|amw|ona| um|iko|awu|and|za |ike|a u|ima|muk| ya|mum|me |map|ita|iye|ole|lum|wab|ane| lu|nu |kis|mbe|kab|ine|bum|lam|pet| ad|fun|ama| mb|isu|upa|ame|u p|ubi",
    "fin": "en |ise|ja |ist| ja|on |ta |sta|an |n j|ais|sen|n o|keu|ike|oik|lis| va|ell|lla|n t|uks| on|ksi| oi|n k| ka|aan|een|la |lli|kai|a j| ta|sa |in |mis| jo|a o|ään|än |sel|n s|kse|a t|a k|tai|us |tta|ans|ssa|kun|den|tä |eus|nen|kan|nsa|apa|all|est| se|eis|ill|ien|see|taa| yh|jok|n y|vap|a v|ttä|oka|n v|ai |itt|aa |aik|ett|tuk|ti |ust| ku|isi|stä|ses| tä| tu|lai|n p|sti|ast|n e|n m|tää|sia|unn|ä j|ude|ä o|ste|si |tei|ine|per|a s|ia |kä |äne| mi|maa| pe|a p|ess|a m|ain|ämä|tam|yht| ju|jul|yks|hän|ä t| hä|utt|ide|et |llä|val|sek|stu|n a|lä |ami|hmi| ke|ikk|lle|iin|sä |euk|täm|ihm|tee| ih|lta|pau| sa|isk|mää|ois|un |tav|ten|dis|hte|n h|iss|ssä|a h|ava| ma|a y| ei| te| si| ol|ekä|sty|alt|toi|att|oll|tet| jä| ra|vat| mu|iel| to|mai|sal|isu|a a|kki|at |suu|n l|väl|ää |uli|tun|tie|eru| yk|etu|vaa|rus|muk| he|ei |a e|kie|sku|eid|iit| su|nna|sil|oma|min| yl|lin|aut|uut|sko| ko|tti|le |sie|kaa|a r| ri|sii|nno|eli|tur|saa|aat|lei|oli|na | la|oon|urv|lma|rva|ite|mie|vas|ä m| ed|tus|iaa|itä|ä v|uol|yle| al|lit|suo|ama|joi|unt|ute|i o|tyk|n r|ali|lii|nee|paa|avi|omi|oit|jen|kää|voi|yhd|ä k| ki|eet|eks| sy|ity|ilö|ilm|oim|ole|sit|ita|uom|vai|usk|ala|hen|ope| pu|auk|pet|oja|i s|rii|uud|hdi|äli|va | om",
    "run": "ra |we |wa | mu|e a|se | n |a k|ira|ntu|tu | ku| um|ko |a i|mu |iri|mun|hir|ye |unt|ing|ash|ere|shi|a n|umu|zwa| bi|gu |ege|a a|za |teg|ama|e k|go |uba|aba|ngo|ora|o a|ish| ba| ar|ung|a m| we|e n|na |sho|ese|nga| ab|e m|mwe|ugu| kw|ndi| gu|ate|kwi|wes|riz|ger|u w| at|di |gih|iza|n u|ngi|ban|yo |ka |e b|a b| am| ca|ara|e i|obo|hob|ri |u b|can|nke|ro |bor| in|bah|ahi|ezw|a u|gir|ke |igi|iki|iwe|rez|ihu|hug|aku|ari|ang|a g|ank|ose|u n|o n|rwa|kan| ak|nta|and|ngu| vy|aka|n i|ran| nt| ub|kun|ata|i n|kur|ana|e u| ko|gin|nye|re | ka|any|ta |uko|amw|iye| zi|ga |ite| ib|aha| ng|era|o b|ako|o i| bu|o k|o u|o z| ig|o m|ho |mak|sha| as| iv|ivy|n a|i b|izw|o y| uk|ubu|aga|ba |kir|vyi|aho| is|nya|gan|uri| it| im|u m|kub|rik|hin|guk|ene|bat|nge|jwe|imi| y |vyo|imw|ani|kug|u a|ina|gek|ham|i i|e c|ze |ush|e y|uru|bur|amb|ibi|agi|uza|zi |eye|u g|gus|i a| nk|no |abi|ha |rah|ber|eme|ras|ura|kiz|ne |tun|ron| zu|ma |gen|wo |zub|w i|kor|zin|wub|ind| gi|y i|ugi|je |iro|mbe| mw|bak| ma|ryo|eka|mat| ic|onk|a z| bo|ika|eko|ihe|ukw|wir|bwa| ry| ha|bwo| ag|umw|yiw|tse| ya|he |eng| ki|nka|bir|ant|aro|gis|ury|twa| yo|bik|rek|ni | ah| bw|uro|mw |tan|i y|nde|ejw| no|zam|puz|ku |y a|a c|bih|ya |mur|utu|eny|uki|bos",
    "slk": " pr| a |prá|ráv| po|ie |ch |ost| ro|ho | na|vo |ani|na | ne|nos|ažd|kto|kaž| ka|má |né |ávo|om | má|ebo|ti | v | al|ale|leb|bo | je| za|ých|o n|ždý|dý |ia | sl|mi |ova|sti|nie|van|to |eni|ne |áva|lob|ého|slo|rod|tor|rov| sp| zá|á p|o v|a p| kt|ý m| sv|voj|bod|obo|nia| ná| vy|ej |je |ať |o p|a v|a s|áro|a z| sa| ma|a n|e a|e s|mu |mie|kla|nár|svo|spo| by|ovn|by |roz|sa |ľud|iť |odn| vš|ov |i a|néh|vše|o s|va |o a| ľu|oci|pre|nu |a m|u a|ený|e v|ný |nes|a k|zák|pod|ným| do|u p| k |u s|áci|ajú|byť|yť |nýc|eho|ran|pol|tát|stn|jeh|a r|šet|ými|lad|čin|ému|a o|edz|ť s|kon|stv|oré| sú| ni|e z|pri|och|ny |štá|sť |oje|vna|tre|u k| či|ko |é p|maj|smi|a a|etk|nak|ým |med|dov|prí| ob|iu |uds|osť|esm|e b|m a|hra|i s|rác|bez|vať|chr|e p| ab|jú | št|žen| ho|čen| de|i p|ť v| vo|dsk|pro|nom| in|ou |du |že |aby|est| bo|ré |bol| so|nú |olo|kej|áln| oc|obe|ky |dzi|dom|áv |por|lne|rav|aké|ens|pra|ok | že|tné| ta|ako|res| vz|i k|ami| tr| ak|ní |len|o d|del|ský|cho|ach|ivo|h p|ože|iál|inn|slu|kra|loč|očn|ju | os|anu|oju|voľ|ákl|str|é s|ené| ži|niu|sta| st|ved|tvo| me|dno|m p|de |ké |kým|ikt|stu|é v|i v|vyh| to|v a|odu|hoc|a t|ím |ly |hov|y s|soc|júc|ú p|odi|vod|liv|aní|ciá| ve|rej|ku |ci |ske|sob|čno|oso",
    "tuk": "lar| we|we | bi|yň |ary|ada|da | he| ha|an |yny|kla|dam|de | ad|yna|er |na | ýa|ir |dyr|iň |bir|r b|ydy|ler|ara|am |yr |ini|lan|r a|kly|lyd| öz|mag|nyň|öz |her|gyn|aga|en |ryn|akl|ala|dan|hak|eri|ne |uku|ar |r h|ga |ny |huk| de|ili|ygy|li |kuk|a h|nda|asy|len| ed|bil|atl|ine|edi|niň|lyg| hu| ga|e h|nde|dil|ryň|aza|zat|a g|‐da|a‐d|eti|ukl| gö|ly | bo|tly|gin| az|lma|ama|hem|dir|ykl|‐de|e d|ile|ýan|a d|ýet|ýa‐|ynd|lyk|aýy|e a|ünd|ge | go|egi|ilm|sy |ni |etm|em‐|lme|m‐d|aly|any| be|tle|syn|rin|y b|let|mak|a w|a ý|den|äge|ra | äh|mäg| du|n e|bol|meg|ele|ň h| et|igi|ň w|im |iýa| ýe| di|r e|ek | ba|ak |esi|ril|a b|in |p b|deň|etl|agy| bu| je|bu |e ö|y d| hi|mez| es|ard| sa|ähl|e b|yly| ka|esa|mek| gu|n a|e t|lik| do|e g|sas|ill|nma|ň a|ram|ola|hal|y w|ýar| ar|anm|mel|iri|siý|ndi|ede|gal|end|mil|rla|göz| ma|n b|e ý|öňü|ňün|n h| tu|hiç|yýe| ge|my |iç | öň|n ý|tla|ň ý|lin|rda|al |lig|gar| mi|i g|dal|rle|mal|kan|gat|tme|sin|and|ň g|gor| ta|öwl|ýle|y g|e w|ora|tiň|ekl| yn|alk|döw| dö|ere|m h| me|dur| er|asi|tut|at |çin|irl|umy|eli|erk|nme|wle|gur|a ö|aýa| çä|nun| ki|ras|aml|up |ýaş|tyn| aý|ry |ň d|baş|ip |gi |z h|kin|z ö|n w|ter|inm|eýl|i ý|kim|nam|eň |beý|dol| se| te|r d|utu|gyý|ez |umu|mum",
    "dan": "er |og | og|der| de|for|en |et |til| fo| ti|ing|de |nde|ret| re|hed|il |lig| ha|lle|den| en|ed |ver|els|und|ar | fr| me|se |lse|and|har|gen|ede|ge |ell|ng |at | af|nne|le |nge|e f|ghe|e o|igh|es |af |enn| at|ler| i |ske|hve|e e|r h|ne |enh|t t|ige|esk| el| be|ig |tig|fri|or |ska|nin|e s|ion| er|nhv|re |men|r o|e a| st|ati| sk| in|l a|tio| på|ett|ens|al |tti|med|r f|om |end|r e|del|g f|ke | so|på |eli|g o| an|r r|ns | al|nat|han| ve|r s|r a| un| he|t f|lin| si|r d|ter|ere|nes|det|e r| ud|ale|sam|ihe|lan|tte|rin|rih|ent|ndl|e m|isk|erk|ans|t s|kal| na|som|hol|lde|ind|e n|ren|n s|ner|kel|old|dig|te |ors|e i| hv|sni|sky|ene|vær| li| sa|s f|d d|ers|ste|nte|mme|ove|e h|nal|ona|ger| gr|age|g a|vil|all|e d|fre|tel|s o|g h|t o|t d|r i|e t| om|arb|d e|ern|r u| væ|d o|res|g t|klæ|øre|n f| vi| må|ven|sk | la|gte|kab|str|n m|rel|e b|run|rbe|bej|t i|ejd|kke|t e|g d|rkl|ilk|gru|ved|bes| da|nd | fu|lær|æri|rdi|ærd|ld |t m|dli|fun|sig| mo|sta|nst|rt |od | ar| op|vis|igt|ære|tet|t a|emm|g e|mod|rho|ie |g u|ker|rem| no|n h| fa|rsk|orm|e u|s s|em |d h| ge|ets|e g|g s|per| et|lem| tr|i s|da |dre|n a|des|dt |kyt|rde|ytt|eri|hen|erv|l e|rvi|ffe|off|isn|r t| of|ken|l h|rke|g i|tal|må |r k|lke|gt |t v|t b",
    "als": "të | të|dhe|he | dh|në |ë d|e t| e |et |ë t|imi|për|ejt|dre|rej| pë| dr| në|it |gji|sht|ve |jit|ë p| gj|ith| sh| i | li|het|e p| nj|t t|ër |ë n|in | ve|me |jtë|e n| ka|ara|e d|ush|n e|tet| pa|jer|hku|a t|re |ën |ë s|sh | ku|së |t d|ë m|kus|mit|lir|ka |ë k|jë |se | si| që| ba|etë|që |ë b|si |ë g|eri|thk|nje|eve|e k|e s|jet|ose|bas|ohe| os|ra | mb|iri|h k|min|shk|ash|rim|ndë| nd|një|jta|e m| me|eti|do | du|es |rë |e l|mi |anë|tar|t n| as|dër|hte|end|tën|vet|uar|und|ësi|kom|tje|duh|ndi|at |ave| ko|ri |ta |ë v|shm| de|ar |omb|i d| kë|i p|jes| ng|uhe|nga|i n|en |ë e|ga | ar|e a|ës |hme|bar| pe|htë|ë l|ur |ë i|isë|ime|sim|ris|tës|art|ëm |cil|tim|tyr|ësh| ma|shë|or |t a|kët|gje| ci|r n|e v|par|nuk|ëta|rgj|i i|ish|uk | nu|ë r|are| je|ë c| pu|atë|lim|lli| ës|ë a|i t|mar|ore| së|tit|lar|per|t p|rat|ite|inë|t s|riu|ke |ërg|a n|edh| pr|esi|irë|ërk| po|hë |ë j|i s|a e|ht |mba|roh|im |ari|e b|lit|ti |asn|tav|snj|t e|ik |tij|k d|qër|hëm|ras|res|otë|nal|mun| an|kla|ven|e q|tat|t i| fa|ij | tj|igj|te |ali|bro| di|roj| ti|uri|ojë|ë q|çdo|det|n p| pl|ekl|ind|erë|vep|dek|nim|ive|ror|sho|hoq|oqë|ëri|pri|r d|shp|esë|le |a d|shi| mu|dis|r t|ete| t |ë f|ëzo|zim| çd|mbr| re|e f|jen|i m|iut|n k|tha|s s|lot",
    "suk": "na | mu| bu| na|a b|ya |hu |a n|we | gu|nhu|a g| ba|a m|ili|wa | ya|li |unh| bo|mun|ali|bul|han|bo |i m|ilw|uli|ang|lil|la |i b|e n|ga | wi|kil|mu | al| se|u a|ge |kge|ekg|sek|lwe|ose|le |lo |bi |ulu|e y|kwe|ila|and|e b|i n|yo |ng’|a s|nga| ns|si |abi|nsi|ina|lin|aki|se |ban| ly| gw|dak|lu |ngi|gil|a w|o g|akw|u b|ile|anh|ka |ilo|a l|ubi|e g| nu|o n|ja |gan| ng| ma|lya|nul|g’w|ani|ndi|u m|iya|wiy| ji|jo | ka|yab|lwa|ada|o b|e k| ad|gwi|ho |gub| ku|ing|o a|o l|ula|ika|a i|u n|dik|iha|shi|ayo|gun| ja|ha |biz|o j|lag|ma |wen| sh|ele|ung|o s|gi |gul|mo |lan|iwa|a k|ala|iki|jil|ola|ji |a a|yak| li|nil|iza|agi|aha|man|bos|iga|kuj| ha|ana| lu| gi|iti| mh|uga|uyo|win| ga|za |a y|ki | nd|oma|ene|o w|a u|mah|yos|sol|hay| mi|iko|ong|aga|iku|gwa|i a|ndu|pan|u g|e i| ab|ujo|ida|nya|ibi|duh|but|i y|u w|iji|nhy| we|nik|aya|uhu|nda| il|je |abo|aji|lel|ubu|nay|ba |lug|lon|ale|mil|da |a j|dul|o m|mha|aka|e u|g’h|udu|lyo|e m|e a|gik|bus|bal|sha|wit|twa|ngh|nek|wig| um|okw|any|uma|ima|uso|bud|’we| ij|hil|bil|a h|imo|ita|no | ih|gut|nha|ne |iso|ulo|uno|yom|’ha|u l|elo|eki|wel|hya|ngu|omb|som|mbi|i g|o i|u i|bak| is|ugu| yi|utu|eni|tum|umo|u s|tog|inh|’wi|lit|waj|e j|ule|jiw|u u|kub|kul|lik|uto| uy|upa",
    "nob": "er | og|og |en | de|for|til|ing|ett| ti|et | ha| fo| re|ret|il |het|lle|ver|tt |ar |nne| en|om |ell|ng |har| me|enn|ter|de |lig| fr| so|r h|ler|av |le |den|and| i | er|som| å |hve|or |t t|ne | el|els|re | av|se |esk|enh|nge|ska|nde|e o|ete|gen|ke |lse|ghe|ten|men| st|r s|fri|igh|ig | be|e e|nhv|r r|tte|ske|te | på| ut| sk|al | in|sjo|på |der|e s|ner|rin|jon|t o|unn|e f|han|asj|tig|ed |es |g f|sam|ent|tti|ene|nes|med|ge | al|r o|ens|r e|eli|isk|lin| ve|nin|g o| sa| an|t f|itt|lik|end|kal|r f|t s|rih|ihe|nas|nte|e r|ns | si|lan|g s|mme|ige|l å|erk|dig| gr|n s|ren|r a|all| na|kte|erd|ere|e m|und|r u|res|tel|ste|gru|inn|lær|ers| un|det|t e|arb|ale|del|ekt|ven|t i|g e|bei|eid|e a|n m|e d| ar|rbe|e g| bl|ans|klæ| li| he|g t|æri|sky|run|rkl| la|sta|sni|kke|m e|rt |mot| mo|e n|tat|at |e h|e b|ove|e t|jen|t d|str| må|r m|n e|ors|rel|ker| et|n a|bes|one| vi|nn |g r|e i|kap|sk |ot |ndi|nnl|i s| da|s o| no|id |ger|g h|vis|n o|bar|s f|ndl|t m|g a|opp|t a|dis|nal|r d|per|dre|ona|ære|rdi|da |ute|nse|bli|ore|tet|rit| op|kra|eri|hol|old| kr|ytt|kyt|ffe|emm|g d|l f| om|isn| gj|å d|ser|r b| di| fa|n t|r k|lt |set| sl|dom|rvi|me |l e|gre|å s|må | tr|nd |m s|g i|ikk|n h| at|tes|vil|dli|g b|d d| hv|rav",
    "sag": "tî | tî|na | na| ng|a n|ngb|gö |ngö|nga|nî | lo|lo |zo |bi |la |gbi|ang| sô|sô |î l|gan|ö t| zo|o n| wa|a t|îng|i t|ngü|gü | al|lîn| nd|a l|ê t| kû|äng|î n| te|wal|ala|alî|î k|ë t|î m|â t|î â|ô a|î b| mb|ûê |gâ |örö|ngâ|kûê| lê|o k|a â|e n|ko |î s| kö|ter|dör|köd|ödö|ï n|a k|lêg|gë |ôko|ëpë|mû |pëp| pë|o a|êgë|eke|yek|ke |ü t|î t| ay|o t|bên|ê n|rê |pëe|ra |ëe |erê|rö |tï |kua|aye| nî| ôk|ua |a z|ä t| âl|â n|ïng|î d|ö n|âng|ênî| am|î z|ten|âla| yâ|ê a|mbê|a m|û n|a y|ne |ene|rä |î g|a s|bê | ku|arä|ndi|ga |diä|ëng|iä | du| ân|amû|dut|öng|yâ |utï|ro |önî|lï |a p| gï|oro|lë |î a| âm|ndo| sê|ngô|do |i n|o s|ndö|âra|e t| bê|gba|ûng| mä|sâr| sï|î p| gb|ö k|e a|yê |a a| âk|dö |ara|ba |ï t| tö|a w|zar|tön|î w|war|ndâ|a g|ana|në |ênd| të|ta |ban| lë|zön|î f|nzö| sâ|sï |tën|o w| nz|sên| âz| da| za|îrî| në|nën|ate|ä s|bâ | at|o l|ënë|o ô|fa | kp| ma|o p| mû|kân|a b|bat|ata|ô n|se | kâ|alë| ko|ông|da |ë s|üng|ë n|ibê|rös|mbë|bët|ëtï|âmb|mbâ|ïgî|mba|gî |tän| po|bûn|gï |amb|ü n|gbï|ôi |gôi| af|rë |erë|lê | as|afa|âzo|i p|sor| ad|i s| ba|gïg|ä n|bät|dë |ö â|kûe|ûe |kpä|päl|älë|e z|ätä|ö w|ngi| yê|köt|ötä|tä |ê s|kod| hï|hal|hïn|lëz|ëzo|ngä|gän|odë|ö m|mar|sär|pä |ärä|îan|rän|bîa|a h|gi |bor|du ",
    "nno": " og|og | de| ha|er |en |ar |til| ti|lle|ett|il |ret|om |et | re|le |har|enn| me| al|all| fr|ne |tt |re | å | i |nne|and|ing|ska| sk|men| fo|det|den|ver|for|ell|t t|dom| so|de |e s| ve| ei|ere| på|al |an |e o|e h|fri|sam| sa|l å|på |leg| el|ler|som|ein|ei |nde|av | st|dei|or |ten|esk|kal|gje|n s|tte|je |ske|rid|r r|i s|te |nes| gj|eg |ido|med|e f|r s|st |ke |jon| in|r f|sjo|asj|nas|ter|unn|ed |kje|han|ona| er|t o|t e|g f|ski|e m|ast|ane|e t| av| gr|lan|ste|tan|å f| na|der| sl|t s|seg|n o|r k|nga|ge | an|g o|at |na |ern|nte|ng | ut|lik|e a|bei|gru|e i|arb|kil|g s|lag|eid|r a|e d|g d| si| få|ame|a s|e r|rbe|jen|n m|r d|n e|nn |e n|erd| tr| må| bl| mo|ren|run|nin|bli|kra| kr| at|ege|n i|me |nsk|ins|år |frå|in |lov|v p|end|mot|ale|e v|å a|få |rav|int|nal| ar|sta|e k|t f|ome| la|ot |t a|sla| ik|nle|itt| li| kv|id |kkj|ikk| lo|nad|å v|tta| fa| se|gen|ld |å s|kan|g t| ka|r l|god|n a|lin|jel|ild|dig|ha |l d|kap|ve |ndr|g i|g a|inn|var|rna|r m|r g|a o|dre|d a|n t|ag |kår|mål|ig |va |i d|t m|e e|n d|tyr| om|g e|eve|då |e u| då|und| no|ir |gar|g g|l h|se |ga |d d|l f|ker|r o|å d|eld|ige|t d|t i|t h|oko|nnl|rel|nok|rt |lt |åse|jer|ta |ik |ial|eig|r p|i e|olk|bar|osi|kte|sos|lir|opp| un|ad | be",
    "mos": " n |ẽn| a | se|a t|sẽ|̃n | ne|a s| ye|e n| ta| tɩ|n t| pa|tɩ | la| so|nin| ni| b | fã|fãa|ãa |ng |a n| bu| tõ|la |ẽ | te|tõe|ne |ye |a a|or | ya| to|ed |ned|pa |e t|õe |tar|em |tẽ|g n|ã n|n m|aan| ma|sor|buu|n y|maa|uud|a y|r n|ins|n p|ud |ra |paa|ɩ n|a b| wa|d f| na|me |n d|ara|n b|sã |taa|n w|bã |an |yel|eng|aal|ɩ b|n n|gẽ|̃ng|og | ka| bɩ|bɩ | tʊ|gã | yɩ|na |am |e b|ame|wa |g a|d b|aam|ab |mb | bã|ãmb| ba|m n|wã |aab|a m|aa |saa|ga |nsa|yaa| wã|a l|tog|ore|n s|nd |ʊʊm| sõ| sã|ãng|seg|egd|d s|el |tʊʊ|ngã|ba | tũ| da|ã t| me|b s|re |dat|l s|d n|ɩ y|ã y|dɩ |aoo|g t| kã|m t|ing|r s|a p|b y|b n|gdɩ|men|dã |vɩɩ| vɩ|lg |oor|ã s|n k|al |rã |nga|ar | le|gr |d a|neb|̃nd|ɩɩm|ĩnd|yɩ |lem| pʊ| bʊ|pʊg|nge|to |b t|ɩ s|g s| mi| ke|a k|bãm| we|kao|ilg|wil| zĩ| no|kẽ| ra|m b|ʊge|b k| bũ|oog|ã p|bũm|ngr|at | wi|gam| ko|eb |g b|sõn|ãad|ã f|õng|ɩm |m s| yi|ũmb| yã|ʊm |oy |wẽ|noy|ʊmd|da |ren|a z|ya | gã|le |b p|ɩ t|n g| f |ni |soa|oab|i t| sɩ|lag| ti|te |o a|s n|oga|go |tũ |gem|age|a w|̃ n|in | yõ|a g|b b|aor|ka |ẽe|tũu|aas|a r|e y|ag |eg |r t|e a|ã k|iid|e p|neg|o t|ate|oa |e s|ũ n|mã |ms |ell|eem|ẽm|b w|̃ms|too|ik | zã|zĩn|kog|bao|r b|s a|bui|uii|ogl|aba|alo|loa|kãa|od |l b|ll |nda|kat|aka",
    "cat": " de| i |es |de |la | la| a | pe|per|ió |ent|tat| se|nt |ret|ts |dre|at | el|ls | dr|men|aci|a p|ció|ona| co|a l|al |na |s d|que|en |el | to|s i| qu| en|e l|ns |tot|et |t a|ers| pr|t d|ons|er | ll|ion|a s|ta |a t|con|els|s e| l’|rso|res|als|son| un|est|cio| re|pro|ita|cia| in|les| o |ue |del|lli|té | té|ia |ame|é d|sev|ota|nac|i l| al|s p|a d|ar |a i|ual|nal|a c|ant|nci| le|ert|sta|rta|ser|t i|i a|l d| no|va |ats| d’|s n|re |s a|e c|eva| na|rà | ca|ues|com|lib|és | so|ibe| es|ets|ber|da |r a|no |una|l’e|s l|ter|sen|ran|ure|des|man|i e|l p|t e|n d|e d|e e|om | di|cci|igu|a a|s t| pa|i d|tra|s o|aqu|tre|vol|ect|a u|l i|gua|ide|s s|ada|ene|ial|nta|ntr|ens|soc|cte|ra |oci|hum|uma|cla|ali|lit|erà|cti| aq| hu|ici|pre|era|ess|uni|nte| fo| ni|ble|sse|tes|alt|eme|ass|ica|seg|o s|ote|rac| ig| po|ans| és|a e|un |us |mit| ma|r s|se |ssi|s h|a m|r l|nit|l t|ènc|ó d|ten| te|ir |i p|tal|eta|dic|i i|hom|t q|par|egu|s f| as|n l|ria| mi| ac|lic|int| tr|act|eix|n e|s c|ont|nse|ecc|t t|ltr|amb|qua|l’a|eli|ura|an |ist|e t|ó a|one|nam|ing|lar|o p|esp|rec|lig|a f| ha|iva| am|lle|t s|rot|mat|liu|tiu|iur|n a|fon|ots|inc|ndi|e p|seu|olu|gur|i c|més|der|rna|ina|for|igi|cie|bli|ic |mb |in |art|ol |rom|nin|omp",
    "sot": " le|le |ng |ho | mo| ho| bo|a h| e |lo |ya |ba |e m|a l| ya| ts| ba|na |ong| ka|a b|tho|e t|sa |elo|olo|a m|ets| di|o e|la |mon|oth|tsa|o y|ka |eng|a k|oke|kel|a t|g l|tok|ang|o t|tla|mot| se|o l|e b| na| ha|lok|wa |e h| tl| a |aba|o b|tse|ha | o |hab|e k|tjh|a d|tso|jha| to|se |so |oko|e e|tsh|dit|pa |apa|o n|e l|loh|kol| ma|o m|a e|ela|ele|ana|a s|let|bol|ohi|a a|tsw|kap| ke|hi |g o|ohl|eo |ke |ona|set|o k|o s|di | kg|e d|aha|lan|bot|bo |ito|o h| mm|hle|eth|ena|i b|ala|ats|moh|swa|lwa|g k|atl|abe|g m|ola|phe|bat|ane|a n|mel| me|o a| ph|ebe|ell|hlo|tlo|etj|mat| sa|g t| th|g y|lat|mol|g b|g h| en|she|the|seb|nan|lek|boh|hae|kgo|hel|e s|edi|wan|me |kga|ae |to |a f|ath|lao| hl|han|ile|nah|we |ume|kan|otl|len|aka|efe|ire|bel|bet|rel|swe|mme|sen|a p| ko|g e|atj|lel|its|bon|oho|eha|shi|man|ano|nts|he |lal|eka| fu|o f|heo|got|all|ao |het|hat|get|ban|hal|kge| wa|a y|lla|fum|mmo|kar|alo| ef|thu|e y|wal|tha|san|hon|tlh| he|e n|ben|hla|ing|uma|pha|o o|si | tu|tum|llo|lle| ta|pan|hen|mo |nen|hir| lo|son|ots|tab|ama|ato|din|lap|hil| eo|dis|oka|elw|tsi|llw|i m|hol|pel|iso|no |e a|fet|lwe|adi| fe|fen|hwa|opa|kop|are|amo|ret|emo|i k|isa|o p|o d|i l|gat|dik|i t| nt| la|ame|shw|hah| am|nya|ita|mab",
    "lit": "as |ir | ir|eis|tei| te|s t|os |uri|ti |us |is |iek| pa|ai | vi|vie|tur| ki|ri |žmo| tu| žm|ien|ės |ių |ali|ais|mog|vis| ka|lai| la|ini|i t|s i|s ž|sę | į |isę|ena| ne| pr| bū| jo|pri|kie| ta|kvi|nas| su|ekv|mas|gus|būt|tin|isv|s s|ogu|isi|mą |mo |ant| ar|s k|ama|kai|ūti|s a|s v|aci| ti|s n| sa|s p|oki|cij|inė|ar |val|ms |tai|jo |i b| na|gal|sav|kur|aus|men|rin| ap|imą|ma |sta|ę į|ina|i p|imo|nim|i k| nu|ima|oti|mis| ku|jos|lyg|dar|išk|je | at|tas|kad|r t|tų |ad |tik|i i|nės|arb|i v|ijo|eik|aut|s b| įs| re|iam|sin|suo| be|isu| va|li |sty|asi|tie|ara|lin|isė|i s|ą i|jų | ly| ga|vo |si |r p|tuo|aik|rie| mo|din|pas|mok|ip |i n|rei|ybė|mos|aip|r l|ntu|įst|į t|gyv| iš|nti|tyb|ų i|pag|kia|kit|es |uot| sk|jim|tis| or|aud|yve|ven|mų |als|ų t|nac|avo|dam|ą k|i a|s j|oje|agr|kla|gau|neg|nių|o k|ega|iki|aug|ek |tat|ieš|tar|ia | ši|ios|ška|sva| to|tau|int|sau|uti| as|io |oga|san|mon|omi|kin|ito|s g|ome|r j| ve|aty|kim|nt |iai|lst| da|ją |min|r k|o t|nuo|tu |ver|kal|am |usi|o n|o a|ymo|tym|vę |ati| ji|o p|tim|ų n|paž|ter|s š| vy|alt|ksl|ing|ų s|oma|šal|ran|e t| ni| ša|ava|avi|nie|uom|irt|elg|jam|ipa|kių|tok|eka|tos|oja|kio|eny|nam|s d|ndi|amo|yti|gri|svę| gy|lie|ėmi|ats|ygi|soc|sie|oci|pat|cia",
    "umb": "kwe|oku|a o| ok|nda| kw| om|da |wen|e o|a k|la |ko | ly|end|nu |ka |o l|oko|mun|omu|unu|kwa|wa | ko|a v|o y|omo|mok|ali| vy|eka|olo|i o|osi| yo|lyo|mwe|si |okw|we |lo |iwa|o k|i k|le |te |a e|ete|gi |kut|sok|ong|iso| ya|vo |ang| ey|wet|ata|a y|o o|yok|ofe|fek|kuk|ela|a l|ilo| wo|owi|nga|iñg|kul|oka|vyo|uli|u e| va|li |ñgi|kal|wat|ta |u o|eci|ngi|ovo|ye |so | li|oci|yo |wiñ|nde|ga |ing| nd|ili|nge|ci |eye|ala|vya|e k|kol|isa|a a|lom|lon|go |avo|ako|ovi|pan| ol|uka|ngo|lya|ti |o v|akw|yal|olw|uti|imw|eli|alo|ge |ung| ku|a u|lis| al|onj|ati|wal|ale|e l|sa |i v|and| ov| yi|ika|ukw|ele|lil|yos|he | oc|yov|iha|ikw|omb|val|lin|lim|ahe|apo| ka| ye|yom| vo|lik|i l|kok|wav|aka|cih|o e|tiw| ke|yi |i w|ama|e y|lof|yow|yol| ek|kov|ole|vak|vik|tav|omw|a c|upa| el|ila| lo|aso|su |e v|lyu|ava|ñgo|lwa| wa|gis|gol| ce|tis|ave| on| es|po |wil|va |eso|kup|co | la|yam| ak|wam|iyo|ekw|e e|i c|tat|i a|a n|yah|eko|lwi|ita|lit| ec|kwi|upi|i y|epa|kan|kiy|nja|dec|asi|e u|yav|asu|mak|lap|yim|tya|vos|kas|cit| ha|lel|u c|a w|emb|u y|ola|yon| os|win|lye| ca|eyo| uk| ci| ow| yu|ayi|vel|liw|has|iti|sil| et|yuk|o w|umb|ulu|ya |wi |anj|kat|ngu|wom|o a|uva|esu|usu|mbo| co| of|mat|o c|ca |cel|vi |u l|ba |kon|mbe|wiw",
    "glg": " de|os |de | e |ión| a |da |to |ció|ere|ón |der|ito|en |a p| co|ent|eit|n d| se|rei|ade|as |aci|dad|s d| pe|per|o d|s e|e a|e d|men| da|nte|ers| pr| te|do |al |rso|ida|es |ten|soa|oa |que| to| po| o |a t| in|a e| li| do|cia|te |tod|res|o a|pro| re|tos|est|ra | es| ou|dos|lib|con|a d|nci|o e| na|e e|a a|a s|ber| á |oda| pa|e o| qu|e c|ue |ar |nac| en| sú|tra|s p| un|súa|com|ou |ia |nto|ser|a c|er |ns |a o|se |des|is |ter|s n| ca|ado|or |óns|sta|úa | no|rda|s s|ibe|rá |erd|era|no |nal| as|ica|e p|eme|erá|pre|sen|das|e n| ni|e s|por|ais|par|ant|ara|ame|cci|ona|io |o p|n p| di|cto|s t| so|o t|o á|nin| me| os|cio|enc|unh|n e|n c|nha|ha |ntr|ion|n s|á s|n t|s o|ese|nta|ect|e i|o s|e l|so |nid|oci|soc|ont|dic|ici|e t|tad| ac|tiv|ndi|ali|gua|l e|rec|a l| ig|omo|cas|o m|re | ma|ing|na |igu|vid|eli|ngu|und|s i|rac|a n|cla|cti|seu|ria|on |ase|o n|lic|s c|man|lid|a u|uni|ta | ó |ual|ido|ori| fu|ind|nda|ste|s a|tes| tr|act|ial|fun|dis|ecc|o ó|cal|mo |un |e r|iva|n o|ca |n a|o c|esp|ome|o o|seg|sti|r a|tor|r d|egu|ada|lo |nde|r o|uma|ote| el|alq|lqu|uer|spe|a i|tar|bre|tri|hum|olo|cie|ren|ena|ari|mat| fa|med|ura|lar|edi|ver|ixi|á p|ibr|gur|int|pen|rot|a f|cac|s f|ili|rio|ma |a v| vi|rim|len|ita",
    "bcl": "an | sa|in | na|ng |sa | pa|na |nin|ang| ka| ni| ma| an|pag| as|sin|asi|n s|ion|n n|cio|a m|on |ban| de|n a|ga |kan| mg|a p|mga|a n|os |rec|ere|der|cho|ech|n p|aci|aro|n m|man|a s| la|n d|o n|asa|n k|g s|kat|sar|ata|ay |o s|al |ong|n l| o |a a|ho |a k|igw|tal|gwa|amb|kas|sai|mba|wa |ara| ig|agk|o a|lam|ro |o i|gka|ali|apa|nac|san|aba|g p|ina|a d|iya|yan|ing|lin|may|ink|aiy|nka| ba|aka|a i|yo | in|ag |abo| da|aha|ini| ga|tan|s n|nta|ano|agt|s a|kai|ad |hay|ida|hos|o m|og |ia |iba|ent|han| ta|par|n i| hu|at |ron|a b|g n|ant|g m|nal|ayo|a g|dap|mag|no |sta|aya|iri| pr|nga|ran|cia|g k|es |pat|li | co|dad|l n|y n|bos| si|mak|pro|ala|men|gan|aki|nte|lan|o k|con|t n|gab|a l|g d|ona|n b|ta |do |nda|aan|as |uha|agp|a c|uli|awo|taw|pan|n o| so|hul|i n|ter|ado|ags|g a|tra|min|anw|tay|kam|nwa|waa|g o|a o|kap|ain|bal|bil|ami|g i|d a|res|ra |nag|gta|ton|n e|ba |nan| mi|kab|en |bas|gpa|nes|o p| di|pin|ika|l a|n g|ind|isa|cci|ili|ial|ecc|tec|nci|ios|bah| es|one|pak|om |imi|agi|ico| re|ana| bi|a e|nid|rim|rar| se|rab|s s|hal|i a|buh|sab|cri|ubo|bo |gi |wo |rin|int|agh|ipa|sii|ibo|ani|to |sad|hon| le|iis|a t|ast|say|lar|n c|aag|ote|rot|n t|y m|ici|paa|ley|ey |yag|aen|dan|ni | pu|atu|lab|sal|ica| gi",
    "tsn": " le|le |go | mo|ng | ts| go|lo | bo|ya |we | di|gwe| ya|ong|ngw|sa |olo|elo|a b|tsa|tsh| e |tlh|a l|o t|e t|a g|e m|wa |a t|o y|eng|na |e l| kg|wan|kgo|mo |o n|tse|a k| tl|ets|ane| ba|dit|mon|ele|hwa|shw|la |ka |a m|nel| na| ka|e d|o l| o |o m|ba |se |e g|e e|bot|a d| a |di | ga|ots|tla|otl| se|lol|o b|tho|so |lho|tso|o g|ang|got|e b|ga |lel|seg|o e|its|gol|ose|ho |oth|let|e o|lha|ego|aba|hab|e k|ano|los|a n| nn| ma|eka|g l|šha|tšh|kan|alo|ola|lhe|ela|aka|sen|gat|tsw|kga| nt|mol|o a|nng|o o|o k|aga|atl|o s|bat|tlo|agi|yo |len|g y|edi|e y| th|g m|dik|to |tir|e n| ja|a a|mel|o d|ana|ire|g k|rel|swe| yo|bon|gag|lek|e s|mot|kwa|i l| te|a s|he |agw|ats|iwa|i k|itš|ona|no |a e|mai|any|lao|ikg|she|ntl|lwa|dir|g t|lon|ale| sa|ao |hel|shi|tle| wa|ume|log|jwa|itl|pe |hir| jw|non|iti|a y|set|hok|ira| ti|odi| me|gi |e j|tek|etl|a p|ko |ath|ala|hol|bod|tet|mog|han|nya| mm|g g|nag|i t|adi| lo|oag|i b|nna| ko|the|lan|re |thu|wen|hot|nyo|hut|o i| ne|pol|me |tum|ope|ame|gan|emo|ore|wel|nts|oko|okg|iro|ro |tha|elw|amo|gor|ing|jal|isi|nan|ogo| it|jaa|si |oga|heo|gon|diw|pa |opa| kw|lat|are|bo |o j| ke|ke |ile|gis|o f|rag| ph|bok|aak|kar|rwa|nye|g a|atš|mok|ago|okw|hag|ate|ato|uto|gwa|mme| fa|fa | op",
    "nso": "go | le|le | go|a g|lo |ba | di|ka |o y|ya | ka| ya|ng | ma|a m| mo| tš|elo|etš|e g|a l|o l| bo|a k|a b|e t|na |o t|tok|wa |e m|a t| ga|la |ang| a | ba| se|man|tše|oke|o k|ša |kel|dit|tša|tho|we |ele|a d|o g|o a|a s|o b|gwe|e d|ho |o m|ego|e l| na|tšh| to|šo |še |oko|ga |di | o |olo| e |let|ong|gob| ye|oba|ago| tl|tšw|mo |e b|re |g l|ngw|aba|tšo|swa|šha|ane|tla|hab|o n|ona|ito|ela| kg|ogo| th|oth|wan|eo |e k| sw|lok|kgo|log|ye |o d|a n|ola|g o|e s|set|hlo|kol|se | wa|lel|ao |eng|o s|šwa|mol| ts|eth|net|ano| bj|a y|o e| ke|thu|hut|šwe|ge |itš|leg|rel|alo|to |ohl| ge|mog|kan|e e|ire|nag|ke |eba|aka|pha|gag|bot|o w|aga|a a|mot|are|mok| yo|gor|oka|ko |gon|no |ore|ana|agw| wo|bon|bat|lwa|tse|bja| ph|din|yo |e r|šeg|e y|ath|nya|get|lao|sa |wo | re|wag|odi| sa|seb| me|utš|oph|mel|iti|kge|ato|kar|o o|šom| la|o f|phe|edi|hir|ala|pol|lat|ušo|i g|a p|g y|the| fi|ume|wel|bop|hel|emo| du|ile|gwa|bo |ale|tle|lwe|lek|ban|ta | lo|lon|o š|dir|mae| mm|tlh|god|pel|a w|weg|eka|elw|atš|išo|aem|šhi| ko|gam|rwa|mmo|boi|e n|ntl|pan|amm|i l|i b|hle|hla|leb| am|šon|jo |len|i s|kop|ret|gel|ing|opa|yeo|dum|sen|e a|ape|ase|kwa|lef|mal|amo|oge|bjo|oik|mon|kga|okg|a f|tsh|boh|uto|ika|ahl|ja |adi|iša|gab|hom|abo",
    "ban": "ng |an |ang| sa|ing|san| ma| pa|ane|rin|ne |ak |hak| ha| ka|n s| ri| ke|nga| ng|man|in |lan|a s|ara|ma | ja|n p|n k| pe|g s|g p|pun|asa|uwe|gan|n m|nin|sal|pan| la|alu|iri|sa |lui|jan|adi|a m|adu|uir|ra |yan|mad|kan|wan|duw|ur |tan|g j|anm|we | tu|nma|ika|awi|nge|ah |tur|ih |ban|ka |e h| ne|n n|en |nte|un |ngs|eng|anu|beb|aya|ani|ana|ian|a p|ala|bas|nan|gsa|ngg|uta| da|gar|aka|eba|da |apa|asi|ama|lih|aha| wa|ten| ut| ta|a n|ebe|are| wi|han|aje|keb|oni|nik|ent|aki|uni|ata|wia|iad|g n| pu|jer|ero|ron|aan|k h|saj|din|sak|a t|nus|dan|n w|pen|usa| ba|ngk| pi|ant|sam|e p|taw|n r|ate|wi |nen|i m|ega|neg|iwa|pat|atu|e s|ami|ipu|g k|ina|mar|kat|kal|aga|sar|ran|kin|per|g r|ndi|arg|ar |ksa|e m|ren|nya|al |tat|ida|ela|h p|aks|ntu|ngu|ado|lak| ny|oli|at |wen|ep |i k| se|dos|h s|n l|dad|gka|eka|a k|rep|eda|n h|par|upa|ena|swa| sw| in|nay|ewa|ung|era|ali|a u| mu|eh |nip|r p|e k|n t|k p|ras|i n|uku|n i|wah|eri|g m|pak|n b|r n|ayo|nda|mal|mi |um |dik|os |osa| mi|yom|na |teh|awe|k r|lar|car|tah|sia|g h|ti | hu|ut |huk|kum|sti|ewe|tuk| me|rga|pin|h m| su|gi |ari|n d|a w|ta |uan|gaw|gen|h r|on |war|tut|lah|pag|gay|r m|n u|ada|ira|a b|ngi|end|kew|g t|min|ggi|gda|jag|as |rap|agu| an|e n|ngd|s k|ila|eta",
    "bug": "na |eng|ng | na| ri|ang|nge|nna|ngn|gng|ge |sen|a r| ma| pa| si| ta| ha|ri |hak|app|tau|ak |au |ddi|a t|ase|edd|ale|a n|nap|gen|len|ass|pa |e n|ai |ria|enn|ega| ru|upa|rup|ias|a a|ing|inn|a s|pun|ngi|nin|e p|ini|nai|ga |lal|gi |sin|ppu|are|ae |ye | ye|ana|g n|sed|ada|le | as|i h|a p|ama|g r|i r|man| se|una|ara|ra |di |ssa|ren|a m|pad|e r|ila|ban|asa| ke|san|din|e a|ura| la|ane| de|nas|e s|i a|ipa|pan|u n|ann|i l| ad|da |ala|aji|ole|att| pu| e |ong|i s| ba|pur|aga|lai|i p|lan|g a|ngs|sal|ola|gsa|g s|a b|i n|ppa|rip| we|a k|g m|asi|wed|akk|mas|i m|ril|u r|reg|g p| pe|ung|gar|neg|sse| po|e m|k h| ar|pas| ne|map|ian| te|nar|pol|ett|ran| ja|bas|eba|jam|beb|ena|par| al|sib|ebe|ngk|uru|keb| sa|ain|ttu| mo|aka|unn|add|iba|sa |gan|gka|nen|bbi|i t| at|atu|kan|nan|uan|leb|rus|de |e d|ton|ata|tu |ssi|ro |e y|cen|kun|awa|ell| wa|k r|mak|wa |uwe|ire|ebb|gag|apa|sae| tu| ia|tte|mat|sim| to|a d|o r|ta |nat|ece|tur|la |ie |dec|ko |kel| di| hu|nca|caj|pak|rel|ma |lu |g t|bol|uku|e e|ter|jaj|tta|we |bir|deg|huk|e h|dan|ure|baw|kol|rit|kko|ele|arg|rga|llu|oe |lin|use|ari|auw|pat|mul|elo|ula|iti|gau|an |u p|nga|g y|a h|ekk|sil|ka |e w|ade|anc|iga|sip|ten|a y|e t| me|nre|aja|ji |rek|a w|dde|per|iko|sik",
    "knc": " a |ro |be |nzə|ye |a a| ha| kə|abe|akk| ka|zə |adə|a n|a k|kki|hak|mbe| la| ad|ndu| nd|wa |ben|en |ma |də | ya|o a|əbe|ə a|ga |e a|əga|lan|əna|lar|aye|aro|kin|inz|rdə|ard|ana|yay| ga|əla|kəl|ji |awa| mb|bej|eji|kən| ba|an |uro|du | na| ku|anz|dəg|nəm|kal| nə|e m|na |gan| du| sh|shi|amb|n k| su|ara|u y| ta|so |a d|kam|wo | ye| sa|e h|a s|sur|aso|au | au|iwa|nyi|kur|a l| da|kar| as|dəb|iya|kiw|o k|obe|e s|ada|ama|and|u a|aa |ta |ima|n n|la |əwa|nga| ci|ba | ab| nz|əgə| fa|ənd|ata|ndo|ya |tə |nza|ə n|ndi|a g|in |nam| fu|ə k|aya|a t|tən|a b|təg|ru |uru|inb|am |e k|al |ida|mga|aar|a h|baa|ə s|nab|dəw|dun|asa|nya|owu|gad|taw|o w|gən|a y|kat|dam| sə|o h|əra|e n|awo|ade|əmk| wa| wo|amg|dən| tə|a f|ala|i a|zəg|o n|uny|iga|zən|əli|wur|u k|o s|wan|za |din|utu|e l|san|i k|uwu|wu |awu|n a|on |de |da |nba|mka|yi |gay|tam| ng|laa|gin|azə|bem|gai|taa|ibe|rad|adi|fut| mə|wow|wak|ali|kun| an|mər|o t|yab|nad|aim|əgi|i n| aw|liw|cid|u s|edə|atə|any|do |apt|lka|alk|dar|rta|bed|tu |ela|ndə|uwo|gal|yir|wum|n y|ayi|n d|mma|zəb| yi|nan|ltə|lmu|ilm|mar|bel|raj| il|ero|m a|utə|enz|iro|alw|uma|umm| um|e g|how|kka|o f| ny| ho|fuw|ə h|ang|tin|zəl|o g|ema|ən |no |a i|a m|wal|əny|iwo|lil|ədə|ə f|rtə|hi |diy|mu ",
    "ibb": "ke | nd| mm|me | ke|e u|ndi|o e| em|mme|de |en |e n|owo| en| ow|wo |i e|mi |ye |emi|nye| un|e e|edi|ene| ek|yen|eny| ed|e m|nen|une|ana|n e|e o|e i| ye| uk|et |n n|eke|na |e k| mb|em |ne | id| es|un |kpu|ede|iet|ndo| nk|o k|di |kpo|ukp|did|am |an |kie|nam|kem|esi|o u| nt|idu|eme|o n|t e|no |yun|mo | uf|ho |mmo|nyu| in|o m|kpe|o o|sie|oho| kp|do |din|ie |ono|kpa|m e|ri |nkp|dib|on |e a|uke| ki|boh|a k| et|po |ida|dut|m u|ked|ded| ub| of|ond|ru |uru|pur|in |ut |du |eko|a u|ina| ot|mbe|n o|bet|iny|man| ak|op |idi|ikp|i o|edu|kon|ade|om | us|uan|wem|a m|uwe| uw|puk|ak |ode|ro |t m|a e|oro|a n|n k|u o|to |te |bo |akp|ufo|ok |dik|pan|mbo|bio|i m|ide|ini|fur|uri|ban|ofu|ubo|n i|o i|uto|iso|dom|omo|ema|diy|fen| nw|dis| ny| is|ni |usu|n m|u u|fin|tom|eto|pem|ed |m m|ibo|oto|o a|sua|wed|nwe|m n| ut|mde|dud| eb|ara| as|i n|oki| ob|nte|mok| ik| an|kar|m k|o y|t k| on|i u|nwa|n y|asa|ama|re |ufi|uka|io |nek|i k| or|pon|top|sun|ion|se |aha|t o|k n|e y|ere| ef|mba|mad|isu| mi|kor|ra |ian|i a|ka |a a|k m|ko |da |t i|ena|obi| ey|ha |dia|ti |aba|uk |u m|d e|dem|san|a o| se|pa | ab|tod|n u|p m|ude|fok|k u|efe|uku|nti|nka|ibi|son|he |pe |nto|dak|a y| od|nde|eye|anw|ndu|mbu|so |ebi|bie|nda|sin|med|tu ",
    "lug": "a o| ok| mu|oku|mu |wa |nga| ob|ga |tu |ntu|a e|na |bwa|a a|ang|ra |aba| n |ba |a m|wan|a n| ng| ab|li |obu|unt|a k|era|ibw|dde|oba|a b|u n|za |la |mun|ban|ali|ka |emb|iri|bul|ate|mbe|i m| ek|tee|eek|uli| bu|u a|edd|sa | ku|ant|ana|eki|u b|be |dem| eb|ama|n o| om|ira|omu| ki| ed|ye |ala|amu| am|e o|gwa|nna| er|kuk|y o|kwa| en|okw|eer| ly|inz|ula|kus|kir|u e| ba| em|eri| ky|any|onn| wa| ye|ggw|ina|kol|n e|awa| bw|uyi|u k|eka|yo |bwe|ola|o e|usa|o o|kwe|mus|yin|bal|i e|u m|ngi|e m|bir|riz|ere|ri |ebi|kul|aga|nza|kub|ekw| eg|ko |a y|u o|we |kut|mat|e l|e e|a l|aan|ger|no |kan|sin|nka|gir|uso| at|a g|iza|gan|nyi|zes|uku|wo |nge|zib|isa|izi|ya |egg|ufu|rir|lin|wam|wal|eby|a w|i o|bee|oze|esa|eta|iko|ebw| ma|ako|bon|tuu|kin|uki|de |zi |kug|yen|ino|e b|obo|aka|ulu| te|ne |lwa|ma |y e|lye|kuy|nsi|i y|gi |utu|ly |imu|e n|taa|asa|enk|ku |o n|o b|sob|si |una|bun|usi|san|e k| ag|uka|uga|ata| ol|rwa|wen|ing|wat|kik|o k| by|nya|ong|kye|by |kyo| bo|ewa|yam|bye|ubi|ngo|kis|ani|boz|kit|i n| aw|ky | al|sib|muk|awo|uko|umu|ibi|uma|afu|olw|eky|tab|ung|buy|ini|uum|saa|y a|lal|mag|ro |end|add|enn|kib|ens|ole|ni |mbi|o a|i k|gat| og|maw|and|kuu|a z|wet|igi|yig|emu| ne| gw|a t|nzi|n a|gya|amb|uwa|ulw| ey",
    "ace": "ng |an |eun|ang| ha|peu|oe |ak |on |nya| ny|yan| ta|ngo|ung|gon|na |ah | pe|reu| ng| ba| ke|hak|meu|keu| me|eut|at |ure| na|ban|ee | di|teu|roe|ata| ur|ara| be|seu|han|a h| sa|am |dro|eur|um |n n|tie|iep| ma| la|ala|nan|g n|ut |ong|a n|ep |tan| te|tap|jeu| ti|eul|eub|eu |eug| da|eum|eh |euk|ra |ih |n p|uga|ai |n b|a t|e n|lam|eba| se|beb|n t|awa|om |a b| ka|asa| at|eus|and|nyo|oh |ta |ka |h t|n k|p u|man|e t|n d|n h|ana|dan| pi|ape|a s|neu|nda| si|t n|bah|ula|yoe|a k|h n|dum|euh|g d|e p|eng|e b| le| pa|ngs|sia|ran|ma |g k|un | wa|ndu|lan|una|heu|ura|n m|lah|sa |n a| ra|aba|g s|a p|ia |und| je|wa |kat|bak|k n|anj| dr|asi| bu|nga|beu|uny|yar|sya|hai|k m|k t|k a|ama|aan|ek |a m|ok |g h|aka|sab|g p|i n|uta|khe|h p|ue |uka|har|ari|di |e d| su| um|t t|a l|ya |san|e s|gan|uko|gsa|e u| li|kan|bat|lee|aro|ot |n s|leu|ina|h d|lak|oih|yat|n u|kom|pat|ate| ne|ngg|nje|taw|mas|uma|sid|anu|umu|aja|si |uh |h m|rat|aya|sal|et |soe|t b|n l|aga|taa|usi| ja|ute|m p|en |dek|ila|a d|ube|dip|gam|any|lin|tam|don|ika|usa| ji|rak|idr|h b|nus|adi| as|dar|ame|n j|ngk|m n|eup|h h|bue|k h|huk|euj|g b|gar|eka|gah|upa|ile|sam| bi|h s| de| in|mum|‐ti|t h| hu|k k|pho|dil|ep‐|nta| ge|geu|h l|hat|ie |tha|use|ieh|sas",
    "kmb": "a k| ku|ya |la |ala| mu| ki|a m| o |u k|ni |o k| ni|kal| ky|mu | ya|lu |dya| dy|a o|ang|kya|a n|tok|i k|oso|so |kwa|nge|xi |na |elu|nga| kw|wa | wa|a d|hu |kut|thu|uka|oka|mut| ka|a i|mba|uth|ka |gel|ba |u m|u y|ku |ene|u n|ga |kuk|ban|ixi|i m|e k|wal|oke| mb|kik|kel|ne |u w|ela|uto|i y|ana| ng|iji|a y|kit|ma | ji|nda|ngu|yos|kum|ulu|ji |i d|isa|und| it|and|ong| mw|u i|iba|ika|wen| di|ten|ilu|ila|ndu|ye |sa |kub|aka|ena|amb|ung|olo|a w|ngo|kil|oxi|lo |muk|ke |sok|du |mox|ate|o w|kus|wat|ta | wo|gu | ph|u d|ito|ita|e m|alu|a j|kis|tun|uma|wos|luk|o m|san|mwe|a a|di |imo|ula|wan|nji|jix|i j|a t|kij|idi|kan|uku|gan|kul|e o|kye|adi|ato|o i| ja| ix|da |nu |o n|uta|kud| yo|i n|udi|ki |su |tal|a u|lun|e y|u u| ye|jin|iki|pha|hal|wij|we |a s|lak|ikw|go |tes|fol|itu|eng| ke| uf|yen|ing|yat|ele|utu|kyo|o y|kwe|kwi|uba| en|kib|ite| we|dal|i o|yan|ge |eny|tan|uki| ik|dib| im|esu|lon|kat|atu|e n|ja |i u|jya|vwa|kam|i w|ute|ini|uke|lel|esa| se|xil| ut|fun|unj|ufo|mbo| a |uso|kim|mun|u p|nen|ukw|u o|i i|umu|han|gon| il|lan|ata|te |i a| ko|jil|o a|nde|nyo|eka| at|o d|exi|ijy|tu |usa|tul|kuz|ilo|dis| un|u j|dit|ufu|ote| ib|ivw|mwi| bh| ha|se |bul|ubu|win| os|imb|bha|ama| to|axi|inu| uk|sak|kos|bot",
    "tzm": "en |an | ye| d | n |ad |ur | ad|n i| s |agh|ḥe|n t| i |dan| ta| lh|lḥ|d y| gh|ell|n a|ra |̣eq|i t|eqq|s l|mda|ett|n d|d t|akk|la | ti|qq |hur|di | di| am|gh |ghu| is|t i|r s|in |nag| na|a y|is | te|a d|n n|yet|n g|ll |ara|ghe|ma | we| ar| wa|n s|l a|n l|sen|edd| ak|it |li | le|dd |ull|lla| id|d a| ur|rfa|erf|kul| yi| ku|as | se| ma|zer|amd|a n|lli|lel|men|t a|kw | de|t t|nt |kkw| im|fan|a i|a t|eg |n w|i d|q a|rt |ar |gar| ag|es | tl|ize|emd|i w|i l|deg| as|ken| dd|n u|lan|d i|a a|wak|tta| tm|d u|er | tu|wem|at |ddu|tle|w d|n y|t n|sse|r a|mur|s t|tam|gi | tt|yes|wan|r i|tim|na |wen|twa|d l|ttu|kke|wa |nen| iz|iḥ| u |win|d n|ame|s d|ent|ḍe|hel|a l|hed|ess|t d|mga|arw|i n|ḥu|mi |mad|agi|i g|der|udd|s n|rwa|̣en|awa|i i|ya |h d|iya|s y|msa|uḥ|idd|urt|un |n m|ane|em |sef|lsa|ili|q i|qan|leq|siy| ik|el |err| in|yed| la|ant|den|tag|man|g w|mma|yen|len|tmu|i u|aw |taw|r y|wad|edm|ṣe|hla|t l|̣er|ala|asi|ef |u a|tte|ddi|ttw| lâ|imi|l n|til|al | ne|am |̣ud| lq|iḍ| ya|dda|̣ṛ|med|ren| ss|gra|m a|ghl| il|chu|tem| ll|khe|way|eln|lna|ana|ukl|duk|gha|lt |ni |all|i a|tal|ray|nes|s k|tes|naw|ert|ila|awi|lqa|kra|anu|nun| kr|ikh|ezm|n k|iwe|iwi|ima|net|ser|s u|ir |yeh| an|aya|ehw|hwa|esk|dde",
    "war": "an |ga |nga| ka| ng| pa| ha|han|pag|in |ata| hi| an|mga| mg| ma|kat|hin|a m|ay |a p|ya |ung|a k|gan|on |n h|n n|ug |n p|n k| ug|n m|da |a h|n i|ha |iya|adu|dun|tad|a n| ta|ada|sa | iy|ara| na| di| o |pan|may|a t|ang|ud |ana|n a|o h|o n|taw|n u|ags|yon|y k|al |tag|asa|kad|o p|man| ba|awo|gsa|wo |ag |gad| in|a a|a u|ina|syo|a i|a s|od |ing|agp|ala|asy|ngo|n b|ali|nas|san|aka|a d|ra |g a|was|g h|aha|gpa|agt|to |ad |n t|tun|ng |usa| wa| tu|ini|iri|tan|ahi|kan|ray|nal|war|dir|i h|gka| us|god|g p|ri |a b|nan|ida|o a|i n|bal|y h|kas|uga|hat|tal|nah|awa|ni |pin|uha|buh|o m| bu|gud|aba|at |no | pi|bah|g m|ili|him|aya|atu|d h|agi| su|agk|lwa|mo |d a|alw|sya|uma|ano|int|kal|upa|mag|yo |o u|agb|n d|asu|lin|a o| ko|ona|did|hiy| bi|as | ki|l n|sud|iba|hi |o k|kon|ira| la|gba|pam|amo|g i|ton|gin|n o|uro|ho |os |la |g k|gtu|d m|aud|aag|t h|gi | gu| ig| ir|n g|abu|aho|ami| sa|ati|par|kau|ern|ban|tra|gar|ama|ras|yan|adt|tum| un|ka |aga|aso|api|dto|kin|tik|mil|iko|rin|sal|ika|a g|ila|mah|lip|rab|non|agu|ak |dad|lau|d n|ko |it |pak|n e| ti|una|i m|lig|s h|bay|ro |sug|mak|n w|naa|g n| so| ag|yal|nte|lal|ba |aup|lan|ihi|y b|kah|tub|bye| am|ari|yer|uka|ani|uyo|oha|ito|n s|upo|ent| pu|sam|iin|til|mat|ato",
    "lun": "la | mu|ng | ku|a k|tu |ntu|chi| ch|a n|aku|di |mun|ma |unt|a m|g a| a | na|ela|ndi|aka| we|ima|jim|shi|eji|u w|i k| ni|ind|wu |i m|a w| in|a i|u m|hi |awu|na |kul|wej|lon|cha| ja|sha| kw|a c|i n|nak|ala|mu |wa |ing|ka |ung|kum|a h|ulo|him|mbi|muk|u c| wa|hak|iku|nsh|yi | ha|bi |amu|imb|ewa|wen|kwa|ang|adi|idi|kut|esh|ana|g o|ila|ha |tun|u j|ong|nik|kuk|tel|ovu| ov|u n|han| an|ate|vu |a a|kal|ula|kwi|jak|u a| ya|a y|ilu|u k| he|ham|and|uch|kus|ond|eka|hel|kew|zat|del|hin|uku|nde|i j|enk|i a|uka|eng|ach|lu |nat|nji|ona|mon|awa|nke|umo|ins| yi|a d|ama|udi|wak|i h|ati|i c|wan|ta |bul|mwi|ata|ayi| ak|uma|i y|ina|ich|itu|uza|kuz|nin| mw|ku |kin|wun|sak|naw|nyi|ni |ant|muc|wal|ish|u y|mul|kud|waw|uke|wes|uki|i i|kam|yid|wit|da |akw|kad|yan| di|ken|uta|ika|imu|iya|nda| ns|mbu|ya |ule|dil|iha|kuy| ko|hik|eni|ahi|kuh|si |kun|ush|umu|atw|g e|his|dik|ji |any|li | ye|dim|kos|osi|hih|wat|eyi|ney| ne|amb|twe|til|wil|nu |kwe|u h|etu|tiy|ja |nan|ash|mwe|win|was|hit|iti| wu|iwa|wah|lem|g i|tam|din|hu |haw|nga|kay| ka|hid|yin|isa|iki| ma|jaw|jil|che|mpe|omp|eta|tan|jin|hiw|usa|umb|eme|inj| hi|ulu|ubu|nam|wik|mpi| da|ale|ite|tal|twa|ahu|end|nka|mba| at|ga |mes|dic|iwu|yej|kan|kuc|iyi|sem|emb|lun|una",
    "bam": " ka|ni |a k|ka |an | ni|kan| bɛ|n k| la|i k|ya |la |ye |ɔgɔ|na | ye|bɛɛ|ɛɛ |en |li |sir|ɛ k|ama| ma|ira|a d|ra |ali|’a | da|man|a n|a b| i |ma | kɛ| wa|gɔ |wal|mɔg|ana|n n| ba| ja|ɔrɔ| mi| kɔ| k’| mɔ| jo| si|min|iya|dan|len|i m|’i |in |kɔn|ko |aw |den| sa| o | n’|ara|bɛ |i n|jam|ɔnɔ| na|ɛrɛ|a s|i j|ani|n b|a m|i d| fɛ| tɛ| an|osi|jos|a y|kɛ |a l|iri| ko| di|ɛ b|ada|ila|ɛ m|i t| fa|nɔ | de| ha|asi|tɛ |ari|a j|raw|a t|ɛ s|ale|a f|tig|ɛn |aya|dam|a i|i b|sar|si |riy|ɲa |n y|nu |inn|e k|ɔn |rɔ |ang|a w|o j|w n|nnu|k’i|nti|nɲa|ade|abi|bil|ala|hɔr|kal|had|igɛ|i s|a a|mad| a |aga|u k|kab|a ɲ|aba| ti|olo| hɔ|o b|ɛ j|i f| ta|ɔ k|aar|baa|ɛ n|n’a|kun|ugu|iɲɛ|diɲ|n j|k’a|a h|rɛ |ati|ɔ m| se| cɛ|ɲɔg|bɔ | tɔ|i y|lan|i h| ɲɔ|tɔn|don|nɛ |inɛ|ga |i l|ɲɛ |ile| fo|o k|ɛ l|nna|ili|un |gɔn|maa|fɛn|n d|ant|n i|aay|go |da | jɛ|u b|ri |rɔn|aka|lak|ɔnɲ|e m|ɔ b|nin|nw |cɛ |w k|yɔr|n o|o f|nga|jo |o m|nen|n’i|on |ɛ t| ku|o l|igi|ɲɛn|anb|fɛ |ɔ s| bɔ|n m|e b|afa|nka|n f|nma| fi|’u |ɔ n| ɲɛ|fan|i ɲ|ti |a o|dil|ɛ d|uya| sɔ|ago|ɛ y|e f|ɛmɛ|mɛn|aju|e d|bɛn| jɔ| fu|til|bag|fur|n t|uru|kar|atɔ|be | d’| du|d’a|oma|lom| u | do|riw|taa|w l|mɛ |gɛ |imɛ|n w|iir|nni|iim|amu|so |bal| ɲa| b’|gu |ɛɛr|’o |iwa|n s|wol|ele|ɲan",
    "wol": " ci|ci | sa|am |sañ|añ | na| ak|ak |lu |it | mb| am|aa |na |al |ñ s|ñu |ne |mu |te |pp | ne| ko|m n|i a| ku| ñu| te| mu|baa|u n|ko |u a|mba|a s|e a|ay | wa| lu| do|ar | ni|u m|nit|oo |épp| ta|oom|gu |t k|i b|ku |u k| it|éew|rée| ré|u y|xal| aa|kk |i d| bu|doo|i w| bi|war|u c| yi|aay|llu| li|fee|loo| xe| xa| ya|taa| di|yi |ama|on |u j|yu |eex|ew | yo|boo|xee| bo| wà|àll|wàl|mi |o c|ir |mën| më|yoo|ul | gu|nn |en |oot| du| so|oon|e m|dam|een|u d|i n|uy |eet|i m|ara| ba|bu |a a|ata|okk|aad| lé| ay|ju |ada| nj|nam|und|axa|dun|m a|enn|r n|aar|ex |taw|ala| jà| pa|et |di |ën |ana|ral|ota|k s|awf|naa|wfe| gi|u l|igg|aju| dë|ma | aj|ti |u t| se|ax |gée|mbo| ja|ool|bii|li |a m| ke|see|m c| ye|i l| ng|yam|ngu| yu|w m|an |ken|n w| lo|i s| me| de|m m|i t|om |u x|n t| an| mi|jaa|laa|ee |bok|lig|p l|n m|t y|ggé|k l|a l|lép|àpp|jàp|aam| jë|aax|ekk|nd |góo|ewa|ndi|tax|a d| da|amu|éey|gi | su|k c|n n|l b|o n|k t|p n|jàn|àng|gir| jo|a c|n a|n c|ñoo|i ñ|a n|kaa|ba |m g|le |une|kan|e b|la |nda|lee|i j|ang|aat|k n|ey |ant|iir|a y|l a|e n|nan|añu|men|j a|ok |k i|nee|l x|omi|i c|oxa|aw |g m|dox|nte|opp|u w|ngi| mo|omu|y d|are|i k|aan|em |du |a b|njà|ñ ñ| ti|m r|kun|ddu|ali| së| la|eg | ma|ëra|ng |xam|mul",
    "nds": "en |un |at |n d| da| de| un|een|dat|de |t d|sch|cht| ee| he|n s| wa|n e| vu|vun|ech|rec|ht |er |ten| to|tt | si| re|ver| ge|nne|t w|n w|ett|n h|n v|k u|n u| el|gen|elk|lk |t u|ien|to |ch | ve|wat|sie|war|het|it | an|n f|ner| mi| in|ann|rn | fö|ör |r d| fr|t r|hte|orr|ich|för| sc|rie|eit| or|den|nsc|ege|fri|rer| st|t g| up|aar|t a|nd | is|ll |rre|is |up |t e|chu|rt |se |ins|daa|lt |on |t h|oon|che|all|n g| ma|rrn|min| se|ell|hei| na|t s|n i|n a|nn |len| sü|in |rd |nen| we| bi|n m|e s|ven|ken|doo|sse|ren|aat|e m|ers|n t|s d|n b|lle|ünn|t t|n o|ik |kee|e g|t v|n k|hen|arr| dr|heb|lie|ebb|e v| al|e a|llt| ke|hn |he | wi|cho|ehe|ok |ard|sta|men|ill|gel|tsc| ok| do|an |düs|ene|erk| gr| dü|weg|ie |ede|ieh|r s|sün|üss|und|raa| dö|röf|drö|t m|ats|öff|e f|ünd|e w|dör|ens| gl|rch|sik|ig |kt |örc|ere|gru| ün|ff |ahn|nre|mit|st |al |aal|hon|ert|kan|nat|der|dee|enn|run| so|eih|lic|ehr|upp|iht|nwe| fa|pp |eke|e r|unw|t n|taa|hup| ka| be|bbt| wo|p s|el |as |t f|bt |e e|nee|maa|huu|eve|nst|ste|mee| ni|inn|n n|ern|iet| me|hör|dde|ent|n r|t o|öve|are|arb|ite|ter|l d|ach|nic|bei| as|lan|t b|d d|t i|ang|ame|rbe|utt| ut|pen| eh|uul|iek|hr | ar|r t|ul |e d|art|n ü|one|eer|na |nte|mut|ete|üd | mu|üüd|lüü",
    "vmw": "tth|la |thu|a e|na |hu |kha|a m|we |ana| mu|a o|awe|ela|ni |ala|hal|edi|to | ed|ire|dir|eit|ito|rei|ya |a n|wa |mut|a w| wa| ni|akh|aan|u o| on|o y|okh|utt|a a|haa| n’|wak|nla| wi|ari| yo| si| ok| ot|iwa|ka |iya| sa|ne |apo|lap|ale|le | oh|oth|att|the|mul|aka|oha|kun| el|aku|oni|mwa|ha |e s|unl|tha|ott|ele|ett|e m|o s| va|ene|e n|e o| ya|oot|hav|ade|ihi|iha|ihe|de |o o|e a|eli|hen|amu|e w| aw|hel|dad|ra | at|po |i m|lel|wi |o n|owa|e e|ula| en|ta |o a|i a|moo|waw|ina| ak|ota| mo|sa |a s| so|han|ara|var| kh|a i|ri |aya|itt|anl|row| mw| et|i o|ika|’we|nro|i e|n’a|her|lan|nak|sin|lo |elo|vo |u e|eri|n’e|oli|thi|u a|a’w|ida| ah|a v|liw|kan|him|lib|yar|riy|ona|onr|erd|wal|hiy|aa |ibe|rda|wan|ber|era|avi|hiw|nna|i v|hwa|lei|mih|vih| ep|khw|ntt| na|ko |ia |sik|aha|iwe|e k|hun|una|mu |avo|ikh|laa|riw| ma| an|e y|kel|’el|huk|u y|phe|kho|pon|i s|nid|upa|ath|ila|yot|eko|ali|tek| es| it|o e|uku|wih|nan|tte| a |mur|’at|i w|ani|ulu|nih|wel|lik|ira|ane|a y|nkh|saa|ro |n’h|wir|i n|ile|som|u s|hop|inn|ei |ont|kum|yaw|saw|iri| eh|tel|tti|ola|aki|mak|ret|uth|nnu|a k|nuw|ahi|enk| il| nn|ena|va |yok|ute|soo| pi|lal|ohi|hik|mpa|uwi|lih|har|kin|aph|ma |ope|man|ole|uma| oo|mpw| v’|nal|ehi|nin|uni| ek|khu",
    "ewe": "me |ame|e a|le |wo |kpɔ| am|ɖe |ƒe | si| me| wo|be |si | le|sia|esi|la | la|e d| ɖe| kp|pɔ |aɖe|e l| be|e w| ƒe|e e|dzi|na |nye|a a| du|ye | ŋu| na|duk| dz|ukɔ|e s|ome| mɔ|e n| aɖ|kpl|nya|gbe|e b|e m|ple|ɔkp|ɔ a|pɔk|woa|ɔ m|kɔ |evi|nɔ |ŋu |ke | nu|ɔ l|mes|awo| o |iwo|ɔnu|e ɖ| ab|ya |ekp|e k|ɔwɔ|u a| al|nu |ia |ɖek|e ŋ|kpe|ɔme|o a|iny|zi |dze| ny|o k|eme|eƒe|o n|iam|egb|mɔn|blɔ|i n|wɔ |a m| eƒ|o d|alo|siw|ɔɖe|lo |o m|eke|e g| bu|eny|ubu|ŋut|ɔ s|bub|lɔɖ|enɔ|meg|akp|abl| ha|e t| ta| go|mek|eɖo|ukp|li |nɔn|to |any|a l|etɔ|ɔ ƒ| ey|e h|nuk|gom|ɔ ɖ|ɔe |bɔ |ɖo |i s| to|anɔ|a k|ɔnɔ|e x|awɔ|e ƒ|tɔ | ƒo|mev| es| ɖo|ɖes| xe|i w|tso| wò|wɔw|mɔ |iaɖ|i l| ag| li|ã |o ƒ|odz|a s|agb|yen| ts|bu | he|bet| gb|o e|ewo|a e|ɔna|i d|ti |ele|dɔw| ka|i a|uti|peɖ|ta | an|afi|a ŋ|a ƒ| ad|ƒom|se |ɔwo|xex|exe|oma| ma|vin| dɔ|o l|wɔn|eye|a n|i t|vi |ɔ b|so |edz|gbɔ|ɖev|ado| se|ɔ n|oto|ene|eɖe|xɔ |nan|ɖod| af|ben|zin|ee |de |ɖok|dzɔ|gɔm|adz|ɔ k|wom| gɔ|uwo|i ɖ|a d| vo|a t|o g|i b| xɔ|oɖo|i m|e v|ats|o ŋ|sɔ |ovo|i e| at|vov|ne |ɔ e|kat|o s| ne| aw|da |wòa|eŋu| as|asi| el|o t|yi | sɔ|men|a b|ze |mee|uny|te |dom| ak|man|ẽ |i o|ie |ana|ata|ui |axɔ|u k|ɖoɖ|tsi|ema|rɔ̃|ded|ɔ g|ena| en|kɔm|met|u s| eɖ|oku|kui|mew|xem",
    "slv": " pr|in | in|rav|pra|do |anj|ti |avi|je |nje|no |vic| do|ih | po|li |o d| za| vs|ost|a p|ega|o i|ne | dr| na| v |ga | sv|ja |van|svo|ako|pri|co |ico|i s|e s|o p| ka|ali|stv|sti|vsa| ne| im|sak|ima|jo |dru|nos|kdo|i d|akd|i p|nja|o s|nih| al|o v|ma |i i| de|e n|pre|vo |i v|ni |red|obo|vob|avn|neg| bi|ova| iz|ove|iti|lov|ki |jan|a v|na | so|em | nj|a i|se | te|tva|oli|bod|ruž|e i| ra| sk|ati|e p|aro|i k| ob|a d| čl|eva|rža|drž| sp|ko |i n| se| ki|ena|sto|e v|žen|nak|kak|i z|var|ter|žav| mo|di |gov|imi|va |kol|n s| z |mi |ovo|rod|voj| en|nar|ve | je|pos|a s|ego|vlj|jeg| st|h p|er |kat|člo|ate|a z|enj|n p|del|i o|lja|pol|čin|a n|ed |sme|jen|eni| ta|odn| ve| ni|e b|en | me|jem|kon|nan|elj|sam|da |lje|zak|ovi|šči|raz|ans|ju |bit|ic | sm|ji |nsk|v s| s |n v|tvo|ene|a k|me |vat|ora|krš|nim|sta|živ|ebn|ev |ri |eko|o k|n n|so |za |ičn|ski|e d| va|o z|aci|cij|eja|elo|dej|si |nju|vol|kih|i m|nst|kup|kov|uži|la |mor|vih| da|h i|lju|otr|med|o a|sku|rug|odo|ijo|dst|spo|tak|zna|edn|vne|ara|ršn|itv|odi|u s|čen|boš|nik|avl|akr|e o|vek|dno|oln|o o|ošč|e m|ta |vič|bi |pno|čno|mel|eme|olj|ode|rst|rem|ov |ars| bo|n d|ere|dov|ajo|kla|ice|vez|vni| ko|ose|tev|bno|užb|ava|ver|e z|ljn|mu |a b|vi |dol|ker|r s",
    "ayr": "apa|nak|aka| ja| ma|ata|ana|aña|asi|aqe|cha|aki|ñap|jha|mar|aw |kan|ark| ch|una|aru|paw|ti |jh |pat|jaq|rka| ta|a j| ar|hat|ama|tak| wa|ach|iw |a a|ani|a m|spa|na |kap|ki |taq|pa |jan|sa | uk|qe |kis|kas|ha |ina|niw|may| kh| am|at |ati|pan|i j| ya| mu|iti|ka |ayn|t a|as |amp|ch |a u|an |pjh|yni|mun|iña|uka|ajh|ru |w k|hit|ñan|h a|is |isp|qen|khi|isi|has|ejh|e m|sis|atä|oqa|nch|rus|kam|siñ|han|mpi|kañ|qha|sin|asp| in|ham| uñ|ñat|hañ|qat| sa|yas|yat|ita|äña|ska|tap|asa|kha|sit|täñ|tha|arj|ma |a t|ta |tas|nka|sti|iri|sna| ji|a y|ara|pas| as|ñja|rjh| ku| ut|hap|tat|kat|tis|pi |apj|jam|noq|aya|i t|i u|ukh|ura| ka| ju|ans|qas|uñj|asn|a c|nin|aqa|kaj|nañ|sip|i a|us |i m|kun|w u|anc|api|ino|ili|uya|pac|tan|jil|ña |lir|utj|w j|s a|ipa|chi|kiw|w m|kak|muy|pis|rak|hac|isa|njh| lu|mas|amu|ena|nsa|w t|nan|ali|s j|ink|tay| a |upa|wak|a k|way|wa |in | ay|tañ|s m|jas|mp |lur|ank|khu|rañ|h j|t m|iru|eqa|ayt|yt |heq|che|anq|en |lan|rin|ipj|i c|mat|qpa|aqh|tja|awa|uki|k a|qej|anj|sap|pam|usk|yaq|kar|nip|llu|wal|run|yll| aj|lin|a w|ayl|n m|jac|isk|naq|ast|h u|ni |ath|a i|ayk|jhe|aqp|h k|uch|inc|hus|sar|s u|s w| pa|nap|ap | un|ak |n j|tir| ak|ns |s c|ust|arm|ask|war|ri |man|pit|qer|juc|sir|n w|hik|ika",
    "bem": " uk|la |uku|wa |a i|a u| mu|kwa|ali|ya |shi|a n|amb| na|sam| pa|ula|ta |nsa|fya| no|nga| ya|mbu|bu |ata| in| ku|a m|lo |se |nse| ba|ntu|kul|ons|ala|ang|ins|aku|li |wat|mo |tu |alo|a a|ngu|ili|nok|ika|na |nan|a p|ing|a k| al|mu |gu |o n|sha| ca|ila|oku|e a|ikw|yak|ka |lik| um|ana|lin|yal|ga | ci|aba|lwa|ku |ish| fy|uli|a b|u u|unt|i n| on|kal|lil|u y|ba |hi |ukw|amo|po |ulu|kan| sh|kup|ko |we |and|a c|aka|le |u n|cal|o u|ha |ile|ama|umu|bal|kus|akw|u m|mul| if|o a|kut|nsh|o b|ung|apo|e n|kub|mun|uci|yo |mbi|nka|cit|bul| ab|any| bu|pa |ne |u c|u b| ka|abu|ndu| fi|e u|a f|ton| ne|ant|no |i u|u a|ban|o i|cil|cin|ify| ng|pan|tun|gan|nda|kuc|kwe| ns|o c|ngw|o f|ans|fwa|a l|pam|tan|ti | am|kum|kuk|lan|u s| is|wil|du |nya|und| ic|e k|wal|aya|bi |bil|ubu|ush|fwi|int|nta|utu|twa|wab|afw|ela|o m|uko|ako| ta|lam|ale|gwa|win|u k|apa|ma |onk|way|kap|i k|imi|a o|upo| im|iwa|mba|o y|ngi|ici|pak|lul|ind| ma|e p|de |nde|gil|e b|iti|uti|ilw|a s|imb|da | li|uka|hiw|umo|pat|afu|kat|ine|eng|fyo|bun| af|uma|kuf|alw|til|ita|eka|afy|mas|e y|tul|but|nto|usa|kwi|mut|i i| ak| ap|bom|umw|sa |ont| wa|ilo|u f|baf|fik|ina|kab|ano|pal|ute|nab|kon|ash|bwa|ifi| bo| bw|lya|atu|ubi|bik|min|aik|cak|nak|men|ubo|ye |hil",
    "emk": " ka|a k|ka | la| a |la |an |kan| ma|a l|ni |ya |na |ama|a a|lu |n k| di|ɛɛ |di |a m|ma | bɛ| ja|ana|a b|aka|bɛɛ|man|iya|a d|ara|dɔ |jam|alu|en |a s| si| sa| mɔ|mɔɔ|ani| ye| dɔ| tɛ|ye |i s|i a|den| ba|riy|tɛ |sar|ɔɔ |da | al| kɛ| ni|ari|ila|a j| i |a t|n d|ɛn |ɲa |kak|ra |ada|ɛ k|i k|i d|len|u d|ele|nna|sil|n n|n m|olo| se| bo|ade|aar|ɔdɔ|ɛ d| kɔ|ɔ a|ank|ɔn | fa|fan|a ɲ|se |lak|lo | da| na|bol|kel|e k| wo|i m|aya| ke|ko | ad| mi|nu |baa| sɔ|dam|nda|ɔnɔ|mɛn| ko|a f|and|ala|ɛ y|ɔ b|ɛ s|le |ɛ m|i l|i b| wa|n s|a i| de|ina|li |ɔya|mad| mɛ|aba| le|n a| ha|a n|ɔ s|u l|nɲa|han|n b|sɔd|dɔn|kɔn|kɛ |ata|nɔ |kar|dan|in |u k|ɔ m|kɛd|ɛda|i j| su|nnu|a w|ɔ k|nka|lat| gb|ɲɔɔ|aji| an|a h|nin|olu|u m|kun|a g|on |asa| ku|ibi|jib|don| lɔ|i t|waj|bɛn|ɛnn|ban|ɔrɔ|wo |ran|si |ɛ b|ɛnɛ|ɛ l|mak|suu|e m|ii |i f| ɲi|e a|o m|ɲin|enn|usu|ba |ɛdɛ|yan|taa|nan|u b|u t| ɲa|nal|nba|ɲɛ | ɲɔ|law|ati|nad|rɔy|hɔr|a y|iri|sii| hɔ|mir|ti |enɲ|bɔ |u s|n t|u y|ini| te|ta |kol|enb|awa|bat| fu|nki|kil|ili| du|bar|ɛ j|fɛn|fɛ | do| dɛ|gbɛ|su |uus|aam| ta|afɛ|may|lɔ |nni|ɔnn|lɔn|maf|o a|e d| bɔ|din|sab| fɛ|ɔ j|o y|i w|tan|ɔɔy|dɛɛ|bɛd|kad|min|ɔlu|dal|ɔɔl| tɔ|ɔɔn|e f|biy|ali|e b|kɔd|te |wol|bi |e w| mu|ida|du |ant|nɛn|dɛ |ɛ a|dah",
    "bci": "an |be | be| ɔ |un | i |ran|sra|wla| sr|kwl|in |la | kɛ|n b|kɛ |n s|n k| kw| ng|n n|lɛ |a b|n m|le | nu|a k|nun|i s| a |man|n i|ɛn |e k|ɛ n|kun|n ɔ|mun| ni| ti| mu|nin|nga|ti | n |ɛ ɔ|e n|ɔ n| su|ga |ɔ f| fa| ku| li|e s|su |a n|a s|a ɔ|ɛ b|i n|e a| sɔ|wa |sɔ |i k| ma| le|ɛ i|tin|ɔ k|di | at|ata|ta |ɔ l|fat| mɔ|ati|mɔ |lik|akw|ɛ m| sɛ|lak|e w| sa|dɛ |ndɛ|mɛn|i b| mm| yo|iɛ |ba | nd|nvl| nv| kl|vle|sɛ |a a| mɛ| fi|ke |und| wu|ɛ s|n a|mml|liɛ|mla| ka|ike|yo |ɔ t|ngb|i a|e b|a m| an|ɔ ɔ| di| yɛ| si| bo|e t|ndi|bo | ye|o n|n t|e m|fin|e y|n f|sa |ɔ b| fɔ|dan|n y|fa |i i|uma|yɛ | ju| ny|ɔ i|nan| na|kan|ɔun| tr|wun| b | o |n l| aw|a y|b a| wa|fɔu|i f|ɛ a|ing|ge |uɛ |i w|a w|nge|klu|ka |gba|e i|awa|o m|jum|ɔ y|ɛ k|wie|a i|ie | fl|e f| wl|tra| ba|lo |lun| ak|ang|ye | wi|e l| kp|uan|i m| uf|uwa|n w|sie|flɛ|kpa|alɛ|luw|flu|o i|kle|ua | da|nyi|nzɛ|wuk|ɔ s|wo |e ɔ|ika| wo|wan|bɔ |ian| bl|wlɛ| bu|anz|o ɔ| af|aci|u b|bu | ya|ɛ w|ufl|bɔb|te |zɛ |ɔ d|a t|elɛ|i t|ci |nua|fuɛ|ɔbɔ|u i|anm|i l| w |w a| bɔ|o b|lu |se |u m|ilɛ|iɛn| ja|a j|afi|i ɔ|n u| se|unm|nda|yek|bɛn|gbɛ|eku|ɛ l|nma|kac|u s|san|ko |o y|o s|a l|u n|si |anu|aka|any|ɛ d| ko|n j|ɔ w|u a|fi | yi|anw|i j|uka|fiɛ|a d|o a|lel| kɔ|ɔlɛ|ɔn |a f",
    "tiv": "an | u | sh| na|nan|en | a |ha |sha|shi| i |er |a i| er|or | ma|ar |gh |n i|n u|a m| ve| ci|n s|han|u n| ke|lu |man| lu|n m|yô |a u|u a|n a|r n|a k|mba|in |ii | ha|kwa|ken|n k|na |hin| mb|a a| kw|n n| ga|ga |cii|agh|a n|aa |wag|ve |a s| yô|nge|ba |r u|u i| gb|ana| or|a t|mao|r i|ity|ma |aor|anm|nma|gen|oo | ta|ir |ren| kp|i n|ang|r m|e u|gba| ng|r s| ia|ere|ugh| it|ian|doo|ese|uma|kpa| la|u k|n g|ngu|gu |om |oug|on |ol |a h|ior| ts| he| ne|tar|h u| ka|la |n t|se |e n|r a|a v|hen| ku|aha|mac|yol|i u|ace|ge |ce | de|ish|u t| io| do|tom|hi |a e|u u|o u|i m|iyo|i d|bar|ave|ua |u s| te|igh|a l|e a|m u|a w|un |n c|n e|ne |ev |r k|ind|ene|sen| is|ndi|ker|era| to|a o|ima|u v|a g|paa|n h| wo|di |yar|tya|ase|e s|de |n y|ee |end|him|tes| mk|u m|ka |tyô| mz|won|u e| um|u h| wa| mi|yan|tin|ran|ie |hie|a c|hir|i a|e k|i v|mak| in| za|r c|nen|e l| ig|i k|kur|nah|tse| ik|ves|eng|rum|mzo|men|zou|i l|e i|a d|i e|i i| ya| vo|mlu|ô i|inj|nja| as|vou|ura|ron|gbe| iy|r t|ôro|a y|oru|e e| zu| ti|ra |n l|ci |u l|ver|kpe| fa|was| ml|e m|em |io |mi |da |civ|môm|ant|see|ivi|wan|vir|nda| ij|soo|zua|lun|ea |vea|wa |ôm |av |hio|ake|a f|igb|l i|u z|r l|zan|nta|e g|hem|h s| mt|ded|iky|o s|r g|do |ndo|iji| hi|e h",
    "tpi": "ng |ong|lon| lo|im | ol| na|la | ma|pel|ela|ri |at | bi|ait|na | yu|ol |gat| ra|bil| ka|ilo|man|rai|t l|it |eri|mer| o |wan| i |mi |umi| wa|ing|yum|ta |t r|tin|eta|get|lge|olg|iga| ig| sa|ara|em |rap|i o|ap |nme|anm|in |ain|an |a m|ant|ape|nar|m o|i n| no|g o|g k|i i|as |ini|mas| me|n o|sim|tri|kan|kai|ntr| ga| st|a s| pa|gut| ha| wo|g y|yu |a l|g s|ama|m n|ok |g w|wok|spe|a k|i b|i m|g l|i l|sin|sam|pim|m l|kam| gu|l n|amt|tpe|g n| in|ts |a i|mti|utp|isp|kim|its| la|isi|aim|api|lo |o m|g b|tai| di|a o|dis|a t|p l|en |map|t w|s b| lu|luk|sem|no |tim|lai| ko| ki|ave|ols|nog|m k|lse|sav|nem|ve |a p| fr| em|nim|tu |i y|nka|et |m y| ti|g t|nap|g p|sta|tap|aun|a n| tu|un |asi|fri|pas|n m|m g|l i|aut|ane| sk|kau|t n|nta|sen|n s|oga|i g|g g|m i|kis|o i| ba|tok|os |usi|m s|ngt|anp|a w|s n|a h|s i|iki|i s|sai|l m|npe|ari|o l|o b|g r|ik |uti|iti|gti|aik|ut | to|a g|ili|a y| pi| ta|kin|ni |n b|lim| ye|yet| we|k b|ina|g m|uka|str|ins|rid|a b|anw|nsa|nwa|m w|m m|dom|ot |hap|ido|aus|i w| ne| si|n i|t o|dau|ese|rau|ank|sap|o k|m b|nin|pos|o n|am |go |s o|s l|u y|pik|vim|ivi|es | go|n n|kot|ron|ple|g d|a r|kul|ali|sku|apo|om |g h|l l|s s|ti |les|t m|gav|eki|nai|mek|kom| as|ind|nda|ip |liv|ul |ati",
    "epo": "aj | la|la |kaj| ka|oj | de|on |de |raj| ra|iu |ajt|as |o k| ĉi|e l|j k| li| pr|eco|aŭ |ĉiu|jn |ia |jto|est| es| al|an | ki|pro|io | ko|en |n k|kon| ti|co |j p|o d| po|ibe| aŭ|ro |tas|lib|ber|aci|toj| en|a p| ne|cio|ere|ta | in|to |do |o e|j l|n a|j d| se|a k|j r|ala|j e|taj| re|rec|iuj|kiu| pe|o a|ita|ajn|ado|n d|sta|nac|a a|nta|lia|ekt|eni|iaj|ter|uj |per|ton|int| si|cia| ha|stu|a l|je | je|al |o ĉ|n p|jta|tu | ri|vas|sen|hav|hom| di| ho|nte|a e|ali|ent| so|nec|tra|a s|ava|por|a r| na|igi|tiu|sia|o p|n l|ega|or | aj|soc|j ĉ|s l|oci|no | pl|j n|kto|evi|s r|j s|ojn|laj|u a|re | eg|j a|gal|ers|ke |pre|igo|er |lan|n j|pri| ku|era|ian|rim| fa|e s| ju|e a|ika|ata|ntr|el |is |u h|li |ioj|don|ont|tat|ons| el| su|go |un | ke|ebl|bla|n s|oma|ĉi |raŭ|kla|u r|ne |ili|iĝo|o t|s e|tek|men|nen|j i|nda|con|a d|ena|cev|moj|ice|ric|ple|son|art|a h|o r|res| un|u s|coj|e p|ĝi |for|ato|ren|ara|ame|tan| pu|ote|rot| ma|vi |j f|len|dis|ive|ant|n r| vi|ami|iĝi|sti|ĝo |r l|n ĉ|u l| ag|erv|u e|unu|gno| ce| me|niu|iel|duk|ern| ŝt|laŭ|o n|lab|olo|abo|tio|bor|ŝta|imi| ed|lo |kun|edu|kom|dev|enc|ndo|lig|e e|a f|tig|i e| kr| pa|na |n i|kad|and|e d|mal|ono|dek|pol|oro|eri|edo|e k|rso|ti |rac|ion|loj|j h|pli|j m",
    "pam": "ng |ing|ang| ka|an | pa|g k| at|ala|g p|at |apa| ma|kar|lan| ki|ata|kin|pam|g m|ara|tan|pan|yan| a |pat| in| ba|aya|n a|g a|ung|rap|ama|man|g b| ni| di|nin|din|n k|a a|tin|rin|a k|ami| la|tun|n i|ari|asa|nga|iya|ban|ati| me|nan| da| sa| na|t k|gan|g s|bal|etu|mag|a i|met|sa |la |ant|kal| iy|kap|a n| mi|in |ya |aka|tau| o |san|n d|au |lay|ana|mak|yun|na |ika|a m|ipa|ran|atu| al|n n| ta|ti |ila|g l|ali|kay|nsa|aga|a p|iti|g t|par|u m|ans|nu |al |g i|t p|iwa|a d|syu|t m|sab|anu|un |uli|mip|ra |aki|aba|u a|mal|as |mil| it|una|bla|abl|ita|awa|kat|t a|ili|kas|g n|lag|da |tas|i a|wa |n l|lal|dap|mas|bat| pr|abi|ap |a b| e |mik|ani|sal|li |ad | an|ral|ira|gal|a r|lin|g d|nte| li|ale|kab|e p|ula|wal|lit|nti|s a|lip|nta|pro|te |ie |wan|ag |tu |upa| ya|g e|tek|usa|g g|bie|o p|it |pun|ian| bi|lat|aku|be |n p|sas|iba|yat|alu|tul|e m|kan|l a|nap|t i|lir|u k|isa|pag|abe|len|e k|rot|en |bil|mam|ksy|ngg|lam|p a|ily|liw|eks|ote|n o|gga|u i|eng|ipu| tu|lya| ri|aul|pas|dan|uri|ema|lab|ta |lak|are| ar|ail|tam|o a| ke|ril| pe|sar| ra|ina|asi|ka |art|pak|sak|mit|rel|i k|gaw| ul| re|inu|i i|mun|abu|asy|mba| pi|ags|obr|gpa|a o|am |n m|mem|o k|isi| mu| nu|mis|nun|era|ndi|ga |agp|aun|mab|anm|lub|gla|e a|nme",
    "ssw": "nge|eku|a n|ntf| le|e n| ng|tfu|lo |la |nga| ku|fu | ne|o l|khe|tsi|nkh|le |he |unt|elo| lo|si |ele|a l|ni |ung|mun|ma |lun|lel|wa |lek|nom| um|eni|oma| no|kut|hla|onk|a k|e l|ent|e k|gel|ela|ko |eli| ba| la|pha|ats| em|o n|ang|ema|eti|nel|nye|ban|ulu|uts|hul| na|aka|tfo|e u|lan|oku|lok|won|khu|esi|lul|a e|ule|ala|umu|tse|akh|ye |ve |i l|nek|ana|ane|lil|kwe|aph|na |we |ke |aba| wo|nti|ndl|ale|i n| ye|ba |ilu|gek|gan|lab|any|hat| li|tin|wen|gen|kel|len|ndz|fo |and|let|eko|e b|lwa| ka|te |set|nem| kw|mal|ka |ant|alu|ne |phi|ing| un|u u| ek|ise|une|e e|kul|nal|lal|mph|o y|uhl|fan|‐ke|ile|i k|kub|ukh|ben|kan|ako|a b|kat|eke|ive| ti|sek|nak|sit|seb|u l|alo|yel|kho|wo |kha|les|o e|ngu|kus|lom|ini|ikh|elw|isa|sa |fun|e w|ebe|o k|jen|iph|eng|kwa|ahl|uph|emb|be |tis|lwe| si|etf|isw|uma| se|ene|ta |nan| im|i e|enk|e a|abe|kun|ume|hak|nen|dle|ase|sen|kuv|tel|ebu|omu| in|lin|sel|tfw|nhl|a i|e i|kuk|uba|ti |kuf|mhl|bon|ula|sin|int|fut|dza|lak| wa|ind|ave|ali|yen|ete|to |ngo|use|kuh|hol|ze |a‐k|ona|a a|se |nje|und|swa|lon|eki|ike|i a|lis|tsa|gab|sim|i w|its|fol|e t|o m|hi |ndv|phe| ya|ma‐|utf|sik|liv|bun|cal|nta|ata|gal|mel|ute|wem|gap|han|uny|oba|alw|ili|a w|mbi| bu|gob| at|awo|ekw|dze|u n|emp",
    "nyn": "omu| om|ntu|tu | ku|a o|ra | ob|wa |obu|ari|a k|mun|a n|unt|mu |uri|nga| mu|aba|ri |a e| na|e o|gye|rik|ho |a a|han|ang|re |ga |iri|bwa|oku|aha|bur| bu|na |eki|ka |iku|ire|uga|ndi|ush|ban|ain|ere|ira|we |kur|sho| ek| ab|ne |ine|a b|and| ni|u a|e k|sa |u b|iha|i m|e n|kir|be |aho|bug|ibw| eb| ba|ing|ura|gir|u n|kut|ung|ant|abe| ah|ye |e b|i n| bw|kwe|ebi|era|iki|ba |ro | kw| ok|uba|gab| no|zi |bir|i k|u o|o o|rwa|o e|kub|end|ama|mer|eka|kug|ate|tee|di |rir|bus|kuk|rin|ish|sha|i b|wah|ha |u m|bwe|ngi| ai|ara|kwa|kan|o g|za |ngo|kuh|ana|i a|eme|eek|i o|baa| ka|go | gw|nib|zib|ash| or|iro|she|o k|u k|iin|o b|iba|oon|gan|agi|ngy|hem|mwe|ona|oro|bwo| ar|ya |i e|uru|nar|eir|uta|tar|kwi| ti|egy| n |hi |bar|isa|ute|o a|shi|ora|e e| en| ki| nk|riz|nda|da |ja |si |nsi|wen|yes|tek|yen|aga| am|o n|rei|rag|ki |obw|mur| ha|ris|wee|amb|aab|bya|kus|ugi|a y|ind|ata| ne|bas| ky|ija|hob|ikw|mus|gar|a g|eky|dii|bor|aar|ibi| we|aka|ham|emi|ekw|rer|ini|har|gi | bi|naa|kor| er|gwa|n o|iza| by|eih|yam|iho|rih|i y|ete|o m|eby|but|a r|ika|mag|ozi| em|ong|iik|iko|uka|nik| yo|sib|eri|utu|tuu|amu|uko|irw|nka|ani|yaa|u e|mut|roz|mub|ens|aij|nis|uku|kye|nde|der|e a|nok|nko|asa|aas|hab|obo|ent|ahu|rye|oba|kih|yob",
    "yao": "chi|ndu| wa|du | ch|a m|aku|akw|ni |kwe|und| mu|wak|wan|mun| ku|la |e m|wa |ulu|amb| ak|kut|u w|ali|mbo|lu |we | ma|le |ufu|ful|ila|a k|bo |a n| ga| ni|amu|kwa|se | na|ose|hil|nga|go |aka|and|ang|na | uf| pa|ete|uti|jwa|kul| jw|son|ngo|lam|e u|ne |kam|oni| so|u j|e a|ele|a c|ana|wal|ti |isy|cha| yi|gan|te |ya |mwa|lij|wet|che|ga |yak|ili|pa |e n| ya|o s|nda|i m|ula|jos|i a|ile|ijo|li |e k|o c|a u| mw|ich|mul|uch|o m|asa|ala|kas| ka|i w|ela|u a|ach|his|nam|lan|yin|i k|ind|ani|sye|yo |si |pe |gal|iwa|man|sya|aga|a w|o a|ule|ikw|asi|kus|ope|ma |gak|e w|jil|kap|hak|ika|ite|aji|mba|u g|ase|mbi|kum|uli|any|ape|a y|ekw|mal|imb|ja | al|end| ng| ja|mas|usi|kup|e c|pen|ye |anj|ka |a j|a p|lem|o n|ama|him|ago|sen|eng|ane|ako|mch|ola|och|oso|ena| kw|sop|lek|pel|gwa|hel|ine|gam|u y| mc|i y|awo|ons| mp|ole| li|wo |i u|hik|kol|auf|mka|tam|syo|e y|mpe|ten|ati|mau|nji|wam|muc|ong|i g|kan|uma|je |iku|nag|kwi|da | ul|cho|ngw|ene|iga|ano|esy|ion|upi|pag|o k|eka|wu |uwa|kuw|sa | un|a l|bom|iya|uni|jo |ale| ji|apa|yil|lil|uku|i n|o g|a a|o w|waj|mus|ipa|pan|pak|one|i c|ujo|duj|emw|nya|tio|jak|oma|nja|hiw|dan|apo|e j|poc| wo|lic|alo|eje|ing| mi|e p|lo |lig|a s| yo|ung|no | m |upa|ata| bo|nde|he |i j|was",
    "lav": "as |ība| un|un |tie|ies|bas|ai | ti|esī|sīb|ien| vi|bu |vie|ir | ir|ību|iem| va| pa|em | ne|s u|am |m i|šan|u u|r t|pie| ci| sa|ās | uz|vai| ka| pi|brī| iz|rīv| br|uz |cij|dzī|ena| ar|ar |isk|s p|es | at|āci| ap|ot |nam|viņ|inā|ikv|kvi| no|s v| ie|vis| ik|i i|pār|u a|ju |nu | pr|edr|vīb|īvī|iju|drī|u p|dar| st|lvē|cil|ilv|s t| la|iņa|ana|s i|n i|īdz|s s|kā |tīb|i a|ija|bai|ībā|ied|s n|arb|val|līd|s b|aiz|tu |iec|cie|ām |gu |vēk|īgu|īgi|ka |jas|umu|mu |t p| jā|u v|zīb|ska|lst|als|kum|gi |s l| tā|jot|stā|st |n v|vēr|a p|arī|aut|n p|ama|kas|u k| da| ta|nīg|izs|ojo|anu|ņa |u n|sta|s a|ba | ai| so|s d|a u|ā a|stī|cīb|m u|i u|son|not|mat|sav|iev|ā v|jum| kā|u t|ned|ajā|s k|u i|i v|līt|ēro| pe| dz|i n|per|u d|īks|kat|nāt|līb|nāc|rdz|nīb|pil|rīk|kst|a s|cit|pam| pā|ekl|tau|u s|bie|jā | re|i p|kur|a a|t v| li|evi|tis|evē|bā |ma |rīb|a v|os |ras|abi|nev|iku|skā| ve|lik| lī|nas|t k|ant|uma|roš|kād|zsa|sar|ciā|mie|ais|eci|oci|oša| je|jeb|būt|atr|n b|ieš|rso|ers|soc|enā|a t|t s|īša| be|bez|āda|ebk| ku|glī|isp|tot|spā|roj|lie|pre|ret|aul|na |tra|iet|du |zgl|āt |ard|kt |ier|izg|ikt|paš|iāl|nod|ts |eja|ā u|sab|eno|ēt |ta |tik|tīt|ecī| de|īga|tar|arp|r j|īst|tās|ja |enī|atv|vu |ārē|rēj|rie|oši|dro",
    "tso": " ku|ku |ni |a k|hi | ni|a n| a |i k|ka |i n|wa | ya| ma|la |ya |na |a m| ti| hi|fan| sv|nel|hu |a t|ane|ela| ka|iwa|u n| na|svi|lo |nhu|a l|a h|ele|le |ndz|u k|va | xi|a w|vi |mbe| à |elo|wu | wu|eli| mu|u y|mun|i l| le|nga|umb|lan|nfa| va|u l|be |u h|li |kum|tik|ihi|iku|aka|unh| wa|a s|liw|isa|i m| fa|ma |anu|nu |u t|han| la| ng| wi|wih| ha|a x|yel|a a|lel| nf|i h|ta |ana|o y|e k| nt|u a|i a|eni| li|ndl|ga |any| ko| kh|van|u w|u v|amb|a y|ti |sa |pfu|i t|i w|in |lek|e y|ang|and|ati|yi | è |irh|sva|mat|ani|i s| nd|a v|mel|yen|hla|isi|hin| ye|eke|n k| lo|ulu|kwe|hul|thl| kw|nth|tin|mah|wan|ava| mi|ko |khu|u s|à n|dle|lul|ule|tir|o l|i y|aha|aye|kwa|inf|à k|è k|rhu|mba| th|fum|end|anh|xi |dzi|kel|a f|u f| lè|we |may|eka|nye|gan|dze|vu |ham|xim|mis|thx|aku|tà |xa |hlo| tà|eyi|ima|nti|eki|ngo| si|u p|vak|ngu|lak|ume|oko|lon|a è|o n|lok| ta|zis|hak|u m|i à|ke |i x|u x|rhi|ha |awu|dza|u à|za | là|n w|ung|e n|a à|i f|esv|les|vik|siw| y |à m|to |mha|ola|sav|ond|nya|kot|kol|uma|e h|mbi|e s|naw|ths| dj|fun|mu |a u|xiw| ts| hl|u d| lw|nyi|ki |ong|sun|lwe|ike|ind|nis|xih|e a|èli|imu|sel|sek|iph|zen|lum| pf| xa|sin|umu|sim|ave|kar|ala|wey|sik|o t|avu|wav|oni|ile|wak| yi|ali| hà|gul|e l|ba |i v",
    "sco": " th|the|he |nd | an|and| o |al | in|ae |in |es |ion|cht| ta|tio|or |t t|ric| ri|ich|tae|on |s a|is |e a| aw| be|s t| he|ati|ent|ht |ts |e r| co|er | na| fr|bod|ody|his|dy |hes| fo|e t|o t|for|it |ng |ty |n t| or|be |fre|ree| hi|l a|ing|awb|wbo| sh|s o|ter| on|sha|nat|r t|nal|an |n a| as|hal|e o|y a|d t|tit| pe|l b| re|y h|aw | ma|nt |men|air|ce | pr| a | ti|hts|e f|e c|le |eed|edo|dom|n o|e s|ons|d a|res|e w|man| wi|d f|ed |sta|ar |t o|ona| it|ity|at |as |her|ers|t i| de|con|til|il | st|nti|e p|e i|e g|nce|ny | so| di|nte|ony|ns |und|ith|thi| fu|ie |ir |oun|ont|e e| un|pro|oci|nae|y i|lit|soc|com|nin|en |ic |ne |r a| me|ly | wa|ear|ual| en|ame|uni|r i|e h|hum| is|ane|uma|ess|inc| fa|equ| hu|ver| eq|e m|hei|o h|ms |d o| ha|wi |t n|s f| no|t a|int|cla|rit|qua|d i|iti| se|rsa|y s|ial| le| te|e d|r o|ive|r h| la|nit|om |ite|s r|cie|s i|ali|cti|cia|re |aim|rat|ld |tat|hat|rt |per|s h|n f|dis|tha| pu| we|g a|oms|eil|ntr|fai|tri|ist|ild|e u|r s|dec|lea|e b|hau|imi|mai|s n| ac|elt|lt |l t|omm|d p| ga|din|war|law|eme|y t|era|eir|art|ds |s e|ral|nor|tel|ge |g o|eik|eli|rie|rou|nda| gr|lan|mei|ate| ge|n i|ten|id |s d|ors|iou|bei|sam|nta|sec|mmo|lar| tr|ful|ul |mon|s w|anc|l o|gar|ern|ara|d s",
    "src": " de|de |e s|os | sa|tzi|tu | su|one| a |sa |ne | e | in|ent|ion|der|su |zio|ere|as |e d|a s|u d|ret|es | cu|ess| pr| so|s d|men|ale|ade|atz| s |re |e c|sos|in |s i|chi| un|nte|ten|etu|er | pe|et |e e|ida| te|le | is| ch|ene|are| es|a p| si|u s|a d|pro|hi |dad|te |sse|tad|zi |e t| on|e i|s e|nt |nzi|u a|sso|onz| co|ame|cun|tos|e a|sas|a c|ntu|net|na |e p|at |nes|du | li|t d|n s|son|s a| o |ber|ro |pes|u e|int|zia|nat|i p|ia |res|nu |un | re|sta|s p|ter|era| po| di|per|s c|t s|rar|ser| at|e o|s s|ibe|lib|si |tra|ust|u c|rta|unu|cus|ntz|adu| to|da |nal| na|ant|egu|eto|und|ine|i s|a e|otu|u p|t a|ert|est| da|a a| fa|ist|ona|pod|s o|pre|iss|ra | ma|ica|tot|les|ntr|una|sua|con|dae|ae |s n|man|sia|ndi|nid|ada|a l|nta|o s|a i|ua |ide| ne|otz|min|rat|iat| pa|nde|ode|dis|ren|ali|a u|ta |u o|sot|u t|ime|ssi| as|o a|pet|e u|nsi|fun|lid|epe|eru|unt|st |t e|end|us | fu| ca|ner|dos|s f|ass|nda|uni|das|iu |ind|a t|ial|a f|ghe|gua| eg|a n| se|ont|etz|s m|s ò|sti|t p|ual|nen| me|sen|com|ura|a b|lic|a o|pen|ado|nos|inn|des|seg|e f|din|òmi|ire|a m| òm|e l|dep|ènt|for|ena|par| tr|u i|ara|cra|sid| no|s u|u r|suo|e n|pri|ina| fi|ria|gur|art|det|s t| bo|tar|emo|run|ama|icu|isp|dam|e r|itu|cum|tut|eli| bi",
    "rmy": " sh|ri | a |shi|hi |i s|ti |ea |ari|i a| ca|rea|tsi|i c| s |a a|ndr|tu |câ |dre|i n|ept|ptu|rep|li | nd| di| un|a s|are|i u|ats|la | la|i l|ear| li|lje|di |ati|lui|ui |a l| tu|tat|â s|ei |sea| ti| câ|un |jei|or |caf|afi| lu|â t| ar|ali|i t|fi |ilj|a c|bâ |râ |car|ibâ|lor| cu|nâ |icâ|a n|i d|s h|hib|tâ | hi|â a|si |u c|eas|tur|tul|ber|â c| in| co|lib|u a|n a|cu |ibe|u s|tea|lu |tsâ|ul |tse|int|a p|i i| pr|u p|i p|url|i m|lji|min|sti|alâ| al| pi|sht|nal|â n| si|ji |â p|rar|ert|sii|ii |nat|til|u l|sâ |lâ |â l|sta| nu| ic|i f|nu |ist|mlu|ili|a t|ots|uni|rta|a d|its|â d|pri| ts|oml|i e| de| na|sia| po|gur|tut| st| at| ân|ura|al |ita|anâ| ma|ips|can|oat|tsl| su| as| so|ând|nts| ap| ea|sh |nit| mi|ent|a i|ate| ac|poa|ilo|sot|ina|ash|ona| lj|âts|rli|lip|â i|unâ|t c|iti|bli| u |nji| fa|zea|tât|ril| om|urâ|con|i b|sig|igu|ntr|pur|par|ntu|let|com|iil| ni|eal|ind|r s|hti|at |ucr|art|adz|arâ|itâ|rtâ|inj|uri| eg| sc|atâ|sin|ral|pse|asi| ba|r a|apu|âlj|ia |chi| va|sun|ter|rlo|ica| pu|luc|unt|i v|ise|ini|est|ast|gal|ega|act|nda|ead|uts|a u|imi|ma |ra |pis|s l|ets|a o|va |pi |lit|scâ|asc|ial|sa | ta|rim|tar|alt|idi|tlu| gh|era|ant|eri|aes|a m| nâ| ae|oar|nea|pro|apt|ana|ta |atl|lic|l s|iun|nte|mil",
    "quz": "una|an | ka|nan|cha|ana|as |apa|pas|man|lla|aq |sqa|ta | ru|run|kun|ach|qa | ll|pa |paq|na |nta|chi|npa| ma|nch|aku|anp| ch|in |a r|ant|hay|mi |taq|ay |ama|asq|qan|tin|kuy|chu|lap|a k|yta|a a|ima|wan|ata|spa|all| wa|n k| ja|ipa| ya|nin|ina|aqm|his|qmi|a m| ju|pi |anc|nap|iku|aus|usa|kau|pan|nak|kan| mu|naq|aqt| pa|kam|aqa|kay|i k|kus|un |ank|isq|nku|may|yku|ayn|a j|a l|ayt|qta|ati|a p| pi| ri|aci|lli|lin|ayk|uku| al| at|n r|yac|ion|pip|han|inc|n j|ayp|yni|qpa|nac|say|asp|uy |mac|s m|cio|awa|a c|laq|tap| yu| im|a y|yoq|n m|asi|mun| de|has|n a| as|n c|int|uch|nma|s k|oq |ari|q k|hu | na|ypa| tu|tuk|tun|atu|rim|q r| sa|jat|yan| ji|nat|anm|jin|a s|api|hik|uya|nti|pac|tan|ash|mas|n p|n l|k a|ura| su|a q|yuy|n y|ech|q j|unt|yay|ypi|is |lan| qa|usp|kas| an|a w|s w|inp|sin| ta|ma |a t|shw|q a|hwa|uyt|nmi|sim|ere|rec|der|uma|s t|isp|n t|ña | ni| ay|upa|nam|hur|war|waw|imi|nka|sap|kaq|s j|was|y r|usq|kin| un|inm|qas| si|ani|tiy|t a|sta|pay|pis|maq|hin|ha |arm|npi|rmi|ink|aqp|q c|la |i p|nis|yma|nk | ku|aym|nal|hak|rik| ti|unc|niy|y s|iyo|juc| qh|ist|pap| aj|s y|cho|onq| re|ayo|iqp|n s|s p|os |i m|t i|ras|ita|piq|qsi|ku |yqa|mik|q y|eqs|pat|tak| pu|lak|i r|ipi|iya|ywa|muc|a n| qe|san|jun|y l",
    "men": " ng|a n|i n|ɔɔ |ti | ti|i l| i | ma| nu| gb|ngi|a k|aa |gi | kɔ|ia |ɛɛ |ei | na| a |ma |hu | ye| ta|kɔɔ|a t|na | hu|a m| kɛ| nd|gbi|ya |bi |i y| lɔ|a h|ɛ n|ii |ɔny|u g|i h|nya|uu |lɔn| kp|i m|ngɔ|nga|la |i t|kɛɛ|lɔ |i k|ɔ t|mia| mi|a y|nge| ji|ee |gaa|a a|ɔ n|ɔ i|gɔ |ind|tao|ao | hi|num| le| yɛ|umu|mu |ung|nda|hin|ye |i g|hou|hug|e n|ugb|ni |a l|sia|ndɔ|nuu|a i|maa| ya|ahu|gba|u k|mah|oun|ɔma|le |da |i w|ɔlɔ|i j| va| ɔɔ|eng|i i|va |yei|dɔl|li |lei| sa|yɛ |kpɛ|yil|isi| la|bat|a w|u n|e t|ta |ahi| ki| wo|ɔ k|e a|ɛlɛ|saw| lo|o k|ji |gbɔ|pɛl|uvu|ili| ho|vuu| gu|nde|aho|gbu|ɛ t|ale|ila|nah|kɛ |ɛi |ndu|kpa| wa|nuv|ge |e m| ny|e k|atɛ|wei|awe|a g| ii|bua|ie |awa|wot|yek|kɔl|ulɔ|ing|ga |gul|tɛ |ɔle|u t|gbɛ|ɔ y|nun|wa |hei|ani|ɛ k| tɔ|bɔm|ɛ g|ein|taa| ha|ang|uni|u i|ekp|ɔ g|lɛɛ|kpɔ|a v|kpe|ote|i b|te |u m|tii|ɔ s| we|ɛ h|baa|pe |ɛ y| ɛɛ|i ɛ| ba|fa |a j|bu |ifa|kia|jif|u l|eke|ama|gen|u w|lee|lɛ | lɛ|ɛmb|a b|e y|aah|hii|ngo|bɛm|lek| wi|ui | yi|u y|bɛɛ| he|u a|e h|ɔ m|uah|o g|yen|yan|nyi|aal|hi |wu |yee|maj|ajɔ|jɔɔ|nye|mbo|e g|u ɔ|ong|ka |oi |lon|dun|uny|ɛng| sɔ|lɔl|nyɛ|lii|a p|oyi|iti| bɛ|lɔm|akp|e i|ɛ i| ka|jis|oko|i p|ɔla| wɛ|a s|ewɔ|iye|dɔɔ|lok|gua|ɛ b| li|u h|nin|wee|lah|ula| ga| du|i v",
    "fon": "na | na| e | ɖo|ɔn |ɖo |kpo| kp|nu |o n| ɔ | nu| mɛ| gb|mɛ |po |do |yi |tɔn| é | si|gbɛ|e n|in | to| lɛ|lɛ | tɔ|nyi| al|wɛ | do|bo |ɛtɔ| ny|tɔ |e ɖ|ɖe | bo|okp|lo |ee |ɖok|to |ɔ e|bɛt| wɛ| ac|a n|sin|acɛ|o t|o a|ɛn |i ɖ|o e|bɔ |ɔ ɖ| bɔ|cɛ |ɛ b| ɖe|a ɖ|ɔ n|ɛ ɔ|n b|an |nɔ |odo|ɛ ɖ|o ɔ|ɛ n|ɛ e|ɖɔ |ji | ɖɔ|lin|n n| en|bi |o ɖ|mɔ |n e|pod| bi|lɔ | mɔ|n a|nɛ |ɛ k|i n|un |ɔ m|i e|mɛɖ| hw| ji| ye|ɛɖe|enɛ| ǎ |alo|o s|kpl|u e|a d|ɔ b| nɔ|alɔ|ɔ é|ɔ g|ɖee|si |n m|gbɔ|a t|n k| yi|sɛn|jɛ |e k| wa|o m|e m|é ɖ| jl|hɛn|e e| hɛ| sɛ|nnu|nun|wa |n ɖ| ee|é n|kpa|unɔ|bɔn|ɔ t|a s|ɛ é|u k|ɔ w|inu|e s|i t|zɔn|o l|a y|o g|bɛ |ma |n t|e j|ɔ s|ɔ a|o b|a z| zɔ|jlo|i k|nuk|ɔ k|a e|ɔ l|u t|kɔn|xu |e ɔ| lo|hwɛ| ka|eɖe|o y|e w|jij|sis|n l|ixu|six| su|ali|isi|ukɔ|ɛ a| ay|ayi|su |n g|u a|a b|n d|dan|nmɛ| ta|n ɔ|etɔ|e g|o j| we|onu|wem|ba |ema|ɛ g|o h|ɛ s|ɛ t|i s|u w|n s| sɔ|bǐ | bǐ|hwe|a m|sɔ |lɔn|o d|u m|ple| ma|ɛ l|azɔ| az|tog|ye |i l|hun| jɛ|o w|ogu|o k|u g|kan|oɖo|elɔ|gbe| le| el|wu |ka |ɛ w|n w| li|sun|esu| hu| i |ɖó | ɖó|plɔ|ɖi |ɖè |ɛnn|pan|i m|yet|xo |iin|tii| ti| fi|e b|zan|i w|poɖ|ɖes|a j|ann|a g|gun| ɖi| tu|gan|ɛ m| wu|u s|ɔ y|a l| da|u n|u l|ɔnu|obo|ɔ h|vi |lee|ijɛ|ta |e a|ya |nuɖ|ɔ d|wen| tɛ| ga| ɛ | xo",
    "nhn": "aj |tla| tl| ti|ej |li |j t|i t| ma|an |a t|kaj|tij|uan|sej|eki| no|chi|ij | ua|ma | to| te|j m| ki|noj|ika| se|lis|j u|aka|laj|tle|pa |pan|j k|ka | mo|amp|ali|ech|uaj|iua|j n|man|oj |och|tek|tli|kua|ili|a k|se | pa|ano|ise|ual|mpa|tec|n t|en |len|iaj|is | ue|a m|jto|ajt|pia| am|uel|eli| ni|ya |oua|j i|ni |hi |tok|kin|noc|one|lal|ani|nek|jki|ipa|kit|oli|ati|amo|j s|kam|aua|ia |tim|mo | ku|ant|stl| ik| ke|opa|ase|nij|ama|i m|imo|ijp|ist|tl |ijk|tis|mej|itl|tik|mon|ok |lak|par|n n|ara|ra |tit|kej|jpi|a s|ojk|ki | o |alt|nop|maj|jya| ka|iti|cht|ijt|uam|a n|kiu|lat|leu|o t|ita|lau| ip|tep|kia|jka|n m|ana|lam|kij|nka|tou|epa|n s|til|i n|i u|e t| ak|s t|k t|lti|nem|lan|eyi|mat|nau|ose|emi|j a|ntl|uat|uey|jtl|nit|nti|kip|oka|onk| on|eui|i k|kat|j p|ini|toj|kem|ale|ajy|ame|ats|pal|iki|ema|uik|n k|eua|ach|e a|ijn| sa|mpo|tot|otl|oyo|mil|hiu|eka|tol|ajk|uak|ite|san|pam|atl|yek|tia|ate|ino|jua|a i|ipi|j o|tsa|oke|its|uil|o o|jne|oju|tos|kui|oui|a a|yi |kol|ote|a u|i i|n a|ken|chp|iko|as | ne|tin| me|ank|jti| ye|kon|ojt|aui|xtl|ine|tsi|kii|you|ko |ejk|o k|uas|poy|tst|ejy|nok|las| ya|yol|hti|pou|siu| in|nel|yok|mac|ak |hik|sij| si|sto|htl|jke|nko|jch|sek|mot|i a|ela|ui |kis|mel|axt| ax|ijc|nan",
    "dip": " ku|en |ic |ku | bi|bi | yi| ke|an |yic|aan|raa| ci| th|n e| ka| eb| ra|c k|c b|n a|ci |in |th |kua|ny |ka |i k|ŋ y|i l|ben|k e|ebe| ek| e |höm|nhö|öm | al|ai |kem| ye| nh|eme|m k|men|i y|t k|n k| la|c e|ith| er|lɛ̈|thi|alɛ|ua |t e|ek |ɛ̈ŋ| lo|ɔc |n t|ŋ k| ep|u l|it |yen|kɔc|̈ŋ |de |k k|pin|a l|i r|n y|epi|n b|lau|at |iny|aci|aai|u t|ken|au |ok | te|a c|ath| pi|ke | ac|e y|cin|u k|oŋ | lu| ti|a t|uat|baa|ik |tho|yit|ui |hii|u n|h k|e r|n c|te |kek| lö|l k|h e| lɛ|hin|thö|m e|ɛŋ |n r|n l| et| mi|ëk |i b|ekɔ|era|eŋ |e w|i t|el |ak |nhi|iic|a k|i e|pio| ny|ŋ e| aa|nde|u b|e k|kak|eba|ök |k a| ba| en|ye |lɛŋ| pa|iim|im |köu|e c|rot|e l| le|öŋ |ot |ioc|c t|i m|r e| kö| kɔ|eth|y k|oc |ŋ n|loo|la |iit| el| we| ey|i p|uny| ro|ut | tu|oi |e t|enh|thɛ|m b|hok|pan|k t|ëŋ | wi|yii|tha|wic|pir| li|u e|bik|u c|ën |ynh|y e|lui|eu |ir |y b|nyn|uc |n w|mit| ec|öun|any| aw|ɛt |ɛ̈ɛ| dh| ak|and|loi|wen|l e|höŋ|e e|thë|aku|̈ɛ̈|kut|am |eny|u m|i d|iek|k c| ko|tic|leu| ya|u y|tii| tö| ma|nyo|tö | ew|hök|den|t t|hëë|i n|k y|i c|cit|h t| ed|uee|bai|ɛ̈n|öt |eri|ɛ̈k|awu|rin|a p|cɛ̈|hai|kic|t a| të|tue|cii|hoŋ| bɛ|ooŋ|n p| cɛ|̈k |c l|u p|uk |c y|löi|i a|eke|dhi|wel|thk|eeŋ|öi |elo|n m|r k|ien|om |hom| wa|nho",
    "kde": "na | na| va| wa|la |nu |a k| ku|a w|ila|wa |a v|chi| mu|unu|e n|mun|van|a m|a n|ya |le |ele|sa | ch|asa|amb|ana|was|lam|mbo|ohe|ave| vi|ne |bo |aka|e v|a u|u a| n’|u v|e m|ke |anu| li|ve |vel|ake|ala|hil|ile| pa| av|ng’|a l|he |ing|ene|ela|ili|ika|vil|ngo|vak|ali| di|uku|wun|any|lan|a i|mbe|a a|uni|e a|ama| ma|go |nda|bel|emb|wak|kuw|nya| mw|ola|a d|den|lem|a c| il|ulu|kol|g’a|o v|nji|kan|ji |au |ma | au|lil|mbi|uwu|lik|ye |’an|kuk|din|ula|no |and|umi|kum|eng|ane|dya|ong|o l|ach|mwa|e w| ak|an’|a p|kal|nil|lew|mad|n’n|voh|ilo|wen|aya|apa| vy|kut|ale|va | al|ang|ava|kul|hin|o m|hel|e k|ond|hi | la|lin| lu|idy|dye|u l|da |ole|ka |ani|ndo|ton| in|ewa|lov|o c|dan|u m|cho|uva|ia |pan|kam|we |ove|nan|uko|bi |kav| ya|lim| um|eli|u n|nga|uli|lia|mil|o n|’ch| kw|li | an|aha|dil|ata| dy|e l|n’t|i v|tuk|hoh|u i|hev|ni |niw|und| ul|ade|lel|kay|lon|e u|ino|i n|nje|uwa|she|yik| ly|hum|ako|i w|uma|vya|kwa|ba |’ma|val|kil|mwe|mba|mu |pal|umb|wav|hih|ulo| ka|e c|nde|wal|ima|’ni|lun|ihu|a y|vin|yoh|e i|vyo|inj|u c|kup|kuv| ki| m’|a s|e p|dol|lek|awa|o u|n’c|iwa|imu|anj|mal|yen|u w|yac|bil|oja|o a|ha |utu|ech|i d|uka|taw|n’m|ita|awu|ina|m’m|i a|itu|hon|lu |atu|mak|iku|lya|lit|jel|evo| vo|i l|mah|hap",
    "snn": " ba|ye |bai| ye|ai |e b| ca|ai̱|ia |ji | ne| si|i̱ | go|goa|sia|i n|e c|a y|i y|̱ b| ja|se |aye|i j|a b|jë |iye|e g|re |oa |hua|yë |quë| gu|hue|e̱ |u̱i|gu̱|ne | ma|̱i |je̱|eo |e s| hu| ña|bay|o y|ñe |ja |ajë|to |aij|deo| ñe|a i|ayë|ba | ji|beo|cat| de| be|e j|i s|mai|e e|bi |a ñ| co| e |ato|uë |ña |i g|e ñ|i b| iy|cha|ë b|eba|coa|na | ts|e y|̱je|reb| i | ti|i t|ja̱|ach|ue |e i|i c|ni |oac|e t|a ë| re|je |aiy|oji|eoj|a̱j|oye| ë |ë t|cay|ija|ico|ihu| sa|i d|ere|a c| qu|ahu|iji|ca |ua | yë| to|a h|ase|ues|ë s|aca| se|uai|e d|ese|asi|caj| ai| tu|tut|utu|ë c|yeq|equ| na|cai| i̱|ti |mac|e m|ë g|ebi|a a|ani|tu |e n|yeb|eje|oya|toy|co̱|a m|̱ t|ije|sic|eso|eoy|a t| a | te|haj|cah|oas|are|i m|a s|ehu|añe| da|o b| do|i i|i r|e r|neñ|yer|huë|ë y| o |jai|a j|aje|a g|ibë|ëay|aña|aja|a o|coc|bëa|oca|sos|doi|oi |aco|eñe| jë|ë d|ë j|cas|ëca|hay|ea |̱ g|ari|tsi|yij|sai|̱ c|osi|teo|o h|co |̱re|nej|ëhu|o s|ose|jab|̱ni| me|rib|ñes|si |yaj|jëa|uaj|ë m|dar| yi|oe |e o|nes|i̱r|ma |nij|i h|oja|uëc|ama|ë i|i̱h|o̱u|̱uë|̱hu|aqu|ëco|e a|a̱ |ëja|̱ñe|o̱a|go̱| ëj|ñe̱|tia|abë|sih| bi|tsë|sëc| je| cu|̱ a|ned|cab|a d|ore|me | oi| ro|jay|tso|ë r|eye|ta |bë |ñaj|soe|̱ca|o̱c|año|o c|ire|ohu|uej|ñej|i a|ñas|ë q| ju|ban",
    "kbp": "aa | pa| se|se |na |nɛ | nɛ| yɔ| wa|yʊ | ɛy|ɛ p|ɖɛ |aɖɛ|a ɛ|a w|ɛwɛ|ɛna|yɛ |ala|ɛ ɛ|ɛ s|ɔɔ |yɔɔ|ɩ ɛ| ɛ |paa|e ɛ|e p|ɛyʊ|aɣ | pɩ| ɛw|a p|waɖ|ʊʊ |a n| ta|yɔ |yaa|yɩ |wɛn|la |taa|ʊ w| tɔ|a a|ɔ p|ɛya| kɩ| ɩ |ɩyɛ|a t|ʊ ɛ|a k|wɛɛ|tɔm|ɔm |ɛ t|wal|ʊ n| wɛ| ŋg| tɩ|ɛ n|ɛ k|kpe|ɛ ɖ|maɣ|zɩ | an|ʊ t|ɛ y| pʊ|nɩ | tʊ|ɛyɩ|ɩɣ |ɩ t| we|ɩ y|anɩ| pɔ|a s|gbɛ| pɛ| ɛs|pa |kpa|ɛɛ |wɛ | nɔ|daa|nɔɔ|ʊ y|ama|ya | kʊ|tʊ |pal|mɩy|ayɩ|ɩ p|ɩna|tɩ | ɖɩ|ʊ p|ɔ ɛ| ɛl| mb|ɔ s|ŋgb|a y|ɩma|ɖɩ |ʊ k|ɔɖɔ|ɩ n|bʊ |mbʊ| ɛk| kp|ɛja| ɛj|tʊm|jaɖ|paɣ|kɛ | ye|ɛyɛ|alɩ| na|i ɛ| ke| ya| ɖɔ|ɩ ɖ|ɔɔy|nda|ɖɔ |fɛy|ɣ ɛ|ɩ s|jɛy|yi |ɖɔɖ|ɛla|lɩ |kɩm|kɩ |aŋ |bɛy|pee| ñɩ|lab|ɩzɩ|pe |eyi|ŋ p|ɩ ɩ|ɛzɩ| fa|ɔyʊ|aʊ |ʊmɩ|ʊyʊ|ʊma|a l|sɔɔ|a ɩ|ekp|ʊ s| aj|ajɛ| ɛt|iya|wey|ɩ k|ʊ ŋ|ma |kan|ɩsɩ|laa|ɔyɔ|ɩm |li | kɛ| lɛ|and|sam| sa|ɣtʊ|ɔ k|day|ɔɔl|ɣ p|sɩ |ɔŋ |ɩfɛ|akp|pak|sɩn|pɩf|naa|ndʊ|kul| ha|aɣt|ɔ y|uli| ɖe| kɔ|eek| pe| sɔ|m n|ŋga|ee |ga |ɖʊ |maʊ|m t|e e|ɣna|ɣ s|ŋgʊ|abɩ|akɩ|a ñ|yaɣ|pɩz|eki| ɖo|maŋ| la|yee|ana|tɩŋ|ɣ t|pad|ñɩm| ca|ɛ a|a ɖ|pɩs|ina|dʊʊ|ɖe | ɖa|a m|lɛ |ked| ɛɖ|lak|aka|gʊ |asɩ|ʊ ɖ| ɛd|dʊ |nʊm| nʊ|ñɩn|ba |ɛpɩ|pʊ |ada|ɛhɛ|hal| a |le |zɩɣ|ɛɛn|ɛsɩ| le|aɣz|uu |nɖɩ|e t|ŋ n|ɛda|lɩm|e w|ɔ w|ɩ a| ɛp| nɖ|ɛkɛ|i p|ɣzɩ|alʊ|zaɣ|bɩ |ɛ l|ɩkɛ|ɔ t|e y|ɖam|aaa|pɛw",
    "tem": "yi | yi| ka|a ʌ| tə|uni|ni |wun| ɔ | aŋ| wu|ka | kə| kʌ| ʌŋ|nɛ |kə |tək| ʌm|əkə|ɔŋ |mar| ɔw|a k|ma |i k| a |wa | mʌ|i t|ri |ɔwa|thɔ| th| ma|ari|i m|a a|ʌma|aŋ | o | ba|tha|ba | kɔ|a y|ŋ k|ɔm |‐e | rʌ|lɔm|kɔ |i ɔ|kom|o w|ʌnɛ|te |mʌ | ŋa|i o|əm |hɔf|ɔf |alɔ|om |a m|ɔ b|ɔ y|aŋf|fəm|hal|kəp| mə|ŋfə|ʌth| tʌ|a t|a r|ŋ y|ŋth|ŋa | ʌt|ɔ k|e ɔ|ɛ t| ro|wan|ema| gb|ank| ye|th |yem|nko| mɔ|ʌwa| sɔ|kʌm|m a|kət|ʌmʌ|anɛ|rʌw|ɔ t|ʌme|ʌŋt|me |ʌte| bɛ|hɔ |a ɔ|ki |ʌŋ |m ʌ|m k|ar |ŋ ɔ|yɛ |əth|ɛ ʌ| ta|i a|ta | ʌk|ə k|thi|et |pet|pa |ŋɔŋ| te|ŋe |i ʌ|ra |i r|əpe| ŋɔ|ɛ k|ʌ k| yɔ| rə|kʌt|rʌ | yɛ|bɛ |e a|e t|ro |ɔ ʌ|akə|thə|ɔ m|a‐e|əpa|a w|kəl|ə b|yɔ |ə t|mɔ |bot|ŋ t|e y|əŋ |mʌs|gba|e m|m r| bo|ʌŋe| ak|ɛ a|nʌn|ləŋ|ələ|sɔŋ|ŋ b|təm|wop|ʌ a|ə y|kəs|sek|ə s|tʌt|li |ot | ko|ɛ ŋ|ŋ a|ekr| ra|ɔth|sɔt|ʌse|ath|ru |t k|ɛ m|e k|ɛth|ma‐|po | po| wo|ʌrʌ|i y|m t|m ŋ|tʌŋ|tɔŋ|e w|gbʌ|tə |nth|ʌyi|ʌlə|hən|ʌ ʌ|op |iki|ʌkə|rʌr|ʌru|ŋgb|sɔ |əyi|rʌn|gbə|ɔ a|ər |ɔkɔ| pə| ʌr|ənʌ|ləs|nka|ith|əli|ʌy |bəl|mʌy|ran|o ɔ|ɛ r|ant|f ʌ|mə |ti |f t| tɔ|əs |r k|hi |yik|ɔ ɔ|rək|kar|ʌ t|mʌt|lɔk|ayi|krʌ|pan|na |kʌr|mət|tət|tho|pi |mʌl| to|to | wa|ʌgb|thɛ|ə g|bas|eŋ |aŋk|ɔ r|thʌ|o t|ɛŋ |i‐e|kʌ |kʌs|mɔŋ|o d|kɔŋ|din|ɔ g|kəw|di |ŋ w|əma|ɛr |ʌ y|ək |ŋko",
    "toi": " ku|a k|wa | mu|a m|la |ali|ya |tu |i a|e k|a a|aku|ula|ntu|ang| al|lim|lwa|kwa|aan|mun|mwi|de |ulu|ngu|wi |imw|luk|gul|na |ele| ak|kub|ons|unt|kul|oon|se |ant|nse| oo|zyi|gwa|si | ba|ba | lw|zya|uli|ela|a b| ci| ka| zy|waa|and| an| kw|ili|uki|eel|uba|nyi|ala|kut|ide| ma|kid|isi|uny|i m|kun|cis| ya|li |i k|nga|a l|yin|kuk|ka | ul|kus|ina|laa|nte|ila|tel|mul|wab|wee|nda|izy|ede| am|led|amb|ban|we |da |ana|kwe|e a|lil| bu|o k|bwa|aka|ukw|o a|ati|uko|awo|yan|ko |uci|ilw|bil|bo |a c|wo |amu|law|mbu|i b|bul|umi|ale|abi|kak|e m|u b|akw|u o|ti |sal|kuy|ung|bel|wak| bw|o l|ga |kal|asy|e u|lan| mb|lo |usa|ika|asi|aam|a n|ule|bi |cit|bun|kup|egw|muk|igw|u k|u a|mbi|wii|kum|a z|aci|ku |yi | mi|yo |le |mas|yig|ubu|kka|i c| ab|ene|ne |no |a y| wa|abo|ndi|uta|syo|aya|aba|len|kuc|eya|o y|mal|ind|lem| lu|ukk|mo |eka|mil|mbo|ita|uka|ama|lik|u z|ndu|mu |nzy|zum|bal|abu|upe|bam|syi|u m|liz|int|ta |yak|ley|e b|nzi|lii|kab|uti|ube|uum|i n|cik|ezy|iib|iba|ani|iko|iin|ile|was| ca|zye|alw| aa|sya|uku|twa|min|tal|muc|umu| nk|du |azy|onz|lek|kon|buk|o m|yik|i z|lwe|u u|oba|kwi|imo|gan|zil|del|usu| we|peg|yee|ngw|sum|imb|ump|mpu|nde|end|i o|yoo|o n| nc|a u|mi |ano|uya|o c|di |mba|yil|yal|ako|a o|isy|izu|omb",
    "est": "sel|ja | ja|le |se |ust|ste|use|ise|õig|mis| va|gus|ele|te |igu|us |st |dus| õi| võ| on|on |e j| in|ini|nim|ma |el |a v|iga|ist|ime|al |või|da | te|lik| ig|adu|mes|ami|end|e k|e v|l o| ka|est| ra| se|õi |iku| ko|vab|aba|tus|ud |a k|ese| ku|l i|gal|tsi|lt |es |ema|ida|ks |a i|n õ|lis|atu|rah|tam|ast|sta|e t|s s| mi|ta |ole|stu|bad|ga |val|ine| ta|ne | pe|nda|ell|a t|ali|ava|ada|a p|ik |kus|e s|ioo|tes|ahe|ing|lus| ol|a a|is |vah|a s|ei | ei|kon|vas|tud|ahv|t k|as |a r|s t|e e|i v|eks|oon|t v|oni|kõi|s k|sio|sus|e a|gi |mat|min| pi|s v|oma|kul|dad| ni|e p| om|igi|tel|a j|e o|ndu|dse|lle|ees|tse|uta|vus|aal|aja|i t|dam|ats|ni |ete|pid|pea|e õ|its|lma|lev|nis|dis|ühi|sli|i s|nen|iel|des|de |t i|et |nin|eva|teg|usl|elt|ili|i m|ng | ee|tem|ses|ilm|sek|ab | põ|ait| ne|õrd|sed|võr|ul | üh| ki|abi| kõ|ega|rds| vä|ots| et| ri|põh|ed |töö|si |ad |i k| tä|ata| ab| su|eli| sa|s o|s j|sil|nni|ari|asu|nna| al|nud|uma|sik|hvu|onn|eab|emi|rid|ara|set|e m| ke|a e|täi|d k|s p|i e|imi|eis|e r|na | ül|a ü|koh|a o|aks|s e|e n| so|õik|saa|and|isi|nde|tum|hel|lii|kin|äär|sea|isk|een|ead|dum| kä|rii|rat|lem|umi|kor|sa |idu|mus|rit|har| si|vad|ita|ale|kai|teo| mõ|ade|üks|mas|lse|als|iaa|sia|sot|jal|iig|ite",
    "snk": "an | a | na|na |a n|ga | ga|en | su|re |a k| ka|su |a a|a s| ta|un | se|ta |ma | i |ama|do |e s|ere|ser|aan| do|nan|nta| ra|n s| ma| ki| ja|jam| da|taq|ne |a g|a d| ya|n d|ni | ku|ren|ri | si|ana|u k|n ŋ|ŋa | nt|e k|maa| ŋa|ndi|wa |aqu|ane| ba|ra |a r| sa|oro|n t|raa|tan| ke|oxo| xa|i s|di |a f|and|ti |a b| be|i k|gan|aax|aaw| go|iri|kit|awa|axu|sir|a i| du|a t|me |ara|ya |ini|xo |tta|i a|oll|ran|on |gol|e d|n g|a j|nde|aar|e m|be |a m|ari|u n|lli|ron| fa|qu | ti|n n|aad|axa| ña|o a| so|ke |nu | ko|din|lle|dan|a y|man|i g|sor|u r|i t| no|are|xar|kuu| wa|enm|ada|baa|de |qun|o k|yi |xun|i n|i x| an| ha|kan|fo |att|ang|n k|o s|dam|haa|da |n y|kat|e t|li | fo|i d| mo|nme|u b|i m|aba| fe|len| re|pa |ant|ayi|yan|e n|a x|e y|n b| di|ppa|app|kap|xa |u t|o g|mox|ure| xo|ond|i i|a ñ|n x|taa|du |ell| me|iti|xu |u d|udo|ind|uud|anu|nga|o b|nun|nox|n f|ku |aga|anŋ|dun|itt|eye|ye | bo|ore|ite|u a|oor| yi| ro|sar|saa|ill|e b| wu|le |riy|nma|ro |ken|edd|fed|bur| mu|mun|o n|iin|tey|sel| tu|u m|lla|la |ono|ñaa|den|faa|a w|te |inm|ka |aay| te|ina|xoo|o d|ira|u s|o t|nmu|nen|ban|ene| ni|ña |o i|uur|una|o m|xon|n w|kaf|gu |e g|a h|kil|yu |und|aqi|een| bi|bag|i j|n ñ|laa|i r|no |sig|igi|kor| o |i b|bat",
    "cjk": " ku|a k|yi |nyi| ny|la | mu|wa | ci|a c|a n| ha|we |a m|nga|ga |i k|kul|uli|sa |esw|ana|ela|a h|ung|ha |tel|swe|ze |ya |a u| ka| wa|uci| ya|ate|ci |mwe|kwa|ma |mbu|ji |kut|han|u m| ul|ang| mw|nat|ca | ca|e m|mu |uth|ali|i n|mut|thu|i m|e k|lit|hu |ina|ka |kup|na | ma|asa|aku|e n|a i|pwa|nji|wes|li | mb|e a|ifu|fuc|kan|bun|ize|ing|a y|anj|mba|uta|ita|i u| kw|muk|ite|kus|amb|lin|awa|imb|cip|lim|ong|esa|i c|nge| ak|ngu| ce| an|ili|ulu| na|naw|kuh|ama|upw|emu|lem|ila| un|a a|ula|ukw|aka|cif|ule|wo |has|kun|kha| xi|o n|tam| es|usa|ala|te |u c| ng|iku|cik|lya|wil|e c|ta |xim|wik| li|muc| ly|ikh|no |o m| in|i a|utu|e w|akw|mo |imo|mil| mi|i y|ba |ko |ngi|ufu|ku |lij|uka|iji|a w|umi|o w|tan|o y|e y|imw|ulw|uha|nal|so |o k| ye|i l|e u|umw|bu |aci|lwi|aha|ciz|mwi|kat|lon|u k|yes|ipw|ulo|aze|uni|wak|lo |ema|o c|aco| iz|kum|ika|e i|cim|isa|eny|umu|pem|yum|kwo| ik|kwe|e h|ngw|wam|cin|i h|a e|wan|ge |a x|was|le |kuk|uze|lik|gul|nin|pwe|o u|mah|ata|uma| up|sak|zan| uf|fun|go |wen|mbi|uso|ges|co |ngo|iki|hal|gik|ile|nda|kol|kal|kuz|ne | ja|oze|yoz|ikw|ipe|ces|swa|cis|man|i i|iso|ele|aso|waz|mi |upu| if|ise|umb|uvu|kil| it|i w|sok|o l|oko|nyo|una|bi |tum|iko|ene|hak|sem|a l|da |vul|nyu| ut| uk|eka",
    "ndo": "na |oku|wa | na|a o|a n|ka |ntu| uu|tu |uth| om|e o|mba|ong|omu|ba | ok|uut| ne|he |the|ang|hem|emb|unt|o o|a u| wo|nge| iy|ehe|kal| no|a w|o n|no |nga|e n|ko |mun|oka|lo |o i|lon|we |ulu|a m|ala| ke|la |a k|u n|han|ku |gwa|osh|shi|ana|ngu|ilo|ano|ngo|keh| mo|ga |nen|man|ho |luk|tha|ge |gul|u k|eng|ha |a y|elo|uko|a e|ye |hil|uka|li |go |wan|ath|wo |thi|dhi|uun| pa|kwa| ta|a p|ya | sh| ko|nka|lwa| os|mwe|oma|ta |ema|sho| ka|e m| yo|sha|wok|ika|po |o w|onk|e p|pan|ith|a i|opa|gel|hik|iya|hi |aan|una|o g|kuk|alo|o e|nok|ndj|le |a a|men|yom|a s|i n| li|and| po|pam|lat|kan|ash|waa|aka|ame|gam|umb|a t|ond|yuu|o k|olo|ane|ing|igw|aa |ele|kul|mon| gw|ilw|gan|o y|iil|iyo| el|kut|nin|oko|ike|o m| ku|adh| ye|amw|ome|yeh|aye| ga| on| yi|a g|lyo|ne | ng|mbo|opo|kug|eko|yok|wom| oy|non|iye| go|ulo|e e| we| e |ina|ant|omo|ene| a |i k|mok|him| dh|und|ndu| me|eho|wen|nek| op|alu|e g|ima|kat|ota|oye|ila|ngw|yop|wat|ela|o u|a l| ii| ay| nd| th|o l|yon|ili|oon|okw|yaa|taa|lwe|omb| ni|aku|i m|mo |ula|ekw|enw|iyu|pok|epa|uki|ke | wu| mb|meh|e t|uni|nom|dho|pau|eta|yi | ly|o a|ono|lun|lak|ola|yo |lol|ank|bo |i o|awa|nwa|a h|naw|hok|nem|kom|ndo|o s|u t|vet|mbu|ani|uga|ndi|ukw|udh|lok|e k|alw|kwe|kun| ya",
    "rmn": "aj |en | te|te | sa| le|aka|pen| si| e |el |ipe|si |kaj|sar| th|and| o |sav|qe |les| ma|es | ha|j t|hak|ja |ar |ave| an|a s|ta |i l|ia |nas| aj|ne | so|imn|mna|sqe|esq|nd |tha|haj|e s|e t|e a|enq|asq|man| ja|kan|e m| i | ta|the|mes|cia|bar|as |isa|utn|qo |hem|o s|s s| me|vel|ark|i t| na|kas|est| ba|s h|avo| di|ard| bi| pe|rka|lo | ak|ika|e r|a a| pr|e k|qi |mat|ima|e p|a t| av|e d|r s|n s|anu|nuś|o t|avi|orr|o a| ka| re|n a|re |aja|e o|sqo|sti| ov|õl |l p|nqe|ere|d o|vor|so |no |dik|rel|ove|n t|ve |e b|res|tim|ren| de|àci|o m|i a|but|len|ali|ari|rre|de | pa|ver| va|sqi|ara|ana|vip|rak|ang|vi | ra|or |ker|i s|eme|e z|ata|e l|a e|rip|rim|akh|la |o p|kar|e h|a p|na |ane|rin|ste|j b|er |ind|ni |tne| ph|nip|r t| ke|ti |are|ndo| je|l a|uśi|e n|khi| bu|kon|lim|al |tar|ekh|jek|àlo|o k| ko|rde|rab|aba| zi|ri |aća|ćar|śik|dõl|dor|on |ano|ven| ni|śaj| śa|khe|ća |ast|j s|uti|uni|tni|naś|i d|mut| po|i p|a m| pu|a l|l s|som|n n|ikh|nik|del|ala|ris|pes|pe |j m|enć|e e|nća|ndi|rdõ|kri|erd|śka|emu|men|alo|nis|aśt|śti|amu|kh |tis|uj |j p|do |ani|ate|nda|o b|nge|o z|soc|a d|muj|o j|da |pri|rdo| as|cie|l t|ro |i r|kla|ing|a j| ze|zen|j e|ziv|hin|aśk| st|maś|ran|pal|khl|mam|i b|oci|rea|l o|nqo| vi|n e",
    "gaa": "mɔ | ni|ni |kɛ |ɛ a| ak|lɛ |i a| he|ɛ m|akɛ| lɛ| ko|gbɛ|ɔ n|ɛɛ | mɔ| kɛ|yɛ |li |ɛ e|ko |ɔ k|i e|aa | yɛ|bɛ | ml|shi|ɛ h|egb| gb|ɔɔ |mli| fɛ|fɛɛ|heg|nɔ |a a|i n|aŋ |oo | nɔ|i k|he |ɛ n| es| am|ɛ k|ɔ y| sh| ma|esa|loo|ji |maŋ|amɛ|emɔ|ɔ f|fee| ek| al|ɛi |ii |ɔ m|ɔ a|bɔ |e n|ɔ l|amɔ| eh|alo|hi |naa|ee |ɔmɔ|oni| en|o n|kon|aji|i y|i m|sa |o a|eli|umɔ| bɔ| hu|yel|hu |eem|nɛɛ|tsu| ah| nɛ|sum|tsɔ| an|nii|o e|baa| as|mɛi|yɔɔ|gbɔ|aaa|na |i h|eye|ɛ g|eɔ |ɛji| at|ana|eko|ena|o h|ŋ n|kom| ts|ɔ e|maj|i s|i l|efe|ome| kp|a l|kwɛ|ku |ehe|toi|a n|saa|bɔm|ha |a m|kɛj|kpa|hew| ku| sa| na|hiɛ| hi|ane|gba|e e|i f| mɛ|ɛ t|bɛi|ash|ŋ k|e k| ej|hey|aka|ats|ne |its|e a|san| ay|ye | je| kr| ey|mla|eŋm|nit|a h|ɔ b|ɛ s|anɔ|ŋmɔ|a e|ɛ b|jeŋ|ɛ y|aan|kro| ab| af|any|iaŋ|ɔ g|a k| yɔ|uɔ |shw|ets|ekɛ|usu|ŋŋ |ŋma|esh|u l| ba| et|iɔ |i j|o k|suɔ|oko| yi|e s| ag|afe|agb|oi |ŋ a|rok|o s| aw|ai | ji|ɛ j|aye|ŋ h|ish|nyɛ|la | ad|o m| ef|tsɛ|sɛ |wɔ |ewɔ|mɔɔ|ehi|aŋm|hwe| bɛ| to|ɔ h|jɛ |aha| ja|paŋ|alɛ|awo|sɔ |ŋts|ɛŋt|iɛŋ|bii|diɛ| di|mɛb|eni|his| ny|e b|hik|u k|ate|i b|ŋmɛ|akw|o y|eŋ |ahe| lo|me |ade|ɔ j|kɛn|teŋ|yeɔ|ɔ s|des| su|wal|nyɔ| eb| eg|ŋ m|mef|saŋ|ɛ l|o l|u n|asa|sem|jia|wɛ | em|o b|gbe|hil|ihi|hih|ɔŋ |nak|e h|sus|e g",
    "bin": "e o|ne | ne|be |an |en |vbe| o |wan|mwa|n n|e e|emw|evb|mwe|in |na |e n| na| em|omw|e a|n e|e i| vb|re | ke|gha|gbe|wen| gh|ie |wee| om|e u| kh|bo |hia| ir|ha |o k|nmw|tin|n o|vbo|he |eti|ia |kev| ev| we| et|win|ke |ee |o n| hi|a n|a r|o r|gie|ran| ya|ira|mwi|a m| mw|a g|ghe|ogh| a | re| uh|eke| og|n k| no|ro |ye |khe| ye|hek|rri|nog|een|unm|a k|ogi|egb|ya |ere|wun|hun|mwu| mi|mie|de | rr|a e| ar|a o|n y|e v|o g|un |ra | ot| gb|uhu| ok|n i|ien|a v|rhi|e k|n a|i n|a y| ru|khi|n m|hie| eg|oto|arr|ba |ovb|u a|e y|ru |ian|hi |kpa| ra|o m|nde|yan|e w|and|to |o e|o h| ni| rh|e r|n g| er|n h|ugb|we |hae|on | iy|dom|rue|u e| or| ik|ren|a i|aro|iko|o y|n w|ben|ene|rio|se |i k|uem|ehe| ov|otu|okp|kug|oba|iob| uw|aen| do|iru|ae |tu |ue | iw| ma|wu |rro|o o|rie|n v| ug|a u|nna| al|ugh|agb|pa | ay|o w|ze |uwu|ma | eb|iye|aya|ugi|inn|gho|rre|nii|aku|gba|khu| se|yi |onm|ho |a w|ii |iwi| uy|uyi|e d| i |hin|obo|u o| ak|beh|ebe|uhi|bie|ai |da |i r|gbo|o v|won|mwo|umw| ag|ode| ek| la| um|aan| eh|egh|yin|anm|mo | kp| bi|kom|irr|i e|a a|kha|oda|bon|a d| ow|owa|ghi|n u|o a|yen|eem|ieg| az|aze|hoe| yi|oe |e g|ele|le |lug| ka|aa | as|yaa|gue|a h|mu |nre| od|n r|ero|ese| ku|enr|lel|vbi|wa |u i|a b|oro|bi ",
    "ada": "mi |nɛ | nɔ| nɛ| e | he|he |nɔ | a |ɔ n|kɛ | kɛ|i k| ng|a n|i n|aa |e n|blɔ| bl|ɛ n|ɛ e|gɛ |ngɛ|e b|lɔ | ma| mi|ɛ h| ts| ko|hi |ɛ a| ɔ |ko |e h|ɛɛ |tsu| ni|ɔ k|a m|a k|i h|ma | ny|emi|a h|ami| be|be |i a|ya | si|e m|e j| ka|si |ɛ m|ɔ f| kp|nya| je|ni |oo |loo|o n| hi| fɛ|fɛɛ|a t|laa|a b|je |e k| pe|pee| ye|mɛ |umi|ɔ m| ha|a a|ɔmi|omi|kpa| wo|ɔ e|i t|ɛ ɔ|e s|i b|ɔ h| lo|ɛ k|ke |ha |bɔ |maa|mla|i m|ɔ t|ɔ́ |e p|kaa|ahi| sa|lɔh|ɔhi|sum|ɔ a|nɔ́|o e| na| gb|ee |e ɔ| ji|e a|i s| ml|ɛ s|sa | hɛ|ɔɔ |yem|u n|alo| jɔ| ku| lɛ| bɔ| to|a s|ɛ b|i l|lɛ |sua|o k|uaa|a j| su|ɛmi| ad|ɛ y|imi|ade| fa| al|jɔm|des|esa|eɔ |ihi|ji |ne |ɛ t|a e|ɛ j|ake|e e|kak|ngɔ|o a|eem|i j|e y|wo | bu|him|e w|́ k|ɔ y|tom|suɔ|ia |ane|mah| ya|o b| ke|e g|wom|gba|ue |ba | bi| gu|uo |e t|san|uu |pa |hia| tu| hu|suo| we|tsɔ|ɔ s|e f|kuu|gɔ |o m|a p| ja|ɛ p|fa |ɔ b|ɛ g|hɛɛ| ab|a l|hu |ye |na |tue|i ɔ|isi| sɔ|sɔs|jam|gu |ti |ɛ w|sis|o h|uɔ |li |a w| ba|sɔɔ|abɔ| ju| hl|ɔsɔ|hla|ɔ l|a y|sɛ | ɔm|ɔmɛ|i w|ɛti|pɛt|kpɛ|to | yi|asa| kɔ|nyu|akp|pak|kpe|sɔɛ|ɔɛ |u ɔ|yɛm|o s|uɛ | nu|pe |se | sɛ|o j|a g|ɔ w| wa|sem| pu|su |e l| mɛ|u k|hɛ |nih|kas| fɔ|kon|onɛ|bim|lam|imɛ|nyɛ| fi|hiɔ|usu|i p|bi | ní|yo |eeɔ|uam|bum|níh|íhi|o l|ula|kul|guɛ|naa",
    "quy": "chi|nch|hik|una| ka|anc|kun|man|ana|aq |cha|aku|pas|as |sqa|paq|nan|qa |apa|kan|ikp|ik |ech|spa| de|pa |cho|ere|der|rec|am | ru|an | ma| ch|kpa|asq|ta |na |nam|nak|taq|a k|qan|ina|run|lli|ach|nap|pi |mi | ll|yoq|asp|ima|hay|hin|aqa|nku|ant|ayn|oyo| hi| im|hoy|cio|nta|nas|q k|api|iw |wan|kuy|kay|liw|aci|ion|ipa|lla|oq |npa|ay |kas|a m|nac| na|inc|all|ama|ari|anp| ya|chu| hu|nin|pip|i k|qmi|hon|w r|ata|awa|a c|ota|in |yku|yna| wa|a h|has|a d|iku|a l| li|pan|ich|may| pi| ha|onc|a r|onk| ot|ku | qa|ank|aqm|mun|anm|hu |a p|nma| mu|qta|n h|pap|isq|yni|ikm|ma |wsa|aws|kaw|ibr|bre|lib|ayk|usp|nqa|e k| al|lin|n k|re |ara|nat|yac|kma|war|huk|uwa|yta|hwa|chw| sa|was|kus|yan|m d|kpi|q m|a i|q l|kin|tap|a a|kta|ikt|i c|a s|uy | ca|qaw|uku| tu| re|aqt|ask|qsi|sak|uch|q h|cas|tin|pak|ris|ski|sic|q d|nmi|s l|naq|tuk|mpa|a y|k c|uma|ien|ypi| am|qaq|qap|eqs|ayp|req|qpa|aqp|law|ayt|q c|pun| ni|a q|ruw|i h|haw|n c| pa|amp|par|k h| le|yma|ñun|ern|huñ|nni|n r|anq|map|aya|tar|s m|uñu|ten|val|ura|ita|arm|isu|s c|onn|igu| ri|qku|naw|k l|u l|his|ley|say|s y|rim|aru|rma|sun|ier|s o|qar|n p|a f|a t|esq|n a|oqm|s i|awk| va|w n|hap|lap|kup|i r|kam|uyk|sap| qe|ual|m p|ran|nya|gua| pe| go|gob|maq|sum|ast| su| ig",
    "kng": " ya|na |ya |a k| na|a y|a m| ku|a n|a b| ba|u y|and|ka | mu|yin|wan|tu | lu|aka| mp|ve | yi|la |ntu| ki|mpe|pe |nda|a l|si |yan|ana|so | ke|e n|ons|nso|di |da |ndi|i y|u n|lu |mun|alu|unt|ina|e y|nza|luv|ala|uve| ma|u m|ke |za |ayi|sal|o m|ban|ndu|ta |isa|kan|ulu|i m|amb|ma |kim|u k|fwa| ny|nyo|yon|ama|ti |ang|anz|du |kus|o y| me|i n|to |ins|nsi|wa |usa| mo|kon|uta|end|i k|uka| bi|a d| ko|mbu|mos|sa | ve|ika|mu |osi|e k|uti|kuz|imp|a v|e m|und|ind| fw|ila| to|pwa|mpw|ngu|bal|adi|ba | sa|len|sam|sik|mab|tin|vwa|mba|kuk| di|yay|a t|yi | le|ant| ka|ata|isi|olo|kis|mut|ula|lo |bu |su | bu| at|amu|o n|dya|kut|dil| nz|ngi|abu|usu|but| nt|ni |bak|kul|e b|nga|e l|inz|imv|gu |wu | dy|lus|awu| ti|lak|bay|bun|kat|ngo|tal|i b|utu|kak|o k|bim|uzi|uza|mvu| ng|nak|iku|baw|esa|kin|ken|yak|mpa|luz|umu|nu |nta|dis|dik|vuk|u f|tan|sad|ati|nka|ank|luk|mak|ong| mb|ani|i l|lwa|aba|luy|uya|yal|ing|zwa|kuv|idi|ku |ga |zit|bis|uvw|uzw| ni|swa| nk|iti|mef|fun|ibu|nsa|aku|ufu|kub|lam|met|i a|mus|eta|a a|u t|twa|atu|tuk|fum|uko|iki|don|kol|kun|bam|eng|uku|ndo| ns|a s|ela|usi|pam|mvw|u b|i t|zo |anu|tis|uke|sul|te |gid|dib|yam|ilw| mf|ola|umb|uso|kam|gi |mbi|oko|nzi|i s| nd|mfu|luf|dus|bum|lut|mam|ded|wil|tad"
  },
  "Cyrillic": {
    "rus": " пр| и |рав|ств| на|пра|го |ени|ове|во | ка|ани|ть | в | по| об|ия |сво| св|лов|на | че|ело|о н| со|ост|чел|ие |ого|ет |ния|ест|аво|ый |ажд| им|ние|век| не|льн|ли |ова|име|ать|при|т п|и п|каж|или|обо| ра|ых |жды| до|дый|воб|ек |бод|ва |й ч|его|ся |и с|ии |аци|еет|но |мее|и и|лен|ой |тва|ных|то | ил|к и|енн| бы|ию | за|ми |тво|и н|о п|ван|о с|сто|аль| вс|ом |о в|ьно|их |ног|и в|нов|ако|про|ий |сти|и о|пол|олж|дол|ое |бра|я в| ос|ным|жен|раз|ти |нос|я и| во|тор|все| ег|ей |тел|не |и р|ред|ель|тве|оди| ко|общ|о и| де|има|а и|чес|ним|сно|как| ли|щес|вле|ься|нны|аст|тьс|нно|осу|е д| от|пре|шен|а с|бще|осн|одн|быт|сов|ыть|лжн|ран|нию|иче|ак |ым |ват|что|сту|чен|е в| ст|рес|оль| ни|ном|род|ля |нар|вен|ду |оже|ны |е и| то|вер|а о|зов|м и|нац|ден|рин|туп|ежд|стр| чт|я п|она|дос|х и|й и|тоя|есп|лич|бес|обр|ото|о б|ьны|ь в|нии|е м|ую | мо|ем | ме|аро| ре|ава|кот|ав | вы|ам |жно|ста|ая |под|и к|ное| к | та| го|гос|суд|еоб|я н|ен |и д|мож|еск|ели|авн|ве |ече|уще|печ|дно|о д|ход|ка | дл|для|ово|ате|льс|ю и|в к|нен|ции|ной|уда|вов| бе|оро|нст|ами|циа|кон|сем|е о|вно| эт|азо|х п|ни |жде|м п|ког|от |дст|вны|сть|ые |о о|пос|сре|тра|ейс|так|и б|дов|му |я к|нал|дру| др|кой|тер|ь п|арс|изн|соц|еди|олн",
    "ukr": "на | пр| і |пра|рав| на|ня |ння| за|ого| по|ти |го |люд| лю|во | ко| ма|льн|юди|их |о н| не|аво|анн|дин| св|сво|ожн|кож|енн|пов|жна| до|ати|ина|ає |а л| бу|аці|не |ува|обо| ос| як|має| ви|них|аль|або|є п| та|ні |ть |ови|бо | ві| аб|ере|і п|а м|вин|без|при|іль|ног|о п|ми |та |ом |ою |бод|ста|воб| бе|до |ва |ті | об|о в|ост| в | що|ий |ся |і с| сп|инн|від|ств|и п|ван|нов|нан|кон| у |ват|она|ії |но |дно|ій |езп|пер| де|ути|ьно|ист|під|сті|бут| мо|и і|ідн|ако|нні|ід |тис|що |род|і в|а з|ава| пе|му |і н|а п|соб|ої |а в|спр|ів |ний|яко|ду |вно|і д|ну |аро|и с| ін|ля |рів|у в| рі|и д|нар|нен|ова|ому|лен|нац|ним|ися|чи |ав |і р|ном| ро|нос|ві |вни|овн| її|ові|мож|віл|у п| пі| су|її |одн| вс|ово|ють|іст|сть|і з| ст|буд| ра|чен|про|роз|івн|оду|а о|ьни|ни |о с|сно|зна|рац|им |о д|ими|я і|ції|х п|дер|чин| со|а с|ерж|и з|и в|е п|ди |заб|осо|у с|е б|сі |тер|ніх|я н|і б|кла|спі|в і| ні|о з|ржа|сту|їх |а н|нна|так|я п|зпе| од|абе|для|ту |і м|печ| дл|же |ки |віт|ніс|гал|ага|е м|ами|зах|рим|ї о|тан|ког|рес|удь| ре|то |ков|тор|ара|сві|тва|а б|оже|соц|оці|ціа|осн|роб|дь‐|ь‐я|‐як|і і|заг|ахи|хис|піл|цій|х в|лив|осв|іал|руч|ь п|інш|в я|ги |аги| ді|ком|ини|а і|оди|нал|тво|кої|всі|я в|ною|об |о у|о о|і о",
    "bel": " і | пр|пра|ава| на|на | па|рав|ны |ць |або| аб|ва |ацы|аве|ае | ча|ння|анн|льн| ма| св|сва|ала|не |чал|лав|ня |ай |ых | як|га |век|е п| ад|а н| не|пры|ага| ко|а п| за|кож|ожн|ы ч|бод|дна|жны|ваб|цца|ца | ў |а а|ек |мае|і п|нне|ных|асц|а с|пав|бо |ам |ста| са| вы|ван|ьна| да|ара|дзе|одн|го |наг|він|аць|оўн|цыя|мі |то | ра|і а|тва| ас|ств|лен|аві|ад |і с|енн|і н|аль|най|аво|рац|аро|ці |сці|пад|ама| бы| яг|яго|к м|іх |рым|ым |энн|што|і і|род| та|нан| дз|ні |я а|гэт|нас|ана| гэ|інн|а б|ыць|да |ыі |оў |чын| шт|а ў|цыі|які|дзя|а і|агу|я п|ным|нац| у | ўс|ыя |ьны|оль|нар|ўна|х п|і д|ў і| гр|амі|ымі|ах | ус|адз| ні|эта|ля |воў|ыма|рад|ы п|зна|чэн|нен|аба| ка|ўле|іна|быц|ход| ін|о п| ст|ера|уль|аў |асн|сам|рам|ры | су|нал|ду |ь с|чы |кла|аны|жна|і р|пер|і з|ь у|маю|ако|ыцц|яко|для|ую |гра|ука|е і|нае|адс|і ў|кац|ўны|а з| дл|яўл|а р|аюч|ючы|оду| пе| ро|ы і|вы |і м|аса|е м|аду|х н|ода|адн|нні|кі | шл|але|раз|ада|х і|авя|нав|алі|раб|ы ў|нна|мад|роў|кан|зе |дст|жыц|ані|нст|зяр|ржа|зак|дзі|люб|аюц|бар|ім |ены|бес|тан|м п|дук|е а|гул|я ў| дэ|ве |жав|ацц|ахо|заб|а в|авы|ган|о н|ваг|я і|чна|я я|сац|так|од |ярж|соб|м н|се |чац|ніч|ыял|яль|цця|ь п|о с|вол|дэк| бе|ну |ога| рэ|рас|буд|а т|асо|сно|ейн",
    "bul": " на|на | пр|то | и |рав|да |пра| да|а с|ств|ва |та |а п|ите|но |во |ени|а н|е н| за|о и|ото|ван|не | вс|те |ки | не|о н|ове| по|а и|ава|чов|ни |ане|ия | чо|аво|ие | св|е п|а д| об|век|ест|сво| им|има|ост|и д|и ч|ани|или|все|ли |тво|и с|ние|вот|а в|ват|ма | ра|и п|и н| в |ек |сек|еки|а о| ил|е и|при| се|ова|ето|ата|воб|обо|бод|аци|ат |пре|оди|к и| бъ| съ|раз| ос|ред| ка|а б|о д|се | ко|бъд|лно|ния|о п| от|ъде|о в|за |ята| е | тр|и и|о с|тел|и в|нит|е с|ран| де|от |общ|де |ка |бра|ен |ява|ция|про|алн|и о|ият|ст |нов| до|его|как|ато| из|нег|а т|ден|а к|щес|а р|тря|а ч|ряб|о о|вен|ябв|бва|дър|гов|нац|ено|тве|ърж|е д|нос|ржа|а з|вит|зи |акв|лен| та|ежд|и з|род|е о|обр|нот| ни| с |т с|нар|о т|она|ез |йст|кат|иче| бе|жав|е т|е в|тва|зак|аро|кой|осн| ли|ува|авн|ейс|сно|рес|пол|нен|вни|без|ри |стр| ст|сто|под|чки|вид|ган|си |ди |и к|нст| те|а е|вси|еоб| дъ|сич|ичк|едв|жен|ник|ода|т н|о р|ака|ели|одн|елн|лич| че|чес|бще| ре|и м| ср|сре|и р|са |лни| си|дви|ичн|жда| къ|оет|ира|я н|дей| ме|еди|дру|ход|еме|кри|че |дос|ста|гра| то|ой |тъп|въз|ико|и у|нет| со|ави|той|елс|меж|чит|ита|що |ъм |азо|зов|нич|нал|дно| мо|ине|а у|тно|таз|кон|лит|ан |клю|люч|пос|тви|а м|й н|т и|изв|рез|ази|ра |оят|нео|чре",
    "kaz": "ен |не | құ|тар|ұқы| ба| қа|ға |ада|дам|құқ|ық | бо| ад|ықт|қта|ына|ар | жә|ың |ылы|әне|жән| не|мен|лық|на |р а|де | жа|ін |а қ|ары|ан | әр|қыл|ара|ала| ме|н қ|еме|уға|ның| де|асы|ам |іне|тан|лы |нды|да |әр |ығы|ста|еке| өз|ын |ған|анд|мес| бі| қо|ды |ің |бас|бол|етт|ып |н б|ілі|қық|нде|ері|е қ|алы|нем|се |бір|лар|есе|ы б|тын|а ж| ке|тиі|ост|ге |бар| ти|е б| ар|дық|сы |інд|е а|аты| та| бе|ы т|ік |олы|нда|ғын|ры |иіс|ғы | те|бос|луы|алу|сын|рын|еті|іс |рде|қығ|е ж|рін|дар|іні|н ж|тті|қар|н к|ім | ер|егі|ыры|ыны| са|рға|ген|ынд|аны|уын|ы м|лға|ана|нің|тер|уы |ей |тік|ке |сқа|қа |мыс|тық|м б|ард| от|е н|е т|мны|өзі|нан|гіз|еге| на|ы ә|аза|ң қ|лан|нег|асқ|кін|амн|кет|рал|айд|луғ|аса|ті |рды|і б|а б|ру | же|р м|ді |тта|мет|лік|тыр|ама|жас|н н|лып| мү|дай|өз |ігі| ал|ауд|дей|зін|бер|р б|уда|кел|біл|і т|қор|тең|лге| жү|ден|ы а|елі|дер|ы ж|а т|рқы|рлы|арқ| тү|қам|еле|а о|е ө|тін|ір |ең |уге|е м|лде|ау |ауы|ркі|н а|ы е|оны|н т|рыл|түр|ция|гін| то| ха|жағ|оға|осы|зде| ос|ікт|кті|а д|ұлт|лтт|тты|лім|ғда| ау| да|хал|тте|лма| ұл|амд|құр|ірі|қат|тал|орғ|зі |елг|сіз|ағы| ел|ң б|ыс | ас|імд|оты| әл|н е|ағд|қты|шін|ерк|е д|ек |ені|кім|ылм|шіл|аға|сты|лер|гі |атт|кен| кө|ым‐| кұ|кұқ|ра |рік|н ә| еш",
    "tat": " һә|лар|әм |һәм| ке| хо|кук|оку|хок|еше| бе|ләр|кеш|га |әр |рга|ан |кла| бу|ар |ең |нең|гә | то| ба|да |ргә| ти|ырг|һәр|ене|бер|ән |ен |р к|бул|укл|дә |а т|ары|тор|ире| үз|на |ган|ара| ка| ал|ә т|нә | ит| дә|ы б| ир|рын|ше |ын |енә|тие|лык|екл|ына|н т|иеш|бар|еле|ка |елә|а х|н б|кы |рек|ала|кар| та|ә к|нда|еш |лән|бел|укы|лан|ите|тә |шен|ле |лы |ез |ерг|н и|ә б|а к|клә|үз |тел|лыр|не |әрг|ы һ|е б| га| ха|алы|рне|м и|тен|әрн|а б|ның|ынд|ың |ләт|дан|сә | як|лга|улы|ел |а а| яи|яис|асы|ш т|а һ| са|рлә|лек|иге|ә х|гез|орм|ем |аны|р б|м а|р һ|рмы|мыш|сын|шка|ә һ|исә|тәр|үлә|әт |мәт|сен|сез|чен| ни|ә и|н м|илл|ять|ны |ылы|үзе| ки| эш| ту|алу|акы|ып |уга|ль |тан|н к|лу |бу |мас|рен|кә | тү| тә|түг|зен| җә|тын|ди |баш|кле|гән|ть | би|әре|штә|гын|әүл|ер |мил| ми|клы|гел|ыш |лер|ерл|әве|рдә|а я|р а| мә| рә|лем|хал| ан|ң т| аш|ык |ция|е х|стә|ә д|аль|рак|ек | де|рәв|тот|кән|улг|орг|веш|ешт|ни |итә|кка|м т|үге|шел|а и|ндә| да|рел|кер| кы|ерә|та |н я|еге|ый |а д|аци|р о|шла|тлә|әтл|н д|айл|ллә|ард|рда|кта|шкә| за|ге |ләш|ш б|әсе|кон|шыр|циа|нин|лау|уры|ры |оты|әне| тө|инд|нди| җи|оци|соц|лә |арт|якл|зак|тиг|рке| ди| со|ыкл|кем| ко|р и|ң б|әте|гыя|чар|үгә|ин |иле| сә| ил|мгы| ае|н а|аер|ыны|л һ",
    "tgk": "ар | ба| ҳа| да|ад | ва|он |ва | та|дар|ти | ин|ба | бо| ки|аро| до|ои |дор|ард|ки |бар|д ҳ|уқу| як|ин |ҳар|и о| на| ма|и м|ора| ҳу|як |ни |нсо|инс|и ҳ|аи |и б|сон|рад| му|ҳои|р я|ҳуқ|қуқ|ҳақ|ии |к и| ша|и д| аз|и и| оз|нд |яд |қ д|озо|аз |зод|анд|д б|ояд| ка|ият|она|да |амо|ақ |а б|ди | ё |гар|ат |дан|ҳам|оди|рда|моя| он|уда|қи | ху|бо |и т|дон|ст |нам|н ҳ|ода|и с|ан |н б|мил|и х|бош|они|оша|худ|ава|боя|аст|и а|ро | ме|а ҳ|имо|ила|оми|оба|ида|кар|н д|лат|д в|а ш|ҳо | ас|таҳ|рои|и н|д к|яти| ди|шад|ӣ в|ри |рдо|шав| ми|е к|роб|тар|та |кор| бе|о д|вад|мон|иҳо|ли |уд |оси|ошт|ми |р м|ати|т б| со|ӣ ё|нҳо|мин|шар|ара|таъ|ани|а в|иро|а д|дав|ят |даа| са|ама|дош|раф|шуд|лӣ |д а|оти|а м| фа|ист|ор |р ҳ|на |и к|р к|д т|и ҷ|и ш| эъ| су|н м|н в|и ӯ|фи |вар|диҳ|ига|зар| шу|ари|а т| иҷ| ақ| ҳи|асо|р б|т ҳ|а а|одо|мум|р в|а о| ӯ |рон|наз|диг| ни|бот| ҷа|авр| қа|яи |р д|уқи|лал|кас|шта|уна|еҷ |ино|тҳо|уни|або|сти| во|авл|и қ|вла|ун |у о|ӣ б| ҳе|дӣ |қу |чун|н и|сар|ояи|тав|маҳ|онҳ|қар|атҳ|тир|оҳ |ахс| қо|уқ |оли| ис|д д|и з| ко|аза|ори|фар|сос|ран|н к|р а|ҷти|ону|сӣ |ири|рра|рӣ |ҳеҷ| за|ид |ҳти|рии|ами|қон|уди|н н| од|иҷт|мия|ъло|лом|ию |наи|али|нда|оӣ |оят|янд| зи|оян|ӣ ҳ|и п|офи|киш|ҳим|рат|тим",
    "kir": " жа|на |ана|жан| би|уу |уку|га |бир| ук|ар |ен |луу|тар|кук|укт| ка| ад|ын |ада|ууг|дам| ме|уга|ык | ар|ене|мен|нен|ан |ары|олу| бо|ин |ам |ган|ир |бол| ал|ара|нда|н к|туу|р б|н ж| ба|анд| же|р а|кта|ына|ард|кту|эрк|үн |да |н б|н э| эр|нди|а т| ко|рды|н а|дык|рки|инд|а ж|кин|ала|а а|лар|аны|үү | өз|а к|тер|алу| та|а у|алы|а э|же |ук |ийи| ти|иш |тий| ма|гө |кыл|йиш|улу|нын|ке |н т|кар|бар|или|у м| кы|иги|рын|а б|үгө|рга|е а|ун |етт|дик| ту|дар|тта|баш|у а|н у| ээ|дын|им |рүү|гин|лык|ушу|нды|тур| са| эл| эм| мү|гон|лга|алд|икт|үүг| бе|ры |өз |нан|он | ан|кте|ул |дай|ерд|диг|р м|ери|үчү| не|атт|лды|еке|еги|үнө|лук|амд|у б|ынд|үнү|рди|тук|ка |кан|к ж| ки|м а|күн|не |ине|мда|рин|ого|кет| со|кам|дин|к м| эч| то|сыз|ылу|өзү| де|н м|ция|ээ |чүн|гиз|уп |нег|эч |руу|ыз |мес|эме| иш|лут|ы м|шка|ыкт|мам|ашк|лде| ке|лго| тү|ө ж|олг|ес |к т|кор|ге |бил|түү|угу|рал|алг|тын|кен| ул|лим|утт|ыгы|орг|н н|у ж|рде|нуу|тал|ч к|рго|мак| те| уш|уну|ктө|ди |акт|нүн| ди|зүн|иле| кө|кат|аци|мсы| эс|тык|е к|ей |тан|е э|ай |ер |соц|оци|циа|аты| жо|к к|амс|лан|а м|ири|ске|айд|ирд| мы|ылы|зги|ыны|ага|ген|е б|шул|тол|өнү|дыг|е ж|ү ү|з к|айы|раб|енд|абы|жал|ү ж|оо |уна|к а|кал|лек|ект|рма|дей| үч|тоо|мат|у э|бер",
    "mkd": " на|на | пр| и |во | се|то |ите|те |рав|та |а с|пра|ува|да | да| не|ва |а п|а н|и с|ата|о н|еко|а и| по|но |ој |кој| со| за| во|ств|ја |ње |ање|аво|ни | им|от |е п|е н|ма |ат |вањ|ост|а д|о с|е и|се |ова|ија|и п| сл|а о|има|сек|сло|ото|ли |о д|ава|обо|о и| ил|или| би|бод|и н|лоб| од|бид|ред|ен |при|вот|иде|а в|ста| об|и и|и д|пре|нос|ст |е с| ни| ќе|ове|аат|аци|ќе |со |ови|про|ј и|тво| ра|ест|што| де|т и|акв| ко|раз|гов|его|нег|ани|едн|ако|циј|бра|од |а з|е б|и о|а б|о п|ват| е | др|ето|ваа|как|ди |т с| ка| чо|ени|алн|одн|ено| си|чов| шт|а г|а е|вен|нит| ја|де |оди|е о|ран|и з|сно|нот| ед|тит|лно|ви |јат|ден|т н|нац| оп| до| ос|и в|осн|кон|дна|е д| ст|век|о о|род|сто|сит|еме|ара|дно|обр|ј н|пшт|еди|опш|за |ние|аро|нов|а к|вни|дру| ов|тве|жив|ште|д н|ие | ме|ед |иот|и м|о в|ќи |дат|шти|јќи|без|бед|ки |ков|ко |а р|нар|чно|дни| вр|ели|нак|ашт|ичн|ка |ема|цел|зем|еду|чув|тес|држ|ник|т п|луч|аа |деј|нст|не |а ч|руг|ода|ивн| це|нив|дин|авн| зе|нио|пор|а м|заш|лас|вит|дек|го |ине|ело|нет|ез |тен| ре| из|под|раб|або|бот|дув|нув| бе|ење|еде|он |њет|зов|иту|ван|н и|аѓа|е в|еѓу|рем|дел|о к|кот|им | жи|дос|вре|меѓ|олн|нап| го|емј|кри|уна|нем|оја| су|ита|азо|лит|тор|инс|ора|огл|ипа|пот|слу|кви",
    "khk": " эр|эрх| хү|ний|н б|эн |тэй|ийг|х э|эй | бо|хүн| бү|йн |ан |ах | ба|ийн|бол|ий | ха|бай|уул|рх |оло|й х|йг |гаа|эх |бүр|гүй|үн | бу|он |аар|рхт|үнд|хтэ|үр |лэх|ар | за|н х|лах|эр | хэ|й б|өлө|н э|лөө|эл | үн|аа | ул|ын |хий|үй | ор| ту|улс|ула|үлэ| чө|чөл|н т|үүл| ху|сэн| ни|ндэ|лон|гээ|р х|өөр|сан| нэ|ны | ёс|нь |эд | гэ| нь| ч | тө| тэ|лаг|оро|дэс|лс |г х|ох |үни|ээр|хам|х ё| ша|д х|р э|лго|лд | дэ|н а|бую|уюу|гуу|төр|ай |юу |тай|ээ |ж б|эг |лий|хан|ыг | эд| то|х б|дсэ|й э|рга| ал|хар|арг|ад |лга|рэг| зо|айг|ага| тү|л х|ал | хө|өөт| са|н н|йгэ|дэл|нд |гий|н з|ол |ава|лла| өө|рол|өтэ|гэр|г б|л б|бус|нэг|н д|аг |аал|н ү|алд|рла| үз|гэм|й а|н у| ол|хуу|х ч|эрэ|мга|олг|эс |хүү|той| ар|үү |лал| эн| мө|йх |ин |өрө|х т|луу|рий|сон| га|хэн|айх|эни| ам|гла|өр |аса|ана|амг| би|ард| ял|йгм|ой |лын|үрэ|эгт| ав|эдэ|оо |мий|х н|аан|үйл|арл|нха|тгэ|дээ|с о|рхи|лов|д н|тэг|өг |өн |хэр|лэн|өөг|үүн|вср|га |р т| хи|хүр|рон|ч б| хо|гөө| мэ|бие|н г|ура|бүх|ори|али| аж| үй| яв|өх |хээ|г н|ата| та|гш |г ү|эгш|вах|лох|эгд|длэ|х ү|гох|үх |энэ|лж |олц| шү|л т| да|дал|эж |д б|лан|й т|айл|л н|х а|агл|тоо| со|өри|йгу|гми|дил|ээн|дар|н ш|шүү|овс| ад|а х|р ч|ади|ааг|лаа|айд|амь|гтэ|н с|д т|ийт|лэл|х ш|н ч|унх"
  },
  "Arabic": {
    "arb": " ال|ية | في|الح|في | وا|وال| أو|ة ا|أو |الم|الت|لحق|حق |لى |كل |ان |ة و|الأ| لك|لكل|ن ا|ها |ق ف|ات |مة |ون |أن |ما |اء |ته |و ا|الع|ي ا|شخص|ي أ| أن|الإ|م ا|حري| عل|ة ل|من |الا|حقو|على|قوق|ت ا|أي |رد | شخ| لل| أي|ق ا|لا |فرد|رية| ول| من|د ا| كا| إل|خص |وق |ا ا|ة أ|ا ي|ل ف|ه ا|نسا|جتم|ن ي|امة|كان|دة | حق|ام |الق|ة م| فر|اية|سان|ل ش|ين |ن ت|إنس|ا ل| لا|ذا |هذا|ن أ|لة |ي ح| دو|ه ل|لك |ترا|لتع|اً |له |إلى| عن|ى ا|ه و|ع ا|ماع|د أ|اسي| حر|ة ع|مع |الد|نون| با|لحر|لعا|ن و|، و|يات|ي ت|الج| هذ|ير |بال|دول|لإن|عية|الف|ص ا| وي|الو|لأس| إن|أسا|ساس|ماي|حما|رام|سية|انو|مل |ي و|عام|ا و|تما| مت|ة ت|علي|ع ب|ك ا| له|ة ف|قان|ى أ|ول |هم |الب|ة ب|ساو|لقا|الر|لجم|ا ك|تمت|ليه|لتم|لمت|انت| قد|اد |ه أ| يج|ريا|ق و|ل ا|ا ب|ال |يه |اعي|لدو|ل و|لإع|لمي|لمج|لأم|تع |دم |تسا|عمل|اته|لاد|رة |اة |غير|قدم|وز |جوز|يجو|عال|لان|متع|مان|فيه|اجت|م و|يد |تعل|ن ل|ر ا| يع| كل|مم |مجت|تمع|دون| مع|تمي|ذلك|كرا|يها| مس|ميع|إعل|علا| تم| عا|ملا|اعا|لاج|ني |ليم|متس|ييز|يم |اعت|الش| تع|ميي|عن |تنا| بح|لما|ي ي|يز |ود |أمم|لات|أسر|شتر|تي | جم|ه ع|ر و|ي إ|تحد|حدة| أس|عة |ي م|ة، |معي|ن م|لمس|م ب|اق |جمي|لي |مية|الض|الس|لضم|ضما|لفر| وس|لحم|امل|ق م|را |ا ح|نت | تن|يته| أم|إلي|واج|د و|لتي| مر|مرا|متح| ذل| وأ| تح|ا ف| به| وم| بم|وية|ولي|لزو",
    "urd": "ور | او|اور| کی|کے | کے|یں | کا|کی | حق|ے ک|ایٔ|کا |یٔے| کو|یا |سے |نے | اس|ٔے | ہے|کو |میں| می|ے ا| ان|وں | کر|اس | ہو|ی ا|ر ا|شخص| شخ|حق | سے| جا|ہر |خص |ام |ے م|ہیں| یا|ں ک|سی |ادی| آز|آزا|زاد|ہ ا|ص ک|ا ح|جای|ہے |ر ش|ت ک|کہ |م ک| پر|ان |ی ک|یٔی|دی |پر |۔ہر|س ک|ا ج|ہے۔|ق ہ|ر م|و ا|ں ا|ی ح|ار |ن ک|ری |قوق|حقو|کسی|وق |ی ج| مع|ے گ| ہی|نی |ٔی |کرن| نہ| لی|ی ت|سان| حا|تی | مل| جو|جو |انس|ل ک|اپن|نسا| کہ| اپ|یت |ا ا| کس|ہ ک|نہ |ے ب|ر ک| ای|ے ہ|۔ ا|می |رنے|ل ہ|ی ش|ے ل|رے |حاص|وہ |معا|ی م|یں۔|اصل|نہی|صل |ویٔ|ملک|ایس| تع|کیا|انہ|ی ہ|ی ب|د ک|ق ک|ات |ا م| بن|قوم| من| قو|دہ |مل |اشر|یہ |ر ہ|عاش|ے ج|ں م| دو|انی|دار| عا| و |لیٔ|ی س|وام|علا|قوا|اقو| وہ|ر ب|بر |و ت| قا| دی|ہ م|انو|لیم|اد | یہ|ے۔ہ| جس|یوں|گی |ے، |ر ن|ے ح|نیا|جس | اق|ریق|دوس|لک |ا ہ|تعل|یم |ے۔ | گی|ر پ|، ا|ی، |م ا|انے|گا۔|پنے|وری| مس|ر ع|یر |ر ح|ی آ|ین |ن ا|یاد| با|ی ن|ون |کر | بر|علی|لاق| رک|ے پ|س م|قان|نون|ہ و| شا|ہوگ|اری|ق ح| مم| پو|ا پ| بی| پی|سب |رتی| چا| بھ| اع| ہر|ر س|دگی|یسے|ومی|ندگ| مر|ے خ|وسر|نا |رای| گا|خلا|رکھ|تما| طر|مام|پور|ے ع|یٔد| عل|بھی|ھی | مت|عام| مق|ونک|من |نکہ| ام|اف |ہوں|ریع|ذری|م م|اں | ذر|کوی|بنی|و ک|ں، |ادا|دان|ے ی|ا ک| مح|، م|ت ا|ال |د ا|پنی|ے س|غیر|ر آ|دیو|ہو |ں۔ |اعل| سا|اسے|ی پ|رہ |لان|د ہ| خل|شرے|ب ک",
    "skr": "تے |اں | تے|دے |دی |وں | دا| حق| کو|ے ا|کوں| دے|دا | دی|یاں| کی|ے ۔|یں |ہر | ۔ |کیت|ہے | وچ| ہے|وچ | ان| شخ|شخص|ادی|ال | حا|اصل|حق |حاص|ے م|خص |صل |ں د| نا|یا | ای|اتے|ق ح|ل ہ|ے و|ں ک| ات|ہیں|سی | مل|نال|زاد|ازا|ی ت| از|قوق|ار |ا ح|حقو| او|ص ک| ۔ہ|۔ہر|ر ش|دیا|ے ج|وق |ندے| کر|یند| یا|نہ | جو|کہی|ئے |ی د|سان|نسا|وند|ی ا|یتے|انس|ا ا|ملک|ے ح|و ڄ|ے ک|ڻ د| وی|یسی|ے ب|ا و| ہو|ں ا|ئی |ندی|تی |آپڻ|وڻ |ر ک|ن ۔| نہ|انہ|جو | کن| آپ| جی|اون|ویس|ی ن| تھ| کہ|ان |ری |ڻے | ڄئ| ہر|ے ن|دہ |ام |ں م|ے ہ|تھی|ں و|۔ ا|ں ت|ی ۔|کنو|ی ح|ی ک|نوں|رے |ہاں| بچ|ون |ے ت|کو | من|ی ہ|اری|ور |نہا|ہکو|یتا|نی |یاد|ت د|ن د| ون|وام|ی م|قوا|تا |ڄئے|پڻے| ہک|می | قو|ق ت|ے د|لے |اف |ل ک|ل ت| تع|چ ا|ین |خلا|اے |علا| سا|جیا|ئو |کرڻ|ی و|انی|ہو |دار| و |ی ج| اق|ن ا|یت |ارے|ے س|لک |ق د|ہوو| ڋو|ر ت| اے|ے خ| چا| خل|لاف|قنو|نون|پور|ڻ ک| پو|ایہ|بچئ|چئو|ات |الا|ونڄ|وری|این| وس| لو|و ا|ہ د| رک|یب |سیب|وسی|یر |ا ک|قوم|ریا|ں آ| جا|رکھ|مل |کاں|رڻ |اد |او |عزت| قن|ب د|وئی|ے ع| عز| ۔ک| مع|اقو|ایں|م م|زت |ڻی |یوڻ|ر ہ| سم|ں س|لوک| جھ| سی|جھی|ت ت|ل ا|اوڻ|کوئ|ں ج|ہی |حدہ|تعل|ے ذ|وے |تحد|متح|لا |ا ت|کار| اع|ے ر| مت|ر ا|ا م|ھین|ھیو|یہو| مط| سڱ|ی س|ڄے |نڄے|سڱد|لیم|علی|ے ق| ذر|م ت| کھ|ن ک| کم|ہ ا|سار|ائد|ائی|د ا| ہن|ہن |ی، |و ک|ں ب|ھیا|ذری|ں پ|لی ",
    "pes": " و | حق| با|که |ند | که| در|در |رد | دا|دار|از | از|هر | هر|یت |ر ک|حق |د ه|ای |د و|ان | را|ین |ود |یا | یا|را |ارد|ی و|کس | کس| بر| آز|باش|ه ب|آزا|د ک| خو|ه ا|د ب|زاد| اس|ار | آن|ق د|شد |حقو|قوق|ی ب|وق |ده |ه د|ید |ی ک|و ا|ور |ر م|رای|اشد|خود|ادی|تما|ری | اج|ام |دی |اید|س ح|است|ر ا|و م| ان|د ا|نه | بی|با | هم| نم|مای| تا|د، |ی ا|انه|ات |ون |ایت|ا ب|ست | کن|برا|انو| بش| مو|این| مر|اسا| مل|وان|ر ب|جتم| شو| اع|ن ا|ورد| می| ای|آن | به|و آ|ملل|ا م|ماع|نی |ت ا|، ا|ت و|ئی |عی |ائی|اجت|و ب|های|ن م|ی ی|بشر|کند|شود| من| زن|ن و|ی، |بای|ی ر| مس|مل |مور|ز آ|توا|دان|اری|علا|گرد|یگر|کار| گر| بد|ن ب|ت ب|ت م|ی م| مق|د آ|شور|یه |اعی| عم|ر خ|ن ح| کش|رند|مین| اح|ن ت|ی د| مت|ه م|د ش| حم|و د|دیگ|لام|کشو|هٔ |ه و|انی|لی |ت ک| مج|ق م|میت| کا| شد|اه |نون| آم|اد |ادا|اعل|د م|ق و|ا ک|می |ی ح|لل |نجا| مح|ساس|یده| قا|بعی|قان|ر ش|مقا|ا د|هد |وی |نوا|گی |ساو|ر ت|بر |اً |نمی|اسی|اده|او | او| دی| هی|هیچ|ه‌ا|‌ها|یر |خوا|د ت|همه|ا ه|تی |حما|دگی|بین|ع ا|سان|ر و|شده|ومی| عق| بع|ز ح|شر |مند| شر|ٔمی|أم|تأ|انت|اند|اوی|مسا|ردد|بهر| بم|ارن|یتو|ل م|ران|و ه|ر د|م م|رار|عقی|سی |و ت|زش | بو|ا ا|ی ن|موم|جا |عمو|رفت|عیت| فر|ندگ|واه|زند|م و|نما|ه ح|ا ر|دیه|جام|مرد|ت، |د ر|مام| تم|ملی|نند|الم|طور|ی ت|تخا|ا ت|امی|امل|دد | شخ|شخص"
  },
  "Devanagari": {
    "hin": "के |प्र|और | और| के|ों | का|कार| प्|का | को|या |ं क|ति |ार |को | है|िका|ने |है |्रत|धिक| अध|अधि|की |ा क| कि| की| सम|ें |व्य|्ति|क्त|से | व्|ा अ|्यक|में|मान|ि क| स्| मे|सी |न्त| हो|े क|ता |यक्|क्ष|ै ।|िक |त्य| कर|्य | या|भी | वि|रत्|र स|ी स| जा|स्व|रों|्ये|ेक |येक|त्र|िया|ा ज|क व|र ह|ित |्रा|किस| अन|ा स|िसी|ा ह|ना | से| पर|र क| सा|देश|गा | । | अप|्त्|े स|समा|ान |ी क|्त |वार| ।प|ा प| रा|षा |न क|।प्|ष्ट|था |अन्| मा|्षा|्वा|ारो|तन्|वतन|ट्र|्वत|प्त|ाप्|्ट्|राष|ाष्| इस|े अ| उस| सं|राप|कि |त ह|हो |ं औ|ार्|ा ।|किय|े प| दे| भी|करन|री |जाए|ी प| न |र अ|क स|अपन|े व|ाओं|्तर|ओं | नि|सभी|रा | तथ|तथा|िवा|यों|पर | ऐस|रता|ारा|्री|सम्| द्|ीय |िए |व क|सके|द्व|होग| सभ|ं म|माज|रने|िक्|्या|ा व|र प| जि|ो स|र उ|रक्|े म|पूर| लि|ाएग| भा|इस |त क|ाव |स्थ|पने|ा औ|द्ध|श्य|र्व| घो|घोष|रूप|भाव|ाने|कृत|ो प|े ल|लिए|शिक|ूर्| उन|। इ|ं स|य क|्ध |दी |ी र|र्य|णा |एगा|न्य|रीय|ेश |रति|े ब| रू|ूप |परा|्र |तर्| पा| सु|जिस|तिक|सार|जो |ेशो| शि|ानव|ी अ|चित|े औ| पू|ियो|ा उ|म क|ी भ|शों| बु|म्म|स्त|िश्|्रो|्म |ो क| यह|र द|नव |चार|दिय|े य|र्ण|राध|ोगा|ले |नून|ानू|ोषण|षणा|विश| जन|ारी|परि|गी |वाह|साम|ाना|रका| जो|ाज |ी ज|ध क|बन्|ताओ|ंकि|ूंक|ास |कर |चूं|ी व|य ह|ा ग|य स|न स|त र|कोई|ुक्|ोई | ।क|ं न|हित|निय|याद|ादी|्मा|्था|ामा|ाह |ी म|े ज",
    "mar": "्या|या |त्य|याच|चा | व |ण्य|प्र|कार|ाचा| प्|धिक|िका| अध|अधि|च्य|ार |आहे| आह|ा अ|हे | स्|्रत|्ये|ा क|स्व| कर|्वा|ता |ास |ा स|ा व|त्र| त्|वा |ांच|यां|िक |मान| या|्य | का| अस|रत्|ष्ट|र्य|येक|ल्य|र आ|ाहि|क्ष| को|ामा|कोण| सं|ाच्|ात |ा न| रा|ंत्|ून |ेका| सा|राष|ाष्|चे |्ट्|ट्र|तंत| मा|ने |किं| कि|व्य|वात|े स|करण|ंवा|िंव|ये |क्त| सम|ा प|ना | मि|कास|ातं|्र्|र्व|समा|मिळ| जा|े प|व स|यास|ोणत|रण्|काम|ीय |ा आ| दे|े क|ांन|हि |रां| व्|्यक|ा म|िळण|ही | पा|्षण|ार्|ान |े अ| आप| वि|ळण्|ाही|ची |े व|्रा|मा |ली |ंच्|ारा|ा द| आण| नि|णे |द्ध| नय|ला |ा ह|नये| सर|सर्|्री|बंध|ी प|आपल|ले |ील |माज| हो|्त |त क|ाचे|्व |षण |ंना|लेल|ी अ|देश|आणि|णि |ध्य| शि|ी स|े ज|शिक|रीय|ानव|पाह|हिज|िजे|जे |क स|यक्|न क|व त|ा ज|यात|पल्|न्य|वी |स्थ|ज्य| ज्|े आ|रक्|त स|िक्|ंबं|संब| के|क व|केल|असल|य अ|य क|त व|ीत |णत्|त्व|ाने| उप|्वत|भाव|े त|करत|याह|रता|िष्|व म|कां|साम|रति|सार|ंचा|र व|क आ|याय|ासा|साठ|ाठी|्ती|ठी |ेण्|र्थ|ीने|े य|जाह|ोणा|संर|ायद|च्छ|स स|ंरक|तील|ी व|त आ|ी आ|ंधा|ेशा|ित | अश|हीर| हक|हक्|क्क|य व|शा |व आ|तीन|ण म|ूर्|ेल्|द्य|ेले|ांत|ा य|ा ब|ी म|ंचे|याव|देण|कृत|ारण|ेत |िवा|वस्|स्त|ाची|नवी| अर|थवा|अथव|ा त| अथ|अर्|ती |पूर|इतर|र्ण|ी क|यत्| इत| शा|रका|तिष|ण स|तिक|्रक|्ध |रणा| आल|ेल |ाजि| न्|धात|रून|श्र|असे|ष्ठ|ुक्|ेश |तो |जिक|े म",
    "mai": "ाक | आ |प्र|कार|िका|धिक|ार |्रत|ेँ |क अ|्यक|िक |्ति| अध|व्य|अधि|क स| प्|क्त| व्|केँ|यक्|तिक|न्त| स्|हि |क व|मे |बाक|मान| सम|त्य|क्ष| छै|छैक|ेक |स्व|त्र|रत्|्ये|ष्ट| अप|येक|र छ|सँ |वा | एह|ैक।|ित | वि| जा|ति |्त्|ट्र|िके|राष|ाष्| हो|्ट्| रा|्य | सा| अन| कर|अपन|।प्|कोन|अछि|वतन|्वत|तन्|क आ| अछ|ताक|था | पर| वा| को|ार्|एहि|पन |ा आ|नहि|नो |समा| मा|्री|रता| नि| का|देश| नह|्षा|क प| दे| कए|रक | सं|ोनो|ि क|न्य|आ स|छि |्त |ल ज|्वा|ारक|ा स|तथा|ान्| तथ|्या|आ अ|ना |ँ क|ान | जे|जाए|वार|ता |ीय |र आ|क ह|करब|िवा|ामा|र्व| आओ|्रस|परि|त क|स्थ|ा प|ानव|रीय|धार|्तर|अन्|घोष|साम|माज|आओर|ारण| एक|कएल|ँ अ|ओर |एबा|स्त|द्ध|्रा|ँ स|रण | सभ|ोषण|क।प|ाहि|रबा|क ज|ा अ|चित|यक |कर |पूर|रक्|नक | घो|षा |िक्|सम्|एहन| उप|र प| अव|एल |ूर्|षणा| हे|त अ|शिक|तु |ाधि|ेतु|हेत|हन |िमे|र अ|वक |ँ ए|जाह| शि|आ प|भाव|े स|्ध |क क|ि ज|प्त|रूप|निर|िर्| सक|च्छ|होए|रति|अनु|सभ |हो |ेल |त आ|चार|ण स|रा |त ह|जिक|ाजि|र्ण|्रक|एत।|ि आ|र्य|सभक|ैक |क उ| जन|त स|ाप्|न प|श्य|न अ|कृत|हु |रसं|री |राप|ा व|जे |क ब|ि घ| भा|उद्|ाएत|्ण |विव| उद|वाध|िसँ|आ व|ि स|न व|ारा|ोएत| ओ |य आ|कान|िश्|न क| दो|णाक| द्|हिम| अथ|अथव|ामे|द्व|ेश |ओ व|ि अ|क ए|वास| पू|षाक|त्त|य प| बी|यता|धक |ए स|थवा|ि द|पर | भे|जेँ| कि|कि |क ल| रू|विश|न स| ले|सार|ाके|िष्|रिव|क र|ास |ेओ |्थि|केओ|राज",
    "bho": " के|के |ार |े क|य्व|कार|िका|धिक|ओर | आओ|आओर|अधि| अध|े स|ा क|वे |े अ| सं| हो|में|ें | मे|िक |र स| कर|्रा|्वे|र ह|ा स|र क| से| सम|मान|रा |न क|से |े ब|क्ष|नो | चा|ता |ष्ट| रा|चाह|्टघ|प्र| का|ाष्| सा|राष|टघ्|े आ| प्| सक| मा| स्| य्|ि क|ति |ोय्|त क|ौनो|कौन| जा|्वा|पन | बा|होय|करे|था | कौ|िर | आप|ला |तथा|्त |ेला|आपन| ओक|रे |ाति|कर | हव|हवे| तथ|सबह|र आ|ही |जा | और| ह।|वे।|े ओ|हे |त्र|र म|ना |तिर|बहि|सके|केल| पर|वात|ान |।सब|े म|े च|ा आ|न स|ावे|र ब| लो|ाहे|षा |ओकर|ी क|्षा|माज|ल ज| सब|संग|े ज|्वत|घ् |ं क|ित |मिल|े ह|हिं|िं |रक्|ंत्|स्व|ाज |ा प|और | जे|ो स|कान|करा|क्त|क स|लोग|्ीय|घ्ी|े। |समा|हु |नइय|इय्|ला।| नइ|ानव|िया|े व|वतं|तंत|ी स|े न|स्थ| ओ |े उ|नून|ानू|ाही|ाम |पर |्वल|साम|व्य|्य |ून |े त|या |वल |केह| आद| सु|े य| दे|ीय |र अ| वि|। स|भे |सभे|प्त|दी |बा।|ा म|ा।स|योग| मि| नि|े द|चार| या| इ |हि |ल ह|् क|ले |री |ाधि|र न|ा ह|र प| पा| ही|ादी| बि|राप|ाप्|नवा|ए क|ु क|यता|आदि| दो|तिक|ेहु|दिम|ोग |मी |पूर|े भ|्या|ाजि|म क|ि म| जर|िमी|े प|्तर| अप| उप|जे |जाद|ेकर| सभ|देश|ुक्|क आ| सह|षण |ाव |जिक|शिक|िक्|न ह|ंगठ|गठन|ठन | अं|े ल|सब |पयो|उपय| शा|र व|दोस|न म| व्|ास |।के| शि|न आ|िल |ज क| आज|य क|आजा| ले| जी|ेश |ी ब| पू|रो | भी|्म |ा। |साथ| घो|घोष|ने |वाध|े र| उच|निय|चित|बा |ामा|रात|संर|ाता|्षण|ंरक|हो |होए|ेल ",
    "nep": "को | र |कार|प्र|ार |ने |िका|क्त|धिक|्यक| गर|व्य|्रत| प्|अधि|्ति| अध| व्|यक्|मा |िक |त्य|ाई |लाई|न्त|मान| सम|त्र|गर्|र्न|क व| वा|्ने|वा | स्|रत्|र स|्ये|तिल|येक|ेक |छ ।|ो स|ा स|हरू| वि|क्ष|्त्|िला| । |स्व|हुन|ति | हु|ले | रा| मा|ष्ट|समा|वतन|तन्| छ |र छ| सं|्ट्|ट्र|ाष्|ो अ|राष|्वत|ुने|नेछ|हरु|ान |ता |े अ|्र | का|िने|ाको|गरि|े छ|ना | अन| नि|रता|नै | सा|ित |तिक|क स|र र|रू |ा अ|था |स्त|कुन|ा र|ुनै| छै|्त |छैन|ा प|ार्|वार|ा व| पर|तथा| तथ|का |्या|एको|रु |्षा|माज|रक्|परि|द्ध|। प| ला|सको|ामा| यस|ाहर|ेछ |धार|्रा|ो प|नि |देश|भाव|िवा|्य |र ह|र व|र म|सबै|न अ|े र|न स|रको|अन्|ताक|ंरक|संर|्वा| त्|सम्|री |ो व|ा भ|रहर| कु|्रि|त र|रिन|श्य|पनि|ै व|यस्|ारा|ानव| शि|ा त|लाग|रा |शिक| सब|ाउन|िक्|्न |ारक|ा न|रिय|्यस|द्व|रति|चार| सह|्षण| सु|ारम|ुक्|ुद्|साम|षा |ैन | अप| भए|बाट|ुन | उप|ान्|ो आ|्तर|िय |कान|ि र|रूक|द्द|र प|ाव |ो ल|तो | पन|ैन।| आव|ा ग|।प्|बै |ूर्|िएक|र त|निज|त्प| भे|जिक|ेछ।|िको|्तो|वाह|त स|ाट | अर|ाजि|्ध | उस|रमा|ात्|र्य|नको|ाय |जको|ित्|ागि| अभ|न ग|गि |ा म| आध|स्थ| पा|ारह|घोष|त्व|यता|ा क|र्द| मत|विध| सक|सार|परा|युक|राध| घो|णको|अपर|े स|ारी|।कु| दि| जन|भेद|रिव|उसक|क र|र अ|ि स|ानु|ो ह|रुद| छ।|ूको|रका|नमा| भन|र्म|हित|पूर|न्य|क अ|ा ब|ो भ|राज|अनु|ोषण|षणा|य र| मन| बि|्धा| दे|निर|ताह|र उ|यस |उने|रण |विक",
    "mag": "के | के|ार | हई|कार|िका|धिक|हई।|े अ| और|और | अध|अधि|ा क|े स|र ह|े क|सब |ें |में| मे| कर|्रा|था | सम|से |तथा| से| हो|िक | तथ|र क|र स| सब| सं|क्ष|मान|प्र|ना | सा|ा स|ब क|कर |रा | भी|ति | प्|ई। |भी | अप|त क| का|अपन|या |क ह| को|ट्र|पन | मा| रा| पर| या|ता | स्|ी क|ष्ट|ान |य्व|्त |करे|ही | ओक|्ट्| सक|ओकर|न क|त्र|।सब|राष|ाष्|हई |रे |ेल |े ब| जा|ई।स| ही|े म|रक्| ले|ंत्|सक |नो |ाम |दी |ा प|होए|व्य|र म|क्त|स्व| ना|तंत|पर |माज|र औ|षा |े उ|्य |ित |ोग |ी स|्वत|वतं| शा|ानव|ादी| इ |ल ज|े भ|वे |ा म|ावे|न स|्ति| दे|करा| एक|्षा|लेल|कान|े ल|म क| वि|प्त|साथ|ाथ |ला |र अ|ई।क|्र |क स|य क|नून|ानू|ेकर|्वा|े ह|ोए |ा ह| जे|कोई|वार| य्|राप|जा |ोई |े प|ून |। स|बे |ाप्| चा|रो |ि क|साम|समा| व्|मिल|े य|चाह|रात|कोन|योग|र प|ोनो|र व|े व|स्त|काम|ए क|एल |ाता|्म | पा|नवा|ाधि|ो स|े ओ| दो|व क| नि| सु|्रत|चार|संर|ल ह|पूर| सह|े च|ो क|एक |ाजि|्यक|ास | उप|।के|ं स|न ह|सम्|ंरक|ई क|्तर|ुक्|ीय |ामा|जिक|होब|परि|े आ|षण |तिक|न औ| लो|ा द|स्थ| घो|घोष|्मा|म्म| उच|वाध|री |ा त|केक|र आ|ा औ|ा ब|दोस|निय|ाही|न प| आद|मी |ब अ|देश|ेश |य स|े त|यक्|रीय|ाति|रति|्री|वा |रिव|पयो|उपय|कि |ि म|ी ह|म स|भाव|ढ़ा|बढ़|शिक|िक्| बढ|ौनो|त र|ो भ|व ह|ाव |ग क|न द|युक|ंयु| भा|ारा|संय| कए|कएल|र्म|दमी|करो|कौन|वन |आदम|िया|ोसर| आज|इ स|आजा|लोग|जाद|उचि|चित|े न|त स|ाज "
  },
  "Ethiopic": {
    "amh": "፡መብ|ሰው፡|ት፡አ|ብት፡|መብት|፡ሰው|፡አለ|፡ወይ|ወይም|ይም፡|ነት፡|ንዱ፡|አለው|ለው።|ዳንዱ|ያንዳ|ንዳን|እያን|ዱ፡ሰ|ት፡መ|፡እን|፡የመ|።እያ|እንዲ|፡ነጻ|፡የተ|ም፡በ|ው፡የ|ም፡የ|፡የሚ|ና፡በ|ን፡የ|፡የማ|፡አይ|ነጻነ|ና፡የ|ው፡በ|ቶች፡|ው።፡|ሆነ፡|ት፡የ|፡በሚ|፡መን|ው።እ|ትና፡|ኀብረ|ትን፡|ውም፡|ንኛው|እኩል|ብቻ፡|ኛውም|ንም፡|፡ለመ|፡ያለ|ም፡ሰ|ማንኛ|መብቶ|፡አገ|ት፡በ|ራዊ፡|፡እኩ|፡ለማ|ለት፡|በት፡|ሆን፡|መንግ|፡በተ|ረት፡|ብቶች|ጋብቻ|ዎች፡|ህንነ|ጻነት|ም፡እ|ወንጀ|፡ልዩ|ሰብ፡|ማንም|ጠበቅ|ኩል፡|ደህን|።ማን|ነጻ፡|ግኘት|ማግኘ|።፡እ|፡የሆ|፡ሁሉ|ች፡በ|፡በመ|ሥራ፡|፡ደህ|ፈጸም|ል፡መ|ተግባ|፡ድር|ት፡ወ|ው።ማ|ፍርድ|ርድ፡|፡በሆ|ር፡ወ|በትም|ትም፡|ይነት|ቸው፡|ብ፡የ|ነትና|ቱን፡|ሕግ፡|ንና፡|፡ሥራ|የማግ|፡መሠ|ኘት፡|፡ጊዜ|ጻነቶ|ነቶች|በር፡|በኀብ|ዩነት|ልዩነ|፡በኀ|፡ዓይ|ዓይነ|ችና፡|ግባር|ባር፡|፡ደረ|ነው።|፡ነው|ደረጃ|ም።እ|ም፡መ|፡ወን|ይማኖ|ማኀበ|ሃይማ|፡ኑሮ|መሠረ|ሁሉ፡|ነቱ፡|ሌሎች|ንግሥ|በቅ፡|የሆነ|፡ይህ|ንዲጠ|ገር፡|ተባበ|ትክክ|ጸም፡|ር፡የ|ዲጠበ|ትም።|ው፡ከ|፡እያ|ሩት፡|ድርጅ|፡ብቻ|ና፡ለ|ይገባ|የመኖ|፡ማን|ንነት|ቤተሰ|ርጅት|ት፡ድ|፡መሰ|እንደ|፡አላ|ብሔራ|ት፡ለ|ሔራዊ|ርት፡|ህርት|ውን፡|የሚያ|ል።እ|ሆኑ፡|ምህር|ትምህ|በት።|ለበት|አለበ|፡አስ|ሎች፡|ች፡የ|፡በሕ|ብረ፡|፡ከሚ|ን፡አ|ት፡እ|ን፡ወ|ረግ፡|በሆነ|የኀብ|፡የኀ|መሆን|፡መሆ|ን፡መ|፡ውሳ|ንጀል|ፈላጊ|ህም፡|ረታዊ|ክለኛ|ክክለ|ታዊ፡|ጀል፡|ኑሮ፡|።፡ይ|ዓዊ፡|ዜግነ|ንዲሁ|ዲሁም|፡ማኀ|ገሩ፡|ር፡በ|ብዓዊ|አገሩ|ሁም፡|ና፡ነ|ሰብዓ|የተባ|ጅት፡|ማኖት|ር፡አ|ንግስ|ኖት፡|በሕግ|መኖር|ው፡ያ|መጠበ|ረጃ፡|፡በማ|ነትን|ብነት|ገብነ|፡ገብ|መፈጸ|፡ሁኔ|ሁኔታ|ን፡ለ|ው፡ለ|፡ተግ|፡የአ|፡ይገ|፡በአ|ችን፡|፡ትም|ነቱን|፡ቢሆ|ቢሆን|ጊዜ፡|ረ፡ሰ|ት፡ጊ|ሰቡ፡|ምበት|ላቸው|አላቸ|በነጻ|፡በነ|አንድ|ቅ፡መ|፡መጠ|ት፡ይ|መሰረ|ጥ፡የ|ስጥ፡|ፈጸመ|ውስጥ|ንድ፡|፡ውስ|፡በግ|፡ሆኖ|ሉ፡በ|፡ጋብ|ንስ፡|ንነቱ|መው፡|የሚፈ|አይፈ|ብረሰ|ነ፡መ|፡የሃ|ም፡ከ|ች፡እ|ስት፡|ሙሉ፡|አገር|ሆኖ፡|ደረግ|ኢንተ|ንተር|ተርና|ርናሽ|ናሽና|ሽናል",
    "tir": " መሰ| ሰብ|ሰብ | ኦለ|ትን |ኦለዎ|ናይ | ናይ| ኦብ|ዎ፡፡|ለዎ፡|ሕድሕ|ኦብ |ድሕድ|ሕድ |መሰል|ውን |ሰል |ድ ሰ|ይ ም|ል ኦ|ካብ |፡ሕድ|፡፡ሕ| ወይ|ወይ | መን| ነፃ|ን መ|ዝኾነ|፡፡ |ታት |ብ ዝ|ነት |ን ነ| ካብ|መሰላ|ነፃነ| እዚ|ብ መ|ኦዊ |ታትን|መንግ|ዊ መ| እን|ብ ብ|ንግስ|ት ኦ|ሰላት|ን ም|ኾነ |እዚ |ብኦዊ|ሰብኦ|ን ኦ|ን፡፡| ንክ| ዝኾ|ን ን| ምር|ኹን |ይኹን| ይኹ|ምርካ|ርካብ| ኦይ| ሃገ|ሕጊ |ራት |ሎም | ብሕ|ነ ይ| ከም|ማዕሪ|ይ ብ| ንም| ዝተ|ርን |ን ብ|ራዊ | ፣ |ብ ሕ|ላትን|ብ ኦ|ማሕበ|ነታት| ኦድ|ዕሪ | ማዕ|ስታት|ግስታ|’ውን|ት መ|ን ዝ|ታዊ |፣ ብ| ማሕ|ነትን|ንጋገ|ድንጋ| ስለ| ድን|ስራሕ|ኩሎም|ሕበራ|ኦት |ን ሰ|ዓለም|ፃነታ| ብም|ት ወ|መሰሪ| ስራ|ፃነት|ተሰብ|ካልኦ|ልኦት|ን ሓ|ዓት |ዋን |ቡራት|ሕቡራ| ሕቡ|ብሕጊ|ድብ |ውድብ| ውድ|ብን |ትምህ|ነቱ |ዚ ድ|፣ ኦ|ሃገራ| ኩሎ|ለዎም|ምህር|ም፡፡|ም መ| ብዝ|ምኡ’|ኡ’ው|እንት| ዓለ| ብዘ|በራዊ| ሓለ|ሓለዋ|ዎም፡|ቱ ን|ት ብ|ጋገ |ነፃ | ምዃ|ን ዘ| ገበ|ት፣ | ትም|ኸውን|ራሕ | ዘይ|ህርቲ|ርቲ |ከምኡ|ሃይማ| ምስ|ነ፣ |እንተ| ስር|ስርዓ|ርዓት|ባት |ይማኖ|ሰሪታ|ን ና| ክብ|ልን | ብማ|ገሩ | ህዝ|ላት |ት ና|ይ ኦ|ዕሊ |ለዝኾ|ስለዝ|ሪተሰ|ብሪተ|ሕብሪ| ሕብ|ን ተ|ኾነ፣|በን |ሃገሩ|ገ እ|ኻዊ | ሃይ|እን |ሪጋገ| ምሕ|ን እ|ለኻዊ|ር፣ | ብሓ| ብሃ| ክኸ|ክኸው|ብ ዘ|ዃኑ |ዊ ክ|ምን |ሓደ |ምዃኑ|ም ን|ት እ|ዊ ወ|ታውን| ሕድ|ብዘይ| ሕጊ|ት ን| ልዕ| ካል|ን ካ|ሰባት|ን ስ|ናን |ቤተሰ|ሕን |ለምለ|ት ስ|ምለኻ|፣ ከ|ተደን|ባል |ኦድላ|እዋን| እዋ|ደቂ | ደቂ| ሰባ|ፃን |ነፃን|ግስቲ|፣ ን|ዚ ብ|ስቲ | ቤተ|ምጥሓ| ክሳ| ነዚ|ን ክ|ነቲ | ነቲ|ነዚ | ምእ|ብነፃ| ምዕ|ምዕባ|ዕባለ|ክሳብ| ብነ|ል እ|ዚ መ|ልዕሊ|ክብሩ|ብማዕ|ሳብ |ህይወ|ኦቶም|ምስ |ንገገ|እምነ| እም|ድ ኦ|ቶም |ቲ ክ|ፍትሓ|ለም | ፍት|ብ ን|ን ዓ|ራውን|ሓፈሻ|ደንገ|ም ብ|ትዮን| ዝሰ|ዝተደ|ሉ መ|ብ ና|ጊ ካ|ልዎ |ኦባል| ኦባ|ድልዎ|ን ድ|ኦድል|ዜግነ|ላውን| ድሕ"
  },
  "Hebrew": {
    "heb": "ות |ים |כל |ת ה| כל|דם |אדם|יות| של| זכ|ל א| אד|של |ל ה|אי |ויו|כאי|ת ו|י ל|זכא| ול|לא | וה|רות|זכו|ית |ירו|ין | או|ם ז| לא| הח|או | הא| וב| המ|חיר|ת ל|יים|ם ל|את |ת ב|ת ש|רה |ון | לה|נה |כוי|ותי|ה ש|ו ל|ו ב| הו|ת א|ם ב|ם ו|תו | את|לה |ני |אומ| במ|דה |א י|ה ה|ה ב|על |ם ה| על|הוא|וך |ה א|בוד|וד |ואי|נות|ה ו|ת כ|י ה|יה |ם ש|ו ו| שה|ם א|ו כ|ינו|ן ה| שו|שוו|החי|כות|לאו|בות|דות|ה ל|לית|ה מ| בי|וה |וא | הי| לפ|ור | לב|ל ב|בחי|הכר|לו |ת מ|ן ש|החו|ה כ| בכ|ומי|בין|ן ו|ן ל|רוי|פלי|ולה|ליה| הז|חינ| לע| בנ|יבו|חוק| אח|חבר| יה| חי|מי |ירה| חו|האד|ווה|חופ|ופש|וק |נו |יו |ל מ|מדי|כבו| הע|נוך| הד|י א|י ו| הכ|בני|עה |ו א|רצו|דינ|בזכ|מות|יפו| אל|סוד|לם |איש|רך | אי|הגנ|הם |פי |ם כ|חות|ל ו|איל|ילי|תיה|כלל|אלי|יסו|האו|זש | בא|ר א|ו ה|זו |אחר| הפ| בע| בז|משפ| בה| לח|דרך|ומו| בח| דר| מע|ל י|תוך|מנו| בש|לל |רבו| למ|פני| לק|תם |שה |שית|ללא|לפי|היה|מעש|דו |שות|להג|וצי|שוא|אין|וי |תי |ונו|ליל| לו|חיי|ל ז| זו|היא|יא |נתו|ה פ|לת |ובי| לכ|ך ה|יל |י ש|שיו|ן ב|עול|המד|ודה|ולם| ומ|א ה|ולא| בת|הכל| סו| מש| עב|סוצ|ארצ| אר|ציא|ד א|לחי|הן |יחס| יח|יאל|הזכ|ם נ| שר|בו |עבו|היס| לי|ת ז|פול|יהי|גבל|תיו|המא|שהי|א ל|מאו| יו|ותו|ישי|גנה|פשי|וחד|יהם|חרו|לכל|ידה|עות|ונה|ום |חה |עם |שרי|ם י|שר |והח| אש| הג|ק ב|הפל|נשו|הגב|ד ו",
    "ydd": " פֿ|ון |ער |ן א| אַ|דער|ט א| או|און|אַר|ען |פֿו| אױ| אי|ן פ|ֿון|רעכ| דע| רע|עכט|פֿא|ן ד|כט | די|די |אַ |אױף|ױף |ֿאַ| זײ| גע|אַל|אָס| אָ|ונג| הא|האָ|זײַ| מע|אָל|נג |װאָ|ַן |אַנ|רײַ| װא|ָס |באַ| יע|יעד|ניט|ן ז|ר א|יט |אָט|אָר|עדע|מען|זאָ|ָט |פֿר|ײַן| בא|טן |אין|ן ג|ין |ן װ|נאַ|ֿרײ|ר ה| זא|לעכ|ע א|אָד|ַ ר|ענט|אַצ|ַצי|אָנ| צו| װע|יז |מענ|ָדע|איז|ן מ|ַלע|בן |ר מ|טער| מי| פּ|מיט|טלע|ָל |עכע|ײט |ַנד|ע פ|לע |געז|לאַ|אַפ|עזע|ראַ| ני|ַפֿ|רן |ײַנ|נען|טיק|כע |פֿע|יע |הײט|ַהײ|נטש|ײַה|ט ד|ן ב|לן |ן נ|פֿט|שאַ|רונ| זי| װי|ט פ| דא|טאָ|דיק|קן |ר פ|ר ג|יקן|אָב|ף א|אַק|קער|ערע|כער|י פ|ות |ַרב|פּר|קט |עם |יאָ|ציע|ציא|יט־|צו |ישע| קײ|ן ק|סער| גל|דאָ|ונט|גן |ַרא|יקע| טא|ענע|לײַ|שן |ַנע|יק |טאַ|ס א|עט |נגע|ט־א|ָנא|־אי|יקט|נטע|ײנע|־ני|ָר |װער|י א|ן י|יך |זיך|ער־|ערן|אױס|ָבן|נדע|ָסע|װי |ֿעל|ר־נ|ן ה| גר|גלײ| צי|ראָ|זעל|עלק|נד |לקע|אָפ| כּ|ט װ|ג א| נא|ט צ|ר ד|עס |דור|גען|קע |ג פ|ֿט |ן ל|שע |ר ז|רע |ײטן|פּע|קלא|קײט|יטע|ים |ס ז|ײַ | דו|אַט| לא|ר װ|קײנ|עלש|י ד|לשא|יות|נט |ַרז|ע ר|ל ז|אַמ|ן ש| שו|אינ|נטל| הי|בעט|ָפּ|ף פ|ײַכ|בער|ן צ|מאָ| שט| לע|גער|ורך|רך |נעם|גרו|פֿן|לער|װעל|ע מ|ום |שפּ|ך א|יונ|רבע|עפֿ|טעט|ן כ|רעס|ערצ|ז א|עמע|ם א|שטע|כן |רט |י ג|סן |נער|ליט|ט ז|נעמ|ּרא|היו|אַש|ת װ|אומ|ק א|יבע|ֿן |ץ א|פֿי|ײן |ם ט"
  }
});

require.register("wooorm~retext-language@0.2.1", function (exports, module) {
'use strict';

/**
 * Dependencies.
 */

var franc,
    visit;

franc = require("wooorm~franc@0.2.0");
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
var language = require("wooorm~retext-language@0.2.1");
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
