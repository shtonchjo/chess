let pieces = "♚♛♜♝♞♟♔♕♖♗♘♙ "
let Pcodes = "KQRBNPkqrbnp " // capital is black, King Queen Rook Bishop kNight Pawn, *=enpassant
let positions = [] // defined in setup as initial board arrangement
let eaten = [] // eaten pieces
let config // defined in setup, stores style data
let swipeup = 0 // display menu
let w // width of cell
let allowedMoves = [] // when clicking, stores possible moves
let selectedCell = [] // when clicking, stores clicked piece
let enpassant = [] // when pawn goes two forward, stores the intermediate position
let isPlayerWhite = true
let hasMoved = [] // all false until piece is moved - essentially for castling
let records = []
let clockTime = [15 * 60 * 1000, 15 * 60 * 1000] // timer setup. [0] black [1] white
let clocks = [clockTime[0], clockTime[1]]
let isGameOver = false

String.prototype.splice = function (index, howManyToDelete, stringToInsert) {
  var characterArray = this.split("");
  Array.prototype.splice.apply(characterArray, arguments);
  return (characterArray.join(""))
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  w = min(width / 8, height / 10)
  config = {
    cellColor: [color("#c1c1c1"), color("#cd7f32")],

    pieceColor: [0, 255], //black,white
    pieceWeight: w / 60,
    pieceBorderColor: [255, 0], //black,white

    shadowColor: color(0, 20),
    shadowDepth: w / 12,

    selectedCell: color(0, 30, 255, 0),
    selectedBorder: color(0, 30, 255, 255),
    selectedWeight: w / 15,

    allowedMoveCell: color(0, 30, 255, 100),
    allowedMoveBorder: color(0, 30, 255, 100),
    allowedMoveWeight: 0,
    allowedEatingCell: color(255, 0, 0, 0),
    allowedEatingBorder: color(180, 0, 0, 255),
    allowedEatingWeight: w / 10,


    menuColor: color(255, 200),
    menuBorderColor: color(255, 150),
    menuWeight: w / 20,

    arrowColor: color(0, 30, 255, 100),
    arrowWeight: w / 20,

    clockBackground: color("#c1c1c1"),
    clockWhite: color("white"),
    clockBlack: color("black")
  }
  for (let i = 0; i < 8; i++) {
    hasMoved.push([false, false, false, false, false, false, false, false])
  }
  hasMoved
  positions = [
    "RNBQKBNR",
    "PPPPPPPP",
    "        ",
    "        ",
    "        ",
    "        ",
    "pppppppp",
    "rnbqkbnr"
  ]
  setInterval(clock, 1000)
  clock()
  noLoop()
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  w = min(width / 8, height / 10)
}

function draw() {
  drawBoard()
  showSelected()
  showAllowedMoves()
  drawPieces()
  // drawMenu()
}

function clock() {
  if (isPlayerWhite) {
    clocks[1] -= 1000
  } else {
    clocks[0] -= 1000
  }
  if (clocks[0] < 0 || clocks[1] < 0) {
    isGameOver = true
  }
  let h = w / 20
  rectMode(CORNER)
  noStroke()
  fill(config.clockBackground)
  rect(width / 2 - 4 * w, height / 2 - 4 * w, 8 * w, -h)
  rect(width / 2 - 4 * w, height / 2 + 4 * w, 8 * w, +h)
  fill(config.clockBlack)
  rect(width / 2 - 4 * w, height / 2 - 4 * w, 8 * w * clocks[0] / clockTime[0], -h)
  fill(config.clockWhite)
  rect(width / 2 - 4 * w, height / 2 + 4 * w, 8 * w * clocks[1] / clockTime[1], +h)
}

function drawBoard() {
  push()
  rectMode(CORNER)
  translate(width / 2 - 4 * w, height / 2 - 4 * w)
  for (j = 0; j < 8; j++) {
    for (i = 0; i < 8; i++) {
      x = i * w
      y = j * w
      noStroke()
      fill(config.cellColor[(i + j) % 2])
      rect(x, y, w + 1, w + 1)
    }
  }
  pop()
}

