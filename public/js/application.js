"use strict";

let inputLength = {
  min: 3,
  max: 60,
};

document.addEventListener("click", (event) => {
  let targetId = event.target.id;
  if (
    (event.target.matches("input") || event.target.matches("textarea")) &&
    targetId.includes("Error")
  ) {
    let selectionId;
    if (targetId.includes("Error")) {
      selectionId = "#" + event.target.id;
    } else {
      selectionId = "#" + event.target.id + "Error";
    }
    const errordiv = document.querySelector(selectionId);
    errordiv.innerText = "";
  }

  if (targetId.includes("labelForEncode" || "encode")) {
    const errordiv = document.querySelector("#operationError");
    errordiv.innerText = "";
    const secretInput = document.querySelector("#secretMessageField");
    secretInput.style.display = "block";
  }

  if (targetId.includes("labelForDecode" || "decode")) {
    const errordiv = document.querySelector("#operationError");
    errordiv.innerText = "";
    const secretInput = document.querySelector("#secretMessageField");
    secretInput.style.display = "none";
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
  let fileErrorFlag, operationErrorFlag, secretMessageErrorFlag, keyErrorFlag;

  //Form Value Acquisition...
  let file = applicationForm.querySelector("#gifFile");
  let operationValues = document.getElementsByName("operation");
  let secretMessage = applicationForm.querySelector("#secretmessage");
  let key = applicationForm.querySelector("#key");
  let fileType;

  let fileLengthValue = file.files.length;
  if (fileLengthValue > 0) {
    fileType = file.files[0].type;
  }
  let secretMessageValue = secretMessage.value.trim();
  let keyValue = key.value.trim();

  /*.................................... 
            Validation Operations 
    ......................................*/

  //Validation for File...
  if (fileLengthValue == 0) {
    fileErrorFlag = true;
    setErrorFor(file, "* File Required!");
  } else if (!fileType.includes("image")) {
    fileErrorFlag = true;
    setErrorFor(file, "* Invalid File Type!");
  } else {
    fileErrorFlag = false;
    setSuccessFor(file);
  }

  //Validation for Operation...
  if (
    (operationValues[0].checked && operationValues[1].checked) ||
    (!operationValues[0].checked && !operationValues[1].checked)
  ) {
    operationErrorFlag = true;
    setErrorForID("operationError", "* Select One Operation!");
  } else {
    operationErrorFlag = false;
    setSuccessForID("operationError");
  }

  //Validation for Secret Message...
  if (secretMessageValue === "") {
    secretMessageErrorFlag = true;
    setErrorFor(secretMessage, "* Secret Message Required!");
  } else {
    secretMessageErrorFlag = false;
    setSuccessFor(secretMessage);
  }

  //Validation for Key...
  if (keyValue === "") {
    keyErrorFlag = true;
    setErrorFor(key, "* Key Required!");
  } else {
    keyErrorFlag = false;
    setSuccessFor(key);
  }

  //Validation Error Message Handlers...
  function setErrorFor(input, message) {
    const errordiv = applicationForm.querySelector("#" + input.id + "Error");
    errordiv.innerText = message;
  }

  function setErrorForID(id, message) {
    const errordiv = applicationForm.querySelector("#" + id);
    errordiv.innerText = message;
  }

  //Validation Success Message Handlers...
  function setSuccessFor(input) {
    const errordiv = applicationForm.querySelector("#" + input.id + "Error");
    errordiv.innerText = "";
  }

  function setSuccessForID(id) {
    const errordiv = applicationForm.querySelector("#" + id);
    errordiv.innerText = "";
  }

  function valueLength(value) {
    return value.toString().length;
  }

  if (
    fileErrorFlag == false &&
    secretMessageErrorFlag == false &&
    keyErrorFlag == false &&
    operationErrorFlag == false
  ) {
    return true;
  } else {
    return false;
  }
}
