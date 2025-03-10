import { showToast } from "./toastMessage.js";

let data = [];

// Popula o select de domínios
function populateDomainSelect(domains) {
    const domainSelect = document.getElementById("domain");
    domainSelect.innerHTML = '<option value="">Selecione um domínio</option>';

    const editDomains = document.getElementById("editDomain");
    editDomains.innerHTML = '<option value="">Selecione um domínio</option>';

    domains.forEach(domain => {
        const domainOption = document.createElement("option");
        domainOption.value = domain.id; 
        domainOption.textContent = domain.address;

        domainSelect.appendChild(domainOption);

        const editDomainOption = document.createElement("option");
        editDomainOption.value = domain.id; 
        editDomainOption.textContent = domain.address; 

        editDomains.appendChild(editDomainOption);
    });
}

// Buscar dominios para selecionar
async function fetchDomains() {
    try {
        const res = await fetch("/api/domains", {
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!res.ok) throw new Error("Erro ao buscar domínios.");

        const domains = await res.json();
        console.log(domains)
        populateDomainSelect(domains);
    } catch (error) {
        showToast("Erro ao carregar domínios.", "danger");
    }
}

// Fetch inicial
async function fetchData() {
    try {
        const res = await fetch("/api/extensions", {
            headers: {
                "Content-Type": "application/json",
            }
        });

        data = await res.json();
        populateTable();
    } catch (err) {
        showToast("Erro ao carregar dados.", "danger");
    }
}

// Envia uma nova extensão para a API
async function sendResponse() {
    const extensionData = getFormData();

    if (!extensionData) return;

    try {
        const response = await fetch("/api/extensions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(extensionData),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro desconhecido");

        showToast("Extensão adicionada com sucesso!", "success-emphasis");
        await fetchData();
    } catch (error) {
        showToast("Erro ao criar extensão", "danger");
    }
}

function getFormData() {
    const extId = document.getElementById("extension").value.trim();
    const uri = document.getElementById("uri").value.trim();
    const domain = document.getElementById("domain").value.trim();
    const proxySipServer = document.getElementById("proxySIP").value.trim();
    const extPasswd = document.getElementById("passwd").value.trim();

    if (!extId || !uri || !domain || !proxySipServer || !extPasswd) {
        showToast("Preencha todos os campos.");
        return null;
    }
    return { extId, uri, domain, proxySipServer, extPasswd };
}

// Popula a tabela
function populateTable() {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = "";

    data.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <th scope="row" class="text-center">${item.id}</th>
            <td class="text-center">${sanitize(item.extId)}</td>
            <td class="text-center">${sanitize(item.uri)}</td>
            <td class="text-center">${sanitize(item.domain.address)}</td>
            <td class="text-center">${sanitize(item.proxySipServer)}</td>
            <td class="text-center">
                <i class="rounded-1 bi bi-pencil-square mx-3 bg-primary text-light p-1" data-index="${index}" id="edit-${item.id}"></i>
                <i class="rounded-1 bi bi-trash3-fill bg-danger text-light p-1" data-index="${index}" id="delete-${item.id}"></i>
            </td>
        `;
        tableBody.appendChild(row);
    });

    addEventListeners();
}

// Sanitização básica
function sanitize(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// Listeners para edição e exclusão
function addEventListeners() {
    const editIcons = document.querySelectorAll('[id^="edit-"]');
    const deleteIcons = document.querySelectorAll('[id^="delete-"]');

    editIcons.forEach(icon => {
        icon.addEventListener("click", function () {
            const index = this.getAttribute('data-index');
            openEditModal(index);
        });
    });

    deleteIcons.forEach(icon => {
        icon.addEventListener("click", function () {
            const index = this.getAttribute('data-index');
            openDelModal(index);
        });
    });

    document.getElementById("saveEdit").addEventListener("click", saveEditChanges);
    document.getElementById("confirmDelete").addEventListener("click", deleteExtension);
}

function openEditModal(index) {
    const item = data[index];

    document.getElementById("editExtension").value = item.extId;
    document.getElementById("editUri").value = item.uri;
    document.getElementById("editDomain").value = item.domain.address;
    document.getElementById("editProxySIP").value = item.proxySipServer;
    document.getElementById("editPasswd").value = item.extPasswd;

    const saveEditButton = document.getElementById("saveEdit");

    if (saveEditButton) {
        saveEditButton.setAttribute("data-id", item.id);
    }

    const editModal = new bootstrap.Modal(document.getElementById("editModal"));
    editModal.show();
}

// Salvar edição
async function saveEditChanges() {
    const id = document.getElementById("saveEdit").getAttribute("data-id");

    const extId = document.getElementById("editExtension").value.trim();
    const uri = document.getElementById("editUri").value.trim();
    const domain = document.getElementById("editDomain").value.trim();
    const proxySipServer = document.getElementById("editProxySIP").value.trim();
    const extPasswd = document.getElementById("editPasswd").value.trim();

    if (!extId || !uri || !domain || !proxySipServer || !extPasswd) {
        showToast("Preencha todos os campos.", "warning");
        return;
    }

    const updatedExtension = { extId, uri, domain, proxySipServer, extPasswd };

    try {
        const response = await fetch(`/api/extensions/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedExtension),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro ao atualizar extensão.");

        bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
        showToast("Extensão atualizada com sucesso!", "success-emphasis");

        await fetchData();
    } catch (error) {
        showToast("Erro ao atualizar extensão", "danger");
    }
}

// Modal de exclusão
function openDelModal(index) {
    const item = data[index];
    document.getElementById("confirmDelete").setAttribute("data-id", item.id);

    const delModal = new bootstrap.Modal(document.getElementById("deleteModal"));
    delModal.show();
}

// Deletar extensão
async function deleteExtension() {
    const id = document.getElementById("confirmDelete").getAttribute("data-id");

    try {
        const response = await fetch(`/api/extensions/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Erro ao deletar extensão.");

        bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
        showToast("Ramal excluído com sucesso!", "success-emphasis");

        await fetchData();
    } catch (error) {
        showToast("Erro ao excluir ramal", "danger");
    }
}

document.getElementById("addButton").addEventListener("click", sendResponse);

// Inicialização
fetchDomains().then(fetchData); 