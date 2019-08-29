var blockSize = 100
var fieldSize = 9
var serverX = 4
var serverY = 4
var score = 0
var connectorGenList = []
var panelHeight
var panelWidth
var turnsList = []
var hintActive = false
var timeStop = false
var time = 0
var backTimeTick = 0
var rotateActive = false
var rotateConnector
var field = []
var fieldFilled = false
var gameSettings =
{
	mode: 9,
	records:
	[
		[999, 999],
		[999, 999],
		[999, 999],
		[999, 999],
		[999, 999],
		[999, 999]
	]
}

function readSettings() {
	var s = localStorage.getItem('settings')
	if (s == null) {
		saveSettings()
	} else {
		gameSettings = JSON.parse(s)
		fieldSize = gameSettings.mode
	}
}

function saveSettings() {
	localStorage.setItem('settings', JSON.stringify(gameSettings))
}

function rand(n) {
	return Math.floor(Math.random() * n)
}

function allBlocks(f) {
  for (var y = 0; y < fieldSize; y++) {
    for (var x = 0; x < fieldSize; x++) {
      f(x, y)
    }
  }
}

function addCursor() {
  var blocks = document.getElementsByClassName('block')
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].onmouseenter = function() {
		if (hintActive) {
			this.className = 'block-hint'
		} else {
      		this.className = 'block-cursor'
		}
    }
    blocks[i].onmouseleave = function() {
      this.className = 'block'
    }
  }
}

function drawBlock(x, y) {
  var connector
  if (fieldFilled) {
    connector = getConnector(x, y)
  } else {
    connector = document.getElementById('connector-' + x + '-' + y)
  }
  var contacts = connector.getAttribute('connector')
  var active = connector.getAttribute('active')
  var backC = connector.getAttribute('backC')
  var backA = connector.getAttribute('backA')
  if (contacts == backC && active == backA) {
    return
  } else {
    connector.setAttribute('backC', contacts)
    connector.setAttribute('backA', active)
  }
  var c1 = contacts.substr(0, 1)
  var c2 = contacts.substr(1, 1)
  var c3 = contacts.substr(2, 1)
  var c4 = contacts.substr(3, 1)
  var color
  if (active == '0') {
    color = '%23d3d3d3'
  } else {
    color = '%2387cefa'
  }
	var up = ''
	var right = ''
	var down = ''
	var left = ''
	if (c1 == '1') {
		up = 'L 41 41 L 41 -5 L 59 -5 L 59 41'
	}
	if (c2 == '1') {
		right = 'L 59 41 L 105 41 L 105 59 L 59 59'
	}
	if (c3 == '1') {
		down = 'L 59 59 L 59 105 L 41 105 L 41 59'
	}
	if (c4 == '1') {
		left = 'L 41 59 L -5 59 L -5 41 L 41 41'
	}
  var svg = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100px\' height=\'100px\'%3E %3Cpath fill=\'' + color + '\' d=\'M 41 41 ' + up + ' L 59 41 ' + right + ' L 59 59 ' + down + ' L 41 59 ' + left + '  Z\' /%3E %3C/svg%3E")'
	if (c1 + c2 + c3 + c4 == '0000') {
		svg = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100px\' height=\'100px\'%3E%3C/svg%3E")'
	}
	if (connector.children.length == 1 && connector.children[0].classList.contains('pc')) {
		connector.children[0].classList.remove('pc-on')
		connector.children[0].classList.remove('pc-off')
		if (active == '0') {
			connector.children[0].classList.add('pc-off')
		} else {
			connector.children[0].classList.add('pc-on')
		}
	}
  connector.style.backgroundImage = svg
}

function addBlock(x, y) {
    var tField = document.getElementsByClassName('field')[0]
    var active = '0'
    var connector = '0000'
    tField.innerHTML += '<div id="block-' + x + '-' + y + '" class="block"><div id="connector-' + x + '-' + y + '" class="connector" connector="' + connector + '" active="' + active + '" backC="-1" backA="-1"></div></div>'
    field[x][y] = document.getElementById('connector-' + x + '-' + y)
    drawBlock(x, y)
    if (x == fieldSize - 1) {
      tField.innerHTML += '<br />'
    }
}

