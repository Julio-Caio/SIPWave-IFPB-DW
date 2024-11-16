function toggleSidebar()
{
    const menu = document.querySelector("#toggleSidebarButton i")
    const sidebar = document.getElementById("collapseSidebar")

    sidebar.classList.toggle("active")

}