function drawPieces() {
  push()
  rectMode(CORNER)
  translate(width / 2 - 4 * w, height / 2 - 4 * w)
  for (j = 0; j < 8; j++) {
    for (i = 0; i < 8; i++) {
      x = i * w
      y = j * w
      drawPiece(x, y, positions[j][i])
    }
  }
  pop()
}


function drawPiece(x, y, pieceCode) {
  textAlign(BOTTOM, CENTER)
  x = x + w * .05
  y = y + w * .6
  maj = (pieceCode == pieceCode.toUpperCase() ? 0 : 1)
  pieceText = pieces[Pcodes.indexOf(pieceCode)]
  backgnd = pieces[Pcodes.indexOf(pieceCode.toUpperCase())]
  textSize(w)
  for (k = 0; k < config.shadowDepth; k++) {
    fill(config.shadowColor)
    stroke(config.shadowColor)
    strokeWeight(config.pieceWeight + k)
    text(backgnd, x + k, y + k)
  }
  fill(config.pieceColor[maj])
  stroke(config.pieceBorderColor[maj])
  strokeWeight(config.pieceWeight)
  textSize(w)
  text(backgnd, x, y)
  text(pieceText, x, y)
}

function xy_ij() {
  if (arguments[0] instanceof Array) {
    [x, y] = arguments[0]
  } else {
    [x, y] = arguments
  }
  i = floor((x - .5 * width) / w) + 4
  j = floor((y - .5 * height) / w) + 4
  return [i, j]
}

function ij_xy() {
  if (arguments[0] instanceof Array) {
    [i, j] = arguments[0]
  } else {
    [i, j] = arguments
  }
  x = width / 2 + (i - 3.5) * w
  y = height / 2 + (j - 3.5) * w
  return [x, y]
}

function pos() {
  if (arguments[0] instanceof Array) {
    ij = arguments[0]
  } else {
    ij = [arguments[0], arguments[1]]
  }
  return positions[ij[1]][ij[0]]
}

function mousePressed() {
  let ij = xy_ij(mouseX, mouseY)
  let isOnBoard = ij[0] >= 0 && ij[0] < 8 && ij[1] >= 0 && ij[1] < 8
  let isSelected = selectedCell.length > 0
  let isSameColor = isSelected ? (("rnbqkp".indexOf(pos(ij)) >= 0) && ("rnbqkp".indexOf(pos(selectedCell)) >= 0)) ||
    (("RNBQKP".indexOf(pos(ij)) >= 0) && ("RNBQKP".indexOf(pos(selectedCell)) >= 0)) : false

  let isSame = isSelected ? (ij[0] == selectedCell[0] && ij[1] == selectedCell[1]) : false

  let isEmptyCell = isOnBoard ? pos(ij) == " " : false
  let isActivePlayer = isOnBoard ? (!isPlayerWhite && "RNBQKP".indexOf(pos(ij)) >= 0) ||
    (isPlayerWhite && "rnbqkp".indexOf(pos(ij)) >= 0) : false
  let isAllowed = false
  for (let allowed = 0; allowed < allowedMoves.length; allowed++) {
    if (ij[0] == allowedMoves[allowed][0] && ij[1] == allowedMoves[allowed][1]) {
      isAllowed = true
    }
  }

  if (isSame || !isOnBoard || (!isSelected && isEmptyCell)) {
    selectedCell = []
    allowedMoves = []
    draw()
    return "selected out"
  }
  if (isAllowed) {
    // castling
    if ((pos(selectedCell) == "k" || pos(selectedCell) == "K") && abs(selectedCell[0] - ij[0]) == 2) {
      if (selectedCell[0] - ij[0] > 0) {
        oldPos = [0, ij[1]]
        newPos = [3, ij[1]]
        movePiece(oldPos, newPos)
      } else {
        oldPos = [7, ij[1]]
        newPos = [5, ij[1]]
        movePiece(oldPos, newPos)
      }
    }
    // promotion
    if (pos(selectedCell) == "p" && ij[1] == 0) {
      positions[selectedCell[1]] = positions[selectedCell[1]].splice(selectedCell[0], 1, "q")
    }
    if (pos(selectedCell) == "P" && ij[1] == 7) {
      positions[selectedCell[1]] = positions[selectedCell[1]].splice(selectedCell[0], 1, "Q")
    }
    // en-passant
    if ((pos(selectedCell) == "p" || pos(selectedCell) == "P") && abs(selectedCell[1] - ij[1]) == 2) {
      if (selectedCell[1] - ij[1] > 0) {
        enpassant = [
          [ij[0], ij[1] + 1],
          [ij[0], ij[1]], false
        ]
      } else {
        enpassant = [
          [ij[0], ij[1] - 1],
          [ij[0], ij[1]], false
        ]
      }
    } else {
      if (enpassant.length > 0) {
        if (ij[0] == enpassant[0][0] && ij[1] == enpassant[0][1]) {
          movePiece(enpassant[0], enpassant[1])
        }
      }
      enpassant = []
    }
    // movement
    movePiece(selectedCell, ij)
    selectedCell = []
    allowedMoves = []
    isPlayerWhite = !isPlayerWhite
    draw()
    return "eats or moves"
  }
  if ((isOnBoard && !isSelected && !isEmptyCell && isActivePlayer) || (isOnBoard && isSameColor && isActivePlayer)) {
    selectedCell = ij
    pushAllowedMoves(ij)
    draw()
    return "selected new"
  }
  return false
}

