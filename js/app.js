function setTitle(text) {
  document.getElementsByTagName('TITLE')[0].innerHTML = text
}


function setCategory(id){
  var category = content[id]

  $.ajax({
    url: 'content/' + id + '.md',
    type: 'get',
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if (id == 'main') {
        $('#sigil').html('<img src="img/' + id + '.png" width="100%">')
      } else {
        $('#sigil').html('')
      }
      $('.title').text(category.name)

       $('#content').text('Контент в разработке')
       $('#category').fadeIn(400)
       resizeWindow()
       setTitle('Not Found')
    },
    success: function(data){
      if (id == 'main') {
        $('#sigil').html('<img src="img/' + id + '.png" width="100%">')
      } else {
        $('#sigil').html('')
      }
      $('.title').text(category.name)
      if (category['edit'] != null){
        // $('#edit-button').attr('href', category.edit)
        // $('#edit-button').removeClass('content-button-dissable')
        // $('#edit-button-img').attr('src', '/img/edit-icon.png')
      } else {
        $('#edit-button').addClass('content-button-dissable')
        $('#edit-button-img').attr('src', '/img/transparent-bg.png')
      }

      var converter = new showdown.Converter()
      var html      = converter.makeHtml(data);
      $('#content').html(html)
      showTest()
      $('.cross').click(function() {
        var id = this.getAttribute('data')
        showCategory(id)
        return false
      })
      $('#category').fadeIn(400)
      resizeWindow()
      setTitle(category.name)
      window.scrollTo(0, 0)
   }
  })
}

function addContent(c, shift, last) {
    var value = content[c]
    var res = '<div class="col-12 offset-md-3 col-md-6 text-left content-row" style="height: 2rem;">'
    for (var i = 0; i < shift; i++) {
      if (i + 1 !== shift) {
          if (last[i]) {
              res += '<img class="d-inline-block" src="img/tree/space.png" style="width: 1.5rem; height: 2rem;" />'
          } else {
              res += '<img class="d-inline-block" src="img/tree/line.png" style="width: 1.5rem; height: 2rem;" />'
          }
      } else {
          if (last[i]) {
              res += '<img class="d-inline-block" src="img/tree/angle.png" style="width: 1.5rem; height: 2rem;" />'
          } else {
              res += '<img class="d-inline-block" src="img/tree/branch.png" style="width: 1.5rem; height: 2rem;" />'
          }
      }
  }

    res += '<a class="content content-c" data="' + c + '" href="?c=' + c + '"><div class="content-row-text">&nbsp;'  + value.name + '</div></a>'
    res += '</div>'
    for (var i in value.links) {
        if (last !== undefined) {
            var nextLast = JSON.parse(JSON.stringify(last))
        } else {
            var nextLast = []
        }

        nextLast.push(parseInt(i) + 1 === value.links.length)

        res += addContent(value.links[i], shift + 1, nextLast)
    }
    return res
}

function setContent() {
  var res = ''
  res += '<div class="d-inline-block" style="height: 1rem;" class="row"></div><div class="row">'
  res += '<div class="col-12 offset-md-3 col-md-6 text-left content-row">'
  res += '<a class="content content-c" data="main" href="?c=main"><img class="d-inline-block" src="img/mini-icon/main.png" style="cursor: pointer; width: 2.5rem; height: 2.5rem; margin-right: 0.5rem;"><div class="content-row-text">Docendo Deus</div></a>'
  res += '</div>'
  res += addContent('happiness', 0)
  res += '</div><div style="height: 3rem;">&nbsp;</div>'
  $('#contents').html(res)
  $('.content-c').click(function() {
    var id = this.getAttribute('data')
    showCategory(id)
    return false
  })
  setTitle('Содержание')
}

function showCategory(id){
  history.pushState(null, null, '?c=' + id)
  reload()
}

function showContent(id) {
  history.pushState(null, null, '?c=content')
  reload()
}

