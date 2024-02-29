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
        console.log(orders)
    };

    xhr.onerror = function() {
        console.log('Ошибка');
    };
}

function updateOrdersTable() {
    const startIndex = (currentPageOrdersTable - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedData = orders.slice(startIndex, endIndex);

    clearOrdersTable()

    displayedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${item["name"]}</td><td>${item["description"]}</td><td>${item["mainObject"]}</td><td><button id="orders-btn-${item["id"]}" type="button" class="btn btn-outline-primary" onclick="showGuidesDiv('${item["name"]}', ${item["id"]})">Выбрать</button></td>`;
        ordersTableTBody.appendChild(row);
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


window.onload = function() {
    loadOrders();
};