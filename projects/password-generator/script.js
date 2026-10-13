const $ = id => document.getElementById(id);
const out = $('password'), lenInput = $('length'), lenValue = $('lenValue');
const meter = $('meterFill'), strengthLabel = $('strengthLabel');
const historyNote = $('historyNote');

const SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?'
};
const AMBIGUOUS = /[0O1lI|`'"~]/g;

function buildAlphabet(){
  let alpha = '';
  if ($('upper').checked) alpha += SETS.upper;
  if ($('lower').checked) alpha += SETS.lower;
  if ($('digits').checked) alpha += SETS.digits;
  if ($('symbols').checked) alpha += SETS.symbols;
  if ($('noAmbiguous').checked) alpha = alpha.replace(AMBIGUOUS, '');
  return alpha;
}

function generate(){
  const alpha = buildAlphabet();
  if (!alpha) { out.value = ''; updateStrength(); return; }
  const len = Number(lenInput.value);
  const bytes = new Uint32Array(len);
  crypto.getRandomValues(bytes);
  let pw = '';
  for (let i = 0; i < len; i++) pw += alpha[bytes[i] % alpha.length];
  out.value = pw;
  updateStrength();
}

function updateStrength(){
  const pw = out.value;
  lenValue.textContent = lenInput.value;
  if (!pw) { meter.style.width = '0'; strengthLabel.textContent = 'Strength'; return; }
  let variety = 0;
  if (/[A-Z]/.test(pw)) variety++;
  if (/[a-z]/.test(pw)) variety++;
  if (/[0-9]/.test(pw)) variety++;
  if (/[^A-Za-z0-9]/.test(pw)) variety++;
  const score = Math.min(4, Math.round(pw.length / 8) + variety);
  const levels = [
    { w: '15%', c: '#e35b5b', t: 'Weak' },
    { w: '40%', c: '#e39c3b', t: 'Fair' },
    { w: '65%', c: '#e3d33b', t: 'Good' },
    { w: '85%', c: '#7ed17e', t: 'Strong' },
    { w: '100%', c: '#4ade80', t: 'Excellent' }
  ];
  const lvl = levels[Math.max(0, Math.min(4, score))];
  meter.style.width = lvl.w;
  meter.style.background = lvl.c;
  strengthLabel.textContent = 'Strength: ' + lvl.t;
}

$('options').addEventListener('submit', e => { e.preventDefault(); generate(); });
lenInput.addEventListener('input', () => { lenValue.textContent = lenInput.value; generate(); });
['upper','lower','digits','symbols','noAmbiguous'].forEach(id => {
  $(id).addEventListener('change', generate);
});

$('copy').addEventListener('click', async () => {
  if (!out.value) return;
  try {
    await navigator.clipboard.writeText(out.value);
    const btn = $('copy');
    const old = btn.textContent;
    btn.textContent = 'Copied OK';
    setTimeout(() => btn.textContent = old, 1500);
    historyNote.textContent = 'Copied to clipboard.';
  } catch {
    out.select();
    document.execCommand('copy');
    historyNote.textContent = 'Copied (fallback).';
  }
});

generate();