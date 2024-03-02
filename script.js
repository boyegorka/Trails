const mainLink = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api'
const apiKey = "?api_key=38d499da-b44a-4b4e-a3e7-b910ab1d2c93"
const apiRoutes = {
    guides: '/guides',
    routes: '/routes',
    orders: '/orders',
};

// RoutesTable consts
const routesTable = document.getElementById("routes-table");
const routesTableTBody = routesTable.getElementsByTagName('tbody')[0];
const routesTablePaginationElement = document.getElementById('routes-pagination');
const routesTableSearch = document.getElementById('routes-search');
const routesTableSelect = document.getElementById('routes-select');

var currentPageRoutesTable = 1;
const itemsPerPage = 3;

var routes = [];
var filteredRoutes = [];
var mainObjects = [];


// GuidesTable consts
const guidesTable = document.getElementById('guides-table');
const guidesTableTBody = guidesTable.getElementsByTagName('tbody')[0];
const guidesTablePaginationElement = document.getElementById('guides-pagination');
const guidesTableWorkExperienceFrom = document.getElementById('work-experience-from');
const guidesTableWorkExperienceTo = document.getElementById('work-experience-to');
const guidesTableLanguageSelect = document.getElementById('guide-language-select');
const guidesDiv = document.getElementById('guides-div');
const guidesDivTitle = document.getElementById("guides-div-title")

var currentPageGuidesTable = 1;
var guides = [];
var filteredGuides = [];
var languages = [];

// Application registration
const orderForm = document.getElementById("order-form");
const routeNameModalElement = document.getElementById("route-name")
const guideNameModalElement = document.getElementById("guide-name")
const dateModalElement = document.getElementById("tour-date")
const timeModalElement = document.getElementById("tour-time")
const durationModalElement = document.getElementById("tour-duration")
const personsModalElement = document.getElementById("people-count")
const studentDiscountModalElement = document.getElementById("scolar-discount")
const souvenirModalElement = document.getElementById("themed-souvenirs")
const guidePriceModalElement = document.getElementById("tour-price")
var modalGuide
var modalRoute
var applicationId = 0

// Alert
const alertPlaceholder = document.getElementById('alertPlaceholder')
const alertType = {
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    danger: 'danger',
    warning: 'warning',
    info: 'info',
    light: 'light',
    dark: 'dark',
};


// RoutesTable funcs
function loadRoutes() {
    const link = mainLink + apiRoutes.routes + apiKey
    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        let response = xhr.response;
        routes = response
        getObjects()
        filterRoutes()
    };

    xhr.onerror = function() {
        console.log('Ошибка');
    };
}

function filterRoutes() {
    const searchText = routesTableSearch.value
    const selection = routesTableSelect.options[routesTableSelect.selectedIndex].text

    filteredRoutes = [];

    if (searchText !== "" || selection !== "Не выбрано") {
        for (const route of routes) {

            const nameIncludesSearchText = route["name"].toLowerCase().includes(searchText);
            const selectionMatches = selection === "Не выбрано" || route["mainObject"].includes(selection);

            if (selectionMatches && nameIncludesSearchText) {
                filteredRoutes.push(route)
            }

        }
    } else {
        filteredRoutes = routes
    }
    updateRoutesTable()
}

