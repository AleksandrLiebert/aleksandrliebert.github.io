function resizeWindow() {
  $("iframe").attr('height', $("iframe")[0].offsetWidth / 16 * 9)
}

$(window).resize(resizeWindow)

resizeWindow()