function movePiece(oldPos, newPos) {
  positions[newPos[1]] = positions[newPos[1]].splice(newPos[0], 1, pos(oldPos))
  positions[oldPos[1]] = positions[oldPos[1]].splice(oldPos[0], 1, " ")
}

function showSelected() {
  if (arguments.length > 0) {
    if (arguments[0] instanceof Array) {
      ij = arguments[0]
    } else {
      ij = [arguments[0], arguments[1]]
    }
  } else if (selectedCell.length > 0) {
    ij = selectedCell
  } else {
    return false
  }
  rectMode(CENTER)
  stroke(config.selectedBorder)
  strokeWeight(config.selectedWeight)
  noFill(config.selectedCell)
  rect(ij_xy(ij)[0], ij_xy(ij)[1], w - config.selectedWeight, w - config.selectedWeight)
  return true
}

function showAllowedMoves() {
  if (allowedMoves.length > 0) {
    allowedMoves.forEach(element => {
      showAllowedMove(element)
    });
  }
  if (enpassant.length > 0) {
    if (enpassant[2]) {
      showAsEatingMove([enpassant[1][0], enpassant[1][1]])
    }
  }
  return true
}

function showAllowedMove() {
  if (arguments[0] instanceof Array) {
    ij = arguments[0]
  } else {
    ij = [arguments[0], arguments[1]]
  }
  if (pos(ij) == " ") {
    showAsAllowedMove(ij)
  } else {
    showAsEatingMove(ij)
  }
}

function showAsAllowedMove(ij) {
  fill(config.allowedMoveCell)
  stroke(config.allowedMoveBorder)
  strokeWeight(config.allowedMoveWeight)
  rectMode(CENTER)
  rect(ij_xy(ij)[0], ij_xy(ij)[1], w - config.allowedMoveWeight, w - config.allowedMoveWeight)
}

function showAsEatingMove(ij) {
  console.log("show as eating",ij)
  fill(config.allowedEatingCell)
  stroke(config.allowedEatingBorder)
  strokeWeight(config.allowedEatingWeight)
  rectMode(CENTER)
  rect(ij_xy(ij)[0], ij_xy(ij)[1], w - config.allowedEatingWeight, w - config.allowedEatingWeight)
}

