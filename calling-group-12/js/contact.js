
function showContactOptions(){
    document.getElementById("contactModal").style.display = "flex";
}

function closeContactOptions(){
    document.getElementById("contactModal").style.display = "none";
}

function callNumber(number){
    window.location.href = "tel:" + number;
}
