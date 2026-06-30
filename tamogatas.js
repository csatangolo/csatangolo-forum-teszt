// Banki adatok másolása
document.querySelectorAll(".copy-bank-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const value = btn.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(value);
      const old = btn.textContent;
      btn.textContent = "Másolva";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = old;
        btn.classList.remove("copied");
      }, 1600);
    } catch (e) {
      alert("Másold ki kézzel: " + value);
    }
  });
});

const SUPABASE_URL=window.CSATANGOLO_SUPABASE_URL;const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;const client=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);function slug(s){return String(s||"logo").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"logo"}document.getElementById("supportForm")?.addEventListener("submit",async e=>{e.preventDefault();const f=e.target,msg=document.getElementById("supportMessage");msg.textContent="Küldés folyamatban...";try{let logo_url="";const file=f.elements.logo.files[0];if(file){const ext=file.name.split(".").pop();const path=`support-logos/${Date.now()}-${slug(file.name)}.${ext}`;const {error}=await client.storage.from("forum-assets").upload(path,file,{upsert:false});if(error)throw error;logo_url=client.storage.from("forum-assets").getPublicUrl(path).data.publicUrl;}const {error:db}=await client.from("supports").insert({supporter_name:f.elements.supporter_name.value.trim(),email:f.elements.email.value.trim(),phone:f.elements.phone.value.trim(),support_type:f.elements.support_type.value,amount:f.elements.amount.value.trim(),support_details:f.elements.support_details.value.trim(),logo_url,anonymous:f.elements.anonymous.checked,public_display:f.elements.public_display.checked,payment_payment_status:"pending"});if(db)throw db;msg.className="form-message success";msg.textContent="Köszönjük! A támogatási szándék beérkezett, jóváhagyás után kerülhet megjelenítésre.";f.reset();}catch(err){console.error(err);msg.className="form-message error";msg.textContent="Nem sikerült elküldeni. Ellenőrizd, hogy lefutott-e a Master SQL.";}});