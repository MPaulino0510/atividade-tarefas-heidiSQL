import express from 'express';
import dotenv from 'dotenv';
import conectarBanco from './db.js';

dotenv.config();
const app = express()
app.use(express.json());
const conexao = conectarBanco();

app.get('/', async (req, res)=>{
    try{
    const sql = "SELECT * FROM tarefas";
    const resposta = await conexao.query(sql);
    res.json(resposta);
    }
    catch(erro){
        console.error("Erro no GET /:", erro);
        res.status(500).json({
            mensagem: "Erro ao buscar tarefas",
            erro: erro.message
        })
    }
});

app.get('/tarefas/periodo', async (req, res)=>{
    try {
        const {inicio, fim} = req.query;

        if(!inicio || !fim){
            return res.status(400).json({
                mensagem: "Adicione inicio e fim."
            })
        }
        const sql = "SELECT * FROM tarefas WHERE data_tarefa BETWEEN ? AND ?";
        const resposta = await conexao.query(sql, [inicio, fim]);

        res.json(resposta);
    } catch (error) {
        console.error("Erro no GET /tarefas/periodo:", error);
        res.status(500).json({
            mensagem: "Erro ao buscar tarefas pelo período.",
            erro: error.message
        })
    }
})

app.get('/tarefas/:id', async (req, res)=>{
    try {
        const id = Number(req.params.id);
        const sql = "SELECT * FROM tarefas WHERE id = ?";
        const [tarefa] = await conexao.query(sql, [id]);

        if(!tarefa){
            return res.status(404).json({
                mensagem: "Tarefa não encontrada"
            });
        }

        res.json(tarefa);
    } catch (error) {
        console.error("Erro no GET /tarefas/:id:", error);
        res.status(500).json({
            mensagem: "Erro ao buscar tarefa",
            erro: error.message
        })
    }
})

app.post("/tarefas", async (req, res)=>{
    try{
    const {nome, descricao, responsavel, data_tarefa, concluido} = req.body;
    const statusConcluido = concluido ? 1 : 0;
    const sql = "INSERT INTO tarefas (nome, descricao, responsavel, data_tarefa, concluido) VALUES (?, ?, ?, ?, ?)";
    const resposta = await conexao.query(sql, [
        nome,
        descricao,
        responsavel,
        data_tarefa,
        statusConcluido
    ]);
    res.status(201).json({
        id: Number(resposta.insertId),
        mensagem: "Tarefa cadastrada com sucesso!"
    });
}   catch(error){
    console.error("Erro no POST /tarefas:", error);
    res.status(500).json({
        mensagem: "Erro ao cadastrar tarefa",
        erro: error.message
    })
}
})

app.put('/tarefas/:id', async (req,res)=>{
    try {
        const id = Number(req.params.id);
        const {nome, descricao, responsavel, data_tarefa, concluido} = req.body;
        const sql = "UPDATE tarefas SET nome = ?, descricao = ?, responsavel = ?, data_tarefa = ?, concluido = ? WHERE id = ?";

        const resposta = await conexao.query(sql, [nome, descricao, responsavel, data_tarefa, concluido, id]);
        if (resposta.affectedRows === 0){
            return res.status(404).json({
                mensagem: "Tarefa não encontrada."
            });
        }
        res.json({
            mensagem: "Tarefa atualizada com sucesso!"
        })
    } catch (error) {
        console.error("Erro no PUT /tarefas/:id:", error);
        res.status(500).json({
            mensagem: "Erro ao atualizar tarefa",
            erro: error.message
        });
    }
});

app.delete('/tarefas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "DELETE FROM tarefas WHERE id = ?";
        const resposta = await conexao.query(sql, [id]);

        if (resposta.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Tarefa não encontrada para remoção" });
        }

        res.json({ mensagem: "Tarefa excluída com sucesso!" });
    } catch (erro) {
        console.error("Erro no DELETE /tarefas/:id:", erro);
        res.status(500).json({ mensagem: "Erro ao excluir tarefa", erro: erro.message });
    }
});

const PORTA = process.env.PORTA
app.listen(PORTA, () =>{
    console.log(`Servidor rodando em http://localhost:${PORTA}`)
});