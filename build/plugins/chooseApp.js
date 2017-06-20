!function(f){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=f();else if("function"==typeof define&&define.amd)define([],f);else{var g;g="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,g.chooseAppPlugin=f()}}(function(){return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a="function"==typeof require&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}for(var i="function"==typeof require&&require,o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){var credentialsHandler=require("./credentialsFunctions");module.exports=function(){"use strict";function init(){USER_LOGIN=lscache.get("login"),IDTOKEN=lscache.get("id_token"),IDTOKEN&&(checkTokenCached("noTenantToken","hybris.no_tenant",function(){$("#existingProject").show()}),window.addEventListener("message",receiveMessage,!1),$("#pickExistingProjects").click(function(){checkTokenCached("noTenantToken","hybris.no_tenant",function(){USER_LOGIN=lscache.get("login"),IDTOKEN=lscache.get("id_token"),$(".alert-danger").remove(),$("#existingProjectLoader").fadeIn(300),getTenants()})}),$("#injectHandler").click(injectCredentials),$("#showHideCredentialsExisting").click(showHideCredentials))}function receiveMessage(event){var data=event.data;data&&data.failed&&onGetTokenError(data.scope),data&&data.noTenantToken&&($("#oauthFrame").remove(),$("#existingProject").show(),2===SHOULD_CALL_FOR_NOTENANT_FOR_PROJECT?getTenants():SHOULD_CALL_FOR_NOTENANT_FOR_PROJECT++),data&&data.tenantToken&&($("#oauthFrame").remove(),getApps(data))}function listTenants(tenants){var $selectContainer=$("#selectTenants"),$select=$("#projects");if(!tenants||!tenants.length)return $("#appCredentials").slideUp(300),showErrorExistingProjectHeader("You have no projects yet."),$selectContainer.hide();$selectContainer.show(),sendMessageResizeNeeded();var projects=[];tenants.forEach(function(tenant){projects.push({id:tenant.id,text:tenant.name})}),setUpSelect($select,projects,"Select a Project"),$select.change(function(){$("#existingProjectLoader").fadeIn(300)}),PROJ_FIRST_FUNC_CALL||(PROJ_FIRST_FUNC_CALL=!0,$select.change(checkTenantApps)),$("#existingProjectLoader").fadeOut(300),$("#pickExistingProjects").hide(),$("#existingProjects").slideDown(300)}function checkTokenCached(cacheKey,scope,next){lscache.get(cacheKey)?next():getToken(scope)}function getTenants(){makeAjaxCall(ACCOUNT_SERVICE_URL+"projects?member="+USER_LOGIN,lscache.get("noTenantToken"),function(err,data){listTenants(data)})}function checkTenantApps(){$(".alert-danger").remove();var tenant=$(this).val();tenant&&(APP_DATA.projectId=tenant,getToken("hybris.tenant="+APP_DATA.projectId+"+hybris.account_view hybris.api_view hybris.api_manage hybris.package_view"))}function getToken(scope){var serviceFrame=document.createElement("iframe");serviceFrame.setAttribute("id","oauthFrame"),serviceFrame.setAttribute("style","display: none; position:absolute; top:0px; left:0px;"),serviceFrame.src=OAUTH_SERVICE_URL+"/authorize?"+LEGACY_AUTHENTICATION+"response_type=token&client_id="+CLIENT_ID+"&redirect_uri="+REDIR_URL+"&id_token_hint="+IDTOKEN+"&scope="+scope,document.body.appendChild(serviceFrame),serviceFrame.addEventListener("load",function(){var hash,frameContent,frame=document.getElementById("oauthFrame");try{frameContent=frame.contentDocument,hash=frameContent.location.hash,hash||window.parent.postMessage({failed:!0,scope:scope},"*")}catch(e){onGetTokenError(scope)}},!1)}function getApps(){$("#existingProjectLoader").fadeIn(300),makeAjaxCall(APIMANAGEMENT_SERVICE_URL+"projects/"+APP_DATA.projectId+"/clients",lscache.get("tenantToken"),function(err,data){var $selectContainer=$("#selectApps"),$select=$("#applications");if(removeScopes(),!data||!data.length)return $("#appCredentials").slideUp(300),showErrorExistingProjectHeader("You have no client yet."),$("#injectHandler").slideUp(300),$selectContainer.slideUp(300);$("#appCredentials").slideUp(300),$("#injectHandler").slideUp(300,function(){sendMessageResizeNeeded()});var applications=[];data.forEach(function(app){applications.push({id:[app.id,app.clientId,app.clientSecret],text:app.displayName})}),$select.select2("val",""),setUpSelect($select,applications,"Select a Client"),data&&data.length&&$selectContainer.slideDown(300,function(){sendMessageResizeNeeded()}),APP_FIRST_FUNC_CALL||(APP_FIRST_FUNC_CALL=!0,$select.change(function(){$("#existingProjectLoader").fadeIn(300),$(".alert-danger").remove(),checkTokenCached("noTenantToken","hybris.no_tenant",getCredentials)}),$select.on("select2:open",function(){$(".select2-drop").each(function(){$(this).hasClass("select2-drop--secondary")||$(this).addClass("select2-drop--secondary")})})),$("#existingProjectLoader").fadeOut(300)})}function getCredentials(){removeScopes(),$.ajax({url:PACKAGE_SERVICE_URL+"/packages/available-scopes",method:"GET",retryCall:!0,headers:{Authorization:"Bearer "+lscache.get("tenantToken")},success:getTokenWithScopes,error:retryCall})}function injectCredentials(){try{window.sessionStorage.setItem("credentials",JSON.stringify(APP_DATA)),$("#iframeNotebook").contents().find("#credentialsButton").trigger("click")}catch(err){return}}function showHideCredentials(){credentialsHandler.setCredentials(APP_DATA,$("#appCredentials code"),!1)}function getTokenWithScopes(response){var scopes=window.scopes||obtainScopes(response).join(" ")||[];setSelectedAppData(function(){$.ajax({url:OAUTH_SERVICE_URL+"/token",method:"POST",contentType:"application/x-www-form-urlencoded; charset=UTF-8",retryCall:!0,data:{client_id:APP_DATA.clientId,client_secret:APP_DATA.clientSecret,grant_type:"client_credentials",scope:scopes},success:showAppInfoWithToken,error:retryCall})})}function showAppInfoWithToken(response){response.scope&&response.scope.length?(showScopesWithToken(response),showCredentialsWithToken(response)):showErrorExistingProjectHeader("Selected client has no scopes.")}function showCredentialsWithToken(response){APP_DATA.token=response.access_token,$("#existingProjectLoader").fadeOut(300),$("#injectHandler").slideUp(300),$("#appCredentials").slideUp(300),credentialsHandler.setCredentials(APP_DATA,$("#appCredentials code"),!0),$("#appCredentials").slideDown(300,sendMessageResizeNeeded),$("#injectHandler").slideDown(300)}function showScopesWithToken(response){showScopesAlert("Make sure that your client includes the scopes that are required for the tutorial."),showScopesList(response.scope.split(" "))}function showScopesList(scopes){var $expandCollapse=createExpandCollapse("Scopes of selected client",""),$scopesList=createScopesList(scopes);$expandCollapse.append($scopesList),$("#appScopes").append($expandCollapse),addExpandCollapse(function(){$("#appScopes").slideDown(300)})}function showScopesAlert(message){$("#appScopes").append('<div class="alert alert-success alert-dismissible" id="appScopesAlert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+message+"</div>").prev().slideDown(300)}function removeScopes(){$("#appScopes").slideUp(300,function(){$("#appScopes").empty()})}function createExpandCollapse(caption,text){return $("<div>",{"class":"expand-collapse","data-caption":caption}).text(text)}function createScopesList(scopes){var $list=$("<ul>",{"class":"list-group list-group--secondary"});return scopes.forEach(function(scope){$list.append($("<li>",{"class":"list-group-item list-group-item--secondary"}).text(scope))}),$list}function setSelectedAppData(cb){var selectOption=$("#applications").val().split(",");APP_DATA.appId=selectOption[0],$.ajax({url:APIMANAGEMENT_SERVICE_URL+"projects/"+APP_DATA.projectId+"/clients/"+APP_DATA.appId+"/credentials",method:"GET",headers:{Authorization:"Bearer "+lscache.get("tenantToken")},success:function(data){APP_DATA.clientId=data[0]&&data[0].clientId,APP_DATA.clientSecret=data[0]&&data[0].clientSecret,cb()},retryCall:!0,fail:retryCall,error:retryCall})}function showErrorExistingProjectHeader(msg){$("#existingProjectLoader").fadeOut(300),$("#existingProjectHeader").after('<div style="display:none;" class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+msg+"</div>").next().slideDown(300)}function onGetTokenError(scope){$("#existingProjectLoader").fadeOut(300),showErrorExistingProjectHeader("Your access token expired and we failed to renew it, please try again."),$("#projects").select2("val","")}function sendMessageResizeNeeded(){window.dispatchEvent(RESIZE_EVENT)}function setUpSelect(el,data,placeholder){el.select2({data:data,placeholder:placeholder}),$(".select2-container").each(function(){$(this).hasClass("select2-container--secondary")||$(this).addClass("select2-container--secondary")}),$(".select2-drop").each(function(){$(this).hasClass("select2-drop--secondary")||$(this).addClass("select2-drop--secondary")})}function makeAjaxCall(url,token,cb){$.ajax({url:url,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},retryCall:!0,success:function(data){cb(null,data)},fail:retryCall,error:retryCall})}function retryCall(){return this.retryCall?(this.retryCall=!1,$.ajax(this)):($("#existingProjectLoader").fadeOut(300),showErrorExistingProjectHeader("Error, please try again."),void $("#applications").select2("val",""))}function obtainScopes(packages){if(!Array.isArray(packages))return[];var requiredScopes=packages.map(function(singlePackage){return Array.isArray(singlePackage.availableScopes)?singlePackage.availableScopes.map(function(scope){return scope.id}):[]}).reduce(function(result,scopes){return result.concat(scopes)},[]);return $.unique(requiredScopes)}var PLUGIN=({proxy:{proxyUrl:"/proxy"},envVariables:{yodaLink:"https://api.beta.yaas.io/hybris/yoda/v1",oauthService:"https://api.beta.yaas.io/hybris/oauth2/v1",accountService:"https://api.beta.yaas.io/hybris/account/v1/",APIManangementService:"https://api.beta.yaas.io/hybris/api-management/v1/",packageService:"https://api.beta.yaas.io/hybris/package/v1",clientId:"AhvOOZ7fLGgJu2PUZCOFTLsum0DqFCQH",redirUrl:"http://127.0.0.1:9778/auth.html",loginCssUrl:"https://devportal.yaas.io/styles/auth-iframe.css"},customLocation:{path:"./apinotebooks",mode:"external"}}||{}).envVariables;if(PLUGIN){var USER_LOGIN,IDTOKEN,TO_REPLACE_REDIR_URL=PLUGIN.redirUrl,RESIZE_EVENT=new CustomEvent("resizeNeeded"),OAUTH_SERVICE_URL=PLUGIN.oauthService,APIMANAGEMENT_SERVICE_URL=PLUGIN.APIManangementService,ACCOUNT_SERVICE_URL=PLUGIN.accountService,CLIENT_ID=PLUGIN.clientId,REDIR_URL=TO_REPLACE_REDIR_URL,PACKAGE_SERVICE_URL=PLUGIN.packageService,APP_DATA={},APP_FIRST_FUNC_CALL=!1,PROJ_FIRST_FUNC_CALL=!1,SHOULD_CALL_FOR_NOTENANT_FOR_PROJECT=0,LEGACY_AUTHENTICATION=PLUGIN.legacyAuthentication?"hybris_id_provider=yaas&":"";$(document).ready(init),window.initApp=init}}},{"./credentialsFunctions":2}],2:[function(require,module,exports){"use strict";function _appendCredentialsAndButton(domObject){credentialsData&&domObject&&(domObject.html('<span class="hljs-tag"><strong>ClientId:</strong></span> '+credentialsData.clientId+'<br><span class="hljs-tag"><strong>ClientSecret:</strong></span> '+credentialsData.clientSecret+'<br><span class="hljs-tag"><strong>ClientName:</strong></span> '+credentialsData.appId+'<br><span class="hljs-tag"><strong>ProjectId:</strong></span> '+credentialsData.projectId+'<br><span class="hljs-tag"><strong>Token:</strong></span> '+credentialsData.token),domObject.next(".js-show-hide").text(credentialsData.buttonText))}function _initializeCredentialsData(initial,data){initial?credentialsData={appId:data.appId,clientId:MASKED_VALUES,clientSecret:MASKED_VALUES,projectId:data.projectId,token:data.token,buttonText:"show"}:"show"===credentialsData.buttonText?(credentialsData.clientId=data.clientId,credentialsData.clientSecret=data.clientSecret,credentialsData.buttonText="hide"):(credentialsData.clientId=MASKED_VALUES,credentialsData.clientSecret=MASKED_VALUES,credentialsData.buttonText="show")}function setCredentials(data,domObject,initial){data&&(_initializeCredentialsData(initial,data),_appendCredentialsAndButton(domObject))}var MASKED_VALUES="********",credentialsData={};module.exports={setCredentials:setCredentials}},{}]},{},[1])(1)});