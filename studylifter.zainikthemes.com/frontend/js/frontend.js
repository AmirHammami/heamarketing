(function ($) {
    "use strict";

    $(document).ready(function() {

        $('.searchForm').on('submit', function(e) {
            const countrySelected = $(this).find('.country-select').val();
            $(this).find('.country-error').addClass('d-none');

            if (!countrySelected) {
                e.preventDefault();
                $(this).find('.country-error').removeClass('d-none');
            } else {
                $(this).find('.searchButton').prop('disabled', true);
                $(this).find('.searchButton .spinner-border').removeClass('d-none');
            }
        });

        $('.country-select').on('change', function () {
            const countryId = $(this).val();
            const baseUrl = $(this).closest('.searchForm').find('.universityCountryRoute').val();
            const url = `${baseUrl}/${countryId}`;

            $(this).closest('.searchForm').find('.country-error').addClass('d-none');

            if (countryId) {
                commonAjax('GET', url, countryWiseRes, countryWiseRes);
            } else {
                $(this).closest('.searchForm').find('.university-select').html('<option value="">Select University</option>');
            }
        });

        function countryWiseRes(response) {
            if (response.status) {
                let universityOptions = '<option class="d-none" disabled selected value="">Select University</option>';
                response.data.forEach(function (university) {
                    universityOptions += `<option value="${university.id}">${university.name}</option>`;
                });
                $('.university-select').html(universityOptions);

                if ($('.university-select').data('multiselect')) {
                    $('.university-select').multiselect('destroy');
                }

                $('.university-select').multiselect({
                    buttonClass: "form-select sf-select-checkbox-btn",
                    enableFiltering: false,
                    maxHeight: 322,
                    templates: {
                        button: '<button type="button" class="multiselect dropdown-toggle" data-bs-toggle="dropdown"><span class="multiselect-selected-text"></span></button>',
                    },
                });
            } else {
                $('.university-select').html('<option value="">No universities available</option>');
            }
        }

        $('.searchForm').on('submit', function(event) {

            const countrySelected = $(this).find('.country-select').val();

            if (!countrySelected) {
                return;
            }

            var $button = $(this).find('.searchButton');
            var $spinner = $button.find('.spinner-border');
            $spinner.removeClass('d-none');

            setTimeout(() => {
                this.submit();
            }, 1000);
        });

    });
})(jQuery);
