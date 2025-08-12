let username = document.getElementById("username");
let password = document.getElementById("password");
let pass = document.getElementById("pass")
let submit = document.getElementById("submit");

submit.addEventListener("click",function (event) {
    event.preventDefault()
    if (password.value.length<6){
        pass.style.display = "block";
    }
        
    
    
})


