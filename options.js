(function () {
  const api = typeof browser !== 'undefined' ? browser : chrome;
  const A = window.MI_allow, box = document.getElementById('list'), msg = document.getElementById('msg');
  const say = t => { msg.textContent = t; setTimeout(() => { msg.textContent = ''; }, 3000); };

  api.storage.local.get('allowlist').then(r => {
    box.value = (Array.isArray(r.allowlist) && r.allowlist.length ? r.allowlist : A.DEFAULT).join('\n');
  });
  document.getElementById('save').onclick = () => {
    const list = A.parse(box.value);
    const out = list.length ? list : A.DEFAULT; // an empty list falls back to the default
    api.storage.local.set({ allowlist: out }).then(() => { box.value = out.join('\n'); say('Saved'); });
  };
  document.getElementById('reset').onclick = () => {
    api.storage.local.set({ allowlist: A.DEFAULT }).then(() => { box.value = A.DEFAULT.join('\n'); say('Reset'); });
  };
})();
