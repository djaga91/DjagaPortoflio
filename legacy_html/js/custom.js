
  (function ($) {
  
  "use strict";

    // PRE LOADER
    $(window).load(function(){
      $('.preloader').fadeOut(1000); // set duration in brackets    
    });

    // CUSTOM LINK
    $('.custom-link').click(function(){
    var el = $(this).attr('href');
    var elWrapped = $(el);
    var header_height = $('.navbar').height() + 10;

    scrollToDiv(elWrapped,header_height);
    return false;

    function scrollToDiv(element,navheight){
      var offset = element.offset();
      var offsetTop = offset.top;
      var totalScroll = offsetTop-navheight;

      $('body,html').animate({
      scrollTop: totalScroll
      }, 300);
  }
});
    
  })(window.jQuery);



document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêcher la redirection

    const form = event.target;
    const formData = new FormData(form);
    
    fetch("https://formspree.io/f/xbldanjv", {
        method: "POST",
        body: formData,
        headers: {
            "Accept": "application/json"
        }
    }).then(response => {
        if (response.ok) {
            document.getElementById("formResponse").innerHTML = 
                "<p class='text-success'>Message sent successfully!</p>";
            form.reset(); // Réinitialiser le formulaire
        } else {
            document.getElementById("formResponse").innerHTML = 
                "<p class='text-danger'>Error sending message. Try again.</p>";
        }
    }).catch(error => {
        document.getElementById("formResponse").innerHTML = 
            "<p class='text-danger'>Error: " + error.message + "</p>";
    });
});

document.querySelectorAll('.timeline-item-link').forEach(item => {
  item.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
          const offset = 100; // Ajuste selon la hauteur de la navbar
          const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
              top: elementPosition - offset,
              behavior: "smooth"
          });
      }
  });
});