function correctXY(n) {
  if (n >= 0) {
    return n % fieldSize
  } else {
		var x = n % fieldSize
		if (x == 0) {
			return 0
		} else {
			return fieldSize + x
		}
  }
}

function getConnector(x, y) {
  var rx = correctXY(x)
  var ry = correctXY(y)
  return field[rx][ry]
}

function checkUp(x, y) {
	  var connector = getConnector(x, y)
		var connectorUp = getConnector(x, y - 1)
		var contacts = connector.getAttribute('connector')
		var contactsUp = connectorUp.getAttribute('connector')
		var active = connectorUp.getAttribute('active')
		var rotate = connector.getAttribute('rotate')
		var rotateUp = connectorUp.getAttribute('rotate')
		if (contacts.substr(0, 1) == '1' && contactsUp.substr(2, 1) == '1' && active == '0' && rotate == '0' && rotateUp == '0') {
			return true
		} else {
			return false
		}
}

function checkDown(x, y) {
	  var connector = getConnector(x, y)
		var connectorDown = getConnector(x, y + 1)
		var contacts = connector.getAttribute('connector')
		var contactsDown = connectorDown.getAttribute('connector')
		var active = connectorDown.getAttribute('active')
		var rotate = connector.getAttribute('rotate')
		var rotateDown = connectorDown.getAttribute('rotate')
		if (contacts.substr(2, 1) == '1' && contactsDown.substr(0, 1) == '1' && active == '0' && rotate == '0' && rotateDown == '0') {
			return true
		} else {
			return false
		}
}

function checkRight(x, y) {
	  var connector = getConnector(x, y)
		var connectorRight = getConnector(x + 1, y)
		var contacts = connector.getAttribute('connector')
		var contactsRight = connectorRight.getAttribute('connector')
		var active = connectorRight.getAttribute('active')
		var rotate = connector.getAttribute('rotate')
		var rotateRight = connectorRight.getAttribute('rotate')
		if (contacts.substr(1, 1) == '1' && contactsRight.substr(3, 1) == '1' && active == '0' && rotate == '0' && rotateRight == '0') {
			return true
		} else {
			return false
		}
}

function checkLeft(x, y) {
	  var connector = getConnector(x, y)
		var connectorLeft = getConnector(x - 1, y)
		var contacts = connector.getAttribute('connector')
		var contactsLeft = connectorLeft.getAttribute('connector')
		var active = connectorLeft.getAttribute('active')
		var rotate = connector.getAttribute('rotate')
		var rotateLeft = connectorLeft.getAttribute('rotate')
		if (contacts.substr(3, 1) == '1' && contactsLeft.substr(1, 1) == '1' && active == '0' && rotate == '0' && rotateLeft == '0') {
			return true
		} else {
			return false
		}
}

function setUp(x, y) {
  var connector = getConnector(x, y)
  var contacts = connector.getAttribute('connector')
  var res = '1' + contacts.substr(1, 3)
  connector.setAttribute('connector', res)
}

function setRight(x, y) {
  var connector = getConnector(x, y)
  var contacts = connector.getAttribute('connector')
  var res = contacts.substr(0, 1) + '1' + contacts.substr(2, 2)
  connector.setAttribute('connector', res)
}

function setDown(x, y) {
  var connector = getConnector(x, y)
  var contacts = connector.getAttribute('connector')
  var res = contacts.substr(0, 2) + '1' + contacts.substr(3, 1)
  connector.setAttribute('connector', res)
}

function setLeft(x, y) {
  var connector = getConnector(x, y)
  var contacts = connector.getAttribute('connector')
  var res = contacts.substr(0, 3) + '1'
  connector.setAttribute('connector', res)
}

function setUpConnect(x, y) {
  setUp(x, y)
  setDown(x, y - 1)
}

function setDownConnect(x, y) {
  setDown(x, y)
  setUp(x, y + 1)
}

function setRightConnect(x, y) {
  setRight(x, y)
  setLeft(x + 1, y)
}

function setLeftConnect(x, y) {
  setLeft(x, y)
  setRight(x - 1, y)
}

function getConnectionsCount(x, y) {
  var connector = getConnector(x, y)

  if (connector.getAttribute('connector') == null) {
    return 0
  }

  var c1 = parseInt(connector.getAttribute('connector').substr(0, 1))
  var c2 = parseInt(connector.getAttribute('connector').substr(1, 1))
  var c3 = parseInt(connector.getAttribute('connector').substr(2, 1))
  var c4 = parseInt(connector.getAttribute('connector').substr(3, 1))

  return c1 + c2 + c3 + c4
}