function updateRoutesTable() {
    const startIndex = (currentPageRoutesTable - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedData = filteredRoutes.slice(startIndex, endIndex);

    clearRoutesTable()

    displayedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${item["name"]}</td><td>${item["description"]}</td><td>${item["mainObject"]}</td><td><button id="routes-btn-${item["id"]}" type="button" class="btn btn-outline-primary" onclick="showGuidesDiv('${item["name"]}', ${item["id"]})">Выбрать</button></td>`;
        routesTableTBody.appendChild(row);
    });

    paginationRoutesTable()
}

function clearRoutesTable() {
    routesTableTBody.innerHTML = "";
}

function paginationRoutesTable() {
    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
    
    routesTablePaginationElement.innerHTML = '';

    const prevPage = document.createElement('li');
    prevPage.classList.add('page-item');
    prevPage.innerHTML = `<a class="page-link" onclick="changeRoutesTablePage(${currentPageRoutesTable - 1})" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    routesTablePaginationElement.appendChild(prevPage);

    for (let i = Math.max(1, currentPageRoutesTable - 1); i <= Math.min(totalPages, currentPageRoutesTable + 1); i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        li.innerHTML = `<a class="page-link" onclick="changeRoutesTablePage(${i})">${i}</a>`;
        if (i === currentPageRoutesTable) {
            li.classList.add('active');
        }
        routesTablePaginationElement.appendChild(li);
    }

    const nextPage = document.createElement('li');
    nextPage.classList.add('page-item');
    nextPage.innerHTML = `<a class="page-link" onclick="changeRoutesTablePage(${currentPageRoutesTable + 1})" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    routesTablePaginationElement.appendChild(nextPage);
}

function changeRoutesTablePage(page) {
    currentPageRoutesTable = Math.max(1, Math.min(page, Math.ceil(filteredRoutes.length / itemsPerPage)));
    updateRoutesTable();
    paginationRoutesTable();
}

function getObjects() {
    for (const route of routes) {
        const symbols = /[,-]/;
        var placesArray = route["mainObject"].split(symbols);
        for (const place of placesArray) {
            mainObjects.push(place);
        }
    }
    mainObjects = Array.from(new Set(mainObjects))
    setObjectsToRoutesSelect()
}

function setObjectsToRoutesSelect() {
    for (const element of mainObjects) {
        newOption = document.createElement("option");
        newOption.value = mainObjects.indexOf(element);
        newOption.text = element;
        routesTableSelect.add(newOption);
    }
}

function showGuidesDiv(routeName, routeId) {
    currentPageGuidesTable = 1
    // document.getElementById(`routes-btn-${routeId}`).blur();
    // document.getElementById(`routes-btn-${routeId}`).classList.add('active');
    loadGuidesForRoute(routeId);
    guidesDiv.classList = 'class="container-fluid py-5';
    guidesDivTitle.innerHTML = `Доступные гиды по маршруту: ${routeName}`;
}


// GuidesTable funcs
function loadGuidesForRoute(routeId) {
    const link = mainLink + apiRoutes.routes + `/${routeId}` + apiRoutes.guides + apiKey

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        let response = xhr.response;
        guides = response
        // console.log(guides)
        getLanguages()
        filterGuides()
    };

    xhr.onerror = function() {
        console.log('Ошибка');
    };
}

function filterGuides() {
    const selection = guidesTableLanguageSelect.options[guidesTableLanguageSelect.selectedIndex].text;
    const workExperienceFrom = parseInt(guidesTableWorkExperienceFrom.value) || 0;
    const workExperienceTo = parseInt(guidesTableWorkExperienceTo.value) || 99;

    filteredGuides = [];

    if (selection !== "Не выбрано" || !isNaN(workExperienceFrom) || !isNaN(workExperienceTo)) {
        for (const guide of guides) {
            const validLanguage = selection === "Не выбрано" || guide["language"].includes(selection);
            const validExperience = (isNaN(workExperienceFrom) || parseInt(guide["workExperience"]) >= workExperienceFrom) &&
                                    (isNaN(workExperienceTo) || parseInt(guide["workExperience"]) <= workExperienceTo);

            if (validLanguage && validExperience) {
                filteredGuides.push(guide);
            }
        }
    } else {
        filteredGuides = guides;
    }

    updateGuidesTable();
}

function updateGuidesTable() {
    const startIndex = (currentPageGuidesTable - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedData = filteredGuides.slice(startIndex, endIndex);

    clearGuidesTable()

    displayedData.forEach(item => {
        const row = document.createElement('tr');
        const avatarPath = loadAvatars(item)
        row.innerHTML = `<td class="w-5 h-25 align-middle"><img src="${avatarPath}" class="img-fluid rounded" style="max-width: 50px; height: auto; alt="Photo"></td><td class="align-middle">${item["name"]}</td><td class="align-middle">${item["language"]}</td><td class="align-middle">${item["workExperience"]}</td><td class="align-middle">${item["pricePerHour"]+"₽"}</td><td class="align-middle text-end"><button id="btn" type="button" class="btn btn-outline-primary" onclick=loadRouteInfo(${item["id"]},${item["route_id"]})>Оформить заявку</button></td>`;
        guidesTableTBody.appendChild(row);
    });

    paginationGuidesTable()
}

function loadAvatars(guide) {
    const targetLetters = ['y', 'a'];
    const fullName = guide["name"].split(' ');
    const name = fullName[fullName.length - 2];
    const lastLetter = name.charAt(name.length - 1);
    if (targetLetters.includes(lastLetter)) {
        const i = Math.floor(Math.random() * 5) + 1;
        return('/Resources/Guides/Women/Guide_woman_' + i + '.png');
    } else {
        const i = Math.floor(Math.random() * 5) + 1;
        return('/Resources/Guides/Men/Guide_man_' + i + '.png');
    }
}

function clearGuidesTable() {
    guidesTableTBody.innerHTML = "";
}

function paginationGuidesTable() {
    const totalPages = Math.ceil(filteredGuides.length / itemsPerPage);
    const prevPage = document.createElement('li');
    
    guidesTablePaginationElement.innerHTML = '';
    prevPage.classList.add('page-item');
    prevPage.innerHTML = `<a class="page-link" onclick="changeGuidesTablePage(${currentPageGuidesTable - 1})" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    guidesTablePaginationElement.appendChild(prevPage);

    for (let i = Math.max(1, currentPageGuidesTable - 1); i <= Math.min(totalPages, currentPageGuidesTable + 1); i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        li.innerHTML = `<a class="page-link" onclick="changeGuidesTablePage(${i})">${i}</a>`;
        if (i === currentPageGuidesTable) {
            li.classList.add('active');
        }
        guidesTablePaginationElement.appendChild(li);
    }

    const nextPage = document.createElement('li');
    nextPage.classList.add('page-item');
    nextPage.innerHTML = `<a class="page-link" onclick="changeGuidesTablePage(${currentPageGuidesTable + 1})" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    guidesTablePaginationElement.appendChild(nextPage);
}

