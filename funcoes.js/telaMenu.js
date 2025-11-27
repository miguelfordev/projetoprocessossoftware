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
    atualizarEstatisticas();

}


// ================== INICIALIZAÇÃO ==================

document.addEventListener("DOMContentLoaded", () => {
    // abre Dashboard por padrão
    mostrarPagina("Dashboard");
    renderizarDashboard();
    renderizarListaTarefas();
});
// ======================== USUÁRIOS ======================== //

let listaUsuariosData = [];
let usuarioEditandoId = null;

// Abrir modal
function abrirFormUsuario(id = null) {
    usuarioEditandoId = id;

    const overlay = document.getElementById("modalOverlay");
    const modal = document.getElementById("modalFormUsuario");

    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");

    const titulo = document.getElementById("tituloUsuarioModal");
    const nome = document.getElementById("usuarioNome");
    const email = document.getElementById("usuarioEmail");
    const telefone = document.getElementById("usuarioTelefone");
    const funcao = document.getElementById("usuarioFuncao");
    const status = document.getElementById("usuarioStatus");

    // novo
    if (id === null) {
        titulo.textContent = "Adicionar Novo Usuário";
        nome.value = "";
        email.value = "";
        telefone.value = "";
        funcao.value = "Colaborador";
        status.value = "Ativo";
    } 
    // edição
    else {
        titulo.textContent = "Editar Usuário";
        const u = listaUsuariosData.find(x => x.id === id);

        nome.value = u.nome;
        email.value = u.email;
        telefone.value = u.telefone;
        funcao.value = u.funcao;
        status.value = u.status;
    }
}

// fechar modal
function fecharFormUsuario() {
    document.getElementById("modalOverlay").classList.add("hidden");
    document.getElementById("modalFormUsuario").classList.add("hidden");
}

// salvar
function salvarUsuario(e) {
    e.preventDefault();

    const nome = usuarioNome.value.trim();
    const email = usuarioEmail.value.trim();
    const telefone = usuarioTelefone.value.trim();
    const funcao = usuarioFuncao.value;
    const status = usuarioStatus.value;
    const dataCadastro = new Date().toLocaleDateString("pt-BR");

    if (usuarioEditandoId === null) {
        listaUsuariosData.push({
            id: Date.now(),
            nome,
            email,
            telefone,
            funcao,
            status,
            cadastro: dataCadastro
        });
    } else {
        const u = listaUsuariosData.find(x => x.id === usuarioEditandoId);
        u.nome = nome;
        u.email = email;
        u.telefone = telefone;
        u.funcao = funcao;
        u.status = status;
    }

    fecharFormUsuario();
    renderizarUsuarios();
}

// editar
function editarUsuario(id) {
    abrirFormUsuario(id);
}

// ativar/inativar
function alternarStatus(id) {
    const u = listaUsuariosData.find(x => x.id === id);
    u.status = (u.status === "Ativo") ? "Inativo" : "Ativo";
    renderizarUsuarios();
}

