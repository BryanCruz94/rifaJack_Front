async function handleCredentialResponse(response) {
    const data = JSON.parse(atob(response.credential.split('.')[1]));
    const email = data.email || data.emails?.[0]?.value;
    if (!email) return alert("No se pudo obtener el email");

    try {
        const res = await fetch(`http://localhost:3000/api/verificar-evaluador?email=${encodeURIComponent(email)}`);
        const result = await res.json();

        if (result.autorizado) {
            localStorage.setItem("user", JSON.stringify({
                email,
                nombre: result.nombre
            }));
            window.location.href = "rifa.html";
        } else {
            alert("No tienes permiso para acceder.");
        }
    } catch (error) {
        alert("Error en login.");
        console.error(error);
    }
}
