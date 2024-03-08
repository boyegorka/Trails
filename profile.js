const mainLink = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api';
const apiKey = "?api_key=38d499da-b44a-4b4e-a3e7-b910ab1d2c93";
const apiRoutes = {
    guides: '/guides',
    routes: '/routes',
    orders: '/orders',
};

// OrdersTable consts
const ordersTable = document.getElementById("orders-table");
const ordersTableTBody = ordersTable.getElementsByTagName('tbody')[0];
const ordersTablePaginationElement = document.getElementById('orders-pagination');

var currentPageOrdersTable = 1;
const itemsPerPage = 5;

var orders = [];

// Modal consts
const deletionOrderModalSuccessButton = document.getElementById("deletion-confirmation-button");

// Modal consts
const modalLabelElement = document.getElementById("modal-label");
const orderForm = document.getElementById("order-form");
const routeNameModalElement = document.getElementById("route-name");
const guideNameModalElement = document.getElementById("guide-name");
const dateModalElement = document.getElementById("tour-date");
const timeModalElement = document.getElementById("tour-time");
const durationModalElement = document.getElementById("tour-duration");
const personsModalElement = document.getElementById("people-count");
const studentDiscountModalElement = document.getElementById("scolar-discount");
const souvenirModalElement = document.getElementById("themed-souvenirs");
const guidePriceModalElement = document.getElementById("tour-price");
const modalFooterElement = document.getElementById("modal-footer");

var modalOrder;
var modalGuide;
var modalRoute;
// var applicationId = 0;


// Alert
const alertPlaceholder = document.getElementById('alertPlaceholder');
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

function showAlert(message, type) {
    alertPlaceholder.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible fade show" role="alert" id="alert">`,
        `${message}`,
        `<button id="alert-close-button" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
        </button>`,
        `</div>`
    ].join('');

    alertPlaceholder.append(wrapper);

    const alertElement = document.getElementById('alert');
    
    setTimeout(() => {
        alertElement.classList.remove('show');
        alertElement.classList.add('fade');
    }, 5000);
}

function updateOrdersTable() {
    const startIndex = (currentPageOrdersTable - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedData = orders.slice(startIndex, endIndex);
    var itemCount = startIndex + 1;
    clearOrdersTable();

    displayedData.forEach(item => {
        loadRoute(item["route_id"])
            .then((route) => {
                console.log(`${item["id"]},${item["route_id"]},${item["guide_id"]}`);
                const row = document.createElement('tr');
                row.innerHTML = `
                <td class="text-center">${itemCount}</td>
                <td class="text-center">${route["name"]}</td>
                <td class="text-center">${item["date"]}</td>
                <td class="text-center">${item["price"]}₽</td>
                <td class="text-center"> <div class="d-flex text-center">
                <button class="btn btn-link" 
                onclick="orderForView(${item["id"]},${item["route_id"]},${item["guide_id"]})">
                <i class="fa-solid fa-eye fa-xl"></i></button>
                <button class="btn btn-link" 
                onclick="orderForEdit(${item["id"]},${item["route_id"]},${item["guide_id"]})">
                <i class="fa-solid fa-pen fa-xl"></i></button>
                <button class="btn btn-link" onclick="showDeletionModal(${item["id"]})">
                <i class="fa-solid fa-trash fa-xl"></i></button>
                </div></td>`;
                ordersTableTBody.appendChild(row);
                itemCount ++;
            });
    });

    paginationOrdersTable();
}

// OrdersTable funcs
function loadOrders() {
    const link = mainLink + apiRoutes.orders + apiKey;
    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        if (xhr.status === 200) {
            let response = xhr.response;
            orders = response;
            updateOrdersTable();
        } else {
            showAlert("Заказы не получены", alertType.danger);
        }
    };

    xhr.onerror = function() {
        showAlert("Заказы не получены", alertType.danger);
        console.log(`${xhr.status}`);
    };
}

function loadRoute(routeId) {
    return new Promise((resolve, reject) => {
        const link = mainLink + apiRoutes.routes + `/${routeId}` + apiKey;

        const xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('GET', link);
        xhr.onload = function () {
            if (xhr.status === 200) {
                const modalRoute = xhr.response;
                resolve(modalRoute);
            } else {
                reject(new Error(`Failed to load route. Status: ${xhr.status}`));
            }
        };

        xhr.onerror = function () {
            reject(new Error('Network error occurred'));
        };

        xhr.send();
    });
}

