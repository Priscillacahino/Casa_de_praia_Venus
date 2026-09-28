const box=document.querySelector("#termContent");
(async()=>{
  try {
    const response=await fetch("/api/legal/term", { credentials:"same-origin" });
    const text=await response.text();
    if (!response.ok) {
      let message="O termo vigente ainda não foi liberado para contratação.";
      try { message=JSON.parse(text).error || message; } catch {}
      throw new Error(message);
    }
    box.textContent=text;
  } catch (error) {
    box.textContent=error.message || "O termo vigente está temporariamente indisponível.";
  }
})();
