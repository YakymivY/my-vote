form = document.getElementById("logoutForm");
if (form) {
  form.addEventListener("submit", handleFormSubmission);

  async function handleFormSubmission(event) {
    event.preventDefault();
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const errorMessage = await response.text();
        showMessage(errorMessage);
        setTimeout(() => {
            window.location.reload();
          }, 2000);
        return;
      }
    } catch (error) {
      showMessage(`Error: ${error}`);
      window.location.reload();
      console.log(error);
    }
  }
}
