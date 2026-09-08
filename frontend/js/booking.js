(function ($) {
    "use strict";

    $(document).on('click', '#checkout-btn', function (e) {
        e.preventDefault();

        var formData = new FormData($('#booking-form')[0]); // Collect form data
        commonAjax('POST', $('#validate-booking-route').val(), validationResponse, validationResponse, formData);
    });

    window.validationResponse = function (response) {
        // Clear previous error messages
        $('#date-error').text('');
        $('#slot-error').text('');

        // Check if there are validation errors in the response
        if (response.status === true) {
            // No errors, submit the form
            $('#booking-form')[0].submit();
        } else if (response.status === 422) {
            // Display errors if present
            if (response.responseJSON.errors.date) {
                $('#date-error').text(response.responseJSON.errors.date[0]); // Display date error
            }
            if (response.responseJSON.errors.consultation_slot_id) {
                $('#slot-error').text(response.responseJSON.errors.consultation_slot_id[0]); // Display slot error
            }
        }
    }

    $(document).on('change', '#inputDateTime', function () {
        var selectedDate = $(this).val();
        var formData = new FormData();
        formData.append('date', selectedDate); // Send the selected date to the server

        // Retrieve the CSRF token from the meta tag
        var csrfToken = $('meta[name="csrf-token"]').attr('content');
        formData.append('_token', csrfToken); // Add CSRF token to the form data

        // Clear existing slot options and error message
        $('#slot-error').text('');
        $('#slot-block').empty();

        commonAjax('POST', $('#get-slot-route').val(), updateSlots, updateSlots, formData);
    });

    window.updateSlots = function (response) {
        // Check if the response contains slots
        if (response.status === 200 && response.responseText) {
            $('#dropdown-text').text('-- Select a Time Slot --')
            $('#slot-block').html(response.responseText);
        }else{
            $('#dropdown-text').text('-- Select a Time Slot --')
            $('#slot-block').html(`<span>No slot found</span>`);
        }
    }

})(jQuery);
