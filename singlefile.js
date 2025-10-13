 
 //Form submission handling
 document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('formMessage').textContent = 'Thank you for contacting me!';
            this.reset();
        });

//dark mode toggle
function darklight() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}