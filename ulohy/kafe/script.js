$(document).ready(function () {
    $.ajax({
        url: "http://ajax1.lmsoft.cz/procedure.php?cmd=getPeopleList",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("coffee:kafe"));
        },
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        success: generateButtons,
        error: function () {
            alert("Cannot get data");
        }
    });

    $.ajax({
        url: "http://ajax1.lmsoft.cz/procedure.php?cmd=getTypesList",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("coffee:kafe"));
        },
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        success: generateSliders,
        error: function () {
            alert("Cannot get data");
        }
    });

    $("#listButton").on("click", showList);
});

function generateButtons(data) {
    $.each(data, function (key, value) {
        $("#users").append("<option value='" + value["ID"] + "'>" + value["name"] + "</option><br>");
    });
}

function generateSliders(data) {
    $.each(data, function (key, value) {
        $("#typesSliders").append("<div class='sliderDiv'><label for='" + "slider" + key + "'>" + value["typ"] + "</label><div class='sliderDiv sliderDivRight'><button class='changeButton' id='" + "slider" + key + "btn" + "'>+</button><button class='changeButton' id='" + "slider" + key + "btnmin" + "'>-</button><input type='number' min='0' max='99999' value='0' class='slider' id='" + "slider" + key + "'></div></div><br>");

        $("#slider" + key + "btn").on("click", function (event) {
            event.preventDefault()
            let input = $("#slider" + key)
            input.val(parseInt(input.val()) + 1)
        });

        $("#slider" + key + "btnmin").on("click", function (event) {
            event.preventDefault()
            let input = $("#slider" + key)
            input.val(parseInt(input.val()) - 1)
        });

        let slider = document.getElementById("slider" + key);
        slider.addEventListener("input", function () {
            document.getElementById("slidertext" + key).innerText = slider.value;
        });

    });
}