function paginationOrdersTable() {
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    
    ordersTablePaginationElement.innerHTML = '';

    const prevPage = document.createElement('li');
    prevPage.classList.add('page-item');
    prevPage.innerHTML = `<a
    class="page-link" onclick="changeOrdersTablePage(${currentPageOrdersTable - 1})" aria-label="Previous">
    <span aria-hidden="true">&laquo;</span></a>`;
    ordersTablePaginationElement.appendChild(prevPage);

    for (let i = Math.max(1, currentPageOrdersTable - 1); i <= Math.min(totalPages, currentPageOrdersTable + 1); i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        li.innerHTML = `<a class="page-link" onclick="changeOrdersTablePage(${i})">${i}</a>`;
        if (i === currentPageOrdersTable) {
            li.classList.add('active');
        }
        ordersTablePaginationElement.appendChild(li);
    }

    const nextPage = document.createElement('li');
    nextPage.classList.add('page-item');
    nextPage.innerHTML = `<a 
    class="page-link" onclick="changeOrdersTablePage(${currentPageOrdersTable + 1})"aria-label="Next">
    <span aria-hidden="true">&raquo;</span></a>`;
    ordersTablePaginationElement.appendChild(nextPage);
}

function clearOrdersTable() {
    ordersTableTBody.innerHTML = "";
}

function changeOrdersTablePage(page) {
    currentPageOrdersTable = Math.max(1, Math.min(page, Math.ceil(orders.length / itemsPerPage)));
    updateOrdersTable();
    paginationOrdersTable();
}

// Modal funcs
function loadRouteForModal(routeId) {
    const link = mainLink + apiRoutes.routes + `/${routeId}` + apiKey;

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        if (xhr.status === 200) {
            modalRoute = xhr.response;
            console.log(modalRoute["name"]);
            setModalRoute();
        } else {
            showAlert("Маршрут не получен", alertType.danger);
        }
    };

    xhr.onerror = function() {
        showAlert("Маршрут не получен", alertType.danger);
        console.log(`${xhr.status}`);
    };
}

function loadGuideForModal(guideId) {
    const link = mainLink + apiRoutes.guides + `/${guideId}` + apiKey;

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        if (xhr.status === 200) {
            modalGuide = xhr.response;
            setModalGuide();
        } else {
            showAlert("Гид не получен", alertType.danger);
        }
    };
    xhr.onerror = function() {
        showAlert("Гид не получен", alertType.danger);
        console.log('Ошибка');
    };
}

function loadOrderForModal(orderId) {
    const link = mainLink + apiRoutes.orders + `/${orderId}` + apiKey;

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        if (xhr.status === 200) {
            modalOrder = xhr.response;
            console.log(modalOrder);
            setModalOrder();
        } else {
            showAlert("Заказ не получен", alertType.danger);
        }
    };

    xhr.onerror = function() {
        showAlert("Заказ не получен", alertType.danger);
        console.log('Ошибка');
    };
}

function setModalRoute() {
    routeNameModalElement.value = modalRoute["name"];
}

function setModalGuide() {
    guideNameModalElement.value = modalGuide["name"];
}

function setModalOrder() {
    modalLabelElement.textContent = `Заявка #${modalOrder["id"]}`;
    dateModalElement.value = modalOrder["date"];
    timeModalElement.value = modalOrder["time"];
    durationModalElement.value = modalOrder["duration"];
    personsModalElement.value = modalOrder["persons"];
    studentDiscountModalElement.checked = modalOrder["optionFirst"];
    souvenirModalElement.checked = modalOrder["optionSecond"];
    guidePriceModalElement.value = `${modalOrder["price"]}₽`;  
}

function orderForView(orderId, routeId, guideId) {
    loadOrder(orderId, routeId, guideId);
    setModalForView();
}

function orderForEdit(orderId, routeId, guideId) {
    loadOrder(orderId, routeId, guideId);
    setModalForEdit(orderId);
}

function loadOrder(orderId, routeId, guideId) {
    loadRouteForModal(routeId);
    loadGuideForModal(guideId);
    loadOrderForModal(orderId);
    showViewModal();
}

function showViewModal() {
    const myModal = new bootstrap.Modal(document.getElementById('edit-order-modal'));
    myModal.show();
}

function setModalForView() {
    dateModalElement.disabled = true;
    timeModalElement.disabled = true;
    durationModalElement.disabled = true;
    personsModalElement.disabled = true;
    studentDiscountModalElement.disabled = true;
    souvenirModalElement.disabled = true;
    modalFooterElement.style.display = 'none';
}