// renderização
function renderizarUsuarios() {
    const tbody = document.getElementById("listaUsuarios");
    tbody.innerHTML = "";

    listaUsuariosData.forEach(u => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="usuario-perfil">
                    <div class="circle">${u.nome.charAt(0).toUpperCase()}</div>
                    <span>${u.nome}</span>
                </div>
            </td>

            <td>${u.email}<br>${u.telefone}</td>
            <td>${u.funcao}</td>

            <td class="${u.status === "Ativo" ? "status-ativo" : "status-inativo"}">
                ${u.status}
            </td>

            <td>${u.cadastro}</td>

            <td>
                <button class="acao-btn edit" onclick="editarUsuario(${u.id})">✏️</button>
                <button class="acao-btn delete" onclick="alternarStatus(${u.id})">⚠️</button>
            </td>
        `;

        tbody.appendChild(row);
    });
    atualizarEstatisticas();

}

// carregar aba usuários automaticamente quando abrir
document.addEventListener("DOMContentLoaded", () => {
    renderizarUsuarios();
});
function mudarStatusTarefa(id, novoStatus) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    tarefa.status = novoStatus;

    const agora = new Date();
    tarefa.atualizada =
        agora.toLocaleDateString("pt-BR") +
        " às " +
        agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // registra data de conclusão (para "Concluídas hoje")
    if (novoStatus === "concluida") {
        tarefa.dataConclusao = agora.toISOString().slice(0, 10); // yyyy-mm-dd
    } else {
        tarefa.dataConclusao = null;
    }

    renderizarDashboard();
    renderizarListaTarefas();
}
// ================== ESTATÍSTICAS (DASHBOARD) ==================

function atualizarEstatisticas() {
    // elementos podem não existir se a aba não foi carregada
    const elTotal        = document.getElementById("estatTotalTarefas");
    const elConc         = document.getElementById("estatConcluidas");
    const elAnd          = document.getElementById("estatAndamento");
    const elPend         = document.getElementById("estatPendentes");
    const elAtr          = document.getElementById("estatAtrasadas");
    const elConcHoje     = document.getElementById("estatConcluidasHoje");
    const elPct          = document.getElementById("estatPorcentagemConclusao");
    const elTextoConc    = document.getElementById("estatTextoConclusao");
    const elBarConc      = document.getElementById("estatBarraConclusao");
    const elPrAlta       = document.getElementById("estatPrioridadeAlta");
    const elPrMedia      = document.getElementById("estatPrioridadeMedia");
    const elPrBaixa      = document.getElementById("estatPrioridadeBaixa");
    const elTotUsers     = document.getElementById("estatTotalUsuarios");
    const elColabAtivos  = document.getElementById("estatColaboradoresAtivos");
    const listaProd      = document.getElementById("estatListaProdutividade");

    if (!elTotal) return; // se a tela não existir, sai

    const hojeISO = new Date().toISOString().slice(0, 10);
    const hoje = new Date();

    const total      = tarefas.length;
    const concluidas = tarefas.filter(t => t.status === "concluida").length;
    const andamento  = tarefas.filter(t => t.status === "andamento").length;
    const pendentes  = tarefas.filter(t => t.status === "pendente").length;

    const atrasadas  = tarefas.filter(t => {
        if (!t.prazo) return false;
        const prazoData = new Date(t.prazo + "T00:00:00");
        return prazoData < hoje && t.status !== "concluida";
    }).length;

    const concluidasHoje = tarefas.filter(t =>
        t.status === "concluida" && t.dataConclusao === hojeISO
    ).length;

    elTotal.textContent    = total;
    elConc.textContent     = concluidas;
    elAnd.textContent      = andamento;
    elPend.textContent     = pendentes;
    elAtr.textContent      = atrasadas;
    elConcHoje.textContent = concluidasHoje;

    const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    elPct.textContent = pct + "%";
    elTextoConc.textContent = `${concluidas} de ${total} tarefas concluídas`;
    if (elBarConc) elBarConc.style.width = pct + "%";

    // prioridades
    const prAlta  = tarefas.filter(t => t.prioridade === "alta").length;
    const prMedia = tarefas.filter(t => t.prioridade === "media").length;
    const prBaixa = tarefas.filter(t => t.prioridade === "baixa").length;

    elPrAlta.textContent  = prAlta;
    elPrMedia.textContent = prMedia;
    elPrBaixa.textContent = prBaixa;

    // equipe (usa listaUsuariosData se existir)
    const usuariosArr = Array.isArray(window.listaUsuariosData) ? window.listaUsuariosData : [];
    const totalUsuarios = usuariosArr.length;
    const colaboradoresAtivos = usuariosArr.filter(u => 
        u.status === "Ativo" && u.funcao === "Colaborador"
    ).length;

    if (elTotUsers)    elTotUsers.textContent    = totalUsuarios;
    if (elColabAtivos) elColabAtivos.textContent = colaboradoresAtivos;

    // produtividade por responsável
    if (listaProd) {
        listaProd.innerHTML = "";
        const mapa = {};

        tarefas.forEach(t => {
            const nome = t.responsavel?.trim();
            if (!nome) return;
            if (!mapa[nome]) {
                mapa[nome] = { total: 0, concluidas: 0 };
            }
            mapa[nome].total++;
            if (t.status === "concluida") mapa[nome].concluidas++;
        });

        Object.keys(mapa).forEach(nome => {
            const dados = mapa[nome];
            const pctLocal = dados.total > 0 ? Math.round((dados.concluidas / dados.total) * 100) : 0;

            const item = document.createElement("div");
            item.classList.add("estat-prod-item");
            item.innerHTML = `
                <div class="estat-prod-topo">
                    <span>${nome}</span>
                    <span>${pctLocal}%</span>
                </div>
                <div class="estat-prod-barra">
                    <div class="estat-prod-preenchida" style="width:${pctLocal}%"></div>
                </div>
                <div style="font-size:11px;margin-top:2px;">
                    ${dados.concluidas}/${dados.total} tarefas
                </div>
            `;
            listaProd.appendChild(item);
        });

        if (Object.keys(mapa).length === 0) {
            listaProd.innerHTML = "<span style='font-size:12px;color:#777;'>Nenhuma tarefa atribuída.</span>";
        }
    }
}

// ================== RELATÓRIOS ==================

function formatarDataBR(iso) {
    if (!iso) return "-";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
}

function capitalizarStatus(status) {
    if (!status) return "-";
    if (status === "pendente") return "Pendente";
    if (status === "andamento") return "Em andamento";
    if (status === "concluida") return "Concluída";
    return status;
}

function capitalizarPrioridade(p) {
    if (!p) return "-";
    if (p === "alta") return "Alta";
    if (p === "media") return "Média";
    if (p === "baixa") return "Baixa";
    return p;
}

// monta opções de colaboradores a partir de usuários + tarefas
function atualizarOpcoesColaboradorRel() {
    const sel = document.getElementById("relColaborador");
    if (!sel) return;

    const nomes = new Set();

    if (Array.isArray(window.listaUsuariosData)) {
        window.listaUsuariosData.forEach(u => {
            if (u.nome) nomes.add(u.nome);
        });
    }

    tarefas.forEach(t => {
        if (t.responsavel) nomes.add(t.responsavel);
    });

    const valorAtual = sel.value;
    sel.innerHTML = "";
    const optTodos = document.createElement("option");
    optTodos.value = "todos";
    optTodos.textContent = "Todos os colaboradores";
    sel.appendChild(optTodos);

    [...nomes].sort().forEach(nome => {
        const opt = document.createElement("option");
        opt.value = nome;
        opt.textContent = nome;
        if (nome === valorAtual) opt.selected = true;
        sel.appendChild(opt);
    });
}

// gera o relatório com base nos filtros
function gerarRelatorio() {
    const inputData = document.getElementById("relData");
    const selColab  = document.getElementById("relColaborador");
    const selStatus = document.getElementById("relStatus");
    const tbody     = document.getElementById("relTabelaBody");

    if (!inputData || !selColab || !selStatus || !tbody) return;

    atualizarOpcoesColaboradorRel();

    const dataFiltro   = inputData.value; // yyyy-mm-dd
    const colaborador  = selColab.value;
    const statusFiltro = selStatus.value;

    let filtradas = [...tarefas];

    if (dataFiltro) {
        filtradas = filtradas.filter(t => t.prazo === dataFiltro);
    }

    if (colaborador !== "todos") {
        filtradas = filtradas.filter(t => (t.responsavel || "").trim() === colaborador.trim());
    }

    if (statusFiltro !== "todos") {
        filtradas = filtradas.filter(t => t.status === statusFiltro);
    }

    const total = filtradas.length;
    const conc  = filtradas.filter(t => t.status === "concluida").length;
    const and   = filtradas.filter(t => t.status === "andamento").length;
    const pend  = filtradas.filter(t => t.status === "pendente").length;

    const pct = (qtd) => (total > 0 ? Math.round((qtd / total) * 100) : 0);

    // cards
    const elTotal     = document.getElementById("relTotal");
    const elTotalData = document.getElementById("relTotalData");
    const elConc      = document.getElementById("relConc");
    const elConcPct   = document.getElementById("relConcPct");
    const elAnd       = document.getElementById("relAnd");
    const elAndPct    = document.getElementById("relAndPct");
    const elPend      = document.getElementById("relPend");
    const elPendPct   = document.getElementById("relPendPct");

    if (elTotal)     elTotal.textContent     = total;
    if (elTotalData) elTotalData.textContent = dataFiltro ? `Para ${formatarDataBR(dataFiltro)}` : "Para todos os prazos";

    if (elConc)    elConc.textContent    = conc;
    if (elConcPct) elConcPct.textContent = `${pct(conc)}% do total`;

    if (elAnd)    elAnd.textContent    = and;
    if (elAndPct) elAndPct.textContent = `${pct(and)}% do total`;

    if (elPend)    elPend.textContent    = pend;
    if (elPendPct) elPendPct.textContent = `${pct(pend)}% do total`;

    // label de quantidade
    const lblQtd = document.getElementById("relQtdLabel");
    if (lblQtd) {
        lblQtd.textContent = `${total} tarefa(s) encontrada(s) para os filtros selecionados`;
    }

    // tabela
    tbody.innerHTML = "";

    if (total === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td colspan="6" class="rel-sem-registro">
                Nenhuma tarefa encontrado para os filtros selecionados
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }

    filtradas.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${t.titulo}</td>
            <td>${t.responsavel || "-"}</td>
            <td>${capitalizarStatus(t.status)}</td>
            <td>${capitalizarPrioridade(t.prioridade)}</td>
            <td>${t.prazo ? formatarDataBR(t.prazo) : "-"}</td>
            <td>${t.atualizada || "-"}</td>
        `;
        tbody.appendChild(tr);
    });
}

// preparar tela de relatórios ao carregar
function prepararRelatorios() {
    const inputData = document.getElementById("relData");
    if (inputData) {
        const hoje = new Date();
        const ano  = hoje.getFullYear();
        const mes  = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia  = String(hoje.getDate()).padStart(2, "0");
        inputData.value = `${ano}-${mes}-${dia}`;
    }

    atualizarOpcoesColaboradorRel();
    gerarRelatorio();
}
document.addEventListener("DOMContentLoaded", () => {
    prepararRelatorios();
});
// ===== BOTÃO DE SAIR (ENCARREGADO) =====
document.addEventListener("DOMContentLoaded", () => {
    const btnExit = document.getElementById("exit");
    if (btnExit) {
        btnExit.style.cursor = "pointer";
        btnExit.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }
});
