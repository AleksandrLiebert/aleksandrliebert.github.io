 function print(data) {
   console.log(data)
 }

 function selectLevel(level) {
   var currentLevel = $('.level-active')[0].id.substr(6)
   if (level == currentLevel){
     return
   }

   if (animationRun === true) {
     return
   }

   animationRun = true

   $('#level-' + currentLevel).removeClass('level-active')
   $('#level-' + level).addClass('level-active')

   contentSize = $('#' + currentLevel + '-content')[0].offsetWidth

   if (level == 'neofit') {
     firstShift = contentSize
     secondShift = '-' + contentSize
   } else if (level == 'sgl') {
     firstShift = '-' + contentSize
     secondShift = contentSize
   } else if (currentLevel == 'neofit') {
     firstShift = '-' + contentSize
     secondShift = contentSize
   } else {
     firstShift = contentSize
     secondShift = '-' + contentSize
   }

   currentBlock = '#' + currentLevel + '-content'
   nextBlock = '#' + level + '-content'

   $(currentBlock).animate({
     opacity: 0,
     left: firstShift,
   }, 500, function () {
     $(currentBlock).hide()
     $(nextBlock)[0].style.display = 'block'
     $(nextBlock)[0].style.left = secondShift
     $(nextBlock).animate({
       opacity: 1,
       left: '0px'
     }, 500, function() {
       animationRun = false
     })
   })
 }

function setCategory(id){
  selectLevel('neofit')
  var category = content[id]

  $.ajax({
    url: 'neofit/' + id + '.md',
    type: 'get',
    error: function(XMLHttpRequest, textStatus, errorThrown){
      $('#sigil').html('<img src="img/' + id + '.png" width="100%">')
      $('#title').text(category.name)

       $('#neofit-content').text('Контент в разработке')
       $('#category').fadeIn(400)
       resizeWindow()
    },
    success: function(data){
      $('#sigil').html('<img src="img/' + id + '.png" width="100%">')
      $('#title').text(category.name)

      var converter = new showdown.Converter()
      var html      = converter.makeHtml(data);

      $('#neofit-content').html(html)

      $('.cross').click(function() {
        var id = this.getAttribute('data')
        showCategory(id)
        return false
      })
      $('#category').fadeIn(400)
      resizeWindow()
   }
  })

 /*$.get('wiser/' + id + '.html', function(data) {
   $('#wiser-content').html(data)
 }).fail(function() {
   $('#wiser-content').text('Контент в разработке')
 })

 $.get('sigil/' + id + '.html', function(data) {
   $('#sigil-info').html(data)
 }).fail(function() {
   $('#sigil-info').text('Контент в разработке')
 })*/

 if (content[id].links !== null) {
   var res = '<div class="row">'
   for(var i in content[id].links) {
     var link = content[id].links[i]
     res += '<div class="col-xl-3 col-6">'
     res += '<a class="c-img sgl-ref-link" data="' + link + '" href="?c=' + link + '"><img src="img/' + link  + '.png" width="100%" style="cursor: pointer;"></a>'
     res += '<p class="text-center">' + content[link].name + '</p>'
     res += '</div>'
   }
   res += '</div>'
   $('#sigil-ref').html(res)
   $('.sgl-ref-link').click(function() {
     var id = this.getAttribute('data')
     showCategory(id)
     return false
   })
 } else {
   $('#sigil-ref').html('')
 }
}

function addContent(c, shift, last) {
    var value = content[c]
    var res = '<div class="col-12 offset-md-2 col-md-10 text-left">'

    for (var i = 0; i < shift; i++) {
        if (i + 1 !== shift) {
            if (last[i]) {
                res += '<img class="d-none d-sm-inline-block" src="img/tree/space.png" style="width: 5rem; height: 5rem;" />' + '<img class="d-inline-block d-sm-none" src="img/tree/space.png" style="width: 2.5rem; height: 2.5rem;" />'
            } else {
                res += '<img class="d-none d-sm-inline-block" src="img/tree/line.png" style="width: 5rem; height: 5rem;" />' + '<img class="d-inline-block d-sm-none" src="img/tree/line.png" style="width: 2.5rem; height: 2.5rem;" />'
            }
        } else {
            if (last[i]) {
                res += '<img class="d-none d-sm-inline-block" src="img/tree/angle.png" style="width: 5rem; height: 5rem;" />' + '<img class="d-inline-block d-sm-none" src="img/tree/angle.png" style="width: 2.5rem; height: 2.5rem;" />'
            } else {
                res += '<img class="d-none d-sm-inline-block" src="img/tree/branch.png" style="width: 5rem; height: 5rem;" />' + '<img class="d-inline-block d-sm-none" src="img/tree/branch.png" style="width: 2.5rem; height: 2.5rem;" />'
            }
        }
    }

    res += '<a class="content content-c" data="' + c + '" href="?c=' + c + '"><img class="d-none d-sm-inline-block" src="img/mini-icon/' + c  + '.png" style="cursor: pointer; width: 5rem; height: 5rem;"><img class="d-inline-block d-sm-none" src="img/mini-icon/' + c  + '.png" style="cursor: pointer; width: 2.5rem; height: 2.5rem;">' + value.name + '</a>'
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
  var res = '<div class="row">'
  res += addContent('main', 0)
  res += '</div>'
  $('#contents').html(res)
  $('.content-c').click(function() {
    var id = this.getAttribute('data')
    showCategory(id)
    return false
  })
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



$('#level-neofit').click(function() {
  selectLevel('neofit')
})

$('#level-wiser').click(function() {
  selectLevel('wiser')
})

$('#level-sgl').click(function() {
  selectLevel('sgl')
})

animationRun = false

$(window).resize(resizeWindow)
