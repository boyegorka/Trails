const mainLink = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api'
const apiKey = "?api_key=38d499da-b44a-4b4e-a3e7-b910ab1d2c93"
const apiRoutes = {
    guides: '/guides',
    routes: '/routes',
    orders: '/orders',
};

// OrdersTable consts
const ordersTable = document.getElementById("orders-table");
const ordersTableTBody = ordersTable.getElementsByTagName('tbody')[0];
const ordersTablePaginationElement = document.getElementById('orders-pagination');
const ordersTableSearch = document.getElementById('orders-search');
const ordersTableSelect = document.getElementById('orders-select');

var currentPageOrdersTable = 1;
const itemsPerPage = 5;

var orders = [];

// Modal consts
const deletionOrderModal = document.getElementById("delete-order-modal");
const deletionOrderModalSuccessButton = document.getElementById("deletion-confirmation-button")

// Modal consts
const modalLabelElement = document.getElementById("modal-label");
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
const modalFooterElement = document.getElementById("modal-footer")

var modalOrder
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

// OrdersTable funcs
function loadOrders() {
    const link = mainLink + apiRoutes.orders + apiKey
    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        let response = xhr.response;
        orders = response
        updateOrdersTable()
    };

    xhr.onerror = function() {
        console.log('Ошибка');
    };
}

// async function loadRoute(routeId) {
//     const link = mainLink + apiRoutes.routes + `/${routeId}` + apiKey

//     let xhr = new XMLHttpRequest();
//     xhr.responseType = "json";
//     xhr.open('GET', link);
//     xhr.send();

//     xhr.onload = function () {
//         modalRoute = xhr.response

//         console.log(modalRoute)
//         return modalRoute
//     };

//     xhr.onerror = function() {
//         console.log('Ошибка');
//     };
// }

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

function updateOrdersTable() {
    const startIndex = (currentPageOrdersTable - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedData = orders.slice(startIndex, endIndex);
    var itemCount = 0
    clearOrdersTable()

    displayedData.forEach(item => {
        loadRoute(item["route_id"])
        .then((route) => {
            itemCount += 1
            // console.log(route)
            const row = document.createElement('tr');
            row.innerHTML = `<td class="text-center">${itemCount}</td><td class="text-center">${route["name"]}</td><td class="text-center">${item["date"]}</td><td class="text-center">${item["price"]}₽</td><td class="text-center"><div class="d-flex text-center"><button class="btn btn-link" onclick="orderForView(${item["id"]},${item["route_id"]},${item["guide_id"]})"><i class="fa-solid fa-eye fa-xl"></i></button><button class="btn btn-link" onclick="orderForEdit(${item["id"]},${item["route_id"]},${item["guide_id"]})"><i class="fa-solid fa-pen fa-xl"></i></button><button class="btn btn-link" onclick="showDeletionModal(${item["id"]})"><i class="fa-solid fa-trash fa-xl"></i></button></div></td>`;
            ordersTableTBody.appendChild(row);
        })
    });

    paginationOrdersTable()
}

function clearOrdersTable() {
    ordersTableTBody.innerHTML = "";
}

function paginationOrdersTable() {
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    
    ordersTablePaginationElement.innerHTML = '';

    const prevPage = document.createElement('li');
    prevPage.classList.add('page-item');
    prevPage.innerHTML = `<a class="page-link" onclick="changeOrdersTablePage(${currentPageOrdersTable - 1})" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
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
    nextPage.innerHTML = `<a class="page-link" onclick="changeOrdersTablePage(${currentPageOrdersTable + 1})" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    ordersTablePaginationElement.appendChild(nextPage);
}

// Modal funcs
function loadRouteForModal(routeId) {
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

function loadGuideForModal(guideId) {
    const link = mainLink + apiRoutes.guides + `/${guideId}` + apiKey

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        modalGuide = xhr.response;
        // console.log(modalGuide)
        setModalGuide()
    };

    xhr.onerror = function() {
        console.log('Ошибка');
    };
}

function loadOrderForModal(orderId) {
    const link = mainLink + apiRoutes.orders + `/${orderId}` + apiKey

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('GET', link);
    xhr.send();

    xhr.onload = function () {
        modalOrder = xhr.response;
        console.log(modalOrder)
        setModalOrder()
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
}

function setModalOrder() {
    modalLabelElement.textContent = `Заявка #${modalOrder["id"]}`
    dateModalElement.value = modalOrder["date"]
    timeModalElement.value = modalOrder["time"]
    durationModalElement.value = modalOrder["duration"]
    personsModalElement.value = modalOrder["persons"]
    studentDiscountModalElement.checked = modalOrder["optionFirst"]
    souvenirModalElement.checked = modalOrder["optionSecond"]
    guidePriceModalElement.value = `${modalOrder["price"]}₽`    
}

function orderForView(orderId, routeId, guideId) {
    loadOrder(orderId, routeId, guideId)
    setModalForView()
}

function orderForEdit(orderId, routeId, guideId) {
    loadOrder(orderId, routeId, guideId)
    setModalForEdit(orderId)
}

function loadOrder(orderId, routeId, guideId) {
    loadRouteForModal(routeId)
    loadGuideForModal(guideId)
    loadOrderForModal(orderId)
    showViewModal()
}

function showViewModal() {
    const myModal = new bootstrap.Modal(document.getElementById('edit-order-modal'))
    myModal.show()
}

function setModalForView() {
    dateModalElement.disabled = true
    timeModalElement.disabled = true
    durationModalElement.disabled = true
    personsModalElement.disabled = true
    studentDiscountModalElement.disabled = true
    souvenirModalElement.disabled = true
    modalFooterElement.style.display = 'none'
}

function setModalForEdit(orderId) {
    dateModalElement.disabled = false
    timeModalElement.disabled = false
    durationModalElement.disabled = false
    personsModalElement.disabled = false
    studentDiscountModalElement.disabled = false
    souvenirModalElement.disabled = false
    modalFooterElement.style.display = ''

    orderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        processFormData(orderId);
    });
}

function showDeletionModal(orderId) {
    const myModal = new bootstrap.Modal(document.getElementById('delete-order-modal'))
    myModal.show()
    deletionOrderModalSuccessButton.addEventListener('click', function() {
        deleteOrder(orderId)
        console.log('Кнопка была нажата!');
    });
}

function deleteOrder(orderId) {
    const link = mainLink + apiRoutes.orders + `/${orderId}` + apiKey
    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('DELETE', link);
    xhr.send();

    xhr.onload = function () {
        let response = xhr.response;
        showAlert("Заявка успешно удалена", alertType.success)
        console.log(response)
        loadOrders()
    };

    xhr.onerror = function() {
        console.log('Ошибка');
    };
}

function processFormData(orderId) {
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
    
    var params = {
        date: date,
        time: time,
        duration: duration,
        persons: peopleCount,
        price: price,
        optionFirst: studentDiscount,
        optionSecond: themedSouvenirs
    };
    
    putOrder(orderId, params)
}

function putOrder(orderId, data) {
    const link = mainLink + apiRoutes.orders + `/${orderId}` + apiKey;

    let xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('PUT', link);

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
    durationModalElement.addEventListener('change', setPrice)
    personsModalElement.addEventListener('change', setPrice)
    studentDiscountModalElement.addEventListener('change', setPrice)
    souvenirModalElement.addEventListener('change', setPrice)

    loadOrders();
};