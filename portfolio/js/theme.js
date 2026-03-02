const themeButton = document.getElementById("themeToggle");

/* Load saved theme */
if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode");
    themeButton.innerHTML = "☀️";
}

/* Auto system theme detection */
if(!localStorage.getItem("theme")){
    if(window.matchMedia("(prefers-color-scheme: dark)").matches){
        document.body.classList.add("dark-mode");
        themeButton.innerHTML = "☀️";
    }
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
