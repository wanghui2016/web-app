/* eslint-disable */
// clone from https://github.com/mikemaccana/outdated-browser-rework/blob/master/index.js
// 这里增加针对性的判断
var UserAgentParser = require('user-agent-parser');
var languageMessages = {
  "cn": {
    "outOfDate": "您的浏览器已过时",
    "update": {
      "web": "要正常浏览本网站请升级您的浏览器（建议使用 Chrome 浏览器）。",
      "googlePlay": "Please install Chrome from Google Play",
      "appStore": "Please update iOS from the Settings App"
    },
    "url": "http://outdatedbrowser.com/cn",
    "callToAction": "现在升级",
    "close": "关闭"
  },
  "en": {
    "outOfDate": "Your browser is out-of-date!",
    "update": {
      "web": "Update your browser to view this website correctly. ",
      "googlePlay": "Please install Chrome from Google Play",
      "appStore": "Please update iOS from the Settings App"
    },
    "url": "http://outdatedbrowser.com/",
    "callToAction": "Update my browser now",
    "close": "Close"
  }
};

module.exports = function (options) {

  var getChromeVersion = function (ua) { // 确切获取浏览器版本
    var p =/Chrome\/[\d\.]+/g;
    var result = ua.match(p);
    if (result) {
      var pVersion = /\/(\d+)[\.]*/;
      return result[0].match(pVersion)[1];
    }
    return null;
  }


  var main = function () {
    // Despite the docs, UA needs to be provided to constructor explicitly:
    // https://github.com/faisalman/ua-parser-js/issues/90
    var parsedUserAgent = new UserAgentParser(window.navigator.userAgent).getResult();
    // Variable definition (before ajax)

    var chromeVersion = getChromeVersion(window.navigator.userAgent);
    if (chromeVersion && parsedUserAgent.browser.major) {
      parsedUserAgent.browser.major = chromeVersion
      parsedUserAgent.browser.name = "Chrome"
    }

    var outdatedUI = document.getElementById('outdated');

    options = options || {};

    var browserLocale = window.navigator.language || window.navigator.userLanguage; // Everyone else, IE

    // Set default options
    var browserSupport = options.browserSupport || {
      'Chrome': 37,
      'IE': 10,
      'Safari': 7,
      'Mobile Safari': 7,
      'Firefox': 32
    };
    // CSS property to check for. You may also like 'borderSpacing', 'boxShadow', 'transform', 'borderImage';
    var requiredCssProperty = options.requiredCssProperty || false;
    var backgroundColor = options.backgroundColor || '#f25648'; // Salmon
    var textColor = options.textColor || 'white';
    var language = options.language || browserLocale.slice(0, 2); // Language code

    var updateSource = 'web'; // Other possible values are 'googlePlay' or 'appStore'. Determines where we tell users to go for upgrades.

    // Chrome mobile is still Chrome (unlike Safari which is 'Mobile Safari')
    var isAndroid = parsedUserAgent.os.name === 'Android';
    if (isAndroid) {
      updateSource = 'googlePlay';
    }

    var isAndroidButNotChrome;
    if (options.requireChromeOnAndroid) {
      isAndroidButNotChrome = (isAndroid) && (parsedUserAgent.browser.name !== 'Chrome');
    }

    if (parsedUserAgent.os.name === 'iOS') {
      updateSource = 'appStore';
    }

    var done = true;

    var changeOpacity = function (opacityValue) {
      outdatedUI.style.opacity = opacityValue / 100;
      outdatedUI.style.filter = 'alpha(opacity=' + opacityValue + ')';
    };

    var fadeIn = function (opacityValue) {
      changeOpacity(opacityValue);
      if (opacityValue === 1) {
        outdatedUI.style.display = 'block';
      }
      if (opacityValue === 100) {
        done = true;
      }
    };

    var isBrowserOutOfDate = function () {
      var browserName = parsedUserAgent.browser.name;
      var browserMajorVersion = parsedUserAgent.browser.major;
      var isOutOfDate = false;
      if (browserSupport[browserName]) {
        if (browserMajorVersion < browserSupport[browserName]) {
          isOutOfDate = true;
        }
      }
      return isOutOfDate;
    };

    // Returns true if a browser supports a css3 property
    var isPropertySupported = function (prop) {
      if (!prop) {
        return true;
      }
      var div = document.createElement('div');
      var vendorPrefixes = 'Khtml Ms O Moz Webkit'.split(' ');
      var count = vendorPrefixes.length;

      if (div.style[prop]) {
        return true;
      }

      prop = prop.replace(/^[a-z]/, function (val) {
        return val.toUpperCase();
      });

      while (count--) {
        if (div.style[vendorPrefixes[count] + prop]) {
          return true;
        }
      }
      return false;
    };

    var makeFadeInFunction = function (x) {
      return function () {
        fadeIn(x);
      };
    };

    // Style element explicitly - TODO: investigate and delete if not needed
    var startStylesAndEvents = function () {
      var buttonClose = document.getElementById('buttonCloseUpdateBrowser');
      var buttonUpdate = document.getElementById('buttonUpdateBrowser');

      //check settings attributes
      outdatedUI.style.backgroundColor = backgroundColor;
      //way too hard to put !important on IE6
      outdatedUI.style.color = textColor;
      outdatedUI.children[0].style.color = textColor;
      outdatedUI.children[1].style.color = textColor;

      // Update button is desktop only
      if (buttonUpdate) {
        buttonUpdate.style.color = textColor;
        if (buttonUpdate.style.borderColor) {
          buttonUpdate.style.borderColor = textColor;
        }

        // Override the update button color to match the background color
        buttonUpdate.onmouseover = function () {
          this.style.color = backgroundColor;
          this.style.backgroundColor = textColor;
        };

        buttonUpdate.onmouseout = function () {
          this.style.color = textColor;
          this.style.backgroundColor = backgroundColor;
        };
      }

      buttonClose.style.color = textColor;

      buttonClose.onmousedown = function () {
        outdatedUI.style.display = 'none';
        return false;
      };
    };

    var getmessage = function (lang) {
      var messages = languageMessages[lang] || languageMessages.en;

      var updateMessages = {
        'web': '<p>' + messages.update.web + '<a id="buttonUpdateBrowser" href="' + messages.url + '">' + messages.callToAction + '</a></p>',
        'googlePlay': '<p>' + messages.update.googlePlay +
        '<a id="buttonUpdateBrowser" href="https://play.google.com/store/apps/details?id=com.android.chrome">' + messages.callToAction + '</a></p>',
        'appStore': '<p>' + messages.update[updateSource] + '</p>'
      };

      var updateMessage = updateMessages[updateSource];

      return '<h6>' + messages.outOfDate + '</h6>' + updateMessage +
        '<p class="last"><a href="#" id="buttonCloseUpdateBrowser" title="' + messages.close + '">×</a></p>';
    };

    // Check if browser is supported
    if (isBrowserOutOfDate() || ! isPropertySupported(requiredCssProperty) || isAndroidButNotChrome) {

      // This is an outdated browser
      if (done && outdatedUI.style.opacity !== '1') {
        done = false;

        for (var i = 1; i <= 100; i++) {
          setTimeout(makeFadeInFunction(i), i * 8);
        }
      }

      var insertContentHere = document.getElementById('outdated');
      insertContentHere.innerHTML = getmessage(language);
      startStylesAndEvents();
    }
  };

  // Load main when DOM ready.
  var oldOnload = window.onload;
  if (typeof window.onload !== 'function') {
    window.onload = main;
  }
  else {
    window.onload = function () {
      if (oldOnload) {
        oldOnload();
      }
      main();
    };
  }
};
/* eslint-disable */