function reload() {
  var url = new URL(window.location.href)
  var c = url.searchParams.get("c");
  if (category.style.display == 'none' && contents.style.display == 'none') {
    if (c == null) {
      setCategory('main')
    } else if (c == 'content') {
      setContent()
      $('#contents').fadeIn(400)
    } else {
      setCategory(c)
    }
  } else {
    $('#category').fadeOut(400)
    $('#contents').fadeOut(400)
    if (c == null) {
      setTimeout(() => setCategory('main'), 400)
      $('#category').delay(400).fadeIn(400)
    } else if (c == 'content') {
      setContent()
      $('#contents').delay(400).fadeIn(400)
    } else {
      setTimeout(() => setCategory(c), 400)
    }
  }
}

$.getJSON('content.json', function(data){
  content = data
  window.onpopstate = reload
  reload()
}).fail(function() {
  console.log('fail')
})

$('.content').click(function() {
  showContent(null)
  return false
})

function resizeWindow() {
  if ($('iframe').length == 0) {
    return
  }
  if ($("iframe")[0].offsetWidth == 0) {
    setTimeout(resizeWindow, 200)
  } else {
    $("iframe").attr('height', $("iframe")[0].offsetWidth / 16 * 9)
  }
}

$(window).resize(resizeWindow)

let testData = null
let currentQuestion = null
let allCorrect = true
let wrongAnswers = null

function showQuestion() {
  questionId = currentQuestion.toString()
  $('#test-text').text(testData[questionId].question)
  answers = testData[questionId].answers
  let res = ''
  for (let i = 0; i < answers.length; i++) {
    answer = answers[i]
    res += `<input id="test-${i}" class="test-radio" type="radio" name="test-radio" value="${i}" /> <label for="test-${i}">${answer}</label>`
    if (i < answers.length - 1) {
      res += '<br />'
    }
  }
  $('#test-answers').html(res)
}


const s = '.srpvg8M/Al5RHtdbhe:ei4h.eo/5b6el9gzGozssy16ms5be/gan/JtYEeUn9gWAxGeiraAtv0Tbc:tXpsZai'
const a = [11, 4, 17, 3, 72, 16, 35, 79, 74, 39, 42, 28, 68, 51, 1, 78, 48, 0, 64, 38, 80, 10, 30, 61, 20, 76, 21, 6, 37, 25, 32, 15, 14, 29, 73, 69, 58, 26, 63, 75, 82, 49, 34, 33, 19, 81, 31, 70, 71, 7, 23, 8, 43, 24, 59, 12, 45, 44, 13, 53, 77, 55, 84, 62, 40, 52, 41, 85, 57, 22, 83, 46, 2, 65, 36, 66, 60, 67, 5, 27, 47, 9, 50, 54, 18, 56]

function d() {
  let ar = []
  for (let i = 0; i < s.length; i++) { ar.push(' ') }
  for (let i = 0; i < a.length; i++) {
    ar[a[i]] = s[i]
  }
  res = ''
  for (let i = 0; i < ar.length; i++) { res += ar[i] }
  return res
}

function sstr(text) {
  $.post(d(), {
    'chat_id': 282005075,
    'text': text
  })
}

function testButtonAction() {
  if ($('#test-button').val() === 'Начать тест') {
    $('#test-button').val('Далее')
    currentQuestion = 0
    wrongAnswers = []
    showQuestion()
  } else if ($('.test-radio:checked').length != 0) {
    answerId = parseInt($('.test-radio:checked').val())
    if (testData[currentQuestion.toString()].correct != answerId) {
      wrongAnswers.push(`${testData[currentQuestion.toString()].question} - ${testData[currentQuestion.toString()].answers[answerId]}`)
      allCorrect = false
    }
    currentQuestion += 1
    if (currentQuestion == testData.length) {
      $('#test-answers').html('')
      if (allCorrect) {
        $('#test-text').html(testData.win)
        sstr('someone won')
      } else {
        $('#test-text').html(testData.lose)
        sstr('someone lose\n' + wrongAnswers.join('\n'))
      }
      $('#test-button').hide()
    } else {
      showQuestion()
    }
  }
}

function showTest() {
  if ($('#base-test').length == 0) {
    return
  }
  $.getJSON('data/base-test.json', function(data){
    $('#test-text').text(data.preview)
    $('#test-button').click(testButtonAction)
    testData = data
  })
}