function getFreeBlock(x, y) {
  var free = 4
  if (getConnectionsCount(x - 1, y) != 0) {
    free--
  }
  if (getConnectionsCount(x + 1, y) != 0) {
    free--
  }
  if (getConnectionsCount(x, y + 1) != 0) {
    free--
  }
  if (getConnectionsCount(x, y - 1) != 0) {
    free--
  }
  return free
}

function addServer() {
  var connector = getConnector(serverX, serverY)
  connector.innerHTML = '<div class="server"></div>'
}

function genConnector() {
	var nxy = rand(connectorGenList.length)
	var xy = connectorGenList[nxy]
	connectorGenList.splice(nxy, 1)
	var x = xy[0]
	var y = xy[1]
  var freeBlocks = getFreeBlock(x, y)
  if (freeBlocks == 0) {
    return
  }

  if (freeBlocks == 4) {
    freeBlocks = 3
  } else if (freeBlocks == 3) {
    freeBlocks = 2
  }

  var randC = rand(freeBlocks) + 1
  var realC = ''
	var listC = 'udrl'

	if (getConnectionsCount(x, y - 1) != 0) {
		listC = listC.replace('u', '')
	}

	if (getConnectionsCount(x, y + 1) != 0) {
		listC = listC.replace('d', '')
	}

	if (getConnectionsCount(x + 1, y) != 0) {
		listC = listC.replace('r', '')
	}

	if (getConnectionsCount(x - 1, y) != 0) {
		listC = listC.replace('l', '')
	}

  while (randC != 0) {
		var ch = listC.substr(rand(listC.length), 1)
		realC += ch
		listC = listC.replace(ch, '')
		randC--

    if (ch == 'r') {
      setRightConnect(x, y)
    }

    if (ch == 'l') {
      setLeftConnect(x, y)
    }

    if (ch == 'u') {
      setUpConnect(x, y)
    }

    if (ch == 'd') {
      setDownConnect(x, y)
    }
  }

  for (var i = 0; i < realC.length; i++) {
    var c = realC.substr(i, 1)

    if (c == 'u') {
			connectorGenList.push([x, y - 1])
    }

    if (c == 'r') {
			connectorGenList.push([x + 1, y])
    }

    if (c == 'd') {
			connectorGenList.push([x, y + 1])
    }

    if (c == 'l') {
			connectorGenList.push([x - 1, y])
    }
  }
}


function drawConnect() {
  allBlocks(drawBlock)
}

function setPC(x, y) {
	if (x == serverX && y == serverY) {
		return
	}

	if (getConnectionsCount(x, y) == 1) {
		var connector = getConnector(x, y)
		connector.innerHTML = '<div class="pc pc-off"></div>'
	}
}

function clearActive() {
	allBlocks(function(x, y) {
		var connector = getConnector(x, y)
		connector.setAttribute('active', '0')
	})
}

function initPC() {
	allBlocks(setPC)
}

function fillField(x, y) {
	var connector = getConnector(x, y)
	connector.setAttribute('active', '1')

	if (checkUp(x, y)) {
		fillField(x, y - 1)
	}

	if (checkDown(x, y)) {
		fillField(x, y + 1)
	}

	if (checkLeft(x, y)) {
		fillField(x - 1, y)
	}

	if (checkRight(x, y)) {
		fillField(x + 1, y)
	}
}

function rotateLeftConnector(connector) {
	var contacts = connector.getAttribute('connector')
	contacts = contacts.substr(1, 3) + contacts.substr(0, 1)
	connector.setAttribute('connector', contacts)
}

function rotateRightConnector(connector) {
	var contacts = connector.getAttribute('connector')
	contacts = contacts.substr(3, 1) + contacts.substr(0, 3)
	connector.setAttribute('connector', contacts)
}

