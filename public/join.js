"use strict";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ID_CHARS = 3;
const SECRET_CHARS = 5;

function parseCode(text) {
  let chars = "";
  for (const c of text.toUpperCase()) {
    if (c === "-") continue;
    const mapped = c === "O" ? "0" : c === "I" || c === "L" ? "1" : c;
    if (!ALPHABET.includes(mapped)) return null;
    chars += mapped;
  }
  if (chars.length !== ID_CHARS + SECRET_CHARS) return null;
  return `${chars.slice(0, ID_CHARS)}-${chars.slice(ID_CHARS)}`;
}

function parseInvite(fragment) {
  const plus = fragment.lastIndexOf("+");
  if (plus < 1) return null;
  let address;
  try {
    address = decodeURIComponent(fragment.slice(0, plus));
  } catch {
    return null;
  }
  const code = parseCode(fragment.slice(plus + 1));
  if (!code || address.length > 255 || /[\s\p{Cc}+\/\\@?#]/u.test(address)) return null;
  return { address, code };
}

function isPhone() {
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function show(invite) {
  document.getElementById("invite").hidden = false;
  document.getElementById("address").textContent = invite.address;
  document.getElementById("code").textContent = invite.code;
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(invite[button.dataset.copy]);
      button.textContent = "Copied";
      setTimeout(() => (button.textContent = "Copy"), 2000);
    });
  }
  if (isPhone()) {
    document.getElementById("desktop-lead").hidden = true;
    document.getElementById("desktop-actions").hidden = true;
    document.getElementById("phone-lead").hidden = false;
    return;
  }
  const link = `throcc://join#${encodeURIComponent(invite.address).replaceAll("%3A", ":")}+${invite.code}`;
  document.getElementById("open").href = link;
  location.href = link;
}

const invite = parseInvite(location.hash.slice(1));
if (invite) {
  show(invite);
} else {
  document.getElementById("broken").hidden = false;
}
addEventListener("hashchange", () => location.reload());
