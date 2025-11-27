// ================== CONFIGURAÇÃO ==================

// Usuário "logado" (quem pode iniciar / concluir no DASHBOARD)
const USUARIO_LOGADO = "Encarregado";

// Lista geral de tarefas
let tarefas = [];
let proximoIdTarefa = 1;
let tarefaEmEdicaoId = null; // null = nova, número = edição


// ================== NAVEGAÇÃO ENTRE ABAS ==================

function mostrarPagina(id) {
    const secoes = ["Dashboard", "Tarefas", "Estatisticas", "Usuarios", "Relatorios"];

    secoes.forEach(secaoId => {
        const secao = document.getElementById(secaoId);
        if (secao) {
            secao.style.display = (secaoId === id) ? "block" : "none";
        }
    });
}


// ================== MODAL (FORM TAREFA) ==================

function abrirFormTarefa(idTarefa) {

    tarefaEmEdicaoId = idTarefa ?? null;

    const overlay = document.getElementById("modalOverlay");
    const modal   = document.getElementById("modalFormTarefa");
    const tituloModal = document.getElementById("tituloModal");

    if (!overlay || !modal) return;

    // campos
    const tituloInput      = document.getElementById("tituloTarefa");
    const descInput        = document.getElementById("descricaoTarefa");
    const respInput        = document.getElementById("responsavelTarefa");
    const prazoInput       = document.getElementById("prazoTarefa");
    const prioridadeSelect = document.getElementById("prioridadeTarefa");

    if (tarefaEmEdicaoId === null) {
        // nova tarefa
        if (tituloModal) tituloModal.textContent = "Nova Tarefa";
        if (tituloInput) tituloInput.value = "";
        if (descInput) descInput.value = "";
        if (respInput) respInput.value = "";
        if (prazoInput) prazoInput.value = "";
        if (prioridadeSelect) prioridadeSelect.value = "alta";
    } else {
        // edição
        const tarefa = tarefas.find(t => t.id === tarefaEmEdicaoId);
        if (tarefa) {
            if (tituloModal) tituloModal.textContent = "Editar Tarefa";
            if (tituloInput) tituloInput.value = tarefa.titulo;
            if (descInput) descInput.value = tarefa.descricao;
            if (respInput) respInput.value = tarefa.responsavel;
            if (prazoInput) prazoInput.value = tarefa.prazo;
            if (prioridadeSelect) prioridadeSelect.value = tarefa.prioridade;
        }
    }

    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");
}

function fecharFormTarefa() {
    const overlay = document.getElementById("modalOverlay");
    const modal   = document.getElementById("modalFormTarefa");

    if (overlay) overlay.classList.add("hidden");
    if (modal)   modal.classList.add("hidden");

    tarefaEmEdicaoId = null;
}


// ================== CRUD DE TAREFAS ==================

function salvarTarefa(event) {
    event.preventDefault();

    const titulo       = document.getElementById("tituloTarefa")?.value.trim() || "";
    const descricao    = document.getElementById("descricaoTarefa")?.value.trim() || "";
    const responsavel  = document.getElementById("responsavelTarefa")?.value.trim() || "";
    const prazo        = document.getElementById("prazoTarefa")?.value || "";
    const prioridade   = document.getElementById("prioridadeTarefa")?.value || "alta";

    if (!titulo) {
        alert("Informe um título para a tarefa.");
        return;
    }

    const agora = new Date();
    const atualizada =
        agora.toLocaleDateString("pt-BR") +
        " às " +
        agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    if (tarefaEmEdicaoId === null) {
        // nova tarefa
        const nova = {
            id: proximoIdTarefa++,
            titulo,
            descricao,
            responsavel,
            prazo,
            prioridade,
            atualizada,
            status: "pendente"
        };
        tarefas.push(nova);
    } else {
        // editar tarefa
        const tarefa = tarefas.find(t => t.id === tarefaEmEdicaoId);
        if (tarefa) {
            tarefa.titulo      = titulo;
            tarefa.descricao   = descricao;
            tarefa.responsavel = responsavel;
            tarefa.prazo       = prazo;
            tarefa.prioridade  = prioridade;
            tarefa.atualizada  = atualizada;
        }
    }

    tarefaEmEdicaoId = null;
    fecharFormTarefa();
    renderizarDashboard();
    renderizarListaTarefas();
}

