'use strict';

function jiraEscape(str) {
  return str.replace(/[()\[\]{}_*#?+^~-]|:[PD]/g, '\\$&');
}

function inlineCode(md) {
  let m;
  if (m = md.match(/^(\w*)\n([\s\S]+)/)) {
    let lang = m[1].toLowerCase();
    let code = m[2];
    if (lang === 'json' || lang === 'js') lang = 'javascript';
    if (/^(javascript|actionscript|xml|sql)$/.test(lang))
      return '{code:' + lang + '}\n' + code + '{code}\n';
    return '{noformat}\n' + code + '\n{noformat}\n\n';
  }
  else {
    return '{{' + jiraEscape(md) + '}}';
  }
}

function handleElms(elms, bullet) {
  return elms.map(function (e) { return handleElm(e, bullet); }).join('');
}

function fixUsers(str) {
  return jiraEscape(str).replace(/(^|\s)@(\S+)/g, '$1[~$2]');
}

function handleElm(elm, bullet) {
  //console.log('handleElm', JSON.stringify(elm));
  if ('string' === typeof elm) return fixUsers(elm);
  let type = elm.shift();
  switch (type) {
  case 'para':
    return handleElms(elm) + '\n\n';
  case 'header':
    return 'h' + elm.shift().level + '. ' + handleElms(elm) + '\n';
  case 'strong':
    return '*' + handleElm(elm[0]) + '*';
  case 'em':
    return '_' + handleElm(elm[0]) + '_';
  case 'inlinecode':
    return inlineCode(elm[0]);
  case 'code_block':
    return inlineCode('\n' + elm[0]);
  case 'link':
    return '[' + handleElms(elm.slice(1)) + '|' + elm[0].href + ']';
  case 'bulletlist':
    return handleElms(elm, (bullet||'')+'*') + '\n';
  case 'numberlist':
    return handleElms(elm, (bullet||'')+'#') + '\n';
  case 'listitem':
    return bullet + ' ' + handleElms(elm) + '\n';
  default:
    console.warn('unknown type: ' + type, elm);
    return '';
  }
}

function md2jira(md) {
  return handleElms(
    markdown.parse(md).slice(1) // strip off 'markdown' string
  ).trim();
}

let ids = 0;
function convert(info, tab) {
  let id = ++ids;
  chrome.tabs.sendMessage(tab.id, { id: id }, function (msg) {
    chrome.tabs.sendMessage(tab.id, { id: id, jira: md2jira(msg.md) });
  });
}

chrome.contextMenus.create({
  title:    'Markdown → JIRA',
  contexts: ['editable'],
  onclick:  convert
});
