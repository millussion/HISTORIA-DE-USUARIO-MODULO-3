
const inputNota = document.getElementById("inputNota");
const btnAgregar = document.getElementById("btnAgregar");
const listaNotas = document.querySelector("#listaNotas");
const mensaje = document.querySelector("#mensaje");
const contador = document.querySelector("#contador");

console.log("elementos del DOM cargados:");
console.log("inputNota →", inputNota);
console.log("btnAgregar →", btnAgregar);
console.log("listaNotas →", listaNotas);



// recupera las notas guardadas en localStorage o usa arreglo vacío
let notas = JSON.parse(localStorage.getItem("notas")) || [];

// imprime cuántas notas se cargaron al iniciar
console.log(`notas cargadas del localStorage: ${notas.length}`);


const guardarEnStorage = () => {
  // convierte el arreglo a JSON y lo guarda con la clave "notas"
  localStorage.setItem("notas", JSON.stringify(notas));
  console.log("notas guardadas en localStorage:", notas);
};

// modifica textContent del contador con la cantidad actual
const actualizarContador = () => {
  contador.textContent = notas.length;
};

const actualizarEstadoVacio = () => {
  // busca si ya existe el elemento de estado vacío
  const existente = listaNotas.querySelector(".empty-state");

  if (notas.length === 0 && !existente) { // si no hay notas y no hay estado vacío, lo crea e inserta
    const li = document.createElement("li");
    li.className = "empty-state";
    li.innerHTML = `<span class="icon">✦</span>Todavía no hay notas. ¡Agrega una!`;
    
    listaNotas.appendChild(li);// usa appendChild para insertar el elemento en la lista
  } else if (notas.length > 0 && existente) {
    listaNotas.removeChild(existente);// si hay notas y existe el estado vacío, lo elimina
  }
};

const agregarAlDOM = (nota) => {
  const li = document.createElement("li");
  // bolita
  const bullet = document.createElement("span");
  bullet.className = "bullet";

  // crea el span
  const textoSpan = document.createElement("span");
  textoSpan.className = "nota-texto";
  textoSpan.textContent = nota.texto;

  // botón Eliminar
  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "Eliminar";

  btnEliminar.onclick = () => eliminarNota(li, nota.id);

  li.appendChild(bullet);
  li.appendChild(textoSpan);
  li.appendChild(btnEliminar);

  listaNotas.appendChild(li);
};




const eliminarNota = (li, id) => {
  // agrega clase de animación de salida
  li.classList.add("removing");

  li.addEventListener("animationend", () => {
    listaNotas.removeChild(li);

    // elimina la nota del arreglo usando su id
    notas = notas.filter(n => n.id !== id);

    // actualiza el localStorage
    guardarEnStorage();

    // actualiza contador y estado vacío
    actualizarContador();
    actualizarEstadoVacio();

    console.log("nota eliminada con id:", id);
    console.log("notas restantes:", notas.length);
  }, { once: true });
};


const mostrarMensaje = (texto) => {
  mensaje.textContent = texto;
  mensaje.classList.add("visible");

  // oculta el mensaje después de 2.5 segundos
  setTimeout(() => {
    mensaje.classList.remove("visible");
  }, 2500);
};



btnAgregar.onclick = () => {
  // lee y limpia espacios del valor del input
  const texto = inputNota.value.trim();

  if (texto === "") {
    mostrarMensaje("La nota no puede estar vacía.");
    console.log("error: nota vacía, no se agregó");
    return;
  }

  // crea el objeto de la nota con id único basado en timestamp
  const nuevaNota = {
    id:    Date.now(),
    texto: texto
  };

  agregarAlDOM(nuevaNota);

  notas.push(nuevaNota);

  guardarEnStorage();

  actualizarContador();
  actualizarEstadoVacio();

  
  console.log("nota agregada:", nuevaNota);

  
  inputNota.value = "";
  inputNota.focus();
};

// permite agregar también presionando Enter
inputNota.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnAgregar.click();
});


notas.forEach(n => agregarAlDOM(n));

// sincroniza contador y estado vacío con las notas cargadas
actualizarContador();
actualizarEstadoVacio();

console.log(`renderizado completo: ${notas.length} nota(s) mostrada(s)`);
