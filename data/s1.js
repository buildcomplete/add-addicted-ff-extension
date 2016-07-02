self.port.on("getElements", function(tag) {
  try {
    var elements = document.getElementsByTagName(tag);
    for (var i = 0; i < elements.length; i++) {
      self.port.emit("gotElement", tag, elements[i].src);
    }}
  catch (e) {}
});
