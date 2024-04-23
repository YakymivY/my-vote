let al = document.getElementById("alert");
let message = document.getElementById("alert_msg");

function showMessage(msg) {
    message.innerText = msg;
    al.classList.remove("hide");
    al.classList.add("show");
    al.classList.add("showAlert");
    setTimeout(() => {
        hideMessage();
    }, 3000)
}

function hideMessage() {
    al.classList.add("hide");
    al.classList.remove("show");
}