function endAnimation() {
	rotateConnector.setAttribute('rotate', '0')
	if (rotateConnector.classList.contains('contacts-rotate-left')) {
		rotateLeftConnector(rotateConnector)
	} else {
		rotateRightConnector(rotateConnector)
	}
	rotateConnector.classList.remove('contacts-rotate-left')
	rotateConnector.classList.remove('contacts-rotate-right')
	if (rotateConnector.children.length == 1) {
		rotateConnector.children[0].classList.remove('device-rotate-left')
		rotateConnector.children[0].classList.remove('device-rotate-right')
	}
	clearActive()
	fillField(serverX, serverY)
	drawConnect()
	rotateActive = false
	endGame()
}

function blockClick(handle) {
	if (rotateActive) {
		return
	}
	var lastTurn = ['none', 'none']
	if (turnsList.length > 0) {
		lastTurn = turnsList[turnsList.length - 1]
	}
	if (handle.button == 0 && !this.classList.contains('block-lock') && !this.classList.contains('block-hint-lock') && this.getAttribute('connector') != '0000') {
		if (hintActive) {
			hintActive = false
			var original = this.getAttribute('original-connector')
			var ds = 0
			while (original != this.getAttribute('connector')) {
				rotateLeftConnector(this)
				ds++
			}
			if (ds == 3) {
				ds = 1
			}
			score += ds
			this.classList.add('block-hint-lock')
			var hintButton = document.getElementById('get-hint')
			hintButton.classList.remove('fa-active')
			hintButton.classList.add('fa-disable')
		} else {
			if (lastTurn[0] == this.id && lastTurn[1] == 2) {
				score--
				turnsList.pop()
			} else {
				score++
				turnsList.push([this.id, 0])
			}
			rotateActive = true
			this.setAttribute('rotate', '1')
			this.classList.add('contacts-rotate-left')
			if (this.children.length == 1) {
				this.children[0].classList.add('device-rotate-left')
			}
			rotateConnector = this
			setTimeout(endAnimation, 150)
		}
		clearActive()
		fillField(serverX, serverY)
		drawConnect()
		drawTurns()
	} else if (handle.button == 2 && !this.classList.contains('block-lock') && !this.classList.contains('block-hint-lock') && this.getAttribute('connector') != '0000') {
		if (hintActive) {
			return
		}
		if (lastTurn[0] == this.id && lastTurn[1] == 0) {
			score--
			turnsList.pop()
		} else {
			score++
			turnsList.push([this.id, 2])
		}
		rotateActive = true
		this.setAttribute('rotate', '1')
		this.classList.add('contacts-rotate-right')
		if (this.children.length == 1) {
			this.children[0].classList.add('device-rotate-right')
		}
		rotateConnector = this
		setTimeout(endAnimation, 150)
		clearActive()
		fillField(serverX, serverY)
		drawConnect()
		drawTurns()
	} else if (handle.button == 1) {
		if (lastTurn[0] == this.id && lastTurn[1] == 1) {
			turnsList.pop()
		} else {
			turnsList.push([this.id, 1])
		}
		if (this.classList.contains('block-lock')) {
			this.classList.remove('block-lock')
		} else {
			this.classList.add('block-lock')
		}
	}
}

function cancelTurn() {
	if (turnsList.length > 0) {
		var turn = turnsList.pop()
		var connector = document.getElementById(turn[0])
		if (connector.classList.contains('block-hint-lock')) {
			cancelTurn()
			return
		}
		if (turn[1] == 0) {
			score--
			rotateActive = true
			connector.setAttribute('rotate', '1')
			connector.classList.add('contacts-rotate-right')
			if (connector.children.length == 1) {
				connector.children[0].classList.add('device-rotate-right')
			}
			rotateConnector = connector
			setTimeout(endAnimation, 150)
			clearActive()
			fillField(serverX, serverY)
			drawConnect()
			drawTurns()
		} else if (turn[1] == 2) {
			score--
			rotateActive = true
			connector.setAttribute('rotate', '1')
			connector.classList.add('contacts-rotate-left')
			if (connector.children.length == 1) {
				connector.children[0].classList.add('device-rotate-left')
			}
			rotateConnector = connector
			setTimeout(endAnimation, 150)
			clearActive()
			fillField(serverX, serverY)
			drawConnect()
			drawTurns()
		} else if (turn[1] == 1) {
			if (connector.classList.contains('block-lock')) {
				connector.classList.remove('block-lock')
			} else {
				connector.classList.add('block-lock')
			}
		}
	}
}

