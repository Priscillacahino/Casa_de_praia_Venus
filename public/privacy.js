const contact = document.querySelector("#privacyContact");
(async()=>{
  try {
    const response = await fetch("/api/public", { credentials:"same-origin" });
    const data = await response.json();
    if (!response.ok) throw new Error();
    const email = String(data.settings?.email || "").trim();
    const phone = String(data.settings?.whatsappNumber || "").trim();
    const parts = [];
    if (email) parts.push("E-mail: " + email);
    if (phone) parts.push("WhatsApp: +" + phone);
    contact.className = "notice ok";
    contact.textContent = parts.length ? parts.join(" · ") : "Use o canal oficial de contato informado na página principal.";
  } catch {
    contact.textContent = "Use o canal oficial de contato informado na página principal.";
  }
})();
