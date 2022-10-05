
function resetGame(ev) {
    jrecord.jboard.clear();
    jrecord.root = jrecord.current = null;
    jrecord.info = {};
    record = [];
    ev.preventDefault();
}

function coordsToString(point) {
    var row = (BOARD_SIZE - 1) - point.j;
    var col = point.i;
    return colnames[col] + ((row + 1).toString());
}

function stringToCoords(move_string) {
    var colStr = move_string.substring(0, 1);
    var rowStr = move_string.substring(1);
    var col = colnames.indexOf(colStr);
    var row = BOARD_SIZE - parseInt(rowStr, 10);
    return new JGO.Coordinate(col, row);
}

function applyMove(player, coord) {

    var play = jboard.playMove(coord, player, ko);


    if (play.success) {
        record.push(coordsToString(coord));
        node = jrecord.createNode(true);
        node.info.captures[player] += play.captures.length; // tally captures
        playeralphabat = (player == JGO.BLACK) ? 'B' : 'W';
        node.info.playeralphabat = playeralphabat
        node.info.coord = `${playeralphabat}[${SGFLetters[coord.i]}${SGFLetters[coord.j]}]`;
        node.setType(coord, player); // play stone
        node.setType(play.captures, JGO.CLEAR); // clear opponent's stones
        if (node.parent !== null) {
            node.info.moveNum = node.parent.info.moveNum + 1
        }else{
            node.info.moveNum = 1
        }
        
        if (lastMove) {
            node.setMark(lastMove, JGO.MARK.NONE); // clear previous mark
        }

        node.setNumber(coord, node.info.moveNum); // mark move
        node.setMark(coord, JGO.MARK.CIRCLE); // mark move
        
        lastMove = coord;
        ko = play.ko;
        updateInfo();
    } 
}

function move(dir) { // dir=0 has special meaning "beginning"
    if (!jrecord) return; // disable movement until SGF loaded

    if (dir == 0) {
        jrecord.first();
        moveNum = 0;
    }
    while (dir < 0) {
        if (!jrecord.previous()) break;
        moveNum--; dir++;
    }
    while (dir > 0) {
        if (!jrecord.next()) break;
        moveNum++; dir--;
    }

    updateInfo();
}

function nextVariation() {
    jrecord.setVariation((jrecord.getVariation() + 1) % jrecord.getVariations());
}

