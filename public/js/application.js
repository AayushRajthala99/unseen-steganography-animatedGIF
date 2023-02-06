"use strict";

let inputLength = {
  min: 3,
  max: 60,
};

let fileErrorFlag = false;
const gifFile = document.querySelector("#gifFile");

gifFile.addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onloadend = () => {
    const buf = new Uint8Array(reader.result);
    const hex = Array.from(buf.slice(0, 3), (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");

    if (hex === "474946") {
      fileErrorFlag = false;
      setSuccessFor(gifFile);
    } else {
      fileErrorFlag = true;
      setErrorFor(gifFile, "* Corrupt GIF File!");
    }

    let fileType;
    let fileLengthValue = gifFile.files.length;
    if (fileLengthValue > 0) {
      fileType = gifFile.files[0].type;
      if (!fileType.includes("gif")) {
        fileErrorFlag = true;
        setErrorFor(gifFile, "* Invalid File Type!");
      }
    }
  };
});

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

function applicationFormValidation() {
  let { operationErrorFlag, secretMessageErrorFlag, keyErrorFlag } = false;

  //Form Value Acquisition...
  const operationValues = document.getElementsByName("operation");
  const secretMessage = document.querySelector("#secretmessage");
  const key = document.querySelector("#key");

  let keyValue = key.value.trim();
  let fileLengthValue = gifFile.files.length;
  let secretMessageValue = secretMessage.value.trim();

  /*.................................... 
            Validation Operations 
    ......................................*/

  //Validation for File...
  if (fileLengthValue == 0) {
    fileErrorFlag = true;
    setErrorFor(gifFile, "* File Required!");
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

//Validation Error Message Handlers...
function setErrorFor(input, message) {
  const errordiv = document.querySelector("#" + input.id + "Error");
  errordiv.innerText = message;
}

function setErrorForID(id, message) {
  const errordiv = document.querySelector("#" + id);
  errordiv.innerText = message;
}

//Validation Success Message Handlers...
function setSuccessFor(input) {
  const errordiv = document.querySelector("#" + input.id + "Error");
  errordiv.innerText = "";
}

function setSuccessForID(id) {
  const errordiv = document.querySelector("#" + id);
  errordiv.innerText = "";
}