function rotateLeft(x, y) {
	var connector = getConnector(x, y)
	rotateLeftConnector(connector)
}

function rotateRight(x, y) {
	var connector = getConnector(x, y)
	rotateRightConnector(connector)
}

function randomRotate(x, y) {
	var connector = getConnector(x, y)
	var contacts = connector.getAttribute('connector')
	if (contacts == '0000') {
		return
	}

	connector.setAttribute('original-connector', contacts)
	connector.setAttribute('rotate', '0')

	if (contacts == '0101' || contacts == '1010') {
		if (rand(2) == 0) {
			rotateRightConnector(connector)
			score--
		}
	} else {
		switch (rand(4)) {
			case 0:
				break
			case 1:
				rotateRightConnector(connector)
				score--
				break
			case 2:
				rotateRightConnector(connector)
				rotateRightConnector(connector)
				score -= 2
				break
			case 3:
				rotateLeftConnector(connector)
				score--
				break
			default:
				break
		}
	}
}

function rotateField() {
	score = 0
	allBlocks(randomRotate)
}

function createField() {
	turnsList = []
	serverX = parseInt(fieldSize / 2 - 0.5)
	serverY = serverX
  fieldFilled = false
  field = []
  for (var i = 0; i < fieldSize; i++) {
    var layer = []
    for (var j = 0; j < fieldSize; j++) {
      layer.push(null)
    }
    field.push(layer)
  }
  document.getElementsByClassName('field')[0].innerHTML = ''
	allBlocks(addBlock)
  allBlocks(function (x, y) {
    field[x][y] = document.getElementById('connector-' + x + '-' + y)
  })
  fieldFilled = true

  addServer()

	connectorGenList = []
	connectorGenList.push([serverX, serverY])
	while (connectorGenList.length > 0) {
  	genConnector()
	}

	initPC()

	rotateField()

	clearActive()

	fillField(serverX, serverY)

	allBlocks(function(x, y) {
		var connector = getConnector(x, y)
		connector.onmousedown = blockClick
	})

  drawConnect()

	backTimeTick = Date.now()
	time = 0
}

function getHint() {
	if (this.classList.contains('fa-disable')) {
		return
	}
	if (hintActive) {
		hintActive = false
		this.classList.remove('fa-active')
		this.classList.add('fa-click')
	} else {
		hintActive = true
		this.classList.remove('fa-click')
		this.classList.add('fa-active')
	}
}

function initHint() {
	hintActive = false
	var hintButton = document.getElementById('get-hint')
	hintButton.classList.remove('fa-active')
	hintButton.classList.remove('fa-disable')
	hintButton.classList.add('fa-click')
}

function startGame() {
	initHint()
  createField()
  addCursor()
	resizeField()
	drawTurns()
}

function drawTurns() {
	var turns = document.getElementById('turns')
	turns.innerText = score
	turns.style.fontSize = parseInt(panelHeight / 3) + 'px'
	turns.style.bottom = parseInt((panelHeight - turns.offsetHeight) / 2)
	turns.style.left = panelHeight + 10 + parseInt((panelHeight - 20 - turns.offsetWidth) / 2)
	if (score <= 0) {
		turns.style.color = '#6c6'
	} else {
		turns.style.color = '#c66'
	}
}

