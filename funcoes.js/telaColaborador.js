// =============== CONFIG DO COLABORADOR LOGADO ===============

let USUARIO_LOGADO = "Maria Santos";

document.addEventListener("DOMContentLoaded", () => {
    const spanNome = document.getElementById("nomeUsuarioHeader");
    if (spanNome && spanNome.textContent.trim() !== "") {
        USUARIO_LOGADO = spanNome.textContent.trim();
    }

    mostrarPagina("Dashboard");
    renderizarDashboard();
    renderizarListaTarefas();
    atualizarEstatisticas();
});

// =============== TAREFAS (EXEMPLO / MOCK) ===============
// Aqui você pode depois puxar do backend ou do mesmo lugar
// que as tarefas do encarregado. O importante é ter o campo "responsavel".

let tarefas = [];


// =============== NAVEGAÇÃO ENTRE ABAS ===============

function mostrarPagina(id) {
    ["Dashboard", "Tarefas", "Estatisticas"].forEach(secaoId => {
        const secao = document.getElementById(secaoId);
        if (!secao) return;
        secao.style.display = secaoId === id ? "block" : "none";
    });
}

// Apenas tarefas do colaborador logado
function getMinhasTarefas() {
    return tarefas.filter(t =>
        t.responsavel &&
        t.responsavel.toLowerCase().trim() === USUARIO_LOGADO.toLowerCase().trim()
    );
}

// =============== MUDAR STATUS (PERMITIDO) ===============

function mudarStatusTarefa(id, novoStatus) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    // segurança: só mexe nas tarefas dele
    if (tarefa.responsavel.toLowerCase().trim() !== USUARIO_LOGADO.toLowerCase().trim()) {
        alert("Você só pode alterar o status das suas próprias tarefas.");
        return;
    }

    tarefa.status = novoStatus;

    const agora = new Date();
    tarefa.atualizada =
        agora.toLocaleDateString("pt-BR") +
        " às " +
        agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    renderizarDashboard();
    renderizarListaTarefas();
    atualizarEstatisticas();
}

// =============== DASHBOARD ===============

function renderizarDashboard() {
    const listaPendente = document.getElementById("listaPendente");
    const listaAndamento = document.getElementById("listaAndamento");
    const listaConcluida = document.getElementById("listaConcluida");

    if (!listaPendente || !listaAndamento || !listaConcluida) return;

    listaPendente.innerHTML = "";
    listaAndamento.innerHTML = "";
    listaConcluida.innerHTML = "";

    const minhas = getMinhasTarefas();

    minhas.forEach(tarefa => {
        const li = document.createElement("li");
        li.classList.add("card-tarefa");
        li.dataset.id = tarefa.id;

        let textoPrioridade = tarefa.prioridade;
        if (tarefa.prioridade === "alta") textoPrioridade = "Alta";
        if (tarefa.prioridade === "media") textoPrioridade = "Média";
        if (tarefa.prioridade === "baixa") textoPrioridade = "Baixa";

        let botoes = "";

        if (tarefa.status === "pendente") {
            botoes = `
                <button class="btn-acao" onclick="mudarStatusTarefa(${tarefa.id}, 'andamento')">
                    Marcar como em andamento
                </button>
            `;
        } else if (tarefa.status === "andamento") {
            botoes = `
                <button class="btn-acao" onclick="mudarStatusTarefa(${tarefa.id}, 'concluida')">
                    Marcar como concluída
                </button>
            `;
        } else if (tarefa.status === "concluida") {
            botoes = `<div class="bloqueado">Concluída</div>`;
        }

        li.innerHTML = `
            <div class="card-titulo">${tarefa.titulo}</div>
            <div class="card-descricao">${tarefa.descricao}</div>
            <div class="card-meta">
                <span>Prioridade: ${textoPrioridade}</span>
                <span>Prazo: ${tarefa.prazo || "Sem prazo"}</span>
                <span>Atualizada em: ${tarefa.atualizada}</span>
            </div>
            <div class="card-actions-status">
                ${botoes}
            </div>
        `;

        if (tarefa.status === "pendente") {
            listaPendente.appendChild(li);
        } else if (tarefa.status === "andamento") {
            listaAndamento.appendChild(li);
        } else {
            listaConcluida.appendChild(li);
        }
    });

    atualizarBadgesDashboard();
    atualizarResumoDashboard();
}

// =============== ABA TAREFAS (SEM EDITAR/EXCLUIR) ===============

