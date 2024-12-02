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
      <th scope="row" class="text-center"></th>
      <td class="text-center">${item.name}</td>
      <td class="text-center">${item.endsip}</td>
      <td class="text-center">${item.number}</td>
      <td class="text-center"><i class="bi bi-telephone"></td>
      <td class="text-center">
        <i class="rounded-1 bi bi-pencil-square mx-3 bg-primary text-light p-1" onclick="openEditModal(${index})"></i>
        <i class="rounded-1 bi bi-trash3-fill bg-danger text-light p-1" onclick="openDelModal(${index})"></i>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Função para adicionar novo elemento na tabela

function insertNew() {
  const addButton = document.getElementById("addButton");

  addButton.addEventListener("click", () => {
    const name = document.getElementById("name").value;
    const endsip = document.getElementById("endsip").value;
    const number = document.getElementById("number").value;

    if (name && endsip && number) {
      data.push({
        name: name,
        endsip: endsip,
        number: number,
      });

      // Atualizar tabela
      populateTable();

      document.getElementById("name").value = "";
      document.getElementById("endsip").value = "";
      document.getElementById("number").value = "";
    }
    else alert("Por favor, preencha todos os campos antes de adicionar.");
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
  document.getElementById("editName").value = entry.name;
  document.getElementById("editEndSip").value = entry.endsip;
  document.getElementById("editNumber").value = entry.number;
  //recolher status do usuário

  document.getElementById("saveEdit").onclick = () => saveEdit(index);
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();
}

// Função para salvar as alterações feitas no modal de edição
function saveEdit(index) {
  const updatedName = document.getElementById("editName").value;
  const updatedEndSip = document.getElementById("editEndSip").value;
  const updatedNumber = document.getElementById("editNumber").value;


  if (updatedName&& updatedEndSip && updatedName && updatedNumber) {
    data[index] = {
      name: updatedName,
      endsip: updatedEndSip,
      number: updatedNumber
    };

    populateTable();
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
  }
}

populateTable();
insertNew()