function updateInfo() {
    var info = jrecord.getCurrentNode().info;
    var allmove = (jrecord.root.info.coord !== undefined) ? jrecord.normalize() : jrecord.normalize() - 1;
    $('#move').html(info.moveNum);
    if (info.comment !== undefined){
        $("#Comments").val(info.comment.replace(/\n/g, '<br>'));
    }else{
        $("#Comments").val('');
    }
    
    //$('#comments').html(info.comment ? info.comment.replace(/\n/g, '<br>') : '');
    $('#black_captures').html(info.captures[JGO.BLACK]);
    $('#white_captures').html(info.captures[JGO.WHITE]);
    $('#variation').html(jrecord.getVariation() + 1);
    $('#variations').html(jrecord.getVariations());
    $('#moves').html(allmove);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function saveInfoDownloadFile(sgfFile) {
    saveInfo()
    sgfFile = jrecordToSGF()
    if (sgfFile !== undefined) {
        download('text.sgf', sgfFile)
    }
}
function downloadFile() {

    if (game !== undefined) {
        download('text.sgf', game["SGF"])
    }
}

function addComment() {
    jrecord.current.info.comment = document.getElementById("Comments").value
}

function saveInfo() {
    for (var i in SGFParams) {
        var key = document.getElementById("SGF" + SGFParams[i]).value;
        if (key !== null && key !== undefined && key !== "") {
            jrecord.info[SGFParams[i]] = key;
            document.getElementById(SGFParams[i]).value = jrecord.info[SGFParams[i]];
        }
    }
}

const dfsPreOrder = (node, sgfseries = []) => {
    if (node.info.coord !== undefined) {
        sgfseries.push(`;${node.info.coord}`)
    }
    if (node.children.length == 1) {
        dfsPreOrder(node.children[0], sgfseries);
    }
    return sgfseries.join('');
}

function jrecordToSGF() {
    var sgfInfo = ";CA[big5]SZ[19]AP[KIN]";
    for (var i in jrecord.info) {
        for (var key in fieldMap) {
            if (fieldMap[key] == i) {
                sgfInfo += `${key}[${jrecord.info[i]}]`
            }
        }
    }

    sgfInfo += '\n'
    sgfseries = dfsPreOrder(jrecord.root)
    sgfFile = `(${sgfInfo}${sgfseries})`
    return sgfFile
}

function loadSGF(sgf) {
    jrecord = JGO.sgf.load(sgf, true);
    
    for (var i in SGFParams) {
        if (jrecord.root.info[SGFParams[i]] == undefined) {
            jrecord.info[SGFParams[i]] = "";
        } else {
            jrecord.info[SGFParams[i]] = jrecord.root.info[SGFParams[i]];
        }
    }
    sgfFile = jrecordToSGF();
    jrecord.info.sgfFile = sgfFile
    if (typeof jrecord == 'string') {
        alert('Error loading SGF: ' + jrecord);
        return;
    }

    if (!(jrecord instanceof JGO.Record)) {
        alert('Empty SGF or multiple games in one SGF not supported!');
        return;
    }

    $('#moves').html(jrecord.normalize() - 1); // longest sequence first
    notifier.changeBoard(jrecord.getBoard());
    updateGameInfo(jrecord.getRootNode().info);
    moveNum = 0;
    move(gotoMove); // also updates game info
    gotoMove = 0;
}

function loadFile() {
    var files = document.getElementById("formFile").files;

    if (!files || files.length == 0)
        alert("File loading either not supported or no file selected!");

    var reader = new FileReader();
    reader.onload = function () {
        var contents = reader.result;
        sgfFile = loadSGF(contents);
        for (var i in SGFParams) {
            document.getElementById(SGFParams[i]).value = jrecord.info[SGFParams[i]];
        }
        document.getElementById("SGF").value = jrecord.info.sgfFile;
    };
    reader.readAsText(files[0], "UTF-8");
}



function updateGameInfo(info) {
    var html = "";

    if ("black" in info) {
        html += "Black: <strong>" + info.black;
        if ("blackRank" in info) html += ", " + info.blackRank;
        html += "</strong><br />";
    }

    if ("white" in info) {
        html += "White: <strong>" + info.white;
        if ("whiteRank" in info) html += ", " + info.whiteRank;
        html += "</strong><br />";
    }

    var additional = [["result", "Result"]];

    $.each(additional, function (i, tup) {
        if (tup[0] in info)
            html += tup[1] + ": <strong>" + info[tup[0]] + "</strong><br>";
    });

    $('#information').html(html);
}

var varNode = function (jboard, parent, info) {
    this.jboard = jboard;
    this.varParent = parent;
    this.varInfo =  {};
    this.varInfo.captures =  {};
    this.varChildren = [];
    this.varChanges = [];
    this.varRoot = [];

    if (parent) {
      parent.children.push(this); // register child
      this.varInfo.captures = { 1: 0, 2: 0 };
    } else {
      this.varInfo.captures = { 1: 0, 2: 0 }; // C.BLACK, C.WHITE
    }
  };

  /**
   * Helper method to clear parent node's markers. Created to achieve SGF like
   * stateless marker behavaior.
   */
  varNode.prototype.clearParentMarks = function () {
    if (!this.varParent)
      return;

    for (var i = this.varParent.changes.length - 1; i >= 0; i--) {
      var item = this.varParent.changes[i];

    }
  };

  /**
   * Helper method to make changes to a board while saving them in the node.
   *
   * @param {Object} c Coordinate or array of them.
   * @param {int} val Type.
   */
  varNode.prototype.setType = function (c, val) {
    if (c instanceof Array) {
      for (var i = 0, len = c.length; i < len; ++i)
        this.setType(c[i], val); // avoid repeating ourselves
      return;
    }

    // Store both change and previous value to enable reversion
    this.varChanges.push({ c: c.copy(), type: val, old: this.jboard.getType(c) });
    this.jboard.setType(c, val);
  };

  /**
   * Helper method to make changes to a board while saving them in the node.
   *
   * @param {Object} c Coordinate or array of them.
   * @param {int} val Mark.
   */
  varNode.prototype.setMark = function (c, val) {
    if (c instanceof Array) {
      for (var i = 0, len = c.length; i < len; ++i)
        this.setMark(c[i], val); // avoid repeating ourselves
      return;
    }

    // Store both change and previous value to enable reversion
    this.varChanges.push({ c: c.copy(), mark: val, old: this.jboard.getMark(c) });
    this.jboard.setMark(c, val);
  };


  /**
   * Apply changes of this node to board.
   */
  varNode.prototype.apply = function () {
    for (var i = 0; i < this.changes.length; i++) {
      var item = this.changes[i];

      if ('type' in item)
        this.jboard.setType(item.c, item.type);
      else
        this.jboard.setMark(item.c, item.mark);
    }
  };

  /**
   * Revert changes of this node to board.
   */
  varNode.prototype.revert = function () {
    for (var i = this.changes.length - 1; i >= 0; i--) {
      var item = this.changes[i];

      if ('type' in item)
        this.jboard.setType(item.c, item.old);
      else
        this.jboard.setMark(item.c, item.old);
    }
  };