let dadosOriginais = [];
let dadosLimpos = [];
let graficoCategoria = null;
let graficoMes = null;

const msg = document.getElementById("mensagem");

/* ================= mensagem ================= */
function mostrarMensagem(texto, erro = false) {
  msg.style.color = erro ? "#ef4444" : "#22c55e";
  msg.textContent = texto;
}

/* ================= util número ================= */
function limparNumero(valor) {
  if (valor === null || valor === undefined) return 0;
  if (typeof valor === "string") {
    valor = valor
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();
  }
  const num = parseFloat(valor);
  return isNaN(num) ? 0 : num;
}

/* ================= util datas ================= */
function normalizarData(valor) {
  if (!valor) return null;

  // Data Excel numérica
  if (typeof valor === "number") {
    const data = new Date((valor - 25569) * 86400 * 1000);
    return data.toISOString().split("T")[0];
  }

  valor = valor.toString().trim().replace(/\//g, "-");
  const partes = valor.split("-");
  let ano, mes, dia;

  if (partes[0].length === 4) [ano, mes, dia] = partes;
  else if (partes[2]?.length === 4) [dia, mes, ano] = partes;
  else return null;

  return `${ano.padStart(4, "0")}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function extrairMes(valor) {
  if (!valor) return "—";
  const date = new Date(valor);
  if (isNaN(date)) return "—";
  return date.toLocaleString("pt-BR", { month: "short" });
}

/* ================= normalização ================= */
function normalizarTexto(valor, padrao = "Não informado") {
  if (valor === null || valor === undefined || valor === "") return padrao;
  return valor.toString().trim();
}

const mapCategorias = {
  assinaturas: "ASSINATURAS",
  assinatura: "ASSINATURAS",
  serviços: "SERVICOS",
  servicos: "SERVICOS",
  produtos: "PRODUTOS",
  prod: "PRODUTOS"
};

function padronizarCategoria(cat) {
  if (!cat) return "OUTROS";
  const chave = cat.toString().toLowerCase().trim();
  return mapCategorias[chave] || cat.toString().toUpperCase();
}

/* ================= MAPEAMENTO FLEXÍVEL ================= */
function normalizarChave(texto) {
  return texto
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const colunasAceitas = {
  data: ["data", "data venda", "dt"],
  categoria: ["categoria", "tipo"],
  produto: ["produto", "item", "descricao"],
  quantidade: ["quantidade", "qtd", "qtde"],
  receita: ["receita", "valor", "valor total", "total"]
};

function obterValor(linha, campo) {
  const chaves = Object.keys(linha);
  const possiveis = colunasAceitas[campo];

  const encontrada = chaves.find(c =>
    possiveis.includes(normalizarChave(c))
  );

  return encontrada ? linha[encontrada] : null;
}

/* ================= LIMPEZA ================= */
function limparDados(dadosBrutos) {
  const temp = [];

  dadosBrutos.forEach(linha => {
    if (!linha || Object.keys(linha).length === 0) return;

    const dataNormal = normalizarData(obterValor(linha, "data"));
    const mes = extrairMes(dataNormal);
    const cat = padronizarCategoria(obterValor(linha, "categoria"));
    const prod = normalizarTexto(obterValor(linha, "produto"));
    const qtd = Math.max(limparNumero(obterValor(linha, "quantidade")), 0);
    const receita = Math.max(limparNumero(obterValor(linha, "receita")), 0);

    const existente = temp.find(d =>
      d.Categoria === cat &&
      d.Produto === prod &&
      d.Mes === mes
    );

    if (existente) {
      existente.Quantidade += qtd;
      existente.Receita += receita;
    } else {
      temp.push({
        Data: dataNormal || "—",
        Mes: mes,
        Categoria: cat,
        Produto: prod,
        Quantidade: qtd,
        Receita: receita
      });
    }
  });

  return temp;
}

/* ================= eventos ================= */
document.getElementById("fileInput").addEventListener("change", lerArquivo);
document.getElementById("filtroMes").addEventListener("change", aplicarFiltros);
document.getElementById("filtroCategoria").addEventListener("change", aplicarFiltros);
document.getElementById("limparFiltros").addEventListener("click", limparFiltros);

/* ================= leitura ================= */
function lerArquivo(e) {
  const file = e.target.files[0];
  if (!file) {
    mostrarMensagem("Nenhum arquivo selecionado.", true);
    return;
  }

  const nome = file.name.toLowerCase();
  if (nome.endsWith(".xlsx")) lerExcel(file);
  else if (nome.endsWith(".csv")) lerCSV(file);
  else {
    mostrarMensagem("Arquivo não compatível! Use .xlsx ou .csv.", true);
    e.target.value = "";
  }
}

function lerExcel(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const abaComDados = workbook.SheetNames.find(nome => {
      const sheet = workbook.Sheets[nome];
      return XLSX.utils.sheet_to_json(sheet).length > 0;
    });

    const sheet = workbook.Sheets[abaComDados];
    dadosOriginais = XLSX.utils.sheet_to_json(sheet);
    processarDados();
  };
  reader.readAsArrayBuffer(file);
}

function lerCSV(file) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: results => {
      dadosOriginais = results.data;
      processarDados();
    },
    error: err =>
      mostrarMensagem("Erro ao ler CSV: " + err.message, true)
  });
}

/* ================= processamento ================= */
function processarDados() {
  if (!dadosOriginais.length) {
    mostrarMensagem("Arquivo vazio ou inválido.", true);
    return;
  }

  dadosLimpos = limparDados(dadosOriginais);

  if (!dadosLimpos.length) {
    mostrarMensagem("Nenhum dado válido encontrado.", true);
    return;
  }

  popularFiltros();
  atualizarCards(dadosLimpos);
  atualizarGraficos(dadosLimpos);
  atualizarTabela(dadosLimpos);

  mostrarMensagem("Dados carregados com sucesso!");
}

/* ================= filtros ================= */
function popularFiltros() {
  const meses = [...new Set(dadosLimpos.map(d => d.Mes))];
  const categorias = [...new Set(dadosLimpos.map(d => d.Categoria))];

  const fMes = document.getElementById("filtroMes");
  const fCat = document.getElementById("filtroCategoria");

  fMes.innerHTML = '<option value="">Todos os meses</option>';
  fCat.innerHTML = '<option value="">Todas categorias</option>';

  meses.forEach(m => fMes.innerHTML += `<option value="${m}">${m}</option>`);
  categorias.forEach(c => fCat.innerHTML += `<option value="${c}">${c}</option>`);
}

function aplicarFiltros() {
  let dados = [...dadosLimpos];
  const mes = document.getElementById("filtroMes").value;
  const cat = document.getElementById("filtroCategoria").value;

  if (mes) dados = dados.filter(d => d.Mes === mes);
  if (cat) dados = dados.filter(d => d.Categoria === cat);

  atualizarCards(dados);
  atualizarGraficos(dados);
  atualizarTabela(dados);
}

function limparFiltros() {
  document.getElementById("filtroMes").value = "";
  document.getElementById("filtroCategoria").value = "";
  aplicarFiltros();
}

/* ================= cards ================= */
function atualizarCards(dados) {
  const totalReceita = dados.reduce((s, d) => s + d.Receita, 0);
  const totalQtd = dados.reduce((s, d) => s + d.Quantidade, 0);
  const produtos = new Set(dados.map(d => d.Produto)).size;

  const porMes = {};
  dados.forEach(d => porMes[d.Mes] = (porMes[d.Mes] || 0) + d.Receita);
  const melhorMes = Object.entries(porMes).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  document.getElementById("totalReceita").textContent =
    totalReceita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("totalQtd").textContent = totalQtd;
  document.getElementById("totalProdutos").textContent = produtos;
  document.getElementById("melhorMes").textContent = melhorMes;
}

/* ================= gráficos ================= */
function atualizarGraficos(dados) {
  const porCategoria = {};
  const porMes = {};

  dados.forEach(d => {
    porCategoria[d.Categoria] = (porCategoria[d.Categoria] || 0) + d.Receita;
    porMes[d.Mes] = (porMes[d.Mes] || 0) + d.Receita;
  });

  const mesesOrdenados = Object.entries(porMes).sort((a, b) => b[1] - a[1]);

  if (graficoCategoria) graficoCategoria.destroy();
  if (graficoMes) graficoMes.destroy();

  const cores = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  graficoCategoria = new Chart(document.getElementById("graficoCategoria"), {
    type: "doughnut",
    data: {
      labels: Object.keys(porCategoria),
      datasets: [{ data: Object.values(porCategoria), backgroundColor: cores, borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: ctx =>
              ctx.raw.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          }
        }
      }
    }
  });

  graficoMes = new Chart(document.getElementById("graficoMes"), {
    type: "bar",
    data: {
      labels: mesesOrdenados.map(m => m[0]),
      datasets: [{
        label: "Receita",
        data: mesesOrdenados.map(m => m[1]),
        backgroundColor: "#3b82f6",
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  });
}

/* ================= tabela ================= */
function atualizarTabela(dados) {
  const tabela = document.getElementById("tabelaDados");
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  if (!dados.length) return;

  thead.innerHTML =
    "<tr>" +
    Object.keys(dados[0]).map(c => `<th>${c}</th>`).join("") +
    "</tr>";

  tbody.innerHTML = dados
    .slice(0, 500)
    .map(l =>
      "<tr>" +
      Object.values(l).map(v => `<td>${v}</td>`).join("") +
      "</tr>"
    )
    .join("");
}
