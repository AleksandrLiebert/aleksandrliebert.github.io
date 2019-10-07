 function print(data) {
   console.log(data)
 }

function setCategory(id){
  var category = content[id]

  $.get('content/' + id + '.html', function(data) {
    $('#sigil').unbind('click')
    if (content[id].links == null) {
      $('#sigil').html('<img src="img/' + id + '.png" width="100%">')
    } else {
      $('#sigil').html('<img src="img/' + id + '.png" width="100%" style="cursor: pointer;">')
      $('#sigil').click(function(){
        showContent(id)
      })
    }
    $('#title').text(category.name)
    $('#content').html(data)

    $('.cross').click(function() {
      var id = this.getAttribute('data')
      showCategory(id)
      return false
    })
    $('#category').fadeIn(400)
   resizeWindow()
 })
}

function setContent(id) {
  if (id == null) {
    var res = '<div class="row">'
    for (var i in content) {
      res += '<div class="col-md-3 col-6">'
      res += '<a class="c-img" data="' + i + '" href="?c=' + i + '"><img src="img/' + i  + '.png" width="100%" style="cursor: pointer;"></a>'
      res += '<p>' + content[i].name + '</p>'
      res += '</div>'
    }
    res += '</div>'
  } else {
    var links = content[id].links
    var res = '<div class="row">'
    for(var i in links) {
      var link = links[i]
      res += '<div class="col-md-3 col-6">'
      res += '<a class="c-img" data="' + link + '" href="?c=' + link + '"><img src="img/' + link  + '.png" width="100%" style="cursor: pointer;"></a>'
      res += '<p>' + content[link].name + '</p>'
      res += '</div>'
    }
    res += '</div>'
  }
  $('#contents').html(res)
    $('.c-img').click(function() {
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
  if (id == null) {
    history.pushState(null, null, '?content=true')
  } else {
    history.pushState(null, null, '?content=true&c=' + id)
  }
  reload()
}

function reload() {
  print('reload')
  var url = new URL(window.location.href)
  var c = url.searchParams.get("c");
  var subContent = url.searchParams.get("content");
  if (category.style.display == 'none' && contents.style.display == 'none') {
    if (c == null && subContent == null) {
      setCategory('main')
    } else if (subContent == 'true') {
      setContent(c)
      $('#contents').fadeIn(400)
    } else {
      setCategory(c)
    }
  } else {
    $('#category').fadeOut(400)
    $('#contents').fadeOut(400)
    if (c == null && subContent == null) {
      setTimeout(() => setCategory('main'), 400)
      $('#category').delay(400).fadeIn(400)
    } else if (subContent == 'true') {
      setContent(c)
      $('#contents').delay(400).fadeIn(400)
    } else {
      setTimeout(() => setCategory(c), 400)
    }
  }
}

$.getJSON('content.json', function(data){
  content = data
  var res = '<div class="row">'
  for(var id in content) {
    res += '<div class="col-md-3 col-6">'
    res += '<a class="c-img" data="' + id + '" href="?c=' + id + '"><img src="img/' + id  + '.png" width="100%" style="cursor: pointer;"></a>'
    res += '<p>' + data[id].name + '</p>'
    res += '</div>'
  }
  res += '</div>'
  $('#contents').html(res)
  $('.c-img').click(function() {
    var id = this.getAttribute('data')
    showCategory(id)
    return false
  })

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

$('#level-wiser').click(function() {
  $('#level-neofit').removeClass('level-active')
  $('#level-wiser').addClass('level-active')
  contentSize = $('#content')[0].offsetWidth
  $('#content').animate({
    opacity: 0,
    left: '-' + contentSize,
  }, 500, function () {
    $('#content').hide()
    wiser.style.display = 'block'
    wiser.style.left = contentSize
    $('#wiser').animate({
      opacity: 1,
      left: '0px'
    }, 500, function() {

    })
  })
})

$(window).resize(resizeWindow)
