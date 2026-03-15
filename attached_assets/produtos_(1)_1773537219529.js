/* SISTEMA TRATO FEITO - COMPLETO */
let produtos = JSON.parse(localStorage.getItem("produtos")) || []
let clientes = JSON.parse(localStorage.getItem("clientes")) || []
let vendas = JSON.parse(localStorage.getItem("vendas")) || []

/* CÓDIGO MESTRE */
const CODIGO_MESTRE = "1234"; // só você sabe

function verificarCodigo(){
  let codigo = document.getElementById("codigoAcesso").value
  if(codigo === CODIGO_MESTRE){
    document.getElementById("loginScreen").style.display = "none"
    document.getElementById("mainScreen").style.display = "block"
    mostrarProdutos()
    mostrarClientes()
    mostrarVendas()
    verificarAniversarios()
  } else {
    alert("Código incorreto!")
  }
}

/* ABAS */
function abrirAba(aba){
  document.getElementById("produtos").style.display="none"
  document.getElementById("clientes").style.display="none"
  document.getElementById("vendas").style.display="none"
  document.getElementById(aba).style.display="block"
}

/* PRODUTOS */
function salvarProduto(){
  let nome = document.getElementById("nome").value
  let preco = parseFloat(document.getElementById("preco").value)
  let estoque = parseInt(document.getElementById("estoque").value)
  let produto = {nome:nome, preco:preco, estoque:estoque}
  produtos.push(produto)
  localStorage.setItem("produtos",JSON.stringify(produtos))
  mostrarProdutos()
}

function mostrarProdutos(){
  let area = document.getElementById("listaProdutos")
  area.innerHTML=""
  produtos.forEach((p,i)=>{
    area.innerHTML+=`
    <div class="card">
      <b>${p.nome}</b><br>
      Preço: R$ ${p.preco}<br>
      Estoque: ${p.estoque}<br><br>
      <button onclick="venderProduto(${i})">Venda rápida</button>
      <button onclick="excluirProduto(${i})">Excluir</button>
    </div>
    `
  })
}

function venderProduto(i){
  if(produtos[i].estoque > 0){
    produtos[i].estoque--
    localStorage.setItem("produtos",JSON.stringify(produtos))
    mostrarProdutos()
    alert("Venda rápida registrada")
  } else {
    alert("Produto sem estoque")
  }
}

function excluirProduto(i){
  produtos.splice(i,1)
  localStorage.setItem("produtos",JSON.stringify(produtos))
  mostrarProdutos()
}

/* CLIENTES */
function gerarCodigoCliente(){
  return Math.floor(1000 + Math.random() * 9000)
}

function salvarCliente(){
  let nome = document.getElementById("nomeCliente").value
  let cpf = document.getElementById("cpfCliente").value
  let telefone = document.getElementById("telefoneCliente").value
  let aniversario = document.getElementById("aniversarioCliente").value

  let cliente = {
    nome:nome,
    cpf:cpf,
    telefone:telefone,
    aniversario:aniversario,
    codigo: gerarCodigoCliente(),
    totalCompras:0,
    totalPago:0,
    saldo:0
  }
  clientes.push(cliente)
  localStorage.setItem("clientes",JSON.stringify(clientes))
  mostrarClientes()
}

function mostrarClientes(){
  let area = document.getElementById("listaClientes")
  area.innerHTML=""
  clientes.forEach((c,i)=>{
    area.innerHTML+=`
    <div class="card">
      <b>${c.nome}</b><br>
      CPF: ${c.cpf}<br>
      Telefone: ${c.telefone}<br>
      Aniversário: ${c.aniversario}<br>
      Código: ${c.codigo}<br><br>
      Total Comprado: R$ ${c.totalCompras}<br>
      Total Pago: R$ ${c.totalPago}<br>
      Saldo Devedor: R$ ${c.saldo}<br><br>
      <button onclick="registrarCompra(${i})">Nova Compra</button>
      <button onclick="registrarPagamento(${i})">Registrar Pagamento</button>
      <button onclick="excluirCliente(${i})">Excluir Cliente</button>
      <button onclick="zerarSistema(${c.codigo})">Zerar Sistema</button>
    </div>
    `
  })
}

/* COMPRA E PAGAMENTO DO CLIENTE */
function registrarCompra(i){
  let valor = parseFloat(prompt("Valor da compra"))
  if(isNaN(valor)) return
  clientes[i].totalCompras += valor
  clientes[i].saldo = clientes[i].totalCompras - clientes[i].totalPago
  localStorage.setItem("clientes",JSON.stringify(clientes))
  mostrarClientes()
}

function registrarPagamento(i){
  let valor = parseFloat(prompt("Valor pago pelo cliente"))
  if(isNaN(valor)) return
  clientes[i].totalPago += valor
  clientes[i].saldo = clientes[i].totalCompras - clientes[i].totalPago
  localStorage.setItem("clientes",JSON.stringify(clientes))
  mostrarClientes()
}

/* EXCLUIR CLIENTE */
function excluirCliente(i){
  if(confirm(`Deseja realmente excluir o cliente ${clientes[i].nome}?`)){
    clientes.splice(i,1)
    localStorage.setItem("clientes",JSON.stringify(clientes))
    mostrarClientes()
  }
}

/* ZERAR SISTEMA PARA CLIENTE */
function zerarSistema(codigoCliente){
  let cliente = clientes.find(c => c.codigo == codigoCliente)
  if(cliente){
    clientes = [cliente]
    produtos = []
    vendas = []
    localStorage.setItem("clientes", JSON.stringify(clientes))
    localStorage.setItem("produtos", JSON.stringify(produtos))
    localStorage.setItem("vendas", JSON.stringify(vendas))
    mostrarClientes()
    mostrarProdutos()
    mostrarVendas()
    alert("Sistema reiniciado para o cliente " + cliente.nome)
  } else {
    alert("Código de cliente inválido")
  }
}

/* VENDAS */
function registrarVenda(){
  let cliente = document.getElementById("clienteVenda").value
  let produto = document.getElementById("produtoVenda").value
  let pagamento = document.getElementById("pagamento").value
  let data = new Date().toLocaleDateString()

  let venda = {cliente:cliente, produto:produto, pagamento:pagamento, data:data}
  vendas.push(venda)
  localStorage.setItem("vendas",JSON.stringify(vendas))
  mostrarVendas()
  alert("Venda registrada")
}

function mostrarVendas(){
  let area = document.getElementById("listaVendas")
  area.innerHTML=""
  vendas.forEach(v=>{
    area.innerHTML+=`
    <div class="card">
      <b>Cliente:</b> ${v.cliente}<br>
      <b>Produto:</b> ${v.produto}<br>
      <b>Pagamento:</b> ${v.pagamento}<br>
      <b>Data:</b> ${v.data}
    </div>
    `
  })
}

/* ANIVERSÁRIOS */
function verificarAniversarios(){
  let hoje = new Date().toISOString().slice(5,10)
  clientes.forEach(c=>{
    if(c.aniversario && c.aniversario.slice(5,10) == hoje){
      alert("Hoje é aniversário de "+c.nome+" 🎉")
    }
  })
}