function changeGuidesTablePage(page) {
    currentPageGuidesTable = Math.max(1, Math.min(page, Math.ceil(filteredGuides.length / itemsPerPage)));
    updateGuidesTable();
    paginationGuidesTable();
}

function getLanguages() {
    for (const guide of guides) {
        var languagesArray = guide["language"].split(", ");
        for (const language of languagesArray) {
            languages.push(language);
        }
    }
    languages = Array.from(new Set(languages))
    setLanguagesToGuidesSelect()
}

function setLanguagesToGuidesSelect() {
    for (const language of languages) {
        newOption = document.createElement("option");
        newOption.value = languages.indexOf(language);
        newOption.text = language;
        guidesTableLanguageSelect.add(newOption);
    }
}

// Modal funcs
function loadRoute(routeId) {
    const link = mainLink + apiRoutes.routes + `/${routeId}` + apiKey

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        modalRoute = xhr.response;
        console.log(modalRoute["name"])
        setModalRoute()
    };

    xhr.onerror = function() {
        console.log('Ошибка');
    };
}

function loadGuide(guideId) {
    const link = mainLink + apiRoutes.guides + `/${guideId}` + apiKey

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        modalGuide = xhr.response;
        console.log(modalGuide)
        setModalGuide()
    };

    xhr.onerror = function() {
        console.log('Ошибка');
    };
}

function setModalRoute() {
    routeNameModalElement.value = modalRoute["name"]
}

function setModalGuide() {
    guideNameModalElement.value = modalGuide["name"]
    setPrice()
}

function loadRouteInfo(guideId, routeId) {
    loadRoute(routeId)
    loadGuide(guideId)
    showRegistration()
}

function showRegistration() {
    const myModal = new bootstrap.Modal(document.getElementById('myModal'))
    myModal.show()
}

function setPrice() {
    var price = modalGuide["pricePerHour"]
    var peopleCount = personsModalElement.value
    var duration = durationModalElement.value
    var studentDiscount = studentDiscountModalElement.checked
    var themedSouvenirs = souvenirModalElement.checked

    console.log(studentDiscount, themedSouvenirs)

    price = price * peopleCount * duration

    if (themedSouvenirs === true) {
        price = price + (500 * peopleCount)
    }

    if (studentDiscount === true) {
        price = price - (price * 15 / 100)
    }

    guidePriceModalElement.value = price + `₽`
}

function processFormData() {
    var guideId = modalGuide["id"]
    var routeId = modalRoute["id"]
    var date = dateModalElement.value
    var time = timeModalElement.value
    var peopleCount = personsModalElement.value
    var duration = durationModalElement.value
    var studentDiscount = studentDiscountModalElement.checked
    var themedSouvenirs = souvenirModalElement.checked
    var price = guidePriceModalElement.value.slice(0, -1);

    if (studentDiscount === true) {
        studentDiscount = 1
    } else {
        studentDiscount = 0
    }

    if (themedSouvenirs === true) {
        themedSouvenirs = 1
    } else {
        themedSouvenirs = 0
    }

    date = date
    time = time + ':00'
    price = parseInt(price)
    peopleCount = parseInt(peopleCount)
    duration = parseInt(duration)

    applicationId += 1
    
    var params = {
        guide_id: guideId,
        route_id: routeId,
        date: date,
        time: time,
        duration: duration,
        persons: peopleCount,
        price: price,
        optionFirst: studentDiscount,
        optionSecond: themedSouvenirs,
        student_id: 21,
        id: applicationId,
    };
    
    postGuide(params)
}

function postGuide(data) {
    const link = mainLink + apiRoutes.orders + apiKey;

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('POST', link);

    const formData = new FormData();
    for (const key in data) {
        console.log(key, data[key])
        formData.append(key, data[key]);
    }
    xhr.send(formData);


    xhr.onload = function () {
        const responseData = xhr.response;
        console.log(responseData)
    };

    xhr.onerror = function() {
        console.error('Ошибка');
    };
}


function showAlert(message, type) {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
            `${message}`,
            `<button id="alert-close-button" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`,
        `</div>`
    ].join('')

    alertPlaceholder.append(wrapper)

    const closeButton = document.getElementById("alert-close-button")
    
    setTimeout(() => {
        if (closeButton) {
            closeButton.click()
        }
    }   , 5000);
}

window.onload = function() {
    routesTableSelect.onchange = filterRoutes;
    routesTableSearch.addEventListener(
        "input",
        filterRoutes
    );

    guidesTableLanguageSelect.onchange = filterGuides;
    guidesTableWorkExperienceFrom.addEventListener(
        "input",
        filterGuides
    );
    guidesTableWorkExperienceTo.addEventListener(
        "input",
        filterGuides
    );

    orderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        processFormData();
    });

    durationModalElement.addEventListener('change', setPrice)
    personsModalElement.addEventListener('change', setPrice)
    studentDiscountModalElement.addEventListener('change', setPrice)
    souvenirModalElement.addEventListener('change', setPrice)

    loadRoutes();
};