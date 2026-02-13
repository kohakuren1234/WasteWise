
const animatedElements = document.querySelectorAll(
  ".fade-in-up, .fade-in-left, .fade-in-right, .scale-in"
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      // Make element visible
      entry.target.style.opacity = "1";

      // Replay animation
      entry.target.style.animation = entry.target.dataset.animation;

    } else {

      // Hide element when leaving viewport
      entry.target.style.opacity = "0";

      // Reset animation so it can replay next time
      entry.target.style.animation = "none";
      void entry.target.offsetWidth; // Force reflow
    }
  });
}, { threshold: 0.2 });

// Save animation name and hide elements initially
animatedElements.forEach(el => {
  el.dataset.animation = getComputedStyle(el).animation;
  el.style.animation = "none";
  el.style.opacity = "0"; // START HIDDEN
  observer.observe(el);
});


function sendMail(){
    let parameters ={
      name : document.getElementById("name").value,
      topic : document.getElementById("topic").value,
      location : document.getElementById("location").value,
      message : document.getElementById("message").value,
      email : document.getElementById("email").value,
    }
    emailjs.send("service_vth4gi1","template_wgcn4zg",parameters).then(alert("Email has been sent."))
} 