function pushAllowedMoves() {
  let ij
  if (arguments.length > 0) {
    if (arguments[0] instanceof Array) {
      ij = arguments[0]
      eats = arguments
    } else {
      ij = [arguments[0], arguments[1]]
    }
    piece = pos(ij)
    allowedMoves = []
    if (piece == "p") {
      if (pushAllowedMove([ij[0], ij[1] - 1]) && ij[1] == 6) {
        pushAllowedMove([ij[0], ij[1] - 2])
      }
      pushAllowedMove([ij[0] - 1, ij[1] - 1], "RNBQKP")
      pushAllowedMove([ij[0] + 1, ij[1] - 1], "RNBQKP")
      //enpassant
      if (enpassant.length > 0) {
        if ((enpassant[0][0] == ij[0] - 1) && (enpassant[0][1] == ij[1] - 1)) {
          enpassant[2] = true
          pushAllowedMove([ij[0] - 1, ij[1] - 1])
        }
        if ((enpassant[0][0] == ij[0] + 1) && (enpassant[0][1] == ij[1] - 1)) {
          enpassant[2] = true
          pushAllowedMove([ij[0] + 1, ij[1] - 1])
        }
      }
    }
    if (piece == "P") {
      if (pushAllowedMove([ij[0], ij[1] + 1]) && ij[1] == 1) {
        pushAllowedMove([ij[0], ij[1] + 2])
      }
      pushAllowedMove([ij[0] - 1, ij[1] + 1], "rnbqkp")
      pushAllowedMove([ij[0] + 1, ij[1] + 1], "rnbqkp")
      //enpassant
      if (enpassant.length > 0) {
        if ((enpassant[0][0] == ij[0] - 1) && (enpassant[0][1] == ij[1] + 1)) {
          enpassant[2] = true
          pushAllowedMove([ij[0] - 1, ij[1] + 1])
        }
        if ((enpassant[0][0] == ij[0] + 1) && (enpassant[0][1] == ij[1] + 1)) {
          enpassant[2] = true
          pushAllowedMove([ij[0] + 1, ij[1] + 1])
        }
      }
    }
    if (piece == "n" || piece == "N") {
      if (piece == "n") {
        eats = " RNBQKP"
      } else {
        eats = " rnbqkp"
      }
      pushAllowedMove([ij[0] - 2, ij[1] - 1], eats)
      pushAllowedMove([ij[0] - 2, ij[1] + 1], eats)
      pushAllowedMove([ij[0] - 1, ij[1] - 2], eats)
      pushAllowedMove([ij[0] - 1, ij[1] + 2], eats)
      pushAllowedMove([ij[0] + 2, ij[1] - 1], eats)
      pushAllowedMove([ij[0] + 2, ij[1] + 1], eats)
      pushAllowedMove([ij[0] + 1, ij[1] - 2], eats)
      pushAllowedMove([ij[0] + 1, ij[1] + 2], eats)
    }
    if (piece == "b" || piece == "B") {
      if (piece == "b") {
        eats = " RNBQKP"
      } else {
        eats = " rnbqkp"
      }
      i = 1
      while (pushAllowedMove([ij[0] + i, ij[1] + i], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0] + i, ij[1] - i], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0] - i, ij[1] + i], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0] - i, ij[1] - i], eats)) {
        i++
      }
    }
    if (piece == "r" || piece == "R") {
      if (piece == "r") {
        eats = " RNQKP"
      } else {
        eats = " rnqkp"
      }
      i = 1
      while (pushAllowedMove([ij[0] + i, ij[1]], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0] - i, ij[1]], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0], ij[1] + i], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0], ij[1] - i], eats)) {
        i++
      }
    }
    if (piece == "k" || piece == "K") {
      if (piece == "k") {
        eats = " RNBQKP"
      } else {
        eats = " rnbqk"
      }
      pushAllowedMove([ij[0] - 1, ij[1] - 1], eats)
      pushAllowedMove([ij[0] - 1, ij[1] + 0], eats)
      pushAllowedMove([ij[0] - 1, ij[1] + 1], eats)
      pushAllowedMove([ij[0] + 0, ij[1] - 1], eats)
      pushAllowedMove([ij[0] + 0, ij[1] + 1], eats)
      pushAllowedMove([ij[0] + 1, ij[1] - 1], eats)
      pushAllowedMove([ij[0] + 1, ij[1] + 0], eats)
      pushAllowedMove([ij[0] + 1, ij[1] + 1], eats)
      if (checkCastling(ij, 1)) {
        pushAllowedMove([ij[0] + 2, ij[1]])
      }
      if (checkCastling(ij, -1)) {
        pushAllowedMove([ij[0] - 2, ij[1]])
      }
    }
    if (piece == "q" || piece == "Q") {
      if (piece == "q") {
        eats = " RNBQKP"
      } else {
        eats = " rnbqkp"
      }
      i = 1
      while (pushAllowedMove([ij[0] + i, ij[1] + i], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0] + i, ij[1] - i], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0] - i, ij[1] + i], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0] - i, ij[1] - i], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0] + i, ij[1]], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0] - i, ij[1]], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0], ij[1] + i], eats)) {
        i++
      }
      i = 1
      while (pushAllowedMove([ij[0], ij[1] - i], eats)) {
        i++
      }
    }
    return true
  }
  return false
}

