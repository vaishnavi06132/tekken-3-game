const canvas= document.getElementById("tekgame");
const con= canvas.getContext("2d");
canvas.width= window.innerWidth;
canvas.height= window.innerHeight;
window.addEventListener("resize", function()
{ 
    canvas.width=window.innerWidth();
    canvas.height=window.innerHeight();

});