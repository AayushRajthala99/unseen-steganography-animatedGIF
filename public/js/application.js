"use strict";

let inputLength = {
  min: 3,
  max: 60,
};

document.addEventListener("click", (event) => {
  let targetId = event.target.id;
  if (
    event.target.matches("input") ||
    event.target.matches("textarea") ||
    targetId.includes("Error")
  ) {
    let selectionId;
    if (targetId.includes("Error")) {
      selectionId = "#" + event.target.id;
    } else {
      selectionId = "#" + event.target.id + "Error";
    }
    const errordiv = document.querySelector(selectionId);
    console.log("#" + event.target.id + "Error");
    console.log(errordiv);
    errordiv.innerText = "";
  }

  if (event.target.className == "submit-button") {
    event.preventDefault();
    const applicationForm = document.querySelector("#applicationform");
    const correctSubmissionFlag = applicationFormValidation(applicationForm);

    if (correctSubmissionFlag) {
      if (confirm("Are You Sure You Want To Submit?")) {
        applicationForm.submit();
      }
    }
  }
});

function applicationFormValidation(applicationForm) {
  /*.................................... 
            Validation Operations 
    ......................................*/

  //Validation Error Message Handlers...
  function setErrorFor(input, message) {
    const formControl = applicationForm.querySelector(
      "#labelcontainer" + input.id
    );
    const errordiv = formControl.querySelector(".form-error");
    errordiv.innerText = message;
  }

  //Validation Success Message Handlers...
  function setSuccessFor(input) {
    const formControl = applicationForm.querySelector(
      "#labelcontainer" + input.id
    );
    const errordiv = formControl.querySelector(".form-error");
    errordiv.innerText = "";
  }

  function valueLength(value) {
    return value.toString().length;
  }
  return true;
}
