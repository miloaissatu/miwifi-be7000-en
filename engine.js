// Translation engine: exact match, then longest-first phrase substitution, then rules.
(function (g) {
  const D = g.MI_DICT || {};
  const CJK = /[　-〿一-鿿＀-￯]/;
  const keys = Object.keys(D).filter(k => k.length >= 2).sort((a, b) => b.length - a.length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = keys.length ? new RegExp(keys.map(esc).join('|'), 'g') : null;
  const ALNUM = /[A-Za-z0-9]/;
  const PUNCT = [[/：/g, ': '], [/，/g, ', '], [/。/g, '. '], [/、/g, ', '], [/；/g, '; '], [/！/g, '! '],
                 [/？/g, '? '], [/（/g, ' ('], [/）/g, ') '], [/[“”「」]/g, '"'], [/[‘’]/g, "'"], [/…+/g, '...'], [/·/g, ' - ']];
  const RULES = [
    [/(\d{4})年(\d{1,2})月(\d{1,2})日/g, '$1-$2-$3'],
    [/(\d+)\s*台/g, '$1 device(s)'],
    [/(\d+)\s*天/g, '$1 day(s)'],
    [/(\d+)\s*秒/g, '$1 s'],
    [/(\d+)\s*个?字节/g, '$1 bytes'],
    [/(\d+)\s*个字/g, '$1 characters'],
    [/(\d+)\s*个/g, '$1'],
  ];
  // Patterns with real numbers/values, applied before phrase substitution.
  const PRE = [
    [/字太多[，,]\s*最多允许\s*(\d+)\s*字节/g, 'Too many bytes, at most $1'],
    [/字节太多[，,]\s*最多允许\s*(\d+)\s*字节/g, 'Too many bytes, at most $1'],
    [/字节太少[，,]\s*最少允许\s*(\d+)\s*字节/g, 'Too few bytes, at least $1'],
    [/字太多[，,]\s*最多允许\s*(\d+)\s*字/g, 'Too many characters, at most $1'],
    [/字太少[，,]\s*最少允许\s*(\d+)\s*字/g, 'Too few characters, at least $1'],
    [/最多允许\s*(\d+)\s*个字节[。.]?/g, 'At most $1 bytes allowed.'],
    [/最多允许\s*(\d+)\s*个字[。.]?/g, 'At most $1 characters allowed.'],
    [/请至少输入\s*(\d+)\s*个字节[。.]?/g, 'Enter at least $1 bytes.'],
    [/请至少输入\s*(\d+)\s*个字[。.]?/g, 'Enter at least $1 characters.'],
    [/请输入一个\s*(\d+)\s*位以内正整数[。.]?/g, 'Enter a positive integer of at most $1 digits.'],
    [/时间跨度不得超过\s*(\d+)\s*天[。.]?/g, 'The time span must not exceed $1 days.'],
    [/输入值太大[，,]\s*最大允许\s*(\S+?)[。.]?$/g, 'Value too large; maximum is $1.'],
    [/输入值太小[，,]\s*最小允许\s*(\S+?)[。.]?$/g, 'Value too small; minimum is $1.'],
    [/日期太早[，,]\s*最早允许\s*(\S+?)[。.]?$/g, 'Date too early; earliest allowed is $1.'],
    [/日期太晚[，,]\s*最晚允许\s*(\S+?)[。.]?$/g, 'Date too late; latest allowed is $1.'],
    [/等待自动跳转\.\.\.\s*用时\s*(\d+)\s*秒/g, 'Redirecting automatically... $1 s'],
    [/设置成功[，,]\s*请等待\s*(\d+)\s*秒完成模式切换/g, 'Success. Please wait $1 seconds for the mode switch.'],
    [/发现新版本[,，]\s*升级包大小为\s*(\S+?)[，,]\s*请立即升级[。.]?/g, 'New version found, update size $1. Please update now.'],
    [/当前版本\s*(\S+?)[，,]/g, 'Current version $1, '],
    [/检测到最新版本为\s*(\S+?)[，,]/g, 'Latest version detected: $1, '],
    [/(\d+)\s*台终端接入/g, '$1 devices connected'],
    [/年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/g, '-$1-$2'],
  ];
  const cache = new Map();
  function translate(text) {
    if (!text || !CJK.test(text)) return text;
    if (cache.has(text)) return cache.get(text);
    const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0];
    let core = text.trim();
    for (const [r, x] of PRE) core = core.replace(r, x);
    if (!CJK.test(core)) { const res0 = lead + core + trail; cache.set(text, res0); return res0; }
    let out;
    if (Object.prototype.hasOwnProperty.call(D, core)) {
      out = D[core];
    } else {
      out = '';
      let last = 0, m, prevTrans = false;
      const push = (piece, isTrans) => {
        if (!piece) return;
        if (out && ((ALNUM.test(out[out.length - 1]) && ALNUM.test(piece[0]) && (isTrans || prevTrans)) || (prevTrans && out[out.length - 1] === ':' && ALNUM.test(piece[0])))) out += ' ';
        out += piece; prevTrans = isTrans;
      };
      if (re) {
        re.lastIndex = 0;
        while ((m = re.exec(core))) {
          push(core.slice(last, m.index), false);
          push(D[m[0]], true);
          last = m.index + m[0].length;
        }
      }
      push(core.slice(last), false);
      for (const [r, s] of RULES) out = out.replace(r, s);
      for (const [r, s] of PUNCT) out = out.replace(r, s);
      out = out.replace(/ {2,}/g, ' ').replace(/\( /g, '(').replace(/ ([,.;:!?)])/g, '$1').trim();
    }
    const res = lead + out + trail;
    cache.set(text, res);
    return res;
  }
  g.MI_translate = translate;
  g.MI_hasCJK = t => CJK.test(t);
})(typeof self !== 'undefined' ? self : this);
