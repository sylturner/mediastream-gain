!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.MediaStreamGainController=e():"undefined"!=typeof global?global.MediaStreamGainController=e():"undefined"!=typeof self&&(self.MediaStreamGainController=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var support = require('webrtcsupport');


function GainController(stream) {
    this.support = support.webAudio && support.mediaStream;

    // set our starting value
    this.gain = 1;

    if (this.support) {
        var context = this.context = new support.AudioContext();
        this.microphone = context.createMediaStreamSource(stream);
        this.gainFilter = context.createGain();
        this.destination = context.createMediaStreamDestination();
        this.outputStream = this.destination.stream;
        this.microphone.connect(this.gainFilter);
        this.gainFilter.connect(this.destination);
        stream.addTrack(this.outputStream.getAudioTracks()[0]);
        stream.removeTrack(stream.getAudioTracks()[0]);
    }
    this.stream = stream;
}

// setting
GainController.prototype.setGain = function (val) {
    // check for support
    if (!this.support) return;
    this.gainFilter.gain.value = val;
    this.gain = val;
};

GainController.prototype.getGain = function () {
    return this.gain;
};

GainController.prototype.off = function () {
    return this.setGain(0);
};

GainController.prototype.on = function () {
    this.setGain(1);
};


module.exports = GainController;

},{"webrtcsupport":2}],2:[function(require,module,exports){
// created by @HenrikJoreteg
var prefix  = '';
var isChrome = false;
var isFirefox = false;
var needsPlugin = false;
var ua = window.navigator.userAgent.toLowerCase();

// basic sniffing
if (ua.indexOf('firefox') !== -1) {
    prefix = 'moz';
    isFirefox = true;
} else if (ua.indexOf('chrome') !== -1) {
    prefix = 'webkit';
    isChrome = true;
} else {
  // non webrtc browser that needs the plugin
  prefix = 'other';
  needsPlugin = true;
}

// Temasys plugin functions
///
/// Unique identifier of each opened page
///
var TemPageId = Math.random().toString(36).slice(2);

///
/// Private function that will be called once the browser 
/// is WebRTC Ready. This can be because the plugin natively
/// WebRTC ready, or because the plugin was successfuly 
/// initialised
/// This callback will launch the function WebRTCReadyCb if
/// it is defined. Override this function if you need to do
/// anything "as soon as the browser is ready"
///
var TemStaticWasInit = 1;
TemPrivateWebRTCReadyCb = function() {
  // webRTC ready Cb, should only be called once. 
  // Need to prevent Chrome + plugin form calling WebRTCReadyCb twice
  if (TemStaticWasInit === 1) {
    if (typeof WebRTCReadyCb === 'function') {
      WebRTCReadyCb();
    }
  }
  TemStaticWasInit++;
};

///
/// DO NOT OVERLOAD THIS FUNCTION
/// we define a function to access the plugin API
/// call plugin() whenever you need to access the plugin API
///
function plugin0() {
  return document.getElementById('_Tem_plugin0');
}
plugin = plugin0;

if(needsPlugin) {
  // Non WebRTC ready browser /////////////////////////////////////////////////////
  ///
  /// This part of the adatper is plugin specific
  ///

  // Note: IE is detected as Safari...
  //console.log('This appears to be either Safari or IE');
  webrtcDetectedBrowser = 'Safari';

  ///
  /// These booleans tell you on which browser you are working
  ///
  // TODO: move this up and use it for implementation choice
  var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
  var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
  var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
  var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
  var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

  ///
  /// This function detects whether or not a plugin is installed
  /// Com name : the company name,
  /// plugName : the plugin name
  /// installedCb : callback if the plugin is detected (no argument)
  /// notInstalledCb : callback if the plugin is not detected (no argument)
  ///
  isPluginInstalled = function(comName, plugName, installedCb, notInstalledCb) {
    if (isChrome || isSafari || isFirefox) { // Not IE (firefox, for example)
      var pluginArray = navigator.plugins;
      for (var i = 0; i < pluginArray.length; i++) {
        if (pluginArray[i].name.indexOf(plugName) >= 0) {
          installedCb();
          return;
        }
      }
      notInstalledCb(); 
    } else if (isIE) { // We're running IE
      try {
        var tmp = new ActiveXObject(comName+'.'+plugName);
      } catch(e) {
        notInstalledCb();
        return;
      }
      installedCb();
    } else {
      // Unsupported
      return;
    }
  };

  // defines webrtc's JS interface according to the plugin's implementation
  defineWebRTCInterface = function() { 
    // ==== UTIL FUNCTIONS ===
    function isDefined(variable) {
      return variable !== null && variable !== undefined;
    }

    injectPlugin = function() {
      var frag = document.createDocumentFragment();
      var temp = document.createElement('div');
      temp.innerHTML = '<object id="_Tem_plugin0" type="application/x-temwebrtcplugin" ' + 
                                            'width="1" height="1">' + 
        '<param name="pluginId" value="_Tem_plugin0" /> ' + 
        '<param name="windowless" value="false" /> ' + 
        '<param name="pageId" value="' + TemPageId + '" /> ' + 
        '<param name="onload" value="TemPrivateWebRTCReadyCb" />' + 
        // '<param name="forceGetAllCams" value="True" />' +  // uncomment to be able to use virtual cams
      '</object>';
      while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }
      $(document).ready(function() {document.body.appendChild(frag);});
    };
    injectPlugin();

    // END OF UTIL FUNCTIONS

    // === WEBRTC INTERFACE ===
    createIceServer = function(url, username, password) {
      var iceServer = null;
      var url_parts = url.split(':');
      if (url_parts[0].indexOf('stun') === 0) {
        // Create iceServer with stun url.
        iceServer = { 'url': url, 'hasCredentials': false};
      } else if (url_parts[0].indexOf('turn') === 0) {
        iceServer = { 'url': url,
        'hasCredentials': true,
        'credential': password,
        'username': username };
      }
      return iceServer;
    };

    createIceServers = function(urls, username, password) {  
      var iceServers = [];
      for (var i = 0; i < urls.length; ++i) {
        iceServers.push(createIceServer(urls[i], username, password));
      }
      return iceServers;
    };

    // The RTCSessionDescription object.
    RTCSessionDescription = function(info) {
      return plugin().ConstructSessionDescription(info.type, info.sdp);
    };

    // PEER CONNECTION
    RTCPeerConnection = function(servers, constraints) {
      var iceServers = null;
      if (servers) {
        iceServers = servers.iceServers;
        for (var i = 0; i < iceServers.length; i++) {
          if (iceServers[i].urls && !iceServers[i].url) {
            iceServers[i].url = iceServers[i].urls;
          }
          iceServers[i].hasCredentials = isDefined(iceServers[i].username) &&
                                         isDefined(iceServers[i].credential);
        }
      }
      var mandatory = (constraints && constraints.mandatory) ? constraints.mandatory : null;
      var optional = (constraints && constraints.optional) ? constraints.optional : null;
      return plugin().PeerConnection(TemPageId, iceServers, mandatory, optional);
    };

    MediaStreamTrack = {};
    MediaStreamTrack.getSources = function(callback) {
      return plugin().GetSources(callback);
    };

    getUserMedia = function(constraints, successCallback, failureCallback) {
      if (!constraints.audio) {
        constraints.audio = false;
      }

      plugin().getUserMedia(constraints, successCallback, failureCallback);
    };
    navigator.getUserMedia = getUserMedia;

    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      stream.enableSoundTracks(true);
      if (element.nodeName.toLowerCase() !== 'audio') {
        var elementId = element.id.length === 0 ? Math.random().toString(36).slice(2) : element.id;
        if (!element.isTemWebRTCPlugin || !element.isTemWebRTCPlugin()) {
          var frag = document.createDocumentFragment();
          var temp = document.createElement('div');
          var classHTML = element.className ? 'class="' + element.className + '" ' :  '';
          temp.innerHTML = '<object id="' + elementId + '" ' + 
            classHTML + 'type="application/x-temwebrtcplugin">' + 
            '<param name="pluginId" value="' + elementId + '" /> ' + 
            '<param name="pageId" value="' + TemPageId + '" /> ' + 
            '<param name="windowless" value="true" /> ' + 
            '<param name="streamId" value="' + stream.id + '" /> ' + 
          '</object>';
          while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
          }

          var rectObject = element.getBoundingClientRect();
          element.parentNode.insertBefore(frag, element);
          frag = document.getElementById(elementId);
          frag.width = rectObject.width + 'px'; 
          frag.height = rectObject.height + 'px';
          element.parentNode.removeChild(element);

        } else {
          var children = element.children;
          for (var i = 0; i !== children.length; ++i) {
            if (children[i].name === 'streamId') {
              children[i].value = stream.id;
              break;
            }
          }
          element.setStreamId(stream.id);
        }

        var newElement = document.getElementById(elementId);
        newElement.onclick = element.onclick ? element.onclick : function(arg) {};
        newElement._TemOnClick = function(id) {
          var arg = {srcElement: document.getElementById(id)};
          newElement.onclick(arg);
        };
        return newElement;
      } else { // is audio element
        // The sound was enabled, there is nothing to do here
        return element;
      }
    };


    reattachMediaStream = function(to, from) {
      var stream = null;
      var children = from.children;
      for (var i = 0; i !== children.length; ++i) {
        if (children[i].name === 'streamId') {
          stream = plugin().getStreamWithId(TemPageId, children[i].value);
          break;
        }
      }

      if (stream !== null) {
        return attachMediaStream(to, stream);
      } else {
        alert('Could not find the stream associated with this element');
      }
    };

    RTCIceCandidate = function(candidate) {
      if (!candidate.sdpMid) {
        candidate.sdpMid = '';
      }
      return plugin().ConstructIceCandidate(candidate.sdpMid, 
                                          candidate.sdpMLineIndex, 
                                          candidate.candidate);
    };
    // END OF WEBRTC INTERFACE 
  };


  pluginNeededButNotInstalledCb = function() {
    // This function will be called if the plugin is needed 
    // (browser different from Chrome or Firefox), 
    // but the plugin is not installed
    // Override it according to your application logic.

    alert('Your browser is not webrtc ready and Temasys plugin is not installed');
  };

  // Try to detect the plugin and act accordingly
  isPluginInstalled('Tem', 'TemWebRTCPlugin', defineWebRTCInterface, pluginNeededButNotInstalledCb);

  var AudioContext = window.webkitAudioContext || window.AudioContext;

  module.exports = {
      prefix: prefix,
      support: true,
      dataChannel: true,
      webAudio: true,
      mediaStream: true,
      screenSharing: false,
      AudioContext: AudioContext,
      PeerConnection: RTCPeerConnection,
      SessionDescription: RTCSessionDescription,
      IceCandidate: RTCIceCandidate
  };
}
else {
  var PC = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
  var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
  var MediaStream = window.webkitMediaStream || window.MediaStream;
  var screenSharing = window.location.protocol === 'https:' && 
      ((window.navigator.userAgent.match('Chrome') && parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10) >= 26) ||
      (window.navigator.userAgent.match('Firefox') && parseInt(window.navigator.userAgent.match(/Firefox\/(.*)/)[1], 10) >= 33));
  var AudioContext = window.webkitAudioContext || window.AudioContext;

  // export support flags and constructors.prototype && PC
  module.exports = {
      //support: !!PC,
      support: false,
      dataChannel: isChrome || isFirefox || (PC && PC.prototype && PC.prototype.createDataChannel),
      prefix: prefix,
      webAudio: !!(AudioContext && AudioContext.prototype.createMediaStreamSource),
      mediaStream: !!(MediaStream && MediaStream.prototype.removeTrack),
      screenSharing: !!screenSharing,
      AudioContext: AudioContext,
      PeerConnection: PC,
      SessionDescription: SessionDescription,
      IceCandidate: IceCandidate
  };
}

},{}]},{},[1])
(1)
});
;