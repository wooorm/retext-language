# retext-language [![Build Status](https://img.shields.io/travis/wooorm/retext-language.svg)](https://travis-ci.org/wooorm/retext-language) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/retext-language.svg)](https://codecov.io/github/wooorm/retext-language)

Detect the language of text with [**retext**](https://github.com/wooorm/retext).

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install retext-language
```

**retext-language** is also available for [bower](http://bower.io/#install-packages),
[component](https://github.com/componentjs/component), and
[duo](http://duojs.org/#getting-started), and as an AMD, CommonJS, and globals
module, [uncompressed](retext-language.js) and
[compressed](retext-language.min.js).

## Usage

```js
var retext = require('retext');
var inspect = require('unist-util-inspect');
var language = require('retext-language');

retext().use(language).use(function () {
    return function (cst) {
        console.log(inspect(cst));
    };
}).process(
    'Tots els éssers humans neixen lliures i iguals. ' +
    'All human beings are born free and equal.\n' +
    'Toate ființele umane se nasc libere și egale. ' +
    '人人生而自由﹐在尊嚴和權利上一律平等。'
);
```

Yields:

```text
RootNode[3] [data={"language":"cat","languages":[["cat",1],["ron",1]]}]
├─ ParagraphNode[3] [data={"language":"cat","languages":[["cat",1],["eng",1]]}]
│  ├─ SentenceNode[16] [data={"language":"cat","languages":[["cat",1],["spa",0.5338106603023071],["fra",0.47334924423229907],["glg",0.4636701140281092],["por",0.46154866083267043],["eng",0.38106603023070806],["sco",0.37920975868469897],["src",0.3687350835322196],["afr",0.34062582869265445],["dan",0.3342614691063378],["nob",0.3298859718907452],["tzm",0.32458233890214794],["ita",0.3204720233359851],["tpi",0.3154335719968179],["hun",0.30151153540175024],["tiv",0.2930257226199947],["hat",0.29209758684699016],["lav",0.2897109520021215],["swe",0.2800318217979316],["rmn",0.275391142932909],["bcl",0.26902678334659247],["snk",0.2688941925218775],["lit",0.2482100238663485],["nhn",0.24264120922832144],["quy",0.23906125696101832],["nds",0.23667462211614954],["epo",0.23362503314770622],["est",0.228188809334394],["deu",0.2227525855210819],["snn",0.22010076902678333],["fin",0.21930522407849373],["bci",0.2159904534606205],["hms",0.21559268098647577],["quz",0.21201272871917265],["jav",0.20710686820472024],["nld",0.20551577830814105],["als",0.20365950676213207],["hau",0.20206841686555288],["ban",0.19809069212410502],["ckb",0.1937151949085123],["hrv",0.19358260408379735],["bos",0.19278705913550787],["ilo",0.19093078758949877],["srp",0.19013524264120918],["gax",0.18947228851763454],["ind",0.18920710686820474],["bam",0.18814638027048525],["nno",0.1872182444974808],["aka",0.18536197295147172],["ace",0.18377088305489264],["emk",0.1828427472818881],["men",0.1820472023335985],["ces",0.17979315831344467],["slv",0.17899761336515518],["pam",0.1758154335719968],["bug",0.17568284274728185],["qug",0.17223548130469368],["rmy",0.1709095730575444],["sun",0.1706443914081146],["bin",0.16865552903739056],["tgl",0.16719702996552643],["ndo",0.16560594006894724],["ron",0.16255635110050382],["mos",0.16162821532749938],["fuc",0.16149562450278443],["dip",0.15963935295677534],["lua",0.1571201272871917],["fon",0.1546009016176081],["hil",0.15208167594802435],["pol",0.14956245027844073],["min",0.14770617873243175],["uig",0.14584990718642266],["nso",0.14584990718642266],["war",0.14558472553699287],["plt",0.14439140811455842],["tuk",0.14425881728984358],["wol",0.14280031821797934],["ibb",0.1413418191461151],["sot",0.13922036595067622],["kin",0.13736409440466724],["ceb",0.13709891275523733],["uzn",0.1364359586316627],["xho",0.13192787059135502],["ssw",0.13166268894192523],["tur",0.13166268894192523],["slk",0.13086714399363564],["bem",0.1299390082206311],["sna",0.1286130999734818],["zul",0.12848050914876685],["lun",0.12596128347918323],["lin",0.12529832935560858],["yor",0.12304428533545475],["knc",0.12039246884115617],["tsn",0.11880137894457699],["mad",0.11760806152214265],["gaa",0.11641474409970831],["ada",0.11628215327499336],["ewe",0.11522142667727397],["vmw",0.11376292760540974],["yao",0.11336515513126488],["run",0.11323256430654993],["ayr",0.11164147440997085],["ibo",0.11097852028639621],["kmb",0.10938743038981702],["suk",0.10673561389551844],["kng",0.10421638822593482],["kde",0.1006364359586317],["swh",0.0998408910103421],["som",0.0987801644126226],["cjk",0.09692389286661363],["umb",0.09440466719703],["vie",0.09135507822858657],["nyn",0.09095730575444183],["lug",0.08697958101299386],["tso",0.08697958101299386],["nya",0.08552108194112973],["azj",0.08379740121983559],["tem",0.08353221957040569],["kbp",0.07955449482895782],["toi",0.07955449482895782],["sag",0.07955449482895782]]}]
│  │  ├─ WordNode[1]
│  │  │  └─ TextNode: 'Tots'
│  │  ├─ WhiteSpaceNode: ' '
│  │  ├─ WordNode[1]
│  │  │  └─ TextNode: 'els'
│  │  ├─ WhiteSpaceNode: ' '
│  │  ├─ WordNode[1]
│  │  │  └─ TextNode: 'éssers'
│  │  ├─ WhiteSpaceNode: ' '
│  │  ├─ WordNode[1]
│  │  │  └─ TextNode: 'humans'
│  │  ├─ WhiteSpaceNode: ' '
│  │  ├─ WordNode[1]
│  │  │  └─ TextNode: 'neixen'
│  │  ├─ WhiteSpaceNode: ' '
│  │  ├─ WordNode[1]
│  │  │  └─ TextNode: 'lliures'
│  │  ├─ WhiteSpaceNode: ' '
│  │  ├─ WordNode[1]
│  │  │  └─ TextNode: 'i'
│  │  ├─ WhiteSpaceNode: ' '
│  │  ├─ WordNode[1]
│  │  │  └─ TextNode: 'iguals'
│  │  └─ PunctuationNode: '.'
│  ├─ WhiteSpaceNode: ' '
│  └─ SentenceNode[16] [data={"language":"eng","languages":[["eng",1],["sco",0.8510193413486671],["nno",0.5851193587733055],["deu",0.5565429517337515],["dan",0.5474821397456002],["nld",0.5312772259975606],["afr",0.5155950514026835],["sun",0.5032235581111693],["nob",0.5004356159609689],["nds",0.4823139919846663],["swe",0.48057152814079107],["bci",0.4699424986931521],["uig",0.4532148457919498],["jav",0.4504269036417494],["mad",0.44711622233838644],["ckb",0.39972120578497994],["rmn",0.3906603937968287],["ace",0.3852587558808155],["snk",0.3814253354242899],["ita",0.37811465412092704],["por",0.3685311029796132],["bcl",0.3653946680606377],["cat",0.36522042167625024],["ron",0.35511413138177383],["hil",0.34553058024046],["run",0.345182087471685],["pam",0.33716675378985883],["emk",0.33525004356159605],["war",0.3350757971772086],["ind",0.3319393622582332],["tuk",0.33106813033629556],["bin",0.3261892315734448],["fuc",0.32514375326711975],["ban",0.32235581111691936],["gax",0.3220073183481442],["min",0.32009060811988155],["aka",0.3183481442760062],["uzn",0.3171284195852936],["kin",0.316257187663356],["suk",0.31451472381948076],["ceb",0.31364349189754315],["bug",0.31259801359121797],["spa",0.31050705697856773],["hau",0.30946157867224255],["hms",0.309287332287855],["hat",0.2958703606900157],["snn",0.2958703606900157],["quy",0.2949991287680781],["mos",0.2904687227740025],["fon",0.2902944763896149],["tgl",0.28367311378288895],["ewe",0.2733925771040251],["wol",0.2733925771040251],["quz",0.2692106638787245],["hun",0.2681651855723993],["plt",0.2655514898065865],["ilo",0.26485450426903645],["nya",0.2613695765812859],["nyn",0.25875588081547307],["nso",0.2577104025091479],["tur",0.25753615612476044],["ada",0.25474821397456004],["qug",0.25230876459313467],["bam",0.25108903990242204],["src",0.2503920543648719],["epo",0.24377069175814603],["kde",0.24185398152988324],["bem",0.23906603937968285],["gaa",0.2383690538421328],["glg",0.23767206830458265],["tiv",0.23540686530754484],["toi",0.23488412615438226],["tpi",0.22948248823836903],["tzm",0.22355811116919322],["knc",0.22338386478480576],["lin",0.2232096184004182],["fra",0.21658825579369223],["men",0.21467154556542956],["sot",0.21380031364349195],["yao",0.21101237149329155],["nhn",0.20787593657431613],["lua",0.20369402334901554],["sna",0.2033455305802404],["dip",0.20212580588952778],["rmy",0.20055758843004012],["ibo",0.19724690712667714],["est",0.19689841435790212],["ibb",0.19654992158912699],["als",0.1960271824359645],["swh",0.19254225474821396],["lun",0.19114828367311376],["ssw",0.1808677469942499],["cjk",0.18069350060986233],["azj",0.1780798048440495],["slk",0.17773131207527448],["lit",0.17110994946854852],["tsn",0.1671022826276355],["ayr",0.1620491374803973],["lav",0.15838996340825928],["fin",0.15438229656734626],["zul",0.15072312249520825],["ndo",0.14654120926990766],["umb",0.14514723819480746],["kng",0.14061683220073184],["xho",0.13957135389440667],["kmb",0.13643491897543125],["som",0.13103328105941803],["kbp",0.12685136783411743],["sag",0.12354068653075445],["slv",0.12232096184004182],["yor",0.12075274438055406],["lug",0.11639658477086601],["vmw",0.1099494685485276],["srp",0.10280536678863916],["tem",0.1026311204042516],["tso",0.09914619271650116],["vie",0.09775222164140096],["bos",0.0975779752570134],["hrv",0.08816867050008714],["pol",0.07405471336469771],["ces",0.052273915316257136]]}]
│     ├─ WordNode[1]
│     │  └─ TextNode: 'All'
│     ├─ WhiteSpaceNode: ' '
│     ├─ WordNode[1]
│     │  └─ TextNode: 'human'
│     ├─ WhiteSpaceNode: ' '
│     ├─ WordNode[1]
│     │  └─ TextNode: 'beings'
│     ├─ WhiteSpaceNode: ' '
│     ├─ WordNode[1]
│     │  └─ TextNode: 'are'
│     ├─ WhiteSpaceNode: ' '
│     ├─ WordNode[1]
│     │  └─ TextNode: 'born'
│     ├─ WhiteSpaceNode: ' '
│     ├─ WordNode[1]
│     │  └─ TextNode: 'free'
│     ├─ WhiteSpaceNode: ' '
│     ├─ WordNode[1]
│     │  └─ TextNode: 'and'
│     ├─ WhiteSpaceNode: ' '
│     ├─ WordNode[1]
│     │  └─ TextNode: 'equal'
│     └─ PunctuationNode: '.'
├─ WhiteSpaceNode: '
'
└─ ParagraphNode[3] [data={"language":"ron","languages":[["ron",1],["cmn",1]]}]
   ├─ SentenceNode[16] [data={"language":"ron","languages":[["ron",1],["ita",0.6914475672408582],["src",0.6090964037473556],["spa",0.600181323662738],["fra",0.5741915986702931],["por",0.5421577515865821],["glg",0.539135690540949],["ssw",0.5335448776065277],["nno",0.5306739196131762],["hat",0.5220610456331218],["yao",0.49184043517679055],["epo",0.48760954971290416],["nso",0.47899667573284976],["bug",0.47219703838017524],["nob",0.47144152311876697],["dan",0.4693260803868238],["snk",0.4536113629495315],["est",0.44938047748564525],["eng",0.44394076760350554],["afr",0.4403142943487458],["kde",0.43880326382592927],["kin",0.4301903898458749],["rmn",0.4282260501662134],["mad",0.4273194318525234],["bin",0.41885766092475063],["vmw",0.41810214566334236],["tiv",0.41795104261106075],["fuc",0.4128135388334845],["suk",0.40933816863100636],["xho",0.4075249320036265],["lin",0.4055605923239649],["bci",0.40510728316711997],["cat",0.40057419159867025],["sot",0.3980054397098821],["tsn",0.39740102750075557],["deu",0.3957388939256573],["zul",0.39513448171653065],["snn",0.37972197038380173],["slv",0.3794197642792384],["bem",0.37322453913569054],["run",0.37231792082200066],["ckb",0.3715624055605923],["ewe",0.37035358114233907],["jav",0.3661226956784527],["nld",0.36355394378966455],["ibo",0.3631006346328196],["sco",0.3597763674826231],["nyn",0.3566032033847084],["mos",0.3513145965548504],["ibb",0.34647929888183737],["rmy",0.34391054699304924],["hrv",0.3360531882744031],["srp",0.33529767301299485],["quy",0.33318223028105165],["aka",0.33303112722877004],["bos",0.329102447869447],["ndo",0.3220006044122091],["ace",0.31912964641885766],["tur",0.31368993653671806],["ilo",0.31248111211846474],["tso",0.31127228770021154],["ban",0.3076458144454518],["hau",0.30507706255666367],["cjk",0.2988818374131157],["fon",0.2954064672106377],["emk",0.2937443336355394],["wol",0.2922333031127229],["als",0.2910244786944697],["hun",0.28845572680568143],["gax",0.2872469023874282],["ada",0.28528256270776675],["nds",0.2824116047144152],["nhn",0.2795406467210637],["lua",0.2781807192505289],["nya",0.27546086430945904],["gaa",0.2706255666364461],["toi",0.2674524025385313],["ces",0.267150196433968],["sna",0.26261710486551826],["umb",0.257479601087942],["swh",0.25506195225143546],["ceb",0.253097612571774],["slk",0.2512843759443941],["lug",0.24750679963735267],["pam",0.24614687216681774],["hms",0.2458446660622544],["ind",0.24040495618011481],["plt",0.23949833786642494],["men",0.23723179208220002],["sun",0.2326987005137504],["bam",0.23209428830462375],["sag",0.22695678452704748],["kmb",0.22620126926563922],["lit",0.22317920822000603],["tgl",0.22242369295859776],["bcl",0.22227258990631615],["war",0.2172861891810215],["kbp",0.21139317014203685],["min",0.20942883046237537],["tpi",0.20912662435781204],["knc",0.2088244182532487],["kng",0.2077666968872771],["uzn",0.20716228467815045],["swe",0.1925052886068298],["tzm",0.1922030825022666],["lun",0.19054094892716833],["quz",0.18721668177697193],["som",0.1838924146267754],["fin",0.18177697189483233],["qug",0.18071925052886073],["tuk",0.17860380779691754],["hil",0.17527954064672102],["pol",0.17255968570565128],["dip",0.1628890903596253],["tem",0.13221517074644906],["lav",0.12994862496222426],["vie",0.12692656391659107],["yor",0.11529162889090361],["azj",0.10048352976730135],["uig",0.09398609851919004],["ayr",0.09202175883952857]]}]
   │  ├─ WordNode[1]
   │  │  └─ TextNode: 'Toate'
   │  ├─ WhiteSpaceNode: ' '
   │  ├─ WordNode[1]
   │  │  └─ TextNode: 'ființele'
   │  ├─ WhiteSpaceNode: ' '
   │  ├─ WordNode[1]
   │  │  └─ TextNode: 'umane'
   │  ├─ WhiteSpaceNode: ' '
   │  ├─ WordNode[1]
   │  │  └─ TextNode: 'se'
   │  ├─ WhiteSpaceNode: ' '
   │  ├─ WordNode[1]
   │  │  └─ TextNode: 'nasc'
   │  ├─ WhiteSpaceNode: ' '
   │  ├─ WordNode[1]
   │  │  └─ TextNode: 'libere'
   │  ├─ WhiteSpaceNode: ' '
   │  ├─ WordNode[1]
   │  │  └─ TextNode: 'și'
   │  ├─ WhiteSpaceNode: ' '
   │  ├─ WordNode[1]
   │  │  └─ TextNode: 'egale'
   │  └─ PunctuationNode: '.'
   ├─ WhiteSpaceNode: ' '
   └─ SentenceNode[4] [data={"language":"cmn","languages":[["cmn",1]]}]
      ├─ WordNode[1]
      │  └─ TextNode: '人人生而自由'
      ├─ PunctuationNode: '﹐'
      ├─ WordNode[1]
      │  └─ TextNode: '在尊嚴和權利上一律平等'
      └─ PunctuationNode: '。'
```

## API

None, **retext-language** automatically detects the language of each
[`SentenceNode`](https://github.com/wooorm/nlcst#sentencenode) (using
[**wooorm/franc**](https://github.com/wooorm/franc)), and stores the language
in `node.data.language`.
Additionally, information about all detected languages is stored in
`node.data.languages`.

The average of the detected languages on parents
([paragraph](https://github.com/wooorm/nlcst#paragraphnode)s and
[root](https://github.com/wooorm/nlcst#rootnode)s), through the same
`parent.data.language` and `parent.data.languages`.

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
