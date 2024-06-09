/*
  1: main set header rule
  20-39: protected rules
*/
class Network {
  #MAX_EXCEPTION_RULES = 20;

  configure() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get({
        'mode': 'blacklist',
        'ua': '',
        'blacklist': [],
        'whitelist': [],
        'protected': [
          'google.com/recaptcha',
          'gstatic.com/recaptcha',
          'accounts.google.com',
          'accounts.youtube.com',
          'gitlab.com/users/sign_in'
        ]
      }, prefs => {
        console.log('Header UA: ' + prefs.ua);

        Promise.all([
          this.net(prefs)
        ]).then(resolve, reject);
      });
    });
  }
  async net(prefs) {
    const addRules = [];
    const resourceTypes = Object.values(chrome.declarativeNetRequest.ResourceType);

    if (prefs.ua && prefs.mode === 'blacklist') {
      const one = {
        'id': 1,
        'priority': 1,
        'action': {
          'type': 'modifyHeaders',
          'requestHeaders': [{
            'header': 'user-agent',
            'operation': 'set',
            'value': prefs.ua
          }]
        },
        'condition': {
          'resourceTypes': Object.values(chrome.declarativeNetRequest.ResourceType)
        }
      };
      if (prefs.blacklist.length) {
        one.condition.excludedInitiatorDomains = prefs.blacklist;
      }
      addRules.push(one);

      if (prefs.protected.length) {
        let n = 20; // 20-39
        let rule = '';
        const rules = new Map();
        for (const c of prefs.protected) {
          const regex = c.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
          const v = await chrome.declarativeNetRequest.isRegexSupported({
            regex
          });
          if (v.isSupported) {
            const tmp = rule + (rule !== '' ? '|' : '') + regex;
            const w = await chrome.declarativeNetRequest.isRegexSupported({
              regex: tmp
            });
            if (w.isSupported) {
              rule = tmp;
            }
            else {
              rules.set(n, rule);
              rule = regex;
              n += 1;
            }
          }
          else {
            console.error('protected rule is ignored', c);
          }
        }
        if (rule !== '') {
          rules.set(n, rule);
        }
        for (const [id, regexFilter] of rules.entries()) {
          if (id >= 20 + this.#MAX_EXCEPTION_RULES) {
            break;
          }
          addRules.push({
            id,
            'priority': 2,
            'action': {
              'type': 'allow'
            },
            'condition': {
              regexFilter,
              resourceTypes
            }
          });
        }
      }
    }
    else if (prefs.ua && prefs.mode === 'whitelist' && prefs.whitelist.length) {
      const one = {
        'id': 1,
        'priority': 1,
        'action': {
          'type': 'modifyHeaders',
          'requestHeaders': [{
            'header': 'user-agent',
            'operation': 'set',
            'value': prefs.ua
          }]
        },
        'condition': {
          'initiatorDomains': prefs.whitelist,
          resourceTypes
        }
      };

      addRules.push(one);
    }

    console.log(addRules);

    return chrome.declarativeNetRequest.updateDynamicRules({
      addRules,
      removeRuleIds: [1, ...Array.from({
        length: this.#MAX_EXCEPTION_RULES
      }, (_, index) => 20 + index)]
    });
  }

}
