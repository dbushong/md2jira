'use strict';

let lastElm;
document.addEventListener('mousedown', function (ev) {
  if (ev.button == 2) lastElm = ev.target;
}, true);

chrome.runtime.onMessage.addListener(function (msg, sndr, respond) {
  if (msg.jira) {
    if (lastElm.md2JiraId != msg.id) {
      console.warn('markdown2jira: lastElm id (' + lastElm.md2JiraId + ') ' +
                   'does not match requested (' + msg.id + ')');
      return;
    }
    if (lastElm.md2JiraDone && !confirm('Convert again?')) return;
    lastElm.value = msg.jira;
    lastElm.md2JiraDone = true;
  }
  else {
    lastElm.md2JiraId = msg.id;
    respond({ md: lastElm.value });
  }
});
