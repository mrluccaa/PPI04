import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const app = express(); 

let listaProdutos = [];


app.get("/", (req, res) => {
    
    res.redirect("/login");
});

app.use(session({
    secret: "MinhaChaveUltraSecreta",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 15 }
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// verificar login
function verificarLogin(req, res, next) {
    if (req.session?.usuario?.logado) {
        next();
    } else {
        res.send(`
            <h2>Você precisa realizar o login para acessar esta página.</h2>
            <a href="/login">Ir para Login</a>
        `);
    }
}

// LOGIN GET
app.get("/login", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container w-25 mt-4">
                <h3>Login do Sistema</h3>
                <form action="/login" method="POST" class="form">
                    <label class="form-label">Usuário:</label>
                    <input type="text" name="usuario" class="form-control">

                    <label class="form-label mt-2">Senha:</label>
                    <input type="password" name="senha" class="form-control">

                    <button class="btn btn-primary mt-3" type="submit">Entrar</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// LOGIN POST
app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === "admin" && senha === "admin") {
        req.session.usuario = {
            nome: "Administrador",
            logado: true
        };

        res.redirect("/cadastroProduto");

    } else {
        res.send(`
            <h3>Usuário ou senha inválidos!</h3>
            <a href="/login">Tentar novamente</a>
        `);
    }
});

// LOGOUT
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// CADASTRO
app.get("/cadastroProduto", verificarLogin, (req, res) => {

    let ultimoAcesso = req.cookies?.ultimoAcesso || "Primeiro acesso";
    const data = new Date();
    res.cookie("ultimoAcesso", data.toLocaleString());

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" 
            rel="stylesheet">
        </head>
        <body>
            <div class="container mt-4">
                <h2 class="mb-3">Cadastro de Produtos</h2>
                <p><strong>Último acesso:</strong> ${ultimoAcesso}</p>

                <form action="/adicionarProduto" method="POST" class="row g-3 p-3 bg-light border">
                    <div class="col-md-4">
                        <label class="form-label">Código de Barras</label>
                        <input type="text" class="form-control" name="codigo">
                    </div>

                    <div class="col-md-8">
                        <label class="form-label">Descrição</label>
                        <input type="text" class="form-control" name="descricao">
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">Preço de Custo</label>
                        <input type="number" step="0.01" class="form-control" name="precoCusto">
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">Preço de Venda</label>
                        <input type="number" step="0.01" class="form-control" name="precoVenda">
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">Data de Validade</label>
                        <input type="date" class="form-control" name="validade">
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">Estoque</label>
                        <input type="number" class="form-control" name="estoque">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Nome do Fabricante</label>
                        <input type="text" class="form-control" name="fabricante">
                    </div>

                    <div class="col-12 mt-3">
                        <button class="btn btn-success" type="submit">Cadastrar Produto</button>
                        <a class="btn btn-secondary" href="/logout">Sair</a>
                    </div>
                </form>

                <hr>

                <h3>Produtos Cadastrados</h3>
                ${montarTabelaProdutos()}
            </div>
        </body>
        </html>
    `);
});

// ADD PRODUTO
app.post("/adicionarProduto", verificarLogin, (req, res) => {

    const { codigo, descricao, precoCusto, precoVenda, validade, estoque, fabricante } = req.body;

    listaProdutos.push({
        codigo,
        descricao,
        precoCusto,
        precoVenda,
        validade,
        estoque,
        fabricante
    });

    res.redirect("/cadastroProduto");
});

// TABELA
function montarTabelaProdutos() {
    if (listaProdutos.length === 0) {
        return "<p>Nenhum produto cadastrado ainda.</p>";
    }

    let tabela = `
        <table class="table table-striped table-bordered">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Custo</th>
                    <th>Venda</th>
                    <th>Validade</th>
                    <th>Estoque</th>
                    <th>Fabricante</th>
                </tr>
            </thead>
            <tbody>
    `;

    listaProdutos.forEach(p => {
        tabela += `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.descricao}</td>
                <td>${p.precoCusto}</td>
                <td>${p.precoVenda}</td>
                <td>${p.validade}</td>
                <td>${p.estoque}</td>
                <td>${p.fabricante}</td>
            </tr>
        `;
    });

    tabela += `
            </tbody>
        </table>
    `;

    return tabela;
}

export default app;

if (!process.env.VERCEL) {
    const host = "0.0.0.0";
    const porta = 3000;
    app.listen(porta, host, () => {
        console.log(`Servidor rodando em http://${host}:${porta}`);
    });
}