function excluirTarefa(id) {
    if (!confirm("Deseja realmente excluir esta tarefa?")) return;
    tarefas = tarefas.filter(t => t.id !== id);
    renderizarDashboard();
    renderizarListaTarefas();
}

function editarTarefa(id) {
    abrirFormTarefa(id);
}


// ================== MUDANÇA DE STATUS ==================

function mudarStatusTarefa(id, novoStatus) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    tarefa.status = novoStatus;

    const agora = new Date();
    tarefa.atualizada =
        agora.toLocaleDateString("pt-BR") +
        " às " +
        agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    renderizarDashboard();
    renderizarListaTarefas();
}


// ================== RENDERIZAÇÃO - DASHBOARD ==================

function renderizarDashboard() {
    const listaPendente  = document.getElementById("listaPendente");
    const listaAndamento = document.getElementById("listaandamento");
    const listaConcluida = document.getElementById("listaConcluida");

    if (!listaPendente || !listaAndamento || !listaConcluida) return;

    listaPendente.innerHTML  = "";
    listaAndamento.innerHTML = "";
    listaConcluida.innerHTML = "";

    tarefas.forEach(tarefa => {
        const li = document.createElement("li");
        li.classList.add("card-tarefa");
        li.dataset.id = tarefa.id;

        let textoPrioridade = "";
        if (tarefa.prioridade === "alta")  textoPrioridade = "Alta";
        if (tarefa.prioridade === "media") textoPrioridade = "Média";
        if (tarefa.prioridade === "baixa") textoPrioridade = "Baixa";

        const podeAtuar =
            tarefa.responsavel &&
            tarefa.responsavel.toLowerCase().trim() === USUARIO_LOGADO.toLowerCase().trim();

        let areaAcao = "";

        if (tarefa.status === "pendente") {
            areaAcao = podeAtuar
                ? `<button class="btn-acao" onclick="mudarStatusTarefa(${tarefa.id}, 'andamento')">Iniciar tarefa</button>`
                : `<div class="bloqueado">Aguardando responsável</div>`;
        } else if (tarefa.status === "andamento") {
            areaAcao = podeAtuar
                ? `<button class="btn-acao" onclick="mudarStatusTarefa(${tarefa.id}, 'concluida')">Concluir tarefa</button>`
                : `<div class="bloqueado">Em andamento</div>`;
        } else if (tarefa.status === "concluida") {
            areaAcao = `<div class="bloqueado">Concluída</div>`;
        }

        li.innerHTML = `
            <div class="card-top">
                <div class="card-tags">
                    <span class="tag tag-novo">Tarefa</span>
                    ${textoPrioridade ? `<span class="tag tag-alta">${textoPrioridade}</span>` : ""}
                </div>
            </div>

            <div class="card-titulo">${tarefa.titulo}</div>
            <div class="card-descricao">${tarefa.descricao}</div>

            <div class="card-meta">
                <span>👤 Responsável: ${tarefa.responsavel || "-"}</span>
                <span>📅 Prazo: ${tarefa.prazo || "-"}</span>
                <span>⏰ Atualizada: ${tarefa.atualizada || "-"}</span>
            </div>

            ${areaAcao}
        `;

        if (tarefa.status === "pendente") {
            listaPendente.appendChild(li);
        } else if (tarefa.status === "andamento") {
            listaAndamento.appendChild(li);
        } else if (tarefa.status === "concluida") {
            listaConcluida.appendChild(li);
        }
    });

    atualizarBadges();
}


// ================== RENDERIZAÇÃO - ABA TAREFAS ==================

