"use strict";

document.addEventListener("click", (event) => {
  console.log(event.target.className);
  if (event.target.matches(".email") || event.target.matches(".download")) {
    event.preventDefault();
    let className;
    if (event.target.matches(".email")) {
      className = "email";
    } else if (event.target.matches(".download")) {
      className = "download";
    }
    if (confirm(`Are you sure you want to ${className}?`)) {
      let form = document.querySelector("#" + className + "form");
      disableButton(className);
      form.submit();
      enableButton(className);
    }
  }
});

function disableButton(name) {
  const button = document.getElementById(name);
  const classElement = document.querySelectorAll(name);
  classElement.forEach((e) => {
    e.classList.remove(name);
  });
  button.disabled = true;
  button.style.opacity = 0.5;
}

function enableButton(name) {
  setTimeout(() => {
    const button = document.getElementById(name);
    const classElement = button.children;
    for (let e of classElement) {
      e.classList.add(name);
    }
    button.disabled = false;
    button.style.opacity = 1;
    alert(name.toUpperCase() + " SUCCESSFUL");
  }, 5000);
}
