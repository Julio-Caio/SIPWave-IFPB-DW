export function showToast(message, type = "danger") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
  
    toast.classList.remove("text-bg-success", "text-bg-success-emphasis", "text-bg-danger", "text-bg-warning", "text-bg-info", "text-bg-primary");
    toast.classList.add(`text-bg-${type}`);
    toastMessage.textContent = message;

    const bootstrapToast = bootstrap.Toast.getOrCreateInstance(toast);

    bootstrapToast.show();

    setTimeout(()=> {
      bootstrapToast.hide();
    }, 3000)
}