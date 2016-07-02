//var Request = require("sdk/request").Request;

self.port.on("getElements", function(tag) {
  try {
    var elements = document.getElementsByTagName(tag);
    for (var i = 0; i < elements.length; i++) {
      self.port.emit("gotElement", tag, elements[i].src);
    }}
  catch (e) {}
});

/*self.port.on("visit", function(P, U,V){
  re(P, U,V);
});
function re(P, U,V) {
  console.log(V, U);
  if (V <= 0)
    return;

  P({
    url: U,
    onComplete: function (response) {
      console.log("rf: ", response.status);
      re(U,V-1);
    }
  }).get();
}
*/
