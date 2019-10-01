 function print(data) {
   console.log(data)
 }

  function setMain() {
    $('#sigil').html('<img src="img/dd.png" width="100%">')
    $('#title').text(content.main.name)
    $('#content').html(content.main.content)
  }

  function setCategory(id){
    var category
    for (var i = 0; i < content.categories.length; i++){
      if (content.categories[i].id == id) {
        category = content.categories[i]
        break
      }
    }

    $.get('content/' + id + '.html', function(data) {
      $('#sigil').html('<img src="img/' + category.id + '.png" width="100%">')
      $('#title').text(category.name)
      $('#content').html(data)

      $('.cross').click(function() {
        var id = this.getAttribute('data')
        showCategory(id)
        return false
      })
      resizeWindow()
    })
  }

  function showCategory(id){
    history.pushState(null, null, '?c=' + id)
    reload()
  }

  function showContent() {
    history.pushState(null, null, '?c=content')
    reload()
  }

  function reload() {
    print('reload')
    var url = new URL(window.location.href)
    var c = url.searchParams.get("c");
    if (category.style.display == 'none' && contents.style.display == 'none') {
      if (c == null) {
        setMain()
        $('#category').fadeIn(400)
      } else if (c == 'content') {
        $('#contents').fadeIn(400)
      } else {
        setCategory(c)
        $('#category').fadeIn(400)
        //setTimeout(resizeWindow, 500)
      }
    } else {
      $('#category').fadeOut(400)
      $('#contents').fadeOut(400)

      if (c == null) {
        setMain()
        $('#category').delay(600).fadeIn(400)
      } else if (c == 'content') {
        $('#contents').delay(600).fadeIn(400)
      } else {
        setTimeout(() => setCategory(c), 500)
        $('#category').delay(600).fadeIn(400)
        //setTimeout(resizeWindow, 500)
      }
    }
  }

  $.getJSON('content.json', function(data){
    content = data
    var res = '<div class="row">'
    for (var i = 0; i < data.categories.length; i++) {
      res += '<div class="col-md-3 col-6">'
      res += '<a class="c-img" data="' + data.categories[i].id + '" href="?c=' + data.categories[i].id + '"><img src="img/' + data.categories[i].id  + '.png" width="100%" style="cursor: pointer;"></a>'
      res += '<p>' + data.categories[i].name + '</p>'
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
    showContent()
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