function renderizarListaTarefas() {
    const listaPendenteT  = document.getElementById("listaPendenteT");
    const listaAndamentoT = document.getElementById("listaAndamentoT");
    const listaConcluidaT = document.getElementById("listaConcluidaT");

    if (!listaPendenteT || !listaAndamentoT || !listaConcluidaT) return;

    listaPendenteT.innerHTML  = "";
    listaAndamentoT.innerHTML = "";
    listaConcluidaT.innerHTML = "";

    tarefas.forEach(tarefa => {
        const li = document.createElement("li");
        li.classList.add("card-tarefa", tarefa.status);
        li.dataset.id = tarefa.id;

        let textoPrioridade = "";
        if (tarefa.prioridade === "alta")  textoPrioridade = "Alta";
        if (tarefa.prioridade === "media") textoPrioridade = "Média";
        if (tarefa.prioridade === "baixa") textoPrioridade = "Baixa";

        const botoesStatus = `
            <div class="card-actions-status">
                <button class="btn-acao" onclick="mudarStatusTarefa(${tarefa.id}, 'pendente')">Pendente</button>
                <button class="btn-acao" onclick="mudarStatusTarefa(${tarefa.id}, 'andamento')">Em Andamento</button>
                <button class="btn-acao" onclick="mudarStatusTarefa(${tarefa.id}, 'concluida')">Concluída</button>
            </div>
        `;

        li.innerHTML = `
            <div class="topo-card">
                <h3 class="titulo">${tarefa.titulo}</h3>
                <div class="acoes-card">
                    <button onclick="editarTarefa(${tarefa.id})" title="Editar">✏️</button>
                    <button onclick="excluirTarefa(${tarefa.id})" title="Excluir">🗑️</button>
                </div>
            </div>

            <p class="descricao">${tarefa.descricao}</p>

            <div class="linha-badges">
                ${textoPrioridade ? `<span class="badge badge-prioridade">${textoPrioridade}</span>` : ""}
            </div>

            <div class="info-card">
                <p><strong>👤</strong> ${tarefa.responsavel || "-"}</p>
                <p><strong>📅 Prazo:</strong> ${tarefa.prazo || "-"}</p>
                <p><strong>⏱ Atualizada:</strong> ${tarefa.atualizada || "-"}</p>
            </div>

            ${botoesStatus}
        `;

        if (tarefa.status === "pendente") {
            listaPendenteT.appendChild(li);
        } else if (tarefa.status === "andamento") {
            listaAndamentoT.appendChild(li);
        } else if (tarefa.status === "concluida") {
            listaConcluidaT.appendChild(li);
        }
    });

    atualizarBadges();
}


// ================== BADGES (DASHBOARD + TAREFAS) ==================

function atualizarBadges() {
    const pend = tarefas.filter(t => t.status === "pendente").length;
    const and  = tarefas.filter(t => t.status === "andamento").length;
    const conc = tarefas.filter(t => t.status === "concluida").length;

    // Dashboard
    const badgePend  = document.getElementById("badgePendente");
    const badgeAnd   = document.getElementById("badgeAndamento");
    const badgeConc  = document.getElementById("badgeConcluida");

    if (badgePend) badgePend.textContent = pend;
    if (badgeAnd)  badgeAnd.textContent  = and;
    if (badgeConc) badgeConc.textContent = conc;

    // Aba Tarefas
    const badgePendT = document.getElementById("badgePendenteT");
    const badgeAndT  = document.getElementById("badgeAndamentoT");
    const badgeConcT = document.getElementById("badgeConcluidaT");

    if (badgePendT) badgePendT.textContent = pend;
    if (badgeAndT)  badgeAndT.textContent  = and;
    if (badgeConcT) badgeConcT.textContent = conc;
}


// ================== INICIALIZAÇÃO ==================

document.addEventListener("DOMContentLoaded", () => {
    // abre Dashboard por padrão
    mostrarPagina("Dashboard");
    renderizarDashboard();
    renderizarListaTarefas();
});
