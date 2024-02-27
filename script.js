const routesLink = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=38d499da-b44a-4b4e-a3e7-b910ab1d2c93"
// const guideLink = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/23?api_key=38d499da-b44a-4b4e-a3e7-b910ab1d2c93"


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


// RoutesTable funcs
function loadRoutes() {
    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', routesLink);
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
    document.getElementById(`routes-btn-${routeId}`).blur();
    document.getElementById(`routes-btn-${routeId}`).classList.add('active');
    loadGuidesForRoute(routeId);
    guidesDiv.classList = 'class="container-fluid py-5';
    guidesDivTitle.innerHTML = `Доступные гиды по маршруту: ${routeName}`;
}


// GuidesTable funcs
function loadGuidesForRoute(routeId) {
    const guidesLink = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${routeId}/guides?api_key=38d499da-b44a-4b4e-a3e7-b910ab1d2c93`;

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', guidesLink);
    xhr.send();

    xhr.onload = function () {
        let response = xhr.response;
        guides = response
        console.log(guides)
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
        row.innerHTML = `<td class="w-5 h-25 align-middle"><img src="${avatarPath}" class="img-fluid rounded" style="max-width: 50px; height: auto; alt="Photo"></td><td class="align-middle">${item["name"]}</td><td class="align-middle">${item["language"]}</td><td class="align-middle">${item["workExperience"]}</td><td class="align-middle">${item["pricePerHour"]+"₽"}</td><td class="align-middle text-end"><button id="btn" type="button" class="btn btn-outline-primary" onclick="registerApplication()">Оформить заявку</button></td>`;
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

    
    loadRoutes();
    registerApplication()
};