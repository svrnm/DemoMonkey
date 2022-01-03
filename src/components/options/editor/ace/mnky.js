/* eslint-disable */
/* global ace */
ace.define('ace/mode/mnky_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop',
  'ace/mode/text_highlight_rules'
], function (acequire, exports, module) {
  'use strict'

  var oop = acequire('../lib/oop')
  var TextHighlightRules = acequire("./text_highlight_rules").TextHighlightRules;

  var escapeRe = "\\\\(?:[\\\\0abtrn;#=:]|x[a-fA-F\\d]{4})";

  var IniHighlightRules = function () {
    this.$rules = {
      start: [{
        token: 'punctuation.definition.comment.mnky',
        regex: '#.*',
        push_: [{
          token: 'comment.line.number-sign.mnky',
          regex: '$|^',
          next: 'pop'
        }, {
          defaultToken: 'comment.line.number-sign.mnky'
        }]
      }, {  /* @-something = regex*/
        token: ['constant.library.mnky', 'text', 'punctuation.separator.key-value.mnky', 'text','entity.name.function.mnky'],
        regex: '^(@[^=]+)(\\s*)(=)?(\\s*)(/.*/)$'
      }, {  /* URL match expression taken from  the ace source */
        token: 'punctuation.definition.string.url.mnky',
        regex: '\\w[-\\w_]*\\:(\\/\\/)(\\w[-\\w._]*(:\\d+)?)?',
        push_: [{
          token: 'string.url.mnky',
          regex: '$|^',
          next: 'pop'
        }, {
          defaultToken: 'string.url.mnky'
        }]
      }, {
        token: 'punctuation.definition.comment.mnky',
        regex: '//.*',
        push_: [{
          token: 'comment.line.double-slash.mnky',
          regex: '$|^',
          next: 'pop'
        }, {
          defaultToken: 'comment.line.double-slash.mnky'
        }]
      }, {
        token: 'punctuation.definition.comment.mnky',
        regex: ';.*',
        push_: [{
          token: 'comment.line.semicolon.mnky',
          regex: '$|^',
          next: 'pop'
        }, {
          defaultToken: 'comment.line.semicolon.mnky'
        }]
      }, {
        token: ['variable.mnky'],
        // three matchings: variable like ${name}, variable like ${name.method(args)} and like $name
        regex: '(\\${[^(}]+\\(.*?\\)})|(\\${[^(}]+})|(\\$(?!{)\\S+)'
      }, {
        token: ['constant.library.mnky', 'text', 'punctuation.separator.key-value.mnky'],
        regex: '^(@[^=]+)(\\s*)(=)?'
      }, {
        token: ['storage.type.mnky', 'text'],
        regex: '^(\\+[^=]+)(\\s*)'
      }, {
        token: ['entity.name.function.mnky', 'entity.name.function.mnky', 'keyword.other.definition.mnky',
          'entity.name.function.mnky', 'text', 'punctuation.separator.key-value.mnky'
        ],
        regex: '^(![^=]+)(\\()([^)]*)(\\))(\\s*)(=)?'
      }, {
        token: ['entity.name.function.mnky', 'text', 'punctuation.separator.key-value.mnky'],
        regex: '^(![^=]+)(\\s*)(=)'
      }, {
        token: ['keyword.other.definition.mnky', 'text', 'punctuation.separator.key-value.mnky'],
        regex: '([^=]+)(\\s*)(=)'
      }, {
        token: ['punctuation.definition.entity.mnky', 'constant.section.group-title.mnky',
          'punctuation.definition.entity.mnky'
        ],
        regex: '^(\\[)(.*?)(\\])'
      }, {
        token: ['punctuation.definition.entity.mnky', 'constant.section.group-title.mnky',
          'punctuation.definition.entity.mnky'
        ],
        regex: '^(\\{%)(.*?)(\\%})'
      }, {
        token: 'punctuation.definition.string.begin.mnky',
        regex: "'",
        push: [{
          token: 'punctuation.definition.string.end.mnky',
          regex: "$|'",
          next: 'pop'
        }, {
          token: "constant.language.escape",
          regex: escapeRe
        }, {
          defaultToken: 'string.quoted.single.mnky'
        }]
      }, {
        token: 'punctuation.definition.string.begin.mnky',
        regex: '"',
        push: [{
          token: "constant.language.escape",
          regex: escapeRe
        }, {
          token: 'punctuation.definition.string.end.mnky',
          regex: '$|"',
          next: 'pop'
        }, {
          defaultToken: 'string.quoted.double.mnky'
        }]
      }]
    };

    this.normalizeRules();
  };

  IniHighlightRules.metaData = {
    fileTypes: ['ini', 'mnky', 'conf'],
    keyEquivalent: '^~I',
    name: 'Mnky',
    scopeName: 'source.mnky'
  };

  oop.inherits(IniHighlightRules, TextHighlightRules);

  exports.IniHighlightRules = IniHighlightRules;
});

ace.define("ace/mode/folding/mnky", ["require", "exports", "module", "ace/lib/oop", "ace/range",
  "ace/mode/folding/fold_mode"
], function (acequire, exports, module) {
  "use strict";

  var oop = acequire("../../lib/oop");
  var Range = acequire("../../range").Range;
  var BaseFoldMode = acequire("./fold_mode").FoldMode;

  var FoldMode = exports.FoldMode = function () {};
  oop.inherits(FoldMode, BaseFoldMode);

  (function () {

    this.foldingStartMarker = /^\s*\[([^\])]*)]\s*(?:$|[;#])/;

    this.getFoldWidgetRange = function (session, foldStyle, row) {
      var re = this.foldingStartMarker;
      var line = session.getLine(row);

      var m = line.match(re);

      if (!m) return;

      var startName = m[1] + ".";

      var startColumn = line.length;
      var maxRow = session.getLength();
      var startRow = row;
      var endRow = row;

      while (++row < maxRow) {
        line = session.getLine(row);
        if (/^\s*$/.test(line))
          continue;
        m = line.match(re);
        if (m && m[1].lastIndexOf(startName, 0) !== 0)
          break;

        endRow = row;
      }

      if (endRow > startRow) {
        var endColumn = session.getLine(endRow).length;
        return new Range(startRow, startColumn, endRow, endColumn);
      }
    };

  }).call(FoldMode.prototype);

});

ace.define("ace/mode/mnky", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text",
  "ace/mode/mnky_highlight_rules", "ace/mode/folding/mnky"
], function (acequire, exports, module) {
  "use strict";

  var oop = acequire("../lib/oop");
  var TextMode = acequire("./text").Mode;
  var IniHighlightRules = acequire("./mnky_highlight_rules").IniHighlightRules;
  var FoldMode = acequire("./folding/mnky").FoldMode;

  var Mode = function () {
    this.HighlightRules = IniHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
  };
  oop.inherits(Mode, TextMode);

  (function () {
    this.lineCommentStart = ";";
    this.blockComment = null;
    this.$id = "ace/mode/mnky";
  }).call(Mode.prototype);

  exports.Mode = Mode;
});

/*ace.define("ace/snippets/mnky",["require","exports","module"],function(e,t,n){
  "use strict";
  t.snippetText=require('./mnky.snippets')
  t.scope="mnky"
})*/
