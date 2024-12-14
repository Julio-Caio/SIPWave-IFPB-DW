import { showFeedback, validateInput, statusColor } from "./utils.js";

const containerCards = document.querySelector("#cards-container");
const searchInput = document.getElementById("searchInput");
let data = [];

// Função para buscar os dados no arquivo JSON
async function fetchData() {
  try {
    const res = await fetch("./seeders.json");
    if (!res.ok) throw new Error("Request failed!");
    data = await res.json();
    console.log("Data fetched:", data);
    createCardElement(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    data = [];
  }
}

function createCardElement(filteredData) {
  containerCards.innerHTML = "";
  filteredData.forEach((element, index) => {
    const col = document.createElement("div");
    const card = document.createElement("div");
    col.className = "col-md-4 col-sm-6 col-12 mb-4";
    card.className = "card";

    const statusClass = statusColor(element.status);
    card.innerHTML = `
      <img src="${
        element.image || "default.jpg"
      }" class="card-img-top" alt="Image of ${
      element.username || element.name
    }" style="width: 100%; height: auto; object-fit: cover; overflow: hidden; border-radius: .8em; cursor: pointer">
      <div class="card-body">
        <h5 class="card-title">${element.username || element.name}</h5>
        
        <!-- Badges empilhadas -->
        <div class="info d-flex">
          <p class="badge ${statusClass}">${element.status}</p>
          <p class="badge bg-primary">URI/SIP: ${
            element.userURI || element.endsip || "N/A"
          }</p>
        </div>
        
        <!-- Número de telefone e botão de ligar -->
        <div class="d-flex d-flex flex-column flex-sm-row mt-3 justify-content-md-between align-items-center mt-2">
          <p class="text-cyan">${element.number}</span></p>
          <i class="bi bi-telephone-fill ml-2" id="btn-call"></i>
        </div>
        
        <!-- Ações do card -->
        <div class="card-actions d-flex flex-column flex-sm-row mt-3">
          <button class="btn btn-primary" onclick="openEditModal(${index})">Edit</button>
          <button class="btn btn-danger" onclick="openDelModal(${index})">Delete</button>
        </div>
      </div>
    `;
    col.appendChild(card);
    containerCards.appendChild(col);
  });
}

// Função para buscar os contatos
function filterContacts() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredData = data.filter((contact) => {
    const username = (contact.username || contact.name).toLowerCase();
    return username.startsWith(searchTerm);
  });
  createCardElement(filteredData);
}

searchInput.addEventListener("input", filterContacts);

fetchData();