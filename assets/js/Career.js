function contact_num_valid(evt) {
	var theEvent = evt || window.event;
	if (theEvent.type === 'paste') {
		key = event.clipboardData.getData('text/plain');
	} else {
		var key = theEvent.keyCode || theEvent.which;
		key = String.fromCharCode(key);
	}
	var count = (evt.target.value.match(/\+/g) || []).length;
	if (count < 2 && key == '+') {
		evt.target.value = evt.target.value.replace(/\+/g, "");
		evt.target.value = '+' + evt.target.value;
		theEvent.returnValue = false;
		if (theEvent.preventDefault) theEvent.preventDefault();
		return false;
	}
	var regex = /[+0-9]|\./;
	if (!regex.test(key)) {
		theEvent.returnValue = false;
		if (theEvent.preventDefault) theEvent.preventDefault();
	}
}


jQuery("#Career").submit(function (e) {
	jQuery(this).find('input[type="password"],input[type="text"],input[type="number"],input[type="tel"],input[type="email"],textarea').each(function () { jQuery(this).val($.trim(jQuery(this).val())); })
	function valid_contact() {
		var name = document.querySelector('#Career #name');
		var email = document.querySelector('#Career #email');
		var contact_no = document.querySelector('#Career #contact_no');
		if (name.value == '') {
			document.querySelector('#Career #error_data').innerHTML = '* Please Enter Name.';
			name.style.borderColor = "red";
			name.focus();
			return false;
		}
		else { name.style.borderColor = "" }
		var digit = name.value;
		var alpha = /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])+(\s{0,1}[a-zA-Z-, ])*$/;
		if (!alpha.test(digit)) {
			document.querySelector('#Career #error_data').innerHTML = '* Invalid Name: ' + name.value;
			name.style.borderColor = "red";
			name.value = '';
			name.focus();
			return false;
		}
		else { name.style.borderColor = "" }
		if (email.value == '') {
			document.querySelector('#Career #error_data').innerHTML = '* Please Enter Email ID.';
			email.style.borderColor = "red";
			email.focus();
			return false;
		} else { email.style.borderColor = "" }
		var c_reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		var c_address = email.value;
		if (c_reg.test(c_address) == false) {
			document.querySelector('#Career #error_data').innerHTML = '* Invalid Email ID: ' + email.value;
			email.style.borderColor = "red";
			email.value = '';
			email.focus();
			return false;
		}
		else { email.style.borderColor = "" }
		if (contact_no.value == '') {
			document.querySelector('#Career #error_data').innerHTML = '* Please Enter Contact No.';
			contact_no.style.borderColor = "red";
			contact_no.focus();
			return false;
		} else { contact_no.style.borderColor = "" }


		var resume = document.querySelector('#Career #resume');
		if (resume.value == '') {
			document.querySelector('#Career #error_data').innerHTML = '* Please Upload your Resume.';
			resume.style.borderColor = "red";
			resume.focus();
			return false;
		} else { contact_no.style.borderColor = "" }



		// ------------------PDF validation--------------------------
		// ------------------PDF validation--------------------------


		var b = /([a-zA-Z0-9\s_\\.\-:])+(.doc|.docx|.pdf)$/;
		if (!b.test(resume.value)) {
			document.querySelector('#Career #error_data').innerHTML = '* Please Upload Resume only In doc | docx | pdf Format!';
			resume.style.borderColor = "red";
			resume.focus();
			return false;
		} else { contact_no.style.borderColor = "" }



		var c_mobile = contact_no.value.replace(/\+/g, '');
		var c_pattern = /^(?!(\d)\1+\b|1234567890)\d{10,}$/;
		if (!c_pattern.test(c_mobile)) {
			document.querySelector('#Career #error_data').innerHTML = '* Invalid Contact No.: ' + contact_no.value;
			contact_no.style.borderColor = "red";
			contact_no.value = '';
			contact_no.focus();
			return false;
		} else { contact_no.style.borderColor = "" }
		document.querySelector('#Career #error_data').innerHTML = '';
		return true;
	}
	if (valid_contact() == true) {
		document.querySelector('#Career #form_process').style.visibility = "visible"; jQuery(this).find('[type="submit"]').prop('disabled', true);//.fadeOut('slow');
		var form_url = jQuery("#Career").attr('action'); // the script where you handle the form input.	
		$.ajax({
			type: "POST",
			url: form_url,
			enctype: 'multipart/form-data',
			data: new FormData(this),
			contentType: false,
			cache: false,
			processData: false,
			success: function (data) {
				jQuery("#Career").empty();
				jQuery("#Career").html(data); // show response from the php script.
			},
			error: function (data) {
				jQuery("#Career").empty();
				jQuery("#Career").html("<div class='alert alert-danger'>Sorry! Some Technical issue occured. Please try again after sometime.</div>"); // show response from the php script.
			}
		});

		e.preventDefault();
	}
	else { e.preventDefault(); }
});