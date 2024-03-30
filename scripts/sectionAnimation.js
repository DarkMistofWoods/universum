document.querySelectorAll('.category-section, .container').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.classList.add('expanded-shadow');
    });

    element.addEventListener('mouseleave', function() {
        this.classList.remove('expanded-shadow');
    });
});