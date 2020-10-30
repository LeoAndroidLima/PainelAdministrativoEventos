const firebaseConfig = {
    apiKey: "AIzaSyD7kp8wKyIyK2JokdNH2EOuCHUb5CfzzVw",
    authDomain: "maetonarave-caaca.firebaseapp.com",
    databaseURL: "https://maetonarave-caaca.firebaseio.com",
    projectId: "maetonarave-caaca",
    storageBucket: "maetonarave-caaca.appspot.com",
    messagingSenderId: "325923996686",
    appId: "1:325923996686:web:27af7b32963995e915685f",
    measurementId: "G-ECX8R3VGCC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let imagemSelecionada;
let ravepopularSelecionadaAlterar;
let ravepopularSelecionadaRemover;

let tabela = document.getElementById("tabelaRavePopular").getElementsByTagName("tbody")[0]

let bd = firebase.firestore().collection("ravepopular");
let storage = firebase.storage().ref().child("ravepopular");

let keyLista = []



//--------------------------------------- OUVINTE -----------------------------------------------------
bd.onSnapshot(function (documentos) {

    documentos.docChanges().forEach(function (changes){

        if (changes.type === "added") {

            const doc = changes.doc
            const dados = doc.data()
            keyLista.push(dados.id)
            criarItensTabela(dados)


        } else if (changes.type === "modified") {

            const doc = changes.doc
            const dados = doc.data()
            alterarItensTabela(dados)


        } else if (changes.type === "removed") {

            const doc = changes.doc
            const dados = doc.data()
            removerItensTabela(dados)

        }
    })
})




//--------------------------------------- Tabela -----------------------------------------------------
//------------ adcionando itens tabela
function criarItensTabela(dados){

    const linha = tabela.insertRow()
    const colunaId = linha.insertCell(0)
    const colunaNome = linha.insertCell(1)
    const colunaData = linha.insertCell(2)
    const colunaAcoes = linha.insertCell(3)

    const itemId = document.createTextNode(dados.id)
    const itemNome = document.createTextNode(dados.nome)
    const itemData = document.createTextNode(dados.data)

    colunaId.appendChild(itemId)
    colunaNome.appendChild(itemNome)
    colunaData.appendChild(itemData)

    criarBotoesTabela(colunaAcoes, dados)

    //ordemCrescente()
}

//------------ alterando itens tabela
function alterarItensTabela(dados){

    const index = keyLista.indexOf(dados.id)
    const row = tabela.rows[index]

    const cellId = row.cells[0]
    const cellNome = row.cells[1]
    const cellData = row.cells[2]
    const acoes = row.cells[3]

    acoes.remove()

    const colunaAcoes = row.insertCell(3)

    cellId.innerText = dados.id
    cellNome.innerText = dados.nome
    cellData.innerText = dados.data

    criarBotoesTabela(colunaAcoes, dados)

}

//------------ removendo itens tabela
function removerItensTabela(dados){

    const index = keyLista.indexOf(dados.id)

    tabela.rows[index].remove()
    keyLista.splice(index, 1)

}

//------------ criar botoes tabela
function criarBotoesTabela(colunaAcoes, dados){

    const buttonAlterar = document.createElement("button")
    buttonAlterar.innerHTML = ` <i class="fas fa-edit"></i> `
    buttonAlterar.className = "btn btn-success btn-xs"

    const buttonRemover = document.createElement("button")
    buttonRemover.innerHTML = ` <i class="fas fa-trash-alt"></i> `
    buttonRemover.className = "btn btn-danger btn-xs"

    buttonAlterar.onclick = function() {

        abrirModalAlterar(dados)
        return false

    }

    buttonRemover.onclick = function() {

        abrirModalRemover(dados)
        return false

    }

    colunaAcoes.appendChild(buttonAlterar)
    colunaAcoes.appendChild(document.createTextNode(" "))
    colunaAcoes.appendChild(buttonRemover)

}


//--------------------------------------- Tratamento com Imagens -----------------------------------------------------
//--------- Modal Adicionar - click em imagem
function clickAdicionarImagem() {

    $("#imagemUploadAdicionar").click()

}


$("#imagemUploadAdicionar").on("change", function (event) {

    const imagem = document.getElementById("imagemAdicionar")
    compactarImagem(event, imagem)

})


//--------- Modal Alterar - click em imagem
function clickAlterarImagem() {

    $("#imagemUploadAlterar").click()

}


$("#imagemUploadAlterar").on("change", function (event) {

    const imagem = document.getElementById("imagemAlterar") /* Pegando elemento da modal */
    compactarImagem(event, imagem)

})




//--------- funções para tratar imagem
function compactarImagem(event, imagem) {

    const compress = new Compress()
    const files = [...event.target.files]

    compress.compress(files, {
        size: 4, // the max size in MB, defaults to 2MB
        quality: 0.75, // the quality of the image, max is 1,
        maxWidth: 1920, // the max width of the output image, defaults to 1920px
        maxHeight: 1920, // the max height of the output image, defaults to 1920px
        resize: true // defaults to true, set false if you do not want to resize the image width and height
    }).then((data) => {

        if (data[0] != null) {

            const image = data[0]
            const file = Compress.convertBase64ToFile(image.data, image.ext)
            imagemSelecionada = file

            inserirImagem(imagem, file)

        }
    })
}

function inserirImagem(imagem, file) {

    imagem.file = file

    if (imagemSelecionada != null) {

        const reader = new FileReader()
        reader.onload = (function (img) {

            return function (e) {

                img.src = e.target.result

            }
        })(imagem)

        reader.readAsDataURL(file) /* Leitura dos arquvios */

    }
}


//-------------------------------------------- Modal Adicionar -----------------------------------------------------
//--------- Abrir modal
function abrirModalAdicionar(){

    $("#modalAdicionar").modal()

}

//--------- Limpar campos - usando pelo botao cancelar e pelo botao salvar
function limparCamposAdicionar() {

    document.getElementById("adicionarID").value = ""
    document.getElementById("adicionarNome").value = ""
    document.getElementById("adicionarLocalizacao").value = ""
    document.getElementById("adicionarData").value = ""
    document.getElementById("adicionarDetalhes").value = ""
    document.getElementById("adicionarLine").value = ""
    document.getElementById("imagemAdicionar").src = "#"
    document.getElementById("adicionarLinkEvento").value = ""
    document.getElementById("adicionarLinkIngresso").value = ""
    document.getElementById("adicionarLinkInstagram").value = ""

    $("#imagemUploadAdicionar").val("")

    imagemSelecionada = null

}

//--------- botao de salvar da modal
function buttonAdicionarValidarCampos(){

    const id = document.getElementById("adicionarID").value
    const nome = document.getElementById("adicionarNome").value
    const localizacao = document.getElementById("adicionarLocalizacao").value
    const data = document.getElementById("adicionarData").value

    const detalhes = document.getElementById("adicionarDetalhes").value
    const line = document.getElementById("adicionarLine").value
    const linkevento = document.getElementById("adicionarLinkEvento").value
    const linkingresso = document.getElementById("adicionarLinkIngresso").value
    const linkinstagram = document.getElementById("adicionarLinkInstagram").value

    if(keyLista.indexOf(id) > -1){

        abrirModalAlerta("ID já está cadastrado no sistema")

    }else if(id.trim() == "" || nome.trim() == "" || localizacao.trim() == "" || data.trim() == "" || detalhes.trim() == "" || line.trim() == "" 
    || linkevento.trim() == "" || linkingresso.trim() == "" || linkinstagram.trim() == "" ){

        abrirModalAlerta("Preencha Todos os campos")

    }else if(imagemSelecionada == null){

        abrirModalAlerta("Insira uma imagem")

    }else {

        abrirModalProgress()
        salvarImagemFirebase(id, nome, localizacao, data, detalhes, line, linkevento, linkingresso, linkinstagram)

    }

    //--------- salvar imagem Firebase
    function salvarImagemFirebase(id, nome, localizacao, data, detalhes, line, linkevento, linkingresso, linkinstagram){

        const nomeImagem = id
        const upload = storage.child(nomeImagem).put(imagemSelecionada)
        upload.on("state_changed", function(snapshot){

        }, function(error){

            abrirModalAlerta("Erro ao salvar Imagem" + error)
            removerModalProgress()

        }, function(){

            upload.snapshot.ref.getDownloadURL().then(function (url_imagem){

                salvarDadosFirebase(id, nome, localizacao, data, detalhes, line, linkevento, linkingresso, linkinstagram, url_imagem)

            })
        })
    }


    //--------- salvar dados Firebase
    function salvarDadosFirebase(id, nome, localizacao, data, detalhes, line, linkevento, linkingresso, linkinstagram, url_imagem){

        const dados = {

            id: id,
            nome: nome,
            localizacao: localizacao,
            data: data,
            detalhes: detalhes,
            line: line,
            linkevento: linkevento,
            linkingresso: linkingresso,
            linkinstagram: linkinstagram,
            url_imagem: url_imagem

        }

        bd.doc(id).set(dados).then(function() {

            removerModalProgress()
            limparCamposAdicionar()
            abrirModalAlerta("Sucesso ao Salvar Dados")

        }).catch(function (error) {

            removerModalProgress()
            abrirModalAlerta("Erro ao Salvar Dados: " + error)

        })
    }
}


//-------------------------------------------- Modal Alterar -----------------------------------------------------
//--------- Limpar campos - usando pelo botao cancelar e pelo botao salvar
function limparCamposAlterar(){

    $("#imagemUploadAlterar").val("")
    imagemSelecionada = null

}

//--------- Abrir modal
function abrirModalAlterar(dados){

    $("#modalAlterar").modal()

    const id = document.getElementById("alterarID")
    const nome = document.getElementById("alterarNome")
    const localizacao = document.getElementById("alterarLocalizacao")
    const data = document.getElementById("alterarData")
    const detalhes = document.getElementById("alterarDetalhes")
    const line = document.getElementById("alterarLine")
    const imagem = document.getElementById("imagemAlterar")
    const linkevento = document.getElementById("alterarLinkEvento")
    const linkingresso = document.getElementById("alterarLinkIngresso")
    const linkinstagram = document.getElementById("alterarLinkInstagram")

    id.innerText = dados.id
    nome.value = dados.nome
    localizacao.value = dados.localizacao
    data.value = dados.data
    detalhes.value = dados.detalhes
    line.value = dados.line
    imagem.src = dados.url_imagem
    linkevento.value = dados.linkevento
    linkingresso.value = dados.linkingresso
    linkinstagram.value = dados.linkinstagram

    ravepopularSelecionadaAlterar = dados
}

function buttonAlterarValidarCampos(){

    const id = document.getElementById("alterarID").innerHTML
    const nome = document.getElementById("alterarNome").value
    const localizacao = document.getElementById("alterarLocalizacao").value
    const data = document.getElementById("alterarData").value
    const detalhes = document.getElementById("alterarDetalhes").value
    const line = document.getElementById("alterarLine").value
    const linkevento = document.getElementById("alterarLinkEvento").value
    const linkingresso = document.getElementById("alterarLinkIngresso").value
    const linkinstagram = document.getElementById("alterarLinkInstagram").value

    if(ravepopularSelecionadaAlterar.nome.trim() == nome.trim() &&
    ravepopularSelecionadaAlterar.localizacao.trim() == localizacao.trim() &&
    ravepopularSelecionadaAlterar.data.trim() == data.trim() && 
    ravepopularSelecionadaAlterar.detalhes.trim() == detalhes.trim() && 
    ravepopularSelecionadaAlterar.line.trim() == line.trim() &&
    ravepopularSelecionadaAlterar.linkevento.trim() == linkevento.trim() &&
    ravepopularSelecionadaAlterar.linkingresso.trim() == linkingresso.trim() &&
    ravepopularSelecionadaAlterar.linkingresso.trim() == linkinstagram.trim() &&
    imagemSelecionada == null){

        abrirModalAlerta("Nenhum informação foi alterada")

    }else if (id.trim() == "" || nome.trim() == "" || localizacao.trim() == "" || data.trim() == "" || detalhes.trim() == ""
    || line.trim() == "" || linkingresso.trim() == "" || linkinstagram.trim() == ""){

        abrirModalAlerta("Preencha todos os campos")

    }else if(imagemSelecionada != null){// vamos executar se o usuario alterar a imagem (nome)

        abrirModalProgress()
        alterarImagemFirebase(id, nome, localizacao, data, detalhes, line, linkevento, linkingresso, linkinstagram)

    }else {

        abrirModalProgress()
        alterarDadosFirebase(id, nome, localizacao, data, detalhes, line, linkevento, linkingresso, linkinstagram, ravepopularSelecionadaAlterar.url_imagem)

    }
}

//--------- alterar imagem Firebase
function alterarImagemFirebase(id, nome, localizacao, data, detalhes, line, linkevento, linkingresso, linkinstagram){

    const nomeImagem = id
    const upload = storage.child(nomeImagem).put(imagemSelecionada)
    upload.on("state_changed", function(snapshot){

    }, function(error) {

        abrirModalAlerta("Error ao alterar Imagem")
        removerModalProgress()

    }, function() {

        upload.snapshot.ref.getDownloadURL().then(function (url_imagem) {

            alterarDadosFirebase(id, nome, localizacao, data, detalhes, line, linkevento, linkingresso, linkinstagram, url_imagem)

        })
    })
}

//--------- alterar dados Firebase
function alterarDadosFirebase(id, nome, localizacao, data, detalhes, line, linkevento, linkingresso, linkinstagram, url_imagem){

    const dados = {

        id: id,
        nome: nome,
        localizacao: localizacao,
        data: data,
        detalhes: detalhes,
        line: line,
        linkevento: linkevento,
        linkingresso: linkingresso,
        linkinstagram: linkinstagram,
        url_imagem: url_imagem
    }

    bd.doc(id).update(dados).then(function() {

        $("#modalAlterar").modal("hide")
        removerModalProgress()
        limparCamposAlterar()
        abrirModalAlerta("Sucesso ao Alterar Dados")

    }).catch(function (error) {

        removerModalProgress()
        abrirModalAlerta("Erro ao Alterar Dados: " + error)

    })
}

//-------------------------------------------- Modal Remover -----------------------------------------------------
//--------- Abrir modal
function abrirModalRemover(dados) {

    $("#modalRemover").modal()
    ravepopularSelecionadaRemover = dados

}

//--------- Click em botao de SIM na modal de remover
function removerRavePopular(){

    abrirModalProgress()
    removerImagemFirebase()

}


//--------- Remover Imagem Firebase
function removerImagemFirebase() {

    const nomeImagem = ravepopularSelecionadaRemover.id
    const imagem = storage.child(nomeImagem)

    imagem.delete().then(function () {

        removerDadosFirebase()

    }).catch(function (error) {

        removerModalProgress()
        abrirModalAlerta("Erro ao Remover Imagem: " + error)

    })
}

//--------- Remover Dados Firebase
function removerDadosFirebase() {

    const id = ravepopularSelecionadaRemover.id

    bd.doc(id).delete().then(function() {

        $("#modalRemover").modal("hide")
        removerModalProgress()
        abrirModalAlerta("Sucesso ao Remover Dados")

    }).catch(function (error) {

        removerModalProgress()
        abrirModalAlerta("Erro ao Remover Dados: " + error)

    })
}


//-------------------------------------------- Modal De ProgressBar -----------------------------------------------------
function abrirModalProgress(){

    $("#modalProgress").modal()

}

function removerModalProgress() {

    $("#modalProgress").modal("hide")
    //Caso a progress nao feche
    window.setTimeout(function() {

        document.getElementById("modalProgress").click()

    }, 500)
}


//-------------------------------------------- Modal De alerta -----------------------------------------------------
function abrirModalAlerta (mensagem){

    $("#modalAlerta").modal()
    document.getElementById("alertaMensagem").innerText = mensagem

}
