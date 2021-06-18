AOS.init({
  duration: 1500,
});

const icons = document.querySelectorAll(".feature .material-icons");
const features = document.querySelectorAll(".feature");

features.forEach(feature => {
  feature.addEventListener("mouseenter", function () {
    const span = this.firstElementChild;
    span.classList.add("animate__animated", "animate__headShake");
    setTimeout(() => {
      span.classList.remove("animate__animated", "animate__headShake");
    }, 100);
  });
});