function resizeField() {
  var width = window.innerWidth
  var height = window.innerHeight
  if (width < height) {
    blockSize = parseInt(width / fieldSize)
		panelWidth = parseInt(width / 9) * 2
		panelHeight = parseInt(width / 9)
  } else {
    blockSize = parseInt(height / fieldSize)
		panelWidth = parseInt(height / 9) * 2
		panelHeight = parseInt(height / 9)
  }

  var blocks = document.getElementsByClassName('block')
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].style.width = blockSize
    blocks[i].style.height = blockSize
  }

  var field = document.getElementsByClassName('field')[0]
  field.style.marginTop = parseInt((height - blockSize * fieldSize) / 2)
  field.style.marginLeft = parseInt((width - blockSize * fieldSize) / 2)

  var score = document.getElementsByClassName('score')[0]
  score.style.width = panelWidth
  score.style.height = panelHeight
  score.style.borderTopLeftRadius = parseInt(panelHeight / 2) + 'px'

  var turns = document.getElementsByClassName('turns')[0]
  turns.style.width = panelWidth
  turns.style.height = panelHeight
  turns.style.borderTopRightRadius = parseInt(panelHeight / 2) + 'px'

	var turns = document.getElementById('turns')
	turns.style.fontSize = parseInt(panelHeight / 3) + 'px'
	turns.style.bottom = parseInt((panelHeight - turns.offsetHeight) / 2)
	turns.style.left = panelHeight + 10 + parseInt((panelHeight - 20 - turns.offsetWidth) / 2)

  var panelLeft = document.getElementsByClassName('panel-left')[0]
  panelLeft.style.width = panelWidth
  panelLeft.style.height = panelHeight
  panelLeft.style.borderBottomRightRadius = parseInt(panelHeight / 2) + 'px'

  var panelRight = document.getElementsByClassName('panel-right')[0]
  panelRight.style.width = panelWidth
  panelRight.style.height = panelHeight
  panelRight.style.borderBottomLeftRadius = parseInt(panelHeight / 2) + 'px'

	var panelTexts = document.getElementsByClassName('panel-text')
	for (var i = 0; i < panelTexts.length; i++) {
		panelTexts[i].style.fontSize = (panelHeight - 20) + 'px'
	}

	var fars = document.getElementsByClassName('far')
	for (var i = 0; i < fars.length; i++) {
		fars[i].style.fontSize = panelHeight - 20
	}

	var fars = document.getElementsByClassName('fas')
	for (var i = 0; i < fars.length; i++) {
		fars[i].style.fontSize = panelHeight - 20
	}

	var mods = document.getElementsByClassName('modes')[0]
	var modHeight
	if (width > height) {
		modHeight = parseInt(height / 7)
	} else {
		modHeight = parseInt(width / 7)
	}
	mods.style.width = modHeight * 5
	mods.style.height = modHeight * 5
	mods.style.marginTop = parseInt(height / 2 - modHeight * 2.5)
	mods.style.marginLeft = parseInt(width / 2 - modHeight * 2.5)

	var modeList = document.getElementsByClassName('mode')
	for (var i = 0; i < modeList.length; i++) {
		modeList[i].style.width = modHeight * 5 - parseInt(modHeight * 0.4)
		modeList[i].style.height = modHeight - parseInt(modHeight * 0.4)
		modeList[i].style.fontSize = parseInt(modHeight * 0.5) + 'px'
		modeList[i].style.padding = parseInt(modHeight * 0.1) + 'px'
		modeList[i].style.margin = parseInt(modHeight * 0.1) + 'px'
	}
}

function showSelectMode() {
	var selectMode = document.getElementById('select-mode')
	selectMode.classList.remove('hide')
	var panels = document.getElementById('panels')
	panels.classList.add('hide')
	var game = document.getElementById('game')
	game.classList.add('blur')
}

function hideSelectMode() {
	var selectMode = document.getElementById('select-mode')
	selectMode.classList.add('hide')
	var panels = document.getElementById('panels')
	panels.classList.remove('hide')
	var game = document.getElementById('game')
	game.classList.remove('blur')
	drawTime()
	drawTurns()
}

function start(size) {
	fieldSize = size
	gameSettings.mode = fieldSize
	saveSettings()
	hideSelectMode()
	startGame()
}

function pauseHandler() {
	if (this.classList.contains('fa-click')) {
		timeStop = true
		document.getElementById('game').classList.add('hide')
		document.getElementsByClassName('panel-left')[0].classList.add('hide')
		document.getElementsByClassName('panel-right')[0].classList.add('hide')
		document.getElementsByClassName('turns')[0].classList.add('hide')
		this.classList.remove('fa-click')
		this.classList.add('fa-active')
	} else {
		timeStop = false
		document.getElementById('game').classList.remove('hide')
		document.getElementsByClassName('panel-left')[0].classList.remove('hide')
		document.getElementsByClassName('panel-right')[0].classList.remove('hide')
		document.getElementsByClassName('turns')[0].classList.remove('hide')
		this.classList.remove('fa-active')
		this.classList.add('fa-click')
		drawTurns()
	}
}

function newRecord(l, t, s) {
	gameSettings.records[l] = [t, s]
	saveSettings()
}

