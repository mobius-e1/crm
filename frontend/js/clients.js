import { getClientsFromDB, getClientByIdFromDB } from "./api.js";
import { createCreateClientModal } from "./createClientModal.js";
import { createEditClientModal } from "./editClientModal.js";
import { createDeleteClientModal } from "./deleteClientModal.js";
import { createLoader } from "./loader.js";

(() => {
  const tableBodyId = "clients-table-body-id";
  const contactIconsPath = "frontend/img/contacts-sprite.svg";
  let sort = {
    col: "id",
    asc: true,
  };
  let foundClientId = null;

  async function openEditClientModal(clientId) {
    const onEditClient = async (e) => {
      updateTable(tableBodyId);
    };

    const onDeleteClient = async (e) => {
      updateTable(tableBodyId);
    };

    const response = await getClientByIdFromDB(clientId);
    let clientData = null;
    switch (response.status) {
      case "OK":
        clientData = response.client;
        break;
      default:
        clientData = { error: response.errorData };
    }

    const editClientModal = createEditClientModal(clientId, clientData, {
      onEdit: onEditClient,
      onDelete: onDeleteClient,
    });
    editClientModal.show();
  }

  function editClientHandler() {
    return async (e) => {
      const currentRow = e.currentTarget.closest("tr");
      const idCell = currentRow.querySelector(".clients-table__body-id-col");
      const clientId = idCell.innerText.trim();

      await openEditClientModal(clientId);
    };
  }

  function createEditClientButton(clickHandler) {
    const editBtn = document.createElement("button");
    editBtn.setAttribute("type", "button");
    editBtn.classList.add("btn-style-reset", "btn-with-icon", "edit-btn");
    editBtn.addEventListener("click", async (e) => {
      const body = document.querySelector("body");
      body.classList.add("unclickable");

      const loader = createLoader("table-btn__icon");
      editBtn.replaceChild(loader, editBtnIcon);
      editBtn.classList.add("edit-btn_loading");

      await clickHandler(e);

      editBtn.replaceChild(editBtnIcon, loader);
      editBtn.classList.remove("edit-btn_loading");
      body.classList.remove("unclickable");
    });

    const editBtnIcon = document.createElement("span");
    editBtnIcon.classList.add("table-btn__icon", "edit-btn__icon");
    editBtnIcon.setAttribute("aria-hidden", "true");

    editBtn.append(editBtnIcon, "Изменить");

    return editBtn;
  }

  function deleteClientHandler() {
    const onDeleteClient = async (e) => {
      updateTable(tableBodyId);
    };

    return (e) => {
      const currentRow = e.currentTarget.closest("tr");
      const idCell = currentRow.querySelector(".clients-table__body-id-col");
      const clientId = idCell.innerText.trim();

      const deleteClientModal = createDeleteClientModal(clientId, {
        onDelete: onDeleteClient,
      });
      deleteClientModal.show();
    };
  }

  function createDeleteClientButton(clickHandler) {
    const deleteBtn = document.createElement("button");
    deleteBtn.setAttribute("type", "button");
    deleteBtn.classList.add("btn-style-reset", "btn-with-icon", "delete-btn");
    deleteBtn.addEventListener("click", (e) => clickHandler(e));

    const deleteBtnIcon = document.createElement("span");
    deleteBtnIcon.classList.add("table-btn__icon", "delete-btn__icon");
    deleteBtnIcon.setAttribute("aria-hidden", "true");

    deleteBtn.append(deleteBtnIcon, "Удалить");

    return deleteBtn;
  }

  function transformPhoneNumber(numberString) {
    return `+7 (${numberString.substring(0, 3)}) ${numberString.substring(
      3,
      6
    )}-${numberString.substring(6, 8)}-${numberString.substring(8, 10)}`;
  }

  function getTooltipContactValue(contact) {
    let tooltipContactValue;
    switch (contact.type) {
      case "Телефон":
        tooltipContactValue = transformPhoneNumber(contact.value);
        break;
      default:
        tooltipContactValue = contact.value;
    }

    return tooltipContactValue;
  }

  function addTooltip(contactBtn, contact) {
    const tooltipContactType = contact.type;
    const tooltipContactValue = getTooltipContactValue(contact);

    let contactValueClass;
    switch (tooltipContactType) {
      case "Телефон":
        contactValueClass = "tooltip-phone";
        break;
      case "Email":
        contactValueClass = "tooltip-mail";
        break;
      default:
        contactValueClass = "tooltip-social";
    }

    contactBtn.setAttribute("data-bs-toggle", "tooltip");
    contactBtn.setAttribute("data-bs-trigger", "hover focus");
    contactBtn.setAttribute("data-bs-placement", "top");
    contactBtn.setAttribute("data-bs-html", "true");

    const tooltipValueSpan = document.createElement("span");
    tooltipValueSpan.classList.add("tooltip-contact-value", contactValueClass);
    tooltipValueSpan.innerText = tooltipContactValue;

    const title = `${tooltipContactType}: ${tooltipValueSpan.outerHTML}`;
    contactBtn.setAttribute("title", title);
  }

  function createContactIcon(contactType) {
    let href;
    switch (contactType) {
      case "Vk":
        href = `${contactIconsPath}#vk`;
        break;
      case "Facebook":
        href = `${contactIconsPath}#fb`;
        break;
      case "Телефон":
        href = `${contactIconsPath}#phone`;
        break;
      case "Email":
        href = `${contactIconsPath}#mail`;
        break;
      default:
        href = `${contactIconsPath}#another`;
    }

    const contactIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    contactIcon.classList.add("contact__icon");
    contactIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const contactIconUse = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "use"
    );
    contactIconUse.setAttribute("href", href);
    contactIcon.append(contactIconUse);

    return contactIcon;
  }

  function createContactItem(contact) {
    const contactItem = document.createElement("li");
    contactItem.classList.add("contacts-item");

    const contactBtn = document.createElement("span");
    contactBtn.classList.add("contact");
    contactBtn.setAttribute(
      "aria-label",
      `${contact.type}: ${getTooltipContactValue(contact)}`
    );
    addTooltip(contactBtn, contact);
    contactItem.append(contactBtn);

    const contactIcon = createContactIcon(contact.type);
    contactBtn.append(contactIcon);

    return contactItem;
  }

  function createOpenContactsListItem(count) {
    const openerItem = document.createElement("li");
    openerItem.classList.add("contacts-item");

    const openerBtn = document.createElement("span");
    openerBtn.classList.add("contact", "contact-opener");
    openerBtn.setAttribute("role", "button ");
    openerBtn.setAttribute("aria-label", "Раскрыть список контактов");
    openerBtn.setAttribute("tabindex", 0);
    openerBtn.innerHTML = `+${count}`;
    openerItem.append(openerBtn);

    openerBtn.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.code) {
        case "Enter":
        case "Space":
          e.currentTarget.click();
          break;
      }
    });

    return openerItem;
  }

  function createContactsList(contacts) {
    const contactsCell = document.createElement("td");
    contactsCell.classList.add(
      "clients-table__body-cell",
      "clients-table__contacts-col",
      "clients-table__body-contacts-col"
    );

    if (contacts.length > 0) {
      const contactsList = document.createElement("ul");
      contactsList.classList.add("contacts-list");
      contactsCell.append(contactsList);

      const contactItemsList = [];
      for (let contact of contacts) {
        const contactItem = createContactItem(contact);
        contactItemsList.push(contactItem);
      }

      if (contacts.length > 5) {
        const openerItem = createOpenContactsListItem(contacts.length - 4);
        contactItemsList.splice(4, 0, openerItem);

        contactItemsList.forEach((item, index) => {
          if (index > 4) {
            item.classList.add("hidden");
          }
        });

        openerItem.addEventListener("click", (e) => {
          e.currentTarget.classList.add("hidden");
          contactItemsList.forEach((item, index) => {
            if (index > 4) {
              item.classList.remove("hidden");
            }
          });
        });
      }

      contactsList.append(...contactItemsList);
    }

    return contactsCell;
  }

  function createActionsCell() {
    const actionsCell = document.createElement("td");
    actionsCell.classList.add(
      "clients-table__body-cell",
      "clients-table__actions-col",
      "clients-table__body-actions-col"
    );

    const actionsCellContainer = document.createElement("div");
    actionsCellContainer.classList.add("table-body__actions-container");
    actionsCell.append(actionsCellContainer);

    const editBtn = createEditClientButton(editClientHandler());
    const deleteBtn = createDeleteClientButton(deleteClientHandler());
    actionsCellContainer.append(editBtn, deleteBtn);

    return actionsCell;
  }

  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  function formatTime(time) {
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function createDateAndTimeCell(date, cellClasses, dateClasses, timeClasses) {
    const dateCell = document.createElement("td");
    dateCell.classList.add(...cellClasses);

    const dateString = formatDate(date);
    const timeString = formatTime(date);

    const dateCellContainer = document.createElement("div");
    dateCellContainer.classList.add("clients-table__date-container");
    dateCell.append(dateCellContainer);

    const dateSpan = document.createElement("span");
    dateSpan.classList.add(...dateClasses);
    dateSpan.append(dateString);

    const timeSpan = document.createElement("span");
    timeSpan.classList.add(...timeClasses);
    timeSpan.append(timeString);

    dateCellContainer.append(dateSpan, timeSpan);

    return dateCell;
  }

  function createTableRow(client) {
    const tableRow = document.createElement("tr");
    tableRow.classList.add("clients-table__body-row");

    const idCell = document.createElement("td");
    idCell.innerText = client.id;
    idCell.classList.add(
      "clients-table__body-cell",
      "clients-table__id-col",
      "clients-table__body-id-col"
    );

    const fullnameCell = document.createElement("td");
    fullnameCell.innerText = `${client.surname} ${client.name} ${client.lastName}`;
    fullnameCell.classList.add(
      "clients-table__body-cell",
      "clients-table__fullname-col",
      "clients-table__body-fullname-col"
    );

    const creationDateCell = createDateAndTimeCell(
      new Date(client.createdAt),
      [
        "clients-table__body-cell",
        "clients-table__creation-date-col",
        "clients-table__body-creation-date-col",
      ],
      ["creation-date"],
      ["creation-time"]
    );

    const lastEditCell = createDateAndTimeCell(
      new Date(client.updatedAt),
      [
        "clients-table__body-cell",
        "clients-table__last-edit-date-col",
        "clients-table__body-last-edit-date-col",
      ],
      ["last-edit-date"],
      ["last-edit-time"]
    );

    const contactsCell = createContactsList(client.contacts);

    const actionsCell = createActionsCell();

    tableRow.append(
      idCell,
      fullnameCell,
      creationDateCell,
      lastEditCell,
      contactsCell,
      actionsCell
    );

    return tableRow;
  }

  function disposeTooltips(tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    const tooltipsElems = tableBody.querySelectorAll(
      'span[data-bs-toggle="tooltip"]'
    );
    const tooltips = Array.from(tooltipsElems).map((tooltip) =>
      bootstrap.Tooltip.getInstance(tooltip)
    );

    for (let tooltip of tooltips) {
      tooltip.dispose();
    }
  }

  function showTable(tableBodyId, clients) {
    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = "";

    if (clients.length !== 0) {
      for (let client of clients) {
        const tableRow = createTableRow(client);
        tableBody.append(tableRow);
      }
    } else {
      const emptyRow = document.createElement("tr");
      emptyRow.classList.add("clients-table__empty-row");
      tableBody.append(emptyRow);

      const emptyCell = document.createElement("td");
      emptyCell.classList.add("clients-table__body-cell");
      emptyCell.setAttribute("colspan", 6);
      emptyCell.innerText = "Список клиентов пуст";
      emptyRow.append(emptyCell);
    }

    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('span[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  function showError(tableBodyId, error) {
    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = "";

    const errorRow = document.createElement("tr");
    errorRow.classList.add("clients-table__error-row");
    tableBody.append(errorRow);

    const errorCell = document.createElement("td");
    errorCell.setAttribute("colspan", 6);
    errorCell.innerText = error[0].message;
    errorRow.append(errorCell);

    const addClientBtn = document.querySelector(".add-btn");
    addClientBtn.classList.add("hidden");
  }

  function sortClients(clients, col, asc) {
    const sign = asc ? 1 : -1;
    switch (col) {
      case "id":
        return [...clients].sort(
          (a, b) => (Number(a.id) - Number(b.id)) * sign
        );
      case "fullname":
        return [...clients].sort((a, b) => {
          const fullnameA = `${a.surname} ${a.name} ${a.lastName}`;
          const fullnameB = `${b.surname} ${b.name} ${b.lastName}`;

          if (fullnameA < fullnameB) return -1 * sign;
          if (fullnameA > fullnameB) return sign;
          return 0;
        });
      case "creation-date":
        return [...clients].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return (dateA - dateB) * sign;
        });
      case "last-edit-date":
        return [...clients].sort((a, b) => {
          const dateA = new Date(a.updatedAt);
          const dateB = new Date(b.updatedAt);
          return (dateA - dateB) * sign;
        });
    }

    return clients;
  }

  function showLoader() {
    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = "";

    const loaderRow = document.createElement("tr");
    loaderRow.classList.add("clients-table__loader-row");
    tableBody.append(loaderRow);

    const loaderCell = document.createElement("td");
    loaderCell.setAttribute("colspan", 6);
    loaderRow.append(loaderCell);

    const loader = createLoader("table-loader");
    loaderCell.append(loader);

    const addClientBtn = document.querySelector(".add-btn");
    addClientBtn.classList.add("hidden");
  }

  async function updateTable(tableBodyId) {
    showLoader();
    disposeTooltips(tableBodyId);

    const response = await getClientsFromDB();
    switch (response.status) {
      case "OK":
        const clients = response.clients;
        const sortedClients = sortClients(clients, sort.col, sort.asc);

        showTable(tableBodyId, sortedClients);
        highlightTableRow(tableBodyId, foundClientId);

        const addClientBtn = document.querySelector(".add-btn");
        addClientBtn.classList.remove("hidden");

        break;
      case "ERROR":
        const error = response.errorData;
        showError(tableBodyId, error);
    }
  }

  function highlightTableRow(tableBodyId, clientId) {
    const tableBody = document.getElementById(tableBodyId);
    const tableRows = Array.from(
      tableBody.querySelectorAll(".clients-table__body-row")
    );
    tableRows.forEach((row) => {
      row.classList.remove("clients-table__body-row_found");
      row.removeAttribute("aria-selected");
    });

    const foundRow = tableRows.find((row) => {
      const idCell = row.querySelector(".clients-table__body-id-col");
      return idCell.innerHTML === clientId;
    });

    if (foundRow) {
      foundRow.classList.add("clients-table__body-row_found");
      foundRow.setAttribute("aria-selected", true);
    }
  }

  function createSearchListItem(client, search) {
    search = search.toLowerCase();

    const item = document.createElement("li");
    item.setAttribute("role", "option");
    item.setAttribute("data-id", client.id);
    item.classList.add("header__search-list-item", "search-list-item");
    if (client.id === foundClientId) {
      item.setAttribute("aria-selected", true);
    }

    let itemText =
      `${client.surname} ${client.name} ${client?.lastName}`.trim();
    const startIndex = itemText.toLowerCase().indexOf(search);
    if (startIndex !== -1) {
      const endIndex = startIndex + search.length;
      itemText =
        itemText.slice(0, startIndex) +
        `<span class="search-list-item__found">${itemText.slice(
          startIndex,
          endIndex
        )}</span>` +
        itemText.slice(endIndex);
    } else {
      for (let contact of client.contacts) {
        const startIndex = contact.value.toLowerCase().indexOf(search);
        if (startIndex !== -1) {
          const endIndex = startIndex + search.length;
          let foundContactValue =
            contact.value.slice(0, startIndex) +
            `<span class="search-list-item__found">${contact.value.slice(
              startIndex,
              endIndex
            )}</span>` +
            contact.value.slice(endIndex);

          if (contact.type === "Телефон") {
            foundContactValue = "+7" + foundContactValue;
          }

          itemText += ` <span class="search-list-item__contact">${contact.type}: ${foundContactValue}</span>`;
          break;
        }
      }
    }

    item.innerHTML = itemText;

    item.addEventListener("mousedown", (e) => {
      pickSearchListItem(item, tableBodyId);
    });

    return item;
  }

  async function showSearchList(search) {
    const searchResult = document.querySelector(".header__search-result");
    if (search === "") {
      searchResult.classList.add("hidden");
    } else {
      searchResult.classList.remove("hidden");

      const response = await getClientsFromDB(search);
      if (response.status === "OK") {
        const clients = response.clients;
        const searchResultList = searchResult.querySelector(
          ".header__search-list"
        );
        searchResultList.innerHTML = "";
        if (clients.length > 0) {
          searchResultList.append(
            ...clients.map((client) => createSearchListItem(client, search))
          );
        }
      }
    }
  }

  function hideSearchList() {
    const searchResult = document.querySelector(".header__search-result");
    searchResult.classList.add("hidden");

    const searchResultList = searchResult.querySelector(".header__search-list");
    searchResultList.innerHTML = "";
  }

  function pickSearchListItem(searchListItem, tableBodyId) {
    const clientId = searchListItem.getAttribute("data-id");
    foundClientId = clientId;
    highlightTableRow(tableBodyId, clientId);
    hideSearchList();

    const searchInput = document.querySelector(".header__search-input");
    searchInput.blur();

    const highlitedRow = document.querySelector(
      ".clients-table__body-row_found"
    );
    highlitedRow.scrollIntoView(false);
  }

  document.addEventListener("DOMContentLoaded", async (e) => {
    updateTable(tableBodyId);

    const onCreateClient = async (e) => {
      updateTable(tableBodyId);
    };

    const addClientBtn = document.querySelector(".add-btn");
    addClientBtn.addEventListener("click", (e) => {
      const createClientModal = createCreateClientModal({
        onCreate: onCreateClient,
      });
      createClientModal.show();
    });

    const sortBtns = document.querySelectorAll(
      ".clients-table-head__toggle-sort-btn"
    );
    sortBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        sortBtns.forEach((curBtn) => {
          curBtn.classList.remove("active-sort-btn");

          if (curBtn !== btn) {
            curBtn.setAttribute("data-asc", false);
          }
        });

        const isAsc = btn.getAttribute("data-asc") === "true";
        btn.classList.add("active-sort-btn");
        btn.setAttribute("data-asc", !isAsc);

        const col = btn.parentElement.getAttribute("data-col-name");
        const asc = !isAsc;
        sort = {
          col,
          asc,
        };

        updateTable(tableBodyId);
      });
    });

    const searchInput = document.querySelector(".header__search-input");
    let focusTimeoutID = null;
    searchInput.addEventListener("focus", (e) => {
      const backdrop = document.createElement("div");
      backdrop.classList.add("backdrop");

      const body = document.querySelector("body");
      body.append(backdrop);

      clearTimeout(focusTimeoutID);
      focusTimeoutID = setTimeout(async () => {
        const search = e.target.value.trim();

        await showSearchList(search);
      }, 300);
    });

    searchInput.addEventListener("blur", (e) => {
      const backdrop = document.querySelector(".backdrop");
      backdrop.remove();

      hideSearchList();
    });

    let inputTimeoutID = null;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(inputTimeoutID);
      inputTimeoutID = setTimeout(async () => {
        foundClientId = null;
        highlightTableRow(tableBodyId, null);

        const search = e.target.value.trim();
        await showSearchList(search);
      }, 300);
    });

    searchInput.addEventListener("keydown", (e) => {
      const searchListItems = Array.from(
        document.querySelectorAll(".header__search-list-item")
      );
      let index = searchListItems.findIndex((item) =>
        item.getAttribute("aria-selected")
      );
      searchListItems.forEach((item) => item.removeAttribute("aria-selected"));
      switch (e.key) {
        case "ArrowUp":
          if (index === -1 || index == 0) index = searchListItems.length;
          searchListItems[index - 1].setAttribute("aria-selected", true);
          searchListItems[index - 1].scrollIntoView(false);

          e.preventDefault();
          break;
        case "ArrowDown":
          if (index === searchListItems.length - 1) index = -1;
          searchListItems[index + 1].setAttribute("aria-selected", true);
          searchListItems[index + 1].scrollIntoView(false);

          e.preventDefault();
          break;
        case "Enter":
          if (index !== -1) {
            pickSearchListItem(searchListItems[index], tableBodyId);
          }

          break;
      }
    });

    new SimpleBar(document.querySelector(".header__search-result"));

    if (window.location.hash !== "") {
      const clientId = window.location.hash.substring(1);
      openEditClientModal(clientId);
    }
  });
})();
