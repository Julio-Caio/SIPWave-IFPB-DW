import { showToast } from "./toastMessage.js";

let data = [];

// Fetch inicial
async function fetchData() {
    try {
        const res = await fetch("/api/domains", {
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!res.ok) throw new Error("Erro ao buscar dados.");

        data = await res.json();
        populateTable();
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        showToast("Erro ao carregar dados.");
    }
}

// Envia um novo domínio para a API
async function sendResponse() {
    const domainData = getFormData();

    if (!domainData) return;

    try {
        const response = await fetch("/api/domains", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(domainData),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro desconhecido");

        showToast("Domínio adicionado com sucesso!", "success-emphasis");
        await fetchData();
    } catch (error) {
        showToast("Erro ao criar domínio", "danger");
    }
}

function getFormData() {
    const address = document.getElementById("address").value.trim();
    const tag = document.getElementById("tag").value.trim();
    const status = document.getElementById("status").value.trim();
    const sipServer = document.getElementById("sipServer").value.trim();

    if (!address || !tag || !status || !sipServer) {
        showToast("Preencha todos os campos.");
        return null;
    }

    return { address, tag, status, sipServer };
}

// Popula a tabela com os dados da API
function populateTable() {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; 

    data.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <th scope="row" class="text-center">${item.id}</th>
            <td class="text-center">${sanitize(item.address)}</td>
            <td class="text-center">${sanitize(item.tag)}</td>
            <td class="text-center">${sanitize(item.sipServer)}</td>
            <td class="text-center">${sanitize(item.status)}</td>
            <td class="text-center">
                <i class="rounded-1 bi bi-pencil-square mx-3 bg-primary text-light p-1" data-index="${index}" id="edit-${item.id}"></i>
                <i class="rounded-1 bi bi-trash3-fill bg-danger text-light p-1" data-index="${index}" id="delete-${item.id}"></i>
            </td>
        `;
        tableBody.appendChild(row);
    });

    addEventListeners();
}

// Sanitiza entradas para evitar XSS
function sanitize(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// Adiciona os event listeners aos ícones
function addEventListeners() {
    const editIcons = document.querySelectorAll('[id^="edit-"]');
    const deleteIcons = document.querySelectorAll('[id^="delete-"]');

    // Mapeia o evento de edição
    editIcons.forEach(icon => {
        icon.addEventListener("click", function() {
            const index = this.getAttribute('data-index');
            openEditModal(index);
        });
    });

    // Mapeia o evento de exclusão
    deleteIcons.forEach(icon => {
        icon.addEventListener("click", function() {
            const index = this.getAttribute('data-index');
            openDelModal(index);
        });
    });

    document.getElementById("saveEditButton").addEventListener("click", saveEditChanges);
    document.getElementById("confirmDelete").addEventListener("click", deleteDomain);
}

// Função para abrir o modal de edição
function openEditModal(index) {
    const item = data[index];

    document.getElementById("editAddress").value = item.address;
    document.getElementById("editTag").value = item.tag;
    document.getElementById("editSipServer").value = item.sipServer;
    document.getElementById("editStatus").value = item.status;

    // capturar id do dominio
    document.getElementById("saveEditButton").setAttribute("data-id", item.id);

    const editModal = new bootstrap.Modal(document.getElementById("editModal"));
    editModal.show();
}

async function saveEditChanges() {
    const id = document.getElementById("saveEditButton").getAttribute("data-id");
    const address = document.getElementById("editAddress").value.trim();
    const tag = document.getElementById("editTag").value.trim();
    const status = document.getElementById("editStatus").value.trim();
    const sipServer = document.getElementById("editSipServer").value.trim();

    if (!address || !tag || !status || !sipServer) {
        showToast("Preencha todos os campos.", "warning");
        return;
    }

    const updatedDomain = { address, tag, status, sipServer };

    try {
        const response = await fetch(`/api/domains/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedDomain),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro ao atualizar domínio.");
        const modalElement = document.getElementById("editModal");
        const editModal = bootstrap.Modal.getInstance(modalElement);
        editModal.hide();

        showToast("Domínio atualizado com sucesso!", "success-emphasis");
        
        await fetchData();
    } catch (error) {
        showToast("Erro ao atualizar elemento", "danger");
    }
}

// Confirmação antes de excluir um item
function openDelModal(index) {
    const item = data[index];
    document.getElementById("confirmDelete").setAttribute("data-id", item.id);
    const delModal = new bootstrap.Modal(document.getElementById("deleteModal"));
    delModal.show();
}

// Exclui um domínio da API
async function deleteDomain(index) {
    const id = document.getElementById("confirmDelete").getAttribute("data-id");

    try {
        const response = await fetch(`/api/domains/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Erro ao deletar domínio.");

        const modalElement = document.getElementById("deleteModal");
        const delModal = bootstrap.Modal.getInstance(modalElement);
        delModal.hide();

        showToast("Domínio deletado com sucesso!", "success-emphasis");

        await fetchData();
    } catch (error) {
        showToast("Erro ao excluir", "danger");
    }
}

document.getElementById("addButton").addEventListener("click", sendResponse);

fetchData();