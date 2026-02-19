📊 Dashboard de Vendas PRO+

Um dashboard interativo de vendas desenvolvido em HTML, CSS e JavaScript, que permite carregar arquivos .xlsx ou .csv, limpar, padronizar e visualizar os dados de vendas com gráficos, filtros, cards e tabela detalhada. Ideal para análises rápidas de receita, quantidade e desempenho de produtos.

🔹 Funcionalidades

📥 Leitura de arquivos .xlsx e .csv.

🧹 Limpeza e normalização de dados (datas, números e textos).

🏷️ Padronização automática de categorias e agrupamento de produtos duplicados.

📊 Gráficos interativos de receita por categoria e por mês.

📋 Tabela detalhada com limite de 500 linhas visíveis.

🎯 Filtros por mês e categoria, com botão para limpar filtros.

⚠️ Aviso na tela caso o arquivo anexado não seja compatível.

💳 Cards resumidos com total de receita, quantidade, produtos e melhor mês.

🖥️ Responsivo, funcionando em desktop e mobile.

🔹 Tecnologias utilizadas

HTML5 e CSS3 – estrutura e estilo do dashboard.

JavaScript (ES6) – processamento de dados, filtros e lógica dos gráficos.

Chart.js
 – criação de gráficos interativos.

XLSX.js
 – leitura de arquivos Excel.

PapaParse
 – leitura de arquivos CSV.

🔹 Estrutura do projeto
dashboard-vendas/
│
├─ index.html          # Estrutura do dashboard
├─ style.css           # Estilo do projeto
├─ script.js           # Lógica de leitura, limpeza, filtros, gráficos e tabela
├─ README.md           # Este arquivo
└─ exemplos/           # (opcional) arquivos CSV/XLSX para teste

🔹 Como usar

Clone ou faça download do projeto:

git clone https://github.com/seu-usuario/dashboard-vendas.git
cd dashboard-vendas


Abra o arquivo index.html no seu navegador.

Clique em "Escolher arquivo" e selecione um arquivo .xlsx ou .csv com os dados de vendas.

O dashboard irá carregar, limpar e padronizar os dados automaticamente.

Use os filtros por mês e categoria para explorar os dados.

Os gráficos, cards e tabela serão atualizados automaticamente.

🔹 Formato do arquivo esperado

O arquivo deve conter colunas com pelo menos os seguintes campos (nomes aproximados podem variar, desde que existam):

Coluna	Tipo	Observações
Data	Data	Pode ser DD/MM/AAAA ou AAAA-MM-DD
Categoria	Texto	Será padronizada automaticamente
Produto	Texto	Nome do produto
Quantidade	Número	Pode ser string ou número
Receita	Número	Pode vir com R$, . ou ,

Qualquer valor inválido será convertido em zero ou "Não informado". Categorias não reconhecidas serão agrupadas em Outros.

🔹 Como funciona a padronização de categorias

O sistema possui um mapa interno que padroniza automaticamente categorias semelhantes:

const mapCategorias = {
  assinaturas: "ASSINATURAS",
  assinatura: "ASSINATURAS",
  assinaturass: "ASSINATURAS",
  serviços: "SERVICOS",
  servicos: "SERVICOS",
  produtos: "PRODUTOS",
  prod: "PRODUTOS"
};


Valores não mapeados aparecem como Outros.

Duplicatas da mesma categoria e produto no mesmo mês são agrupadas, somando quantidade e receita.

🔹 Screenshots

<img width="1712" height="728" alt="image" src="https://github.com/user-attachments/assets/e8dea3f1-ab66-48bc-b087-654983469bbb" />




🔹 Melhorias futuras

🔴 Destacar categorias Outros nos gráficos com cor vermelha.

📥 Permitir exportar dados filtrados em CSV ou Excel.

🖱️ Filtros múltiplos (seleção de vários meses ou categorias).

📈 Gráficos adicionais, como evolução de receita acumulada.

🌐 Integração com APIs externas de vendas ou ERP.
