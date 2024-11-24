let data = [];

// Fetch para buscar os dados no arquivo json
async function fetchData() {
  try {
    const res = await fetch("./seeders.json");
    data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    data = [];
    return [];
  }
}

// Função para popular a tabela
async function populateTable() {
  if (!data.length) {
    await fetchData();
  }
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  data.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <th scope="row" class="text-center">${index + 1}</th>
      <td class="text-center">${item.extension}</td>
      <td class="text-center">${item.uri}</td>
      <td class="text-center">${item.domain}</td>
      <td class="text-center">${item.proxySIP}</td>
      <td class="text-center">
        <i class="rounded-1 bi bi-pencil-square mx-3 bg-primary text-light p-1" onclick="openEditModal(${index})"></i>
        <i class="rounded-1 bi bi-trash3-fill bg-danger text-light p-1" onclick="openDelModal(${index})"></i>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Pedir confirmação antes do elemento ser excluído

function openDelModal(index) {
  const delModal = new bootstrap.Modal(document.getElementById("deleteModal"));
  delModal.show();

  const confirmDeleteButton = document.getElementById("confirmDelete");
  confirmDeleteButton.onclick = () => {
    deleteRow(index);
    delModal.hide();
  };
}

// Remove uma linha da tabela com base no ID do elemento
function deleteRow(index) {
  data.splice(index, 1);
  populateTable();
}

// Função para abrir o modal de edição de um item, pelo índice
function openEditModal(index) {
  const entry = data[index];
  document.getElementById("editExtension").value = entry.extension;
  document.getElementById("editDomain").value = entry.domain;
  document.getElementById("editURI").value = entry.uri;
  document.getElementById("editProxy").value = entry.proxySIP;

  document.getElementById("saveEdit").onclick = () => saveEdit(index);
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();
}

// Função para salvar as alterações feitas no modal de edição
function saveEdit(index) {
  const updatedExtension = document.getElementById("editExtension").value;
  const updatedDomain = document.getElementById("editDomain").value;
  const updatedURI = document.getElementById("editURI").value;
  const updatedProxy = document.getElementById("editProxy").value;

  if (updatedExtension && updatedURI && updatedDomain && updatedProxy) {
    data[index] = {
      extension: updatedExtension,
      uri: updatedURI,
      domain: updatedDomain,
      proxySIP: updatedProxy,
    };

    populateTable();
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
  }
}

populateTable();