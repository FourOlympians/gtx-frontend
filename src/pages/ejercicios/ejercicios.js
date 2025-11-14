console.log("Página de ejercicios cargada ✅");

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".muscle-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const muscle = card.dataset.muscle;
      // Redirige al menú de ejercicios de ese músculo
      window.location.href = `/src/pages/ejercicios/${muscle}.html`;
    });
  });
});
