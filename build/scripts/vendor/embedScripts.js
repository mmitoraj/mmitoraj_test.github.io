function setScriptTag(url,next){var scriptTag=document.createElement("script");scriptTag.type="text/javascript",scriptTag.src=url,scriptTag.defer=!0,document.head.appendChild(scriptTag),next&&(scriptTag.onload=next)}var intervalCounter=0,intervalStart=setInterval(function(){var expandCollapseScript,isEmbedded=window.parent.location.href.indexOf("embedded.html")>-1;if(!isEmbedded)return void clearInterval(intervalStart);var isExpandPresent=document.getElementsByClassName("expand-collapse")[0],isJQueryPresent=!!window.jQuery;intervalCounter++,(isExpandPresent&&isJQueryPresent||intervalCounter>50)&&(expandCollapseScript="127.0.0.1"===window.parent.location.hostname?"https://devportal.yaas.io/scripts/general/expand-collapse.js":"/scripts/general/expand-collapse.js",setScriptTag(expandCollapseScript,function(){buildExpandCollapse(window.document);var resizeEvent=new CustomEvent("resizeNeeded");$(".code-toggle").unbind("click").click(function(e){e.preventDefault(),$(this).toggleClass("open-circle"),$(this).parent().find(".expand-collapse").slideToggle(300,function(){window.parent.dispatchEvent(resizeEvent)}),$(this).find(".hyicon-expand, .hyicon-collapse").toggle()})}),clearInterval(intervalStart))},500);if("127.0.0.1"===window.parent.location.hostname)var intervalCounterSecondary=0,contentOnLoad=setInterval(function(){var childLength=document.getElementsByClassName("application__cell").length;intervalCounterSecondary++,(childLength>0||intervalCounterSecondary>10)&&(setScriptTag("https://devportal.yaas.io/scripts/general/replace-svg-images-with-inline-svg.js",function(){$("[data-toggle=tooltip]").tooltip(),replaceSVGImagesWithInlineSVG()}),clearInterval(contentOnLoad))},500);else window.parent.addEventListener("message",function(event){var eventData=event.data;"string"==typeof eventData&&eventData.indexOf("height")!==-1&&window.parent.parent.replaceSVGImagesWithInlineSVG(window.document)});App.start(document.body);