function renderizarListaTarefas() {
    const listaPendenteT = document.getElementById("listaPendenteT");
    const listaAndamentoT = document.getElementById("listaAndamentoT");
    const listaConcluidaT = document.getElementById("listaConcluidaT");

    if (!listaPendenteT || !listaAndamentoT || !listaConcluidaT) return;

    listaPendenteT.innerHTML = "";
    listaAndamentoT.innerHTML = "";
    listaConcluidaT.innerHTML = "";

    const minhas = getMinhasTarefas();

    minhas.forEach(tarefa => {
        const li = document.createElement("li");
        li.classList.add("card-tarefa", tarefa.status);
        li.dataset.id = tarefa.id;

        let botoes = "";

        if (tarefa.status === "pendente") {
            botoes = `
                <button class="btn-acao" onclick="mudarStatusTarefa(${tarefa.id}, 'andamento')">
                    Marcar como em andamento
                </button>
            `;
        } else if (tarefa.status === "andamento") {
            botoes = `
                <button class="btn-acao" onclick="mudarStatusTarefa(${tarefa.id}, 'concluida')">
                    Marcar como concluída
                </button>
            `;
        } else {
            botoes = `<div class="bloqueado">Concluída</div>`;
        }

        li.innerHTML = `
            <div class="card-titulo">${tarefa.titulo}</div>
            <div class="card-descricao">${tarefa.descricao}</div>
            <div class="card-meta">
                <span>Prazo: ${tarefa.prazo || "Sem prazo"}</span>
                <span>Prioridade: ${tarefa.prioridade}</span>
            </div>
            <div class="card-actions-status">
                ${botoes}
            </div>
        `;

        if (tarefa.status === "pendente") {
            listaPendenteT.appendChild(li);
        } else if (tarefa.status === "andamento") {
            listaAndamentoT.appendChild(li);
        } else {
            listaConcluidaT.appendChild(li);
        }
    });

    atualizarBadgesTarefas();
}

// =============== BADGES / RESUMO ===============

function atualizarBadgesDashboard() {
    const minhas = getMinhasTarefas();
    const pend = minhas.filter(t => t.status === "pendente").length;
    const and = minhas.filter(t => t.status === "andamento").length;
    const conc = minhas.filter(t => t.status === "concluida").length;

    const badgePend = document.getElementById("badgePendente");
    const badgeAnd = document.getElementById("badgeAndamento");
    const badgeConc = document.getElementById("badgeConcluida");

    if (badgePend) badgePend.textContent = pend;
    if (badgeAnd) badgeAnd.textContent = and;
    if (badgeConc) badgeConc.textContent = conc;
}

function atualizarBadgesTarefas() {
    const minhas = getMinhasTarefas();
    const pend = minhas.filter(t => t.status === "pendente").length;
    const and = minhas.filter(t => t.status === "andamento").length;
    const conc = minhas.filter(t => t.status === "concluida").length;

    const badgePendT = document.getElementById("badgePendenteT");
    const badgeAndT = document.getElementById("badgeAndamentoT");
    const badgeConcT = document.getElementById("badgeConcluidaT");

    if (badgePendT) badgePendT.textContent = pend;
    if (badgeAndT) badgeAndT.textContent = and;
    if (badgeConcT) badgeConcT.textContent = conc;
}

function atualizarResumoDashboard() {
    const minhas = getMinhasTarefas();
    const total = minhas.length;
    const pend = minhas.filter(t => t.status === "pendente").length;
    const and = minhas.filter(t => t.status === "andamento").length;
    const conc = minhas.filter(t => t.status === "concluida").length;

    const resTotal = document.getElementById("resTotal");
    const resPendentes = document.getElementById("resPendentes");
    const resAndamento = document.getElementById("resAndamento");
    const resConcluidas = document.getElementById("resConcluidas");

    if (resTotal) resTotal.textContent = total;
    if (resPendentes) resPendentes.textContent = pend;
    if (resAndamento) resAndamento.textContent = and;
    if (resConcluidas) resConcluidas.textContent = conc;
}

// =============== ESTATÍSTICAS ===============

function atualizarEstatisticas() {
    const minhas = getMinhasTarefas();
    const total = minhas.length;
    const pend = minhas.filter(t => t.status === "pendente").length;
    const and = minhas.filter(t => t.status === "andamento").length;
    const conc = minhas.filter(t => t.status === "concluida").length;

    const alta = minhas.filter(t => t.prioridade === "alta").length;
    const media = minhas.filter(t => t.prioridade === "media").length;
    const baixa = minhas.filter(t => t.prioridade === "baixa").length;

    const elTotal = document.getElementById("statTotal");
    const elConc = document.getElementById("statConcluidas");
    const elAnd = document.getElementById("statAndamento");
    const elPend = document.getElementById("statPendentes");

    if (elTotal) elTotal.textContent = total;
    if (elConc) elConc.textContent = conc;
    if (elAnd) elAnd.textContent = and;
    if (elPend) elPend.textContent = pend;

    const percent = total > 0 ? Math.round((conc / total) * 100) : 0;
    const barra = document.getElementById("barraConclusao");
    const lbl = document.getElementById("percentConclusao");
    if (barra) barra.style.width = percent + "%";
    if (lbl) lbl.textContent = percent + "%";

    const prAlta = document.getElementById("prioAlta");
    const prMedia = document.getElementById("prioMedia");
    const prBaixa = document.getElementById("prioBaixa");

    if (prAlta) prAlta.textContent = alta;
    if (prMedia) prMedia.textContent = media;
    if (prBaixa) prBaixa.textContent = baixa;
}
// ===== BOTÃO DE SAIR (COLABORADOR) =====
document.addEventListener("DOMContentLoaded", () => {
    const btnExit = document.getElementById("exit");
    if (btnExit) {
        btnExit.style.cursor = "pointer";
        btnExit.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }
});
