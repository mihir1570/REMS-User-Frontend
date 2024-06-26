// -------------------------MAIN INQUIRY FORM SCRIPT---------------------------
const insertData = async () => {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("contact_no").value;
    const interest = document.getElementById("message").value;

    const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const validPhoneNumberRegex = /^(\+[1-9]{1}[0-9]{3,14})?([0-9]{9,14})$/;

    if (name.trim() === "" && email.trim() === "" && phone.trim() === "" && interest.trim() === "") {
        showAlert("Kindly complete the form provided.");
    } else if (name.trim() === "") {
        showAlert("Please enter your name.");
    } else if (email.trim() === "") {
        showAlert("Please provide your email address.");
    } else if (!email.match(validEmailRegex)) {
        showAlert("Please enter a valid email address.");
    } else if (phone.trim() === "") {
        showAlert("Please provide your phone number.");
    } else if (!phone.match(validPhoneNumberRegex)) {
        showAlert("Please enter a valid phone number.");
    } else if (interest.trim() === "") {
        showAlert("Please specify your inquiry.");
    } else {
        showAlert("Thank you! Your inquiry has been successfully submitted.");
        const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const date = new Date()
        const day = date.getDate()
        const month = monthName[date.getMonth()]
        const year = date.getFullYear()
        const status = "initiated"


        const datas = await fetch("http://localhost:4500/addInquiries", {
            method: "POST",
            body: JSON.stringify({ name, email, phone, interest, day, month, year, status }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const result = await datas.json();
        if (result) {
            document.getElementById("Contact_Us").reset(); // Reset the form after successful submission
        }
    }
};
const clearForm = () => {
    document.getElementById("Contact_Us").reset(); // Resets the form
};
const showAlert = (message) => {
    const alertMessage = document.getElementById("alertMessage");
    alertMessage.textContent = message;
};


// --------------------------GET IN TOUCH FORM SCRIPT----------------------------
const insertData2 = async () => {
    const name = document.getElementById("name2").value;
    const phone = document.getElementById("contact_no2").value;
    const email = document.getElementById("email2").value;
    const message = document.getElementById("message2").value;

    const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const phoneNumberRegex = /^(\+[1-9]{1}[0-9]{3,14})?([0-9]{9,14})$/;

    if (name.trim() === "" && phone.trim() === "" && email.trim() === "" && message.trim() === "") {
        alert("Kindly complete the form provided.");
    } else if (name.trim() === "") {
        alert("Please enter your name.");
    } else if (phone.trim() === "") {
        alert("Please provide your phone number.");
    } else if (!phone.match(phoneNumberRegex)) {
        alert("Please enter a valid phone number.");
    } else if (email.trim() === "") {
        alert("Please provide your email address.");
    } else if (!email.match(validEmailRegex)) {
        alert("Please enter a valid email address.");
    } else if (message.trim() === "") {
        alert("Please enter your message of interest.");
    } else {
        alert("Your information has been submitted successfully.");
        showAlert("Thank you! Your inquiry has been successfully submitted.");
        const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const date = new Date()
        const day = date.getDate()
        const month = monthName[date.getMonth()]
        const year = date.getFullYear()
        const status = "initiated"


        const datas = await fetch("http://localhost:4500/addGetintouchs", {
            method: "POST",
            body: JSON.stringify({ name, phone, email, message, day, month, year, status }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const result = await datas.json();
        if (result) {
            document.getElementById("Contact_Us2").reset();
        }
    }
};
const clearForm2 = () => {
    document.getElementById("Contact_Us2").reset(); // Resets the form
};


// --------------------------CHANNEL PARTNER FORM SCRIPT--------------------------
const insertData5 = async () => {
    const name = document.getElementById("name5").value;
    const email = document.getElementById("email5").value;
    const phone = document.getElementById("contact_no5").value;
    const companyname = document.getElementById("company_name5").value;
    const message = document.getElementById("message5").value;

    const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const phoneNumberRegex = /^(\+[1-9]{1}[0-9]{3,14})?([0-9]{9,14})$/;

    if (name.trim() === "" && email.trim() === "" && phone.trim() === "" && companyname.trim() === "" && message.trim() === "") {
        showAlert3("Kindly complete the form provided.");
    } else if (name.trim() === "") {
        showAlert3("Please enter your name.");
    } else if (email.trim() === "") {
        showAlert3("Please provide your email address.");
    } else if (!email.match(validEmailRegex)) {
        showAlert3("Please enter a valid email address.");
    } else if (phone.trim() === "") {
        showAlert3("Please provide your phone number.");
    } else if (!phone.match(phoneNumberRegex)) {
        showAlert3("Please enter a valid phone number.");
    } else if (companyname.trim() === "") {
        showAlert3("Please enter your company name");
    } else if (message.trim() === "") {
        showAlert3("Please enter your message of interest.");
    } else {
        showAlert3("Your information has been submitted successfully.");
        alert("Your information has been submitted successfully.");
        const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const date = new Date();
        const day = date.getDate();
        const month = monthName[date.getMonth()]
        const year = date.getFullYear();
        const status = "initiated"


        const datas = await fetch("http://localhost:4500/addCpartners", {
            method: "POST",
            body: JSON.stringify({ name, email, phone, companyname, message, day, month, year, status }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const result = await datas.json();
        if (result) {
            document.getElementById("Contact_Us2").reset(); // Reset the form after successful submission
        }
    }
};
const clearForm3 = () => {
    document.getElementById("Contact_Us2").reset(); // Resets the form
};
const showAlert3 = (message) => {
    const alertMessage = document.getElementById("alertMessage3");
    alertMessage.textContent = message;
};


// ---------------------------CONTACT US INQUIRY SCRIPT-----------------------------
const insertData6 = async () => {
    const name = document.getElementById("name6").value;
    const email = document.getElementById("email6").value;
    const phone = document.getElementById("contact_no6").value;
    const select = document.getElementById("position6").value;
    const message = document.getElementById("message6").value;

    const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const phoneNumberRegex = /^(\+[1-9]{1}[0-9]{3,14})?([0-9]{9,14})$/;

    if (name.trim() === "" && email.trim() === "" && phone.trim() === "" && select.trim() === "Applying for" && message.trim() === "") {
        showAlert6("Kindly complete the form provided.");
    } else if (name.trim() === "") {
        showAlert6("Please enter your name.");
    } else if (email.trim() === "") {
        showAlert6("Please provide your email address.");
    } else if (!email.match(validEmailRegex)) {
        showAlert6("Please enter a valid email address.");
    } else if (phone.trim() === "") {
        showAlert6("Please provide your phone number.");
    } else if (!phone.match(phoneNumberRegex)) {
        showAlert6("Please enter a valid phone number.");
    } else if (select.trim() === "Applying for") {
        showAlert6("Please select any option");
    } else if (message.trim() === "") {
        showAlert6("Please enter your message of interest.");
    } else {
        showAlert6("Your information has been submitted successfully.");
        alert("Your information has been submitted successfully.");
        const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const date = new Date()
        const day = date.getDate()
        const month = monthName[date.getMonth()]
        const year = date.getFullYear()
        const status = "initiated"

        const datas = await fetch("http://localhost:4500/addContacts", {
            method: "POST",
            body: JSON.stringify({ name, email, phone, select, message, day, month, year, status }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const result = await datas.json();
        if (result) {
            document.getElementById("Contact_Us6").reset(); // Reset the form after successful submission
        }
    }
};
const clearForm6 = () => {
    document.getElementById("Contact_Us6").reset(); // Resets the form
};
const showAlert6 = (message) => {
    const alertMessage = document.getElementById("alertMessage6");
    alertMessage.textContent = message;
};


// ---------------------------JOIN OUR TEAM SCRIPT---------------------------------
const insertData23 = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    console.log(Object.fromEntries(formData));

    // const name = document.getElementById("name3").value;
    // const email = document.getElementById("email3").value;
    // const phone = document.getElementById("mobile_code3").value;
    const select = document.getElementById("position3").value;
    // const image = document.getElementById("resume3").value;
    // const comment = document.getElementById("comments3").value;

    // const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    // const phoneNumberRegex = /^(\+[1-9]{1}[0-9]{3,14})?([0-9]{9,14})$/;

    // if (name.trim() === "" && email.trim() === "" && phone.trim() === ""
    //     && select.trim() === "Applying for" && image.trim() === "" && comment.trim() === "") {
    //     showAlert23("Kindly complete the form provided.");
    // } else if (name.trim() === "") {
    //     showAlert23("Please enter your name.");
    // }

    if (select.trim() === "Applying for") {
        showAlert23("Please select the position you wish to apply.");
    } else {
        const response = await fetch(
            // "http://localhost:4500/addTeam",
            `https://admin-backend-kd9a.onrender.com/addTeam`,
            {
                method: "POST",
                body: formData,
                headers: {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            }
        );
        alert("Thank you for submitting your information.");
    }
    // catch (error) {
    //     console.error("Error:", error);
    //     alert("Failed to save data");
    // }
};
const form = document.getElementById('CareerOne');
form.addEventListener('submit', insertData23);

const clearForm23 = () => {
    document.getElementById("CareerOne").reset(); // Resets the form
};
const showAlert23 = (message) => {
    const alertMessage = document.getElementById("alertMessage23");
    alertMessage.textContent = message;
};
document.getElementById('resume3').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const allowedExtensions = /(\.pdf)$/i; // Regular expression to allow only .pdf files

    if (!allowedExtensions.exec(file.name)) {
        alert('Please upload a file with a .pdf extension.');
        event.target.value = ''; // Reset file input
        return false;
    }
});

