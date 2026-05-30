function iniciarsistema() {
    const nombreusuario = prompt("Por favor, ingresa tu nombre:");

    const edadingresada = prompt("Por favor, ingresa tu edad:");


    const edadusuario = Number(edadingresada);

    if (isNaN(edadusuario) || edadingresada.trim() === "" || !Number.isInteger(edadusuario)) {
       console.error("Igrese solo numeros");
        alert("Edad no valida");
        return;
        }

        if (edadusuario < 18) {
            const mensajemenor = `Hola, ${nombreusuario}, eres menor de edad`;
            console.log(mensajemenor);
            alert(mensajemenor);

            }else {
                const mensajemayor = `Hola, ${nombreusuario}, eres mayor de edad`;
                console.log(mensajemayor);
                alert(mensajemayor);
            }

}