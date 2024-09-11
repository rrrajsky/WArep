$(document).ready(function () {
    fetchData("getPeopleList", populateUserSelect);
    fetchData("getTypesList", populateTypeSliders);

    $("#listButton").click(function (e) {
        e.preventDefault();
        const monthValue = $("#months").val();
        const endpoint = monthValue == 0 ? "getSummaryOfDrinks" : `getSummaryOfDrinks&month=${monthValue}`;
        fetchData(endpoint, displayDrinkSummary);
    });
});

function fetchData(command, callback) {
    $.ajax({
        url: `http://ajax1.lmsoft.cz/procedure.php?cmd=${command}`,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", `Basic ${btoa("coffe:kafe")}`);
        },
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        success: callback,
        error: function () {
            alert("Nepodařilo se načíst data.");
        }
    });
}

function populateUserSelect(data) {
    const userSelect = $("#users");
    data.people.forEach(function(user) {
        $("<option>").val(user.ID).text(user.name).appendTo(userSelect);
    });
}


function populateTypeSliders(data) {
    console.log(data);
    const types = Array.isArray(data) ? data : data.types;
    if (Array.isArray(types)) {
        const typesContainer = $("#typesSliders");
        types.forEach(function(item, index) {
            const sliderId = `slider${index}`;
            const sliderHTML = `
                <div class='sliderDiv'>
                    <label for="${sliderId}">${item.typ}</label>
                    <div class='sliderDiv'>
                        <input type='number' min='0' max='99999' value='0' class='slider' id='${sliderId}'>
                        <span id='slidertext${index}'>0</span>
                    </div>
                </div><br>
            `;
            typesContainer.append(sliderHTML);

            $(`#${sliderId}`).on("input", function () {
                $(`#slidertext${index}`).text(this.value);
            });
        });
    } else {
        alert("Neplatný formát dat pro typy.");
    }
}

function displayDrinkSummary(data) {
    console.log(data);
    $("#table").remove();  // Odstraní předchozí tabulku, pokud existuje

    const table = $("<table id='table'>").append("<tr><th>Název</th><th>Jméno</th><th>Počet</th></tr>");
    $("body").append(table);

    if (Array.isArray(data)) {
        data.forEach(row => {
            const rowHTML = `<tr><td>${row[0]}</td><td>${row[2]}</td><td>${row[1]}</td></tr>`;
            table.append(rowHTML);
        });
    } else {
        alert("Neplatný formát dat pro souhrn nápojů.");
    }
}
