// --- Manejo del modal de login (funciona en cualquier página) ---
document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("loginBtn");
  const loginModal = document.getElementById("loginModal");
  const closeModal = document.getElementById("closeModal");
  const userNameSpan = document.getElementById("userName");

  // Verificar si hay sesión guardada al cargar la página
  const usuarioGuardado = localStorage.getItem("usuario");
  if (usuarioGuardado) {
    mostrarUsuarioLogueado(usuarioGuardado);
  }

  // Abrir/cerrar modal o hacer logout
  if (loginBtn && loginModal && closeModal) {
    loginBtn.onclick = function () {
      // Si hay usuario logueado, hacer logout
      if (userNameSpan && userNameSpan.textContent) {
        logout();
      } else {
        // Si no hay usuario, abrir modal
        loginModal.style.display = "block";
      }
    };

    closeModal.onclick = function () {
      loginModal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target === loginModal) {
        loginModal.style.display = "none";
      }
    };
  }
});

// Capturamos el formulario
const form = document.getElementById("formLogin");

// Escuchamos el evento "submit"
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // evita que la página se recargue

    // Obtener los valores escritos por el usuario
    const login = document.getElementById("login").value;
    const contrasena = document.getElementById("password").value;

    // Enviar los datos al servidor usando fetch + async/await
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cuenta: login,
          contrasena: contrasena,
        }),
      });

      // Intentamos parsear el JSON
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn("Respuesta no JSON del servidor", parseErr);
        data = {};
      }

      // Revisar la respuesta
      if (res.ok) {
        const cuenta = data.usuario?.cuenta;


        if (cuenta) {
          //Aqui va lo nuevo que se hace
          localStorage.setItem('userLogin', login);
          localStorage.setItem('userPassword', contrasena);
          // ✅ SWEETALERT: Login exitoso
          Swal.fire({
            icon: "success",
            title: "Acceso Permitido",
            text: "Bienvenido " + cuenta,
            confirmButtonColor: "#222",
          });

          console.log("Usuario recibido:", data.usuario);

          // Guardar sesión en localStorage
          localStorage.setItem("usuario", cuenta);

          // Mostrar usuario logueado
          mostrarUsuarioLogueado(cuenta);

          // Cerrar modal automáticamente
          const loginModal = document.getElementById("loginModal");
          if (loginModal) loginModal.style.display = "none";

          // Limpiar formulario
          form.reset();
        } else {
          // ✅ SWEETALERT: Error de respuesta incompleta
          console.warn("200 OK sin usuario:", data);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Respuesta incompleta del servidor.",
            confirmButtonColor: "#222",
          });
        }
      } else {
        // ✅ SWEETALERT: Credenciales incorrectas
        Swal.fire({
          icon: "error",
          title: "Error de Autenticación",
          text: data?.error ?? `Error ${res.status}: ${res.statusText}`,
          confirmButtonColor: "#222",
        });

        // Limpiar los campos del formulario tras error
        const loginInput = document.getElementById("login");
        const passInput = document.getElementById("password");
        if (loginInput) loginInput.value = "";
        if (passInput) passInput.value = "";
      }
    } catch (err) {
      // ✅ SWEETALERT: Error de conexión
      console.error("Error al conectar con el servidor:", err);
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "No se pudo conectar con el servidor. Verifica que esté corriendo.",
        confirmButtonColor: "#222",
      });
    }
  });
}

// Función para mostrar usuario logueado
function mostrarUsuarioLogueado(cuenta) {
  const userNameSpan = document.getElementById("userName");
  if (userNameSpan) {
    userNameSpan.textContent = cuenta;
  }

  // Mostrar contenido protegido
  const protectedContent = document.getElementById("protected-content");
  if (protectedContent) {
    protectedContent.style.display = "block";
  }

  // Cambiar icono del botón a logout
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.title = "Cerrar sesión";
  }
}

// Función de logout
function logout() {
  // ✅ SWEETALERT: Confirmación de logout
  Swal.fire({
    title: "¿Deseas cerrar sesión?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#222",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, cerrar sesión",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      // Limpiar localStorage
      localStorage.removeItem("usuario");

      // Limpiar nombre de usuario
      const userNameSpan = document.getElementById("userName");
      if (userNameSpan) userNameSpan.textContent = "";

      // Ocultar contenido protegido
      const protectedContent = document.getElementById("protected-content");
      if (protectedContent) {
        protectedContent.style.display = "none";
      }

      // Restaurar título del botón
      const loginBtn = document.getElementById("loginBtn");
      if (loginBtn) {
        loginBtn.title = "Login";
      }

      // ✅ SWEETALERT: Sesión cerrada
      Swal.fire({
        icon: "success",
        title: "Sesión Cerrada",
        text: "Has cerrado sesión correctamente",
        confirmButtonColor: "#222",
      });
    }
  });
}
