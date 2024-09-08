const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3
let blockSize = 100
let fieldSize = 9
let serverX = 4
let serverY = 4
let score = 0
let connectorGenList = []
let panelHeight
let panelWidth
let turnsList = []
let hintActive = false
let timeStop = false
let time = 0
let backTimeTick = 0
let rotateActive = false
let rotateConnector
let field = []
let currentSeed = ''
let gameSettings =
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
	let s = localStorage.getItem('connectSettings')
	if (s == null) {
		saveSettings()
	} else {
		gameSettings = JSON.parse(s)
		fieldSize = gameSettings.mode
	}
}

function saveSettings() {
	localStorage.setItem('connectSettings', JSON.stringify(gameSettings))
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

function rand(n) {
	return Math.floor(Math.random() * n)
}

function createSeed() {
	currentSeed = ''
	for (let i = 0; i < 16; i++) currentSeed += String.fromCharCode(97 + rand(26))
	const searchParams = new URLSearchParams(window.location.search)
	searchParams.set('seed', currentSeed)
	window.location.search = searchParams.toString()
}

function reverseDirection(d) {
	return (d + 2) % 4
}

function getPointDirection(x, y, d) {
	switch (d) {
		case UP: return [x, y - 1]
		case DOWN: return [x, y + 1]
		case RIGHT: return [x + 1, y]
		case LEFT: return [x - 1, y]
	}
}

function allBlocks(func) {
	for (let y = 0; y < fieldSize; y++) {
		for (let x = 0; x < fieldSize; x++) {
			func(x, y)
		}
	}
}

function drawBlock(x, y) {
	const connector = getConnector(x, y)
	let contacts = connector.getAttribute('connector')
	let active = connector.getAttribute('active')
	let backStateContacts = connector.getAttribute('backStateContacts')
	let backStateActive = connector.getAttribute('backStateActive')
	if (contacts == backStateContacts && active == backStateActive) return
	connector.setAttribute('backStateContacts', contacts)
	connector.setAttribute('backStateActive', active)
	let svg
	if (contacts == '0000') {
		connector.style.backgroundImage = ``
	} else {
		let color = active === '0' ? '%23d3d3d3' : '%2387cefa'
		let up = contacts[UP] === '1' ? 'L 41 41 L 41 -5 L 59 -5 L 59 41' : ''
		let right = contacts[RIGHT] === '1' ? 'L 59 41 L 105 41 L 105 59 L 59 59' : ''
		let down = contacts[DOWN] === '1' ? 'L 59 59 L 59 105 L 41 105 L 41 59' : ''
		let left = contacts[LEFT] === '1' ? 'L 41 59 L -5 59 L -5 41 L 41 41' : ''
		connector.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100px' height='100px'%3E %3Cpath fill='${color}' d='M 41 41 ${up} L 59 41 ${right} L 59 59 ${down} L 41 59 ${left} Z' /%3E %3C/svg%3E")`
	}
	if (connector.children.length == 1 && connector.children[0].classList.contains('pc')) {
		if (active == '0') {
			connector.children[0].classList.add('pc-off')
			connector.children[0].classList.remove('pc-on')
		} else {
			connector.children[0].classList.add('pc-on')
			connector.children[0].classList.remove('pc-off')
		}
	}
}

function addBlock(x, y) {
    const tField = document.getElementById('field')
    let active = '0'
    let connector = '0000'
    tField.innerHTML += '<div id="block-' + x + '-' + y + '" class="block"><div id="connector-' + x + '-' + y + '" class="connector" connector="' + connector + '" active="' + active + '" backC="-1" backA="-1"></div></div>'
    field[x][y] = document.getElementById('connector-' + x + '-' + y)
    if (x == fieldSize - 1) {
      tField.innerHTML += '<br />'
    }
}

function correctXY(n) {
  if (n >= 0) {
    return n % fieldSize
  } else {
		let x = n % fieldSize
		if (x == 0) {
			return 0
		} else {
			return fieldSize + x
		}
  }
}

function getConnector(x, y, c = null) {
	switch (c) {
		case UP:
			y--
			break
		case DOWN:
			y++
			break
		case RIGHT:
			x++
			break
		case LEFT:
			x--
			break
		default:
			break
	}
	let rx = correctXY(x)
	let ry = correctXY(y)
	return field[rx][ry]
}

function checkDirection(x, y, d) {
	let connector = getConnector(x, y)
	let connectorNext = getConnector(x, y, d)
	let contacts = connector.getAttribute('connector')
	let contactsNext = connectorNext.getAttribute('connector')
	let active = connectorNext.getAttribute('active')
	let rotate = connector.getAttribute('rotate')
	let rotateNext = connectorNext.getAttribute('rotate')
	return contacts[d] == '1' && contactsNext[reverseDirection(d)] == '1' && active == '0' && rotate == '0' && rotateNext == '0'
}

function setConnect(x, y, c) {
	const connector = getConnector(x, y)
	const contacts = connector.getAttribute('connector')
	connector.setAttribute('connector', contacts.replaceAt(c, '1'))
}

function getConnectionsCount(x, y, d) {
	let connector = getConnector(x, y, d)
	if (connector.getAttribute('connector') == null) return 0
	const contacts = connector.getAttribute('connector')
	let sum = 0
	for (let i = 0; i < contacts.length; i++) sum += parseInt(contacts[i])
	return sum
}

function getFreeBlock(x, y) {
	let free = 4
	for (let d = 0; d < 4; d++) {
		if (getConnectionsCount(x, y, d) != 0) {
			free--
		}
	}
	return free
}

function genConnector() {
	let nxy = rand(connectorGenList.length)
	let xy = connectorGenList[nxy]
	connectorGenList.splice(nxy, 1)
	const x = xy[0]
	const y = xy[1]
	let allowBlocks = getFreeBlock(x, y)
	if (allowBlocks == 4) {
		allowBlocks = 3
	} else if (allowBlocks == 3) {
		allowBlocks = 2
	} else if (allowBlocks == 0) {
		return
	}
	allowBlocks = rand(allowBlocks) + 1
	let realConnections = []
	let allowConnections = [UP, DOWN, RIGHT, LEFT]
	for (let d = 0; d < 4; d++) {
		if (getConnectionsCount(x, y, d)) {
			allowConnections = allowConnections.filter(function(value, index, arr) {
				return value != d
			})
		}
	}

  	while (allowBlocks != 0) {
		let ch = allowConnections[rand(allowConnections.length)]
		realConnections.push(ch)
		allowConnections = allowConnections.filter(function(value, index, arr) {
			return value != ch
		})
		allowBlocks--
		setConnect(x, y, ch)
		let point = getPointDirection(x, y, ch)
		setConnect(point[0], point[1], reverseDirection(ch))
  	}

	for (let i = 0; i < realConnections.length; i++)
		connectorGenList.push(getPointDirection(x, y, realConnections[i]))
}


function drawConnect() {
  allBlocks(drawBlock)
}

function setPC(x, y) {
	if (x == serverX && y == serverY) return
	if (getConnectionsCount(x, y) == 1)
		getConnector(x, y).innerHTML = '<div class="pc pc-off"></div>'
}

function clearActive() {
	allBlocks(function(x, y) {
		getConnector(x, y).setAttribute('active', '0')
	})
}

function initPC() {
	allBlocks(setPC)
}

function fillField(x, y) {
	getConnector(x, y).setAttribute('active', '1')
	for (let d = 0; d < 4; d++) {
		if (checkDirection(x, y, d)) {
			let point = getPointDirection(x, y, d)
			fillField(point[0], point[1])
		}
	}
}

function rotateLeftConnector(connector) {
	let contacts = connector.getAttribute('connector')
	contacts = contacts.substr(1, 3) + contacts.substr(0, 1)
	connector.setAttribute('connector', contacts)
}

function rotateRightConnector(connector) {
	let contacts = connector.getAttribute('connector')
	contacts = contacts.substr(3, 1) + contacts.substr(0, 3)
	connector.setAttribute('connector', contacts)
}

function changeColorCursor(color) {
	let root = document.querySelector(':root')
	root.style.setProperty('--cursor-color', color)
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
	let lastTurn = ['none', 'none']
	if (turnsList.length > 0) {
		lastTurn = turnsList[turnsList.length - 1]
	}
	if (handle.button == 0 && !this.classList.contains('block-lock') && !this.classList.contains('block-hint-lock') && this.getAttribute('connector') != '0000') {
		if (hintActive) {
			hintState(false)
			let original = this.getAttribute('original-connector')
			let ds = 0
			while (original != this.getAttribute('connector')) {
				rotateLeftConnector(this)
				ds++
			}
			if (ds == 3) {
				ds = 1
			}
			score += ds
			this.classList.add('block-hint-lock')
			let hintButton = document.getElementById('get-hint')
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
		let turn = turnsList.pop()
		let connector = document.getElementById(turn[0])
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
	let connector = getConnector(x, y)
	rotateLeftConnector(connector)
}

function rotateRight(x, y) {
	let connector = getConnector(x, y)
	rotateRightConnector(connector)
}

function randomRotate(x, y) {
	let connector = getConnector(x, y)
	let contacts = connector.getAttribute('connector')
	if (contacts == '0000') return
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

function relateFieldAndDiv(x, y) {
	field[x][y] = document.getElementById(`connector-${x}-${y}`)
}

function createField() {
	turnsList = []
	serverX = parseInt(fieldSize / 2 - 0.5)
	serverY = serverX
	field = []
	for (let i = 0; i < fieldSize; i++) {
		let layer = []
		for (let j = 0; j < fieldSize; j++) layer.push(null)
		field.push(layer)
	}
	document.getElementById('field').innerHTML = ''
	allBlocks(addBlock)
	allBlocks(relateFieldAndDiv)
  	getConnector(serverX, serverY).innerHTML = '<div class="server"></div>'
	connectorGenList = [[serverX, serverY]]
	while (connectorGenList.length) genConnector()
	initPC()
	rotateField()
	clearActive()
	fillField(serverX, serverY)
	allBlocks(function(x, y) {
		let connector = getConnector(x, y)
		connector.onmousedown = blockClick
	})
  	drawConnect()
	backTimeTick = Date.now()
	time = 0
}

function hintState(state) {
	hintActive = state
	if (state) {
		changeColorCursor('rgba(0, 255, 0, 0.3)')
	} else {
		changeColorCursor('rgba(255, 255, 255, 0.3)')
	}
}

function getHint() {
	if (this.classList.contains('fa-disable')) {
		return
	}
	if (hintActive) {
		hintState(false)
		this.classList.remove('fa-active')
		this.classList.add('fa-click')
	} else {
		hintState(true)
		this.classList.remove('fa-click')
		this.classList.add('fa-active')
	}
}

function initHint() {
	hintState(false)
	const hintButton = document.getElementById('get-hint')
	hintButton.classList.remove('fa-active')
	hintButton.classList.remove('fa-disable')
	hintButton.classList.add('fa-click')
}

function startGame() {
	if (currentSeed === null) {
		createSeed()
	}
	Math.seedrandom(currentSeed)
	initHint()
	createField()
	resizeField()
	drawTurns()
}

function drawTurns() {
	const turns = document.getElementById('turns')
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
	const width = window.innerWidth
	const height = window.innerHeight
	if (width < height) {
		blockSize = parseInt(width / fieldSize)
			panelWidth = parseInt(width / 9) * 2
			panelHeight = parseInt(width / 9)
	} else {
		blockSize = parseInt(height / fieldSize)
			panelWidth = parseInt(height / 9) * 2
			panelHeight = parseInt(height / 9)
	}
	const panelRadius = parseInt(panelHeight / 2) + 'px'

	let blocks = document.getElementsByClassName('block')
	for (let i = 0; i < blocks.length; i++) {
		blocks[i].style.width = blockSize
		blocks[i].style.height = blockSize
	}

	const field = document.getElementById('field')
	field.style.marginTop = parseInt((height - blockSize * fieldSize) / 2)
	field.style.marginLeft = parseInt((width - blockSize * fieldSize) / 2)

	const score = document.getElementById('score')
	score.style.width = panelWidth
	score.style.height = panelHeight
	score.style.borderTopLeftRadius = panelRadius

	const turnsPanel = document.getElementsByClassName('turns')[0]
	turnsPanel.style.width = panelWidth
	turnsPanel.style.height = panelHeight
	turnsPanel.style.borderTopRightRadius = panelRadius

	const turns = document.getElementById('turns')
	turns.style.fontSize = parseInt(panelHeight / 3) + 'px'
	turns.style.bottom = parseInt((panelHeight - turns.offsetHeight) / 2)
	turns.style.left = panelHeight + 10 + parseInt((panelHeight - 20 - turns.offsetWidth) / 2)

	const panelLeft = document.getElementsByClassName('panel-left')[0]
	panelLeft.style.width = panelWidth
	panelLeft.style.height = panelHeight
	panelLeft.style.borderBottomRightRadius = panelRadius

	const panelRight = document.getElementsByClassName('panel-right')[0]
	panelRight.style.width = panelWidth
	panelRight.style.height = panelHeight
	panelRight.style.borderBottomLeftRadius = panelRadius

	let panelTexts = document.getElementsByClassName('panel-text')
	for (let i = 0; i < panelTexts.length; i++) {
		panelTexts[i].style.fontSize = (panelHeight - 20) + 'px'
	}

	let fars = document.getElementsByClassName('far')
	for (let i = 0; i < fars.length; i++) {
		fars[i].style.fontSize = panelHeight - 20
	}

	fars = document.getElementsByClassName('fas')
	for (let i = 0; i < fars.length; i++) {
		fars[i].style.fontSize = panelHeight - 20
	}

	let mods = document.getElementsByClassName('modes')[0]
	let modHeight
	if (width > height) {
		modHeight = parseInt(height / 7)
	} else {
		modHeight = parseInt(width / 7)
	}
	mods.style.width = modHeight * 5
	mods.style.height = modHeight * 5
	mods.style.marginTop = parseInt(height / 2 - modHeight * 2.5)
	mods.style.marginLeft = parseInt(width / 2 - modHeight * 2.5)

	let modeList = document.getElementsByClassName('mode')
	for (let i = 0; i < modeList.length; i++) {
		modeList[i].style.width = modHeight * 5 - parseInt(modHeight * 0.4)
		modeList[i].style.height = modHeight - parseInt(modHeight * 0.4)
		modeList[i].style.fontSize = parseInt(modHeight * 0.5) + 'px'
		modeList[i].style.padding = parseInt(modHeight * 0.1) + 'px'
		modeList[i].style.margin = parseInt(modHeight * 0.1) + 'px'
	}
}

function showSelectMode() {
	document.getElementById('select-mode').classList.remove('hide')
	document.getElementById('panels').classList.add('hide')
	document.getElementById('game').classList.add('blur')
}

function hideSelectMode() {
	document.getElementById('select-mode').classList.add('hide')
	document.getElementById('panels').classList.remove('hide')
	document.getElementById('game').classList.remove('blur')
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
		document.getElementById('background-stub').classList.remove('hide')
		document.getElementsByClassName('panel-left')[0].classList.add('hide')
		document.getElementsByClassName('panel-right')[0].classList.add('hide')
		document.getElementsByClassName('turns')[0].classList.add('hide')
		this.classList.remove('fa-click')
		this.classList.add('fa-active')
	} else {
		timeStop = false
		document.getElementById('background-stub').classList.add('hide')
		document.getElementById('game').classList.remove('hide')
		document.getElementsByClassName('panel-left')[0].classList.remove('hide')
		document.getElementsByClassName('panel-right')[0].classList.remove('hide')
		document.getElementsByClassName('turns')[0].classList.remove('hide')
		this.classList.remove('fa-active')
		this.classList.add('fa-click')
		drawTurns()
	}
}

function newRecord(time, score) {
	const level = parseInt((fieldSize - 4) / 2 - 0.5)
	if (gameSettings.records[level][1] > score
		|| gameSettings.records[level][1] == score && gameSettings.records[level][0] > time) {
		gameSettings.records[level] = [time, score]
		saveSettings()
		return true
	}
	return false
}

function endGame() {
	if (document.getElementsByClassName('pc-off').length) return
	let endTime = parseInt(time / 1000)
	if (endTime > 999) endTime = 999
	if (score < 0) score = 0
	const isNewRecord = newRecord(endTime, score)
	document.getElementById('panels').classList.add('hide')
	document.getElementById('game').classList.add('blur')
	changeColorCursor('rgba(0, 0, 0, 0)')
	document.getElementById('game-over').classList.remove('hide')
	document.getElementById('end-time').innerText = endTime
	document.getElementById('end-turns').innerText = score
	document.getElementsByClassName('fa-long-arrow-alt-up')[0].style.display = isNewRecord ? 'inline-block' : 'none'
}

function afterEndGame() {
	document.getElementById('panels').classList.remove('hide')
	document.getElementById('game').classList.remove('blur')
	document.getElementById('game-over').classList.add('hide')
	createSeed()
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
	let delta = Date.now() - backTimeTick
	backTimeTick += delta
	if (!timeStop) {
		time += delta
	}
	drawTime()
}

function drawTime() {
	const timeView = document.getElementById('time')
	timeView.innerText = time / 1000 < 1000 ? parseInt(time / 1000) : '999'
	timeView.style.fontSize = parseInt(panelHeight / 3) + 'px'
	timeView.style.bottom = parseInt((panelHeight - timeView.offsetHeight) / 2)
	timeView.style.right = panelHeight + 10 + parseInt((panelHeight - 20 - timeView.offsetWidth) / 2)
}

function setEvents() {
	document.getElementById('new-game').onclick = function() {
		createSeed()
		startGame()
	}
	document.getElementById('game-over').onclick = afterEndGame
	document.getElementById('show-records').onclick = showRecords
	document.getElementById('records').onclick = hideRecords
	window.onresize = resizeField
	document.getElementById('change-mode').onclick = showSelectMode
	document.getElementsByClassName('close-select-mode')[0].onclick = hideSelectMode
	let modes = document.getElementsByClassName('mode')
	for (let i = 0; i < modes.length; i++)
		modes[i].onclick = function() {start(parseInt(this.getAttribute('value')))}
	document.getElementById('cancel-turn').onclick = cancelTurn
	document.getElementById('get-hint').onclick = getHint
	document.getElementById('pause').onclick = pauseHandler
	setInterval(timeTick, 100)
	window.onload = drawTurns
	document.onkeydown = function(e) {if (e.code == 'KeyZ' && e.ctrlKey) {cancelTurn()}}
	document.oncontextmenu = function () {return false}
}

readSettings()
setEvents()
//get seed from url
currentSeed = new URLSearchParams(window.location.search).get('seed')
startGame()