function endGame() {
	if (document.getElementsByClassName('pc-off').length == 0) {
		var endTime = parseInt(time / 1000)
		if (endTime > 999) {
			endTime = 999
		}
		if (score < 0) {
			score = 0
		}
		var level = parseInt((fieldSize - 4) / 2 - 0.5)
		var nr = false
		if (gameSettings.records[level][1] > score) {
			newRecord(level, endTime, score)
			nr = true
		} else if (gameSettings.records[level][1] == score && gameSettings.records[level][0] > endTime) {
				newRecord(level, endTime, score)
				nr = true
		}
		console.log(nr)
		document.getElementById('panels').classList.add('hide')
		document.getElementById('game').classList.add('blur')
		document.getElementById('game-over').classList.remove('hide')
		document.getElementById('end-time').innerText = endTime
		document.getElementById('end-turns').innerText = score
		if (nr) {
			document.getElementsByClassName('fa-long-arrow-alt-up')[0].style.display = 'inline-block'
		} else  {
			document.getElementsByClassName('fa-long-arrow-alt-up')[0].style.display = 'none'
		}
	}
}

function afterEndGame() {
	document.getElementById('panels').classList.remove('hide')
	document.getElementById('game').classList.remove('blur')
	document.getElementById('game-over').classList.add('hide')
	startGame()
}

function hideRecords() {
	document.getElementById('panels').classList.remove('hide')
	document.getElementById('game').classList.remove('blur')
	document.getElementById('records').classList.add('hide')
	drawTime()
	drawTurns()
}

function showRecords() {
	document.getElementById('panels').classList.add('hide')
	document.getElementById('game').classList.add('blur')
	document.getElementById('records').classList.remove('hide')
	document.getElementById('end-time-5').innerText = gameSettings.records[0][0]
	document.getElementById('end-turns-5').innerText = gameSettings.records[0][1]
	document.getElementById('end-time-7').innerText = gameSettings.records[1][0]
	document.getElementById('end-turns-7').innerText = gameSettings.records[1][1]
	document.getElementById('end-time-9').innerText = gameSettings.records[2][0]
	document.getElementById('end-turns-9').innerText = gameSettings.records[2][1]
	document.getElementById('end-time-11').innerText = gameSettings.records[3][0]
	document.getElementById('end-turns-11').innerText = gameSettings.records[3][1]
	document.getElementById('end-time-13').innerText = gameSettings.records[4][0]
	document.getElementById('end-turns-13').innerText = gameSettings.records[4][1]
	document.getElementById('end-time-15').innerText = gameSettings.records[5][0]
	document.getElementById('end-turns-15').innerText = gameSettings.records[5][1]
}

function timeTick() {
	var delta = Date.now() - backTimeTick
	backTimeTick += delta
	if (!timeStop) {
		time += delta
	}
	drawTime()
}

function drawTime() {
	var timeView = document.getElementById('time')
	if (time / 1000 < 1000) {
		timeView.innerText = parseInt(time / 1000)
	} else {
		timeView.innerText = '999'
	}
	timeView.style.fontSize = parseInt(panelHeight / 3) + 'px'
	timeView.style.bottom = parseInt((panelHeight - timeView.offsetHeight) / 2)
	timeView.style.right = panelHeight + 10 + parseInt((panelHeight - 20 - timeView.offsetWidth) / 2)
}

function setEvents() {
	var newGame = document.getElementById('new-game')
	newGame.onclick = startGame
	document.getElementById('game-over').onclick = afterEndGame
	document.getElementById('show-records').onclick = showRecords
	document.getElementById('records').onclick = hideRecords
  window.onresize = resizeField

	var changeMode = document.getElementById('change-mode')
	changeMode.onclick = showSelectMode

	var closeChangeMode = document.getElementsByClassName('close-select-mode')[0]
	closeChangeMode.onclick = hideSelectMode

	var modes = document.getElementsByClassName('mode')
	for (var i = 0; i < modes.length; i++) {
		modes[i].onclick = function() {
			start(parseInt(this.getAttribute('value')))
		}
	}

	document.getElementById('cancel-turn').onclick = cancelTurn

	document.getElementById('get-hint').onclick = getHint

	document.getElementById('pause').onclick = pauseHandler

	setInterval(timeTick, 100)

	window.onload = drawTurns
}

document.oncontextmenu = function (){return false};
readSettings()
setEvents()
startGame()