function setModalForEdit(orderId) {
    dateModalElement.disabled = false;
    timeModalElement.disabled = false;
    durationModalElement.disabled = false;
    personsModalElement.disabled = false;
    studentDiscountModalElement.disabled = false;
    souvenirModalElement.disabled = false;
    modalFooterElement.style.display = '';

    orderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        processFormData(orderId);
    });
}


function deleteOrder(orderId) {
    const link = mainLink + apiRoutes.orders + `/${orderId}` + apiKey;
    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('DELETE', link);
    xhr.send();

    xhr.onload = function () {
        console.log(xhr.status)
        if (xhr.status === 200) {
            let response = xhr.response;
            console.log(`Удалено ` + orderId);
            loadOrders();
            showAlert("Заявка успешно удалена", alertType.success);
        } else {
            showAlert("Заявка не удалена", alertType.danger);
        }
    };
    xhr.onerror = function() {
        showAlert("Заявка не удалена", alertType.danger);
        console.log('Ошибка');
    };
}

function showDeletionModal(orderId) {
    const myModal = new bootstrap.Modal(document.getElementById('delete-order-modal'));
    myModal.show();
    deletionOrderModalSuccessButton.addEventListener('click', function() {
        deleteOrder(orderId);
        console.log('Кнопка была нажата!');
    });
}

function processFormData(orderId) {
    var date = dateModalElement.value;
    var time = timeModalElement.value;
    var peopleCount = personsModalElement.value;
    var duration = durationModalElement.value;
    var studentDiscount = studentDiscountModalElement.checked;
    var themedSouvenirs = souvenirModalElement.checked;
    var price = guidePriceModalElement.value.slice(0, -1);

    if (studentDiscount === true) {
        studentDiscount = 1;
    } else {
        studentDiscount = 0;
    }

    if (themedSouvenirs === true) {
        themedSouvenirs = 1;
    } else {
        themedSouvenirs = 0;
    }

    time = time + ':00';
    price = parseInt(price);
    peopleCount = parseInt(peopleCount);
    duration = parseInt(duration);
    
    var params = {
        date: date,
        time: time,
        duration: duration,
        persons: peopleCount,
        price: price,
        optionFirst: studentDiscount,
        optionSecond: themedSouvenirs
    };
    
    putOrder(orderId, params);
}

function putOrder(orderId, data) {
    const link = mainLink + apiRoutes.orders + `/${orderId}` + apiKey;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.open('PUT', link);

        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error('Ошибка при выполнении запроса'));
            }
        };

        xhr.onerror = function() {
            reject(new Error('Ошибка'));
        };

        xhr.send(formData);
    })
        .then(resp => {
            console.log(resp);
            loadOrders();
            showAlert("Заявка успешно отредактирована", alertType.success);
            return resp;
        })
        .catch(error => {
            console.error('Ошибка', error);
            showAlert("Заявка не отредактирована", alertType.danger);
            throw error;
        });
}

function setPrice() {
    const holidays = ["1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "1-8", "2-23", "3-8", "5-1", "5-9", "6-12", "11-4"];
    var price = modalGuide["pricePerHour"];
    var peopleCount = personsModalElement.value;
    var duration = durationModalElement.value;
    var studentDiscount = studentDiscountModalElement.checked;
    var themedSouvenirs = souvenirModalElement.checked;
    var date = new Date(dateModalElement.value);
    var time = timeModalElement.value;
    var [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    price = price * duration;

    if (peopleCount < 5) {
        price = price + 0;
    } else if (peopleCount > 5 && peopleCount < 10) {
        price = price + 1000;
    } else if (peopleCount > 10 && peopleCount < 21) {
        price = price + 1500;
    }

    const morningHours = [9, 10, 11, 12];
    const eveningHours = [20, 21, 22, 23];

    if (morningHours.includes(hours)) {
        price = price + 400;
    } else if (eveningHours.includes(hours)) {
        price = price + 1000;
    }

    let todayNum = date.getDay();
    let today = (date.getMonth() + 1) + '-' + date.getDate();
    if (todayNum === 6 || todayNum === 0) {
        price = price * 1.5;
    } else if (holidays.includes(today)) {
        price = price * 1.5;
    }

    if (themedSouvenirs === true) {
        price = price + (500 * peopleCount);
    }

    if (studentDiscount === true) {
        price = price - (price * 15 / 100);
    }

    guidePriceModalElement.value = price + `₽`;
}

window.onload = function() {
    durationModalElement.addEventListener('change', setPrice);
    personsModalElement.addEventListener('change', setPrice);
    studentDiscountModalElement.addEventListener('change', setPrice);
    souvenirModalElement.addEventListener('change', setPrice);

    loadOrders();
};