function pushAllowedMove() {
  let ij
  if (arguments[0] instanceof Array) {
    ij = arguments[0]
    if (arguments[1]) {
      checkAgainst = arguments[1]
    } else {
      checkAgainst = " "
    }
  } else {
    ij = [arguments[0], arguments[1]]
    if (arguments[2]) {
      checkAgainst = arguments[2]
    } else {
      checkAgainst = " "
    }
  }
  if (ij[0] >= 0 && ij[0] < 8 && ij[1] >= 0 && ij[1] < 8 && checkAgainst.indexOf(pos(ij)) >= 0) {
    if (pos(ij) == " ") {
      allowedMoves.push(ij)
      return true
    } else {
      allowedMoves.push(ij)
      return false
    }
  } else {
    return false
  }
}

function checkCastling() { // last arg is direction: 1 to the right, -1 to the left
  let ij
  if (arguments.length > 0) {
    if (arguments[0] instanceof Array) {
      ij = arguments[0]
      direction = arguments[1]
    } else {
      ij = [arguments[0], arguments[1]]
      direction = arguments[2]
    }
  } else {
    return false
  }
  // neither king or rook have moved, space between is free 
  cond1 = hasMoved[ij[1]][ij[0]]
  cond2 = (direction == 1) && !hasMoved[ij[1]][7] && (pos(5, ij[1]) == " ") && (pos(6, ij[1]) == " ")
  cond3 = (direction == -1) && !hasMoved[ij[1]][0] && (pos(3, ij[1]) == " ") && (pos(2, ij[1]) == " ") && (pos(1, ij[1]) == " ")
  return !cond1 && (cond2 || cond3)
}

function touchMoved(event) {
  // console.log(event)
  // if (event.movementY == -1) {
  //   if (swipeup == 0){
  //     swipeup = mouseY
  //   } 
  //   console.log(swipeup-mouseY)
  //loop()
  // }
}

function drawMenu() {
  if (swipeup == 1) {
    return false
  }
  console.log(swipeup)
  w = min(width, height) / 8
  stroke(config.menuBorderColor)
  strokeWeight(config.menuWeight)
  fill(config.menuColor)
  rectMode(CENTER)
  rect(width / 2, height / 2 + height / 2, 7 * w, 7 * w)
}

function onMouseLeave() {
  // noLoop();
}

function onMouseEnter() {
  // loop();
}

// TODO right click or long press to show available moves
// TODO swipe up to show menu
// TODO variant https://en.wikipedia.org/wiki/Chaturanga , https://en.wikipedia.org/wiki/Chaturaji , https://en.wikipedia.org/wiki/Xiangqi 
// Chaturanga pieces=["⊛👑🐘🐎🏹💎"]
// TODO progress bar on each side for playing the clock