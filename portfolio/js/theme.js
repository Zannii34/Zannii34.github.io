document.addEventListener("DOMContentLoaded", function(){

    const themeButton = document.getElementById("themeToggle");

    if(!themeButton) return;

    /* Load saved theme */
    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark-mode");
        themeButton.innerHTML = "☀️";
    }

    /* Toggle theme */
    themeButton.addEventListener("click", function(){

        document.body.classList.toggle("dark-mode");

        if(document.body.classList.contains("dark-mode")){
            localStorage.setItem("theme","dark");
            themeButton.innerHTML = "☀️";
        } else {
            localStorage.setItem("theme","light");
            themeButton.innerHTML = "🌙";
        }

    });

});
