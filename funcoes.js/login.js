document.addEventListener("DOMContentLoaded", () => {
    const btnEntrar = document.getElementById("testar_login");
    const selectTipo = document.getElementById("TIPO_USUARIO");

    btnEntrar.addEventListener("click", () => {
        const tipo = selectTipo.value;

        // Aqui no front NÃO vamos validar login/senha (vai ser o backend)
        // Só decidimos o destino pela função escolhida

        if (tipo === "ENCARREGADO") {
            // tela principal do encarregado
            window.location.href = "tela_principal.html";
        } else if (tipo === "COLABORADOR") {
            // tela do colaborador
            window.location.href = "tela_colaborador.html";
        } else {
            alert("Selecione o tipo de usuário (ENCARREGADO ou COLABORADOR) para continuar.");
        }
    });
});
