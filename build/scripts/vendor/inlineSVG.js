if("127.0.0.1"===window.parent.location.hostname)var intervalCounterSecondary=0,contentOnLoad=setInterval(function(){var childLength=document.getElementsByClassName("application__cell").length;intervalCounterSecondary++,(childLength>0||intervalCounterSecondary>10)&&(setScriptTag("https://devportal.yaas.io/scripts/general/replace-svg-images-with-inline-svg.js",function(){$("[data-toggle=tooltip]").tooltip(),replaceSVGImagesWithInlineSVG()}),clearInterval(contentOnLoad))},500);else window.parent.addEventListener("message",function(event){var eventData=event.data;"string"==typeof eventData&&eventData.indexOf("height")!==-1&&window.parent.parent.replaceSVGImagesWithInlineSVG(window.document)});