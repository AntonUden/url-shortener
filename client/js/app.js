$(() => {
	$("#btn_generate").on("click", () => {
		let url = $("#tbx_url").val();

		console.log("Input: " + url);

		if (!isURL(url)) {
			toastr.error("Please enter a valid url");
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/create_link",
			data: url,
			contentType: 'text/plain',
			success: (data) => {
				let shortUrl = window.location.origin + "/s/" + data.id;
				console.log("Short url is: " + shortUrl);
				$("#txb_result").val(shortUrl);
				$("#modal_result").modal("show");
			},
			statusCode: {
				400: function () {
					toastr.error("An error occured. Please try again later");
				},
				429: function () {
					toastr.error("You have created too many urls. Please wait for up to 1 hour and try again later");
				},
				500: function () {
					toastr.error("An error occured. Please try again later");
				}
			}
		});
	});

	$("#btn_copy").on("click", () => {
		toastr.success("URL copied to clipboard");
	})

	new ClipboardJS("#btn_copy");
});

// https://stackoverflow.com/a/49185442
function isURL(str) {
	return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
}

// https://stackoverflow.com/q/400212
function copyToClipboard(text) {
	if (window.clipboardData) { // Internet Explorer
		window.clipboardData.setData("Text", text);
	} else {
		unsafeWindow.netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
		clipboardHelper.copyString(text);
	}
}